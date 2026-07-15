import { NextStudio } from "next-sanity/studio";
import config from "../../../../sanity.config";

/**
 * Osadzone Sanity Studio pod trasą /studio.
 * Renderowane po stronie klienta — nie wchodzi w statyczny build treści.
 */
export const dynamic = "force-static";

export { metadata, viewport } from "next-sanity/studio";

export default function StudioPage() {
  return <NextStudio config={config} />;
}
