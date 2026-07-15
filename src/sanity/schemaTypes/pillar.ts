import { defineField, defineType } from "sanity";

/** Filar tematyczny: Kariera / Prawo Pracy / Prawa Konsumenta. */
export const pillar = defineType({
  name: "pillar",
  title: "Filar",
  type: "document",
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
      name: "description",
      title: "Opis",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "color",
      title: "Kolor (hex) do odznak/kategorii",
      type: "string",
      description: "np. #0F766E",
    }),
  ],
});
