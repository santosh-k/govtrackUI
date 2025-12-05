import { Stack } from 'expo-router';

export default function SearchStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="complaint-search" />
      <Stack.Screen name='complaint-searchable-selection'/>
    </Stack>
  );
}