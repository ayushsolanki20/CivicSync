"use client";

import React from "react";
import { useApp } from "@/lib/context";
import { 
  Award, 
  CheckCircle, 
  ShieldAlert, 
  MapPin, 
  TrendingUp, 
  Star,
  Clock,
  ThumbsUp
} from "lucide-react";

export default function UserProfilePage() {
  const { user, points, badges, complaints } = useApp();

  const userSubmitted = complaints.filter(c => c.reporterEmail === user?.email || c.reporter === user?.displayName);
  const userResolvedCount = userSubmitted.filter(c => c.status === "Resolved" || c.status === "Closed").length;

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-left relative">
      
      <div className="border-b border-slate-200 pb-3">
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Citizen Scorecard</h2>
        <p className="text-xs text-slate-500 mt-0.5">Review your personal contribution history, trust rating, and civic achievements.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Side: Avatar Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm text-center space-y-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center font-extrabold text-2xl text-[#4285F4] shadow-inner select-none">
            {user?.displayName ? user.displayName[0] : "C"}
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">{user?.displayName}</h3>
            <p className="text-[10px] font-mono text-slate-400 mt-0.5">{user?.email}</p>
          </div>

          <div className="border-t border-slate-100 pt-3 flex justify-around text-xs">
            <div>
              <p className="font-bold text-slate-800">{points}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase">Points</p>
            </div>
            <div className="border-r border-slate-100" />
            <div>
              <p className="font-bold text-slate-800">95%</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase">Trust Rating</p>
            </div>
          </div>
        </div>

        {/* Right Side: Contribution details */}
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
          
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 mb-4 flex items-center gap-1.5">
              <Star className="w-4.5 h-4.5 text-[#FBBC05]" /> Unlocked Achievements
            </h4>
            <div className="flex gap-2 flex-wrap">
              {badges.map((badge, idx) => (
                <span key={idx} className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm">
                  <span>{badge}</span>
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 mb-4 flex items-center gap-1.5">
              <Clock className="w-4.5 h-4.5 text-slate-500" /> Audit Log Summary
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 border border-slate-200/50 p-4 rounded-2xl flex gap-3 items-center">
                <div className="p-2.5 bg-[#4285F4]/10 text-[#4285F4] rounded-xl border border-[#4285F4]/10 shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Submitted</p>
                  <p className="text-lg font-bold text-slate-800 font-mono mt-0.5">{userSubmitted.length}</p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200/50 p-4 rounded-2xl flex gap-3 items-center">
                <div className="p-2.5 bg-[#34A853]/10 text-[#34A853] rounded-xl border border-[#34A853]/10 shrink-0">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Resolved</p>
                  <p className="text-lg font-bold text-slate-800 font-mono mt-0.5">{userResolvedCount}</p>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
