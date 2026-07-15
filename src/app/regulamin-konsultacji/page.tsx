import type { Metadata } from "next";
import { LegalPageView } from "@/components/content/legal-page";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Regulamin konsultacji",
  alternates: { canonical: "/regulamin-konsultacji" },
};

export default function Page() {
  return (
    <LegalPageView
      slug="regulamin-konsultacji"
      fallbackTitle="Regulamin konsultacji"
    />
  );
}
