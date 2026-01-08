import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, User, Shield, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getCurrentUser } from '@/lib/auth/session';
import { getAllUsers } from '@/lib/db/queries/users';
import { formatDate } from '@/lib/utils';

export default async function UsersPage() {
  const currentUser = await getCurrentUser();

  // Only admins can access
  if (currentUser?.role !== 'admin') {
    redirect('/');
  }

  const users = await getAllUsers();

  return (
    <div className="space-y-4 py-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/more">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">User Management</h1>
            <p className="text-sm text-muted-foreground">
              Manage staff accounts
            </p>
          </div>
        </div>
        <Link href="/admin/users/new">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add User
          </Button>
        </Link>
      </div>

      {/* Users List */}
      <div className="space-y-3">
        {users.map((user) => (
          <Link key={user.id} href={`/admin/users/${user.id}`}>
            <Card className="hover:bg-muted/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-muted rounded-full">
                    {user.role === 'admin' ?  (
                      <ShieldCheck className="h-5 w-5 text-primary" />
                    ) : (
                      <User className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold truncate">{user.name}</p>
                      {user.id === currentUser?.id && (
                        <Badge variant="outline" className="text-xs">You</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant={user.role === 'admin' ? 'default' : 'secondary'}
                      className="capitalize"
                    >
                      {user.role}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {user.isActive ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}