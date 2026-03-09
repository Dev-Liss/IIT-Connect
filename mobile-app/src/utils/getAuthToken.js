/**
 * getAuthToken — returns a valid Clerk session token for API requests.
 *
 * Clerk tokens are short-lived (~1 hour). This helper reads the cached token
 * from AsyncStorage. The AuthContext refreshes this value every time the Clerk
 * session state changes, so it is always reasonably fresh for in-session calls.
 *
 * Usage (replaces `await AsyncStorage.getItem('authToken')`):
 *   import { getAuthToken } from '../utils/getAuthToken';
 *   const token = await getAuthToken();
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

export async function getAuthToken() {
  try {
    // Prefer the Clerk JWT stored directly in SecureStore by the token cache
    // Key pattern used by @clerk/clerk-expo SecureStore token cache:
    const clerkKey = "__clerk_client_jwt";
    const secureToken = await SecureStore.getItemAsync(clerkKey);
    if (secureToken) return secureToken;
  } catch {
    // SecureStore not available (e.g. web or emulator) — fall through
  }

  // Fallback: use the token written by AuthContext on every sign-in
  return AsyncStorage.getItem("authToken");
}
