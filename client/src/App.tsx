import React from "react";
import { RouterProvider } from "react-router";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { createAppRouter } from "@/utils/routeUtils";
import { routeConfig } from "./router/new-routes";

const router = createAppRouter(routeConfig);

function App() {
  return (
    <TooltipProvider>
      <Toaster />
      <RouterProvider router={router} />
    </TooltipProvider>
  );
}

export default App;
