"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home, Database } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global application error:", error);
  }, [error]);

  const isDbError =
    error.message?.includes("database") ||
    error.message?.includes("Prisma") ||
    error.message?.includes("DATABASE_URL") ||
    error.message?.includes("connect") ||
    error.message?.includes("Can't reach database server");

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white px-4 py-12">
      <div className="max-w-lg w-full bg-slate-800 rounded-3xl p-8 border border-slate-700 shadow-2xl text-center space-y-6">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
          {isDbError ? <Database className="w-7 h-7" /> : <AlertTriangle className="w-7 h-7" />}
        </div>

        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            {isDbError ? "Database Connection Required" : "Something went wrong"}
          </h1>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            {isDbError ? (
              <>
                The application could not reach the PostgreSQL database. If you recently deployed to Vercel, please ensure your <strong>DATABASE_URL</strong> environment variable is set in the Vercel project settings and database migrations have been executed.
              </>
            ) : (
              "An unexpected error occurred while processing this request. Our team has been notified."
            )}
          </p>
        </div>

        {error.digest && (
          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-700/60 font-mono text-xs text-slate-400">
            Error Digest: <span className="text-amber-400">{error.digest}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow transition"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
          <Link
            href="/"
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-sm transition"
          >
            <Home className="w-4 h-4" />
            <span>Go to Homepage</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
