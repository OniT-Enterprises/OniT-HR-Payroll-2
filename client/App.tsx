import "./global.css";
import React from "react";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import CreateJob from "./pages/hiring/CreateJob";
import CandidateSelection from "./pages/hiring/CandidateSelection";
import Interviews from "./pages/hiring/Interviews";
import Onboarding from "./pages/hiring/Onboarding";
import Offboarding from "./pages/hiring/Offboarding";
import AllEmployees from "./pages/staff/AllEmployees";
import AddEmployee from "./pages/staff/AddEmployee";
import Departments from "./pages/staff/Departments";
import OrganizationChart from "./pages/staff/OrganizationChart";
import TimeTracking from "./pages/time-leave/TimeTracking";
import Attendance from "./pages/time-leave/Attendance";
import LeaveRequests from "./pages/time-leave/LeaveRequests";
import ShiftScheduling from "./pages/time-leave/ShiftScheduling";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/hiring/create-job" element={<CreateJob />} />
          <Route path="/hiring/candidates" element={<CandidateSelection />} />
          <Route path="/hiring/interviews" element={<Interviews />} />
          <Route path="/hiring/onboarding" element={<Onboarding />} />
          <Route path="/hiring/offboarding" element={<Offboarding />} />
          <Route path="/staff/employees" element={<AllEmployees />} />
          <Route path="/staff/add" element={<AddEmployee />} />
          <Route path="/staff/departments" element={<Departments />} />
          <Route path="/staff/org-chart" element={<OrganizationChart />} />
          <Route path="/time-leave/tracking" element={<TimeTracking />} />
          <Route path="/time-leave/attendance" element={<Attendance />} />
          <Route
            path="/time-leave/leave-requests"
            element={<LeaveRequests />}
          />
          <Route path="/time-leave/scheduling" element={<ShiftScheduling />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
