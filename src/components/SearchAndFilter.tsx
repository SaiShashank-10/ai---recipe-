import React, { useState } from 'react';
import { Search, Filter, X, Clock, Users, ChefHat } from 'lucide-react';
import { Recipe } from '../types';

interface SearchAndFilterProps {
  recipes: Recipe[];
  onFilteredRecipes: (filtered: Recipe[]) => void;
}

export function SearchAndFilter({ recipes, onFilteredRecipes }: SearchAndFilterProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [maxCookTime, setMaxCookTime] = useState('');
  const [minRating, setMinRating] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const cuisines = [...new Set(recipes.map(r => r.cuisine_type).filter(Boolean))];
  const dietaryOptions = [...new Set(recipes.flatMap(r => r.dietary_restrictions || []))];

  const applyFilters = () => {
    let filtered = recipes;

    // Search by title, description, or ingredients
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(recipe => 
        recipe.title.toLowerCase().includes(term) ||
        recipe.description.toLowerCase().includes(term) ||
        recipe.ingredients.some(ing => ing.name.toLowerCase().includes(term))
      );
    }

    // Filter by cuisine
    if (selectedCuisine) {
      filtered = filtered.filter(recipe => recipe.cuisine_type === selectedCuisine);
    }

    // Filter by difficulty
    if (selectedDifficulty) {
      filtered = filtered.filter(recipe => recipe.difficulty === selectedDifficulty);
    }

    // Filter by dietary restrictions
    if (selectedDietary.length > 0) {
      filtered = filtered.filter(recipe => 
        selectedDietary.every(diet => recipe.dietary_restrictions?.includes(diet))
      );
    }

    // Filter by cooking time
    if (maxCookTime) {
      const maxTime = parseInt(maxCookTime);
      filtered = filtered.filter(recipe => 
        (recipe.prep_time + recipe.cook_time) <= maxTime
      );
    }

    onFilteredRecipes(filtered);
  };

  React.useEffect(() => {
    applyFilters();
  }, [searchTerm, selectedCuisine, selectedDifficulty, selectedDietary, maxCookTime, minRating]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCuisine('');
    setSelectedDifficulty('');
    setSelectedDietary([]);
    setMaxCookTime('');
    setMinRating('');
  };

  const toggleDietary = (option: string) => {
    setSelectedDietary(prev => 
      prev.includes(option) 
        ? prev.filter(item => item !== option)
        : [...prev, option]
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      {/* Search Bar */}
      <div className="flex gap-4 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search recipes, ingredients, or descriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center px-4 py-3 rounded-lg border transition-colors ${
            showFilters 
              ? 'bg-orange-500 text-white border-orange-500' 
              : 'bg-white text-gray-700 border-gray-300 hover:border-orange-300'
          }`}
        >
          <Filter className="h-5 w-5 mr-2" />
          Filters
        </button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="border-t pt-4 space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Cuisine Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cuisine</label>
              <select
                value={selectedCuisine}
                onChange={(e) => setSelectedCuisine(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">All Cuisines</option>
                {cuisines.map(cuisine => (
                  <option key={cuisine} value={cuisine}>{cuisine}</option>
                ))}
              </select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">All Levels</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            {/* Max Cook Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="inline h-4 w-4 mr-1" />
                Max Time (min)
              </label>
              <input
                type="number"
                placeholder="e.g., 30"
                value={maxCookTime}
                onChange={(e) => setMaxCookTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <X className="h-4 w-4 mr-2" />
                Clear All
              </button>
            </div>
          </div>

          {/* Dietary Restrictions */}
          {dietaryOptions.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dietary Restrictions</label>
              <div className="flex flex-wrap gap-2">
                {dietaryOptions.map(option => (
                  <button
                    key={option}
                    onClick={() => toggleDietary(option)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedDietary.includes(option)
                        ? 'bg-green-100 text-green-700 border border-green-300'
                        : 'bg-gray-100 text-gray-700 border border-gray-300 hover:border-green-300'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}