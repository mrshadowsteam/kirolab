import type { Metadata } from "next";
import { RichText } from "@/components/content/portable-text";
import { buttonVariants } from "@/components/ui/button";
import { getSettings } from "@/lib/content";
import { formatPln } from "@/lib/utils";
import { legalDisclaimer } from "@/lib/site-config";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Konsultacje 1:1",
  description:
    "Płatna konsultacja 1:1 — przygotowanie do rozmowy kwalifikacyjnej lub negocjacji podwyżki. Rezerwacja z płatnością z góry.",
  alternates: { canonical: "/konsultacje" },
};

export default async function ConsultationsPage() {
  const settings = await getSettings();
  const calcomLink =
    settings?.calcomLink ?? process.env.NEXT_PUBLIC_CALCOM_LINK ?? "";

  return (
    <div className="container max-w-2xl py-12">
      <h1 className="text-3xl md:text-4xl">Konsultacje 1:1</h1>

      <div className="mt-4">
        {settings?.consultationDescription ? (
          <RichText value={settings.consultationDescription} />
        ) : (
          <div className="content-prose text-muted-foreground">
            <p>
              Indywidualna sesja online: przygotowanie do rozmowy kwalifikacyjnej
              (np. przedstawiciel medyczny, programy Management Trainee) albo do
              negocjacji podwyżki. Przećwiczymy trudne pytania, ułożymy Twoją
              argumentację i strategię.
            </p>
          </div>
        )}
      </div>

      {settings?.consultationPriceGrosze ? (
        <p className="mt-6 font-display text-2xl font-semibold text-primary">
          {formatPln(settings.consultationPriceGrosze)}{" "}
          <span className="text-base font-normal text-muted-foreground">
            / sesja
          </span>
        </p>
      ) : null}

      <div className="mt-8">
        {calcomLink ? (
          <a
            href={calcomLink}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "primary", size: "lg" })}
          >
            Zarezerwuj termin
          </a>
        ) : (
          <p className="rounded-md border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
            Rezerwacja terminów będzie dostępna wkrótce.
          </p>
        )}
      </div>

      <p className="mt-3 text-sm text-muted-foreground">
        Rezerwacja i płatność (z góry) odbywają się w bezpiecznym systemie Cal.com.
      </p>

      <p className="mt-8 rounded-md border border-border bg-muted/40 p-4 text-xs text-muted-foreground">
        {legalDisclaimer}
      </p>
    </div>
  );
}
