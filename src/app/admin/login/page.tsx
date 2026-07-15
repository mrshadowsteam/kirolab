import type { Metadata } from "next";
import { AdminLoginForm } from "@/components/admin/admin-login-form";

export const metadata: Metadata = {
  title: "Logowanie",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="container max-w-sm py-16">
      <h1 className="text-2xl">Panel — logowanie</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Dostęp tylko dla właściciela serwisu.
      </p>
      <div className="mt-6">
        <AdminLoginForm />
      </div>
    </div>
  );
}
