import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { formatINR } from "@/lib/format";
import { Check } from "lucide-react";

export const Route = createFileRoute("/order-success/$id")({
  head: () => ({ meta: [{ title: "Order confirmed — Brew Haven Café" }, { name: "robots", content: "noindex" }] }),
  component: SuccessPage,
});

function SuccessPage() {
  const { id } = Route.useParams();
  const { data } = useQuery({
    queryKey: ["order-success", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, order_number, total_amount, table_number, order_status, payment_status, payment_method")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-stone-50 text-walnut-950 flex flex-col">
      <SiteNav />
      <main className="flex-1 grid place-items-center px-6 py-24">
        <div className="max-w-md text-center">
          <div className="size-16 rounded-full bg-brass-600 text-stone-50 grid place-items-center mx-auto mb-8">
            <Check className="size-8" />
          </div>
          <p className="text-xs uppercase tracking-[0.3em] text-brass-600 mb-4">Thank you</p>
          <h1 className="font-serif text-5xl mb-4">Your order is in.</h1>
          {data ? (
            <>
              <p className="text-walnut-950/60 mb-8">
                Order <strong>#{data.order_number}</strong> · Table {data.table_number} · Total {formatINR(data.total_amount)}
              </p>
              <p className="text-sm text-walnut-950/70 mb-8">
                {data.payment_method === "counter"
                  ? "Please settle at the counter when you're ready to leave."
                  : "Payment received. Your order is being prepared."}
              </p>
            </>
          ) : null}
          <Link to="/menu" className="inline-flex items-center rounded-full bg-walnut-950 text-stone-50 px-6 py-3 text-sm">
            Order something else
          </Link>
        </div>
      </main>
      <SiteFooter />
      <WhatsAppButton />
    </div>
  );
}
