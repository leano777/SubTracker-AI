import React, { ReactNode, useState, useRef, useEffect } from 'react';
import { cn } from '../../theme/theme-utils';
import { ChevronRight, Check } from 'lucide-react';

export interface MenuItem {
  id: string;
  label: string;
  icon?: ReactNode;
  shortcut?: string;
  disabled?: boolean;
  danger?: boolean;
  type?: 'item' | 'separator' | 'header';
  children?: MenuItem[];
  onClick?: () => void;
}

export interface MenuProps {
  items: MenuItem[];
  trigger: ReactNode;
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
  className?: string;
}

export function Menu({
  items,
  trigger,
  align = 'start',
  sideOffset = 4,
  className,
}: MenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setActiveSubmenu(null);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setActiveSubmenu(null);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const renderMenuItem = (item: MenuItem, index: number) => {
    if (item.type === 'separator') {
      return (
        <div
          key={item.id || index}
          className="h-px bg-[var(--color-border-primary)] my-1"
        />
      );
    }

    if (item.type === 'header') {
      return (
        <div
          key={item.id || index}
          className="px-2 py-1.5 text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider"
        >
          {item.label}
        </div>
      );
    }

    const hasChildren = item.children && item.children.length > 0;
    const isSubmenuOpen = activeSubmenu === item.id;

    return (
      <div key={item.id || index} className="relative">
        <button
          className={cn(
            'w-full flex items-center justify-between px-2 py-1.5 text-sm rounded',
            'transition-colors duration-150',
            item.disabled
              ? 'opacity-50 cursor-not-allowed'
              : item.danger
              ? 'text-[var(--color-feedback-error)] hover:bg-[var(--color-feedback-error-bg)]'
              : 'text-[var(--color-text-primary)] hover:bg-[var(--color-background-secondary)]',
            'focus:outline-none focus:bg-[var(--color-background-secondary)]'
          )}
          disabled={item.disabled}
          onClick={() => {
            if (hasChildren) {
              setActiveSubmenu(isSubmenuOpen ? null : item.id);
            } else {
              item.onClick?.();
              setIsOpen(false);
              setActiveSubmenu(null);
            }
          }}
          onMouseEnter={() => {
            if (hasChildren) {
              setActiveSubmenu(item.id);
            }
          }}
        >
          <span className="flex items-center gap-2">
            {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
            {item.label}
          </span>
          <span className="flex items-center gap-2 ml-4">
            {item.shortcut && (
              <span className="text-xs text-[var(--color-text-tertiary)]">
                {item.shortcut}
              </span>
            )}
            {hasChildren && <ChevronRight className="w-4 h-4" />}
          </span>
        </button>

        {hasChildren && isSubmenuOpen && (
          <div
            className={cn(
              'absolute left-full top-0 ml-1 min-w-[180px]',
              'bg-[var(--color-card-background)] rounded-lg shadow-lg',
              'border border-[var(--color-border-primary)]',
              'py-1 z-50'
            )}
          >
            {item.children.map((child, childIndex) =>
              renderMenuItem(child, childIndex)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative inline-block">
      <div
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer"
      >
        {trigger}
      </div>

      {isOpen && (
        <div
          ref={menuRef}
          className={cn(
            'absolute z-50 min-w-[180px] mt-1',
            'bg-[var(--color-card-background)] rounded-lg shadow-lg',
            'border border-[var(--color-border-primary)]',
            'py-1',
            'animate-[fadeIn_150ms_ease-out]',
            align === 'start' && 'left-0',
            align === 'center' && 'left-1/2 -translate-x-1/2',
            align === 'end' && 'right-0',
            className
          )}
          style={{ marginTop: `${sideOffset}px` }}
        >
          {items.map((item, index) => renderMenuItem(item, index))}
        </div>
      )}
    </div>
  );
}

// Dropdown Menu Component (simpler version)
export interface DropdownMenuProps {
  options: Array<{
    value: string;
    label: string;
    icon?: ReactNode;
    disabled?: boolean;
  }>;
  value?: string;
  onChange?: (value: string) => void;
  trigger: ReactNode;
  className?: string;
}

export function DropdownMenu({
  options,
  value,
  onChange,
  trigger,
  className,
}: DropdownMenuProps) {
  const items: MenuItem[] = options.map(option => ({
    id: option.value,
    label: option.label,
    icon: value === option.value ? <Check className="w-4 h-4" /> : option.icon,
    disabled: option.disabled,
    onClick: () => onChange?.(option.value),
  }));

  return <Menu items={items} trigger={trigger} className={className} />;
}