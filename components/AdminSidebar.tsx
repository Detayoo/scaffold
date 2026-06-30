"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Landmark,
  FileSearch,
  Undo2,
  Scale,
  FileText,
  Activity,
  Settings,
  LogOut,
  ExternalLink,
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
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/Logo";
import { useTheme } from "@/components/theme-provider";
import { useAdminAuth } from "@/contexts/admin-auth-context";
import { cn } from "@/lib/utils";
import { CONFIG } from "@/config";

const mainNav = [
  { name: "Home", url: "/admin", icon: LayoutDashboard },
  { name: "Merchants", url: "/admin/merchants", icon: Users },
  { name: "Settlements", url: "/admin/settlements", icon: Landmark },
  { name: "Reconciliation", url: "/admin/reconciliation", icon: FileSearch },
];

const opsNav = [
  { name: "Refunds", url: "/admin/refunds", icon: Undo2 },
  { name: "Disputes", url: "/admin/disputes", icon: Scale },
  { name: "Audit Logs", url: "/admin/audit-logs", icon: FileText },
  { name: "Provider Health", url: "/admin/provider-health", icon: Activity },
  { name: "Dedicated Accounts", url: "/admin/dedicated-accounts", icon: Landmark },
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
  const isActive = url === "/admin" ? pathname === url : pathname?.startsWith(url);
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
        className={cn(isActive && "font-medium")}
      >
        <Link href={url} onClick={handleClick}>
          <Icon className={cn("size-4 shrink-0", isActive ? "text-foreground" : "text-muted-foreground")} />
          <span className="group-data-[collapsible=icon]:hidden">{name}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAdminAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="px-5 py-4">
        <div className="flex items-center justify-center">
          <Link href="/admin" className="flex items-center">
            <Logo size={28} />
          </Link>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 group-data-[collapsible=icon]:hidden">Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:items-center">
              {mainNav.map((item) => (
                <NavItem key={item.url} {...item} pathname={pathname} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="border-t border-sidebar-border group-data-[collapsible=icon]:border-t-0">
          <SidebarGroupLabel className="px-3 pt-3 group-data-[collapsible=icon]:hidden">Operations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:items-center">
              {opsNav.map((item) => (
                <NavItem key={item.url} {...item} pathname={pathname} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t px-3 py-4 space-y-2">
        <div className="flex items-center gap-1 px-1 group-data-[collapsible=icon]:hidden">
          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground transition-colors"
          >
            {resolvedTheme === "dark" ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
          </button>
          {CONFIG.DOCUMENTATION_URL && (
            <Link href={CONFIG.DOCUMENTATION_URL} target="_blank" className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground transition-colors">
              <ExternalLink className="size-3.5" />
            </Link>
          )}
        </div>
        <div className="hidden flex-col items-center gap-2 group-data-[collapsible=icon]:flex">
          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground transition-colors"
          >
            {resolvedTheme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
          <button
            type="button"
            onClick={() => { logout(); window.location.href = "/admin/login"; }}
            className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:text-destructive transition-colors"
          >
            <LogOut className="size-4" />
          </button>
        </div>
        <div className="-mx-3 flex items-center justify-between border-t border-sidebar-border px-3 pt-4 group-data-[collapsible=icon]:hidden group-data-[collapsible=icon]:border-t-0">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground">
              A
            </div>
            <div className="flex flex-col truncate">
              <span className="truncate text-xs font-medium">Admin</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => { logout(); window.location.href = "/admin/login"; }}
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:text-destructive transition-colors"
          >
            <LogOut className="size-3.5" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
