import type { Metadata } from "next";
import { buttonVariants } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { hashToken } from "@/lib/fulfillment";
import { issueLeadMagnet } from "@/lib/lead-magnet";
import { upsertContact } from "@/lib/email/brevo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Potwierdzenie zapisu",
  robots: { index: false, follow: false },
};

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="container max-w-xl py-16">
      <h1 className="text-2xl md:text-3xl">Newsletter Smart Obywatel</h1>
      <div className="mt-6">{children}</div>
    </div>
  );
}

function newsletterListIds(): number[] | undefined {
  const listId = Number(process.env.BREVO_NEWSLETTER_LIST_ID);
  return Number.isFinite(listId) ? [listId] : undefined;
}

export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const token =
    typeof searchParams.token === "string" ? searchParams.token : undefined;
  const email =
    typeof searchParams.email === "string"
      ? searchParams.email.toLowerCase()
      : undefined;

  if (!token || !email) {
    return (
      <Shell>
        <p className="text-muted-foreground">Nieprawidłowy link potwierdzający.</p>
      </Shell>
    );
  }

  const subscriber = await prisma.newsletterSubscriber.findFirst({
    where: { email, confirmTokenHash: hashToken(token) },
  });

  if (!subscriber) {
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    });
    if (existing?.status === "confirmed") {
      return (
        <Shell>
          <p className="text-muted-foreground">
            Twój zapis jest już potwierdzony. Dziękujemy!
          </p>
        </Shell>
      );
    }
    return (
      <Shell>
        <p className="text-muted-foreground">
          Link jest nieprawidłowy lub wygasł. Zapisz się ponownie, aby otrzymać
          nowy e-mail potwierdzający.
        </p>
      </Shell>
    );
  }

  await prisma.newsletterSubscriber.update({
    where: { id: subscriber.id },
    data: {
      status: "confirmed",
      confirmedAt: new Date(),
      confirmTokenHash: null,
    },
  });

  try {
    await upsertContact({ email, listIds: newsletterListIds() });
  } catch (error) {
    console.error("Błąd synchronizacji kontaktu z Brevo:", error);
  }

  const magnetToken = await issueLeadMagnet(email);

  return (
    <Shell>
      <p className="text-lg">Dziękujemy — Twój zapis został potwierdzony! ✅</p>
      <p className="mt-2 text-muted-foreground">
        Wysłaliśmy darmowy wzór dokumentu na Twój adres e-mail. Możesz też pobrać
        go od razu poniżej.
      </p>
      {magnetToken ? (
        <a
          href={`/api/pobierz-wzor/${magnetToken}`}
          className={`mt-6 ${buttonVariants({ variant: "primary", size: "lg" })}`}
        >
          Pobierz darmowy wzór
        </a>
      ) : null}
    </Shell>
  );
}
