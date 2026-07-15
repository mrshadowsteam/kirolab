import { defineField, defineType } from "sanity";
import { DocumentTextIcon } from "@sanity/icons";

/** Artykuł/case study rozwijający temat z wideo. */
export const article = defineType({
  name: "article",
  title: "Artykuł",
  type: "document",
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: "title",
      title: "Tytuł",
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
      name: "pillar",
      title: "Filar (kategoria)",
      type: "reference",
      to: [{ type: "pillar" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "excerpt",
      title: "Zajawka",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required().max(240),
    }),
    defineField({
      name: "heroImage",
      title: "Obraz główny",
      type: "image",
      options: { hotspot: true },
      fields: [
        {
          name: "alt",
          type: "string",
          title: "Tekst alternatywny",
          validation: (rule) => rule.required(),
        },
      ],
    }),
    defineField({
      name: "body",
      title: "Treść",
      type: "blockContent",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "relatedProducts",
      title: "Powiązane produkty (wzory)",
      type: "array",
      of: [{ type: "reference", to: [{ type: "product" }] }],
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
      name: "author",
      title: "Autor",
      type: "reference",
      to: [{ type: "author" }],
    }),
    defineField({
      name: "publishedAt",
      title: "Data publikacji",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "updatedAt",
      title: "Data aktualizacji",
      type: "datetime",
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "pillar.title", media: "heroImage" },
  },
});
