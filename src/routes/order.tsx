import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { MenuBrowser, type Category, type MenuItem } from "@/components/MenuBrowser";
import { useCart } from "@/lib/cart";
import { formatINR } from "@/lib/format";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useEffect } from "react";

export const Route = createFileRoute("/order")({
  head: () => ({
    meta: [
      { title: "Order Online — Brew Haven Café" },
      { name: "description", content: "Order your Brew Haven favourites online. Browse the menu, build your cart and check out — no QR code needed." },
      { property: "og:title", content: "Order Online — Brew Haven Café" },
      { property: "og:description", content: "Order coffee, breakfast, pizza and more from Brew Haven Café." },
    ],
  }),
  component: OrderPage,
});

function OrderPage() {
  const navigate = useNavigate();
  const { items, updateQty, removeItem, total, setTable, table } = useCart();

  // Clear any lingering table info from a previous QR session so this becomes
  // a proper online order and not a table order.
  useEffect(() => {
    if (table) setTable(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug, icon, sort_order")
        .order("sort_order");
      if (error) throw error;
      return data as Category[];
    },
  });

  const { data: menuItems = [] } = useQuery<MenuItem[]>({
    queryKey: ["menu-items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("menu_items")
        .select("id, category_id, name, description, price, image_url, availability, veg_type, is_popular")
        .order("name");
      if (error) throw error;
      return (data as Array<MenuItem & { price: number | string }>).map((d) => ({ ...d, price: Number(d.price) }));
    },
  });

  const count = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="min-h-screen bg-stone-50 text-walnut-950 flex flex-col">
      <SiteNav />

      <header className="py-20 px-6 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-brass-600 mb-4">Order Online</p>
        <h1 className="font-serif text-5xl md:text-7xl">Delivered, or picked up.</h1>
        <p className="text-walnut-950/60 mt-6 max-w-xl mx-auto">
          Build your cart, tell us where to send it, and we'll get to work.
        </p>
      </header>

      {categories.length > 0 ? (
        <MenuBrowser categories={categories} items={menuItems} orderingEnabled />
      ) : (
        <div className="text-center py-20 text-walnut-950/40">Loading menu…</div>
      )}

      {/* Sticky cart summary */}
      {items.length > 0 ? (
        <div className="sticky bottom-0 z-30 bg-walnut-950 text-stone-50 border-t border-walnut-950">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
            <div className="text-sm inline-flex items-center gap-2">
              <ShoppingBag className="size-4" />
              <span className="opacity-60">Your order:</span>{" "}
              <strong>{count} items</strong> · {formatINR(total)}
            </div>
            <button
              onClick={() => navigate({ to: "/checkout" })}
              className="bg-brass-600 hover:bg-brass-500 text-stone-50 px-6 py-3 rounded-full text-sm font-medium transition-colors"
            >
              Proceed to Checkout →
            </button>
          </div>
        </div>
      ) : null}

      {/* Cart list */}
      {items.length > 0 ? (
        <section className="max-w-3xl mx-auto px-6 py-16 w-full">
          <h2 className="font-serif text-3xl mb-8">Your Order</h2>
          <ul className="divide-y divide-walnut-950/5">
            {items.map((item) => (
              <li key={item.id} className="py-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{item.name}</p>
                  <p className="text-xs text-walnut-950/50 mt-1">{formatINR(item.price)} each</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQty(item.id, item.quantity - 1)} className="size-8 rounded-full ring-1 ring-walnut-950/10 grid place-items-center hover:bg-stone-100" aria-label="Decrease">
                    <Minus className="size-3.5" />
                  </button>
                  <span className="w-8 text-center text-sm">{item.quantity}</span>
                  <button onClick={() => updateQty(item.id, item.quantity + 1)} className="size-8 rounded-full ring-1 ring-walnut-950/10 grid place-items-center hover:bg-stone-100" aria-label="Increase">
                    <Plus className="size-3.5" />
                  </button>
                </div>
                <div className="w-24 text-right font-medium">{formatINR(item.price * item.quantity)}</div>
                <button onClick={() => removeItem(item.id)} className="text-walnut-950/40 hover:text-red-600 transition-colors" aria-label="Remove">
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex justify-between items-center pt-6 border-t border-walnut-950/10">
            <span className="font-serif text-2xl">Total</span>
            <span className="font-serif text-2xl">{formatINR(total)}</span>
          </div>
          <Link to="/checkout" className="mt-8 block text-center bg-walnut-950 text-stone-50 py-4 rounded-full text-sm font-medium hover:bg-walnut-900 transition-colors">
            Continue to Checkout
          </Link>
        </section>
      ) : null}

      <div className="flex-1" />
      <SiteFooter />
      <WhatsAppButton />
    </div>
  );
}
