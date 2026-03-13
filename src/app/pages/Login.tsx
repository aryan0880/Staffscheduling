import React, { useState } from "react";
import { useNavigate } from "react-router";
import { Eye, EyeOff, Calendar, Lock, Mail, Shield, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { apiFetch, type ApiError } from "../api/client";
import { GoogleLogin } from "@react-oauth/google";

type DemoRole = "admin" | "staff";

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fillDemo = (role: DemoRole) => {
    if (role === "admin") {
      setEmail("admin@ssms.com");
      setPassword("admin123");
    } else {
      setEmail("alice@ssms.com");
      setPassword("staff123");
    }
    setError("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Please enter your credentials."); return; }

    setLoading(true);
    try {
      const res = await apiFetch<{ token: string; user: any }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      login(res.token, res.user);
      navigate(res.user.role === "admin" ? "/app/dashboard" : "/staff/dashboard");
    } catch (e: any) {
      const err = e as ApiError;
      setError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-[#1E40AF] rounded-2xl mb-4 shadow-md">
            <Calendar className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-gray-900 text-2xl font-bold tracking-tight">SSMS</h1>
          <p className="text-gray-500 text-sm mt-1">Staff Scheduling &amp; Shift Management</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-gray-900 text-xl font-semibold mb-1">Welcome back</h2>
          <p className="text-gray-500 text-sm mb-6">Sign in with your admin or staff account</p>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" className="rounded border-gray-300 text-blue-600" />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <button type="button" className="text-sm text-[#1E40AF] hover:underline">
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1E40AF] hover:bg-[#1d3a9e] text-white py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </>
              ) : "Sign In"}
            </button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  if (credentialResponse.credential) {
                    setLoading(true);
                    try {
                      const res = await apiFetch<{ token: string; user: any }>("/auth/google", {
                        method: "POST",
                        body: JSON.stringify({ credential: credentialResponse.credential }),
                      });
                      login(res.token, res.user);
                      navigate(res.user.role === "admin" ? "/app/dashboard" : "/staff/dashboard");
                    } catch (e: any) {
                      setError(e?.message || "Google login failed");
                    } finally {
                      setLoading(false);
                    }
                  }
                }}
                onError={() => {
                  setError("Google login failed");
                }}
                useOneTap
                theme="outline"
                shape="rectangular"
                width="100%"
              />
            </div>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-400 mb-3 uppercase tracking-wide text-center">Demo Credentials</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => fillDemo("admin")}
                className="flex items-center gap-2.5 px-3 py-2.5 border border-gray-200 rounded-lg hover:border-[#1E40AF] hover:bg-blue-50 transition group text-left"
              >
                <div className="w-7 h-7 bg-[#1E40AF] rounded-md flex items-center justify-center flex-shrink-0">
                  <Shield className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-900 group-hover:text-[#1E40AF]">Admin Login</p>
                  <p className="text-xs text-gray-400">admin@ssms.com</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => fillDemo("staff")}
                className="flex items-center gap-2.5 px-3 py-2.5 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition group text-left"
              >
                <div className="w-7 h-7 bg-green-600 rounded-md flex items-center justify-center flex-shrink-0">
                  <User className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-900 group-hover:text-green-700">Staff Login</p>
                  <p className="text-xs text-gray-400">alice@ssms.com</p>
                </div>
              </button>
            </div>
            <p className="text-center text-xs text-gray-400 mt-3">
              Admin password: <span className="font-medium text-gray-600">admin123</span>
              &nbsp;&middot;&nbsp; Staff password: <span className="font-medium text-gray-600">staff123</span>
            </p>
          </div>
        </div>

        <p className="text-center text-gray-400 text-xs mt-6">
          Staff Scheduling &amp; Shift Management System &copy; 2025 &middot; Mini Project v1.0
        </p>
      </div>
    </div>
  );
}
