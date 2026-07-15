"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function ResendDownloadButton({ token }: { token: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );

  async function handleResend() {
    setStatus("loading");
    try {
      const res = await fetch("/api/pobierz/wyslij-ponownie", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (!res.ok) throw new Error("request failed");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <p role="status" className="text-sm text-success">
        Wysłaliśmy nowy link na Twój adres e-mail. Sprawdź skrzynkę.
      </p>
    );
  }

  return (
    <div>
      <Button
        type="button"
        variant="teal"
        onClick={handleResend}
        disabled={status === "loading"}
      >
        {status === "loading" ? "Wysyłanie…" : "Wyślij nowy link na e-mail"}
      </Button>
      {status === "error" ? (
        <p role="alert" className="mt-2 text-sm text-destructive">
          Nie udało się wysłać. Spróbuj ponownie za chwilę.
        </p>
      ) : null}
    </div>
  );
}
