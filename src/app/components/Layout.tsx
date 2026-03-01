import React, { useState } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router";
import {
  LayoutDashboard, Users, Clock, CalendarDays, FileText,
  BarChart3, LogOut, Calendar, Menu, X, Bell, ChevronDown, Shield,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/app/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/app/staff",     icon: Users,           label: "Staff Management" },
  { to: "/app/shifts",    icon: Clock,           label: "Shift Management" },
  { to: "/app/schedule",  icon: CalendarDays,    label: "Schedule" },
  { to: "/app/leaves",    icon: FileText,        label: "Leave Requests" },
  { to: "/app/reports",   icon: BarChart3,       label: "Reports" },
];

const pageTitles: Record<string, string> = {
  "/app/dashboard": "Dashboard",
  "/app/staff":     "Staff Management",
  "/app/shifts":    "Shift Management",
  "/app/schedule":  "Schedule",
  "/app/leaves":    "Leave Requests",
  "/app/reports":   "Reports",
};

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen]     = useState(false);
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, logout } = useAuth();

  const pageTitle = pageTitles[location.pathname] || "SSMS";

  const handleLogout = () => { logout(); navigate("/"); };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-60 bg-white border-r border-gray-200 z-40 flex flex-col
        transition-transform duration-200 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:static md:z-auto
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-100">
          <div className="w-8 h-8 bg-[#1E40AF] rounded-lg flex items-center justify-center flex-shrink-0">
            <Calendar className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-gray-900 text-sm font-bold leading-tight">SSMS</p>
            <p className="text-gray-400 text-xs leading-tight">Admin Portal</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto text-gray-400 hover:text-gray-600 md:hidden">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role badge */}
        <div className="px-4 pt-4 pb-1">
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
            <Shield className="w-3.5 h-3.5 text-[#1E40AF]" />
            <span className="text-xs font-semibold text-[#1E40AF]">Administrator</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all group ${
                  isActive ? "bg-blue-50 text-[#1E40AF] font-medium" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-[#1E40AF]" : "text-gray-400 group-hover:text-gray-600"}`} />
                  {label}
                  {isActive && <span className="ml-auto w-1.5 h-1.5 bg-[#1E40AF] rounded-full" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="px-3 py-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 bg-[#1E40AF] rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user?.initials || "AD"}
            </div>
            <div className="min-w-0">
              <p className="text-sm text-gray-900 font-medium truncate">{user?.name || "Admin User"}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email || "admin@ssms.com"}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-1 flex items-center gap-3 w-full px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-lg transition"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" /> Logout
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 h-16 bg-white border-b border-gray-200 flex items-center px-4 md:px-6 gap-4">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-500 hover:text-gray-700 md:hidden">
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-gray-900 text-base font-semibold">{pageTitle}</h1>
          <div className="ml-auto flex items-center gap-3">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">Notifications</p>
                  </div>
                  {[
                    { msg: "3 leave requests pending approval", time: "5 min ago", dot: "bg-yellow-400" },
                    { msg: "Morning shift has 2 vacancies today", time: "1 hr ago", dot: "bg-blue-400" },
                    { msg: "Alice Brown's leave was approved", time: "2 hrs ago", dot: "bg-green-400" },
                  ].map((n, i) => (
                    <div key={i} className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer">
                      <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${n.dot}`} />
                      <div>
                        <p className="text-sm text-gray-700">{n.msg}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>
                      </div>
                    </div>
                  ))}
                  <div className="px-4 py-2.5 border-t border-gray-100 text-center">
                    <button className="text-xs text-[#1E40AF] hover:underline">View all</button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 rounded-lg px-2 py-1.5 transition">
              <div className="w-8 h-8 bg-[#1E40AF] rounded-full flex items-center justify-center text-white text-xs font-bold">
                {user?.initials || "AD"}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm text-gray-900 font-medium leading-tight">{user?.name?.split(" ")[0] || "Admin"}</p>
                <p className="text-xs text-gray-400 leading-tight">Administrator</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
