import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { CheckCircle, XCircle, Loader2, Server } from 'lucide-react';

export const ApiStatus: React.FC = () => {
  const [status, setStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkConnection = async () => {
    setStatus('checking');
    try {
      const healthResult = await api.healthCheck();
      if (healthResult.error) {
        setStatus('disconnected');
      } else {
        setStatus('connected');
      }
    } catch (error) {
      setStatus('disconnected');
    }
    setLastChecked(new Date());
  };

  useEffect(() => {
    checkConnection();
    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = () => {
    switch (status) {
      case 'checking':
        return <Loader2 className="h-4 w-4 animate-spin text-gray-500" />;
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'disconnected':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'checking':
        return <Badge variant="secondary">Checking...</Badge>;
      case 'connected':
        return <Badge variant="default" className="bg-green-500">Connected</Badge>;
      case 'disconnected':
        return <Badge variant="destructive">Disconnected</Badge>;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Server className="h-4 w-4" />
          Backend API Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="text-sm">
              {status === 'connected' ? 'Backend Connected' :
               status === 'disconnected' ? 'Backend Unavailable' :
               'Checking Connection...'}
            </span>
          </div>
          {getStatusBadge()}
        </div>
        {lastChecked && (
          <div className="text-xs text-gray-500">
            Last checked: {lastChecked.toLocaleTimeString()}
          </div>
        )}
        <div className="text-xs text-gray-400">
          {import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}
        </div>
      </CardContent>
    </Card>
  );
};