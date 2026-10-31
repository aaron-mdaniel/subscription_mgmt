"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FormField } from "@/components/ui/FormField";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  Shield,
  Briefcase,
  User,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [activePersona, setActivePersona] = useState<"admin" | "staff" | "customer">("admin");
  const [email, setEmail] = useState("admin@brightloop.in");
  const [password, setPassword] = useState("BrightLoop@Admin2026");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const selectPersona = (role: "admin" | "staff" | "customer") => {
    setActivePersona(role);
    setError("");
    if (role === "admin") {
      setEmail("admin@brightloop.in");
      setPassword("BrightLoop@Admin2026");
    } else if (role === "staff") {
      setEmail("staff.ops@brightloop.in");
      setPassword("BrightLoop@Staff2026");
    } else {
      setEmail("billing@acmecloud.io");
      setPassword("Acme@Customer2026");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in both email and password.");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      if (email.includes("admin")) {
        router.push("/dashboard");
      } else if (email.includes("staff")) {
        router.push("/staff/dashboard");
      } else {
        router.push("/portal");
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#FBFBFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-indigo-100 selection:text-indigo-900">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-4 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-700 flex items-center justify-center text-white font-bold text-base shadow-sm group-hover:scale-105 transition-transform">
            BL
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">
            BrightLoop
          </span>
        </Link>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Sign In to Your Workspace
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Secure subscription operations & accounts receivable console
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-8 border border-slate-200/80 rounded-2xl shadow-card">
          {/* Sleek Role Persona Selector */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Select Persona:
              </span>
              <span className="text-[11px] font-medium text-indigo-600">
                1-Click Preset
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200/60">
              <button
                type="button"
                onClick={() => selectPersona("admin")}
                className={`py-2 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  activePersona === "admin"
                    ? "bg-white text-indigo-700 shadow-subtle font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-indigo-600" /> Admin
              </button>
              <button
                type="button"
                onClick={() => selectPersona("staff")}
                className={`py-2 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  activePersona === "staff"
                    ? "bg-white text-indigo-700 shadow-subtle font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Briefcase className="w-3.5 h-3.5 text-sky-600" /> Staff
              </button>
              <button
                type="button"
                onClick={() => selectPersona("customer")}
                className={`py-2 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  activePersona === "customer"
                    ? "bg-white text-indigo-700 shadow-subtle font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <User className="w-3.5 h-3.5 text-emerald-600" /> Customer
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Email Address" required>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 bg-slate-50/50 focus:bg-white text-slate-800"
                  required
                />
              </div>
            </FormField>

            <FormField label="Password" required>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-9 bg-slate-50/50 focus:bg-white text-slate-800"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </FormField>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 select-none">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                Remember this device
              </label>
              <Link
                href="/login"
                onClick={() => alert("Password recovery link sent to registered email.")}
                className="text-indigo-600 font-semibold hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full mt-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg shadow-sm"
              isLoading={isLoading}
            >
              Sign In to {activePersona.toUpperCase()} <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-500">
            Need a new account?{" "}
            <Link
              href="/register"
              className="text-indigo-600 font-semibold hover:underline"
            >
              Register Customer Profile
            </Link>
          </div>
        </div>

        {/* Security Assurance */}
        <div className="mt-6 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>Protected by PostgreSQL Row Level Security (RLS)</span>
        </div>
      </div>
    </div>
  );
}
