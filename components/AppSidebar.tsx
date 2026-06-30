"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  ArrowLeftRight,
  Undo2,
  Scale,
  FileText,
  Users,
  Settings,
  LogOut,
  CreditCard,
  ExternalLink,
  Sun,
  Moon,
  Landmark,
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
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import { CONFIG } from "@/config";
import { getEnvironmentFn, toggleEnvironmentFn } from "@/services";
import { toastMessage } from "@/utils";

function useEnvironment() {
  const [env, setEnvState] = useState<"test" | "live">("test");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchEnv = async () => {
      try {
        const stored = localStorage.getItem("environment");
        if (stored === "live" || stored === "test") {
          setEnvState(stored);
        } else {
          const envFromApi = await getEnvironmentFn();
          if (envFromApi === "live" || envFromApi === "test") setEnvState(envFromApi);
          localStorage.setItem("environment", envFromApi);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchEnv();
  }, []);

  const setEnv = async (val: "test" | "live") => {
    try {
      await toggleEnvironmentFn(val);
      localStorage.setItem("environment", val);
      window.location.reload();
    } catch {
      toastMessage("error", "Failed to switch environment");
    }
  };

  return [env, setEnv, loading, error] as const;
}

const mainNav = [
  { name: "Home", url: "/home", icon: LayoutDashboard },
  { name: "Transactions", url: "/transactions", icon: ArrowLeftRight },
  { name: "Refunds", url: "/refunds", icon: Undo2 },
  { name: "Customers", url: "/customers", icon: Users },
  { name: "Disputes", url: "/disputes", icon: Scale },
  { name: "Settlements", url: "/settlements", icon: Landmark },
  { name: "Operations", url: "/operations", icon: Settings },
];

const businessNav = [
  { name: "Payment Links", url: "/payment-links", icon: CreditCard },
  // { name: "Invoices", url: "/invoices", icon: FileText },
  { name: "Subaccounts", url: "/subaccounts", icon: Receipt },
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
          "h-11",
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
  const [environment, setEnvironment, envLoading, envError] = useEnvironment();

  const initials = user
    ? `${user.name?.charAt(0) ?? "?"}`
    : "?";

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      {/* Logo area */}
      <SidebarHeader className="px-5 py-4">
        <div className="flex items-center justify-start">
          <Link href="/home" className="flex items-center gap-2.5">
            <Logo size={28} />
            <span className="text-sm font-semibold text-foreground group-data-[collapsible=icon]:hidden">Malimbe</span>
          </Link>
        </div>
      </SidebarHeader>

      {/* Main */}
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

        {/* Business */}
        <SidebarGroup className="border-t border-sidebar-border group-data-[collapsible=icon]:border-t-0">
          <SidebarGroupLabel className="px-3 pt-3 group-data-[collapsible=icon]:hidden">Business</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:items-center">
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
            <SidebarMenu className="gap-1 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:items-center">
              {workspaceNav.map((item) => (
                <NavItem key={item.url} {...item} pathname={pathname} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t px-3 py-4 space-y-2">
        {/* Theme + env + docs row */}
        <div className="flex items-center gap-1 px-1 group-data-[collapsible=icon]:hidden">
          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground transition-colors"
            title={theme === "dark" ? "Light mode" : "Dark mode"}
          >
            {resolvedTheme === "dark" ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
          </button>
          <button
            type="button"
            onClick={async () => { try { await setEnvironment(environment === "test" ? "live" : "test"); } catch {} }}
            disabled={envLoading}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
              envLoading ? "opacity-50" : ""
            } ${environment === "live" ? "bg-foreground" : "bg-muted-foreground/30"}`}
            title={`Environment: ${environment}`}
          >
            <span
              className={`inline-block size-3.5 rounded-full bg-background transition-transform ${
                environment === "live" ? "translate-x-4.5" : "translate-x-0.5"
              }`}
            />
          </button>
          <span className="text-[11px] text-muted-foreground">{envLoading ? "..." : environment === "live" ? "Live" : "Test"}</span>
          {CONFIG.DOCUMENTATION_URL && (
            <Link href={CONFIG.DOCUMENTATION_URL} target="_blank" className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors group-data-[collapsible=icon]:hidden" title="Documentation">
              <span>Documentation</span>
            </Link>
          )}
        </div>
        {/* Collapsed: env + theme + logout */}
        <div className="hidden flex-col items-center gap-2 group-data-[collapsible=icon]:flex">
          <button
            type="button"
            onClick={async () => { try { await setEnvironment(environment === "test" ? "live" : "test"); } catch {} }}
            disabled={envLoading}
            className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors cursor-pointer ${
              envLoading ? "opacity-50" : ""
            } ${environment === "live" ? "bg-foreground" : "bg-muted-foreground/30"}`}
            title={`Environment: ${environment}`}
          >
            <span
              className={`inline-block size-3 rounded-full bg-background transition-transform ${
                environment === "live" ? "translate-x-3.5" : "translate-x-0.5"
              }`}
            />
          </button>
          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground transition-colors"
          >
            {resolvedTheme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
          <button
            type="button"
            onClick={() => { logout(); window.location.href = "/"; }}
            className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:text-destructive transition-colors"
          >
            <LogOut className="size-4" />
          </button>
        </div>
        {/* User + logout — expanded */}
        <div className="-mx-3 flex items-center justify-between border-t border-sidebar-border px-3 pt-4 group-data-[collapsible=icon]:hidden group-data-[collapsible=icon]:border-t-0">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground">
              {initials}
            </div>
            <div className="flex flex-col truncate">
              <span className="truncate text-xs font-medium">{merchant?.display_name ?? "x-noname"}</span>
              <span className="truncate text-[11px] text-muted-foreground">{user?.email ?? ""}</span>
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
