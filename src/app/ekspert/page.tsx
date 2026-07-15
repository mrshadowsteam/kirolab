import type { Metadata } from "next";
import { LeadForm } from "@/components/leads/lead-form";
import { legalDisclaimer } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Porozmawiaj z ekspertem",
  description:
    "Masz skomplikowaną sprawę? Zostaw kontakt — przekażemy ją partnerskiej kancelarii lub firmie odszkodowawczej.",
  alternates: { canonical: "/ekspert" },
};

export default function ExpertPage() {
  return (
    <div className="container max-w-2xl py-12">
      <h1 className="text-3xl md:text-4xl">Skomplikowana sprawa?</h1>
      <p className="mt-3 text-muted-foreground">
        Jeśli sprawa jest zbyt zawiła na samodzielne pismo, zostaw kontakt i krótki
        opis. Przekażemy ją zaufanemu partnerowi (kancelaria / firma
        odszkodowawcza), który oceni Twoje możliwości.
      </p>

      <div className="mt-8">
        <LeadForm />
      </div>

      <p className="mt-8 rounded-md border border-border bg-muted/40 p-4 text-xs text-muted-foreground">
        {legalDisclaimer} Twoje dane przekazujemy partnerowi wyłącznie za Twoją
        zgodą, w celu kontaktu w opisanej sprawie.
      </p>
    </div>
  );
}
