import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const componentName = process.argv[2];
if (!componentName) {
  console.error('❌ Please provide a component name (e.g. pnpm ui:add button or npm run ui:add button)');
  process.exit(1);
}

console.log(`📦 Fetching ${componentName} from shadcn/ui...`);
try {
  execSync(`npx shadcn@latest add ${componentName} -y`, { stdio: 'inherit' });
} catch (err) {
  console.error(`⚠️ Error running shadcn add: ${err.message}`);
}

const uiDir = path.resolve('src/components/ui');
const componentPath = path.join(uiDir, `${componentName}.tsx`);
const storyPath = path.join(uiDir, `${componentName}.stories.tsx`);

if (fs.existsSync(componentPath) && !fs.existsSync(storyPath)) {
  const pascalName = componentName
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('');

  const storyContent = `import type { Meta, StoryObj } from '@storybook/react';
import { ${pascalName} } from './${componentName}';

/**
 * Documentation & Preview for ${pascalName} (shadcn/ui).
 */
const meta: Meta<typeof ${pascalName}> = {
  title: 'UI/${pascalName}',
  component: ${pascalName},
  tags: ['autodocs'],
  argTypes: {},
};

export default meta;
type Story = StoryObj<typeof ${pascalName}>;

export const Default: Story = {
  args: {
    children: '${pascalName} Preview',
  },
};
`;

  fs.writeFileSync(storyPath, storyContent, 'utf-8');
  console.log(`✅ [Storybook] Auto-generated: src/components/ui/${componentName}.stories.tsx`);
}
