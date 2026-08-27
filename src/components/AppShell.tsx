import { Link, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  LayoutDashboard,
  Snowflake,
  ShoppingCart,
  Mail,
  FileText,
  CalendarClock,
  History,
  Settings,
  Menu,
} from "lucide-react";
import logo from "@/assets/logo.png";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/lib/store";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/products", label: "Ice Products", icon: Snowflake },
  { to: "/orders", label: "Orders", icon: ShoppingCart },
  { to: "/email", label: "Smart Email Generator", icon: Mail },
  { to: "/meetings", label: "Meeting Notes Summarizer", icon: FileText },
  { to: "/planner", label: "AI Task Planner", icon: CalendarClock },
  { to: "/history", label: "Order History", icon: History },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { value: cart } = useCart();
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <nav className="flex flex-col gap-1 p-3" aria-label="Main navigation">
      {nav.map((item) => {
        const active = pathname === item.to;
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-card"
                : "text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            <span className="truncate">{item.label}</span>
            {item.to === "/orders" && cartCount > 0 && (
              <Badge className="ml-auto bg-ice text-ice-foreground">{cartCount}</Badge>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3 px-4 py-5">
      <img
        src={logo}
        alt="Cool Cubes logo"
        width={40}
        height={40}
        className="size-10 rounded-xl bg-sidebar-accent p-1"
      />
      <div className="leading-tight">
        <p className="text-base font-semibold text-sidebar-foreground">Cool Cubes</p>
        {!compact && (
          <p className="text-xs text-sidebar-foreground/70">Ice &amp; AI Workspace</p>
        )}
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col overflow-y-auto bg-sidebar lg:flex">
        <Brand />
        <NavList />
        <div className="mt-auto p-4">
          <div className="rounded-xl bg-sidebar-accent p-4 text-xs text-sidebar-accent-foreground">
            <p className="font-semibold">Need ice fast?</p>
            <p className="mt-1 opacity-80">Same-day delivery before 16:00.</p>
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex items-center gap-3 border-b bg-card/90 px-4 py-3 backdrop-blur lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Open navigation">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 bg-sidebar p-0">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <Brand />
            <NavList onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
        <img src={logo} alt="" width={32} height={32} className="size-8" />
        <span className="text-base font-semibold">Cool Cubes</span>
      </header>

      <main className="lg:pl-72">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:py-10">{children}</div>
      </main>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  );
}
