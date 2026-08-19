# 🤖 AI Agent Guidelines & Architecture Rules (create-pro-stack)

This project was generated with **create-pro-stack**, an enterprise-grade scaffolding engine for Next.js and React (Vite).
AI coding agents (Antigravity, Cursor, Claude Code, GitHub Copilot) MUST follow these architectural rules and Vercel engineering best practices when writing or modifying code.

---

## 🏛️ 1. Clean Feature-Driven Architecture

All business and domain logic MUST be organized inside `src/features/<domain>/`. NEVER dump domain logic into global components or page files.

```text
src/features/<domain>/
├── api/          # Data fetching & mutation hooks (TanStack Query / RTK Query / SWR / Server Actions)
├── components/   # Feature-specific UI components (forms, tables, cards)
├── schemas/      # Zod validation schemas (*.schema.ts)
└── types/        # TypeScript interfaces and DTOs (index.ts)
```

### Boundary Rules:
- **Global UI Primitives:** Place in `src/components/ui/` (shadcn/ui primitives like `button.tsx`, `input.tsx`).
- **Universal Utilities:** Place in `src/hooks/` (e.g., `useDebounce`, `useMounted`, `useMediaQuery`).
- **Global Infrastructure:** Place in `src/lib/` (`api-client.ts`, `query-client.ts`, `utils.ts`).
- **Global State:** Place in `src/stores/` (Zustand stores or Redux slices).

---

## 🚀 2. Vercel React & Next.js Performance Rules (Critical)

Adhere to Vercel Engineering's performance optimization rules:

### A. Eliminating Waterfalls (`async-`)
- **`async-parallel`:** When fetching multiple independent resources, ALWAYS use `Promise.all()` or parallel queries. NEVER await them sequentially.
  ```typescript
  // ❌ BAD: Waterfall
  const user = await fetchUser();
  const posts = await fetchPosts();

  // ✅ GOOD: Parallel
  const [user, posts] = await Promise.all([fetchUser(), fetchPosts()]);
  ```
- **`async-defer-await`:** Move `await` calls inside the conditional branches where the data is actually used.
- **`async-suspense-boundaries`:** Stream server-rendered content with React `<Suspense>` boundaries.

### B. Bundle Size Optimization (`bundle-`)
- **`bundle-barrel-imports`:** Avoid importing from root barrel files when targeting large libraries (e.g. import direct subpaths).
- **`bundle-dynamic-imports`:** Use `next/dynamic` or `React.lazy` for heavy modals, charts, sheets, or non-critical components.

### C. Server-Side & RSC Performance (`server-`)
- **`server-auth-actions`:** ALWAYS authenticate and validate permissions inside Server Actions and Route Handlers. Never trust client payload alone.
- **`server-cache-react`:** Use `React.cache()` for per-request deduplication when fetching data in Server Components.

---

## 🎨 3. UI Composition & Form Standards

- **Composition over Boolean Props:** Follow the Compound Component pattern (like shadcn/ui / Radix). Avoid adding 10+ boolean flags (`hasHeader`, `withBorder`, `isDark`) to a single component; compose smaller primitives instead.
- **Forms & Validation:**
  - ALWAYS define validation schemas using **Zod** in `src/features/<domain>/schemas/<domain>.schema.ts`.
  - ALWAYS use **React Hook Form** with `zodResolver(schema)`.
  - ALWAYS handle loading states with `<Loader2 className="animate-spin" />` and disable submit buttons while submitting.

---

## 🔄 4. State & Data Fetching Conventions

- **API Client:** Use `@/lib/api-client` (`apiClient`) which includes automatic Token Refresh mutex interceptors for `401 Unauthorized`.
- **Query Keys:** Structure query keys as hierarchical arrays: `['<domain>', '<id>', { filter }]`.
- **SSR Hydration Guard:** For client-only values (like `localStorage` or `window`), ALWAYS use `useMounted()` from `@/hooks/use-mounted` to prevent hydration mismatch errors.

---

## 🛠️ 5. Actionable Workflows & Execution Playbooks

When performing development tasks, the AI Agent MUST consult and execute according to the corresponding playbook in `.agents/workflows/`:

- **Creating a New Feature:** MUST execute [`.agents/workflows/1-new-feature.md`](file:///.agents/workflows/1-new-feature.md):
  1. **Gate 1 (Schema):** `src/features/<feature>/schemas/<feature>.schema.ts` (Zod)
  2. **Gate 2 (Types):** `src/features/<feature>/types/index.ts` (DTOs & interfaces)
  3. **Gate 3 (API):** `src/features/<feature>/api/use-<feature>.ts` (TanStack Query + apiClient)
  4. **Gate 4 (UI):** `src/features/<feature>/components/<feature>-form.tsx` (RHF + shadcn)
  5. **Gate 5 (Stories & Quality):** `<feature>-form.stories.tsx` + Prettier format & Type-check.

- **Optimizing Performance:** Follow [`.agents/workflows/2-performance-audit.md`](file:///.agents/workflows/2-performance-audit.md) (Parallelize fetches, eliminate waterfalls, dynamic imports).
- **Adding UI Components:** Follow [`.agents/workflows/3-ui-to-storybook.md`](file:///.agents/workflows/3-ui-to-storybook.md).
- **Quality & Pre-release Check:** Follow [`.agents/workflows/4-pre-release-check.md`](file:///.agents/workflows/4-pre-release-check.md).
