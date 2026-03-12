import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface EmptyStateProps {
  search: string;
  onClear: () => void;
}

export const EmptyState = ({ search, onClear }: EmptyStateProps) => (
  <div className="mx-4 flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/60 bg-secondary/50 px-4 py-16 text-center sm:mx-6 sm:gap-4 sm:rounded-3xl sm:py-24">
    <div className="rounded-full bg-muted p-3 sm:p-4">
      <Search className="h-6 w-6 text-muted-foreground/50 sm:h-8 sm:w-8" />
    </div>
    <div className="max-w-md space-y-1.5 sm:space-y-2">
      <h3 className="text-lg font-semibold text-foreground sm:text-xl">No prompts found</h3>
      <p className="text-sm text-muted-foreground sm:text-base">
        We couldn't find any prompts matching "{search}". Try adjusting your search.
      </p>
    </div>
    <Button
      variant="outline"
      onClick={onClear}
      className="cursor-pointer mt-2 rounded-full text-sm sm:mt-4"
    >
      Clear search
    </Button>
  </div>
);
