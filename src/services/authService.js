
import { supabase } from "./supabase";

// Register a new user
export const signUp = async (name, email, password) => {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: {
      data: {
        full_name: name.trim(),
      },
    },
  });

  if (error) throw error;

  return data;
};

// Login
export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  if (error) throw error;

  return data;
};

// Logout
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();

  if (error) throw error;
};

// Get current user
export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();

  if (error) throw error;

  return data.user;
};

// Update profile name
export const updateProfile = async (name) => {
  const { data, error } = await supabase.auth.updateUser({
    data: {
      full_name: name.trim(),
    },
  });

  if (error) throw error;

  return data.user;
};
