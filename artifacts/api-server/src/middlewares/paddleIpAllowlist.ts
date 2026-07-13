import type { Request, Response, NextFunction } from "express";
import { getPaddleApiBase } from "../paddleClient";
import { logger } from "../lib/logger";

const CACHE_TTL_MS = 60 * 60 * 1000; // refresh hourly; Paddle's list can change

let cachedCidrs: string[] | null = null;
let cacheFetchedAt = 0;
let inflight: Promise<string[] | null> | null = null;

function ipv4ToInt(ip: string): number | null {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  let value = 0;
  for (const part of parts) {
    const n = Number(part);
    if (!Number.isInteger(n) || n < 0 || n > 255 || part !== String(n)) return null;
    value = value * 256 + n;
  }
  return value >>> 0;
}

function ipInCidr(ip: string, cidr: string): boolean {
  const [base, prefixStr] = cidr.split("/");
  const prefix = prefixStr === undefined ? 32 : Number(prefixStr);
  if (!Number.isInteger(prefix) || prefix < 0 || prefix > 32) return false;
  const ipInt = ipv4ToInt(ip);
  const baseInt = ipv4ToInt(base);
  if (ipInt === null || baseInt === null) return false;
  if (prefix === 0) return true;
  const mask = (~0 << (32 - prefix)) >>> 0;
  return (ipInt & mask) === (baseInt & mask);
}

async function fetchPaddleCidrs(): Promise<string[] | null> {
  try {
    const resp = await fetch(`${getPaddleApiBase()}/ips`);
    if (!resp.ok) {
      logger.warn({ status: resp.status }, "Failed to fetch Paddle IP allowlist");
      return null;
    }
    const json = (await resp.json()) as any;
    const cidrs = json?.data?.ipv4_cidrs;
    if (!Array.isArray(cidrs) || cidrs.length === 0) {
      logger.warn("Paddle IP allowlist response had no ipv4_cidrs");
      return null;
    }
    return cidrs.filter((c: unknown): c is string => typeof c === "string");
  } catch (err) {
    logger.warn({ err }, "Error fetching Paddle IP allowlist");
    return null;
  }
}

async function getAllowedCidrs(): Promise<string[] | null> {
  const now = Date.now();
  if (cachedCidrs && now - cacheFetchedAt < CACHE_TTL_MS) return cachedCidrs;
  if (!inflight) {
    inflight = fetchPaddleCidrs().finally(() => {
      inflight = null;
    });
  }
  const fresh = await inflight;
  if (fresh) {
    cachedCidrs = fresh;
    cacheFetchedAt = now;
  }
  // If the refresh failed, fall back to the last known list (if any).
  return cachedCidrs;
}

function candidateIps(req: Request): string[] {
  const ips = new Set<string>();
  const remote = req.socket.remoteAddress;
  if (remote) ips.add(normalizeIp(remote));
  const xff = req.headers["x-forwarded-for"];
  const chain = Array.isArray(xff) ? xff.join(",") : xff;
  if (chain) {
    for (const entry of chain.split(",")) {
      const trimmed = entry.trim();
      if (trimmed) ips.add(normalizeIp(trimmed));
    }
  }
  return Array.from(ips);
}

function normalizeIp(ip: string): string {
  // Strip IPv4-mapped IPv6 prefix (::ffff:1.2.3.4)
  return ip.startsWith("::ffff:") ? ip.slice(7) : ip;
}

/**
 * Rejects webhook requests that do not originate from Paddle's published
 * webhook IPs (https://api.paddle.com/ips — live and sandbox lists differ,
 * so the URL follows the active PADDLE_ENVIRONMENT).
 *
 * If the allowlist has never been fetched successfully, requests are allowed
 * through with a warning — signature verification remains the hard gate.
 */
export async function paddleIpAllowlist(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const cidrs = await getAllowedCidrs();
    if (!cidrs) {
      logger.warn(
        "Paddle IP allowlist unavailable; relying on signature verification only",
      );
      next();
      return;
    }
    const ips = candidateIps(req);
    const allowed = ips.some((ip) => cidrs.some((cidr) => ipInCidr(ip, cidr)));
    if (!allowed) {
      logger.warn({ ips }, "Rejected webhook from non-Paddle IP");
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    next();
  } catch (err) {
    logger.error({ err }, "Paddle IP allowlist check failed");
    next();
  }
}
