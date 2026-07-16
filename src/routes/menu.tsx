import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { MenuBrowser, type Category, type MenuItem } from "@/components/MenuBrowser";
import { useCart } from "@/lib/cart";

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { title: "Menu — Brew Haven Café" },
      { name: "description", content: "Explore Brew Haven's interactive menu: coffee, tea, breakfast, pizza, burgers, pasta, desserts and cold beverages." },
      { property: "og:title", content: "Menu — Brew Haven Café" },
      { property: "og:description", content: "Interactive café menu with signature coffee, kitchen classics and desserts." },
    ],
  }),
  component: MenuPage,
});

function MenuPage() {
  const { table } = useCart();
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
  const { data: items = [] } = useQuery<MenuItem[]>({
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

  return (
    <div className="min-h-screen bg-stone-50 text-walnut-950 flex flex-col">
      <SiteNav />
      <header className="py-20 px-6 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-brass-600 mb-4">The Menu</p>
        <h1 className="font-serif text-5xl md:text-7xl">A day, in courses.</h1>
        <p className="text-walnut-950/60 mt-6 max-w-xl mx-auto">
          Nine categories. Made in small batches. Sourced with intention.
        </p>
        {table ? (
          <p className="mt-6 inline-block text-xs uppercase tracking-widest bg-brass-600/10 text-brass-600 px-4 py-2 rounded-full ring-1 ring-brass-600/20">
            Ordering for Table {table.table_number}
          </p>
        ) : (
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href="/order" className="bg-walnut-950 text-stone-50 text-sm font-medium px-6 py-3 rounded-full hover:bg-walnut-900 transition-colors">
              Order Online
            </a>
            <a href="/reservations" className="text-sm font-medium px-6 py-3 rounded-full ring-1 ring-walnut-950/15 hover:ring-walnut-950/30 transition-all">
              Reserve a Table
            </a>
          </div>
        )}
      </header>

      {categories.length > 0 ? (
        <MenuBrowser categories={categories} items={items} orderingEnabled />
      ) : (
        <div className="text-center py-20 text-walnut-950/40">Loading menu…</div>
      )}

      <div className="pb-24" />
      <SiteFooter />
      <WhatsAppButton />
    </div>
  );
}
