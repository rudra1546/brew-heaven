import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { MenuBrowser, type Category, type MenuItem } from "@/components/MenuBrowser";
import { useCart } from "@/lib/cart";
import { formatINR } from "@/lib/format";
import { Minus, Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/table-order/$token")({
  head: () => ({
    meta: [
      { title: "Order at Your Table — Brew Haven Café" },
      { name: "description", content: "Place your café order from your table using our secure QR ordering system." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrderPage,
});

function OrderPage() {
  const { token } = Route.useParams();
  const navigate = useNavigate();
  const { items, updateQty, removeItem, total, setTable, table } = useCart();

  const { data: cafeTable, isLoading, error } = useQuery({
    queryKey: ["table-by-token", token],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cafe_tables")
        .select("id, table_number, qr_token, active")
        .eq("qr_token", token)
        .eq("active", true)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw new Error("Invalid or inactive QR code");
      return data;
    },
    retry: false,
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*").order("sort_order");
      return (data ?? []) as Category[];
    },
  });

  const { data: menuItems = [] } = useQuery<MenuItem[]>({
    queryKey: ["menu-items"],
    queryFn: async () => {
      const { data } = await supabase.from("menu_items").select("*").order("name");
      return ((data ?? []) as Array<MenuItem & { price: number | string }>).map((d) => ({ ...d, price: Number(d.price) }));
    },
  });

  useEffect(() => {
    if (cafeTable) {
      // Only replace table if different (avoids clearing cart when revisiting)
      if (!table || table.qr_token !== cafeTable.qr_token) {
        setTable({ id: cafeTable.id, table_number: cafeTable.table_number, qr_token: cafeTable.qr_token });
      }
    }
  }, [cafeTable, setTable, table]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 grid place-items-center px-6">
        <p className="text-walnut-950/50 font-serif text-xl italic">Verifying your table…</p>
      </div>
    );
  }

  if (error || !cafeTable) {
    return (
      <div className="min-h-screen bg-stone-50 grid place-items-center px-6 text-center">
        <div className="max-w-md">
          <p className="text-xs uppercase tracking-[0.3em] text-brass-600 mb-4">Invalid QR</p>
          <h1 className="font-serif text-4xl text-walnut-950 mb-4">That table code isn't recognised.</h1>
          <p className="text-walnut-950/60 mb-8">Please ask a member of staff to help you scan a fresh code.</p>
          <Link to="/" className="inline-flex items-center rounded-full bg-walnut-950 px-6 py-3 text-sm font-medium text-stone-50">
            Return home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 text-walnut-950">
      <SiteNav />

      <header className="py-16 px-6 text-center border-b border-walnut-950/5">
        <p className="text-xs uppercase tracking-[0.3em] text-brass-600 mb-3">You're at</p>
        <h1 className="font-serif text-6xl md:text-7xl">Table {cafeTable.table_number}</h1>
        <p className="text-walnut-950/60 mt-4">Browse the menu and add items to your order.</p>
      </header>

      {categories.length > 0 ? (
        <MenuBrowser categories={categories} items={menuItems} orderingEnabled />
      ) : null}

      {/* Cart summary sticky footer */}
      {items.length > 0 ? (
        <div className="sticky bottom-0 z-30 bg-walnut-950 text-stone-50 border-t border-walnut-950">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
            <div className="text-sm">
              <span className="opacity-60">Your order:</span>{" "}
              <strong>{items.reduce((s, i) => s + i.quantity, 0)} items</strong> · {formatINR(total)}
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

      {/* Cart drawer inline */}
      {items.length > 0 ? (
        <section className="max-w-3xl mx-auto px-6 py-16">
          <h2 className="font-serif text-3xl mb-8">Your Order</h2>
          <ul className="divide-y divide-walnut-950/5">
            {items.map((item) => (
              <li key={item.id} className="py-4 flex items-center gap-4">
                <div className="flex-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-walnut-950/50 mt-1">{formatINR(item.price)} each</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQty(item.id, item.quantity - 1)} className="size-8 rounded-full ring-1 ring-walnut-950/10 grid place-items-center hover:bg-stone-100">
                    <Minus className="size-3.5" />
                  </button>
                  <span className="w-8 text-center text-sm">{item.quantity}</span>
                  <button onClick={() => updateQty(item.id, item.quantity + 1)} className="size-8 rounded-full ring-1 ring-walnut-950/10 grid place-items-center hover:bg-stone-100">
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
        </section>
      ) : null}

      <SiteFooter />
      <WhatsAppButton />
    </div>
  );
}
