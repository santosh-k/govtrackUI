import { Stack } from 'expo-router';

export default function ComplaintsStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="complaints-list" />
      <Stack.Screen name="complaint-details" />
    </Stack>
  );
}