import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message?: string;
  data?: any;
}

export const ApiTest: React.FC = () => {
  const [tests, setTests] = useState<TestResult[]>([
    { name: 'Backend Health Check', status: 'pending' },
    { name: 'Auth Service Health', status: 'pending' },
    { name: 'API Test Endpoint', status: 'pending' },
  ]);
  const [isRunning, setIsRunning] = useState(false);

  const updateTest = (index: number, update: Partial<TestResult>) => {
    setTests(prev => prev.map((test, i) =>
      i === index ? { ...test, ...update } : test
    ));
  };

  const runTests = async () => {
    setIsRunning(true);
    setTests(prev => prev.map(test => ({ ...test, status: 'pending' })));

    // Test 1: Backend Health Check
    try {
      const healthResult = await api.healthCheck();
      if (healthResult.error) {
        updateTest(0, {
          status: 'error',
          message: healthResult.error
        });
      } else {
        updateTest(0, {
          status: 'success',
          message: 'Backend is healthy',
          data: healthResult.data
        });
      }
    } catch (error) {
      updateTest(0, {
        status: 'error',
        message: 'Failed to connect to backend'
      });
    }

    // Wait a bit between tests
    await new Promise(resolve => setTimeout(resolve, 500));

    // Test 2: Auth Service Health
    try {
      const authHealthResult = await api.authHealthCheck();
      if (authHealthResult.error) {
        updateTest(1, {
          status: 'error',
          message: authHealthResult.error
        });
      } else {
        updateTest(1, {
          status: 'success',
          message: 'Auth service is healthy',
          data: authHealthResult.data
        });
      }
    } catch (error) {
      updateTest(1, {
        status: 'error',
        message: 'Auth service unavailable'
      });
    }

    // Wait a bit between tests
    await new Promise(resolve => setTimeout(resolve, 500));

    // Test 3: API Test Endpoint
    try {
      const testResult = await api.testConnection();
      if (testResult.error) {
        updateTest(2, {
          status: 'error',
          message: testResult.error
        });
      } else {
        updateTest(2, {
          status: 'success',
          message: 'API test endpoint working',
          data: testResult.data
        });
      }
    } catch (error) {
      updateTest(2, {
        status: 'error',
        message: 'API test endpoint failed'
      });
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return <Loader2 className="h-4 w-4 animate-spin text-gray-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return 'text-gray-500';
      case 'success':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
    }
  };

  // Run tests on component mount
  useEffect(() => {
    runTests();
  }, []);

  const allTestsPassed = tests.every(test => test.status === 'success');
  const anyTestsFailed = tests.some(test => test.status === 'error');

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Backend API Connection Test</span>
          {isRunning && <Loader2 className="h-5 w-5 animate-spin" />}
        </CardTitle>
        <CardDescription>
          Testing connectivity to the backend API and authentication service
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Status */}
        {!isRunning && (
          <Alert className={
            allTestsPassed
              ? 'border-green-200 bg-green-50'
              : anyTestsFailed
                ? 'border-red-200 bg-red-50'
                : 'border-gray-200'
          }>
            <AlertDescription className={
              allTestsPassed
                ? 'text-green-700'
                : anyTestsFailed
                  ? 'text-red-700'
                  : 'text-gray-700'
            }>
              {allTestsPassed
                ? '✅ All tests passed! Frontend is successfully connected to the backend.'
                : anyTestsFailed
                  ? '❌ Some tests failed. Check the backend server status.'
                  : 'Tests in progress...'
              }
            </AlertDescription>
          </Alert>
        )}

        {/* Individual Test Results */}
        <div className="space-y-3">
          {tests.map((test, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                {getStatusIcon(test.status)}
                <div>
                  <div className="font-medium">{test.name}</div>
                  {test.message && (
                    <div className={`text-sm ${getStatusColor(test.status)}`}>
                      {test.message}
                    </div>
                  )}
                </div>
              </div>
              {test.data && (
                <div className="text-xs text-gray-500 max-w-xs truncate">
                  {typeof test.data === 'object'
                    ? JSON.stringify(test.data).substring(0, 50) + '...'
                    : test.data
                  }
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Rerun Tests Button */}
        <div className="pt-4">
          <Button
            onClick={runTests}
            disabled={isRunning}
            className="w-full"
          >
            {isRunning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running Tests...
              </>
            ) : (
              'Rerun Tests'
            )}
          </Button>
        </div>

        {/* Connection Info */}
        <div className="text-xs text-gray-500 text-center pt-2">
          Connecting to: {import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}
        </div>
      </CardContent>
    </Card>
  );
};