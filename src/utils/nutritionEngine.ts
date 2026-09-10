import { 
  AgeGroup, 
  Sex, 
  ActivityLevel, 
  FoodStyle, 
  MainGoal, 
  EnergyGoal, 
  BudgetTier, 
  MealItem, 
  MealAlternative 
} from '../types';

export interface MacroBreakdown {
  protein: number;       // in grams
  carbs: number;         // in grams
  fats: number;          // in grams
  fiber: number;         // in grams
  proteinCal: number;
  carbsCal: number;
  fatsCal: number;
  proteinPct: number;
  carbsPct: number;
  fatsPct: number;
}

export interface NutritionEngineOutput {
  bmr: number;
  tdee: number;
  targetCalories: number;
  calorieRange: { low: number; high: number };
  bulkRange: { low: number; high: number };
  cutRange: { low: number; high: number };
  recompRange: { low: number; high: number };
  macros: MacroBreakdown;
  calorieTier: 'cutting' | 'moderate' | 'bulking';
  budgetCategory: 'budget_low' | 'budget_mid' | 'budget_high';
  isBiometricEstimated: boolean;
  meals: MealItem[];
  alternatives: Record<string, MealAlternative[]>;
  budgetExecutionPlan: string;
  goalRationale: string;
  summaryHighlights: string[];
}

export interface NutritionEngineInput {
  ageGroup: AgeGroup;
  exactAge?: string;
  height?: string;
  weight?: string;
  sex?: Sex;
  activity?: ActivityLevel;
  foodStyle: FoodStyle;
  mainGoal: MainGoal;
  energyGoal: EnergyGoal;
  budget: BudgetTier;
}

/**
 * Intelligent Nutrition Engine that calculates BMR, TDEE, targeted energy deficits/surpluses,
 * exact macronutrient distributions, and dynamically builds 4-stage meal protocols
 * scaled to the user's biometrics, dietary ethics, and daily financial budget.
 */
export function calculatePersonalizedNutrition(input: NutritionEngineInput): NutritionEngineOutput {
  const {
    ageGroup,
    exactAge,
    height,
    weight,
    sex = 'Male',
    activity = 'Moderate',
    foodStyle = 'Vegetarian',
    mainGoal = 'Muscle & strength support',
    energyGoal = 'Maintenance',
    budget = 'Flexible / unknown',
  } = input;

  // 1. Determine resolved numeric biometrics with intelligent age-bracket fallbacks
  let ageNum = parseInt(exactAge || '', 10);
  let isBiometricEstimated = false;

  if (isNaN(ageNum) || ageNum <= 0) {
    isBiometricEstimated = true;
    switch (ageGroup) {
      case '13–17': ageNum = 16; break;
      case '18–25': ageNum = 22; break;
      case '26–40': ageNum = 30; break;
      case '41–60': ageNum = 48; break;
      case '61+': ageNum = 65; break;
      default: ageNum = 25;
    }
  }

  let heightNum = parseFloat(height || '');
  if (isNaN(heightNum) || heightNum < 100 || heightNum > 240) {
    isBiometricEstimated = true;
    heightNum = sex === 'Female' ? 162 : 174;
  }

  let weightNum = parseFloat(weight || '');
  if (isNaN(weightNum) || weightNum < 30 || weightNum > 250) {
    isBiometricEstimated = true;
    weightNum = sex === 'Female' ? 58 : 72;
  }

  // 2. Compute BMR using Mifflin-St Jeor Formula
  // Men: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) + 5
  // Women: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) - 161
  const baseBMR = (10 * weightNum) + (6.25 * heightNum) - (5 * ageNum) + (sex === 'Male' ? 5 : -161);
  const bmr = Math.max(1000, Math.round(baseBMR));

  // 3. Activity Multipliers (Total Daily Energy Expenditure)
  const activityMultiplier = activity === 'Light' ? 1.375 : activity === 'High' ? 1.725 : 1.55;
  const tdee = Math.round(bmr * activityMultiplier);

  // 4. Strategic Energy Targets based on EnergyGoal
  const bulkLow = Math.round(tdee * 1.08);
  const bulkHigh = Math.round(tdee * 1.15);
  const cutLow = Math.round(tdee * 0.82);
  const cutHigh = Math.round(tdee * 0.88);
  const recompLow = Math.round(tdee * 0.93);
  const recompHigh = Math.round(tdee * 0.98);

  let targetCalories = tdee;
  let calLow = Math.round(tdee * 0.97);
  let calHigh = Math.round(tdee * 1.03);

  if (energyGoal === 'Muscle-building surplus') {
    targetCalories = Math.round(tdee * 1.10); // +10% hypertrophy surplus
    calLow = bulkLow;
    calHigh = bulkHigh;
  } else if (energyGoal === 'Fat-loss deficit') {
    targetCalories = Math.round(tdee * 0.85); // -15% sustainable fat loss deficit
    calLow = cutLow;
    calHigh = cutHigh;
  } else if (energyGoal === 'Recomposition') {
    targetCalories = Math.round(tdee * 0.95); // -5% lean recomp with high protein
    calLow = recompLow;
    calHigh = recompHigh;
  }

  // Safety floor for calories
  if (sex === 'Female' && targetCalories < 1250) targetCalories = 1250;
  if (sex === 'Male' && targetCalories < 1500) targetCalories = 1500;

  // 5. Determine Calorie Tier
  let calorieTier: 'cutting' | 'moderate' | 'bulking' = 'moderate';
  if (targetCalories < 1850) {
    calorieTier = 'cutting';
  } else if (targetCalories > 2450) {
    calorieTier = 'bulking';
  }

  // 6. Determine Budget Tier
  let budgetCategory: 'budget_low' | 'budget_mid' | 'budget_high' = 'budget_mid';
  if (budget.includes('100')) {
    budgetCategory = 'budget_low';
  } else if (budget.includes('350') || budget.includes('Flexible')) {
    budgetCategory = 'budget_high';
  }

  // 7. Macronutrient Calculations tailored to the athlete's goals
  // Protein multiplier (g/kg):
  // Muscle building or Cut: 2.0g to 2.2g/kg (to preserve LBM in deficit or build MPS in surplus)
  // Balanced: 1.6g to 1.8g/kg
  let proteinPerKg = 1.8;
  if (energyGoal === 'Muscle-building surplus' || energyGoal === 'Fat-loss deficit' || mainGoal === 'Muscle & strength support') {
    proteinPerKg = 2.0;
  }
  let targetProtein = Math.round(weightNum * proteinPerKg);
  // Bounds
  targetProtein = Math.max(65, Math.min(240, targetProtein));

  // Fats: 25% of target calories
  const fatsCal = Math.round(targetCalories * 0.25);
  const targetFats = Math.max(35, Math.round(fatsCal / 9));

  // Carbs: Remaining calories
  const proteinCal = targetProtein * 4;
  const remainingCalForCarbs = Math.max(200, targetCalories - proteinCal - (targetFats * 9));
  const targetCarbs = Math.round(remainingCalForCarbs / 4);

  // Fiber target: 14g per 1000 kcal
  const targetFiber = Math.round((targetCalories / 1000) * 14);

  const totalCalculatedCalories = (targetProtein * 4) + (targetCarbs * 4) + (targetFats * 9);
  const proteinPct = Math.round((proteinCal / totalCalculatedCalories) * 100);
  const fatsPct = Math.round(((targetFats * 9) / totalCalculatedCalories) * 100);
  const carbsPct = 100 - proteinPct - fatsPct;

  const macros: MacroBreakdown = {
    protein: targetProtein,
    carbs: targetCarbs,
    fats: targetFats,
    fiber: targetFiber,
    proteinCal,
    carbsCal: targetCarbs * 4,
    fatsCal: targetFats * 9,
    proteinPct,
    carbsPct,
    fatsPct,
  };

  // 8. Generate 4 Personalized Meals Scaled to Calorie Tier & Budget
  const meals = generateDynamicMeals({
    foodStyle,
    calorieTier,
    budgetCategory,
    energyGoal,
    mainGoal,
    targetCalories,
    targetProtein,
    weightNum,
  });

  // 9. Generate Contextual Alternatives
  const alternatives = generateDynamicAlternatives(foodStyle, budgetCategory, calorieTier);

  // 10. Budget Execution Strategy Text
  const budgetExecutionPlan = getDynamicBudgetText(budget, budgetCategory, foodStyle);

  // 11. Goal Rationale Text
  const goalRationale = getDynamicGoalRationale(mainGoal, energyGoal, targetCalories, targetProtein);

  const summaryHighlights = [
    `${targetCalories.toLocaleString()} kcal target calibrated for ${energyGoal.toLowerCase()}`,
    `${targetProtein}g protein (${proteinPerKg}g/kg) to maximize muscle protein synthesis`,
    `${calorieTier.toUpperCase()} portion scaling applied to all 4 daily meals`,
    budgetCategory === 'budget_low' 
      ? 'Max-efficiency protein staples: soya chunks, sattu, seasonal dal & eggs'
      : budgetCategory === 'budget_mid'
      ? 'Balanced clean athletic staples: fresh curd, paneer, and lean grains'
      : 'Premium sports nutrition sources with optimal micronutrient density',
  ];

  return {
    bmr,
    tdee,
    targetCalories,
    calorieRange: { low: calLow, high: calHigh },
    bulkRange: { low: bulkLow, high: bulkHigh },
    cutRange: { low: cutLow, high: cutHigh },
    recompRange: { low: recompLow, high: recompHigh },
    macros,
    calorieTier,
    budgetCategory,
    isBiometricEstimated,
    meals,
    alternatives,
    budgetExecutionPlan,
    goalRationale,
    summaryHighlights,
  };
}

interface MealGenParams {
  foodStyle: FoodStyle;
  calorieTier: 'cutting' | 'moderate' | 'bulking';
  budgetCategory: 'budget_low' | 'budget_mid' | 'budget_high';
  energyGoal: EnergyGoal;
  mainGoal: MainGoal;
  targetCalories: number;
  targetProtein: number;
  weightNum: number;
}

function generateDynamicMeals(params: MealGenParams): MealItem[] {
  const { foodStyle, calorieTier, budgetCategory } = params;

  // Calorie & Portion Modifiers
  const isCut = calorieTier === 'cutting';
  const isBulk = calorieTier === 'bulking';
  const isLowBudget = budgetCategory === 'budget_low';
  const isHighBudget = budgetCategory === 'budget_high';

  // Dynamic Portion Variables
  const rotiCount = isCut ? '2' : isBulk ? '4' : '3';
  const riceCups = isCut ? '1 cup' : isBulk ? '2 cups' : '1.5 cups';
  const dalCups = isBulk ? '1.5 cups' : '1.25 cups';
  const curdGrams = isCut ? '120 g low-fat curd' : isBulk ? '200 g whole curd' : '150 g curd';

  // 1. VEGETARIAN PROTOCOL
  if (foodStyle === 'Vegetarian') {
    if (isLowBudget) {
      return [
        {
          mealName: 'Breakfast',
          dishTitle: isCut 
            ? 'Spiced Chana Sattu Drink + Roasted Peanuts'
            : isBulk
            ? 'High-Calorie Sattu Banana Shake + Poha with Peanuts'
            : 'Sattu Buttermilk Cooler + Vegetable Poha',
          quantity: isCut 
            ? '35 g roasted sattu flour mixed in 300 ml water/buttermilk + 15 g roasted peanuts'
            : isBulk
            ? '50 g sattu blended with 250 ml milk & 1 banana + 1.5 cups cooked poha with 25 g peanuts'
            : '40 g sattu in 250 ml light chaas + 1.5 cups cooked poha with 15 g peanuts',
          proteinEstimate: isCut ? '~15–18 g protein' : isBulk ? '~26–30 g protein' : '~20–24 g protein',
          caloriesEstimate: isCut ? '~340 kcal' : isBulk ? '~680 kcal' : '~490 kcal',
          macroSplit: isCut ? '18P / 42C / 10F' : isBulk ? '28P / 98C / 18F' : '22P / 65C / 14F',
          budgetTip: 'Sattu provides 20g pure plant protein per 100g at less than ₹12/portion.',
          preparationSteps: 'Whisk sattu flour into cold water or buttermilk with roasted cumin, black salt, and lemon. Rinse poha, sauté with mustard seeds, green chilies, onions and roasted peanuts.',
          ingredients: '35–50 g chana sattu; 1.5 cups poha; 15–25 g peanuts; lemon; green chili; rock salt.',
        },
        {
          mealName: 'Lunch',
          dishTitle: 'Double Dal Tadka + Rice or Roti + Mixed Sabzi',
          quantity: `${dalCups} thick cooked yellow/black dal + ${rotiCount} rotis OR ${riceCups} steamed rice + 1 cup green vegetables`,
          proteinEstimate: isCut ? '~22–26 g protein' : isBulk ? '~30–35 g protein' : '~25–28 g protein',
          caloriesEstimate: isCut ? '~480 kcal' : isBulk ? '~780 kcal' : '~610 kcal',
          macroSplit: isCut ? '24P / 76C / 8F' : isBulk ? '32P / 125C / 15F' : '26P / 98C / 11F',
          budgetTip: 'Combining whole grains with legumes forms a complete amino acid profile at minimal cost.',
          preparationSteps: 'Pressure cook mixed lentils (toor + masoor) until tender. Temper with cumin, garlic, tomato and 1 tsp oil. Serve warm with rotis or steamed rice.',
          ingredients: `1.25–1.5 cups cooked dal; ${rotiCount} rotis or ${riceCups} rice; 1 cup seasonal vegetables (beans, pumpkin, spinach); 1 tsp oil; spices.`,
        },
        {
          mealName: 'Snack',
          dishTitle: 'Roasted Bhuna Chana + Seasonal Fruit + Green Tea',
          quantity: isCut ? '35 g roasted chana + 1 guava or apple' : isBulk ? '55 g roasted chana + 2 medium bananas' : '45 g roasted chana + 1 medium fruit',
          proteinEstimate: isCut ? '~8–10 g protein' : isBulk ? '~14–16 g protein' : '~10–12 g protein',
          caloriesEstimate: isCut ? '~190 kcal' : isBulk ? '~390 kcal' : '~260 kcal',
          macroSplit: isCut ? '9P / 32C / 3F' : isBulk ? '15P / 68C / 6F' : '11P / 46C / 4F',
          budgetTip: 'Bhuna chana costs approx ₹8 per 50g and provides high fiber, zinc and clean carbs.',
          preparationSteps: 'Ready-to-eat dry roasted chana paired with fresh fruit and hot green tea. No cooking required.',
          ingredients: '35–55 g roasted Bengal gram (bhuna chana); 1–2 seasonal fruits.',
        },
        {
          mealName: 'Dinner',
          dishTitle: 'High-Protein Soya Chunks Bhurji/Curry + Roti + Cucumber Salad',
          quantity: isCut 
            ? `50 g dry soya chunks (boiled ~150 g) + ${rotiCount} rotis + 1 plate cucumber tomato salad`
            : isBulk
            ? `75 g dry soya chunks (boiled ~220 g) + ${rotiCount} rotis + 1 plate vegetable salad + 100 g curd`
            : `65 g dry soya chunks (boiled ~190 g) + ${rotiCount} rotis + 1 plate vegetable salad`,
          proteinEstimate: isCut ? '~30–34 g protein' : isBulk ? '~42–48 g protein' : '~35–40 g protein',
          caloriesEstimate: isCut ? '~420 kcal' : isBulk ? '~720 kcal' : '~560 kcal',
          macroSplit: isCut ? '32P / 58C / 7F' : isBulk ? '45P / 92C / 16F' : '37P / 74C / 10F',
          budgetTip: 'Soya chunks contain 52% protein by weight, delivering over 30g protein for just ₹10!',
          preparationSteps: 'Boil dry soya chunks in salted water for 6 minutes, drain and squeeze out excess water. Sauté with onion, tomato, ginger-garlic paste and turmeric. Simmer into a dry bhurji or thick curry. Serve with warm rotis.',
          ingredients: `50–75 g dry soya chunks; ${rotiCount} whole-wheat rotis; 1 cup vegetables; spices.`,
        },
      ];
    } else {
      // Mid & High Budget Vegetarian
      const paneerAmount = isCut ? '80 g low-fat paneer' : isBulk ? '140 g fresh paneer' : '110 g paneer';
      return [
        {
          mealName: 'Breakfast',
          dishTitle: isHighBudget
            ? 'Protein Oats Bowl with Seeds & Berries (or Paneer Paratha)'
            : 'Paneer Stuffed Besan Chilla + Fresh Curd',
          quantity: isHighBudget
            ? `${isCut ? '40 g' : isBulk ? '70 g' : '50 g'} oats cooked in 250 ml milk + 15 g chia/pumpkin seeds + 1 fruit`
            : `2 medium besan chillas stuffed with ${isCut ? '50 g' : '75 g'} grated paneer + 150 g curd`,
          proteinEstimate: isCut ? '~22–26 g protein' : isBulk ? '~32–36 g protein' : '~26–30 g protein',
          caloriesEstimate: isCut ? '~380 kcal' : isBulk ? '~690 kcal' : '~520 kcal',
          macroSplit: isCut ? '24P / 46C / 11F' : isBulk ? '34P / 88C / 22F' : '28P / 62C / 16F',
          budgetTip: 'Besan and paneer create a synergistic amino acid combo with high morning satiety.',
          preparationSteps: 'Mix gram flour with carom seeds and water into smooth batter. Cook on non-stick skillet with minimal ghee. Stuff with grated paneer and serve with curd.',
          ingredients: 'Besan flour; 50–75 g paneer; 150 g curd; green chilies, cilantro, spices.',
        },
        {
          mealName: 'Lunch',
          dishTitle: 'Dal Tadka + Roti or Basmati Rice + Mixed Sabzi + Curd',
          quantity: `${dalCups} dal + ${rotiCount} rotis OR ${riceCups} rice + 1 cup vegetables + ${curdGrams}`,
          proteinEstimate: isCut ? '~24–28 g protein' : isBulk ? '~34–38 g protein' : '~28–32 g protein',
          caloriesEstimate: isCut ? '~510 kcal' : isBulk ? '~820 kcal' : '~640 kcal',
          macroSplit: isCut ? '26P / 78C / 10F' : isBulk ? '36P / 122C / 19F' : '30P / 94C / 14F',
          budgetTip: 'Curd adds essential gut probiotics to enhance amino acid absorption and gut motility.',
          preparationSteps: 'Simmer dal with turmeric and salt. Temper with jeera, hing and tomatoes. Steam rice or cook rotis fresh. Serve alongside seasoned seasonal vegetables and chilled curd.',
          ingredients: `1.25 cups dal; ${rotiCount} rotis or rice; 1 cup vegetables; ${curdGrams}; 1 tsp ghee/oil.`,
        },
        {
          mealName: 'Snack',
          dishTitle: isHighBudget
            ? 'Greek Yogurt Parfait with Roasted Almonds & Fruit'
            : 'Roasted Chana + Fruit + Curd or Paneer Cubes',
          quantity: isHighBudget
            ? '150 g Greek yogurt + 20 g raw almonds + 1 cup berries or sliced apple'
            : `${isCut ? '35 g' : '50 g'} roasted chana + 1 medium fruit + 40 g paneer cubes`,
          proteinEstimate: isCut ? '~12–15 g protein' : isBulk ? '~18–22 g protein' : '~14–17 g protein',
          caloriesEstimate: isCut ? '~210 kcal' : isBulk ? '~390 kcal' : '~280 kcal',
          macroSplit: isCut ? '14P / 28C / 5F' : isBulk ? '20P / 48C / 12F' : '16P / 36C / 8F',
          budgetTip: 'Slow-digesting casein and healthy fats prevent mid-afternoon energy crashes.',
          preparationSteps: 'Lightly toss paneer with chaat masala or fold fruits and nuts directly into thick yogurt.',
          ingredients: 'Greek yogurt or curd; roasted chana/almonds; seasonal fruit.',
        },
        {
          mealName: 'Dinner',
          dishTitle: 'Matar Paneer / Tofu Soya Curry + Whole Wheat Rotis + Salad',
          quantity: `${rotiCount} rotis + ${paneerAmount} in light tomato-onion gravy + 1 plate green salad`,
          proteinEstimate: isCut ? '~26–30 g protein' : isBulk ? '~38–44 g protein' : '~32–36 g protein',
          caloriesEstimate: isCut ? '~460 kcal' : isBulk ? '~760 kcal' : '~590 kcal',
          macroSplit: isCut ? '28P / 52C / 14F' : isBulk ? '40P / 88C / 26F' : '34P / 68C / 19F',
          budgetTip: 'Paneer provides slow-releasing micellar casein, supplying amino acids during night-time recovery.',
          preparationSteps: 'Dice paneer or tofu. Sauté ginger, garlic, tomatoes and garam masala. Add green peas and paneer cubes, simmering gently for 6 minutes. Serve with hot rotis.',
          ingredients: `${paneerAmount}; ${rotiCount} rotis; 1/2 cup green peas; tomato puree; onion; spices.`,
        },
      ];
    }
  }

  // 2. EGGETARIAN PROTOCOL
  if (foodStyle === 'Eggetarian') {
    const eggCountBreakfast = isCut ? '3 Whole Boiled Eggs (or 4 Egg Whites + 1 Whole)' : isBulk ? '4 Whole Eggs + 2 Slices Toast' : '3 Whole Eggs';
    const eggCountDinner = isCut ? '2 Whole Eggs in Curry' : isBulk ? '3 Whole Eggs in Rich Curry' : '2-3 Eggs in Curry';

    return [
      {
        mealName: 'Breakfast',
        dishTitle: isCut ? 'Scrambled Eggs / Boiled Eggs + Whole Wheat Toast' : 'Herb Egg Bhurji with Rotis or Brown Bread + Fruit',
        quantity: `${eggCountBreakfast} + ${isCut ? '1 slice toast' : isBulk ? '3 slices bread / 2 rotis' : '2 slices bread'} + 1 fruit`,
        proteinEstimate: isCut ? '~22–26 g protein' : isBulk ? '~32–36 g protein' : '~26–30 g protein',
        caloriesEstimate: isCut ? '~340 kcal' : isBulk ? '~650 kcal' : '~480 kcal',
        macroSplit: isCut ? '24P / 28C / 12F' : isBulk ? '34P / 74C / 22F' : '28P / 48C / 16F',
        budgetTip: 'Whole eggs deliver complete protein with 100% biological value at ~₹7 per egg.',
        preparationSteps: 'Heat 1 tsp oil, sauté finely chopped onions, tomatoes and green chilies. Whisk whole eggs with salt and pepper, scramble softly until cooked through.',
        ingredients: '3–4 fresh eggs; onions, tomatoes, green chilies; 1–2 slices whole-wheat bread; 1 fruit.',
      },
      {
        mealName: 'Lunch',
        dishTitle: 'Dal Tadka + Steamed Rice or Roti + Green Sabzi + Curd',
        quantity: `${dalCups} dal + ${rotiCount} rotis OR ${riceCups} rice + 1 cup vegetables + ${curdGrams}`,
        proteinEstimate: isCut ? '~22–26 g protein' : isBulk ? '~32–36 g protein' : '~26–30 g protein',
        caloriesEstimate: isCut ? '~490 kcal' : isBulk ? '~790 kcal' : '~620 kcal',
        macroSplit: isCut ? '24P / 76C / 9F' : isBulk ? '34P / 118C / 18F' : '28P / 92C / 13F',
        budgetTip: 'Combining dal, rice, and curd provides complete amino acids and digestive enzymes.',
        preparationSteps: 'Cook yellow dal with mild spices. Prepare rice or rotis. Serve alongside seasonal vegetable curry and fresh curd.',
        ingredients: `1.25 cups dal; ${rotiCount} rotis or rice; 1 cup vegetables; ${curdGrams}.`,
      },
      {
        mealName: 'Snack',
        dishTitle: 'Boiled Egg Whites / Roasted Chana + Fruit',
        quantity: isCut ? '2 Boiled Egg Whites + 30 g roasted chana + 1 apple' : isBulk ? '2 Whole Boiled Eggs + 45 g roasted chana + 1 banana' : '1 Whole Boiled Egg + 35 g roasted chana + 1 fruit',
        proteinEstimate: isCut ? '~12–15 g protein' : isBulk ? '~18–22 g protein' : '~14–17 g protein',
        caloriesEstimate: isCut ? '~190 kcal' : isBulk ? '~380 kcal' : '~260 kcal',
        macroSplit: isCut ? '14P / 26C / 3F' : isBulk ? '20P / 46C / 11F' : '16P / 34C / 6F',
        budgetTip: 'High leucine in egg whites accelerates post-workout protein signaling.',
        preparationSteps: 'Boil eggs for 9 minutes, peel and slice. Season with chaat masala and black pepper.',
        ingredients: '1–2 boiled eggs; 30–45 g roasted chana; seasonal fruit.',
      },
      {
        mealName: 'Dinner',
        dishTitle: 'Homestyle Egg Curry + Whole Wheat Roti + Cucumber Onion Salad',
        quantity: `${eggCountDinner} simmered in tomato onion gravy + ${rotiCount} rotis + 1 plate fresh salad`,
        proteinEstimate: isCut ? '~24–28 g protein' : isBulk ? '~34–38 g protein' : '~28–32 g protein',
        caloriesEstimate: isCut ? '~430 kcal' : isBulk ? '~740 kcal' : '~570 kcal',
        macroSplit: isCut ? '26P / 50C / 14F' : isBulk ? '36P / 88C / 24F' : '30P / 66C / 18F',
        budgetTip: 'Eggs absorb aromatic spices readily, creating a filling, high-protein athletic dinner.',
        preparationSteps: 'Boil eggs and pierce lightly with fork. Sauté onion paste, ginger-garlic and pureed tomatoes with coriander and garam masala. Simmer eggs for 5 minutes.',
        ingredients: `2–3 eggs; ${rotiCount} whole-wheat rotis; tomato-onion gravy; fresh coriander.`,
      },
    ];
  }

  // 3. NON-VEGETARIAN PROTOCOL
  if (foodStyle === 'Non-vegetarian') {
    const chickenLunchGrams = isCut ? '130 g skinless chicken breast' : isBulk ? '180 g chicken breast/curry cut' : '150 g chicken breast';
    const chickenDinnerGrams = isCut ? '120 g chicken breast OR 140 g fish fillet' : isBulk ? '170 g chicken OR fish fillet' : '140 g chicken or fish';

    return [
      {
        mealName: 'Breakfast',
        dishTitle: 'Omelette / Scrambled Eggs + Brown Bread or Oats + Fruit',
        quantity: `${isCut ? '3 Eggs (2 whites + 1 whole)' : isBulk ? '4 Whole Eggs' : '3 Whole Eggs'} + ${isCut ? '1 slice bread' : isBulk ? '3 slices bread' : '2 slices bread'} + 1 fresh fruit`,
        proteinEstimate: isCut ? '~22–26 g protein' : isBulk ? '~34–38 g protein' : '~26–30 g protein',
        caloriesEstimate: isCut ? '~330 kcal' : isBulk ? '~660 kcal' : '~480 kcal',
        macroSplit: isCut ? '24P / 26C / 12F' : isBulk ? '36P / 72C / 24F' : '28P / 46C / 17F',
        budgetTip: 'Starting the morning with high biological value egg protein sustains cognitive alertness and energy.',
        preparationSteps: 'Whisk eggs with a splash of water, black pepper and oregano. Cook in 1 tsp olive oil or ghee. Serve with toasted whole-grain bread.',
        ingredients: '3–4 eggs; 1–3 slices whole-wheat bread; 1 medium fruit; 1 tsp cooking oil.',
      },
      {
        mealName: 'Lunch',
        dishTitle: 'Grilled or Curry Chicken Breast + Basmati Rice or Roti + Dal + Greens',
        quantity: `${chickenLunchGrams} + ${dalCups} dal + ${rotiCount} rotis OR ${riceCups} rice + 1 cup vegetables`,
        proteinEstimate: isCut ? '~34–38 g protein' : isBulk ? '~45–52 g protein' : '~38–44 g protein',
        caloriesEstimate: isCut ? '~520 kcal' : isBulk ? '~840 kcal' : '~660 kcal',
        macroSplit: isCut ? '36P / 68C / 11F' : isBulk ? '48P / 112C / 19F' : '40P / 86C / 14F',
        budgetTip: 'Chicken breast provides ~31g protein per 100g with zero carbohydrates and minimal saturated fat.',
        preparationSteps: 'Marinate chicken breast in yogurt, lemon juice, ginger-garlic and spices. Grill or pan-sear with minimal oil until 75°C internal temp. Serve alongside dal, rice, and fresh vegetables.',
        ingredients: `${chickenLunchGrams}; ${rotiCount} rotis or rice; 1 cup dal; salad.`,
      },
      {
        mealName: 'Snack',
        dishTitle: 'Curd & Roasted Chana Bowl OR Boiled Egg & Fruit',
        quantity: `${isCut ? '150 g low-fat curd' : '200 g curd'} + ${isCut ? '30 g' : '45 g'} roasted chana + 1 seasonal fruit`,
        proteinEstimate: isCut ? '~12–15 g protein' : isBulk ? '~18–22 g protein' : '~14–17 g protein',
        caloriesEstimate: isCut ? '~210 kcal' : isBulk ? '~390 kcal' : '~280 kcal',
        macroSplit: isCut ? '14P / 28C / 4F' : isBulk ? '20P / 50C / 11F' : '16P / 36C / 7F',
        budgetTip: 'Quick convenient protein with zero prep time to bridge the gap between main meals.',
        preparationSteps: 'Combine chilled curd with roasted chana and fresh diced fruit. Sprinkle with black salt or cinnamon.',
        ingredients: '150–200 g curd; 30–45 g roasted chana; 1 fruit.',
      },
      {
        mealName: 'Dinner',
        dishTitle: 'Pan-Seared Fish Fillet or Chicken + Whole Wheat Roti + Large Salad',
        quantity: `${chickenDinnerGrams} + ${rotiCount} rotis OR ${riceCups} rice + 1 plate cucumber tomato salad`,
        proteinEstimate: isCut ? '~32–36 g protein' : isBulk ? '~44–50 g protein' : '~36–42 g protein',
        caloriesEstimate: isCut ? '~440 kcal' : isBulk ? '~740 kcal' : '~580 kcal',
        macroSplit: isCut ? '34P / 48C / 11F' : isBulk ? '46P / 86C / 20F' : '38P / 64C / 15F',
        budgetTip: 'Fish provides anti-inflammatory Omega-3 fatty acids that accelerate muscle recovery.',
        preparationSteps: 'Season fish or chicken with lemon juice, turmeric, chili powder and crushed black pepper. Pan-sear for 4–5 minutes per side until golden and flaky. Serve with warm rotis.',
        ingredients: `${chickenDinnerGrams}; ${rotiCount} rotis; 1 plate green salad.`,
      },
    ];
  }

  // 4. JAIN PROTOCOL
  if (foodStyle === 'Jain') {
    const paneerDinnerGrams = isCut ? '90 g sattvic paneer' : isBulk ? '150 g fresh paneer' : '120 g paneer';
    return [
      {
        mealName: 'Breakfast',
        dishTitle: 'Jain-Style Besan Chilla or Poha + Fresh Curd + Fruit',
        quantity: `2 medium besan chillas (no root veg) + 150 g fresh curd + 1 medium banana or apple`,
        proteinEstimate: isCut ? '~18–22 g protein' : isBulk ? '~28–32 g protein' : '~22–26 g protein',
        caloriesEstimate: isCut ? '~360 kcal' : isBulk ? '~650 kcal' : '~490 kcal',
        macroSplit: isCut ? '20P / 48C / 10F' : isBulk ? '30P / 88C / 20F' : '24P / 66C / 14F',
        budgetTip: 'Prepared in strict adherence to Jain principles without onion, garlic, or root vegetables.',
        preparationSteps: 'Whisk besan with ajwain, turmeric, rock salt, and chopped coriander. Cook on tawa with minimal ghee. Serve with fresh homemade curd and fruit.',
        ingredients: 'Besan flour; 150 g fresh curd; ajwain, rock salt; 1 fruit.',
      },
      {
        mealName: 'Lunch',
        dishTitle: 'Moong Dal / Chana Dal + Whole Wheat Roti or Rice + Lauki/Gourd Sabzi + Curd',
        quantity: `${dalCups} yellow moong or chana dal + ${rotiCount} rotis OR ${riceCups} rice + 1 cup permissible green vegetables + ${curdGrams}`,
        proteinEstimate: isCut ? '~22–26 g protein' : isBulk ? '~32–36 g protein' : '~26–30 g protein',
        caloriesEstimate: isCut ? '~490 kcal' : isBulk ? '~790 kcal' : '~620 kcal',
        macroSplit: isCut ? '24P / 78C / 9F' : isBulk ? '34P / 120C / 18F' : '28P / 94C / 13F',
        budgetTip: 'Moong dal is light on digestion while delivering rich branch-chain amino acids (BCAAs).',
        preparationSteps: 'Cook moong dal with turmeric and rock salt. Temper with cumin, hing and tomato (if permitted by your tradition). Cook bottle gourd or ridge gourd sabzi.',
        ingredients: `1.25 cups dal; ${rotiCount} rotis or rice; 1 cup allowable green vegetables; ${curdGrams}.`,
      },
      {
        mealName: 'Snack',
        dishTitle: 'Roasted Chana + Raw Almonds + Fresh Seasonal Fruit',
        quantity: `${isCut ? '35 g' : '50 g'} roasted chana + 15 g almonds/walnuts + 1 fresh fruit`,
        proteinEstimate: isCut ? '~10–12 g protein' : isBulk ? '~15–18 g protein' : '~12–15 g protein',
        caloriesEstimate: isCut ? '~210 kcal' : isBulk ? '~390 kcal' : '~280 kcal',
        macroSplit: isCut ? '11P / 26C / 7F' : isBulk ? '16P / 46C / 15F' : '13P / 34C / 10F',
        budgetTip: 'Natural micronutrient powerhouse providing magnesium, zinc, and healthy unsaturated fats.',
        preparationSteps: 'Dry roasted and ready to eat. Perfectly compliant with traditional dietary parameters.',
        ingredients: '35–50 g roasted chana; 15 g nuts; 1 fresh fruit.',
      },
      {
        mealName: 'Dinner',
        dishTitle: 'Sattvic Paneer Dish + Whole Wheat Rotis + Lauki or Turai Sabzi',
        quantity: `${rotiCount} rotis + ${paneerDinnerGrams} in tomato-cumin gravy + 1 cup permissible green vegetables`,
        proteinEstimate: isCut ? '~25–28 g protein' : isBulk ? '~36–42 g protein' : '~30–34 g protein',
        caloriesEstimate: isCut ? '~460 kcal' : isBulk ? '~760 kcal' : '~590 kcal',
        macroSplit: isCut ? '26P / 54C / 14F' : isBulk ? '38P / 88C / 26F' : '32P / 68C / 19F',
        budgetTip: 'Sattvic paneer supplies high-quality complete dairy protein for overnight tissue repair.',
        preparationSteps: 'Dice fresh paneer. Simmer with cumin, coriander, turmeric and tomato puree (no root vegetables). Serve alongside hot chapatis before sundown if observing chauvihar.',
        ingredients: `${paneerDinnerGrams}; ${rotiCount} rotis; permissible green vegetables; ghee.`,
      },
    ];
  }

  // 5. MOSTLY PLANT-BASED (VEGAN-FRIENDLY)
  const tofuDinnerGrams = isCut ? '130 g firm tofu OR 55 g dry soya' : isBulk ? '200 g firm tofu OR 80 g dry soya' : '160 g firm tofu OR 65 g dry soya';

  return [
    {
      mealName: 'Breakfast',
      dishTitle: 'Oats in Fortified Soy Milk + Banana + Chia Seeds',
      quantity: `${isCut ? '45 g' : isBulk ? '75 g' : '60 g'} oats cooked with 250 ml soy milk + 1 banana + 15 g chia seeds`,
      proteinEstimate: isCut ? '~18–22 g protein' : isBulk ? '~28–32 g protein' : '~22–26 g protein',
      caloriesEstimate: isCut ? '~360 kcal' : isBulk ? '~660 kcal' : '~490 kcal',
      macroSplit: isCut ? '20P / 52C / 9F' : isBulk ? '30P / 96C / 18F' : '24P / 72C / 13F',
      budgetTip: 'Fortified soy milk matches dairy milk protein gram-for-gram while remaining 100% plant-based.',
      preparationSteps: 'Simmer oats with soy milk for 5 minutes. Top with sliced banana, cinnamon, and chia seeds for plant-based Omega-3s.',
      ingredients: '45–75 g rolled oats; 250 ml unsweetened soy milk; 1 banana; 15 g chia seeds.',
    },
    {
      mealName: 'Lunch',
      dishTitle: 'Rajma / Chana Curry + Brown or White Rice + Steamed Broccoli / Greens',
      quantity: `${dalCups} thick rajma/chole + ${rotiCount} rotis OR ${riceCups} steamed rice + 1 cup green vegetables`,
      proteinEstimate: isCut ? '~20–24 g protein' : isBulk ? '~30–35 g protein' : '~24–28 g protein',
      caloriesEstimate: isCut ? '~480 kcal' : isBulk ? '~790 kcal' : '~610 kcal',
      macroSplit: isCut ? '22P / 82C / 7F' : isBulk ? '32P / 128C / 15F' : '26P / 102C / 10F',
      budgetTip: 'Legumes are rich in iron, zinc, and resistant starch, nourishing healthy gut microbiota.',
      preparationSteps: 'Soak rajma or chickpeas overnight. Pressure cook until tender. Simmer in tomato-onion gravy with aromatic spices. Serve over steamed rice or warm rotis.',
      ingredients: '1.25–1.5 cups cooked kidney beans or chickpeas; rice or rotis; 1 cup vegetables.',
    },
    {
      mealName: 'Snack',
      dishTitle: 'Roasted Bhuna Chana + Peanut Chaat + Seasonal Fruit',
      quantity: `${isCut ? '35 g' : '50 g'} roasted chana + 15 g roasted peanuts + 1 medium fruit + lemon juice`,
      proteinEstimate: isCut ? '~10–13 g protein' : isBulk ? '~16–20 g protein' : '~13–16 g protein',
      caloriesEstimate: isCut ? '~210 kcal' : isBulk ? '~400 kcal' : '~290 kcal',
      macroSplit: isCut ? '11P / 28C / 7F' : isBulk ? '18P / 50C / 15F' : '14P / 38C / 10F',
      budgetTip: 'Crispy, protein-dense, completely plant-based snack without any dairy or animal products.',
      preparationSteps: 'Toss roasted chana and peanuts with diced onion, tomato, green chili, rock salt and lemon juice.',
      ingredients: '35–50 g roasted chana; 15 g peanuts; lemon; seasonal fruit.',
    },
    {
      mealName: 'Dinner',
      dishTitle: 'High-Protein Tofu Sauté / Soya Chunks Curry + Rotis + Green Salad',
      quantity: `${tofuDinnerGrams} sautéed with bell peppers and onions + ${rotiCount} rotis + 1 plate cucumber salad`,
      proteinEstimate: isCut ? '~28–32 g protein' : isBulk ? '~40–46 g protein' : '~34–38 g protein',
      caloriesEstimate: isCut ? '~440 kcal' : isBulk ? '~740 kcal' : '~570 kcal',
      macroSplit: isCut ? '30P / 52C / 11F' : isBulk ? '42P / 86C / 22F' : '36P / 66C / 15F',
      budgetTip: 'Firm tofu and soya chunks are the premier plant proteins, providing all 9 essential amino acids.',
      preparationSteps: 'Press tofu to remove water, dice into cubes. Pan-sear in 1 tsp sesame or mustard oil until crispy. Add bell peppers, soy sauce and black pepper. Serve with rotis.',
      ingredients: `${tofuDinnerGrams}; ${rotiCount} whole-wheat rotis; bell peppers; spices.`,
    },
  ];
}

function generateDynamicAlternatives(
  foodStyle: FoodStyle, 
  budgetCategory: 'budget_low' | 'budget_mid' | 'budget_high',
  calorieTier: 'cutting' | 'moderate' | 'bulking'
): Record<string, MealAlternative[]> {
  const isCut = calorieTier === 'cutting';
  const isLowBudget = budgetCategory === 'budget_low';

  if (foodStyle === 'Vegetarian') {
    return {
      Breakfast: [
        { name: 'Spiced Sattu Chaas Cooler', description: `${isCut ? '35 g' : '45 g'} sattu flour + 300 ml buttermilk + roasted jeera (~18g protein)` },
        { name: 'Besan Chilla with Paneer', description: `2 chillas with ${isCut ? '40 g' : '70 g'} grated paneer inside + mint chutney (~22g protein)` },
        { name: 'Sprouted Moong Salad Bowl', description: '1.5 cups sprouted moong + pomegranate + cucumber + lemon (~16g protein)' },
      ],
      Lunch: [
        { name: 'Rajma Chawal High-Protein Bowl', description: `${isCut ? '1 cup' : '1.5 cups'} rajma + 1.5 cups rice + cucumber curd (~24g protein)` },
        { name: 'Dal Panchmel with 3 Rotis', description: 'Mixed 5-lentil dal + 3 rotis + seasonal greens + 150g curd (~26g protein)' },
        { name: 'Paneer Bhurji with Roti', description: `${isCut ? '80 g' : '120 g'} paneer bhurji + 3 rotis + tomato salad (~28g protein)` },
      ],
      Snack: [
        { name: 'Greek Yogurt / Thick Curd with Fruit', description: '150–200 g thick curd + 1 diced fruit + pinch of cinnamon (~12g protein)' },
        { name: 'Bhuna Chana Chaat', description: '40 g roasted chana + onions + tomatoes + lemon juice (~9g protein)' },
        { name: 'Soya Milk / Cow Milk with Nuts', description: '250 ml milk + 15 g almonds or walnuts (~12g protein)' },
      ],
      Dinner: [
        { name: 'Soya Chunks Curry + Rotis', description: `${isCut ? '50 g' : '70 g'} dry soya chunks + 3 rotis + green salad (~36g protein)` },
        { name: 'Palak Paneer with Roti', description: `${isCut ? '80 g' : '120 g'} paneer in fresh spinach gravy + rotis (~28g protein)` },
        { name: 'Moong Dal Khichdi + Curd', description: 'High-protein moong dal khichdi (1:1 dal to rice) + 150g curd (~22g protein)' },
      ],
    };
  }

  if (foodStyle === 'Eggetarian') {
    return {
      Breakfast: [
        { name: 'Boiled Egg Whites + Toast', description: `${isCut ? '4 whites + 1 whole' : '3 whole eggs'} + 2 slices brown bread (~24g protein)` },
        { name: 'Vegetable Egg Scramble', description: '3 eggs scrambled with spinach, onions and tomatoes (~20g protein)' },
        { name: 'Besan Chilla + 2 Boiled Eggs', description: '1 large besan chilla + 2 boiled eggs + green chutney (~22g protein)' },
      ],
      Lunch: [
        { name: 'Dal Roti + 2 Boiled Eggs', description: '1.25 cups dal + 3 rotis + 2 boiled eggs + salad (~28g protein)' },
        { name: 'Egg Biryani / Pulao', description: '3 boiled eggs cooked with spiced basmati rice + cucumber raita (~26g protein)' },
        { name: 'Rajma Rice + 2 Eggs', description: '1.25 cups rajma + 1.5 cups rice + 2 whole boiled eggs (~30g protein)' },
      ],
      Snack: [
        { name: 'Egg White Chaat', description: '3 boiled egg whites seasoned with chaat masala, onions & lemon (~12g protein)' },
        { name: 'Roasted Chana + Boiled Egg', description: '35 g roasted chana + 1 whole egg + green tea (~13g protein)' },
        { name: 'Curd & Fruit Bowl', description: '200 g curd + 1 sliced banana or apple (~11g protein)' },
      ],
      Dinner: [
        { name: 'Homestyle Egg Curry + 3 Rotis', description: '3 eggs in spiced tomato curry + 3 rotis (~26g protein)' },
        { name: 'Egg Bhurji Roll (Frankie)', description: '3 eggs scrambled rolled inside 2 whole-wheat rotis with onions (~24g protein)' },
        { name: 'Paneer / Soya Bowl', description: '100 g paneer or soya chunks with rice/roti + salad (~30g protein)' },
      ],
    };
  }

  if (foodStyle === 'Non-vegetarian') {
    return {
      Breakfast: [
        { name: '3-Egg Omelette with Brown Bread', description: '3 whole eggs + 2 slices toast + black coffee (~24g protein)' },
        { name: 'Shredded Chicken Toast', description: '80 g boiled chicken breast on 2 slices toast + cucumber (~28g protein)' },
        { name: 'Oats with Milk & Boiled Eggs', description: '40 g oats in milk + 2 boiled eggs (~22g protein)' },
      ],
      Lunch: [
        { name: 'Chicken Curry + 3 Rotis + Salad', description: '140 g chicken breast curry + 3 rotis + cucumber salad (~36g protein)' },
        { name: 'Fish Rice Bowl', description: '150 g grilled/curry fish fillet + 1.5 cups steamed rice + greens (~34g protein)' },
        { name: 'Chicken Biryani with Raita', description: '150 g chicken breast pulao + 150 g mint raita (~36g protein)' },
      ],
      Snack: [
        { name: 'Chicken Tikka Skewers (Air-fried)', description: '100 g chicken breast cubes with chaat masala (~28g protein)' },
        { name: 'Boiled Eggs + Roasted Chana', description: '2 boiled eggs + 30 g roasted chana (~18g protein)' },
        { name: 'Greek Yogurt with Fruit', description: '150 g Greek yogurt + berries or sliced apple (~15g protein)' },
      ],
      Dinner: [
        { name: 'Pan-Seared Fish Fillet + Roti', description: '150 g fish (Rohu/Basa/Salmon) + 3 rotis + salad (~36g protein)' },
        { name: 'Tandoori Chicken + Green Salad', description: '180 g chicken breast cooked dry + large green salad (~44g protein)' },
        { name: 'Egg Curry with 3 Rotis', description: '3 boiled eggs in tomato-onion curry + 3 rotis (~26g protein)' },
      ],
    };
  }

  if (foodStyle === 'Jain') {
    return {
      Breakfast: [
        { name: 'Jain Besan Chilla with Curd', description: '2 besan chillas (no root veg) + 150 g curd (~20g protein)' },
        { name: 'Poha with Peanuts & Milk', description: '1.5 cups Jain-style poha + 20 g peanuts + 250 ml milk (~18g protein)' },
        { name: 'Sattvic Moong Sprout Bowl', description: 'Moong sprouts + cucumber + lemon + rock salt (~15g protein)' },
      ],
      Lunch: [
        { name: 'Moong Dal + 3 Rotis + Curd', description: '1.5 cups moong dal + 3 rotis + 150 g curd + allowable greens (~26g protein)' },
        { name: 'Jain Paneer Rice Bowl', description: '110 g paneer + 1.5 cups rice + bottle gourd sabzi (~28g protein)' },
        { name: 'Chana Dal Khichdi + Curd', description: 'Chana dal & rice khichdi + 150 g curd (~22g protein)' },
      ],
      Snack: [
        { name: 'Roasted Chana & Almonds', description: '40 g roasted chana + 15 g almonds (~12g protein)' },
        { name: 'Fresh Milk with Makhana', description: '250 ml cow milk + 25 g roasted makhana (~12g protein)' },
        { name: 'Seasonal Permissible Fruit + Curd', description: '1 fresh fruit + 150 g sweet/plain curd (~10g protein)' },
      ],
      Dinner: [
        { name: 'Sattvic Paneer Curry + Roti', description: '120 g paneer in tomato gravy + 3 rotis (~30g protein)' },
        { name: 'Moong Dal with Rotis', description: '1.25 cups thick yellow moong dal + 3 rotis + allowable greens (~24g protein)' },
        { name: 'Tofu Sabzi with Rotis', description: '130 g tofu sautéed with allowable spices + 3 rotis (~26g protein)' },
      ],
    };
  }

  // Mostly plant-based
  return {
    Breakfast: [
      { name: 'Tofu Scramble on Toast', description: '120 g crumbled firm tofu with turmeric and greens on 2 slices toast (~20g protein)' },
      { name: 'Soya Milk Oatmeal Bowl', description: '50 g oats + 250 ml fortified soy milk + chia seeds (~22g protein)' },
      { name: 'Besan Chilla + Peanut Chutney', description: '2 besan chillas + spicy peanut chutney (~18g protein)' },
    ],
    Lunch: [
      { name: 'Chana Masala + Rice', description: '1.5 cups cooked chickpeas + 1.5 cups steamed rice + salad (~22g protein)' },
      { name: 'Rajma Rice with Sautéed Greens', description: '1.5 cups kidney beans + 1.5 cups rice + spinach (~24g protein)' },
      { name: 'Tofu Brown Rice Bowl', description: '150 g baked tofu + 1.5 cups brown rice + broccoli (~30g protein)' },
    ],
    Snack: [
      { name: 'Peanut Sattu Drink', description: '35 g sattu flour + 15 g powdered peanuts + water (~18g protein)' },
      { name: 'Roasted Chana + Fruit', description: '45 g roasted chana + 1 banana (~11g protein)' },
      { name: 'Soy Yogurt with Berries', description: '150 g unsweetened soy yogurt + seeds (~12g protein)' },
    ],
    Dinner: [
      { name: 'Soya Chunks Curry + 3 Rotis', description: '65 g dry soya chunks + 3 rotis + salad (~36g protein)' },
      { name: 'Grilled Tofu Steak + Quinoa/Roti', description: '160 g firm tofu + 3 rotis or 1 cup quinoa (~32g protein)' },
      { name: 'Yellow Dal Tadka + Rice', description: '1.5 cups yellow dal + 1.5 cups rice + mixed vegetable curry (~22g protein)' },
    ],
  };
}

function getDynamicBudgetText(budget: BudgetTier, budgetCat: string, foodStyle: FoodStyle): string {
  if (budgetCat === 'budget_low') {
    return 'Optimized for Maximum Protein per Rupee: Prioritizes bulk soya chunks (52% protein at ₹45–50/pack), roasted chana/sattu (₹12/portion), whole eggs (~₹7/egg), and seasonal lentils. Keeps total grocery expenditure strictly under ₹100/day.';
  }
  if (budgetCat === 'budget_mid') {
    return 'Balanced Athletic Economy: Combines cost-efficient pulses and whole eggs with fresh dairy (paneer, cow milk, curd) and lean poultry cuts for optimal amino acid bioavailability at approx ₹150–200/day.';
  }
  return 'Premium Athletic Groceries: Integrates high-grade whey protein isolates, fresh Greek yogurt, chicken breast fillets, omega-3 rich fish, and cold-pressed extra virgin oils with zero financial constraints.';
}

function getDynamicGoalRationale(mainGoal: MainGoal, energyGoal: EnergyGoal, cals: number, protein: number): string {
  let text = `Calibrated to ${cals.toLocaleString()} kcal and ${protein}g daily protein. `;
  if (energyGoal === 'Muscle-building surplus') {
    text += 'A calculated +10% surplus fuels muscle glycogen, progressive strength overload, and anabolism without excessive adipose gain.';
  } else if (energyGoal === 'Fat-loss deficit') {
    text += 'A controlled -15% deficit promotes steady subcutaneous fat oxidation while high protein protects lean muscle tissue from catabolism.';
  } else if (energyGoal === 'Recomposition') {
    text += 'A mild -5% deficit paired with 2.0g/kg protein maximizes muscle protein synthesis (MPS) while utilizing existing fat stores for cellular energy.';
  } else {
    text += 'Maintenance calories provide neutral energy balance for peak cognitive stamina, hormonal health, and steady athletic endurance.';
  }
  return text;
}
