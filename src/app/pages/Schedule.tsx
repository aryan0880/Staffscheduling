import React, { useState } from "react";
import { CalendarDays, Trash2, UserCheck, ChevronLeft, ChevronRight } from "lucide-react";

const staffList = [
  "Alice Brown", "Bob Kumar", "Carol Lee", "David Patel",
  "Emma Wilson", "Frank Davis", "Grace Kim", "Henry Johnson",
  "Isla Martinez", "James Carter",
];

const shiftList = [
  { name: "Morning Shift", time: "6:00 AM – 2:00 PM" },
  { name: "Afternoon Shift", time: "2:00 PM – 10:00 PM" },
  { name: "Night Shift", time: "10:00 PM – 6:00 AM" },
  { name: "Weekend Morning", time: "7:00 AM – 3:00 PM" },
  { name: "Split Shift A", time: "8:00 AM – 12:00 PM" },
  { name: "Late Evening", time: "6:00 PM – 12:00 AM" },
];

interface Assignment {
  id: number;
  staff: string;
  shift: string;
  shiftTime: string;
  date: string;
}

const today = new Date().toISOString().split("T")[0];

const initialAssignments: Assignment[] = [
  { id: 1, staff: "Alice Brown", shift: "Morning Shift", shiftTime: "6:00 AM – 2:00 PM", date: "2025-02-26" },
  { id: 2, staff: "Bob Kumar", shift: "Afternoon Shift", shiftTime: "2:00 PM – 10:00 PM", date: "2025-02-26" },
  { id: 3, staff: "Carol Lee", shift: "Night Shift", shiftTime: "10:00 PM – 6:00 AM", date: "2025-02-26" },
  { id: 4, staff: "David Patel", shift: "Morning Shift", shiftTime: "6:00 AM – 2:00 PM", date: "2025-02-27" },
  { id: 5, staff: "Emma Wilson", shift: "Afternoon Shift", shiftTime: "2:00 PM – 10:00 PM", date: "2025-02-27" },
  { id: 6, staff: "Frank Davis", shift: "Weekend Morning", shiftTime: "7:00 AM – 3:00 PM", date: "2025-03-01" },
  { id: 7, staff: "Grace Kim", shift: "Night Shift", shiftTime: "10:00 PM – 6:00 AM", date: "2025-03-01" },
];

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });

// Calendar helpers
function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export function Schedule() {
  const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments);
  const [form, setForm] = useState({ staff: staffList[0], shift: shiftList[0].name, date: today });
  const [view, setView] = useState<"table" | "calendar">("table");
  const [calDate, setCalDate] = useState(new Date(2025, 1, 1)); // Feb 2025

  const handleAssign = () => {
    if (!form.staff || !form.shift || !form.date) return;
    const shiftObj = shiftList.find((s) => s.name === form.shift);
    setAssignments((prev) => [
      { id: Date.now(), staff: form.staff, shift: form.shift, shiftTime: shiftObj?.time || "", date: form.date },
      ...prev,
    ]);
  };

  const handleDelete = (id: number) => setAssignments((prev) => prev.filter((a) => a.id !== id));

  const prevMonth = () => setCalDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setCalDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const year = calDate.getFullYear();
  const month = calDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const assignmentsForDay = (day: number) => {
    const ds = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return assignments.filter((a) => a.date === ds);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-gray-900 text-lg font-semibold">Schedule Assignment</h2>
        <p className="text-gray-500 text-sm mt-0.5">Assign staff to shifts and manage the schedule</p>
      </div>

      {/* Assignment Form */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-[#1E40AF]" />
          Assign Shift
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Select Staff</label>
            <select
              value={form.staff}
              onChange={(e) => setForm({ ...form, staff: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {staffList.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Select Shift</label>
            <select
              value={form.shift}
              onChange={(e) => setForm({ ...form, shift: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {shiftList.map((s) => <option key={s.name}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Select Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <button
          onClick={handleAssign}
          className="flex items-center gap-2 bg-[#1E40AF] hover:bg-[#1d3a9e] text-white px-5 py-2.5 rounded-lg text-sm font-medium transition"
        >
          <CalendarDays className="w-4 h-4" />
          Assign Shift
        </button>
      </div>

      {/* View Toggle + Table/Calendar */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Assigned Schedule</h3>
            <p className="text-xs text-gray-400 mt-0.5">{assignments.length} assignments total</p>
          </div>
          <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setView("table")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${view === "table" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              Table
            </button>
            <button
              onClick={() => setView("calendar")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${view === "calendar" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              Calendar
            </button>
          </div>
        </div>

        {view === "table" ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Staff Name</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Shift</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Time</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {assignments.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 bg-blue-50 rounded-full flex items-center justify-center text-[#1E40AF] text-xs font-bold flex-shrink-0">
                          {a.staff.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </div>
                        <span className="text-sm text-gray-900 font-medium">{a.staff}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-700 font-medium">{a.shift}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">{a.shiftTime}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">{formatDate(a.date)}</td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => handleDelete(a.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                        title="Remove assignment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {assignments.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-gray-400 text-sm">No assignments yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-5">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-4">
              <button onClick={prevMonth} className="p-1.5 hover:bg-gray-100 rounded-lg transition text-gray-500">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <h3 className="text-sm font-semibold text-gray-900">{MONTHS[month]} {year}</h3>
              <button onClick={nextMonth} className="p-1.5 hover:bg-gray-100 rounded-lg transition text-gray-500">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
                <div key={d} className="text-center text-xs font-medium text-gray-400 py-2">{d}</div>
              ))}
            </div>
            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dayAssignments = assignmentsForDay(day);
                const isToday = `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}` === today;
                return (
                  <div
                    key={day}
                    className={`min-h-[72px] p-1.5 rounded-lg border transition ${
                      isToday ? "border-[#1E40AF] bg-blue-50" : "border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    <p className={`text-xs font-semibold mb-1 ${isToday ? "text-[#1E40AF]" : "text-gray-700"}`}>{day}</p>
                    {dayAssignments.slice(0, 2).map((a) => (
                      <div key={a.id} className="bg-[#1E40AF] text-white text-xs px-1.5 py-0.5 rounded mb-0.5 truncate">
                        {a.staff.split(" ")[0]}
                      </div>
                    ))}
                    {dayAssignments.length > 2 && (
                      <div className="text-xs text-gray-400">+{dayAssignments.length - 2} more</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
