import * as p from '@clack/prompts';
import color from 'picocolors';
import fs from 'fs-extra';
import path from 'path';
import { executeNextJs } from './executors/nextjs.mjs';
import { executeReactVite } from './executors/react-vite.mjs';
import { detectPackageManager, getRunCommand } from './utils/package-manager.mjs';

function parseCliArgs() {
  const args = process.argv.slice(2);
  const options = {
    projectName: '',
    framework: '',
    stateStack: '',
    addons: [],
    yes: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '-y' || arg === '--yes') {
      options.yes = true;
    } else if (arg === '--framework' || arg === '-f') {
      options.framework = args[++i];
    } else if (arg === '--state' || arg === '-s') {
      options.stateStack = args[++i];
    } else if (arg === '--agents') {
      if (!options.addons.includes('agents')) options.addons.push('agents');
    } else if (arg === '--no-agents') {
      options.noAgents = true;
    } else if (arg === '--storybook') {
      if (!options.addons.includes('storybook')) options.addons.push('storybook');
    } else if (arg === '--husky') {
      if (!options.addons.includes('husky')) options.addons.push('husky');
    } else if (!arg.startsWith('-') && !options.projectName) {
      options.projectName = arg;
    }
  }

  return options;
}

export async function runCli() {
  console.clear();
  p.intro(color.bgCyan(color.black(' 🚀 UNIVERSAL PRO STACK SCAFFOLDER 🚀 ')));

  const pm = detectPackageManager();
  const cliArgs = parseCliArgs();

  // Default addons: include 'agents' unless --no-agents was explicitly passed
  const defaultAddons = cliArgs.noAgents ? cliArgs.addons : (cliArgs.addons.length > 0 ? cliArgs.addons : ['agents']);

  let config = {
    projectName: cliArgs.projectName || 'my-pro-app',
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
            placeholder: 'my-pro-app',
            defaultValue: cliArgs.projectName || 'my-pro-app',
            validate: (val) => {
              if (!val || val.trim() === '') return 'Please provide a project name!';
              if (!/^[a-zA-Z0-9-_]+$/.test(val))
                return 'Project name can only include letters, numbers, hyphens (-), or underscores (_)';
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
                label: 'Storybook (Auto-generate stories on ui:add)',
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
      packageManager: pm,
    };
  }

  const targetDir = path.resolve(process.cwd(), config.projectName);

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
  const uiAddCmd = getRunCommand(pm, 'ui:add', 'button');

  p.outro(`✨ Project ${color.bold(color.green(config.projectName))} is ready!
  
  ${color.dim('Next steps to get started:')}
  ${color.cyan(`cd ${config.projectName}`)}
  ${color.cyan(devCmd)}
  ${config.addons.includes('storybook') ? color.dim('\n  Launch Storybook:') + '\n  ' + color.cyan(storybookCmd) : ''}
  ${config.addons.includes('storybook') ? color.dim('\n  Add shadcn component & auto-generate story:') + '\n  ' + color.cyan(uiAddCmd) : ''}
  `);
}

runCli().catch((err) => {
  console.error(err);
  process.exit(1);
});
