import { ShieldCheck } from "lucide-react";

export function AiDisclaimer() {
  return (
    <p className="mt-4 flex items-start gap-2 rounded-xl bg-muted p-3 text-xs text-muted-foreground">
      <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
      <span>
        <strong className="font-semibold text-foreground">Responsible AI:</strong>{" "}
        AI-generated content may contain errors or omissions. Please review and verify
        important information before using it for workplace decisions.
      </span>
    </p>
  );
}
