import { CravingRecipe } from '../types';

export const CRAVING_RECIPES: Record<string, CravingRecipe[]> = {
  'Chatpata': [
    {
      name: 'Chatpata Chana Chaat',
      ingredients: '1 cup cooked chana; tomato; cucumber; coriander; lemon; cumin; chaat masala; salt to taste.',
      steps: 'Mix chana and chopped vegetables. Add lemon, coriander and seasonings. Toss well and serve fresh.',
      alternatives: ['Sprouts Chaat', 'Boiled Peanut Chaat'],
    },
    {
      name: 'Masala Paneer Chaat',
      ingredients: '80–100 g paneer; tomato; cucumber; coriander; lemon; cumin; chaat masala.',
      steps: 'Cube paneer, warm it lightly, then toss with vegetables, lemon and spices.',
      alternatives: ['Tofu Chaat', 'Crispy Paneer Bites'],
    },
    {
      name: 'Chatpata Corn Chaat',
      ingredients: '1 cup cooked corn; tomato; cucumber; coriander; lemon; chaat masala.',
      steps: 'Mix warm corn with vegetables, lemon and seasonings and serve.',
      alternatives: ['Corn & Bell Pepper Toss', 'Spiced Makhana Chaat'],
    },
  ],
  'Chocolatey': [
    {
      name: 'Chocolate Banana Yogurt Bowl',
      ingredients: '150–200 g plain yogurt; 1 banana; 1 tsp unsweetened cocoa; optional nuts/seeds.',
      steps: 'Stir cocoa into yogurt. Add sliced banana and optional nuts or seeds.',
      alternatives: ['Cocoa Chia Pudding', 'Chocolate Protein Shake'],
    },
    {
      name: 'Cocoa Oat Bowl',
      ingredients: '40–50 g oats; 200–250 ml milk or soy milk; 1 tsp cocoa; banana.',
      steps: 'Cook oats with milk and cocoa until soft. Top with banana.',
      alternatives: ['Warm Cocoa Quinoa', 'Chocolate Baked Oats'],
    },
    {
      name: 'Chocolate Peanut Banana Toast',
      ingredients: '2 slices toast; banana; thin layer of peanut butter; 1 tsp cocoa.',
      steps: 'Toast bread, spread peanut butter, add banana slices and a light cocoa dusting.',
      alternatives: ['Cacao Roti Wrap', 'Almond Butter Crunch'],
    },
  ],
  'Pizza-style': [
    {
      name: 'Paneer Veggie Toast',
      ingredients: '2 slices bread; 60–80 g paneer; tomato; capsicum; herbs; optional cheese.',
      steps: 'Top bread with paneer and vegetables. Add herbs and optional cheese. Toast until warm.',
      alternatives: ['Open-faced Pita Pizza', 'Mushroom Herb Toast'],
    },
    {
      name: 'Pizza-style Besan Chilla',
      ingredients: '1 besan chilla; tomato; capsicum; paneer; herbs.',
      steps: 'Cook the chilla, add toppings and warm until the vegetables soften.',
      alternatives: ['Oat Chilla Pizza', 'Moong Dal Pizza Chilla'],
    },
    {
      name: 'Pizza-style Roti',
      ingredients: '1 roti; tomato; capsicum; 60–80 g paneer or tofu; herbs.',
      steps: 'Add toppings to a warm roti and heat in a covered pan until warmed through.',
      alternatives: ['Tortilla Thin Crust', 'Stuffed Cheesy Paratha'],
    },
  ],
  'Burger-style': [
    {
      name: 'Chana-Paneer Burger',
      ingredients: '1 bun; mashed cooked chana; paneer; lettuce/cucumber/tomato; yogurt-based spread.',
      steps: 'Shape chana into a patty and heat through. Assemble with paneer and vegetables.',
      alternatives: ['Rajma Patty Burger', 'Spiced Soya Burger'],
    },
    {
      name: 'Bean Burger',
      ingredients: '1 bun; mashed rajma or beans; lettuce; tomato; cucumber; yogurt-based spread.',
      steps: 'Shape mashed beans into a patty, heat until firm, then assemble with vegetables.',
      alternatives: ['Lentil Quinoa Slider', 'Chickpea Herb Patty'],
    },
    {
      name: 'Tofu Burger',
      ingredients: '1 bun; 100 g tofu; lettuce; tomato; cucumber; simple yogurt or plant-based spread.',
      steps: 'Warm tofu, then assemble the bun with vegetables and spread.',
      alternatives: ['Grilled Paneer Steak Burger', 'Portobello Mushroom Burger'],
    },
  ],
  'Noodles': [
    {
      name: 'Veggie Paneer Noodles',
      ingredients: '1 serving noodles; 60–80 g paneer; mixed vegetables; 1 tsp oil; mild seasoning.',
      steps: 'Cook noodles. Stir-fry vegetables, add paneer and noodles, then toss with seasoning.',
      alternatives: ['Hakka Style Spaghetti', 'Soba Sesame Noodles'],
    },
    {
      name: 'Tofu Veg Noodles',
      ingredients: '1 serving noodles; 80–100 g tofu; mixed vegetables; 1 tsp oil; seasoning.',
      steps: 'Cook noodles. Stir-fry vegetables and tofu, add noodles and toss together.',
      alternatives: ['Rice Noodle Veggie Toss', 'Zucchini Noodle Stir-fry'],
    },
    {
      name: 'Egg Veg Noodles',
      styles: ['Eggetarian', 'Non-vegetarian'],
      ingredients: '1 serving noodles; 2 eggs; mixed vegetables; 1 tsp oil; seasoning.',
      steps: 'Cook noodles. Scramble eggs thoroughly, add vegetables and noodles, then toss.',
      alternatives: ['Chicken Veg Noodles', 'Shredded Omelette Noodles'],
    },
  ],
  'Crispy': [
    {
      name: 'Crispy Potato-Chana Chaat',
      ingredients: '1 medium potato; 1/2–1 cup cooked chana; vegetables; lemon; cumin; chaat masala.',
      steps: 'Cook potato until tender and crisp it in a pan or oven. Combine with chana and vegetables.',
      alternatives: ['Air-fried Sweet Potato Bites', 'Roasted Chickpeas Crunch'],
    },
    {
      name: 'Crispy Paneer Bites',
      ingredients: '80–100 g paneer; besan; spices; a little oil; lemon.',
      steps: 'Coat paneer lightly with seasoned besan and pan-cook until lightly crisp.',
      alternatives: ['Pan-seared Spiced Tofu', 'Baked Paneer Tikka Cubes'],
    },
    {
      name: 'Crispy Tofu Bites',
      styles: ['Mostly plant-based'],
      ingredients: '100 g tofu; cornflour or besan; spices; a little oil.',
      steps: 'Coat tofu lightly, then pan-cook until crisp on the outside.',
      alternatives: ['Sesame Crusted Tofu', 'Spiced Tempeh Cubes'],
    },
  ],
  'Sweet': [
    {
      name: 'Fruit Yogurt Bowl',
      ingredients: '150–200 g plain yogurt; 1–2 fruits; optional nuts/seeds; cinnamon.',
      steps: 'Add fruit to yogurt and top with nuts/seeds if desired.',
      alternatives: ['Hung Curd Parfait', 'Greek Yogurt & Berries'],
    },
    {
      name: 'Banana Peanut Bowl',
      ingredients: '1 banana; 1 tbsp peanut butter; 150 g yogurt or soy yogurt.',
      steps: 'Slice banana and add yogurt and peanut butter.',
      alternatives: ['Apple Peanut Butter Slices', 'Nutty Banana Mash'],
    },
    {
      name: 'Mango Chia Yogurt',
      ingredients: '150–200 g yogurt or soy yogurt; mango pieces; 1 tsp chia seeds.',
      steps: 'Combine yogurt, mango and chia seeds. Chill briefly if desired.',
      alternatives: ['Pineapple Mint Yogurt', 'Papaya Lime Chia Cup'],
    },
  ],
  'Comforting': [
    {
      name: 'Warm Dal Rice Bowl',
      ingredients: '1 cup cooked dal; 1 cup cooked rice; vegetables; cumin; coriander; optional curd.',
      steps: 'Warm dal and rice, combine, add vegetables and seasonings.',
      alternatives: ['Rasam Rice with Veggies', 'Tadka Moong with Steamed Rice'],
    },
    {
      name: 'Moong Dal Khichdi',
      ingredients: '1 cup cooked khichdi; vegetables; optional curd.',
      steps: 'Warm the khichdi and serve with suitable vegetables and optional curd.',
      alternatives: ['Bajra Khichdi', 'Dalia Vegetable Khichdi'],
    },
    {
      name: 'Warm Oats Bowl',
      ingredients: '40–50 g oats; 200–250 ml milk or soy milk; banana or fruit; cinnamon.',
      steps: 'Cook oats until soft and warm. Add fruit and cinnamon.',
      alternatives: ['Warm Apple Porridge', 'Golden Milk Turmeric Oats'],
    },
  ],
  'Street-food style': [
    {
      name: 'Paneer Kathi Roll',
      ingredients: '1 roti; 80–100 g paneer; capsicum; tomato; coriander; lemon.',
      steps: 'Warm paneer and vegetables with spices, place in roti and roll.',
      alternatives: ['Egg Kathi Roll', 'Soya Chaap Roll'],
    },
    {
      name: 'Chana Kathi Roll',
      ingredients: '1 roti; 1 cup cooked chana; cucumber; tomato; coriander; lemon.',
      steps: 'Mash chana lightly, season, add vegetables and roll in a warm roti.',
      alternatives: ['Sprouts Frankie', 'Aloo Chana Wrap'],
    },
  ],
  'Sandwich': [
    {
      name: 'Paneer Veg Sandwich',
      ingredients: '2 slices bread; 60–80 g paneer; cucumber; tomato; herbs.',
      steps: 'Layer paneer and vegetables between bread and toast lightly.',
      alternatives: ['Curd Veggie Sandwich', 'Grilled Mint Corn Sandwich'],
    },
    {
      name: 'Chana Sandwich',
      ingredients: '2 slices bread; mashed chana; cucumber; tomato; lemon; seasoning.',
      steps: 'Mash chana with lemon and seasoning, spread on bread and add vegetables.',
      alternatives: ['Hummus & Cucumber Toast', 'Spiced Lentil Spread Toast'],
    },
  ],
  'Desi breakfast': [
    {
      name: 'Masala Besan Chilla',
      ingredients: 'Besan; suitable vegetables; spices; a little oil; curd on the side.',
      steps: 'Make a batter with besan and water, add suitable vegetables and cook on a pan.',
      alternatives: ['Moong Dal Chilla', 'Ragi Vegetable Dosa'],
    },
    {
      name: 'Paneer Stuffed Roti',
      ingredients: '1 roti; 60–80 g paneer; coriander; cumin; suitable spices.',
      steps: 'Fill the roti with seasoned paneer, fold and warm on a pan.',
      alternatives: ['Methi Thepla with Curd', 'Sattu Paratha'],
    },
  ],
  'Curry': [
    {
      name: 'Paneer Curry Bowl',
      ingredients: '100 g paneer; suitable vegetables; tomato-based gravy; rice or roti.',
      steps: 'Cook the gravy and vegetables, add paneer and simmer. Serve with rice or roti.',
      alternatives: ['Matar Paneer Light', 'Tofu Makhani Gravy'],
    },
    {
      name: 'Chana Masala Bowl',
      ingredients: '1 cup cooked chana; suitable vegetables; tomato-based gravy; rice or roti.',
      steps: 'Simmer chana in the gravy with spices and serve with rice or roti.',
      alternatives: ['Rajma Gravy Bowl', 'Black Eyed Pea Curry'],
    },
  ],
  'Cheesy': [
    {
      name: 'Cheesy Paneer Toast',
      ingredients: '2 slices bread; 60–80 g paneer; tomato; capsicum; a little grated cheese if desired.',
      steps: 'Top bread with paneer, vegetables and optional cheese. Toast until warm.',
      alternatives: ['Paneer Chilli Garlic Toast', 'Herb Cottage Cheese Melt'],
    },
    {
      name: 'Cheesy Roti Roll',
      ingredients: '1 roti; 60–80 g paneer; vegetables; a little grated cheese if desired.',
      steps: 'Fill roti with paneer and vegetables, add optional cheese and warm before rolling.',
      alternatives: ['Cheesy Vegetable Quesadilla', 'Rolled Cheese Stuffed Wrap'],
    },
  ],
  'Potato': [
    {
      name: 'Aloo Chana Chaat',
      ingredients: '1 medium potato; 1/2–1 cup cooked chana; lemon; coriander; cumin; chaat masala.',
      steps: 'Combine cooked potato and chana with lemon, coriander and spices.',
      alternatives: ['Sweet Potato Chaat', 'Roasted Aloo Jeera Toss'],
    },
    {
      name: 'Aloo Paneer Bowl',
      ingredients: '1 medium potato; 80 g paneer; suitable vegetables; cumin; coriander.',
      steps: 'Cook potato and paneer with vegetables and spices in a pan until warmed through.',
      alternatives: ['Aloo Gobhi Paneer Roast', 'Herb Crushed Potato Bowl'],
    },
  ],
  'Fresh & tangy': [
    {
      name: 'Paneer Cucumber Chaat',
      ingredients: '80–100 g paneer; cucumber; tomato; lemon; coriander; cumin.',
      steps: 'Cube paneer and vegetables, add lemon and seasonings, then toss.',
      alternatives: ['Kachumber Salad with Tofu', 'Beetroot Paneer Toss'],
    },
    {
      name: 'Chana Lemon Salad',
      ingredients: '1 cup cooked chana; cucumber; tomato; coriander; lemon; cumin.',
      steps: 'Mix all ingredients and serve fresh.',
      alternatives: ['Moong Sprout Tangy Salad', 'Pomegranate Chickpea Bowl'],
    },
  ],
};
