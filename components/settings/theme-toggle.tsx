'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-4">
      <RadioGroup
        value={theme}
        onValueChange={setTheme}
        className="grid grid-cols-3 gap-2"
      >
        <div>
          <RadioGroupItem
            value="light"
            id="light"
            className="peer sr-only"
          />
          <Label
            htmlFor="light"
            className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
          >
            <Sun className="h-6 w-6 mb-2" />
            <span className="text-sm font-medium">Light</span>
          </Label>
        </div>

        <div>
          <RadioGroupItem
            value="dark"
            id="dark"
            className="peer sr-only"
          />
          <Label
            htmlFor="dark"
            className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
          >
            <Moon className="h-6 w-6 mb-2" />
            <span className="text-sm font-medium">Dark</span>
          </Label>
        </div>

        <div>
          <RadioGroupItem
            value="system"
            id="system"
            className="peer sr-only"
          />
          <Label
            htmlFor="system"
            className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
          >
            <Monitor className="h-6 w-6 mb-2" />
            <span className="text-sm font-medium">System</span>
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
}