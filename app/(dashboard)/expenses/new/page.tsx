import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCurrentUser } from '@/lib/auth/session';
import { ExpenseForm } from '@/components/forms/expense-form';

export default async function NewExpensePage() {
  const user = await getCurrentUser();

  // Only admins can add expenses
  if (user?.role !== 'admin') {
    redirect('/');
  }

  return (
    <div className="space-y-4 py-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/reports/expenses">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold">Add Expense</h1>
          <p className="text-sm text-muted-foreground">
            Record an operating expense
          </p>
        </div>
      </div>

      {/* Expense Form */}
      <ExpenseForm />
    </div>
  );
}