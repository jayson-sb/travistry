import { TravelLibLogo } from "@/components/ai-service-icons";

export const AppFooter = () => (
  <footer className="border-t border-border/40 bg-background">
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-8 sm:gap-6 sm:px-6 sm:py-12 md:flex-row md:items-center md:justify-center">
      <div className="flex flex-col items-center gap-1.5 text-center sm:gap-2">
        <span className="flex items-center gap-1.5 text-base font-bold tracking-tight text-foreground sm:gap-2 sm:text-lg">
          <TravelLibLogo className="h-5 w-5 sm:h-6 sm:w-6" />
          &copy; {new Date().getFullYear()} The Travel Lib
        </span>
        <p className="text-xs text-muted-foreground sm:text-sm">
          Your prompt travel library — structured prompts, no back-and-forth.
        </p>
      </div>
    </div>
  </footer>
);
