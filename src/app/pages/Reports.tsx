import React, { useState, useCallback } from "react";
import { Download, BarChart3, Filter, FileSpreadsheet, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";
import { apiFetch } from "../api/client";
import { useAuth } from "../context/AuthContext";

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────
interface ApiAssignment {
  id: number;
  date: string;
  user: { id: number; name: string; email: string; department: string | null };
  shift: { id: number; name: string; startTime: string; endTime: string; type: string };
}

interface ApiStaff {
  id: number;
  name: string;
  department: string | null;
}

interface ReportRow {
  staff: string;
  department: string;
  date: string;
  shift: string;
  shiftType: string;
  hours: number;
}

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const shiftColors: Record<string, string> = {
  "Morning Shift":    "#1E40AF",
  "Afternoon Shift":  "#7c3aed",
  "Night Shift":      "#0f766e",
  "Split Shift A":    "#d97706",
  "Weekend Morning":  "#be185d",
  "Late Evening":     "#1d4ed8",
};
const PIE_COLORS = ["#1E40AF", "#7c3aed", "#0f766e", "#d97706", "#be185d", "#1d4ed8", "#dc2626"];

function shiftHours(start: string, end: string): number {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const startMins = sh * 60 + sm;
  let endMins = eh * 60 + em;
  if (endMins <= startMins) endMins += 24 * 60; // overnight shift
  return Math.round((endMins - startMins) / 60);
}

function monthRange(year: number, month: number): { from: string; to: string } {
  const from = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const to = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  return { from, to };
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/** Convert array of objects to a CSV blob and trigger a download */
function downloadCsv(rows: ReportRow[], filename: string) {
  const headers = ["#", "Staff", "Department", "Date", "Shift", "Shift Type", "Hours"];
  const lines = [
    headers.join(","),
    ...rows.map((r, i) =>
      [
        i + 1,
        `"${r.staff}"`,
        `"${r.department}"`,
        `"${formatDate(r.date)}"`,
        `"${r.shift}"`,
        `"${r.shiftType}"`,
        r.hours,
      ].join(",")
    ),
  ];
  const csv = lines.join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────
export function Reports() {
  const { token } = useAuth();
  const now = new Date();
  const [selectedYear]   = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(String(now.getMonth() + 1));
  const [selectedStaff, setSelectedStaff] = useState("All Staff");

  const [staffList,  setStaffList]  = useState<ApiStaff[]>([]);
  const [rows,       setRows]       = useState<ReportRow[]>([]);
  const [generated,  setGenerated]  = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  // ── Fetch ──────────────────────────────────────────────────
  const handleGenerate = useCallback(async () => {
    if (!token) { setError("You must be logged in as admin."); return; }
    setLoading(true);
    setError(null);
    setGenerated(false);

    try {
      // Fetch staff list (for dropdown) and assignments in parallel
      const queryParams =
        selectedMonth === "all"
          ? ""
          : (() => {
              const { from, to } = monthRange(selectedYear, Number(selectedMonth));
              return `?from=${from}&to=${to}`;
            })();

      const [staffData, assignments] = await Promise.all([
        apiFetch<ApiStaff[]>("/admin/staff", { token }),
        apiFetch<ApiAssignment[]>(`/admin/assignments${queryParams}`, { token }),
      ]);

      setStaffList(staffData);

      // Build report rows
      const reportRows: ReportRow[] = assignments.map((a) => ({
        staff:      a.user.name,
        department: a.user.department ?? "—",
        date:       a.date.slice(0, 10),
        shift:      a.shift.name,
        shiftType:  a.shift.type,
        hours:      shiftHours(a.shift.startTime, a.shift.endTime),
      }));

      setRows(reportRows);
      setGenerated(true);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load report data.");
    } finally {
      setLoading(false);
    }
  }, [token, selectedMonth, selectedYear]);

  // ── Filtered rows (by staff dropdown) ─────────────────────
  const filtered =
    selectedStaff === "All Staff"
      ? rows
      : rows.filter((r) => r.staff === selectedStaff);

  // ── Chart data ────────────────────────────────────────────
  const staffHoursMap: Record<string, number> = {};
  filtered.forEach((r) => { staffHoursMap[r.staff] = (staffHoursMap[r.staff] || 0) + r.hours; });
  const barData = Object.entries(staffHoursMap).map(([name, hours]) => ({
    name: name.split(" ")[0],
    full: name,
    hours,
  }));

  const shiftCounts: Record<string, number> = {};
  filtered.forEach((r) => { shiftCounts[r.shift] = (shiftCounts[r.shift] || 0) + 1; });
  const pieData = Object.entries(shiftCounts).map(([name, value]) => ({ name, value }));

  const totalHours   = filtered.reduce((a, b) => a + b.hours, 0);
  const uniqueStaff  = new Set(filtered.map((r) => r.staff)).size;

  // ── Export CSV ────────────────────────────────────────────
  const handleExportCsv = () => {
    if (filtered.length === 0) return;
    const monthLabel =
      selectedMonth === "all" ? "all-months" : MONTHS[Number(selectedMonth) - 1].toLowerCase();
    const staffLabel =
      selectedStaff === "All Staff" ? "all-staff" : selectedStaff.replace(/\s+/g, "-").toLowerCase();
    downloadCsv(filtered, `shift-report_${monthLabel}_${staffLabel}_${selectedYear}.csv`);
  };

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-gray-900 text-lg font-semibold">Reports</h2>
        <p className="text-gray-500 text-sm mt-0.5">Generate and export shift reports</p>
      </div>

      {/* ── Filters ── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-[#1E40AF]" />
          <h3 className="text-sm font-semibold text-gray-900">Filter Report</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Month */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Select Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => { setSelectedMonth(e.target.value); setGenerated(false); }}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Months</option>
              {MONTHS.map((m, i) => (
                <option key={m} value={String(i + 1)}>{m} {selectedYear}</option>
              ))}
            </select>
          </div>

          {/* Staff */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Select Staff</label>
            <select
              value={selectedStaff}
              onChange={(e) => setSelectedStaff(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option>All Staff</option>
              {staffList.map((s) => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Generate button */}
          <div className="flex items-end gap-3">
            <button
              id="btn-generate-report"
              onClick={handleGenerate}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-[#1E40AF] hover:bg-[#1d3a9e] disabled:opacity-60 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition"
            >
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</>
                : generated
                  ? <><RefreshCw className="w-4 h-4" /> Refresh Report</>
                  : <><BarChart3 className="w-4 h-4" /> Generate Report</>
              }
            </button>
          </div>
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* ── Results ── */}
      {generated && !loading && (
        <>
          {/* Summary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Total Shifts",     value: filtered.length,                                                              color: "text-[#1E40AF]"  },
              { label: "Total Hours",      value: `${totalHours}h`,                                                             color: "text-purple-600" },
              { label: "Staff Covered",    value: uniqueStaff,                                                                  color: "text-green-600"  },
              { label: "Avg Hours/Staff",  value: uniqueStaff > 0 ? `${Math.round(totalHours / uniqueStaff)}h` : "0h",         color: "text-orange-600" },
            ].map((c) => (
              <div key={c.label} className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-4">
                <p className={`text-xl font-bold ${c.color}`}>{c.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{c.label}</p>
              </div>
            ))}
          </div>

          {/* Charts */}
          {filtered.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              {/* Bar chart */}
              <div className="lg:col-span-3 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Hours per Staff Member</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={barData} barSize={24}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9ca3af" }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9ca3af" }} />
                    <Tooltip
                      formatter={(val: number) => [`${val}h`, "Hours"]}
                      labelFormatter={(_, payload) => payload?.[0]?.payload?.full ?? ""}
                      contentStyle={{ border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 12 }}
                    />
                    <Bar dataKey="hours" fill="#1E40AF" radius={[4, 4, 0, 0]}
                      label={{ position: "top", fontSize: 10, fill: "#6b7280" }} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Pie chart */}
              <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Shift Distribution</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                      paddingAngle={3} dataKey="value">
                      {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Detailed Shift Report</h3>
                <p className="text-xs text-gray-400 mt-0.5">{filtered.length} record{filtered.length !== 1 ? "s" : ""} found</p>
              </div>
              <button
                id="btn-export-csv"
                onClick={handleExportCsv}
                disabled={filtered.length === 0}
                className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed px-3 py-2 rounded-lg transition font-medium"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[580px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {["#", "Staff", "Department", "Date", "Shift", "Type", "Hours"].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-14 text-gray-400 text-sm">
                        <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 text-gray-200" />
                        No shift assignments found for the selected filters.
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
                            style={{ backgroundColor: shiftColors[r.shift] ?? "#6b7280" }}
                          >
                            {r.shift}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-gray-500">{r.shiftType}</td>
                        <td className="px-5 py-3.5 text-sm text-gray-700 font-medium">{r.hours}h</td>
                      </tr>
                    ))
                  )}
                </tbody>
                {filtered.length > 0 && (
                  <tfoot>
                    <tr className="border-t-2 border-gray-200 bg-gray-50">
                      <td colSpan={5} className="px-5 py-3 text-sm text-gray-500 font-medium">Total</td>
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

      {/* Empty / initial state */}
      {!generated && !loading && !error && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm py-16 text-center">
          <BarChart3 className="w-10 h-10 mx-auto mb-3 text-gray-200" />
          <p className="text-gray-500 text-sm font-medium">Select filters and click <strong>Generate Report</strong> to view data.</p>
        </div>
      )}
    </div>
  );
}
