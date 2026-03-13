import { useRef } from "react";
import { useTheme } from "next-themes";
import { Input } from "@/components/ui/input";
import { TravistryLogo } from "@/components/ai-service-icons";
import { Search, X, Sun, Moon } from "lucide-react";

interface AppHeaderProps {
  search: string;
  setSearch: (value: string) => void;
  mounted: boolean;
}

export const AppHeader = ({ search, setSearch, mounted }: AppHeaderProps) => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <header className="fixed top-0 z-50 w-full bg-transparent backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-2 px-4 py-2 sm:gap-3 sm:px-6 sm:py-2.5">
        <a href="/" className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <TravistryLogo className="h-6 w-6 sm:h-7 sm:w-7" />
          <span className="text-base font-bold tracking-tight text-foreground sm:text-xl">
            Travistry
          </span>
        </a>

        <div className="ml-auto flex items-center gap-2">
          <div className="flex w-36 items-center rounded-full border border-border/60 bg-background/80 px-2.5 py-1 ring-1 ring-foreground/5 focus-within:ring-2 focus-within:ring-[#ff3407]/20 transition-all duration-300 sm:w-56 sm:px-3 sm:py-1.5">
            <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground sm:h-4 sm:w-4" />
            <Input
              ref={searchInputRef}
              className="h-6 border-none bg-transparent shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/60 text-xs ml-1.5 sm:h-7 sm:text-sm sm:ml-2"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={() => {
                  setSearch("");
                  searchInputRef.current?.focus();
                }}
                className="cursor-pointer shrink-0 rounded-full p-0.5 text-muted-foreground/60 transition-colors hover:text-muted-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="cursor-pointer shrink-0 rounded-full p-2 text-muted-foreground transition-all duration-200 hover:bg-accent"
            title="Toggle theme"
          >
            {mounted && resolvedTheme === "dark" ? (
              <Sun className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
            ) : (
              <Moon className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
