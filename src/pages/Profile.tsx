import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Lock, Camera, Save, Eye, EyeOff, Shield, Activity } from 'lucide-react';
import { Send, FileText, BarChart3 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useRecipes } from '../hooks/useRecipes';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const profileSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(6, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export function Profile() {
  const { user } = useAuth();
  const { recipes } = useRecipes();
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isSendingReport, setIsSendingReport] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user?.user_metadata?.avatar_url || '');

  const { register: registerProfile, handleSubmit: handleProfileSubmit, formState: { errors: profileErrors } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: user?.user_metadata?.full_name || '',
      email: user?.email || '',
    },
  });

  const { register: registerPassword, handleSubmit: handlePasswordSubmit, formState: { errors: passwordErrors }, reset: resetPassword } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const updateProfile = async (data: ProfileForm) => {
    setIsUpdatingProfile(true);
    try {
      const { error } = await supabase.auth.updateUser({
        email: data.email,
        data: {
          full_name: data.full_name,
        }
      });

      if (error) throw error;

      // Notify S-Hatch team
      await supabase.functions.invoke('notify-team', {
        body: {
          activity_type: 'profile_updated',
          user_email: user?.email,
          user_id: user?.id,
          action: 'Profile Updated',
          changes: {
            full_name: data.full_name,
            email: data.email,
          },
          timestamp: new Date().toISOString()
        }
      });

      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const updatePassword = async (data: PasswordForm) => {
    setIsUpdatingPassword(true);
    try {
      // First verify current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: data.currentPassword,
      });

      if (signInError) {
        throw new Error('Current password is incorrect');
      }

      // Update password
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword
      });

      if (error) throw error;

      // Notify S-Hatch team
      await supabase.functions.invoke('notify-team', {
        body: {
          activity_type: 'password_changed',
          user_email: user?.email,
          user_id: user?.id,
          action: 'Password Changed',
          timestamp: new Date().toISOString()
        }
      });

      toast.success('Password updated successfully!');
      resetPassword();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const sendAdminReport = async () => {
    setIsSendingReport(true);
    try {
      // Generate comprehensive user analytics
      const userAnalytics = {
        user_info: {
          id: user?.id,
          email: user?.email,
          full_name: user?.user_metadata?.full_name,
          created_at: user?.created_at,
          last_sign_in: user?.last_sign_in_at,
        },
        recipe_statistics: {
          total_recipes: recipes.length,
          completed_recipes: recipes.filter(r => r.status === 'completed').length,
          pending_recipes: recipes.filter(r => r.status === 'pending').length,
          processing_recipes: recipes.filter(r => r.status === 'processing').length,
          failed_recipes: recipes.filter(r => r.status === 'failed').length,
          ai_generated_recipes: recipes.filter(r => r.ai_generated_card).length,
        },
        cooking_analytics: {
          average_prep_time: recipes.length > 0 ? Math.round(recipes.reduce((sum, r) => sum + r.prep_time, 0) / recipes.length) : 0,
          average_cook_time: recipes.length > 0 ? Math.round(recipes.reduce((sum, r) => sum + r.cook_time, 0) / recipes.length) : 0,
          total_cooking_time: recipes.reduce((sum, r) => sum + r.prep_time + r.cook_time, 0),
          average_servings: recipes.length > 0 ? Math.round(recipes.reduce((sum, r) => sum + r.servings, 0) / recipes.length) : 0,
        },
        cuisine_breakdown: recipes.reduce((acc, recipe) => {
          if (recipe.cuisine_type) {
            acc[recipe.cuisine_type] = (acc[recipe.cuisine_type] || 0) + 1;
          }
          return acc;
        }, {} as Record<string, number>),
        difficulty_breakdown: recipes.reduce((acc, recipe) => {
          acc[recipe.difficulty] = (acc[recipe.difficulty] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        dietary_preferences: recipes.reduce((acc, recipe) => {
          recipe.dietary_restrictions?.forEach(diet => {
            acc[diet] = (acc[diet] || 0) + 1;
          });
          return acc;
        }, {} as Record<string, number>),
        recent_recipes: recipes.slice(0, 10).map(r => ({
          id: r.id,
          title: r.title,
          status: r.status,
          created_at: r.created_at,
          prep_time: r.prep_time,
          cook_time: r.cook_time,
          servings: r.servings,
          difficulty: r.difficulty,
          cuisine_type: r.cuisine_type,
          dietary_restrictions: r.dietary_restrictions,
        })),
        detailed_recipes: recipes.map(r => ({
          id: r.id,
          title: r.title,
          description: r.description,
          ingredients: r.ingredients,
          instructions: r.instructions,
          prep_time: r.prep_time,
          cook_time: r.cook_time,
          servings: r.servings,
          difficulty: r.difficulty,
          cuisine_type: r.cuisine_type,
          dietary_restrictions: r.dietary_restrictions,
          status: r.status,
          ai_generated_card: r.ai_generated_card,
          created_at: r.created_at,
          updated_at: r.updated_at,
        })),
        platform_usage: {
          account_age_days: user?.created_at ? Math.floor((new Date().getTime() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 0,
          recipes_per_month: recipes.length > 0 ? (recipes.length / Math.max(1, Math.floor((new Date().getTime() - new Date(user?.created_at || new Date()).getTime()) / (1000 * 60 * 60 * 24 * 30)))) : 0,
          most_active_month: recipes.reduce((acc, recipe) => {
            const month = new Date(recipe.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
            acc[month] = (acc[month] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
        }
      };

      // Send comprehensive report to admin
      await supabase.functions.invoke('send-admin-report', {
        body: {
          report_type: 'user_dashboard_export',
          user_email: user?.email,
          user_id: user?.id,
          analytics: userAnalytics,
          timestamp: new Date().toISOString(),
          requested_by: user?.email,
        }
      });

      toast.success('Dashboard report sent to admin successfully!');
    } catch (error: any) {
      console.error('Error sending admin report:', error);
      toast.error('Failed to send report to admin');
    } finally {
      setIsSendingReport(false);
    }
  };

  const generateAvatar = (name: string) => {
    const initials = name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
    
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=f97316&color=ffffff&size=128&font-size=0.6&rounded=true&bold=true`;
  };

  const userStats = {
    joinDate: user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }) : 'Unknown',
    lastSignIn: user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }) : 'Unknown',
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-12">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <img
                src={avatarUrl || generateAvatar(user?.user_metadata?.full_name || user?.email || 'User')}
                alt="Profile"
                className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
              />
              <button className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors">
                <Camera className="h-4 w-4 text-gray-600" />
              </button>
            </div>
            <div className="text-white">
              <h1 className="text-3xl font-bold mb-2">
                {user?.user_metadata?.full_name || 'Recipe Chef'}
              </h1>
              <p className="text-orange-100 mb-4">{user?.email}</p>
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4" />
                  <span>Joined {userStats.joinDate}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>Last active {userStats.lastSignIn}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Profile Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-8"
        >
          <div className="flex items-center mb-6">
            <User className="h-6 w-6 text-orange-500 mr-2" />
            <h2 className="text-2xl font-semibold text-gray-900">Profile Information</h2>
          </div>

          <form onSubmit={handleProfileSubmit(updateProfile)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  {...registerProfile('full_name')}
                  type="text"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  placeholder="Enter your full name"
                />
              </div>
              {profileErrors.full_name && (
                <p className="text-red-500 text-sm mt-1">{profileErrors.full_name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  {...registerProfile('email')}
                  type="email"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  placeholder="Enter your email"
                />
              </div>
              {profileErrors.email && (
                <p className="text-red-500 text-sm mt-1">{profileErrors.email.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 focus:ring-4 focus:ring-orange-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isUpdatingProfile ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
              ) : (
                <Save className="h-5 w-5 mr-2" />
              )}
              {isUpdatingProfile ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
        </motion.div>

        {/* Change Password */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-8"
        >
          <div className="flex items-center mb-6">
            <Lock className="h-6 w-6 text-orange-500 mr-2" />
            <h2 className="text-2xl font-semibold text-gray-900">Change Password</h2>
          </div>

          <form onSubmit={handlePasswordSubmit(updatePassword)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  {...registerPassword('currentPassword')}
                  type={showCurrentPassword ? 'text' : 'password'}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {passwordErrors.currentPassword && (
                <p className="text-red-500 text-sm mt-1">{passwordErrors.currentPassword.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  {...registerPassword('newPassword')}
                  type={showNewPassword ? 'text' : 'password'}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {passwordErrors.newPassword && (
                <p className="text-red-500 text-sm mt-1">{passwordErrors.newPassword.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  {...registerPassword('confirmPassword')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {passwordErrors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{passwordErrors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isUpdatingPassword}
              className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 focus:ring-4 focus:ring-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isUpdatingPassword ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
              ) : (
                <Shield className="h-5 w-5 mr-2" />
              )}
              {isUpdatingPassword ? 'Updating...' : 'Change Password'}
            </button>
          </form>
        </motion.div>
      </div>

      {/* Admin Report Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl shadow-lg p-8"
      >
        <div className="flex items-center mb-6">
          <Send className="h-6 w-6 text-blue-500 mr-2" />
          <h2 className="text-2xl font-semibold text-gray-900">Admin Dashboard Report</h2>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-6 mb-6">
          <div className="flex items-start space-x-4">
            <div className="bg-blue-100 rounded-full p-3">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Send Complete Dashboard Report
              </h3>
              <p className="text-blue-700 mb-4">
                Export and send your complete dashboard data, analytics, and recipe details to the admin team. 
                This includes all your recipes, cooking statistics, preferences, and platform usage data.
              </p>
              
              <div className="grid md:grid-cols-3 gap-4 mb-4 text-sm">
                <div className="bg-white rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-gray-900">Analytics</span>
                  </div>
                  <p className="text-gray-600 mt-1">Cooking stats & trends</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-purple-600" />
                    <span className="font-medium text-gray-900">Recipes</span>
                  </div>
                  <p className="text-gray-600 mt-1">All recipe details</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-orange-600" />
                    <span className="font-medium text-gray-900">Usage Data</span>
                  </div>
                  <p className="text-gray-600 mt-1">Platform activity</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={sendAdminReport}
          disabled={isSendingReport}
          className="w-full bg-blue-500 text-white py-4 rounded-lg font-semibold hover:bg-blue-600 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          {isSendingReport ? (
            <>
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
              Sending Report to Admin...
            </>
          ) : (
            <>
              <Send className="h-5 w-5 mr-2" />
              Send Dashboard Report to Admin
            </>
          )}
        </button>
        
        <p className="text-center text-sm text-gray-600 mt-3">
          Report will be sent to: <strong>shashankvakkalanka@gmail.com</strong>
        </p>
      </motion.div>

      {/* Account Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-lg p-8"
      >
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Account Statistics</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600 mb-2">0</div>
            <div className="text-sm text-gray-600">Recipes Created</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-2">0</div>
            <div className="text-sm text-gray-600">PDFs Generated</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-2">0</div>
            <div className="text-sm text-gray-600">AI Recipes</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 mb-2">0</div>
            <div className="text-sm text-gray-600">Days Active</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}