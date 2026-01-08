import { Stack } from 'expo-router';

export default function MessagesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="new-chat" />
      <Stack.Screen name="chat" />
      <Stack.Screen name="new-group" />
      <Stack.Screen name="create-group" />
      <Stack.Screen name="new-community" />
    </Stack>
  );
}
