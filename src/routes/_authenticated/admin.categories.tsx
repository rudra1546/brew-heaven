import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Pencil, Trash2, Plus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/categories")({
  component: CategoriesPage,
});

type Cat = { id: string; name: string; slug: string; icon: string | null; sort_order: number };

function CategoriesPage() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Partial<Cat> | null>(null);
  const { data: cats = [] } = useQuery({
    queryKey: ["admin-cats"],
    queryFn: async () => (await supabase.from("categories").select("*").order("sort_order")).data ?? [],
  });

  async function save(form: FormData) {
    const payload = {
      name: String(form.get("name")).trim(),
      slug: String(form.get("slug")).trim().toLowerCase(),
      icon: String(form.get("icon") ?? "").trim() || null,
      sort_order: Number(form.get("sort_order") ?? 0),
    };
    const { error } = editing?.id
      ? await supabase.from("categories").update(payload).eq("id", editing.id)
      : await supabase.from("categories").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    setEditing(null);
    qc.invalidateQueries({ queryKey: ["admin-cats"] });
    qc.invalidateQueries({ queryKey: ["categories"] });
  }

  async function remove(id: string) {
    if (!confirm("Delete this category and all its items?")) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin-cats"] });
  }

  return (
    <div className="p-8 md:p-12">
      <div className="flex justify-between items-center flex-wrap gap-4 mb-10">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-brass-600 mb-3">Menu structure</p>
          <h1 className="font-serif text-4xl md:text-5xl">Categories</h1>
        </div>
        <button onClick={() => setEditing({})} className="inline-flex items-center gap-2 bg-walnut-950 text-stone-50 rounded-full px-5 py-2.5 text-sm">
          <Plus className="size-4" /> New category
        </button>
      </div>

      <div className="bg-white rounded-lg ring-1 ring-walnut-950/5 divide-y divide-walnut-950/5">
        {(cats as Cat[]).map((c) => (
          <div key={c.id} className="p-5 flex items-center justify-between">
            <div>
              <div className="font-medium">{c.icon} {c.name}</div>
              <div className="text-xs text-walnut-950/50 mt-1">/{c.slug} · sort {c.sort_order}</div>
            </div>
            <div className="flex gap-1">
              <button onClick={() => setEditing(c)} className="p-2 hover:text-brass-600"><Pencil className="size-4" /></button>
              <button onClick={() => remove(c.id)} className="p-2 hover:text-red-600"><Trash2 className="size-4" /></button>
            </div>
          </div>
        ))}
      </div>

      {editing !== null ? (
        <div className="fixed inset-0 z-50 bg-walnut-950/40 backdrop-blur-sm grid place-items-center p-4" onClick={() => setEditing(null)}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={(e) => { e.preventDefault(); save(new FormData(e.currentTarget)); }} className="bg-white p-8 rounded-lg w-full max-w-md space-y-4">
            <h2 className="font-serif text-2xl">{editing.id ? "Edit category" : "New category"}</h2>
            <input required name="name" defaultValue={editing.name ?? ""} placeholder="Name" className="w-full px-3 py-2.5 rounded ring-1 ring-walnut-950/10 outline-none focus:ring-brass-600" />
            <input required name="slug" defaultValue={editing.slug ?? ""} placeholder="slug-like-this" className="w-full px-3 py-2.5 rounded ring-1 ring-walnut-950/10 outline-none focus:ring-brass-600" />
            <div className="grid grid-cols-2 gap-3">
              <input name="icon" defaultValue={editing.icon ?? ""} placeholder="Icon (emoji)" className="px-3 py-2.5 rounded ring-1 ring-walnut-950/10 outline-none focus:ring-brass-600" />
              <input name="sort_order" type="number" defaultValue={editing.sort_order ?? 0} placeholder="Sort order" className="px-3 py-2.5 rounded ring-1 ring-walnut-950/10 outline-none focus:ring-brass-600" />
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
