"use client";

import React from "react";
import { useApp } from "@/lib/context";
import { 
  Award, 
  TrendingUp, 
  CheckCircle, 
  ShieldAlert, 
  MapPin, 
  Activity, 
  Star,
  Users
} from "lucide-react";

export default function LeaderboardPage() {
  const { points, user } = useApp();

  const MOCK_LEADERS = [
    { rank: 1, name: "David Miller", points: 420, verifiedCount: 32, badges: ["Street Specialist 🔍", "DWP Coalition 💧"], trustScore: 98 },
    { rank: 2, name: "Sarah Connor", points: 350, verifiedCount: 24, badges: ["Street Guardian 🛡️", "Civic Leader 👑"], trustScore: 97 },
    { rank: 3, name: "Rajesh Kumar", points: 280, verifiedCount: 19, badges: ["Street Guardian 🛡️"], trustScore: 95 },
    { rank: 4, name: "Elena Rostova", points: 190, verifiedCount: 14, badges: ["Civic Novice 🛡️"], trustScore: 92 },
  ];

  // Insert logged in user to leaderboard based on points
  const userRank = points >= 420 ? 1 : points >= 350 ? 2 : points >= 280 ? 3 : points >= 190 ? 4 : 5;
  const currentBadgeStr = points >= 300 ? "City Hero 👑" : points >= 200 ? "Safety Specialist 🔍" : points >= 150 ? "Street Guardian 🛡️" : "Civic Novice 🛡️";

  const allLeaders = [...MOCK_LEADERS];
  const userInLeaderboard = {
    rank: userRank,
    name: (user?.displayName || user?.email?.split("@")[0] || "You") + " (You)",
    points: points,
    verifiedCount: Math.round(points / 15),
    badges: [currentBadgeStr],
    trustScore: 95
  };

  // Insert and sort
  allLeaders.push(userInLeaderboard);
  allLeaders.sort((a, b) => b.points - a.points);
  
  // Re-allocate ranks
  allLeaders.forEach((leader, idx) => {
    leader.rank = idx + 1;
  });

  return (
    <div className="space-y-6 text-left relative">
      
      <div className="border-b border-slate-200 pb-3">
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Community Leaderboard</h2>
        <p className="text-xs text-slate-500 mt-0.5">Check ranks, trust score index, and unlock badges for civic contributions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Top Performers Podium */}
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
            <Users className="w-4.5 h-4.5 text-[#4285F4]" /> Citizen Leaderboard Rankings
          </h4>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-slate-700">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[9px] text-left">
                  <th className="py-2.5">Rank</th>
                  <th className="py-2.5">Name</th>
                  <th className="py-2.5">Points</th>
                  <th className="py-2.5">Verified Issues</th>
                  <th className="py-2.5">Trust Rating</th>
                  <th className="py-2.5">Civic Badges</th>
                </tr>
              </thead>
              <tbody>
                {allLeaders.map((leader, index) => {
                  const isUser = leader.name.includes("(You)");
                  return (
                    <tr 
                      key={index} 
                      className={`border-b border-slate-100/50 hover:bg-slate-50/50 transition-colors ${
                        isUser ? "bg-emerald-50/50 font-semibold" : ""
                      }`}
                    >
                      <td className="py-3 font-mono font-bold text-slate-800">
                        {leader.rank === 1 ? "🥇 1" : leader.rank === 2 ? "🥈 2" : leader.rank === 3 ? "🥉 3" : ` ${leader.rank}`}
                      </td>
                      <td className="py-3 text-slate-900">{leader.name}</td>
                      <td className="py-3 font-mono font-bold text-[#4285F4]">{leader.points} pts</td>
                      <td className="py-3 font-mono">{leader.verifiedCount}</td>
                      <td className="py-3">
                        <span className={`text-[10px] font-mono font-bold ${
                          leader.trustScore >= 95 ? "text-emerald-600" : "text-amber-600"
                        }`}>
                          {leader.trustScore}%
                        </span>
                      </td>
                      <td className="py-3 flex gap-1 flex-wrap">
                        {leader.badges.map((b, i) => (
                          <span key={i} className="bg-slate-100 border border-slate-200 text-slate-600 px-2 py-0.5 rounded text-[9px] font-bold">
                            {b}
                          </span>
                        ))}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Gamified Badges manual info side panel */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
            <Star className="w-4.5 h-4.5 text-[#FBBC05]" /> Unlockable Badges
          </h4>

          <div className="space-y-3.5">
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl flex gap-3 items-center">
              <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center text-slate-500 shrink-0 font-bold text-sm shadow-inner">
                🛡️
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Civic Novice</p>
                <p className="text-[10px] text-slate-400">Granted to all active citizens. Start auditing today.</p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl flex gap-3 items-center">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 font-bold text-sm shadow-inner">
                🛡️
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Street Guardian</p>
                <p className="text-[10px] text-slate-400">File or verify issues to cross 150 points threshold.</p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl flex gap-3 items-center">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 font-bold text-sm shadow-inner">
                🔍
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Safety Specialist</p>
                <p className="text-[10px] text-slate-400">Inspect neighbor updates to reach 200 points.</p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl flex gap-3 items-center">
              <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0 font-bold text-sm shadow-inner">
                👑
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">City Hero</p>
                <p className="text-[10px] text-slate-400">Unlock absolute community champion rank with 300+ pts.</p>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
