"use client";

import React, { useState, useEffect, useRef } from "react";
import { useApp } from "@/lib/context";
import { 
  Search, 
  Layers, 
  MapPin, 
  AlertTriangle, 
  X, 
  ThumbsUp, 
  ThumbsDown,
  CheckCircle,
  FileText,
  Navigation,
  Crosshair,
  Upload
} from "lucide-react";

// India center coordinates
const INDIA_CENTER = { lat: 20.5937, lng: 78.9629 };
const DEFAULT_ZOOM = 5;

export default function NearbyIssuesMapPage() {
  const { complaints, upvoteComplaint, rejectComplaint, user } = useApp();

  const [mapFilter, setMapFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("Active");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState<any | null>(null);
  const [userLocation, setUserLocation] = useState<{lat: number; lng: number} | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [flagTargetId, setFlagTargetId] = useState<string | null>(null);
  const [flagProofImage, setFlagProofImage] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const filteredComplaints = complaints.filter(c => {
    const matchesCategory = mapFilter === "All" || c.issueType.toLowerCase().includes(mapFilter.toLowerCase()) || mapFilter.toLowerCase().includes(c.issueType.toLowerCase());
    const matchesStatus = statusFilter === "All" 
      ? true 
      : statusFilter === "Active" 
        ? (c.status !== "Resolved" && c.status !== "Closed")
        : c.status === statusFilter;
    const matchesSearch = !searchQuery || c.locationName.toLowerCase().includes(searchQuery.toLowerCase()) || c.issueType.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {
          // Default to New Delhi if geolocation denied
          setUserLocation({ lat: 28.6139, lng: 77.2090 });
        }
      );
    } else {
      setUserLocation({ lat: 28.6139, lng: 77.2090 });
    }
  }, []);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;

    const initMap = async () => {
      const L = (await import("leaflet")).default;
      
      // Load Leaflet CSS via CDN link tag
      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      const center = userLocation || { lat: 28.6139, lng: 77.2090 };
      
      const map = L.map(mapRef.current!, {
        center: [center.lat, center.lng],
        zoom: userLocation ? 13 : DEFAULT_ZOOM,
        zoomControl: true,
        attributionControl: true,
      });

      // Use OpenStreetMap tiles (free, no API key)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      leafletMapRef.current = map;
      markersLayerRef.current = L.layerGroup().addTo(map);
      setMapLoaded(true);

      // Add user location marker
      if (userLocation) {
        const userIcon = L.divIcon({
          className: "user-location-marker",
          html: `<div style="width:16px;height:16px;background:#4285F4;border:3px solid white;border-radius:50%;box-shadow:0 0 8px rgba(66,133,244,0.6);"></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });
        L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
          .addTo(map)
          .bindPopup("<strong>📍 Your Location</strong>");
      }
    };

    initMap();

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [userLocation]);

  // Update markers when complaints/filters change
  useEffect(() => {
    if (!leafletMapRef.current || !markersLayerRef.current || !mapLoaded) return;

    const loadMarkers = async () => {
      const L = (await import("leaflet")).default;
      markersLayerRef.current.clearLayers();

      filteredComplaints.forEach((c) => {
        const critical = c.severity >= 7;
        const resolved = c.status === "Resolved";

        const markerColor = resolved ? "#94a3b8" : critical ? "#EA4335" : "#FBBC05";
        const markerIcon = L.divIcon({
          className: "complaint-marker",
          html: `<div style="
            width:28px;height:28px;
            background:${markerColor};
            border:3px solid white;
            border-radius:50%;
            box-shadow:0 2px 8px ${markerColor}80;
            display:flex;align-items:center;justify-content:center;
            color:white;font-size:12px;font-weight:bold;
            cursor:pointer;
          ">⚠</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker([c.lat, c.lng], { icon: markerIcon })
          .addTo(markersLayerRef.current);

        marker.bindPopup(`
          <div style="min-width:200px;font-family:system-ui;">
            <h4 style="margin:0 0 4px;font-size:13px;font-weight:700;">${c.issueType}</h4>
            <p style="margin:0 0 4px;font-size:11px;color:#64748b;">${c.locationName}</p>
            <div style="display:flex;gap:8px;font-size:10px;font-weight:600;">
              <span style="color:${critical ? '#EA4335' : '#FBBC05'}">Severity: ${c.severity}/10</span>
              <span style="color:#64748b;">| ${c.status}</span>
            </div>
          </div>
        `);

        marker.on("click", () => {
          setSelectedComplaint(c);
        });
      });
    };

    loadMarkers();
  }, [filteredComplaints, mapLoaded]);

  // Fly to user location
  const flyToUserLocation = () => {
    if (leafletMapRef.current && userLocation) {
      leafletMapRef.current.flyTo([userLocation.lat, userLocation.lng], 15, { duration: 1.5 });
    }
  };

  // Fly to selected complaint
  useEffect(() => {
    if (leafletMapRef.current && selectedComplaint) {
      leafletMapRef.current.flyTo([selectedComplaint.lat, selectedComplaint.lng], 16, { duration: 1 });
    }
  }, [selectedComplaint]);

  return (
    <div className="space-y-6 text-left relative h-[calc(100vh-140px)] flex flex-col">
      
      {/* Map Search & Control Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4 shrink-0">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by area, issue type, or pin code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-xs text-slate-900 focus:outline-none focus:border-[#4285F4] focus:ring-1 focus:ring-[#4285F4]"
              />
            </div>
            <button 
              type="submit" 
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 rounded-xl cursor-pointer"
            >
              Search
            </button>
          </form>

          <div className="flex gap-3 w-full md:w-auto justify-end">
            <button
              onClick={flyToUserLocation}
              className="px-4 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm bg-[#4285F4]/10 border-[#4285F4]/20 text-[#4285F4] hover:bg-[#4285F4]/20"
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span>My Location</span>
            </button>
          </div>
        </div>

        {/* Filter categories buttons row */}
        <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 text-[10px] font-bold text-slate-400">
          <span className="uppercase">Issue Types:</span>
          {["All", "Pothole", "Water", "Garbage", "Wiring", "Streetlight"].map((category) => (
            <button
              key={category}
              onClick={() => setMapFilter(category)}
              className={`px-3 py-1 rounded-lg border transition-all cursor-pointer ${
                mapFilter === category
                  ? "bg-slate-900 border-slate-900 text-white font-extrabold"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {category}
            </button>
          ))}

          <span className="uppercase ml-4">Status:</span>
          {["All", "Active", "Submitted", "Verified", "Assigned", "In Progress", "Resolved"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg border transition-all cursor-pointer ${
                statusFilter === st
                  ? "bg-emerald-600 border-emerald-600 text-white font-extrabold"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Grid container with Map Canvas and details sidebar drawer */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 relative">
        
        {/* Real Map Canvas — Leaflet + OpenStreetMap */}
        <div className="lg:col-span-8 bg-slate-50 border border-slate-200 rounded-3xl relative overflow-hidden select-none min-h-[350px] h-full shadow-inner">
          <div ref={mapRef} className="absolute inset-0 z-0" style={{ borderRadius: "1.5rem" }} />
          
          {/* Map info overlay */}
          <div className="absolute top-4 left-4 bg-white/95 border border-slate-200/80 px-3.5 py-1.5 rounded-xl text-[9px] font-bold text-slate-500 shadow flex items-center gap-2 z-[500]">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
            <span>LIVE MAP // {filteredComplaints.length} {statusFilter === "Active" ? "ACTIVE" : statusFilter.toUpperCase()} REPORTS</span>
          </div>

          {!mapLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-50/80 z-[500]">
              <div className="text-center space-y-3">
                <Navigation className="w-8 h-8 text-[#4285F4] animate-spin mx-auto" />
                <p className="text-xs font-bold text-slate-500">Loading India Map...</p>
              </div>
            </div>
          )}
        </div>

        {/* Map Sidebar details info drawer */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm overflow-y-auto h-full text-left">
          {selectedComplaint ? (
            <div className="space-y-4.5">
              
              <div className="flex items-start justify-between border-b border-slate-100 pb-2.5">
                <div>
                  <span className="text-[9px] font-mono text-emerald-600 font-bold uppercase tracking-wider">Inspect Incident</span>
                  <h4 className="text-sm font-extrabold text-slate-900 mt-0.5">{selectedComplaint.issueType}</h4>
                </div>
                <button 
                  onClick={() => setSelectedComplaint(null)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3.5 text-xs text-slate-700 leading-normal">
                {selectedComplaint.beforeImage && (
                  <div className="h-36 bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-inner">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={selectedComplaint.beforeImage} alt={selectedComplaint.issueType} className="w-full h-full object-cover" />
                  </div>
                )}

                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Geocoded Address</p>
                  <p className="text-slate-800 font-bold mt-0.5">{selectedComplaint.locationName}</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Priority Severity</p>
                    <p className={`text-slate-850 font-bold font-mono text-sm mt-0.5 ${selectedComplaint.severity >= 7 ? "text-rose-600" : "text-amber-600"}`}>
                      {selectedComplaint.severity} / 10
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Audit Status</p>
                    <span className="inline-block mt-0.5 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase text-slate-600">
                      {selectedComplaint.status}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Assigned Authority</p>
                  <p className="text-slate-800 font-semibold mt-0.5">{selectedComplaint.department}</p>
                </div>

                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Details</p>
                  <p className="text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-200 mt-1">
                    {selectedComplaint.description}
                  </p>
                </div>

                {/* GPS Coordinates */}
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">GPS Coordinates</p>
                  <p className="text-slate-800 font-mono text-[11px] mt-0.5">{selectedComplaint.lat.toFixed(5)}°N, {selectedComplaint.lng.toFixed(5)}°E</p>
                </div>

                {/* Operations buttons upvote verify */}
                <div className="flex gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      if (selectedComplaint.verifiedBy?.includes(user?.uid)) {
                        alert("You have already verified this complaint!");
                        return;
                      }
                      upvoteComplaint(selectedComplaint.id);
                    }}
                    disabled={selectedComplaint.verifiedBy?.includes(user?.uid)}
                    className={`flex-1 font-bold text-xs py-2 rounded-xl transition-all cursor-pointer shadow flex items-center justify-center gap-1 ${
                      selectedComplaint.verifiedBy?.includes(user?.uid)
                        ? "bg-emerald-100 border border-emerald-200 text-emerald-700 cursor-not-allowed opacity-80"
                        : "bg-slate-900 hover:bg-slate-800 text-white"
                    }`}
                  >
                    <span>{selectedComplaint.verifiedBy?.includes(user?.uid) ? "Verified by You" : `Verify (${selectedComplaint.upvotes})`}</span>
                  </button>
                  <button
                    onClick={() => {
                      if (selectedComplaint.flaggedBy?.includes(user?.uid)) {
                        alert("You have already flagged this complaint!");
                        return;
                      }
                      setFlagTargetId(selectedComplaint.id);
                    }}
                    disabled={selectedComplaint.flaggedBy?.includes(user?.uid)}
                    className={`font-bold text-xs px-3.5 rounded-xl transition-all cursor-pointer border ${
                      selectedComplaint.flaggedBy?.includes(user?.uid)
                        ? "bg-rose-105 border-rose-200 text-rose-700 cursor-not-allowed opacity-80"
                        : "bg-white border-rose-200 hover:bg-rose-50 text-rose-600"
                    }`}
                  >
                    Flag Fake
                  </button>
                </div>

                {/* Liaison complaint letter draft panel */}
                {selectedComplaint.officialLiaisonDraft && (
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 mt-2 space-y-1">
                    <span className="text-[9px] font-bold text-emerald-800 uppercase tracking-widest flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> Petition Letter</span>
                    <div className="text-[10px] text-slate-500 font-mono whitespace-pre-wrap max-h-32 overflow-y-auto leading-relaxed bg-white p-2 rounded border border-slate-200/50">
                      {selectedComplaint.officialLiaisonDraft.body}
                    </div>
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="text-center py-20 text-slate-400 flex flex-col items-center justify-center gap-3">
              <MapPin className="w-10 h-10 opacity-30 text-[#34A853]" />
              <h4 className="text-xs font-bold font-mono text-slate-500 uppercase tracking-wider">Incident Inspector</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                {complaints.length === 0 
                  ? "No reports yet. Go to \"Report Issue\" to submit your first civic complaint and see it appear on the live map."
                  : "Click any hazard pin on the map to audit its details, photos, and verification drafts."
                }
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Flag Fake Proof Upload Modal */}
      {flagTargetId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-6 text-left">
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
                className="text-slate-405 hover:text-slate-600"
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
