declare global {
  interface Window {
    Paddle?: {
      Initialize: (opts: {
        token: string;
        pwCustomer?: { id: string };
        eventCallback?: (data: any) => void;
      }) => void;
      Update: (opts: { pwCustomer?: { id: string } }) => void;
      Checkout: {
        open: (opts: { transactionId: string } | { items: { priceId: string; quantity: number }[]; customer?: { id: string } }) => void;
        close: () => void;
      };
      Environment: {
        set: (env: "sandbox" | "production") => void;
      };
    };
  }
}

let initialized = false;
let checkoutCompleteCallback: (() => void) | null = null;
// Paddle customer id (ctm_...) of the signed-in user, used for Paddle Retain.
let pwCustomerId: string | null = null;

export function initPaddle(): void {
  if (initialized || !window.Paddle) return;
  const token = import.meta.env.VITE_PADDLE_CLIENT_TOKEN as string | undefined;
  if (!token) {
    console.warn("VITE_PADDLE_CLIENT_TOKEN is not set — Paddle.js overlay disabled");
    return;
  }
  const paddleEnv = import.meta.env.VITE_PADDLE_ENVIRONMENT ?? "sandbox";
  if (paddleEnv === "sandbox") {
    window.Paddle.Environment.set("sandbox");
  }
  window.Paddle.Initialize({
    token,
    // Must be the Paddle customer id (ctm_...), not an internal id or email.
    ...(pwCustomerId ? { pwCustomer: { id: pwCustomerId } } : {}),
    eventCallback: (data: any) => {
      console.warn("[Paddle] event:", data.name, JSON.stringify(data));
      if (data.name === "checkout.completed" && checkoutCompleteCallback) {
        checkoutCompleteCallback();
        checkoutCompleteCallback = null;
      }
    },
  });
  initialized = true;
}

/**
 * Registers the signed-in user's Paddle customer id (ctm_...) so Paddle
 * Retain can identify them. Safe to call any time; applies immediately if
 * Paddle.js is already initialized, otherwise on the next initPaddle().
 */
export function setPaddleCustomer(customerId: string | null): void {
  if (!customerId || !customerId.startsWith("ctm_")) return;
  if (customerId === pwCustomerId) return;
  pwCustomerId = customerId;
  if (initialized && window.Paddle) {
    window.Paddle.Update({ pwCustomer: { id: customerId } });
  }
}

export function openPaddleCheckout(
  priceId: string,
  customerId?: string,
  onComplete?: () => void,
): void {
  initPaddle();

  if (!window.Paddle) {
    console.error("Paddle.js not loaded");
    return;
  }
  checkoutCompleteCallback = onComplete ?? null;
  window.Paddle.Checkout.open({
    items: [{ priceId, quantity: 1 }],
    ...(customerId ? { customer: { id: customerId } } : {}),
  });
}

export function isPaddleReady(): boolean {
  return !!window.Paddle && !!import.meta.env.VITE_PADDLE_CLIENT_TOKEN;
}
