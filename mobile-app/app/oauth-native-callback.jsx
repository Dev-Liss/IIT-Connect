import React from "react";
import * as WebBrowser from "expo-web-browser";

// Must be called in the callback route so the OAuth redirect can be processed
// when the app resumes from the browser (release APK behaviour can differ).
WebBrowser.maybeCompleteAuthSession();

export default function OAuthCallback() {
  // Do not navigate away here.
  // Clerk's `startOAuthFlow()` promise is resolved after completing the session.
  // Navigation should happen from the original screen that started the OAuth flow.
  return null;
}
