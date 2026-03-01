import React, { useState } from "react";
import { Plus, Pencil, Trash2, X, Clock } from "lucide-react";

interface Shift {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
  type: string;
  staffCount: number;
}

const initialShifts: Shift[] = [
  { id: 1, name: "Morning Shift", startTime: "06:00", endTime: "14:00", type: "Regular", staffCount: 12 },
  { id: 2, name: "Afternoon Shift", startTime: "14:00", endTime: "22:00", type: "Regular", staffCount: 10 },
  { id: 3, name: "Night Shift", startTime: "22:00", endTime: "06:00", type: "Regular", staffCount: 6 },
  { id: 4, name: "Weekend Morning", startTime: "07:00", endTime: "15:00", type: "Weekend", staffCount: 5 },
  { id: 5, name: "Split Shift A", startTime: "08:00", endTime: "12:00", type: "Split", staffCount: 4 },
  { id: 6, name: "Late Evening", startTime: "18:00", endTime: "24:00", type: "Regular", staffCount: 7 },
];

const shiftTypes = ["Regular", "Weekend", "Split", "Overtime", "On-call"];

const typeBadge = (t: string) => {
  const map: Record<string, string> = {
    Regular: "bg-blue-50 text-blue-700 border border-blue-200",
    Weekend: "bg-purple-50 text-purple-700 border border-purple-200",
    Split: "bg-orange-50 text-orange-700 border border-orange-200",
    Overtime: "bg-red-50 text-red-700 border border-red-200",
    "On-call": "bg-yellow-50 text-yellow-700 border border-yellow-200",
  };
  return `inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${map[t] || "bg-gray-100 text-gray-600"}`;
};

const formatTime = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${suffix}`;
};

const calcDuration = (start: string, end: string) => {
  let [sh, sm] = start.split(":").map(Number);
  let [eh, em] = end.split(":").map(Number);
  let diff = (eh * 60 + em) - (sh * 60 + sm);
  if (diff < 0) diff += 24 * 60;
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  return `${h}h${m > 0 ? ` ${m}m` : ""}`;
};

const blank = { name: "", startTime: "09:00", endTime: "17:00", type: "Regular", staffCount: 0 };

export function ShiftManagement() {
  const [shifts, setShifts] = useState<Shift[]>(initialShifts);
  const [modal, setModal] = useState<null | "add" | "edit">(null);
  const [form, setForm] = useState({ ...blank });
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const openAdd = () => { setForm({ ...blank }); setModal("add"); };
  const openEdit = (s: Shift) => {
    setForm({ name: s.name, startTime: s.startTime, endTime: s.endTime, type: s.type, staffCount: s.staffCount });
    setEditId(s.id);
    setModal("edit");
  };
  const closeModal = () => { setModal(null); setEditId(null); };

  const handleSave = () => {
    if (!form.name) return;
    if (modal === "add") {
      setShifts((prev) => [...prev, { ...form, id: Date.now() }]);
    } else {
      setShifts((prev) => prev.map((s) => (s.id === editId ? { ...s, ...form } : s)));
    }
    closeModal();
  };

  const handleDelete = (id: number) => {
    setShifts((prev) => prev.filter((s) => s.id !== id));
    setDeleteConfirm(null);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-gray-900 text-lg font-semibold">Shift Management</h2>
          <p className="text-gray-500 text-sm mt-0.5">{shifts.length} shifts configured</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-[#1E40AF] hover:bg-[#1d3a9e] text-white px-4 py-2.5 rounded-lg text-sm font-medium transition"
        >
          <Plus className="w-4 h-4" />
          Create Shift
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Shifts", value: shifts.length, color: "text-[#1E40AF]" },
          { label: "Regular Shifts", value: shifts.filter(s => s.type === "Regular").length, color: "text-green-600" },
          { label: "Weekend Shifts", value: shifts.filter(s => s.type === "Weekend").length, color: "text-purple-600" },
          { label: "Total Staff Covered", value: shifts.reduce((a, b) => a + b.staffCount, 0), color: "text-orange-600" },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-4">
            <p className={`text-xl font-bold ${c.color}`}>{c.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">All Shifts</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Shift Name</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Start Time</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">End Time</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Duration</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Staff</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {shifts.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Clock className="w-4 h-4 text-[#1E40AF]" />
                      </div>
                      <span className="text-sm text-gray-900 font-medium">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-700 font-medium">{formatTime(s.startTime)}</td>
                  <td className="px-5 py-4 text-sm text-gray-700 font-medium">{formatTime(s.endTime)}</td>
                  <td className="px-5 py-4 text-sm text-gray-500">{calcDuration(s.startTime, s.endTime)}</td>
                  <td className="px-5 py-4"><span className={typeBadge(s.type)}>{s.type}</span></td>
                  <td className="px-5 py-4 text-sm text-gray-500">{s.staffCount} staff</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(s)} className="p-1.5 text-gray-400 hover:text-[#1E40AF] hover:bg-blue-50 rounded-lg transition">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeleteConfirm(s.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-gray-900 font-semibold">{modal === "add" ? "Create New Shift" : "Edit Shift"}</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Shift Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Morning Shift"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Time</label>
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">End Time</label>
                  <input
                    type="time"
                    value={form.endTime}
                    onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Shift Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {shiftTypes.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              {form.name && form.startTime && form.endTime && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 text-sm text-blue-700">
                  Duration: <span className="font-semibold">{calcDuration(form.startTime, form.endTime)}</span>
                  &nbsp;&mdash; {formatTime(form.startTime)} to {formatTime(form.endTime)}
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={closeModal} className="px-4 py-2.5 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2.5 text-sm text-white bg-[#1E40AF] hover:bg-[#1d3a9e] rounded-lg transition">
                {modal === "add" ? "Create Shift" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-gray-900 font-semibold text-center mb-2">Delete Shift?</h3>
            <p className="text-gray-500 text-sm text-center mb-6">All assignments for this shift will also be removed.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2.5 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 px-4 py-2.5 text-sm text-white bg-red-500 hover:bg-red-600 rounded-lg transition">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
