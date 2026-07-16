import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

export type TableInfo = {
  id: string;
  table_number: number;
  qr_token: string;
} | null;

type CartCtx = {
  items: CartItem[];
  table: TableInfo;
  setTable: (t: TableInfo) => void;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, quantity: number) => void;
  clear: () => void;
  total: number;
  count: number;
};

const Ctx = createContext<CartCtx | null>(null);

const STORAGE_KEY = "brew-haven-cart-v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [table, setTable] = useState<TableInfo>(null);

  // hydrate from localStorage on client
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.items) setItems(parsed.items);
        if (parsed.table) setTable(parsed.table);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, table }));
  }, [items, table]);

  const value = useMemo<CartCtx>(() => {
    const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const count = items.reduce((s, i) => s + i.quantity, 0);
    return {
      items,
      table,
      setTable,
      addItem: (item) =>
        setItems((prev) => {
          const found = prev.find((p) => p.id === item.id);
          if (found) return prev.map((p) => (p.id === item.id ? { ...p, quantity: p.quantity + 1 } : p));
          return [...prev, { ...item, quantity: 1 }];
        }),
      removeItem: (id) => setItems((prev) => prev.filter((p) => p.id !== id)),
      updateQty: (id, quantity) =>
        setItems((prev) =>
          quantity <= 0 ? prev.filter((p) => p.id !== id) : prev.map((p) => (p.id === id ? { ...p, quantity } : p)),
        ),
      clear: () => setItems([]),
      total,
      count,
    };
  }, [items, table]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
