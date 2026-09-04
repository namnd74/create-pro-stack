import fs from 'fs-extra';
import path from 'path';
import { addDevDependencies, addScripts } from '../utils/package-json.mjs';
import { recipesDir } from './shared.mjs';
import { pickVersions } from './versions.mjs';

const storybookCommonDevDependencies = {
  ...pickVersions([
    'storybook',
    '@storybook/react',
    '@storybook/addon-docs',
    '@storybook/addon-links',
  ]),
};

const storybookFrameworkConfig = {
  nextjs: {
    devDependencies: pickVersions(['@storybook/nextjs']),
    buildOutput: 'public/storybook',
  },
  'react-vite': {
    devDependencies: pickVersions(['@storybook/react-vite']),
    buildOutput: 'dist-storybook',
  },
};

export async function applyAddons({ addons = [], framework, targetDir, pkg, spinner }) {
  if (addons.includes('storybook')) {
    spinner.message('Configuring Storybook...');
    await applyStorybookAddon({ framework, targetDir, pkg });
  }

  if (addons.includes('husky')) {
    spinner.message('Configuring Husky, Commitlint & lint-staged...');
    await applyHuskyAddon({ targetDir, pkg });
  }

  if (addons.includes('agents')) {
    spinner.message('Injecting AI Agent Skills (.agents/skills) & Workflows...');
    await applyAgentsAddon({ targetDir, pkg });
  }
}

export async function applyStorybookAddon({ framework, targetDir, pkg }) {
  const config = storybookFrameworkConfig[framework];
  if (!config) {
    throw new Error(`Unsupported Storybook framework: ${framework}`);
  }

  addDevDependencies(pkg, {
    ...storybookCommonDevDependencies,
    ...config.devDependencies,
  });

  await fs.copy(path.join(recipesDir, framework, '.storybook'), path.join(targetDir, '.storybook'));
  await fs.copy(
    path.join(recipesDir, 'shared/stories/button.stories.tsx'),
    path.join(targetDir, 'src/stories/button.stories.tsx')
  );

  addScripts(pkg, {
    storybook: 'storybook dev -p 6006',
    'build-storybook': `storybook build -o ${config.buildOutput}`,
  });
}

export async function applyHuskyAddon({ targetDir, pkg }) {
  addDevDependencies(pkg, {
    ...pickVersions(['husky', 'lint-staged', '@commitlint/cli', '@commitlint/config-conventional']),
  });

  await fs.copy(path.join(recipesDir, 'shared/husky/.commitlintrc.json'), path.join(targetDir, '.commitlintrc.json'));
  await fs.copy(path.join(recipesDir, 'shared/husky/.husky'), path.join(targetDir, '.husky'));

  addScripts(pkg, {
    prepare: 'husky',
    format: 'prettier --write "src/**/*.{ts,tsx,css,json}"',
    'format:check': 'prettier --check "src/**/*.{ts,tsx,css,json}"',
  });

  pkg['lint-staged'] = {
    '*.{ts,tsx}': ['prettier --write', 'eslint --fix'],
    '*.{json,css,md}': ['prettier --write'],
  };
}

export async function applyAgentsAddon({ targetDir, pkg }) {
  await fs.copy(path.join(recipesDir, 'shared/AGENTS.md'), path.join(targetDir, 'AGENTS.md'));
  await fs.copy(path.join(recipesDir, 'shared/.agents'), path.join(targetDir, '.agents'));

  addScripts(pkg, {
    'skill:add-vercel': 'npx skills add vercel-labs/agent-skills --skill vercel-react-best-practices',
    'skill:add-composition': 'npx skills add vercel-labs/agent-skills --skill vercel-composition-patterns',
  });
}
