import { Stack } from 'expo-router';

export default function ComplaintsStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="complaints-list" />
      <Stack.Screen name="complaint-details" />
      <Stack.Screen name="select-category" />
      <Stack.Screen name="select-zone" />
      <Stack.Screen name="select-department" />
      <Stack.Screen name="assign-complaint"/>
      <Stack.Screen name="Complaint-searchable-selection"/>
      <Stack.Screen name="Complaint-Search"/>
    </Stack>
  );
}