import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Copy, Loader2, Pencil, RefreshCw, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/AppShell";
import { AiDisclaimer } from "@/components/AiDisclaimer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { generateEmail } from "@/lib/ai.functions";
import { bumpAiStat, logActivity } from "@/lib/store";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — Cool Cubes AI Assistant" },
      {
        name: "description",
        content:
          "Generate professional workplace emails in a formal, friendly or professional tone with the Cool Cubes AI assistant.",
      },
      { property: "og:title", content: "Smart Email Generator — Cool Cubes AI" },
      {
        property: "og:description",
        content: "Turn a few bullet points into a polished, ready-to-send email.",
      },
    ],
  }),
  component: EmailPage,
});

type Tone = "formal" | "friendly" | "professional";

function EmailPage() {
  const run = useServerFn(generateEmail);
  const [form, setForm] = useState({ purpose: "", recipient: "", keyPoints: "", extra: "" });
  const [tone, setTone] = useState<Tone>("professional");
  const [output, setOutput] = useState("");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!form.purpose.trim()) return toast.error("Please describe the email purpose.");
    setLoading(true);
    setEditing(false);
    try {
      const result = await run({ data: { ...form, tone } });
      setOutput(result.email);
      bumpAiStat("emails");
      logActivity("AI Email", `Generated a ${tone} email`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not generate the email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="Smart Email Generator"
        description="Describe the situation and let AI draft a polished workplace email."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base">Email details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="purpose">Email purpose</Label>
              <Input
                id="purpose"
                value={form.purpose}
                onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                placeholder="Apologise for a late ice delivery and offer a discount"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="recipient">Recipient / context</Label>
              <Input
                id="recipient"
                value={form.recipient}
                onChange={(e) => setForm({ ...form, recipient: e.target.value })}
                placeholder="Thabo, restaurant operations manager"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="points">Key points</Label>
              <Textarea
                id="points"
                rows={5}
                value={form.keyPoints}
                onChange={(e) => setForm({ ...form, keyPoints: e.target.value })}
                placeholder={"- Delivery arrived 2 hours late\n- Vehicle breakdown\n- 15% discount on next order"}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="extra">Additional information</Label>
              <Textarea
                id="extra"
                rows={3}
                value={form.extra}
                onChange={(e) => setForm({ ...form, extra: e.target.value })}
                placeholder="Sign off as Makaziwe, Operations Lead at Cool Cubes."
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tone">Tone</Label>
              <Select value={tone} onValueChange={(v) => setTone(v as Tone)}>
                <SelectTrigger id="tone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={generate} disabled={loading} className="flex-1">
                {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                {loading ? "Generating…" : "Generate Email"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setForm({ purpose: "", recipient: "", keyPoints: "", extra: "" });
                  setOutput("");
                }}
              >
                <Trash2 className="size-4" /> Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base">Generated email</CardTitle>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="space-y-3">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            )}
            {!loading && !output && (
              <p className="py-10 text-center text-sm text-muted-foreground">
                Your generated email will appear here.
              </p>
            )}
            {!loading && output && (
              <>
                {editing ? (
                  <Textarea
                    rows={16}
                    value={output}
                    onChange={(e) => setOutput(e.target.value)}
                    className="font-mono text-sm"
                  />
                ) : (
                  <pre className="whitespace-pre-wrap rounded-xl bg-muted/60 p-4 text-sm leading-relaxed">
                    {output}
                  </pre>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(output);
                      toast.success("Email copied");
                    }}
                  >
                    <Copy className="size-4" /> Copy
                  </Button>
                  <Button variant="outline" onClick={() => setEditing((v) => !v)}>
                    <Pencil className="size-4" /> {editing ? "Done" : "Edit"}
                  </Button>
                  <Button variant="outline" onClick={generate} disabled={loading}>
                    <RefreshCw className="size-4" /> Regenerate
                  </Button>
                  <Button variant="ghost" onClick={() => setOutput("")}>
                    <Trash2 className="size-4" /> Clear
                  </Button>
                </div>
                <AiDisclaimer />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
