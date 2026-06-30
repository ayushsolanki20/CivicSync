"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/lib/context";
import { 
  Sparkles, 
  MapPin, 
  ShieldAlert, 
  Compass, 
  CheckCircle, 
  ThumbsUp, 
  ArrowRight, 
  Users, 
  Clock, 
  MessageSquare,
  Globe
} from "lucide-react";
import { motion } from "motion/react";

export default function LandingPage() {
  const { user } = useApp();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "How does the AI Agent identify issues?",
      a: "When you upload an image or video, the Gemini AI vision audit processes the visual characteristics to classify the issue type (like potholes, streetlights, leaks) and estimates the severity index and repairs."
    },
    {
      q: "How do you detect duplicates?",
      a: "The Civic Sync Agent automatically checks coordinates when you submit. If a similar hazard is already active within 150 meters, the agent halts and suggests you join the existing petition rather than creating a duplicate, focusing civic voice."
    },
    {
      q: "What are contribution points and badges?",
      a: "Citizens earn points by reporting verified hazards (+100 pts), resolving tickets (+50 pts), upvoting neighbor reports (+10 pts), and merging duplicate reports (+20 pts). Advance from Civic Novice to City Hero!"
    },
    {
      q: "Can I report issues in languages other than English?",
      a: "Yes! The agent console features voice-to-text dictation and multilingual support for English, Spanish, French, Hindi, and Hinglish. It translates and generates formal petitions for the city automatically."
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAFBFC] text-slate-900 selection:bg-emerald-500 selection:text-white font-sans flex flex-col relative overflow-hidden">
      
      {/* Background gradients */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#4285F4]/5 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-[#34A853]/5 rounded-full filter blur-[120px] pointer-events-none" />

      {/* Header Navbar */}
      <header className="max-w-7xl w-full mx-auto px-6 py-5 flex items-center justify-between sticky top-0 bg-[#FAFBFC]/80 backdrop-blur-md z-40 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <img src="/icon.png" alt="Civic Sync Logo" className="w-10 h-10 rounded-xl object-cover shadow-sm shrink-0" />
          <div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900">
              Civic <span className="text-[#34A853]">Sync</span>
            </span>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              AI-Powered Civic Sync Platform
            </p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
          <a href="#features" className="hover:text-[#4285F4] transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-[#4285F4] transition-colors">How It Works</a>
          <a href="#stats" className="hover:text-[#4285F4] transition-colors">Statistics</a>
          <a href="#faq" className="hover:text-[#4285F4] transition-colors">FAQs</a>
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <Link 
              href="/dashboard"
              className="bg-[#4285F4] hover:bg-[#3b77db] transition-colors text-white font-bold text-xs px-5 py-2.5 rounded-2xl shadow-md shadow-[#4285F4]/10 flex items-center gap-1.5"
            >
              <span>Enter Console</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link href="/auth" className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">
                Sign In
              </Link>
              <Link 
                href="/auth?signup=true"
                className="bg-[#4285F4] hover:bg-[#3b77db] transition-colors text-white font-bold text-xs px-5 py-2.5 rounded-2xl shadow-md shadow-[#4285F4]/10"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl w-full mx-auto px-6 pt-16 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center text-left">
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 bg-[#4285F4]/10 text-[#4285F4] px-4 py-1.5 rounded-full text-xs font-bold border border-[#4285F4]/10">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Powering Material Civic Action</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-none">
            AI-powered <br />
            <span className="text-[#4285F4]">Community</span> <br />
            Problem Solver
          </h1>

          <p className="text-slate-600 text-base md:text-lg leading-relaxed max-w-lg">
            Report, verify, track, and solve local municipal issues with the help of Gemini AI and your neighborhood coalition. Simple reporting, direct civic action.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link 
              href={user ? "/dashboard/report" : "/auth"}
              className="bg-[#4285F4] hover:bg-[#3b77db] text-white font-bold text-sm px-7 py-3.5 rounded-2xl transition-all cursor-pointer shadow-lg shadow-[#4285F4]/10 flex items-center gap-2"
            >
              <span>Report Issue</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link 
              href={user ? "/dashboard/map" : "/auth"}
              className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-sm px-7 py-3.5 rounded-2xl transition-all cursor-pointer shadow-sm"
            >
              View Nearby Issues
            </Link>
          </div>
        </div>

        {/* SVG/CSS Graphic Mockup */}
        <div className="lg:col-span-6 flex justify-center relative">
          <div className="absolute inset-0 bg-[#34A853]/5 rounded-3xl filter blur-[60px] pointer-events-none" />
          <div className="w-full max-w-lg bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xl relative transform rotate-1 select-none">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-[#EA4335] rounded-full" />
                <span className="w-3 h-3 bg-[#FBBC05] rounded-full" />
                <span className="w-3 h-3 bg-[#34A853] rounded-full" />
              </div>
              <span className="text-[10px] font-mono text-slate-400">HERO-AGENT-PIPELINE // SECURE</span>
            </div>

            {/* Simulated uploader dashboard UI */}
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex gap-4 items-center">
                <div className="w-16 h-16 bg-[#4285F4]/10 border border-[#4285F4]/20 rounded-xl flex items-center justify-center text-[#4285F4] shrink-0 font-bold">
                  PNG
                </div>
                <div className="text-left space-y-1">
                  <span className="text-[9px] font-mono text-slate-400">IMAGE RECOVERY AUDIT</span>
                  <p className="text-xs font-bold text-slate-800">Street-Pothole-Delhi.jpg</p>
                  <p className="text-[10px] text-[#34A853] font-bold">GPS Coordinates: 28.6304° N, 77.2177° E</p>
                </div>
              </div>

              {/* Progress steppers */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">Gemini Autonomous Progress</span>
                  <span className="text-[#34A853] font-mono font-bold">Step 6/10</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-[#34A853] h-full w-[60%] rounded-full" />
                </div>
                <div className="bg-emerald-50 border border-emerald-100/50 p-3 rounded-xl text-[10px] text-slate-700 leading-normal font-mono text-left">
                  🤖 <strong>Step 6 [Petition Formulation]:</strong> Drafting formal complaint letter in Hindi and English to <strong>Public Works Department (PWD)</strong>.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white border-y border-slate-100 py-20 text-left">
        <div className="max-w-7xl w-full mx-auto px-6 text-center space-y-4 mb-16">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Designed for Citizens and Authorities
          </h2>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            A comprehensive developer toolkit powered by Gemini AI and reverse-geocoded map clusters.
          </p>
        </div>

        <div className="max-w-7xl w-full mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="bg-slate-50 border border-slate-200/60 p-7 rounded-3xl space-y-3.5 shadow-sm hover:border-[#4285F4]/30 transition-all">
            <div className="p-3 bg-[#4285F4]/10 text-[#4285F4] rounded-2xl border border-[#4285F4]/10 w-fit">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-lg text-slate-900">AI Report Automation</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Upload photos, videos, or record voice comments. Gemini automatically audits details, assigns departments, scores severity, and drafts petitions.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200/60 p-7 rounded-3xl space-y-3.5 shadow-sm hover:border-[#34A853]/30 transition-all">
            <div className="p-3 bg-[#34A853]/10 text-[#34A853] rounded-2xl border border-[#34A853]/10 w-fit">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-lg text-slate-900">GPS & Maps Integration</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Pinpoints issues automatically on an interactive map. Toggle heatmaps to see problem densities and filter tickets by category, priority, and department.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200/60 p-7 rounded-3xl space-y-3.5 shadow-sm hover:border-[#FBBC05]/30 transition-all">
            <div className="p-3 bg-[#FBBC05]/10 text-[#d49f05] rounded-2xl border border-[#FBBC05]/10 w-fit">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-lg text-slate-900">Community Coalitions</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Avoid duplicate tickets through automatic coordinate matching. Nearby citizens upvote, verify, comment, and add updates to fast-track repair schedules.
            </p>
          </div>

        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="max-w-7xl w-full mx-auto px-6 py-20 text-left">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">How It Works</h2>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">
            From visual upload to municipal deployment in four clean stages.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-3 relative">
            <div className="w-10 h-10 rounded-full bg-[#4285F4] text-white flex items-center justify-center font-bold">1</div>
            <h4 className="font-bold text-slate-900 text-base">Capture Issue</h4>
            <p className="text-slate-600 text-xs leading-relaxed">Snap a photo of the streetlight, pothole, or garbage pile, or record voice descriptions.</p>
          </div>

          <div className="space-y-3">
            <div className="w-10 h-10 rounded-full bg-[#34A853] text-white flex items-center justify-center font-bold">2</div>
            <h4 className="font-bold text-slate-900 text-base">AI Inspection</h4>
            <p className="text-slate-600 text-xs leading-relaxed">Gemini audits coordinates, filters duplicates, drafts the formal municipal complaint letter.</p>
          </div>

          <div className="space-y-3">
            <div className="w-10 h-10 rounded-full bg-[#FBBC05] text-white flex items-center justify-center font-bold">3</div>
            <h4 className="font-bold text-slate-900 text-base">Community Verification</h4>
            <p className="text-slate-600 text-xs leading-relaxed">Nearby residents upvote or add comments to support the ticket and build priority weight.</p>
          </div>

          <div className="space-y-3">
            <div className="w-10 h-10 rounded-full bg-[#EA4335] text-white flex items-center justify-center font-bold">4</div>
            <h4 className="font-bold text-slate-900 text-base">Municipal Liaison</h4>
            <p className="text-slate-600 text-xs leading-relaxed">The draft is sent to administrative authorities, and updates are posted to the timeline.</p>
          </div>

        </div>
      </section>

      {/* Statistics Section */}
      <section id="stats" className="bg-[#4285F4]/5 border-y border-[#4285F4]/10 py-16 text-center">
        <div className="max-w-7xl w-full mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="space-y-1">
            <p className="text-3xl font-black text-slate-900 font-mono">1,420+</p>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Hazards Reported</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-black text-[#34A853] font-mono">92%</p>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Resolution Rate</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-black text-slate-900 font-mono">3.2 Days</p>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Average Repair Speed</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-black text-slate-900 font-mono">420 pts</p>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Top User Contribution</p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="max-w-4xl w-full mx-auto px-6 py-20 text-left">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight text-center mb-12">
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div 
              key={idx}
              className="bg-white border border-slate-200/80 rounded-2xl p-4.5 cursor-pointer select-none transition-all hover:border-[#4285F4]/30"
              onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
            >
              <div className="flex items-center justify-between font-bold text-slate-950 text-sm">
                <span>{faq.q}</span>
                <span className="text-slate-400 text-lg">{activeFaq === idx ? "−" : "+"}</span>
              </div>
              {activeFaq === idx && (
                <p className="text-xs text-slate-600 mt-2.5 leading-relaxed border-t border-slate-100 pt-2.5">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-12 px-6 text-center mt-auto">
        <div className="max-w-7xl w-full mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <img src="/icon.png" alt="Civic Sync Logo" className="w-6 h-6 rounded-md object-cover shadow-sm shrink-0" />
            <span className="font-extrabold text-sm text-slate-900">
              Civic <span className="text-[#34A853]">Sync</span>
            </span>
          </div>

          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">
            © 2026 Civic Sync. Deployment Ready.
          </p>

          <div className="flex gap-4 text-xs font-semibold text-slate-500">
            <Link href="/auth" className="hover:underline">App Console</Link>
            <a href="#features" className="hover:underline">Audit Docs</a>
            <a href="#faq" className="hover:underline">Privacy Policy</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
