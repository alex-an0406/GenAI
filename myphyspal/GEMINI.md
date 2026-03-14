# Project Context: AI Physical Therapy & Workout App

## Project Overview
A mobile application designed to act as a digital physical therapist. It generates customized workout and rehabilitation plans based on user-inputted pain/diagnoses, schedules them, and guides the user through the exercises in real-time using on-device computer vision and audio feedback.

## Core Features
1. **AI-Generated Rehabilitation Plans:** Users input specific diagnoses or general pain descriptions. The system uses an LLM to generate a safe, specialized exercise routine.
2. **Adaptive Scheduling:** The app creates a calendar detailing exercises, reps, and intensity. It dynamically adjusts the program over time based on user progression and feedback (RPE and pain scales).
3. **Live Computer Vision Coaching:** Uses the device's camera to calibrate to the user's body, tracks joint movements in 3D space, and provides zero-latency Text-to-Speech (TTS) audio cues to correct posture and guide hold times.

## Developer Context
* **Existing Stack Familiarity:** The developer has prior experience implementing MediaPipe pipelines in Python for tracking applications (specifically hand/gesture tracking). This foundational knowledge of landmark extraction will be leveraged to accelerate the development of the more complex MediaPipe Pose estimation module.
* **Instructional Preference:** All mathematical and physics-based algorithms (such as joint angle calculations) require explicit, step-by-step derivations detailing every component of the equation so the logic is perfectly clear.

## Proposed Tech Stack
* **Frontend/Mobile UI:** React Native (or Flutter) for fast rendering and deep camera access (e.g., `react-native-vision-camera`).
* **Backend & API:** Python (FastAPI) for lightweight, high-performance asynchronous request handling.
* **AI Generation:** LLM API (Gemini Pro or OpenAI) utilizing **Structured Outputs (JSON mode)** to guarantee parsable schedule data.
* **Computer Vision (On-Device):** MediaPipe Pose for extracting 33 3D body landmarks with minimal latency.
* **Audio Guidance:** Native Mobile TTS (iOS `AVSpeechSynthesizer` / Android `TextToSpeech`) for immediate, zero-latency feedback.
* **Database:** PostgreSQL (via Supabase) or Firebase for storing user profiles, historical pain logs, and evolving JSON workout calendars.

## Implementation Roadmap

### Phase 1: AI Generation & Data Pipeline
* Define the rigid JSON schema for the workout plan (Days, Exercises, Reps, Sets, Baseline Intensity).
* Build the FastAPI backend to intake user data and prompt the LLM safely.
* Develop the React Native frontend calendar to parse and display the JSON checklist.

### Phase 2: Computer Vision & Vector Mathematics
* Configure the on-device camera stream and integrate MediaPipe Pose to extract X, Y, and Z joint coordinates.
* **Mathematical Implementation for Joint Angles:** To determine if a user is holding a pose correctly, the app must calculate the angle $\theta$ between three intersecting joints (e.g., Hip $H$, Knee $K$, and Ankle $A$, where the Knee is the vertex).
    1.  **Define the Vectors:** Create two 3D vectors originating from the vertex joint (Knee $K$).
        * Vector 1 (Knee to Hip): $\vec{V_1} = (H_x - K_x, H_y - K_y, H_z - K_z)$
        * Vector 2 (Knee to Ankle): $\vec{V_2} = (A_x - K_x, A_y - K_y, A_z - K_z)$
    2.  **Calculate the Dot Product:** Multiply corresponding components and sum them.
        * $\vec{V_1} \cdot \vec{V_2} = (V_{1x} \cdot V_{2x}) + (V_{1y} \cdot V_{2y}) + (V_{1z} \cdot V_{2z})$
    3.  **Calculate Vector Magnitudes:** Find the length of each vector using the 3D Pythagorean theorem.
        * $|\vec{V_1}| = \sqrt{V_{1x}^2 + V_{1y}^2 + V_{1z}^2}$
        * $|\vec{V_2}| = \sqrt{V_{2x}^2 + V_{2y}^2 + V_{2z}^2}$
    4.  **Solve for the Angle:** Use the geometric definition of the dot product ($\vec{V_1} \cdot \vec{V_2} = |\vec{V_1}| |\vec{V_2}| \cos(\theta)$) and isolate $\theta$.
        * $$\theta = \arccos\left(\frac{\vec{V_1} \cdot \vec{V_2}}{|\vec{V_1}| |\vec{V_2}|}\right)$$
    *This exact mathematical process must be calculated per frame for the targeted joints to evaluate form.*

### Phase 3: Live Coach Logic (State Machines)
* Define individual exercises as a sequence of states (e.g., State 0: Setup, State 1: Concentric, State 2: Hold, State 3: Eccentric).
* Build the real-time feedback loop: Compare the live calculated $\theta$ against the target angle for the current state.
* Trigger native TTS based on angle deviations (e.g., "Straighten your back") or state completion ("Hold there").

### Phase 4: Adaptive Loop
* Build the post-workout survey UI to capture the Rate of Perceived Exertion (RPE) and pain scale changes.
* Send completion metrics (reps completed vs. assigned) and survey data back to the FastAPI backend.
* Prompt the LLM to recalibrate the JSON schedule for the following week based on this performance data.