import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import { BottomNav } from '@/components/layout/bottom-nav';
import { MobileHeader } from '@/components/layout/mobile-header';
import { Toaster } from 'sonner';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader user={user} />
      <main className="container max-w-lg mx-auto px-4 py-4">
        {children}
      </main>
      <BottomNav role={user.role} />
      <Toaster position="top-center" richColors closeButton />
    </div>
  );
}