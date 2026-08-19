import { execa } from 'execa';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { addDependencies, addDevDependencies } from '../utils/package-json.mjs';
import { baseDevDependencies, shadcnDependencies } from './dependency-groups.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const recipesDir = path.resolve(__dirname, '../recipes');
export const defaultShadcnComponents = ['button', 'input'];

export function addBaseDevDependencies(pkg) {
  addDevDependencies(pkg, baseDevDependencies);
}

export function addShadcnDependencies(pkg) {
  addDependencies(pkg, shadcnDependencies);
}

export async function writePrettierConfig(targetDir) {
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
}

export async function copySharedFoundation(targetDir) {
  await fs.copy(path.join(recipesDir, 'shared/types'), path.join(targetDir, 'src/types'));
  await fs.copy(path.join(recipesDir, 'shared/hooks'), path.join(targetDir, 'src/hooks'));
  await fs.copy(
    path.join(recipesDir, 'shared/features/home'),
    path.join(targetDir, 'src/features/home')
  );
  await fs.ensureDir(path.join(targetDir, 'src/lib'));
  await fs.copy(path.join(recipesDir, 'shared/lib/utils.ts'), path.join(targetDir, 'src/lib/utils.ts'));
}

export async function addShadcnComponents(targetDir, packageManager, components = defaultShadcnComponents) {
  const { command, args } = getShadcnAddCommand(packageManager, components);
  await execa(command, args, {
    cwd: targetDir,
    stdio: 'ignore',
  });
}

export function getShadcnAddCommand(packageManager, components = defaultShadcnComponents) {
  const addArgs = ['shadcn@latest', 'add', ...components, '--yes', '--silent'];

  if (packageManager === 'pnpm') {
    return { command: 'pnpm', args: ['dlx', ...addArgs] };
  }

  if (packageManager === 'yarn') {
    return { command: 'yarn', args: ['dlx', ...addArgs] };
  }

  if (packageManager === 'bun') {
    return { command: 'bunx', args: ['--bun', ...addArgs] };
  }

  return { command: 'npx', args: addArgs };
}

export async function writeComponentsJson(targetDir, { rsc, css, tailwindConfig = '' }) {
  await fs.writeJson(
    path.join(targetDir, 'components.json'),
    {
      $schema: 'https://ui.shadcn.com/schema.json',
      style: 'default',
      rsc,
      tsx: true,
      tailwind: {
        config: tailwindConfig,
        css,
        baseColor: 'slate',
        cssVariables: true,
      },
      aliases: {
        components: '@/components',
        utils: '@/lib/utils',
        ui: '@/components/ui',
        lib: '@/lib',
        hooks: '@/hooks',
      },
    },
    { spaces: 2 }
  );
}
