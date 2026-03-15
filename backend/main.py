from fastapi import FastAPI, Query, Path, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any

# Our custom packages
from supabase_client import supabase  # Import our initialized Supabase client

# Initialize the FastAPI application
app = FastAPI(
    title="Fizio MVP Backend",
    description="Backend for Fizio, an AI-powered physiotherapy app.",
    version="1.1.0"
)

# Configure CORS to allow all origins, methods, and headers
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Models ---

class UserProfile(BaseModel):
    height_cm: float
    weight_kg: float
    age: int
    gender: str
    surgery_history: str
    time_since_injury_days: int

class Exercise(BaseModel):
    name: str
    intensity: str
    target_reps: int
    target_sets: int

class PlanData(BaseModel):
    momentum_score: int
    weekly_soreness_score: int
    exercises: List[Exercise]
    profile_snapshot: UserProfile

class PlanGenerateRequest(BaseModel):
    user_id: str
    profile: UserProfile

class PlanResponse(BaseModel):
    plan_id: str
    status: str
    plan_data: PlanData

class Feedback(BaseModel):
    ease_score: int
    weekly_soreness_score: int
    completed_exercises: List[str]

class MetricsRequest(BaseModel):
    user_id: str
    plan_id: str
    feedback: Feedback

class MetricsResponse(BaseModel):
    status: str
    plans_updated: List[str]

class EvaluateFormRequest(BaseModel):
    user_id: str
    exercise: str
    angles: List[float]

class FormEvaluationResponse(BaseModel):
    feedback_text: str
    is_rep_valid: bool

# --- Endpoints ---

@app.post("/api/plans/generate", response_model=PlanResponse)
async def generate_plan(request: PlanGenerateRequest):
    """
    Generates a new exercise plan based on user profile and saves it to Supabase.
    """
    # Construct the initial plan_data
    plan_data = {
        "momentum_score": 100,
        "weekly_soreness_score": 0,
        "exercises": [
            {"name": "Knee Extension", "intensity": "Light", "target_reps": 10, "target_sets": 3},
            {"name": "Straight Leg Raise", "intensity": "Light", "target_reps": 12, "target_sets": 2}
        ],
        "profile_snapshot": request.profile.dict()
    }

    # Perform the insert into the 'plans' table
    try:
        response = supabase.table("plans").insert({
            "user_id": request.user_id,
            "status": "active",
            "plan_data": plan_data
        }).execute()

        # Extract the inserted row
        new_plan = response.data[0]
        return {
            "plan_id": new_plan["id"],
            "status": new_plan["status"],
            "plan_data": new_plan["plan_data"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/plans/{plan_id}", response_model=PlanData)
async def get_plan(
    plan_id: str = Path(..., description="The ID of the plan to fetch"),
    user_id: str = Query(..., description="The ID of the user requesting the plan")
):
    """
    Fetches the current state of a plan from Supabase.
    """
    try:
        # Perform a select where id == plan_id AND user_id == user_id
        response = supabase.table("plans") \
            .select("plan_data") \
            .eq("id", plan_id) \
            .eq("user_id", user_id) \
            .execute()

        if not response.data:
            raise HTTPException(status_code=404, detail="Plan not found for this user.")

        # Return the plan_data JSONB object
        return response.data[0]["plan_data"]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/metrics", response_model=MetricsResponse)
async def submit_metrics(request: MetricsRequest):
    """
    Receives workout feedback, adjusts plan_data dynamically, and updates Supabase.
    """
    try:
        # 1. Fetch the existing plan
        response = supabase.table("plans") \
            .select("plan_data") \
            .eq("id", request.plan_id) \
            .execute()

        if not response.data:
            raise HTTPException(status_code=404, detail="Plan not found.")

        plan_data = response.data[0]["plan_data"]

        # 2. Simulate Dynamic AI adjustment: 
        # Modify momentum based on soreness and ease score
        current_momentum = plan_data.get("momentum_score", 100)
        soreness_deduction = request.feedback.weekly_soreness_score * 2
        new_momentum = max(0, current_momentum - soreness_deduction)

        # Update the dictionary
        plan_data["momentum_score"] = new_momentum
        plan_data["weekly_soreness_score"] = request.feedback.weekly_soreness_score
        
        # 3. Perform an update back to the database
        supabase.table("plans") \
            .update({"plan_data": plan_data}) \
            .eq("id", request.plan_id) \
            .execute()

        return {
            "status": "success",
            "plans_updated": [request.plan_id]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/evaluate-form", response_model=FormEvaluationResponse)
async def evaluate_form(request: EvaluateFormRequest):
    """
    Purely computational endpoint for live form feedback (no DB calls).
    """
    # Dummy logic check for Knee extension
    if request.exercise.lower() == "knee extension" and request.angles:
        first_angle = request.angles[0]
        if first_angle < 90:
            return {
                "feedback_text": "Extend your knee a bit further",
                "is_rep_valid": False
            }

    # Default success response
    return {
        "feedback_text": "Good form",
        "is_rep_valid": True
    }
