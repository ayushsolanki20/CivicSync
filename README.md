# CivicSync 🏛️

**CivicSync** is an AI-powered civic action portal designed to empower local community members to report, track, verify, and resolve municipal and environmental issues (such as potholes, broken streetlights, water leaks, and open manholes) in collaboration with municipal authorities.

By combining the **Google Gemini API** with local georeferencing and community gamification, CivicSync streamlines community problem-solving and fosters direct civic engagement.

---

## 🚀 Key Features

*   **🤖 AI Report Automation:** Snap a photo/video or upload an image. The **Gemini Vision Audit** processes visual characteristics to classify the issue type, estimates severity, assigns the appropriate municipal department (e.g., PWD, Electricity Dept), and drafts a formal complaint letter in multiple languages (English, Hindi, Spanish, French, Hinglish).
*   **📍 Smart GPS & Maps Integration:** Features an interactive Leaflet map that clusters reported issues. Users can filter reports by department, priority, and progress.
*   **🛑 Duplicate Petition Prevention:** The platform automatically compares coordinates during report submissions. If a similar issue is reported within **150 meters**, the platform alerts the user and suggests supporting the existing petition instead of creating duplicates, focusing the neighborhood's voice.
*   **👥 Community Coalition & Upvoting:** Neighbors can upvote issues, post timeline comments, upload status updates, and verify when repairs are completed.
*   **🏆 Gamification & Badges:** Earn contribution points for helping your city:
    *   **+100 points** for reporting a verified hazard.
    *   **+50 points** for resolving a ticket.
    *   **+20 points** for merging duplicates.
    *   **+10 points** for neighbor upvotes.
    *   Progress from **Civic Novice 🛡️** to **Street Guardian 🛡️**, **Safety Specialist 🔍**, and **City Hero 👑**.

---

## 🛠️ Technology Stack

*   **Framework:** Next.js (App Router)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS & PostCSS
*   **AI Engine:** Google Gemini AI API (`@google/genai`)
*   **Database & Auth:** Firebase Authentication & Firestore Database
*   **Mapping:** Leaflet & React-Leaflet
*   **Animations:** Motion (formerly Framer Motion)

---

## 📦 Getting Started

### Prerequisites

*   [Node.js](https://nodejs.org/) (v18.x or later recommended)
*   [npm](https://www.npmjs.com/) or another package manager

### Installation

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/ayushsolanki20/CivicSync.git
    cd CivicSync
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Setup:**
    Create a `.env.local` file in the root directory (based on `.env.example`) and add your Gemini API Key:
    ```env
    # GEMINI_API_KEY: Required for Gemini AI API calls.
    GEMINI_API_KEY="your-gemini-api-key-here"

    # APP_URL: The URL where this applet is hosted.
    APP_URL="http://localhost:3000"
    ```

### Running Locally

To start the development server, run:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to view the application console.

---

## 🧪 Testing

The repository contains a unit test suite to verify the business logic of distance calculations, reverse geocoding fallback classification, and gamification badge logic.

To run the unit tests:
```bash
node scripts/run-logic-tests.js
```

---

## 🧹 Repository Hygiene

To keep the repository clean and ready for production/GitHub deployment, the following actions have been taken:
*   Added a robust, standard `.gitignore` file that prevents compiled Next.js output (`.next/`, `out/`, `build/`), local credentials (`.env.local`), and dependencies (`node_modules/`) from being tracked in git.
*   Cleaned up unnecessary/unused configurations (e.g. `firebase-applet-config.json` which duplicated config defined in `lib/firebase.ts`).
*   Updated project metadata name configurations (`metadata.json`).
*   Renamed the directory structure to `CivicSync`.
