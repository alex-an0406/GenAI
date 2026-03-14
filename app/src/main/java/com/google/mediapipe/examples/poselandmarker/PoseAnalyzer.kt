package com.google.mediapipe.examples.poselandmarker

import com.google.mediapipe.tasks.components.containers.NormalizedLandmark
import kotlin.math.atan2
import kotlin.math.sqrt
import kotlin.math.abs

/**
 * General-purpose pose analyzer that extracts joint angles and body metrics
 * from MediaPipe Pose Landmarker results (33 landmarks).
 *
 * Landmark index reference:
 *   0  - Nose
 *   11 - Left Shoulder    12 - Right Shoulder
 *   13 - Left Elbow       14 - Right Elbow
 *   15 - Left Wrist       16 - Right Wrist
 *   23 - Left Hip         24 - Right Hip
 *   25 - Left Knee        26 - Right Knee
 *   27 - Left Ankle       28 - Right Ankle
 */
class PoseAnalyzer {

    // ========================================================================
    // Data classes for structured output
    // ========================================================================

    data class JointAngles(
        val leftElbow: Double,
        val rightElbow: Double,
        val leftShoulder: Double,
        val rightShoulder: Double,
        val leftHip: Double,
        val rightHip: Double,
        val leftKnee: Double,
        val rightKnee: Double,
        val leftAnkle: Double,
        val rightAnkle: Double
    )

    data class BodyMetrics(
        val torsoLeanSide: Double,     // lateral lean: 180 = upright, <180 = leaning sideways
        val torsoLeanForward: Double,  // forward lean: 180 = upright, <180 = bending forward
        val shoulderAlignment: Double, // difference in y between shoulders (0 = level)
        val hipAlignment: Double,      // difference in y between hips (0 = level)
        val stanceWidth: Double        // horizontal distance between ankles (normalized)
    )

    data class PoseFrame(
        val angles: JointAngles,
        val metrics: BodyMetrics,
        val timestamp: Long
    )

    // ========================================================================
    // Core angle calculation
    // ========================================================================

    /**
     * Calculate the angle at joint B formed by points A -> B -> C.
     * Returns degrees in range [0, 180].
     */
    fun calculateAngle(
        a: NormalizedLandmark,
        b: NormalizedLandmark,
        c: NormalizedLandmark
    ): Double {
        val baX = (a.x() - b.x()).toDouble()
        val baY = (a.y() - b.y()).toDouble()
        val bcX = (c.x() - b.x()).toDouble()
        val bcY = (c.y() - b.y()).toDouble()

        val dot = baX * bcX + baY * bcY
        val magBA = sqrt(baX * baX + baY * baY)
        val magBC = sqrt(bcX * bcX + bcY * bcY)

        val cosAngle = (dot / (magBA * magBC + 1e-8)).coerceIn(-1.0, 1.0)
        return Math.toDegrees(Math.acos(cosAngle))
    }

    /**
     * Calculate angle from vertical (useful for torso lean).
     * 0 = perfectly vertical, 90 = horizontal.
     * Uses the line from bottom point to top point compared to straight up.
     */
    fun angleFromVertical(
        top: NormalizedLandmark,
        bottom: NormalizedLandmark
    ): Double {
        val dx = (top.x() - bottom.x()).toDouble()
        val dy = (top.y() - bottom.y()).toDouble()
        // In screen coords, y increases downward, so "up" is negative y
        // atan2 of dx vs -dy gives angle from vertical
        val angle = Math.toDegrees(atan2(abs(dx), abs(dy)))
        return angle
    }

    // ========================================================================
    // Extract all joint angles from a single frame
    // ========================================================================

    fun extractJointAngles(landmarks: List<NormalizedLandmark>): JointAngles {
        return JointAngles(
            // Elbow angles: shoulder -> elbow -> wrist
            leftElbow = calculateAngle(landmarks[11], landmarks[13], landmarks[15]),
            rightElbow = calculateAngle(landmarks[12], landmarks[14], landmarks[16]),

            // Shoulder angles: elbow -> shoulder -> hip
            leftShoulder = calculateAngle(landmarks[13], landmarks[11], landmarks[23]),
            rightShoulder = calculateAngle(landmarks[14], landmarks[12], landmarks[24]),

            // Hip angles: shoulder -> hip -> knee
            leftHip = calculateAngle(landmarks[11], landmarks[23], landmarks[25]),
            rightHip = calculateAngle(landmarks[12], landmarks[24], landmarks[26]),

            // Knee angles: hip -> knee -> ankle
            leftKnee = calculateAngle(landmarks[23], landmarks[25], landmarks[27]),
            rightKnee = calculateAngle(landmarks[24], landmarks[26], landmarks[28]),

            // Ankle angles: knee -> ankle -> foot index (landmarks 31/32)
            // Falls back to 0 if foot landmarks aren't reliable
            leftAnkle = if (landmarks.size > 31)
                calculateAngle(landmarks[25], landmarks[27], landmarks[31]) else 0.0,
            rightAnkle = if (landmarks.size > 32)
                calculateAngle(landmarks[26], landmarks[28], landmarks[32]) else 0.0
        )
    }

    // ========================================================================
    // Extract body-level metrics
    // ========================================================================

    fun extractBodyMetrics(
        landmarks: List<NormalizedLandmark>,
        worldLandmarks: List<com.google.mediapipe.tasks.components.containers.Landmark>? = null
    ): BodyMetrics {
        // --- Lateral lean (side-to-side) from 2D landmarks ---
        val midShoulderX = (landmarks[11].x() + landmarks[12].x()) / 2.0
        val midShoulderY = (landmarks[11].y() + landmarks[12].y()) / 2.0
        val midHipX = (landmarks[23].x() + landmarks[24].x()) / 2.0
        val midHipY = (landmarks[23].y() + landmarks[24].y()) / 2.0

        val lateralDx = midShoulderX - midHipX
        val lateralDy = midShoulderY - midHipY
        val torsoLeanSide = Math.toDegrees(
            atan2(midHipY - midShoulderY, midShoulderX - midHipX)
        )

        // --- Forward lean from 3D world landmarks (if available) ---
        val torsoLeanForward = if (worldLandmarks != null && worldLandmarks.size > 24) {
            val wMidShoulderY = (worldLandmarks[11].y() + worldLandmarks[12].y()) / 2.0
            val wMidShoulderZ = (worldLandmarks[11].z() + worldLandmarks[12].z()) / 2.0
            val wMidHipY = (worldLandmarks[23].y() + worldLandmarks[24].y()) / 2.0
            val wMidHipZ = (worldLandmarks[23].z() + worldLandmarks[24].z()) / 2.0

            // Forward lean: angle of torso from vertical using y (up/down) and z (forward/back)
            val forwardDz = wMidShoulderZ - wMidHipZ
            val forwardDy = wMidShoulderY - wMidHipY
            Math.toDegrees(atan2(abs(forwardDz), abs(forwardDy)))
        } else {
            0.0  // not available without world landmarks
        }

        // Convert both to 180 = upright convention
        val torsoLeanForwardAdjusted = if (torsoLeanForward > 0.0) 180.0 - torsoLeanForward else 0.0

        return BodyMetrics(
            torsoLeanSide = torsoLeanSide,
            torsoLeanForward = torsoLeanForwardAdjusted,
            shoulderAlignment = abs(landmarks[11].y() - landmarks[12].y()).toDouble(),
            hipAlignment = abs(landmarks[23].y() - landmarks[24].y()).toDouble(),
            stanceWidth = abs(landmarks[27].x() - landmarks[28].x()).toDouble()
        )
    }

    // ========================================================================
    // Main analysis entry point — call this from onResults
    // ========================================================================

    fun analyze(
        landmarks: List<NormalizedLandmark>,
        worldLandmarks: List<com.google.mediapipe.tasks.components.containers.Landmark>? = null,
        timestamp: Long = System.currentTimeMillis()
    ): PoseFrame {
        val angles = extractJointAngles(landmarks)
        val metrics = extractBodyMetrics(landmarks, worldLandmarks)
        return PoseFrame(angles, metrics, timestamp)
    }
}