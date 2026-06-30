"use client";

import React from "react";
import { useApp } from "@/lib/context";
import { 
  Settings as SettingsIcon, 
  Moon, 
  Sun, 
  Bell, 
  Compass, 
  FileText, 
  RefreshCw,
  Info
} from "lucide-react";

export default function SettingsPreferencesPage() {
  const { theme, setTheme, notifications, addNotification } = useApp();

  const handleToggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    addNotification(`Theme preference updated to: ${nextTheme.toUpperCase()}`);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 text-left relative">
      
      <div className="border-b border-slate-200 pb-3">
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Console Settings & Preferences</h2>
        <p className="text-xs text-slate-500 mt-0.5">Toggle interface configurations, notification alerts, and cache preferences.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
        
        {/* Theme Preferences */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              {theme === "light" ? <Sun className="w-4 h-4 text-amber-500 animate-spin" /> : <Moon className="w-4 h-4 text-indigo-600 animate-pulse" />}
              Interface Display Mode
            </h4>
            <p className="text-[11px] text-slate-400">Toggle default light themes and dark contrast variations.</p>
          </div>

          <button
            onClick={handleToggleTheme}
            className={`relative inline-flex h-6.5 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              theme === "dark" ? "bg-slate-900" : "bg-slate-200"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5.5 w-5.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                theme === "dark" ? "translate-x-5.5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Offline Cache Notification */}
        <div className="flex items-start gap-4 border-b border-slate-100 pb-4">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 shrink-0">
            <RefreshCw className="w-5 h-5 animate-pulse-glow" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">PWA & Offline Registry Sync</h4>
            <p className="text-[11px] text-slate-500 leading-normal">
              Community Hero automatically deploys local memory mapping cache layers. If your network coordinates disconnect, visual inputs are preserved locally and sync to Firestore once connection re-establishes.
            </p>
          </div>
        </div>

        {/* Push Notification alert preferences */}
        <div className="flex items-start gap-4 pb-2">
          <div className="p-2.5 bg-[#4285F4]/10 text-[#4285F4] rounded-xl border border-[#4285F4]/10 shrink-0">
            <Bell className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Real-Time Proximity Alerts</h4>
            <p className="text-[11px] text-slate-500 leading-normal">
              Get notified immediately on verification requests, upvotes, and status changes on nearby coordinates issues in a 250m radius. Turn on in your browser permissions block.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
