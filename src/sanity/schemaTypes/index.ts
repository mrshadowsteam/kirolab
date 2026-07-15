import type { SchemaTypeDefinition } from "sanity";

import { seo } from "./seo";
import { blockContent } from "./blockContent";
import { pillar } from "./pillar";
import { author } from "./author";
import { article } from "./article";
import { product } from "./product";
import { legalPage } from "./legalPage";
import { settings } from "./settings";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    // obiekty
    seo,
    blockContent,
    // dokumenty
    pillar,
    author,
    article,
    product,
    legalPage,
    settings,
  ],
};
