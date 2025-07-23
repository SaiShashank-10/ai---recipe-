import React, { useState } from 'react';
import { ShoppingCart, Plus, Minus, Check, X, Download } from 'lucide-react';
import { Recipe, Ingredient } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface ShoppingListProps {
  recipes: Recipe[];
  onClose: () => void;
}

interface ShoppingItem extends Ingredient {
  id: string;
  recipeTitle: string;
  checked: boolean;
}

export function ShoppingList({ recipes, onClose }: ShoppingListProps) {
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>(() => {
    const items: ShoppingItem[] = [];
    recipes.forEach(recipe => {
      recipe.ingredients.forEach((ingredient, index) => {
        items.push({
          ...ingredient,
          id: `${recipe.id}-${index}`,
          recipeTitle: recipe.title,
          checked: false
        });
      });
    });
    return items;
  });

  const [groupByRecipe, setGroupByRecipe] = useState(true);

  const toggleItem = (id: string) => {
    setShoppingItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const removeItem = (id: string) => {
    setShoppingItems(prev => prev.filter(item => item.id !== id));
  };

  const clearChecked = () => {
    setShoppingItems(prev => prev.filter(item => !item.checked));
  };

  const downloadList = () => {
    const listText = shoppingItems
      .filter(item => !item.checked)
      .map(item => `${item.amount} ${item.unit} ${item.name} (${item.recipeTitle})`)
      .join('\n');
    
    const blob = new Blob([listText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shopping-list.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const groupedItems = groupByRecipe 
    ? recipes.reduce((acc, recipe) => {
        acc[recipe.title] = shoppingItems.filter(item => item.recipeTitle === recipe.title);
        return acc;
      }, {} as Record<string, ShoppingItem[]>)
    : { 'All Items': shoppingItems };

  const totalItems = shoppingItems.length;
  const checkedItems = shoppingItems.filter(item => item.checked).length;
  const progress = totalItems > 0 ? (checkedItems / totalItems) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <ShoppingCart className="h-8 w-8" />
              <h2 className="text-2xl font-bold">Shopping List</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span>{checkedItems} of {totalItems} items</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setGroupByRecipe(!groupByRecipe)}
                className="text-sm bg-white/20 px-3 py-1 rounded-full hover:bg-white/30 transition-colors"
              >
                {groupByRecipe ? 'Group by Recipe' : 'Show All'}
              </button>
              {checkedItems > 0 && (
                <button
                  onClick={clearChecked}
                  className="text-sm bg-white/20 px-3 py-1 rounded-full hover:bg-white/30 transition-colors"
                >
                  Clear Checked
                </button>
              )}
            </div>
            <button
              onClick={downloadList}
              className="flex items-center space-x-2 bg-white/20 px-3 py-1 rounded-full hover:bg-white/30 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span className="text-sm">Download</span>
            </button>
          </div>
        </div>

        {/* Shopping Items */}
        <div className="p-6 overflow-y-auto max-h-96">
          {Object.entries(groupedItems).map(([groupName, items]) => (
            <div key={groupName} className="mb-6 last:mb-0">
              {groupByRecipe && (
                <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">
                  {groupName}
                </h3>
              )}
              <div className="space-y-2">
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                        item.checked 
                          ? 'bg-green-50 border-green-200 text-green-700' 
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => toggleItem(item.id)}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                            item.checked
                              ? 'bg-green-500 border-green-500 text-white'
                              : 'border-gray-300 hover:border-green-400'
                          }`}
                        >
                          {item.checked && <Check className="h-3 w-3" />}
                        </button>
                        <div className={item.checked ? 'line-through' : ''}>
                          <span className="font-medium">
                            {item.amount} {item.unit}
                          </span>
                          <span className="ml-2">{item.name}</span>
                          {groupByRecipe && (
                            <span className="text-sm text-gray-500 ml-2">
                              ({item.recipeTitle})
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">
              {recipes.length} recipe{recipes.length !== 1 ? 's' : ''} selected
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}