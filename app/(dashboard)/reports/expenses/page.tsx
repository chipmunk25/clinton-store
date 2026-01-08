import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getCurrentUser } from '@/lib/auth/session';
import { getExpensesReport } from '@/lib/db/queries/reports';
import { formatCurrency, formatDate } from '@/lib/utils';

function ExpensesSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3]. map((i) => (
        <Card key={i} className="animate-pulse">
          <CardContent className="p-4">
            <div className="h-6 bg-muted rounded w-32 mb-2" />
            <div className="h-4 bg-muted rounded w-48" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

async function ExpensesReport() {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 1);

  const report = await getExpensesReport(startDate, endDate);

  return (
    <div className="space-y-4">
      {/* Total */}
      <Card>
        <CardContent className="p-4 text-center">
          <p className="text-sm text-muted-foreground mb-1">Total Expenses (30 days)</p>
          <p className="text-3xl font-bold text-red-600">
            {formatCurrency(report.totalExpenses)}
          </p>
        </CardContent>
      </Card>

      {/* By Category */}
      {report.expensesByCategory.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">By Category</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {report.expensesByCategory.map((cat) => (
              <div key={cat.category} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize">
                    {cat.category}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {cat.percentage.toFixed(1)}%
                  </span>
                </div>
                <span className="font-medium">{formatCurrency(cat.total)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recent Expenses */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Recent Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          {report.recentExpenses.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No expenses recorded
            </p>
          ) : (
            <div className="space-y-3">
              {report.recentExpenses.map((expense) => (
                <div
                  key={expense. id}
                  className="flex items-start justify-between py-2 border-b last:border-0"
                >
                  <div>
                    <p className="font-medium text-sm">{expense.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs capitalize">
                        {expense.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(expense.date)}
                      </span>
                    </div>
                  </div>
                  <span className="font-medium text-red-600">
                    {formatCurrency(expense.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default async function ExpensesReportPage() {
  const user = await getCurrentUser();
  const isAdmin = user?.role === 'admin';

  return (
    <div className="space-y-4 py-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/reports">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">Expenses</h1>
            <p className="text-sm text-muted-foreground">
              Operating costs breakdown
            </p>
          </div>
        </div>
        {isAdmin && (
          <Link href="/expenses/new">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </Link>
        )}
      </div>

      {/* Report */}
      <Suspense fallback={<ExpensesSkeleton />}>
        <ExpensesReport />
      </Suspense>
    </div>
  );
}