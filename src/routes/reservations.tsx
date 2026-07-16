import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { toast } from "sonner";
import { CalendarDays, Users, Clock, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/reservations")({
  head: () => ({
    meta: [
      { title: "Reserve a Table — Brew Haven Café" },
      { name: "description", content: "Book your table at Brew Haven Café. Choose your date, time and party size — we'll hold a spot with your name on it." },
      { property: "og:title", content: "Reserve a Table — Brew Haven Café" },
      { property: "og:description", content: "Book your table at Brew Haven Café in seconds." },
    ],
  }),
  component: ReservationsPage,
});

type AvailableTable = { id: string; table_number: number; capacity: number };

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function ReservationsPage() {
  const [date, setDate] = useState(todayISO());
  const [time, setTime] = useState("19:00");
  const [guests, setGuests] = useState(2);
  const [tables, setTables] = useState<AvailableTable[] | null>(null);
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState<{ code: string; table: number } | null>(null);

  async function checkAvailability() {
    setChecking(true);
    setSelectedTable("");
    try {
      const { data, error } = await supabase.rpc("available_tables", {
        _date: date,
        _time: time,
        _guests: guests,
      });
      if (error) throw error;
      setTables((data ?? []) as AvailableTable[]);
      if (!data || data.length === 0) toast.error("No tables available at that time — try another slot.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't check availability");
    } finally {
      setChecking(false);
    }
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedTable) return toast.error("Pick a table first.");
    const fd = new FormData(e.currentTarget);
    setSubmitting(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("reservations")
        .insert({
          customer_name: String(fd.get("customer_name")).trim(),
          phone: String(fd.get("phone")).trim(),
          email: String(fd.get("email") ?? "").trim() || null,
          guests,
          reservation_date: date,
          reservation_time: time,
          table_id: selectedTable,
          special_request: String(fd.get("special_request") ?? "").trim() || null,
          user_id: userData.user?.id ?? null,
        })
        .select("id, cafe_tables!inner(table_number)")
        .single();
      if (error) throw error;
      const t = (data as { cafe_tables: { table_number: number } }).cafe_tables;
      setConfirmed({ code: (data.id as string).slice(0, 8).toUpperCase(), table: t.table_number });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Reservation failed";
      if (msg.includes("reservations_no_double_booking")) {
        toast.error("Someone just booked that table. Please check availability again.");
        setTables(null);
      } else {
        toast.error(msg);
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmed) {
    return (
      <div className="min-h-screen bg-stone-50 text-walnut-950 flex flex-col">
        <SiteNav />
        <main className="flex-1 grid place-items-center px-6 py-24">
          <div className="max-w-lg text-center">
            <CheckCircle2 className="size-16 text-brass-600 mx-auto mb-6" strokeWidth={1.5} />
            <p className="text-xs uppercase tracking-[0.3em] text-brass-600 mb-3">Reservation confirmed</p>
            <h1 className="font-serif text-5xl mb-6">See you soon.</h1>
            <p className="text-walnut-950/60 mb-10">
              We've held <strong className="text-walnut-950">Table {confirmed.table}</strong> for{" "}
              <strong className="text-walnut-950">{guests}</strong> on{" "}
              <strong className="text-walnut-950">{new Date(date).toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" })}</strong> at{" "}
              <strong className="text-walnut-950">{time}</strong>.
            </p>
            <div className="inline-block px-6 py-4 rounded-lg bg-white ring-1 ring-walnut-950/10">
              <p className="text-xs uppercase tracking-widest text-walnut-950/50 mb-1">Reference code</p>
              <p className="font-mono text-2xl tracking-wider">{confirmed.code}</p>
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 text-walnut-950 flex flex-col">
      <SiteNav />
      <header className="py-20 px-6 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-brass-600 mb-4">Reservations</p>
        <h1 className="font-serif text-5xl md:text-7xl">A table with your name.</h1>
        <p className="text-walnut-950/60 mt-6 max-w-xl mx-auto">
          Pick a time and party size — we'll hold the room.
        </p>
      </header>

      <section className="max-w-3xl w-full mx-auto px-6 pb-24">
        <div className="bg-white rounded-lg ring-1 ring-walnut-950/5 p-6 md:p-10 shadow-sm">
          {/* Availability */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Field label="Date" icon={<CalendarDays className="size-4" />}>
              <input type="date" value={date} min={todayISO()} onChange={(e) => { setDate(e.target.value); setTables(null); }} className="input" />
            </Field>
            <Field label="Time" icon={<Clock className="size-4" />}>
              <input type="time" value={time} onChange={(e) => { setTime(e.target.value); setTables(null); }} className="input" step={900} />
            </Field>
            <Field label="Guests" icon={<Users className="size-4" />}>
              <input type="number" min={1} max={20} value={guests} onChange={(e) => { setGuests(Math.max(1, Number(e.target.value))); setTables(null); }} className="input" />
            </Field>
          </div>
          <button
            type="button"
            onClick={checkAvailability}
            disabled={checking}
            className="w-full bg-walnut-950 text-stone-50 py-3 rounded-full text-sm font-medium hover:bg-walnut-900 disabled:opacity-60 transition-colors"
          >
            {checking ? "Checking…" : tables ? "Refresh availability" : "Check availability"}
          </button>

          {tables ? (
            <div className="mt-8">
              <p className="text-xs uppercase tracking-[0.25em] text-walnut-950/50 mb-3">Available tables</p>
              {tables.length === 0 ? (
                <p className="text-sm text-walnut-950/60 italic">No tables free at that slot. Try a different time.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {tables.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedTable(t.id)}
                      className={`p-4 rounded-lg text-left ring-1 transition-all ${
                        selectedTable === t.id
                          ? "ring-2 ring-brass-600 bg-brass-600/5"
                          : "ring-walnut-950/10 hover:ring-walnut-950/30"
                      }`}
                    >
                      <div className="font-serif text-2xl">Table {t.table_number}</div>
                      <div className="text-xs text-walnut-950/60 mt-1">Seats {t.capacity}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : null}

          {selectedTable ? (
            <form onSubmit={submit} className="mt-8 pt-8 border-t border-walnut-950/10 space-y-4">
              <p className="text-xs uppercase tracking-[0.25em] text-walnut-950/50">Your details</p>
              <input required name="customer_name" placeholder="Full name" className="input" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required name="phone" type="tel" placeholder="Phone" className="input" />
                <input name="email" type="email" placeholder="Email (optional)" className="input" />
              </div>
              <textarea name="special_request" rows={3} placeholder="Anything we should know? (allergies, birthday…)" className="input resize-none" />
              <button
                disabled={submitting}
                className="w-full bg-brass-600 text-stone-50 py-3 rounded-full text-sm font-medium hover:bg-brass-700 disabled:opacity-60 transition-colors"
              >
                {submitting ? "Reserving…" : "Confirm reservation"}
              </button>
            </form>
          ) : null}
        </div>
      </section>

      <SiteFooter />
      <WhatsAppButton />

      <style>{`.input{width:100%;padding:0.75rem 1rem;border-radius:0.5rem;box-shadow:inset 0 0 0 1px rgba(41,25,15,0.1);background:#fafaf9;outline:none;font-size:0.9rem;font-family:inherit;color:#29190f}.input:focus{box-shadow:inset 0 0 0 2px rgba(180,130,60,0.45)}`}</style>
    </div>
  );
}

function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-walnut-950/50 mb-2">
        {icon} {label}
      </span>
      {children}
    </label>
  );
}
