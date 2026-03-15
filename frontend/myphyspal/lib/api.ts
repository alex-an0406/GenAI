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
 * 4. Evaluate exercise form (live feedback, no DB calls)
 * POST /api/evaluate-form
 *
 * Usage:
 *   const formFeedback = await evaluateForm("user-uuid", "Knee Extension", [85.5, 90.2]);
 */
export const evaluateForm = async (
    userId: string,
    exercise: string,
    angles: number[]
): Promise<FormEvaluationResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/evaluate-form`, {
        method: "POST",
        headers: await getHeaders(),
        body: JSON.stringify({
            user_id: userId,
            exercise: exercise,
            angles: angles,
        }),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Failed to evaluate form: ${response.status} - ${errorBody}`);
    }

    return response.json();
};