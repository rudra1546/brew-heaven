import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/lib/cart";
import { formatINR } from "@/lib/format";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { placeOrderOnline } from "@/lib/payments";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Brew Haven Café" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutPage,
});

const schema = z.object({
  customer_name: z.string().trim().min(2, "Name is required").max(80),
  phone: z.string().trim().regex(/^[+0-9\s\-()]{7,20}$/, "Enter a valid phone number"),
  delivery_address: z.string().trim().max(300).optional(),
  special_instructions: z.string().trim().max(500).optional(),
  payment_method: z.enum(["counter", "online"]),
});

function CheckoutPage() {
  const { items, total, table, clear } = useCart();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [payment, setPayment] = useState<"counter" | "online">(table ? "counter" : "online");

  const orderType: "online" | "table" = table ? "table" : "online";

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-stone-50 grid place-items-center px-6 text-center">
        <div>
          <h1 className="font-serif text-4xl mb-4">Your cart is empty.</h1>
          <p className="text-walnut-950/60 mb-8">Add a few things to your order first.</p>
          <Link to="/order" className="inline-flex bg-walnut-950 text-stone-50 rounded-full px-6 py-3 text-sm">Browse Menu</Link>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    const form = new FormData(e.currentTarget);
    const parsed = schema.safeParse({
      customer_name: form.get("customer_name"),
      phone: form.get("phone"),
      delivery_address: form.get("delivery_address") || undefined,
      special_instructions: form.get("special_instructions") || undefined,
      payment_method: payment,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setSubmitting(true);
    try {
      const insertPayload = {
        order_type: orderType,
        table_id: table?.id ?? null,
        table_number: table?.table_number ?? null,
        customer_name: parsed.data.customer_name,
        phone: parsed.data.phone,
        delivery_address: orderType === "online" ? parsed.data.delivery_address ?? null : null,
        special_instructions: parsed.data.special_instructions ?? null,
        total_amount: total,
        payment_method: parsed.data.payment_method,
        payment_status: "pending" as const,
        order_status: "pending" as const,
      };

      const { data: order, error } = await supabase
        .from("orders")
        .insert(insertPayload)
        .select("id, order_number")
        .single();
      if (error) throw error;

      const rows = items.map((i) => ({
        order_id: order.id,
        menu_item_id: i.id,
        item_name: i.name,
        quantity: i.quantity,
        price: i.price,
      }));
      const { error: itemErr } = await supabase.from("order_items").insert(rows);
      if (itemErr) throw itemErr;

      if (parsed.data.payment_method === "online") {
        await placeOrderOnline({ orderId: order.id, amount: total });
      }

      clear();
      toast.success(`Order #${order.order_number} received!`);
      navigate({ to: "/order-success/$id", params: { id: order.id } });
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Could not place order");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 text-walnut-950">
      <SiteNav />
      <div className="max-w-5xl mx-auto px-6 py-16">
        <p className="text-xs uppercase tracking-[0.3em] text-brass-600 mb-4">Checkout</p>
        <h1 className="font-serif text-5xl mb-2">Almost there.</h1>
        <p className="text-walnut-950/60 mb-12">
          {orderType === "table"
            ? `Confirm your details for Table ${table!.table_number}.`
            : "Tell us where to send your order."}
        </p>

        <div className="grid md:grid-cols-5 gap-12">
          <form onSubmit={handleSubmit} className="md:col-span-3 space-y-6">
            <div>
              <label className="block text-xs uppercase tracking-widest text-walnut-950/70 mb-2">Full name</label>
              <input required name="customer_name" maxLength={80} className="w-full px-4 py-3 rounded-lg ring-1 ring-walnut-950/10 focus:ring-2 focus:ring-brass-600/40 outline-none bg-stone-50" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-walnut-950/70 mb-2">Phone</label>
              <input required name="phone" inputMode="tel" maxLength={20} className="w-full px-4 py-3 rounded-lg ring-1 ring-walnut-950/10 focus:ring-2 focus:ring-brass-600/40 outline-none bg-stone-50" />
            </div>

            {orderType === "online" ? (
              <div>
                <label className="block text-xs uppercase tracking-widest text-walnut-950/70 mb-2">
                  Delivery address <span className="text-walnut-950/40 normal-case">(optional — leave blank for pickup)</span>
                </label>
                <textarea name="delivery_address" rows={2} maxLength={300} placeholder="Flat / building, street, area, city, PIN" className="w-full px-4 py-3 rounded-lg ring-1 ring-walnut-950/10 focus:ring-2 focus:ring-brass-600/40 outline-none bg-stone-50 resize-none" />
              </div>
            ) : null}

            <div>
              <label className="block text-xs uppercase tracking-widest text-walnut-950/70 mb-2">
                Special instructions <span className="text-walnut-950/40 normal-case">(optional)</span>
              </label>
              <textarea name="special_instructions" rows={3} maxLength={500} className="w-full px-4 py-3 rounded-lg ring-1 ring-walnut-950/10 focus:ring-2 focus:ring-brass-600/40 outline-none bg-stone-50 resize-none" />
            </div>

            <fieldset className="pt-4">
              <legend className="text-xs uppercase tracking-widest text-walnut-950/70 mb-3">Payment method</legend>
              <div className="grid sm:grid-cols-2 gap-3">
                <label className={`p-5 rounded-lg ring-1 cursor-pointer transition-all ${payment === "online" ? "ring-2 ring-walnut-950 bg-stone-100/60" : "ring-walnut-950/10 hover:ring-walnut-950/30"}`}>
                  <input type="radio" name="payment" checked={payment === "online"} onChange={() => setPayment("online")} className="sr-only" />
                  <div className="font-medium mb-1">Pay Online</div>
                  <div className="text-xs text-walnut-950/60">Razorpay — cards, UPI, wallets.</div>
                </label>
                <label className={`p-5 rounded-lg ring-1 cursor-pointer transition-all ${payment === "counter" ? "ring-2 ring-walnut-950 bg-stone-100/60" : "ring-walnut-950/10 hover:ring-walnut-950/30"}`}>
                  <input type="radio" name="payment" checked={payment === "counter"} onChange={() => setPayment("counter")} className="sr-only" />
                  <div className="font-medium mb-1">{orderType === "table" ? "Pay at Counter" : "Cash on Delivery"}</div>
                  <div className="text-xs text-walnut-950/60">
                    {orderType === "table" ? "Settle when you're ready to leave." : "Pay when your order arrives."}
                  </div>
                </label>
              </div>
            </fieldset>

            <button disabled={submitting} className="w-full bg-walnut-950 text-stone-50 py-4 rounded-full text-sm font-medium hover:bg-walnut-900 disabled:opacity-60 transition-colors">
              {submitting ? "Placing order…" : `Place Order · ${formatINR(total)}`}
            </button>
          </form>

          <aside className="md:col-span-2 p-6 rounded-lg bg-stone-100/50 ring-1 ring-walnut-950/5 h-fit sticky top-24">
            <h2 className="font-serif text-2xl mb-6">Order Summary</h2>
            <ul className="space-y-3 mb-6 text-sm">
              {items.map((i) => (
                <li key={i.id} className="flex justify-between gap-3">
                  <span className="text-walnut-950/70">{i.quantity}× {i.name}</span>
                  <span className="font-medium">{formatINR(i.price * i.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-between pt-4 border-t border-walnut-950/10">
              <span className="font-serif text-xl">Total</span>
              <span className="font-serif text-xl">{formatINR(total)}</span>
            </div>
            <p className="text-[10px] uppercase tracking-widest text-walnut-950/40 mt-4">
              {orderType === "table" ? `Table ${table!.table_number}` : "Online order"}
            </p>
          </aside>
        </div>
      </div>
      <SiteFooter />
      <WhatsAppButton />
    </div>
  );
}
