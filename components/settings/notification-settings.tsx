'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AppSettings } from '@/lib/db/queries/settings';

interface NotificationSettingsProps {
  settings: AppSettings;
}

export function NotificationSettings({ settings }:  NotificationSettingsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [lowStockEnabled, setLowStockEnabled] = useState(settings.lowStockAlertEnabled);
  const [checkInterval, setCheckInterval] = useState(settings.lowStockCheckInterval);
  const [expiryDays, setExpiryDays] = useState(settings.expiryAlertDays);

  const handleSave = async () => {
    setIsLoading(true);

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          low_stock_alert_enabled: lowStockEnabled. toString(),
          low_stock_check_interval: checkInterval. toString(),
          expiry_alert_days: expiryDays.toString(),
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to save settings');
      }

      toast.success('Settings saved! ');
      router.refresh();
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Low Stock Alerts */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Low Stock Alerts</Label>
          <p className="text-sm text-muted-foreground">
            Get notified when products are running low
          </p>
        </div>
        <Switch
          checked={lowStockEnabled}
          onCheckedChange={setLowStockEnabled}
        />
      </div>

      {lowStockEnabled && (
        <>
          {/* Check Interval */}
          <div className="space-y-2">
            <Label htmlFor="checkInterval">Check Interval (hours)</Label>
            <Input
              id="checkInterval"
              type="number"
              min={1}
              max={168}
              value={checkInterval}
              onChange={(e) => setCheckInterval(parseInt(e.target.value) || 24)}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              How often to check for low stock items
            </p>
          </div>

          {/* Expiry Alert Days */}
          <div className="space-y-2">
            <Label htmlFor="expiryDays">Expiry Warning (days)</Label>
            <Input
              id="expiryDays"
              type="number"
              min={1}
              max={90}
              value={expiryDays}
              onChange={(e) => setExpiryDays(parseInt(e.target.value) || 7)}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Days before expiry to show warning
            </p>
          </div>
        </>
      )}

      <Button onClick={handleSave} disabled={isLoading} className="w-full">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving... 
          </>
        ) : (
          'Save Changes'
        )}
      </Button>
    </div>
  );
}