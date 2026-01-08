"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, ShoppingCart, Plus, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  role: "admin" | "salesperson";
}

export function BottomNav({ role }: BottomNavProps) {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/",
      icon: Home,
      label: "Home",
      active: pathname === "/",
    },
    {
      href: "/enquiry",
      icon: Search,
      label: "Enquiry",
      active: pathname === "/enquiry",
    },
    {
      href: "/sales/new",
      icon: ShoppingCart,
      label: "Sell",
      primary: true,
      active: pathname === "/sales/new",
    },
    {
      href: "/purchases/new",
      icon: Plus,
      label: "Stock In",
      active: pathname === "/purchases/new",
    },
    {
      href: "/more",
      icon: Menu,
      label: "More",
      active: pathname === "/more" || pathname.startsWith("/admin"),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t safe-area-pb">
      <div className="container max-w-lg mx-auto">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const Icon = item.icon;

            if (item.primary) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center justify-center -mt-6"
                >
                  <div
                    className={cn(
                      "flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-transform active:scale-95",
                      "bg-primary text-primary-foreground"
                    )}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center w-16 h-full transition-colors",
                  item.active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs mt-1">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
