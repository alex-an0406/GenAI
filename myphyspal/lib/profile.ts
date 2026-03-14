import { supabase } from './supabase';

// Profile type definition
export interface Profile {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    age?: number;
    height_cm?: number;
    weight_kg?: number;
    injury_type?: string;
    injury_description?: string;
    time_since_injury?: string;
    pain_level?: number;
    mobility_level?: string;
}

// Create profile after sign up
export async function createProfile(userId: string, email: string) {
    const { data, error } = await supabase
        .from('profiles')
        .insert([{ id: userId, email }]);

    if (error) throw error;
    return data;
}

// Get profile
export async function getProfile(userId: string) {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) throw error;
    return data;
}

// Update profile (for onboarding / settings)
export async function updateProfile(userId: string, updates: Partial<Profile>) {
    const { data, error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', userId);

    if (error) throw error;
    return data;
}