import { pickVersions } from './versions.mjs';

export const baseDevDependencies = {
  ...pickVersions(['prettier', 'prettier-plugin-tailwindcss', 'eslint-config-prettier']),
};

export const shadcnDependencies = {
  ...pickVersions([
    'class-variance-authority',
    '@radix-ui/react-slot',
    'clsx',
    'tailwind-merge',
    'lucide-react',
    'react-hook-form',
    '@hookform/resolvers',
    'zod',
  ]),
};

export const reactViteDependencies = {
  ...pickVersions(['react-router-dom']),
};

export const reactViteDevDependencies = {
  ...pickVersions(['@tailwindcss/vite', '@vitejs/plugin-react', 'tailwindcss']),
};
