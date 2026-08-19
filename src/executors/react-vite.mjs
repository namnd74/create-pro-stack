import { execa } from 'execa';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { installAllDependencies } from '../utils/package-manager.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const recipesDir = path.resolve(__dirname, '../recipes');

export async function executeReactVite(projectName, config, spinner) {
  const targetDir = path.resolve(process.cwd(), projectName);
  const pm = config.packageManager || 'npm';

  // 1. RUN OFFICIAL CREATE-VITE (Non-interactive)
  spinner.message(`Scaffolding official React + Vite project (Engine: ${pm})...`);
  await execa('npx', ['create-vite@latest', projectName, '--template', 'react-ts']);

  const mainPkgPath = path.join(targetDir, 'package.json');
  const pkg = await fs.readJson(mainPkgPath);
  if (!pkg.dependencies) pkg.dependencies = {};
  if (!pkg.devDependencies) pkg.devDependencies = {};

  // Core base dependencies
  pkg.dependencies['react-router-dom'] = '^7.18.2';
  pkg.dependencies['clsx'] = '^2.1.1';
  pkg.dependencies['tailwind-merge'] = '^3.6.0';
  pkg.dependencies['class-variance-authority'] = '^0.7.1';
  pkg.dependencies['tailwindcss-animate'] = '^1.0.7';
  pkg.dependencies['lucide-react'] = '^1.31.0';
  pkg.dependencies['react-hook-form'] = '^7.85.0';
  pkg.dependencies['@hookform/resolvers'] = '^5.9.1';
  pkg.dependencies['zod'] = '^3.24.2';

  // Core base devDependencies
  pkg.devDependencies['tailwindcss'] = '^3.4.17';
  pkg.devDependencies['postcss'] = '^8.5.26';
  pkg.devDependencies['autoprefixer'] = '^10.5.4';
  pkg.devDependencies['vite-tsconfig-paths'] = '^6.1.1';
  pkg.devDependencies['prettier'] = '^3.9.6';
  pkg.devDependencies['prettier-plugin-tailwindcss'] = '^0.8.1';
  pkg.devDependencies['eslint-config-prettier'] = '^10.1.8';

  // Configure tsconfig.app.json paths
  const tsconfigAppPath = path.join(targetDir, 'tsconfig.app.json');
  if (fs.existsSync(tsconfigAppPath)) {
    const tsconfig = await fs.readJson(tsconfigAppPath);
    tsconfig.compilerOptions = {
      ...tsconfig.compilerOptions,
      baseUrl: '.',
      paths: {
        '@/*': ['./src/*'],
      },
    };
    await fs.writeJson(tsconfigAppPath, tsconfig, { spaces: 2 });
  }

  // Configure vite.config.ts
  const viteConfigContent = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  server: {
    port: 3000,
  },
});
`;
  await fs.writeFile(path.join(targetDir, 'vite.config.ts'), viteConfigContent, 'utf-8');

  // Create .prettierrc
  await fs.writeJson(
    path.join(targetDir, '.prettierrc'),
    {
      semi: true,
      singleQuote: true,
      tabWidth: 2,
      trailingComma: 'es5',
      printWidth: 100,
      plugins: ['prettier-plugin-tailwindcss'],
    },
    { spaces: 2 }
  );

  // Setup Tailwind & CSS
  const tailwindConfigContent = `import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
} satisfies Config;
`;
  await fs.writeFile(path.join(targetDir, 'tailwind.config.ts'), tailwindConfigContent, 'utf-8');

  const postcssContent = `const postcssConfig = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
export default postcssConfig;
`;
  await fs.writeFile(path.join(targetDir, 'postcss.config.mjs'), postcssContent, 'utf-8');

  // utils.ts
  await fs.ensureDir(path.join(targetDir, 'src/lib'));
  await fs.copy(path.join(recipesDir, 'shared/lib/utils.ts'), path.join(targetDir, 'src/lib/utils.ts'));

  // index.css
  const indexCssContent = `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 48%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground antialiased;
  }
}
`;
  await fs.writeFile(path.join(targetDir, 'src/index.css'), indexCssContent, 'utf-8');

  // Copy Routes, Layouts, Types, Hooks
  await fs.copy(path.join(recipesDir, 'react-vite/src'), path.join(targetDir, 'src'));
  await fs.copy(path.join(recipesDir, 'shared/types'), path.join(targetDir, 'src/types'));
  await fs.copy(path.join(recipesDir, 'shared/hooks'), path.join(targetDir, 'src/hooks'));

  // 2. INJECT STATE & DATA FETCHING ARCHITECTURE
  const state = config.stateStack;

  if (state === 'react-query') {
    spinner.message('Configuring TanStack Query, Axios Client & Zustand...');
    pkg.dependencies['@tanstack/react-query'] = '^5.101.4';
    pkg.dependencies['@tanstack/react-query-devtools'] = '^5.101.4';
    pkg.dependencies['axios'] = '^1.19.0';
    pkg.dependencies['zustand'] = '^5.0.15';

    await fs.copy(path.join(recipesDir, 'shared/lib/api-client.ts'), path.join(targetDir, 'src/lib/api-client.ts'));
    await fs.copy(path.join(recipesDir, 'shared/lib/query-client.ts'), path.join(targetDir, 'src/lib/query-client.ts'));
    await fs.copy(path.join(recipesDir, 'shared/stores/use-ui-store.ts'), path.join(targetDir, 'src/stores/use-ui-store.ts'));

    // Auth feature (React Query)
    await fs.copy(path.join(recipesDir, 'shared/features/auth'), path.join(targetDir, 'src/features/auth'));

    const appContent = `import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RouterProvider } from 'react-router-dom';
import { queryClient } from './lib/query-client';
import { router } from './routes';

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
`;
    await fs.writeFile(path.join(targetDir, 'src/App.tsx'), appContent, 'utf-8');

  } else if (state === 'redux-toolkit') {
    spinner.message('Configuring Redux Toolkit & RTK Query...');
    pkg.dependencies['@reduxjs/toolkit'] = '^2.6.1';
    pkg.dependencies['react-redux'] = '^9.2.0';

    await fs.copy(path.join(recipesDir, 'state/redux-toolkit/stores'), path.join(targetDir, 'src/stores'));

    // Auth feature (Redux Toolkit)
    await fs.copy(path.join(recipesDir, 'shared/features/auth/schemas'), path.join(targetDir, 'src/features/auth/schemas'));
    await fs.copy(path.join(recipesDir, 'shared/features/auth/types'), path.join(targetDir, 'src/features/auth/types'));
    await fs.copy(path.join(recipesDir, 'state/redux-toolkit/features/auth/api'), path.join(targetDir, 'src/features/auth/api'));
    await fs.copy(path.join(recipesDir, 'state/redux-toolkit/features/auth/components'), path.join(targetDir, 'src/features/auth/components'));

    const appContent = `import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { store } from './stores/store';
import { router } from './routes';

export function App() {
  return (
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  );
}
`;
    await fs.writeFile(path.join(targetDir, 'src/App.tsx'), appContent, 'utf-8');

  } else if (state === 'swr') {
    spinner.message('Configuring SWR, Axios & Zustand...');
    pkg.dependencies['swr'] = '^2.3.2';
    pkg.dependencies['axios'] = '^1.19.0';
    pkg.dependencies['zustand'] = '^5.0.15';

    await fs.copy(path.join(recipesDir, 'shared/lib/api-client.ts'), path.join(targetDir, 'src/lib/api-client.ts'));
    await fs.copy(path.join(recipesDir, 'shared/stores/use-ui-store.ts'), path.join(targetDir, 'src/stores/use-ui-store.ts'));

    // Auth feature (SWR)
    await fs.copy(path.join(recipesDir, 'shared/features/auth/schemas'), path.join(targetDir, 'src/features/auth/schemas'));
    await fs.copy(path.join(recipesDir, 'shared/features/auth/types'), path.join(targetDir, 'src/features/auth/types'));
    await fs.copy(path.join(recipesDir, 'state/swr/features/auth/api'), path.join(targetDir, 'src/features/auth/api'));
    await fs.copy(path.join(recipesDir, 'state/swr/features/auth/components'), path.join(targetDir, 'src/features/auth/components'));

    const appContent = `import { RouterProvider } from 'react-router-dom';
import { router } from './routes';

export function App() {
  return <RouterProvider router={router} />;
}
`;
    await fs.writeFile(path.join(targetDir, 'src/App.tsx'), appContent, 'utf-8');
  }

  // 3. ALWAYS INJECT SHADCN UI SYSTEM
  spinner.message('Configuring shadcn/ui components & Lucide Icons...');
  await fs.writeJson(
    path.join(targetDir, 'components.json'),
    {
      $schema: 'https://ui.shadcn.com/schema.json',
      style: 'default',
      rsc: false,
      tsx: true,
      tailwind: {
        config: 'tailwind.config.ts',
        css: 'src/index.css',
        baseColor: 'slate',
        cssVariables: true,
      },
      aliases: {
        components: '@/components',
        utils: '@/lib/utils',
        ui: '@/components/ui',
      },
    },
    { spaces: 2 }
  );

  await fs.copy(path.join(recipesDir, 'shared/components/ui/button.tsx'), path.join(targetDir, 'src/components/ui/button.tsx'));
  await fs.copy(path.join(recipesDir, 'shared/components/ui/input.tsx'), path.join(targetDir, 'src/components/ui/input.tsx'));

  // 4. INJECT STORYBOOK (Optional Addon)
  const addons = config.addons || [];
  if (addons.includes('storybook')) {
    spinner.message('Configuring Storybook & Auto-story generator script...');
    pkg.devDependencies['storybook'] = '^8.6.14';
    pkg.devDependencies['@storybook/react-vite'] = '^8.6.14';
    pkg.devDependencies['@storybook/react'] = '^8.6.14';
    pkg.devDependencies['@storybook/addon-essentials'] = '^8.6.14';
    pkg.devDependencies['@storybook/addon-interactions'] = '^8.6.14';
    pkg.devDependencies['@storybook/addon-links'] = '^8.6.14';
    pkg.devDependencies['@storybook/blocks'] = '^8.6.14';

    await fs.copy(path.join(recipesDir, 'react-vite/.storybook'), path.join(targetDir, '.storybook'));
    await fs.copy(path.join(recipesDir, 'shared/scripts/add-ui.mjs'), path.join(targetDir, 'scripts/add-ui.mjs'));
    await fs.copy(path.join(recipesDir, 'shared/components/ui/button.stories.tsx'), path.join(targetDir, 'src/components/ui/button.stories.tsx'));

    pkg.scripts = {
      ...pkg.scripts,
      storybook: 'storybook dev -p 6006',
      'build-storybook': 'storybook build -o dist-storybook',
      'ui:add': 'node scripts/add-ui.mjs',
    };
  }

  // 5. INJECT HUSKY & COMMITLINT (Optional Addon)
  if (addons.includes('husky')) {
    spinner.message('Configuring Husky, Commitlint & lint-staged...');
    pkg.devDependencies['husky'] = '^9.1.7';
    pkg.devDependencies['lint-staged'] = '^17.3.0';
    pkg.devDependencies['@commitlint/cli'] = '^21.2.2';
    pkg.devDependencies['@commitlint/config-conventional'] = '^21.2.2';

    await fs.copy(path.join(recipesDir, 'shared/husky/.commitlintrc.json'), path.join(targetDir, '.commitlintrc.json'));
    await fs.copy(path.join(recipesDir, 'shared/husky/.husky'), path.join(targetDir, '.husky'));

    pkg.scripts = {
      ...pkg.scripts,
      prepare: 'husky',
      format: 'prettier --write "src/**/*.{ts,tsx,css,json}"',
      'format:check': 'prettier --check "src/**/*.{ts,tsx,css,json}"',
    };

    pkg['lint-staged'] = {
      '*.{ts,tsx}': ['prettier --write', 'eslint --fix'],
      '*.{json,css,md}': ['prettier --write'],
    };
  }

  // 6. INJECT AI AGENT SKILLS & WORKFLOWS (Optional Addon)
  if (addons.includes('agents')) {
    spinner.message('Injecting AI Agent Skills (.agents/skills) & Workflows...');
    await fs.copy(path.join(recipesDir, 'shared/AGENTS.md'), path.join(targetDir, 'AGENTS.md'));
    await fs.copy(path.join(recipesDir, 'shared/.agents'), path.join(targetDir, '.agents'));

    pkg.scripts = {
      ...pkg.scripts,
      'skill:add-vercel': 'npx skills add vercel-labs/agent-skills --skill react-best-practices',
      'skill:add-composition': 'npx skills add vercel-labs/agent-skills --skill composition-patterns',
    };
  }

  // Write updated package.json
  await fs.writeJson(mainPkgPath, pkg, { spaces: 2 });

  // 6. SINGLE-PASS DEPENDENCY INSTALLATION
  spinner.message(`Installing dependencies in a single pass via [${pm}]...`);
  await installAllDependencies(targetDir, pm);
}
