# ⚡ Workflow: Performance & Anti-Waterfall Audit

## 🎯 Purpose:
Audit React components and Next.js routes to eliminate Network Waterfalls, reduce client bundle size, and ensure optimal Server-Side Rendering patterns according to Vercel Engineering guidelines.

---

## 🚦 Audit Checklist & Remediation Steps

### 🔹 Phase 1: Network Waterfall Elimination (`async-`)
1. **Search for Sequential Awaits:** Scan for back-to-back `await` statements that do not depend on each other.
2. **Apply `async-parallel`:** Refactor independent fetches to `Promise.all([fetchA(), fetchB()])`.
3. **Apply `async-defer-await`:** Move `await` inside conditional branches where the data is actually consumed.
4. **Apply `async-suspense`:** Wrap slower components in `<Suspense fallback={<Skeleton />}>` for progressive streaming.

### 🔹 Phase 2: Client Bundle Optimization (`bundle-`)
1. **Audit Imports:** Replace barrel file imports with direct subpath imports (`bundle-barrel-imports`).
2. **Lazy-load Heavy Modals:** Use `next/dynamic` or `React.lazy` for dialogs, date pickers, and charts (`bundle-dynamic-imports`).
3. **Defer Non-Critical Scripts:** Move analytics, tracking, and feedback widgets to load after hydration.

### 🔹 Phase 3: Server & RSC Optimization (`server-`)
1. **Deduplicate Server Fetching:** Use `React.cache()` to wrap per-request data fetching functions.
2. **Server Actions Security:** Ensure all Server Actions validate inputs with Zod and enforce authentication checks (`server-auth-actions`).

### 🔹 Phase 4: Verification & Reporting
1. Run `npm run build` to verify no static generation or serialization errors.
2. Generate a prioritized summary of performance improvements made.
