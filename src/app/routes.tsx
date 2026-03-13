import React from "react";
import { createBrowserRouter, Navigate } from "react-router";
import { Layout } from "./components/Layout";
import { StaffLayout } from "./components/StaffLayout";
import { RequireRole } from "./components/RequireRole";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { StaffManagement } from "./pages/StaffManagement";
import { ShiftManagement } from "./pages/ShiftManagement";
import { Schedule } from "./pages/Schedule";
import { LeaveManagement } from "./pages/LeaveManagement";
import { Reports } from "./pages/Reports";
import { StaffDashboard } from "./pages/staff/StaffDashboard";
import { MySchedule } from "./pages/staff/MySchedule";
import { MyLeaves } from "./pages/staff/MyLeaves";
import { MyProfile } from "./pages/staff/MyProfile";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  // ── Admin routes ──────────────────────────────────────────────
  {
    path: "/app",
    element: (
      <RequireRole role="admin">
        <Layout />
      </RequireRole>
    ),
    children: [
      { index: true, element: <Navigate to="/app/dashboard" replace /> },
      { path: "dashboard", element: <Dashboard /> },
      { path: "staff",     element: <StaffManagement /> },
      { path: "shifts",    element: <ShiftManagement /> },
      { path: "schedule",  element: <Schedule /> },
      { path: "leaves",    element: <LeaveManagement /> },
      { path: "reports",   element: <Reports /> },
    ],
  },
  // ── Staff routes ──────────────────────────────────────────────
  {
    path: "/staff",
    element: (
      <RequireRole role="staff">
        <StaffLayout />
      </RequireRole>
    ),
    children: [
      { index: true, element: <Navigate to="/staff/dashboard" replace /> },
      { path: "dashboard", element: <StaffDashboard /> },
      { path: "schedule",  element: <MySchedule /> },
      { path: "leaves",    element: <MyLeaves /> },
      { path: "profile",   element: <MyProfile /> },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
