import React, { useState } from "react";
import { User, Mail, Phone, Building2, Calendar, Lock, Pencil, Check, X, ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const availBadge = (a: string) => {
  const m: Record<string, string> = {
    "Full-time": "bg-green-50 text-green-700 border border-green-200",
    "Part-time": "bg-blue-50 text-blue-700 border border-blue-200",
    "On-call":   "bg-orange-50 text-orange-700 border border-orange-200",
  };
  return `inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${m[a] || "bg-gray-100 text-gray-600"}`;
};

const formatJoinDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

const getTenure = (joinDate: string) => {
  const diff = Date.now() - new Date(joinDate).getTime();
  const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
  if (months < 12) return `${months} months`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  return rem > 0 ? `${years} yr ${rem} mo` : `${years} year${years > 1 ? "s" : ""}`;
};

export function MyProfile() {
  const { user } = useAuth();
  const name = user?.name || "Staff User";
  const details = {
    contact: user?.contact || "+1-555-0000",
    joinDate: "2023-01-01",
    empId: `EMP${String(user?.id || 0).padStart(3, "0")}`,
    shift: "Shift",
    availability: user?.availability || "Full-time",
  };

  const [editing, setEditing] = useState(false);
  const [contact, setContact] = useState(details.contact);
  const [tempContact, setTempContact] = useState(details.contact);
  const [pwSection, setPwSection] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setContact(tempContact);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h2 className="text-gray-900 text-lg font-semibold">My Profile</h2>
        <p className="text-gray-500 text-sm mt-0.5">View and manage your account details</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-start gap-5">
          <div className="w-20 h-20 bg-green-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 shadow-md">
            {user?.initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-gray-900 text-lg font-bold">{name}</h3>
                <p className="text-gray-500 text-sm mt-0.5">{user?.department} Department</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={availBadge(details.availability)}>{details.availability}</span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-[#1E40AF] border border-blue-200">
                    <ShieldCheck className="w-3 h-3" /> Staff
                  </span>
                </div>
              </div>
              <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-lg font-mono">{details.empId}</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-gray-100">
          {[
            { label: "Employee ID",   value: details.empId },
            { label: "Tenure",        value: getTenure(details.joinDate) },
            { label: "Preferred Shift", value: details.shift.replace(" Shift", "") },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-sm font-semibold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {saved && (
        <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
          <Check className="w-4 h-4" /> Profile updated successfully.
        </div>
      )}

      {/* Personal Details */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-semibold text-gray-900">Personal Information</h3>
          {!editing ? (
            <button
              onClick={() => { setEditing(true); setTempContact(contact); }}
              className="flex items-center gap-1.5 text-xs text-[#1E40AF] hover:bg-blue-50 px-3 py-1.5 rounded-lg transition"
            >
              <Pencil className="w-3.5 h-3.5" /> Edit
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button onClick={handleSave} className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition">
                <Check className="w-3.5 h-3.5" /> Save
              </button>
              <button onClick={() => setEditing(false)} className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition">
                <X className="w-3.5 h-3.5" /> Cancel
              </button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {/* Full Name (read-only) */}
          <div className="flex items-start gap-3 py-3 border-b border-gray-100">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-gray-500" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-400 mb-0.5">Full Name</p>
              <p className="text-sm text-gray-900 font-medium">{name}</p>
            </div>
            <span className="text-xs text-gray-300 bg-gray-50 px-2 py-1 rounded">Read-only</span>
          </div>

          {/* Email (read-only) */}
          <div className="flex items-start gap-3 py-3 border-b border-gray-100">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Mail className="w-4 h-4 text-gray-500" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-400 mb-0.5">Email Address</p>
              <p className="text-sm text-gray-900 font-medium">{user?.email}</p>
            </div>
            <span className="text-xs text-gray-300 bg-gray-50 px-2 py-1 rounded">Read-only</span>
          </div>

          {/* Contact (editable) */}
          <div className="flex items-start gap-3 py-3 border-b border-gray-100">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Phone className="w-4 h-4 text-gray-500" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-400 mb-0.5">Contact Number</p>
              {editing ? (
                <input
                  type="text"
                  value={tempContact}
                  onChange={(e) => setTempContact(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              ) : (
                <p className="text-sm text-gray-900 font-medium">{contact}</p>
              )}
            </div>
          </div>

          {/* Department */}
          <div className="flex items-start gap-3 py-3 border-b border-gray-100">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Building2 className="w-4 h-4 text-gray-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Department</p>
              <p className="text-sm text-gray-900 font-medium">{user?.department}</p>
            </div>
          </div>

          {/* Join Date */}
          <div className="flex items-start gap-3 py-3">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Calendar className="w-4 h-4 text-gray-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Date of Joining</p>
              <p className="text-sm text-gray-900 font-medium">{formatJoinDate(details.joinDate)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
              <Lock className="w-4 h-4 text-gray-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Change Password</p>
              <p className="text-xs text-gray-400">Update your account password</p>
            </div>
          </div>
          <button
            onClick={() => setPwSection(!pwSection)}
            className="text-sm text-[#1E40AF] hover:underline"
          >
            {pwSection ? "Cancel" : "Change"}
          </button>
        </div>

        {pwSection && (
          <div className="mt-5 pt-5 border-t border-gray-100 space-y-4">
            {["Current Password", "New Password", "Confirm New Password"].map((label) => (
              <div key={label}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            ))}
            <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg text-sm font-medium transition">
              Update Password
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
