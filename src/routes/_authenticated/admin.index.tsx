import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatINR } from "@/lib/format";
import { TrendingUp, ShoppingBag, Clock, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: DashboardPage,
});

function DashboardPage() {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const [{ data: orders }, { data: pending }, { data: popular }] = await Promise.all([
        supabase.from("orders").select("id, total_amount, created_at, order_status"),
        supabase.from("orders").select("id").eq("order_status", "pending"),
        supabase.from("order_items").select("item_name, quantity"),
      ]);
      const todaysOrders = (orders ?? []).filter((o) => new Date(o.created_at) >= today);
      const revenue = todaysOrders.reduce((s, o) => s + Number(o.total_amount), 0);
      const counts = new Map<string, number>();
      (popular ?? []).forEach((r) => counts.set(r.item_name, (counts.get(r.item_name) ?? 0) + r.quantity));
      const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
      return {
        totalOrders: (orders ?? []).length,
        todaysOrders: todaysOrders.length,
        revenue,
        pending: (pending ?? []).length,
        top,
      };
    },
    refetchInterval: 15000,
  });

  const cards = [
    { label: "Today's Orders", value: stats?.todaysOrders ?? "—", icon: ShoppingBag },
    { label: "Today's Revenue", value: stats ? formatINR(stats.revenue) : "—", icon: TrendingUp },
    { label: "Pending Orders", value: stats?.pending ?? "—", icon: Clock },
    { label: "Total Orders", value: stats?.totalOrders ?? "—", icon: Sparkles },
  ];

  return (
    <div className="p-8 md:p-12">
      <p className="text-xs uppercase tracking-[0.3em] text-brass-600 mb-3">Overview</p>
      <h1 className="font-serif text-4xl md:text-5xl mb-10">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {cards.map((c) => (
          <div key={c.label} className="p-6 rounded-lg bg-white ring-1 ring-walnut-950/5">
            <c.icon className="size-5 text-brass-600 mb-4" />
            <div className="text-3xl font-serif">{c.value}</div>
            <div className="text-xs uppercase tracking-widest text-walnut-950/50 mt-1">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="p-8 rounded-lg bg-white ring-1 ring-walnut-950/5">
        <h2 className="font-serif text-2xl mb-6">Popular items</h2>
        {stats?.top.length ? (
          <ul className="divide-y divide-walnut-950/5">
            {stats.top.map(([name, qty]) => (
              <li key={name} className="flex justify-between py-3">
                <span>{name}</span>
                <span className="text-brass-600 font-medium">{qty} sold</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-walnut-950/50 italic font-serif">No orders yet.</p>
        )}
      </div>
    </div>
  );
}
