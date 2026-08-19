import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { normalizeLayoutProps } from '../src/executors/nextjs.mjs';

test('normalizeLayoutProps removes dependency on generated Next LayoutProps helper', () => {
  const content = `export default function RootLayout({ children }: LayoutProps<"/">) {
  return <html>{children}</html>;
}
`;

  const normalized = normalizeLayoutProps(content);

  assert.match(normalized, /RootLayout\(\{ children \}: \{ children: React\.ReactNode \}\)/);
  assert.doesNotMatch(normalized, /LayoutProps/);
});

test('Next home page uses the shared starter home and dedicated auth route', async () => {
  const page = await readFile('src/recipes/nextjs/src/app/page.tsx', 'utf-8');
  const authPage = await readFile('src/recipes/nextjs/src/app/auth/page.tsx', 'utf-8');

  assert.match(page, /StarterHome/);
  assert.match(page, /authHref="\/auth"/);
  assert.doesNotMatch(page, /LoginForm/);
  assert.match(authPage, /LoginForm/);
});
