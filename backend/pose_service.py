import cv2
import mediapipe as mp
import numpy as np
import base64

# Initialize MediaPipe Pose
mp_pose = mp.solutions.pose

class PoseEstimator:
    def __init__(self):
        """
        Initializes the MediaPipe Pose module.
        Removed all GUI-based visualization logic to run on the server.
        """
        self.pose = mp_pose.Pose(
            static_image_mode=False,
            model_complexity=1,
            smooth_landmarks=True,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )

    def calculate_angle(self, a, b, c):
        """
        Calculates the angle at joint b (vertex) between joints a and c.
        Uses the geometric definition of the dot product:
        theta = arccos((V1 . V2) / (|V1| * |V2|))
        """
        a = np.array(a) # Point 1
        b = np.array(b) # Vertex (Joint)
        c = np.array(c) # Point 2
        
        # Define vectors originating from the vertex b
        v1 = a - b
        v2 = c - b
        
        # Calculate dot product
        dot_product = np.dot(v1, v2)
        
        # Calculate magnitudes
        mag_v1 = np.linalg.norm(v1)
        mag_v2 = np.linalg.norm(v2)
        
        # Handle zero division
        if mag_v1 == 0 or mag_v2 == 0:
            return 0
            
        # Solve for angle theta in radians, then convert to degrees
        cos_theta = dot_product / (mag_v1 * mag_v2)
        # Clip value to avoid floating point errors out of arccos range [-1, 1]
        cos_theta = np.clip(cos_theta, -1.0, 1.0)
        
        angle = np.degrees(np.arccos(cos_theta))
        return angle

    def process_frame(self, image):
        """
        Passes the RGB image to the MediaPipe Pose pipeline.
        """
        # MediaPipe expects RGB
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        results = self.pose.process(image_rgb)
        return results

# Singleton instance of the estimator
estimator = PoseEstimator()

async def process_base64_frame(base64_string: str, exercise: str) -> dict:
    """
    Decodes a base64 string into an OpenCV image, processes it, 
    and returns form feedback.
    """
    try:
        # Strip data prefix if present (e.g., 'data:image/jpeg;base64,')
        if "," in base64_string:
            base64_string = base64_string.split(",")[1]
            
        # Decode base64 to numpy array, then to OpenCV image
        nparr = np.frombuffer(base64.b64decode(base64_string), np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            return {"feedback_text": "Invalid image data", "is_rep_valid": False}
            
        # Process the frame with MediaPipe
        results = estimator.process_frame(image)
        
        if not results.pose_landmarks:
            return {"feedback_text": "No body detected", "is_rep_valid": False}
            
        # Extract landmarks (MediaPipe Pose has 33 landmarks)
        landmarks = results.pose_landmarks.landmark
        
        # Placeholder angle calculation logic for feedback
        # Example: Knee Extension (Left Hip [23], Left Knee [25], Left Ankle [27])
        hip = [landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].x, landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].y]
        knee = [landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value].x, landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value].y]
        ankle = [landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].x, landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].y]
        
        angle = estimator.calculate_angle(hip, knee, ankle)
        
        # Simple logic check for specific exercises
        if exercise.lower() == "knee extension":
            # If the leg is sufficiently straight (angle close to 180)
            if angle > 160:
                return {
                    "feedback_text": "Good extension!",
                    "is_rep_valid": True,
                    "angle": round(angle, 2)
                }
            else:
                return {
                    "feedback_text": "Extend your knee further",
                    "is_rep_valid": False,
                    "angle": round(angle, 2)
                }
        
        # Default tracking feedback
        return {
            "feedback_text": "Tracking form...",
            "is_rep_valid": True,
            "angle": round(angle, 2)
        }

    except Exception as e:
        return {"feedback_text": f"Processing error: {str(e)}", "is_rep_valid": False}
