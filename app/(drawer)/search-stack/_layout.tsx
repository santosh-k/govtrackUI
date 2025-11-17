import { Stack } from 'expo-router';

export default function SearchStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Complaint-search"/>
    </Stack>
  );
}