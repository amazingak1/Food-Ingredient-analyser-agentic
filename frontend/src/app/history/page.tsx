"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Salad, Activity, CheckCircle2, AlertTriangle } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { motion } from "framer-motion";

export default function HistoryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const res = await fetch(`${apiUrl}/api/history`);
        if (!res.ok) {
          throw new Error("Failed to load history.");
        }
        const data = await res.json();
        setHistory(data.history || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500 bg-emerald-100 dark:bg-emerald-950/50";
    if (score >= 50) return "text-amber-500 bg-amber-100 dark:bg-amber-950/50";
    return "text-rose-500 bg-rose-100 dark:bg-rose-950/50";
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300 pb-20">
      {/* Header */}
      <header className="fixed top-0 w-full backdrop-blur-md bg-white/70 dark:bg-slate-950/70 border-b border-white/20 dark:border-slate-800/50 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </a>
            <div className="flex items-center gap-2">
              <Salad className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-800 dark:from-emerald-400 dark:to-teal-500 hidden sm:block">
                HealthScan
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <h1 className="font-semibold text-slate-600 dark:text-slate-300">Scan History</h1>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="pt-32 px-6 max-w-5xl mx-auto">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Activity className="w-8 h-8 text-emerald-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="p-6 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center gap-3 shadow-sm">
            <AlertTriangle className="w-6 h-6 shrink-0" />
            <p className="font-medium">{error}</p>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-20 px-4 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-2xl mx-auto">
            <Salad className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-700 mb-6" />
            <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-200 mb-3">No scans yet</h2>
            <p>Go back to the home page, enter an item name, and scan an ingredient label to see it saved here.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {history.map((scan, i) => (
              <motion.div 
                key={scan._id || i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-lg hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all flex flex-col group cursor-pointer"
              >
                <div className="flex justify-between items-start mb-4 gap-4">
                  <div className="min-w-0">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 truncate" title={scan.item_name || "Unknown Item"}>
                      {scan.item_name || "Unknown Item"}
                    </h3>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1.5 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                      {new Date(scan.created_at).toLocaleDateString(undefined, {
                        year: 'numeric', month: 'short', day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className={`shrink-0 px-4 py-2 rounded-2xl font-black text-xl flex items-center justify-center min-w-[60px] ${getScoreColor(scan.result?.health_score || 0)}`}>
                    {scan.result?.health_score || 0}
                  </div>
                </div>

                <div className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6 flex-grow line-clamp-3 group-hover:line-clamp-none transition-all">
                  {scan.result?.explanation}
                </div>
                
                <div className="flex items-center gap-4 text-xs font-bold mt-auto pt-4 border-t border-slate-100 dark:border-slate-800/60 uppercase tracking-wider">
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 rounded-md">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {scan.result?.safe_ingredients?.length || 0} Safe
                  </div>
                  <div className="flex items-center gap-1.5 text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 px-2 py-1 rounded-md">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {scan.result?.risky_ingredients?.length || 0} Risky
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
