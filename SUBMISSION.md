# CivicSync - Project Submission Document
*Vibe2Ship Hackathon Project Submission Details*

---

## 1. Problem Statement Selected
**Problem Statement:** Community Hero - Hyperlocal Problem Solver

**Background & Challenge addressed:**
In our cities, local issues like potholes, water leakages, broken streetlights, and garbage dumps frequently disrupt community life. Traditional methods of reporting these issues are fragmented, lack transparency, and make progress tracking difficult. 

**CivicSync** was built to solve this exact challenge by creating a unified civic action portal where citizens can report, validate, track, and resolve community issues using intelligent AI automation, community collaboration, and interactive mapping.

---

## 2. Solution Overview
**CivicSync** is an AI-powered, georeferenced civic action portal. It acts as an autonomous community coordinator by turning citizens into "Street Guardians." 

When a citizen uploads an image of a local hazard:
1.  **AI Multimodal Vision Audit:** Google Gemini 2.5 Flash analyzes the image to verify the hazard type, assess severity, categorize it, and draft a formal municipal petition letter in the user's local language.
2.  **Autonomous Local Dispatch Routing:** The agent dynamically looks up the nearest real-world municipal zone/ward office, telephone, and support email based on the coordinates of the issue, and provides a Google Maps direction link.
3.  **Community Hub & Upvoting:** The issue is mapped using Leaflet markers. To prevent duplicate reports, the system automatically checks for existing reports within **150 meters** and prompts users to upvote/merge their concerns, consolidating community voice.
4.  **Gamification:** Active engagement is incentivized by awarding points and ranks for verified reports, duplicates merged, and repairs validated.

---

## 3. Key Features
Our solution directly implements the core features of the challenge:

*   **📸 Image-Based Reporting & AI Vision Audit:** Multimodal computer vision verification of local hazards, estimating severity (1-10) and repair times (e.g., 24-48 hours, 3-5 days).
*   **🤖 AI-Powered Categorization & Routing:** Automatically routes issues to the correct municipal division (Public Works Department (PWD), Water Corporation, Solid Waste Management, or State Electricity Board).
*   **📍 Geo-location & Mapping (Leaflet Map):** Real-time mapping showing clusters of local safety alerts.
*   **👥 Community Verification & Upvoting:** Neighbors can upvote issues, post timeline update comments, and confirm when repairs are completed.
*   **💬 Real-Time Tracking & Petition Generation:** Generates professional, multi-language (English, Hindi, Hinglish, Spanish, etc.) petition drafts with an "Open Email Client" button.
*   **📊 Impact Dashboard:** Aggregates neighborhood-wide metrics including total reported issues, resolved issues, resolution rate (%), and average severity index.
*   **🔮 Predictive Insights (AI-Driven Dispatch):** Dynamically calls Gemini to look up the exact, nearest physical municipal ward office and local support email on-the-fly for any location.
*   **🏆 Gamification for Citizen Engagement:** Points (+100 for verified report, +50 for repair confirmation) and rank progression (Civic Novice 🛡️, Street Guardian 🛡️, Safety Specialist 🔍, and City Hero 👑).

---

## 4. Technologies Used
*   **Frontend Framework:** Next.js 15 (App Router, React 19)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS, PostCSS
*   **Animations:** Motion (Framer Motion)
*   **Maps Engine:** Leaflet & React-Leaflet
*   **Database & Auth:** Firebase Authentication & Firestore Database

---

## 5. Google Technologies Utilized
*   **Google AI Studio (Gemini 2.5 Flash):** Handles all visual hazard inspections, severity assessments, multilingual letter generation, and real-time municipal office and contact email lookup.
*   **Google Maps:** Provides pre-filled navigation routing to the nearest municipal offices.
*   **Google Cloud SDK / Cloud Run (Deployment Ready):** Features a pre-configured Docker build pipeline (`Dockerfile` & `.dockerignore`) configured to run standalone on Google Cloud Run serverless hosting on port 8080.
