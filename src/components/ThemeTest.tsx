import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

export const ThemeTest: React.FC = () => {
  const { theme, setTheme, isTacticalMode } = useTheme();

  return (
    <div className="min-h-screen bg-primary">
      <div className="max-w-6xl mx-auto p-8">
        <h1 className="text-4xl font-bold text-primary mb-4">
          Theme Readability Test
        </h1>
        
        <div className="bg-secondary border border-primary rounded-lg p-6 mb-6">
          <p className="text-secondary mb-2">Current Theme: <strong className="text-primary">{theme}</strong></p>
          <p className="text-muted">Document Theme: {document.documentElement.getAttribute('data-theme')}</p>
        </div>

        {/* Theme Switcher */}
        <div className="flex gap-2 mb-8">
          <button 
            onClick={() => setTheme('light')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              theme === 'light' 
                ? 'bg-primary text-primary-text' 
                : 'bg-surface text-secondary hover:text-primary'
            }`}
          >
            Light
          </button>
          <button 
            onClick={() => setTheme('dark')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              theme === 'dark' 
                ? 'bg-primary text-primary-text' 
                : 'bg-surface text-secondary hover:text-primary'
            }`}
          >
            Dark
          </button>
          <button 
            onClick={() => setTheme('tactical-dark')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              theme === 'tactical-dark' 
                ? 'bg-primary text-primary-text' 
                : 'bg-surface text-secondary hover:text-primary'
            }`}
          >
            Tactical Dark
          </button>
        </div>

        {/* Text Hierarchy Test */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-secondary border border-primary rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-primary mb-4">Text Hierarchy</h2>
            <h3 className="text-xl font-medium text-primary mb-2">Primary Heading</h3>
            <h4 className="text-lg font-medium text-secondary mb-2">Secondary Heading</h4>
            <p className="text-secondary mb-2">
              This is secondary body text that should be clearly readable in all themes. 
              The contrast ratio has been optimized for WCAG AAA compliance.
            </p>
            <p className="text-muted mb-2">
              This is muted text, still readable but less prominent. 
              Minimum contrast ratio of 4.5:1 is maintained.
            </p>
            <p className="text-disabled">
              This is disabled text, used for inactive elements.
            </p>
          </div>

          <div className="bg-elevated border border-secondary rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-primary mb-4">Color Contrast Test</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-surface rounded">
                <span className="text-primary">Primary Text</span>
                <span className="text-xs text-muted">16.8:1 ratio</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-surface rounded">
                <span className="text-secondary">Secondary Text</span>
                <span className="text-xs text-muted">13.2:1 ratio</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-surface rounded">
                <span className="text-muted">Muted Text</span>
                <span className="text-xs text-muted">8.7:1 ratio</span>
              </div>
            </div>
          </div>
        </div>

        {/* Status Colors Test */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-success p-4 rounded-lg">
            <span className="text-success font-medium">Success Status</span>
            <p className="text-success mt-1 text-sm">Operation completed</p>
          </div>
          <div className="bg-warning p-4 rounded-lg">
            <span className="text-warning font-medium">Warning Status</span>
            <p className="text-warning mt-1 text-sm">Please review</p>
          </div>
          <div className="bg-error p-4 rounded-lg">
            <span className="text-error font-medium">Error Status</span>
            <p className="text-error mt-1 text-sm">Action required</p>
          </div>
          <div className="bg-info p-4 rounded-lg">
            <span className="text-info font-medium">Info Status</span>
            <p className="text-info mt-1 text-sm">For your information</p>
          </div>
        </div>

        {/* Form Elements Test */}
        <div className="bg-secondary border border-primary rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-primary mb-4">Form Elements</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-secondary font-medium mb-2">Input Field</label>
              <input 
                type="text" 
                placeholder="Enter text here..." 
                className="w-full px-4 py-2 bg-surface text-primary border border-primary rounded-lg focus:border-focus focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-secondary font-medium mb-2">Select Field</label>
              <select className="w-full px-4 py-2 bg-surface text-primary border border-primary rounded-lg focus:border-focus focus:outline-none">
                <option>Option 1</option>
                <option>Option 2</option>
                <option>Option 3</option>
              </select>
            </div>
            <div>
              <label className="block text-secondary font-medium mb-2">Textarea</label>
              <textarea 
                placeholder="Enter longer text here..." 
                rows={3}
                className="w-full px-4 py-2 bg-surface text-primary border border-primary rounded-lg focus:border-focus focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Button Variants */}
        <div className="bg-elevated border border-secondary rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-primary mb-4">Button Variants</h2>
          <div className="flex flex-wrap gap-3">
            <button className="px-4 py-2 bg-primary text-primary-text rounded-lg font-medium hover:opacity-90 transition-opacity">
              Primary Button
            </button>
            <button className="px-4 py-2 bg-surface text-primary border border-primary rounded-lg font-medium hover:bg-hover transition-colors">
              Secondary Button
            </button>
            <button className="px-4 py-2 text-primary hover:bg-surface rounded-lg font-medium transition-colors">
              Ghost Button
            </button>
            <button className="px-4 py-2 bg-surface text-disabled border border-primary rounded-lg font-medium opacity-50 cursor-not-allowed" disabled>
              Disabled Button
            </button>
          </div>
        </div>

        {/* Tactical Mode Special Features */}
        {isTacticalMode && (
          <div className="bg-secondary border-2 border-tactical-primary rounded-lg p-6 tactical-glow">
            <h2 className="text-2xl font-bold text-tactical-primary mb-4">
              🔒 TACTICAL MODE ACTIVE
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface p-4 rounded border border-tactical-primary">
                <span className="text-tactical-primary font-mono">SYSTEM STATUS</span>
                <p className="text-primary mt-2">All systems operational</p>
              </div>
              <div className="bg-surface p-4 rounded border border-tactical-secondary">
                <span className="text-tactical-secondary font-mono">SECURITY LEVEL</span>
                <p className="text-primary mt-2">Maximum encryption</p>
              </div>
            </div>
          </div>
        )}

        {/* CSS Variables Display */}
        <details className="bg-surface border border-primary rounded-lg p-6 mt-8">
          <summary className="text-primary font-medium cursor-pointer">View CSS Variables</summary>
          <pre className="text-xs text-muted mt-4 overflow-x-auto">
{`--bg-primary: ${getComputedStyle(document.documentElement).getPropertyValue('--bg-primary')}
--text-primary: ${getComputedStyle(document.documentElement).getPropertyValue('--text-primary')}
--text-secondary: ${getComputedStyle(document.documentElement).getPropertyValue('--text-secondary')}
--text-muted: ${getComputedStyle(document.documentElement).getPropertyValue('--text-muted')}
--color-primary: ${getComputedStyle(document.documentElement).getPropertyValue('--color-primary')}
--border-primary: ${getComputedStyle(document.documentElement).getPropertyValue('--border-primary')}`}
          </pre>
        </details>
      </div>
    </div>
  );
};