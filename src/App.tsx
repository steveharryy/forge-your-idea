import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";

import Layout from "@/components/layout/Layout";
import Index from "./pages/Index";
import Explore from "./pages/Explore";
import StartupDetail from "./pages/StartupDetail";
import Submit from "./pages/Submit";
import Profile from "./pages/Profile";
import Featured from "./pages/Featured";
import Categories from "./pages/Categories";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import StudentDashboard from "./pages/StudentDashboard";
import InvestorDashboard from "./pages/InvestorDashboard";
import About from "./pages/About";
import Blog from "./pages/Blog";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();
const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/startup/:id" element={<StartupDetail />} />
              <Route path="/submit" element={<Submit />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/featured" element={<Featured />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/categories/:slug" element={<Categories />} />
              <Route path="/search" element={<Explore />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/student-dashboard" element={<StudentDashboard />} />
              <Route path="/investor-dashboard" element={<InvestorDashboard />} />
              <Route path="/about" element={<About />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);


export default App;
