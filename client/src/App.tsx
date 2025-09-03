import React from 'react';
import { RouterProvider } from 'react-router';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { WebSocketProvider } from '@/components/providers/WebSocketProvider';
import { createAppRouter } from '@/utils/routeUtils';
import { routeConfig } from './router';

const router = createAppRouter(routeConfig);

function App() {
  return (
    <TooltipProvider>
      <WebSocketProvider>
        <Toaster />
        <RouterProvider router={router} />
      </WebSocketProvider>
    </TooltipProvider>
  );
}

export default App;
