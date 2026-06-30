"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/lib/context";
import { 
  ShieldAlert, 
  MapIcon, 
  PlusCircle, 
  Clock, 
  Award, 
  TrendingUp, 
  User as UserIcon, 
  Settings as SettingsIcon, 
  MessageSquare, 
  Bell, 
  LogOut, 
  Menu, 
  X,
  Send,
  Compass,
  Briefcase
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { 
    user, 
    authLoading, 
    notifications, 
    markNotificationsRead, 
    logOut, 
    complaints, 
    theme,
    points
  } = useApp();
  const pathname = usePathname();
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  // Floating chatbot states
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([
    {
      id: "welcome",
      role: "model",
      content: "Namaste! 🙏 I am the **Civic Sync AI Agent 🤖**.\n\nI can help you report civic issues anywhere in India — potholes, water leaks, garbage dumps, broken streetlights, and more. I can draft formal complaints to your local Municipal Corporation (MCD, BMC, BBMP, PWD, Jal Board). Ask me anything!"
    }
  ]);
  const [newChatMessage, setNewChatMessage] = useState("");
  const [sendingChat, setSendingChat] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Authenticate check
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (isChatOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isChatOpen]);

  const toggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen);
    if (!notificationsOpen) {
      markNotificationsRead();
    }
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatMessage.trim()) return;

    const userMsg = {
      id: "msg_" + Date.now(),
      role: "user",
      content: newChatMessage
    };

    setChatMessages(prev => [...prev, userMsg]);
    setNewChatMessage("");
    setSendingChat(true);

    try {
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...chatMessages, userMsg],
          reportsContext: complaints
        })
      });

      if (!response.ok) throw new Error("Chat request failed");
      const result = await response.json();
      
      setChatMessages(prev => [...prev, {
        id: "msg_res_" + Date.now(),
        role: "model",
        content: result.text
      }]);
    } catch (err) {
      setChatMessages(prev => [...prev, {
        id: "msg_res_" + Date.now(),
        role: "model",
        content: "I apologize, I encountered an issue inspecting the civic grid database. Please try again shortly."
      }]);
    } finally {
      setSendingChat(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center flex-col gap-4">
        <Compass className="w-10 h-10 text-emerald-600 animate-spin" />
        <p className="text-xs font-mono text-slate-500">Connecting to Civic Sync Database...</p>
      </div>
    );
  }

  const navLinks = [
    { href: "/dashboard", label: "Dashboard Feed", icon: Compass },
    { href: "/dashboard/report", label: "Report Issue", icon: PlusCircle },
    { href: "/dashboard/map", label: "Nearby Issues Map", icon: MapIcon },
    { href: "/dashboard/my-reports", label: "My Reports Timeline", icon: Clock },
    { href: "/dashboard/leaderboard", label: "Leaderboard", icon: Award },
    { href: "/dashboard/analytics", label: "Analytics Trends", icon: TrendingUp },
    { href: "/dashboard/profile", label: "User Scorecard", icon: UserIcon },
    { href: "/dashboard/settings", label: "Settings Preferences", icon: SettingsIcon },
  ];

  // Admin access
  const isAdmin = user.email === "admin@communityhero.org" || user.email === "city.official@civic.gov";
  if (isAdmin) {
    navLinks.splice(7, 0, { href: "/dashboard/admin", label: "Admin Control Panel", icon: Briefcase });
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-[#FAFBFC] text-slate-900 flex flex-col md:flex-row relative">
      
      {/* Sidebar Navigation */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200/80 sticky top-0 h-screen py-6 shrink-0">
        <div className="px-6 pb-6 border-b border-slate-100 flex items-center gap-3">
          <img src="/icon.png" alt="Civic Sync Logo" className="w-9 h-9 rounded-xl object-cover shadow-sm shrink-0" />
          <div className="text-left">
            <span className="font-extrabold text-sm text-slate-900 tracking-tight">
              Civic <span className="text-[#34A853]">Sync</span>
            </span>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              CIVIC SYNC CONSOLE
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pt-6 px-4 space-y-1.5 text-left">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;
            return (
              <Link 
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                  active 
                    ? "bg-[#4285F4]/10 text-[#4285F4] shadow-inner" 
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Icon className="w-4.5 h-4.5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="px-4 border-t border-slate-100 pt-4 text-left">
          <button 
            onClick={logOut}
            className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-500 transition-all cursor-pointer"
          >
            <LogOut className="w-4.5 h-4.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden w-full bg-white border-b border-slate-200/80 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <img src="/icon.png" alt="Civic Sync Logo" className="w-7 h-7 rounded-lg object-cover shadow-sm shrink-0" />
          <span className="font-extrabold text-base text-slate-900">
            Civic <span className="text-[#34A853]">Sync</span>
          </span>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed top-[69px] left-0 w-full bg-white border-b border-slate-200 shadow-lg z-20 flex flex-col p-4 space-y-1 text-left"
          >
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = pathname === link.href;
              return (
                <Link 
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                    active 
                      ? "bg-[#4285F4]/10 text-[#4285F4]" 
                      : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="w-4.5 h-4.5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
            <button 
              onClick={() => {
                setMobileMenuOpen(false);
                logOut();
              }}
              className="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
            >
              <LogOut className="w-4.5 h-4.5" />
              <span>Sign Out</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Workspace Panel Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        
        {/* Top Navbar Header */}
        <header className="hidden md:flex items-center justify-between px-8 py-5 border-b border-slate-200/80 bg-white/70 backdrop-blur-md sticky top-0 z-20">
          <div className="text-left">
            <h2 className="font-extrabold text-base text-slate-800 uppercase tracking-widest">
              {pathname.split("/").pop() === "dashboard" ? "Main Feed" : pathname.split("/").pop()?.replace("-", " ")}
            </h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
              {user.email === "admin@communityhero.org" || user.email === "city.official@civic.gov" ? "Official Administrator" : "Verified Community Citizen"}
            </p>
          </div>

          <div className="flex items-center gap-4">
            
            {/* Points Badge */}
            <div className="bg-slate-50 border border-slate-200/60 py-1.5 px-3 rounded-xl text-xs font-bold text-slate-600 flex items-center gap-1.5 shadow-sm">
              <Award className="w-4 h-4 text-indigo-600" />
              <span>{points} Points Score</span>
            </div>

            {/* Notifications Drawer Bell */}
            <div className="relative">
              <button
                onClick={toggleNotifications}
                className="p-2 bg-white border border-slate-200/80 rounded-2xl text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white animate-pulse" />
                )}
              </button>

              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 rounded-3xl p-4.5 shadow-xl text-left z-30 space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs font-bold text-slate-900">Notifications Feed</span>
                      <button 
                        onClick={() => setNotificationsOpen(false)}
                        className="text-xs text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {notifications.map((notif) => (
                        <div key={notif.id} className="p-2.5 bg-slate-50 border border-slate-200/50 rounded-2xl flex flex-col gap-0.5 hover:bg-slate-100/50 transition-all">
                          <p className="text-[11px] text-slate-800 leading-normal font-medium">{notif.text}</p>
                          <span className="text-[9px] text-slate-400 font-semibold">{notif.time}</span>
                        </div>
                      ))}
                      {notifications.length === 0 && (
                        <div className="text-center py-6 text-slate-400 text-xs font-medium">
                          No recent notifications.
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Avatar */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs font-bold text-slate-800">{user.displayName}</p>
                <p className="text-[9px] font-mono text-slate-400">{user.email}</p>
              </div>
              <div className="w-8.5 h-8.5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-[#4285F4] text-xs">
                {user.displayName[0]}
              </div>
            </div>

          </div>
        </header>

        {/* Dynamic Inner View Content */}
        <main className="flex-1 p-6 md:p-8">
          {children}
        </main>

      </div>

      {/* Floating chatbot assistant view */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div 
            initial={{ y: 50, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 50, opacity: 0, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-full max-w-sm bg-white border border-slate-200 shadow-2xl rounded-3xl z-50 flex flex-col overflow-hidden text-left"
          >
            <div className="p-4 bg-emerald-50 border-b border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-xl shadow-inner">
                  <ShieldAlert className="w-4.5 h-4.5 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900">Civic Sync AI Agent</h4>
                  <p className="text-[9px] font-mono text-emerald-700">Civic Sync Assistant online</p>
                </div>
              </div>
              <button 
                onClick={() => setIsChatOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 max-h-72 bg-slate-50/50">
              {chatMessages.map((m) => (
                <div 
                  key={m.id}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                    m.role === "user" 
                      ? "bg-emerald-600 text-white font-medium" 
                      : "bg-white text-slate-700 border border-slate-200 shadow-sm"
                  }`}>
                    <span className={`text-[8px] font-bold uppercase block mb-1.5 ${
                      m.role === "user" ? "text-white/60" : "text-slate-400"
                    }`}>
                      {m.role === "user" ? "Citizen" : "AI Agent"}
                    </span>
                    <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                  </div>
                </div>
              ))}
              {sendingChat && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 text-slate-400 px-3.5 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-sm">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                    <span>Gemini is inspecting city files...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendChatMessage} className="p-3 border-t border-slate-200 bg-white flex gap-2">
              <input
                type="text"
                value={newChatMessage}
                onChange={(e) => setNewChatMessage(e.target.value)}
                placeholder="Ask about potholes, Jal Board, MCD, helplines..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
              />
              <button 
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded-xl flex items-center justify-center shrink-0 cursor-pointer shadow-md shadow-emerald-600/5"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 bg-[#34A853] hover:bg-[#2d9148] text-white p-4.5 rounded-full shadow-2xl z-40 transition-transform hover:scale-105 flex items-center justify-center cursor-pointer"
          title="Speak with Civic Sync AI Assistant"
        >
          <MessageSquare className="w-5.5 h-5.5" />
        </button>
      )}

    </div>
  );
}
