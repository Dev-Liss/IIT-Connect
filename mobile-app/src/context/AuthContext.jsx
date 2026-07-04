/**
 * ====================================
 * AUTH CONTEXT - CLERK + MONGODB INTEGRATION
 * ====================================
 * Provides global authentication state for the IIT Connect app.
 *
 * How it works:
 *   1. Clerk manages session tokens (sign-in, sign-out, token refresh)
 *   2. When Firebase confirms a session, we fetch the MongoDB user profile
 *      using the user's Firebase UID → GET /api/auth/profile/:uid
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
// eslint-disable-next-line import/no-unresolved
import { onAuthStateChanged, signOut } from "firebase/auth";
import { API_BASE_URL } from "../config/api";
import { auth } from "../../firebaseConfig";

// ====================================
// CONTEXT CREATION
// ====================================
const AuthContext = createContext(undefined);

const USER_STORAGE_KEY = "@iit_connect_user";

// ====================================
// AUTH PROVIDER
// ====================================
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // MongoDB user profile
  const [isLoading, setIsLoading] = useState(true);

  const loadMongoProfile = useCallback(async (firebaseUser) => {
    setIsLoading(true);
    try {
      const token = await firebaseUser.getIdToken();

      if (token) {
        await AsyncStorage.setItem("authToken", token);
      }

      const response = await fetch(`${API_BASE_URL}/auth/profile/${firebaseUser.uid}`);
      const data = await response.json();

      if (data.success && data.user) {
        const mongoUser = {
          ...data.user,
          token,
        };
        setUser(mongoUser);
        await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(mongoUser));
      } else {
        setUser(null);
      }
    } catch (error) {
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
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await loadMongoProfile(firebaseUser);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });
    return unsubscribe;
  }, [loadMongoProfile]);

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
      await AsyncStorage.removeItem("keepMeSignedIn");
      setUser(null);
      await signOut(auth);
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
