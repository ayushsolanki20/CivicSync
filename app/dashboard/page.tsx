"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/lib/context";
import { 
  AlertTriangle, 
  ThumbsUp, 
  MessageSquare, 
  ChevronRight, 
  CheckCircle, 
  MapPin, 
  Clock, 
  PlusCircle,
  ThumbsDown,
  CornerDownRight,
  Send,
  User,
  Activity,
  FileText,
  Compass,
  X,
  Upload
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";

const getDepartmentContact = (dept: string, locationName?: string) => {
  const normalized = (dept || "").toLowerCase();
  
  // Extract city, state and postal code from locationName
  const nameLower = (locationName || "").toLowerCase();
  let city = "Delhi";
  let postalCode = "";
  
  const pinMatch = nameLower.match(/\b\d{6}\b/);
  if (pinMatch) {
    postalCode = pinMatch[0];
  }
  
  let state = "";
  if (nameLower.includes("maharashtra") || nameLower.includes("mumbai") || nameLower.includes("pune")) {
    state = "Maharashtra";
  } else if (nameLower.includes("karnataka") || nameLower.includes("bengaluru") || nameLower.includes("bangalore")) {
    state = "Karnataka";
  } else if (nameLower.includes("madhya pradesh") || nameLower.includes("indore") || nameLower.includes("bhopal")) {
    state = "Madhya Pradesh";
  } else if (nameLower.includes("tamil nadu") || nameLower.includes("chennai")) {
    state = "Tamil Nadu";
  } else if (nameLower.includes("west bengal") || nameLower.includes("kolkata")) {
    state = "West Bengal";
  } else if (nameLower.includes("delhi")) {
    state = "Delhi";
  }
  
  if (nameLower.includes("mumbai") || nameLower.includes("bombay")) city = "Mumbai";
  else if (nameLower.includes("bengaluru") || nameLower.includes("bangalore")) city = "Bengaluru";
  else if (nameLower.includes("indore")) city = "Indore";
  else if (nameLower.includes("pune")) city = "Pune";
  else if (nameLower.includes("chennai") || nameLower.includes("madras")) city = "Chennai";
  else if (nameLower.includes("kolkata") || nameLower.includes("calcutta")) city = "Kolkata";
  else if (nameLower.includes("hyderabad")) city = "Hyderabad";
  else if (nameLower.includes("ahmedabad")) city = "Ahmedabad";
  else {
    // Basic heuristics to grab city name
    const parts = (locationName || "").split(",");
    if (parts.length >= 2) {
      const rightParts = parts.map(p => p.trim()).filter(p => {
        const lower = p.toLowerCase();
        return lower !== "india" && !lower.match(/\d{6}/) && lower !== "delhi" && lower !== "maharashtra" && lower !== "karnataka" && lower !== "madhya pradesh";
      });
      if (rightParts.length > 0) {
        city = rightParts[rightParts.length - 1];
      }
    }
  }
  
  if (!state) {
    state = city === "Mumbai" ? "Maharashtra" : city === "Bengaluru" ? "Karnataka" : city === "Indore" ? "Madhya Pradesh" : city === "Pune" ? "Maharashtra" : city === "Chennai" ? "Tamil Nadu" : city === "Kolkata" ? "West Bengal" : "Delhi";
  }
  
  if (!postalCode) {
    postalCode = city === "Mumbai" ? "400001" : city === "Bengaluru" ? "560001" : city === "Indore" ? "452001" : "110001";
  }

  // Pre-configured cities templates
  if (city === "Mumbai") {
    if (normalized.includes("works") || normalized.includes("pwd") || normalized.includes("road") || normalized.includes("transportation")) {
      return {
        phone: "022-22620251 (BMC PWD Helpdesk)",
        email: "pwdhq@mcgm.gov.in",
        address: `Brihanmumbai Municipal Corporation (BMC) PWD Head Office, Fort, Mumbai, ${state} ${postalCode}`,
        hours: "Mon-Sat: 9:30 AM - 6:00 PM"
      };
    }
    if (normalized.includes("water") || normalized.includes("power") || normalized.includes("hydrant") || normalized.includes("utility") || normalized.includes("board")) {
      return {
        phone: "1916 (BMC Water Supply Tollfree)",
        email: "watermain.swm@mcgm.gov.in",
        address: `BMC Hydraulic Engineer Office, Municipal Offices, Fort, Mumbai, ${state} ${postalCode}`,
        hours: "24/7 Water Supply Emergency"
      };
    }
    if (normalized.includes("sanitation") || normalized.includes("garbage") || normalized.includes("trash") || normalized.includes("waste") || normalized.includes("recycling") || normalized.includes("mcd") || normalized.includes("bmc")) {
      return {
        phone: "022-24134515 (BMC Solid Waste Command)",
        email: "swm.clean@mcgm.gov.in",
        address: `BMC Solid Waste Management Dept, Municipal Offices, Fort, Mumbai, ${state} ${postalCode}`,
        hours: "Daily: 6:00 AM - 8:00 PM"
      };
    }
    if (normalized.includes("light") || normalized.includes("street") || normalized.includes("lamp") || normalized.includes("bses")) {
      return {
        phone: "1800-227-575 (BEST Power Helpline)",
        email: "customercare@bestundertaking.com",
        address: `BEST Bhavan, Colaba, Mumbai, ${state} ${postalCode}`,
        hours: "Mon-Sat: 8:00 AM - 8:00 PM"
      };
    }
  }

  if (city === "Bengaluru") {
    if (normalized.includes("works") || normalized.includes("pwd") || normalized.includes("road") || normalized.includes("transportation")) {
      return {
        phone: "080-22221188 (BBMP PWD Helpdesk)",
        email: "ee.pwd@bbmp.gov.in",
        address: `Bruhat Bengaluru Mahanagara Palike (BBMP) PWD Office, Hudson Circle, Bengaluru, ${state} ${postalCode}`,
        hours: "Mon-Sat: 9:00 AM - 5:30 PM"
      };
    }
    if (normalized.includes("water") || normalized.includes("power") || normalized.includes("hydrant") || normalized.includes("utility") || normalized.includes("board")) {
      return {
        phone: "1916 (BWSSB Water Tollfree)",
        email: "waterboard@bwssb.gov.in",
        address: `Bangalore Water Supply and Sewerage Board (BWSSB), Cauvery Bhavan, Bengaluru, ${state} ${postalCode}`,
        hours: "24/7 Water Board Helpline"
      };
    }
    if (normalized.includes("sanitation") || normalized.includes("garbage") || normalized.includes("trash") || normalized.includes("waste") || normalized.includes("recycling") || normalized.includes("mcd") || normalized.includes("bbmp")) {
      return {
        phone: "080-22660000 (BBMP Waste Management)",
        email: "swm.cleanup@bbmp.gov.in",
        address: `BBMP Solid Waste Management Head Office, N.R. Square, Bengaluru, ${state} ${postalCode}`,
        hours: "Daily: 6:30 AM - 7:30 PM"
      };
    }
    if (normalized.includes("light") || normalized.includes("street") || normalized.includes("lamp") || normalized.includes("bses")) {
      return {
        phone: "1912 (BESCOM Electricity Care)",
        email: "customercare@bescom.co.in",
        address: `BESCOM Corporate Office, K.R. Circle, Bengaluru, ${state} ${postalCode}`,
        hours: "Mon-Sat: 8:00 AM - 8:00 PM"
      };
    }
  }

  if (city === "Indore") {
    if (normalized.includes("works") || normalized.includes("pwd") || normalized.includes("road") || normalized.includes("transportation")) {
      return {
        phone: "0731-2535555 (IMC PWD Division)",
        email: "ee.pwd@imcindore.org.in",
        address: `Indore Municipal Corporation (IMC) PWD Office, Shivaji Market, Indore, ${state} ${postalCode}`,
        hours: "Mon-Sat: 10:00 AM - 5:00 PM"
      };
    }
    if (normalized.includes("water") || normalized.includes("power") || normalized.includes("hydrant") || normalized.includes("utility") || normalized.includes("board")) {
      return {
        phone: "0731-2430000 (IMC Water Works)",
        email: "waterworkshq@imcindore.org.in",
        address: `IMC Water Supply Department, Shivaji Market, Indore, ${state} ${postalCode}`,
        hours: "24/7 Water Division Hotline"
      };
    }
    if (normalized.includes("sanitation") || normalized.includes("garbage") || normalized.includes("trash") || normalized.includes("waste") || normalized.includes("recycling") || normalized.includes("mcd") || normalized.includes("imc")) {
      return {
        phone: "0731-2435481 (IMC Clean City Division)",
        email: "swm.clean@imcindore.org.in",
        address: `IMC Sanitation and Waste Management Office, Shivaji Market, Indore, ${state} ${postalCode}`,
        hours: "Daily: 6:00 AM - 8:00 PM"
      };
    }
    if (normalized.includes("light") || normalized.includes("street") || normalized.includes("lamp") || normalized.includes("bses")) {
      return {
        phone: "1912 (MP West Zone Power Care)",
        email: "customercare@mpwz.co.in",
        address: `MP West Zone Electricity Office, Pologround, Indore, ${state} ${postalCode}`,
        hours: "Mon-Sat: 8:00 AM - 8:00 PM"
      };
    }
  }

  // Dynamic Generic Fallback for other Indian cities (Chennai, Kolkata, Pune, Jaipur, etc.)
  const corpName = city === "Delhi" ? "MCD" : city === "Kolkata" ? "KMC" : city === "Chennai" ? "GCC" : city === "Pune" ? "PMC" : `${city} Municipal Corporation`;
  const emailDomain = city.toLowerCase().replace(/\s+/g, "") + "mc.gov.in";

  if (normalized.includes("works") || normalized.includes("pwd") || normalized.includes("road") || normalized.includes("transportation")) {
    return {
      phone: "1800-345-0011 (Municipal PWD Care)",
      email: `pwd@${emailDomain}`,
      address: `Public Works Department Office, ${corpName} HQ, ${city}, ${state} ${postalCode}`,
      hours: "Mon-Sat: 10:00 AM - 5:30 PM"
    };
  }
  if (normalized.includes("water") || normalized.includes("power") || normalized.includes("hydrant") || normalized.includes("utility") || normalized.includes("board")) {
    return {
      phone: "1916 (Municipal Water Works)",
      email: `water@${emailDomain}`,
      address: `Municipal Water Board & Sewerage Office, ${corpName} Buildings, ${city}, ${state} ${postalCode}`,
      hours: "24/7 Water Division Hotline"
    };
  }
  if (normalized.includes("sanitation") || normalized.includes("garbage") || normalized.includes("trash") || normalized.includes("waste") || normalized.includes("recycling") || normalized.includes("mcd") || normalized.includes("health")) {
    return {
      phone: "1800-345-1234 (Municipal Solid Waste Cell)",
      email: `cleanup@${emailDomain}`,
      address: `Solid Waste Management & Sanitation Dept, ${corpName} HQ, ${city}, ${state} ${postalCode}`,
      hours: "Daily: 6:00 AM - 8:00 PM"
    };
  }
  if (normalized.includes("light") || normalized.includes("street") || normalized.includes("lamp") || normalized.includes("bses")) {
    return {
      phone: "1912 (State Electricity Helpline)",
      email: `streetlights@${emailDomain}`,
      address: `State Electricity Distribution & Streetlighting Div, ${city}, ${state} ${postalCode}`,
      hours: "Mon-Sat: 8:00 AM - 8:00 PM"
    };
  }
  return {
    phone: "1800-11-0093 (General Civic Helpline)",
    email: `helpline@${emailDomain}`,
    address: `Municipal Secretariat Office, ${corpName} Head Office, ${city}, ${state} ${postalCode}`,
    hours: "Mon-Fri: 9:30 AM - 6:00 PM"
  };
};

export default function DashboardFeedPage() {
  const { 
    complaints, 
    upvoteComplaint, 
    rejectComplaint, 
    addComment,
    user
  } = useApp();

  const [activeComplaintDetails, setActiveComplaintDetails] = useState<any | null>(null);
  const [commentInput, setCommentInput] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [copiedToast, setCopiedToast] = useState(false);
  const [flagTargetId, setFlagTargetId] = useState<string | null>(null);
  const [flagProofImage, setFlagProofImage] = useState<string | null>(null);
  const [contactLoading, setContactLoading] = useState(false);
  const [currentContact, setCurrentContact] = useState<any>(null);

  useEffect(() => {
    if (activeComplaintDetails) {
      if (activeComplaintDetails.municipalContact) {
        setCurrentContact(activeComplaintDetails.municipalContact);
      } else {
        setContactLoading(true);
        fetch("/api/gemini/get-contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            locationName: activeComplaintDetails.locationName,
            department: activeComplaintDetails.department
          })
        })
        .then(res => res.json())
        .then(data => {
          setCurrentContact(data);
          setContactLoading(false);
        })
        .catch(err => {
          console.error("Error fetching dynamic municipal contact:", err);
          const fallback = getDepartmentContact(activeComplaintDetails.department, activeComplaintDetails.locationName);
          setCurrentContact(fallback);
          setContactLoading(false);
        });
      }
    } else {
      setCurrentContact(null);
    }
  }, [activeComplaintDetails]);

  const totalReported = complaints.length;
  const totalResolved = complaints.filter(c => c.status === "Resolved" || c.status === "Closed").length;
  const resolutionPercentage = totalReported > 0 ? Math.round((totalResolved / totalReported) * 100) : 0;
  
  // Calculate average severity
  const avgSeverity = totalReported > 0 
    ? (complaints.reduce((acc, c) => acc + c.severity, 0) / totalReported).toFixed(1) 
    : "0.0";

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || !activeComplaintDetails) return;

    addComment(activeComplaintDetails.id, commentInput);
    
    // Update local details context comments thread
    const newComment = {
      id: "comment_" + Date.now(),
      userName: user?.displayName || "Local Operator",
      userEmail: user?.email || "local@citizen.org",
      text: commentInput,
      createdAt: new Date().toISOString()
    };
    
    setActiveComplaintDetails((prev: any) => ({
      ...prev,
      comments: [...prev.comments, newComment]
    }));
    
    setCommentInput("");
  };

  const filteredComplaints = complaints.filter(c => {
    if (filterType === "All") return true;
    if (filterType === "Active") return c.status !== "Resolved" && c.status !== "Closed";
    if (filterType === "Resolved") return c.status === "Resolved" || c.status === "Closed";
    return c.issueType.toLowerCase().includes(filterType.toLowerCase());
  });

  return (
    <div className="space-y-8 text-left">
      
      {/* Overview Statistics Cards Grid */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-[#4285F4]/10 text-[#4285F4] rounded-2xl border border-[#4285F4]/10">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Reported</p>
            <p className="text-xl font-bold text-slate-800 font-mono mt-0.5">{totalReported} Issues</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-[#34A853]/10 text-[#34A853] rounded-2xl border border-[#34A853]/10">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Resolved</p>
            <p className="text-xl font-bold text-slate-800 font-mono mt-0.5">{totalResolved} Solved</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-[#FBBC05]/10 text-[#d49f05] rounded-2xl border border-[#FBBC05]/10">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resolution Rate</p>
            <p className="text-xl font-bold text-slate-800 font-mono mt-0.5">{resolutionPercentage}% Speed</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-[#EA4335]/10 text-[#EA4335] rounded-2xl border border-[#EA4335]/10">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Avg Severity</p>
            <p className="text-xl font-bold text-slate-800 font-mono mt-0.5">{avgSeverity} / 10</p>
          </div>
        </div>

      </section>

      {/* Main Feed Container split screen */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Complaints Alert List */}
        <section className="lg:col-span-7 space-y-5">
          
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3">
            <div className="flex gap-2">
              {["All", "Active", "Resolved"].map(t => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    filterType === t
                      ? "bg-slate-900 border-slate-900 text-white shadow"
                      : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {t} Complaints
                </button>
              ))}
            </div>
            
            <Link 
              href="/dashboard/report"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md shadow-emerald-600/5 flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report New</span>
            </Link>
          </div>

          <div className="space-y-4">
            {filteredComplaints.map((c) => {
              const isResolved = c.status === "Resolved" || c.status === "Closed";
              return (
                <div 
                  key={c.id}
                  onClick={() => setActiveComplaintDetails(c)}
                  className={`bg-white border rounded-3xl p-5 shadow-sm transition-all cursor-pointer hover:shadow-md hover:border-slate-300 flex flex-col gap-4 text-left relative overflow-hidden ${
                    activeComplaintDetails?.id === c.id ? "border-[#4285F4] ring-1 ring-[#4285F4]" : "border-slate-200/80"
                  }`}
                >
                  {/* Status header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-bold px-2.5 py-1 rounded-md uppercase border ${
                        isResolved
                          ? "bg-slate-100 text-slate-500 border-slate-200"
                          : c.status === "Assigned"
                          ? "bg-indigo-50 text-indigo-600 border-indigo-100"
                          : "bg-emerald-50 text-emerald-600 border-emerald-100"
                      }`}>
                        {c.status}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase font-mono">#{c.id}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-400">{new Date(c.createdAt).toLocaleDateString()}</span>
                      <span className={`text-xs font-mono font-bold ${c.severity >= 7 ? "text-rose-600" : "text-amber-600"}`}>
                        Severity: {c.severity}/10
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    {c.beforeImage && (
                      <div className="md:col-span-3 h-24 bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={c.beforeImage} alt={c.issueType} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className={`${c.beforeImage ? "md:col-span-9" : "md:col-span-12"} space-y-1`}>
                      <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                        {c.issueType}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{c.locationName}</span>
                      </p>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">{c.description}</p>
                    </div>
                  </div>

                  {/* Actions Upvotes, Comments count */}
                  <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (c.verifiedBy?.includes(user?.uid)) {
                            alert("You have already verified this complaint!");
                            return;
                          }
                          upvoteComplaint(c.id);
                        }}
                        disabled={c.verifiedBy?.includes(user?.uid)}
                        className={`px-3.5 py-1.5 rounded-xl text-[10px] font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer ${
                          c.verifiedBy?.includes(user?.uid)
                            ? "bg-emerald-100 border border-emerald-200 text-emerald-700 cursor-not-allowed opacity-80"
                            : "bg-slate-50 border border-slate-200/60 hover:bg-slate-100/50 text-slate-600 hover:text-[#34A853]"
                        }`}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{c.verifiedBy?.includes(user?.uid) ? "Verified" : `Verify (${c.upvotes})`}</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (c.flaggedBy?.includes(user?.uid)) {
                            alert("You have already flagged this complaint!");
                            return;
                          }
                          setFlagTargetId(c.id);
                        }}
                        disabled={c.flaggedBy?.includes(user?.uid)}
                        className={`px-3.5 py-1.5 rounded-xl text-[10px] font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer ${
                          c.flaggedBy?.includes(user?.uid)
                            ? "bg-rose-100 border border-rose-200 text-rose-700 cursor-not-allowed opacity-80"
                            : "bg-slate-50 border border-slate-200/60 hover:bg-rose-50 hover:text-rose-600 text-slate-500"
                        }`}
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                        <span>{c.flaggedBy?.includes(user?.uid) ? "Flagged Fake" : `Flag Fake (${c.rejectedCount || 0})`}</span>
                      </button>
                    </div>

                    <div className="text-slate-400 text-xs font-semibold flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-slate-400" />
                      <span>{c.comments.length} Comments</span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>

                </div>
              );
            })}

            {filteredComplaints.length === 0 && (
              <div className="bg-white border border-slate-200/80 p-12 rounded-3xl text-center flex flex-col items-center justify-center gap-3">
                <CheckCircle className="w-10 h-10 opacity-30 text-[#34A853]" />
                <h4 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider">All Clear!</h4>
                <p className="text-xs text-slate-500 leading-relaxed max-w-[200px] mx-auto">No issues reported matching filters in this grid quadrant.</p>
              </div>
            )}
          </div>

        </section>

        {/* Right Side: Expandable Complaint Detailed Viewer */}
        <section className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm text-left sticky top-24">
          {activeComplaintDetails ? (
            <div className="space-y-4">
              
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[9px] font-mono text-[#34A853] font-bold uppercase tracking-wider">Complaint Detail Folder</span>
                  <h3 className="text-sm font-extrabold text-slate-900 mt-0.5">{activeComplaintDetails.issueType}</h3>
                </div>
                <button 
                  onClick={() => setActiveComplaintDetails(null)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3.5 text-xs text-slate-700">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Geocoded Location</p>
                  <p className="text-slate-800 font-semibold mt-0.5">{activeComplaintDetails.locationName}</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Routing Department</p>
                    <p className="text-slate-800 font-semibold mt-0.5">{activeComplaintDetails.department}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Reporter Account</p>
                    <p className="text-slate-800 font-semibold mt-0.5">{activeComplaintDetails.reporter}</p>
                  </div>
                </div>

                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Audit Description</p>
                  <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-200 mt-1">
                    {activeComplaintDetails.description}
                  </p>
                </div>

                {/* Liaison Complaint Draft */}
                {activeComplaintDetails.officialLiaisonDraft && (
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 mt-3 space-y-2">
                    <span className="text-[9px] font-bold text-emerald-800 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                      <FileText className="w-4 h-4" /> Formal Municipal Petition Letter
                    </span>
                    <div className="text-[10px] text-slate-600 font-mono whitespace-pre-wrap max-h-36 overflow-y-auto leading-relaxed bg-white p-2.5 rounded-xl border border-slate-200/50">
                      {activeComplaintDetails.officialLiaisonDraft.body}
                    </div>
                  </div>
                )}

                {/* Department Contacts & Actions Section */}
                {activeComplaintDetails.officialLiaisonDraft && (() => {
                  if (contactLoading) {
                    return (
                      <div className="bg-[#4285F4]/5 border border-[#4285F4]/20 p-4 rounded-2xl mt-3 space-y-3 animate-pulse">
                        <div className="flex items-center justify-between border-b border-[#4285F4]/10 pb-1.5">
                          <span className="text-[9px] font-bold text-[#4285F4] uppercase tracking-widest flex items-center gap-1.5">
                            <Activity className="w-4 h-4" /> Nearest Municipal Dispatch Office
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 text-center py-4">
                          Looking up nearest dispatch office details dynamically via AI...
                        </div>
                      </div>
                    );
                  }

                  const contact = currentContact || getDepartmentContact(activeComplaintDetails.department, activeComplaintDetails.locationName);
                  const mailtoUrl = `mailto:${contact.email}?subject=${encodeURIComponent(
                    activeComplaintDetails.officialLiaisonDraft.subject || "Civic Hazard Alert"
                  )}&body=${encodeURIComponent(activeComplaintDetails.officialLiaisonDraft.body || "")}`;
                  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((contact.name || "Municipal Office") + " " + contact.address)}`;

                  return (
                    <div className="bg-[#4285F4]/5 border border-[#4285F4]/20 p-4 rounded-2xl mt-3 space-y-3">
                      <div className="flex items-center justify-between border-b border-[#4285F4]/10 pb-1.5">
                        <span className="text-[9px] font-bold text-[#4285F4] uppercase tracking-widest flex items-center gap-1.5">
                          <Activity className="w-4 h-4" /> {contact.name || "Nearest Municipal Dispatch Office"}
                        </span>
                        <span className="text-[8px] bg-[#4285F4]/10 text-[#4285F4] font-bold px-1.5 py-0.5 rounded-full">
                          Contact Info
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-[10px]">
                        <div className="col-span-2">
                          <p className="text-[8px] font-bold text-slate-400 uppercase">Office Address</p>
                          <p className="text-slate-800 font-medium font-sans mt-0.5 leading-tight">{contact.address}</p>
                          <a 
                            href={mapsUrl}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[9px] text-[#4285F4] hover:underline font-semibold flex items-center gap-0.5 mt-1 animate-fade-in"
                          >
                            <MapPin className="w-3 h-3 text-[#4285F4]" /> View on Google Maps
                          </a>
                        </div>
                        <div>
                          <p className="text-[8px] font-bold text-slate-400 uppercase">Hotline Number</p>
                          <p className="text-slate-800 font-semibold font-mono mt-0.5">{contact.phone}</p>
                        </div>
                        <div>
                          <p className="text-[8px] font-bold text-slate-400 uppercase">Support Email</p>
                          <p className="text-[#4285F4] font-semibold font-mono mt-0.5">{contact.email}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-[8px] font-bold text-slate-400 uppercase">Operational Hours</p>
                          <p className="text-slate-800 font-medium mt-0.5">{contact.hours}</p>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <a 
                          href={mailtoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 bg-[#4285F4] hover:bg-[#357AE8] text-white font-bold py-2.5 px-3 rounded-xl text-[10px] flex items-center justify-center gap-1.5 cursor-pointer shadow transition-all uppercase"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Open Email Client</span>
                        </a>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            const letterText = `To: ${contact.email}\nSubject: ${activeComplaintDetails.officialLiaisonDraft.subject || "Civic Hazard Alert"}\n\n${activeComplaintDetails.officialLiaisonDraft.body || ""}`;
                            navigator.clipboard.writeText(letterText).then(() => {
                              setCopiedToast(true);
                              setTimeout(() => setCopiedToast(false), 2500);
                            }).catch(() => {
                              // Fallback for older browsers
                              const textArea = document.createElement('textarea');
                              textArea.value = letterText;
                              document.body.appendChild(textArea);
                              textArea.select();
                              document.execCommand('copy');
                              document.body.removeChild(textArea);
                              setCopiedToast(true);
                              setTimeout(() => setCopiedToast(false), 2500);
                            });
                          }}
                          className="bg-white border border-[#4285F4]/30 hover:bg-[#4285F4]/10 text-[#4285F4] font-bold py-2.5 px-3 rounded-xl text-[10px] flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-all uppercase"
                        >
                          {copiedToast ? (
                            <><CheckCircle className="w-3.5 h-3.5" /><span>Copied!</span></>
                          ) : (
                            <><FileText className="w-3.5 h-3.5" /><span>Copy Letter</span></>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })()}

                {/* Comments thread */}
                <div className="border-t border-slate-100 pt-4 space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" /> Discussion Comments ({activeComplaintDetails.comments.length})
                  </h4>

                  <div className="space-y-3 max-h-40 overflow-y-auto pr-1">
                    {activeComplaintDetails.comments.map((comment: any) => (
                      <div key={comment.id} className="bg-slate-50/50 border border-slate-200/50 p-2.5 rounded-2xl space-y-1">
                        <div className="flex items-center justify-between text-[9px] font-semibold text-slate-400">
                          <span className="text-slate-600 flex items-center gap-1 font-bold">
                            <User className="w-3 h-3 text-[#4285F4]" /> {comment.userName}
                          </span>
                          <span>{new Date(comment.createdAt).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-[11px] text-slate-700 leading-relaxed pl-4">{comment.text}</p>
                      </div>
                    ))}
                    {activeComplaintDetails.comments.length === 0 && (
                      <p className="text-[11px] text-slate-400 text-center font-medium py-2">No comments posted yet. Start the conversation!</p>
                    )}
                  </div>

                  {/* Post comment form */}
                  <form onSubmit={handlePostComment} className="flex gap-2 pt-2">
                    <input
                      type="text"
                      placeholder="Post a coordination comment..."
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                    <button 
                      type="submit"
                      className="bg-slate-900 hover:bg-slate-800 text-white p-2 rounded-xl flex items-center justify-center shrink-0 cursor-pointer shadow"
                    >
                      <Send className="w-4.5 h-4.5" />
                    </button>
                  </form>
                </div>

              </div>

            </div>
          ) : (
            <div className="text-center py-20 text-slate-400 flex flex-col items-center justify-center gap-3">
              <Compass className="w-10 h-10 opacity-30 text-[#4285F4]" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Incident Details Folder</h4>
              <p className="text-xs text-slate-500 leading-relaxed max-w-[200px]">Select any complaint card from the feed on the left to review maps, timelines, and discussions.</p>
            </div>
          )}
        </section>

      </div>

      {/* Flag Fake Proof Upload Modal */}
      {flagTargetId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 text-left">
          <div className="w-full max-w-md bg-white border border-rose-200 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertTriangle className="w-5 h-5" />
                <h4 className="font-bold text-sm uppercase tracking-wider">Flag Fake: Upload Proof</h4>
              </div>
              <button 
                onClick={() => {
                  setFlagTargetId(null);
                  setFlagProofImage(null);
                }} 
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-normal">
              To flag this civic issue as fake or resolved, you must upload an image showing the exact location.
            </p>

            <div className="relative h-40 w-full bg-slate-50 border border-slate-200 border-dashed rounded-2xl overflow-hidden flex flex-col items-center justify-center">
              {flagProofImage ? (
                <>
                  <img src={flagProofImage} alt="Proof Preview" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setFlagProofImage(null)}
                    className="absolute top-2 right-2 bg-white/90 text-slate-700 p-1 rounded-full border border-slate-200 shadow-md text-xs hover:text-rose-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </>
              ) : (
                <div className="text-center p-4">
                  <Upload className="w-8 h-8 text-slate-405 mx-auto mb-2" style={{ color: '#94a3b8' }} />
                  <p className="text-xs font-bold text-slate-700">Select or take proof photo</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setFlagProofImage(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  if (!flagProofImage) {
                    alert("Please upload a proof photo first!");
                    return;
                  }
                  rejectComplaint(flagTargetId, flagProofImage);
                  setFlagTargetId(null);
                  setFlagProofImage(null);
                }}
                className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer shadow-md"
              >
                Submit Fake Flag
              </button>
              <button
                onClick={() => {
                  setFlagTargetId(null);
                  setFlagProofImage(null);
                }}
                className="bg-white border border-slate-200 text-slate-500 font-bold text-xs px-4 rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
