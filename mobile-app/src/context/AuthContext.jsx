/**
 * ====================================
 * AUTH CONTEXT - CLERK + MONGODB INTEGRATION
 * ====================================
 * Provides global authentication state for the IIT Connect app.
 *
 * How it works:
 *   1. Clerk manages session tokens (sign-in, sign-out, token refresh)
 *   2. When Clerk confirms isSignedIn, we fetch the MongoDB user profile
 *      using the user's Clerk ID → GET /api/auth/profile/:clerkId
 *   3. We store the fresh Clerk session token as 'authToken' in AsyncStorage
 *      so all existing screens (messages, kuppi, upload, etc.) can read it
 *      without any changes.
 *
 * Exposed interface (UNCHANGED — all existing screens keep working):
 *   user        — MongoDB user object with _id, username, email, role, etc.
 *   isLoading   — true while fetching profile after sign-in
 *   login(data) — manually inject user data (kept for backward compat)
 *   logout()    — clears Clerk session + AsyncStorage
 *   updateUser(updates) — patch user object in memory + storage
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth as useClerkAuth, useUser } from "@clerk/clerk-expo";
import { API_BASE_URL } from "../config/api";

// ====================================
// CONTEXT CREATION
// ====================================
const AuthContext = createContext(undefined);

const USER_STORAGE_KEY = "@iit_connect_user";

// ====================================
// AUTH PROVIDER
// ====================================
export function AuthProvider({ children }) {
  const { isSignedIn, isLoaded, signOut, getToken } = useClerkAuth();
  const { user: clerkUser } = useUser();

  const [user, setUser] = useState(null);        // MongoDB user profile
  const [isLoading, setIsLoading] = useState(true);

  // ====================================
  // LOAD PROFILE WHEN CLERK SIGNS IN
  // ====================================
  useEffect(() => {
    if (!isLoaded) return;  // Wait until Clerk has resolved

    if (isSignedIn && clerkUser) {
      loadMongoProfile();
    } else {
      // Signed out — clear everything
      setUser(null);
      setIsLoading(false);
    }
  }, [isLoaded, isSignedIn, clerkUser?.id]);

  /**
   * Fetch the MongoDB profile for the currently signed-in Clerk user.
   * Also writes a fresh Clerk session token to AsyncStorage as 'authToken'
   * so all protected API calls throughout the app continue to work.
   */
  const loadMongoProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      // Get a fresh Clerk session token
      const token = await getToken();

      if (token) {
        // Store as 'authToken' — this is what messages, kuppi, upload screens read
        await AsyncStorage.setItem("authToken", token);
      }

      // Fetch MongoDB profile by Clerk ID
      const response = await fetch(
        `${API_BASE_URL}/auth/profile/${clerkUser.id}`
      );
      const data = await response.json();

      if (data.success && data.user) {
        const mongoUser = {
          ...data.user,
          token, // also keep token on the user object for convenience
        };
        setUser(mongoUser);
        await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(mongoUser));
        console.log("User profile loaded:", mongoUser.username);
      } else {
        // Profile not synced yet (e.g. mid-registration) — not a hard error
        console.log("MongoDB profile not found for Clerk user:", clerkUser.id);
        setUser(null);
      }
    } catch (error) {
      console.log("Profile load error:", error.message);
      // Try restoring from cache as fallback
      try {
        const cached = await AsyncStorage.getItem(USER_STORAGE_KEY);
        if (cached) {
          setUser(JSON.parse(cached));
        }
      } catch {
        // ignore cache error
      }
    } finally {
      setIsLoading(false);
    }
  }, [clerkUser?.id, getToken]);

  // ====================================
  // LOGIN — backward-compatible manual injection
  // ====================================
  /**
   * Manually inject user data into context.
   * Used for backward compatibility — Clerk sign-in normally triggers
   * the useEffect above, but this can be called from screens that
   * need to explicitly update the cached profile.
   */
  const login = async (userData) => {
    try {
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error("Failed to save user data:", error);
      throw error;
    }
  };

  // ====================================
  // UPDATE USER
  // ====================================
  const updateUser = async (updates) => {
    try {
      const updatedUser = { ...user, ...updates };
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.error("Failed to update user data:", error);
    }
  };

  // ====================================
  // LOGOUT
  // ====================================
  const logout = async () => {
    try {
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
      await AsyncStorage.removeItem("authToken");
      setUser(null);
      // Sign out from Clerk — this clears the Clerk session and SecureStore cache
      await signOut();
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  // ====================================
  // CONTEXT VALUE — same interface as before
  // ====================================
  const value = {
    user,
    isLoading,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ====================================
// CUSTOM HOOK
// ====================================
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;
