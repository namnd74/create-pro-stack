import * as p from '@clack/prompts';
import color from 'picocolors';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { executeNextJs } from './executors/nextjs.mjs';
import { executeReactVite } from './executors/react-vite.mjs';
import { detectPackageManager, getRunCommand } from './utils/package-manager.mjs';
import {
  assertSafeTargetDir,
  getDefaultAddons,
  parseCliArgs,
  validateConfig,
  validateFramework,
  validateProjectName,
  validateStateStack,
} from './utils/cli-options.mjs';

export async function runCli() {
  console.clear();
  p.intro(color.bgCyan(color.black(' create-pro-stack ')));

  const pm = detectPackageManager();
  const cliArgs = parseCliArgs();

  const cliValidationErrors = [
    cliArgs.projectName ? validateProjectName(cliArgs.projectName) : undefined,
    cliArgs.framework ? validateFramework(cliArgs.framework) : undefined,
    cliArgs.stateStack ? validateStateStack(cliArgs.stateStack, cliArgs.framework || 'nextjs') : undefined,
  ].filter(Boolean);
  if (cliValidationErrors.length > 0) {
    p.cancel(color.red(cliValidationErrors.join('\n')));
    process.exit(1);
  }

  // Default addons: include 'agents' unless --no-agents was explicitly passed.
  const defaultAddons = getDefaultAddons(cliArgs);
  const defaultProjectName = cliArgs.projectName || 'my-pro-app';

  let config = {
    projectName: defaultProjectName,
    framework: cliArgs.framework || 'nextjs',
    stateStack: cliArgs.stateStack || 'react-query',
    addons: defaultAddons,
    packageManager: pm,
  };

  // If not all essential options were provided via CLI flags or --yes wasn't passed, run interactive prompts
  const isFullySpecified = cliArgs.projectName && cliArgs.framework && cliArgs.stateStack;
  if (!isFullySpecified && !cliArgs.yes) {
    const promptResults = await p.group(
      {
        projectName: () =>
          p.text({
            message: 'What is your project named?',
            placeholder: defaultProjectName,
            defaultValue: defaultProjectName,
            validate: (val) => {
              return validateProjectName(resolveProjectNameInput(val, defaultProjectName));
            },
          }),

        framework: () =>
          p.select({
            message: 'Select a framework:',
            options: [
              {
                value: 'nextjs',
                label: 'Next.js (App Router, RSC, SSR/SSG)',
                hint: 'Official Vercel scaffolding (Recommended)',
              },
              {
                value: 'react-vite',
                label: 'React + Vite (SPA, React Router)',
                hint: 'Official Vite scaffolding (Fast Client-side)',
              },
            ],
            initialValue: cliArgs.framework || 'nextjs',
          }),

        stateStack: ({ results }) =>
          p.select({
            message: 'Select State Management & Data Fetching architecture:',
            options:
              results.framework === 'nextjs'
                ? [
                    {
                      value: 'react-query',
                      label: 'TanStack Query + Axios + Zustand (Recommended)',
                      hint: 'Best for Dashboards, SaaS, and Realtime apps',
                    },
                    {
                      value: 'redux-toolkit',
                      label: 'Redux Toolkit + RTK Query',
                      hint: 'All-in-one Enterprise Redux state & API cache',
                    },
                    {
                      value: 'swr',
                      label: 'SWR + Axios + Zustand',
                      hint: 'Lightweight Vercel standard (~4KB)',
                    },
                    {
                      value: 'native-fetch',
                      label: 'Next.js Native (Server Actions + Zustand)',
                      hint: '0 KB client fetch library, server-first',
                    },
                  ]
                : [
                    {
                      value: 'react-query',
                      label: 'TanStack Query + Axios + Zustand (Recommended)',
                      hint: 'Best for Dashboards, SaaS, and Realtime apps',
                    },
                    {
                      value: 'redux-toolkit',
                      label: 'Redux Toolkit + RTK Query',
                      hint: 'All-in-one Enterprise Redux state & API cache',
                    },
                    {
                      value: 'swr',
                      label: 'SWR + Axios + Zustand',
                      hint: 'Lightweight client-side caching',
                    },
                  ],
            initialValue: cliArgs.stateStack || 'react-query',
          }),

        addons: () =>
          p.multiselect({
            message: 'Select optional tools (Addons):',
            options: [
              {
                value: 'agents',
                label: 'AI Agent Skills & Workflows (.agents/ & AGENTS.md)',
                hint: 'Vercel Best Practices & Playbooks (Recommended)',
              },
              {
                value: 'storybook',
                label: 'Storybook (Component documentation & preview)',
                hint: 'Component documentation & preview',
              },
              {
                value: 'husky',
                label: 'Husky + Commitlint + lint-staged',
                hint: 'Git commit standards & auto-formatting',
              },
            ],
            required: false,
            initialValues: defaultAddons,
          }),
      },
      {
        onCancel: () => {
          p.cancel('Scaffolding canceled.');
          process.exit(0);
        },
      }
    );

    config = {
      ...config,
      ...promptResults,
      projectName: resolveProjectNameInput(promptResults.projectName, defaultProjectName),
      packageManager: pm,
    };
  }

  const configValidationErrors = validateConfig(config);
  if (configValidationErrors.length > 0) {
    p.cancel(color.red(configValidationErrors.join('\n')));
    process.exit(1);
  }

  const targetDir = path.resolve(process.cwd(), config.projectName);
  try {
    assertSafeTargetDir(targetDir);
  } catch (err) {
    p.cancel(color.red(err.message));
    process.exit(1);
  }

  if (fs.existsSync(targetDir)) {
    if (!cliArgs.yes) {
      const overwrite = await p.confirm({
        message: `Directory "${config.projectName}" already exists. Overwrite?`,
        initialValue: false,
      });
      if (!overwrite) {
        p.cancel('Scaffolding aborted to avoid data loss.');
        process.exit(0);
      }
    }
    await fs.emptyDir(targetDir);
  }

  const spinner = p.spinner();
  spinner.start(`Initializing [${color.bold(config.framework)}] with shadcn/ui via [${color.cyan(pm)}]...`);

  try {
    if (config.framework === 'nextjs') {
      await executeNextJs(config.projectName, config, spinner);
    } else {
      await executeReactVite(config.projectName, config, spinner);
    }
    spinner.stop(`🎉 Successfully created ${color.green(config.projectName)}!`);
  } catch (err) {
    spinner.stop(color.red(`❌ An error occurred during scaffolding: ${err.message}`));
    console.error(err);
    process.exit(1);
  }

  const devCmd = getRunCommand(pm, 'dev');
  const storybookCmd = getRunCommand(pm, 'storybook');

  p.outro(`✨ Project ${color.bold(color.green(config.projectName))} is ready!
  
  ${color.dim('Next steps to get started:')}
  ${color.cyan(`cd ${config.projectName}`)}
  ${color.cyan(devCmd)}
  ${config.addons.includes('storybook') ? color.dim('\n  Launch Storybook:') + '\n  ' + color.cyan(storybookCmd) : ''}
  ${color.dim('\n  Add shadcn/ui components directly:')}
  ${color.cyan('npx shadcn@latest add button')}
  `);
}

export function resolveProjectNameInput(value, defaultProjectName = 'my-pro-app') {
  return typeof value === 'string' && value.length > 0 ? value : defaultProjectName;
}

const isDirectRun =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  runCli().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
