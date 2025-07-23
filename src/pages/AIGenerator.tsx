import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sparkles, Wand2, Clock, Users, ChefHat, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRecipes } from '../hooks/useRecipes';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { RecipeCard } from '../components/RecipeCard';
import { Recipe } from '../types';
import { supabase } from '../lib/supabase';

const aiPromptSchema = z.object({
  prompt: z.string().min(10, 'Please provide a more detailed description (at least 10 characters)'),
  cuisine: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  servings: z.number().min(1).max(20).optional(),
  dietary: z.array(z.string()).optional(),
  cookingTime: z.number().min(5).max(480).optional(),
});

type AIPromptForm = z.infer<typeof aiPromptSchema>;

const cuisineOptions = [
  'Italian', 'Mexican', 'Chinese', 'Indian', 'Mediterranean', 'American', 
  'French', 'Japanese', 'Thai', 'Greek', 'Spanish', 'Korean', 'Vietnamese'
];

const dietaryOptions = [
  'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Low-Carb', 
  'High-Protein', 'Paleo', 'Low-Sodium', 'Sugar-Free'
];

export function AIGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState<Recipe | null>(null);
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const { createRecipe } = useRecipes();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors }, watch } = useForm<AIPromptForm>({
    resolver: zodResolver(aiPromptSchema),
    defaultValues: {
      servings: 4,
      difficulty: 'medium',
      cookingTime: 30,
    },
  });

  const toggleDietary = (option: string) => {
    setSelectedDietary(prev => 
      prev.includes(option) 
        ? prev.filter(item => item !== option)
        : [...prev, option]
    );
  };

  const generateRecipe = async (data: AIPromptForm) => {
    setIsGenerating(true);
    try {
      // Simulate AI generation with realistic recipes
      const recipe = await generateMockRecipe({
        ...data,
        dietary: selectedDietary,
      });
      
      setGeneratedRecipe({
        ...recipe,
        id: 'preview-' + Date.now(),
        user_id: 'current-user',
        status: 'completed',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      toast.success('Recipe generated successfully!');
    } catch (error) {
      console.error('Error generating recipe:', error);
      toast.error('Failed to generate recipe. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateMockRecipe = async (request: any) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // Comprehensive recipe database with diverse options
    const recipeTemplates = {
      // Italian Cuisine
      creamy_mushroom_pasta: {
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
      spicy_arrabbiata: {
        title: "Spicy Arrabbiata Pasta",
        description: "A fiery Italian pasta dish with tomatoes, garlic, and red chili peppers. This classic Roman recipe brings heat and flavor to your dinner table.",
        ingredients: [
          { name: "Penne pasta", amount: "1", unit: "lb" },
          { name: "Crushed tomatoes", amount: "28", unit: "oz can" },
          { name: "Garlic cloves, minced", amount: "6", unit: "cloves" },
          { name: "Red chili flakes", amount: "2", unit: "tsp" },
          { name: "Olive oil", amount: "1/4", unit: "cup" },
          { name: "Fresh basil leaves", amount: "1/4", unit: "cup" },
          { name: "Parmesan cheese", amount: "1/2", unit: "cup" },
          { name: "Salt and pepper", amount: "to", unit: "taste" }
        ],
        instructions: [
          "Cook pasta according to package directions until al dente. Reserve 1 cup pasta water.",
          "Heat olive oil in a large skillet over medium heat. Add garlic and chili flakes, cook for 1 minute.",
          "Add crushed tomatoes and simmer for 15-20 minutes until sauce thickens.",
          "Season with salt and pepper. Add cooked pasta and toss with sauce.",
          "Add pasta water as needed for consistency. Remove from heat.",
          "Garnish with fresh basil and Parmesan cheese. Serve immediately."
        ],
        prep_time: 10,
        cook_time: 25,
        ai_generated_card: "This authentic Arrabbiata brings the heat of Rome to your kitchen. The combination of garlic, chili, and tomatoes creates a sauce that's both simple and intensely flavorful. Perfect for those who love a spicy kick in their pasta!"
      },
      carbonara_pasta: {
        title: "Classic Spaghetti Carbonara",
        description: "An authentic Roman pasta dish with eggs, cheese, pancetta, and black pepper. Simple ingredients create an incredibly rich and satisfying meal.",
        ingredients: [
          { name: "Spaghetti", amount: "1", unit: "lb" },
          { name: "Pancetta, diced", amount: "6", unit: "oz" },
          { name: "Large eggs", amount: "4", unit: "eggs" },
          { name: "Pecorino Romano, grated", amount: "1", unit: "cup" },
          { name: "Black pepper, freshly ground", amount: "2", unit: "tsp" },
          { name: "Salt", amount: "to", unit: "taste" }
        ],
        instructions: [
          "Cook spaghetti in salted boiling water until al dente. Reserve 1 cup pasta water.",
          "Cook pancetta in a large skillet until crispy, about 5-7 minutes.",
          "In a bowl, whisk together eggs, cheese, and black pepper.",
          "Add hot pasta to the skillet with pancetta and remove from heat.",
          "Quickly stir in egg mixture, adding pasta water as needed to create a creamy sauce.",
          "Serve immediately with extra cheese and black pepper."
        ],
        prep_time: 10,
        cook_time: 15,
        ai_generated_card: "True Roman carbonara uses no cream - just eggs, cheese, and technique to create the silkiest sauce. The key is working quickly and using the pasta's heat to cook the eggs without scrambling them."
      },
      // Healthy Salads
      quinoa_salad: {
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
      },
      greek_salad: {
        title: "Traditional Greek Village Salad",
        description: "A fresh and authentic Greek salad with ripe tomatoes, crisp cucumbers, red onions, olives, and creamy feta cheese, dressed with olive oil and herbs.",
        ingredients: [
          { name: "Large tomatoes, cut in wedges", amount: "4", unit: "tomatoes" },
          { name: "Cucumber, sliced thick", amount: "1", unit: "large" },
          { name: "Red onion, sliced thin", amount: "1", unit: "medium" },
          { name: "Kalamata olives", amount: "1", unit: "cup" },
          { name: "Feta cheese, cubed", amount: "8", unit: "oz" },
          { name: "Extra virgin olive oil", amount: "1/3", unit: "cup" },
          { name: "Red wine vinegar", amount: "2", unit: "tbsp" },
          { name: "Dried oregano", amount: "1", unit: "tsp" },
          { name: "Salt and pepper", amount: "to", unit: "taste" }
        ],
        instructions: [
          "Cut tomatoes into wedges and place in a large bowl.",
          "Add thick cucumber slices and thin red onion slices.",
          "Add Kalamata olives and cubed feta cheese.",
          "In a small bowl, whisk together olive oil, vinegar, and oregano.",
          "Pour dressing over salad and toss gently.",
          "Season with salt and pepper. Let sit for 10 minutes before serving."
        ],
        prep_time: 15,
        cook_time: 0,
        ai_generated_card: "This authentic Greek salad captures the essence of Mediterranean cuisine. The key is using the ripest tomatoes and best quality olive oil and feta. It's not just a side dish - it's a celebration of simple, fresh ingredients at their peak."
      },
      caesar_salad: {
        title: "Classic Caesar Salad",
        description: "Crisp romaine lettuce with homemade Caesar dressing, parmesan cheese, and crunchy croutons. A timeless favorite that never goes out of style.",
        ingredients: [
          { name: "Romaine lettuce, chopped", amount: "2", unit: "heads" },
          { name: "Parmesan cheese, grated", amount: "1/2", unit: "cup" },
          { name: "Croutons", amount: "1", unit: "cup" },
          { name: "Mayonnaise", amount: "1/2", unit: "cup" },
          { name: "Lemon juice", amount: "2", unit: "tbsp" },
          { name: "Worcestershire sauce", amount: "1", unit: "tsp" },
          { name: "Garlic cloves, minced", amount: "2", unit: "cloves" },
          { name: "Anchovy paste", amount: "1", unit: "tsp" }
        ],
        instructions: [
          "Wash and chop romaine lettuce, then chill in refrigerator.",
          "In a bowl, whisk together mayonnaise, lemon juice, Worcestershire, garlic, and anchovy paste.",
          "Place chilled lettuce in a large serving bowl.",
          "Drizzle with Caesar dressing and toss to coat evenly.",
          "Top with grated Parmesan cheese and croutons.",
          "Serve immediately while lettuce is crisp."
        ],
        prep_time: 15,
        cook_time: 0,
        ai_generated_card: "The secret to great Caesar salad is in the dressing balance - creamy, tangy, and umami-rich. Fresh, cold lettuce and quality Parmesan make all the difference in this classic."
      },
      // Chicken Dishes
      herb_chicken: {
        title: "Mediterranean Herb-Crusted Chicken",
        description: "Juicy baked chicken breasts with a flavorful herb crust, served with roasted vegetables. A healthy and delicious dinner that's ready in under an hour.",
        ingredients: [
          { name: "Chicken breasts, boneless", amount: "4", unit: "pieces" },
          { name: "Olive oil", amount: "3", unit: "tbsp" },
          { name: "Fresh oregano, chopped", amount: "2", unit: "tbsp" },
          { name: "Fresh basil, chopped", amount: "2", unit: "tbsp" },
          { name: "Garlic cloves, minced", amount: "3", unit: "cloves" },
          { name: "Lemon zest", amount: "1", unit: "lemon" },
          { name: "Panko breadcrumbs", amount: "1/2", unit: "cup" },
          { name: "Cherry tomatoes", amount: "2", unit: "cups" },
          { name: "Zucchini, sliced", amount: "2", unit: "medium" }
        ],
        instructions: [
          "Preheat oven to 400°F. Line a baking sheet with parchment paper.",
          "In a bowl, mix olive oil, oregano, basil, garlic, and lemon zest.",
          "Season chicken breasts with salt and pepper, then brush with herb mixture.",
          "Press panko breadcrumbs onto the chicken to create a crust.",
          "Arrange chicken on baking sheet with cherry tomatoes and zucchini.",
          "Bake for 25-30 minutes until chicken reaches 165°F internal temperature.",
          "Let rest for 5 minutes before serving with the roasted vegetables."
        ],
        prep_time: 15,
        cook_time: 30,
        ai_generated_card: "This Mediterranean chicken dish brings together the bright flavors of fresh herbs, garlic, and lemon. The herb crust keeps the chicken incredibly moist while adding a delightful texture contrast. Paired with colorful roasted vegetables, it's a complete, nutritious meal."
      },
      honey_chicken: {
        title: "Honey Garlic Glazed Chicken Thighs",
        description: "Succulent chicken thighs with a sweet and savory honey garlic glaze. This one-pan dinner is packed with flavor and incredibly easy to make.",
        ingredients: [
          { name: "Chicken thighs, bone-in", amount: "8", unit: "pieces" },
          { name: "Honey", amount: "1/3", unit: "cup" },
          { name: "Soy sauce", amount: "1/4", unit: "cup" },
          { name: "Garlic cloves, minced", amount: "6", unit: "cloves" },
          { name: "Fresh ginger, grated", amount: "1", unit: "tbsp" },
          { name: "Rice vinegar", amount: "2", unit: "tbsp" },
          { name: "Sesame oil", amount: "1", unit: "tbsp" },
          { name: "Green onions, chopped", amount: "3", unit: "stalks" },
          { name: "Sesame seeds", amount: "1", unit: "tbsp" }
        ],
        instructions: [
          "Preheat oven to 425°F. Season chicken thighs with salt and pepper.",
          "In a bowl, whisk together honey, soy sauce, garlic, ginger, and rice vinegar.",
          "Heat sesame oil in an oven-safe skillet over medium-high heat.",
          "Sear chicken thighs skin-side down for 5 minutes until golden.",
          "Flip chicken and brush with honey glaze. Transfer to oven.",
          "Bake for 25-30 minutes, basting with glaze every 10 minutes.",
          "Garnish with green onions and sesame seeds before serving."
        ],
        prep_time: 15,
        cook_time: 35,
        ai_generated_card: "This honey garlic chicken delivers restaurant-quality flavors with minimal effort. The glaze caramelizes beautifully in the oven, creating a sticky, flavorful coating that's absolutely irresistible. It's comfort food at its finest!"
      },
      buffalo_chicken: {
        title: "Crispy Buffalo Chicken Wings",
        description: "Perfectly crispy chicken wings tossed in tangy buffalo sauce. These crowd-pleasing wings are perfect for game day or any gathering.",
        ingredients: [
          { name: "Chicken wings, split", amount: "2", unit: "lbs" },
          { name: "Hot sauce", amount: "1/2", unit: "cup" },
          { name: "Butter", amount: "1/4", unit: "cup" },
          { name: "White vinegar", amount: "1", unit: "tbsp" },
          { name: "Garlic powder", amount: "1", unit: "tsp" },
          { name: "Celery sticks", amount: "6", unit: "stalks" },
          { name: "Blue cheese dressing", amount: "1/2", unit: "cup" }
        ],
        instructions: [
          "Preheat oven to 425°F. Pat wings dry and season with salt and pepper.",
          "Arrange wings on a baking sheet lined with parchment paper.",
          "Bake for 45-50 minutes until crispy and golden brown.",
          "Meanwhile, melt butter and mix with hot sauce, vinegar, and garlic powder.",
          "Toss hot wings in buffalo sauce until well coated.",
          "Serve immediately with celery sticks and blue cheese dressing."
        ],
        prep_time: 10,
        cook_time: 50,
        ai_generated_card: "The secret to perfect buffalo wings is getting them crispy in the oven first, then tossing in the sauce. The combination of hot sauce and butter creates that classic tangy, rich buffalo flavor."
      },
      // Soups & Stews
      tomato_soup: {
        title: "Roasted Tomato Basil Soup",
        description: "A velvety smooth soup made from roasted tomatoes and fresh basil. This comforting classic is perfect for any season and pairs beautifully with grilled cheese.",
        ingredients: [
          { name: "Roma tomatoes, halved", amount: "3", unit: "lbs" },
          { name: "Yellow onion, quartered", amount: "1", unit: "large" },
          { name: "Garlic cloves", amount: "6", unit: "cloves" },
          { name: "Olive oil", amount: "1/4", unit: "cup" },
          { name: "Vegetable broth", amount: "2", unit: "cups" },
          { name: "Heavy cream", amount: "1/2", unit: "cup" },
          { name: "Fresh basil leaves", amount: "1/4", unit: "cup" },
          { name: "Salt and pepper", amount: "to", unit: "taste" }
        ],
        instructions: [
          "Preheat oven to 400°F. Toss tomatoes, onion, and garlic with olive oil.",
          "Roast vegetables for 45 minutes until caramelized and tender.",
          "Transfer roasted vegetables to a large pot with vegetable broth.",
          "Simmer for 15 minutes, then blend until smooth using an immersion blender.",
          "Stir in heavy cream and fresh basil. Season with salt and pepper.",
          "Simmer for 5 more minutes and serve hot with crusty bread."
        ],
        prep_time: 15,
        cook_time: 60,
        ai_generated_card: "Roasting the tomatoes first adds incredible depth and sweetness to this classic soup. The caramelization process concentrates the flavors, while fresh basil adds a bright, aromatic finish. It's comfort in a bowl!"
      },
      chicken_noodle_soup: {
        title: "Homemade Chicken Noodle Soup",
        description: "The ultimate comfort food with tender chicken, vegetables, and egg noodles in a rich, flavorful broth. Perfect for cold days or when you need some comfort.",
        ingredients: [
          { name: "Chicken breast, diced", amount: "1", unit: "lb" },
          { name: "Egg noodles", amount: "8", unit: "oz" },
          { name: "Carrots, sliced", amount: "3", unit: "large" },
          { name: "Celery stalks, chopped", amount: "3", unit: "stalks" },
          { name: "Yellow onion, diced", amount: "1", unit: "medium" },
          { name: "Chicken broth", amount: "8", unit: "cups" },
          { name: "Fresh thyme", amount: "1", unit: "tsp" },
          { name: "Bay leaves", amount: "2", unit: "leaves" }
        ],
        instructions: [
          "In a large pot, sauté onion, carrots, and celery until softened, about 5 minutes.",
          "Add chicken broth, thyme, and bay leaves. Bring to a boil.",
          "Add diced chicken and simmer for 15 minutes until cooked through.",
          "Add egg noodles and cook according to package directions.",
          "Season with salt and pepper to taste.",
          "Remove bay leaves and serve hot with crackers or bread."
        ],
        prep_time: 15,
        cook_time: 30,
        ai_generated_card: "Nothing beats homemade chicken noodle soup for comfort and nourishment. The key is building layers of flavor with aromatic vegetables and herbs, creating a broth that's both hearty and healing."
      },
      // Desserts & Sweets
      chocolate_cake: {
        title: "Decadent Double Chocolate Cake",
        description: "A rich, moist chocolate cake with layers of chocolate ganache. This indulgent dessert is perfect for special occasions or when you need a chocolate fix.",
        ingredients: [
          { name: "All-purpose flour", amount: "2", unit: "cups" },
          { name: "Cocoa powder", amount: "3/4", unit: "cup" },
          { name: "Sugar", amount: "2", unit: "cups" },
          { name: "Eggs", amount: "2", unit: "large" },
          { name: "Buttermilk", amount: "1", unit: "cup" },
          { name: "Vegetable oil", amount: "1/2", unit: "cup" },
          { name: "Hot coffee", amount: "1", unit: "cup" },
          { name: "Dark chocolate, chopped", amount: "8", unit: "oz" },
          { name: "Heavy cream", amount: "1", unit: "cup" }
        ],
        instructions: [
          "Preheat oven to 350°F. Grease and flour two 9-inch cake pans.",
          "Mix flour, cocoa, sugar, baking soda, and salt in a large bowl.",
          "In another bowl, whisk eggs, buttermilk, and oil. Add to dry ingredients.",
          "Gradually stir in hot coffee until smooth. Divide between prepared pans.",
          "Bake for 30-35 minutes until a toothpick comes out clean.",
          "For ganache, heat cream and pour over chopped chocolate. Stir until smooth.",
          "Cool cakes completely, then layer with ganache between and on top."
        ],
        prep_time: 20,
        cook_time: 35,
        ai_generated_card: "This chocolate cake is the ultimate indulgence for chocolate lovers. The secret ingredient - hot coffee - intensifies the chocolate flavor without making it taste like coffee. The result is an incredibly moist, rich cake that's pure decadence."
      },
      chocolate_chip_cookies: {
        title: "Perfect Chocolate Chip Cookies",
        description: "Soft, chewy chocolate chip cookies with crispy edges and gooey centers. These classic cookies are loaded with chocolate chips and pure vanilla flavor.",
        ingredients: [
          { name: "All-purpose flour", amount: "2 1/4", unit: "cups" },
          { name: "Butter, softened", amount: "1", unit: "cup" },
          { name: "Brown sugar", amount: "3/4", unit: "cup" },
          { name: "White sugar", amount: "3/4", unit: "cup" },
          { name: "Large eggs", amount: "2", unit: "eggs" },
          { name: "Vanilla extract", amount: "2", unit: "tsp" },
          { name: "Baking soda", amount: "1", unit: "tsp" },
          { name: "Salt", amount: "1", unit: "tsp" },
          { name: "Chocolate chips", amount: "2", unit: "cups" }
        ],
        instructions: [
          "Preheat oven to 375°F. Line baking sheets with parchment paper.",
          "Cream together butter and both sugars until light and fluffy.",
          "Beat in eggs one at a time, then add vanilla extract.",
          "In a separate bowl, whisk together flour, baking soda, and salt.",
          "Gradually mix dry ingredients into wet ingredients until just combined.",
          "Fold in chocolate chips, then drop rounded tablespoons onto baking sheets.",
          "Bake for 9-11 minutes until edges are golden brown. Cool on baking sheet for 5 minutes."
        ],
        prep_time: 15,
        cook_time: 11,
        ai_generated_card: "The perfect chocolate chip cookie has the ideal balance of crispy edges and chewy centers. Using a mix of brown and white sugar creates the perfect texture, while plenty of vanilla enhances the chocolate flavor."
      },
      // Asian Cuisine
      fried_rice: {
        title: "Classic Vegetable Fried Rice",
        description: "A quick and flavorful fried rice with mixed vegetables, eggs, and soy sauce. This versatile dish is perfect for using up leftover rice and vegetables.",
        ingredients: [
          { name: "Cooked rice, day-old", amount: "4", unit: "cups" },
          { name: "Eggs, beaten", amount: "3", unit: "eggs" },
          { name: "Mixed vegetables, frozen", amount: "1", unit: "cup" },
          { name: "Green onions, chopped", amount: "4", unit: "stalks" },
          { name: "Garlic cloves, minced", amount: "3", unit: "cloves" },
          { name: "Soy sauce", amount: "3", unit: "tbsp" },
          { name: "Sesame oil", amount: "1", unit: "tbsp" },
          { name: "Vegetable oil", amount: "2", unit: "tbsp" }
        ],
        instructions: [
          "Heat vegetable oil in a large wok or skillet over high heat.",
          "Add beaten eggs and scramble until just set. Remove and set aside.",
          "Add more oil if needed, then add garlic and cook for 30 seconds.",
          "Add cold rice, breaking up any clumps with a spatula.",
          "Stir-fry rice for 3-4 minutes until heated through and slightly crispy.",
          "Add mixed vegetables and cook for 2 minutes until heated.",
          "Return eggs to pan, add soy sauce and sesame oil, and toss to combine.",
          "Garnish with green onions and serve immediately."
        ],
        prep_time: 10,
        cook_time: 10,
        ai_generated_card: "The secret to great fried rice is using day-old rice that's been refrigerated - it fries up perfectly without getting mushy. High heat and quick cooking preserve the texture and create that authentic wok flavor."
      },
      // Mexican Cuisine
      chicken_tacos: {
        title: "Authentic Chicken Tacos",
        description: "Tender, seasoned chicken served in warm tortillas with fresh toppings. These authentic-style tacos are bursting with flavor and perfect for any meal.",
        ingredients: [
          { name: "Chicken thighs, boneless", amount: "2", unit: "lbs" },
          { name: "Corn tortillas", amount: "12", unit: "tortillas" },
          { name: "White onion, diced", amount: "1", unit: "medium" },
          { name: "Cilantro, chopped", amount: "1/2", unit: "cup" },
          { name: "Lime wedges", amount: "2", unit: "limes" },
          { name: "Chili powder", amount: "2", unit: "tsp" },
          { name: "Cumin", amount: "1", unit: "tsp" },
          { name: "Garlic powder", amount: "1", unit: "tsp" },
          { name: "Salt and pepper", amount: "to", unit: "taste" }
        ],
        instructions: [
          "Season chicken thighs with chili powder, cumin, garlic powder, salt, and pepper.",
          "Heat a skillet over medium-high heat and cook chicken for 6-7 minutes per side.",
          "Let chicken rest for 5 minutes, then dice into small pieces.",
          "Warm tortillas in a dry skillet or over an open flame until slightly charred.",
          "Fill each tortilla with chicken, diced onion, and cilantro.",
          "Serve with lime wedges and your favorite hot sauce."
        ],
        prep_time: 15,
        cook_time: 20,
        ai_generated_card: "Authentic tacos are all about simplicity and quality ingredients. The key is properly seasoned meat, warm tortillas, and fresh toppings that let each flavor shine through."
      },
      // Indian Cuisine
      butter_chicken: {
        title: "Creamy Butter Chicken",
        description: "Rich and creamy Indian curry with tender chicken in a tomato-based sauce with aromatic spices. Served with basmati rice or naan bread.",
        ingredients: [
          { name: "Chicken breast, cubed", amount: "2", unit: "lbs" },
          { name: "Crushed tomatoes", amount: "28", unit: "oz can" },
          { name: "Heavy cream", amount: "1", unit: "cup" },
          { name: "Butter", amount: "4", unit: "tbsp" },
          { name: "Onion, diced", amount: "1", unit: "large" },
          { name: "Garlic cloves, minced", amount: "4", unit: "cloves" },
          { name: "Fresh ginger, grated", amount: "1", unit: "tbsp" },
          { name: "Garam masala", amount: "2", unit: "tsp" },
          { name: "Paprika", amount: "1", unit: "tsp" }
        ],
        instructions: [
          "Season chicken with salt, pepper, and half the garam masala.",
          "Heat butter in a large skillet and cook chicken until golden. Remove and set aside.",
          "In the same pan, sauté onion until softened, about 5 minutes.",
          "Add garlic, ginger, and remaining spices. Cook for 1 minute until fragrant.",
          "Add crushed tomatoes and simmer for 10 minutes until thickened.",
          "Stir in cream and return chicken to the pan.",
          "Simmer for 10 more minutes until chicken is cooked through.",
          "Serve over basmati rice with fresh cilantro."
        ],
        prep_time: 15,
        cook_time: 30,
        ai_generated_card: "This butter chicken strikes the perfect balance between rich, creamy texture and aromatic Indian spices. The tomato base provides acidity that balances the richness of the cream and butter."
      }
    };

    // Advanced prompt analysis for better recipe matching
    const prompt = request.prompt.toLowerCase();
    const words = prompt.split(' ');
    let selectedRecipeKey = null;
    let matchScore = 0;
    
    // Define keyword mappings for each recipe
    const recipeKeywords = {
      creamy_mushroom_pasta: ['creamy', 'mushroom', 'pasta', 'alfredo', 'cream', 'garlic', 'italian'],
      spicy_arrabbiata: ['spicy', 'pasta', 'arrabbiata', 'hot', 'chili', 'tomato', 'red sauce', 'italian'],
      carbonara_pasta: ['carbonara', 'pasta', 'egg', 'pancetta', 'bacon', 'cheese', 'italian', 'roman'],
      quinoa_salad: ['quinoa', 'salad', 'healthy', 'bowl', 'power bowl', 'grain', 'vegetables', 'tahini'],
      greek_salad: ['greek', 'salad', 'feta', 'olive', 'tomato', 'cucumber', 'mediterranean'],
      caesar_salad: ['caesar', 'salad', 'romaine', 'parmesan', 'croutons', 'anchovy'],
      herb_chicken: ['herb', 'chicken', 'mediterranean', 'baked', 'roasted', 'herbs'],
      honey_chicken: ['honey', 'chicken', 'sweet', 'glaze', 'asian', 'soy', 'garlic'],
      buffalo_chicken: ['buffalo', 'chicken', 'wings', 'spicy', 'hot sauce', 'crispy'],
      tomato_soup: ['tomato', 'soup', 'basil', 'roasted', 'comfort'],
      chicken_noodle_soup: ['chicken', 'noodle', 'soup', 'comfort', 'broth', 'vegetables'],
      chocolate_cake: ['chocolate', 'cake', 'dessert', 'sweet', 'decadent', 'rich'],
      chocolate_chip_cookies: ['cookie', 'chocolate chip', 'sweet', 'dessert', 'baked', 'chewy'],
      fried_rice: ['fried rice', 'rice', 'asian', 'chinese', 'vegetables', 'egg'],
      chicken_tacos: ['taco', 'chicken', 'mexican', 'tortilla', 'cilantro', 'lime'],
      butter_chicken: ['butter chicken', 'indian', 'curry', 'creamy', 'spicy', 'tomato']
    };

    // Calculate match scores for each recipe
    Object.entries(recipeKeywords).forEach(([recipeKey, keywords]) => {
      let score = 0;
      keywords.forEach(keyword => {
        if (prompt.includes(keyword)) {
          // Give higher scores for exact matches and multi-word phrases
          if (keyword.includes(' ')) {
            score += 3; // Multi-word phrases get higher priority
          } else {
            score += 1;
          }
        }
      });
      
      // Bonus points for cuisine type matching
      if (request.cuisine) {
        const cuisine = request.cuisine.toLowerCase();
        if ((cuisine === 'italian' && ['creamy_mushroom_pasta', 'spicy_arrabbiata', 'carbonara_pasta'].includes(recipeKey)) ||
            (cuisine === 'mexican' && recipeKey === 'chicken_tacos') ||
            (cuisine === 'indian' && recipeKey === 'butter_chicken') ||
            (cuisine === 'chinese' && recipeKey === 'fried_rice') ||
            (cuisine === 'mediterranean' && ['greek_salad', 'herb_chicken'].includes(recipeKey))) {
          score += 2;
        }
      }
      
      if (score > matchScore) {
        matchScore = score;
        selectedRecipeKey = recipeKey;
      }
    });

    // Fallback: if no good match found, analyze prompt for general categories
    if (!selectedRecipeKey || matchScore === 0) {
      if (prompt.includes('pasta') || prompt.includes('italian')) {
        const pastaOptions = ['creamy_mushroom_pasta', 'spicy_arrabbiata', 'carbonara_pasta'];
        selectedRecipeKey = pastaOptions[Math.floor(Math.random() * pastaOptions.length)];
      } else if (prompt.includes('salad') || prompt.includes('healthy')) {
        const saladOptions = ['quinoa_salad', 'greek_salad', 'caesar_salad'];
        selectedRecipeKey = saladOptions[Math.floor(Math.random() * saladOptions.length)];
      } else if (prompt.includes('chicken')) {
        const chickenOptions = ['herb_chicken', 'honey_chicken', 'buffalo_chicken', 'butter_chicken', 'chicken_tacos', 'chicken_noodle_soup'];
        selectedRecipeKey = chickenOptions[Math.floor(Math.random() * chickenOptions.length)];
      } else if (prompt.includes('soup')) {
        const soupOptions = ['tomato_soup', 'chicken_noodle_soup'];
        selectedRecipeKey = soupOptions[Math.floor(Math.random() * soupOptions.length)];
      } else if (prompt.includes('dessert') || prompt.includes('sweet') || prompt.includes('chocolate') || prompt.includes('cake') || prompt.includes('cookie')) {
        const dessertOptions = ['chocolate_cake', 'chocolate_chip_cookies'];
        selectedRecipeKey = dessertOptions[Math.floor(Math.random() * dessertOptions.length)];
      } else if (prompt.includes('mexican') || prompt.includes('taco')) {
        selectedRecipeKey = 'chicken_tacos';
      } else if (prompt.includes('indian') || prompt.includes('curry')) {
        selectedRecipeKey = 'butter_chicken';
      } else if (prompt.includes('asian') || prompt.includes('chinese') || prompt.includes('rice')) {
        selectedRecipeKey = 'fried_rice';
      } else {
        // Random selection for completely unmatched prompts
        const allRecipes = Object.keys(recipeTemplates);
        selectedRecipeKey = allRecipes[Math.floor(Math.random() * allRecipes.length)];
      }
    }

    const selectedRecipe = recipeTemplates[selectedRecipeKey as keyof typeof recipeTemplates];

    // Customize the selected recipe based on user preferences
    const customizedRecipe = {
      ...selectedRecipe,
      servings: request.servings || 4,
      difficulty: request.difficulty || 'medium',
      cuisine_type: request.cuisine,
      dietary_restrictions: request.dietary || [],
    };

    // Adjust cooking times based on user constraints
    if (request.cookingTime && request.cookingTime < (customizedRecipe.prep_time + customizedRecipe.cook_time)) {
      const totalTime = request.cookingTime;
      const ratio = customizedRecipe.prep_time / (customizedRecipe.prep_time + customizedRecipe.cook_time);
      customizedRecipe.prep_time = Math.max(5, Math.round(totalTime * ratio));
      customizedRecipe.cook_time = Math.max(5, totalTime - customizedRecipe.prep_time);
    }

    // Add dietary modifications to the AI card if dietary restrictions are specified
    if (request.dietary && request.dietary.length > 0) {
      customizedRecipe.ai_generated_card += ` This recipe has been customized for ${request.dietary.join(', ')} dietary preferences.`;
    }

    return customizedRecipe;
  };

  const saveRecipe = async () => {
    if (!generatedRecipe) return;

    try {
      // Notify S-Hatch team of AI recipe generation
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.functions.invoke('notify-team', {
          body: {
            activity_type: 'ai_recipe_generated',
            user_email: user.email,
            user_id: user.id,
            recipe_title: generatedRecipe.title,
            action: 'AI Recipe Generated and Saved',
            timestamp: new Date().toISOString()
          }
        });
      }
      
      await createRecipe({
        title: generatedRecipe.title,
        description: generatedRecipe.description,
        ingredients: generatedRecipe.ingredients,
        instructions: generatedRecipe.instructions,
        prep_time: generatedRecipe.prep_time,
        cook_time: generatedRecipe.cook_time,
        servings: generatedRecipe.servings,
        difficulty: generatedRecipe.difficulty,
        cuisine_type: generatedRecipe.cuisine_type,
        dietary_restrictions: generatedRecipe.dietary_restrictions,
        ai_generated_card: generatedRecipe.ai_generated_card,
      });
      
      toast.success('Recipe saved to your collection!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to save recipe');
    }
  };

  const regenerateRecipe = () => {
    setGeneratedRecipe(null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-full">
            <Sparkles className="h-12 w-12 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          AI Recipe Generator
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Describe what you want to cook, and our AI will create a complete recipe with ingredients, 
          instructions, and beautiful formatting. From simple ideas to complex dishes!
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Generator Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center mb-6">
            <Wand2 className="h-6 w-6 text-purple-500 mr-2" />
            <h2 className="text-2xl font-semibold text-gray-900">Recipe Prompt</h2>
          </div>

          <form onSubmit={handleSubmit(generateRecipe)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Describe your recipe idea *
              </label>
              <textarea
                {...register('prompt')}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors resize-none"
                placeholder="e.g., A creamy pasta dish with mushrooms and garlic, or a healthy quinoa salad with roasted vegetables..."
              />
              {errors.prompt && (
                <p className="text-red-500 text-sm mt-1">{errors.prompt.message}</p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cuisine Type
                </label>
                <select
                  {...register('cuisine')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                >
                  <option value="">Any cuisine</option>
                  {cuisineOptions.map(cuisine => (
                    <option key={cuisine} value={cuisine}>{cuisine}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty Level
                </label>
                <select
                  {...register('difficulty')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="inline h-4 w-4 mr-1" />
                  Servings
                </label>
                <input
                  {...register('servings', { valueAsNumber: true })}
                  type="number"
                  min="1"
                  max="20"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="inline h-4 w-4 mr-1" />
                  Max Cooking Time (minutes)
                </label>
                <input
                  {...register('cookingTime', { valueAsNumber: true })}
                  type="number"
                  min="5"
                  max="480"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Dietary Preferences
              </label>
              <div className="flex flex-wrap gap-2">
                {dietaryOptions.map(option => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => toggleDietary(option)}
                    className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                      selectedDietary.includes(option)
                        ? 'bg-purple-100 border-purple-500 text-purple-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-purple-300'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 focus:ring-4 focus:ring-purple-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Generating Recipe...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Generate Recipe
                </>
              )}
            </button>
          </form>
        </div>

        {/* Generated Recipe Preview */}
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {isGenerating && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-xl shadow-lg p-8 text-center"
              >
                <div className="flex justify-center mb-4">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-full">
                    <ChefHat className="h-8 w-8 text-white animate-bounce" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  AI Chef is Cooking...
                </h3>
                <p className="text-gray-600 mb-4">
                  Creating your perfect recipe with ingredients and instructions
                </p>
                <div className="flex justify-center">
                  <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
                </div>
              </motion.div>
            )}

            {generatedRecipe && !isGenerating && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">Generated Recipe</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={regenerateRecipe}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={saveRecipe}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                    >
                      Save Recipe
                    </button>
                  </div>
                </div>
                
                <RecipeCard recipe={generatedRecipe} />
              </motion.div>
            )}

            {!generatedRecipe && !isGenerating && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 p-12 text-center"
              >
                <ChefHat className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Your AI Recipe Will Appear Here
                </h3>
                <p className="text-gray-600">
                  Fill out the form and click "Generate Recipe" to see your custom recipe card
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Example Prompts */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Need Inspiration? Try These Prompts:</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            "A healthy quinoa bowl with roasted vegetables and tahini dressing",
            "Comfort food mac and cheese with a crispy breadcrumb topping",
            "Fresh summer salad with seasonal fruits and herbs",
            "One-pot pasta dish with mushrooms and spinach",
            "Crispy baked chicken with Mediterranean flavors",
            "Vegan chocolate dessert that's rich and indulgent"
          ].map((prompt, index) => (
            <button
              key={index}
              onClick={() => {
                const textarea = document.querySelector('textarea[name="prompt"]') as HTMLTextAreaElement;
                if (textarea) textarea.value = prompt;
              }}
              className="text-left p-4 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg hover:from-purple-100 hover:to-pink-100 transition-colors"
            >
              <p className="text-sm text-gray-700 leading-relaxed">"{prompt}"</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}