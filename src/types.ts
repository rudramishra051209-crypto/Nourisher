export type AgeGroup = '13–17' | '18–25' | '26–40' | '41–60' | '61+';
export type Sex = 'Male' | 'Female';
export type ActivityLevel = 'Light' | 'Moderate' | 'High';
export type FoodStyle = 'Vegetarian' | 'Eggetarian' | 'Non-vegetarian' | 'Jain' | 'Mostly plant-based';
export type MainGoal = 
  | 'More daily energy'
  | 'Muscle & strength support'
  | 'Study-day nutrition'
  | 'Balanced eating'
  | 'Eat well on a budget';
export type EnergyGoal = 
  | 'Maintenance'
  | 'Muscle-building surplus'
  | 'Fat-loss deficit'
  | 'Recomposition';
export type BudgetTier = 
  | 'Under ₹100/day'
  | '₹200/day'
  | '₹350/day'
  | '₹350+/day'
  | 'Flexible / unknown';

export interface MealItem {
  mealName: string;
  dishTitle: string;
  quantity: string;
  proteinEstimate: string;
  caloriesEstimate?: string;
  macroSplit?: string;
  budgetTip?: string;
  preparationSteps: string;
  ingredients: string;
}

export interface MealAlternative {
  name: string;
  description: string;
  styles?: string[];
}

export interface CravingRecipe {
  name: string;
  ingredients?: string;
  steps?: string;
  styles?: string[];
  alternatives?: string[];
}

export interface UserProfile {
  id: string;
  name?: string;
  ageGroup: AgeGroup;
  age: string;
  height: string;
  weight: string;
  sex: Sex | '';
  activity: ActivityLevel | '';
  foodStyle: FoodStyle;
  mainGoal: MainGoal;
  energyGoal: EnergyGoal;
  budget: BudgetTier;
  createdAt?: string;
}

export interface EnergyCalculations {
  bmr: number;
  maintenance: number;
  bulkLow: number;
  bulkHigh: number;
  cutLow: number;
  cutHigh: number;
  recompLow: number;
  recompHigh: number;
}

export type WorkoutGoal = 'strength' | 'muscle' | 'fitness' | 'busy';
export type WorkoutDays = '2' | '3' | '4' | '5' | '6';
export type WorkoutPlace = 'gym' | 'home';
export type WorkoutStyle = 'standard' | 'shoulderLegs';

export interface WorkoutDayPlan {
  title: string;
  exercises: { name: string; setsReps: string }[];
}
