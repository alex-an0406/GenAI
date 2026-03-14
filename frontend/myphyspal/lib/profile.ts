import { supabase } from './supabase';

export interface Profile {
    id: string;
    email?: string;
    name?: string;
    age?: number;
    weight_kg?: number;
    height_cm?: number;
    has_diagnosis?: boolean;
    diagnosis?: string;
    pain_description?: string;
    pain_level?: number;
    onboarding_completed?: boolean;
}

// Create empty profile after sign in
export async function createProfile(userId: string, email: string) {
    // First check if profile already exists
    const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();

    // Only create if it doesn't exist
    if (!existing) {
        const { data, error } = await supabase
            .from('profiles')
            .insert([{ id: userId, email }]);

        if (error) throw error;
        return data;
    }

    return existing;
}

// Get a user's profile
export async function getProfile(userId: string) {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) throw error;
    return data as Profile;
}

// Save onboarding data
export async function saveOnboardingData(
    userId: string,
    onboardingData: {
        name: string;
        age: string;
        weight: string;
        height: string;
        hasDiagnosis: boolean;
        diagnosis: string;
        painDescription: string;
        painLevel: number;
    }
) {
    const { data, error } = await supabase
        .from('profiles')
        .update({
            name: onboardingData.name,
            age: parseInt(onboardingData.age) || null,
            weight_kg: parseFloat(onboardingData.weight) || null,
            height_cm: parseFloat(onboardingData.height) || null,
            has_diagnosis: onboardingData.hasDiagnosis,
            diagnosis: onboardingData.diagnosis || null,
            pain_description: onboardingData.painDescription || null,
            pain_level: onboardingData.painLevel,
            onboarding_completed: true,
            updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

    if (error) throw error;
    return data;
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