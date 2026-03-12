import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { PromptActions } from "@/components/shared/prompt-actions";
import { extractExpectedSections } from "@/lib/prompt-helpers";
import type { PromptEntry } from "@/content/prompts";
import { Lightbulb, CheckCircle2, Variable } from "lucide-react";

interface PromptDetailDialogProps {
  prompt: PromptEntry;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PromptDetailDialog = ({
  prompt,
  open,
  onOpenChange,
}: PromptDetailDialogProps) => {
  const sections = extractExpectedSections(prompt.promptTemplate);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col overflow-hidden rounded-2xl p-0 sm:max-w-2xl">
        <div className="flex-1 overflow-y-auto p-6 pb-4">
          <DialogHeader className="gap-2">
            <div className="flex items-start justify-between gap-3 pr-6">
              <DialogTitle className="text-lg font-bold leading-snug tracking-tight sm:text-xl">
                {prompt.title}
              </DialogTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="rounded-full text-[11px] font-medium">
                {prompt.category}
              </Badge>
            </div>
            <DialogDescription className="text-sm leading-relaxed">
              {prompt.summary}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 pt-5">
            {sections.length > 0 && (
              <div className="space-y-2.5">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Lightbulb className="h-4 w-4 text-[#ff3407]" />
                  What you'll get
                </h3>
                <ol className="space-y-1.5 pl-1">
                  {sections.map((section, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-[#ff3407]">
                        {i + 1}
                      </span>
                      <span className="leading-relaxed">{section}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {prompt.whenToUse && prompt.whenToUse.length > 0 && (
              <div className="space-y-2.5">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-[#ff3407]" />
                  When to use
                </h3>
                <ul className="space-y-1.5 pl-1">
                  {prompt.whenToUse.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/40" />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {prompt.variables && prompt.variables.length > 0 && (
              <div className="space-y-2.5">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Variable className="h-4 w-4 text-[#ff3407]" />
                  You'll fill in
                </h3>
                <div className="flex flex-wrap gap-2">
                  {prompt.variables.map((v) => (
                    <Badge
                      key={v.key}
                      variant="outline"
                      className="rounded-full px-3 py-1 text-xs font-normal text-muted-foreground"
                    >
                      {v.label}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="relative sticky bottom-0 bg-background px-6 pb-4 before:pointer-events-none before:absolute before:inset-x-0 before:-top-8 before:h-8 before:bg-gradient-to-t before:from-background before:to-transparent sm:flex-row">
          <PromptActions prompt={prompt} size="default" />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
