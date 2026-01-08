import Link from 'next/link';
import { 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Users, 
  Settings, 
  MapPin,
  Receipt,
  FileText,
  Tag,
  History
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getCurrentUser } from '@/lib/auth/session';

export default async function MorePage() {
  const user = await getCurrentUser();
  const isAdmin = user?.role === 'admin';

  const menuItems = [
    {
      title: 'Inventory',
      items: [
        { href: '/products', icon: Package, label: 'Products', description: 'View all products' },
        { href: '/stock', icon: Package, label: 'Stock Overview', description: 'Stock levels & alerts' },
        { href: '/enquiry', icon: FileText, label:  'Product Enquiry', description: 'Quick product lookup' },
      ],
    },
    {
      title: 'Transactions',
      items: [
        { href: '/sales', icon:  ShoppingCart, label: 'Sales History', description: 'View past sales' },
        { href:  '/purchases', icon: History, label: 'Purchase History', description: 'Stock-in records' },
      ],
    },
    {
      title: 'Reports',
      items: [
        { href: '/reports/profit-loss', icon: TrendingUp, label: 'Profit & Loss', description: 'Financial summary' },
        { href: '/reports/expenses', icon: Receipt, label: 'Expenses', description: 'Operating costs' },
      ],
    },
  ];

  const adminItems = {
    title: 'Admin',
    items: [
      { href: '/admin/users', icon: Users, label: 'User Management', description: 'Manage staff accounts' },
      { href: '/admin/categories', icon: Tag, label: 'Categories', description: 'Product categories' },
      { href:  '/admin/locations', icon: MapPin, label:  'Locations', description: 'Shelves & zones' },
      { href: '/admin/settings', icon: Settings, label: 'Settings', description: 'App configuration' },
    ],
  };

  if (isAdmin) {
    menuItems.push(adminItems);
  }

  return (
    <div className="space-y-6 py-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">More</h1>
        <p className="text-sm text-muted-foreground">
          All features & settings
        </p>
      </div>

      {/* Menu Sections */}
      {menuItems.map((section) => (
        <div key={section.title} className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground px-1">
            {section.title}
            {section.title === 'Admin' && (
              <Badge variant="secondary" className="ml-2 text-xs">
                Admin Only
              </Badge>
            )}
          </h2>
          <div className="space-y-2">
            {section.items.map((item) => (
              <Link key={item.href} href={item.href}>
                <Card className="hover:bg-muted/50 transition-colors">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="p-2 bg-muted rounded-lg">
                      <item.icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.label}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      ))}

      {/* User Info */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">Logged in as</p>
          <p className="font-semibold">{user?.name}</p>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
          <Badge variant="outline" className="mt-2 capitalize">
            {user?.role}
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
}