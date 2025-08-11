import React, { useState } from 'react';
import { Bug } from 'lucide-react';
import { Button } from './ui/button';
import { TabSwitchingIssueTest } from '../test/TabSwitchingIssueTest';

export const DebugToolButton: React.FC = () => {
  const [showDebugTool, setShowDebugTool] = useState(false);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="fixed bottom-4 right-4 z-40 bg-orange-500/20 hover:bg-orange-500/30 backdrop-blur-sm border border-orange-400/50"
        onClick={() => setShowDebugTool(true)}
        title="Open Tab Switching Debug Tool (Development Only)"
      >
        <Bug className="w-4 h-4 text-orange-500" />
      </Button>

      {showDebugTool && (
        <TabSwitchingIssueTest onClose={() => setShowDebugTool(false)} />
      )}
    </>
  );
};
