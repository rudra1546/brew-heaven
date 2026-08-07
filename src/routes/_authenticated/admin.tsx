import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LayoutDashboard, UtensilsCrossed, FolderTree, QrCode, ClipboardList, CalendarDays, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import chimeSound from "@/assets/new-order.mp3";
export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const { isAdmin } = Route.useRouteContext();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const orderSound = useRef(new Audio(chimeSound));
useEffect(() => {
  if (!isAdmin) return;

  orderSound.current.preload = "auto";

  const channel = supabase
    .channel("admin-orders-live")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "orders",
      },
      (payload) => {
        qc.invalidateQueries({ queryKey: ["admin-orders"] });
        qc.invalidateQueries({ queryKey: ["admin-stats"] });

        const row = payload.new as {
          order_number?: number;
          table_number?: number;
        };

        orderSound.current.currentTime = 0;

        orderSound.current.play().catch((err) => {
          console.log("Unable to play sound:", err);
        });

        toast.success(
          `New order #${row.order_number ?? "?"} · Table ${row.table_number ?? "?"}`
        );
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [isAdmin, qc]);

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth", replace: true });
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-stone-50 grid place-items-center px-6 text-center">
        <div className="max-w-md">
          <h1 className="font-serif text-4xl mb-4">Not authorized</h1>
          <p className="text-walnut-950/60 mb-6">Your account needs the <code className="text-brass-600">admin</code> role to access the dashboard.</p>
          <button onClick={signOut} className="rounded-full bg-walnut-950 text-stone-50 px-6 py-3 text-sm">Sign out</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 text-walnut-950 flex flex-col md:flex-row">
      <aside className="md:w-64 border-b md:border-b-0 md:border-r border-walnut-950/5 bg-white flex md:flex-col md:min-h-screen">
        <div className="p-6 border-b border-walnut-950/5 md:block hidden">
          <Link to="/" className="font-serif text-2xl">Brew Haven</Link>
          <p className="text-[10px] uppercase tracking-widest text-brass-600 mt-1">Admin</p>
        </div>
        <nav className="flex md:flex-col flex-row flex-1 gap-1 p-3 overflow-x-auto no-scrollbar">
          {[
            { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
            { to: "/admin/orders", label: "Orders", icon: ClipboardList },
            { to: "/admin/reservations", label: "Reservations", icon: CalendarDays },
            { to: "/admin/menu", label: "Menu Items", icon: UtensilsCrossed },
            { to: "/admin/categories", label: "Categories", icon: FolderTree },
            { to: "/admin/tables", label: "Tables & QR", icon: QrCode },
          ].map((it) => (
            <Link
              key={it.to}
              to={it.to}
              activeOptions={{ exact: it.exact }}
              activeProps={{ className: "bg-amber-100 text-amber-800 font-semibold ring-1 ring-amber-300" }}
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-walnut-950/70 hover:bg-stone-100 whitespace-nowrap"
            >
              <it.icon className="size-4" /> {it.label}
            </Link>
          ))}
        </nav>
        <button onClick={signOut} className="hidden md:flex items-center gap-3 px-4 py-3 m-3 text-sm text-walnut-950/60 hover:text-red-600 rounded-lg">
          <LogOut className="size-4" /> Sign out
        </button>
      </aside>
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
