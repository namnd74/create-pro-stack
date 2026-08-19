import assert from 'node:assert/strict';
import test from 'node:test';
import {
  addDependencies,
  addDevDependencies,
  addScripts,
  ensurePackageSections,
} from '../src/utils/package-json.mjs';

test('package-json helpers initialize and merge package sections', () => {
  const pkg = {};

  ensurePackageSections(pkg);
  addDependencies(pkg, { react: '^19.0.0' });
  addDevDependencies(pkg, { prettier: '^3.0.0' });
  addScripts(pkg, { dev: 'vite' });

  assert.deepEqual(pkg.dependencies, { react: '^19.0.0' });
  assert.deepEqual(pkg.devDependencies, { prettier: '^3.0.0' });
  assert.deepEqual(pkg.scripts, { dev: 'vite' });
});
