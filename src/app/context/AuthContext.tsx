import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch } from "../api/client";

export type UserRole = "admin" | "staff";

export interface AuthUser {
  role: UserRole;
  name: string;
  email: string;
  department?: string;
  contact?: string;
  availability?: string;
  id?: number;
  initials: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  refreshing: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
  refreshing: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Restore cached session
  useEffect(() => {
    try {
      const t = localStorage.getItem("ssms_token");
      const u = localStorage.getItem("ssms_user");
      if (t) setToken(t);
      if (u) setUser(JSON.parse(u));
    } catch {
      // ignore
    }
  }, []);

  // Validate token and refresh `/me` on load / token change
  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!token) return;
      setRefreshing(true);
      try {
        const me = await apiFetch<AuthUser>("/me", { token });
        if (!cancelled) {
          setUser(me);
          localStorage.setItem("ssms_user", JSON.stringify(me));
        }
      } catch {
        if (!cancelled) {
          setUser(null);
          setToken(null);
          localStorage.removeItem("ssms_user");
          localStorage.removeItem("ssms_token");
        }
      } finally {
        if (!cancelled) setRefreshing(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const login = (t: string, u: AuthUser) => {
    setToken(t);
    setUser(u);
    localStorage.setItem("ssms_token", t);
    localStorage.setItem("ssms_user", JSON.stringify(u));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("ssms_user");
    localStorage.removeItem("ssms_token");
  };

  const value = useMemo(() => ({ user, token, login, logout, refreshing }), [user, token, refreshing]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
