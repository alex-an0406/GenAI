import os
from google import genai
from pydantic import BaseModel
from typing import List, Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Synchronized UserProfile model
class UserProfile(BaseModel):
    name: str
    height_cm: float
    weight_kg: float
    age: int
    gender: str
    surgery_history: str
    time_since_injury_days: int
    has_diagnosis: bool
    diagnosis: Optional[str] = None
    pain_description: str
    pain_level: int

class Exercise(BaseModel):
    name: str
    intensity: str
    target_reps: int
    target_sets: int

# Initialize the Gemini client
api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key)

async def generate_personalized_exercises(profile: UserProfile) -> List[Exercise]:
    """
    Acts as an expert physiotherapist to generate a safe, targeted recovery plan.
    Analyzes pain levels and diagnosis to adjust exercise intensity.
    """
    
    diagnosis_info = f"Diagnosis: {profile.diagnosis}" if profile.has_diagnosis else "No formal diagnosis yet."
    
    prompt = f"""
    You are an expert, world-class physiotherapist specialized in rehabilitation.
    Generate a highly targeted, safe exercise plan for the following user profile:
    
    - Name: {profile.name}
    - Age: {profile.age}
    - Gender: {profile.gender}
    - Height: {profile.height_cm}cm, Weight: {profile.weight_kg}kg
    - Surgery/Injury History: {profile.surgery_history}
    - Days since injury: {profile.time_since_injury_days}
    - {diagnosis_info}
    - Pain Description: {profile.pain_description}
    - Current Pain Level: {profile.pain_level}/10

    CRITICAL REQUIREMENTS:
    1.  Provide exactly 4 to 5 exercises.
    2.  Exercises MUST be highly trackable for computer vision pose estimation (e.g., Clamshells, Glute Bridges, Knee Extensions, Squats, Calf Raises, Straight Leg Raises).
    3.  ADAPT INTENSITY BASED ON PAIN:
        - If Pain Level is HIGH (7-10): Focus on static holds, isometrics, or very light mobility. Intensity: "Light".
        - If Pain Level is MEDIUM (4-6): Use controlled range of motion. Intensity: "Medium".
        - If Pain Level is LOW (1-3): Focus on strengthening and full range of motion. Intensity: "Medium" or "Heavy".
    4.  Assign appropriate target reps and target sets.
    5.  The exercises must be safe for the specific recovery stage and pain description provided.

    Return the result as a structured list of exercises.
    """

    # Call Gemini with structured output configuration
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt,
        config={
            'response_mime_type': 'application/json',
            'response_schema': List[Exercise],
        }
    )

    return response.parsed
