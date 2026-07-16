import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Single-owner admin: only this email is ever allowed to sign in / register.
const OWNER_EMAIL = "rudra15406@gmail.com";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Owner Sign In — Brew Haven Café" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin" });
    });
  }, [navigate]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim().toLowerCase();
    const password = String(fd.get("password") ?? "");
    if (!email || !password) return;

    if (email !== OWNER_EMAIL) {
      toast.error("This portal is restricted to the café owner.");
      return;
    }

    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success("Welcome back.");

      navigate({ to: "/admin" });

    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign-in failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 grid place-items-center px-6 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="block text-center font-serif text-3xl mb-8 text-walnut-950">
          Brew Haven
        </Link>
        <div className="p-8 rounded-lg bg-white ring-1 ring-walnut-950/5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-brass-600 mb-2 text-center">
            Owner Access
          </p>
          <h1 className="font-serif text-3xl text-center mb-2">
            Sign in
          </h1>
          Restricted to the café owner.
          <form onSubmit={onSubmit} className="space-y-4">
            <input
              required
              type="email"
              name="email"
              placeholder="Owner email"
              autoComplete="email"
              className="w-full px-4 py-3 rounded-lg ring-1 ring-walnut-950/10 focus:ring-2 focus:ring-brass-600/40 outline-none bg-stone-50"
            />
            <input
              required
              type="password"
              name="password"
              placeholder="Password"
              autoComplete="current-password"
              minLength={8}
              className="w-full px-4 py-3 rounded-lg ring-1 ring-walnut-950/10 focus:ring-2 focus:ring-brass-600/40 outline-none bg-stone-50"
            />
            <button
              disabled={busy}
              className="w-full bg-walnut-950 text-stone-50 py-3 rounded-full text-sm font-medium hover:bg-walnut-900 disabled:opacity-60 transition-colors"
            >
              {busy ? "…" : "Sign in"}
            </button>
          </form>
        </div>
        <p className="text-center text-xs text-walnut-950/40 mt-6 max-w-sm mx-auto leading-relaxed">
          Public registration is disabled. Only the pre-approved owner email may access the
          admin dashboard.
        </p>
      </div>
      <div className="text-center mt-6">
        <Link
          to="/"
          className="text-sm text-walnut-950/60 hover:text-walnut-950 transition-colors"
        >
          ← Back to website
        </Link>
      </div>
    </div>

  );
}
