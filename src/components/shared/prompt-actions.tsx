import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { aiServices, usePromptActions } from "@/lib/prompt-helpers";
import type { PromptEntry } from "@/content/prompts";
import { Copy, ChevronDown } from "lucide-react";

export const PromptActions = ({
  prompt,
  size = "sm",
}: {
  prompt: PromptEntry;
  size?: "sm" | "default";
}) => {
  const { handleCopy, handleOpenIn } = usePromptActions(prompt);
  const isDefault = size === "default";

  return (
    <div className="flex w-full items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        className={`cursor-pointer hover-copy flex-1 gap-1.5 rounded-lg border border-border font-medium text-muted-foreground ${isDefault ? "h-9 text-xs sm:text-sm" : "h-8 text-[11px] sm:text-xs"}`}
        onClick={handleCopy}
      >
        <Copy className={isDefault ? "h-3.5 w-3.5 sm:h-4 sm:w-4" : "h-3 w-3 sm:h-3.5 sm:w-3.5"} />
        Copy
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            className={`cursor-pointer hover-open flex-1 gap-1.5 rounded-lg bg-[#ff3407] font-medium text-white transition-all ${isDefault ? "h-9 text-xs sm:text-sm" : "h-8 text-[11px] sm:text-xs"}`}
          >
            Use in
            <ChevronDown className={isDefault ? "h-3.5 w-3.5 opacity-70" : "h-3 w-3 opacity-70 sm:h-3.5 sm:w-3.5"} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-44 rounded-xl border-border p-1 shadow-lg"
        >
          {aiServices.map((service) => (
            <DropdownMenuItem
              key={service.name}
              className="cursor-pointer gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground focus:bg-primary/5 focus:text-primary"
              onClick={() => handleOpenIn(service)}
            >
              <service.icon className="h-4 w-4" />
              {"label" in service ? service.label : service.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
