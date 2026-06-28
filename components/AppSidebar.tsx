"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  ArrowLeftRight,
  Undo2,
  FileText,
  Users,
  Settings,
  LogOut,
  CreditCard,
  ExternalLink,
  Bell,
  Sun,
  Moon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/components/theme-provider";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import { CONFIG } from "@/config";

const mainNav = [
  { name: "Home", url: "/home", icon: LayoutDashboard },
  { name: "Transactions", url: "/transactions", icon: ArrowLeftRight },
  { name: "Refunds", url: "/refunds", icon: Undo2 },
];

const businessNav = [
  { name: "Payment Links", url: "/payment-links", icon: CreditCard },
  { name: "Invoices", url: "/invoices", icon: FileText },
];

const workspaceNav = [
  { name: "Team", url: "/team/members", icon: Users },
  { name: "Settings", url: "/settings", icon: Settings },
];

function NavItem({
  name,
  url,
  icon: Icon,
  pathname,
}: {
  name: string;
  url: string;
  icon: any;
  pathname: string | null;
}) {
  const isActive = pathname?.startsWith(url);
  const { setOpenMobile } = useSidebar();
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setOpenMobile(false);
    setTimeout(() => router.push(url), 80);
  };

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        tooltip={name}
        className={cn(
          isActive && "font-medium"
        )}
      >
        <Link href={url} onClick={handleClick}>
          <Icon className={cn("size-4 shrink-0", isActive ? "text-foreground" : "text-muted-foreground")} />
          <span className="group-data-[collapsible=icon]:hidden">{name}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const { merchant, user, logout } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();

  const initials = user
    ? `${user.firstName?.charAt(0) ?? ""}${user.lastName?.charAt(0) ?? ""}`
    : "?";

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      {/* Logo area */}
      <SidebarHeader className="px-5 py-4">
        <div className="flex items-center justify-between group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-2">
          <Link href="/home" className="flex items-center">
            <Logo size={28} />
          </Link>
          <SidebarTrigger className="group-data-[collapsible=icon]:rotate-180" />
        </div>
      </SidebarHeader>

      {/* Main */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 group-data-[collapsible=icon]:hidden">Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:items-center">
              {mainNav.map((item) => (
                <NavItem key={item.url} {...item} pathname={pathname} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Business */}
        <SidebarGroup className="border-t border-sidebar-border group-data-[collapsible=icon]:border-t-0">
          <SidebarGroupLabel className="px-3 pt-3 group-data-[collapsible=icon]:hidden">Business</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:items-center">
              {businessNav.map((item) => (
                <NavItem key={item.url} {...item} pathname={pathname} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Workspace */}
        <SidebarGroup className="border-t border-sidebar-border group-data-[collapsible=icon]:border-t-0">
          <SidebarGroupLabel className="px-3 pt-3 group-data-[collapsible=icon]:hidden">Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:items-center">
              {workspaceNav.map((item) => (
                <NavItem key={item.url} {...item} pathname={pathname} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t p-3 space-y-2">
        {/* Theme + docs + notifications row — only when expanded */}
        <div className="flex items-center gap-1 px-1 group-data-[collapsible=icon]:hidden">
          <ThemeToggle />
          <button type="button" className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground transition-colors" title="Notifications">
            <Bell className="size-3.5" />
          </button>
          {CONFIG.DOCUMENTATION_URL && (
            <Link href={CONFIG.DOCUMENTATION_URL} target="_blank" className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground transition-colors" title="Documentation">
              <ExternalLink className="size-3.5" />
            </Link>
          )}
        </div>
        {/* Compact mode: icon-only items */}
        <div className="hidden flex-col items-center gap-2 group-data-[collapsible=icon]:flex">
          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground transition-colors"
          >
            {resolvedTheme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
          <button type="button" className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground transition-colors" title="Notifications">
            <Bell className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => { logout(); window.location.href = "/"; }}
            className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:text-destructive transition-colors"
          >
            <LogOut className="size-4" />
          </button>
        </div>
        <SidebarSeparator className="group-data-[collapsible=icon]:hidden" />
        {/* User + logout — only when expanded */}
        <div className="flex items-center justify-between group-data-[collapsible=icon]:hidden">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground">
              {initials}
            </div>
            <div className="flex flex-col truncate">
              <span className="truncate text-xs font-medium">{merchant?.name ?? "x-noname"}</span>
              <span className="truncate text-[11px] text-muted-foreground">{merchant?.slug ?? user?.email ?? ""}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => { logout(); window.location.href = "/"; }}
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:text-destructive transition-colors"
          >
            <LogOut className="size-3.5" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
