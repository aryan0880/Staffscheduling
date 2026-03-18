import React, { useEffect, useMemo, useState } from "react";
import { Search, Plus, Pencil, Trash2, X, UserCircle, Eye, EyeOff, Lock } from "lucide-react";
import { apiFetch, type ApiError } from "../api/client";
import { useAuth } from "../context/AuthContext";

interface Staff {
  id: number;
  name: string;
  email: string;
  department: string;
  contact: string;
  availability: string;
  initials?: string;
}

const depts = ["Operations", "Security", "Maintenance", "Reception", "IT", "HR", "Finance"];
const availabilities = ["Full-time", "Part-time", "On-call"];

const availBadge = (a: string) => {
  const map: Record<string, string> = {
    "Full-time": "bg-green-50 text-green-700 border border-green-200",
    "Part-time": "bg-blue-50 text-blue-700 border border-blue-200",
    "On-call": "bg-orange-50 text-orange-700 border border-orange-200",
  };
  return `inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${map[a] || "bg-gray-100 text-gray-600"}`;
};

type StaffForm = Omit<Staff, "id" | "initials"> & { password?: string };

const blank: StaffForm = {
  name: "",
  email: "",
  department: depts[0],
  contact: "",
  availability: availabilities[0],
  password: "",
};

export function StaffManagement() {
  const { token } = useAuth();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<null | "add" | "edit">(null);
  const [form, setForm] = useState({ ...blank });
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!token) return;
      setLoading(true);
      setError("");
      try {
        const data = await apiFetch<Staff[]>("/admin/staff", { token });
        if (!cancelled) setStaff(data);
      } catch (e: any) {
        const err = e as ApiError;
        if (!cancelled) setError(err?.message || "Failed to load staff");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return staff.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        (s.department || "").toLowerCase().includes(q)
    );
  }, [staff, search]);

  const openAdd = () => {
    setForm({ ...blank });
    setShowPassword(false);
    setModal("add");
  };
  const openEdit = (s: Staff) => {
    setForm({ name: s.name, email: s.email, department: s.department, contact: s.contact, availability: s.availability, password: "" });
    setEditId(s.id);
    setShowPassword(false);
    setModal("edit");
  };
  const closeModal = () => {
    setModal(null);
    setEditId(null);
    setShowPassword(false);
  };

  const handleSave = async () => {
    if (!token) return;
    if (!form.name || !form.email) return;
    setError("");
    try {
      const payload: any = {
        name: form.name,
        email: form.email,
        department: form.department,
        contact: form.contact,
        availability: form.availability,
      };
      if (form.password && form.password.trim().length > 0) payload.password = form.password;

      if (modal === "add") {
        const created = await apiFetch<Staff>("/admin/staff", {
          token,
          method: "POST",
          body: JSON.stringify(payload),
        });
        setStaff((prev) => [...prev, created]);
      } else if (editId != null) {
        const updated = await apiFetch<Staff>(`/admin/staff/${editId}`, {
          token,
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setStaff((prev) => prev.map((s) => (s.id === editId ? updated : s)));
      }
      closeModal();
    } catch (e: any) {
      const err = e as ApiError;
      setError(err?.message || "Save failed");
    }
  };

  const handleDelete = async (id: number) => {
    if (!token) return;
    setError("");
    try {
      await apiFetch<void>(`/admin/staff/${id}`, { token, method: "DELETE" });
      setStaff((prev) => prev.filter((s) => s.id !== id));
      setDeleteConfirm(null);
    } catch (e: any) {
      const err = e as ApiError;
      setError(err?.message || "Delete failed");
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-gray-900 text-lg font-semibold">Staff Management</h2>
          <p className="text-gray-500 text-sm mt-0.5">
            {loading ? "Loading staff..." : `${staff.length} staff members registered`}
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-[#1E40AF] hover:bg-[#1d3a9e] text-white px-4 py-2.5 rounded-lg text-sm font-medium transition"
        >
          <Plus className="w-4 h-4" />
          Add Staff
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Table Card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        {/* Search bar */}
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search staff..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Department</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Contact</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Availability</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400 text-sm">
                    Loading...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400 text-sm">
                    <UserCircle className="w-10 h-10 mx-auto mb-2 text-gray-200" />
                    No staff found
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50 transition group">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-[#1E40AF] text-xs font-bold flex-shrink-0">
                          {s.initials || s.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </div>
                        <span className="text-sm text-gray-900 font-medium">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">{s.email}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">{s.department}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">{s.contact}</td>
                    <td className="px-5 py-3.5">
                      <span className={availBadge(s.availability)}>{s.availability}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(s)}
                          className="p-1.5 text-gray-400 hover:text-[#1E40AF] hover:bg-blue-50 rounded-lg transition"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(s.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination info */}
        <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
          Showing {filtered.length} of {staff.length} records
        </div>
      </div>

      {/* Add/Edit Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-gray-900 font-semibold">{modal === "add" ? "Add New Staff" : "Edit Staff"}</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {[
                { label: "Full Name", key: "name", type: "text", placeholder: "e.g. John Doe" },
                { label: "Email Address", key: "email", type: "email", placeholder: "e.g. john@company.com" },
                { label: "Contact Number", key: "contact", type: "text", placeholder: "e.g. +1-555-0100" },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                  <input
                    type={type}
                    value={(form as any)[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    placeholder={placeholder}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {modal === "add" ? "Password (optional)" : "New Password (optional)"}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password || ""}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder={modal === "add" ? "Leave blank to use default: staff123" : "Leave blank to keep current password"}
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {modal === "add" && (
                  <p className="mt-1 text-xs text-gray-400">
                    If you don’t set one, the default password is <span className="font-medium text-gray-600">staff123</span>.
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Department</label>
                <select
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {depts.map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Availability</label>
                <select
                  value={form.availability}
                  onChange={(e) => setForm({ ...form, availability: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {availabilities.map((a) => <option key={a}>{a}</option>)}
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button
                onClick={closeModal}
                className="px-4 py-2.5 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2.5 text-sm text-white bg-[#1E40AF] hover:bg-[#1d3a9e] rounded-lg transition"
              >
                {modal === "add" ? "Add Staff" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-gray-900 font-semibold text-center mb-2">Remove Staff Member?</h3>
            <p className="text-gray-500 text-sm text-center mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2.5 text-sm text-white bg-red-500 hover:bg-red-600 rounded-lg transition"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
