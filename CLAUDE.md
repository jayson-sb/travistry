# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Navis** is a React-based web app for **copy-paste-ready travel guides**: structured text users paste into AI assistants (ChatGPT, Claude, Gemini, Perplexity) and take it from there. User-facing copy says "guides," not "prompts," for accessibility.

Internally, content still lives in `promptLibrary` / `PromptEntry` and is built into a full text block via `buildPromptText()`.

Tech stack: Vite + React 19 + TypeScript + Tailwind CSS + Radix UI primitives.

## Commands

```bash
# Development
npm run dev              # Start dev server at http://127.0.0.1:5173

# Build
npm run build            # Type check + build for production
npm run sitemap          # Generate sitemap.xml (runs automatically in prebuild)

# Linting
npm run lint             # Run ESLint

# Preview
npm run preview          # Preview production build locally
```

## Architecture

### Content-Driven Structure

The app is content-driven with prompts defined as structured data in `src/content/prompts.ts`. This is the **single source of truth** for all prompt content.

**Prompt Structure:**
- Each `PromptEntry` has: id, slug, title, summary, category, tags, promptTemplate, and optional variables
- `PromptVariable` defines template placeholders (e.g., `{{destination}}` → user-fillable field)
- Six categories map to specific role-based preambles via `ROLE_BY_CATEGORY`
- The `buildPreamble()` function generates category-specific context and output instructions

**Template System:**
- Variables in templates use `{{key}}` syntax
- `applyVariableLabels()` converts `{{key}}` → `<<Label>>` for display
- `hydrateTemplate()` replaces variables with actual user values
- Templates are assembled: preamble + variable hints + core prompt text

### Component Organization

```
src/
├── pages/              # Main page components
│   ├── PromptsIndex.tsx   # Homepage with prompt cards, search, filters
│   ├── PromptDetail.tsx   # Detailed view with variable input (not currently routed)
│   └── Insights.tsx        # Analytics dashboard
├── components/
│   └── ui/                 # shadcn/ui components (Radix primitives)
├── content/
│   └── prompts.ts          # Prompt library (single source of truth)
└── lib/
    ├── analytics/          # Event tracking system
    │   ├── analytics.ts    # Core tracking API
    │   ├── store.ts        # LocalStorage for insights
    │   └── providers/      # Console + Storage providers
    └── utils.ts            # Tailwind merge helper (cn)
```

### Path Aliases

The `@` alias maps to `src/` (configured in vite.config.ts and tsconfig.json):
```typescript
import { Button } from "@/components/ui/button"
import { promptLibrary } from "@/content/prompts"
```

### Analytics System

Pluggable provider architecture in `src/lib/analytics/`:
- `trackEvent()` broadcasts to all registered providers
- **consoleProvider**: Logs events to console
- **storageProvider**: Persists counts to localStorage for the Insights page
- Event types: `prompt_view`, `prompt_copy`, `prompt_search`, `prompt_filter_change`, `outbound_click`

### AI Service Integration

Defined in `PromptsIndex.tsx` and `PromptDetail.tsx`:
- ChatGPT and Perplexity support URL prefilling (`?q=` parameter)
- Claude and Gemini open to new chat (manual paste required)
- `buildPromptText()` assembles the full prompt including preamble

### Sitemap Generation

`scripts/generate-sitemap.ts` runs before build to generate `public/sitemap.xml`:
- Reads `promptLibrary` to create routes for each prompt
- Uses `SITE_URL` environment variable (defaults to replit.app domain)
- Outputs to `public/sitemap.xml`

## Key Patterns

### Adding a New Prompt

1. Add a new entry to `promptLibrary` array in `src/content/prompts.ts`
2. Ensure it has a unique `id` and `slug`
3. Define `variables` array if the prompt needs user input (use `{{variableKey}}` in template)
4. Choose appropriate `category` (affects preamble generation)
5. Use `intent` field to control output formatting: `"comparison"`, `"checklist"`, or leave undefined
6. Sitemap will auto-update on next build

### Modifying Category Behavior

Category-specific roles are defined in `ROLE_BY_CATEGORY` in `src/content/prompts.ts`. Changing a role affects the preamble for all prompts in that category.

### UI Components

Uses shadcn/ui (Radix-based components in `src/components/ui/`). Components follow the shadcn convention:
- Installed via `components.json` configuration
- Styled with Tailwind using CSS variables for theming
- Import from `@/components/ui/[component-name]`

### Styling

- Custom color system defined via CSS variables in Tailwind config
- Primary brand color: `#ff3407` (orange-red)
- Font: Plus Jakarta Sans (loaded from Google Fonts in index.html)
- Uses `cn()` utility from `@/lib/utils` for conditional class merging

## Important Notes

- The app is a single-page application with no routing (despite react-router-dom being installed)
- `PromptDetail.tsx` exists but is not currently wired into the app navigation
- Analytics data is stored in browser localStorage only (no backend)
- No test suite currently exists
- Build output goes to `dist/`
