import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCurrentUser } from '@/lib/auth/session';
import { UserForm } from '@/components/forms/user-form';

export default async function NewUserPage() {
  const user = await getCurrentUser();

  if (user?.role !== 'admin') {
    redirect('/');
  }

  return (
    <div className="space-y-4 py-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/users">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold">Add User</h1>
          <p className="text-sm text-muted-foreground">
            Create a new staff account
          </p>
        </div>
      </div>

      {/* User Form */}
      <UserForm />
    </div>
  );
}