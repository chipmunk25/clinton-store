import { Card, CardContent } from '@/components/ui/card';

export function ProductsListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5]. map((i) => (
        <Card key={i} className="animate-pulse">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="h-4 bg-muted rounded w-20 mb-2" />
                <div className="h-5 bg-muted rounded w-40 mb-2" />
                <div className="h-4 bg-muted rounded w-32" />
              </div>
              <div className="h-6 bg-muted rounded w-16" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}