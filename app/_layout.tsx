import 'react-native-gesture-handler';
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
        name="(drawer)"
        options={{
          headerShown: false,
          title: "Dashboard"
        }}
      />
      <Stack.Screen
        name="forgot-password"
        options={{
          headerShown: false,
          title: "Reset Password"
        }}
      />
    </Stack>
  );
}
