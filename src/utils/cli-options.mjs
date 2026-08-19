import path from 'path';

export const VALID_FRAMEWORKS = ['nextjs', 'react-vite'];
export const VALID_STATE_STACKS = ['react-query', 'redux-toolkit', 'swr', 'native-fetch'];
export const VALID_ADDONS = ['agents', 'storybook', 'husky'];

export function parseCliArgs(args = process.argv.slice(2)) {
  const options = {
    projectName: '',
    framework: '',
    stateStack: '',
    addons: [],
    noAgents: false,
    yes: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '-y' || arg === '--yes') {
      options.yes = true;
    } else if (arg === '--framework' || arg === '-f') {
      options.framework = args[++i] || '';
    } else if (arg === '--state' || arg === '-s') {
      options.stateStack = args[++i] || '';
    } else if (arg === '--agents') {
      addUnique(options.addons, 'agents');
    } else if (arg === '--no-agents') {
      options.noAgents = true;
    } else if (arg === '--storybook') {
      addUnique(options.addons, 'storybook');
    } else if (arg === '--husky') {
      addUnique(options.addons, 'husky');
    } else if (!arg.startsWith('-') && !options.projectName) {
      options.projectName = arg;
    }
  }

  return options;
}

export function getDefaultAddons(cliArgs) {
  const addons = new Set((cliArgs.addons || []).filter((addon) => VALID_ADDONS.includes(addon)));

  if (cliArgs.noAgents) {
    addons.delete('agents');
  } else {
    addons.add('agents');
  }

  return Array.from(addons);
}

export function validateProjectName(projectName) {
  if (!projectName || projectName.trim() === '') {
    return 'Please provide a project name.';
  }

  if (projectName !== projectName.trim()) {
    return 'Project name cannot start or end with whitespace.';
  }

  if (projectName === '.' || projectName === '..') {
    return 'Project name must be a directory name, not "." or "..".';
  }

  if (path.isAbsolute(projectName) || projectName.includes('/') || projectName.includes('\\')) {
    return 'Project name must be a simple folder name, not a path.';
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(projectName)) {
    return 'Project name can only include letters, numbers, hyphens (-), or underscores (_).';
  }

  return undefined;
}

export function validateFramework(framework) {
  if (!framework) return undefined;
  if (!VALID_FRAMEWORKS.includes(framework)) {
    return `Framework must be one of: ${VALID_FRAMEWORKS.join(', ')}.`;
  }
  return undefined;
}

export function validateStateStack(stateStack, framework) {
  if (!stateStack) return undefined;
  if (!VALID_STATE_STACKS.includes(stateStack)) {
    return `State stack must be one of: ${VALID_STATE_STACKS.join(', ')}.`;
  }
  if (framework === 'react-vite' && stateStack === 'native-fetch') {
    return 'The native-fetch state stack is only supported for Next.js projects.';
  }
  return undefined;
}

export function validateConfig(config) {
  const errors = [
    validateProjectName(config.projectName),
    validateFramework(config.framework),
    validateStateStack(config.stateStack, config.framework),
  ].filter(Boolean);

  return errors;
}

export function assertSafeTargetDir(targetDir, cwd = process.cwd()) {
  if (path.resolve(targetDir) === path.resolve(cwd)) {
    throw new Error('Refusing to scaffold into the current working directory.');
  }
}

function addUnique(items, item) {
  if (!items.includes(item)) items.push(item);
}
