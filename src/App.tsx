import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Overview from "./pages/Overview";
import Scheduling from "./pages/Scheduling";
import Documentation from "./pages/Documentation";
import AICopilot from "./pages/AICopilot";
import AdminAgents from "./pages/AdminAgents";
import ParentPortal from "./pages/ParentPortal";
import Analytics from "./pages/Analytics";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/overview" element={<Overview />} />
          <Route path="/scheduling" element={<Scheduling />} />
          <Route path="/documentation" element={<Documentation />} />
          <Route path="/ai-copilot" element={<AICopilot />} />
          <Route path="/admin-agents" element={<AdminAgents />} />
          <Route path="/parent-portal" element={<ParentPortal />} />
          <Route path="/analytics" element={<Analytics />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
