export interface Exercise {
  id: string;
  name: string;
  reps?: number;
  sets?: number;
  holdTime?: number; // in seconds
  targetAngle?: number; // for CV coaching
  description: string;
  instructions: string[];
}

export interface DayPlan {
  day: string; // e.g., "Monday"
  date: string; // ISO format
  exercises: Exercise[];
  completed: boolean;
}

export interface RehabilitationPlan {
  userId: string;
  startDate: string;
  plan: DayPlan[];
}

export interface UserProgress {
  rpe: number; // Rate of Perceived Exertion (1-10)
  painLevel: number; // Pain scale (1-10)
  feedback?: string;
}
