import { useState, useEffect } from 'react';
import { Recipe } from '../types';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecipes(data || []);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      toast.error('Failed to load recipes');
    } finally {
      setLoading(false);
    }
  };

  const createRecipe = async (recipeData: Omit<Recipe, 'id' | 'user_id' | 'status' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('recipes')
        .insert([
          {
            ...recipeData,
            user_id: user.id,
            status: 'pending',
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Trigger AI generation and notifications
      await processRecipe(data.id);
      
      // Notify S-Hatch team of recipe creation
      await notifyTeam('recipe_created', {
        user_email: user.email,
        recipe_title: data.title,
        recipe_id: data.id,
        action: 'Recipe Created'
      });

      await fetchRecipes();
      toast.success('Recipe submitted successfully!');
      return data;
    } catch (error) {
      console.error('Error creating recipe:', error);
      toast.error('Failed to submit recipe');
      throw error;
    }
  };

  const deleteRecipe = async (recipeId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get recipe details before deletion for notification
      const { data: recipe } = await supabase
        .from('recipes')
        .select('title')
        .eq('id', recipeId)
        .eq('user_id', user.id)
        .single();

      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', recipeId)
        .eq('user_id', user.id); // Ensure user can only delete their own recipes

      if (error) throw error;

      // Immediately update local state
      setRecipes(prevRecipes => prevRecipes.filter(r => r.id !== recipeId));
      // Notify S-Hatch team of recipe deletion
      await notifyTeam('recipe_deleted', {
        user_email: user.email,
        user_id: user.id,
        recipe_title: recipe?.title || 'Unknown Recipe',
        recipe_id: recipeId,
        action: 'Recipe Deleted'
      });

      toast.success('Recipe deleted successfully!');
    } catch (error) {
      console.error('Error deleting recipe:', error);
      toast.error('Failed to delete recipe');
      throw error;
    }
  };
  const processRecipe = async (recipeId: string) => {
    try {
      // Call edge function to process recipe
      const { error } = await supabase.functions.invoke('process-recipe', {
        body: { recipeId }
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error processing recipe:', error);
    }
  };

  const notifyTeam = async (activityType: string, data: any) => {
    try {
      await supabase.functions.invoke('notify-team', {
        body: {
          activity_type: activityType,
          ...data,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error notifying team:', error);
    }
  };
  return {
    recipes,
    loading,
    createRecipe,
    deleteRecipe,
    refetch: fetchRecipes,
  };
}