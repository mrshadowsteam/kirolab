import type { StructureResolver } from "sanity/structure";

/**
 * Struktura Studio. `settings` jest singletonem (jeden dokument, bez listy).
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Treść")
    .items([
      S.listItem()
        .title("Ustawienia")
        .id("settings")
        .child(S.document().schemaType("settings").documentId("settings")),
      S.divider(),
      S.documentTypeListItem("article").title("Artykuły"),
      S.documentTypeListItem("product").title("Produkty (wzory)"),
      S.documentTypeListItem("pillar").title("Filary"),
      S.documentTypeListItem("author").title("Autorzy"),
      S.documentTypeListItem("legalPage").title("Strony prawne"),
    ]);
