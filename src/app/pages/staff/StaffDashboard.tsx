import React from "react";
import { CalendarCheck, Clock, FileText, TrendingUp, ChevronRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router";

// Per-staff mock schedule data
const STAFF_SCHEDULE: Record<string, { shift: string; time: string; date: string; status: string }[]> = {
  "Alice Brown":   [
    { shift: "Morning Shift", time: "6:00 AM – 2:00 PM",   date: "2025-02-26", status: "Today" },
    { shift: "Morning Shift", time: "6:00 AM – 2:00 PM",   date: "2025-02-27", status: "Upcoming" },
    { shift: "Morning Shift", time: "6:00 AM – 2:00 PM",   date: "2025-03-01", status: "Upcoming" },
    { shift: "Afternoon Shift", time: "2:00 PM – 10:00 PM", date: "2025-03-03", status: "Upcoming" },
    { shift: "Morning Shift", time: "6:00 AM – 2:00 PM",   date: "2025-03-05", status: "Upcoming" },
  ],
  "Bob Kumar":     [
    { shift: "Afternoon Shift", time: "2:00 PM – 10:00 PM", date: "2025-02-26", status: "Today" },
    { shift: "Night Shift",     time: "10:00 PM – 6:00 AM", date: "2025-02-28", status: "Upcoming" },
    { shift: "Afternoon Shift", time: "2:00 PM – 10:00 PM", date: "2025-03-02", status: "Upcoming" },
  ],
  "Carol Lee":     [
    { shift: "Night Shift", time: "10:00 PM – 6:00 AM", date: "2025-02-26", status: "Today" },
    { shift: "Night Shift", time: "10:00 PM – 6:00 AM", date: "2025-03-01", status: "Upcoming" },
    { shift: "Night Shift", time: "10:00 PM – 6:00 AM", date: "2025-03-04", status: "Upcoming" },
  ],
  "David Patel":   [
    { shift: "Morning Shift", time: "6:00 AM – 2:00 PM", date: "2025-02-27", status: "Upcoming" },
    { shift: "Morning Shift", time: "6:00 AM – 2:00 PM", date: "2025-03-02", status: "Upcoming" },
  ],
  "Emma Wilson":   [
    { shift: "Afternoon Shift", time: "2:00 PM – 10:00 PM", date: "2025-02-26", status: "Today" },
    { shift: "Afternoon Shift", time: "2:00 PM – 10:00 PM", date: "2025-03-01", status: "Upcoming" },
  ],
};

const STAFF_LEAVES: Record<string, { from: string; to: string; reason: string; status: "Pending" | "Approved" | "Rejected" }[]> = {
  "Alice Brown":  [
    { from: "2025-02-10", to: "2025-02-12", reason: "Family event",       status: "Approved" },
    { from: "2025-03-10", to: "2025-03-12", reason: "Medical appointment", status: "Pending" },
  ],
  "Bob Kumar":    [
    { from: "2025-01-20", to: "2025-01-22", reason: "Vacation",           status: "Approved" },
    { from: "2025-03-15", to: "2025-03-16", reason: "Personal",           status: "Pending" },
  ],
  "Carol Lee":    [
    { from: "2025-02-05", to: "2025-02-06", reason: "Sick leave",         status: "Rejected" },
  ],
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

const statusBadge = (s: string) => {
  const m: Record<string, string> = {
    Pending:  "bg-yellow-50 text-yellow-700 border border-yellow-200",
    Approved: "bg-green-50 text-green-700 border border-green-200",
    Rejected: "bg-red-50 text-red-700 border border-red-200",
    Today:    "bg-blue-50 text-[#1E40AF] border border-blue-200",
    Upcoming: "bg-gray-50 text-gray-600 border border-gray-200",
  };
  return `inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${m[s] || "bg-gray-100 text-gray-600"}`;
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

export function StaffDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const name = user?.name || "Staff";

  const mySchedule = STAFF_SCHEDULE[name] || [];
  const myLeaves   = STAFF_LEAVES[name] || [];
  const todayShift = mySchedule.find((s) => s.status === "Today");
  const upcoming   = mySchedule.filter((s) => s.status === "Upcoming").slice(0, 4);

  const approvedLeaves = myLeaves.filter((l) => l.status === "Approved").length;
  const pendingLeaves  = myLeaves.filter((l) => l.status === "Pending").length;
  const leaveBalance   = 12 - approvedLeaves;
  const shiftsThisMonth = mySchedule.length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-6 py-5 flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{getGreeting()} 👋</p>
          <h2 className="text-gray-900 text-xl font-bold mt-0.5">{name}</h2>
          <p className="text-gray-400 text-sm mt-1">
            {user?.department} &nbsp;&middot;&nbsp;
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>
        <div className="hidden sm:flex w-14 h-14 bg-green-600 rounded-2xl items-center justify-center text-white text-xl font-bold shadow-md flex-shrink-0">
          {user?.initials}
        </div>
      </div>

      {/* Today's Shift */}
      {todayShift ? (
        <div className="bg-[#1E40AF] rounded-xl px-6 py-5 text-white shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-blue-200 text-sm mb-1">Today's Shift</p>
              <h3 className="text-xl font-bold">{todayShift.shift}</h3>
              <p className="text-blue-100 text-sm mt-1 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" />
                {todayShift.time}
              </p>
            </div>
            <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full font-medium border border-white/30">
              Active Today
            </span>
          </div>
          <div className="mt-4 pt-4 border-t border-blue-400/40 flex items-center gap-4 text-sm text-blue-100">
            <span>📅 {formatDate(todayShift.date)}</span>
            <span>👥 {user?.department}</span>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-6 py-5 text-center">
          <CalendarCheck className="w-10 h-10 text-gray-200 mx-auto mb-2" />
          <p className="text-gray-500 text-sm font-medium">No shift assigned for today</p>
          <p className="text-gray-400 text-xs mt-1">Enjoy your day off!</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Shifts This Month", value: shiftsThisMonth, icon: CalendarCheck, color: "text-[#1E40AF]", bg: "bg-blue-50" },
          { label: "Leave Balance",     value: `${leaveBalance}/12`, icon: FileText,     color: "text-green-600", bg: "bg-green-50" },
          { label: "Pending Requests",  value: pendingLeaves,  icon: Clock,         color: "text-yellow-600", bg: "bg-yellow-50" },
          { label: "Approved Leaves",   value: approvedLeaves, icon: TrendingUp,    color: "text-purple-600", bg: "bg-purple-50" },
        ].map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-4">
              <div className={`w-9 h-9 ${c.bg} rounded-lg flex items-center justify-center mb-3`}>
                <Icon className={`w-4 h-4 ${c.color}`} />
              </div>
              <p className={`text-xl font-bold ${c.color}`}>{c.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{c.label}</p>
            </div>
          );
        })}
      </div>

      {/* Upcoming Shifts + Recent Leaves */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Upcoming Shifts */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Upcoming Shifts</h3>
            <button onClick={() => navigate("/staff/schedule")} className="text-xs text-green-600 hover:underline flex items-center gap-1">
              View all <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          {upcoming.length === 0 ? (
            <div className="py-10 text-center text-gray-400 text-sm">No upcoming shifts scheduled.</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {upcoming.map((s, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="w-4 h-4 text-[#1E40AF]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-900 font-medium">{s.shift}</p>
                      <p className="text-xs text-gray-400">{s.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{formatDate(s.date)}</p>
                    <span className={`mt-1 ${statusBadge(s.status)}`}>{s.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Leaves */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">My Leave History</h3>
            <button onClick={() => navigate("/staff/leaves")} className="text-xs text-green-600 hover:underline flex items-center gap-1">
              Apply leave <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          {myLeaves.length === 0 ? (
            <div className="py-10 text-center text-gray-400 text-sm">No leave requests yet.</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {myLeaves.map((l, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition">
                  <div>
                    <p className="text-sm text-gray-900 font-medium">{l.reason}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatDate(l.from)} – {formatDate(l.to)}
                    </p>
                  </div>
                  <span className={statusBadge(l.status)}>{l.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}