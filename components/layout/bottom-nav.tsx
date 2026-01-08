'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  MoreHorizontal 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserRole } from '@/db/schema';

interface BottomNavProps {
  role: UserRole;
}

export function BottomNav({ role }: BottomNavProps) {
  const pathname = usePathname();

  const navItems = [
    { href:  '/', icon: Home, label: 'Home' },
    { href: '/stock', icon: Package, label: 'Stock' },
    { href: '/sales/new', icon: ShoppingCart, label: 'Sell', primary: true },
    { href:  '/reports', icon: TrendingUp, label: 'Reports' },
    { href: '/more', icon: MoreHorizontal, label: 'More' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border safe-area-pb">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center w-16 h-full',
                'transition-colors duration-200',
                item.primary && 'relative -top-3',
                isActive ?  'text-primary' : 'text-muted-foreground'
              )}
            >
              {item.primary ?  (
                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg">
                  <Icon className="w-6 h-6" />
                </div>
              ) : (
                <>
                  <Icon className="w-5 h-5" />
                  <span className="text-xs mt-1">{item.label}</span>
                </>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}