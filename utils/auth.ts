import { supabase } from './supabase';
import { router } from 'expo-router';

/**
 * Logs the user out and redirects to the login screen
 */
export async function logout() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    // Navigate to login screen
    router.replace('/auth/login');
  } catch (error) {
    console.error('Error signing out:', error);
    // Force navigation even if there was an error
    router.replace('/auth/login');
  }
}

/**
 * Gets the current user's profile data
 */
export async function getUserProfile() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;
    
    // If we have a user, get their profile from the profiles table
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (error) {
      // If profile doesn't exist yet, return basic user info
      return {
        id: user.id,
        email: user.email,
        username: user.user_metadata?.username || 'User',
        created_at: user.created_at,
      };
    }
    
    return data;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
} 