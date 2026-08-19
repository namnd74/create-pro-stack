import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {
  defaultShadcnComponents,
  getShadcnAddCommand,
  writeComponentsJson,
} from '../src/scaffold/shared.mjs';

test('components.json omits Tailwind config by default for Tailwind v4 projects', async () => {
  const targetDir = await mkdtemp(path.join(tmpdir(), 'create-pro-stack-components-'));

  try {
    await writeComponentsJson(targetDir, {
      rsc: true,
      css: 'src/app/globals.css',
    });

    const componentsJson = JSON.parse(await readFile(path.join(targetDir, 'components.json'), 'utf-8'));

    assert.equal(componentsJson.tailwind.config, '');
    assert.equal(componentsJson.tailwind.css, 'src/app/globals.css');
    assert.equal(componentsJson.aliases.lib, '@/lib');
    assert.equal(componentsJson.aliases.hooks, '@/hooks');
  } finally {
    await rm(targetDir, { recursive: true, force: true });
  }
});

test('components.json can still write a Tailwind config path for legacy projects', async () => {
  const targetDir = await mkdtemp(path.join(tmpdir(), 'create-pro-stack-components-'));

  try {
    await writeComponentsJson(targetDir, {
      rsc: false,
      css: 'src/index.css',
      tailwindConfig: 'tailwind.config.ts',
    });

    const componentsJson = JSON.parse(await readFile(path.join(targetDir, 'components.json'), 'utf-8'));

    assert.equal(componentsJson.tailwind.config, 'tailwind.config.ts');
    assert.equal(componentsJson.tailwind.css, 'src/index.css');
  } finally {
    await rm(targetDir, { recursive: true, force: true });
  }
});

test('getShadcnAddCommand builds argv without shell strings', () => {
  assert.deepEqual(getShadcnAddCommand('npm', ['button', 'input']), {
    command: 'npx',
    args: ['shadcn@latest', 'add', 'button', 'input', '--yes', '--silent'],
  });

  assert.deepEqual(getShadcnAddCommand('pnpm', ['button']), {
    command: 'pnpm',
    args: ['dlx', 'shadcn@latest', 'add', 'button', '--yes', '--silent'],
  });
});

test('default shadcn components stay minimal for the starter app', () => {
  assert.deepEqual(defaultShadcnComponents, ['button', 'input']);
  assert.deepEqual(getShadcnAddCommand('npm').args, [
    'shadcn@latest',
    'add',
    'button',
    'input',
    '--yes',
    '--silent',
  ]);
});
