import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { parse } from 'jsonc-parser';
import { configureTypeScriptPaths } from '../src/executors/react-vite.mjs';

test('configureTypeScriptPaths supports JSONC tsconfig from create-vite', async () => {
  const targetDir = await mkdtemp(path.join(tmpdir(), 'create-pro-stack-vite-'));
  const rootTsconfigPath = path.join(targetDir, 'tsconfig.json');
  const tsconfigPath = path.join(targetDir, 'tsconfig.app.json');

  try {
    await writeFile(
      rootTsconfigPath,
      `{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" }
  ]
}
`,
      'utf-8'
    );
    await writeFile(
      tsconfigPath,
      `{
  "compilerOptions": {
    "target": "es2023",

    /* Bundler mode */
    "moduleResolution": "bundler",
  },
  "include": ["src"]
}
`,
      'utf-8'
    );

    await configureTypeScriptPaths(targetDir);

    const rootContent = await readFile(rootTsconfigPath, 'utf-8');
    const rootParsed = parse(rootContent);
    const content = await readFile(tsconfigPath, 'utf-8');
    const parsed = parse(content);

    assert.deepEqual(rootParsed.compilerOptions.paths, { '@/*': ['./src/*'] });
    assert.equal(parsed.compilerOptions.baseUrl, undefined);
    assert.deepEqual(parsed.compilerOptions.paths, { '@/*': ['./src/*'] });
    assert.match(content, /\/\* Bundler mode \*\//);
  } finally {
    await rm(targetDir, { recursive: true, force: true });
  }
});
