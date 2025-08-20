/**
 * Export Button Component
 * Quick access button with dropdown menu for common export actions
 */

import React, { useState } from 'react';
import { Download, FileText, Database, Calendar, MoreHorizontal } from 'lucide-react';
import exportService from '@/services/exportService';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ExportModal } from './ExportModal';
import { toast } from 'sonner';

interface ExportButtonProps {
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'sm' | 'default' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function ExportButton({ 
  variant = 'outline', 
  size = 'default', 
  showLabel = true,
  className 
}: ExportButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const quickExportCSV = async () => {
    setIsExporting(true);
    try {
      const options = exportService.getDefaultOptions();
      await exportService.downloadCSV(options);
      toast.success('CSV export downloaded!');
    } catch (error) {
      console.error('Quick export failed:', error);
      toast.error('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const quickExportJSON = async () => {
    setIsExporting(true);
    try {
      const options = {
        ...exportService.getDefaultOptions(),
        format: 'json' as const,
      };
      await exportService.downloadJSON(options);
      toast.success('JSON backup downloaded!');
    } catch (error) {
      console.error('Quick backup failed:', error);
      toast.error('Backup failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={variant}
            size={size}
            disabled={isExporting}
            className={className}
          >
            <Download className="h-4 w-4" />
            {showLabel && (
              <span className="ml-2">
                {isExporting ? 'Exporting...' : 'Export'}
              </span>
            )}
            <MoreHorizontal className="h-3 w-3 ml-1 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Quick Export</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={quickExportCSV}
            disabled={isExporting}
            className="cursor-pointer"
          >
            <FileText className="h-4 w-4 mr-2" />
            Export CSV
            <span className="ml-auto text-xs text-muted-foreground">This Year</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={quickExportJSON}
            disabled={isExporting}
            className="cursor-pointer"
          >
            <Database className="h-4 w-4 mr-2" />
            Backup JSON
            <span className="ml-auto text-xs text-muted-foreground">Full</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setIsModalOpen(true)}
            className="cursor-pointer"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Custom Export...
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ExportModal
        defaultOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}

export default ExportButton;