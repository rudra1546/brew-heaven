import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import QRCode from "qrcode";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, RefreshCw, Download } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/tables")({
  component: TablesPage,
});

type CafeTable = { id: string; table_number: number; qr_token: string; active: boolean };

function TableCard({ t, baseUrl, onRegenerate, onToggle }: {
  t: CafeTable; baseUrl: string;
  onRegenerate: (t: CafeTable) => void;
  onToggle: (t: CafeTable) => void;
}) {
  const [qr, setQr] = useState<string | null>(null);
  const url = `${baseUrl}/table-order/${t.qr_token}`;

  useEffect(() => {
    QRCode.toDataURL(url, { width: 512, margin: 2, color: { dark: "#1c1917", light: "#fdfaf6" } }).then(setQr);
  }, [url]);

  function download() {
    if (!qr) return;
    const a = document.createElement("a");
    a.href = qr;
    a.download = `brew-haven-table-${t.table_number}.png`;
    a.click();
  }

  return (
    <div className="p-6 bg-white rounded-lg ring-1 ring-walnut-950/5">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-brass-600">Table</p>
          <h3 className="font-serif text-4xl">{t.table_number}</h3>
        </div>
        <span className={`text-[10px] px-2 py-1 rounded uppercase tracking-widest ${t.active ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}>
          {t.active ? "Active" : "Inactive"}
        </span>
      </div>
      {qr ? <img src={qr} alt={`QR code for table ${t.table_number}`} className="w-full aspect-square rounded" /> : <div className="w-full aspect-square bg-stone-100 rounded animate-pulse" />}
      <p className="text-[10px] font-mono text-walnut-950/40 mt-3 truncate" title={url}>{url}</p>
      <div className="flex gap-2 mt-4 flex-wrap">
        <button onClick={download} className="flex-1 text-xs px-3 py-2 rounded-full bg-walnut-950 text-stone-50 flex items-center justify-center gap-1"><Download className="size-3" /> PNG</button>
        <button onClick={() => onRegenerate(t)} className="text-xs px-3 py-2 rounded-full ring-1 ring-walnut-950/10 hover:bg-stone-100" title="Regenerate QR"><RefreshCw className="size-3" /></button>
        <button onClick={() => onToggle(t)} className="text-xs px-3 py-2 rounded-full ring-1 ring-walnut-950/10 hover:bg-stone-100">{t.active ? "Deactivate" : "Activate"}</button>
      </div>
    </div>
  );
}

function TablesPage() {
  const qc = useQueryClient();
  const [baseUrl, setBaseUrl] = useState("");
  useEffect(() => { setBaseUrl(window.location.origin); }, []);

  const { data: tables = [] } = useQuery({
    queryKey: ["admin-tables"],
    queryFn: async () => (await supabase.from("cafe_tables").select("*").order("table_number")).data ?? [],
  });

  async function addTable() {
    const nextNum = ((tables as CafeTable[]).at(-1)?.table_number ?? 0) + 1;
    const numStr = prompt("Table number?", String(nextNum));
    if (!numStr) return;
    const num = parseInt(numStr, 10);
    if (Number.isNaN(num)) return toast.error("Invalid number");
    const { error } = await supabase.from("cafe_tables").insert({ table_number: num });
    if (error) return toast.error(error.message);
    toast.success(`Table ${num} added`);
    qc.invalidateQueries({ queryKey: ["admin-tables"] });
  }

  async function regenerate(t: CafeTable) {
    if (!confirm("Regenerate QR? The old printed code will stop working.")) return;
    // Generate hex token client-side
    const bytes = new Uint8Array(24);
    crypto.getRandomValues(bytes);
    const token = Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
    const { error } = await supabase.from("cafe_tables").update({ qr_token: token }).eq("id", t.id);
    if (error) return toast.error(error.message);
    toast.success("QR regenerated");
    qc.invalidateQueries({ queryKey: ["admin-tables"] });
  }

  async function toggleActive(t: CafeTable) {
    const { error } = await supabase.from("cafe_tables").update({ active: !t.active }).eq("id", t.id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin-tables"] });
  }

  return (
    <div className="p-8 md:p-12">
      <div className="flex justify-between items-center flex-wrap gap-4 mb-10">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-brass-600 mb-3">Physical layout</p>
          <h1 className="font-serif text-4xl md:text-5xl">Tables &amp; QR Codes</h1>
          <p className="text-walnut-950/60 mt-3 text-sm max-w-xl">Each QR code contains a secure random token — table numbers are never exposed in URLs. Codes are permanent; regenerate only if a code is compromised.</p>
        </div>
        <button onClick={addTable} className="inline-flex items-center gap-2 bg-walnut-950 text-stone-50 rounded-full px-5 py-2.5 text-sm">
          <Plus className="size-4" /> Add table
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {(tables as CafeTable[]).map((t) => (
          <TableCard key={t.id} t={t} baseUrl={baseUrl} onRegenerate={regenerate} onToggle={toggleActive} />
        ))}
      </div>
    </div>
  );
}
