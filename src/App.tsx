import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/themeContext";
import { Layout } from "@/components/Layout";
import { lazy, Suspense } from "react";
import NotFound from "./pages/NotFound.tsx";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const DataExploration = lazy(() => import("./pages/DataExploration"));
const CorrelationAnalysis = lazy(() => import("./pages/CorrelationAnalysis"));
const RiskFactors = lazy(() => import("./pages/RiskFactors"));
const Prediction = lazy(() => import("./pages/Prediction"));
const TreatmentSuccess = lazy(() => import("./pages/TreatmentSuccess"));
const Lifestyle = lazy(() => import("./pages/Lifestyle"));
const BiasLimitations = lazy(() => import("./pages/BiasLimitations"));
const ModelPerformance = lazy(() => import("./pages/ModelPerformance"));
const About = lazy(() => import("./pages/About"));

const queryClient = new QueryClient();

const Loading = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-pulse-glow text-primary text-lg font-display">Loading...</div>
  </div>
);

const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Layout>
            <Suspense fallback={<Loading />}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/exploration" element={<DataExploration />} />
                <Route path="/correlation" element={<CorrelationAnalysis />} />
                <Route path="/risk-factors" element={<RiskFactors />} />
                <Route path="/prediction" element={<Prediction />} />
                <Route path="/treatment" element={<TreatmentSuccess />} />
                <Route path="/lifestyle" element={<Lifestyle />} />
                <Route path="/bias" element={<BiasLimitations />} />
                <Route path="/model-performance" element={<ModelPerformance />} />
                <Route path="/about" element={<About />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </Layout>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
