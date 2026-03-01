import React, { useState } from "react";
import { Check, X, Clock, FileText, CheckCircle, XCircle } from "lucide-react";

type Status = "Pending" | "Approved" | "Rejected";

interface LeaveRequest {
  id: number;
  staff: string;
  department: string;
  fromDate: string;
  toDate: string;
  reason: string;
  status: Status;
  days: number;
}

const initialLeaves: LeaveRequest[] = [
  { id: 1, staff: "Sarah Johnson", department: "Operations", fromDate: "2025-02-26", toDate: "2025-02-28", reason: "Family medical emergency", status: "Pending", days: 3 },
  { id: 2, staff: "Mark Williams", department: "HR", fromDate: "2025-03-01", toDate: "2025-03-03", reason: "Annual vacation", status: "Approved", days: 3 },
  { id: 3, staff: "Priya Sharma", department: "IT", fromDate: "2025-02-27", toDate: "2025-02-27", reason: "Personal matters", status: "Rejected", days: 1 },
  { id: 4, staff: "James Carter", department: "Finance", fromDate: "2025-03-05", toDate: "2025-03-07", reason: "Attend a wedding", status: "Pending", days: 3 },
  { id: 5, staff: "Alice Brown", department: "Operations", fromDate: "2025-03-10", toDate: "2025-03-12", reason: "Medical appointment", status: "Pending", days: 3 },
  { id: 6, staff: "David Patel", department: "Reception", fromDate: "2025-03-15", toDate: "2025-03-16", reason: "Home renovation", status: "Approved", days: 2 },
  { id: 7, staff: "Emma Wilson", department: "Operations", fromDate: "2025-03-20", toDate: "2025-03-22", reason: "University exam", status: "Rejected", days: 3 },
];

const statusBadge = (status: Status) => {
  const map = {
    Pending: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    Approved: "bg-green-50 text-green-700 border border-green-200",
    Rejected: "bg-red-50 text-red-700 border border-red-200",
  };
  return `inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${map[status]}`;
};

const statusIcon = (status: Status) => {
  if (status === "Pending") return <Clock className="w-3 h-3" />;
  if (status === "Approved") return <CheckCircle className="w-3 h-3" />;
  return <XCircle className="w-3 h-3" />;
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const today = new Date().toISOString().split("T")[0];

export function LeaveManagement() {
  const [leaves, setLeaves] = useState<LeaveRequest[]>(initialLeaves);
  const [activeTab, setActiveTab] = useState<"staff" | "admin">("admin");
  const [filterStatus, setFilterStatus] = useState<"All" | Status>("All");
  const [form, setForm] = useState({ fromDate: today, toDate: today, reason: "" });
  const [submitted, setSubmitted] = useState(false);

  const filtered = leaves.filter((l) => filterStatus === "All" || l.status === filterStatus);

  const approve = (id: number) =>
    setLeaves((prev) => prev.map((l) => (l.id === id ? { ...l, status: "Approved" } : l)));
  const reject = (id: number) =>
    setLeaves((prev) => prev.map((l) => (l.id === id ? { ...l, status: "Rejected" } : l)));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fromDate || !form.toDate || !form.reason) return;
    const from = new Date(form.fromDate);
    const to = new Date(form.toDate);
    const days = Math.max(1, Math.ceil((to.getTime() - from.getTime()) / 86400000) + 1);
    setLeaves((prev) => [
      {
        id: Date.now(),
        staff: "Admin User",
        department: "Administration",
        fromDate: form.fromDate,
        toDate: form.toDate,
        reason: form.reason,
        status: "Pending",
        days,
      },
      ...prev,
    ]);
    setForm({ fromDate: today, toDate: today, reason: "" });
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const counts = {
    All: leaves.length,
    Pending: leaves.filter((l) => l.status === "Pending").length,
    Approved: leaves.filter((l) => l.status === "Approved").length,
    Rejected: leaves.filter((l) => l.status === "Rejected").length,
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-gray-900 text-lg font-semibold">Leave Management</h2>
        <p className="text-gray-500 text-sm mt-0.5">Manage and review staff leave requests</p>
      </div>

      {/* Tab Toggle */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        <button
          onClick={() => setActiveTab("admin")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === "admin" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
        >
          Admin View
        </button>
        <button
          onClick={() => setActiveTab("staff")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === "staff" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
        >
          Apply Leave
        </button>
      </div>

      {activeTab === "staff" ? (
        /* Staff Leave Apply Form */
        <div className="max-w-lg">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#1E40AF]" />
              Submit Leave Request
            </h3>
            <p className="text-xs text-gray-400 mb-5">Fill out the form to apply for leave</p>

            {submitted && (
              <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                Leave request submitted successfully!
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">From Date</label>
                  <input
                    type="date"
                    value={form.fromDate}
                    min={today}
                    onChange={(e) => setForm({ ...form, fromDate: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">To Date</label>
                  <input
                    type="date"
                    value={form.toDate}
                    min={form.fromDate}
                    onChange={(e) => setForm({ ...form, toDate: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Reason for Leave</label>
                <textarea
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  placeholder="Briefly describe the reason for your leave request..."
                  rows={4}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {form.fromDate && form.toDate && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 text-sm text-blue-700">
                  Duration: <span className="font-semibold">
                    {Math.max(1, Math.ceil((new Date(form.toDate).getTime() - new Date(form.fromDate).getTime()) / 86400000) + 1)} day(s)
                  </span>
                  &nbsp; ({formatDate(form.fromDate)} – {formatDate(form.toDate)})
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-[#1E40AF] hover:bg-[#1d3a9e] text-white py-2.5 rounded-lg text-sm font-medium transition"
              >
                Submit Leave Request
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* Admin View */
        <>
          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {(["All", "Pending", "Approved", "Rejected"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`text-left bg-white rounded-xl border shadow-sm px-4 py-4 transition ${
                  filterStatus === s ? "border-[#1E40AF] ring-1 ring-[#1E40AF]" : "border-gray-100 hover:border-gray-200"
                }`}
              >
                <p className={`text-xl font-bold ${
                  s === "Pending" ? "text-yellow-600" :
                  s === "Approved" ? "text-green-600" :
                  s === "Rejected" ? "text-red-600" : "text-gray-900"
                }`}>{counts[s]}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s === "All" ? "Total Requests" : `${s} Requests`}</p>
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">
                {filterStatus === "All" ? "All Leave Requests" : `${filterStatus} Requests`}
              </h3>
              <span className="text-xs text-gray-400">{filtered.length} records</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Staff</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Department</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">From</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">To</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Days</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Reason</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-10 text-gray-400 text-sm">No leave requests found.</td>
                    </tr>
                  ) : (
                    filtered.map((l) => (
                      <tr key={l.id} className="hover:bg-gray-50 transition">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 bg-blue-50 rounded-full flex items-center justify-center text-[#1E40AF] text-xs font-bold flex-shrink-0">
                              {l.staff.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                            </div>
                            <span className="text-sm text-gray-900 font-medium">{l.staff}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-gray-500">{l.department}</td>
                        <td className="px-5 py-3.5 text-sm text-gray-500">{formatDate(l.fromDate)}</td>
                        <td className="px-5 py-3.5 text-sm text-gray-500">{formatDate(l.toDate)}</td>
                        <td className="px-5 py-3.5 text-sm text-gray-500">{l.days}d</td>
                        <td className="px-5 py-3.5">
                          <p className="text-sm text-gray-500 max-w-[160px] truncate" title={l.reason}>{l.reason}</p>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={statusBadge(l.status)}>
                            {statusIcon(l.status)}
                            {l.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          {l.status === "Pending" ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => approve(l.id)}
                                className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition font-medium"
                              >
                                <Check className="w-3 h-3" />
                                Approve
                              </button>
                              <button
                                onClick={() => reject(l.id)}
                                className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition font-medium"
                              >
                                <X className="w-3 h-3" />
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">No action</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
