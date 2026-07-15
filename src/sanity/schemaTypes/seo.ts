import { defineField, defineType } from "sanity";

/** Wspólny obiekt SEO — meta title/description + obraz OG. */
export const seo = defineType({
  name: "seo",
  title: "SEO",
  type: "object",
  options: { collapsible: true, collapsed: true },
  fields: [
    defineField({
      name: "metaTitle",
      title: "Meta title",
      type: "string",
      validation: (rule) => rule.max(60).warning("Zalecane maks. ~60 znaków."),
    }),
    defineField({
      name: "metaDescription",
      title: "Meta description",
      type: "text",
      rows: 2,
      validation: (rule) =>
        rule.max(160).warning("Zalecane maks. ~160 znaków."),
    }),
    defineField({
      name: "ogImage",
      title: "Obraz Open Graph",
      type: "image",
      options: { hotspot: true },
    }),
  ],
});
