import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
          title: "Login"
        }}
      />
      <Stack.Screen
        name="dashboard"
        options={{
          headerShown: false,
          title: "Dashboard"
        }}
      />
    </Stack>
  );
}
