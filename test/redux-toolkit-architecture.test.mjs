import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const repoRoot = path.resolve(import.meta.dirname, '..');
const reduxRecipeDir = path.join(repoRoot, 'src/recipes/state/redux-toolkit');

test('redux toolkit keeps auth state inside the auth feature', () => {
  const globalAuthSlice = path.join(reduxRecipeDir, 'stores/slices/auth-slice.ts');
  const featureAuthSlice = path.join(reduxRecipeDir, 'features/auth/store/auth-slice.ts');
  const store = fs.readFileSync(path.join(reduxRecipeDir, 'stores/store.ts'), 'utf-8');
  const loginForm = fs.readFileSync(path.join(reduxRecipeDir, 'features/auth/components/login-form.tsx'), 'utf-8');

  assert.equal(fs.existsSync(globalAuthSlice), false);
  assert.equal(fs.existsSync(featureAuthSlice), true);
  assert.match(store, /@\/features\/auth\/store\/auth-slice/);
  assert.doesNotMatch(store, /\.\/slices\/auth-slice/);
  assert.match(loginForm, /\.\.\/store\/auth-slice/);
  assert.doesNotMatch(loginForm, /@\/stores\/slices\/auth-slice/);
});

test('redux toolkit recipes use type-only imports for Vite verbatimModuleSyntax', () => {
  const files = [
    path.join(reduxRecipeDir, 'features/auth/store/auth-slice.ts'),
    path.join(reduxRecipeDir, 'stores/hooks.ts'),
    path.join(reduxRecipeDir, 'stores/slices/ui-slice.ts'),
  ];

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    assert.doesNotMatch(content, /import\s+\{[^}]*\bPayloadAction\b[^}]*\}\s+from/);
    assert.doesNotMatch(content, /import\s+\{[^}]*\bTypedUseSelectorHook\b[^}]*\}\s+from/);
  }
});
