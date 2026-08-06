import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatINR } from "@/lib/format";
import { toast } from "sonner";
import { printKitchenReceipt } from "@/lib/receipt";
export const Route = createFileRoute("/_authenticated/admin/orders")({
  component: OrdersPage,
});

type OrderStatus = "pending" | "accepted" | "preparing" | "completed" | "cancelled";

const STATUS_FLOW: Record<OrderStatus, { next?: OrderStatus; label: string; color: string }> = {
  pending: { next: "accepted", label: "Pending", color: "bg-amber-100 text-amber-800" },
  accepted: { next: "preparing", label: "Accepted", color: "bg-blue-100 text-blue-800" },
  preparing: { next: "completed", label: "Preparing", color: "bg-brass-600/15 text-brass-600" },
  completed: { label: "Completed", color: "bg-emerald-100 text-emerald-800" },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800" },
};

function OrdersPage() {
  const qc = useQueryClient();
  const { data: orders = [] } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, order_number, table_number, customer_name, phone, total_amount, order_status, payment_status, payment_method, special_instructions, created_at, order_items(item_name, quantity, price)")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel("admin-orders-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, (payload) => {
        qc.invalidateQueries({ queryKey: ["admin-orders"] });
        qc.invalidateQueries({ queryKey: ["admin-stats"] });
        if (payload.eventType === "INSERT") {
          const row = payload.new as { order_number?: number; table_number?: number };
          toast.success(`New order #${row.order_number ?? "?"} · Table ${row.table_number ?? "?"}`);
        }
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);

  async function updateStatus(id: string, status: OrderStatus) {

  const { error } = await supabase
    .from("orders")
    .update({
      order_status: status
    })
    .eq("id", id);


  if (error) {
    return toast.error(error.message);
  }


  qc.invalidateQueries({
    queryKey: ["admin-orders"]
  });


  toast.success(`Order marked ${status}`);
}


async function markPreparing(order: any) {

  await updateStatus(order.id, "preparing");

  printKitchenReceipt(order);

}

  async function markPaid(id: string) {
    const { error } = await supabase.from("orders").update({ payment_status: "paid" }).eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin-orders"] });
  }

  return (
    <div className="p-8 md:p-12">
      <p className="text-xs uppercase tracking-[0.3em] text-brass-600 mb-3">Live</p>
      <h1 className="font-serif text-4xl md:text-5xl mb-10">Orders</h1>

      {orders.length === 0 ? (
        <p className="italic font-serif text-walnut-950/50">No orders yet — the first one will appear here instantly.</p>
      ) : (
        <div className="grid gap-4">
          {orders.map((o) => {
            const cfg = STATUS_FLOW[o.order_status as OrderStatus];
            return (
              <div key={o.id} className="p-6 rounded-lg bg-white ring-1 ring-walnut-950/5">
                <div className="flex justify-between items-start flex-wrap gap-4 mb-4">
                  <div>
                    <p className="text-xs font-mono text-walnut-950/50">#{o.order_number} · Table {o.table_number}</p>
                    <p className="font-medium mt-1">{o.customer_name} <span className="text-walnut-950/40 text-sm">· {o.phone}</span></p>
                    <p className="text-xs text-walnut-950/40 mt-1">{new Date(o.created_at).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block text-[10px] px-2 py-1 rounded font-bold uppercase tracking-widest ${cfg.color}`}>{cfg.label}</span>
                    <div className="text-2xl font-serif text-brass-600 mt-2">{formatINR(o.total_amount)}</div>
                    <div className="text-[10px] uppercase tracking-widest text-walnut-950/40 mt-1">
                      {o.payment_method === "counter" ? "Pay at counter" : "Online"} · {o.payment_status}
                    </div>
                  </div>
                </div>
                <ul className="text-sm text-walnut-950/70 space-y-1 mb-4 border-t border-walnut-950/5 pt-4">
                  {(o.order_items ?? []).map((it, idx) => (
                    <li key={idx} className="flex justify-between">
                      <span>{it.quantity}× {it.item_name}</span>
                      <span>{formatINR(Number(it.price) * it.quantity)}</span>
                    </li>
                  ))}
                </ul>
                {o.special_instructions ? (
                  <p className="text-xs italic text-walnut-950/60 mb-4">Note: {o.special_instructions}</p>
                ) : null}
                <div className="flex flex-wrap gap-2">
                  {cfg.next ? (
                    <button onClick={() =>
                      cfg.next === "preparing"
                        ? markPreparing(o)
                        : updateStatus(o.id, cfg.next!)
                    } className="text-xs uppercase tracking-widest px-4 py-2 rounded-full bg-walnut-950 text-stone-50 hover:bg-walnut-900">
                      Mark {STATUS_FLOW[cfg.next].label}
                    </button>
                  ) : null}
                  {o.order_status !== "cancelled" && o.order_status !== "completed" ? (
                    <button onClick={() => updateStatus(o, "cancelled")} className="text-xs uppercase tracking-widest px-4 py-2 rounded-full ring-1 ring-walnut-950/10 hover:bg-stone-100">
                      Cancel
                    </button>
                  ) : null}
                  {o.payment_status !== "paid" ? (
                    <button onClick={() => markPaid(o.id)} className="text-xs uppercase tracking-widest px-4 py-2 rounded-full ring-1 ring-brass-600/30 text-brass-600 hover:bg-brass-600/5">
                      Mark Paid
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
