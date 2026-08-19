import { execa } from 'execa';

/**
 * Detect the package manager used to execute the CLI
 * @returns {'pnpm' | 'bun' | 'yarn' | 'npm'}
 */
export function detectPackageManager() {
  const userAgent = process.env.npm_config_user_agent || '';

  if (userAgent.startsWith('pnpm')) return 'pnpm';
  if (userAgent.startsWith('bun')) return 'bun';
  if (userAgent.startsWith('yarn')) return 'yarn';
  return 'npm';
}

/**
 * Run single-pass install in target directory
 * @param {string} targetDir
 * @param {'pnpm' | 'bun' | 'yarn' | 'npm'} pm
 */
export async function installAllDependencies(targetDir, pm = 'npm') {
  if (pm === 'pnpm') {
    await execa('pnpm', ['install'], { cwd: targetDir });
  } else if (pm === 'bun') {
    await execa('bun', ['install'], { cwd: targetDir });
  } else if (pm === 'yarn') {
    await execa('yarn', ['install'], { cwd: targetDir });
  } else {
    // Default npm with legacy-peer-deps for safety across varied react versions
    await execa('npm', ['install', '--legacy-peer-deps'], { cwd: targetDir });
  }
}

/**
 * Format run script command for display to user
 * @param {'pnpm' | 'bun' | 'yarn' | 'npm'} pm
 * @param {string} script
 * @param {string} [args]
 * @returns {string}
 */
export function getRunCommand(pm, script, args = '') {
  const extra = args ? ` ${args}` : '';
  if (pm === 'pnpm') {
    return `pnpm ${script}${extra}`;
  }
  if (pm === 'bun') {
    return `bun run ${script}${extra}`;
  }
  if (pm === 'yarn') {
    return `yarn ${script}${extra}`;
  }
  return `npm run ${script}${extra}`;
}
