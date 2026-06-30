"use client";

import React from "react";
import { useApp } from "@/lib/context";
import { 
  TrendingUp, 
  PieChart, 
  BarChart2, 
  Activity, 
  MapPin, 
  Clock 
} from "lucide-react";

export default function AnalyticsDashboardPage() {
  const { complaints } = useApp();

  const total = complaints.length;
  const resolved = complaints.filter(c => c.status === "Resolved" || c.status === "Closed").length;
  
  // Calculate counts by type
  const potholes = complaints.filter(c => c.issueType.toLowerCase().includes("pothole")).length;
  const leaks = complaints.filter(c => c.issueType.toLowerCase().includes("leak")).length;
  const lights = complaints.filter(c => c.issueType.toLowerCase().includes("light")).length;
  const wiring = complaints.filter(c => c.issueType.toLowerCase().includes("wire") || c.issueType.toLowerCase().includes("electrical")).length;
  const others = total - (potholes + leaks + lights + wiring);

  // SVG dimensions
  const svgW = 200;
  const svgH = 200;
  const r = 60;
  const cx = 100;
  const cy = 100;
  
  // Helper to draw clean SVG Pie segments
  let cumulativeAngle = 0;
  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  const segments = [
    { label: "Potholes", count: potholes, color: "#4285F4" },
    { label: "Water Leaks", count: leaks, color: "#34A853" },
    { label: "Streetlights", count: lights, color: "#FBBC05" },
    { label: "Wiring", count: wiring, color: "#EA4335" },
    { label: "Others", count: others, color: "#94a3b8" }
  ].filter(s => s.count > 0);

  return (
    <div className="space-y-6 text-left relative">
      
      <div className="border-b border-slate-200 pb-3">
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Analytics & Trends</h2>
        <p className="text-xs text-slate-500 mt-0.5">Statistical summaries of complaints, categorization ratios, and resolution rates.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Category breakdown pie chart */}
        <div className="md:col-span-6 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
            <PieChart className="w-4.5 h-4.5 text-[#4285F4]" /> Categories Breakdown
          </h4>

          {total > 0 ? (
            <div className="flex flex-col sm:flex-row items-center justify-around gap-6 pt-4">
              
              {/* Custom SVG Pie Chart */}
              <div className="relative w-36 h-36">
                <svg viewBox="0 0 32 32" className="w-full h-full transform -rotate-90 rounded-full">
                  {(() => {
                    let accumulatedPercent = 0;
                    return segments.map((seg, i) => {
                      const percent = seg.count / total;
                      const strokeDasharray = `${percent * 100} ${100 - (percent * 100)}`;
                      const strokeDashoffset = -accumulatedPercent * 100;
                      accumulatedPercent += percent;

                      return (
                        <circle
                          key={i}
                          cx="16"
                          cy="16"
                          r="15.915"
                          fill="transparent"
                          stroke={seg.color}
                          strokeWidth="3.5"
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                        />
                      );
                    });
                  })()}
                </svg>
              </div>

              {/* Legends */}
              <div className="space-y-2 text-left">
                {segments.map((seg, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                    <span className="text-slate-600 font-medium">{seg.label}:</span>
                    <strong className="text-slate-800 font-mono">{seg.count} ({Math.round((seg.count / total) * 100)}%)</strong>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-10 font-medium">No complaints in database to graph.</p>
          )}
        </div>

        {/* Resolution metrics */}
        <div className="md:col-span-6 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
            <BarChart2 className="w-4.5 h-4.5 text-[#34A853]" /> Resolution Metrics & Speeds
          </h4>

          <div className="space-y-4 pt-2">
            
            {/* Status Progress bars */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-600">Submitted (New)</span>
                <span className="font-mono text-slate-800 font-bold">
                  {complaints.filter(c => c.status === "Submitted").length} tickets
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-[#4285F4] h-full rounded-full transition-all" 
                  style={{ width: `${(complaints.filter(c => c.status === "Submitted").length / (total || 1)) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-600">In Progress (Crews Out)</span>
                <span className="font-mono text-slate-800 font-bold">
                  {complaints.filter(c => c.status === "In Progress" || c.status === "Assigned").length} tickets
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-[#FBBC05] h-full rounded-full transition-all" 
                  style={{ width: `${(complaints.filter(c => c.status === "In Progress" || c.status === "Assigned").length / (total || 1)) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-600">Resolved (Fixed)</span>
                <span className="font-mono text-slate-800 font-bold">{resolved} tickets</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-[#34A853] h-full rounded-full transition-all" 
                  style={{ width: `${(resolved / (total || 1)) * 100}%` }}
                />
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
