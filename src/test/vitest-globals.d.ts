import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';
import type { vi } from 'vitest';

declare global {
  // Make vi available globally
  const vi: typeof import('vitest').vi;
  
  // Make expect available globally  
  const expect: typeof import('vitest').expect;
  
  // Make describe, it, test, beforeEach, afterEach available globally
  const describe: typeof import('vitest').describe;
  const it: typeof import('vitest').it;  
  const test: typeof import('vitest').test;
  const beforeEach: typeof import('vitest').beforeEach;
  const afterEach: typeof import('vitest').afterEach;
  const beforeAll: typeof import('vitest').beforeAll;
  const afterAll: typeof import('vitest').afterAll;
}

// Extend expect with jest-dom matchers
declare module 'vitest' {
  interface Assertion<T = any> extends jest.Matchers<void, T>, TestingLibraryMatchers<T, void> {
    toHaveNoViolations(): void;
  }
  interface AsymmetricMatchersContaining extends jest.Expect {}
}
