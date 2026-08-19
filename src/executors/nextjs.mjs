import { execa } from 'execa';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { installAllDependencies } from '../utils/package-manager.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const recipesDir = path.resolve(__dirname, '../recipes');

export async function executeNextJs(projectName, config, spinner) {
  const targetDir = path.resolve(process.cwd(), projectName);
  const pm = config.packageManager || 'npm';

  // 1. RUN OFFICIAL CREATE-NEXT-APP (with --skip-install for single-pass optimization)
  spinner.message(`Scaffolding official Next.js project via Vercel CLI (Engine: ${pm})...`);
  const cnaFlags = [
    'create-next-app@latest',
    projectName,
    '--typescript',
    '--tailwind',
    '--eslint',
    '--app',
    '--src-dir',
    '--import-alias',
    '@/*',
    '--skip-install',
  ];

  if (pm === 'npm') cnaFlags.push('--use-npm');
  else if (pm === 'pnpm') cnaFlags.push('--use-pnpm');
  else if (pm === 'yarn') cnaFlags.push('--use-yarn');
  else if (pm === 'bun') cnaFlags.push('--use-bun');

  await execa('npx', cnaFlags);

  const mainPkgPath = path.join(targetDir, 'package.json');
  const pkg = await fs.readJson(mainPkgPath);
  if (!pkg.dependencies) pkg.dependencies = {};
  if (!pkg.devDependencies) pkg.devDependencies = {};

  // Base dev dependencies
  pkg.devDependencies['prettier'] = '^3.9.6';
  pkg.devDependencies['prettier-plugin-tailwindcss'] = '^0.8.1';
  pkg.devDependencies['eslint-config-prettier'] = '^10.1.8';

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

  // Ensure src/lib/utils.ts exists for shadcn
  await fs.ensureDir(path.join(targetDir, 'src/lib'));
  await fs.copy(path.join(recipesDir, 'shared/lib/utils.ts'), path.join(targetDir, 'src/lib/utils.ts'));

  // 3. INJECT STATE & DATA FETCHING ARCHITECTURE (4 Branches)
  const state = config.stateStack;

  if (state === 'react-query') {
    spinner.message('Configuring TanStack Query, Axios Client & Zustand...');
    pkg.dependencies['@tanstack/react-query'] = '^5.101.4';
    pkg.dependencies['@tanstack/react-query-devtools'] = '^5.101.4';
    pkg.dependencies['axios'] = '^1.19.0';
    pkg.dependencies['zustand'] = '^5.0.15';

    await fs.copy(path.join(recipesDir, 'shared/lib/api-client.ts'), path.join(targetDir, 'src/lib/api-client.ts'));
    await fs.copy(path.join(recipesDir, 'shared/lib/query-client.ts'), path.join(targetDir, 'src/lib/query-client.ts'));
    await fs.copy(path.join(recipesDir, 'nextjs/components/providers/query-provider.tsx'), path.join(targetDir, 'src/components/providers/query-provider.tsx'));
    await fs.copy(path.join(recipesDir, 'shared/stores/use-ui-store.ts'), path.join(targetDir, 'src/stores/use-ui-store.ts'));

    // Auth reference feature (React Query)
    await fs.copy(path.join(recipesDir, 'shared/features/auth'), path.join(targetDir, 'src/features/auth'));

    // Smart wrap layout.tsx with QueryProvider
    await wrapLayout(targetDir, 'QueryProvider', '@/components/providers/query-provider');

  } else if (state === 'redux-toolkit') {
    spinner.message('Configuring Redux Toolkit & RTK Query...');
    pkg.dependencies['@reduxjs/toolkit'] = '^2.6.1';
    pkg.dependencies['react-redux'] = '^9.2.0';

    await fs.copy(path.join(recipesDir, 'state/redux-toolkit/stores'), path.join(targetDir, 'src/stores'));
    await fs.copy(path.join(recipesDir, 'state/redux-toolkit/components/providers/redux-provider.tsx'), path.join(targetDir, 'src/components/providers/redux-provider.tsx'));

    // Auth reference feature (Redux Toolkit)
    await fs.copy(path.join(recipesDir, 'shared/features/auth/schemas'), path.join(targetDir, 'src/features/auth/schemas'));
    await fs.copy(path.join(recipesDir, 'shared/features/auth/types'), path.join(targetDir, 'src/features/auth/types'));
    await fs.copy(path.join(recipesDir, 'state/redux-toolkit/features/auth/api'), path.join(targetDir, 'src/features/auth/api'));
    await fs.copy(path.join(recipesDir, 'state/redux-toolkit/features/auth/components'), path.join(targetDir, 'src/features/auth/components'));

    // Smart wrap layout.tsx with ReduxProvider
    await wrapLayout(targetDir, 'ReduxProvider', '@/components/providers/redux-provider');

  } else if (state === 'swr') {
    spinner.message('Configuring SWR, Axios & Zustand...');
    pkg.dependencies['swr'] = '^2.3.2';
    pkg.dependencies['axios'] = '^1.19.0';
    pkg.dependencies['zustand'] = '^5.0.15';

    await fs.copy(path.join(recipesDir, 'shared/lib/api-client.ts'), path.join(targetDir, 'src/lib/api-client.ts'));
    await fs.copy(path.join(recipesDir, 'shared/stores/use-ui-store.ts'), path.join(targetDir, 'src/stores/use-ui-store.ts'));

    // Auth reference feature (SWR)
    await fs.copy(path.join(recipesDir, 'shared/features/auth/schemas'), path.join(targetDir, 'src/features/auth/schemas'));
    await fs.copy(path.join(recipesDir, 'shared/features/auth/types'), path.join(targetDir, 'src/features/auth/types'));
    await fs.copy(path.join(recipesDir, 'state/swr/features/auth/api'), path.join(targetDir, 'src/features/auth/api'));
    await fs.copy(path.join(recipesDir, 'state/swr/features/auth/components'), path.join(targetDir, 'src/features/auth/components'));

  } else if (state === 'native-fetch') {
    spinner.message('Configuring Next.js Server Actions & Zustand...');
    pkg.dependencies['zustand'] = '^5.0.15';

    await fs.copy(path.join(recipesDir, 'shared/stores/use-ui-store.ts'), path.join(targetDir, 'src/stores/use-ui-store.ts'));

    // Auth reference feature (Server Actions)
    await fs.copy(path.join(recipesDir, 'shared/features/auth/schemas'), path.join(targetDir, 'src/features/auth/schemas'));
    await fs.copy(path.join(recipesDir, 'shared/features/auth/types'), path.join(targetDir, 'src/features/auth/types'));
    await fs.copy(path.join(recipesDir, 'state/native-fetch/features/auth/actions'), path.join(targetDir, 'src/features/auth/actions'));
    await fs.copy(path.join(recipesDir, 'state/native-fetch/features/auth/components'), path.join(targetDir, 'src/features/auth/components'));
  }

  // 4. ALWAYS INJECT SHADCN UI SYSTEM (Standard Enterprise UI)
  spinner.message('Configuring shadcn/ui components & Lucide Icons...');
  pkg.dependencies['class-variance-authority'] = '^0.7.1';
  pkg.dependencies['clsx'] = '^2.1.1';
  pkg.dependencies['tailwind-merge'] = '^3.6.0';
  pkg.dependencies['tailwindcss-animate'] = '^1.0.7';
  pkg.dependencies['lucide-react'] = '^1.31.0';
  pkg.dependencies['react-hook-form'] = '^7.85.0';
  pkg.dependencies['@hookform/resolvers'] = '^5.9.1';
  pkg.dependencies['zod'] = '^3.24.2';

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

  // 5. INJECT STORYBOOK (Optional Addon)
  const addons = config.addons || [];
  if (addons.includes('storybook')) {
    spinner.message('Configuring Storybook & Auto-story generator script...');
    pkg.devDependencies['storybook'] = '^8.6.14';
    pkg.devDependencies['@storybook/nextjs'] = '^8.6.14';
    pkg.devDependencies['@storybook/react'] = '^8.6.14';
    pkg.devDependencies['@storybook/addon-essentials'] = '^8.6.14';
    pkg.devDependencies['@storybook/addon-interactions'] = '^8.6.14';
    pkg.devDependencies['@storybook/addon-links'] = '^8.6.14';
    pkg.devDependencies['@storybook/blocks'] = '^8.6.14';

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

  // 6. INJECT HUSKY & COMMITLINT (Optional Addon)
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

  // 7. INJECT AI AGENT SKILLS & WORKFLOWS (Optional Addon)
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

  // 7. SINGLE-PASS DEPENDENCY INSTALLATION
  spinner.message(`Installing dependencies in a single pass via [${pm}]...`);
  await installAllDependencies(targetDir, pm);
}

/**
 * Smart layout wrapper that preserves Next.js default font imports (Geist / Inter)
 * and cleanly injects the specified Provider around {children}.
 */
async function wrapLayout(targetDir, ProviderName, importPath) {
  const layoutPath = path.join(targetDir, 'src/app/layout.tsx');
  if (!fs.existsSync(layoutPath)) return;

  let content = await fs.readFile(layoutPath, 'utf-8');

  // 1. Add Provider import if not already present
  if (!content.includes(importPath)) {
    content = `import { ${ProviderName} } from "${importPath}";\n` + content;
  }

  // 2. Wrap {children} inside <body> with <Provider>{children}</Provider>
  if (!content.includes(`<${ProviderName}>`)) {
    if (content.includes('{children}')) {
      content = content.replace('{children}', `<${ProviderName}>{children}</${ProviderName}>`);
    }
  }

  await fs.writeFile(layoutPath, content, 'utf-8');
}
