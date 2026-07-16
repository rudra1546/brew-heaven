import { Link } from "@tanstack/react-router";
import { useCart } from "@/lib/cart";
import { ShoppingBag } from "lucide-react";

export function SiteNav() {
  const { count, table } = useCart();
  return (
    <nav className="sticky top-0 z-50 bg-stone-50/85 backdrop-blur-md border-b border-walnut-950/5">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="font-serif text-2xl tracking-tight text-walnut-950">
          Brew Haven
        </Link>
        <div className="hidden md:flex gap-8 text-sm font-medium tracking-wide uppercase text-walnut-950/80">
          <Link to="/menu" className="hover:text-brass-600 transition-colors" activeProps={{ className: "text-brass-600" }}>
            Menu
          </Link>
          <Link to="/reservations" className="hover:text-brass-600 transition-colors" activeProps={{ className: "text-brass-600" }}>
            Reserve
          </Link>
          <Link to="/#story" className="hover:text-brass-600 transition-colors">
            Our Story
          </Link>
          <Link to="/#contact" className="hover:text-brass-600 transition-colors">
            Contact
          </Link>
        </div>
        <div className="flex items-center gap-3">
          {table ? (
            <Link
              to="/table-order/$token"
              params={{ token: table.qr_token }}
              className="relative inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full ring-1 ring-walnut-950/10 hover:ring-walnut-950/30 transition-all"
            >
              <ShoppingBag className="size-4" />
              <span className="hidden sm:inline">Table {table.table_number}</span>
              {count > 0 ? (
                <span className="ml-1 bg-brass-600 text-stone-50 text-[10px] font-bold rounded-full min-w-5 h-5 px-1.5 grid place-items-center">
                  {count}
                </span>
              ) : null}
            </Link>
          ) : count > 0 ? (
            <Link
              to="/checkout"
              className="relative inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full ring-1 ring-walnut-950/10 hover:ring-walnut-950/30 transition-all"
            >
              <ShoppingBag className="size-4" />
              <span className="ml-1 bg-brass-600 text-stone-50 text-[10px] font-bold rounded-full min-w-5 h-5 px-1.5 grid place-items-center">
                {count}
              </span>
            </Link>
          ) : null}
          <Link
            to="/auth"
            className="hidden sm:inline-flex text-sm font-medium px-5 py-2 rounded-full ring-1 ring-walnut-950/10 hover:ring-walnut-950/30 transition-all"
          >
            Admin
          </Link>
          <Link
            to="/order"
            className="bg-walnut-950 text-stone-50 text-sm font-medium px-5 py-2 rounded-full hover:bg-walnut-900 transition-all"
          >
            Order Now
          </Link>
        </div>
      </div>
    </nav>
  );
}
