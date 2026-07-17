-- Zgoda RODO dla zamówień: zapis czasu wyrażenia zgody (akceptacja regulaminu
-- sklepu + zrzeczenie prawa odstąpienia przy dostarczeniu treści cyfrowej).
-- Kolumna jest NULLABLE i dodawana przyrostowo — starsze zamówienia zachowują
-- NULL, nowe zamówienia zapisują znacznik czasu w /api/checkout.

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "consent_at" TIMESTAMP(3);
