import 'react-native-gesture-handler';
import { Stack } from "expo-router";
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '../src/store';
import { ActivityIndicator, View } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

function Loading() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <PersistGate
        loading={<Loading />}
        persistor={persistor}
        onBeforeLift={async () => {
          try {
            const state = store.getState();
            const user = state.auth?.user;

            // Debug: log persisted store and auth state to help diagnose rehydration issues
            console.log('onBeforeLift - store.auth.user:', user);
            try {
              const raw = await AsyncStorage.getItem('@persist:root');
              console.log('onBeforeLift - @persist:root:', raw);
            } catch (e) {
              console.log('onBeforeLift - failed to read @persist:root', e);
            }

            // Only navigate if user exists in redux state; otherwise try to read persisted auth inside AsyncStorage
            if (user) {
              router.replace('/(drawer)/(tabs)/dashboard');
              return;
            }

            // Fallback: try to parse persisted payload for auth
            try {
              const raw = await AsyncStorage.getItem('@persist:root');
              if (raw) {
                const parsed = JSON.parse(raw);
                // parsed.auth is a serialized string; parse it
                const authStr = parsed.auth;
                if (authStr) {
                  const auth = JSON.parse(authStr);
                  if (auth.user) {
                    console.log('onBeforeLift - found user in persisted auth:', auth.user);
                    router.replace('/(drawer)/(tabs)/dashboard');
                    return;
                  }
                }
              }
            } catch (e) {
              console.log('onBeforeLift - error parsing persisted auth', e);
            }

            // Default to login
            router.replace('/');
          } catch (e) {
            console.log('onBeforeLift - unexpected error', e);
            router.replace('/');
          }
        }}
      >
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen
            name="index"
            options={{
              headerShown: false,
              title: 'Login',
            }}
          />
          <Stack.Screen
            name="(drawer)"
            options={{
              headerShown: false,
              title: 'Dashboard',
            }}
          />
          <Stack.Screen
            name="forgot-password"
            options={{
              headerShown: false,
              title: 'Reset Password',
            }}
          />
        </Stack>
      </PersistGate>
    </Provider>
  );
}
