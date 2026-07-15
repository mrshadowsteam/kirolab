import { defineArrayMember, defineType } from "sanity";

/** Treść bogata (Portable Text) — używana w artykułach i stronach prawnych. */
export const blockContent = defineType({
  title: "Treść",
  name: "blockContent",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      styles: [
        { title: "Akapit", value: "normal" },
        { title: "Nagłówek H2", value: "h2" },
        { title: "Nagłówek H3", value: "h3" },
        { title: "Cytat", value: "blockquote" },
      ],
      lists: [
        { title: "Punktowana", value: "bullet" },
        { title: "Numerowana", value: "number" },
      ],
      marks: {
        decorators: [
          { title: "Pogrubienie", value: "strong" },
          { title: "Kursywa", value: "em" },
        ],
        annotations: [
          {
            title: "Link",
            name: "link",
            type: "object",
            fields: [
              {
                title: "URL",
                name: "href",
                type: "url",
                validation: (rule) =>
                  rule.uri({ allowRelative: true, scheme: ["http", "https", "mailto"] }),
              },
            ],
          },
        ],
      },
    }),
    defineArrayMember({
      type: "image",
      options: { hotspot: true },
      fields: [
        {
          name: "alt",
          type: "string",
          title: "Tekst alternatywny (dostępność)",
          validation: (rule) => rule.required(),
        },
      ],
    }),
  ],
});
