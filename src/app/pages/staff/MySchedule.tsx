import React, { useState } from "react";
import { Clock, ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const ALL_SHIFTS: Record<string, { shift: string; time: string; date: string; type: string }[]> = {
  "Alice Brown": [
    { shift: "Morning Shift",   time: "6:00 AM – 2:00 PM",   date: "2025-02-03", type: "Regular" },
    { shift: "Morning Shift",   time: "6:00 AM – 2:00 PM",   date: "2025-02-05", type: "Regular" },
    { shift: "Morning Shift",   time: "6:00 AM – 2:00 PM",   date: "2025-02-10", type: "Regular" },
    { shift: "Afternoon Shift", time: "2:00 PM – 10:00 PM",  date: "2025-02-14", type: "Regular" },
    { shift: "Morning Shift",   time: "6:00 AM – 2:00 PM",   date: "2025-02-19", type: "Regular" },
    { shift: "Morning Shift",   time: "6:00 AM – 2:00 PM",   date: "2025-02-24", type: "Regular" },
    { shift: "Morning Shift",   time: "6:00 AM – 2:00 PM",   date: "2025-02-26", type: "Regular" },
    { shift: "Morning Shift",   time: "6:00 AM – 2:00 PM",   date: "2025-02-27", type: "Regular" },
    { shift: "Morning Shift",   time: "6:00 AM – 2:00 PM",   date: "2025-03-01", type: "Regular" },
    { shift: "Afternoon Shift", time: "2:00 PM – 10:00 PM",  date: "2025-03-03", type: "Regular" },
    { shift: "Morning Shift",   time: "6:00 AM – 2:00 PM",   date: "2025-03-05", type: "Regular" },
    { shift: "Morning Shift",   time: "6:00 AM – 2:00 PM",   date: "2025-03-10", type: "Regular" },
  ],
  "Bob Kumar": [
    { shift: "Afternoon Shift", time: "2:00 PM – 10:00 PM",  date: "2025-02-04", type: "Regular" },
    { shift: "Night Shift",     time: "10:00 PM – 6:00 AM",  date: "2025-02-07", type: "Regular" },
    { shift: "Afternoon Shift", time: "2:00 PM – 10:00 PM",  date: "2025-02-12", type: "Regular" },
    { shift: "Afternoon Shift", time: "2:00 PM – 10:00 PM",  date: "2025-02-26", type: "Regular" },
    { shift: "Night Shift",     time: "10:00 PM – 6:00 AM",  date: "2025-02-28", type: "Regular" },
    { shift: "Afternoon Shift", time: "2:00 PM – 10:00 PM",  date: "2025-03-02", type: "Regular" },
  ],
  "Carol Lee": [
    { shift: "Night Shift", time: "10:00 PM – 6:00 AM", date: "2025-02-02", type: "Regular" },
    { shift: "Night Shift", time: "10:00 PM – 6:00 AM", date: "2025-02-08", type: "Regular" },
    { shift: "Night Shift", time: "10:00 PM – 6:00 AM", date: "2025-02-15", type: "Regular" },
    { shift: "Night Shift", time: "10:00 PM – 6:00 AM", date: "2025-02-26", type: "Regular" },
    { shift: "Night Shift", time: "10:00 PM – 6:00 AM", date: "2025-03-01", type: "Regular" },
    { shift: "Night Shift", time: "10:00 PM – 6:00 AM", date: "2025-03-04", type: "Regular" },
  ],
};

const DEFAULT_SHIFTS = [
  { shift: "Morning Shift", time: "6:00 AM – 2:00 PM", date: "2025-02-26", type: "Regular" },
  { shift: "Afternoon Shift", time: "2:00 PM – 10:00 PM", date: "2025-03-03", type: "Regular" },
];

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const shiftColors: Record<string, string> = {
  "Morning Shift":   "bg-blue-50 text-[#1E40AF] border-blue-200",
  "Afternoon Shift": "bg-purple-50 text-purple-700 border-purple-200",
  "Night Shift":     "bg-gray-800 text-white border-gray-700",
  "Split Shift A":   "bg-orange-50 text-orange-700 border-orange-200",
  "Weekend Morning": "bg-pink-50 text-pink-700 border-pink-200",
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });

function getDaysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
function getFirstDay(y: number, m: number) { return new Date(y, m, 1).getDay(); }

export function MySchedule() {
  const { user } = useAuth();
  const name = user?.name || "";
  const allShifts = ALL_SHIFTS[name] || DEFAULT_SHIFTS;

  const [view, setView] = useState<"list" | "calendar">("list");
  const [calDate, setCalDate] = useState(new Date(2025, 1, 1));

  const year = calDate.getFullYear();
  const month = calDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDay(year, month);

  // Filter shifts for current calendar month
  const shiftsThisMonth = allShifts.filter((s) => {
    const d = new Date(s.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  const totalHours = allShifts.length * 8;

  const shiftsForDay = (day: number) => {
    const ds = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return allShifts.filter((s) => s.date === ds);
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-gray-900 text-lg font-semibold">My Schedule</h2>
          <p className="text-gray-500 text-sm mt-0.5">Your assigned shifts and schedule</p>
        </div>
        <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
          <button onClick={() => setView("list")} className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${view === "list" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}>List View</button>
          <button onClick={() => setView("calendar")} className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${view === "calendar" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}>Calendar</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Shifts",        value: allShifts.length },
          { label: "This Month",          value: shiftsThisMonth.length },
          { label: "Total Hours Worked",  value: `${totalHours}h` },
          { label: "Avg Hours/Week",      value: "40h" },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-4">
            <p className="text-xl font-bold text-gray-900">{c.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>

      {view === "list" ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">All Assigned Shifts</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Shift</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Time</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Hours</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {allShifts.map((s, i) => {
                  const isToday = s.date === today;
                  return (
                    <tr key={i} className={`hover:bg-gray-50 transition ${isToday ? "bg-blue-50/50" : ""}`}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-900 font-medium">{formatDate(s.date)}</span>
                          {isToday && <span className="text-xs bg-[#1E40AF] text-white px-2 py-0.5 rounded-full">Today</span>}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${shiftColors[s.shift] || "bg-gray-100 text-gray-700"}`}>
                          {s.shift}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-500">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          {s.time}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-500">8h</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          {/* Calendar nav */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setCalDate(new Date(year, month - 1, 1))} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="text-center">
              <h3 className="text-sm font-semibold text-gray-900">{MONTHS[month]} {year}</h3>
              <p className="text-xs text-gray-400">{shiftsThisMonth.length} shifts this month</p>
            </div>
            <button onClick={() => setCalDate(new Date(year, month + 1, 1))} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-1">
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
              <div key={d} className="text-center text-xs font-medium text-gray-400 py-2">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const ds = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const dayShifts = shiftsForDay(day);
              const isToday = ds === today;
              return (
                <div key={day} className={`min-h-[68px] p-1.5 rounded-lg border transition ${isToday ? "border-[#1E40AF] bg-blue-50" : dayShifts.length > 0 ? "border-green-200 bg-green-50/50" : "border-gray-100"}`}>
                  <p className={`text-xs font-semibold mb-1 ${isToday ? "text-[#1E40AF]" : "text-gray-600"}`}>{day}</p>
                  {dayShifts.map((s, idx) => (
                    <div key={idx} className="bg-green-600 text-white text-xs px-1.5 py-0.5 rounded truncate">
                      {s.shift.replace(" Shift", "")}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
          {/* Legend */}
          <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-green-600 rounded" /> Your shift</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 border border-[#1E40AF] bg-blue-50 rounded" /> Today</span>
          </div>
        </div>
      )}
    </div>
  );
}
