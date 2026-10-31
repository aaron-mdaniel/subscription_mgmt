"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FormField } from "@/components/ui/FormField";
import { registerCustomerAction } from "@/lib/auth/actions";
import { Lock, Mail, User, Check, X, Building } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Hackathon Password Policy Validation
  const hasMinLength = password.length > 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  const isPasswordValid =
    hasMinLength && hasUpperCase && hasLowerCase && hasSpecialChar;
  const passwordsMatch = password && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isPasswordValid) {
      setError("Please ensure your password meets all 4 security criteria.");
      return;
    }

    if (!passwordsMatch) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("fullName", fullName);
      formData.append("companyName", companyName);
      formData.append("email", email);
      formData.append("password", password);

      const res = await registerCustomerAction(formData);
      if (res && !res.success && res.error) {
        setError(res.error);
        setIsLoading(false);
      }
    } catch (err: any) {
      if (err?.message?.includes("NEXT_REDIRECT")) {
        return;
      }
      setError(err?.message || "Registration failed. Please check details.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white border border-border rounded-card p-8 shadow-sm">
        <div className="text-center mb-6">
          <div className="w-10 h-10 rounded-control bg-brand mx-auto flex items-center justify-center text-white font-bold text-base shadow-sm mb-3">
            BL
          </div>
          <h2 className="text-xl font-bold text-text-primary tracking-tight">
            Create Customer Account
          </h2>
          <p className="mt-1 text-xs text-text-secondary">
            Access your BrightLoop subscriptions, invoices, and payments
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-control bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Full Name" required>
              <div className="relative">
                <User className="w-4 h-4 text-text-muted absolute left-3 top-3" />
                <Input
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </FormField>

            <FormField label="Company Name" required>
              <div className="relative">
                <Building className="w-4 h-4 text-text-muted absolute left-3 top-3" />
                <Input
                  placeholder="Acme Corp"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </FormField>
          </div>

          <FormField label="Business Email" required>
            <div className="relative">
              <Mail className="w-4 h-4 text-text-muted absolute left-3 top-3" />
              <Input
                type="email"
                placeholder="billing@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9"
                required
              />
            </div>
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Password" required>
              <div className="relative">
                <Lock className="w-4 h-4 text-text-muted absolute left-3 top-3" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </FormField>

            <FormField label="Confirm Password" required>
              <div className="relative">
                <Lock className="w-4 h-4 text-text-muted absolute left-3 top-3" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </FormField>
          </div>

          {/* Hackathon Stated Password Policy Checklist */}
          <div className="p-3 bg-slate-50 border border-border rounded-control text-xs space-y-1.5">
            <p className="font-semibold text-text-secondary text-[11px] uppercase tracking-wider">
              Password Requirements:
            </p>
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              <div className="flex items-center gap-1.5">
                {hasMinLength ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <X className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span className={hasMinLength ? "text-emerald-700 font-medium" : "text-text-secondary"}>
                  &gt; 8 characters
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {hasUpperCase ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <X className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span className={hasUpperCase ? "text-emerald-700 font-medium" : "text-text-secondary"}>
                  1 uppercase (A-Z)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {hasLowerCase ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <X className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span className={hasLowerCase ? "text-emerald-700 font-medium" : "text-text-secondary"}>
                  1 lowercase (a-z)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {hasSpecialChar ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <X className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span className={hasSpecialChar ? "text-emerald-700 font-medium" : "text-text-secondary"}>
                  1 special char (!@#$...)
                </span>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full mt-2"
            isLoading={isLoading}
            disabled={!isPasswordValid || !passwordsMatch}
          >
            Create Customer Account
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-text-secondary">
          Already registered?{" "}
          <Link href="/login" className="text-brand font-semibold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
