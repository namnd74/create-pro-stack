---
name: pro-stack-architect
description: Enterprise Clean Architecture and Vercel Best Practices assistant for Next.js, React, and create-pro-stack projects. Enforces domain-driven feature modules, Zod validation, TanStack Query/Zustand state, shadcn/ui composition, and anti-waterfall performance optimizations.
license: MIT
metadata:
  author: Antigravity
  version: "1.0.0"
---

# Pro Stack Architect & Vercel Best Practices Skill

This skill guides AI coding assistants in scaffolding, writing, refactoring, and reviewing enterprise web applications built with **create-pro-stack**, Next.js App Router, and React (Vite).

## When to Apply

Use this skill when:
- Creating new features or modules in a `create-pro-stack` or Next.js project.
- Writing data fetching hooks (TanStack Query, RTK Query, SWR, Server Actions).
- Designing UI components with shadcn/ui and Tailwind CSS.
- Implementing forms with Zod schema validation and React Hook Form.
- Auditing and optimizing React/Next.js performance (eliminating waterfalls, reducing bundle size).

---

## 🏛️ 1. Architecture Rules (Feature-Driven Clean Architecture)

Organize code by business domain in `src/features/<domain>/`:

```text
src/features/<domain>/
├── api/          # use-*.ts (Query/Mutation hooks calling @/lib/api-client)
├── components/   # *-form.tsx, *-table.tsx, *-card.tsx
├── schemas/      # *.schema.ts (Zod validation schemas)
└── types/        # index.ts (DTOs and domain interfaces)
```

### Boundary Rules:
- **Global UI Primitives:** Place in `src/components/ui/` (shadcn/ui primitives like `button.tsx`, `input.tsx`).
- **Universal Utilities:** Place in `src/hooks/` (e.g., `useDebounce`, `useMounted`, `useMediaQuery`).
- **Global Infrastructure:** Place in `src/lib/` (`api-client.ts`, `query-client.ts`, `utils.ts`).
- **Global State:** Place in `src/stores/` (Zustand stores or Redux slices).

---

## 🚀 2. Vercel Engineering Performance Guardrails

### ⚡ Eliminating Waterfalls (Critical)
- **`async-parallel`**: Parallelize independent async tasks with `Promise.all()`.
- **`async-defer-await`**: Do not await data until the execution path actually requires it.
- **`async-suspense`**: Wrap slow async components in `<Suspense fallback={<Skeleton />}>` to enable streaming.

### 📦 Bundle Optimization (Critical)
- **`bundle-dynamic-imports`**: Lazy-load heavy dialogs, rich text editors, and charts using `next/dynamic` or `React.lazy`.
- **`bundle-barrel-imports`**: Avoid large root barrel imports that defeat tree-shaking.

### 🛡️ Server-Side Performance (High)
- **`server-auth-actions`**: Server Actions are public HTTP endpoints. Always verify authentication and validate input payload with Zod on the server.
- **`server-cache-react`**: Deduplicate duplicate server fetch calls within a single render pass using `React.cache()`.

---

## 🎨 3. UI System & Form Conventions

- **Compound Components:** Build accessible, flexible components by composing Radix/shadcn primitives (`@/components/ui/`) rather than passing dozens of boolean props.
- **Form Standard:**
  1. Define Zod schema: `export const itemSchema = z.object({ ... });`
  2. Infer type: `export type ItemFormData = z.infer<typeof itemSchema>;`
  3. Wire with React Hook Form: `useForm<ItemFormData>({ resolver: zodResolver(itemSchema) })`
  4. Use loading spinner `<Loader2 className="animate-spin" />` during mutation `isPending`.

---

## 📋 Feature Generation Checklist for AI

When generating a new domain feature `<name>`:
1. [ ] Create `src/features/<name>/schemas/<name>.schema.ts` with strict Zod types.
2. [ ] Create `src/features/<name>/types/index.ts` exporting data contracts.
3. [ ] Create `src/features/<name>/api/use-<name>.ts` with TanStack Query / Axios.
4. [ ] Create `src/features/<name>/components/<name>-form.tsx` (RHF + Zod + shadcn).
5. [ ] (Optional) Create `src/features/<name>/components/<name>-form.stories.tsx`.
