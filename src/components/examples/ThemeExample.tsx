/**
 * Theme Example Component
 * Demonstrates the ST-032 design-token implementation
 */

import React from 'react';
import { useTheme } from 'next-themes';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';

export const ThemeExample: React.FC = () => {
  const { theme: currentTheme, setTheme } = useTheme();

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-4">
        <h1 className="h1 gradient-text">Design Token System Demo</h1>
        <p className="body-lg text-muted-foreground">
          ST-032: Complete implementation with Figma design variables
        </p>
      </div>

      {/* Theme Controls */}
      <Card className="card-glass p-4 space-y-4">
        <h2 className="h3">Theme Variants</h2>
        <div className="flex gap-2">
          <Button
            className="btn-primary"
            onClick={() => setTheme('light')}
            variant={currentTheme === 'light' ? 'default' : 'outline'}
          >
            Light
          </Button>
          <Button
            className="btn-primary"
            onClick={() => setTheme('dark')}
            variant={currentTheme === 'dark' ? 'default' : 'outline'}
          >
            Dark
          </Button>
          <Button
            className="btn-primary"
            onClick={() => setTheme('stealth-ops')}
            variant={currentTheme === 'stealth-ops' ? 'default' : 'outline'}
          >
            Stealth Ops
          </Button>
        </div>
      </Card>

      {/* Typography Demo */}
      <Card className="card-elevated p-6 space-y-4">
        <h2 className="h2">Typography Scale</h2>
        <div className="space-y-3">
          <h1 className="h1">Heading 1 - Display XL</h1>
          <h2 className="h2">Heading 2 - Display LG</h2>
          <h3 className="h3">Heading 3 - Display MD</h3>
          <h4 className="h4">Heading 4 - Heading XL</h4>
          <h5 className="h5">Heading 5 - Heading LG</h5>
          <h6 className="h6">Heading 6 - Heading MD</h6>
          <p className="body-xl">Body XL - Large body text</p>
          <p className="body-lg">Body LG - Default body text</p>
          <p className="body-md">Body MD - Secondary text</p>
          <p className="body-sm">Body SM - Small text</p>
          <p className="body-xs">Body XS - Caption text</p>
          <p className="caption">CAPTION - Uppercase labels</p>
          <code className="code">inline code example</code>
          <pre className="code-block">
{`function example() {
  return 'Block code example';
}`}
          </pre>
        </div>
      </Card>

      {/* Color Demo */}
      <Card className="card-flat p-6 space-y-4">
        <h2 className="h2">Design Token Colors</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <h4 className="h6">Primary Scale</h4>
            <div className="flex flex-col gap-1">
              <div className="bg-primary-50 p-2 rounded text-primary-950">50</div>
              <div className="bg-primary-100 p-2 rounded text-primary-900">100</div>
              <div className="bg-primary-500 p-2 rounded text-primary-50">500</div>
              <div className="bg-primary-900 p-2 rounded text-primary-50">900</div>
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="h6">Success Scale</h4>
            <div className="flex flex-col gap-1">
              <div className="bg-success-50 p-2 rounded text-success-950">50</div>
              <div className="bg-success-100 p-2 rounded text-success-900">100</div>
              <div className="bg-success-500 p-2 rounded text-success-50">500</div>
              <div className="bg-success-900 p-2 rounded text-success-50">900</div>
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="h6">Warning Scale</h4>
            <div className="flex flex-col gap-1">
              <div className="bg-warning-50 p-2 rounded text-warning-950">50</div>
              <div className="bg-warning-100 p-2 rounded text-warning-900">100</div>
              <div className="bg-warning-500 p-2 rounded text-warning-50">500</div>
              <div className="bg-warning-900 p-2 rounded text-warning-50">900</div>
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="h6">Destructive Scale</h4>
            <div className="flex flex-col gap-1">
              <div className="bg-destructive-50 p-2 rounded text-destructive-950">50</div>
              <div className="bg-destructive-100 p-2 rounded text-destructive-900">100</div>
              <div className="bg-destructive-500 p-2 rounded text-destructive-50">500</div>
              <div className="bg-destructive-900 p-2 rounded text-destructive-50">900</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Glass Effects Demo */}
      <div className="space-y-4">
        <h2 className="h2">Glassmorphic Components</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-card p-4 space-y-2">
            <h3 className="h4 text-contrast-high">Glass Card</h3>
            <p className="body-sm text-contrast-medium">
              Glassmorphic design with backdrop blur
            </p>
          </div>
          <div className="glass-surface p-4 space-y-2">
            <h3 className="h4 text-contrast-high">Glass Surface</h3>
            <p className="body-sm text-contrast-medium">
              Secondary glass surface variant
            </p>
          </div>
          <div className="glass-panel space-y-2">
            <h3 className="h4 text-contrast-high">Glass Panel</h3>
            <p className="body-sm text-contrast-medium">
              Full glass panel with padding
            </p>
          </div>
        </div>
      </div>

      {/* Component Variants */}
      <Card className="card-elevated p-6 space-y-4">
        <h2 className="h2">Component Variants</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="h4 mb-2">Button Variants</h3>
            <div className="flex gap-2">
              <Button className="btn-primary">Primary</Button>
              <Button className="btn-secondary">Secondary</Button>
              <Button className="btn-ghost">Ghost</Button>
              <Button className="btn-outline">Outline</Button>
            </div>
          </div>

          <div>
            <h3 className="h4 mb-2">Badge Variants</h3>
            <div className="flex gap-2">
              <Badge className="badge-default">Default</Badge>
              <Badge className="badge-secondary">Secondary</Badge>
              <Badge className="badge-destructive">Destructive</Badge>
              <Badge className="badge-outline">Outline</Badge>
            </div>
          </div>

          <div>
            <h3 className="h4 mb-2">Input Variants</h3>
            <div className="space-y-2 max-w-md">
              <input
                className="input-field"
                placeholder="Standard input field"
              />
              <input
                className="input-glass"
                placeholder="Glass input field"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Spacing & Layout Demo */}
      <Card className="card-flat p-6 space-y-4">
        <h2 className="h2">Spacing System</h2>
        <div className="space-y-2">
          <div className="bg-accent p-1 rounded">p-1 (0.25rem)</div>
          <div className="bg-accent p-2 rounded">p-2 (0.5rem)</div>
          <div className="bg-accent p-4 rounded">p-4 (1rem)</div>
          <div className="bg-accent p-6 rounded">p-6 (1.5rem)</div>
          <div className="bg-accent p-8 rounded">p-8 (2rem)</div>
        </div>
      </Card>

      <div className="text-center">
        <p className="body-sm text-muted-foreground">
          ST-032: Design-token implementation complete ✨
        </p>
      </div>
    </div>
  );
};
