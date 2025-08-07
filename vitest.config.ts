/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.{js,ts}',
        '**/mock*',
        'src/components/ui/**', // Exclude shadcn UI components
        'src/types/**',
        'dist/',
        '.next/',
        'coverage/',
      ],
      reportsDirectory: './coverage',
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70
        }
      }
    },
    // Performance and timeout settings
    testTimeout: 10000,
    hookTimeout: 10000,
    teardownTimeout: 5000,
    // Parallel execution
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        isolate: false,
      }
    },
    // Test file patterns
    include: [
      '**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
      'src/test/setup.ts',
      'src/test/utils.tsx'
    ],
    // Mock configuration
    deps: {
      optimizer: {
        web: {
          include: ['@testing-library/jest-dom']
        }
      }
    },
    // Retry configuration for flaky tests
    retry: 2,
    // Silent mode for cleaner output
    silent: false,
    // Reporter configuration
    reporter: process.env.CI ? ['verbose', 'junit'] : ['verbose'],
    outputFile: {
      junit: './test-results/junit.xml'
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@types': path.resolve(__dirname, './src/types'),
      '@contexts': path.resolve(__dirname, './src/contexts'),
      '@data': path.resolve(__dirname, './src/data'),
    },
  },
})
