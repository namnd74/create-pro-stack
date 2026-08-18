# 🚀 create-pro-stack

> **The Universal, Zero-Boilerplate Architecture Generator for Modern Web Applications.**  
> Effortlessly scaffold production-ready **Next.js** and **React + Vite** projects with battle-tested enterprise architectures.

---

## ✨ Features

- **⚡ Orchestrator Engine (100% Future-Proof)**:
  - Invokes official `create-next-app` or `create-vite` under the hood.
  - Automatically fetches the latest framework releases, TypeScript configurations, and compiler optimizations.
- **🏛️ Feature-Driven Clean Architecture**:
  - Organized by domain/business modules (`src/features/`) with co-located schemas, API hooks, components, and types.
- **🔄 4 Modular State & Data Fetching Stacks**:
  - **TanStack Query + Axios + Zustand** (Recommended for Dashboards & SaaS)
  - **Redux Toolkit + RTK Query** (All-in-one Enterprise Redux state & caching)
  - **SWR + Axios + Zustand** (Lightweight Vercel standard)
  - **Next.js Native** (Server Actions + Zustand, 0 KB client fetch library)
- **🎨 Modern UI System**:
  - **shadcn/ui** + **Tailwind CSS** + **Lucide Icons** + **CVA** (Class Variance Authority).
- **📚 Storybook Integration**:
  - Auto-configured for Next.js and Vite.
  - Includes custom `npm run ui:add <component>` script to pull shadcn components and automatically generate Storybook stories (`.stories.tsx`).
- **🛡️ Quality & Git Standards**:
  - Pre-configured **Husky**, **Commitlint** (Conventional Commits), **lint-staged**, **ESLint**, and **Prettier**.
- **🌐 Universal Utility Hooks & Global Types**:
  - `useDebounce`, `useMounted` (SSR hydration-safe), `useMediaQuery`.
  - Standardized `ApiResponse<T>`, `PaginatedResponse<T>`, and `ApiError` interfaces.

---

## 🚀 Quick Start

### 1. Run directly via NPX:
```bash
npx create-pro-stack
```

### 2. Or install / link locally for development:
```bash
cd /path/to/create-pro-stack
npm link

# Now run anywhere:
create-pro-stack
```

---

## 🧭 Interactive Prompt Walkthrough

When you launch `create-pro-stack`, you will be guided through an interactive prompt:

```text
┌  🚀 UNIVERSAL PRO STACK SCAFFOLDER 🚀
│
◇  What is your project named?
│  my-pro-app
│
◇  Select a framework:
│  ● Next.js (App Router, RSC, SSR/SSG)
│  ○ React + Vite (SPA, React Router)
│
◇  Select State Management & Data Fetching architecture:
│  ● TanStack Query + Axios + Zustand (Recommended)
│  ○ Redux Toolkit + RTK Query
│  ○ SWR + Axios + Zustand
│  ○ Next.js Native (Server Actions + Zustand)
│
◇  Select UI & Styling system:
│  ● shadcn/ui + Tailwind CSS + Lucide Icons
│  ○ Tailwind CSS only
│
◇  Select optional tools (Addons):
│  ◼ Storybook (Auto-generate stories on ui:add)
│  ◼ Husky + Commitlint + lint-staged
│
└  🎉 Successfully created my-pro-app!
```

---

## 📁 Generated Project Structure

```text
my-app/
├── .husky/                         # Git hooks (pre-commit, commit-msg)
├── .storybook/                     # Storybook configuration
├── scripts/
│   └── add-ui.mjs                  # Script: downloads shadcn UI + generates Storybook
├── src/
│   ├── app/ (or routes/)           # Application Shell & Routing
│   ├── components/                 # Shared UI Components
│   │   └── ui/                     # shadcn/ui primitives (button, input...)
│   ├── features/                   # Domain-driven Modules (Business Logic)
│   │   └── auth/                   # Reference Auth Module:
│   │       ├── api/                # API hooks (React Query / RTK Query / SWR / Action)
│   │       ├── components/         # login-form.tsx (React Hook Form + Zod + UI)
│   │       ├── schemas/            # auth.schema.ts (Zod validation)
│   │       └── types/              # DTOs & Domain interfaces
│   ├── hooks/                      # Universal Utility Hooks
│   │   ├── use-debounce.ts
│   │   ├── use-mounted.ts          # Hydration-safe guard
│   │   └── use-media-query.ts
│   ├── lib/                        # Third-party configurations (apiClient, queryClient, utils)
│   ├── stores/                     # Client State (Zustand store or Redux store)
│   └── types/                      # Global Base Types (ApiResponse, Pagination)
├── .commitlintrc.json
├── .prettierrc
├── components.json                 # shadcn/ui configuration
└── package.json
```

---

## 🛠️ Handy NPM Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the local development server (Turbopack / Vite) |
| `npm run build` | Builds the production bundle |
| `npm run storybook` | Starts the Storybook UI component explorer |
| `npm run build-storybook` | Exports a static Storybook documentation site |
| `npm run ui:add <component>` | Adds a shadcn component and **auto-generates its story** |
| `npm run format` | Auto-formats codebase with Prettier |

---

## 📄 License

MIT © Antigravity Dev Team. Free for personal and commercial use.
