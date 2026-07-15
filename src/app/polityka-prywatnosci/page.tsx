import type { Metadata } from "next";
import { LegalPageView } from "@/components/content/legal-page";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Polityka prywatności",
  alternates: { canonical: "/polityka-prywatnosci" },
};

export default function Page() {
  return (
    <LegalPageView
      slug="polityka-prywatnosci"
      fallbackTitle="Polityka prywatności"
    />
  );
}
