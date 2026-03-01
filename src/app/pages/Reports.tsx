import React, { useState } from "react";
import { Download, BarChart3, Filter, FileSpreadsheet } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const staffList = ["All Staff", "Alice Brown", "Bob Kumar", "Carol Lee", "David Patel", "Emma Wilson", "Frank Davis", "Grace Kim", "Henry Johnson"];

const allReportData = [
  { staff: "Alice Brown", department: "Operations", date: "2025-02-01", shift: "Morning Shift", hours: 8 },
  { staff: "Alice Brown", department: "Operations", date: "2025-02-03", shift: "Morning Shift", hours: 8 },
  { staff: "Alice Brown", department: "Operations", date: "2025-02-05", shift: "Morning Shift", hours: 8 },
  { staff: "Bob Kumar", department: "Security", date: "2025-02-02", shift: "Afternoon Shift", hours: 8 },
  { staff: "Bob Kumar", department: "Security", date: "2025-02-04", shift: "Night Shift", hours: 8 },
  { staff: "Bob Kumar", department: "Security", date: "2025-02-06", shift: "Afternoon Shift", hours: 8 },
  { staff: "Carol Lee", department: "Maintenance", date: "2025-02-01", shift: "Night Shift", hours: 8 },
  { staff: "Carol Lee", department: "Maintenance", date: "2025-02-07", shift: "Night Shift", hours: 8 },
  { staff: "David Patel", department: "Reception", date: "2025-02-02", shift: "Morning Shift", hours: 8 },
  { staff: "David Patel", department: "Reception", date: "2025-02-08", shift: "Morning Shift", hours: 8 },
  { staff: "Emma Wilson", department: "Operations", date: "2025-02-03", shift: "Afternoon Shift", hours: 8 },
  { staff: "Emma Wilson", department: "Operations", date: "2025-02-09", shift: "Afternoon Shift", hours: 8 },
  { staff: "Frank Davis", department: "IT", date: "2025-02-04", shift: "Morning Shift", hours: 8 },
  { staff: "Grace Kim", department: "HR", date: "2025-02-05", shift: "Split Shift A", hours: 4 },
  { staff: "Henry Johnson", department: "Finance", date: "2025-02-06", shift: "Morning Shift", hours: 8 },
  { staff: "Alice Brown", department: "Operations", date: "2025-03-01", shift: "Morning Shift", hours: 8 },
  { staff: "Bob Kumar", department: "Security", date: "2025-03-02", shift: "Afternoon Shift", hours: 8 },
  { staff: "Carol Lee", department: "Maintenance", date: "2025-03-03", shift: "Night Shift", hours: 8 },
  { staff: "David Patel", department: "Reception", date: "2025-03-04", shift: "Morning Shift", hours: 8 },
  { staff: "Emma Wilson", department: "Operations", date: "2025-03-05", shift: "Afternoon Shift", hours: 8 },
];

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const shiftColors: Record<string, string> = {
  "Morning Shift": "#1E40AF",
  "Afternoon Shift": "#7c3aed",
  "Night Shift": "#0f766e",
  "Split Shift A": "#d97706",
  "Weekend Morning": "#be185d",
  "Late Evening": "#1d4ed8",
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export function Reports() {
  const [selectedMonth, setSelectedMonth] = useState("2");
  const [selectedStaff, setSelectedStaff] = useState("All Staff");
  const [generated, setGenerated] = useState(true);

  const handleGenerate = () => setGenerated(true);

  const filtered = allReportData.filter((r) => {
    const rMonth = String(new Date(r.date).getMonth() + 1);
    const monthMatch = selectedMonth === "all" || rMonth === selectedMonth;
    const staffMatch = selectedStaff === "All Staff" || r.staff === selectedStaff;
    return monthMatch && staffMatch;
  });

  // Shift distribution for pie chart
  const shiftCounts: Record<string, number> = {};
  filtered.forEach((r) => { shiftCounts[r.shift] = (shiftCounts[r.shift] || 0) + 1; });
  const pieData = Object.entries(shiftCounts).map(([name, value]) => ({ name, value }));
  const pieColors = ["#1E40AF","#7c3aed","#0f766e","#d97706","#be185d"];

  // Staff hours for bar chart
  const staffHours: Record<string, number> = {};
  filtered.forEach((r) => { staffHours[r.staff] = (staffHours[r.staff] || 0) + r.hours; });
  const barData = Object.entries(staffHours).map(([name, hours]) => ({ name: name.split(" ")[0], hours }));

  const totalHours = filtered.reduce((a, b) => a + b.hours, 0);
  const uniqueStaff = new Set(filtered.map((r) => r.staff)).size;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-gray-900 text-lg font-semibold">Reports</h2>
        <p className="text-gray-500 text-sm mt-0.5">Generate and export shift reports</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-[#1E40AF]" />
          <h3 className="text-sm font-semibold text-gray-900">Filter Report</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Select Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Months</option>
              {MONTHS.map((m, i) => <option key={m} value={String(i + 1)}>{m} 2025</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Select Staff</label>
            <select
              value={selectedStaff}
              onChange={(e) => setSelectedStaff(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {staffList.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex items-end gap-3">
            <button
              onClick={handleGenerate}
              className="flex-1 flex items-center justify-center gap-2 bg-[#1E40AF] hover:bg-[#1d3a9e] text-white px-4 py-2.5 rounded-lg text-sm font-medium transition"
            >
              <BarChart3 className="w-4 h-4" />
              Generate Report
            </button>
          </div>
        </div>
      </div>

      {generated && (
        <>
          {/* Summary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Total Shifts", value: filtered.length, color: "text-[#1E40AF]" },
              { label: "Total Hours", value: `${totalHours}h`, color: "text-purple-600" },
              { label: "Staff Covered", value: uniqueStaff, color: "text-green-600" },
              { label: "Avg Hours/Staff", value: uniqueStaff > 0 ? `${Math.round(totalHours / uniqueStaff)}h` : "0h", color: "text-orange-600" },
            ].map((c) => (
              <div key={c.label} className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-4">
                <p className={`text-xl font-bold ${c.color}`}>{c.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{c.label}</p>
              </div>
            ))}
          </div>

          {/* Charts row */}
          {filtered.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              {/* Bar Chart */}
              <div className="lg:col-span-3 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Hours per Staff Member</h3>
                {barData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={barData} barSize={24}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9ca3af" }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9ca3af" }} />
                      <Tooltip contentStyle={{ border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 12 }} />
                      <Bar dataKey="hours" fill="#1E40AF" radius={[4, 4, 0, 0]} label={{ position: "top", fontSize: 10, fill: "#6b7280" }} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-gray-400 text-sm py-10">No data available</p>
                )}
              </div>
              {/* Pie Chart */}
              <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Shift Distribution</h3>
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                        {pieData.map((_, i) => <Cell key={i} fill={pieColors[i % pieColors.length]} />)}
                      </Pie>
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                      <Tooltip contentStyle={{ border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-gray-400 text-sm py-10">No data available</p>
                )}
              </div>
            </div>
          )}

          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Detailed Shift Report</h3>
                <p className="text-xs text-gray-400 mt-0.5">{filtered.length} records found</p>
              </div>
              <button className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition font-medium">
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[550px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">#</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Staff</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Department</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Shift</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Hours</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-gray-400 text-sm">
                        <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 text-gray-200" />
                        No records found for the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((r, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition">
                        <td className="px-5 py-3.5 text-sm text-gray-400">{i + 1}</td>
                        <td className="px-5 py-3.5 text-sm text-gray-900 font-medium">{r.staff}</td>
                        <td className="px-5 py-3.5 text-sm text-gray-500">{r.department}</td>
                        <td className="px-5 py-3.5 text-sm text-gray-500">{formatDate(r.date)}</td>
                        <td className="px-5 py-3.5">
                          <span
                            className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                            style={{ backgroundColor: shiftColors[r.shift] || "#6b7280" }}
                          >
                            {r.shift}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-gray-700 font-medium">{r.hours}h</td>
                      </tr>
                    ))
                  )}
                </tbody>
                {filtered.length > 0 && (
                  <tfoot>
                    <tr className="border-t-2 border-gray-200 bg-gray-50">
                      <td colSpan={4} className="px-5 py-3 text-sm text-gray-500 font-medium">Total</td>
                      <td className="px-5 py-3 text-sm font-semibold text-gray-900">{filtered.length} shifts</td>
                      <td className="px-5 py-3 text-sm font-semibold text-[#1E40AF]">{totalHours}h</td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
