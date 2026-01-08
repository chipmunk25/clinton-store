import { toast } from 'sonner';

// Success with action
export function toastSaleSuccess(productName: string, quantity: number, total: number) {
  toast.success('Sale recorded! ', {
    description: `${productName} × ${quantity} = $${total.toFixed(2)}`,
    action: {
      label: 'View Sales',
      onClick: () => window.location.href = '/sales',
    },
  });
}

// Warning for low stock
export function toastLowStock(productName: string, remaining: number) {
  toast.warning('Low stock warning', {
    description: `${productName} only has ${remaining} units left`,
    duration: 5000,
  });
}

// Error with retry
export function toastError(message: string, retryFn?:  () => void) {
  toast.error('Something went wrong', {
    description:  message,
    action: retryFn
      ? {
          label: 'Retry',
          onClick:  retryFn,
        }
      : undefined,
  });
}

// Promise-based for async operations
export async function toastPromise<T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string;
    error:  string;
  }
) {
  return toast. promise(promise, messages);
}

// Usage example: 
// toastPromise(
//   createSale(data),
//   {
//     loading: 'Recording sale...',
//     success: 'Sale recorded successfully!',
//     error: 'Failed to record sale',
//   }
// );