import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const repoRoot = path.resolve(import.meta.dirname, '..');
const recipesDir = path.join(repoRoot, 'src/recipes');

function listFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    return entry.isDirectory() ? listFiles(fullPath) : [fullPath];
  });
}

test('recipes avoid unsafe any casts in generated TypeScript', () => {
  const files = listFiles(recipesDir).filter((file) => /\.(ts|tsx)$/.test(file));

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    assert.doesNotMatch(content, /\bas any\b|:\s*any\b/, path.relative(repoRoot, file));
  }
});

test('storybook stories are generated under src/stories', () => {
  const addons = fs.readFileSync(path.join(repoRoot, 'src/scaffold/addons.mjs'), 'utf-8');
  const story = fs.readFileSync(path.join(recipesDir, 'shared/stories/button.stories.tsx'), 'utf-8');

  assert.match(addons, /src\/stories\/button\.stories\.tsx/);
  assert.doesNotMatch(addons, /src\/components\/ui\/button\.stories\.tsx/);
  assert.match(story, /@\/components\/ui\/button/);
});
