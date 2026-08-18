import { execa } from 'execa';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const recipesDir = path.resolve(__dirname, '../recipes');

export async function executeNextJs(projectName, config, spinner) {
  const targetDir = path.resolve(process.cwd(), projectName);

  // 1. RUN OFFICIAL CREATE-NEXT-APP (Non-interactive)
  spinner.message('Scaffolding official Next.js project via Vercel CLI...');
  await execa('npx', [
    'create-next-app@latest',
    projectName,
    '--typescript',
    '--tailwind',
    '--eslint',
    '--app',
    '--src-dir',
    '--import-alias',
    '@/*',
    '--use-npm',
  ]);

  const mainPkgPath = path.join(targetDir, 'package.json');
  const pkg = await fs.readJson(mainPkgPath);

  const depsToInstall = [];
  const devDepsToInstall = [
    'prettier@^3.9.6',
    'prettier-plugin-tailwindcss@^0.8.1',
    'eslint-config-prettier@^10.1.8',
  ];

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

  // 2. INJECT BASE TYPES & UNIVERSAL HOOKS
  spinner.message('Injecting Global Types & Universal Hooks...');
  await fs.copy(path.join(recipesDir, 'shared/types'), path.join(targetDir, 'src/types'));
  await fs.copy(path.join(recipesDir, 'shared/hooks'), path.join(targetDir, 'src/hooks'));

  // 3. INJECT STATE & DATA FETCHING ARCHITECTURE (4 Branches)
  const state = config.stateStack;

  if (state === 'react-query') {
    spinner.message('Configuring TanStack Query, Axios Client & Zustand...');
    depsToInstall.push(
      '@tanstack/react-query@^5.101.4',
      '@tanstack/react-query-devtools@^5.101.4',
      'axios@^1.19.0',
      'zustand@^5.0.15'
    );

    await fs.copy(path.join(recipesDir, 'shared/lib/api-client.ts'), path.join(targetDir, 'src/lib/api-client.ts'));
    await fs.copy(path.join(recipesDir, 'shared/lib/query-client.ts'), path.join(targetDir, 'src/lib/query-client.ts'));
    await fs.copy(path.join(recipesDir, 'nextjs/components/providers/query-provider.tsx'), path.join(targetDir, 'src/components/providers/query-provider.tsx'));
    await fs.copy(path.join(recipesDir, 'shared/stores/use-ui-store.ts'), path.join(targetDir, 'src/stores/use-ui-store.ts'));

    // Auth reference feature (React Query)
    await fs.copy(path.join(recipesDir, 'shared/features/auth'), path.join(targetDir, 'src/features/auth'));

    // Wrap layout.tsx with QueryProvider
    await wrapLayout(targetDir, projectName, 'QueryProvider', '@/components/providers/query-provider');

  } else if (state === 'redux-toolkit') {
    spinner.message('Configuring Redux Toolkit & RTK Query...');
    depsToInstall.push('@reduxjs/toolkit@^2.6.1', 'react-redux@^9.2.0');

    await fs.copy(path.join(recipesDir, 'state/redux-toolkit/stores'), path.join(targetDir, 'src/stores'));
    await fs.copy(path.join(recipesDir, 'state/redux-toolkit/components/providers/redux-provider.tsx'), path.join(targetDir, 'src/components/providers/redux-provider.tsx'));

    // Auth reference feature (Redux Toolkit)
    await fs.copy(path.join(recipesDir, 'shared/features/auth/schemas'), path.join(targetDir, 'src/features/auth/schemas'));
    await fs.copy(path.join(recipesDir, 'shared/features/auth/types'), path.join(targetDir, 'src/features/auth/types'));
    await fs.copy(path.join(recipesDir, 'state/redux-toolkit/features/auth/api'), path.join(targetDir, 'src/features/auth/api'));
    await fs.copy(path.join(recipesDir, 'state/redux-toolkit/features/auth/components'), path.join(targetDir, 'src/features/auth/components'));

    // Wrap layout.tsx with ReduxProvider
    await wrapLayout(targetDir, projectName, 'ReduxProvider', '@/components/providers/redux-provider');

  } else if (state === 'swr') {
    spinner.message('Configuring SWR, Axios & Zustand...');
    depsToInstall.push('swr@^2.3.2', 'axios@^1.19.0', 'zustand@^5.0.15');

    await fs.copy(path.join(recipesDir, 'shared/lib/api-client.ts'), path.join(targetDir, 'src/lib/api-client.ts'));
    await fs.copy(path.join(recipesDir, 'shared/stores/use-ui-store.ts'), path.join(targetDir, 'src/stores/use-ui-store.ts'));

    // Auth reference feature (SWR)
    await fs.copy(path.join(recipesDir, 'shared/features/auth/schemas'), path.join(targetDir, 'src/features/auth/schemas'));
    await fs.copy(path.join(recipesDir, 'shared/features/auth/types'), path.join(targetDir, 'src/features/auth/types'));
    await fs.copy(path.join(recipesDir, 'state/swr/features/auth/api'), path.join(targetDir, 'src/features/auth/api'));
    await fs.copy(path.join(recipesDir, 'state/swr/features/auth/components'), path.join(targetDir, 'src/features/auth/components'));

  } else if (state === 'native-fetch') {
    spinner.message('Configuring Next.js Server Actions & Zustand...');
    depsToInstall.push('zustand@^5.0.15');

    await fs.copy(path.join(recipesDir, 'shared/stores/use-ui-store.ts'), path.join(targetDir, 'src/stores/use-ui-store.ts'));

    // Auth reference feature (Server Actions)
    await fs.copy(path.join(recipesDir, 'shared/features/auth/schemas'), path.join(targetDir, 'src/features/auth/schemas'));
    await fs.copy(path.join(recipesDir, 'shared/features/auth/types'), path.join(targetDir, 'src/features/auth/types'));
    await fs.copy(path.join(recipesDir, 'state/native-fetch/features/auth/actions'), path.join(targetDir, 'src/features/auth/actions'));
    await fs.copy(path.join(recipesDir, 'state/native-fetch/features/auth/components'), path.join(targetDir, 'src/features/auth/components'));
  }

  // 4. INJECT SHADCN UI SYSTEM
  if (config.uiSystem === 'shadcn') {
    spinner.message('Configuring shadcn/ui components & Lucide Icons...');
    depsToInstall.push(
      'class-variance-authority@^0.7.1',
      'clsx@^2.1.1',
      'tailwind-merge@^3.6.0',
      'tailwindcss-animate@^1.0.7',
      'lucide-react@^1.31.0',
      'react-hook-form@^7.85.0',
      '@hookform/resolvers@^5.9.1',
      'zod@^3.24.2'
    );

    // components.json
    await fs.writeJson(
      path.join(targetDir, 'components.json'),
      {
        $schema: 'https://ui.shadcn.com/schema.json',
        style: 'default',
        rsc: true,
        tsx: true,
        tailwind: {
          config: 'tailwind.config.ts',
          css: 'src/app/globals.css',
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
  }

  // 5. INJECT STORYBOOK
  if (config.addons.includes('storybook')) {
    spinner.message('Configuring Storybook & Auto-story generator script...');
    devDepsToInstall.push(
      'storybook@^8.6.14',
      '@storybook/nextjs@^8.6.14',
      '@storybook/react@^8.6.14',
      '@storybook/addon-essentials@^8.6.14',
      '@storybook/addon-interactions@^8.6.14',
      '@storybook/addon-links@^8.6.14',
      '@storybook/blocks@^8.6.14'
    );

    await fs.copy(path.join(recipesDir, 'nextjs/.storybook'), path.join(targetDir, '.storybook'));
    await fs.copy(path.join(recipesDir, 'shared/scripts/add-ui.mjs'), path.join(targetDir, 'scripts/add-ui.mjs'));
    await fs.copy(path.join(recipesDir, 'shared/components/ui/button.stories.tsx'), path.join(targetDir, 'src/components/ui/button.stories.tsx'));

    pkg.scripts = {
      ...pkg.scripts,
      storybook: 'storybook dev -p 6006',
      'build-storybook': 'storybook build -o public/storybook',
      'ui:add': 'node scripts/add-ui.mjs',
    };
  }

  // 6. INJECT HUSKY & COMMITLINT
  if (config.addons.includes('husky')) {
    spinner.message('Configuring Husky, Commitlint & lint-staged...');
    devDepsToInstall.push(
      'husky@^9.1.7',
      'lint-staged@^17.3.0',
      '@commitlint/cli@^21.2.2',
      '@commitlint/config-conventional@^21.2.2'
    );

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

  // Write updated package.json
  await fs.writeJson(mainPkgPath, pkg, { spaces: 2 });

  // 7. INSTALL INJECTED PACKAGES
  spinner.message('Installing dependencies...');
  if (depsToInstall.length > 0) {
    await execa('npm', ['install', ...depsToInstall, '--legacy-peer-deps'], { cwd: targetDir });
  }
  if (devDepsToInstall.length > 0) {
    await execa('npm', ['install', '-D', ...devDepsToInstall, '--legacy-peer-deps'], { cwd: targetDir });
  }
}

async function wrapLayout(targetDir, projectName, ProviderName, importPath) {
  const layoutPath = path.join(targetDir, 'src/app/layout.tsx');
  if (fs.existsSync(layoutPath)) {
    const layoutContent = `import type { Metadata } from "next";
import { ${ProviderName} } from "${importPath}";
import "./globals.css";

export const metadata: Metadata = {
  title: "${projectName} - Enterprise Application",
  description: "Scaffolded with create-pro-stack",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <${ProviderName}>{children}</${ProviderName}>
      </body>
    </html>
  );
}
`;
    await fs.writeFile(layoutPath, layoutContent, 'utf-8');
  }
}
