import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, ImageOff } from "lucide-react";
import { formatINR } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { toast } from "sonner";

export type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  sort_order: number;
};

export type MenuItem = {
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

export function MenuBrowser({
  categories,
  items,
  orderingEnabled = false,
}: {
  categories: Category[];
  items: MenuItem[];
  orderingEnabled?: boolean;
}) {
  const [activeSlug, setActiveSlug] = useState<string>(categories[0]?.slug ?? "");
  const [search, setSearch] = useState("");
  const { addItem } = useCart();

  const activeCategory = categories.find((c) => c.slug === activeSlug) ?? categories[0];

  const filtered = useMemo(() => {
    let list = items.filter((i) => i.category_id === activeCategory?.id);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = items.filter((i) => i.name.toLowerCase().includes(q) || i.description?.toLowerCase().includes(q));
    }
    return list;
  }, [items, activeCategory, search]);

  return (
    <div>
      {/* Search */}
      <div className="max-w-7xl mx-auto px-6 mb-8">
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-walnut-950/40" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search the menu…"
            className="w-full pl-11 pr-4 py-3 rounded-full ring-1 ring-walnut-950/10 bg-stone-50 focus:ring-2 focus:ring-brass-600/40 outline-none text-sm"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="border-y border-walnut-950/5 mb-16">
        <div className="max-w-7xl mx-auto px-6 overflow-x-auto no-scrollbar py-5">
          <div className="flex gap-8 whitespace-nowrap justify-start md:justify-center min-w-max">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => { setActiveSlug(c.slug); setSearch(""); }}
                className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
                  activeCategory?.id === c.id
                    ? "border-walnut-950 text-walnut-950"
                    : "border-transparent text-walnut-950/40 hover:text-walnut-950"
                }`}
              >
                <span className="mr-1.5">{c.icon}</span>
                {c.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlug + search}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.19, 1, 0.22, 1] }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16"
          >
            {filtered.length === 0 ? (
              <div className="col-span-full text-center py-20 text-walnut-950/50 font-serif text-xl italic">
                Nothing here — try another category.
              </div>
            ) : (
              filtered.map((item) => {
                const categoryName = categories.find((c) => c.id === item.category_id)?.name ?? "";
                return (
                  <article key={item.id} className="group flex flex-col">
                    <FoodImage src={item.image_url} name={item.name} popular={item.is_popular} available={item.availability} />
                    <div className="flex items-center gap-2 mt-5 mb-1.5">
                      <span className="text-[10px] uppercase tracking-[0.25em] text-walnut-950/40">{categoryName}</span>
                    </div>
                    <div className="flex justify-between items-start gap-4 mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`w-2.5 h-2.5 rounded-sm shrink-0 ring-1 ${item.veg_type === "veg" ? "bg-emerald-600 ring-emerald-700" : "bg-red-600 ring-red-700"}`}
                          aria-label={item.veg_type === "veg" ? "Vegetarian" : "Non-vegetarian"}
                          title={item.veg_type === "veg" ? "Vegetarian" : "Non-vegetarian"}
                        />
                        <h3 className="font-medium text-lg text-walnut-950 truncate">{item.name}</h3>
                      </div>
                      <span className="font-medium text-lg text-brass-600 shrink-0">{formatINR(item.price)}</span>
                    </div>
                    {item.description ? (
                      <p className="text-sm text-walnut-950/60 leading-relaxed mb-5 line-clamp-2">{item.description}</p>
                    ) : (
                      <div className="mb-5" />
                    )}
                    <div className="mt-auto">
                      {item.availability ? (
                        <button
                          onClick={() => {
                            addItem({ id: item.id, name: item.name, price: Number(item.price) });
                            toast.success(`Added ${item.name}`);
                          }}
                          className="inline-flex items-center gap-2 bg-walnut-950 text-stone-50 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-widest hover:bg-brass-600 transition-colors"
                        >
                          <Plus className="size-3.5" /> Add to Cart
                        </button>
                      ) : (
                        <span className="text-xs uppercase tracking-widest text-walnut-950/40">
                          Currently unavailable
                        </span>
                      )}
                    </div>
                  </article>
                );
              })
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function FoodImage({
  src,
  name,
  popular,
  available,
}: {
  src: string | null;
  name: string;
  popular: boolean;
  available: boolean;
}) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">(src ? "loading" : "error");

  return (
    <div className="relative overflow-hidden rounded-lg ring-1 ring-walnut-950/5 bg-stone-100 aspect-[4/3]">
      {/* Shimmer placeholder */}
      {status === "loading" ? (
        <div className="absolute inset-0 bg-gradient-to-br from-stone-200 via-stone-100 to-stone-200 animate-pulse" />
      ) : null}

      {src && status !== "error" ? (
        <img
          src={src}
          alt={name}
          loading="lazy"
          decoding="async"
          onLoad={() => setStatus("loaded")}
          onError={() => setStatus("error")}
          className={`w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105 ${
            status === "loaded" ? "opacity-100" : "opacity-0"
          }`}
        />
      ) : status === "error" ? (
        <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-stone-200 to-brass-300/30">
          <div className="text-center px-4">
            <ImageOff className="size-8 text-walnut-950/25 mx-auto mb-2" />
            <span className="font-serif text-2xl text-walnut-950/30 italic block">{name}</span>
          </div>
        </div>
      ) : null}

      {/* Subtle gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-walnut-950/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {popular ? (
        <span className="absolute top-3 left-3 bg-brass-600 text-stone-50 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
          ★ Popular
        </span>
      ) : null}

      {!available ? (
        <div className="absolute inset-0 bg-walnut-950/70 grid place-items-center backdrop-blur-sm">
          <span className="text-stone-50 text-xs uppercase tracking-widest">Unavailable</span>
        </div>
      ) : null}
    </div>
  );
}
