/**
 * Placeholder pokazywany podczas dynamicznego ładowania kalkulatora
 * (`next/dynamic`). Stała wysokość ogranicza przesunięcia układu (CLS),
 * a `role="status"` informuje czytniki ekranu o trwającym ładowaniu.
 */
export function CalculatorLoading() {
  return (
    <div role="status" aria-live="polite" className="space-y-4">
      <span className="sr-only">Ładowanie kalkulatora…</span>
      <div className="h-16 animate-pulse rounded-md bg-muted/50" />
      <div className="h-10 animate-pulse rounded-md bg-muted/50" />
      <div className="h-10 animate-pulse rounded-md bg-muted/50" />
      <div className="h-10 w-40 animate-pulse rounded-md bg-muted/50" />
    </div>
  );
}
