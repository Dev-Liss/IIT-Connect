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
import { auth } from "../../firebaseConfig";

export async function getAuthToken() {
  const user = auth.currentUser;
  if (user) {
    return user.getIdToken();
  }
  return null;
}
