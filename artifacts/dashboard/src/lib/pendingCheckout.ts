const KEY = "pendingCheckoutPriceId";

export function setPendingCheckout(priceId: string) {
  try {
    sessionStorage.setItem(KEY, priceId);
  } catch {
    // sessionStorage unavailable (e.g. private browsing) -- checkout resume is best-effort
  }
}

export function takePendingCheckout(): string | null {
  try {
    const value = sessionStorage.getItem(KEY);
    if (value) sessionStorage.removeItem(KEY);
    return value;
  } catch {
    return null;
  }
}
