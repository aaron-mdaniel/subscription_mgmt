import Link from "next/link";
import { ArrowLeft, FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white border border-slate-200/80 rounded-2xl p-8 shadow-subtle">
        <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-4">
          <FileQuestion className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Page Not Found
        </h2>
        <p className="mt-2 text-xs text-slate-500 leading-relaxed">
          The requested operational resource or view could not be located in the BrightLoop system.
        </p>
        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
