import React from 'react';
import { BarChart3, TrendingUp, Clock, ChefHat, Star, Users } from 'lucide-react';
import { Recipe } from '../types';

interface AnalyticsDashboardProps {
  recipes: Recipe[];
}

export function AnalyticsDashboard({ recipes }: AnalyticsDashboardProps) {
  // Calculate analytics
  const totalRecipes = recipes.length;
  const completedRecipes = recipes.filter(r => r.status === 'completed').length;
  const avgCookTime = recipes.length > 0 
    ? Math.round(recipes.reduce((sum, r) => sum + r.prep_time + r.cook_time, 0) / recipes.length)
    : 0;
  
  const cuisineStats = recipes.reduce((acc, recipe) => {
    if (recipe.cuisine_type) {
      acc[recipe.cuisine_type] = (acc[recipe.cuisine_type] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const difficultyStats = recipes.reduce((acc, recipe) => {
    acc[recipe.difficulty] = (acc[recipe.difficulty] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const monthlyStats = recipes.reduce((acc, recipe) => {
    const month = new Date(recipe.created_at).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topCuisines = Object.entries(cuisineStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  const recentMonths = Object.entries(monthlyStats)
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .slice(-6);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Recipes</p>
              <p className="text-3xl font-bold text-blue-600">{totalRecipes}</p>
            </div>
            <ChefHat className="h-12 w-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-green-600">{completedRecipes}</p>
            </div>
            <Star className="h-12 w-12 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Cook Time</p>
              <p className="text-3xl font-bold text-orange-600">{avgCookTime}m</p>
            </div>
            <Clock className="h-12 w-12 text-orange-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Success Rate</p>
              <p className="text-3xl font-bold text-purple-600">
                {totalRecipes > 0 ? Math.round((completedRecipes / totalRecipes) * 100) : 0}%
              </p>
            </div>
            <TrendingUp className="h-12 w-12 text-purple-500" />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Cuisines */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center mb-4">
            <BarChart3 className="h-6 w-6 text-blue-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Top Cuisines</h3>
          </div>
          <div className="space-y-3">
            {topCuisines.length > 0 ? topCuisines.map(([cuisine, count]) => (
              <div key={cuisine} className="flex items-center justify-between">
                <span className="text-gray-700">{cuisine}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(count / totalRecipes) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-8">{count}</span>
                </div>
              </div>
            )) : (
              <p className="text-gray-500 text-center py-4">No cuisine data available</p>
            )}
          </div>
        </div>

        {/* Difficulty Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center mb-4">
            <Users className="h-6 w-6 text-green-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Difficulty Levels</h3>
          </div>
          <div className="space-y-3">
            {['easy', 'medium', 'hard'].map(difficulty => {
              const count = difficultyStats[difficulty] || 0;
              const percentage = totalRecipes > 0 ? (count / totalRecipes) * 100 : 0;
              const colors = {
                easy: 'bg-green-500',
                medium: 'bg-yellow-500',
                hard: 'bg-red-500'
              };
              
              return (
                <div key={difficulty} className="flex items-center justify-between">
                  <span className="text-gray-700 capitalize">{difficulty}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`${colors[difficulty as keyof typeof colors]} h-2 rounded-full`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Monthly Activity */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center mb-4">
          <TrendingUp className="h-6 w-6 text-purple-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Recipe Creation Trend</h3>
        </div>
        <div className="flex items-end space-x-2 h-32">
          {recentMonths.length > 0 ? recentMonths.map(([month, count]) => {
            const maxCount = Math.max(...recentMonths.map(([, c]) => c));
            const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
            
            return (
              <div key={month} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-purple-500 rounded-t"
                  style={{ height: `${height}%`, minHeight: count > 0 ? '8px' : '0px' }}
                />
                <div className="text-xs text-gray-600 mt-2 text-center">
                  {month}
                </div>
                <div className="text-xs font-medium text-gray-900">
                  {count}
                </div>
              </div>
            );
          }) : (
            <div className="w-full text-center text-gray-500 py-8">
              No activity data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}