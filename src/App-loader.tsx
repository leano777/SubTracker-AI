import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import './index.css';

// Try loading components one by one to isolate the issue
export const AppLoader = () => {
  const [error, setError] = React.useState<string | null>(null);
  const [loaded, setLoaded] = React.useState(false);
  
  React.useEffect(() => {
    const loadApp = async () => {
      try {
        console.log('AppLoader: Loading AuthProvider...');
        const { AuthProvider } = await import('./contexts/AuthContext');
        
        console.log('AppLoader: Loading ThemeProvider...');
        const { ThemeProvider } = await import('./contexts/ThemeContext');
        
        console.log('AppLoader: Loading Design System Providers...');
        const { DesignSystemThemeProvider } = await import('./design-system/theme/theme-provider');
        const { ToastProvider } = await import('./design-system/feedback/Toast/Toast');
        
        console.log('AppLoader: Loading AppRouter...');
        const { AppRouter } = await import('./AppRouter');
        
        console.log('AppLoader: Loading SimpleErrorBoundary...');
        const { SimpleErrorBoundary } = await import('./components/SimpleErrorBoundary');
        
        console.log('AppLoader: Loading Toaster...');
        const { Toaster } = await import('sonner');
        
        console.log('AppLoader: All components loaded successfully');
        
        // Create the full app component
        const FullApp = () => (
          <SimpleErrorBoundary fallback={<div>Error in app</div>}>
            <BrowserRouter>
              <AuthProvider>
                <ThemeProvider>
                  <DesignSystemThemeProvider>
                    <ToastProvider>
                      <AppRouter />
                      <Toaster position="top-right" />
                    </ToastProvider>
                  </DesignSystemThemeProvider>
                </ThemeProvider>
              </AuthProvider>
            </BrowserRouter>
          </SimpleErrorBoundary>
        );
        
        // Store it for rendering
        window.__FullApp = FullApp;
        setLoaded(true);
      } catch (err: any) {
        console.error('AppLoader: Failed to load component:', err);
        setError(err.message || 'Unknown error');
      }
    };
    
    loadApp();
  }, []);
  
  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h1>Failed to load application</h1>
        <pre>{error}</pre>
      </div>
    );
  }
  
  if (!loaded) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>Loading application...</h1>
      </div>
    );
  }
  
  const FullApp = (window as any).__FullApp;
  return <FullApp />;
};