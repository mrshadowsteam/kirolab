import { RichText } from "./portable-text";
import { formatDate } from "@/lib/utils";
import { getLegalPage } from "@/lib/content";

/** Renderuje stronę prawną z CMS (z fallbackiem, gdy treść jeszcze nieopublikowana). */
export async function LegalPageView({
  slug,
  fallbackTitle,
}: {
  slug: string;
  fallbackTitle: string;
}) {
  const page = await getLegalPage(slug);

  return (
    <div className="container max-w-3xl py-12">
      <h1 className="text-3xl md:text-4xl">{page?.title ?? fallbackTitle}</h1>
      {page?.updatedAt ? (
        <p className="mt-2 text-sm text-muted-foreground">
          Ostatnia aktualizacja: {formatDate(page.updatedAt)}
        </p>
      ) : null}
      <div className="mt-6">
        {page ? (
          <RichText value={page.body} />
        ) : (
          <p className="text-muted-foreground">
            Treść tej strony zostanie wkrótce opublikowana.
          </p>
        )}
      </div>
    </div>
  );
}
