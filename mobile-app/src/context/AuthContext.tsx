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
 * - Persist session using AsyncStorage (optional)
 * - TypeScript types for User object
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ====================================
// TYPE DEFINITIONS
// ====================================

/**
 * User object structure
 * Matches the backend API response (auth routes return 'id', not '_id')
 */
export interface User {
  id: string;
  username: string;
  email: string;
  studentId?: string;
  role?: string;
  profilePicture?: string;
  bio?: string;
  createdAt?: string;
}

/**
 * Auth Context value type
 */
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (userData: User) => Promise<void>;
  logout: () => Promise<void>;
}

// ====================================
// CONTEXT CREATION
// ====================================

// Create context with undefined default
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Storage key for persisting user data
const USER_STORAGE_KEY = "@iit_connect_user";

// ====================================
// AUTH PROVIDER COMPONENT
// ====================================

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // State
  const [user, setUser] = useState<User | null>(null);
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
        const userData: User = JSON.parse(storedUser);
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
  const login = async (userData: User) => {
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
  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
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
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Export default for convenience
export default AuthContext;
