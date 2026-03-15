import { supabase } from './supabase';

export interface Profile {
    id: string;
    email?: string;
    name?: string;
    age?: number;
    weight_kg?: number;
    height_cm?: number;
    gender?: string;
    surgery_history?: string;
    time_since_injury_days?: number;
    has_diagnosis?: boolean;
    diagnosis?: string;
    pain_description?: string;
    pain_level?: number;
    onboarding_completed?: boolean;
}

// Fields the user can edit from the profile screen
export interface ProfileUpdate {
    name?: string;
    age?: number;
    weight_kg?: number;
    height_cm?: number;
    gender?: string;
    surgery_history?: string;
    time_since_injury_days?: number;
    has_diagnosis?: boolean;
    diagnosis?: string;
    pain_description?: string;
    pain_level?: number;
}

// Get a user's profile
export async function getProfile(userId: string): Promise<Profile> {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) throw error;
    return data as Profile;
}

// Update profile fields
export async function updateProfile(userId: string, updates: ProfileUpdate): Promise<Profile> {
    const { data, error } = await supabase
        .from('profiles')
        .update({
            ...updates,
            updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

    if (error) throw error;
    return data as Profile;
}

// Check if user has completed onboarding
export async function hasCompletedOnboarding(userId: string): Promise<boolean> {
    try {
        const { data } = await supabase
            .from('profiles')
            .select('onboarding_completed')
            .eq('id', userId)
            .single();

        return data?.onboarding_completed === true;
    } catch {
        return false;
    }
}