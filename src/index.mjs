import * as p from '@clack/prompts';
import color from 'picocolors';
import fs from 'fs-extra';
import path from 'path';
import { executeNextJs } from './executors/nextjs.mjs';
import { executeReactVite } from './executors/react-vite.mjs';

export async function runCli() {
  console.clear();
  p.intro(color.bgCyan(color.black(' 🚀 UNIVERSAL PRO STACK SCAFFOLDER 🚀 ')));

  const config = await p.group(
    {
      projectName: () =>
        p.text({
          message: 'What is your project named?',
          placeholder: 'my-pro-app',
          defaultValue: 'my-pro-app',
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
        }),

      uiSystem: () =>
        p.select({
          message: 'Select UI & Styling system:',
          options: [
            {
              value: 'shadcn',
              label: 'shadcn/ui + Tailwind CSS + Lucide Icons',
              hint: 'Modern Enterprise standard (Button, Input, CVA)',
            },
            {
              value: 'tailwind-only',
              label: 'Tailwind CSS only',
              hint: 'Pure Tailwind without pre-built components',
            },
          ],
        }),

      addons: () =>
        p.multiselect({
          message: 'Select optional tools (Addons):',
          options: [
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
        }),
    },
    {
      onCancel: () => {
        p.cancel('Scaffolding canceled.');
        process.exit(0);
      },
    }
  );

  const targetDir = path.resolve(process.cwd(), config.projectName);

  if (fs.existsSync(targetDir)) {
    const overwrite = await p.confirm({
      message: `Directory "${config.projectName}" already exists. Overwrite?`,
      initialValue: false,
    });
    if (!overwrite) {
      p.cancel('Scaffolding aborted to avoid data loss.');
      process.exit(0);
    }
    await fs.emptyDir(targetDir);
  }

  const spinner = p.spinner();
  spinner.start(`Initializing [${color.bold(config.framework)}] project via Orchestrator Engine...`);

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

  p.outro(`✨ Project ${color.bold(color.green(config.projectName))} is ready!
  
  ${color.dim('Next steps to get started:')}
  ${color.cyan(`cd ${config.projectName}`)}
  ${color.cyan('npm run dev')}
  ${config.addons.includes('storybook') ? color.dim('\n  Launch Storybook:') + '\n  ' + color.cyan('npm run storybook') : ''}
  ${config.addons.includes('storybook') && config.uiSystem === 'shadcn' ? color.dim('\n  Add shadcn component & auto-generate story:') + '\n  ' + color.cyan('npm run ui:add button') : ''}
  `);
}

runCli().catch((err) => {
  console.error(err);
  process.exit(1);
});
