import assert from 'node:assert/strict';
import test from 'node:test';
import {
  baseDevDependencies,
  reactViteDependencies,
  reactViteDevDependencies,
  shadcnDependencies,
} from '../src/scaffold/dependency-groups.mjs';
import { versions, pickVersions } from '../src/scaffold/versions.mjs';

test('pickVersions returns pinned versions for known packages', () => {
  assert.deepEqual(pickVersions(['react-router-dom', 'zustand']), {
    'react-router-dom': versions['react-router-dom'],
    zustand: versions.zustand,
  });
});

test('pickVersions fails fast for unknown packages', () => {
  assert.throws(() => pickVersions(['missing-package']), /Missing pinned version/);
});

test('shared dependency groups do not contain missing versions', () => {
  for (const dependencyGroup of [
    baseDevDependencies,
    shadcnDependencies,
    reactViteDependencies,
    reactViteDevDependencies,
  ]) {
    for (const [packageName, version] of Object.entries(dependencyGroup)) {
      assert.equal(typeof packageName, 'string');
      assert.match(version, /^\^?\d+\.\d+\.\d+/);
    }
  }
});
