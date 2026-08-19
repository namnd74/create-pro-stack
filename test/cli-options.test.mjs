import assert from 'node:assert/strict';
import test from 'node:test';
import {
  assertSafeTargetDir,
  getDefaultAddons,
  parseCliArgs,
  validateConfig,
  validateProjectName,
  validateStateStack,
} from '../src/utils/cli-options.mjs';
import { resolveProjectNameInput } from '../src/index.mjs';

test('parseCliArgs parses positional name, flags, addons, and yes mode', () => {
  const options = parseCliArgs([
    'my-app',
    '--framework',
    'nextjs',
    '--state',
    'react-query',
    '--storybook',
    '--husky',
    '-y',
  ]);

  assert.equal(options.projectName, 'my-app');
  assert.equal(options.framework, 'nextjs');
  assert.equal(options.stateStack, 'react-query');
  assert.deepEqual(options.addons, ['storybook', 'husky']);
  assert.equal(options.yes, true);
});

test('validateProjectName accepts simple folder names', () => {
  assert.equal(validateProjectName('my-app'), undefined);
  assert.equal(validateProjectName('my_app-2026'), undefined);
});

test('validateProjectName rejects dangerous paths and invalid names', () => {
  for (const name of ['.', '..', '../app', 'nested/app', '/tmp/app', 'bad name', ' app']) {
    assert.equal(typeof validateProjectName(name), 'string');
  }
});

test('validateConfig rejects invalid framework and state combinations', () => {
  assert.deepEqual(
    validateConfig({
      projectName: 'app',
      framework: 'typo',
      stateStack: 'react-query',
    }),
    ['Framework must be one of: nextjs, react-vite.']
  );

  assert.deepEqual(
    validateConfig({
      projectName: 'app',
      framework: 'react-vite',
      stateStack: 'native-fetch',
    }),
    ['The native-fetch state stack is only supported for Next.js projects.']
  );

  assert.equal(validateStateStack('native-fetch', 'nextjs'), undefined);
});

test('getDefaultAddons keeps agents enabled unless --no-agents is passed', () => {
  assert.deepEqual(getDefaultAddons(parseCliArgs([])), ['agents']);
  assert.deepEqual(getDefaultAddons(parseCliArgs(['--storybook'])), ['storybook', 'agents']);
  assert.deepEqual(getDefaultAddons(parseCliArgs(['--no-agents', '--storybook'])), ['storybook']);
});

test('assertSafeTargetDir refuses to scaffold into cwd', () => {
  assert.throws(
    () => assertSafeTargetDir('/tmp/current-app', '/tmp/current-app'),
    /current working directory/
  );

  assert.doesNotThrow(() => assertSafeTargetDir('/tmp/current-app/child', '/tmp/current-app'));
});

test('resolveProjectNameInput falls back to default for empty prompt values', () => {
  assert.equal(resolveProjectNameInput('', 'my-pro-app'), 'my-pro-app');
  assert.equal(resolveProjectNameInput('custom-app', 'my-pro-app'), 'custom-app');
});
