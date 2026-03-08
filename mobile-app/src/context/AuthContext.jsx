/**
 * ====================================
 * AUTH CONTEXT - USER SESSION MANAGEMENT
 * ====================================
 * Provides global authentication state management
 * for the IIT Connect mobile app.
 *
 * Features:
 * - Store logged-in user data globally
 * - Provide login/logout functions
 * - Persist session using AsyncStorage
 */

import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ====================================
// CONTEXT CREATION
// ====================================

// Create context with undefined default
const AuthContext = createContext(undefined);

// Storage key for persisting user data
const USER_STORAGE_KEY = "@iit_connect_user";

// ====================================
// AUTH PROVIDER COMPONENT
// ====================================

export function AuthProvider({ children }) {
  // State
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // ====================================
  // LOAD USER ON APP LAUNCH
  // ====================================
  useEffect(() => {
    loadStoredUser();
  }, []);

  /**
   * Load user data from AsyncStorage on app launch
   * This maintains login state between app sessions
   */
  const loadStoredUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        console.log("✅ User session restored:", userData.username);
      }
    } catch (error) {
      console.error("❌ Failed to load stored user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ====================================
  // LOGIN FUNCTION
  // ====================================
  /**
   * Login user - saves to state and AsyncStorage
   * @param userData - User object from API response
   */
  const login = async (userData) => {
    try {
      // Save to AsyncStorage for persistence
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
      // Update state
      setUser(userData);
      console.log("✅ User logged in:", userData.username);
    } catch (error) {
      console.error("❌ Failed to save user data:", error);
      throw error;
    }
  };

  // ====================================
  // UPDATE USER FUNCTION
  // ====================================
  /**
   * Update current user data and persist to storage
   */
  const updateUser = async (updates) => {
    try {
      const updatedUser = { ...user, ...updates };
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.error("❌ Failed to update user data:", error);
    }
  };

  // ====================================
  // LOGOUT FUNCTION
  // ====================================
  /**
   * Logout user - clears state and AsyncStorage
   */
  const logout = async () => {
    try {
      // Remove from AsyncStorage
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
      // Clear state
      setUser(null);
      console.log("👋 User logged out");
    } catch (error) {
      console.error("❌ Failed to logout:", error);
      throw error;
    }
  };

  // ====================================
  // CONTEXT VALUE
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
// CUSTOM HOOK - useAuth
// ====================================
/**
 * Custom hook to access auth context
 * Throws error if used outside AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Export default for convenience
export default AuthContext;
