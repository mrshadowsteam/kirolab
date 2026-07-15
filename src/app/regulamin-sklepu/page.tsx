import type { Metadata } from "next";
import { LegalPageView } from "@/components/content/legal-page";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Regulamin sklepu",
  alternates: { canonical: "/regulamin-sklepu" },
};

export default function Page() {
  return (
    <LegalPageView slug="regulamin-sklepu" fallbackTitle="Regulamin sklepu" />
  );
}
