import type { Metadata } from "next";
import { buttonVariants } from "@/components/ui/button";
import { ResendDownloadButton } from "@/components/shop/resend-download-button";
import { prisma } from "@/lib/prisma";
import { hashToken } from "@/lib/fulfillment";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pobieranie pliku",
  robots: { index: false, follow: false },
};

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="container max-w-xl py-16">
      <h1 className="text-2xl md:text-3xl">Pobieranie pliku</h1>
      <div className="mt-6">{children}</div>
    </div>
  );
}

export default async function DownloadStatusPage({
  params,
}: {
  params: { token: string };
}) {
  const record = await prisma.downloadToken.findUnique({
    where: { tokenHash: hashToken(params.token) },
    include: { order: true },
  });

  if (!record) {
    return (
      <Shell>
        <p className="text-muted-foreground">
          Ten link jest nieprawidłowy. Sprawdź, czy skopiowałeś go w całości.
        </p>
      </Shell>
    );
  }

  const expired = record.expiresAt.getTime() < Date.now();
  const limitReached = record.downloadCount >= record.maxDownloads;

  if (expired || limitReached) {
    return (
      <Shell>
        <p className="text-muted-foreground">
          {expired
            ? "Ten link wygasł (był ważny 72 godziny)."
            : "Wykorzystano limit pobrań dla tego linku."}{" "}
          Możesz wygenerować nowy link — wyślemy go na Twój adres e-mail.
        </p>
        <div className="mt-4">
          <ResendDownloadButton token={params.token} />
        </div>
      </Shell>
    );
  }

  const remaining = record.maxDownloads - record.downloadCount;

  return (
    <Shell>
      <p className="text-muted-foreground">
        Twój plik „{record.order.productTitle}” jest gotowy do pobrania.
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        Link ważny do {formatDate(record.expiresAt.toISOString())}. Pozostałe
        pobrania: {remaining}.
      </p>
      <a
        href={`/api/pobierz/${params.token}`}
        className={`mt-6 ${buttonVariants({ variant: "primary", size: "lg" })}`}
      >
        Pobierz dokument
      </a>
    </Shell>
  );
}
