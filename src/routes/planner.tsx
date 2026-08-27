import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Copy, Loader2, Pencil, RefreshCw, Save, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/AppShell";
import { AiDisclaimer } from "@/components/AiDisclaimer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { planSchedule } from "@/lib/ai.functions";
import { bumpAiStat, logActivity, useSavedSchedules, useSettings } from "@/lib/store";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner & Scheduler — Cool Cubes" },
      {
        name: "description",
        content:
          "Enter your tasks, deadlines and working hours and get a realistic daily or weekly AI schedule with breaks and priorities.",
      },
      { property: "og:title", content: "AI Task Planner & Scheduler — Cool Cubes" },
      {
        property: "og:description",
        content: "Prioritised, conflict-free daily and weekly schedules built by AI.",
      },
    ],
  }),
  component: PlannerPage,
});

type Plan = {
  overview: string;
  days: {
    day: string;
    blocks: { start: string; end: string; title: string; type: string; priority: string }[];
  }[];
  notes: string[];
};

const priorityStyles: Record<string, string> = {
  high: "bg-destructive/10 text-destructive",
  medium: "bg-warning/20 text-warning-foreground",
  low: "bg-accent text-accent-foreground",
};

function PlannerPage() {
  const run = useServerFn(planSchedule);
  const { value: settings } = useSettings();
  const { setValue: setSaved } = useSavedSchedules();
  const [tasks, setTasks] = useState("");
  const [hoursPerDay, setHoursPerDay] = useState("8");
  const [workStart, setWorkStart] = useState(settings.workStart);
  const [workEnd, setWorkEnd] = useState(settings.workEnd);
  const [scheduleType, setScheduleType] = useState<"daily" | "weekly">("daily");
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const asText = (data: Plan) =>
    [
      data.overview,
      "",
      ...data.days.flatMap((day) => [
        day.day.toUpperCase(),
        ...day.blocks.map((b) => `${b.start} – ${b.end}  ${b.title}`),
        "",
      ]),
      ...data.notes.map((n) => `Note: ${n}`),
    ].join("\n");

  const generate = async () => {
    if (!tasks.trim()) return toast.error("Please list at least one task.");
    setLoading(true);
    setEditing(false);
    try {
      const data = (await run({
        data: { tasks, hoursPerDay, workStart, workEnd, scheduleType },
      })) as Plan;
      setPlan(data);
      setDraft(asText(data));
      bumpAiStat("plans");
      logActivity("AI Planner", `Generated a ${scheduleType} schedule`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not build the schedule.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="AI Task Planner"
        description="Turn a messy task list into a realistic, prioritised schedule."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base">Your tasks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="tasks">Tasks, deadlines, priority &amp; duration</Label>
              <Textarea
                id="tasks"
                rows={9}
                value={tasks}
                onChange={(e) => setTasks(e.target.value)}
                placeholder={
                  "Ice delivery route planning — due today — high — 90min\nSupplier invoices — Friday — medium — 45min\nStaff roster — Wednesday — low — 60min"
                }
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="start">Start</Label>
                <Input id="start" type="time" value={workStart} onChange={(e) => setWorkStart(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="end">End</Label>
                <Input id="end" type="time" value={workEnd} onChange={(e) => setWorkEnd(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="hours">Hours/day</Label>
                <Input id="hours" type="number" min={1} max={16} value={hoursPerDay} onChange={(e) => setHoursPerDay(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="type">Schedule type</Label>
              <Select value={scheduleType} onValueChange={(v) => setScheduleType(v as "daily" | "weekly")}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily Schedule</SelectItem>
                  <SelectItem value="weekly">Weekly Schedule</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={generate} disabled={loading} className="flex-1">
                {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                {loading ? "Planning…" : "Generate Schedule"}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setTasks("");
                  setPlan(null);
                }}
              >
                <Trash2 className="size-4" /> Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-5">
          {loading && (
            <Card className="shadow-card">
              <CardContent className="space-y-3 pt-6">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-2/3" />
              </CardContent>
            </Card>
          )}

          {!loading && !plan && (
            <Card className="shadow-card">
              <CardContent className="py-16 text-center text-sm text-muted-foreground">
                Your generated schedule will appear here.
              </CardContent>
            </Card>
          )}

          {!loading && plan && (
            <>
              {plan.overview && (
                <Card className="shadow-card">
                  <CardContent className="pt-6 text-sm text-muted-foreground">
                    {plan.overview}
                  </CardContent>
                </Card>
              )}

              {editing ? (
                <Card className="shadow-card">
                  <CardContent className="pt-6">
                    <Textarea
                      rows={18}
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      className="font-mono text-sm"
                    />
                  </CardContent>
                </Card>
              ) : (
                plan.days.map((day) => (
                  <Card key={day.day} className="shadow-card">
                    <CardHeader>
                      <CardTitle className="text-base">{day.day}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {day.blocks.map((block, index) => (
                        <div
                          key={index}
                          className="flex flex-col gap-1 rounded-xl bg-muted/60 p-3 sm:flex-row sm:items-center sm:gap-4"
                        >
                          <span className="w-32 shrink-0 text-sm font-medium tabular-nums text-muted-foreground">
                            {block.start} – {block.end}
                          </span>
                          <span className="flex-1 text-sm font-medium">{block.title}</span>
                          <Badge
                            variant="secondary"
                            className={priorityStyles[block.priority?.toLowerCase()] ?? ""}
                          >
                            {block.type}
                          </Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))
              )}

              {plan.notes.length > 0 && !editing && (
                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle className="text-base">Planning notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {plan.notes.map((note, index) => (
                        <li key={index}>• {note}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={generate}>
                  <RefreshCw className="size-4" /> Regenerate
                </Button>
                <Button variant="outline" onClick={() => setEditing((v) => !v)}>
                  <Pencil className="size-4" /> {editing ? "Done editing" : "Edit Schedule"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(editing ? draft : asText(plan));
                    toast.success("Schedule copied");
                  }}
                >
                  <Copy className="size-4" /> Copy
                </Button>
                <Button
                  onClick={() => {
                    setSaved((prev) => [
                      {
                        id: crypto.randomUUID(),
                        at: new Date().toISOString(),
                        title: `${scheduleType === "weekly" ? "Weekly" : "Daily"} schedule`,
                        content: editing ? draft : asText(plan),
                      },
                      ...prev,
                    ]);
                    logActivity("AI Planner", "Saved a schedule");
                    toast.success("Schedule saved");
                  }}
                >
                  <Save className="size-4" /> Save Schedule
                </Button>
                <Button variant="ghost" onClick={() => setPlan(null)}>
                  <Trash2 className="size-4" /> Clear
                </Button>
              </div>
              <AiDisclaimer />
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
