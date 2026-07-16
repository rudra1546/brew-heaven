import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatINR } from "@/lib/format";
import { toast } from "sonner";
import { Pencil, Trash2, Plus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/menu")({
  component: MenuMgmt,
});

type Item = {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  availability: boolean;
  veg_type: "veg" | "non_veg";
  is_popular: boolean;
};

function MenuMgmt() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Partial<Item> | null>(null);

  const { data: cats = [] } = useQuery({
    queryKey: ["admin-cats"],
    queryFn: async () => (await supabase.from("categories").select("*").order("sort_order")).data ?? [],
  });
  const { data: items = [] } = useQuery({
    queryKey: ["admin-items"],
    queryFn: async () => (await supabase.from("menu_items").select("*").order("name")).data ?? [],
  });

  async function save(form: FormData) {
    const payload = {
      category_id: String(form.get("category_id")),
      name: String(form.get("name")).trim(),
      description: String(form.get("description") ?? "").trim() || null,
      price: Number(form.get("price")),
      image_url: String(form.get("image_url") ?? "").trim() || null,
      availability: form.get("availability") === "on",
      veg_type: String(form.get("veg_type")) as "veg" | "non_veg",
      is_popular: form.get("is_popular") === "on",
    };
    const { error } = editing?.id
      ? await supabase.from("menu_items").update(payload).eq("id", editing.id)
      : await supabase.from("menu_items").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(editing?.id ? "Item updated" : "Item added");
    setEditing(null);
    qc.invalidateQueries({ queryKey: ["admin-items"] });
    qc.invalidateQueries({ queryKey: ["menu-items"] });
  }

  async function remove(id: string) {
    if (!confirm("Delete this item?")) return;
    const { error } = await supabase.from("menu_items").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["admin-items"] });
  }

  return (
    <div className="p-8 md:p-12">
      <div className="flex justify-between items-center flex-wrap gap-4 mb-10">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-brass-600 mb-3">Kitchen</p>
          <h1 className="font-serif text-4xl md:text-5xl">Menu Items</h1>
        </div>
        <button onClick={() => setEditing({})} className="inline-flex items-center gap-2 bg-walnut-950 text-stone-50 rounded-full px-5 py-2.5 text-sm">
          <Plus className="size-4" /> New item
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg bg-white ring-1 ring-walnut-950/5">
        <table className="w-full text-sm">
          <thead className="text-left border-b border-walnut-950/5">
            <tr className="text-xs uppercase tracking-widest text-walnut-950/50">
              <th className="p-4">Name</th>
              <th className="p-4">Category</th>
              <th className="p-4">Price</th>
              <th className="p-4">Type</th>
              <th className="p-4">Status</th>
              <th className="p-4" />
            </tr>
          </thead>
          <tbody>
            {(items as Item[]).map((it) => (
              <tr key={it.id} className="border-b border-walnut-950/5 last:border-0">
                <td className="p-4 font-medium">{it.name} {it.is_popular ? <span className="text-[10px] text-brass-600 ml-2">★ Popular</span> : null}</td>
                <td className="p-4 text-walnut-950/60">{cats.find((c) => c.id === it.category_id)?.name ?? "—"}</td>
                <td className="p-4">{formatINR(Number(it.price))}</td>
                <td className="p-4">
                  <span className={`w-2 h-2 rounded-full inline-block mr-2 ${it.veg_type === "veg" ? "bg-emerald-600" : "bg-red-600"}`} />
                  {it.veg_type === "veg" ? "Veg" : "Non-veg"}
                </td>
                <td className="p-4">{it.availability ? "Available" : "Out"}</td>
                <td className="p-4 text-right">
                  <button onClick={() => setEditing(it)} className="p-2 hover:text-brass-600"><Pencil className="size-4" /></button>
                  <button onClick={() => remove(it.id)} className="p-2 hover:text-red-600"><Trash2 className="size-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing !== null ? (
        <div className="fixed inset-0 z-50 bg-walnut-950/40 backdrop-blur-sm grid place-items-center p-4" onClick={() => setEditing(null)}>
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={(e) => { e.preventDefault(); save(new FormData(e.currentTarget)); }}
            className="bg-white p-8 rounded-lg w-full max-w-lg space-y-4"
          >
            <h2 className="font-serif text-2xl mb-2">{editing.id ? "Edit item" : "New item"}</h2>
            <input required name="name" defaultValue={editing.name ?? ""} placeholder="Name" className="w-full px-3 py-2.5 rounded ring-1 ring-walnut-950/10 outline-none focus:ring-brass-600" />
            <textarea name="description" defaultValue={editing.description ?? ""} placeholder="Description" rows={3} className="w-full px-3 py-2.5 rounded ring-1 ring-walnut-950/10 outline-none focus:ring-brass-600 resize-none" />
            <div className="grid grid-cols-2 gap-3">
              <input required name="price" type="number" min={0} step="0.01" defaultValue={editing.price ?? ""} placeholder="Price" className="px-3 py-2.5 rounded ring-1 ring-walnut-950/10 outline-none focus:ring-brass-600" />
              <select required name="category_id" defaultValue={editing.category_id ?? ""} className="px-3 py-2.5 rounded ring-1 ring-walnut-950/10 outline-none focus:ring-brass-600 bg-white">
                <option value="">Category…</option>
                {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <ImageField initial={editing.image_url ?? ""} />
            <div className="grid grid-cols-2 gap-3">
              <select name="veg_type" defaultValue={editing.veg_type ?? "veg"} className="px-3 py-2.5 rounded ring-1 ring-walnut-950/10 bg-white">
                <option value="veg">Vegetarian</option>
                <option value="non_veg">Non-vegetarian</option>
              </select>
              <div className="flex items-center gap-4 text-sm">
                <label className="flex items-center gap-2"><input type="checkbox" name="availability" defaultChecked={editing.availability ?? true} /> Available</label>
                <label className="flex items-center gap-2"><input type="checkbox" name="is_popular" defaultChecked={editing.is_popular ?? false} /> Popular</label>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 text-sm rounded-full ring-1 ring-walnut-950/10">Cancel</button>
              <button className="px-5 py-2 text-sm rounded-full bg-walnut-950 text-stone-50">Save</button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}

function ImageField({ initial }: { initial: string }) {
  const [url, setUrl] = useState(initial);
  const [uploading, setUploading] = useState(false);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("menu-images").upload(path, file, {
        cacheControl: "31536000",
        upsert: false,
        contentType: file.type,
      });
      if (error) throw error;
      const { data, error: signErr } = await supabase.storage
        .from("menu-images")
        .createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
      if (signErr || !data?.signedUrl) throw signErr ?? new Error("Failed to sign URL");
      setUrl(data.signedUrl);
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2 items-center">
        <input
          name="image_url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Image URL"
          className="flex-1 px-3 py-2.5 rounded ring-1 ring-walnut-950/10 outline-none focus:ring-brass-600"
        />
        <label className="shrink-0 cursor-pointer px-3 py-2.5 rounded ring-1 ring-walnut-950/10 text-sm hover:bg-stone-50">
          {uploading ? "…" : "Upload"}
          <input type="file" accept="image/*" onChange={onFile} className="hidden" disabled={uploading} />
        </label>
      </div>
      {url ? (
        <img src={url} alt="Preview" className="w-24 h-24 object-cover rounded ring-1 ring-walnut-950/10" />
      ) : null}
    </div>
  );
}
