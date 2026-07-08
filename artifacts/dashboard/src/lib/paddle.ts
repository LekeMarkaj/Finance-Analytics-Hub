declare global {
  interface Window {
    Paddle?: {
      Initialize: (opts: { token: string; eventCallback?: (data: any) => void }) => void;
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
