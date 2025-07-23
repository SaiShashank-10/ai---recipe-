import { useState } from 'react';
import { Recipe, Ingredient } from '../types';

interface AIRecipeRequest {
  prompt: string;
  cuisine?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  servings?: number;
  dietary?: string[];
  cookingTime?: number;
}

export function useAIRecipes() {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateRecipe = async (request: AIRecipeRequest): Promise<Recipe> => {
    setIsGenerating(true);
    
    try {
      // Simulate AI generation with a realistic delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Generate a realistic recipe based on the prompt
      const recipe = await generateMockRecipe(request);
      
      return recipe;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateRecipe,
    isGenerating,
  };
}

async function generateMockRecipe(request: AIRecipeRequest): Promise<Recipe> {
  // This would normally call OpenAI API, but for demo purposes, we'll generate realistic recipes
  const recipes = {
    pasta: {
      title: "Creamy Mushroom Garlic Pasta",
      description: "A rich and creamy pasta dish featuring sautéed mushrooms, garlic, and fresh herbs. Perfect comfort food that comes together in just 30 minutes.",
      ingredients: [
        { name: "Pasta (penne or fettuccine)", amount: "12", unit: "oz" },
        { name: "Mixed mushrooms, sliced", amount: "1", unit: "lb" },
        { name: "Garlic cloves, minced", amount: "4", unit: "cloves" },
        { name: "Heavy cream", amount: "1", unit: "cup" },
        { name: "Parmesan cheese, grated", amount: "1/2", unit: "cup" },
        { name: "Fresh thyme", amount: "2", unit: "tbsp" },
        { name: "Olive oil", amount: "3", unit: "tbsp" },
        { name: "Salt and pepper", amount: "to", unit: "taste" }
      ],
      instructions: [
        "Cook pasta according to package directions until al dente. Reserve 1 cup pasta water before draining.",
        "Heat olive oil in a large skillet over medium-high heat. Add mushrooms and cook until golden brown, about 5-7 minutes.",
        "Add minced garlic and cook for another minute until fragrant.",
        "Pour in heavy cream and bring to a gentle simmer. Add fresh thyme and season with salt and pepper.",
        "Add the cooked pasta to the skillet and toss to combine. Add pasta water as needed to achieve desired consistency.",
        "Remove from heat and stir in Parmesan cheese. Serve immediately with additional cheese if desired."
      ],
      prep_time: 10,
      cook_time: 20,
      ai_generated_card: "This creamy mushroom pasta is the perfect balance of earthy flavors and rich textures. The combination of mixed mushrooms provides depth while the garlic and thyme add aromatic complexity. It's an elegant dish that feels restaurant-quality but is simple enough for a weeknight dinner."
    },
    salad: {
      title: "Rainbow Quinoa Power Bowl",
      description: "A vibrant, nutrient-packed salad featuring fluffy quinoa, roasted vegetables, and a zesty tahini dressing. This colorful bowl is both satisfying and energizing.",
      ingredients: [
        { name: "Quinoa, rinsed", amount: "1", unit: "cup" },
        { name: "Sweet potato, cubed", amount: "1", unit: "large" },
        { name: "Bell peppers, sliced", amount: "2", unit: "peppers" },
        { name: "Red onion, sliced", amount: "1/2", unit: "onion" },
        { name: "Chickpeas, drained", amount: "1", unit: "can" },
        { name: "Baby spinach", amount: "4", unit: "cups" },
        { name: "Tahini", amount: "3", unit: "tbsp" },
        { name: "Lemon juice", amount: "2", unit: "tbsp" },
        { name: "Olive oil", amount: "2", unit: "tbsp" },
        { name: "Maple syrup", amount: "1", unit: "tbsp" }
      ],
      instructions: [
        "Preheat oven to 425°F. Cook quinoa according to package directions and let cool.",
        "Toss sweet potato, bell peppers, and red onion with olive oil, salt, and pepper. Roast for 25-30 minutes until tender.",
        "In a small bowl, whisk together tahini, lemon juice, maple syrup, and 2-3 tbsp water until smooth.",
        "In a large bowl, combine cooked quinoa, roasted vegetables, chickpeas, and spinach.",
        "Drizzle with tahini dressing and toss gently to combine.",
        "Serve immediately or chill for up to 2 hours before serving."
      ],
      prep_time: 15,
      cook_time: 30,
      ai_generated_card: "This rainbow quinoa bowl is a celebration of colors, textures, and flavors. Each ingredient brings its own nutritional benefits while the tahini dressing ties everything together with its creamy, nutty richness. It's a complete meal that will leave you feeling satisfied and energized."
    }
  };

  // Simple logic to choose recipe based on prompt keywords
  let selectedRecipe;
  const prompt = request.prompt.toLowerCase();
  
  if (prompt.includes('pasta') || prompt.includes('mushroom') || prompt.includes('creamy')) {
    selectedRecipe = recipes.pasta;
  } else if (prompt.includes('salad') || prompt.includes('quinoa') || prompt.includes('healthy')) {
    selectedRecipe = recipes.salad;
  } else {
    // Default to pasta for other prompts
    selectedRecipe = recipes.pasta;
  }

  // Adjust recipe based on request parameters
  const adjustedRecipe = {
    ...selectedRecipe,
    servings: request.servings || 4,
    difficulty: request.difficulty || 'medium',
    cuisine_type: request.cuisine,
    dietary_restrictions: request.dietary || [],
  };

  // Adjust cooking time if specified
  if (request.cookingTime && request.cookingTime < 30) {
    adjustedRecipe.cook_time = Math.min(adjustedRecipe.cook_time, request.cookingTime - 10);
    adjustedRecipe.prep_time = Math.min(adjustedRecipe.prep_time, 10);
  }

  return adjustedRecipe as Recipe;
}