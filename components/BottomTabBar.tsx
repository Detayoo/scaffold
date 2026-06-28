"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Undo2,
  Users,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const tabs: { name: string; url: string; icon: LucideIcon }[] = [
  { name: "Home", url: "/home", icon: LayoutDashboard },
  { name: "Transactions", url: "/transactions", icon: ArrowLeftRight },
  { name: "Refunds", url: "/refunds", icon: Undo2 },
  { name: "Team", url: "/team/members", icon: Users },
  { name: "Settings", url: "/settings", icon: Settings },
];

export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex h-14 items-center justify-around border-t bg-background md:hidden">
      {tabs.map((tab) => {
        const isActive = pathname?.startsWith(tab.url);
        return (
          <Link
            key={tab.url}
            href={tab.url}
            className={cn(
              "flex flex-col items-center gap-0.5 px-3 py-1.5 text-[10px] font-medium transition-colors",
              isActive
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <tab.icon className="size-5" />
            <span>{tab.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
