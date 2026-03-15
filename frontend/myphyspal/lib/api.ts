// lib/api.ts

import { supabase } from './supabase';

// --- Base URL ---
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "https://fizio-ownu.onrender.com";

// --- Interfaces matching backend Pydantic models ---

export interface UserProfile {
    height_cm: number;
    weight_kg: number;
    age: number;
    gender: string;
    surgery_history: string;
    time_since_injury_days: number;
}

export interface Feedback {
    ease_score: number;
    weekly_soreness_score: number;
    completed_exercises: string[];
}

export interface Exercise {
    name: string;
    intensity: string;
    target_reps: number;
    target_sets: number;
}

export interface PlanData {
    momentum_score: number;
    weekly_soreness_score: number;
    exercises: Exercise[];
    profile_snapshot: UserProfile;
}

export interface PlanResponse {
    plan_id: string;
    status: string;
    plan_data: PlanData;
}

export interface MetricsResponse {
    status: string;
    plans_updated: string[];
}

export interface FormEvaluationResponse {
    feedback_text: string;
    is_rep_valid: boolean;
}

// --- Auth Helper ---

/**
 * Grabs the current Supabase JWT access token from the active session.
 * Returns undefined if no session exists.
 */
const getToken = async (): Promise<string | undefined> => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token;
};

/**
 * Builds request headers with Content-Type and optional Bearer token.
 */
const getHeaders = async (): Promise<HeadersInit> => {
    const token = await getToken();
    const headers: HeadersInit = {
        "Content-Type": "application/json",
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
};

// --- API Methods ---

/**
 * 1. Generate a new exercise plan
 * POST /api/plans/generate
 *
 * Usage:
 *   const plan = await generatePlan("user-uuid", { height_cm: 180, weight_kg: 75, ... });
 */
export const generatePlan = async (userId: string, profile: UserProfile): Promise<PlanResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/plans/generate`, {
        method: "POST",
        headers: await getHeaders(),
        body: JSON.stringify({
            user_id: userId,
            profile: profile,
        }),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Failed to generate plan: ${response.status} - ${errorBody}`);
    }

    return response.json();
};

/**
 * 2. Fetch an existing plan
 * GET /api/plans/{plan_id}?user_id={user_id}
 *
 * Usage:
 *   const planData = await getPlan("plan-uuid", "user-uuid");
 */
export const getPlan = async (planId: string, userId: string): Promise<PlanData> => {
    const response = await fetch(
        `${API_BASE_URL}/api/plans/${planId}?user_id=${userId}`,
        {
            method: "GET",
            headers: await getHeaders(),
        }
    );

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Failed to fetch plan: ${response.status} - ${errorBody}`);
    }

    return response.json();
};

/**
 * 3. Submit workout feedback / metrics
 * POST /api/metrics
 *
 * Usage:
 *   const result = await submitMetrics("user-uuid", "plan-uuid", {
 *     ease_score: 7,
 *     weekly_soreness_score: 3,
 *     completed_exercises: ["Knee Extension", "Straight Leg Raise"]
 *   });
 */
export const submitMetrics = async (
    userId: string,
    planId: string,
    feedback: Feedback
): Promise<MetricsResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/metrics`, {
        method: "POST",
        headers: await getHeaders(),
        body: JSON.stringify({
            user_id: userId,
            plan_id: planId,
            feedback: feedback,
        }),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Failed to submit metrics: ${response.status} - ${errorBody}`);
    }

    return response.json();
};

/**
 * 4. WebSocket management for real-time form evaluation
 * Path: ws://[API_BASE_URL]/ws/evaluate-form
 * 
 * Usage:
 *   const poseWS = new PoseWebSocket();
 *   poseWS.connect();
 *   poseWS.onMessage((feedback) => console.log(feedback));
 *   poseWS.sendFrame("user-uuid", "Knee Extension", "base64-data");
 */
export class PoseWebSocket {
    private socket: WebSocket | null = null;
    private baseUrl: string;

    constructor() {
        // Convert HTTP/HTTPS URL to WS/WSS
        this.baseUrl = API_BASE_URL.replace(/^http/, 'ws');
    }

    /**
     * Opens the persistent connection to the AI pose engine
     */
    connect() {
        if (this.socket) return;
        this.socket = new WebSocket(`${this.baseUrl}/ws/evaluate-form`);
        
        this.socket.onopen = () => console.log('📡 Connected to AI Pose Engine');
        this.socket.onerror = (e) => console.error('❌ WebSocket Error:', e);
        this.socket.onclose = () => {
            console.log('🔌 Disconnected from AI Pose Engine');
            this.socket = null;
        };
    }

    /**
     * Streams a base64 encoded image frame to the server
     */
    sendFrame(userId: string, exercise: string, base64Frame: string) {
        if (this.socket?.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({
                user_id: userId,
                exercise: exercise,
                frame_data: base64Frame
            }));
        }
    }

    /**
     * Registers a callback to handle real-time feedback messages
     */
    onMessage(callback: (feedback: FormEvaluationResponse) => void) {
        if (this.socket) {
            this.socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    callback(data);
                } catch (e) {
                    console.error("Failed to parse WebSocket message", e);
                }
            };
        }
    }

    /**
     * Gracefully closes the connection
     */
    disconnect() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
    }
}