import type { ReactNode } from 'react';
import { View } from 'react-native';

export type SidebarLayoutProps = {
  /** Left column at 1024px and wider. Below that it stacks above the content, unless `topBar` is given. */
  sidebar: ReactNode;
  /** Replaces the sidebar below 1024px (a compact nav row or menu button). The sidebar is hidden there. */
  topBar?: ReactNode;
  children: ReactNode;
};

/**
 * Responsive shell for the vendor area: sidebar + content from 1024px (Tailwind `lg`), a single column below.
 * Shopper screens do not use this; they stay at phone width inside AppFrame.
 */
export function SidebarLayout({ sidebar, topBar, children }: SidebarLayoutProps) {
  return (
    <View className="flex-1 bg-surface lg:flex-row">
      {topBar ? <View className="lg:hidden">{topBar}</View> : null}
      <View
        className={`border-b border-line lg:w-64 lg:border-b-0 lg:border-r ${topBar ? 'hidden lg:flex' : ''}`}>
        {sidebar}
      </View>
      <View className="flex-1">{children}</View>
    </View>
  );
}
