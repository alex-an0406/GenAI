from fastapi import FastAPI, Query, Path, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import time

# Robust import for the Supabase client
try:
    from supabase_client import supabase
except ImportError:
    from .supabase_client import supabase

from llm import generate_personalized_exercises  # AI Generation logic

app = FastAPI(
    title="Fizio MVP Backend",
    description="Synchronized Backend with Full Database Schema",
    version="1.2.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Models ---

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
    Ensures user profile exists with full details, then generates and saves a new AI exercise plan.
    """
    try:
        # 1. Update the 'profiles' table with all new fields
        supabase.table("profiles").upsert({
            "id": request.user_id,
            "name": request.profile.name,
            "age": request.profile.age,
            "gender": request.profile.gender,
            "weight_kg": request.profile.weight_kg,
            "height_cm": request.profile.height_cm,
            "surgery_history": request.profile.surgery_history,
            "time_since_injury_days": request.profile.time_since_injury_days,
            "has_diagnosis": request.profile.has_diagnosis,
            "diagnosis": request.profile.diagnosis,
            "pain_description": request.profile.pain_description,
            "pain_level": request.profile.pain_level,
            "onboarding_completed": True,
            "updated_at": "now()"
        }).execute()

        # 2. Call AI to generate personalized exercises based on full profile
        ai_exercises = await generate_personalized_exercises(request.profile)

        # 3. Construct the final plan_data
        plan_data = {
            "momentum_score": 100,
            "weekly_soreness_score": 0,
            "exercises": [ex.dict() for ex in ai_exercises],
            "profile_snapshot": request.profile.dict()
        }

        # 4. Insert into the 'plans' table
        response = supabase.table("plans").insert({
            "user_id": request.user_id,
            "status": "active",
            "plan_data": plan_data
        }).execute()

        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to create plan record.")

        new_plan = response.data[0]
        return {
            "plan_id": str(new_plan["id"]),
            "status": new_plan["status"],
            "plan_data": new_plan["plan_data"]
        }
    except Exception as e:
        print(f"Error in generate_plan: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/plans/{plan_id}", response_model=PlanData)
async def get_plan(
    plan_id: str = Path(..., description="The ID of the plan to fetch"),
    user_id: str = Query(..., description="The ID of the user requesting the plan")
):
    try:
        response = supabase.table("plans") \
            .select("plan_data") \
            .eq("id", plan_id) \
            .eq("user_id", user_id) \
            .execute()

        if not response.data:
            raise HTTPException(status_code=404, detail="Plan not found for this user.")

        return response.data[0]["plan_data"]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/metrics", response_model=MetricsResponse)
async def submit_metrics(request: MetricsRequest):
    try:
        response = supabase.table("plans").select("plan_data").eq("id", request.plan_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Plan not found.")

        plan_data = response.data[0]["plan_data"]
        current_momentum = plan_data.get("momentum_score", 100)
        soreness_deduction = request.feedback.weekly_soreness_score * 2
        new_momentum = max(0, current_momentum - soreness_deduction)

        plan_data["momentum_score"] = new_momentum
        plan_data["weekly_soreness_score"] = request.feedback.weekly_soreness_score
        
        supabase.table("plans").update({"plan_data": plan_data}).eq("id", request.plan_id).execute()

        return {"status": "success", "plans_updated": [request.plan_id]}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/evaluate-form", response_model=FormEvaluationResponse)
async def evaluate_form(request: EvaluateFormRequest):
    if request.exercise.lower() == "knee extension" and request.angles:
        if request.angles[0] < 90:
            return {"feedback_text": "Extend your knee a bit further", "is_rep_valid": False}
    return {"feedback_text": "Good form", "is_rep_valid": True}
