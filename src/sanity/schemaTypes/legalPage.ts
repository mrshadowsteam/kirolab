import { defineField, defineType } from "sanity";

/** Strona prawna (polityka prywatności, regulaminy) — treść dostarcza prawnik. */
export const legalPage = defineType({
  name: "legalPage",
  title: "Strona prawna",
  type: "document",
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
      name: "body",
      title: "Treść",
      type: "blockContent",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "updatedAt",
      title: "Data aktualizacji",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
  ],
});
