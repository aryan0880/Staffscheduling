import React, { useEffect, useMemo, useState } from "react";
import { CheckCircle, XCircle, Clock, FileText, Plus } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { apiFetch, type ApiError } from "../../api/client";

type Status = "Pending" | "Approved" | "Rejected";

interface Leave {
  id: number;
  fromDate: string;
  toDate: string;
  reason: string;
  status: Status;
  days: number;
  appliedOn: string;
}

const statusBadge = (s: Status) => {
  const m: Record<Status, string> = {
    Pending:  "bg-yellow-50 text-yellow-700 border border-yellow-200",
    Approved: "bg-green-50 text-green-700 border border-green-200",
    Rejected: "bg-red-50 text-red-700 border border-red-200",
  };
  return `inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${m[s]}`;
};

const statusIcon = (s: Status) => {
  if (s === "Pending")  return <Clock className="w-3 h-3" />;
  if (s === "Approved") return <CheckCircle className="w-3 h-3" />;
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

export function MyLeaves() {
  const { token } = useAuth();
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]  = useState({ fromDate: today, toDate: today, reason: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!token) return;
      setLoading(true);
      setError("");
      try {
        const data = await apiFetch<any[]>("/me/leave-requests", { token });
        const mapped: Leave[] = data.map((l) => {
          const fromDate = new Date(l.fromDate).toISOString().slice(0, 10);
          const toDate = new Date(l.toDate).toISOString().slice(0, 10);
          const appliedOn = new Date(l.createdAt || Date.now()).toISOString().slice(0, 10);
          return {
            id: l.id,
            fromDate,
            toDate,
            reason: l.reason,
            status: toStatus(l.status),
            days: calcDays(fromDate, toDate),
            appliedOn,
          };
        });
        if (!cancelled) setLeaves(mapped);
      } catch (e: any) {
        const err = e as ApiError;
        if (!cancelled) setError(err?.message || "Failed to load leaves");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const approved = useMemo(() => leaves.filter((l) => l.status === "Approved").length, [leaves]);
  const pending = useMemo(() => leaves.filter((l) => l.status === "Pending").length, [leaves]);
  const rejected = useMemo(() => leaves.filter((l) => l.status === "Rejected").length, [leaves]);
  const usedDays = useMemo(() => leaves.filter((l) => l.status === "Approved").reduce((a, l) => a + l.days, 0), [leaves]);
  const balance = 12 - usedDays;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fromDate || !form.toDate || !form.reason.trim()) return;
    if (!token) return;
    setError("");
    try {
      const created = await apiFetch<any>("/me/leave-requests", {
        token,
        method: "POST",
        body: JSON.stringify(form),
      });
      const fromDate = new Date(created.fromDate).toISOString().slice(0, 10);
      const toDate = new Date(created.toDate).toISOString().slice(0, 10);
      const appliedOn = new Date(created.createdAt || Date.now()).toISOString().slice(0, 10);
      const newLeave: Leave = {
        id: created.id,
        fromDate,
        toDate,
        reason: created.reason,
        status: "Pending",
        days: calcDays(fromDate, toDate),
        appliedOn,
      };
      setLeaves((prev) => [newLeave, ...prev]);
      setForm({ fromDate: today, toDate: today, reason: "" });
      setShowForm(false);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 4000);
    } catch (e: any) {
      const err = e as ApiError;
      setError(err?.message || "Submit failed");
    }
  };

  return (
    <div className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-3 text-red-700 text-sm">
          {error}
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-gray-900 text-lg font-semibold">My Leave Requests</h2>
          <p className="text-gray-500 text-sm mt-0.5">Apply for leave and track your request status</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition"
        >
          <Plus className="w-4 h-4" />
          Apply for Leave
        </button>
      </div>

      {/* Success toast */}
      {submitted && (
        <div className="flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="font-medium">Leave request submitted successfully!</p>
            <p className="text-xs text-green-600 mt-0.5">Your request is pending admin approval.</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Leave Balance",     value: `${balance} days`, color: "text-green-600",  bg: "bg-green-50" },
          { label: "Pending",           value: pending,           color: "text-yellow-600", bg: "bg-yellow-50" },
          { label: "Approved",          value: approved,          color: "text-blue-700",   bg: "bg-blue-50" },
          { label: "Rejected",          value: rejected,          color: "text-red-600",    bg: "bg-red-50" },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-4">
            <p className={`text-xl font-bold ${c.color}`}>{c.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Leave Application Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-green-600" />
            New Leave Request
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">From Date</label>
                <input
                  type="date"
                  value={form.fromDate}
                  min={today}
                  onChange={(e) => setForm({ ...form, fromDate: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">To Date</label>
                <input
                  type="date"
                  value={form.toDate}
                  min={form.fromDate}
                  onChange={(e) => setForm({ ...form, toDate: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Reason for Leave</label>
              <textarea
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                placeholder="Briefly describe the reason for your leave request..."
                rows={3}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              />
            </div>
            {form.fromDate && form.toDate && (
              <div className="bg-green-50 border border-green-100 rounded-lg px-4 py-3 text-sm text-green-700">
                Duration: <span className="font-semibold">
                  {Math.max(1, Math.ceil((new Date(form.toDate).getTime() - new Date(form.fromDate).getTime()) / 86400000) + 1)} day(s)
                </span>
                &nbsp;— {formatDate(form.fromDate)} to {formatDate(form.toDate)}
              </div>
            )}
            <div className="flex items-center gap-3">
              <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition">
                Submit Request
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Leave History Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">My Leave History</h3>
          <span className="text-xs text-gray-400">{leaves.length} requests total</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[580px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">From</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">To</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Days</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Reason</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Applied On</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400 text-sm">Loading...</td>
                </tr>
              )}
              {leaves.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400 text-sm">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-gray-200" />
                    No leave requests yet. Click "Apply for Leave" to submit one.
                  </td>
                </tr>
              ) : (
                leaves.map((l) => (
                  <tr key={l.id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-3.5 text-sm text-gray-900 font-medium">{formatDate(l.fromDate)}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">{formatDate(l.toDate)}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">{l.days}d</td>
                    <td className="px-5 py-3.5 text-sm text-gray-500 max-w-[160px] truncate">{l.reason}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-400">{formatDate(l.appliedOn)}</td>
                    <td className="px-5 py-3.5">
                      <span className={statusBadge(l.status)}>
                        {statusIcon(l.status)}
                        {l.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
