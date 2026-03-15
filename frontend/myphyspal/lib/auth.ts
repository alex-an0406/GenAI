import { supabase } from './supabase';
import { makeRedirectUri } from 'expo-auth-session';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import * as WebBrowser from 'expo-web-browser';
//import { createProfile } from './profile';

WebBrowser.maybeCompleteAuthSession();

const redirectTo = makeRedirectUri({
    scheme: 'myapp',
    path: 'google-auth',
});

// Sign in with Google
export async function signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo,
            skipBrowserRedirect: true,
        },
    });

    if (error) throw error;

    // Open browser for Google sign in
    const res = await WebBrowser.openAuthSessionAsync(
        data?.url ?? '',
        redirectTo
    );

    if (res.type === 'success') {
        const { url } = res;
        await createSessionFromUrl(url);
        return true;
    }

    return false;
}

// Extract tokens from URL and create session
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

    // Create profile for new users
    //if (data.user) {
      //  await createProfile(data.user.id, data.user.email ?? '');
    //}

    return data.session;
}

// Sign out
export async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
}

// Get current user
export async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}