# 🚀 Workflow: Domain Feature Generation Pipeline

## 🎯 Purpose:
Scaffold and implement a new domain/business feature module in `src/features/<feature_name>/` adhering strictly to Clean Feature-Driven Architecture, Zod validation, and Vercel performance best practices.

---

## 🚦 Execution Pipeline & Quality Gates

### 🔹 Gate 1: Data Contract & Validation Schema
1. Create `src/features/<feature>/schemas/<feature>.schema.ts` using **Zod**.
2. Define explicit validation rules and user-friendly error messages.
3. Create `src/features/<feature>/types/index.ts` exporting inferred TypeScript types:
   ```typescript
   export type FeatureFormData = z.infer<typeof featureSchema>;
   ```
4. 🛑 **Gate Check:** TypeScript must compile without `any` types.

### 🔹 Gate 2: API & Data Fetching Layer
1. Create `src/features/<feature>/api/use-<feature>.ts`.
2. Use `@/lib/api-client` (`apiClient`) with built-in token refresh interceptor.
3. Implement `useQuery` or `useMutation` hooks with proper error handling and stale time.
4. Define hierarchical query keys: `['<feature>', id, params]`.
5. 🛑 **Gate Check:** Must handle `isPending`, `isError`, and `data` states explicitly.

### 🔹 Gate 3: UI Component & Form Layer
1. Create `src/features/<feature>/components/<feature>-form.tsx`.
2. Wire form state using `react-hook-form` with `zodResolver(featureSchema)`.
3. Reuse UI primitives from `@/components/ui/` (shadcn/ui Button, Input, etc.).
4. Add loading spinner `<Loader2 className="animate-spin" />` when mutation `isPending`.
5. 🛑 **Gate Check:** Form must prevent duplicate submissions while loading.

### 🔹 Gate 4: Storybook Integration (If enabled)
1. Create `src/features/<feature>/components/<feature>-form.stories.tsx`.
2. Configure meta with `tags: ['autodocs']` and provide standard mock props.
3. 🛑 **Gate Check:** Story must render without missing context providers.

### 🔹 Gate 5: Quality & Code Style Verification
1. Run Prettier format check to ensure clean Tailwind class sorting.
2. Verify no unused imports or missing type exports.
3. Output a summary of all generated files for review.
