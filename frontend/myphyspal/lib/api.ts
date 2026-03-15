// lib/api.ts

import { supabase } from './supabase';

// --- Base URL ---
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000";

// --- Interfaces matching backend Pydantic models ---

export interface UserProfile {
    name: string;
    height_cm: number;
    weight_kg: number;
    age: number;
    gender: string;
    surgery_history: string;
    time_since_injury_days: number;
    has_diagnosis: boolean;
    diagnosis?: string;
    pain_description: string;
    pain_level: number;
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
 * 4. Evaluate exercise form
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
