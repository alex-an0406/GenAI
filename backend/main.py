from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="Physio AI API")


# Define the exact JSON structure your frontend will send
class PoseData(BaseModel):
    user_id: str
    exercise_type: str
    angles: list[float]  # e.g., [knee_angle, hip_angle, back_angle]


@app.get("/")
def read_root():
    return {"status": "healthy", "message": "Backend is live."}


@app.post("/evaluate-form")
def evaluate_form(data: PoseData):
    # This is where your AI logic will eventually go.
    # For now, let's just return dummy feedback to prove the pipes are connected.

    if not data.angles:
        raise HTTPException(status_code=400, detail="No angle data provided")

    feedback = "Good form."

    # Dummy rule-based check
    if data.exercise_type.lower() == "squat" and data.angles[0] < 90.0:
        feedback = "Knee angle too acute. Don't go so deep."

    return {
        "status": "success",
        "user_id": data.user_id,
        "exercise": data.exercise_type,
        "feedback": feedback
    }