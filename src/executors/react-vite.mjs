import { execa } from 'execa';
import fs from 'fs-extra';
import { applyEdits, modify } from 'jsonc-parser';
import path from 'path';
import { applyAddons } from '../scaffold/addons.mjs';
import { reactViteDependencies, reactViteDevDependencies } from '../scaffold/dependency-groups.mjs';
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
import { addDependencies, addDevDependencies, ensurePackageSections } from '../utils/package-json.mjs';
import { installAllDependencies } from '../utils/package-manager.mjs';

export async function executeReactVite(projectName, config, spinner) {
  const targetDir = path.resolve(process.cwd(), projectName);
  const pm = config.packageManager || 'npm';

  spinner.message(`Scaffolding official React + Vite project (Engine: ${pm})...`);
  await execa('npx', ['create-vite@latest', projectName, '--template', 'react-ts']);

  const mainPkgPath = path.join(targetDir, 'package.json');
  let pkg = ensurePackageSections(await fs.readJson(mainPkgPath));

  addReactViteBaseDependencies(pkg);
  await configureTypeScriptPaths(targetDir);
  await copyReactViteRootTemplates(targetDir);
  await writePrettierConfig(targetDir);

  await fs.copy(path.join(recipesDir, 'react-vite/src'), path.join(targetDir, 'src'));

  spinner.message('Injecting Global Types & Universal Hooks...');
  await copySharedFoundation(targetDir);

  await applyStateStack({
    framework: 'react-vite',
    stateStack: config.stateStack,
    targetDir,
    pkg,
    spinner,
  });

  spinner.message('Configuring shadcn/ui components & Lucide Icons...');
  addShadcnDependencies(pkg);
  await writeComponentsJson(targetDir, {
    rsc: false,
    css: 'src/index.css',
    tailwindConfig: '',
  });
  await fs.writeJson(mainPkgPath, pkg, { spaces: 2 });
  await addShadcnComponents(targetDir, pm);
  pkg = ensurePackageSections(await fs.readJson(mainPkgPath));

  await applyAddons({
    addons: config.addons,
    framework: 'react-vite',
    targetDir,
    pkg,
    spinner,
  });

  await fs.writeJson(mainPkgPath, pkg, { spaces: 2 });

  spinner.message(`Installing dependencies in a single pass via [${pm}]...`);
  await installAllDependencies(targetDir, pm);
}

function addReactViteBaseDependencies(pkg) {
  addDependencies(pkg, reactViteDependencies);

  addBaseDevDependencies(pkg);
  addDevDependencies(pkg, reactViteDevDependencies);
}

export async function configureTypeScriptPaths(targetDir) {
  await writeTsconfigPaths(path.join(targetDir, 'tsconfig.json'));
  await writeTsconfigPaths(path.join(targetDir, 'tsconfig.app.json'));
}

async function writeTsconfigPaths(tsconfigPath) {
  if (!fs.existsSync(tsconfigPath)) return;

  let content = await fs.readFile(tsconfigPath, 'utf-8');
  const formattingOptions = {
    insertSpaces: true,
    tabSize: 2,
    eol: '\n',
  };

  content = applyEdits(
    content,
    modify(content, ['compilerOptions', 'paths'], { '@/*': ['./src/*'] }, { formattingOptions })
  );

  await fs.writeFile(tsconfigPath, content, 'utf-8');
}

async function copyReactViteRootTemplates(targetDir) {
  await fs.copy(path.join(recipesDir, 'react-vite/vite.config.ts'), path.join(targetDir, 'vite.config.ts'));
}
