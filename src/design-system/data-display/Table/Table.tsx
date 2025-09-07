import React, { ReactNode } from 'react';
import { cn } from '../../theme/theme-utils';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string | ReactNode;
  accessor: (item: T) => ReactNode;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
  onRowClick?: (item: T, index: number) => void;
  selectedRows?: number[];
  onSelectRow?: (index: number, selected: boolean) => void;
  onSelectAll?: (selected: boolean) => void;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  striped?: boolean;
  hoverable?: boolean;
  compact?: boolean;
}

export function Table<T extends { id?: string | number }>({
  data,
  columns,
  onSort,
  sortKey,
  sortDirection,
  onRowClick,
  selectedRows = [],
  onSelectRow,
  onSelectAll,
  loading = false,
  emptyMessage = 'No data available',
  className,
  striped = false,
  hoverable = true,
  compact = false,
}: TableProps<T>) {
  const handleSort = (key: string) => {
    if (!onSort) return;
    
    if (sortKey === key) {
      onSort(key, sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      onSort(key, 'asc');
    }
  };

  const allSelected = data.length > 0 && selectedRows.length === data.length;
  const someSelected = selectedRows.length > 0 && selectedRows.length < data.length;

  return (
    <div className={cn('w-full overflow-auto', className)}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-[var(--color-border-primary)]">
            {onSelectRow && (
              <th className={cn(
                'text-left font-semibold text-[var(--color-text-secondary)]',
                compact ? 'px-2 py-2' : 'px-4 py-3'
              )}>
                <input
                  type="checkbox"
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={(e) => onSelectAll?.(e.target.checked)}
                  className="rounded border-[var(--color-border-primary)]"
                />
              </th>
            )}
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  'font-semibold text-[var(--color-text-secondary)]',
                  compact ? 'px-2 py-2 text-sm' : 'px-4 py-3',
                  column.align === 'center' && 'text-center',
                  column.align === 'right' && 'text-right',
                  column.align === 'left' && 'text-left',
                  !column.align && 'text-left',
                  column.sortable && 'cursor-pointer select-none hover:text-[var(--color-text-primary)]'
                )}
                style={{ width: column.width }}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div className="flex items-center gap-1">
                  {column.header}
                  {column.sortable && (
                    <span className="inline-flex">
                      {sortKey === column.key ? (
                        sortDirection === 'asc' ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )
                      ) : (
                        <ChevronsUpDown className="w-4 h-4 opacity-30" />
                      )}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td
                colSpan={columns.length + (onSelectRow ? 1 : 0)}
                className="text-center py-8 text-[var(--color-text-tertiary)]"
              >
                Loading...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (onSelectRow ? 1 : 0)}
                className="text-center py-8 text-[var(--color-text-tertiary)]"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, index) => {
              const isSelected = selectedRows.includes(index);
              return (
                <tr
                  key={item.id || index}
                  className={cn(
                    'border-b border-[var(--color-border-secondary)]',
                    striped && index % 2 === 1 && 'bg-[var(--color-background-secondary)]',
                    hoverable && 'hover:bg-[var(--color-background-tertiary)]',
                    isSelected && 'bg-[var(--color-brand-primary)]/10',
                    onRowClick && 'cursor-pointer'
                  )}
                  onClick={() => onRowClick?.(item, index)}
                >
                  {onSelectRow && (
                    <td className={cn(
                      compact ? 'px-2 py-2' : 'px-4 py-3'
                    )}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          e.stopPropagation();
                          onSelectRow(index, e.target.checked);
                        }}
                        className="rounded border-[var(--color-border-primary)]"
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={cn(
                        'text-[var(--color-text-primary)]',
                        compact ? 'px-2 py-2 text-sm' : 'px-4 py-3',
                        column.align === 'center' && 'text-center',
                        column.align === 'right' && 'text-right',
                        column.align === 'left' && 'text-left',
                        !column.align && 'text-left'
                      )}
                    >
                      {column.accessor(item)}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}