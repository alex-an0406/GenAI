import { supabase } from './supabase';
import { makeRedirectUri } from 'expo-auth-session';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import * as WebBrowser from 'expo-web-browser';
import { createProfile } from './profile';

WebBrowser.maybeCompleteAuthSession();

const redirectTo = makeRedirectUri();

// Google Sign In
export async function signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo,
            skipBrowserRedirect: true,
        },
    });

    if (error) throw error;

    // Open the browser for Google sign in
    const res = await WebBrowser.openAuthSessionAsync(
        data?.url ?? '',
        redirectTo
    );

    if (res.type === 'success') {
        const { url } = res;
        await createSessionFromUrl(url);
    }
}

// Create session from the redirect URL
async function createSessionFromUrl(url: string) {
    const { params, errorCode } = QueryParams.getQueryParams(url);

    if (errorCode) throw new Error(errorCode);

    const { access_token, refresh_token } = params;

    if (!access_token) return;

    const { data, error } = await supabase.auth.setSession({
        access_token,
        refresh_token,
    });

    if (error) throw error;

    // If this is a new user, create their profile
    if (data.user) {
        await handleNewUser(data.user);
    }

    return data.session;
}

// Check if user is new and create profile
async function handleNewUser(user: any) {
    const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

    // If no profile exists, create one
    if (!existingProfile) {
        await createProfile(user.id, user.email ?? '');
    }
}

// Sign Out
export async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
}

// Get Current User
export async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

// Listen for auth state changes
export function onAuthStateChange(callback: (session: any) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => {
        callback(session);
    });
}