import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Package,
  Clock,
  CheckCircle2,
  Wallet,
  Mail,
  FileText,
  CalendarClock,
  Snowflake,
  Activity as ActivityIcon,
} from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useActivity, useAiStats, useOrders } from "@/lib/store";
import { formatMoney, products } from "@/lib/products";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cool Cubes Dashboard — Ice Orders & AI Workplace Tools" },
      {
        name: "description",
        content:
          "Cool Cubes business dashboard: track ice orders and revenue, and use AI tools for emails, meeting summaries and daily planning.",
      },
      { property: "og:title", content: "Cool Cubes Dashboard — Ice Orders & AI Tools" },
      {
        property: "og:description",
        content:
          "Order ice cubes and run AI workplace productivity tools from one clean dashboard.",
      },
    ],
  }),
  component: Dashboard,
});

const quickActions = [
  { to: "/email", label: "Generate Email", icon: Mail },
  { to: "/meetings", label: "Summarize Meeting", icon: FileText },
  { to: "/planner", label: "Plan My Day", icon: CalendarClock },
  { to: "/products", label: "Order Ice", icon: Snowflake },
] as const;

function Dashboard() {
  const { value: orders } = useOrders();
  const { value: stats } = useAiStats();
  const { value: activity } = useActivity();

  const pending = orders.filter((o) => o.status === "pending").length;
  const completed = orders.filter((o) => o.status === "completed").length;
  const revenue = orders.reduce((sum, o) => sum + o.total, 0);

  return (
    <AppShell>
      <PageHeader
        title="Welcome back 👋"
        description="Here's what's happening across your ice business and AI workspace today."
      />

      <section className="gradient-navy mb-8 rounded-2xl p-6 text-primary-foreground shadow-float sm:p-8">
        <h2 className="text-xl font-semibold sm:text-2xl">Cool Cubes Workspace</h2>
        <p className="mt-2 max-w-xl text-sm opacity-90">
          Crystal-clear ice, delivered cold — plus AI assistants that write your emails,
          summarise your meetings and plan your day.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button asChild variant="secondary">
            <Link to="/products">Browse ice products</Link>
          </Button>
          <Button asChild variant="outline" className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10">
            <Link to="/planner">Plan my day</Link>
          </Button>
        </div>
      </section>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Business overview
      </h2>
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Orders" value={orders.length} icon={Package} />
        <StatCard label="Pending Orders" value={pending} icon={Clock} />
        <StatCard label="Completed" value={completed} icon={CheckCircle2} />
        <StatCard label="Revenue" value={formatMoney(revenue)} icon={Wallet} />
      </div>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        AI productivity overview
      </h2>
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="Emails Generated" value={stats.emails} icon={Mail} />
        <StatCard label="Meetings Summarized" value={stats.meetings} icon={FileText} />
        <StatCard label="Tasks Planned" value={stats.plans} icon={CalendarClock} />
      </div>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Quick actions
      </h2>
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {quickActions.map(({ to, label, icon: Icon }) => (
          <Link key={to} to={to} className="group">
            <Card className="h-full shadow-card transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-float">
              <CardContent className="flex flex-col gap-3 p-5">
                <span className="gradient-ice grid size-11 place-items-center rounded-xl text-ice-foreground">
                  <Icon className="size-5" aria-hidden />
                </span>
                <p className="font-medium">{label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ActivityIcon className="size-4" aria-hidden /> Recent activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activity.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No activity yet. Generate an email or place an order to get started.
              </p>
            )}
            {activity.slice(0, 6).map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between gap-3 rounded-xl bg-muted/60 p-3"
              >
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.kind}</p>
                </div>
                <span className="whitespace-nowrap text-xs text-muted-foreground">
                  {new Date(item.at).toLocaleString()}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base">Popular ice products</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {products.slice(0, 3).map((product) => (
              <div key={product.id} className="flex items-center gap-3">
                <img
                  src={product.image}
                  alt={product.name}
                  loading="lazy"
                  width={800}
                  height={800}
                  className="size-14 rounded-xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.weight}</p>
                </div>
                <span className="text-sm font-semibold">{formatMoney(product.price)}</span>
              </div>
            ))}
            <Button asChild variant="outline" className="w-full">
              <Link to="/products">View all products</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
