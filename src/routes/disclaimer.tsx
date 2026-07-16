import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, LegalH2 } from "@/components/LegalPage";

export const Route = createFileRoute("/disclaimer")({
  head: () => ({ meta: [{ title: "Disclaimer — Brew Haven Café" }, { name: "description", content: "Important notes on menu presentation, availability, pricing, and information at Brew Haven Café." }] }),
  component: () => (
    <LegalPage eyebrow="Legal" title="Disclaimer">
      <LegalH2>Food imagery</LegalH2>
      <p>Photographs shown on our website and menu are for illustrative purposes. Actual plating and portion may vary.</p>
      <LegalH2>Menu availability</LegalH2>
      <p>Items may occasionally be unavailable due to sourcing, seasonality, or demand. We will offer suitable alternatives where possible.</p>
      <LegalH2>Pricing</LegalH2>
      <p>All prices are inclusive of applicable taxes unless stated otherwise. Prices are subject to change.</p>
      <LegalH2>Business information</LegalH2>
      <p>Café hours, address, and contact details are kept up to date on our website. Please call ahead for any time-sensitive plans.</p>
    </LegalPage>
  ),
});
