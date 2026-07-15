"use client";

import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";

const inputClass =
  "mt-1 w-full rounded-md border border-border bg-white px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

/**
 * Funkcjonalny formularz zapisu do newslettera (double opt-in).
 * Używany w CTA i w pop-upie. `onDone` wywoływane po sukcesie (np. cooldown pop-upu).
 */
export function NewsletterSignup({
  source = "newsletter",
  onDone,
}: {
  source?: string;
  onDone?: () => void;
}) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!consent) {
      setStatus("error");
      setMessage("Zaznacz zgodę, aby się zapisać.");
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, consent, source }),
      });
      if (!res.ok) throw new Error("request failed");
      setStatus("success");
      setMessage(
        "Sprawdź skrzynkę i potwierdź zapis — wtedy wyślemy darmowy wzór dokumentu.",
      );
      onDone?.();
    } catch {
      setStatus("error");
      setMessage("Nie udało się zapisać. Spróbuj ponownie za chwilę.");
    }
  }

  if (status === "success") {
    return (
      <p role="status" className="text-sm text-success">
        {message}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3" noValidate>
      <div>
        <label htmlFor={`nl-email-${source}`} className="sr-only">
          Adres e-mail
        </label>
        <input
          id={`nl-email-${source}`}
          type="email"
          required
          autoComplete="email"
          placeholder="Twój adres e-mail"
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
          Wyrażam zgodę na otrzymywanie newslettera i przetwarzanie mojego adresu
          e-mail zgodnie z polityką prywatności. Zgodę mogę wycofać w każdej chwili.
        </span>
      </label>
      <Button
        type="submit"
        variant="primary"
        disabled={status === "loading"}
      >
        {status === "loading" ? "Zapisywanie…" : "Zapisz się i odbierz wzór"}
      </Button>
      {status === "error" ? (
        <p role="alert" className="text-xs text-destructive">
          {message}
        </p>
      ) : null}
    </form>
  );
}
