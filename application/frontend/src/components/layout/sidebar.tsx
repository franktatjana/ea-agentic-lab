"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useQuery } from "@tanstack/react-query";
import {
  Home,
  LayoutDashboard,
  LayoutGrid,
  Layers,
  FileText,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  Building2,
  Bot,
  BookOpen,
  BookMarked,
  User,
  Sun,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { Separator } from "@/components/ui/separator";
import type { LucideIcon } from "lucide-react";

type NavChild = { href: string; label: string; icon: LucideIcon; iconColor: string };
type NavItem =
  | { href: string; label: string; icon: LucideIcon; iconColor: string; children?: never }
  | { href: string; label: string; icon: LucideIcon; iconColor: string; children: NavChild[] };

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Home", icon: Home, iconColor: "text-blue-400" },
  { href: "/blueprints", label: "Blueprints", icon: Layers, iconColor: "text-purple-400" },
  { href: "/agents", label: "Agents", icon: Bot, iconColor: "text-amber-400" },
  { href: "/canvas", label: "Artifacts", icon: LayoutGrid, iconColor: "text-cyan-400" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => setMounted(true), []);

  const { data: realms } = useQuery({
    queryKey: ["realms"],
    queryFn: api.listRealms,
  });

  return (
    <aside className={cn(
      "border-r border-border bg-card flex flex-col shrink-0 transition-[width] duration-200",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="p-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <span className="text-primary-foreground text-sm font-bold">EA</span>
          </div>
          {!collapsed && <span className="font-semibold text-sm">Agentic Lab</span>}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors shrink-0"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>

      <Separator />

      <nav className={cn("flex-1 space-y-1 overflow-auto", collapsed ? "p-2" : "p-3")}>
        {NAV_ITEMS.map((item) => {
          if (item.children && !collapsed) {
            const isGroupActive =
              pathname.startsWith(item.href) ||
              item.children.some((child) => pathname.startsWith(child.href));
            const isSelfActive = pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <div key={item.label}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                    isSelfActive
                      ? "bg-accent text-accent-foreground"
                      : isGroupActive
                        ? "text-accent-foreground hover:bg-accent/50"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  )}
                >
                  <item.icon className={cn("h-4 w-4", item.iconColor)} />
                  <span className="flex-1">{item.label}</span>
                  {isGroupActive ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                </Link>
                {isGroupActive && item.children.map((child) => {
                  const isChildActive = pathname.startsWith(child.href);
                  return (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={cn(
                        "flex items-center gap-2 rounded-md px-3 py-1.5 ml-4 text-sm transition-colors",
                        isChildActive
                          ? "bg-accent text-accent-foreground font-medium"
                          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                      )}
                    >
                      <child.icon className={cn("h-3.5 w-3.5", child.iconColor)} />
                      {child.label}
                    </Link>
                  );
                })}
              </div>
            );
          }

          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center rounded-md text-sm transition-colors",
                collapsed ? "justify-center px-2 py-2" : "gap-3 px-3 py-2",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-4 w-4 shrink-0", item.iconColor)} />
              {!collapsed && item.label}
            </Link>
          );
        })}

        {realms && realms.length > 0 && (
          <>
            <Separator className="my-3" />
            {!collapsed && (
              <p className="px-3 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Examples
              </p>
            )}
            <Link
              href="/dashboard"
              title={collapsed ? "Dashboard" : undefined}
              className={cn(
                "flex items-center rounded-md text-sm transition-colors",
                collapsed ? "justify-center px-2 py-2" : "gap-3 px-3 py-2",
                pathname.startsWith("/dashboard")
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )}
            >
              <LayoutDashboard className="h-4 w-4 text-teal-400 shrink-0" />
              {!collapsed && "Dashboard"}
            </Link>
            {realms.map((realm) => {
              const realmPath = `/realms/${realm.realm_id}`;
              const isActive = pathname.startsWith(realmPath);

              return (
                <div key={realm.realm_id}>
                  <Link
                    href={realmPath}
                    title={collapsed ? realm.name : undefined}
                    className={cn(
                      "flex items-center rounded-md text-sm transition-colors",
                      collapsed ? "justify-center px-2 py-2" : "gap-3 px-3 py-2",
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                    )}
                  >
                    <Building2 className="h-4 w-4 text-orange-400 shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="flex-1 truncate">{realm.name}</span>
                        <ChevronRight className="h-3 w-3" />
                      </>
                    )}
                  </Link>
                  {!collapsed && isActive &&
                    realm.nodes.map((nodeId) => (
                      <Link
                        key={nodeId}
                        href={`${realmPath}/nodes/${nodeId}`}
                        className={cn(
                          "flex items-center gap-2 rounded-md px-3 py-1.5 ml-6 text-xs transition-colors",
                          pathname.includes(nodeId)
                            ? "text-foreground font-medium"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {nodeId.replace(/_/g, " ")}
                      </Link>
                    ))}
                </div>
              );
            })}
          </>
        )}

        <Separator className="my-3" />
        <Link
          href="/knowledge"
          title={collapsed ? "Knowledge Vault" : undefined}
          className={cn(
            "flex items-center rounded-md text-sm transition-colors",
            collapsed ? "justify-center px-2 py-2" : "gap-3 px-3 py-2",
            pathname.startsWith("/knowledge")
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
          )}
        >
          <BookOpen className="h-4 w-4 text-indigo-400 shrink-0" />
          {!collapsed && "Knowledge Vault"}
        </Link>

        <Separator className="my-3" />
        <Link
          href="/docs"
          title={collapsed ? "Documentation" : undefined}
          className={cn(
            "flex items-center rounded-md text-sm transition-colors",
            collapsed ? "justify-center px-2 py-2" : "gap-3 px-3 py-2",
            pathname.startsWith("/docs")
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
          )}
        >
          <FileText className="h-4 w-4 text-green-400 shrink-0" />
          {!collapsed && "Documentation"}
        </Link>
        <a
          href="https://ea-agentic-lab-stories.onrender.com/"
          target="_blank"
          rel="noopener noreferrer"
          title={collapsed ? "Stories" : undefined}
          className={cn(
            "flex items-center rounded-md text-sm transition-colors text-muted-foreground hover:bg-accent/50 hover:text-foreground",
            collapsed ? "justify-center px-2 py-2" : "gap-3 px-3 py-2"
          )}
        >
          <BookMarked className="h-4 w-4 text-pink-400 shrink-0" />
          {!collapsed && "Stories"}
        </a>
        <Link
          href="/about"
          title={collapsed ? "About" : undefined}
          className={cn(
            "flex items-center rounded-md text-sm transition-colors",
            collapsed ? "justify-center px-2 py-2" : "gap-3 px-3 py-2",
            pathname.startsWith("/about")
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
          )}
        >
          <User className="h-4 w-4 text-rose-400 shrink-0" />
          {!collapsed && "About"}
        </Link>
      </nav>

      {!collapsed && (
        <div className="mx-3 mb-2 rounded-md border border-yellow-600/30 bg-yellow-600/5 px-3 py-2.5">
          <p className="text-[11px] font-semibold text-yellow-400/90">Concept Showcase</p>
          <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
            Not a production app. A working demo of a concept framework for agentic
            enterprise governance. All names and scenarios are fictional.
            Documentation is written for agents, not humans. The UI renders
            machine-readable data into human views on demand.
          </p>
        </div>
      )}
      <Separator />
      <div className={cn("p-3 flex items-center", collapsed ? "justify-center" : "justify-between")}>
        {!collapsed && (
          <div>
            <p className="text-xs text-muted-foreground">EA Agentic Lab v1.0</p>
            <p className="text-[10px] text-muted-foreground/70">
              <a
                href="https://github.com/franktatjana"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                Tatjana Frank
              </a>
              , 2026
            </p>
          </div>
        )}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
          aria-label="Toggle theme"
        >
          {mounted && (theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />)}
        </button>
      </div>
    </aside>
  );
}
