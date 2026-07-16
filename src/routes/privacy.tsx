import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, LegalH2 } from "@/components/LegalPage";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Privacy Policy — Brew Haven Café" }, { name: "description", content: "How Brew Haven Café collects, uses, and protects customer information for its ordering platform." }] }),
  component: () => (
    <LegalPage eyebrow="Legal" title="Privacy Policy">
      <p>Brew Haven Café ("we", "us") is committed to protecting the privacy of our guests. This policy explains what information we collect through our digital ordering platform and how we use it.</p>
      <LegalH2>Information we collect</LegalH2>
      <ul className="list-disc pl-6 space-y-1">
        <li>Your name and phone number, provided at checkout to identify your order.</li>
        <li>Order details — items, quantities, table number, special instructions.</li>
        <li>Payment status. For online payments we do not store card or UPI credentials; those are handled by our payment gateway (Razorpay).</li>
        <li>Basic technical data such as browser type and device, used only to keep the site running.</li>
      </ul>
      <LegalH2>How we use your information</LegalH2>
      <p>We use the information you provide only to prepare and deliver your order, contact you if there is an issue with it, and improve our service. We do not sell your data.</p>
      <LegalH2>Data security</LegalH2>
      <p>Data is stored on secure servers with encryption in transit. Access is restricted to authorised staff.</p>
      <LegalH2>Contact</LegalH2>
      <p>Questions? Write to hello@brewhaven.cafe.</p>
    </LegalPage>
  ),
});
