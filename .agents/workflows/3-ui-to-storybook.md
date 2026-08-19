# 🎨 Workflow: UI Component & Storybook Generation

## 🎯 Purpose:
Add new shadcn/ui components or create custom compound UI primitives, automatically configuring Storybook stories and maintaining accessibility standards.

---

## 🚦 Execution Steps

### 🔹 Step 1: Add Component
- Run: `npm run ui:add <component_name>` (e.g. `npm run ui:add dialog`).
- Verify the file is generated in `src/components/ui/<component_name>.tsx`.

### 🔹 Step 2: Auto-Generate Storybook Story
- The script automatically generates `src/components/ui/<component_name>.stories.tsx`.
- Review the generated story to add rich variant examples (e.g. Primary, Secondary, Destructive, Disabled, Loading).

### 🔹 Step 3: Compound Component Composition
- When building custom components, compose existing shadcn primitives instead of creating large monoliths with dozens of boolean props.
- Ensure accessible ARIA attributes and keyboard navigation are preserved.

### 🔹 Step 4: Verification
- Verify in Storybook explorer: `npm run storybook`.
- Check that all stories render cleanly with zero console warnings.
