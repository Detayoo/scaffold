"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "@/components/ui/sidebar";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

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
        <Link href={url}>
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

  const initials = user
    ? `${user.firstName?.charAt(0) ?? ""}${user.lastName?.charAt(0) ?? ""}`
    : "?";

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      {/* Logo area */}
      <SidebarHeader className="px-5 py-4">
        <Link href="/home" className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
          <Logo size={28} />
          <span className="text-sm font-semibold tracking-tight group-data-[collapsible=icon]:hidden">
            x-noname
          </span>
        </Link>
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

      {/* Footer — merchant + logout */}
      <SidebarFooter className="border-t p-3">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
          <div className="flex size-7 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground">
            {initials}
          </div>
          <div className="flex flex-1 flex-col truncate group-data-[collapsible=icon]:hidden">
            <span className="truncate text-xs font-medium">
              {merchant?.name ?? "x-noname"}
            </span>
            <span className="truncate text-[11px] text-muted-foreground">
              {merchant?.slug ?? user?.email ?? ""}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              logout();
              window.location.href = "/";
            }}
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground transition-colors group-data-[collapsible=icon]:hidden"
          >
            <LogOut className="size-3.5" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
