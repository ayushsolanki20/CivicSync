"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "./firebase";
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  User as FirebaseUser
} from "firebase/auth";
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  getDocs,
  updateDoc, 
  addDoc, 
  onSnapshot, 
  orderBy, 
  query,
  Timestamp,
  increment
} from "firebase/firestore";

interface Comment {
  id: string;
  userName: string;
  userEmail: string;
  text: string;
  createdAt: string;
}

interface Complaint {
  id: string;
  issueType: string;
  severity: number;
  department: string;
  description: string;
  locationName: string;
  lat: number;
  lng: number;
  status: "Submitted" | "Verified" | "Assigned" | "In Progress" | "Resolved" | "Closed";
  upvotes: number;
  reporter: string;
  reporterEmail: string;
  createdAt: string;
  officialLiaisonDraft: {
    dept: string;
    subject: string;
    body: string;
  };
  comments: Comment[];
  beforeImage: string;
  afterImage?: string;
  verificationImage?: string;
  rejectedCount?: number;
  verifiedBy?: string[];
  flaggedBy?: string[];
}

interface NotificationItem {
  id: string;
  text: string;
  time: string;
  read: boolean;
}

interface AppContextType {
  user: any | null;
  authLoading: boolean;
  complaints: Complaint[];
  notifications: NotificationItem[];
  points: number;
  badges: string[];
  theme: "light" | "dark";
  setTheme: (t: "light" | "dark") => void;
  signInWithGoogle: () => Promise<void>;
  signInAsGuest: (email?: string, name?: string) => void;
  logOut: () => Promise<void>;
  addComplaint: (c: Omit<Complaint, "comments" | "upvotes">) => Promise<void>;
  upvoteComplaint: (id: string) => Promise<void>;
  rejectComplaint: (id: string, evidenceImage?: string) => Promise<void>;
  resolveComplaint: (id: string, afterImage?: string) => Promise<void>;
  updateComplaintStatus: (id: string, newStatus: Complaint["status"], reassignDept?: string, afterImage?: string) => Promise<void>;
  addComment: (complaintId: string, text: string) => Promise<void>;
  addNotification: (text: string) => void;
  markNotificationsRead: () => void;
  addPoints: (amount: number) => void;
  googleAuthError: string | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// No seed/fake data — all reports are user-generated
const SEED_COMPLAINTS: Complaint[] = [];

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [points, setPoints] = useState<number>(100);
  const [badges, setBadges] = useState<string[]>(["Civic Novice 🛡️"]);
  const [googleAuthError, setGoogleAuthError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Handle Theme class toggles
  useEffect(() => {
    const savedTheme = localStorage.getItem("civic_sync_theme") as "light" | "dark";
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("civic_sync_theme", theme);
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  // Points gamification rules
  useEffect(() => {
    const savedPoints = localStorage.getItem("civic_sync_points");
    if (savedPoints) {
      setPoints(parseInt(savedPoints));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("civic_sync_points", points.toString());
    
    // Recalculate Badges
    const currentBadges = ["Civic Novice 🛡️"];
    if (points >= 300) currentBadges.push("City Hero 👑", "Safety Specialist 🔍");
    else if (points >= 200) currentBadges.push("Street Guardian 🛡️", "Safety Specialist 🔍");
    else if (points >= 150) currentBadges.push("Street Guardian 🛡️");
    setBadges(currentBadges);
  }, [points]);

  // Auto-create or update user profile in Firestore
  const ensureUserProfile = async (firebaseUser: FirebaseUser) => {
    try {
      const userRef = doc(db, "users", firebaseUser.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          displayName: firebaseUser.displayName || "Civic Citizen",
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL || "",
          joinedAt: new Date().toISOString(),
          totalReports: 0,
          points: 100
        });
      }
    } catch (err) {
      console.warn("Could not create user profile in Firestore:", err);
    }
  };

  // Auth changed listener
  useEffect(() => {
    let unsubscribe = () => {};
    try {
      unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          setUser({
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName || "Civic Citizen",
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL || "",
            isLocal: false
          });
          // Create profile document in Firestore on first sign-in
          await ensureUserProfile(firebaseUser);
        } else {
          setUser(prev => (prev && prev.isLocal ? prev : null));
        }
        setAuthLoading(false);
      });
    } catch (err) {
      console.warn("Firebase Authentication failed to load subscription", err);
      setAuthLoading(false);
    }

    // Safety timeout to trigger local operator default if Firebase auth hangs
    const timer = setTimeout(() => {
      setAuthLoading(false);
    }, 3000);

    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, []); // Mount only

  // Geolocation tracker for active user
  useEffect(() => {
    if (!navigator.geolocation || !user) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        if (user && !user.isLocal) {
          try {
            await updateDoc(doc(db, "users", user.uid), {
              lastKnownLat: lat,
              lastKnownLng: lng
            });
          } catch (e) {
            console.warn("Could not save location to profile:", e);
          }
        }
      },
      (err) => console.warn("GPS watch failed:", err)
    );
  }, [user]);

  // Sync notifications from Firestore in real-time
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    if (user.isLocal) {
      setNotifications([
        { id: "n1", text: "Welcome to Civic Sync! Report civic issues in your city to earn points.", time: "Just now", read: false }
      ]);
      return;
    }

    let unsubscribe = () => {};
    try {
      const q = query(collection(db, "users", user.uid, "notifications"), orderBy("time", "desc"));
      unsubscribe = onSnapshot(q, (snapshot) => {
        const list: NotificationItem[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          list.push({
            id: doc.id,
            text: data.text,
            time: new Date(data.time).toLocaleTimeString(),
            read: data.read || false
          });
        });
        if (list.length === 0) {
          setNotifications([
            { id: "n1", text: "Welcome to Civic Sync! Report civic issues in your city to earn points.", time: "Just now", read: false }
          ]);
        } else {
          setNotifications(list);
        }
      }, (error) => {
        console.warn("Firestore notifications sync failed:", error);
      });
    } catch (e) {
      console.error(e);
    }

    return () => {
      unsubscribe();
    };
  }, [user]);

  // Firestore Sync & Seed logic
  useEffect(() => {
    if (!user) return;

    if (user.isLocal) {
      const local = localStorage.getItem("civic_sync_complaints");
      if (local) {
        setComplaints(JSON.parse(local));
      } else {
        setComplaints(SEED_COMPLAINTS);
        localStorage.setItem("civic_sync_complaints", JSON.stringify(SEED_COMPLAINTS));
      }
      return;
    }

    let unsubscribe = () => {};
    try {
      const q = query(collection(db, "complaints"), orderBy("createdAt", "desc"));
      unsubscribe = onSnapshot(q, (snapshot) => {
        const list: Complaint[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as Complaint);
        });
        setComplaints(list);
      }, (error) => {
        console.warn("Firestore access blocked. Falling back to local storage.", error);
        const local = localStorage.getItem("civic_sync_complaints");
        if (local) {
          setComplaints(JSON.parse(local));
        } else {
          setComplaints(SEED_COMPLAINTS);
        }
      });
    } catch (err) {
      console.error(err);
    }

    return () => {
      unsubscribe();
    };
  }, [user]);

  // Auth Operations
  const signInWithGoogle = async () => {
    setGoogleAuthError(null);
    try {
      const provider = new GoogleAuthProvider();
      // Allow user to choose account every time
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      setUser({
        uid: result.user.uid,
        displayName: result.user.displayName,
        email: result.user.email,
        photoURL: result.user.photoURL,
        isLocal: false
      });
    } catch (err: any) {
      console.error("Google Sign-In error:", err);
      // Show user-friendly error messages instead of silently falling back to guest
      if (err.code === "auth/popup-closed-by-user") {
        setGoogleAuthError("Sign-in popup was closed. Please try again.");
      } else if (err.code === "auth/popup-blocked") {
        setGoogleAuthError("Popup was blocked by your browser. Please allow popups and try again.");
      } else if (err.code === "auth/cancelled-popup-request") {
        // User clicked multiple times, ignore
      } else if (err.code === "auth/unauthorized-domain") {
        setGoogleAuthError("This domain is not authorized for Google sign-in. Add it in Firebase Console.");
      } else {
        setGoogleAuthError(`Sign-in failed: ${err.message || "Unknown error"}. Please try again.`);
      }
    }
  };

  const signInAsGuest = (email?: string, name?: string) => {
    const guestUser = {
      uid: "guest_" + Date.now(),
      displayName: name || "Guest Citizen",
      email: email || "guest.citizen@civicsync.org",
      photoURL: "",
      isLocal: true
    };
    setUser(guestUser);
  };

  const logOut = async () => {
    try {
      if (user && !user.isLocal) {
        await signOut(auth);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUser(null);
      setPoints(100);
    }
  };

  // Helper to calculate distance in meters
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const sendNotificationToUser = async (userId: string, text: string) => {
    try {
      const notifRef = collection(db, "users", userId, "notifications");
      await addDoc(notifRef, {
        text,
        time: new Date().toISOString(),
        read: false
      });
    } catch (err) {
      console.error("Error sending notification:", err);
    }
  };

  // State Modification Operations
  const addComplaint = async (newC: Omit<Complaint, "comments" | "upvotes">) => {
    const fullComplaint: Complaint = {
      ...newC,
      upvotes: 1,
      comments: [],
      verifiedBy: [user?.uid || "unknown"],
      flaggedBy: []
    };

    if (user?.isLocal) {
      const list = [fullComplaint, ...complaints];
      setComplaints(list);
      localStorage.setItem("civic_sync_complaints", JSON.stringify(list));
      addNotification(`Your complaint "${fullComplaint.issueType}" was successfully filed!`);
    } else {
      try {
        await setDoc(doc(db, "complaints", fullComplaint.id), fullComplaint);
        
        // Notify user
        if (user) {
          await sendNotificationToUser(user.uid, `Your complaint "${fullComplaint.issueType}" was successfully filed!`);
        }

        // Notify other nearby users (within 200m)
        try {
          const usersSnapshot = await getDocs(collection(db, "users"));
          usersSnapshot.forEach(async (uDoc) => {
            const uData = uDoc.data();
            if (uDoc.id !== user?.uid && uData.lastKnownLat && uData.lastKnownLng) {
              const dist = calculateDistance(
                fullComplaint.lat,
                fullComplaint.lng,
                uData.lastKnownLat,
                uData.lastKnownLng
              );
              if (dist <= 200) {
                await sendNotificationToUser(uDoc.id, `Alert: A new civic issue "${fullComplaint.issueType}" has been reported within 200 meters of your area!`);
              }
            }
          });
        } catch (e) {
          console.warn("Could not alert nearby users:", e);
        }
      } catch (err) {
        console.warn("Could not save to Firestore, writing to local memory.", err);
        const list = [fullComplaint, ...complaints];
        setComplaints(list);
        localStorage.setItem("civic_sync_complaints", JSON.stringify(list));
      }
    }

    setPoints(prev => prev + 100); // submission points
  };

  const upvoteComplaint = async (id: string) => {
    if (!user) return;
    const userId = user.uid;

    const match = complaints.find(c => c.id === id);
    if (!match) return;

    const verifiedBy = match.verifiedBy || [];
    if (verifiedBy.includes(userId)) {
      alert("You have already verified this complaint!");
      return;
    }

    const updatedVerifiedBy = [...verifiedBy, userId];

    if (user?.isLocal) {
      const list = complaints.map(c => c.id === id ? { ...c, upvotes: c.upvotes + 1, verifiedBy: updatedVerifiedBy } : c);
      setComplaints(list);
      localStorage.setItem("civic_sync_complaints", JSON.stringify(list));
      addNotification(`You upvoted and verified complaint #${id}.`);
    } else {
      try {
        await updateDoc(doc(db, "complaints", id), {
          upvotes: increment(1),
          verifiedBy: updatedVerifiedBy
        });
        await sendNotificationToUser(userId, `You upvoted and verified complaint #${id}.`);
      } catch (err) {
        console.error(err);
      }
    }
    setPoints(prev => prev + 10); // verification contribution points
  };

  const rejectComplaint = async (id: string, evidenceImage?: string) => {
    if (!user) return;
    const userId = user.uid;

    const match = complaints.find(c => c.id === id);
    if (!match) return;

    const flaggedBy = match.flaggedBy || [];
    if (flaggedBy.includes(userId)) {
      alert("You have already flagged this complaint!");
      return;
    }

    const updatedFlaggedBy = [...flaggedBy, userId];
    const updateObj: any = {
      rejectedCount: increment(1),
      flaggedBy: updatedFlaggedBy
    };
    if (evidenceImage) {
      updateObj.verificationImage = evidenceImage;
    }

    if (user?.isLocal) {
      const list = complaints.map(c => c.id === id ? { 
        ...c, 
        rejectedCount: (c.rejectedCount || 0) + 1, 
        flaggedBy: updatedFlaggedBy,
        verificationImage: evidenceImage || c.verificationImage
      } : c);
      setComplaints(list);
      localStorage.setItem("civic_sync_complaints", JSON.stringify(list));
      addNotification(`You flagged complaint #${id} as incorrect.`);
    } else {
      try {
        await updateDoc(doc(db, "complaints", id), updateObj);
        await sendNotificationToUser(userId, `You flagged complaint #${id} as incorrect.`);
      } catch (err) {
        console.error(err);
      }
    }
    setPoints(prev => prev + 10);
  };

  const resolveComplaint = async (id: string, afterImage?: string) => {
    await updateComplaintStatus(id, "Resolved", undefined, afterImage);
  };

  const updateComplaintStatus = async (
    id: string, 
    newStatus: Complaint["status"], 
    reassignDept?: string,
    afterImage?: string
  ) => {
    const updateObj: any = { status: newStatus };
    if (reassignDept) updateObj.department = reassignDept;
    if (afterImage) updateObj.afterImage = afterImage;

    if (user?.isLocal) {
      const list = complaints.map(c => c.id === id ? { ...c, ...updateObj } : c);
      setComplaints(list);
      localStorage.setItem("civic_sync_complaints", JSON.stringify(list));
    } else {
      try {
        await updateDoc(doc(db, "complaints", id), updateObj);
      } catch (err) {
        const list = complaints.map(c => c.id === id ? { ...c, ...updateObj } : c);
        setComplaints(list);
        localStorage.setItem("civic_sync_complaints", JSON.stringify(list));
      }
    }

    if (newStatus === "Resolved") {
      setPoints(prev => prev + 50); // resolving points
    }
    addNotification(`Complaint #${id} status updated to: ${newStatus.toUpperCase()}.`);
  };

  const addComment = async (complaintId: string, text: string) => {
    const newComment: Comment = {
      id: "comment_" + Date.now(),
      userName: user?.displayName || "Anonymous Citizen",
      userEmail: user?.email || "anonymous@citizen.org",
      text,
      createdAt: new Date().toISOString()
    };

    if (user?.isLocal) {
      const list = complaints.map(c => c.id === complaintId ? { ...c, comments: [...c.comments, newComment] } : c);
      setComplaints(list);
      localStorage.setItem("civic_sync_complaints", JSON.stringify(list));
    } else {
      try {
        const docRef = doc(db, "complaints", complaintId);
        const match = complaints.find(c => c.id === complaintId);
        if (match) {
          await updateDoc(docRef, {
            comments: [...match.comments, newComment]
          });
        }
      } catch (err) {
        const list = complaints.map(c => c.id === complaintId ? { ...c, comments: [...c.comments, newComment] } : c);
        setComplaints(list);
        localStorage.setItem("civic_sync_complaints", JSON.stringify(list));
      }
    }
  };

  const addNotification = async (text: string) => {
    if (user && !user.isLocal) {
      await sendNotificationToUser(user.uid, text);
    } else {
      const newItem: NotificationItem = {
        id: "notif_" + Date.now(),
        text,
        time: "Just now",
        read: false
      };
      setNotifications(prev => [newItem, ...prev]);
    }
  };

  const markNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const addPoints = (amount: number) => {
    setPoints(prev => prev + amount);
  };

  return (
    <AppContext.Provider value={{
      user,
      authLoading,
      complaints,
      notifications,
      points,
      badges,
      theme,
      setTheme,
      signInWithGoogle,
      signInAsGuest,
      logOut,
      addComplaint,
      upvoteComplaint,
      rejectComplaint,
      resolveComplaint,
      updateComplaintStatus,
      addComment,
      addNotification,
      markNotificationsRead,
      addPoints,
      googleAuthError
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
