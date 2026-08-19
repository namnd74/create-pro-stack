# 🚀 create-pro-stack

> **The Universal, Zero-Boilerplate Architecture Generator for Modern Web Applications.**  
> Effortlessly scaffold production-ready **Next.js** and **React + Vite** projects with battle-tested enterprise architectures and built-in **shadcn/ui**.

---

## ✨ Features

- **⚡ Orchestrator Engine (100% Future-Proof & Multi-Package-Manager)**:
  - Invokes official `create-next-app` or `create-vite` under the hood.
  - Automatically detects your package manager (`pnpm`, `bun`, `yarn`, `npm`) and executes single-pass installs.
  - Fetches the latest framework releases, compiler optimizations, and preserves Next.js fonts (Geist / Inter).
- **🏛️ Feature-Driven Clean Architecture**:
  - Organized by domain/business modules (`src/features/`) with co-located schemas, API hooks, components, and types.
- **🔄 4 Modular State & Data Fetching Stacks**:
  - **TanStack Query + Axios + Zustand** (Recommended for Dashboards & SaaS)
  - **Redux Toolkit + RTK Query** (All-in-one Enterprise Redux state & caching)
  - **SWR + Axios + Zustand** (Lightweight Vercel standard)
  - **Next.js Native** (Server Actions + Zustand, 0 KB client fetch library)
- **🎨 Built-in Standard UI System (100% shadcn/ui)**:
  - Pre-configured **shadcn/ui** + **Tailwind CSS** + **Lucide Icons** + **CVA** (Class Variance Authority) + **React Hook Form** + **Zod**.
- **📚 Storybook Integration**:
  - Auto-configured for Next.js and Vite.
  - Includes custom `ui:add <component>` script to pull shadcn components and automatically generate Storybook stories (`.stories.tsx`).
- **🛡️ Quality & Git Standards**:
  - Pre-configured **Husky**, **Commitlint** (Conventional Commits), **lint-staged**, **ESLint**, and **Prettier** with automatic Tailwind class sorting.
- **🌐 Universal Utility Hooks & Global Types**:
  - `useDebounce`, `useMounted` (SSR hydration-safe), `useMediaQuery`.
  - Standardized `ApiResponse<T>`, `PaginatedResponse<T>`, and `ApiError` interfaces.
- **🤖 Built-in AI Agent Skills & Vercel Best Practices**:
  - Auto-injects `AGENTS.md` and `.cursorrules` into every generated project.
  - Enforces Vercel Engineering's 70+ performance rules (anti-waterfall `async-parallel`, bundle optimization, RSC security).
  - Out-of-the-box scripts to pull official Vercel skills: `npm run skill:add-vercel`.

---

## 🚀 Quick Start

### 1. Interactive Mode:
```bash
# Using NPX / NPM
npx create-pro-stack

# Using PNPM
pnpm create pro-stack

# Using Bun
bunx create-pro-stack
```

### 2. Non-Interactive (CLI Flags / CI/CD):
```bash
npx create-pro-stack my-app --framework nextjs --state react-query --agents --storybook --husky -y
```

| Flag | Description | Options |
| :--- | :--- | :--- |
| `[project-name]` | Positional name of project directory | e.g. `my-app` |
| `--framework`, `-f` | Target web framework | `nextjs`, `react-vite` |
| `--state`, `-s` | State & data fetching stack | `react-query`, `redux-toolkit`, `swr`, `native-fetch` |
| `--agents` / `--no-agents` | Include AI Agent Skills & Workflows | Flag (Default: true) |
| `--storybook` | Include Storybook addon | Flag |
| `--husky` | Include Husky + Commitlint addon | Flag |
| `-y`, `--yes` | Accept defaults / skip prompts | Flag |

---

## 🧭 Interactive Prompt Walkthrough

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
◇  Select optional tools (Addons):
│  ◼ AI Agent Skills & Workflows (.agents/ & AGENTS.md)
│  ◼ Storybook (Auto-generate stories on ui:add)
│  ◼ Husky + Commitlint + lint-staged
│
└  🎉 Successfully created my-pro-app!
```

---

## 📁 Generated Project Structure

```text
my-app/
├── .agents/                        # AI Agent Specification (skills.sh standard)
│   ├── skills/
│   │   └── pro-stack-architect/
│   │       └── SKILL.md            # Enterprise architecture & Vercel rules
│   └── workflows/                  # Actionable step-by-step developer pipelines
│       ├── 1-new-feature.md
│       ├── 2-performance-audit.md
│       ├── 3-ui-to-storybook.md
│       └── 4-pre-release-check.md
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
├── AGENTS.md                       # AI Agent guidelines & Vercel Best Practices
├── components.json                 # shadcn/ui configuration
└── package.json
```

---

## 🛠️ Handy Package Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` (or `pnpm dev` / `bun dev`) | Starts the local development server |
| `npm run build` | Builds the production bundle |
| `npm run storybook` | Starts the Storybook UI component explorer |
| `npm run build-storybook` | Exports a static Storybook documentation site |
| `npm run ui:add <component>` | Adds a shadcn component and **auto-generates its story** |
| `npm run skill:add-vercel` | Pulls official Vercel React Performance Best Practices skill |
| `npm run skill:add-composition` | Pulls official Vercel React Composition Patterns skill |
| `npm run format` | Auto-formats codebase with Prettier |

---

## 📄 License

MIT © Antigravity. Free for personal and commercial use.
