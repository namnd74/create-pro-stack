import fs from 'fs-extra';
import path from 'path';
import { addDependencies } from '../utils/package-json.mjs';
import { recipesDir } from './shared.mjs';
import { pickVersions } from './versions.mjs';

const appContentByState = {
  'react-query': `import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RouterProvider } from 'react-router-dom';
import { getQueryClient } from './lib/query-client';
import { router } from './routes';

export default function App() {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
`,
  'redux-toolkit': `import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { store } from './stores/store';
import { router } from './routes';

export default function App() {
  return (
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  );
}
`,
  swr: `import { RouterProvider } from 'react-router-dom';
import { router } from './routes';

export default function App() {
  return <RouterProvider router={router} />;
}
`,
};

export async function applyStateStack({ framework, stateStack, targetDir, pkg, spinner, wrapLayout }) {
  if (stateStack === 'react-query') {
    spinner.message('Configuring TanStack Query, Axios Client & Zustand...');
    await applyReactQueryStack({ framework, targetDir, pkg, wrapLayout });
  } else if (stateStack === 'redux-toolkit') {
    spinner.message('Configuring Redux Toolkit & RTK Query...');
    await applyReduxToolkitStack({ framework, targetDir, pkg, wrapLayout });
  } else if (stateStack === 'swr') {
    spinner.message('Configuring SWR, Axios & Zustand...');
    await applySwrStack({ framework, targetDir, pkg });
  } else if (stateStack === 'native-fetch') {
    spinner.message('Configuring Next.js Server Actions & Zustand...');
    await applyNativeFetchStack({ framework, targetDir, pkg });
  } else {
    throw new Error(`Unsupported state stack: ${stateStack}`);
  }
}

async function applyReactQueryStack({ framework, targetDir, pkg, wrapLayout }) {
  addDependencies(pkg, {
    ...pickVersions(['@tanstack/react-query', '@tanstack/react-query-devtools', 'axios', 'zustand']),
  });

  await copySharedApiClient(targetDir);
  await fs.copy(path.join(recipesDir, 'shared/lib/query-client.ts'), path.join(targetDir, 'src/lib/query-client.ts'));
  await fs.copy(path.join(recipesDir, 'shared/stores/use-ui-store.ts'), path.join(targetDir, 'src/stores/use-ui-store.ts'));
  await fs.copy(path.join(recipesDir, 'shared/features/auth'), path.join(targetDir, 'src/features/auth'));

  if (framework === 'nextjs') {
    await fs.copy(
      path.join(recipesDir, 'nextjs/components/providers/query-provider.tsx'),
      path.join(targetDir, 'src/components/providers/query-provider.tsx')
    );
    await wrapLayout('QueryProvider', '@/components/providers/query-provider');
  } else {
    await writeViteApp(targetDir, 'react-query');
  }
}

async function applyReduxToolkitStack({ framework, targetDir, pkg, wrapLayout }) {
  addDependencies(pkg, {
    ...pickVersions(['@reduxjs/toolkit', 'react-redux']),
  });

  await fs.copy(path.join(recipesDir, 'state/redux-toolkit/stores'), path.join(targetDir, 'src/stores'));
  await copyAuthFeatureParts(targetDir, 'redux-toolkit');

  if (framework === 'nextjs') {
    await fs.copy(
      path.join(recipesDir, 'state/redux-toolkit/components/providers/redux-provider.tsx'),
      path.join(targetDir, 'src/components/providers/redux-provider.tsx')
    );
    await wrapLayout('ReduxProvider', '@/components/providers/redux-provider');
  } else {
    await writeViteApp(targetDir, 'redux-toolkit');
  }
}

async function applySwrStack({ framework, targetDir, pkg }) {
  addDependencies(pkg, {
    ...pickVersions(['swr', 'axios', 'zustand']),
  });

  await copySharedApiClient(targetDir);
  await fs.copy(path.join(recipesDir, 'shared/stores/use-ui-store.ts'), path.join(targetDir, 'src/stores/use-ui-store.ts'));
  await copyAuthFeatureParts(targetDir, 'swr');

  if (framework === 'react-vite') {
    await writeViteApp(targetDir, 'swr');
  }
}

async function applyNativeFetchStack({ framework, targetDir, pkg }) {
  if (framework !== 'nextjs') {
    throw new Error('The native-fetch state stack is only supported for Next.js projects.');
  }

  addDependencies(pkg, {
    ...pickVersions(['zustand']),
  });

  await fs.copy(path.join(recipesDir, 'shared/stores/use-ui-store.ts'), path.join(targetDir, 'src/stores/use-ui-store.ts'));
  await fs.copy(path.join(recipesDir, 'shared/features/auth/schemas'), path.join(targetDir, 'src/features/auth/schemas'));
  await fs.copy(path.join(recipesDir, 'shared/features/auth/types'), path.join(targetDir, 'src/features/auth/types'));
  await fs.copy(
    path.join(recipesDir, 'state/native-fetch/features/auth/actions'),
    path.join(targetDir, 'src/features/auth/actions')
  );
  await fs.copy(
    path.join(recipesDir, 'state/native-fetch/features/auth/components'),
    path.join(targetDir, 'src/features/auth/components')
  );
}

async function copySharedApiClient(targetDir) {
  await fs.copy(path.join(recipesDir, 'shared/lib/api-client.ts'), path.join(targetDir, 'src/lib/api-client.ts'));
}

async function copyAuthFeatureParts(targetDir, stateStack) {
  await fs.copy(path.join(recipesDir, 'shared/features/auth/schemas'), path.join(targetDir, 'src/features/auth/schemas'));
  await fs.copy(path.join(recipesDir, 'shared/features/auth/types'), path.join(targetDir, 'src/features/auth/types'));

  for (const part of ['api', 'components', 'store']) {
    const source = path.join(recipesDir, `state/${stateStack}/features/auth/${part}`);
    if (await fs.pathExists(source)) {
      await fs.copy(source, path.join(targetDir, `src/features/auth/${part}`));
    }
  }
}

async function writeViteApp(targetDir, stateStack) {
  await fs.writeFile(path.join(targetDir, 'src/App.tsx'), appContentByState[stateStack], 'utf-8');
}
