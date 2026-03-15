import React, { useState, useRef } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { Video, ResizeMode } from 'expo-av';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PostWorkoutSurvey } from '@/components/post-workout-survey';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function CoachScreen() {
  const [isCoaching, setIsCoaching] = useState(false);
  const [currentAngle, setCurrentAngle] = useState(180);
  const [showSurvey, setShowSurvey] = useState(false);
  const videoRef = useRef<Video>(null);

  const handleStartCoaching = async () => {
    setIsCoaching(true);
    if (videoRef.current) {
      await videoRef.current.playAsync();
    }
  };

  const handleStopCoaching = async () => {
    if (videoRef.current) {
      await videoRef.current.stopAsync();
    }
    setIsCoaching(false);
    setShowSurvey(true);
  };

  const handleSurveySubmit = (rpe: number, pain: number, feedback: string) => {
    console.log('Syncing to FastAPI:', { rpe, pain, feedback });
    setShowSurvey(false);
    router.back();
  };

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
        <Video
          ref={videoRef}
          style={styles.camera}
          source={require('../assets/videos/GenAIdemo (online-video-cutter.com).mp4')}
          useNativeControls={false}
          resizeMode={ResizeMode.COVER}
          isLooping
          onPlaybackStatusUpdate={status => {
            if (!status.isLoaded) return;
            // Simulated angle change during coaching for realism
            if (isCoaching && status.isPlaying) {
              const newAngle = 170 + Math.floor(Math.random() * 20);
              setCurrentAngle(newAngle);
            }
          }}
        />
        {isCoaching && (
          <View style={styles.overlay}>
            <ThemedText style={styles.angleText}>Knee Angle: {currentAngle}°</ThemedText>
            <ThemedText style={styles.guidanceText}>"Keep your back straight"</ThemedText>
          </View>
        )}
      </View>

      <TouchableOpacity 
        style={[styles.button, isCoaching ? styles.stopButton : styles.startButton]}
        onPress={isCoaching ? handleStopCoaching : handleStartCoaching}
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
  }
});
