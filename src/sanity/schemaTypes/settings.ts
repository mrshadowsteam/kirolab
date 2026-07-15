import { defineField, defineType } from "sanity";
import { CogIcon } from "@sanity/icons";

/**
 * Ustawienia globalne (singleton) — edytowalne przez właściciela BEZ zmian w kodzie.
 * Zawiera parametry "prawne" kalkulatorów oraz konfigurację leadów/newslettera.
 */
export const settings = defineType({
  name: "settings",
  title: "Ustawienia",
  type: "document",
  icon: CogIcon,
  fields: [
    defineField({
      name: "equivalentCoefficient",
      title: "Współczynnik ekwiwalentu za urlop",
      type: "number",
      description:
        "Aktualny na dany rok współczynnik do wyliczenia ekwiwalentu (np. 21.14).",
      validation: (rule) => rule.required().positive(),
    }),
    defineField({
      name: "minimumWageGrosze",
      title: "Minimalne wynagrodzenie (w groszach)",
      type: "number",
      description:
        "Używane do limitu 15× w kalkulatorze odprawy. np. 466600 = 4666,00 zł.",
      validation: (rule) => rule.required().integer().positive(),
    }),
    defineField({
      name: "defaultPartnerCode",
      title: "Domyślny kod partnera (leady)",
      type: "string",
      description:
        "Przypisywany, gdy w adresie URL brak kodu partnera. Zapewnia, że każdy lead ma źródło.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "newsletterPopupCooldownDays",
      title: "Cooldown pop-upu newslettera (dni)",
      type: "number",
      description: "Ile dni nie pokazywać ponownie pop-upu po zamknięciu/zapisie.",
      initialValue: 14,
      validation: (rule) => rule.required().integer().min(0),
    }),
    defineField({
      name: "consultationDescription",
      title: "Konsultacje — opis oferty",
      type: "blockContent",
    }),
    defineField({
      name: "consultationPriceGrosze",
      title: "Konsultacje — cena (w groszach)",
      type: "number",
    }),
    defineField({
      name: "calcomLink",
      title: "Link Cal.com do rezerwacji",
      type: "url",
    }),
  ],
  preview: {
    prepare: () => ({ title: "Ustawienia globalne" }),
  },
});
