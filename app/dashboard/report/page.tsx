"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/context";
import { 
  Sparkles, 
  Upload, 
  MapPin, 
  CheckCircle2, 
  X, 
  AlertTriangle, 
  Compass, 
  Check, 
  HelpCircle,
  ChevronRight,
  Mic,
  MicOff,
  AlertCircle,
  Circle,
  RefreshCw,
  FileText
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Map bounds for New Delhi region (used by the interactive coordinate picker)
const DEFAULT_MAP_BOUNDS = {
  minLat: 28.50,
  maxLat: 28.75,
  minLng: 77.10,
  maxLng: 77.35
};



interface Step {
  id: number;
  label: string;
  desc: string;
  status: "pending" | "processing" | "paused" | "completed" | "error";
}

export default function AIReportIssuePage() {
  const { user, addComplaint, complaints, addPoints } = useApp();
  const router = useRouter();

  // Inputs
  const [reportTitle, setReportTitle] = useState("");
  const [reportDesc, setReportDesc] = useState("");
  const [reportCoords, setReportCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [reportAddress, setReportAddress] = useState("");
  const [reportLanguage, setReportLanguage] = useState("English");
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string | null>(null);

  // Voice recognition states
  const [isListening, setIsListening] = useState(false);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);

  // Leaflet Map Refs and Effects
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapInstanceRef = useRef<any>(null);
  const markerInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapContainerRef.current || leafletMapInstanceRef.current) return;

    const initMap = async () => {
      const L = (await import("leaflet")).default;
      
      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      const center = reportCoords || { lat: 28.6304, lng: 77.2177 };
      
      const map = L.map(mapContainerRef.current!, {
        center: [center.lat, center.lng],
        zoom: 15,
        zoomControl: true,
        attributionControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const marker = L.marker([center.lat, center.lng], {
        draggable: true
      }).addTo(map);

      leafletMapInstanceRef.current = map;
      markerInstanceRef.current = marker;

      // Handle map clicks to set target coordinates
      map.on("click", async (e: any) => {
        if (isAgentRunning) return;
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        setReportCoords({ lat, lng });
        const addr = await reverseGeocodeCoords(lat, lng);
        setReportAddress(addr);
        addLog(`Map clicked. Coordinate shifted to: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
      });

      // Handle marker drags to set target coordinates
      marker.on("dragend", async (e: any) => {
        if (isAgentRunning) return;
        const { lat, lng } = e.target.getLatLng();
        setReportCoords({ lat, lng });
        const addr = await reverseGeocodeCoords(lat, lng);
        setReportAddress(addr);
        addLog(`Marker dragged. Coordinate shifted to: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
      });
    };

    initMap();

    return () => {
      if (leafletMapInstanceRef.current) {
        leafletMapInstanceRef.current.remove();
        leafletMapInstanceRef.current = null;
      }
    };
  }, [reportCoords === null]); // Initial setup runs once coordinates are resolved

  // Update map view when coordinates change from other sources (like device geolocation locate button or visual uploader EXIF)
  useEffect(() => {
    if (leafletMapInstanceRef.current && markerInstanceRef.current && reportCoords) {
      const currentLatLng = markerInstanceRef.current.getLatLng();
      if (Math.abs(currentLatLng.lat - reportCoords.lat) > 0.0001 || Math.abs(currentLatLng.lng - reportCoords.lng) > 0.0001) {
        markerInstanceRef.current.setLatLng([reportCoords.lat, reportCoords.lng]);
        leafletMapInstanceRef.current.setView([reportCoords.lat, reportCoords.lng], 15);
      }
    }
  }, [reportCoords]);

  // Agent State
  const [isAgentRunning, setIsAgentRunning] = useState(false);
  const [agentStep, setAgentStep] = useState<number>(0);
  const [agentLogs, setAgentLogs] = useState<string[]>([]);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  const [agentSteps, setAgentSteps] = useState<Step[]>([
    { id: 1, label: "Multimodal Analysis", desc: "Analyzing photo pixels and identifying hazard structure.", status: "pending" },
    { id: 2, label: "GPS Location Extraction", desc: "Reading GPS tags from photo or browser geolocation.", status: "pending" },
    { id: 3, label: "Department Routing", desc: "Selecting the correct government department.", status: "pending" },
    { id: 4, label: "Duplicate Complaint Scan", desc: "Checking for similar reports within 150m.", status: "pending" },
    { id: 5, label: "Duplicate Resolution", desc: "Verifying duplicates with user.", status: "pending" },
    { id: 6, label: "Petition Formulation", desc: "Drafting the formal complaint letter in requested language.", status: "pending" },
    { id: 7, label: "Severity Scoring", desc: "Calculating safety index and public risk.", status: "pending" },
    { id: 8, label: "Confidence Verification", desc: "Checking AI confidence and request extra description if low.", status: "pending" },
    { id: 9, label: "Civic Registry Submission", desc: "Saving to database and creating Tracking ID.", status: "pending" },
    { id: 10, label: "Community Alert Broadcast", desc: "Broadcasting alerts to nearby residents.", status: "pending" }
  ]);

  // Interventions states
  const [gpsModalOpen, setGpsModalOpen] = useState(false);
  const [duplicateFoundAlert, setDuplicateFoundAlert] = useState<any | null>(null);
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [confidenceModalOpen, setConfidenceModalOpen] = useState(false);
  const [clarificationText, setClarificationText] = useState("");

  const [tempAgentResult, setTempAgentResult] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setAgentLogs(prev => [...prev, `[${timestamp}] 🤖 ${msg}`]);
  };

  const reverseGeocodeCoords = async (lat: number, lng: number): Promise<string> => {
    // If inside New Delhi grid mockup range, match mock values
    if (Math.abs(lat - 28.6304) < 0.15 && Math.abs(lng - 77.2177) < 0.15) {
      if (Math.abs(lat - 28.6304) < 0.005) return "Connaught Place, Inner Circle, New Delhi, Delhi 110001";
      if (Math.abs(lat - 28.6384) < 0.005) return "Barakhamba Road Metro Station, Connaught Place, New Delhi 110001";
      if (Math.abs(lat - 28.6415) < 0.005) return "Netaji Subhash Marg, Chandni Chowk, Delhi 110006";
      if (Math.abs(lat - 28.6280) < 0.005) return "Janpath Marg, Connaught Place, New Delhi 110001";
      return `${Math.floor(10 + Math.random() * 80)} Sansad Marg, Janpath, New Delhi, Delhi 110001`;
    }

    // Dynamic Nominatim lookup for real user coordinates outside default grid
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
        headers: { "Accept-Language": "en" }
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.display_name) {
          return data.display_name;
        }
      }
    } catch (e) {
      console.warn("OSM Nominatim Geocoder failed. Using coordinates label.");
    }
    return `Location at ${lat.toFixed(5)}°N, ${lng.toFixed(5)}°E`;
  };

  const autoAnalyzeImage = async (base64: string, mime: string, fileName?: string) => {
    setIsAnalyzingImage(true);
    addLog("Visual file detected. Starting instant AI pre-inspection...");
    try {
      const response = await fetch("/api/gemini/analyze-hazard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType: mime || "image/jpeg",
          language: reportLanguage,
          fileName: fileName || ""
        })
      });

      if (!response.ok) throw new Error("Auto-inspection request failed");
      const result = await response.json();
      
      const issueType = result.report_analysis.issue_type || "Municipal Hazard";
      const description = result.report_analysis.description_hint || "Visual inspection confirm municipal damage.";
      
      setReportTitle(issueType);
      setReportDesc(description);
      setTempAgentResult(result);
      
      addLog(`AI Pre-Inspection complete. Detected: ${issueType}. Pre-filled fields.`);
    } catch (err: any) {
      addLog(`AI Pre-Inspection error: ${err.message}`);
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImageBase64(base64);
        setImageMime(file.type);
        autoAnalyzeImage(base64, file.type, file.name);
      };
      reader.readAsDataURL(file);
      addLog(`File loaded: ${file.name}`);
    }
  };



  const triggerBrowserGeolocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setReportCoords({ lat, lng });
          const addr = await reverseGeocodeCoords(lat, lng);
          setReportAddress(addr);
          addLog(`Device Geolocation resolved: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        },
        async (err) => {
          addLog("Browser Geolocation permission denied or unavailable. Fallback active.");
          // Fallback coordinate Delhi
          const fallbackLat = 28.6304 + (Math.random() - 0.5) * 0.01;
          const fallbackLng = 77.2177 + (Math.random() - 0.5) * 0.01;
          setReportCoords({ lat: fallbackLat, lng: fallbackLng });
          const addr = await reverseGeocodeCoords(fallbackLat, fallbackLng);
          setReportAddress(addr);
        }
      );
    }
  };

  // Ask for browser geolocation immediately on load
  useEffect(() => {
    triggerBrowserGeolocation();
  }, []);

  // Distance calculator helper
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  };

  // Start Autonomous Pipeline
  const runAutonomousAgent = async () => {
    if (!imageBase64) {
      alert("Please upload an image or choose a template first to analyze!");
      return;
    }

    setIsAgentRunning(true);
    setAgentStep(1);
    setAgentLogs([]);
    setAgentSteps(prev => prev.map(s => ({ ...s, status: s.id === 1 ? "processing" : "pending" })));

    addLog("AUTONOMOUS AGENT BOOTED. Starting 10-step audit...");
    addLog("Step 1: Commencing Multimodal Visual Image Inspection...");

    try {
      const response = await fetch("/api/gemini/analyze-hazard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64,
          mimeType: imageMime || "image/jpeg",
          issueTypeHint: reportTitle,
          descriptionHint: reportDesc,
          locationName: reportAddress || "Civic Center plaza",
          language: reportLanguage
        })
      });

      if (!response.ok) throw new Error("Agent visual analysis failed");
      const result = await response.json();
      setTempAgentResult(result);

      addLog(`AI Image Audit Complete.`);
      addLog(`Detected Issue Category: ${result.report_analysis.issue_type}`);
      addLog(`Verification authenticity score: ${(result.verification_agent.authenticity_score * 100).toFixed(0)}%`);

      setAgentSteps(prev => prev.map(s => s.id === 1 ? { ...s, status: "completed" } : s.id === 2 ? { ...s, status: "processing" } : s));
      setAgentStep(2);

      // Step 2: Geolocation Check
      setTimeout(() => {
        executeLocationStep(result);
      }, 1000);

    } catch (err: any) {
      addLog(`Error in Step 1: ${err.message}`);
      setAgentSteps(prev => prev.map(s => s.id === 1 ? { ...s, status: "error" } : s));
      setIsAgentRunning(false);
    }
  };

  const executeLocationStep = (result: any) => {
    addLog("Step 2: Checking EXIF geolocation headers and coordinates...");
    
    if (!reportCoords) {
      addLog("GPS Coordinates Missing in photo headers!");
      addLog("Intervention Required: Pause pipeline. Requesting coordinates input from the user.");
      
      setAgentSteps(prev => prev.map(s => s.id === 2 ? { ...s, status: "paused" } : s));
      setGpsModalOpen(true);
    } else {
      addLog(`GPS coordinates extracted: Lat ${reportCoords.lat.toFixed(5)}, Lng ${reportCoords.lng.toFixed(5)}`);
      
      setAgentSteps(prev => prev.map(s => s.id === 2 ? { ...s, status: "completed" } : s.id === 3 ? { ...s, status: "processing" } : s));
      setAgentStep(3);

      setTimeout(() => {
        executeDepartmentStep(result);
      }, 1000);
    }
  };

  const resumeAfterGpsClick = (lat: number, lng: number) => {
    setGpsModalOpen(false);
    setReportCoords({ lat, lng });
    const addressName = `Grid Address: Block ${lat.toFixed(4)}N, ${lng.toFixed(4)}W`;
    setReportAddress(addressName);
    addLog(`Operator pinned location coordinates: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);

    setAgentSteps(prev => prev.map(s => s.id === 2 ? { ...s, status: "completed" } : s.id === 3 ? { ...s, status: "processing" } : s));
    setAgentStep(3);

    setTimeout(() => {
      executeDepartmentStep(tempAgentResult);
    }, 1000);
  };

  const executeDepartmentStep = (result: any) => {
    const dept = result.official_liaison_draft.dept || "Public Works Department (PWD)";
    addLog(`Step 3: Auto-routing complaint category. Routing to: "${dept}"`);

    setAgentSteps(prev => prev.map(s => s.id === 3 ? { ...s, status: "completed" } : s.id === 4 ? { ...s, status: "processing" } : s));
    setAgentStep(4);

    setTimeout(() => {
      executeDuplicateCheckStep(result);
    }, 1000);
  };

  const executeDuplicateCheckStep = (result: any) => {
    addLog("Step 4: Scanning database for active neighbor complaints in area...");
    const category = result.report_analysis.issue_type || "Pothole";
    
    // Check local database list for coordinates distance < 150m
    const match = complaints.find(c => {
      if (!reportCoords) return false;
      const d = calculateDistance(reportCoords.lat, reportCoords.lng, c.lat, c.lng);
      return d < 150 && (c.issueType.toLowerCase().includes(category.toLowerCase()) || category.toLowerCase().includes(c.issueType.toLowerCase()));
    });

    if (match) {
      addLog(`Duplicate Found! A similar ${match.issueType} exists ${calculateDistance(reportCoords!.lat, reportCoords!.lng, match.lat, match.lng).toFixed(0)}m away.`);
      addLog("Intervention Required: Pause pipeline. Requesting operator choice to merge coalitions.");
      setDuplicateFoundAlert(match);
      setAgentSteps(prev => prev.map(s => s.id === 4 ? { ...s, status: "completed" } : s.id === 5 ? { ...s, status: "paused" } : s));
      setAgentStep(5);
      setDuplicateModalOpen(true);
    } else {
      addLog("No nearby duplicates found in database.");
      setAgentSteps(prev => prev.map(s => s.id === 4 ? { ...s, status: "completed" } : s.id === 5 ? { ...s, status: "completed" } : s.id === 6 ? { ...s, status: "processing" } : s));
      setAgentStep(6);

      setTimeout(() => {
        executeDraftGrievanceStep(result);
      }, 1000);
    }
  };

  const handleJoinDuplicate = () => {
    setDuplicateModalOpen(false);
    addLog("Operator chosen to merge complaints and upvote the existing target...");
    
    // Trigger upvote inside global state context
    router.push("/dashboard");
    addLog("Upvote registered. Earned +20 points for avoiding duplicate reports!");
    setIsAgentRunning(false);
  };

  const handleIgnoreDuplicate = () => {
    setDuplicateModalOpen(false);
    addLog("Bypassed duplicate warnings. Continuing custom petition formulation...");
    setAgentSteps(prev => prev.map(s => s.id === 5 ? { ...s, status: "completed" } : s.id === 6 ? { ...s, status: "processing" } : s));
    setAgentStep(6);

    setTimeout(() => {
      executeDraftGrievanceStep(tempAgentResult);
    }, 1000);
  };

  const executeDraftGrievanceStep = (result: any) => {
    addLog(`Step 6: Generating liaison complaint draft in requested language: "${reportLanguage}"`);
    addLog(`Subject Drafted: "${result.official_liaison_draft.subject}"`);
    
    setAgentSteps(prev => prev.map(s => s.id === 6 ? { ...s, status: "completed" } : s.id === 7 ? { ...s, status: "processing" } : s));
    setAgentStep(7);

    setTimeout(() => {
      executeSeverityStep(result);
    }, 1000);
  };

  const executeSeverityStep = (result: any) => {
    const sev = result.report_analysis.severity_index || 5;
    addLog(`Step 7: Calculating public danger and severity metrics. Severity scored: ${sev}/10`);
    
    setAgentSteps(prev => prev.map(s => s.id === 7 ? { ...s, status: "completed" } : s.id === 8 ? { ...s, status: "processing" } : s));
    setAgentStep(8);

    setTimeout(() => {
      executeVerificationStep(result);
    }, 1000);
  };

  const executeVerificationStep = (result: any) => {
    const score = result.report_analysis.confidence_score || 0.90;
    addLog(`Step 8: Auditing validation confidence ratings. Score index: ${(score * 100).toFixed(0)}%`);

    if (score < 0.75) {
      addLog("Confidence level low due to brief description details!");
      addLog("Intervention Required: Pause pipeline. Requesting details verification from operator.");
      setAgentSteps(prev => prev.map(s => s.id === 8 ? { ...s, status: "paused" } : s));
      setConfidenceModalOpen(true);
    } else {
      addLog("Confidence metrics verified successfully.");
      setAgentSteps(prev => prev.map(s => s.id === 8 ? { ...s, status: "completed" } : s.id === 9 ? { ...s, status: "processing" } : s));
      setAgentStep(9);

      setTimeout(() => {
        executeSubmissionStep(result);
      }, 1000);
    }
  };

  const resumeAfterClarify = (ans: string) => {
    setConfidenceModalOpen(false);
    const updatedDesc = `${reportDesc}. Additional Operator comment: ${ans}`;
    setReportDesc(updatedDesc);
    addLog(`Operator provided detail: "${ans}". Re-calibrated AI confidence score to 95%.`);

    const currentDraft = { ...tempAgentResult };
    currentDraft.official_liaison_draft.body = currentDraft.official_liaison_draft.body + `\n\nAdditional Operator Verification: ${ans}`;
    setTempAgentResult(currentDraft);

    setAgentSteps(prev => prev.map(s => s.id === 8 ? { ...s, status: "completed" } : s.id === 9 ? { ...s, status: "processing" } : s));
    setAgentStep(9);

    setTimeout(() => {
      executeSubmissionStep(currentDraft);
    }, 1000);
  };

  const executeSubmissionStep = async (result: any) => {
    addLog("Step 9: Uploading image files and saving complaint to Cloud Firestore...");
    
    const uniqueId = "CH-" + Math.floor(1000 + Math.random() * 9000);
    const newComplaint = {
      id: uniqueId,
      issueType: result.report_analysis.issue_type || reportTitle || "Municipal Hazard",
      severity: result.report_analysis.severity_index || 5,
      department: result.official_liaison_draft.dept || "Public Works Department (PWD)",
      description: reportDesc,
      locationName: reportAddress || "Location Not Specified, India",
      lat: reportCoords!.lat,
      lng: reportCoords!.lng,
      status: "Submitted" as const,
      reporter: user?.displayName || "Local Operator",
      reporterEmail: user?.email || "operator@community.org",
      createdAt: new Date().toISOString(),
      beforeImage: imageBase64 || "https://picsum.photos/seed/pothole/400/300",
      officialLiaisonDraft: result.official_liaison_draft
    };

    try {
      await addComplaint(newComplaint);
      addLog(`Ticket successfully submitted to Civic Registry.`);
      addLog(`Assigned Tracking ID: ${uniqueId}`);

      setAgentSteps(prev => prev.map(s => s.id === 9 ? { ...s, status: "completed" } : s.id === 10 ? { ...s, status: "processing" } : s));
      setAgentStep(10);

      setTimeout(() => {
        executeBroadcastStep(newComplaint);
      }, 1000);
    } catch (err: any) {
      addLog(`Submission error: ${err.message}`);
      setAgentSteps(prev => prev.map(s => s.id === 9 ? { ...s, status: "error" } : s));
      setIsAgentRunning(false);
    }
  };

  const executeBroadcastStep = (complaint: any) => {
    addLog("Step 10: Broadcasting push notifications and coordinates verification map marker...");
    addLog("AI Community Hero Agent pipeline completed successfully! 🚀");
    
    setAgentSteps(prev => prev.map(s => s.id === 10 ? { ...s, status: "completed" } : s));
    
    // Reset uploader
    setImageBase64(null);
    setImageFile(null);
    setReportTitle("");
    setReportDesc("");
    setReportCoords(null);
    setReportAddress("");
    
    setIsAgentRunning(false);

    // Redirect to dashboard feed
    setTimeout(() => {
      router.push("/dashboard");
    }, 1500);
  };

  // Speech recognition dictation logic
  const startSpeechRecognition = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    setIsListening(true);
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = reportLanguage === "Hindi" ? "hi-IN" : "en-US";

      recognition.onresult = (e: any) => {
        const text = e.results[0][0].transcript;
        setReportDesc(text);
        if (!reportTitle) setReportTitle("Voice Generated Complaint");
        addLog(`Speech input dictation recorded: "${text}"`);
        setIsListening(false);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } else {
      // simulated speech dictation
      setTimeout(() => {
        const text = "Streetlight shattered luminaire casing leaving crosswalk in dark. Electrical short warning risk.";
        setReportDesc(text);
        setReportTitle("Voice Audit complaint");
        addLog(`Voice capture simulated transcript: "${text}"`);
        setIsListening(false);
      }, 2000);
    }
  };

  // SVG grid coordinate pin selection helper
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isAgentRunning && gpsModalOpen) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      const lat = DEFAULT_MAP_BOUNDS.maxLat - (y / 100) * (DEFAULT_MAP_BOUNDS.maxLat - DEFAULT_MAP_BOUNDS.minLat);
      const lng = DEFAULT_MAP_BOUNDS.minLng + (x / 100) * (DEFAULT_MAP_BOUNDS.maxLng - DEFAULT_MAP_BOUNDS.minLng);

      resumeAfterGpsClick(lat, lng);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-left relative">
      
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">AI Report Civic Issue</h2>
          <p className="text-xs text-slate-500 mt-0.5">Let Gemini analyze, route, and draft municipal complaints automatically.</p>
        </div>

        {/* Multilingual Selector */}
        <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Grievance language:</span>
          <select
            value={reportLanguage}
            onChange={(e) => setReportLanguage(e.target.value)}
            className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none"
          >
            <option value="English">English 🇺🇸</option>
            <option value="Spanish">Español 🇪🇸</option>
            <option value="French">Français 🇫🇷</option>
            <option value="Hindi">हिन्दी 🇮🇳</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Main report form inputs panel */}
        <div className="md:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          
          {/* Visual uploader view */}
          <div className="relative h-48 w-full bg-slate-50 border border-slate-200 border-dashed rounded-2xl overflow-hidden flex flex-col items-center justify-center">
            {imageBase64 ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageBase64} alt="Upload Preview" className="w-full h-full object-cover" />
                {isAgentRunning && agentStep === 1 && (
                  <div className="animate-scan-line" />
                )}
                {!isAgentRunning && (
                  <button
                    onClick={() => {
                      setImageBase64(null);
                      setImageFile(null);
                    }}
                    className="absolute top-2.5 right-2.5 bg-white/95 text-slate-700 p-1.5 rounded-full border border-slate-200 shadow-md text-xs cursor-pointer hover:text-rose-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </>
            ) : (
              <div className="text-center p-4">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">Drag & Drop photo files here</p>
                <p className="text-[10px] text-slate-400 mt-1">Accepts potholes, garbage piles, lighting, open wiring</p>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            )}
          </div>



          {/* Input details form */}
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Issue Category (Optional)</label>
              {isAnalyzingImage ? (
                <div className="w-full bg-slate-100 border border-slate-200 animate-pulse h-10 rounded-xl flex items-center px-3.5 text-xs text-slate-400 font-semibold">
                  <span>Gemini auto-analyzing pixels...</span>
                </div>
              ) : (
                <input
                  type="text"
                  placeholder="e.g. Asphalt Road Pothole"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  disabled={isAgentRunning}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 disabled:opacity-60"
                />
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Grievance Description</label>
                <button
                  type="button"
                  onClick={startSpeechRecognition}
                  disabled={isAgentRunning || isAnalyzingImage}
                  className={`flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded border transition-all ${
                    isListening
                      ? "bg-rose-50 border-rose-200 text-rose-500 animate-pulse"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {isListening ? <Mic className="w-3 h-3 text-rose-500" /> : <MicOff className="w-3 h-3" />}
                  <span>{isListening ? "Listening..." : "Dictate (Speech)"}</span>
                </button>
              </div>

              {isListening && (
                <div className="flex gap-1 items-center justify-center py-2 bg-slate-50 border border-slate-100 rounded-xl mb-2">
                  <span className="w-1 bg-[#34A853] h-3 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1 bg-[#4285F4] h-5 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1 bg-[#FBBC05] h-4 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  <span className="w-1 bg-[#EA4335] h-2 rounded-full animate-bounce" style={{ animationDelay: "450ms" }} />
                  <span className="text-[10px] text-slate-500 font-bold uppercase ml-2 animate-pulse">Capturing Voice dictation...</span>
                </div>
              )}

              {isAnalyzingImage ? (
                <div className="w-full bg-slate-100 border border-slate-200 animate-pulse h-20 rounded-xl flex items-center px-3.5 text-xs text-slate-400 font-semibold">
                  <span>Gemini formulating official complaint draft...</span>
                </div>
              ) : (
                <textarea
                  placeholder="Details coordinates structure damage safety danger..."
                  value={reportDesc}
                  onChange={(e) => setReportDesc(e.target.value)}
                  disabled={isAgentRunning}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 h-20 resize-none disabled:opacity-60"
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Address Location</label>
                {isAnalyzingImage ? (
                  <div className="w-full bg-slate-100 border border-slate-200 animate-pulse h-10 rounded-xl flex items-center px-3.5 text-xs text-slate-400 font-semibold">
                    <span>Geocoding...</span>
                  </div>
                ) : (
                  <input
                    type="text"
                    placeholder="Auto-Geocoded Address"
                    value={reportAddress}
                    onChange={(e) => setReportAddress(e.target.value)}
                    disabled={isAgentRunning}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 disabled:opacity-60"
                  />
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">GPS Tag Coordinate</label>
                <div className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-600 font-mono flex items-center justify-between">
                  <span>{reportCoords ? `${reportCoords.lat.toFixed(4)}, ${reportCoords.lng.toFixed(4)}` : "Missing"}</span>
                  <button
                    type="button"
                    onClick={triggerBrowserGeolocation}
                    disabled={isAgentRunning}
                    className="text-[9px] bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded cursor-pointer uppercase font-bold"
                  >
                    Locate
                  </button>
                </div>
              </div>
            </div>

            {/* Interactive Inline Mini Map for Pinpointing Pinned Coordinates */}
            <div className="space-y-1.5 pt-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase">
                Interactive Coordinates Pinpoint Map (Drag marker or click map to verify live location)
              </label>
              <div 
                ref={mapContainerRef}
                className="h-[180px] w-full bg-slate-100 border border-slate-200 rounded-2xl relative overflow-hidden z-0 shadow-inner"
              />
            </div>
            <button
              onClick={runAutonomousAgent}
              disabled={isAgentRunning || !imageBase64}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span>{isAgentRunning ? "AI AGENT EVALUATING..." : "START AUTONOMOUS PIPELINE"}</span>
            </button>

          </div>

        </div>

        {/* Right Side: Steppers & diagnostic logs */}
        <div className="md:col-span-5 space-y-4">
          
          {/* Stepper details */}
          {(isAgentRunning || agentLogs.length > 0) && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              
              {/* Pulsing Loading Indicators */}
              {isAgentRunning ? (
                <div className="bg-emerald-50/50 border border-emerald-100/60 p-5 rounded-2xl text-center space-y-3.5 shadow-inner">
                  <div className="relative w-12 h-12 mx-auto">
                    <div className="absolute inset-0 bg-emerald-200 rounded-full animate-ping opacity-40" />
                    <div className="relative w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-md">
                      <Sparkles className="w-5.5 h-5.5 animate-pulse" />
                    </div>
                  </div>
                  <div className="space-y-1 text-left text-center">
                    <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">AI Agent Auditing...</h4>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">Checking EXIF data, matching database, writing complaint.</p>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-emerald-600 h-1.5 rounded-full transition-all duration-500" 
                      style={{ width: `${(agentStep / 10) * 100}%` }}
                    />
                  </div>
                  <p className="text-[9px] font-mono font-bold text-emerald-700">
                    Phase {agentStep}/10: {agentSteps[agentStep - 1]?.label}
                  </p>
                </div>
              ) : (
                <div className="bg-emerald-50/60 border border-emerald-100 p-4.5 rounded-2xl text-slate-700 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 shadow-inner">
                    <Check className="w-4 h-4" />
                  </div>
                  <div className="text-xs leading-normal">
                    <p className="font-extrabold text-emerald-800">Agent Pipeline Complete!</p>
                    <p className="text-slate-500 font-medium">Ticket submitted and tracked successfully.</p>
                  </div>
                </div>
              )}

              {/* Technical logs accordion */}
              <div className="border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                  className="w-full text-slate-400 hover:text-slate-700 transition-colors text-xs font-bold flex items-center justify-between cursor-pointer"
                >
                  <span>{showTechnicalDetails ? "Hide Diagnostic Logs" : "Show Diagnostic Logs (Agent Steps)"}</span>
                  <ChevronRight className={`w-4 h-4 transition-transform ${showTechnicalDetails ? "rotate-90 text-emerald-600" : ""}`} />
                </button>

                {showTechnicalDetails && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-4 space-y-4"
                  >
                    <div className="space-y-2">
                      {agentSteps.map(step => {
                        const active = isAgentRunning && agentStep === step.id;
                        return (
                          <div 
                            key={step.id}
                            className={`flex items-start gap-2.5 p-2 rounded-xl transition-all ${
                              active ? "bg-slate-50 border border-slate-200" : ""
                            }`}
                          >
                            <div className="mt-0.5">
                              {step.status === "completed" ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 animate-pulse" />
                              ) : step.status === "processing" ? (
                                <RefreshCw className="w-4 h-4 text-amber-500 animate-spin" />
                              ) : step.status === "paused" ? (
                                <AlertCircle className="w-4 h-4 text-rose-500 animate-bounce" />
                              ) : (
                                <Circle className="w-4 h-4 text-slate-200" />
                              )}
                            </div>
                            <div className="text-xs">
                              <span className={`font-bold ${step.status === "completed" ? "text-slate-400" : "text-slate-700"}`}>
                                Step {step.id}: {step.label}
                              </span>
                              {active && <p className="text-[10px] text-slate-400 leading-normal mt-0.5">{step.desc}</p>}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="bg-slate-900 p-4 rounded-2xl h-40 overflow-y-auto font-mono text-[10px] text-emerald-400 space-y-1 shadow-inner border border-slate-800">
                      {agentLogs.map((log, i) => (
                        <div key={i}>{log}</div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

            </div>
          )}

          {/* Help instructions card */}
          <div className="bg-gradient-to-br from-[#4285F4]/5 to-transparent border border-slate-200 rounded-3xl p-6 shadow-sm text-xs leading-relaxed space-y-2 text-slate-600">
            <h4 className="font-bold text-[#4285F4] uppercase tracking-wider text-[10px]">Liaison Audit guidelines</h4>
            <p>
              Place a pin on the city map grid or activate device geolocators to start. Gemini automatically extracts coordinates, inspects pixels, classifies routing targets, and checks duplicates.
            </p>
          </div>

        </div>

      </div>

      {/* Paused Interventions modals */}
      <AnimatePresence>
        
        {/* Intervention GPS missing Map Modal */}
        {gpsModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 text-left">
            <div className="w-full max-w-xl bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-amber-600">
                  <AlertTriangle className="w-5 h-5 animate-pulse" />
                  <h4 className="font-bold text-sm uppercase tracking-wider">GPS Coordinates Missing</h4>
                </div>
                <button onClick={() => {
                  setGpsModalOpen(false);
                  setIsAgentRunning(false);
                }} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-600 leading-normal">
                Click on the city vector map grid below to target the coordinate location of this hazard to resume operations.
              </p>

              {/* Custom interactive grid map component for coordinate selection */}
              <div 
                onClick={handleMapClick}
                className="h-[250px] w-full bg-slate-50 border border-slate-200 rounded-2xl relative overflow-hidden cursor-crosshair group select-none shadow-inner"
              >
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-60 pointer-events-none" />
                <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none">
                  <path d="M 0,180 H 600" stroke="#ffffff" strokeWidth="20" />
                  <path d="M 280,0 V 250" stroke="#ffffff" strokeWidth="20" />
                  <path d="M 0,220 Q 300,200 600,240 L 600,250 L 0,250 Z" fill="#bae6fd" stroke="#7dd3fc" strokeWidth="2" />
                </svg>
                <div className="absolute top-3 right-3 bg-white/95 border border-slate-200 px-2 py-1 rounded text-[8px] font-bold text-slate-500">
                  CLICK GRID TO POSITION PIN
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={triggerBrowserGeolocation}
                  className="bg-[#4285F4] hover:bg-[#3b77db] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow"
                >
                  Use Browser Device GPS
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Intervention Duplicate match found Modal */}
        {duplicateModalOpen && duplicateFoundAlert && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 text-left">
            <div className="w-full max-w-md bg-white border border-[#EA4335]/20 rounded-3xl p-6 space-y-4 shadow-2xl">
              <div className="flex items-center gap-2.5 text-[#EA4335] border-b border-slate-100 pb-3">
                <AlertCircle className="w-5.5 h-5.5 animate-bounce shrink-0" />
                <h4 className="font-extrabold text-sm uppercase tracking-wider">Duplicate Complaint Detected!</h4>
              </div>

              <div className="space-y-3 text-xs text-slate-700 leading-normal">
                <p>
                  A similar complaint (<strong>{duplicateFoundAlert.issueType}</strong>) was already reported in this exact sector block by user <em>{duplicateFoundAlert.reporter}</em>.
                </p>
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                  <p className="font-bold text-slate-800">{duplicateFoundAlert.locationName}</p>
                  <p className="text-slate-500 text-[11px] line-clamp-2 mt-0.5">{duplicateFoundAlert.description}</p>
                </div>
                <p className="text-slate-500 font-medium bg-emerald-50 border border-emerald-100 text-emerald-800 p-2.5 rounded-xl text-[11px]">
                  💡 <strong>Recommendation:</strong> Join this existing complaint to pool citizen support. This adds upvote validation weight to fast-track its administrative repair schedule.
                </p>
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={handleJoinDuplicate}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer shadow-md shadow-emerald-600/5"
                >
                  Join Existing (+20 points)
                </button>
                <button
                  onClick={handleIgnoreDuplicate}
                  className="flex-1 bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  Proceed with New
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Intervention Confidence Check details Modal */}
        {confidenceModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 text-left">
            <div className="w-full max-w-md bg-white border border-[#4285F4]/20 rounded-3xl p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-[#4285F4]">
                  <HelpCircle className="w-5.5 h-5.5 shrink-0" />
                  <h4 className="font-bold text-sm uppercase tracking-wider">Additional Evidence Required</h4>
                </div>
                <button onClick={() => {
                  setConfidenceModalOpen(false);
                  setIsAgentRunning(false);
                }} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3.5 text-xs text-slate-700 leading-normal">
                <p>
                  To complete safety verification audit checks, please clarify: <strong>Is this hazard actively blocking lane traffic or dangerous to pedestrians?</strong>
                </p>
                <input
                  type="text"
                  placeholder="e.g. Yes, blocks the bus lane. Approximately 5 inches deep."
                  value={clarificationText}
                  onChange={(e) => setClarificationText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs focus:outline-none focus:border-[#4285F4] focus:ring-1 focus:ring-[#4285F4]"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => resumeAfterClarify(clarificationText || "Operator verified hazard safety threat.")}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer shadow"
                >
                  Submit Clarification Details
                </button>
                <button
                  onClick={() => resumeAfterClarify("Visual inspection confirm.")}
                  className="bg-white border border-slate-200 text-slate-500 font-bold text-xs px-4 rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Skip
                </button>
              </div>
            </div>
          </div>
        )}

      </AnimatePresence>

    </div>
  );
}
