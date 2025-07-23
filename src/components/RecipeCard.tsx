import React from 'react';
import { Clock, Users, ChefHat } from 'lucide-react';
import { Recipe } from '../types';

interface RecipeCardProps {
  recipe: Recipe;
  className?: string;
}

export function RecipeCard({ recipe, className = '' }: RecipeCardProps) {
  const totalTime = recipe.prep_time + recipe.cook_time;

  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`} id={`recipe-card-${recipe.id}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6">
        <div className="flex items-center justify-between mb-4">
          <ChefHat className="h-8 w-8" />
          <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
            {recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1)}
          </span>
        </div>
        <h1 className="text-2xl font-bold mb-2">{recipe.title}</h1>
        <p className="text-orange-100 text-sm leading-relaxed">{recipe.description}</p>
      </div>

      {/* Recipe Info */}
      <div className="p-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <Clock className="h-5 w-5 text-orange-500 mx-auto mb-1" />
            <div className="text-sm font-medium text-gray-900">{recipe.prep_time}m</div>
            <div className="text-xs text-gray-600">Prep</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <Clock className="h-5 w-5 text-green-500 mx-auto mb-1" />
            <div className="text-sm font-medium text-gray-900">{recipe.cook_time}m</div>
            <div className="text-xs text-gray-600">Cook</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <Users className="h-5 w-5 text-blue-500 mx-auto mb-1" />
            <div className="text-sm font-medium text-gray-900">{recipe.servings}</div>
            <div className="text-xs text-gray-600">Servings</div>
          </div>
        </div>

        {/* Cuisine and Dietary Info */}
        {(recipe.cuisine_type || recipe.dietary_restrictions?.length) && (
          <div className="mb-6 space-y-2">
            {recipe.cuisine_type && (
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-700 mr-2">Cuisine:</span>
                <span className="text-sm text-gray-600">{recipe.cuisine_type}</span>
              </div>
            )}
            {recipe.dietary_restrictions?.length && (
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-700 mr-2">Dietary:</span>
                <div className="flex flex-wrap gap-1">
                  {recipe.dietary_restrictions.map((restriction, index) => (
                    <span
                      key={index}
                      className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full"
                    >
                      {restriction}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Ingredients */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">
            Ingredients
          </h2>
          <ul className="space-y-2">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index} className="flex items-center text-sm">
                <span className="w-2 h-2 bg-orange-400 rounded-full mr-3 flex-shrink-0"></span>
                <span className="font-medium text-gray-900 mr-2">
                  {ingredient.amount} {ingredient.unit}
                </span>
                <span className="text-gray-700">{ingredient.name}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Instructions */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">
            Instructions
          </h2>
          <ol className="space-y-3">
            {recipe.instructions.map((instruction, index) => (
              <li key={index} className="flex items-start text-sm">
                <span className="flex items-center justify-center w-6 h-6 bg-orange-500 text-white rounded-full text-xs font-bold mr-3 flex-shrink-0 mt-0.5">
                  {index + 1}
                </span>
                <span className="text-gray-700 leading-relaxed">{instruction}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* AI Generated Description */}
        {recipe.ai_generated_card && (
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">✨ AI Chef's Notes</h3>
            <p className="text-sm text-blue-800 leading-relaxed">{recipe.ai_generated_card}</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            Created with RecipeAI • Total Time: {totalTime} minutes
          </p>
        </div>
      </div>
    </div>
  );
}