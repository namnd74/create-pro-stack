export const versions = {
  '@commitlint/cli': '^21.2.2',
  '@commitlint/config-conventional': '^21.2.2',
  '@hookform/resolvers': '^5.9.1',
  '@radix-ui/react-slot': '^1.3.3',
  '@reduxjs/toolkit': '^2.12.0',
  '@storybook/addon-docs': '^10.5.9',
  '@storybook/addon-links': '^10.5.9',
  '@storybook/nextjs': '^10.5.9',
  '@storybook/react': '^10.5.9',
  '@storybook/react-vite': '^10.5.9',
  '@tailwindcss/vite': '^4.3.3',
  '@tanstack/react-query': '^5.101.4',
  '@tanstack/react-query-devtools': '^5.101.4',
  '@vitejs/plugin-react': '^6.0.5',
  axios: '^1.19.0',
  'class-variance-authority': '^0.7.1',
  clsx: '^2.1.1',
  'eslint-config-prettier': '^10.1.8',
  husky: '^9.1.7',
  'lint-staged': '^17.3.0',
  'lucide-react': '^1.33.0',
  prettier: '^3.9.6',
  'prettier-plugin-tailwindcss': '^0.8.1',
  'react-hook-form': '^7.85.0',
  'react-redux': '^9.3.0',
  'react-router-dom': '^7.18.2',
  storybook: '^10.5.9',
  swr: '^2.5.1',
  tailwindcss: '^4.3.3',
  'tailwind-merge': '^3.6.0',
  zod: '^4.4.3',
  zustand: '^5.0.15',
};

export function pickVersions(packageNames) {
  return Object.fromEntries(
    packageNames.map((packageName) => {
      const version = versions[packageName];
      if (!version) {
        throw new Error(`Missing pinned version for package: ${packageName}`);
      }
      return [packageName, version];
    })
  );
}
