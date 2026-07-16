import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/reservations")({
  component: AdminReservations,
});

type Reservation = {
  id: string;
  customer_name: string;
  phone: string;
  email: string | null;
  guests: number;
  reservation_date: string;
  reservation_time: string;
  special_request: string | null;
  status: "pending" | "confirmed" | "seated" | "completed" | "cancelled" | "no_show";
  created_at: string;
  cafe_tables: { table_number: number; capacity: number } | null;
};

const STATUSES = ["pending", "confirmed", "seated", "completed", "cancelled", "no_show"] as const;

function AdminReservations() {
  const qc = useQueryClient();
  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["admin-reservations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reservations")
        .select("*, cafe_tables(table_number, capacity)")
        .order("reservation_date", { ascending: false })
        .order("reservation_time", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Reservation[];
    },
  });

  async function updateStatus(id: string, status: Reservation["status"]) {
    const { error } = await supabase.from("reservations").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Updated");
    qc.invalidateQueries({ queryKey: ["admin-reservations"] });
  }

  return (
    <div className="p-8 md:p-12">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-[0.3em] text-brass-600 mb-3">Front of house</p>
        <h1 className="font-serif text-4xl md:text-5xl">Reservations</h1>
      </div>

      {isLoading ? (
        <p className="text-walnut-950/50">Loading…</p>
      ) : rows.length === 0 ? (
        <div className="rounded-lg bg-white ring-1 ring-walnut-950/5 p-12 text-center">
          <p className="text-walnut-950/50 font-serif italic text-xl">No reservations yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg bg-white ring-1 ring-walnut-950/5">
          <table className="w-full text-sm">
            <thead className="text-left border-b border-walnut-950/5">
              <tr className="text-xs uppercase tracking-widest text-walnut-950/50">
                <th className="p-4">When</th>
                <th className="p-4">Guest</th>
                <th className="p-4">Party</th>
                <th className="p-4">Table</th>
                <th className="p-4">Notes</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-walnut-950/5 last:border-0 align-top">
                  <td className="p-4 whitespace-nowrap">
                    <div className="font-medium">
                      {new Date(r.reservation_date).toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" })}
                    </div>
                    <div className="text-walnut-950/50 text-xs">{r.reservation_time.slice(0, 5)}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium">{r.customer_name}</div>
                    <div className="text-walnut-950/50 text-xs">{r.phone}{r.email ? ` · ${r.email}` : ""}</div>
                  </td>
                  <td className="p-4">{r.guests}</td>
                  <td className="p-4">
                    {r.cafe_tables ? (
                      <>Table {r.cafe_tables.table_number} <span className="text-walnut-950/40 text-xs">({r.cafe_tables.capacity})</span></>
                    ) : "—"}
                  </td>
                  <td className="p-4 max-w-xs">
                    <span className="text-walnut-950/60 text-xs">{r.special_request ?? "—"}</span>
                  </td>
                  <td className="p-4">
                    <select
                      value={r.status}
                      onChange={(e) => updateStatus(r.id, e.target.value as Reservation["status"])}
                      className={`px-2 py-1.5 rounded ring-1 ring-walnut-950/10 text-xs bg-white capitalize ${
                        r.status === "confirmed" || r.status === "seated" ? "text-emerald-700" :
                        r.status === "cancelled" || r.status === "no_show" ? "text-red-700" :
                        r.status === "completed" ? "text-walnut-950/60" : "text-brass-600"
                      }`}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{s.replace("_", " ")}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
