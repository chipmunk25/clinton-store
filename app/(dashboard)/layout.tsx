import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getSettings } from "@/lib/db/queries/settings";
import { BottomNav } from "@/components/layout/bottom-nav";
import { MobileHeader } from "@/components/layout/mobile-header";
import { CurrencyProvider } from "@/components/providers/currency-provider";
import { Toaster } from "sonner";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // Get settings for currency
  const settings = await getSettings();

  // Remove password hash before passing to client
  const { passwordHash, ...safeUser } = user;

  return (
    <CurrencyProvider currency={settings.storeCurrency}>
      <div className="min-h-screen bg-background">
        <MobileHeader user={safeUser} />
        <main className="container max-w-lg mx-auto px-4 pt-16 pb-24">
          {children}
        </main>
        <BottomNav role={safeUser.role} />
        <Toaster position="top-center" richColors closeButton />
      </div>
    </CurrencyProvider>
  );
}
