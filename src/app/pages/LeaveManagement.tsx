import React, { useEffect, useMemo, useState } from "react";
import { Check, X, Clock, FileText, CheckCircle, XCircle } from "lucide-react";
import { apiFetch, type ApiError } from "../api/client";
import { useAuth } from "../context/AuthContext";

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

const calcDays = (fromDate: string, toDate: string) => {
  const from = new Date(fromDate);
  const to = new Date(toDate);
  return Math.max(1, Math.ceil((to.getTime() - from.getTime()) / 86400000) + 1);
};

const toStatus = (s: string): Status =>
  s === "approved" ? "Approved" : s === "rejected" ? "Rejected" : "Pending";
const fromStatus = (s: Status) => (s === "Approved" ? "approved" : s === "Rejected" ? "rejected" : "pending");

export function LeaveManagement() {
  const { token } = useAuth();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [activeTab, setActiveTab] = useState<"staff" | "admin">("admin");
  const [filterStatus, setFilterStatus] = useState<"All" | Status>("All");
  const [form, setForm] = useState({ fromDate: today, toDate: today, reason: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!token) return;
      if (activeTab !== "admin") return;
      setLoading(true);
      setError("");
      try {
        const qs = filterStatus === "All" ? "" : `?status=${fromStatus(filterStatus)}`;
        const data = await apiFetch<any[]>(`/admin/leave-requests${qs}`, { token });
        const mapped: LeaveRequest[] = data.map((l) => ({
          id: l.id,
          staff: l.user?.name || "Unknown",
          department: l.user?.department || "-",
          fromDate: new Date(l.fromDate).toISOString().slice(0, 10),
          toDate: new Date(l.toDate).toISOString().slice(0, 10),
          reason: l.reason,
          status: toStatus(l.status),
          days: calcDays(new Date(l.fromDate).toISOString().slice(0, 10), new Date(l.toDate).toISOString().slice(0, 10)),
        }));
        if (!cancelled) setLeaves(mapped);
      } catch (e: any) {
        const err = e as ApiError;
        if (!cancelled) setError(err?.message || "Failed to load leave requests");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [token, activeTab, filterStatus]);

  const filtered = useMemo(
    () => leaves.filter((l) => filterStatus === "All" || l.status === filterStatus),
    [leaves, filterStatus]
  );

  const approve = async (id: number) => {
    if (!token) return;
    setError("");
    try {
      await apiFetch(`/admin/leave-requests/${id}`, {
        token,
        method: "PUT",
        body: JSON.stringify({ status: "approved" }),
      });
      setLeaves((prev) => prev.map((l) => (l.id === id ? { ...l, status: "Approved" } : l)));
    } catch (e: any) {
      const err = e as ApiError;
      setError(err?.message || "Approve failed");
    }
  };
  const reject = async (id: number) => {
    if (!token) return;
    setError("");
    try {
      await apiFetch(`/admin/leave-requests/${id}`, {
        token,
        method: "PUT",
        body: JSON.stringify({ status: "rejected" }),
      });
      setLeaves((prev) => prev.map((l) => (l.id === id ? { ...l, status: "Rejected" } : l)));
    } catch (e: any) {
      const err = e as ApiError;
      setError(err?.message || "Reject failed");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fromDate || !form.toDate || !form.reason) return;
    if (!token) return;
    setError("");
    try {
      await apiFetch("/me/leave-requests", {
        token,
        method: "POST",
        body: JSON.stringify({ ...form }),
      });
      setForm({ fromDate: today, toDate: today, reason: "" });
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } catch (e: any) {
      const err = e as ApiError;
      setError(err?.message || "Submit failed");
    }
  };

  const counts = useMemo(
    () => ({
      All: leaves.length,
      Pending: leaves.filter((l) => l.status === "Pending").length,
      Approved: leaves.filter((l) => l.status === "Approved").length,
      Rejected: leaves.filter((l) => l.status === "Rejected").length,
    }),
    [leaves]
  );

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-gray-900 text-lg font-semibold">Leave Management</h2>
        <p className="text-gray-500 text-sm mt-0.5">Manage and review staff leave requests</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-3 text-red-700 text-sm">
          {error}
        </div>
      )}

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
              <span className="text-xs text-gray-400">{loading ? "Loading..." : `${filtered.length} records`}</span>
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
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="text-center py-10 text-gray-400 text-sm">Loading...</td>
                    </tr>
                  ) : filtered.length === 0 ? (
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
