import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { signInWithGoogle } from '../lib/auth';
import { hasCompletedOnboarding } from '../lib/profile';
import { supabase } from '../lib/supabase';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleGoogleSignIn = async () => {
        setLoading(true);
        try {
            const success = await signInWithGoogle();

            if (success) {
                // Get the user
                const { data: { user } } = await supabase.auth.getUser();

                if (user) {
                    // Check if they've already done onboarding
                    const completed = await hasCompletedOnboarding(user.id);

                    if (completed) {
                        router.replace('/(tabs)');
                    } else {
                        router.replace('/onboarding');
                    }
                }
            }
        } catch (error: any) {
            Alert.alert('Sign In Failed', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* App Branding */}
            <View style={styles.brandContainer}>
                <Text style={styles.emoji}>🏥</Text>
                <Text style={styles.title}>MyPhysPal</Text>
                <Text style={styles.subtitle}>
                    Your personalized physiotherapy companion
                </Text>
            </View>

            {/* Sign In Button */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={styles.googleButton}
                    onPress={handleGoogleSignIn}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#333" />
                    ) : (
                        <View style={styles.googleButtonContent}>
                            <Text style={styles.googleIcon}>G</Text>
                            <Text style={styles.googleButtonText}>Sign in with Google</Text>
                        </View>
                    )}
                </TouchableOpacity>

                <Text style={styles.termsText}>
                    By signing in, you agree to our Terms of Service and Privacy Policy
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
        justifyContent: 'space-between',
        padding: 20,
        paddingTop: 100,
        paddingBottom: 60,
    },
    brandContainer: {
        alignItems: 'center',
        gap: 12,
    },
    emoji: {
        fontSize: 80,
    },
    title: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#fff',
    },
    subtitle: {
        fontSize: 16,
        color: '#888',
        textAlign: 'center',
        paddingHorizontal: 40,
        lineHeight: 22,
    },
    buttonContainer: {
        gap: 16,
    },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 18,
    },
    googleButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    googleIcon: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#4285F4',
    },
    googleButtonText: {
        fontSize: 17,
        fontWeight: '600',
        color: '#333',
    },
    termsText: {
        color: '#555',
        fontSize: 12,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
});