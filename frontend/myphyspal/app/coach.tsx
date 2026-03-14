import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PostWorkoutSurvey } from '@/components/post-workout-survey';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function CoachScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isCoaching, setIsCoaching] = useState(false);
  const [currentAngle, setCurrentAngle] = useState(180);
  const [showSurvey, setShowSurvey] = useState(false);

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission]);

  const handleStopCoaching = () => {
    setIsCoaching(false);
    setShowSurvey(true);
  };

  const handleSurveySubmit = (rpe: number, pain: number, feedback: string) => {
    console.log('Syncing to FastAPI:', { rpe, pain, feedback });
    setShowSurvey(false);
    router.back();
  };

  if (!permission) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </ThemedView>
    );
  }

  if (!permission.granted) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.centerContent}>
          <IconSymbol size={60} name="camera.fill" color="#888" />
          <ThemedText style={styles.errorText}>Camera access is required for AI Coaching</ThemedText>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <ThemedText style={styles.buttonText}>Grant Permission</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.back()} style={{marginTop: 20}}>
            <ThemedText style={{color: '#007AFF'}}>Go Back</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol size={28} name="chevron.left" color="#007AFF" />
        </TouchableOpacity>
        <View>
          <ThemedText type="title">Live Coach</ThemedText>
          <ThemedText>MediaPipe Pose Tracking Active</ThemedText>
        </View>
      </ThemedView>

      <View style={styles.cameraContainer}>
        <CameraView 
          style={styles.camera} 
          facing="front"
        >
          {isCoaching && (
            <View style={styles.overlay}>
              <ThemedText style={styles.angleText}>Knee Angle: {currentAngle}°</ThemedText>
              <ThemedText style={styles.guidanceText}>"Keep your back straight"</ThemedText>
            </View>
          )}
        </CameraView>
      </View>

      <TouchableOpacity 
        style={[styles.button, isCoaching ? styles.stopButton : styles.startButton]}
        onPress={isCoaching ? handleStopCoaching : () => setIsCoaching(true)}
      >
        <ThemedText style={styles.buttonText}>
          {isCoaching ? 'STOP & COMPLETE' : 'START LIVE SESSION'}
        </ThemedText>
      </TouchableOpacity>

      <PostWorkoutSurvey 
        visible={showSurvey} 
        onClose={() => setShowSurvey(false)} 
        onSubmit={handleSurveySubmit} 
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 15,
  },
  backButton: {
    padding: 5,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 15,
    borderRadius: 12,
  },
  angleText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  guidanceText: {
    color: '#00FF00',
    fontSize: 18,
    marginTop: 5,
  },
  button: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 40,
  },
  startButton: {
    backgroundColor: '#007AFF',
  },
  stopButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  errorText: {
    textAlign: 'center',
    opacity: 0.7,
    paddingHorizontal: 40,
  },
  permissionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
  }
});
