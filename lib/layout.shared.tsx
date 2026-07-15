import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { DocsAccountNav } from '@/components/docs/DocsAccountNav';
import { appName, gitConfig } from './shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      // JSX supported
      title: appName,
      children: <DocsAccountNav />,
    },
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
