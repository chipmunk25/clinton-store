import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCurrentUser } from '@/lib/auth/session';
import { getUserById } from '@/lib/db/queries/users';
import { UserForm } from '@/components/forms/user-form';
import { DeleteUserButton } from '@/components/admin/delete-user-button';

interface EditUserPageProps {
  params:  Promise<{ id: string }>;
}

export default async function EditUserPage({ params }: EditUserPageProps) {
  const { id } = await params;
  const currentUser = await getCurrentUser();

  if (currentUser?.role !== 'admin') {
    redirect('/');
  }

  const user = await getUserById(id);

  if (!user) {
    notFound();
  }

  const initialData = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    isActive: user.isActive,
  };

  const isCurrentUser = currentUser. id === user.id;

  return (
    <div className="space-y-4 py-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/users">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">Edit User</h1>
            <p className="text-sm text-muted-foreground">
              {user.email}
            </p>
          </div>
        </div>
        {! isCurrentUser && (
          <DeleteUserButton userId={user.id} userName={user.name} />
        )}
      </div>

      {/* User Form */}
      <UserForm initialData={initialData} />

      {isCurrentUser && (
        <p className="text-sm text-muted-foreground text-center">
          You cannot delete your own account
        </p>
      )}
    </div>
  );
}