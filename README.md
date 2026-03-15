# Fizzio: Smart Physical Therapy Assistant

Fizzio is a digital physical therapy platform that bridges the gap between clinical guidance and at-home exercise. By combining on-device computer vision with agentic AI, Fizzio provides real-time posture correction and dynamic workout scheduling that adapts to your recovery progress.

## Core Features

### 1. Real-Time Pose Feedback
Fizzio uses on-device computer vision to track 33 3D body landmarks. The app calculates precise joint angles (e.g., knee extension, hip flexion) to ensure exercises are performed safely. 
* **Live Coaching:** Receive immediate audio and visual cues to correct your form.

### 2. Agentic AI Workout Planning
Unlike static exercise templates, Fizzio employs an agentic AI approach to rehabilitation. 
* **Personalized Generation:** Initial plans are generated based on specific pain descriptions or clinical diagnoses.
* **Autonomous Adjustments:** The AI agent analyzes your performance (reps completed, hold times) and subjective feedback (pain scales and difficulty) to modify the intensity, volume, or exercise selection for subsequent sessions.
* **Structured Recovery:** Ensures you are challenged enough to progress without risking re-injury.

### 3. Progress Tracking & Insights
Monitor your recovery journey through detailed analytics.
* **Mobility Trends:** Track improvements in joint range of motion over time.
* **Consistency Logs:** View your adherence to the prescribed rehabilitation schedule.
* **Pain Mapping:** Correlate exercise consistency with reported pain levels to see tangible recovery results.

---

## Technical Stack

* **Frontend:** React Native (Expo) with TypeScript
* **Backend:** Python (FastAPI)
* **Computer Vision:** MediaPipe Pose
* **Database & Auth:** Supabase (PostgreSQL)
* **State Management:** Zustand
* **AI Orchestration:** Gemini Pro / OpenAI (via Structured Outputs)

---

## Getting Started

### Prerequisites
* Node.js (v18+)
* Python 3.10+
* Expo Go app on your mobile device (for testing camera features)
* Supabase Account

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure environment variables in a `.env` file:
   ```env
   SUPABASE_URL=your_project_url
   SUPABASE_KEY=your_service_role_key
   OPENAI_API_KEY=your_key  # or GEMINI_API_KEY
   ```
5. Start the server:
   ```bash
   uvicorn main:app --reload
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend/myphyspal
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure your API endpoint:
   Create a `.env` file in the `myphyspal` directory and add your backend URL and Supabase credentials.
4. Start the Expo development server:
   ```bash
   npx expo start
   ```

---

## Project Structure

```text
├── backend/
│   ├── main.py              # FastAPI entry point
│   ├── supabase_client.py   # Database integration
│   └── requirements.txt     # Python dependencies
└── frontend/myphyspal/
    ├── app/                 # Expo Router file-based navigation
    ├── components/          # Reusable UI components (Camera, UI, Survey)
    ├── hooks/               # Custom React hooks (Theming, Auth)
    ├── lib/                 # Shared logic (API, Supabase, Profiles)
    └── store/               # Zustand state management
```

## Architecture: The Agentic Loop
Fizzio operates on a feedback loop that treats the workout plan as a living document. After every session, the backend triggers an analysis step where the AI agent evaluates the session's "Success Score." If the user reports high pain but high completion, the agent may down-regulate intensity. Conversely, if completion is high with low RPE, the agent autonomously increases the challenge for the next session, ensuring the plan remains optimal for recovery.
