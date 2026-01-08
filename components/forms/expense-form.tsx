'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Save, Loader2, Receipt } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const EXPENSE_CATEGORIES = [
  { value: 'rent', label: 'Rent' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'salaries', label: 'Salaries' },
  { value:  'supplies', label: 'Supplies' },
  { value: 'transport', label: 'Transport' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'other', label: 'Other' },
];

const expenseSchema = z.object({
  category: z.enum([
    'rent',
    'utilities',
    'salaries',
    'supplies',
    'transport',
    'marketing',
    'maintenance',
    'other',
  ]),
  description: z.string().min(1, 'Description is required').max(500),
  amount: z.number().positive('Amount must be positive'),
  expenseDate: z.string().min(1, 'Date is required'),
  receiptReference: z.string().max(100).optional(),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

export function ExpenseForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      category: undefined,
      description: '',
      amount: 0,
      expenseDate: new Date().toISOString().split('T')[0],
      receiptReference: '',
    },
  });

  const onSubmit = async (data: ExpenseFormData) => {
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (! res.ok) {
        throw new Error(result.error || 'Failed to record expense');
      }

      toast.success('Expense recorded! ', {
        description: `${data.description} - $${data.amount.toFixed(2)}`,
      });

      router.push('/reports/expenses');
      router.refresh();
    } catch (error) {
      toast.error('Failed to record expense', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Card>
        <CardContent className="p-4 space-y-4">
          {/* Category */}
          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              onValueChange={(value) =>
                setValue('category', value as ExpenseFormData['category'])
              }
              disabled={isSubmitting}
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select category..." />
              </SelectTrigger>
              <SelectContent>
                {EXPENSE_CATEGORIES. map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-destructive">{errors.category.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="What was this expense for?"
              className="min-h-[80px]"
              disabled={isSubmitting}
              {... register('description')}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              inputMode="decimal"
              step="0.01"
              placeholder="0.00"
              className="h-12 text-lg"
              disabled={isSubmitting}
              {...register('amount', { valueAsNumber: true })}
            />
            {errors.amount && (
              <p className="text-sm text-destructive">{errors.amount.message}</p>
            )}
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="expenseDate">Date</Label>
            <Input
              id="expenseDate"
              type="date"
              className="h-12"
              disabled={isSubmitting}
              {... register('expenseDate')}
            />
            {errors.expenseDate && (
              <p className="text-sm text-destructive">{errors.expenseDate.message}</p>
            )}
          </div>

          {/* Receipt Reference */}
          <div className="space-y-2">
            <Label htmlFor="receiptReference">Receipt/Invoice # (optional)</Label>
            <Input
              id="receiptReference"
              placeholder="e.g., INV-001234"
              className="h-12"
              disabled={isSubmitting}
              {...register('receiptReference')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Button
        type="submit"
        size="lg"
        className="w-full h-14 text-lg"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Receipt className="mr-2 h-5 w-5" />
            Record Expense
          </>
        )}
      </Button>
    </form>
  );
}