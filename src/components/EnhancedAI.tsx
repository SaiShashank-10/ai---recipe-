import React, { useState } from 'react';
import { Wand2, Lightbulb, Zap, RefreshCw, Sparkles } from 'lucide-react';
import { Recipe } from '../types';
import { motion } from 'framer-motion';

interface EnhancedAIProps {
  recipe: Recipe;
  onRecipeUpdate: (updatedRecipe: Recipe) => void;
}

export function EnhancedAI({ recipe, onRecipeUpdate }: EnhancedAIProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeFeature, setActiveFeature] = useState<string | null>(null);

  const aiFeatures = [
    {
      id: 'make-healthier',
      title: 'Make Healthier',
      description: 'Reduce calories and add nutritious alternatives',
      icon: Lightbulb,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      id: 'dietary-adapt',
      title: 'Dietary Adaptation',
      description: 'Convert to vegan, gluten-free, or keto',
      icon: Sparkles,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      id: 'ingredient-substitute',
      title: 'Ingredient Substitutes',
      description: 'Find alternatives for missing ingredients',
      icon: RefreshCw,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      id: 'cooking-tips',
      title: 'Pro Cooking Tips',
      description: 'Get expert techniques and improvements',
      icon: Zap,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    }
  ];

  const handleAIFeature = async (featureId: string) => {
    setIsProcessing(true);
    setActiveFeature(featureId);

    try {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock AI enhancements based on feature
      let updatedRecipe = { ...recipe };

      switch (featureId) {
        case 'make-healthier':
          updatedRecipe = {
            ...recipe,
            description: recipe.description + ' (Healthier version with reduced calories)',
            ingredients: recipe.ingredients.map(ing => ({
              ...ing,
              name: ing.name.includes('butter') ? ing.name.replace('butter', 'olive oil') : ing.name,
              amount: ing.name.includes('sugar') ? (parseFloat(ing.amount) * 0.75).toString() : ing.amount
            })),
            ai_generated_card: 'This healthier version reduces calories by 25% while maintaining great taste. We\'ve substituted butter with heart-healthy olive oil and reduced sugar content.'
          };
          break;

        case 'dietary-adapt':
          updatedRecipe = {
            ...recipe,
            dietary_restrictions: [...(recipe.dietary_restrictions || []), 'Vegan'],
            ingredients: recipe.ingredients.map(ing => ({
              ...ing,
              name: ing.name.includes('milk') ? ing.name.replace('milk', 'almond milk') : 
                    ing.name.includes('cheese') ? ing.name.replace('cheese', 'nutritional yeast') : ing.name
            })),
            ai_generated_card: 'This vegan adaptation maintains all the flavors you love while being completely plant-based. Perfect for those following a vegan lifestyle!'
          };
          break;

        case 'ingredient-substitute':
          updatedRecipe = {
            ...recipe,
            ai_generated_card: 'Here are some great substitutions: Use Greek yogurt instead of sour cream, honey instead of sugar, or cauliflower rice instead of regular rice for a low-carb option.'
          };
          break;

        case 'cooking-tips':
          updatedRecipe = {
            ...recipe,
            instructions: [
              ...recipe.instructions,
              'Pro tip: Let ingredients come to room temperature before cooking for even heat distribution.',
              'Chef\'s secret: Add a pinch of salt to enhance all flavors, even in sweet dishes.'
            ],
            ai_generated_card: 'Enhanced with professional cooking techniques that will elevate your dish to restaurant quality. These tips come from years of culinary expertise!'
          };
          break;
      }

      onRecipeUpdate(updatedRecipe);
    } catch (error) {
      console.error('AI processing error:', error);
    } finally {
      setIsProcessing(false);
      setActiveFeature(null);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center mb-6">
        <Wand2 className="h-6 w-6 text-purple-500 mr-2" />
        <h3 className="text-xl font-semibold text-gray-900">AI Recipe Enhancement</h3>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {aiFeatures.map((feature) => (
          <motion.button
            key={feature.id}
            onClick={() => handleAIFeature(feature.id)}
            disabled={isProcessing}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`p-4 rounded-lg border-2 text-left transition-all duration-200 ${
              activeFeature === feature.id
                ? `${feature.bgColor} ${feature.borderColor} shadow-md`
                : `bg-white border-gray-200 hover:${feature.bgColor} hover:${feature.borderColor}`
            } ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}`}
          >
            <div className="flex items-start space-x-3">
              <div className={`p-2 rounded-lg ${feature.bgColor}`}>
                {activeFeature === feature.id && isProcessing ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
                ) : (
                  <feature.icon className={`h-5 w-5 ${feature.color}`} />
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">{feature.title}</h4>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {isProcessing && (
        <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex items-center space-x-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
            <span className="text-purple-700 font-medium">
              AI is enhancing your recipe...
            </span>
          </div>
        </div>
      )}
    </div>
  );
}