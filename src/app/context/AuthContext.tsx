import React, { createContext, useContext, useState } from "react";

export type UserRole = "admin" | "staff";

export interface AuthUser {
  role: UserRole;
  name: string;
  email: string;
  department?: string;
  id?: number;
  initials: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem("ssms_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const login = (u: AuthUser) => {
    setUser(u);
    localStorage.setItem("ssms_user", JSON.stringify(u));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("ssms_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

// ── credential store ──────────────────────────────────────────
export const STAFF_USERS: AuthUser[] = [
  { id: 1,  role: "staff", name: "Alice Brown",    email: "alice@ssms.com",  department: "Operations",  initials: "AB" },
  { id: 2,  role: "staff", name: "Bob Kumar",      email: "bob@ssms.com",    department: "Security",    initials: "BK" },
  { id: 3,  role: "staff", name: "Carol Lee",      email: "carol@ssms.com",  department: "Maintenance", initials: "CL" },
  { id: 4,  role: "staff", name: "David Patel",    email: "david@ssms.com",  department: "Reception",   initials: "DP" },
  { id: 5,  role: "staff", name: "Emma Wilson",    email: "emma@ssms.com",   department: "Operations",  initials: "EW" },
  { id: 6,  role: "staff", name: "Frank Davis",    email: "frank@ssms.com",  department: "IT",          initials: "FD" },
  { id: 7,  role: "staff", name: "Grace Kim",      email: "grace@ssms.com",  department: "HR",          initials: "GK" },
  { id: 8,  role: "staff", name: "Henry Johnson",  email: "henry@ssms.com",  department: "Finance",     initials: "HJ" },
  { id: 9,  role: "staff", name: "Isla Martinez",  email: "isla@ssms.com",   department: "Operations",  initials: "IM" },
  { id: 10, role: "staff", name: "James Carter",   email: "james@ssms.com",  department: "Security",    initials: "JC" },
];

export const ADMIN_USER: AuthUser = {
  role: "admin",
  name: "Admin User",
  email: "admin@ssms.com",
  department: "Administration",
  initials: "AD",
};
