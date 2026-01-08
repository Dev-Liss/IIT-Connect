import { Stack } from 'expo-router';

export default function ContentLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="create-post" />
      <Stack.Screen name="create-reel" />
      <Stack.Screen name="create-event" />
      <Stack.Screen name="create-announcement" />
    </Stack>
  );
}
