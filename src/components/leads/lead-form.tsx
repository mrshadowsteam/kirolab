"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

const inputClass =
  "mt-1 w-full rounded-md border border-border bg-white px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

const CASE_TYPES = [
  "Spór z pracodawcą",
  "Zaniżone odszkodowanie / szkoda całkowita",
  "Reklamacja / prawa konsumenta",
  "Inne",
];

interface Tracking {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  partnerCode?: string;
}

/** Odczyt UTM + kodu partnera z adresu URL (bez useSearchParams — bez Suspense). */
function readTracking(): Tracking {
  if (typeof window === "undefined") return {};
  const p = new URLSearchParams(window.location.search);
  return {
    utmSource: p.get("utm_source") ?? undefined,
    utmMedium: p.get("utm_medium") ?? undefined,
    utmCampaign: p.get("utm_campaign") ?? undefined,
    utmContent: p.get("utm_content") ?? undefined,
    utmTerm: p.get("utm_term") ?? undefined,
    partnerCode: p.get("partner") ?? p.get("p") ?? undefined,
  };
}

export function LeadForm() {
  const [caseType, setCaseType] = useState(CASE_TYPES[0]);
  const [description, setDescription] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [tracking, setTracking] = useState<Tracking>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [error, setError] = useState("");
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTracking(readTracking());
  }, []);

  // Po wysłaniu przenosimy focus na potwierdzenie, aby czytnik ekranu je odczytał.
  useEffect(() => {
    if (status === "success") successRef.current?.focus();
  }, [status]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!consent) {
      setError("Zaznacz zgodę na przekazanie danych partnerowi.");
      return;
    }
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          caseType,
          description,
          name,
          email,
          phone,
          consent,
          ...tracking,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error ?? "Nie udało się wysłać zgłoszenia.");
      }
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Coś poszło nie tak.");
    }
  }

  if (status === "success") {
    return (
      <div
        ref={successRef}
        role="status"
        tabIndex={-1}
        className="rounded-lg border border-success/40 bg-success/10 p-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <p className="font-medium">Dziękujemy! Zgłoszenie zostało wysłane.</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Przekazaliśmy Twoją sprawę partnerowi. Skontaktuje się z Tobą, aby
          omówić szczegóły i możliwości działania.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <label htmlFor="caseType" className="text-sm font-medium">
          Rodzaj sprawy
        </label>
        <select
          id="caseType"
          value={caseType}
          onChange={(e) => setCaseType(e.target.value)}
          className={inputClass}
        >
          {CASE_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="description" className="text-sm font-medium">
          Krótki opis sprawy
        </label>
        <textarea
          id="description"
          required
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={inputClass}
          placeholder="Opisz w kilku zdaniach, czego dotyczy sprawa."
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="text-sm font-medium">
            Imię
          </label>
          <input
            id="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="phone" className="text-sm font-medium">
            Telefon (opcjonalnie)
          </label>
          <input
            id="phone"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>
      <div>
        <label htmlFor="email" className="text-sm font-medium">
          Adres e-mail
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
      <label className="flex items-start gap-2 text-xs text-muted-foreground">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5"
        />
        <span>
          Wyrażam zgodę na przekazanie moich danych partnerowi (kancelarii /
          firmie odszkodowawczej) w celu kontaktu w mojej sprawie, zgodnie z
          polityką prywatności.
        </span>
      </label>
      <Button type="submit" variant="primary" size="lg" disabled={status === "loading"}>
        {status === "loading" ? "Wysyłanie…" : "Wyślij zgłoszenie"}
      </Button>
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </form>
  );
}
