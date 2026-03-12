import { useState } from "react";
import {
  Card,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PromptActions } from "@/components/shared/prompt-actions";
import { trackEvent } from "@/lib/analytics/analytics";
import type { PromptEntry } from "@/content/prompts";
import { PromptDetailDialog } from "./prompt-detail-dialog";

export const PromptCard = ({ prompt }: { prompt: PromptEntry }) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Card className="hover-card flex h-[180px] w-[260px] shrink-0 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-200 sm:h-[200px] sm:w-[300px]">
        <CardHeader
          className="cursor-pointer gap-1.5 px-4 pb-0 pt-3 sm:px-5 sm:pt-4"
          onClick={() => {
            setDialogOpen(true);
            trackEvent({ name: "prompt_view", payload: { slug: prompt.id } });
          }}
        >
          <CardTitle className="line-clamp-2 text-[15px] font-bold leading-snug tracking-tight text-card-foreground sm:text-base">
            {prompt.title}
          </CardTitle>
          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {prompt.summary}
          </p>
        </CardHeader>
        <CardFooter className="mt-auto px-4 pb-3 pt-3 sm:px-5 sm:pb-4">
          <PromptActions prompt={prompt} />
        </CardFooter>
      </Card>
      <PromptDetailDialog
        prompt={prompt}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
};
