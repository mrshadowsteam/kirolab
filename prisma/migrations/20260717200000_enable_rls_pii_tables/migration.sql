-- Wlaczenie Row Level Security (RLS) na tabelach z danymi osobowymi i transakcyjnymi.
--
-- Kontekst: te tabele sa uzywane WYLACZNIE po stronie serwera (Next.js API routes)
-- przez Prisma, ktora laczy sie z baza jako rola postgres/superuser omijajaca RLS.
-- Zadna z nich nie jest potrzebna po stronie klienta.
--
-- Cel (defense-in-depth): schemat "public" jest wystawiony przez PostgREST
-- (Supabase REST API, /rest/v1). Aktualnie role anon/authenticated nie maja
-- GRANT-ow do tych tabel, ale to kruche zabezpieczenie. Wlaczenie RLS BEZ polityk
-- powoduje domyslna blokade dostepu dla rol anon/authenticated nawet gdyby ktos
-- w przyszlosci nadal im GRANT. Prisma (postgres/service_role) dziala bez zmian.
--
-- Swiadomie NIE uzywamy FORCE ROW LEVEL SECURITY ani nie dodajemy polityk:
-- dostep do tych danych ma byc mozliwy tylko sciezka serwerowa (Prisma).

ALTER TABLE "orders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "download_tokens" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "leads" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "newsletter_subscribers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "lead_magnet_tokens" ENABLE ROW LEVEL SECURITY;
