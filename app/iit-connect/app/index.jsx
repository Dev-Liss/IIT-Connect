import { Redirect } from 'expo-router';

export default function Index() {
  // TODO: Check if user is authenticated
  const isAuthenticated = false;

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/welcome" />;
}
