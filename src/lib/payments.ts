/**
 * Razorpay-ready payment service.
 *
 * This module is a structured stub. When the café owner is ready to enable
 * live payments:
 *   1. Add RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET as project secrets.
 *   2. Create a server function that calls Razorpay's Orders API and
 *      returns the razorpay order_id.
 *   3. Load the checkout.js script and invoke `new Razorpay(...).open()` here.
 *   4. Verify the payment signature server-side and mark payment_status = "paid".
 *
 * For now this simulates a successful gateway hand-off so the ordering flow
 * works end-to-end.
 */
export type OnlinePaymentInput = {
  orderId: string;
  amount: number;
};

export async function placeOrderOnline(_input: OnlinePaymentInput): Promise<{ ok: true }> {
  // Simulated gateway delay
  await new Promise((r) => setTimeout(r, 400));
  return { ok: true };
}
