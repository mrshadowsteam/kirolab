"use client";

import { type FormEvent, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { isValidNip } from "@/lib/nip";

const inputClass =
  "mt-1 w-full rounded-md border border-border bg-white px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary aria-[invalid=true]:border-destructive";

export function CheckoutForm({ productSlug }: { productSlug: string }) {
  const [email, setEmail] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [wantsInvoice, setWantsInvoice] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [companyNip, setCompanyNip] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");
  const [nipInvalid, setNipInvalid] = useState(false);

  const consentRef = useRef<HTMLInputElement>(null);
  const companyNameRef = useRef<HTMLInputElement>(null);
  const companyNipRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setNipInvalid(false);

    if (wantsInvoice && !companyName.trim()) {
      setError("Podaj nazwę firmy do faktury.");
      companyNameRef.current?.focus();
      return;
    }
    if (wantsInvoice && !isValidNip(companyNip)) {
      setNipInvalid(true);
      setError("Podaj poprawny NIP (10 cyfr z prawidłową sumą kontrolną).");
      companyNipRef.current?.focus();
      return;
    }
    if (!consent) {
      setError("Zaakceptuj regulamin sklepu, aby kontynuować.");
      consentRef.current?.focus();
      return;
    }

    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          productSlug,
          email,
          buyerName,
          wantsCompanyInvoice: wantsInvoice,
          companyName: wantsInvoice ? companyName : undefined,
          companyNip: wantsInvoice ? companyNip : undefined,
          consent,
        }),
      });
      const data = (await res.json()) as {
        redirectUrl?: string;
        error?: string;
      };
      if (!res.ok || !data.redirectUrl) {
        throw new Error(data.error ?? "Nie udało się rozpocząć płatności.");
      }
      window.location.href = data.redirectUrl;
    } catch (err) {
      setStatus("error");
      setError(
        err instanceof Error
          ? err.message
          : "Nie udało się rozpocząć płatności.",
      );
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <label htmlFor="email" className="text-sm font-medium">
          Adres e-mail (na niego wyślemy plik)
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="buyerName" className="text-sm font-medium">
          Imię i nazwisko (opcjonalnie)
        </label>
        <input
          id="buyerName"
          type="text"
          autoComplete="name"
          value={buyerName}
          onChange={(e) => setBuyerName(e.target.value)}
          className={inputClass}
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={wantsInvoice}
          onChange={(e) => setWantsInvoice(e.target.checked)}
          aria-expanded={wantsInvoice}
          aria-controls="company-invoice-fields"
        />
        Chcę fakturę na firmę
      </label>

      {wantsInvoice ? (
        <fieldset
          id="company-invoice-fields"
          className="space-y-4 rounded-md border border-border bg-muted/20 p-4"
        >
          <legend className="px-1 text-sm font-medium">Dane do faktury</legend>
          <div>
            <label htmlFor="companyName" className="text-sm font-medium">
              Nazwa firmy
            </label>
            <input
              id="companyName"
              ref={companyNameRef}
              type="text"
              required
              autoComplete="organization"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="companyNip" className="text-sm font-medium">
              NIP
            </label>
            <input
              id="companyNip"
              ref={companyNipRef}
              inputMode="numeric"
              required
              value={companyNip}
              onChange={(e) => {
                setCompanyNip(e.target.value);
                if (nipInvalid) setNipInvalid(false);
              }}
              className={inputClass}
              placeholder="10 cyfr"
              aria-invalid={nipInvalid}
              aria-describedby="companyNip-hint"
            />
            <p id="companyNip-hint" className="mt-1 text-xs text-muted-foreground">
              10 cyfr, np. 123-456-32-18. Sprawdzamy poprawność numeru.
            </p>
          </div>
        </fieldset>
      ) : null}

      <label className="flex items-start gap-2 text-xs text-muted-foreground">
        <input
          ref={consentRef}
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5"
        />
        <span>
          Akceptuję{" "}
          <Link href="/regulamin-sklepu" className="text-amber-strong underline">
            regulamin sklepu
          </Link>{" "}
          i wyrażam zgodę na dostarczenie treści cyfrowej przed upływem terminu
          odstąpienia od umowy.
        </span>
      </label>

      <Button type="submit" variant="primary" size="lg" disabled={status === "loading"}>
        {status === "loading" ? "Przekierowanie do płatności…" : "Przejdź do płatności"}
      </Button>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </form>
  );
}
