import fs from 'fs-extra';
import path from 'path';

/**
 * Merge an addon package.json into target project package.json
 * @param {string} targetDir Target project directory
 * @param {string} addonDir Addon directory
 */
export async function mergePackageJson(targetDir, addonDir) {
  const addonPkgPath = path.join(addonDir, 'addon-package.json');
  if (!fs.existsSync(addonPkgPath)) return;

  const targetPkgPath = path.join(targetDir, 'package.json');
  if (!fs.existsSync(targetPkgPath)) return;

  const targetPkg = await fs.readJson(targetPkgPath);
  const addonPkg = await fs.readJson(addonPkgPath);

  // Merge scripts
  if (addonPkg.scripts) {
    targetPkg.scripts = { ...(targetPkg.scripts || {}), ...addonPkg.scripts };
  }

  // Merge dependencies
  if (addonPkg.dependencies) {
    targetPkg.dependencies = { ...(targetPkg.dependencies || {}), ...addonPkg.dependencies };
  }

  // Merge devDependencies
  if (addonPkg.devDependencies) {
    targetPkg.devDependencies = { ...(targetPkg.devDependencies || {}), ...addonPkg.devDependencies };
  }

  // Merge lint-staged
  if (addonPkg['lint-staged']) {
    targetPkg['lint-staged'] = { ...(targetPkg['lint-staged'] || {}), ...addonPkg['lint-staged'] };
  }

  // Sort keys alphabetically in dependencies and devDependencies
  if (targetPkg.dependencies) {
    targetPkg.dependencies = Object.keys(targetPkg.dependencies)
      .sort()
      .reduce((obj, key) => {
        obj[key] = targetPkg.dependencies[key];
        return obj;
      }, {});
  }

  if (targetPkg.devDependencies) {
    targetPkg.devDependencies = Object.keys(targetPkg.devDependencies)
      .sort()
      .reduce((obj, key) => {
        obj[key] = targetPkg.devDependencies[key];
        return obj;
      }, {});
  }

  await fs.writeJson(targetPkgPath, targetPkg, { spaces: 2 });
}
