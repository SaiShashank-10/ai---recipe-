import React from 'react';
import { Link } from 'react-router-dom';
import { ChefHat, Sparkles, Mail, Users } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export function Home() {
  const { user } = useAuth();

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center mb-8">
            <ChefHat className="h-20 w-20 text-orange-500" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Transform Your Recipes with AI
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Submit your recipes and let our AI create beautiful, professional recipe cards.
            Get instant PDFs delivered to your inbox and track all your culinary creations.
          </p>
          {user ? (
            <Link
              to="/ai-generator"
              className="inline-flex items-center px-8 py-4 bg-orange-500 text-white text-lg font-semibold rounded-xl hover:bg-orange-600 transition-colors shadow-lg hover:shadow-xl"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              Generate Recipe with AI
            </Link>
          ) : (
            <div className="space-x-4">
              <Link
                to="/signup"
                className="inline-flex items-center px-8 py-4 bg-orange-500 text-white text-lg font-semibold rounded-xl hover:bg-orange-600 transition-colors shadow-lg hover:shadow-xl"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center px-8 py-4 bg-white text-orange-500 text-lg font-semibold rounded-xl border-2 border-orange-500 hover:bg-orange-50 transition-colors"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Everything You Need for Recipe Management
          </h2>
          <p className="text-lg text-gray-600">
            Our platform combines AI technology with beautiful design to enhance your recipes.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-orange-100 rounded-full p-3 w-12 h-12 mx-auto mb-4">
              <Sparkles className="h-6 w-6 text-orange-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Recipe Generation</h3>
            <p className="text-gray-600 text-sm">
              Describe any dish and our AI creates complete recipes with ingredients and instructions.
            </p>
          </div>

          <div className="text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-green-100 rounded-full p-3 w-12 h-12 mx-auto mb-4">
              <Mail className="h-6 w-6 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">PDF Delivery</h3>
            <p className="text-gray-600 text-sm">
              Receive professionally formatted PDF recipe cards delivered to your inbox.
            </p>
          </div>

          <div className="text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-blue-100 rounded-full p-3 w-12 h-12 mx-auto mb-4">
              <Users className="h-6 w-6 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Team Notifications</h3>
            <p className="text-gray-600 text-sm">
              The S-Hatch team is notified of all activities to ensure quality service.
            </p>
          </div>

          <div className="text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-purple-100 rounded-full p-3 w-12 h-12 mx-auto mb-4">
              <ChefHat className="h-6 w-6 text-purple-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Recipe Dashboard</h3>
            <p className="text-gray-600 text-sm">
              Track all your submissions with a comprehensive dashboard and history.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}