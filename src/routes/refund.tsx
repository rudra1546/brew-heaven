import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, LegalH2 } from "@/components/LegalPage";

export const Route = createFileRoute("/refund")({
  head: () => ({ meta: [{ title: "Refund & Cancellation Policy — Brew Haven Café" }, { name: "description", content: "Refund and cancellation terms for Brew Haven Café online orders." }] }),
  component: () => (
    <LegalPage eyebrow="Legal" title="Refund & Cancellation Policy">
      <LegalH2>Order cancellation</LegalH2>
      <p>Orders can be cancelled at no cost before our kitchen has accepted them. Once the order status changes to <em>Preparing</em>, we're unable to cancel it.</p>
      <LegalH2>Refund eligibility</LegalH2>
      <ul className="list-disc pl-6 space-y-1">
        <li>Item unavailable after payment — full refund.</li>
        <li>Quality issue reported to a staff member before leaving — full refund or a replacement, at our discretion.</li>
        <li>Change of mind after preparation has begun — not eligible for a refund.</li>
      </ul>
      <LegalH2>Failed payment</LegalH2>
      <p>If your online payment fails or is deducted twice, please retain the transaction reference and contact us. Bank-side reversals typically complete within 5–7 business days.</p>
      <LegalH2>Refund processing time</LegalH2>
      <p>Approved refunds are initiated within 24 hours and typically appear in your account within 5–7 business days depending on your bank.</p>
      <LegalH2>Contact</LegalH2>
      <p>For any refund request, email hello@brewhaven.cafe with your order number.</p>
    </LegalPage>
  ),
});
