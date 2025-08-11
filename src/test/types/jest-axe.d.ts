declare module 'jest-axe' {
  import { ElementHandle } from 'puppeteer';
  
  export interface AxeResults {
    violations: any[];
    passes: any[];
    incomplete: any[];
    inapplicable: any[];
  }
  
  export function axe(element: HTMLElement | Document | string, options?: any): Promise<AxeResults>;
  export function toHaveNoViolations(): any;
  export function configureAxe(options: any): void;
}
