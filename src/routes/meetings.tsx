import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  CalendarDays,
  CheckSquare,
  Copy,
  FileUp,
  Gavel,
  Loader2,
  RefreshCw,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/AppShell";
import { AiDisclaimer } from "@/components/AiDisclaimer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { summarizeMeeting } from "@/lib/ai.functions";
import { bumpAiStat, logActivity } from "@/lib/store";

export const Route = createFileRoute("/meetings")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer — Cool Cubes AI Assistant" },
      {
        name: "description",
        content:
          "Paste or upload meeting notes and get an AI summary with action items, owners, decisions and deadlines.",
      },
      { property: "og:title", content: "Meeting Notes Summarizer — Cool Cubes AI" },
      {
        property: "og:description",
        content: "Turn long meeting transcripts into clear summaries and action items.",
      },
    ],
  }),
  component: MeetingsPage,
});

type Summary = {
  summary: string;
  actionItems: { task: string; owner: string; deadline: string }[];
  decisions: string[];
  deadlines: { item: string; date: string }[];
};

function MeetingsPage() {
  const run = useServerFn(summarizeMeeting);
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const summarize = async () => {
    if (!notes.trim()) return toast.error("Please paste or upload meeting notes.");
    setLoading(true);
    try {
      const data = (await run({ data: { notes } })) as Summary;
      setResult(data);
      bumpAiStat("meetings");
      logActivity("AI Meeting", "Summarized meeting notes");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not summarize the notes.");
    } finally {
      setLoading(false);
    }
  };

  const asText = (data: Summary) =>
    [
      "MEETING SUMMARY",
      data.summary,
      "",
      "ACTION ITEMS",
      ...data.actionItems.map((a) => `- ${a.task} — ${a.owner} (${a.deadline})`),
      "",
      "DECISIONS",
      ...data.decisions.map((d) => `- ${d}`),
      "",
      "DEADLINES",
      ...data.deadlines.map((d) => `- ${d.item}: ${d.date}`),
    ].join("\n");

  return (
    <AppShell>
      <PageHeader
        title="Meeting Notes Summarizer"
        description="Paste notes or upload a text file — AI extracts what matters."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr]">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base">Meeting notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="notes">Paste notes or transcript</Label>
              <Textarea
                id="notes"
                rows={14}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Paste your full meeting notes or transcript here…"
              />
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".txt,.md,.csv,text/plain"
              className="hidden"
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                setNotes(await file.text());
                toast.success(`Loaded ${file.name}`);
                event.target.value = "";
              }}
            />
            <div className="flex flex-wrap gap-2">
              <Button onClick={summarize} disabled={loading} className="flex-1">
                {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                {loading ? "Summarizing…" : "Summarize Notes"}
              </Button>
              <Button variant="outline" onClick={() => fileRef.current?.click()}>
                <FileUp className="size-4" /> Upload
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setNotes("");
                  setResult(null);
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
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          )}

          {!loading && !result && (
            <Card className="shadow-card">
              <CardContent className="py-16 text-center text-sm text-muted-foreground">
                Your summary, action items, decisions and deadlines will appear here.
              </CardContent>
            </Card>
          )}

          {!loading && result && (
            <>
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-base">Meeting summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {result.summary || "No summary could be extracted."}
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <CheckSquare className="size-4" aria-hidden /> Action items
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {result.actionItems.length === 0 && (
                    <p className="text-sm text-muted-foreground">No action items found.</p>
                  )}
                  {result.actionItems.map((item, index) => (
                    <div key={index} className="rounded-xl bg-muted/60 p-3">
                      <p className="text-sm font-medium">{item.task}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge variant="secondary">{item.owner}</Badge>
                        <Badge className="bg-accent text-accent-foreground">{item.deadline}</Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="grid gap-5 sm:grid-cols-2">
                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Gavel className="size-4" aria-hidden /> Decisions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {result.decisions.length === 0 && <li>No decisions recorded.</li>}
                      {result.decisions.map((decision, index) => (
                        <li key={index}>• {decision}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <CalendarDays className="size-4" aria-hidden /> Deadlines
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {result.deadlines.length === 0 && <li>No deadlines mentioned.</li>}
                      {result.deadlines.map((deadline, index) => (
                        <li key={index}>
                          • {deadline.item} —{" "}
                          <span className="font-medium text-foreground">{deadline.date}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(asText(result));
                    toast.success("Summary copied");
                  }}
                >
                  <Copy className="size-4" /> Copy Summary
                </Button>
                <Button variant="outline" onClick={summarize}>
                  <RefreshCw className="size-4" /> Regenerate
                </Button>
                <Button variant="ghost" onClick={() => setResult(null)}>
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
