import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        if (error.message === 'User already registered') {
          throw new Error('An account with this email already exists. Please try logging in instead.');
        }
        throw new Error(error.message);
      }
      return data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create account');
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message === 'Invalid login credentials') {
          throw new Error('Invalid email or password. Please check your credentials and try again.');
        }
        throw new Error(error.message);
      }
      
      // Notify S-Hatch team of login
      await supabase.functions.invoke('notify-team', {
        body: {
          activity_type: 'user_login',
          user_email: email,
          user_id: data.user?.id,
          action: 'User Login',
          timestamp: new Date().toISOString()
        }
      });
      
      return data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign in');
    }
  };

  const signOut = async () => {
    const currentUser = user;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    // Notify S-Hatch team of logout
    if (currentUser) {
      await supabase.functions.invoke('notify-team', {
        body: {
          activity_type: 'user_logout',
          user_email: currentUser.email,
          user_id: currentUser.id,
          action: 'User Logout',
          timestamp: new Date().toISOString()
        }
      });
    }
  };

  return {
    user,
    loading,
    signUp,
    signIn,
    signOut,
  };
}