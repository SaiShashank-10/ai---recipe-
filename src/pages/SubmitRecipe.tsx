import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Minus, Clock, Users, ChefHat } from 'lucide-react';
import { useRecipes } from '../hooks/useRecipes';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const ingredientSchema = z.object({
  name: z.string().min(1, 'Ingredient name is required'),
  amount: z.string().min(1, 'Amount is required'),
  unit: z.string().min(1, 'Unit is required'),
});

const recipeSchema = z.object({
  title: z.string().min(1, 'Recipe title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  ingredients: z.array(ingredientSchema).min(1, 'At least one ingredient is required'),
  instructions: z.array(z.string().min(1, 'Instruction cannot be empty')).min(1, 'At least one instruction is required'),
  prep_time: z.number().min(1, 'Prep time must be at least 1 minute'),
  cook_time: z.number().min(0, 'Cook time cannot be negative'),
  servings: z.number().min(1, 'Must serve at least 1 person'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  cuisine_type: z.string().optional(),
  dietary_restrictions: z.array(z.string()).optional(),
});

type RecipeFormData = z.infer<typeof recipeSchema>;

const cuisineTypes = [
  'Italian', 'Mexican', 'Chinese', 'Indian', 'Mediterranean', 'American', 
  'French', 'Japanese', 'Thai', 'Greek', 'Spanish', 'Other'
];

const dietaryOptions = [
  'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Low-Carb', 'High-Protein'
];

export function SubmitRecipe() {
  const { createRecipe } = useRecipes();
  const navigate = useNavigate();
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);

  const { register, control, handleSubmit, formState: { errors, isSubmitting } } = useForm<RecipeFormData>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      ingredients: [{ name: '', amount: '', unit: '' }],
      instructions: [''],
      prep_time: 15,
      cook_time: 30,
      servings: 4,
      difficulty: 'medium',
    },
  });

  const { fields: ingredientFields, append: appendIngredient, remove: removeIngredient } = useFieldArray({
    control,
    name: 'ingredients',
  });

  const { fields: instructionFields, append: appendInstruction, remove: removeInstruction } = useFieldArray({
    control,
    name: 'instructions',
  });

  const onSubmit = async (data: RecipeFormData) => {
    try {
      await createRecipe({
        ...data,
        dietary_restrictions: selectedDietary,
      });
      toast.success('Recipe submitted successfully!');
      navigate('/dashboard');
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const toggleDietary = (option: string) => {
    setSelectedDietary(prev => 
      prev.includes(option) 
        ? prev.filter(item => item !== option)
        : [...prev, option]
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <ChefHat className="h-12 w-12 text-orange-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Submit Your Recipe</h1>
          <p className="text-gray-600 mt-2">
            Share your culinary creation and get a beautiful AI-generated recipe card
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">Basic Information</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipe Title *
              </label>
              <input
                {...register('title')}
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                placeholder="Enter your recipe title"
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-none"
                placeholder="Describe your recipe..."
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cuisine Type
                </label>
                <select
                  {...register('cuisine_type')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                >
                  <option value="">Select cuisine type</option>
                  {cuisineTypes.map(cuisine => (
                    <option key={cuisine} value={cuisine}>{cuisine}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty Level *
                </label>
                <select
                  {...register('difficulty')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="inline h-4 w-4 mr-1" />
                  Prep Time (minutes) *
                </label>
                <input
                  {...register('prep_time', { valueAsNumber: true })}
                  type="number"
                  min="1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                />
                {errors.prep_time && (
                  <p className="text-red-500 text-sm mt-1">{errors.prep_time.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="inline h-4 w-4 mr-1" />
                  Cook Time (minutes) *
                </label>
                <input
                  {...register('cook_time', { valueAsNumber: true })}
                  type="number"
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                />
                {errors.cook_time && (
                  <p className="text-red-500 text-sm mt-1">{errors.cook_time.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="inline h-4 w-4 mr-1" />
                  Servings *
                </label>
                <input
                  {...register('servings', { valueAsNumber: true })}
                  type="number"
                  min="1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                />
                {errors.servings && (
                  <p className="text-red-500 text-sm mt-1">{errors.servings.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Dietary Restrictions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Dietary Restrictions</h3>
            <div className="flex flex-wrap gap-3">
              {dietaryOptions.map(option => (
                <button
                  key={option}
                  type="button"
                  onClick={() => toggleDietary(option)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    selectedDietary.includes(option)
                      ? 'bg-orange-100 border-orange-500 text-orange-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:border-orange-300'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Ingredients */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Ingredients *</h3>
            {ingredientFields.map((field, index) => (
              <motion.div
                key={field.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-12 gap-4 items-end"
              >
                <div className="col-span-5">
                  <input
                    {...register(`ingredients.${index}.name`)}
                    placeholder="Ingredient name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  />
                </div>
                <div className="col-span-3">
                  <input
                    {...register(`ingredients.${index}.amount`)}
                    placeholder="Amount"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  />
                </div>
                <div className="col-span-3">
                  <input
                    {...register(`ingredients.${index}.unit`)}
                    placeholder="Unit"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  />
                </div>
                <div className="col-span-1">
                  {ingredientFields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      className="p-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Minus className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
            
            <button
              type="button"
              onClick={() => appendIngredient({ name: '', amount: '', unit: '' })}
              className="flex items-center px-4 py-2 text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Ingredient
            </button>
            
            {errors.ingredients && (
              <p className="text-red-500 text-sm">{errors.ingredients.message}</p>
            )}
          </div>

          {/* Instructions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Instructions *</h3>
            {instructionFields.map((field, index) => (
              <motion.div
                key={field.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4 items-start"
              >
                <span className="flex items-center justify-center w-8 h-8 bg-orange-100 text-orange-600 rounded-full text-sm font-semibold mt-2 flex-shrink-0">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <textarea
                    {...register(`instructions.${index}`)}
                    rows={2}
                    placeholder="Enter cooking instruction..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-none"
                  />
                </div>
                {instructionFields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeInstruction(index)}
                    className="p-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-2"
                  >
                    <Minus className="h-5 w-5" />
                  </button>
                )}
              </motion.div>
            ))}
            
            <button
              type="button"
              onClick={() => appendInstruction('')}
              className="flex items-center px-4 py-2 text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Instruction
            </button>
            
            {errors.instructions && (
              <p className="text-red-500 text-sm">{errors.instructions.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-orange-500 text-white py-4 rounded-lg font-semibold hover:bg-orange-600 focus:ring-4 focus:ring-orange-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg"
            >
              {isSubmitting ? 'Submitting Recipe...' : 'Submit Recipe'}
            </button>
            <p className="text-center text-sm text-gray-600 mt-3">
              Your recipe will be processed by AI and a PDF will be emailed to you
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}