// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, Bug, Eye, FileText, Settings, Activity } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Textarea } from '../components/ui/textarea';

interface ErrorLog {
  id: string;
  timestamp: number;
  type: 'console' | 'network' | 'component' | 'render';
  level: 'error' | 'warning' | 'info';
  message: string;
  stack?: string;
  tab?: string;
  component?: string;
}

interface NetworkTrace {
  id: string;
  timestamp: number;
  url: string;
  method: string;
  status?: number;
  error?: string;
}

interface ComponentTrace {
  id: string;
  timestamp: number;
  component: string;
  action: 'mount' | 'unmount' | 'render' | 'error' | 'suspend';
  tab: string;
  props?: any;
  error?: Error;
}

interface TabSwitchingIssueTestProps {
  onClose: () => void;
}

export const TabSwitchingIssueTest: React.FC<TabSwitchingIssueTestProps> = ({ onClose }) => {
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [networkTraces, setNetworkTraces] = useState<NetworkTrace[]>([]);
  const [componentTraces, setComponentTraces] = useState<ComponentTrace[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [testResults, setTestResults] = useState<string>('');
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [whiteScreenCount, setWhiteScreenCount] = useState(0);
  const logCountRef = useRef(0);

  // Tab switching sequence for reproduction
  const tabSequence = ['dashboard', 'planning', 'intelligence', 'settings'];

  // Error logging interceptor
  useEffect(() => {
    if (!isRecording) return;

    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    
    // Intercept console errors
    console.error = (...args) => {
      const errorId = `error-${Date.now()}-${logCountRef.current++}`;
      const errorLog: ErrorLog = {
        id: errorId,
        timestamp: Date.now(),
        type: 'console',
        level: 'error',
        message: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' '),
        stack: args.find(arg => arg instanceof Error)?.stack,
        tab: currentTab,
      };
      setErrorLogs(prev => [...prev, errorLog]);
      originalConsoleError.apply(console, args);
    };

    // Intercept console warnings
    console.warn = (...args) => {
      const warningId = `warning-${Date.now()}-${logCountRef.current++}`;
      const warningLog: ErrorLog = {
        id: warningId,
        timestamp: Date.now(),
        type: 'console',
        level: 'warning',
        message: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' '),
        tab: currentTab,
      };
      setErrorLogs(prev => [...prev, warningLog]);
      originalConsoleWarn.apply(console, args);
    };

    // Network request monitoring
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const traceId = `network-${Date.now()}-${logCountRef.current++}`;
      const url = typeof args[0] === 'string' ? args[0] : args[0].url;
      const method = args[1]?.method || 'GET';
      
      const trace: NetworkTrace = {
        id: traceId,
        timestamp: Date.now(),
        url,
        method,
      };

      try {
        const response = await originalFetch.apply(window, args);
        trace.status = response.status;
        if (!response.ok) {
          trace.error = `HTTP ${response.status} ${response.statusText}`;
        }
        return response;
      } catch (error) {
        trace.error = error instanceof Error ? error.message : String(error);
        throw error;
      } finally {
        setNetworkTraces(prev => [...prev, trace]);
      }
    };

    // Component error monitoring
    window.addEventListener('error', (event) => {
      const errorLog: ErrorLog = {
        id: `js-error-${Date.now()}-${logCountRef.current++}`,
        timestamp: Date.now(),
        type: 'component',
        level: 'error',
        message: event.message,
        stack: event.error?.stack,
        tab: currentTab,
      };
      setErrorLogs(prev => [...prev, errorLog]);
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      const errorLog: ErrorLog = {
        id: `promise-error-${Date.now()}-${logCountRef.current++}`,
        timestamp: Date.now(),
        type: 'component',
        level: 'error',
        message: `Unhandled Promise Rejection: ${event.reason}`,
        tab: currentTab,
      };
      setErrorLogs(prev => [...prev, errorLog]);
    });

    return () => {
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
      window.fetch = originalFetch;
    };
  }, [isRecording, currentTab]);

  // Automatic tab switching test
  const runTabSwitchingTest = async () => {
    setIsRecording(true);
    setErrorLogs([]);
    setNetworkTraces([]);
    setComponentTraces([]);
    setWhiteScreenCount(0);
    logCountRef.current = 0;

    let results = 'Tab Switching Issue Reproduction Test\n';
    results += '===========================================\n';
    results += `Started at: ${new Date().toISOString()}\n`;
    results += `User Agent: ${navigator.userAgent}\n`;
    results += `Screen Size: ${window.innerWidth}x${window.innerHeight}\n\n`;

    for (let cycle = 0; cycle < 3; cycle++) {
      results += `Cycle ${cycle + 1}:\n`;
      
      for (const tab of tabSequence) {
        results += `  Switching to ${tab}...\n`;
        setCurrentTab(tab);
        
        // Simulate tab click via JavaScript (like a user would do)
        const tabButton = document.querySelector(`[data-tab="${tab}"]`);
        if (tabButton) {
          (tabButton as HTMLElement).click();
        }

        // Wait for potential renders and errors
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Check for white screen (no content rendered)
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
          const isEmpty = mainContent.textContent?.trim().length === 0;
          if (isEmpty) {
            setWhiteScreenCount(prev => prev + 1);
            results += `    ⚠️ WHITE SCREEN DETECTED on ${tab} tab!\n`;
          }
        }

        // Check for error states
        const errorElements = document.querySelectorAll('[data-error-boundary="true"]');
        if (errorElements.length > 0) {
          results += `    🚨 Error boundary triggered on ${tab} tab!\n`;
        }

        // Check for loading states that never resolve
        const loadingElements = document.querySelectorAll('[data-loading="true"]');
        if (loadingElements.length > 0) {
          results += `    ⏳ Persistent loading state detected on ${tab} tab!\n`;
        }

        results += `    Status: ${isEmpty ? 'FAILED (white screen)' : 'OK'}\n`;
      }
      
      results += '\n';
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    results += 'Test Completed.\n';
    results += `Total white screens detected: ${whiteScreenCount}\n`;
    results += `Total errors logged: ${errorLogs.length}\n`;
    results += `Total network issues: ${networkTraces.filter(t => t.error).length}\n`;

    setTestResults(results);
    setIsRecording(false);
  };

  // Manual tab switching for debugging
  const switchToTab = (tabId: string) => {
    setCurrentTab(tabId);
    // Try to find and click the actual tab button
    const tabButton = document.querySelector(`button[data-tab="${tabId}"]`);
    if (tabButton) {
      (tabButton as HTMLElement).click();
    } else {
      // Fallback: try to trigger the tab change through the app's state management
      console.log(`Attempting to switch to ${tabId} tab`);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const exportBugReport = () => {
    const bugReport = {
      title: 'Bug Report ST-030: Tab Switching White Screen Issue',
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      screenSize: `${window.innerWidth}x${window.innerHeight}`,
      testResults,
      errorLogs,
      networkTraces,
      componentTraces,
      whiteScreenCount,
      affectedComponents: [
        'Layout.tsx (router)',
        'AppHeader.tsx (navigation)',
        'useTabReducer.ts (state management)',
        'ErrorBoundary.tsx (error handling)',
        'Suspense boundaries',
        'State providers'
      ],
      suspectedCauses: [
        'Race condition in state updates during tab switching',
        'Improper cleanup of component effects',
        'Async rendering issues with Suspense boundaries',
        'Memory leaks in component unmounting',
        'Router state synchronization issues',
        'Theme/context provider re-renders'
      ],
      reproductionSteps: [
        '1. Open the application (locally or on Vercel preview)',
        '2. Switch rapidly between Dashboard, Planning, Intelligence, and Settings tabs',
        '3. Observe for blank/white screens after tab switches',
        '4. Check browser console for errors',
        '5. Monitor network tab for failed requests'
      ]
    };

    const blob = new Blob([JSON.stringify(bugReport, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bug-report-ST-030-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getErrorLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bug className="w-5 h-5 text-red-500" />
              <span>Tab Switching Issue Debug Tool</span>
              <Badge variant={isRecording ? "destructive" : "secondary"}>
                {isRecording ? 'Recording' : 'Idle'}
              </Badge>
            </div>
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden">
          <Tabs defaultValue="controls" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="controls">Controls</TabsTrigger>
              <TabsTrigger value="errors">Errors ({errorLogs.length})</TabsTrigger>
              <TabsTrigger value="network">Network ({networkTraces.length})</TabsTrigger>
              <TabsTrigger value="results">Test Results</TabsTrigger>
            </TabsList>

            <TabsContent value="controls" className="flex-1 space-y-4 overflow-auto">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Automated Testing</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button 
                      onClick={runTabSwitchingTest}
                      disabled={isRecording}
                      className="w-full"
                    >
                      {isRecording ? 'Running Test...' : 'Run Full Tab Switch Test'}
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Automatically cycles through all tabs 3 times and logs issues
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Manual Testing</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="grid grid-cols-2 gap-1">
                      {tabSequence.map(tab => (
                        <Button 
                          key={tab}
                          variant={currentTab === tab ? "default" : "outline"}
                          size="sm"
                          onClick={() => switchToTab(tab)}
                        >
                          {tab}
                        </Button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Click tabs manually to reproduce issues
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Current Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Current Tab</p>
                      <p className="text-muted-foreground">{currentTab}</p>
                    </div>
                    <div>
                      <p className="font-medium">White Screens</p>
                      <p className="text-red-600 font-mono">{whiteScreenCount}</p>
                    </div>
                    <div>
                      <p className="font-medium">Total Errors</p>
                      <p className="text-red-600 font-mono">{errorLogs.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="errors" className="flex-1 overflow-auto">
              <div className="space-y-2">
                {errorLogs.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No errors logged yet. Start a test to capture errors.
                  </p>
                ) : (
                  errorLogs.map(error => (
                    <div 
                      key={error.id}
                      className={`p-3 border rounded-lg text-xs ${getErrorLevelColor(error.level)}`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium">
                          [{error.level.toUpperCase()}] {error.type} - {error.tab}
                        </span>
                        <span className="text-xs opacity-70">
                          {formatTimestamp(error.timestamp)}
                        </span>
                      </div>
                      <p className="mb-1">{error.message}</p>
                      {error.stack && (
                        <details className="mt-2">
                          <summary className="cursor-pointer">Stack Trace</summary>
                          <pre className="mt-1 text-xs bg-black/10 p-2 rounded overflow-auto">
                            {error.stack}
                          </pre>
                        </details>
                      )}
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="network" className="flex-1 overflow-auto">
              <div className="space-y-2">
                {networkTraces.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No network requests captured yet.
                  </p>
                ) : (
                  networkTraces.map(trace => (
                    <div 
                      key={trace.id}
                      className={`p-3 border rounded-lg text-xs ${
                        trace.error ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium">
                          {trace.method} {trace.url}
                        </span>
                        <span className="text-xs opacity-70">
                          {formatTimestamp(trace.timestamp)}
                        </span>
                      </div>
                      {trace.status && (
                        <p className="mb-1">Status: {trace.status}</p>
                      )}
                      {trace.error && (
                        <p className="text-red-600">Error: {trace.error}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="results" className="flex-1 overflow-auto">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <h3 className="text-lg font-medium">Test Results</h3>
                  <Button onClick={exportBugReport} variant="outline" size="sm">
                    <FileText className="w-4 h-4 mr-2" />
                    Export Bug Report
                  </Button>
                </div>
                <Textarea
                  value={testResults || 'No test results yet. Run the automated test to generate results.'}
                  readOnly
                  className="min-h-96 font-mono text-xs"
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
