# create-pro-stack

A CLI for scaffolding opinionated Next.js and React + Vite apps with feature-based architecture, shadcn/ui, typed validation, and optional project tooling.

It uses the official framework starters (`create-next-app` and `create-vite`) first, then adds a consistent application structure and selected libraries.

Requires Node.js 22.12 or newer.

## Quick Start

```bash
npx create-pro-stack
```

```bash
pnpm create pro-stack
```

```bash
bunx create-pro-stack
```

## Examples

```bash
npx create-pro-stack my-app --framework nextjs --state react-query -y
```

```bash
pnpm create pro-stack my-app --framework react-vite --state swr --storybook -y
```

```bash
npx create-pro-stack my-app --framework nextjs --state native-fetch --no-agents -y
```

## CLI Options

| Option | Description | Values |
| :--- | :--- | :--- |
| `[project-name]` | Target folder name. Must be a simple folder name, not a path. | `my-app` |
| `--framework`, `-f` | Framework to scaffold. | `nextjs`, `react-vite` |
| `--state`, `-s` | State and data-fetching stack. | `react-query`, `redux-toolkit`, `swr`, `native-fetch` |
| `--agents` / `--no-agents` | Include AI agent guidance files. | default: enabled |
| `--storybook` | Add Storybook config and starter stories. | flag |
| `--husky` | Add Husky, Commitlint, and lint-staged. | flag |
| `-y`, `--yes` | Skip prompts and use provided/default options. | flag |

Safety rules:

- Project names cannot be `.`, `..`, absolute paths, or nested paths like `../app`.
- The CLI refuses to scaffold directly into the current working directory.
- Existing valid target folders require confirmation unless `-y` is used.

## Generated Stack

Frameworks:

- Next.js App Router
- React + Vite

State and data-fetching options:

- TanStack Query + Axios + Zustand
- Redux Toolkit + RTK Query
- SWR + Axios + Zustand
- Next.js native Server Actions + Zustand

Included foundation:

- Feature-based folders under `src/features`
- Shared hooks, types, and `src/lib` helpers
- shadcn/ui-compatible `components.json`
- Tailwind CSS v4 setup without `tailwind.config.ts`
- `button` and `input` added through the official shadcn/ui CLI
- Zod + React Hook Form setup in the auth reference feature

Optional tooling:

- Storybook
- Husky, Commitlint, and lint-staged
- `AGENTS.md` and `.agents` workflow files for generated projects

## Generated Structure

```text
my-app/
├── src/
│   ├── app/ or routes/
│   ├── components/
│   │   └── ui/
│   ├── features/
│   │   └── auth/
│   ├── hooks/
│   ├── lib/
│   ├── stores/
│   └── types/
├── components.json
├── package.json
└── AGENTS.md / .agents/   # when agents are enabled
```

## shadcn/ui

Generated projects use the official shadcn/ui CLI directly:

```bash
npx shadcn@latest add button
```

## Development

```bash
npm test
```

```bash
npm run test:pack
```

`test:pack` uses a local `.npm-cache` folder so it does not depend on the machine's global npm cache.

## Publish Checklist

```bash
npm test
npm run test:pack
npm login
npm whoami
npm version patch
npm publish --access public
```

After publishing to npm, the package can be used with `npx`, `pnpm create`, `pnpm dlx`, and `bunx`.

## License

MIT
