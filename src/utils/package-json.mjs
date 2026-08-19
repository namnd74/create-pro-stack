export function ensurePackageSections(pkg) {
  pkg.dependencies ||= {};
  pkg.devDependencies ||= {};
  pkg.scripts ||= {};
  return pkg;
}

export function addDependencies(pkg, dependencies) {
  ensurePackageSections(pkg);
  Object.assign(pkg.dependencies, dependencies);
}

export function addDevDependencies(pkg, devDependencies) {
  ensurePackageSections(pkg);
  Object.assign(pkg.devDependencies, devDependencies);
}

export function addScripts(pkg, scripts) {
  ensurePackageSections(pkg);
  Object.assign(pkg.scripts, scripts);
}
