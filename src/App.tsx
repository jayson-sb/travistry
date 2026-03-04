import { useState, useRef } from "react";
import { Toaster } from "@/components/ui/sonner";
import { Input } from "@/components/ui/input";
import { PromptsIndex } from "@/pages/PromptsIndex";
import {
  categories,
  type PromptCategory,
} from "@/content/prompts";
import { Search, X, SlidersHorizontal, MessageSquarePlus } from "lucide-react";

function App() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<"all" | PromptCategory>("all");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const hasFilters = search || category !== "all";
  const hasCategoryFilter = category !== "all";

  const handleReset = () => {
    setSearch("");
    setCategory("all");
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/40 bg-white/80 backdrop-blur-md">
        {/* Main navbar row */}
        <div className="mx-auto flex w-full max-w-7xl items-center gap-2 px-4 py-2 sm:gap-3 sm:px-6 sm:py-2.5">
          {/* Logo */}
          <a href="/" className="shrink-0">
            <span className="text-base font-bold tracking-tight text-foreground sm:text-xl">
              The Traveler Prompt
            </span>
          </a>

          {/* Right side: filter toggle + search */}
          <div className="ml-auto flex items-center gap-2">
            {/* Search bar */}
            <div className="flex w-36 items-center rounded-full border border-border/60 bg-white/80 px-2.5 py-1 ring-1 ring-black/5 focus-within:ring-2 focus-within:ring-[#ff3407]/20 transition-all duration-300 sm:w-56 sm:px-3 sm:py-1.5">
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

            {/* Filter toggle */}
            <button
              onClick={() => setFiltersOpen((o) => !o)}
              className={`cursor-pointer relative shrink-0 rounded-full p-2 transition-all duration-200
                ${filtersOpen
                  ? "bg-[#ff3407]/10 text-[#ff3407]"
                  : "text-slate-500 hover:bg-slate-100"}`}
            >
              <SlidersHorizontal className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
              {hasCategoryFilter && (
                <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-[#ff3407] ring-2 ring-white" />
              )}
            </button>

            {/* Feedback */}
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSf0sfiESG6UJGv8-p8eJKszaf7qKcUu4VF_1OWEG98uYD7DKA/viewform"
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer shrink-0 rounded-full p-2 text-slate-500 transition-all duration-200 hover:bg-slate-100"
              title="Submit feedback"
            >
              <MessageSquarePlus className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
            </a>
          </div>
        </div>

        {/* Collapsible filter panel */}
        <div
          className={`grid transition-all duration-300 ease-in-out ${filtersOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
        >
          <div className="overflow-hidden">
            <div className="mx-auto flex w-full max-w-7xl items-center gap-1.5 overflow-x-auto border-t border-border/20 px-4 py-2 scrollbar-hide sm:gap-2 sm:px-6 sm:py-2.5">
              <button
                onClick={() => setCategory("all")}
                className={`cursor-pointer hover-pill shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all duration-200 sm:px-3.5 sm:py-1.5 sm:text-xs
                  ${category === "all"
                    ? "bg-[#ff3407] text-white shadow-sm"
                    : "bg-slate-100 text-slate-500"}`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat as PromptCategory)}
                  className={`cursor-pointer hover-pill shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all duration-200 sm:px-3.5 sm:py-1.5 sm:text-xs
                    ${category === cat
                      ? "bg-[#ff3407] text-white shadow-sm"
                      : "bg-slate-100 text-slate-500"}`}
                >
                  {cat}
                </button>
              ))}
              {hasFilters && (
                <button
                  onClick={handleReset}
                  className="cursor-pointer hover-clear shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium text-[#ff3407] transition-all animate-in fade-in slide-in-from-right-2 duration-200 sm:px-3 sm:py-1.5 sm:text-xs"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main>
        <PromptsIndex
          search={search}
          setSearch={setSearch}
          category={category}
          setCategory={setCategory}
        />
      </main>

      <footer className="border-t border-border/40 bg-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-8 sm:gap-6 sm:px-6 sm:py-12 md:flex-row md:items-center md:justify-center">
          <div className="flex flex-col items-center gap-1.5 text-center sm:gap-2">
            <span className="text-base font-bold tracking-tight text-foreground sm:text-lg">
              © {new Date().getFullYear()} The Traveler Prompt
            </span>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Smart travel prompts for your next trip
            </p>
          </div>
        </div>
      </footer>
      {/* Fixed bottom viewport fade */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 h-20 bg-gradient-to-t from-white to-transparent sm:h-24" />
      <Toaster richColors />
    </div>
  );
}

export default App;
