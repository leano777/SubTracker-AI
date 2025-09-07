import React, { ReactNode, useState } from 'react';
import { cn } from '../../theme/theme-utils';

export interface Tab {
  id: string;
  label: string;
  content: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  variant?: 'line' | 'enclosed' | 'pills';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
}

const tabVariants = {
  line: {
    list: 'border-b border-[var(--color-border-primary)]',
    tab: {
      base: 'relative pb-3 px-1 border-b-2 -mb-px transition-all duration-200',
      inactive: 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-secondary)]',
      active: 'border-[var(--color-brand-primary)] text-[var(--color-brand-primary)]',
      disabled: 'opacity-50 cursor-not-allowed',
    },
  },
  enclosed: {
    list: 'border-b border-[var(--color-border-primary)]',
    tab: {
      base: 'px-4 py-2 border border-b-0 -mb-px rounded-t-lg transition-all duration-200',
      inactive: 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]',
      active: 'border-[var(--color-border-primary)] border-b-[var(--color-card-background)] bg-[var(--color-card-background)] text-[var(--color-text-primary)]',
      disabled: 'opacity-50 cursor-not-allowed',
    },
  },
  pills: {
    list: 'bg-[var(--color-background-secondary)] p-1 rounded-lg',
    tab: {
      base: 'px-4 py-2 rounded-md transition-all duration-200',
      inactive: 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-background-tertiary)]',
      active: 'bg-[var(--color-card-background)] text-[var(--color-text-primary)] shadow-sm',
      disabled: 'opacity-50 cursor-not-allowed',
    },
  },
};

const tabSizes = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

export function Tabs({
  tabs,
  defaultTab,
  activeTab: controlledActiveTab,
  onTabChange,
  variant = 'line',
  size = 'md',
  fullWidth = false,
  className,
}: TabsProps) {
  const [internalActiveTab, setInternalActiveTab] = useState(
    defaultTab || tabs[0]?.id || ''
  );

  const activeTab = controlledActiveTab !== undefined ? controlledActiveTab : internalActiveTab;
  const activeTabData = tabs.find(tab => tab.id === activeTab);
  const variantStyles = tabVariants[variant];

  const handleTabClick = (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab?.disabled) return;

    if (controlledActiveTab === undefined) {
      setInternalActiveTab(tabId);
    }
    onTabChange?.(tabId);
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Tab List */}
      <div
        className={cn(
          'flex',
          fullWidth && 'w-full',
          variantStyles.list
        )}
        role="tablist"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={cn(
              'flex items-center gap-2 font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)] focus:ring-offset-2',
              tabSizes[size],
              variantStyles.tab.base,
              activeTab === tab.id
                ? variantStyles.tab.active
                : variantStyles.tab.inactive,
              tab.disabled && variantStyles.tab.disabled,
              fullWidth && 'flex-1 justify-center'
            )}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-disabled={tab.disabled}
            disabled={tab.disabled}
          >
            {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Panel */}
      {activeTabData && (
        <div
          className="pt-4"
          role="tabpanel"
          aria-labelledby={`tab-${activeTabData.id}`}
        >
          {activeTabData.content}
        </div>
      )}
    </div>
  );
}