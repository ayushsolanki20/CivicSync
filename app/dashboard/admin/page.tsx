"use client";

import React, { useState } from "react";
import { useApp } from "@/lib/context";
import { 
  ShieldAlert, 
  Trash, 
  Check, 
  X, 
  CornerDownRight, 
  MapPin, 
  Clock, 
  FileText,
  User,
  Camera,
  RefreshCw
} from "lucide-react";

export default function AdminControlPage() {
  const { complaints, updateComplaintStatus, addPoints } = useApp();

  const [selectedComplaint, setSelectedComplaint] = useState<any | null>(null);
  const [reassignDept, setReassignDept] = useState("");
  const [statusVal, setStatusVal] = useState<any>("Submitted");
  const [afterImageInput, setAfterImageInput] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSelectComplaint = (c: any) => {
    setSelectedComplaint(c);
    setReassignDept(c.department);
    setStatusVal(c.status);
    setAfterImageInput(c.afterImage || "https://picsum.photos/seed/fixed/400/300");
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    setSaving(true);
    try {
      await updateComplaintStatus(
        selectedComplaint.id,
        statusVal,
        reassignDept,
        statusVal === "Resolved" ? afterImageInput : undefined
      );

      // Award bonus points to the admin operator for closing the ticket
      addPoints(30);

      // Update local card details
      setSelectedComplaint(prev => ({
        ...prev,
        status: statusVal,
        department: reassignDept,
        afterImage: statusVal === "Resolved" ? afterImageInput : prev.afterImage
      }));

      alert(`Changes saved successfully for Ticket #${selectedComplaint.id}!`);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 text-left relative">
      
      <div className="border-b border-slate-200 pb-3">
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Admin Control Center</h2>
        <p className="text-xs text-slate-500 mt-0.5">Audit reports, update repair timelines, upload validation photos, and re-assign departments.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Complaints audit list */}
        <section className="lg:col-span-6 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center justify-between">
            <span>Audit Queue ({complaints.length})</span>
            <span className="text-[10px] text-slate-400 font-mono font-bold">Authority: ADMIN</span>
          </h4>

          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
            {complaints.map((c) => {
              const active = selectedComplaint?.id === c.id;
              const isResolved = c.status === "Resolved" || c.status === "Closed";
              return (
                <div
                  key={c.id}
                  onClick={() => handleSelectComplaint(c)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer hover:shadow-sm flex flex-col gap-2 relative ${
                    active 
                      ? "bg-slate-50 border-[#4285F4] ring-1 ring-[#4285F4]" 
                      : "bg-white border-slate-200 hover:bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${
                      isResolved
                        ? "bg-slate-100 border-slate-200 text-slate-500"
                        : "bg-emerald-50 border-emerald-100 text-emerald-600"
                    }`}>
                      {c.status}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">#{c.id}</span>
                  </div>

                  <div>
                    <h5 className="text-xs font-bold text-slate-900">{c.issueType}</h5>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">{c.locationName}</p>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100/50 pt-2">
                    <span>Dept: <strong>{c.department}</strong></span>
                    <span>Upvotes: <strong>{c.upvotes}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Right Side: Audit Operations form */}
        <section className="lg:col-span-6 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm text-left">
          {selectedComplaint ? (
            <form onSubmit={handleSaveChanges} className="space-y-4.5">
              
              <div className="flex items-start justify-between border-b border-slate-100 pb-2.5">
                <div>
                  <span className="text-[9px] font-mono text-indigo-600 font-bold uppercase tracking-wider">Administrative Action</span>
                  <h3 className="text-sm font-extrabold text-slate-900 mt-0.5">Audit Ticket #{selectedComplaint.id}</h3>
                </div>
                <button 
                  type="button"
                  onClick={() => setSelectedComplaint(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3.5 text-xs">
                
                {/* Geocoding coordinate */}
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Geocoded Location</p>
                  <p className="text-slate-800 font-semibold mt-0.5">{selectedComplaint.locationName}</p>
                </div>

                {/* Re-assignment of authority */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Administrative Department</label>
                  <select
                    value={reassignDept}
                    onChange={(e) => setReassignDept(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-900 focus:outline-none"
                  >
                    <option value="Public Works Department (PWD)">Public Works Department (PWD)</option>
                    <option value="Delhi Jal Board / Municipal Water Corporation">Delhi Jal Board / Municipal Water Corporation</option>
                    <option value="Municipal Solid Waste Management (MCD)">Municipal Solid Waste Management (MCD)</option>
                    <option value="BSES / State Electricity Board">BSES / State Electricity Board</option>
                    <option value="Traffic Police / Transport Authority">Traffic Police / Transport Authority</option>
                  </select>
                </div>

                {/* Stepper progress status */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Stepping Status</label>
                  <select
                    value={statusVal}
                    onChange={(e) => setStatusVal(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-900 focus:outline-none"
                  >
                    <option value="Submitted">Submitted</option>
                    <option value="Verified">Verified</option>
                    <option value="Assigned">Assigned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved (Fixed)</option>
                    <option value="Closed">Closed (Archived)</option>
                  </select>
                </div>

                {/* Validation "After Image" field if resolved */}
                {statusVal === "Resolved" && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Verification Image URL (After Repair)</label>
                    <div className="relative">
                      <Camera className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={afterImageInput}
                        onChange={(e) => setAfterImageInput(e.target.value)}
                        placeholder="https://picsum.photos/seed/fixed/400/300"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-900 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Button Save */}
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow disabled:opacity-50"
                >
                  {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Save Audit Status changes"}
                </button>

              </div>

            </form>
          ) : (
            <div className="text-center py-20 text-slate-400 flex flex-col items-center justify-center gap-3">
              <ShieldAlert className="w-10 h-10 opacity-30 text-indigo-600 animate-pulse" />
              <h4 className="text-xs font-bold font-mono text-slate-500 uppercase tracking-wider">Administrative Audit Panel</h4>
              <p className="text-xs text-slate-500 leading-relaxed max-w-[200px]">Select any citizen complaint ticket from the left queue to verify records, re-route tasks, or close timeline statuses.</p>
            </div>
          )}
        </section>

      </div>

    </div>
  );
}
