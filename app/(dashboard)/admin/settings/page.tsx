import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Store, Bell, Palette, Database, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getCurrentUser } from '@/lib/auth/session';
import { ThemeToggle } from '@/components/settings/theme-toggle';
import { NotificationSettings } from '@/components/settings/notification-settings';
import { StoreSettings } from '@/components/settings/store-settings';
import { getSettings } from '@/lib/db/queries/settings';

export default async function SettingsPage() {
  const user = await getCurrentUser();

  if (user?.role !== 'admin') {
    redirect('/');
  }

  const settings = await getSettings();

  return (
    <div className="space-y-4 py-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/more">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground">
            App configuration
          </p>
        </div>
      </div>

      {/* Appearance */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Appearance
          </CardTitle>
          <CardDescription>
            Customize the look and feel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ThemeToggle />
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </CardTitle>
          <CardDescription>
            Stock alerts and reminders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NotificationSettings settings={settings} />
        </CardContent>
      </Card>

      {/* Store Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Store className="h-4 w-4" />
            Store Information
          </CardTitle>
          <CardDescription>
            Business details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StoreSettings settings={settings} />
        </CardContent>
      </Card>

      {/* App Info */}
      <Card className="bg-muted/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Info className="h-4 w-4" />
            About
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">App Version</span>
            <span className="font-mono">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Database</span>
            <span className="font-mono">PostgreSQL</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Framework</span>
            <span className="font-mono">Next.js 15</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}