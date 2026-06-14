export interface Ingredient {
  name: string;
  amount: string;
  calories: number;
}

export interface FoodAnalysisResult {
  mealName: string;
  estimatedWeight: string; // e.g. "300г"
  calories: number;
  proteins: number; // in grams
  fats: number; // in grams
  carbs: number; // in grams
  ingredients: Ingredient[];
  teenFriendlyAdvice: string; // positive advice about focus, energy, hydration, balance, wellness
}

export interface MealLog {
  id: string;
  timestamp: string; // ISO string
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  imageUrl?: string; // base64 or placeholder
  mealName: string;
  estimatedWeight: string;
  calories: number;
  proteins: number;
  fats: number;
  carbs: number;
  ingredients: Ingredient[];
  advice: string;
  notes?: string;
}

export interface UserProfile {
  name: string;
  age: number;
  gender: 'male' | 'female' | 'unspecified';
  activityLevel: 'low' | 'moderate' | 'high';
  waterGoalML: number;
  waterIntakeML: number;
  avatar?: string; // Base64 image, custom upload or preset key
}

export interface DailyStats {
  maxCalories: number;
  targetProteins: number;
  targetFats: number;
  targetCarbs: number;
}
