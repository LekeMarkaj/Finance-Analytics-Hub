import { Router } from "express";
import { getAuth, createClerkClient } from "@clerk/express";

const router = Router();

function getClerkClient() {
  return createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
}

async function requireAdmin(req: any, res: any, next: any): Promise<void> {
  const auth = getAuth(req);
  const userId = auth?.sessionClaims?.userId || auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const clerk = getClerkClient();
  const user = await clerk.users.getUser(userId);
  if (user.publicMetadata?.role !== "admin") {
    res.status(403).json({ error: "Forbidden: admin access required" });
    return;
  }
  req.adminUserId = userId;
  next();
}

router.get("/admin/users", requireAdmin, async (_req, res): Promise<void> => {
  const clerk = getClerkClient();
  const response = await clerk.users.getUserList({ limit: 500, orderBy: "-created_at" });
  const users = response.data.map((u) => ({
    id: u.id,
    displayName: u.fullName || u.firstName || u.emailAddresses[0]?.emailAddress || u.id,
    email: u.emailAddresses[0]?.emailAddress || "",
    signupDate: new Date(u.createdAt).toISOString(),
    banned: u.banned,
    role: (u.publicMetadata?.role as string) || "user",
  }));
  res.json({ users, total: response.totalCount });
});

router.post("/admin/users/:userId/disable", requireAdmin, async (req: any, res): Promise<void> => {
  const { userId } = req.params;
  if (userId === req.adminUserId) {
    res.status(400).json({ error: "Cannot disable your own account" });
    return;
  }
  const clerk = getClerkClient();
  await clerk.users.banUser(userId);
  res.json({ ok: true });
});

router.post("/admin/users/:userId/enable", requireAdmin, async (req, res): Promise<void> => {
  const { userId } = req.params;
  const clerk = getClerkClient();
  await clerk.users.unbanUser(userId);
  res.json({ ok: true });
});

export default router;
