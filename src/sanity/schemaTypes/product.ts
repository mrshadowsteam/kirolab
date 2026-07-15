import { defineField, defineType } from "sanity";
import { DocumentIcon } from "@sanity/icons";

/**
 * Produkt cyfrowy (wzór pisma) w sklepie "Zbrojownia Konsumenta".
 * UWAGA: sam plik do pobrania NIE jest przechowywany w Sanity — jest w prywatnym
 * buckecie Supabase Storage, tu trzymamy tylko `storageKey` (klucz pliku).
 */
export const product = defineType({
  name: "product",
  title: "Produkt (wzór)",
  type: "document",
  icon: DocumentIcon,
  fields: [
    defineField({
      name: "title",
      title: "Nazwa",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug (URL)",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "priceGrosze",
      title: "Cena (w groszach, PLN)",
      type: "number",
      description: "np. 4900 = 49,00 zł",
      validation: (rule) => rule.required().integer().positive(),
    }),
    defineField({
      name: "shortDescription",
      title: "Krótki opis: co zawiera i kiedy użyć",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "previewContent",
      title: "Podgląd fragmentu (przed zakupem)",
      type: "blockContent",
      description: "Fragment treści dokumentu widoczny na stronie produktu.",
    }),
    defineField({
      name: "storageKey",
      title: "Klucz pliku w Supabase Storage",
      type: "string",
      description: "Ścieżka/nazwa pliku w prywatnym buckecie (nie publiczny URL).",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "fileFormat",
      title: "Format pliku",
      type: "string",
      options: {
        list: [
          { title: "PDF", value: "pdf" },
          { title: "DOCX", value: "docx" },
          { title: "PDF + DOCX", value: "pdf-docx" },
        ],
      },
    }),
    defineField({
      name: "category",
      title: "Filar (kategoria)",
      type: "reference",
      to: [{ type: "pillar" }],
    }),
    defineField({
      name: "relatedCalculator",
      title: "Powiązany kalkulator",
      type: "string",
      options: {
        list: [
          { title: "Brak", value: "" },
          { title: "Odprawa", value: "odprawa" },
          { title: "Ekwiwalent za urlop", value: "ekwiwalent-urlop" },
          { title: "Szkoda całkowita", value: "szkoda-calkowita" },
        ],
        layout: "radio",
      },
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "priceGrosze" },
    prepare({ title, subtitle }) {
      const price =
        typeof subtitle === "number"
          ? `${(subtitle / 100).toFixed(2)} zł`
          : "";
      return { title, subtitle: price };
    },
  },
});
