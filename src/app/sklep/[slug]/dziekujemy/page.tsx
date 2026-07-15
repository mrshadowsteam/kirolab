import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Dziękujemy za zakup",
  robots: { index: false, follow: false },
};

export default function ThankYouPage() {
  return (
    <div className="container max-w-xl py-16 text-center">
      <h1 className="text-3xl md:text-4xl">Dziękujemy za zakup!</h1>
      <p className="mt-4 text-muted-foreground">
        Gdy tylko potwierdzimy płatność, wyślemy na Twój adres e-mail link do
        pobrania dokumentu (ważny 72 godziny). Sprawdź też folder ze spamem.
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        Płatność mogła jeszcze się nie zaksięgować — e-mail dotrze zwykle w ciągu
        kilku minut.
      </p>
      <Link
        href="/"
        className={`mt-8 inline-flex ${buttonVariants({ variant: "outline" })}`}
      >
        Wróć na stronę główną
      </Link>
    </div>
  );
}
