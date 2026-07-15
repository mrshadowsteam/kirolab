"use client";

import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { inputClass } from "./styles";

type Status = "idle" | "loading" | "success" | "error";

/**
 * „Wyślij wynik na e-mail" — zbiera e-mail + zgodę RODO i inicjuje zapis do
 * newslettera (double opt-in). Wynik trafia do maila potwierdzającego.
 */
export function ResultEmailCapture({
  resultSummary,
  source,
}: {
  resultSummary: string;
  source: string;
}) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!consent) {
      setStatus("error");
      setMessage("Zaznacz zgodę, aby wysłać wynik na e-mail.");
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, consent, source, resultSummary }),
      });
      if (!res.ok) throw new Error("request failed");
      setStatus("success");
      setMessage(
        "Sprawdź skrzynkę i potwierdź zapis — wynik znajdziesz w wiadomości.",
      );
    } catch {
      setStatus("error");
      setMessage("Nie udało się wysłać. Spróbuj ponownie za chwilę.");
    }
  }

  if (status === "success") {
    return (
      <p
        role="status"
        className="rounded-md border border-success/40 bg-success/10 p-4 text-sm"
      >
        {message}
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-border bg-primary/5 p-5"
    >
      <p className="text-sm font-medium">Wyślij wynik na e-mail</p>
      <div className="mt-3">
        <label htmlFor="result-email" className="text-sm">
          Adres e-mail
        </label>
        <input
          id="result-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
      </div>
      <label className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5"
        />
        <span>
          Wyrażam zgodę na przetwarzanie mojego adresu e-mail w celu wysyłki
          wyniku oraz newslettera Smart Obywatel (zgodnie z polityką
          prywatności). Zgodę mogę wycofać w każdej chwili.
        </span>
      </label>
      <Button
        type="submit"
        size="sm"
        variant="teal"
        className="mt-4"
        disabled={status === "loading"}
      >
        {status === "loading" ? "Wysyłanie…" : "Wyślij wynik na e-mail"}
      </Button>
      {status === "error" ? (
        <p role="alert" className="mt-2 text-xs text-destructive">
          {message}
        </p>
      ) : null}
    </form>
  );
}
