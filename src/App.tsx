import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { AppHeader } from "@/components/layout/app-header";
import { AppFooter } from "@/components/layout/app-footer";
import { PromptsIndex } from "@/pages/prompts-index";

function App() {
  const [search, setSearch] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <AppHeader search={search} setSearch={setSearch} mounted={mounted} />

      <main>
        <PromptsIndex search={search} setSearch={setSearch} />
      </main>

      <AppFooter />
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 h-20 bg-gradient-to-t from-background to-transparent sm:h-24" />
      <Toaster richColors />
    </div>
  );
}

export default App;
