import React, { useState, useEffect, useRef } from 'react';
import {
    StyleSheet,
    TextInput,
    ScrollView,
    TouchableOpacity,
    View,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Modal,
    FlatList,
} from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { supabase } from '@/lib/supabase';
import { getProfile, updateProfile, Profile } from '@/lib/profile';

const GENDER_OPTIONS = ['Male', 'Female', 'Other'];

export default function ProfileScreen() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [showGenderPicker, setShowGenderPicker] = useState(false);
    const [genderLayout, setGenderLayout] = useState({ top: 0, left: 0, width: 0 });
    const genderRef = useRef<React.ElementRef<typeof TouchableOpacity>>(null);

    // Editable form state
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        weight_kg: '',
        height_cm: '',
        gender: 'Other',
        surgery_history: '',
        time_since_injury_days: '',
        diagnosis: '',
        pain_description: '',
        pain_level: 5,
    });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.replace('/login');
                return;
            }

            const profileData = await getProfile(user.id);
            setProfile(profileData);

            // Populate form with existing data
            setFormData({
                name: profileData.name || '',
                age: profileData.age?.toString() || '',
                weight_kg: profileData.weight_kg?.toString() || '',
                height_cm: profileData.height_cm?.toString() || '',
                gender: profileData.gender || 'Other',
                surgery_history: profileData.surgery_history || '',
                time_since_injury_days: profileData.time_since_injury_days?.toString() || '',
                diagnosis: profileData.diagnosis || '',
                pain_description: profileData.pain_description || '',
                pain_level: profileData.pain_level || 5,
            });
        } catch (error) {
            console.error('Error loading profile:', error);
            Alert.alert('Error', 'Failed to load your profile.');
        } finally {
            setLoading(false);
        }
    };

    const openGenderPicker = () => {
        genderRef.current?.measure(
            (x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
                setGenderLayout({
                    top: pageY + height,
                    left: pageX,
                    width: width,
                });
                setShowGenderPicker(true);
            }
        );
    };

    const handleSave = async () => {
        if (!profile) return;

        setSaving(true);
        try {
            await updateProfile(profile.id, {
                name: formData.name || undefined,
                age: formData.age ? parseInt(formData.age) : undefined,
                weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : undefined,
                height_cm: formData.height_cm ? parseFloat(formData.height_cm) : undefined,
                gender: formData.gender,
                surgery_history: formData.surgery_history || undefined,
                time_since_injury_days: formData.time_since_injury_days
                    ? parseInt(formData.time_since_injury_days)
                    : undefined,
                diagnosis: formData.diagnosis || undefined,
                pain_description: formData.pain_description || undefined,
                pain_level: formData.pain_level,
            });

            Alert.alert('Success', 'Your profile has been updated!');
        } catch (error) {
            console.error('Error saving profile:', error);
            Alert.alert('Error', 'Failed to save your profile. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        Alert.alert('Log Out', 'Are you sure you want to log out?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Log Out',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await supabase.auth.signOut();
                        router.replace('/login');
                    } catch (error) {
                        console.error('Error signing out:', error);
                        Alert.alert('Error', 'Failed to sign out.');
                    }
                },
            },
        ]);
    };

    if (loading) {
        return (
            <ThemedView style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color="#007AFF" />
                <ThemedText style={{ marginTop: 10 }}>Loading profile...</ThemedText>
            </ThemedView>
        );
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                keyboardShouldPersistTaps="handled"
            >
                <ThemedView style={styles.formContent}>
                    <ThemedText type="title">My Profile</ThemedText>
                    <ThemedText style={styles.subtitle}>
                        Update your details below. Changes are saved to your account.
                    </ThemedText>

                    {/* Name */}
                    <ThemedView style={styles.inputGroup}>
                        <ThemedText type="defaultSemiBold">Name</ThemedText>
                        <TextInput
                            style={styles.input}
                            placeholder="Your name"
                            placeholderTextColor="#888"
                            value={formData.name}
                            onChangeText={(t) => setFormData({ ...formData, name: t })}
                        />
                    </ThemedView>

                    {/* Age + Weight row */}
                    <View style={styles.row}>
                        <ThemedView style={[styles.inputGroup, { flex: 1 }]}>
                            <ThemedText type="defaultSemiBold">Age</ThemedText>
                            <TextInput
                                style={styles.input}
                                keyboardType="numeric"
                                placeholder="30"
                                placeholderTextColor="#888"
                                value={formData.age}
                                onChangeText={(t) => setFormData({ ...formData, age: t })}
                            />
                        </ThemedView>
                        <ThemedView style={[styles.inputGroup, { flex: 1 }]}>
                            <ThemedText type="defaultSemiBold">Weight (kg)</ThemedText>
                            <TextInput
                                style={styles.input}
                                keyboardType="numeric"
                                placeholder="75"
                                placeholderTextColor="#888"
                                value={formData.weight_kg}
                                onChangeText={(t) => setFormData({ ...formData, weight_kg: t })}
                            />
                        </ThemedView>
                    </View>

                    {/* Height + Gender row */}
                    <View style={styles.row}>
                        <ThemedView style={[styles.inputGroup, { flex: 1 }]}>
                            <ThemedText type="defaultSemiBold">Height (cm)</ThemedText>
                            <TextInput
                                style={styles.input}
                                keyboardType="numeric"
                                placeholder="180"
                                placeholderTextColor="#888"
                                value={formData.height_cm}
                                onChangeText={(t) => setFormData({ ...formData, height_cm: t })}
                            />
                        </ThemedView>
                        <ThemedView style={[styles.inputGroup, { flex: 1 }]}>
                            <ThemedText type="defaultSemiBold">Gender</ThemedText>
                            <TouchableOpacity
                                ref={genderRef}
                                style={styles.dropdownTrigger}
                                onPress={openGenderPicker}
                            >
                                <ThemedText style={styles.dropdownText}>{formData.gender}</ThemedText>
                                <IconSymbol size={16} name="chevron.down" color="#888" />
                            </TouchableOpacity>
                        </ThemedView>
                    </View>

                    {/* Surgery History */}
                    <ThemedView style={styles.inputGroup}>
                        <ThemedText type="defaultSemiBold">Surgery History</ThemedText>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. ACL reconstruction 2022, None"
                            placeholderTextColor="#888"
                            value={formData.surgery_history}
                            onChangeText={(t) => setFormData({ ...formData, surgery_history: t })}
                        />
                    </ThemedView>

                    {/* Days Since Injury */}
                    <ThemedView style={styles.inputGroup}>
                        <ThemedText type="defaultSemiBold">Days Since Injury</ThemedText>
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            placeholder="e.g. 14"
                            placeholderTextColor="#888"
                            value={formData.time_since_injury_days}
                            onChangeText={(t) =>
                                setFormData({ ...formData, time_since_injury_days: t })
                            }
                        />
                    </ThemedView>

                    {/* Diagnosis */}
                    <ThemedView style={styles.inputGroup}>
                        <ThemedText type="defaultSemiBold">Diagnosis</ThemedText>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Meniscus Tear, Tennis Elbow"
                            placeholderTextColor="#888"
                            value={formData.diagnosis}
                            onChangeText={(t) => setFormData({ ...formData, diagnosis: t })}
                        />
                    </ThemedView>

                    {/* Pain Description */}
                    <ThemedView style={styles.inputGroup}>
                        <ThemedText type="defaultSemiBold">Pain Description</ThemedText>
                        <TextInput
                            style={[styles.input, { height: 80 }]}
                            placeholder="Describe where and how it hurts"
                            placeholderTextColor="#888"
                            multiline
                            value={formData.pain_description}
                            onChangeText={(t) => setFormData({ ...formData, pain_description: t })}
                        />
                    </ThemedView>

                    {/* Pain Level */}
                    <ThemedView style={styles.inputGroup}>
                        <ThemedText type="defaultSemiBold">
                            Current Pain Level: {formData.pain_level}/10
                        </ThemedText>
                        <View style={styles.painSelector}>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                                <TouchableOpacity
                                    key={level}
                                    style={[
                                        styles.painCircle,
                                        formData.pain_level === level && styles.selectedPainCircle,
                                        {
                                            backgroundColor: getPainColor(
                                                level,
                                                formData.pain_level === level
                                            ),
                                        },
                                    ]}
                                    onPress={() => setFormData({ ...formData, pain_level: level })}
                                >
                                    <ThemedText style={styles.painText}>{level}</ThemedText>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ThemedView>

                    {/* Save Button */}
                    <TouchableOpacity
                        style={[styles.saveButton, saving && { opacity: 0.6 }]}
                        onPress={handleSave}
                        disabled={saving}
                    >
                        <ThemedText style={styles.saveButtonText}>
                            {saving ? 'Saving...' : 'Save Changes'}
                        </ThemedText>
                    </TouchableOpacity>

                    {/* Logout Button */}
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <IconSymbol size={20} name="rectangle.portrait.and.arrow.right" color="#FF3B30" />
                        <ThemedText style={styles.logoutText}>Log Out</ThemedText>
                    </TouchableOpacity>
                </ThemedView>
            </ScrollView>

            {/* Gender Picker Modal */}
            <Modal
                visible={showGenderPicker}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowGenderPicker(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowGenderPicker(false)}
                >
                    <View
                        style={[
                            styles.localizedPicker,
                            {
                                top: genderLayout.top,
                                left: genderLayout.left,
                                width: genderLayout.width,
                            },
                        ]}
                    >
                        <FlatList
                            data={GENDER_OPTIONS}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.localizedOption}
                                    onPress={() => {
                                        setFormData({ ...formData, gender: item });
                                        setShowGenderPicker(false);
                                    }}
                                >
                                    <ThemedText
                                        style={[
                                            styles.optionText,
                                            formData.gender === item && {
                                                color: '#007AFF',
                                                fontWeight: 'bold',
                                            },
                                        ]}
                                    >
                                        {item}
                                    </ThemedText>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </KeyboardAvoidingView>
    );
}

const getPainColor = (level: number, isSelected: boolean) => {
    if (!isSelected) return '#1E1E1E';
    if (level <= 3) return '#34C759';
    if (level <= 7) return '#FF9F0A';
    return '#FF3B30';
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContainer: {
        flexGrow: 1,
        backgroundColor: '#121212',
    },
    formContent: {
        padding: 20,
        paddingTop: 60,
        gap: 15,
    },
    subtitle: {
        fontSize: 14,
        opacity: 0.6,
        marginBottom: 5,
    },
    inputGroup: {
        gap: 8,
    },
    input: {
        backgroundColor: '#1E1E1E',
        color: '#fff',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: '#333',
    },
    dropdownTrigger: {
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: '#333',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 48,
    },
    dropdownText: {
        color: '#fff',
    },
    row: {
        flexDirection: 'row',
        gap: 15,
    },
    painSelector: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginTop: 5,
    },
    painCircle: {
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#333',
    },
    selectedPainCircle: {
        borderColor: '#fff',
        borderWidth: 2,
    },
    painText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
    },
    saveButton: {
        backgroundColor: '#007AFF',
        padding: 18,
        borderRadius: 15,
        alignItems: 'center',
        marginTop: 10,
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        padding: 18,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#FF3B30',
        marginBottom: 40,
    },
    logoutText: {
        color: '#FF3B30',
        fontWeight: 'bold',
        fontSize: 16,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    localizedPicker: {
        position: 'absolute',
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#333',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
        zIndex: 1000,
        overflow: 'hidden',
    },
    localizedOption: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#222',
    },
    optionText: {
        fontSize: 14,
    },
});