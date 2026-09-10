import { AgeGroup, FoodStyle, MainGoal, EnergyGoal, BudgetTier, MealItem, MealAlternative } from '../types';

export interface DishCatalogParams {
  ageGroup: AgeGroup;
  ageNum: number;
  foodStyle: FoodStyle;
  mainGoal: MainGoal;
  energyGoal: EnergyGoal;
  budgetCategory: 'budget_low' | 'budget_mid' | 'budget_high';
  budgetTier: BudgetTier;
  calorieTier: 'cutting' | 'moderate' | 'bulking';
  targetCalories: number;
  targetProtein: number;
  weightNum: number;
}

/**
 * Returns genuine, homestyle Indian dishes tailored to the athlete's exact age group,
 * budget category (under ₹100, ₹200, ₹350+), caloric goal (cut, bulk, recomp, maintenance),
 * and dietary ethics (Veg, Eggetarian, Non-veg, Jain, Plant-based).
 */
export function getGenuinePersonalizedMeals(params: DishCatalogParams): MealItem[] {
  const {
    ageGroup,
    ageNum,
    foodStyle,
    mainGoal,
    energyGoal,
    budgetCategory,
    calorieTier,
  } = params;

  const isCut = calorieTier === 'cutting';
  const isBulk = calorieTier === 'bulking';
  const isLowBudget = budgetCategory === 'budget_low';
  const isHighBudget = budgetCategory === 'budget_high';

  // Dynamic portion sizes based on caloric strategy
  const rotiCount = isCut ? '2' : isBulk ? '4' : '3';
  const riceCups = isCut ? '1 cup' : isBulk ? '2 cups' : '1.5 cups';
  const dalCups = isBulk ? '1.5 cups' : '1.25 cups';
  const curdPortion = isCut ? '120 g low-fat curd' : isBulk ? '200 g whole curd' : '150 g fresh curd';

  // Determine age bracket descriptor
  let resolvedAgeGroup: AgeGroup = ageGroup;
  if (ageNum > 0) {
    if (ageNum <= 17) resolvedAgeGroup = '13–17';
    else if (ageNum <= 25) resolvedAgeGroup = '18–25';
    else if (ageNum <= 40) resolvedAgeGroup = '26–40';
    else if (ageNum <= 60) resolvedAgeGroup = '41–60';
    else resolvedAgeGroup = '61+';
  }

  // =========================================================================
  // 1. AGE GROUP: 13–17 (TEENS / SCHOOL / ACCELERATED GROWTH & BONE HEALTH)
  // =========================================================================
  if (resolvedAgeGroup === '13–17') {
    if (foodStyle === 'Vegetarian') {
      return [
        {
          mealName: 'Breakfast',
          dishTitle: isLowBudget
            ? 'Ragi & Oats Milk Porridge with Banana + Roasted Peanuts'
            : 'Paneer Stuffed Whole-Wheat Paratha + Fresh Sweet Curd',
          quantity: isLowBudget
            ? '40g ragi flour + 30g rolled oats cooked in 250ml cow milk + 1 banana + 15g peanuts'
            : '2 phulkas/parathas stuffed with 60g grated paneer + 150g curd + 1 seasonal fruit',
          proteinEstimate: isCut ? '~16–19 g protein' : isBulk ? '~24–28 g protein' : '~20–24 g protein',
          caloriesEstimate: isCut ? '~380 kcal' : isBulk ? '~650 kcal' : '~510 kcal',
          macroSplit: isCut ? '18P / 55C / 10F' : isBulk ? '26P / 90C / 19F' : '22P / 72C / 14F',
          priceCategory: isLowBudget ? '₹18 / serving • Budget Friendly' : '₹36 / serving • Mid-tier',
          prepTime: '10–12 mins',
          ageSuitability: 'Ages 13–17: High calcium & bioavailable iron supporting peak adolescent bone remodeling.',
          budgetTip: 'Finger millet (Ragi) costs only ₹35/kg and is India’s richest natural grain source of calcium (344mg/100g).',
          preparationSteps: 'Whisk ragi flour with a little water, then simmer in boiling milk with rolled oats for 5 minutes. Stir in sliced banana, a dash of jaggery, and crushed roasted peanuts. Serve warm before school.',
          ingredients: '40g ragi flour; 30g rolled oats; 250ml cow milk; 1 banana; 15g peanuts; pinch of cardamom.',
        },
        {
          mealName: 'Lunch',
          dishTitle: 'Homestyle Rajma Masala + Steamed Basmati Rice + Fresh Curd + Salad',
          quantity: `${dalCups} slow-cooked kidney beans + ${riceCups} steamed rice + ${curdPortion} + 1 bowl cucumber tomato salad`,
          proteinEstimate: isCut ? '~22–26 g protein' : isBulk ? '~32–36 g protein' : '~26–30 g protein',
          caloriesEstimate: isCut ? '~490 kcal' : isBulk ? '~780 kcal' : '~620 kcal',
          macroSplit: isCut ? '24P / 78C / 8F' : isBulk ? '34P / 122C / 16F' : '28P / 96C / 12F',
          priceCategory: isLowBudget ? '₹24 / serving • Budget Friendly' : '₹42 / serving • Mid-tier',
          prepTime: '20 mins',
          ageSuitability: 'Ages 13–17: Sustained low-glycemic complex carbohydrates for classroom focus and afternoon sports.',
          budgetTip: 'Combining kidney beans with rice creates a complete amino acid profile at minimal household expense.',
          preparationSteps: 'Pressure-cook soaked rajma with cumin, bay leaf, tomato puree, onion paste, and mild turmeric. Simmer until gravy thickens. Serve hot over steamed rice with chilled curd and fresh crunchy cucumber slices.',
          ingredients: `1.25–1.5 cups cooked rajma; ${riceCups} rice; ${curdPortion}; 1 cucumber; 1 tomato; 1 tsp mustard oil.`,
        },
        {
          mealName: 'Snack',
          dishTitle: 'Roasted Bhuna Chana + Banana + Cup of Warm Milk',
          quantity: isCut ? '35g roasted chana + 1 apple' : isBulk ? '50g roasted chana + 2 bananas + 200ml milk' : '40g roasted chana + 1 banana + 150ml milk',
          proteinEstimate: isCut ? '~10–12 g protein' : isBulk ? '~18–22 g protein' : '~14–17 g protein',
          caloriesEstimate: isCut ? '~210 kcal' : isBulk ? '~420 kcal' : '~310 kcal',
          macroSplit: isCut ? '11P / 36C / 3F' : isBulk ? '20P / 70C / 7F' : '15P / 52C / 5F',
          priceCategory: '₹14 / serving • Super Saver',
          prepTime: '2 mins (No cooking)',
          ageSuitability: 'Ages 13–17: Portable after-school nutrition to fuel tuition, homework, or evening playground games.',
          budgetTip: 'Bhuna chana is a zero-prep dry pulse costing less than ₹7 per 40g serving.',
          preparationSteps: 'Ready to eat immediately. Simply portion out roasted Bengal gram with a fresh ripe banana and warm milk.',
          ingredients: '40–50g roasted chana (Bengal gram); 1–2 bananas; warm toned milk.',
        },
        {
          mealName: 'Dinner',
          dishTitle: 'Matar Paneer / Soya Chunks Curry + Soft Whole Wheat Phulkas + Sprout Salad',
          quantity: `${rotiCount} soft phulkas + ${isLowBudget ? '60g dry soya chunks (boiled ~180g)' : '100g fresh paneer'} with green peas + 1 plate fresh salad`,
          proteinEstimate: isCut ? '~26–30 g protein' : isBulk ? '~38–44 g protein' : '~32–36 g protein',
          caloriesEstimate: isCut ? '~450 kcal' : isBulk ? '~740 kcal' : '~580 kcal',
          macroSplit: isCut ? '28P / 54C / 12F' : isBulk ? '40P / 88C / 24F' : '34P / 68C / 18F',
          priceCategory: isLowBudget ? '₹20 / serving • Budget Soya' : '₹45 / serving • Fresh Paneer',
          prepTime: '15–18 mins',
          ageSuitability: 'Ages 13–17: Slow-digesting casein and essential BCAAs for overnight growth hormone release.',
          budgetTip: 'Soya chunks deliver 52% pure protein by weight for just ₹10 per generous serving.',
          preparationSteps: 'Lightly sauté diced onions, ginger-garlic paste, and tomato puree. Add green peas and paneer cubes (or squeezed boiled soya chunks). Simmer 5 minutes. Serve with hot phulkas brushed with a drop of ghee.',
          ingredients: `${rotiCount} whole-wheat rotis; 100g paneer or 60g soya chunks; 1/2 cup peas; onion-tomato gravy.`,
        },
      ];
    }

    if (foodStyle === 'Eggetarian' || foodStyle === 'Non-vegetarian') {
      const isNonVeg = foodStyle === 'Non-vegetarian';
      return [
        {
          mealName: 'Breakfast',
          dishTitle: 'Egg Bhurji Roll in Soft Whole Wheat Roti + Fresh Fruit',
          quantity: `${isCut ? '2 eggs' : isBulk ? '3-4 eggs' : '3 eggs'} scrambled with onions & tomatoes rolled in ${rotiCount} roti + 1 fruit`,
          proteinEstimate: isCut ? '~18–22 g protein' : isBulk ? '~28–32 g protein' : '~24–28 g protein',
          caloriesEstimate: isCut ? '~340 kcal' : isBulk ? '~620 kcal' : '~460 kcal',
          macroSplit: isCut ? '20P / 32C / 14F' : isBulk ? '30P / 64C / 24F' : '25P / 46C / 18F',
          priceCategory: '₹22 / serving • High Protein',
          prepTime: '10 mins',
          ageSuitability: 'Ages 13–17: Whole eggs provide choline for brain development, lutein for eye health, and complete protein.',
          budgetTip: 'Whole farm eggs cost ~₹7 each and offer the highest biological protein value of all whole foods.',
          preparationSteps: 'Whisk eggs with a pinch of turmeric, salt, and coriander. Sauté chopped onions and green chili in 1 tsp oil, pour in eggs and scramble softly. Roll inside warm roti for a grab-and-go school breakfast.',
          ingredients: '2–4 farm eggs; 1–2 whole wheat rotis; 1 small onion; 1 tomato; 1 fresh fruit.',
        },
        {
          mealName: 'Lunch',
          dishTitle: isNonVeg
            ? 'Homestyle Chicken Curry + Steamed Basmati Rice + Yellow Dal + Green Salad'
            : 'Double Dal Tadka + 3 Soft Phulkas + 2 Boiled Eggs in Mild Gravy + Curd',
          quantity: isNonVeg
            ? `120–150g chicken curry cut + ${riceCups} rice + 1 cup yellow dal + salad`
            : `${dalCups} dal + ${rotiCount} phulkas + 2 eggs in gravy + ${curdPortion}`,
          proteinEstimate: isCut ? '~28–32 g protein' : isBulk ? '~42–48 g protein' : '~35–40 g protein',
          caloriesEstimate: isCut ? '~510 kcal' : isBulk ? '~820 kcal' : '~640 kcal',
          macroSplit: isCut ? '30P / 66C / 12F' : isBulk ? '45P / 105C / 22F' : '38P / 82C / 16F',
          priceCategory: isNonVeg ? '₹65 / serving • Lean Poultry' : '₹28 / serving • Budget Egg',
          prepTime: isNonVeg ? '25 mins' : '15 mins',
          ageSuitability: 'Ages 13–17: Natural heme iron and zinc preventing adolescent anemia and promoting muscular growth.',
          budgetTip: 'Curry cut chicken with bone imparts rich natural gelatin, collagen, and minerals into the broth.',
          preparationSteps: isNonVeg
            ? 'Marinate chicken in curd, turmeric, and ginger-garlic. Sauté with whole spices and tomato-onion masala, simmer until tender. Serve with hot steamed rice and a cup of yellow dal.'
            : 'Cook yellow toor dal with cumin hing tempering. Simmer boiled eggs in light tomato curry. Serve with warm phulkas and fresh curd.',
          ingredients: isNonVeg
            ? `120–150g chicken curry cut; ${riceCups} rice; 1 cup dal; onion, tomato, spices.`
            : `2 eggs; ${dalCups} dal; ${rotiCount} phulkas; ${curdPortion}; salad.`,
        },
        {
          mealName: 'Snack',
          dishTitle: 'Boiled Egg Whites / Roasted Chana + Fresh Guava or Banana',
          quantity: isCut ? '2 boiled egg whites + 25g roasted chana + 1 guava' : '2 whole boiled eggs + 35g roasted chana + 1 fruit',
          proteinEstimate: '~12–16 g protein',
          caloriesEstimate: isCut ? '~170 kcal' : '~260 kcal',
          macroSplit: isCut ? '14P / 22C / 2F' : '16P / 28C / 9F',
          priceCategory: '₹16 / serving • Low Cost',
          prepTime: '8 mins boiling',
          ageSuitability: 'Ages 13–17: Vitamin C from guava triples the absorption of non-heme iron from chana.',
          budgetTip: 'Guava is one of India’s most economical superfruits, with 4x the vitamin C of oranges.',
          preparationSteps: 'Boil eggs for 9 minutes, peel and slice. Sprinkle chaat masala and black pepper. Pair with crunchy roasted chana and fresh seasonal fruit.',
          ingredients: '2 eggs; 25–35g roasted chana; 1 guava or apple; chaat masala.',
        },
        {
          mealName: 'Dinner',
          dishTitle: isNonVeg
            ? 'Pan-Seared Fish Fillet or Chicken + Soft Phulkas + Mixed Vegetable Sabzi'
            : 'Homestyle 2-Egg Curry + Soft Phulkas + Bhindi or Lauki Sabzi + Cucumber Salad',
          quantity: isNonVeg
            ? `120–150g fish or chicken + ${rotiCount} phulkas + 1 cup green vegetables`
            : `2 eggs simmered in onion-tomato curry + ${rotiCount} phulkas + 1 cup green sabzi`,
          proteinEstimate: isCut ? '~26–30 g protein' : isBulk ? '~38–44 g protein' : '~32–36 g protein',
          caloriesEstimate: isCut ? '~440 kcal' : isBulk ? '~740 kcal' : '~570 kcal',
          macroSplit: isCut ? '28P / 50C / 12F' : isBulk ? '40P / 86C / 22F' : '34P / 66C / 16F',
          priceCategory: isNonVeg ? '₹68 / serving • Premium Catch' : '₹26 / serving • Budget Egg',
          prepTime: '18 mins',
          ageSuitability: 'Ages 13–17: High zinc and Omega-3 fatty acids for teen immune resilience and cognitive restoration.',
          budgetTip: 'Local freshwater fish (like Rohu or Katla) provides exceptional Omega-3s at a fraction of salmon prices.',
          preparationSteps: 'Season fish or chicken with lemon juice, turmeric, and pepper. Pan-sear for 4 minutes per side with minimal oil. Serve alongside warm phulkas and fresh green vegetable sabzi.',
          ingredients: isNonVeg
            ? `120–150g fish fillet or chicken; ${rotiCount} phulkas; seasonal vegetables.`
            : `2 eggs; ${rotiCount} phulkas; 1 cup bhindi/lauki sabzi; spices.`,
        },
      ];
    }

    if (foodStyle === 'Jain') {
      return [
        {
          mealName: 'Breakfast',
          dishTitle: 'Jain Moong Dal Chilla with Grated Paneer + Fresh Sweet Curd',
          quantity: '2 medium soaked yellow moong dal chillas stuffed with 50g fresh paneer + 150g fresh curd + 1 fruit',
          proteinEstimate: isCut ? '~18–22 g protein' : isBulk ? '~28–32 g protein' : '~22–26 g protein',
          caloriesEstimate: isCut ? '~360 kcal' : isBulk ? '~620 kcal' : '~480 kcal',
          macroSplit: isCut ? '20P / 46C / 10F' : isBulk ? '30P / 82C / 20F' : '24P / 64C / 14F',
          priceCategory: '₹28 / serving • Sattvic Pure',
          prepTime: '12 mins',
          ageSuitability: 'Ages 13–17: Soaked moong dal is extremely gentle on teen digestion and strictly free of all root vegetables.',
          budgetTip: 'Moong dal provides over 24% protein and requires zero expensive protein powders.',
          preparationSteps: 'Grind soaked yellow moong dal with green chilies, cumin, hing, and rock salt into a pourable batter. Pour onto hot tawa, cook with a drop of ghee, fold in fresh grated paneer. Serve with sweet fresh curd.',
          ingredients: '1/2 cup soaked yellow moong dal; 50g fresh paneer; 150g curd; rock salt, cumin, hing.',
        },
        {
          mealName: 'Lunch',
          dishTitle: 'Jain Lauki Chana Dal + Soft Whole Wheat Phulkas + Fresh Curd + Permissible Greens',
          quantity: `${dalCups} thick chana dal cooked with bottle gourd + ${rotiCount} phulkas + ${curdPortion} + steamed turai/bhindi`,
          proteinEstimate: isCut ? '~22–26 g protein' : isBulk ? '~32–36 g protein' : '~26–30 g protein',
          caloriesEstimate: isCut ? '~480 kcal' : isBulk ? '~780 kcal' : '~610 kcal',
          macroSplit: isCut ? '24P / 76C / 8F' : isBulk ? '34P / 120C / 16F' : '28P / 94C / 12F',
          priceCategory: '₹26 / serving • Sattvic',
          prepTime: '18 mins',
          ageSuitability: 'Ages 13–17: High potassium and mineral density supporting adolescent athletic stamina.',
          budgetTip: 'Chana dal paired with whole wheat roti delivers complete amino acids with traditional sattvic purity.',
          preparationSteps: 'Pressure-cook Bengal gram dal with chopped bottle gourd (lauki), turmeric, and rock salt. Temper with ghee, cumin seeds, and asafoetida (hing). Serve hot with phulkas and fresh homemade curd.',
          ingredients: `${dalCups} chana dal with lauki; ${rotiCount} phulkas; ${curdPortion}; permissible greens.`,
        },
        {
          mealName: 'Snack',
          dishTitle: 'Roasted Makhana (Foxnuts) + Roasted Chana + Almonds',
          quantity: '25g roasted makhana + 35g roasted chana + 10g almonds + 1 permissible fruit',
          proteinEstimate: '~11–14 g protein',
          caloriesEstimate: '~240 kcal',
          macroSplit: '12P / 34C / 6F',
          priceCategory: '₹22 / serving • Pure Crunch',
          prepTime: '3 mins',
          ageSuitability: 'Ages 13–17: Makhana is rich in calcium, magnesium, and phosphorus for teen bone mineral density.',
          budgetTip: 'Dry roasting makhana with a drop of ghee and rock salt yields a crunchy, preservative-free snack.',
          preparationSteps: 'Roast makhana in a dry pan with half a teaspoon of cow ghee and pink rock salt until crisp. Toss with roasted chana and almonds.',
          ingredients: '25g makhana; 35g roasted chana; 10g soaked almonds; rock salt; ghee.',
        },
        {
          mealName: 'Dinner',
          dishTitle: 'Sattvic Paneer & Tomato Simmer + Soft Phulkas + Steamed Bottle Gourd',
          quantity: `${rotiCount} soft phulkas + 100g fresh paneer in cumin-coriander tomato gravy + 1 cup steamed lauki`,
          proteinEstimate: isCut ? '~24–28 g protein' : isBulk ? '~36–42 g protein' : '~30–34 g protein',
          caloriesEstimate: isCut ? '~450 kcal' : isBulk ? '~740 kcal' : '~570 kcal',
          macroSplit: isCut ? '26P / 52C / 13F' : isBulk ? '38P / 86C / 24F' : '32P / 66C / 17F',
          priceCategory: '₹42 / serving • Sattvic Dairy',
          prepTime: '15 mins',
          ageSuitability: 'Ages 13–17: Sattvic dairy casein provides slow-release nighttime amino acids without digestive distress.',
          budgetTip: 'Homemade fresh paneer from cow milk ensures pristine purity and rich calcium for teens.',
          preparationSteps: 'Simmer fresh tomato puree with cumin, turmeric, coriander powder, and rock salt. Gently fold in fresh diced paneer cubes. Serve warm before sundown with soft phulkas.',
          ingredients: `${rotiCount} phulkas; 100g paneer; fresh tomato puree; cumin, rock salt; 1 cup lauki.`,
        },
      ];
    }

    // Mostly plant-based
    return [
      {
        mealName: 'Breakfast',
        dishTitle: 'Spiced Tofu & Green Pea Scramble with Soft Phulkas + Soy Milk',
        quantity: '100g crumbled firm tofu sautéed with peas and turmeric + 2 phulkas + 200ml fortified soy milk',
        proteinEstimate: '~20–24 g protein',
        caloriesEstimate: isCut ? '~360 kcal' : '~500 kcal',
        macroSplit: '22P / 58C / 12F',
        priceCategory: '₹32 / serving • Plant Power',
        prepTime: '10 mins',
        ageSuitability: 'Ages 13–17: Fortified soy milk matches dairy milk protein gram-for-gram with zero lactose.',
        budgetTip: 'Firm tofu absorbs Indian spices rapidly and provides all 9 essential amino acids.',
        preparationSteps: 'Crumble firm tofu. Sauté green peas with turmeric, cumin, and rock salt in 1 tsp oil. Fold in crumbled tofu for 3 minutes. Serve with hot phulkas and warm soy milk.',
        ingredients: '100g firm tofu; 1/3 cup peas; 2 phulkas; 200ml fortified soy milk; turmeric, cumin.',
      },
      {
        mealName: 'Lunch',
        dishTitle: 'High-Protein Soya Chunks & Rajma Curry + Steamed Brown or White Rice + Green Salad',
        quantity: `${dalCups} rajma with 30g boiled soya chunks + ${riceCups} rice + 1 plate cucumber tomato salad`,
        proteinEstimate: isCut ? '~26–30 g protein' : '~34–40 g protein',
        caloriesEstimate: isCut ? '~490 kcal' : '~650 kcal',
        macroSplit: '32P / 92C / 9F',
        priceCategory: '₹22 / serving • Budget Plant',
        prepTime: '18 mins',
        ageSuitability: 'Ages 13–17: Combining legumes with soya chunks boosts the leucine threshold to maximize teen muscle recovery.',
        budgetTip: 'Soya chunks boost the protein density of traditional rajma chawal at near-zero incremental cost.',
        preparationSteps: 'Add soaked, boiled soya chunks into simmering rajma masala gravy. Cook 6 minutes so chunks absorb the rich curry spices. Serve over hot steamed rice.',
        ingredients: `1 cup cooked rajma; 30g dry soya chunks; ${riceCups} rice; salad.`,
      },
      {
        mealName: 'Snack',
        dishTitle: 'Sprouted Moong & Roasted Peanut Chaat + Seasonal Fruit',
        quantity: '1 cup steamed sprouted moong + 20g roasted peanuts + diced cucumber + lemon + 1 fruit',
        proteinEstimate: '~14–17 g protein',
        caloriesEstimate: '~260 kcal',
        macroSplit: '15P / 36C / 6F',
        priceCategory: '₹16 / serving • Living Enzymes',
        prepTime: '5 mins',
        ageSuitability: 'Ages 13–17: Sprouting increases vitamin C and active enzyme content for adolescent gut microbiome diversity.',
        budgetTip: 'Sprouting whole green moong at home costs under ₹10 and doubles the bioavailable folate and fiber.',
        preparationSteps: 'Lightly steam sprouted green moong for 3 minutes. Toss with roasted peanuts, chopped cucumber, chaat masala, and a generous squeeze of fresh lemon juice.',
        ingredients: '1 cup sprouted moong; 20g peanuts; cucumber; lemon juice; seasonal fruit.',
      },
      {
        mealName: 'Dinner',
        dishTitle: 'Sautéed Firm Tofu & Bell Peppers + Whole Wheat Phulkas + Yellow Dal Tadka',
        quantity: `${rotiCount} phulkas + 120g firm tofu with bell peppers + 1 cup yellow toor dal`,
        proteinEstimate: isCut ? '~26–30 g protein' : '~36–42 g protein',
        caloriesEstimate: isCut ? '~450 kcal' : '~610 kcal',
        macroSplit: '30P / 68C / 14F',
        priceCategory: '₹38 / serving • Clean Plant',
        prepTime: '15 mins',
        ageSuitability: 'Ages 13–17: Clean plant protein that promotes cellular recovery without saturated dairy fats.',
        budgetTip: 'Toor dal paired with firm tofu covers both pulse-based and soy-based amino acid spectrums.',
        preparationSteps: 'Dice tofu and pan-sear in 1 tsp mustard oil with sliced bell peppers, cumin, and turmeric. Serve with warm phulkas and freshly tempered yellow dal.',
        ingredients: `120g firm tofu; 1 bell pepper; ${rotiCount} phulkas; 1 cup dal; spices.`,
      },
    ];
  }

  // =========================================================================
  // 2. AGE GROUP: 18–25 (COLLEGE / HOSTEL / HIGH-PERFORMANCE ATHLETES)
  // =========================================================================
  if (resolvedAgeGroup === '18–25') {
    if (foodStyle === 'Vegetarian') {
      return [
        {
          mealName: 'Breakfast',
          dishTitle: isLowBudget
            ? 'Spiced Chana Sattu Shaker Drink + Homestyle Vegetable Poha'
            : 'High-Protein Besan Chilla with Grated Paneer Stuffing + Curd',
          quantity: isLowBudget
            ? '45g roasted sattu flour whisked in 300ml cold chaas + 1.5 cups cooked poha with 20g peanuts'
            : '2 medium besan chillas stuffed with 75g grated paneer + 150g curd + 1 banana',
          proteinEstimate: isCut ? '~20–24 g protein' : isBulk ? '~30–35 g protein' : '~25–28 g protein',
          caloriesEstimate: isCut ? '~360 kcal' : isBulk ? '~680 kcal' : '~510 kcal',
          macroSplit: isCut ? '22P / 46C / 10F' : isBulk ? '32P / 88C / 20F' : '26P / 66C / 14F',
          priceCategory: isLowBudget ? '₹16 / serving • College Budget King' : '₹38 / serving • Mid-tier Athletic',
          prepTime: '8–10 mins',
          ageSuitability: 'Ages 18–25: Rapid muscle protein synthesis (MPS) initiation tailored for morning gym training.',
          budgetTip: 'Chana Sattu provides 20g natural protein for less than ₹12/serving — unmatched by any commercial supplement.',
          preparationSteps: isLowBudget
            ? 'Whisk roasted sattu flour into cold water or salted buttermilk with roasted cumin, rock salt, and lemon. Rinse flattened rice (poha) and sauté with mustard seeds, green chili, and roasted peanuts. Done in 8 minutes.'
            : 'Whisk gram flour (besan) with ajwain, turmeric, and water into a smooth batter. Cook thin chillas on tawa, fill with spiced grated paneer, and serve with chilled curd.',
          ingredients: isLowBudget
            ? '45g chana sattu; 300ml chaas; 1.5 cups poha; 20g peanuts; lemon, cumin.'
            : '1/2 cup besan; 75g paneer; 150g curd; green chilies, cilantro.',
        },
        {
          mealName: 'Lunch',
          dishTitle: isLowBudget
            ? 'High-Protein Double Dal Tadka (Toor + Masoor) + Roti / Rice + Bhindi Sabzi'
            : 'Paneer Bhurji / Matar Paneer + Whole Wheat Phulkas + Dal Tadka + Salad',
          quantity: isLowBudget
            ? `${dalCups} thick dal + ${rotiCount} phulkas OR ${riceCups} rice + 1 cup green sabzi`
            : `110g paneer bhurji + ${rotiCount} phulkas + 1 cup dal + ${curdPortion} + cucumber salad`,
          proteinEstimate: isCut ? '~24–28 g protein' : isBulk ? '~36–42 g protein' : '~30–34 g protein',
          caloriesEstimate: isCut ? '~490 kcal' : isBulk ? '~820 kcal' : '~640 kcal',
          macroSplit: isCut ? '26P / 74C / 9F' : isBulk ? '38P / 118C / 18F' : '32P / 90C / 13F',
          priceCategory: isLowBudget ? '₹22 / serving • Budget Saver' : '₹48 / serving • Athletic Mid',
          prepTime: '15 mins',
          ageSuitability: 'Ages 18–25: Replenishes liver and muscle glycogen to sustain high-volume strength sessions.',
          budgetTip: 'Mixing toor and masoor lentils cuts cooking time by half while improving essential amino acid balance.',
          preparationSteps: 'Pressure-cook mixed lentils with turmeric and salt. Temper in 1 tsp oil with cumin, garlic, and chopped tomatoes. Serve hot with whole-wheat rotis or steamed rice.',
          ingredients: `1.25 cups dal; ${rotiCount} phulkas or ${riceCups} rice; 1 cup vegetables; spices.`,
        },
        {
          mealName: 'Snack',
          dishTitle: 'Roasted Bhuna Chana Chaat + Sliced Fruit + Green Tea',
          quantity: isCut ? '40g roasted chana + 1 apple' : isBulk ? '60g roasted chana + 2 bananas' : '50g roasted chana + 1 medium fruit',
          proteinEstimate: isCut ? '~10–12 g protein' : isBulk ? '~16–18 g protein' : '~12–14 g protein',
          caloriesEstimate: isCut ? '~190 kcal' : isBulk ? '~390 kcal' : '~270 kcal',
          macroSplit: isCut ? '11P / 32C / 3F' : isBulk ? '17P / 68C / 6F' : '13P / 48C / 4F',
          priceCategory: '₹12 / serving • Pocket Friendly',
          prepTime: '2 mins (Zero Cooking)',
          ageSuitability: 'Ages 18–25: Ideal pre/post workout carbohydrate and plant protein bridge between college lectures.',
          budgetTip: 'Bhuna chana costs ~₹120/kg, providing 100g of pure protein for approximately ₹60 total.',
          preparationSteps: 'Toss roasted Bengal gram with finely chopped onions, tomatoes, green chili, rock salt, and fresh lemon juice.',
          ingredients: '40–60g roasted chana; diced onion, tomato, green chili; lemon; 1 seasonal fruit.',
        },
        {
          mealName: 'Dinner',
          dishTitle: isLowBudget
            ? 'High-Protein Soya Chunks Bhurji/Curry + Whole Wheat Phulkas + Green Salad'
            : 'Fresh Paneer Bhurji / Palak Paneer + Phulkas + Sautéed Greens + Salad',
          quantity: isLowBudget
            ? `65g dry soya chunks (boiled ~200g, delivering 34g protein!) + ${rotiCount} phulkas + salad`
            : `120g fresh paneer + ${rotiCount} phulkas + 1 plate cucumber tomato salad`,
          proteinEstimate: isCut ? '~30–35 g protein' : isBulk ? '~44–50 g protein' : '~36–42 g protein',
          caloriesEstimate: isCut ? '~430 kcal' : isBulk ? '~740 kcal' : '~570 kcal',
          macroSplit: isCut ? '34P / 52C / 9F' : isBulk ? '46P / 86C / 20F' : '38P / 68C / 14F',
          priceCategory: isLowBudget ? '₹18 / serving • Max Protein per Rupee' : '₹52 / serving • Fresh Dairy',
          prepTime: '15 mins',
          ageSuitability: 'Ages 18–25: Maximum nocturnal protein synthesis threshold (~3g leucine) to rebuild torn muscle fibers.',
          budgetTip: 'Soya chunks are the undisputed world champion of budget protein: over 30g protein for just ₹10!',
          preparationSteps: isLowBudget
            ? 'Boil soya chunks in salted water for 5 minutes, rinse in cold water and squeeze out thoroughly. Sauté onions, garlic, turmeric, coriander, and chopped tomatoes. Add crumbled soya and cook 4 minutes into a delicious dry bhurji. Serve with warm phulkas.'
            : 'Crumble fresh paneer. Sauté ginger-garlic, onions, and tomatoes with cumin. Toss in paneer and cook 3 minutes. Serve with hot phulkas.',
          ingredients: isLowBudget
            ? `65g dry soya chunks; ${rotiCount} whole-wheat phulkas; onions, tomatoes, spices.`
            : `120g paneer; ${rotiCount} phulkas; vegetables; spices.`,
        },
      ];
    }

    if (foodStyle === 'Eggetarian' || foodStyle === 'Non-vegetarian') {
      const isNonVeg = foodStyle === 'Non-vegetarian';
      return [
        {
          mealName: 'Breakfast',
          dishTitle: isNonVeg
            ? '3-Egg Masala Omelette + Boiled Shredded Chicken Toast (or Oats) + Fruit'
            : '4-Egg Scramble / Bhurji + Whole Wheat Bread or Rotis + Fruit',
          quantity: isNonVeg
            ? `${isCut ? '3 eggs (2 whites + 1 whole)' : '3 whole eggs'} + 60g shredded chicken + 2 slices toast + 1 fruit`
            : `${isCut ? '4 eggs (2 whites + 2 whole)' : isBulk ? '4 whole eggs' : '3 whole eggs'} + ${isCut ? '1 slice bread' : isBulk ? '3 slices' : '2 slices toast'} + 1 fruit`,
          proteinEstimate: isCut ? '~26–30 g protein' : isBulk ? '~38–44 g protein' : '~32–36 g protein',
          caloriesEstimate: isCut ? '~360 kcal' : isBulk ? '~680 kcal' : '~490 kcal',
          macroSplit: isCut ? '28P / 30C / 12F' : isBulk ? '40P / 72C / 24F' : '34P / 48C / 17F',
          priceCategory: isNonVeg ? '₹58 / serving • Lean Muscle' : '₹26 / serving • High Biological Value',
          prepTime: '10 mins',
          ageSuitability: 'Ages 18–25: Delivers full amino acid spectrum with high leucine to trigger morning muscle mTOR activation.',
          budgetTip: 'Eggs provide 100% net protein utilization at a standard price of only ~₹7 per egg.',
          preparationSteps: 'Heat 1 tsp oil, sauté onions and green chili. Whisk whole eggs with black pepper, scramble or fold into an omelette. Serve with toasted whole-wheat bread and fresh fruit.',
          ingredients: '3–4 fresh eggs; 1–3 slices whole-grain toast; 1 fresh fruit; black pepper, salt.',
        },
        {
          mealName: 'Lunch',
          dishTitle: isNonVeg
            ? 'Pan-Seared Chicken Breast Curry + Steamed Basmati Rice + Dal + Salad'
            : 'Homestyle Egg Pulao / Biryani (3 Eggs) + Dal Tadka + Mint Raita',
          quantity: isNonVeg
            ? `${isCut ? '140g' : isBulk ? '180g' : '160g'} chicken breast + ${riceCups} rice + 1 cup dal + green salad`
            : `3 boiled eggs cooked with spiced rice + 1 cup dal + ${curdPortion} raita + salad`,
          proteinEstimate: isCut ? '~36–42 g protein' : isBulk ? '~48–56 g protein' : '~42–46 g protein',
          caloriesEstimate: isCut ? '~520 kcal' : isBulk ? '~860 kcal' : '~670 kcal',
          macroSplit: isCut ? '38P / 66C / 11F' : isBulk ? '52P / 112C / 20F' : '44P / 84C / 14F',
          priceCategory: isNonVeg ? '₹72 / serving • Pure Lean Protein' : '₹32 / serving • Athletic Budget',
          prepTime: isNonVeg ? '18 mins' : '15 mins',
          ageSuitability: 'Ages 18–25: Elite muscle recovery and strength building without unwanted saturated fats.',
          budgetTip: 'Skinless chicken breast delivers 31g pure protein per 100g with zero carbs and ~1.5g fat.',
          preparationSteps: isNonVeg
            ? 'Dice chicken breast. Marinate with curd, lemon juice, turmeric, and garlic paste. Pan-sear or cook in light onion-tomato curry for 10 minutes until juicy. Serve with steamed rice and dal.'
            : 'Sauté boiled halved eggs with cumin, turmeric, and cooked basmati rice into an aromatic egg pulao. Serve with dal and cool cucumber raita.',
          ingredients: isNonVeg
            ? `140–180g chicken breast; ${riceCups} rice; 1 cup dal; salad.`
            : `3 eggs; ${riceCups} rice; 1 cup dal; ${curdPortion}; spices.`,
        },
        {
          mealName: 'Snack',
          dishTitle: 'Boiled Egg Whites Chaat / Chicken Tikka Skewers + Roasted Chana',
          quantity: isNonVeg
            ? '80g pan-grilled chicken cubes OR 3 boiled egg whites + 30g roasted chana + 1 seasonal fruit'
            : '3 boiled eggs (2 whites + 1 whole) with chaat masala + 35g roasted chana',
          proteinEstimate: isCut ? '~16–20 g protein' : '~22–26 g protein',
          caloriesEstimate: isCut ? '~180 kcal' : '~270 kcal',
          macroSplit: '20P / 24C / 6F',
          priceCategory: isNonVeg ? '₹45 / serving' : '₹20 / serving',
          prepTime: '5 mins',
          ageSuitability: 'Ages 18–25: Rapid post-training amino acid delivery preventing catabolic muscle breakdown.',
          budgetTip: 'Pre-boiling a batch of 6 eggs in the morning takes 10 minutes and covers snacks for the entire day.',
          preparationSteps: 'Slice hard-boiled egg whites, toss with chaat masala, diced onions, tomatoes, and lemon juice.',
          ingredients: '2–3 boiled eggs; 30–35g roasted chana; chaat masala; 1 fruit.',
        },
        {
          mealName: 'Dinner',
          dishTitle: isNonVeg
            ? 'Homestyle Chicken / Fish Curry + Whole Wheat Phulkas + Cucumber Onion Salad'
            : 'Homestyle 3-Egg Curry + Whole Wheat Phulkas + Green Salad',
          quantity: isNonVeg
            ? `${isCut ? '130g' : isBulk ? '170g' : '150g'} chicken or fish + ${rotiCount} phulkas + 1 plate fresh salad`
            : `3 boiled eggs in spiced tomato-onion curry + ${rotiCount} phulkas + 1 plate salad`,
          proteinEstimate: isCut ? '~34–38 g protein' : isBulk ? '~46–52 g protein' : '~38–44 g protein',
          caloriesEstimate: isCut ? '~450 kcal' : isBulk ? '~760 kcal' : '~590 kcal',
          macroSplit: isCut ? '36P / 48C / 12F' : isBulk ? '48P / 88C / 22F' : '40P / 66C / 16F',
          priceCategory: isNonVeg ? '₹70 / serving • High Protein Catch' : '₹30 / serving • Budget Egg',
          prepTime: '18 mins',
          ageSuitability: 'Ages 18–25: Sustained amino acid delivery for overnight muscle hypertrophy and CNS regeneration.',
          budgetTip: 'Eggs and chicken absorb homestyle spices readily without needing heavy restaurant creams or excessive oils.',
          preparationSteps: 'Simmer chicken, fish, or pierced boiled eggs in a fragrant curry of cumin, coriander, ginger, garlic, and tomato puree for 10 minutes. Serve with warm whole-wheat phulkas.',
          ingredients: isNonVeg
            ? `130–170g chicken or fish; ${rotiCount} phulkas; salad.`
            : `3 eggs; ${rotiCount} phulkas; curry gravy; salad.`,
        },
      ];
    }

    if (foodStyle === 'Jain') {
      return [
        {
          mealName: 'Breakfast',
          dishTitle: 'Jain Besan Chilla with Ajwain & Rock Salt + Fresh Curd + Roasted Makhana',
          quantity: '2 medium besan chillas + 150g fresh curd + 20g roasted makhana + 1 banana',
          proteinEstimate: isCut ? '~18–22 g protein' : '~26–30 g protein',
          caloriesEstimate: isCut ? '~360 kcal' : '~500 kcal',
          macroSplit: '24P / 64C / 14F',
          priceCategory: '₹26 / serving • Sattvic Athletic',
          prepTime: '10 mins',
          ageSuitability: 'Ages 18–25: Sattvic, energizing breakfast free of all root vegetables that keeps focus laser-sharp.',
          budgetTip: 'Gram flour (besan) contains 22% plant protein and is 100% compliant with Jain dietary rules.',
          preparationSteps: 'Mix besan with carom seeds (ajwain), rock salt, turmeric, and fresh chopped coriander. Cook on hot tawa with minimal ghee. Serve with fresh curd and crunchy makhana.',
          ingredients: 'Besan; ajwain, rock salt; 150g fresh curd; 20g makhana; 1 banana.',
        },
        {
          mealName: 'Lunch',
          dishTitle: 'Moong Dal Tadka (No Onion / Garlic) + 3 Whole Wheat Phulkas + Lauki Sabzi + Curd',
          quantity: `${dalCups} yellow moong dal + ${rotiCount} phulkas + ${curdPortion} + 1 cup bottle gourd sabzi`,
          proteinEstimate: isCut ? '~22–26 g protein' : '~30–34 g protein',
          caloriesEstimate: isCut ? '~480 kcal' : '~620 kcal',
          macroSplit: '28P / 92C / 12F',
          priceCategory: '₹24 / serving • Sattvic Staple',
          prepTime: '15 mins',
          ageSuitability: 'Ages 18–25: High branch-chain amino acids (BCAAs) from moong dal with zero digestive bloating.',
          budgetTip: 'Moong dal is the easiest pulse to digest and forms the backbone of athletic sattvic nutrition.',
          preparationSteps: 'Cook yellow split moong dal with turmeric and rock salt. Temper with cumin seeds and hing in 1 tsp pure ghee. Serve with warm phulkas and lauki sabzi.',
          ingredients: `${dalCups} moong dal; ${rotiCount} phulkas; ${curdPortion}; 1 cup lauki.`,
        },
        {
          mealName: 'Snack',
          dishTitle: 'Roasted Bengal Gram (Bhuna Chana) + Raw Almonds + Permissible Fruit',
          quantity: '45g roasted chana + 15g almonds + 1 seasonal fruit',
          proteinEstimate: '~12–15 g protein',
          caloriesEstimate: '~260 kcal',
          macroSplit: '13P / 38C / 8F',
          priceCategory: '₹18 / serving',
          prepTime: '2 mins',
          ageSuitability: 'Ages 18–25: Clean sustained sports energy without processed preservatives or forbidden root crops.',
          budgetTip: 'Natural roasted chana is naturally sattvic and provides rich zinc and magnesium.',
          preparationSteps: 'Ready to eat dry snack. Pair with raw almonds and sliced fresh fruit.',
          ingredients: '45g roasted chana; 15g almonds; 1 fresh fruit.',
        },
        {
          mealName: 'Dinner',
          dishTitle: 'Sattvic Paneer Bhurji / Palak Paneer (No Onion/Garlic) + Phulkas + Lauki Mash',
          quantity: `${rotiCount} phulkas + 120g fresh paneer in cumin-tomato gravy + 1 cup permissible greens`,
          proteinEstimate: isCut ? '~26–30 g protein' : '~36–42 g protein',
          caloriesEstimate: isCut ? '~460 kcal' : '~610 kcal',
          macroSplit: '34P / 64C / 18F',
          priceCategory: '₹46 / serving • High Dairy Protein',
          prepTime: '15 mins',
          ageSuitability: 'Ages 18–25: Slow-release micellar casein protein supporting overnight muscle fiber repair.',
          budgetTip: 'Paneer delivers complete dairy protein with high satiety for athletes observing chauvihar (eating before sundown).',
          preparationSteps: 'Simmer pureed ripe tomatoes with cumin, coriander, turmeric, and rock salt in ghee. Add paneer cubes or crumbled paneer and cook 3 minutes. Serve with hot phulkas.',
          ingredients: `120g paneer; ${rotiCount} phulkas; fresh tomato puree; permissible vegetables; ghee.`,
        },
      ];
    }

    // Mostly plant-based
    return [
      {
        mealName: 'Breakfast',
        dishTitle: 'Rolled Oats in Fortified Soy Milk + Banana + Chia Seeds & Peanuts',
        quantity: '50g oats simmered in 250ml soy milk + 1 banana + 15g chia seeds + 15g roasted peanuts',
        proteinEstimate: '~22–26 g protein',
        caloriesEstimate: isCut ? '~380 kcal' : '~520 kcal',
        macroSplit: '24P / 72C / 14F',
        priceCategory: '₹28 / serving • Plant Fuel',
        prepTime: '6 mins',
        ageSuitability: 'Ages 18–25: Provides plant-based Omega-3 alpha-linolenic acid (ALA) for joint and tendon recovery.',
        budgetTip: 'Peanuts provide 26% protein and cost just ₹140/kg, serving as an affordable superfood.',
        preparationSteps: 'Cook rolled oats in soy milk for 5 minutes. Top with sliced banana, roasted crushed peanuts, and chia seeds.',
        ingredients: '50g rolled oats; 250ml soy milk; 1 banana; 15g chia seeds; 15g peanuts.',
      },
      {
        mealName: 'Lunch',
        dishTitle: 'High-Protein Soya Chunks & Peas Pulao + Yellow Dal + Mixed Salad',
        quantity: `45g dry soya chunks cooked with ${riceCups} basmati rice + ${dalCups} dal + green salad`,
        proteinEstimate: isCut ? '~28–32 g protein' : '~38–44 g protein',
        caloriesEstimate: isCut ? '~500 kcal' : '~670 kcal',
        macroSplit: '36P / 96C / 11F',
        priceCategory: '₹24 / serving • Maximum Efficiency',
        prepTime: '18 mins',
        ageSuitability: 'Ages 18–25: Synergistic plant protein combining grain (rice), pulse (dal), and legume (soya).',
        budgetTip: 'Soya chunks boost the protein content of rice pulao to match restaurant chicken biryani at 1/5th the cost.',
        preparationSteps: 'Sauté soaked soya chunks with cumin, bay leaf, peas, and soaked basmati rice. Cook until rice is fluffy. Serve with hot yellow dal and crunchy salad.',
        ingredients: `45g dry soya chunks; ${riceCups} rice; ${dalCups} dal; green peas; salad.`,
      },
      {
        mealName: 'Snack',
        dishTitle: 'Peanut & Sattu Protein Cooler + Seasonal Fruit',
        quantity: '35g chana sattu + 15g powdered peanuts in 300ml cold water with lemon and cumin + 1 fruit',
        proteinEstimate: '~18–21 g protein',
        caloriesEstimate: '~280 kcal',
        macroSplit: '19P / 36C / 8F',
        priceCategory: '₹15 / serving • Natural Shaker',
        prepTime: '2 mins',
        ageSuitability: 'Ages 18–25: 100% natural, portable shaker drink for post-workout athletic hydration and recovery.',
        budgetTip: 'Powdered peanuts and sattu replace commercial vegan protein powders at less than 15% of the cost.',
        preparationSteps: 'Shake sattu, crushed peanuts, roasted cumin, black salt, and lemon juice in a shaker with chilled water.',
        ingredients: '35g sattu; 15g peanuts; lemon; rock salt; 1 fruit.',
      },
      {
        mealName: 'Dinner',
        dishTitle: 'Pan-Tossed Firm Tofu with Bell Peppers & Garlic + Whole Wheat Phulkas + Sprout Salad',
        quantity: `${isCut ? '130g' : '160g'} firm tofu sautéed with peppers + ${rotiCount} phulkas + 1 plate sprout salad`,
        proteinEstimate: isCut ? '~28–32 g protein' : '~36–42 g protein',
        caloriesEstimate: isCut ? '~440 kcal' : '~610 kcal',
        macroSplit: '32P / 64C / 15F',
        priceCategory: '₹44 / serving • Clean Muscle',
        prepTime: '15 mins',
        ageSuitability: 'Ages 18–25: Complete amino acid profile supporting lean muscle tissue repair without digestive heaviness.',
        budgetTip: 'Firm tofu yields 16–18g pure protein per 100g and pan-sears crisp in just 5 minutes.',
        preparationSteps: 'Press tofu dry, dice into cubes. Sear in 1 tsp oil until edges turn golden. Toss with sliced bell peppers, onion, and a splash of soy sauce. Serve with warm phulkas.',
        ingredients: `130–160g firm tofu; 1 bell pepper; ${rotiCount} phulkas; sprout salad.`,
      },
    ];
  }

  // =========================================================================
  // 3. AGE GROUP: 26–40 (WORKING ADULTS / LIFTERS / LOW-GI METABOLIC SUSTAIN)
  // =========================================================================
  if (resolvedAgeGroup === '26–40') {
    if (foodStyle === 'Vegetarian') {
      return [
        {
          mealName: 'Breakfast',
          dishTitle: isLowBudget
            ? 'Vegetable Oats & Moong Dal Cheela + Fresh Homemade Curd'
            : 'Sprouted Moong & Grilled Paneer Chaat Bowl with Lemon & Mint',
          quantity: isLowBudget
            ? '2 medium oats-moong cheelas with spinach + 150g curd + 1 seasonal fruit'
            : '1.5 cups steamed moong sprouts + 75g grilled paneer cubes + cucumber + tomato + mint chutney',
          proteinEstimate: isCut ? '~20–24 g protein' : '~26–30 g protein',
          caloriesEstimate: isCut ? '~350 kcal' : '~480 kcal',
          macroSplit: isCut ? '22P / 44C / 9F' : '28P / 52C / 14F',
          priceCategory: isLowBudget ? '₹20 / serving • Low GI' : '₹42 / serving • Metabolic Clean',
          prepTime: '10–12 mins',
          ageSuitability: 'Ages 26–40: Low-glycemic, fiber-rich breakfast preventing the 11 AM insulin spike and desk-job energy crash.',
          budgetTip: 'Sprouting moong beans at home enhances digestive enzyme activity and micronutrient bioavailability.',
          preparationSteps: 'Steam sprouted moong for 3 minutes. Toss with light pan-seared paneer cubes, chopped cucumber, tomato, green chilies, chaat masala, and fresh lemon juice. Clean, filling, and metabolic.',
          ingredients: '1.5 cups sprouted moong; 75g paneer; cucumber, tomato; lemon, mint.',
        },
        {
          mealName: 'Lunch',
          dishTitle: 'Low-Oil Dal Palak (Spinach Lentils) + Multigrain Phulkas + Cucumber Raita + Salad',
          quantity: `${dalCups} thick toor/moong dal cooked with fresh spinach + ${rotiCount} multigrain phulkas + ${curdPortion} raita + green salad`,
          proteinEstimate: isCut ? '~24–28 g protein' : '~32–36 g protein',
          caloriesEstimate: isCut ? '~470 kcal' : '~610 kcal',
          macroSplit: isCut ? '26P / 70C / 9F' : '32P / 88C / 13F',
          priceCategory: '₹28 / serving • Balanced Professional',
          prepTime: '15 mins',
          ageSuitability: 'Ages 26–40: Rich in dietary folate, magnesium, and dietary fiber supporting cardiovascular and metabolic health.',
          budgetTip: 'Fresh palak (spinach) is highly affordable in Indian mandis and adds volume and iron without surplus calories.',
          preparationSteps: 'Pressure-cook toor dal with chopped spinach, turmeric, and garlic. Temper with cumin seeds and a single teaspoon of ghee. Serve alongside multigrain phulkas and chilled cucumber raita.',
          ingredients: `${dalCups} dal palak; ${rotiCount} multigrain phulkas; ${curdPortion}; salad.`,
        },
        {
          mealName: 'Snack',
          dishTitle: 'Roasted Makhana (Foxnuts) with Turmeric & Himalayan Salt + Raw Almonds',
          quantity: '30g roasted makhana + 15g raw almonds + 1 cup unsweetened green tea + 1 fruit',
          proteinEstimate: '~10–12 g protein',
          caloriesEstimate: '~210 kcal',
          macroSplit: '10P / 26C / 7F',
          priceCategory: '₹26 / serving • Clean Crunch',
          prepTime: '3 mins',
          ageSuitability: 'Ages 26–40: Rich in polyphenols and healthy fats to counter occupational oxidative stress and screen fatigue.',
          budgetTip: 'Makhana has a very low glycemic index and provides steady satiety without heavy saturated fats.',
          preparationSteps: 'Dry-roast foxnuts in a non-stick pan with a pinch of turmeric and rock salt until crisp. Pair with raw soaked almonds and hot green tea.',
          ingredients: '30g makhana; 15g almonds; green tea; 1 fruit.',
        },
        {
          mealName: 'Dinner',
          dishTitle: 'Light Palak Paneer or Soya Chunks Curry + Soft Phulkas + Large Garden Salad',
          quantity: `${isLowBudget ? '65g dry soya' : '110g paneer'} simmered in spinach/tomato gravy + ${rotiCount} phulkas + 1 plate cucumber carrot salad`,
          proteinEstimate: isCut ? '~28–32 g protein' : '~36–42 g protein',
          caloriesEstimate: isCut ? '~420 kcal' : '~570 kcal',
          macroSplit: isCut ? '30P / 48C / 11F' : '38P / 66C / 16F',
          priceCategory: isLowBudget ? '₹18 / serving • Soya Lean' : '₹48 / serving • Homestyle Paneer',
          prepTime: '15 mins',
          ageSuitability: 'Ages 26–40: Calibrated carb and fat ratio to prevent visceral abdominal fat accumulation while preserving lean muscle mass.',
          budgetTip: 'Pureeing fresh spinach into the gravy delivers a restaurant-style palak paneer with zero heavy cream.',
          preparationSteps: 'Blanch spinach and blend into a smooth puree. Sauté cumin, garlic, and onions. Add spinach puree and fresh paneer cubes (or squeezed soya). Simmer 4 minutes. Serve with hot phulkas.',
          ingredients: '110g paneer or 65g soya; 1 bunch spinach; ${rotiCount} phulkas; salad.',
        },
      ];
    }

    if (foodStyle === 'Eggetarian' || foodStyle === 'Non-vegetarian') {
      const isNonVeg = foodStyle === 'Non-vegetarian';
      return [
        {
          mealName: 'Breakfast',
          dishTitle: isNonVeg
            ? 'Smoked / Grilled Chicken Breast on Multigrain Toast + 2 Boiled Egg Whites + Black Coffee'
            : '3-Egg Spinach & Herb Scramble with Multigrain Toast + Seasonal Fruit',
          quantity: isNonVeg
            ? '80g sliced grilled chicken + 2 egg whites + 2 slices multigrain toast + 1 fruit'
            : `${isCut ? '3 eggs (2 whites + 1 whole)' : '3 whole eggs'} scrambled with baby spinach + 2 slices multigrain bread + 1 fruit`,
          proteinEstimate: isCut ? '~28–32 g protein' : '~34–38 g protein',
          caloriesEstimate: isCut ? '~340 kcal' : '~480 kcal',
          macroSplit: isCut ? '30P / 28C / 10F' : '36P / 42C / 16F',
          priceCategory: isNonVeg ? '₹62 / serving • Lean Muscle' : '₹26 / serving • Clean Athletic',
          prepTime: '10 mins',
          ageSuitability: 'Ages 26–40: High morning protein protects muscle mass while keeping blood sugar flat during desk work.',
          budgetTip: 'Multigrain bread paired with farm eggs provides rich B-vitamins and long-lasting energy.',
          preparationSteps: 'Sauté chopped spinach and tomatoes in 1 tsp olive oil or ghee. Add whisked eggs with black pepper, scramble lightly. Serve with toasted multigrain bread.',
          ingredients: '3 eggs; 2 slices multigrain bread; spinach; 1 fresh fruit.',
        },
        {
          mealName: 'Lunch',
          dishTitle: isNonVeg
            ? 'Grilled Lemon-Herb Chicken Breast + Brown Rice / Phulkas + Dal + Sautéed Beans'
            : 'Double Dal Tadka + 2-3 Multigrain Phulkas + 2 Eggs in Curry + Sprout Salad',
          quantity: isNonVeg
            ? `${isCut ? '150g' : '180g'} chicken breast + ${riceCups} brown rice OR ${rotiCount} phulkas + 1 cup dal + greens`
            : `${dalCups} dal + ${rotiCount} phulkas + 2 eggs in curry + ${curdPortion} raita + sprout salad`,
          proteinEstimate: isCut ? '~36–42 g protein' : '~46–52 g protein',
          caloriesEstimate: isCut ? '~490 kcal' : '~670 kcal',
          macroSplit: isCut ? '38P / 58C / 10F' : '48P / 78C / 16F',
          priceCategory: isNonVeg ? '₹78 / serving • Pure Lean Protein' : '₹30 / serving • Budget Egg',
          prepTime: '18 mins',
          ageSuitability: 'Ages 26–40: Lean poultry or eggs supply carnitine, creatine, and amino acids for peak afternoon cognitive stamina.',
          budgetTip: 'Brown rice and lentils provide slow-burning carbs that prevent post-lunch sluggishness.',
          preparationSteps: isNonVeg
            ? 'Marinate chicken breast with lemon juice, crushed garlic, pepper, and dried herbs. Pan-sear on a cast iron skillet for 5 minutes per side. Serve alongside steamed brown rice, yellow dal, and green salad.'
            : 'Simmer 2 hard-boiled eggs in onion-tomato curry. Serve with yellow dal, multigrain phulkas, and fresh raita.',
          ingredients: isNonVeg
            ? `150–180g chicken breast; ${riceCups} brown rice; 1 cup dal; greens.`
            : `2 eggs; ${dalCups} dal; ${rotiCount} phulkas; ${curdPortion}; salad.`,
        },
        {
          mealName: 'Snack',
          dishTitle: 'Sprouted Moong Chaat with Lemon OR Boiled Eggs + Roasted Chana',
          quantity: '1 cup sprouted moong chaat + 30g roasted chana + green tea',
          proteinEstimate: '~14–17 g protein',
          caloriesEstimate: '~210 kcal',
          macroSplit: '15P / 30C / 4F',
          priceCategory: '₹18 / serving • Living Enzymes',
          prepTime: '3 mins',
          ageSuitability: 'Ages 26–40: Living sprouts deliver active enzymes and bioflavonoids to support cellular detoxification.',
          budgetTip: 'Sprouting pulses at home costs under ₹10 per serving and yields 3x the bioavailable vitamins.',
          preparationSteps: 'Toss steamed sprouts and roasted chana with diced cucumber, rock salt, and fresh lemon juice.',
          ingredients: 'Sprouted moong; roasted chana; cucumber, lemon, chaat masala.',
        },
        {
          mealName: 'Dinner',
          dishTitle: isNonVeg
            ? 'Pan-Seared Fish Fillet (Rohu / Basa / Salmon) with Lemon Pepper + Phulkas + Salad'
            : '2 Whole Eggs + 2 Whites Scrambled with Spinach & Herbs + Soft Phulkas + Salad',
          quantity: isNonVeg
            ? `${isCut ? '140g' : '170g'} fish fillet + ${rotiCount} phulkas + 1 large green salad`
            : `4 eggs (2 whole + 2 whites) scrambled + ${rotiCount} phulkas + green salad`,
          proteinEstimate: isCut ? '~32–36 g protein' : '~42–48 g protein',
          caloriesEstimate: isCut ? '~420 kcal' : '~580 kcal',
          macroSplit: isCut ? '34P / 42C / 11F' : '44P / 62C / 16F',
          priceCategory: isNonVeg ? '₹82 / serving • Omega-3 Catch' : '₹28 / serving • Clean Egg',
          prepTime: '15 mins',
          ageSuitability: 'Ages 26–40: Marine Omega-3 fatty acids EPA & DHA lower systemic inflammation and support joint cartilage.',
          budgetTip: 'Locally sourced freshwater fish provides the same essential fatty acids as imported fish at half the cost.',
          preparationSteps: 'Rub fish fillet with lemon juice, turmeric, and cracked black pepper. Sear in 1 tsp oil for 4 minutes per side until flaky. Serve with warm phulkas and fresh salad.',
          ingredients: isNonVeg
            ? `140–170g fish fillet; ${rotiCount} phulkas; green salad.`
            : `4 eggs; ${rotiCount} phulkas; salad.`,
        },
      ];
    }

    if (foodStyle === 'Jain') {
      return [
        {
          mealName: 'Breakfast',
          dishTitle: 'Steamed Moong Dal Dhokla / Idlis with Fresh Coconut Chutney + Curd',
          quantity: '3 steamed moong dal idlis/dhokla + 2 tbsp fresh coconut chutney + 150g curd + 1 fruit',
          proteinEstimate: '~18–22 g protein',
          caloriesEstimate: '~360 kcal',
          macroSplit: '20P / 52C / 10F',
          priceCategory: '₹26 / serving • Sattvic Steamed',
          prepTime: '15 mins',
          ageSuitability: 'Ages 26–40: Steamed preparation ensures zero heavy fats and optimal nutrient absorption.',
          budgetTip: 'Steamed moong dal requires no frying and creates a light, gut-friendly breakfast.',
          preparationSteps: 'Grind soaked split moong dal with green chilies, rock salt, and hing. Steam in idli plates for 10 minutes. Serve with fresh grated coconut chutney and homemade curd.',
          ingredients: 'Moong dal; rock salt, green chilies; fresh coconut chutney; 150g curd; 1 fruit.',
        },
        {
          mealName: 'Lunch',
          dishTitle: 'Sattvic Yellow Dal Tadka + Multigrain Phulkas + Paneer in Tomato Gravy + Curd',
          quantity: `${dalCups} yellow dal + ${rotiCount} multigrain phulkas + 80g paneer in tomato-cumin gravy + ${curdPortion}`,
          proteinEstimate: isCut ? '~24–28 g protein' : '~32–36 g protein',
          caloriesEstimate: isCut ? '~480 kcal' : '~630 kcal',
          macroSplit: '28P / 82C / 14F',
          priceCategory: '₹42 / serving • Pure Sattvic',
          prepTime: '18 mins',
          ageSuitability: 'Ages 26–40: Complete vegetarian protein adhering to traditional root-free dietary laws.',
          budgetTip: 'Using ripe tomatoes and cumin seeds creates rich, aromatic gravy without onion or garlic.',
          preparationSteps: 'Cook yellow dal with turmeric and rock salt. Simmer fresh diced paneer in a pureed tomato gravy seasoned with cumin and coriander. Serve with phulkas and curd.',
          ingredients: `${dalCups} dal; ${rotiCount} phulkas; 80g paneer; fresh tomato gravy; ${curdPortion}.`,
        },
        {
          mealName: 'Snack',
          dishTitle: 'Roasted Bhuna Chana + Raw Walnuts + Permissible Seasonal Fruit',
          quantity: '40g roasted chana + 15g raw walnuts + 1 seasonal fruit',
          proteinEstimate: '~11–13 g protein',
          caloriesEstimate: '~230 kcal',
          macroSplit: '12P / 32C / 7F',
          priceCategory: '₹20 / serving',
          prepTime: '2 mins',
          ageSuitability: 'Ages 26–40: Walnuts provide plant ALA Omega-3s supporting brain health and memory.',
          budgetTip: 'Dry-roasted Bengal gram and walnuts require zero culinary preparation.',
          preparationSteps: 'Portion out roasted chana with soaked raw walnuts and sliced fresh fruit.',
          ingredients: '40g roasted chana; 15g walnuts; 1 fresh fruit.',
        },
        {
          mealName: 'Dinner',
          dishTitle: 'Sattvic Tofu / Paneer Sauté with Cumin, Coriander & Tomato + Soft Phulkas',
          quantity: `${rotiCount} phulkas + 110g paneer or firm tofu + 1 cup permissible bottle gourd/turai sabzi`,
          proteinEstimate: isCut ? '~25–29 g protein' : '~34–40 g protein',
          caloriesEstimate: isCut ? '~440 kcal' : '~590 kcal',
          macroSplit: '30P / 58C / 16F',
          priceCategory: '₹44 / serving',
          prepTime: '15 mins',
          ageSuitability: 'Ages 26–40: Light evening meal that supports peaceful sleep and uninterrupted recovery.',
          budgetTip: 'Cooking dinner before sunset complies with traditional chauvihar practice and improves nocturnal insulin sensitivity.',
          preparationSteps: 'Sauté diced paneer or tofu in 1 tsp ghee with cumin, coriander, and tomato puree. Serve with soft phulkas and steamed gourd sabzi.',
          ingredients: `110g paneer or tofu; ${rotiCount} phulkas; permissible vegetables; ghee.`,
        },
      ];
    }

    // Mostly plant-based
    return [
      {
        mealName: 'Breakfast',
        dishTitle: 'Spiced Firm Tofu & Bell Pepper Scramble with Multigrain Toast + Black Coffee',
        quantity: '120g crumbled firm tofu sautéed with peppers, spinach and turmeric + 2 slices multigrain bread + 1 fruit',
        proteinEstimate: '~22–26 g protein',
        caloriesEstimate: '~360 kcal',
        macroSplit: '24P / 42C / 12F',
        priceCategory: '₹36 / serving • Clean Plant',
        prepTime: '10 mins',
        ageSuitability: 'Ages 26–40: Complete plant protein with high antioxidant density to combat daily workplace stress.',
        budgetTip: 'Crumbled tofu mimics egg scramble perfectly and takes under 6 minutes to cook on a tawa.',
        preparationSteps: 'Crumble firm tofu. Sauté bell peppers and spinach in 1 tsp olive oil with turmeric, cumin, and black salt. Fold in tofu and cook 3 minutes. Serve on toast.',
        ingredients: '120g firm tofu; bell peppers, spinach; 2 slices multigrain bread; turmeric, black salt.',
      },
      {
        mealName: 'Lunch',
        dishTitle: 'Tofu & Vegetable Stir-Fry + Steamed Brown Rice + Yellow Dal Tadka',
        quantity: `120g firm tofu + ${riceCups} brown rice + ${dalCups} yellow dal + steamed broccoli/beans`,
        proteinEstimate: isCut ? '~26–30 g protein' : '~36–42 g protein',
        caloriesEstimate: isCut ? '~480 kcal' : '~640 kcal',
        macroSplit: '30P / 78C / 12F',
        priceCategory: '₹42 / serving • Clean Plant',
        prepTime: '18 mins',
        ageSuitability: 'Ages 26–40: High in glucosinolates from cruciferous greens and complex fiber from brown rice.',
        budgetTip: 'Pairing yellow dal with tofu provides complementary amino acids with clean metabolic digestion.',
        preparationSteps: 'Pan-sear diced tofu with broccoli and beans in 1 tsp sesame oil with soy sauce and black pepper. Serve with brown rice and freshly cooked dal.',
        ingredients: `120g tofu; ${riceCups} brown rice; ${dalCups} dal; mixed greens.`,
      },
      {
        mealName: 'Snack',
        dishTitle: 'Roasted Bhuna Chana + Peanut Chaat + Green Tea',
        quantity: '40g roasted chana + 15g roasted peanuts + cucumber + lemon + green tea',
        proteinEstimate: '~13–16 g protein',
        caloriesEstimate: '~240 kcal',
        macroSplit: '14P / 28C / 8F',
        priceCategory: '₹14 / serving',
        prepTime: '2 mins',
        ageSuitability: 'Ages 26–40: 100% whole plant food snack with zero artificial additives or inflammatory oils.',
        budgetTip: 'Peanuts and chana provide sustained energy and keep hunger in check between meals.',
        preparationSteps: 'Toss roasted chana and peanuts with diced cucumber, rock salt, and lemon juice.',
        ingredients: '40g roasted chana; 15g peanuts; cucumber, lemon.',
      },
      {
        mealName: 'Dinner',
        dishTitle: 'High-Protein Soya & Vegetable Stir-Fry + Multigrain Phulkas + Sprout Salad',
        quantity: `60g dry soya chunks (boiled ~180g) with stir-fried greens + ${rotiCount} phulkas + salad`,
        proteinEstimate: isCut ? '~28–32 g protein' : '~38–44 g protein',
        caloriesEstimate: isCut ? '~420 kcal' : '~580 kcal',
        macroSplit: '34P / 54C / 10F',
        priceCategory: '₹22 / serving • High Fiber Soya',
        prepTime: '15 mins',
        ageSuitability: 'Ages 26–40: High fiber and isoflavones supporting healthy lipid profiles and metabolic flexibility.',
        budgetTip: 'Soya chunks deliver over 30g protein with under 3g fat and zero cholesterol.',
        preparationSteps: 'Squeeze boiled soya chunks dry. Stir-fry with capsicum, onions, ginger, and soy sauce. Serve with hot multigrain phulkas.',
        ingredients: `60g dry soya chunks; ${rotiCount} phulkas; capsicum, onion; salad.`,
      },
    ];
  }

  // =========================================================================
  // 4. AGE GROUP: 41–60 (MID-LIFE / MASTERS / JOINT MOBILITY & HEART HEALTH)
  // =========================================================================
  if (resolvedAgeGroup === '41–60') {
    if (foodStyle === 'Vegetarian') {
      return [
        {
          mealName: 'Breakfast',
          dishTitle: isLowBudget
            ? 'Methi Thepla with Low-Fat Curd + Roasted Flax Seeds'
            : 'Steamed Moong Dal & Spinach Idlis + Drumstick Sambar + Fresh Coconut Chutney',
          quantity: isLowBudget
            ? '2 whole-wheat methi theplas cooked with minimal oil + 150g curd + 10g ground flax seeds + 1 fruit'
            : '3 steamed moong dal idlis + 1 cup moringa drumstick sambar + 2 tbsp coconut chutney + 1 fruit',
          proteinEstimate: isCut ? '~16–20 g protein' : '~22–26 g protein',
          caloriesEstimate: isCut ? '~320 kcal' : '~440 kcal',
          macroSplit: '20P / 52C / 10F',
          priceCategory: isLowBudget ? '₹20 / serving • Heart Friendly' : '₹34 / serving • Joint Mobility',
          prepTime: '12–15 mins',
          ageSuitability: 'Ages 41–60: Moringa drumstick and fenugreek (methi) are rich in anti-inflammatory polyphenols for joint health.',
          budgetTip: 'Drumsticks (Sahjan/Moringa) provide 7x more vitamin C than oranges and support cartilage recovery.',
          preparationSteps: 'Steam soaked moong dal batter with minced spinach into soft idlis. Cook toor dal with drumsticks, tomatoes, and sambar spices. Serve warm with fresh coconut chutney.',
          ingredients: 'Moong dal; fresh spinach; drumsticks, toor dal; coconut chutney; 1 fruit.',
        },
        {
          mealName: 'Lunch',
          dishTitle: 'Methi Dal (Fenugreek Lentils) + Jowar or Bajra Roti + Steamed Turai + Chaas',
          quantity: `${dalCups} thick methi toor dal + 2 jowar or whole-wheat rotis + 1 cup steamed ridge gourd (turai) + 250ml roasted jeera chaas`,
          proteinEstimate: isCut ? '~22–26 g protein' : '~28–32 g protein',
          caloriesEstimate: isCut ? '~450 kcal' : '~580 kcal',
          macroSplit: '26P / 72C / 10F',
          priceCategory: '₹26 / serving • Low Glycemic',
          prepTime: '18 mins',
          ageSuitability: 'Ages 41–60: Sorghum (Jowar) and fenugreek stabilize post-prandial blood glucose and reduce arterial stiffness.',
          budgetTip: 'Jowar and bajra are gluten-free native millets rich in potassium, iron, and magnesium.',
          preparationSteps: 'Simmer toor dal with fresh chopped fenugreek leaves (methi), garlic, and turmeric. Roll and cook soft jowar rotis on tawa. Pair with light ridge gourd sabzi and refreshing cumin buttermilk.',
          ingredients: `${dalCups} methi dal; 2 jowar rotis; 1 cup turai; 250ml chaas; roasted jeera.`,
        },
        {
          mealName: 'Snack',
          dishTitle: 'Roasted Chana & Roasted Flax Seeds + Cup of Green Tea',
          quantity: '35g roasted chana + 10g roasted flax seeds + 1 cup green tea with cinnamon + 1 papaya bowl',
          proteinEstimate: '~10–12 g protein',
          caloriesEstimate: '~190 kcal',
          macroSplit: '11P / 26C / 5F',
          priceCategory: '₹16 / serving • Anti-Inflammatory',
          prepTime: '2 mins',
          ageSuitability: 'Ages 41–60: Flax seeds supply lignans and Omega-3s that help maintain healthy lipid and cholesterol profiles.',
          budgetTip: 'Flax seeds cost ~₹80/kg and provide the highest plant concentration of heart-healthy ALA.',
          preparationSteps: 'Lightly dry-roast flax seeds and toss with roasted chana. Serve with freshly sliced ripe papaya and green tea.',
          ingredients: '35g roasted chana; 10g flax seeds; fresh papaya; green tea.',
        },
        {
          mealName: 'Dinner',
          dishTitle: 'Yellow Moong Dal Tadka + Soft Phulkas + Lauki Sabzi + Low-Fat Curd',
          quantity: `${dalCups} yellow moong dal + 2 soft thin phulkas + 1 cup bottle gourd (lauki) sabzi + 100g fresh curd`,
          proteinEstimate: isCut ? '~20–24 g protein' : '~28–32 g protein',
          caloriesEstimate: isCut ? '~380 kcal' : '~520 kcal',
          macroSplit: '24P / 58C / 9F',
          priceCategory: '₹24 / serving • Soothing Evening',
          prepTime: '15 mins',
          ageSuitability: 'Ages 41–60: Easy to digest, lower sodium dinner preventing evening acid reflux and water retention.',
          budgetTip: 'Moong dal and lauki form the golden standard of soothing homestyle Indian Ayurvedic dinners.',
          preparationSteps: 'Cook yellow moong dal with turmeric and rock salt. Temper with cumin, hing, and grated ginger. Sauté chopped bottle gourd with minimal oil. Serve with warm phulkas and fresh curd.',
          ingredients: `${dalCups} moong dal; 2 phulkas; 1 cup lauki sabzi; 100g curd; cumin, ginger.`,
        },
      ];
    }

    if (foodStyle === 'Eggetarian' || foodStyle === 'Non-vegetarian') {
      const isNonVeg = foodStyle === 'Non-vegetarian';
      return [
        {
          mealName: 'Breakfast',
          dishTitle: isNonVeg
            ? 'Poached Egg with Grilled Herb Chicken Slice + Warm Daliya Porridge'
            : 'Soft Boiled Eggs (2) with Sautéed Spinach, Tomatoes & 1 Soft Phulka',
          quantity: isNonVeg
            ? '1 poached egg + 70g grilled chicken breast + 1 cup broken wheat daliya with vegetables + fruit'
            : '2 soft-boiled eggs seasoned with cumin & pepper + 1 cup sautéed spinach & tomato + 1 soft phulka',
          proteinEstimate: isCut ? '~22–26 g protein' : '~28–32 g protein',
          caloriesEstimate: isCut ? '~320 kcal' : '~440 kcal',
          macroSplit: '26P / 34C / 11F',
          priceCategory: isNonVeg ? '₹58 / serving • Lean Vitality' : '₹24 / serving • Heart Friendly',
          prepTime: '10 mins',
          ageSuitability: 'Ages 41–60: Whole eggs provide lutein and zeaxanthin to protect against age-related macular eye degeneration.',
          budgetTip: 'Soft boiling eggs preserves fragile Omega-3 fatty acids without adding cooking oils or fats.',
          preparationSteps: 'Boil eggs for 6.5 minutes for a tender soft yolk. Sauté fresh spinach with diced tomatoes and black pepper in 1/2 tsp olive oil. Serve with a soft warm phulka.',
          ingredients: '2 eggs; 1 cup spinach; 1 tomato; 1 phulka; black pepper, cumin.',
        },
        {
          mealName: 'Lunch',
          dishTitle: isNonVeg
            ? 'Omega-3 Rich Fish Curry (Rohu / Katla / Basa) + Steamed Rice + Steamed Spinach'
            : 'Light Yellow Moong Dal + 2 Soft Phulkas + 2 Poached Eggs in Mild Gravy + Beetroot Salad',
          quantity: isNonVeg
            ? `${isCut ? '130g' : '160g'} fish cooked with turmeric, tomato & mustard + ${riceCups} rice + steamed greens`
            : `${dalCups} moong dal + 2 phulkas + 2 eggs in cumin-tomato broth + beetroot salad`,
          proteinEstimate: isCut ? '~30–35 g protein' : '~38–44 g protein',
          caloriesEstimate: isCut ? '~460 kcal' : '~610 kcal',
          macroSplit: isCut ? '32P / 56C / 10F' : '40P / 74C / 15F',
          priceCategory: isNonVeg ? '₹76 / serving • Marine Omega-3' : '₹28 / serving • Budget Egg',
          prepTime: '18 mins',
          ageSuitability: 'Ages 41–60: Omega-3 fatty acids EPA and DHA reduce arterial plaque and alleviate morning joint stiffness.',
          budgetTip: 'Freshwater fish cooked in light turmeric mustard gravy is a traditional heart-protective Indian staple.',
          preparationSteps: isNonVeg
            ? 'Simmer fish pieces in a fragrant gravy of pureed tomatoes, turmeric, ginger, and a hint of mustard paste for 8 minutes. Serve hot over steamed rice with lightly steamed spinach.'
            : 'Simmer soft eggs in mild tomato broth. Serve with yellow moong dal, phulkas, and fresh grated beetroot salad.',
          ingredients: isNonVeg
            ? `130–160g fish fillet; ${riceCups} rice; steamed spinach; spices.`
            : `2 eggs; ${dalCups} dal; 2 phulkas; beetroot salad.`,
        },
        {
          mealName: 'Snack',
          dishTitle: 'Fresh Papaya Cubes with Soaked Walnuts & Pumpkin Seeds',
          quantity: '1 bowl fresh diced papaya + 15g soaked walnuts + 10g pumpkin seeds + green tea',
          proteinEstimate: '~8–10 g protein',
          caloriesEstimate: '~190 kcal',
          macroSplit: '8P / 24C / 8F',
          priceCategory: '₹24 / serving • Digestive Enzyme',
          prepTime: '3 mins',
          ageSuitability: 'Ages 41–60: Papain enzyme in fresh papaya aids gastrointestinal protein breakdown and reduces bloat.',
          budgetTip: 'Papaya is one of the most affordable and gut-soothing fruits available across all Indian seasons.',
          preparationSteps: 'Dice fresh ripe papaya. Top with overnight soaked walnuts and raw pumpkin seeds. Enjoy with green tea.',
          ingredients: 'Fresh papaya; 15g walnuts; 10g pumpkin seeds; green tea.',
        },
        {
          mealName: 'Dinner',
          dishTitle: isNonVeg
            ? 'Steamed / Pan-Grilled Fish Fillet + Steamed Green Beans & Carrots + 1 Soft Phulka'
            : '2 Soft Poached / Boiled Eggs in Mild Cumin Tomato Gravy + 2 Soft Phulkas + Lauki Sabzi',
          quantity: isNonVeg
            ? `${isCut ? '130g' : '160g'} fish fillet + 1 phulka + 1.5 cups steamed carrots, beans & broccoli`
            : `2 eggs in light curry + 2 soft phulkas + 1 cup steamed bottle gourd sabzi`,
          proteinEstimate: isCut ? '~28–32 g protein' : '~36–40 g protein',
          caloriesEstimate: isCut ? '~380 kcal' : '~520 kcal',
          macroSplit: isCut ? '30P / 36C / 9F' : '38P / 52C / 14F',
          priceCategory: isNonVeg ? '₹78 / serving • Lean Catch' : '₹26 / serving • Soothing Egg',
          prepTime: '15 mins',
          ageSuitability: 'Ages 41–60: Easily digested, light evening protein preventing insulin resistance and aiding deep REM sleep.',
          budgetTip: 'Steaming fish with lemon and ginger requires near-zero cooking oil, keeping calories and cholesterol minimal.',
          preparationSteps: 'Steam or lightly sear seasoned fish fillet for 5 minutes. Serve with steamed garden vegetables and a soft warm phulka.',
          ingredients: isNonVeg
            ? `130–160g fish fillet; 1 phulka; mixed steamed vegetables.`
            : `2 eggs; 2 phulkas; 1 cup lauki sabzi.`,
        },
      ];
    }

    if (foodStyle === 'Jain') {
      return [
        {
          mealName: 'Breakfast',
          dishTitle: 'Steamed Rava / Moong Idli with Coconut Coriander Chutney + Fresh Curd',
          quantity: '3 steamed idlis + 2 tbsp fresh coconut chutney + 150g fresh curd + 1 permissible fruit',
          proteinEstimate: '~16–19 g protein',
          caloriesEstimate: '~340 kcal',
          macroSplit: '18P / 52C / 9F',
          priceCategory: '₹24 / serving • Pure Sattvic',
          prepTime: '15 mins',
          ageSuitability: 'Ages 41–60: Gentle fermented preparation nourishing beneficial gut flora without digestive heaviness.',
          budgetTip: 'Steamed idlis are naturally free of oil and completely compliant with Jain culinary ethics.',
          preparationSteps: 'Steam fermented rava or moong batter in idli cooker for 10 minutes. Serve with fresh coconut chutney and fresh homemade curd.',
          ingredients: 'Rava or moong batter; fresh coconut; coriander, cumin; 150g curd; 1 fruit.',
        },
        {
          mealName: 'Lunch',
          dishTitle: 'Moong Dal with Cumin Hing Tempering + 2 Jowar Rotis + Lauki Chana Sabzi + Chaas',
          quantity: `${dalCups} yellow moong dal + 2 jowar rotis + 1 cup bottle gourd sabzi + 250ml fresh roasted jeera chaas`,
          proteinEstimate: isCut ? '~20–24 g protein' : '~26–30 g protein',
          caloriesEstimate: isCut ? '~440 kcal' : '~570 kcal',
          macroSplit: '24P / 74C / 9F',
          priceCategory: '₹26 / serving • Low GI Millet',
          prepTime: '18 mins',
          ageSuitability: 'Ages 41–60: Gluten-free sorghum millet (Jowar) paired with moong dal stabilizes daytime insulin levels.',
          budgetTip: 'Jowar is rich in dietary fiber, helping lower blood pressure and cholesterol.',
          preparationSteps: 'Cook yellow moong dal with cumin and hing. Roll jowar rotis with warm water and cook on tawa. Serve with lauki sabzi and fresh buttermilk.',
          ingredients: `${dalCups} moong dal; 2 jowar rotis; 1 cup lauki sabzi; 250ml chaas; cumin, hing.`,
        },
        {
          mealName: 'Snack',
          dishTitle: 'Roasted Bhuna Chana + Roasted Makhana + Soaked Walnuts',
          quantity: '30g roasted chana + 15g makhana + 10g soaked peeled almonds + 1 permissible fruit',
          proteinEstimate: '~10–12 g protein',
          caloriesEstimate: '~210 kcal',
          macroSplit: '11P / 28C / 6F',
          priceCategory: '₹20 / serving',
          prepTime: '2 mins',
          ageSuitability: 'Ages 41–60: Magnesium-rich nuts and seeds supporting vascular elasticity and cardiovascular calmness.',
          budgetTip: 'Soaking almonds overnight softens the phytic acid skin, making calcium and zinc easier to absorb.',
          preparationSteps: 'Dry-roast makhana with a drop of ghee and rock salt. Mix with roasted chana and soaked peeled almonds.',
          ingredients: '30g chana; 15g makhana; 10g soaked almonds; 1 fruit.',
        },
        {
          mealName: 'Dinner',
          dishTitle: 'Sattvic Lauki & Paneer Simmer + Soft Phulkas + Fresh Curd',
          quantity: '2 soft phulkas + 90g fresh paneer simmered with bottle gourd in cumin tomato gravy + 100g fresh curd',
          proteinEstimate: isCut ? '~22–26 g protein' : '~28–32 g protein',
          caloriesEstimate: isCut ? '~400 kcal' : '~540 kcal',
          macroSplit: '26P / 52C / 14F',
          priceCategory: '₹38 / serving • Sattvic Dairy',
          prepTime: '15 mins',
          ageSuitability: 'Ages 41–60: Light evening meal that supports peaceful sleep and uninterrupted recovery.',
          budgetTip: 'Eating before sunset in accordance with chauvihar practice optimizes circadian rhythm and metabolic health.',
          preparationSteps: 'Simmer fresh paneer cubes and tender bottle gourd in pureed tomato with cumin and rock salt. Serve warm with 2 soft phulkas before sundown.',
          ingredients: '90g fresh paneer; 2 phulkas; 1 cup lauki; tomato puree; 100g curd.',
        },
      ];
    }

    // Mostly plant-based
    return [
      {
        mealName: 'Breakfast',
        dishTitle: 'Vegetable Daliya (Broken Wheat) with Green Peas & Crumbled Tofu + Green Tea',
        quantity: '1.5 cups cooked vegetable daliya with 60g crumbled firm tofu + 1 cup green tea + 1 fruit',
        proteinEstimate: '~18–21 g protein',
        caloriesEstimate: '~340 kcal',
        macroSplit: '20P / 54C / 7F',
        priceCategory: '₹24 / serving • Heart Grains',
        prepTime: '12 mins',
        ageSuitability: 'Ages 41–60: Broken wheat daliya is packed with soluble dietary beta-glucan fiber that actively lowers LDL cholesterol.',
        budgetTip: 'Daliya costs under ₹45/kg and is far more fiber-dense and satiating than processed commercial breakfast cereals.',
        preparationSteps: 'Roast broken wheat in 1 tsp oil, pressure-cook with diced carrots, green peas, turmeric, and cumin. Stir in crumbled firm tofu. Serve piping hot with green tea.',
        ingredients: '1/2 cup dry daliya; 60g firm tofu; green peas; green tea; 1 fruit.',
      },
      {
        mealName: 'Lunch',
        dishTitle: 'Chickpea (Chole) & Spinach Curry + Steamed Brown Rice + Cabbage Carrot Poriyal',
        quantity: `${dalCups} cooked chickpeas in spinach gravy + ${riceCups} brown rice + 1 cup cabbage carrot sabzi`,
        proteinEstimate: isCut ? '~22–26 g protein' : '~28–34 g protein',
        caloriesEstimate: isCut ? '~470 kcal' : '~620 kcal',
        macroSplit: '26P / 82C / 9F',
        priceCategory: '₹28 / serving • Clean Legume',
        prepTime: '20 mins',
        ageSuitability: 'Ages 41–60: Resistant starch from chickpeas nourishes gut Bifidobacteria and stabilizes arterial blood pressure.',
        budgetTip: 'Chole paired with spinach provides rich natural iron, folate, and calcium without expensive supplements.',
        preparationSteps: 'Cook soaked chickpeas until soft. Sauté with pureed spinach, cumin, and mild spices. Serve with steamed brown rice and crunchy cabbage poriyal.',
        ingredients: `${dalCups} chickpeas with spinach; ${riceCups} brown rice; 1 cup cabbage poriyal.`,
      },
      {
        mealName: 'Snack',
        dishTitle: 'Roasted Chana + Ground Flax Seed Sprinkle + Fresh Papaya Bowl',
        quantity: '35g roasted chana + 10g flax seeds + 1 bowl fresh papaya + herbal tea',
        proteinEstimate: '~10–12 g protein',
        caloriesEstimate: '~190 kcal',
        macroSplit: '11P / 26C / 5F',
        priceCategory: '₹16 / serving',
        prepTime: '2 mins',
        ageSuitability: 'Ages 41–60: Natural digestive enzymes and plant fiber for effortless gut regularity.',
        budgetTip: 'Flax seeds and roasted chana provide clean crunchy plant nutrition at negligible cost.',
        preparationSteps: 'Toss roasted chana with ground flax seeds. Serve alongside sweet ripe papaya cubes.',
        ingredients: '35g roasted chana; 10g flax seeds; fresh papaya.',
      },
      {
        mealName: 'Dinner',
        dishTitle: 'Yellow Moong Dal + Sautéed Methi Tofu + 2 Soft Whole Wheat Phulkas',
        quantity: `${dalCups} yellow dal + 100g firm tofu sautéed with fresh fenugreek leaves + 2 soft phulkas`,
        proteinEstimate: isCut ? '~24–28 g protein' : '~30–35 g protein',
        caloriesEstimate: isCut ? '~410 kcal' : '~550 kcal',
        macroSplit: '28P / 58C / 10F',
        priceCategory: '₹34 / serving • Anti-Inflammatory',
        prepTime: '15 mins',
        ageSuitability: 'Ages 41–60: Methi (fenugreek) combined with clean plant protein supports joint comfort and nocturnal recovery.',
        budgetTip: 'Fresh methi leaves cost ~₹10 a bunch and are renowned for lowering blood sugar spikes.',
        preparationSteps: 'Sauté diced tofu with chopped fresh fenugreek leaves, turmeric, and garlic in 1 tsp mustard oil. Serve with hot yellow moong dal and soft phulkas.',
        ingredients: `100g firm tofu; fresh methi leaves; ${dalCups} dal; 2 phulkas.`,
      },
    ];
  }

  // =========================================================================
  // 5. AGE GROUP: 61+ (SENIORS / LONGEVITY / EASY DIGESTION & SARCOPENIA PREVENTION)
  // =========================================================================
  if (foodStyle === 'Vegetarian') {
    return [
      {
        mealName: 'Breakfast',
        dishTitle: 'Soft Moong Dal & Oats Porridge (Daliya) with Cumin & Dash of A2 Desi Ghee',
        quantity: '1.5 cups soft cooked yellow moong dal and rolled oats + 1 tsp pure desi ghee + 1 banana + 150ml warm milk',
        proteinEstimate: '~16–20 g protein',
        caloriesEstimate: '~360 kcal',
        macroSplit: '18P / 52C / 10F',
        priceCategory: '₹22 / serving • Easy Digestion',
        prepTime: '10 mins',
        ageSuitability: 'Ages 61+: Soft-textured, soothing, and high in bioavailable protein to combat age-related sarcopenia (muscle loss).',
        budgetTip: 'Moong dal combined with oats cooks to a soothing texture that requires zero vigorous chewing.',
        preparationSteps: 'Simmer equal parts yellow moong dal and oats in 3 cups water with turmeric and rock salt until soft and creamy. Temper with 1 tsp pure A2 cow ghee and cumin seeds. Serve warm with sliced banana.',
        ingredients: '35g moong dal; 30g rolled oats; 1 tsp cow ghee; 1 banana; 150ml milk; rock salt, cumin.',
      },
      {
        mealName: 'Lunch',
        dishTitle: 'Soothing Moong Dal Khichdi with Pure Desi Ghee + Fresh Probiotic Curd + Stewed Pumpkin',
        quantity: '1.5 cups soft khichdi (1:1 dal to rice ratio) + 1 tsp pure ghee + 150g fresh homemade curd + 1 cup stewed pumpkin (kaddu)',
        proteinEstimate: '~20–24 g protein',
        caloriesEstimate: '~440 kcal',
        macroSplit: '22P / 66C / 11F',
        priceCategory: '₹24 / serving • Ayurvedic Staple',
        prepTime: '15 mins',
        ageSuitability: 'Ages 61+: A2 desi ghee lubricates joints, aids fat-soluble vitamin absorption, and curd nourishes aging gut microbiota.',
        budgetTip: 'High-protein khichdi (using 50% dal rather than 20% dal) is the most digestible, cost-efficient longevity meal in India.',
        preparationSteps: 'Pressure-cook equal parts yellow moong dal and white rice with turmeric and rock salt until very tender. Top with 1 tsp hot ghee tempered with cumin and hing. Serve with chilled fresh curd and tender stewed pumpkin.',
        ingredients: '1/2 cup moong dal; 1/2 cup rice; 1 tsp ghee; 150g curd; 1 cup pumpkin; cumin, hing.',
      },
      {
        mealName: 'Snack',
        dishTitle: 'Stewed Apple with Cinnamon + Soaked Peeled Almonds',
        quantity: '1 medium apple gently stewed with cinnamon + 10g overnight soaked & peeled almonds + warm water',
        proteinEstimate: '~6–8 g protein',
        caloriesEstimate: '~160 kcal',
        macroSplit: '6P / 26C / 4F',
        priceCategory: '₹22 / serving • Soothing Vitality',
        prepTime: '5 mins',
        ageSuitability: 'Ages 61+: Stewing apples releases soluble pectin fiber that soothes the intestinal lining and supports gentle motility.',
        budgetTip: 'Stewing fruit makes it gentle on teeth and eliminates dental discomfort while preserving vitamins.',
        preparationSteps: 'Dice peeled apple and simmer in 4 tbsp water with a pinch of cinnamon powder for 5 minutes until soft and fragrant. Serve warm with soaked peeled almonds.',
        ingredients: '1 apple; pinch of cinnamon; 10g soaked peeled almonds.',
      },
      {
        mealName: 'Dinner',
        dishTitle: 'Soothing Yellow Moong Dal Soup + 2 Soft Thin Phulkas + Steamed Bottle Gourd Mash',
        quantity: '1.5 cups thin yellow moong dal soup with cumin & ginger + 2 soft thin phulkas + 1 cup tender lauki mash + 100g curd',
        proteinEstimate: '~20–24 g protein',
        caloriesEstimate: '~370 kcal',
        macroSplit: '22P / 56C / 8F',
        priceCategory: '₹22 / serving • Gentle Recovery',
        prepTime: '15 mins',
        ageSuitability: 'Ages 61+: Light, low-sodium evening fuel that promotes effortless digestion and restful uninterrupted sleep.',
        budgetTip: 'Bottle gourd (lauki) is 92% water, keeping seniors hydrated and electrolyte-balanced overnight.',
        preparationSteps: 'Boil yellow split dal with grated ginger, cumin, and rock salt until fully dissolved into a nourishing soup. Serve with soft, thin whole-wheat phulkas and steamed lauki mash.',
        ingredients: '1.5 cups moong dal soup; 2 thin phulkas; 1 cup steamed lauki; 100g curd; ginger, cumin.',
      },
    ];
  }

  if (foodStyle === 'Eggetarian' || foodStyle === 'Non-vegetarian') {
    const isNonVeg = foodStyle === 'Non-vegetarian';
    return [
      {
        mealName: 'Breakfast',
        dishTitle: isNonVeg
          ? 'Stewed Shredded Chicken in Mild Moong Dal Broth with Soft Rice'
          : 'Soft Scrambled Egg Whites & 1 Whole Egg with Soft Phulka & Steamed Papaya',
        quantity: isNonVeg
          ? '80g tender boiled shredded chicken in warm moong dal soup + 1 cup soft rice + fruit'
          : '3 eggs (2 whites + 1 whole) softly scrambled in 1 tsp ghee + 1 soft phulka + 1 bowl ripe papaya',
        proteinEstimate: '~22–26 g protein',
        caloriesEstimate: '~340 kcal',
        macroSplit: '24P / 36C / 10F',
        priceCategory: isNonVeg ? '₹52 / serving • Tender Protein' : '₹24 / serving • Highly Bioavailable',
        prepTime: '8 mins',
        ageSuitability: 'Ages 61+: Soft egg and poultry proteins boast near 100% biological value, crucial for retaining senior muscle tone.',
        budgetTip: 'Scrambling eggs softly with a spoonful of milk makes them exceptionally tender and easy to chew.',
        preparationSteps: 'Whisk eggs with 1 tbsp milk, pinch of turmeric, and rock salt. Scramble gently in 1/2 tsp ghee until just set. Serve with a soft warm phulka and sweet ripe papaya.',
        ingredients: '3 eggs (2 whites + 1 whole); 1 phulka; 1 bowl ripe papaya; 1/2 tsp ghee.',
      },
      {
        mealName: 'Lunch',
        dishTitle: isNonVeg
          ? 'Soft Steamed Fish Fillet in Turmeric Ginger Broth with Soft White Rice + Curd'
          : 'Soft Stewed Egg White Curry with Soft Steamed Rice + Steamed Lauki + Fresh Curd',
        quantity: isNonVeg
          ? '120g boneless fish fillet stewed in light broth + 1 cup soft steamed rice + 150g curd + greens'
          : '2 boiled egg whites & 1 whole egg halved in light tomato cumin broth + 1 cup soft rice + 150g curd + lauki',
        proteinEstimate: '~28–34 g protein',
        caloriesEstimate: '~440 kcal',
        macroSplit: '30P / 58C / 9F',
        priceCategory: isNonVeg ? '₹72 / serving • Pure Omega-3' : '₹26 / serving • Gentle Egg',
        prepTime: '15 mins',
        ageSuitability: 'Ages 61+: Steamed fish or tender eggs provide essential DHA to preserve senior cognitive sharpness and joint comfort.',
        budgetTip: 'Steaming fish with ginger and rock salt creates an aromatic, preservative-free broth full of collagen.',
        preparationSteps: isNonVeg
          ? 'Place boneless fish fillet in a pan with water, sliced ginger, turmeric, and rock salt. Simmer covered for 6 minutes until tender and flaky. Serve over soft white rice with fresh curd.'
          : 'Simmer boiled eggs in mild tomato-cumin gravy. Serve with soft white rice and fresh curd.',
        ingredients: isNonVeg
          ? '120g boneless fish; 1 cup soft rice; 150g curd; ginger, turmeric.'
          : '2-3 eggs; 1 cup soft rice; 150g curd; 1 cup lauki.',
      },
      {
        mealName: 'Snack',
        dishTitle: 'Warm Turmeric Cinnamon Milk (Haldi Doodh) + Soaked Almonds',
        quantity: '200ml warm cow milk with turmeric, black pepper, cinnamon & jaggery + 10g soaked almonds',
        proteinEstimate: '~8–10 g protein',
        caloriesEstimate: '~170 kcal',
        macroSplit: '8P / 16C / 7F',
        priceCategory: '₹18 / serving • Golden Elixir',
        prepTime: '3 mins',
        ageSuitability: 'Ages 61+: Curcumin paired with piperine from black pepper exerts powerful systemic anti-arthritic joint benefits.',
        budgetTip: 'Haldi Doodh has been India’s premier restorative bedtime elixir for thousands of years.',
        preparationSteps: 'Warm cow milk with 1/2 tsp wild turmeric, a pinch of black pepper, and cinnamon. Serve warm with soaked peeled almonds.',
        ingredients: '200ml milk; 1/2 tsp turmeric; pinch of black pepper, cinnamon; 10g soaked almonds.',
      },
      {
        mealName: 'Dinner',
        dishTitle: isNonVeg
          ? 'Mild Stewed Fish / Chicken Broth with Soft Steamed Rice + Stewed Pumpkin'
          : 'Soft Steamed Egg Whites with Soft Rice & Mild Veggie Broth + Soft Phulka',
        quantity: isNonVeg
          ? '100g tender stewed fish or chicken in broth + 1 cup soft rice + 1 cup stewed pumpkin'
          : '2 egg whites in warm dal broth + 2 soft thin phulkas + stewed lauki mash',
        proteinEstimate: '~24–28 g protein',
        caloriesEstimate: '~360 kcal',
        macroSplit: '26P / 46C / 8F',
        priceCategory: isNonVeg ? '₹65 / serving' : '₹24 / serving',
        prepTime: '15 mins',
        ageSuitability: 'Ages 61+: High fluid and electrolyte balance ensuring gentle nocturnal digestion and kidney support.',
        budgetTip: 'Slow-simmered poultry or fish broth provides natural gelatin and glucosamine for connective tissue resilience.',
        preparationSteps: 'Simmer tender fish or chicken in light vegetable broth with cumin and coriander. Serve hot with soft steamed white rice.',
        ingredients: isNonVeg
          ? '100g fish or chicken; 1 cup soft rice; 1 cup pumpkin; broth.'
          : '2 egg whites; 2 phulkas; dal broth; lauki.',
      },
    ];
  }

  // Jain / Plant-based for 61+
  return [
    {
      mealName: 'Breakfast',
      dishTitle: 'Soft Moong Dal Khichdi (Watery Consistency) with Homemade Fresh Curd',
      quantity: '1.5 cups soft moong dal khichdi with cumin tempering + 150g fresh curd + 1 fruit',
      proteinEstimate: '~18–22 g protein',
      caloriesEstimate: '~360 kcal',
      macroSplit: '20P / 54C / 8F',
      priceCategory: '₹22 / serving • Sattvic Gentle',
      prepTime: '12 mins',
      ageSuitability: 'Ages 61+: Completely compliant with Jain tradition, easy on teeth and gums, soothing for the gut.',
      budgetTip: 'Moong dal khichdi provides clean balanced nutrition with zero hard-to-digest fibers.',
      preparationSteps: 'Pressure-cook split yellow moong dal with rice in a 4:1 water ratio with rock salt and turmeric until very soft. Temper with cumin and hing in ghee. Serve with fresh curd.',
      ingredients: '1/2 cup moong dal; 1/3 cup rice; rock salt, cumin; 150g curd; 1 fruit.',
    },
    {
      mealName: 'Lunch',
      dishTitle: 'Soft Moong Dal Daliya Khichdi + Fresh Curd + Steamed Bottle Gourd Mash',
      quantity: '1.5 cups soft cooked broken wheat & dal + 150g fresh curd + 1 cup tender lauki',
      proteinEstimate: '~20–24 g protein',
      caloriesEstimate: '~420 kcal',
      macroSplit: '22P / 64C / 9F',
      priceCategory: '₹24 / serving • Sattvic Longevity',
      prepTime: '15 mins',
      ageSuitability: 'Ages 61+: Delivers rich plant fiber and calcium for digestive regularity and bone preservation.',
      budgetTip: 'Broken wheat daliya has a low glycemic index and provides hours of steady, sustained energy.',
      preparationSteps: 'Cook broken wheat and yellow moong dal with turmeric and rock salt until soft. Serve with fresh curd and steamed lauki.',
      ingredients: 'Daliya; moong dal; 150g curd; 1 cup lauki; ghee, rock salt.',
    },
    {
      mealName: 'Snack',
      dishTitle: 'Stewed Apple with Cinnamon + Soaked Mashed Almonds',
      quantity: '1 sweet apple stewed until soft + 10g soaked peeled almonds mashed + warm water',
      proteinEstimate: '~6–8 g protein',
      caloriesEstimate: '~150 kcal',
      macroSplit: '6P / 24C / 4F',
      priceCategory: '₹20 / serving',
      prepTime: '5 mins',
      ageSuitability: 'Ages 61+: Gentle on the throat and vocal cords while delivering soluble fiber and antioxidants.',
      budgetTip: 'Mashing soaked almonds makes them completely safe and effortless for seniors to consume.',
      preparationSteps: 'Simmer sliced peeled apple in water with cinnamon. Serve warm with mashed soaked almonds.',
      ingredients: '1 apple; cinnamon; 10g soaked almonds.',
    },
    {
      mealName: 'Dinner',
      dishTitle: 'Soft Moong Dal Soup with 2 Steamed Soft Phulkas + Stewed Turai Mash',
      quantity: '1.5 cups moong dal soup + 2 soft phulkas + 1 cup stewed ridge gourd (turai) mash',
      proteinEstimate: '~18–22 g protein',
      caloriesEstimate: '~360 kcal',
      macroSplit: '20P / 54C / 8F',
      priceCategory: '₹22 / serving • Sattvic Evening',
      prepTime: '15 mins',
      ageSuitability: 'Ages 61+: Eating this soothing meal before sunset (chauvihar) ensures complete digestion before bedtime.',
      budgetTip: 'Ridge gourd (turai) is cooling, gentle on digestion, and rich in natural water-soluble vitamins.',
      preparationSteps: 'Boil yellow moong dal with cumin and rock salt until completely smooth. Serve with 2 soft phulkas and stewed turai mash.',
      ingredients: '1.5 cups moong dal soup; 2 soft phulkas; 1 cup turai mash; rock salt, cumin.',
    },
  ];
}

/**
 * Returns tailored alternative dishes matching the exact age group, budget, and dietary preference.
 */
export function getGenuinePersonalizedAlternatives(
  ageGroup: AgeGroup,
  foodStyle: FoodStyle,
  budgetCategory: 'budget_low' | 'budget_mid' | 'budget_high',
  calorieTier: 'cutting' | 'moderate' | 'bulking',
  mainGoal: MainGoal
): Record<string, MealAlternative[]> {
  const isCut = calorieTier === 'cutting';
  const isLowBudget = budgetCategory === 'budget_low';

  if (foodStyle === 'Vegetarian') {
    return {
      Breakfast: [
        { name: 'Spiced Sattu Chaas Cooler', description: `${isCut ? '35g' : '45g'} sattu flour + 300ml buttermilk + roasted jeera (~18g protein)`, priceCategory: '₹14 / serving • Budget', prepTime: '3 mins' },
        { name: 'Besan Chilla with Paneer', description: `2 chillas with ${isCut ? '40g' : '75g'} grated paneer inside + mint chutney (~22g protein)`, priceCategory: '₹35 / serving • Mid-tier', prepTime: '10 mins' },
        { name: 'Sprouted Moong Salad Bowl', description: '1.5 cups steamed sprouted moong + cucumber + pomegranate + lemon (~16g protein)', priceCategory: '₹22 / serving • Clean', prepTime: '5 mins' },
        { name: 'Ragi Porridge with Almonds & Milk', description: '40g ragi flour cooked in 250ml milk + 10g almonds (~15g protein)', priceCategory: '₹20 / serving • Bone Health', prepTime: '8 mins' },
      ],
      Lunch: [
        { name: 'Homestyle Rajma Chawal Bowl', description: `${isCut ? '1 cup' : '1.5 cups'} rajma + 1.5 cups rice + cucumber raita (~24g protein)`, priceCategory: '₹26 / serving • Classic', prepTime: '20 mins' },
        { name: 'Panchmel Dal with 3 Phulkas', description: '5-lentil mixed dal + 3 phulkas + seasonal greens + 150g curd (~26g protein)', priceCategory: '₹24 / serving • Staple', prepTime: '15 mins' },
        { name: 'Paneer Bhurji with Phulkas', description: `${isCut ? '80g' : '120g'} paneer bhurji + 3 phulkas + tomato salad (~28g protein)`, priceCategory: '₹48 / serving • Mid-tier', prepTime: '12 mins' },
        { name: 'Soya Chunks & Peas Pulao', description: '50g dry soya chunks + 1.5 cups basmati rice + yellow dal (~32g protein)', priceCategory: '₹18 / serving • Budget King', prepTime: '18 mins' },
      ],
      Snack: [
        { name: 'Bhuna Chana Chaat', description: '45g roasted chana + onions + tomatoes + lemon juice (~10g protein)', priceCategory: '₹12 / serving • Zero Cook', prepTime: '2 mins' },
        { name: 'Greek Yogurt / Thick Curd with Fruit', description: '150–200g thick curd + 1 diced fruit + pinch of cinnamon (~12g protein)', priceCategory: '₹30 / serving • Probiotic', prepTime: '2 mins' },
        { name: 'Roasted Makhana with Flax Seeds', description: '25g makhana + 10g flax seeds roasted with rock salt (~8g protein)', priceCategory: '₹22 / serving • Heart Friendly', prepTime: '3 mins' },
        { name: 'Warm Haldi Doodh with Walnuts', description: '250ml cow milk + turmeric + 15g walnuts (~12g protein)', priceCategory: '₹25 / serving • Recovery', prepTime: '4 mins' },
      ],
      Dinner: [
        { name: 'Soya Chunks Curry + Phulkas', description: `${isCut ? '50g' : '70g'} dry soya chunks + 3 phulkas + salad (~36g protein)`, priceCategory: '₹18 / serving • Max Protein', prepTime: '15 mins' },
        { name: 'Palak Paneer with Phulkas', description: `${isCut ? '80g' : '120g'} paneer in fresh spinach gravy + phulkas (~28g protein)`, priceCategory: '₹48 / serving • Clean Greens', prepTime: '15 mins' },
        { name: 'Moong Dal Khichdi + Curd', description: '1:1 moong dal to rice khichdi with 1 tsp ghee + 150g curd (~22g protein)', priceCategory: '₹22 / serving • Gentle Gut', prepTime: '15 mins' },
        { name: 'Matar Paneer with Phulkas', description: '100g paneer with green peas in tomato gravy + 3 phulkas (~28g protein)', priceCategory: '₹44 / serving • Classic', prepTime: '15 mins' },
      ],
    };
  }

  if (foodStyle === 'Eggetarian') {
    return {
      Breakfast: [
        { name: 'Egg Bhurji Roll in Phulka', description: '3 eggs scrambled with onions & tomatoes rolled in 2 phulkas (~22g protein)', priceCategory: '₹24 / serving • Grab & Go', prepTime: '8 mins' },
        { name: 'Boiled Egg Whites + Toast', description: `${isCut ? '4 whites + 1 whole' : '3 whole eggs'} + 2 slices brown bread (~24g protein)`, priceCategory: '₹24 / serving • Lean Muscle', prepTime: '9 mins' },
        { name: 'Besan Chilla + 2 Boiled Eggs', description: '1 large besan chilla + 2 boiled eggs + green chutney (~22g protein)', priceCategory: '₹28 / serving • Balanced', prepTime: '10 mins' },
      ],
      Lunch: [
        { name: 'Egg Biryani / Pulao with Raita', description: '3 boiled eggs cooked with spiced basmati rice + cucumber raita (~26g protein)', priceCategory: '₹32 / serving • Flavorful', prepTime: '18 mins' },
        { name: 'Dal Roti + 2 Boiled Eggs', description: '1.25 cups dal + 3 phulkas + 2 boiled eggs + salad (~28g protein)', priceCategory: '₹26 / serving • Everyday', prepTime: '15 mins' },
        { name: 'Rajma Chawal + 2 Eggs', description: '1.25 cups rajma + 1.5 cups rice + 2 whole boiled eggs (~30g protein)', priceCategory: '₹32 / serving • High Fuel', prepTime: '20 mins' },
      ],
      Snack: [
        { name: 'Egg White Chaat', description: '3 boiled egg whites seasoned with chaat masala, onions & lemon (~12g protein)', priceCategory: '₹16 / serving • Pure Lean', prepTime: '2 mins' },
        { name: 'Roasted Chana + 1 Whole Egg', description: '35g roasted chana + 1 hard-boiled egg + green tea (~13g protein)', priceCategory: '₹15 / serving • Fast Fuel', prepTime: '2 mins' },
        { name: 'Curd & Fruit Bowl', description: '200g curd + 1 sliced banana or apple (~11g protein)', priceCategory: '₹20 / serving • Probiotic', prepTime: '2 mins' },
      ],
      Dinner: [
        { name: 'Homestyle Egg Curry + Phulkas', description: '3 eggs in spiced tomato-onion curry + 3 phulkas (~26g protein)', priceCategory: '₹28 / serving • Comfort', prepTime: '15 mins' },
        { name: 'Egg Bhurji with 3 Phulkas', description: '3 eggs scrambled with green chilies, onions & coriander + 3 phulkas (~24g protein)', priceCategory: '₹26 / serving • Quick Prep', prepTime: '10 mins' },
        { name: 'Paneer / Soya Chunks Curry', description: '100g paneer or 60g soya chunks with phulkas + salad (~30g protein)', priceCategory: '₹35 / serving • Plant Swap', prepTime: '15 mins' },
      ],
    };
  }

  if (foodStyle === 'Non-vegetarian') {
    return {
      Breakfast: [
        { name: '3-Egg Masala Omelette + Toast', description: '3 whole eggs with green chili, onion & black pepper + 2 slices brown bread (~24g protein)', priceCategory: '₹26 / serving • Classic', prepTime: '8 mins' },
        { name: 'Shredded Chicken Toast', description: '80g boiled chicken breast on 2 slices multigrain toast + cucumber (~28g protein)', priceCategory: '₹55 / serving • Lean Muscle', prepTime: '10 mins' },
        { name: 'Oats in Milk + 2 Boiled Eggs', description: '40g oats in milk + 2 boiled eggs + fruit (~22g protein)', priceCategory: '₹28 / serving • Balanced', prepTime: '8 mins' },
      ],
      Lunch: [
        { name: 'Chicken Breast Curry + Rice + Dal', description: '150g chicken breast curry + 1.5 cups steamed rice + 1 cup dal (~42g protein)', priceCategory: '₹75 / serving • Muscle Fuel', prepTime: '20 mins' },
        { name: 'Omega-3 Fish Curry + Rice', description: '150g Rohu/Basa fish in light tomato mustard broth + 1.5 cups rice (~34g protein)', priceCategory: '₹75 / serving • Joint Health', prepTime: '18 mins' },
        { name: 'Chicken Pulao with Mint Raita', description: '150g chicken breast cooked with basmati rice + cucumber raita (~38g protein)', priceCategory: '₹70 / serving • Aromatic', prepTime: '20 mins' },
      ],
      Snack: [
        { name: 'Pan-Tossed Chicken Tikka Skewers', description: '100g chicken breast cubes tossed with chaat masala & lemon (~30g protein)', priceCategory: '₹50 / serving • Pure Protein', prepTime: '8 mins' },
        { name: 'Boiled Eggs + Roasted Chana', description: '2 boiled eggs + 30g roasted chana + fruit (~18g protein)', priceCategory: '₹18 / serving • Budget Fast', prepTime: '5 mins' },
        { name: 'Greek Yogurt with Fruit & Nuts', description: '150g Greek yogurt + berries or sliced apple + almonds (~15g protein)', priceCategory: '₹55 / serving • Premium', prepTime: '2 mins' },
      ],
      Dinner: [
        { name: 'Pan-Seared Fish Fillet + Phulkas', description: '150g fish fillet with lemon pepper + 3 phulkas + garden salad (~36g protein)', priceCategory: '₹80 / serving • Clean Catch', prepTime: '15 mins' },
        { name: 'Tandoori / Pan-Seared Chicken + Salad', description: '160g chicken breast seasoned homestyle + large green salad + 2 phulkas (~42g protein)', priceCategory: '₹75 / serving • High Protein', prepTime: '18 mins' },
        { name: 'Homestyle Egg Curry with Phulkas', description: '3 boiled eggs in tomato-onion curry + 3 phulkas (~26g protein)', priceCategory: '₹28 / serving • Budget Swap', prepTime: '15 mins' },
      ],
    };
  }

  if (foodStyle === 'Jain') {
    return {
      Breakfast: [
        { name: 'Jain Moong Dal Chilla with Curd', description: '2 soaked moong dal chillas (no root veg) + 150g fresh curd (~20g protein)', priceCategory: '₹24 / serving • Sattvic Pure', prepTime: '10 mins' },
        { name: 'Poha with Peanuts & Fresh Milk', description: '1.5 cups Jain-style poha + 25g peanuts + 250ml milk (~18g protein)', priceCategory: '₹20 / serving • Gentle', prepTime: '8 mins' },
        { name: 'Steamed Moong Dhokla with Chutney', description: '3 steamed moong dhokla + coconut chutney + 1 fruit (~16g protein)', priceCategory: '₹22 / serving • Steamed', prepTime: '12 mins' },
      ],
      Lunch: [
        { name: 'Moong Dal + 3 Phulkas + Curd', description: '1.5 cups moong dal + 3 phulkas + 150g curd + allowable greens (~26g protein)', priceCategory: '₹24 / serving • Classic', prepTime: '15 mins' },
        { name: 'Jain Paneer Rice Bowl', description: '110g paneer in tomato-cumin gravy + 1.5 cups rice + lauki sabzi (~28g protein)', priceCategory: '₹46 / serving • High Dairy', prepTime: '18 mins' },
        { name: 'Chana Dal Khichdi + Curd', description: 'Chana dal & rice khichdi with cumin tempering + 150g curd (~22g protein)', priceCategory: '₹22 / serving • Nourishing', prepTime: '15 mins' },
      ],
      Snack: [
        { name: 'Roasted Chana & Makhana', description: '35g roasted chana + 20g makhana roasted in ghee with rock salt (~11g protein)', priceCategory: '₹18 / serving • Pure Crunch', prepTime: '3 mins' },
        { name: 'Fresh Cow Milk with Soaked Almonds', description: '250ml warm milk + 15g soaked peeled almonds (~12g protein)', priceCategory: '₹25 / serving • Restorative', prepTime: '3 mins' },
        { name: 'Permissible Fruit + Fresh Curd', description: '1 sweet apple or banana + 150g fresh plain curd (~10g protein)', priceCategory: '₹20 / serving • Probiotic', prepTime: '2 mins' },
      ],
      Dinner: [
        { name: 'Sattvic Paneer Curry + Phulkas', description: '110g paneer in cumin-tomato gravy (no root veg) + 3 phulkas (~30g protein)', priceCategory: '₹44 / serving • Sattvic Dairy', prepTime: '15 mins' },
        { name: 'Moong Dal with Soft Phulkas', description: '1.25 cups thick yellow moong dal + 3 phulkas + allowable greens (~24g protein)', priceCategory: '₹22 / serving • Light Evening', prepTime: '15 mins' },
        { name: 'Sattvic Tofu & Tomato Simmer', description: '130g firm tofu in cumin tomato gravy + 3 phulkas (~26g protein)', priceCategory: '₹38 / serving • Clean Plant', prepTime: '15 mins' },
      ],
    };
  }

  // Mostly plant-based
  return {
    Breakfast: [
      { name: 'Tofu Scramble on Toast', description: '120g crumbled firm tofu with turmeric and greens on 2 slices toast (~20g protein)', priceCategory: '₹34 / serving • Clean Plant', prepTime: '10 mins' },
      { name: 'Soy Milk Oatmeal Bowl', description: '50g oats + 250ml fortified soy milk + chia seeds + banana (~22g protein)', priceCategory: '₹28 / serving • Omega-3', prepTime: '6 mins' },
      { name: 'Besan Chilla + Peanut Chutney', description: '2 besan chillas + homestyle spicy peanut chutney (~18g protein)', priceCategory: '₹20 / serving • High Fiber', prepTime: '10 mins' },
    ],
    Lunch: [
      { name: 'Chana Masala + Basmati Rice', description: '1.5 cups cooked chickpeas + 1.5 cups steamed rice + salad (~22g protein)', priceCategory: '₹26 / serving • High Fiber', prepTime: '20 mins' },
      { name: 'Rajma Chawal with Sautéed Greens', description: '1.5 cups kidney beans + 1.5 cups rice + spinach (~24g protein)', priceCategory: '₹28 / serving • Classic', prepTime: '20 mins' },
      { name: 'Tofu Brown Rice Bowl', description: '140g pan-seared tofu + 1.5 cups brown rice + broccoli (~30g protein)', priceCategory: '₹45 / serving • Lean Plant', prepTime: '18 mins' },
    ],
    Snack: [
      { name: 'Peanut Sattu Protein Drink', description: '35g sattu flour + 15g powdered peanuts + water + lemon (~18g protein)', priceCategory: '₹15 / serving • Natural Shaker', prepTime: '2 mins' },
      { name: 'Roasted Chana + Seasonal Fruit', description: '45g roasted chana + 1 banana or apple (~11g protein)', priceCategory: '₹12 / serving • Fast', prepTime: '2 mins' },
      { name: 'Soy Yogurt with Berries / Fruit', description: '150g unsweetened soy yogurt + seeds + sliced fruit (~12g protein)', priceCategory: '₹40 / serving • Plant Probiotic', prepTime: '2 mins' },
    ],
    Dinner: [
      { name: 'High-Protein Soya Chunks Curry + Phulkas', description: '65g dry soya chunks + 3 phulkas + mixed salad (~36g protein)', priceCategory: '₹18 / serving • Protein Champion', prepTime: '15 mins' },
      { name: 'Grilled Firm Tofu + Phulkas or Quinoa', description: '150g firm tofu with bell peppers + 3 phulkas (~32g protein)', priceCategory: '₹44 / serving • Clean Muscle', prepTime: '15 mins' },
      { name: 'Yellow Dal Tadka + Rice / Phulkas', description: '1.5 cups yellow dal + 1.5 cups rice + mixed vegetable curry (~22g protein)', priceCategory: '₹22 / serving • Homestyle', prepTime: '15 mins' },
    ],
  };
}
