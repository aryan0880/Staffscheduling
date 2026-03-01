import React from "react";
import { Users, Clock, CalendarCheck, FileText, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useNavigate } from "react-router";

const weeklyData = [
  { day: "Mon", shifts: 12, staff: 10 },
  { day: "Tue", shifts: 15, staff: 13 },
  { day: "Wed", shifts: 11, staff: 9 },
  { day: "Thu", shifts: 18, staff: 15 },
  { day: "Fri", shifts: 20, staff: 18 },
  { day: "Sat", shifts: 8, staff: 6 },
  { day: "Sun", shifts: 5, staff: 4 },
];

const recentLeaves = [
  { name: "Sarah Johnson", department: "Operations", from: "Feb 26", to: "Feb 28", status: "Pending" },
  { name: "Mark Williams", department: "HR", from: "Mar 1", to: "Mar 3", status: "Approved" },
  { name: "Priya Sharma", department: "IT", from: "Feb 27", to: "Feb 27", status: "Rejected" },
  { name: "James Carter", department: "Finance", from: "Mar 5", to: "Mar 7", status: "Pending" },
];

const todaySchedule = [
  { name: "Alice Brown", shift: "Morning (6AM–2PM)", dept: "Operations" },
  { name: "Bob Kumar", shift: "Afternoon (2PM–10PM)", dept: "Security" },
  { name: "Carol Lee", shift: "Night (10PM–6AM)", dept: "Maintenance" },
  { name: "David Patel", shift: "Morning (6AM–2PM)", dept: "Reception" },
  { name: "Emma Wilson", shift: "Afternoon (2PM–10PM)", dept: "Operations" },
];

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    Pending: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    Approved: "bg-green-50 text-green-700 border border-green-200",
    Rejected: "bg-red-50 text-red-700 border border-red-200",
  };
  return `inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${map[status] || "bg-gray-100 text-gray-600"}`;
};

export function Dashboard() {
  const navigate = useNavigate();

  const summaryCards = [
    {
      label: "Total Staff",
      value: "42",
      icon: Users,
      iconBg: "bg-blue-50",
      iconColor: "text-[#1E40AF]",
      change: "+3 this month",
      up: true,
    },
    {
      label: "Total Shifts",
      value: "8",
      icon: Clock,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
      change: "4 shift types active",
      up: true,
    },
    {
      label: "Today's Assignments",
      value: "18",
      icon: CalendarCheck,
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
      change: "+2 from yesterday",
      up: true,
    },
    {
      label: "Pending Leaves",
      value: "5",
      icon: FileText,
      iconBg: "bg-yellow-50",
      iconColor: "text-yellow-600",
      change: "Needs attention",
      up: false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 ${card.iconBg} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${card.iconColor}`} />
                </div>
                {card.up ? (
                  <ArrowUpRight className="w-4 h-4 text-green-500" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-yellow-500" />
                )}
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-0.5">{card.value}</p>
              <p className="text-sm text-gray-500 font-medium mb-1">{card.label}</p>
              <p className="text-xs text-gray-400">{card.change}</p>
            </div>
          );
        })}
      </div>

      {/* Charts + Recent Schedule */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        {/* Bar Chart */}
        <div className="xl:col-span-3 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-gray-900 text-sm font-semibold">Weekly Shift Overview</h3>
              <p className="text-gray-400 text-xs mt-0.5">Shifts assigned this week</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#1E40AF]" /> Shifts
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-200" /> Staff
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyData} barSize={10} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9ca3af" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9ca3af" }} />
              <Tooltip
                contentStyle={{ border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 12 }}
                cursor={{ fill: "#f9fafb" }}
              />
              <Bar dataKey="shifts" fill="#1E40AF" radius={[4, 4, 0, 0]} />
              <Bar dataKey="staff" fill="#bfdbfe" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Today's Schedule */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-gray-900 text-sm font-semibold">Today's Schedule</h3>
              <p className="text-gray-400 text-xs mt-0.5">Feb 26, 2025</p>
            </div>
            <button
              onClick={() => navigate("/app/schedule")}
              className="text-xs text-[#1E40AF] hover:underline"
            >
              View all
            </button>
          </div>
          <div className="space-y-3">
            {todaySchedule.map((s, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 text-[#1E40AF] text-xs font-bold">
                  {s.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-gray-900 font-medium truncate">{s.name}</p>
                  <p className="text-xs text-gray-400 truncate">{s.shift}</p>
                </div>
                <span className="ml-auto text-xs text-gray-400 whitespace-nowrap">{s.dept}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Leave Requests */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-gray-900 text-sm font-semibold">Recent Leave Requests</h3>
            <p className="text-gray-400 text-xs mt-0.5">Latest leave applications</p>
          </div>
          <button
            onClick={() => navigate("/app/leaves")}
            className="text-xs text-[#1E40AF] hover:underline"
          >
            View all
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Staff</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Department</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">From</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">To</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentLeaves.map((l, i) => (
                <tr key={i} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-3.5 text-sm text-gray-900 font-medium">{l.name}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-500">{l.department}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-500">{l.from}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-500">{l.to}</td>
                  <td className="px-5 py-3.5">
                    <span className={statusBadge(l.status)}>{l.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
