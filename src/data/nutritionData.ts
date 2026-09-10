import { FoodStyle, MealItem, MealAlternative } from '../types';

export const PLANS_DATA: Record<FoodStyle, MealItem[]> = {
  Vegetarian: [
    {
      mealName: 'Breakfast',
      dishTitle: 'Poha with peanuts + milk + fruit',
      quantity: '1.5 cups cooked poha + 15 g peanuts + 250 ml milk + 1 medium fruit',
      proteinEstimate: '~15–20 g protein',
      preparationSteps: 'Rinse poha, drain and rest 5 minutes. Heat 1 tsp oil in a pan. Add suitable vegetables and cook 2–3 minutes. Add poha, 1–2 tbsp water and seasoning; cook 3–4 minutes. Mix in peanuts. Serve with milk and fruit.',
      ingredients: '1.5 cups cooked poha; 15 g peanuts; 1 tsp oil; suitable vegetables ~1/2 cup; 1–2 tbsp water; salt/seasoning to taste; 250 ml milk; 1 medium fruit.',
    },
    {
      mealName: 'Lunch',
      dishTitle: 'Dal + rice/roti + vegetables + curd',
      quantity: '1.25 cups cooked dal + 1.5 cups cooked rice OR 3 rotis + 1 cup vegetables + 150 g curd',
      proteinEstimate: '~20–25 g protein',
      preparationSteps: 'Cook dal until soft. Heat 1 tsp oil in a pan, add suitable seasoning, then add cooked dal and simmer 3–5 minutes. Cook rice or warm rotis. Cook 1 cup vegetables with 1 tsp oil and a splash of water until tender. Serve with 150 g curd.',
      ingredients: '1.25 cups cooked dal; 1.5 cups cooked rice OR 3 rotis; 1 cup vegetables; 2 tsp oil total; 1–2 tbsp water; salt/seasoning to taste; 150 g curd.',
    },
    {
      mealName: 'Snack',
      dishTitle: 'Banana + roasted chana',
      quantity: '1 medium banana + 40 g roasted chana',
      proteinEstimate: '~7–9 g protein',
      preparationSteps: 'Wash/peel the banana and serve with 40 g roasted chana. No cooking needed.',
      ingredients: '1 medium banana; 40 g roasted chana.',
    },
    {
      mealName: 'Dinner',
      dishTitle: 'Roti + paneer or soy + vegetables',
      quantity: '3 rotis + 100 g paneer OR 60–70 g dry soy chunks + 1 cup vegetables',
      proteinEstimate: '~22–28 g protein',
      preparationSteps: 'If using soy, soak in hot water 10 minutes, drain and squeeze. Heat 1 tsp oil in a pan, add seasoning and vegetables, cook 3–4 minutes, then add paneer or soy and 2 tbsp water. Cook another 3–5 minutes. Serve with 3 rotis.',
      ingredients: '3 rotis; 100 g paneer OR 60–70 g dry soy chunks; 1 cup vegetables; 1 tsp oil; 2 tbsp water; salt/seasoning to taste.',
    },
  ],
  Eggetarian: [
    {
      mealName: 'Breakfast',
      dishTitle: 'Vegetable poha + 2 eggs + fruit',
      quantity: '1.5 cups cooked poha + 2 eggs + 1 medium fruit',
      proteinEstimate: '~20–23 g protein',
      preparationSteps: 'Heat 1 tsp oil in a pan, cook suitable vegetables 2–3 minutes, add poha and 1–2 tbsp water, then cook 3–4 minutes. In a separate pan use 1 tsp oil to scramble 2 eggs and cook thoroughly. Serve with fruit.',
      ingredients: '1.5 cups cooked poha; 2 eggs; 2 tsp oil total; suitable vegetables ~1/2 cup; 1–2 tbsp water; salt/seasoning; 1 medium fruit.',
    },
    {
      mealName: 'Lunch',
      dishTitle: 'Dal + rice + vegetables + curd',
      quantity: '1.25 cups cooked dal + 1.5 cups cooked rice + 1 cup vegetables + 150 g curd',
      proteinEstimate: '~20–25 g protein',
      preparationSteps: 'Heat 1 tsp oil, add seasoning and cooked dal, then simmer 3–5 minutes. Prepare rice. Heat 1 tsp oil, add vegetables and 1–2 tbsp water, cover and cook until tender. Serve with curd.',
      ingredients: '1.25 cups cooked dal; 1.5 cups cooked rice; 1 cup vegetables; 2 tsp oil; 1–2 tbsp water; salt/seasoning; 150 g curd.',
    },
    {
      mealName: 'Snack',
      dishTitle: 'Fruit + roasted chana',
      quantity: '1 medium fruit + 35–40 g roasted chana',
      proteinEstimate: '~6–8 g protein',
      preparationSteps: 'Wash and cut the fruit if needed. Serve with 35–40 g roasted chana. No cooking needed.',
      ingredients: '1 medium fruit; 35–40 g roasted chana.',
    },
    {
      mealName: 'Dinner',
      dishTitle: 'Roti + egg curry + vegetables',
      quantity: '3 rotis + 2 eggs in curry + 1 cup vegetables',
      proteinEstimate: '~22–28 g protein',
      preparationSteps: 'Heat 1 tsp oil. Cook suitable curry ingredients and vegetables with 2–3 tbsp water until tender. Add 2 eggs and cook thoroughly. Simmer 3–5 minutes and serve with 3 rotis.',
      ingredients: '3 rotis; 2 eggs; 1 cup vegetables; 1 tsp oil; 2–3 tbsp water; suitable curry seasoning.',
    },
  ],
  'Non-vegetarian': [
    {
      mealName: 'Breakfast',
      dishTitle: 'Oats or poha + milk + fruit',
      quantity: '50 g dry oats cooked with 250 ml milk OR 1.5 cups cooked poha + 250 ml milk + 1 fruit',
      proteinEstimate: '~14–18 g protein',
      preparationSteps: 'Cook oats with milk until soft, or prepare poha. Serve with milk and fruit.',
      ingredients: '50 g dry oats cooked with 250 ml milk OR 1.5 cups cooked poha + 250 ml milk + 1 fruit.',
    },
    {
      mealName: 'Lunch',
      dishTitle: 'Rice/roti + chicken/fish + dal + vegetables',
      quantity: '1.5 cups cooked rice OR 3 rotis + 100–120 g cooked chicken/fish + 1 cup dal + 1 cup vegetables',
      proteinEstimate: '~30–35 g protein',
      preparationSteps: 'Cook chicken/fish thoroughly with suitable seasoning. Prepare dal, rice/rotis and vegetables. Serve together.',
      ingredients: '1.5 cups cooked rice OR 3 rotis + 100–120 g cooked chicken/fish + 1 cup dal + 1 cup vegetables.',
    },
    {
      mealName: 'Snack',
      dishTitle: 'Curd + fruit + roasted chana',
      quantity: '200 g curd + 1 fruit + 25–30 g roasted chana',
      proteinEstimate: '~10–14 g protein',
      preparationSteps: 'Wash and cut the fruit. Serve with curd and roasted chana.',
      ingredients: '200 g curd + 1 fruit + 25–30 g roasted chana.',
    },
    {
      mealName: 'Dinner',
      dishTitle: 'Roti + chicken/egg curry + vegetables',
      quantity: '3 rotis + 100 g cooked chicken OR 2 eggs + 1 cup vegetables',
      proteinEstimate: '~25–32 g protein',
      preparationSteps: 'Cook chicken thoroughly or cook eggs thoroughly in the curry. Prepare vegetables and serve with warm rotis.',
      ingredients: '3 rotis + 100 g cooked chicken OR 2 eggs + 1 cup vegetables.',
    },
  ],
  Jain: [
    {
      mealName: 'Breakfast',
      dishTitle: 'Jain-style poha/upma + milk/curd + fruit',
      quantity: '1.5 cups Jain-style poha/upma + 250 ml milk OR 150 g curd + 1 fruit',
      proteinEstimate: '~12–18 g protein',
      preparationSteps: 'Prepare the poha/upma using ingredients that match your own Jain practice. Serve with milk or curd and fruit.',
      ingredients: '1.5 cups Jain-style poha/upma; 250 ml milk OR 150 g curd; 1 fruit.',
    },
    {
      mealName: 'Lunch',
      dishTitle: 'Dal + rice/roti + suitable vegetables + curd',
      quantity: '1.25 cups cooked dal + 1.5 cups rice OR 3 rotis + 1 cup suitable vegetables + 150 g curd',
      proteinEstimate: '~20–25 g protein',
      preparationSteps: 'Cook dal and season according to your practice. Prepare rice/rotis and suitable vegetables. Serve with curd.',
      ingredients: '1.25 cups cooked dal; 1.5 cups rice OR 3 rotis; 1 cup suitable vegetables; 150 g curd.',
    },
    {
      mealName: 'Snack',
      dishTitle: 'Fruit + roasted chana or suitable nuts',
      quantity: '1 fruit + 35–40 g roasted chana OR 25–30 g suitable nuts',
      proteinEstimate: '~6–9 g protein',
      preparationSteps: 'Prepare the fruit and serve with the chosen snack. Check all ingredients against your own Jain practice.',
      ingredients: '1 fruit + 35–40 g roasted chana OR 25–30 g suitable nuts.',
    },
    {
      mealName: 'Dinner',
      dishTitle: 'Roti + paneer/curd-based dish + suitable vegetables',
      quantity: '3 rotis + 100 g paneer OR 200 g curd-based dish + 1 cup suitable vegetables',
      proteinEstimate: '~20–27 g protein',
      preparationSteps: 'Cook the paneer or curd-based dish with ingredients permitted by your practice. Prepare suitable vegetables and serve with rotis.',
      ingredients: '3 rotis + 100 g paneer OR 200 g curd-based dish + 1 cup suitable vegetables.',
    },
  ],
  'Mostly plant-based': [
    {
      mealName: 'Breakfast',
      dishTitle: 'Oats with soy milk + banana + seeds',
      quantity: '50 g dry oats + 250 ml fortified soy milk + 1 banana + 10 g seeds',
      proteinEstimate: '~15–20 g protein',
      preparationSteps: 'Cook oats with soy milk or soak until soft. Top with banana and seeds.',
      ingredients: '50 g dry oats + 250 ml fortified soy milk + 1 banana + 10 g seeds.',
    },
    {
      mealName: 'Lunch',
      dishTitle: 'Rajma/chana + rice + vegetables',
      quantity: '1.25 cups cooked rajma/chana + 1.5 cups cooked rice + 1 cup vegetables',
      proteinEstimate: '~18–24 g protein',
      preparationSteps: 'Cook beans until tender and season. Prepare rice and vegetables. Serve together.',
      ingredients: '1.25 cups cooked rajma/chana + 1.5 cups cooked rice + 1 cup vegetables.',
    },
    {
      mealName: 'Snack',
      dishTitle: 'Roasted chana + fruit',
      quantity: '40 g roasted chana + 1 medium fruit',
      proteinEstimate: '~6–8 g protein',
      preparationSteps: 'Wash and cut the fruit if needed. Serve with roasted chana.',
      ingredients: '40 g roasted chana + 1 medium fruit.',
    },
    {
      mealName: 'Dinner',
      dishTitle: 'Roti + tofu/soy + vegetables',
      quantity: '3 rotis + 120 g tofu OR 60–70 g dry soy chunks + 1 cup vegetables',
      proteinEstimate: '~20–27 g protein',
      preparationSteps: 'If using soy, soak and cook it. Cook tofu or soy with vegetables and seasoning. Serve with warm rotis.',
      ingredients: '3 rotis + 120 g tofu OR 60–70 g dry soy chunks + 1 cup vegetables.',
    },
  ],
};

export const ALTERNATIVES_DATA: Record<FoodStyle, Record<string, MealAlternative[]>> = {
  Vegetarian: {
    Breakfast: [
      { name: 'Besan chilla', description: '2 medium besan chillas + curd + fruit' },
      { name: 'Idli + sambar', description: '3 idlis + 1 cup sambar + fruit' },
      { name: 'Paneer toast', description: '2 slices toast + 60–80 g paneer + tomato/cucumber' },
    ],
    Lunch: [
      { name: 'Roti + dal', description: '3 rotis + 1.25 cups dal + vegetables + curd' },
      { name: 'Rajma rice', description: '1.25 cups rajma + 1.5 cups rice + vegetables' },
      { name: 'Paneer bowl', description: '100 g paneer + rice/roti + vegetables' },
    ],
    Snack: [
      { name: 'Fruit + curd', description: '1 fruit + 150–200 g curd' },
      { name: 'Chana chaat', description: '35–40 g roasted/cooked chana + vegetables + lemon' },
      { name: 'Milk + fruit', description: '250 ml milk + 1 fruit' },
    ],
    Dinner: [
      { name: 'Khichdi + curd', description: '1.5–2 cups khichdi + 150 g curd + vegetables' },
      { name: 'Roti + dal', description: '3 rotis + 1.25 cups dal + vegetables' },
      { name: 'Tofu/soy bowl', description: 'Tofu or soy + rice/roti + vegetables' },
    ],
  },
  Eggetarian: {
    Breakfast: [
      { name: 'Besan chilla + curd', description: '2 medium besan chillas + curd + fruit' },
      { name: 'Idli + sambar + eggs', description: '3 idlis + 1 cup sambar + 2 eggs' },
      { name: 'Egg toast', description: '2 eggs + 2 slices toast + fruit' },
    ],
    Lunch: [
      { name: 'Roti + dal + curd', description: '3 rotis + 1.25 cups dal + vegetables + curd' },
      { name: 'Rajma rice + eggs', description: '1.25 cups rajma + 1.5 cups rice + 2 eggs' },
      { name: 'Paneer bowl', description: '100 g paneer + rice/roti + vegetables' },
    ],
    Snack: [
      { name: 'Fruit + curd', description: '1 fruit + 150–200 g curd' },
      { name: 'Chana chaat', description: '35–40 g roasted/cooked chana + vegetables + lemon' },
      { name: 'Egg + fruit', description: '2 boiled eggs + 1 fruit' },
    ],
    Dinner: [
      { name: 'Khichdi + curd', description: '1.5–2 cups khichdi + 150 g curd + vegetables' },
      { name: 'Roti + egg curry', description: '3 rotis + 2 eggs in curry + vegetables' },
      { name: 'Paneer/tofu bowl', description: '100 g paneer OR tofu + rice/roti + vegetables' },
    ],
  },
  'Non-vegetarian': {
    Breakfast: [
      { name: 'Besan chilla + curd', description: '2 medium besan chillas + curd + fruit' },
      { name: 'Egg toast', description: '2 eggs + 2 slices toast + fruit' },
      { name: 'Chicken sandwich', description: '2 slices bread + 70–90 g cooked chicken + vegetables' },
    ],
    Lunch: [
      { name: 'Roti + chicken', description: '3 rotis + 100–120 g cooked chicken + vegetables + curd' },
      { name: 'Rajma rice + chicken', description: '1 cup rajma + 1.5 cups rice + 80–100 g cooked chicken' },
      { name: 'Fish rice bowl', description: '1.5 cups rice + 100–120 g cooked fish + vegetables' },
    ],
    Snack: [
      { name: 'Curd + fruit + chana', description: '200 g curd + 1 fruit + 25–30 g roasted chana' },
      { name: 'Egg + fruit', description: '2 eggs + 1 fruit' },
      { name: 'Chicken wrap', description: '1 roti/wrap + 70–90 g cooked chicken + vegetables' },
    ],
    Dinner: [
      { name: 'Roti + chicken', description: '3 rotis + 100–120 g cooked chicken + vegetables' },
      { name: 'Fish + rice', description: '1.5 cups rice + 100–120 g cooked fish + vegetables' },
      { name: 'Egg curry + roti', description: '3 rotis + 2 eggs in curry + vegetables' },
    ],
  },
  Jain: {
    Breakfast: [
      { name: 'Jain besan chilla', description: '2 medium Jain-style besan chillas + curd + fruit' },
      { name: 'Jain poha + curd', description: '1.5 cups Jain-style poha + 150 g curd + fruit' },
      { name: 'Milk + suitable grain', description: '250 ml milk + suitable grain-based breakfast + fruit' },
    ],
    Lunch: [
      { name: 'Roti + dal', description: '3 rotis + 1.25 cups dal + suitable vegetables + curd' },
      { name: 'Rajma rice', description: '1.25 cups rajma + 1.5 cups rice + suitable vegetables' },
      { name: 'Paneer bowl', description: '100 g paneer + rice/roti + suitable vegetables' },
    ],
    Snack: [
      { name: 'Fruit + curd', description: '1 fruit + 150–200 g curd' },
      { name: 'Roasted chana', description: '35–40 g roasted chana + suitable fruit' },
      { name: 'Milk + fruit', description: '250 ml milk + 1 fruit' },
    ],
    Dinner: [
      { name: 'Jain khichdi + curd', description: '1.5–2 cups Jain-style khichdi + 150 g curd' },
      { name: 'Roti + paneer', description: '3 rotis + 100 g paneer + suitable vegetables' },
      { name: 'Roti + dal', description: '3 rotis + 1.25 cups dal + suitable vegetables' },
    ],
  },
  'Mostly plant-based': {
    Breakfast: [
      { name: 'Tofu scramble toast', description: '2 slices toast + 100 g tofu + vegetables' },
      { name: 'Besan chilla', description: '2 medium besan chillas + fruit' },
      { name: 'Oats + soy milk', description: '50 g oats + 250 ml fortified soy milk + fruit' },
    ],
    Lunch: [
      { name: 'Rajma rice', description: '1.25 cups rajma + 1.5 cups rice + vegetables' },
      { name: 'Chana roti bowl', description: '1.25 cups chana + 3 rotis + vegetables' },
      { name: 'Tofu rice bowl', description: '120 g tofu + rice + vegetables' },
    ],
    Snack: [
      { name: 'Roasted chana + fruit', description: '40 g roasted chana + 1 fruit' },
      { name: 'Soy yogurt + fruit', description: '150–200 g unsweetened soy yogurt + fruit' },
      { name: 'Peanut chaat', description: '25–30 g peanuts + vegetables + lemon' },
    ],
    Dinner: [
      { name: 'Tofu/soy bowl', description: '120 g tofu OR 60–70 g dry soy chunks + rice/roti + vegetables' },
      { name: 'Dal + rice', description: '1.25 cups dal + 1.5 cups rice + vegetables' },
      { name: 'Chana roti', description: '1.25 cups chana + 3 rotis + vegetables' },
    ],
  },
};

export function getBudgetText(budget: string): string {
  if (budget.includes('100')) {
    return 'Favor affordable staples such as dal, chana, beans, rice, roti, poha, oats and seasonal vegetables.';
  }
  if (budget.includes('200')) {
    return 'Use affordable staples as the base and add higher-cost foods selectively.';
  }
  return 'Compare the cost of the whole meal and use flexible substitutions when an ingredient is expensive.';
}

export function getGoalText(goal: string): string {
  if (goal === 'Muscle & strength support') {
    return 'Regular meals with protein-containing foods, carbohydrates for activity, vegetables/fruit and enough fluids can support training and recovery.';
  }
  if (goal === 'Study-day nutrition') {
    return 'For long study or coaching days, choose practical foods that are easy to carry and avoid very long gaps between meals.';
  }
  if (goal === 'More daily energy') {
    return 'Aim for regular balanced meals and snacks that fit your schedule.';
  }
  return 'Think in terms of variety, regular meals and foods you can realistically repeat.';
}

export { calculatePersonalizedNutrition } from '../utils/nutritionEngine';
export type { NutritionEngineOutput, NutritionEngineInput, MacroBreakdown } from '../utils/nutritionEngine';
