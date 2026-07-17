import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site-config";

/**
 * Domyślny obraz Open Graph / Twitter Card dla całego serwisu (wym. 10.5).
 * Generowany dynamicznie przez `next/og` — bez potrzeby dołączania pliku binarnego.
 * Strony z własnym `openGraph.images` (np. artykuł z hero) nadpisują ten domyślny.
 * Uwaga: tekst renderowany fontem musi być pozbawiony polskich znaków
 * diakrytycznych (domyślny font `next/og` ich nie gwarantuje).
 */
export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          backgroundColor: "#0F766E",
          padding: "80px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            width: "96px",
            height: "12px",
            backgroundColor: "#F59E0B",
            borderRadius: "9999px",
            marginBottom: "40px",
          }}
        />
        <div
          style={{
            fontSize: "96px",
            fontWeight: 700,
            color: "#ffffff",
            lineHeight: 1.1,
          }}
        >
          {siteConfig.name}
        </div>
        <div
          style={{
            marginTop: "24px",
            fontSize: "40px",
            color: "#E6FFFA",
            maxWidth: "960px",
            lineHeight: 1.3,
          }}
        >
          {siteConfig.tagline}
        </div>
      </div>
    ),
    { ...size },
  );
}
