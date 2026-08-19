import { execa } from 'execa';
import fs from 'fs-extra';
import path from 'path';
import { applyAddons } from '../scaffold/addons.mjs';
import {
  addBaseDevDependencies,
  addShadcnDependencies,
  addShadcnComponents,
  copySharedFoundation,
  recipesDir,
  writeComponentsJson,
  writePrettierConfig,
} from '../scaffold/shared.mjs';
import { applyStateStack } from '../scaffold/state-stacks.mjs';
import { ensurePackageSections } from '../utils/package-json.mjs';
import { installAllDependencies } from '../utils/package-manager.mjs';

export async function executeNextJs(projectName, config, spinner) {
  const targetDir = path.resolve(process.cwd(), projectName);
  const pm = config.packageManager || 'npm';

  spinner.message(`Scaffolding official Next.js project via Vercel CLI (Engine: ${pm})...`);
  await execa('npx', getCreateNextAppArgs(projectName, pm));

  const mainPkgPath = path.join(targetDir, 'package.json');
  let pkg = ensurePackageSections(await fs.readJson(mainPkgPath));

  addBaseDevDependencies(pkg);
  await writePrettierConfig(targetDir);
  await copyNextAppTemplates(targetDir);

  spinner.message('Injecting Global Types & Universal Hooks...');
  await copySharedFoundation(targetDir);

  await applyStateStack({
    framework: 'nextjs',
    stateStack: config.stateStack,
    targetDir,
    pkg,
    spinner,
    wrapLayout: (ProviderName, importPath) => wrapLayout(targetDir, ProviderName, importPath),
  });

  spinner.message('Configuring shadcn/ui components & Lucide Icons...');
  addShadcnDependencies(pkg);
  await writeComponentsJson(targetDir, {
    rsc: true,
    css: 'src/app/globals.css',
    tailwindConfig: '',
  });
  await fs.writeJson(mainPkgPath, pkg, { spaces: 2 });
  await addShadcnComponents(targetDir, pm);
  pkg = ensurePackageSections(await fs.readJson(mainPkgPath));

  await applyAddons({
    addons: config.addons,
    framework: 'nextjs',
    targetDir,
    pkg,
    spinner,
  });

  await fs.writeJson(mainPkgPath, pkg, { spaces: 2 });

  spinner.message(`Installing dependencies in a single pass via [${pm}]...`);
  await installAllDependencies(targetDir, pm);
}

function getCreateNextAppArgs(projectName, pm) {
  const args = [
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

  const packageManagerFlags = {
    npm: '--use-npm',
    pnpm: '--use-pnpm',
    yarn: '--use-yarn',
    bun: '--use-bun',
  };

  if (packageManagerFlags[pm]) {
    args.push(packageManagerFlags[pm]);
  }

  return args;
}

/**
 * Preserves the default Next.js layout and injects the selected client provider
 * around the application children.
 */
async function wrapLayout(targetDir, ProviderName, importPath) {
  const layoutPath = path.join(targetDir, 'src/app/layout.tsx');
  if (!fs.existsSync(layoutPath)) return;

  let content = await fs.readFile(layoutPath, 'utf-8');
  content = normalizeLayoutProps(content);

  if (!content.includes(importPath)) {
    content = `import { ${ProviderName} } from "${importPath}";\n` + content;
  }

  if (!content.includes(`<${ProviderName}>`) && content.includes('{children}')) {
    content = content.replace('{children}', `<${ProviderName}>{children}</${ProviderName}>`);
  }

  await fs.writeFile(layoutPath, content, 'utf-8');
}

export function normalizeLayoutProps(content) {
  return content.replace(
    /function RootLayout\(\{\s*children\s*\}:\s*LayoutProps<[^>]+>\)/,
    'function RootLayout({ children }: { children: React.ReactNode })'
  );
}

async function copyNextAppTemplates(targetDir) {
  await fs.copy(
    path.join(recipesDir, 'nextjs/src/app/globals.css'),
    path.join(targetDir, 'src/app/globals.css')
  );
  await fs.copy(
    path.join(recipesDir, 'nextjs/src/app/page.tsx'),
    path.join(targetDir, 'src/app/page.tsx')
  );
  await fs.copy(
    path.join(recipesDir, 'nextjs/src/app/auth/page.tsx'),
    path.join(targetDir, 'src/app/auth/page.tsx')
  );
}
