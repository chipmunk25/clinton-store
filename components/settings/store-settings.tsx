"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppSettings } from "@/lib/db/queries/settings";

const CURRENCIES = [
  { value: "GHS", label: "GHS (₵)", symbol: "₵" },
  { value: "USD", label: "USD ($)", symbol: "$" },
  { value: "EUR", label: "EUR (€)", symbol: "€" },
  { value: "GBP", label: "GBP (£)", symbol: "£" },
  { value: "NGN", label: "NGN (₦)", symbol: "₦" },
  { value: "KES", label: "KES (KSh)", symbol: "KSh" },
  { value: "ZAR", label: "ZAR (R)", symbol: "R" },
  { value: "XOF", label: "XOF (CFA)", symbol: "CFA" },
];

interface StoreSettingsProps {
  settings: AppSettings;
}

export function StoreSettings({ settings }: StoreSettingsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [storeName, setStoreName] = useState(settings.storeName);
  const [currency, setCurrency] = useState(settings.storeCurrency);

  const handleSave = async () => {
    setIsLoading(true);

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          store_name: storeName,
          store_currency: currency,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save settings");
      }

      toast.success("Settings saved! ");
      router.refresh();
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Store Name */}
      <div className="space-y-2">
        <Label htmlFor="storeName">Store Name</Label>
        <Input
          id="storeName"
          value={storeName}
          onChange={(e) => setStoreName(e.target.value)}
          placeholder="My Store"
        />
      </div>

      {/* Currency */}
      <div className="space-y-2">
        <Label>Currency</Label>
        <Select value={currency} onValueChange={setCurrency}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CURRENCIES.map((curr) => (
              <SelectItem key={curr.value} value={curr.value}>
                {curr.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button onClick={handleSave} disabled={isLoading} className="w-full">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          "Save Changes"
        )}
      </Button>
    </div>
  );
}
