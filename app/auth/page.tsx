"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useApp } from "@/lib/context";
import { 
  ShieldAlert, 
  AlertCircle, 
  ArrowLeft,
  Mail,
  Lock,
  Sparkles,
  RefreshCw
} from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from "firebase/auth";

function AuthForm() {
  const { user, signInWithGoogle, signInAsGuest, googleAuthError } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [isSignUp, setIsSignUp] = useState(searchParams.get("signup") === "true");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [authError, setAuthError] = useState("");
  const [localLoading, setLocalLoading] = useState(false);

  // If user is already authenticated, redirect immediately to dashboard
  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  // Show Google auth errors
  useEffect(() => {
    if (googleAuthError) {
      setAuthError(googleAuthError);
    }
  }, [googleAuthError]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalLoading(true);
    setAuthError("");
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.warn("Auth error:", err);
      if (err.code === "auth/user-not-found" || err.code === "auth/invalid-credential" || err.code === "auth/invalid-email") {
        setAuthError("Invalid email or password. Please try again or sign up.");
      } else if (err.code === "auth/email-already-in-use") {
        setAuthError("This email is already registered. Try signing in.");
      } else if (err.code === "auth/weak-password") {
        setAuthError("Password must be at least 6 characters.");
      } else {
        setAuthError(err.message || "Authentication failed. Please try again.");
      }
    } finally {
      setLocalLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLocalLoading(true);
    setAuthError("");
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error(err);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleGuestAuth = () => {
    signInAsGuest("guest.citizen@civicsync.org", "Guest Citizen");
  };

  return (
    <div className="min-h-screen bg-[#FAFBFC] flex flex-col justify-between selection:bg-emerald-500 selection:text-white font-sans relative overflow-hidden">
      
      {/* Background decoration */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#4285F4]/5 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-[#34A853]/5 rounded-full filter blur-[120px] pointer-events-none" />

      {/* Header bar */}
      <header className="max-w-7xl w-full mx-auto px-6 py-5 flex items-center justify-between z-10 text-left">
        <Link href="/" className="flex items-center gap-2.5 text-slate-600 hover:text-slate-900 transition-colors font-semibold text-sm">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Landing</span>
        </Link>
      </header>

      {/* Auth Box Container */}
      <div className="flex-1 flex items-center justify-center p-6 z-10">
        <div className="max-w-md w-full bg-white border border-slate-200/80 rounded-3xl p-8 shadow-xl text-center space-y-6">
          
          <div className="flex items-center justify-center gap-3">
            <img src="/icon.png" alt="Civic Sync Logo" className="w-11 h-11 rounded-2xl object-cover shadow-sm shrink-0" />
            <div className="text-left">
              <h2 className="font-extrabold text-xl text-slate-900 tracking-tight">
                Civic <span className="text-[#34A853]">Sync</span>
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Civic Console Sign-In</p>
            </div>
          </div>

          <p className="text-slate-600 text-xs leading-relaxed max-w-xs mx-auto">
            Audit streets, log garbage piles, track water leaks, and join nearby petitions with our autonomous agent.
          </p>

          {authError && (
            <div className="bg-rose-50 border border-rose-100 text-rose-600 text-xs py-2 px-3 rounded-xl flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleEmailAuth} className="space-y-4 text-left">
            {isSignUp && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Citizen Name"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#4285F4] focus:ring-1 focus:ring-[#4285F4]"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="citizen@civicsync.org"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-3.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#4285F4] focus:ring-1 focus:ring-[#4285F4]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-3.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#4285F4] focus:ring-1 focus:ring-[#4285F4]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={localLoading}
              className="w-full bg-[#4285F4] hover:bg-[#3b77db] transition-colors text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#4285F4]/10 disabled:opacity-50"
            >
              {localLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : isSignUp ? (
                "Create Profile & Enter"
              ) : (
                "Sign In to Portal"
              )}
            </button>
          </form>

          <div className="relative my-4 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <span className="relative bg-white px-3.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              OR LOGIN VIA
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            <button
              onClick={handleGoogleAuth}
              disabled={localLoading}
              className="w-full bg-white border border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50 transition-all py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
            >
              {localLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span>Sign In with Google</span>
                </>
              )}
            </button>

            <button
              onClick={handleGuestAuth}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Continue as Guest Citizen</span>
            </button>
          </div>

          <div className="pt-2 text-center">
            <button
              onClick={() => { setIsSignUp(!isSignUp); setAuthError(""); }}
              className="text-xs text-slate-500 hover:text-[#4285F4] transition-colors underline"
            >
              {isSignUp ? "Already registered? Sign In" : "Need an account? Sign Up"}
            </button>
          </div>
        </div>
      </div>

      {/* Footer System status */}
      <footer className="py-4 px-6 text-center text-[9px] font-mono text-slate-400 tracking-wider">
        © 2026 Civic Sync Platform. Powered by Google Gemini AI.
      </footer>

    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center flex-col gap-3">
        <RefreshCw className="w-8 h-8 text-[#4285F4] animate-spin" />
        <span className="text-xs font-mono text-slate-500">Loading Auth Form...</span>
      </div>
    }>
      <AuthForm />
    </Suspense>
  );
}
