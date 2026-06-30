"use client";

import React, { useState } from "react";
import { useApp } from "@/lib/context";
import { 
  Clock, 
  MapPin, 
  ChevronRight, 
  CheckCircle2, 
  X, 
  Sparkles, 
  ShieldAlert, 
  Check, 
  ArrowRight,
  User,
  Image as ImageIcon,
  Camera
} from "lucide-react";
import { motion } from "motion/react";

export default function MyReportsTimelinePage() {
  const { complaints, user } = useApp();
  const [selectedComplaint, setSelectedComplaint] = useState<any | null>(null);

  // Filter complaints reported by the logged in user
  const userComplaints = complaints.filter(c => c.reporterEmail === user?.email || c.reporter === user?.displayName);

  const timelineSteps = [
    { key: "Submitted", label: "Submitted", desc: "Citizen file submitted to registry." },
    { key: "Verified", label: "Verified", desc: "Upvoted and validated by nearby operators." },
    { key: "Assigned", label: "Assigned", desc: "Routed to correct administrative department." },
    { key: "In Progress", label: "In Progress", desc: "Maintenance crews dispatched to coordinate." },
    { key: "Resolved", label: "Resolved", desc: "Repair successfully completed." },
    { key: "Closed", label: "Closed", desc: "Civic ticket resolved and archived." }
  ];

  const getStepIndex = (status: string) => {
    return timelineSteps.findIndex(s => s.key === status);
  };

  return (
    <div className="space-y-6 text-left relative">
      
      <div className="border-b border-slate-200 pb-3">
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">My Reports & Tracking Timeline</h2>
        <p className="text-xs text-slate-500 mt-0.5">Monitor and audit the status updates of your submitted civic complaints.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: User reported complaints list */}
        <section className="lg:col-span-6 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center justify-between">
            <span>My Submitted Tickets ({userComplaints.length})</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase">Archive: #{user?.displayName?.slice(0,4).toUpperCase()}</span>
          </h4>

          <div className="space-y-3.5 max-h-[480px] overflow-y-auto pr-1">
            {userComplaints.map((c) => {
              const active = selectedComplaint?.id === c.id;
              const completed = c.status === "Resolved" || c.status === "Closed";
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedComplaint(c)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer hover:shadow-sm flex flex-col gap-2 relative ${
                    active 
                      ? "bg-slate-50 border-[#4285F4] ring-1 ring-[#4285F4]" 
                      : "bg-white border-slate-200 hover:bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${
                      completed
                        ? "bg-slate-100 border-slate-200 text-slate-500"
                        : c.status === "In Progress"
                        ? "bg-indigo-50 border-indigo-100 text-indigo-600 animate-pulse"
                        : "bg-emerald-50 border-emerald-100 text-emerald-600"
                    }`}>
                      {c.status}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">#{c.id}</span>
                  </div>

                  <div>
                    <h5 className="text-xs font-bold text-slate-900">{c.issueType}</h5>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{c.locationName}</span>
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100/50 pt-2">
                    <span>Upvotes: <strong>{c.upvotes}</strong></span>
                    <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}

            {userComplaints.length === 0 && (
              <div className="text-center py-16 text-slate-400 flex flex-col items-center justify-center gap-3">
                <Clock className="w-10 h-10 opacity-30 text-[#4285F4]" />
                <h4 className="text-xs font-bold font-mono text-slate-500 uppercase tracking-wider">No Tickets Logged</h4>
                <p className="text-xs text-slate-500 leading-relaxed max-w-[200px]">You have not reported any issues yet. Tap Report Issue above to start!</p>
              </div>
            )}
          </div>
        </section>

        {/* Right Side: Stepper timeline & Before/After display */}
        <section className="lg:col-span-6 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm text-left">
          {selectedComplaint ? (
            <div className="space-y-6">
              
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[9px] font-mono text-[#34A853] font-bold uppercase tracking-wider">Live Tracking Stepper</span>
                  <h3 className="text-sm font-extrabold text-slate-900 mt-0.5">Ticket #{selectedComplaint.id}</h3>
                </div>
                <button 
                  onClick={() => setSelectedComplaint(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Progressive Material Stepper */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Audit Milestones</h4>
                <div className="relative pl-6 space-y-4 border-l border-slate-200">
                  {timelineSteps.map((step, idx) => {
                    const currentIdx = getStepIndex(selectedComplaint.status);
                    const completed = idx <= currentIdx;
                    const active = idx === currentIdx;

                    return (
                      <div key={step.key} className="relative text-left">
                        {/* Dot indicator */}
                        <span className={`absolute -left-[30px] top-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                          active 
                            ? "bg-emerald-600 border-emerald-700 animate-ping opacity-35" 
                            : ""
                        }`} />
                        <span className={`absolute -left-[30px] top-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                          completed 
                            ? "bg-[#34A853] border-[#34A853] text-white" 
                            : "bg-white border-slate-200 text-slate-300"
                        }`}>
                          {completed && <Check className="w-2.5 h-2.5" />}
                        </span>

                        <div>
                          <p className={`text-xs font-bold ${
                            active ? "text-[#34A853] font-extrabold" : completed ? "text-slate-800" : "text-slate-400"
                          }`}>
                            {step.label}
                          </p>
                          {completed && (
                            <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{step.desc}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Before/After Photo Showcase */}
              <div className="border-t border-slate-100 pt-5 space-y-3.5">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Camera className="w-4.5 h-4.5 text-slate-500" />Before / After Audit Log
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  {/* Before */}
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block text-center">Before Image</span>
                    <div className="h-32 bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-inner">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={selectedComplaint.beforeImage} alt="Before repair" className="w-full h-full object-cover" />
                    </div>
                  </div>

                  {/* After */}
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block text-center">After Image</span>
                    <div className="h-32 bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
                      {selectedComplaint.afterImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={selectedComplaint.afterImage} alt="After repair" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center p-3 text-slate-400 space-y-1">
                          <ImageIcon className="w-6 h-6 mx-auto opacity-35" />
                          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Under Audit</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="text-center py-20 text-slate-400 flex flex-col items-center justify-center gap-3">
              <Clock className="w-10 h-10 opacity-30 text-[#4285F4]" />
              <h4 className="text-xs font-bold font-mono text-slate-500 uppercase tracking-wider">Milestone Monitor</h4>
              <p className="text-xs text-slate-500 leading-relaxed">Select one of your submitted tickets on the left to track progress milestones and review repair validation photos.</p>
            </div>
          )}
        </section>

      </div>

    </div>
  );
}
