import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, LegalH2 } from "@/components/LegalPage";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title: "Terms & Conditions — Brew Haven Café" }, { name: "description", content: "Terms of use for the Brew Haven Café website and ordering platform." }] }),
  component: () => (
    <LegalPage eyebrow="Legal" title="Terms & Conditions">
      <p>By using the Brew Haven Café website and ordering platform, you agree to the following terms.</p>
      <LegalH2>Website usage</LegalH2>
      <p>Content and imagery on this site are the property of Brew Haven Café and may not be reproduced without permission.</p>
      <LegalH2>Menu availability & pricing</LegalH2>
      <p>Menu items and prices are subject to change without notice. Availability may vary throughout the day; we will let you know if something you ordered is no longer available.</p>
      <LegalH2>Order acceptance</LegalH2>
      <p>An order placed through our platform is a request, not a binding contract, until it is accepted by our team on the shop floor.</p>
      <LegalH2>Customer responsibilities</LegalH2>
      <ul className="list-disc pl-6 space-y-1">
        <li>Provide an accurate name and phone number so we can identify your order.</li>
        <li>Treat our staff and other guests with respect.</li>
        <li>Inform us of any allergies before ordering.</li>
      </ul>
      <LegalH2>Limitation of liability</LegalH2>
      <p>We are not liable for any indirect, incidental, or consequential loss arising from use of the platform.</p>
    </LegalPage>
  ),
});
