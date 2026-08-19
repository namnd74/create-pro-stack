# 🛡️ Workflow: Pre-Release Quality & Build Check

## 🎯 Purpose:
Execute a thorough automated quality verification before merging pull requests or deploying to production.

---

## 🚦 Verification Pipeline

### 🔹 Step 1: Code Formatting & Linting
```bash
npm run format:check
# or auto-fix:
npm run format
```

### 🔹 Step 2: TypeScript Type Safety Check
Ensure 100% strict type-safety across the entire codebase with zero errors:
```bash
npx tsc --noEmit
```

### 🔹 Step 3: Production Build Verification
Verify that both the core application and static assets compile successfully:
```bash
npm run build
```

### 🔹 Step 4: Storybook Build (If enabled)
Verify that all UI stories compile into static documentation without missing providers:
```bash
npm run build-storybook
```

### 🔹 Step 5: Git Commit Conventions
Ensure commit messages adhere to Conventional Commits (enforced via Commitlint & Husky):
- `feat: add user authentication form`
- `fix: resolve token refresh race condition`
- `perf: eliminate waterfall requests in dashboard`
