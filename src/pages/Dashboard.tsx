import React from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Clock, CheckCircle, AlertCircle, FileText, Download, Eye, Trash2, ShoppingCart, BarChart3 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useRecipes } from '../hooks/useRecipes';
import { motion } from 'framer-motion';
import { RecipeCard } from '../components/RecipeCard';
import { SearchAndFilter } from '../components/SearchAndFilter';
import { ShoppingList } from '../components/ShoppingList';
import { AnalyticsDashboard } from '../components/AnalyticsDashboard';
import { downloadRecipePDF } from '../utils/pdfGenerator';
import toast from 'react-hot-toast';

export function Dashboard() {
  const { user } = useAuth();
  const { recipes, loading, deleteRecipe, refetch } = useRecipes();
  const [selectedRecipe, setSelectedRecipe] = React.useState<string | null>(null);
  const [deletingRecipe, setDeletingRecipe] = React.useState<string | null>(null);
  const [filteredRecipes, setFilteredRecipes] = React.useState<typeof recipes>([]);
  const [showShoppingList, setShowShoppingList] = React.useState(false);
  const [showAnalytics, setShowAnalytics] = React.useState(false);
  const [selectedRecipesForShopping, setSelectedRecipesForShopping] = React.useState<string[]>([]);

  React.useEffect(() => {
    setFilteredRecipes(recipes);
  }, [recipes]);
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'processing':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'processing':
        return 'Processing';
      case 'failed':
        return 'Failed';
      default:
        return 'Pending';
    }
  };

  const handleViewPDF = (recipe: any) => {
    setSelectedRecipe(recipe.id);
  };

  const handleDownloadPDF = async (recipe: any) => {
    try {
      toast.loading('Generating PDF...', { id: 'pdf-generation' });
      await downloadRecipePDF(recipe);
      toast.success('PDF downloaded successfully!', { id: 'pdf-generation' });
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete recipe. Please try again.');
      toast.error('Failed to generate PDF', { id: 'pdf-generation' });
    }
  };

  const handleDeleteRecipe = async (recipeId: string, recipeTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${recipeTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingRecipe(recipeId);
      await deleteRecipe(recipeId);
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete recipe. Please try again.');
    } finally {
      setDeletingRecipe(null);
    }
  };

  const toggleRecipeForShopping = (recipeId: string) => {
    setSelectedRecipesForShopping(prev => 
      prev.includes(recipeId) 
        ? prev.filter(id => id !== recipeId)
        : [...prev, recipeId]
    );
  };

  const generateShoppingList = () => {
    const selectedRecipes = recipes.filter(r => selectedRecipesForShopping.includes(r.id));
    if (selectedRecipes.length === 0) {
      toast.error('Please select at least one recipe for the shopping list');
      return;
    }
    setShowShoppingList(true);
  };
  const selectedRecipeData = selectedRecipe ? recipes.find(r => r.id === selectedRecipe) : null;
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative">
      {/* Welcome Section */}
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back!
            </h1>
            <p className="text-gray-600">
              You've submitted {recipes.length} recipes so far. Ready to create another masterpiece?
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            >
              <BarChart3 className="h-5 w-5 mr-2" />
              Analytics
            </button>
            <button
              onClick={generateShoppingList}
              className="flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              Shopping List ({selectedRecipesForShopping.length})
            </button>
            <Link
              to="/submit"
              className="flex items-center px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors shadow-sm"
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              New Recipe
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Recipes</p>
              <p className="text-2xl font-bold text-gray-900">{recipes.length}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-500">
                {recipes.filter(r => r.status === 'completed').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Processing</p>
              <p className="text-2xl font-bold text-yellow-500">
                {recipes.filter(r => r.status === 'processing').length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-500">
                {recipes.filter(r => r.status === 'pending').length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-gray-500" />
          </div>
        </div>
      </div>

      {/* Analytics Dashboard */}
      {showAnalytics && (
        <div className="mb-8">
          <AnalyticsDashboard recipes={recipes} />
        </div>
      )}

      {/* Search and Filter */}
      {recipes.length > 0 && (
        <SearchAndFilter 
          recipes={recipes} 
          onFilteredRecipes={setFilteredRecipes}
        />
      )}

      {/* Recipe History */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="px-8 py-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Recipe History ({filteredRecipes.length})
            </h2>
            {selectedRecipesForShopping.length > 0 && (
              <button
                onClick={() => setSelectedRecipesForShopping([])}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear Selection
              </button>
            )}
          </div>
        </div>

        {filteredRecipes.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {recipes.length === 0 ? 'No recipes yet' : 'No recipes match your filters'}
            </h3>
            <p className="text-gray-600 mb-6">
              {recipes.length === 0 
                ? 'Get started by submitting your first recipe!' 
                : 'Try adjusting your search or filter criteria.'
              }
            </p>
            <Link
              to="/submit"
              className="inline-flex items-center px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              Submit Recipe
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredRecipes.map((recipe, index) => (
              <motion.div
                key={recipe.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="px-8 py-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center mr-4">
                    <input
                      type="checkbox"
                      checked={selectedRecipesForShopping.includes(recipe.id)}
                      onChange={() => toggleRecipeForShopping(recipe.id)}
                      className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      {recipe.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                      {recipe.description}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{recipe.servings} servings</span>
                      <span>{recipe.prep_time + recipe.cook_time} mins total</span>
                      <span className="capitalize">{recipe.difficulty}</span>
                      <span>{new Date(recipe.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(recipe.status)}
                      <span className="text-sm font-medium">
                        {getStatusText(recipe.status)}
                      </span>
                    </div>
                    {recipe.pdf_url && (
                      <a
                        href={recipe.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                      >
                        View PDF
                      </a>
                    )}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewPDF(recipe)}
                        className="flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </button>
                      <button
                        onClick={() => handleDownloadPDF(recipe)}
                        className="flex items-center px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        PDF
                      </button>
                      <button
                        onClick={() => handleDeleteRecipe(recipe.id, recipe.title)}
                        disabled={deletingRecipe === recipe.id}
                        className="flex items-center px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deletingRecipe === recipe.id ? (
                          <div className="h-4 w-4 mr-1 animate-spin rounded-full border-2 border-red-700 border-t-transparent"></div>
                        ) : (
                          <Trash2 className="h-4 w-4 mr-1" />
                        )}
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Shopping List Modal */}
      {showShoppingList && (
        <ShoppingList
          recipes={recipes.filter(r => selectedRecipesForShopping.includes(r.id))}
          onClose={() => setShowShoppingList(false)}
        />
      )}

      {/* Recipe Preview Modal */}
      {selectedRecipe && selectedRecipeData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setSelectedRecipe(null)}
              className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <RecipeCard recipe={selectedRecipeData} className="shadow-none" />
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => handleDownloadPDF(selectedRecipeData)}
                  className="flex items-center px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Download PDF
                </button>
                <button
                  onClick={() => setSelectedRecipe(null)}
                  className="flex items-center px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}