import 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { Provider, useDispatch } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '../src/store';
import { ActivityIndicator, View } from 'react-native';
import { router } from 'expo-router';
import { AuthProvider, AuthContext } from '../src/contexts/AuthContext';
import { useContext, useEffect } from 'react';

function Loading() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}

/**
 * Handles automatic navigation based on AuthContext.userToken
 */
function AuthHandler({ children }: { children: React.ReactNode }) {
  const { userToken, loading } = useContext(AuthContext);

  useEffect(() => {
    if (!loading) {
      if (userToken) {
        router.replace('/(drawer)/(tabs)/dashboard');
      } else {
        router.replace('/');
      }
    }
  }, [loading, userToken]);

  if (loading) return <Loading />;

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <PersistGate loading={<Loading />} persistor={persistor}>
        <AuthProvider>
          <AuthHandler>
            <Stack screenOptions={{ headerShown: false }}>
              {/* Login Screen */}
              <Stack.Screen
                name="index"
                options={{ headerShown: false, title: 'Login' }}
              />

              {/* Dashboard / Drawer */}
              <Stack.Screen
                name="(drawer)"
                options={{ headerShown: false, title: 'Dashboard' }}
              />

              {/* Forgot Password */}
              <Stack.Screen
                name="forgot-password"
                options={{ headerShown: false, title: 'Reset Password' }}
              />
            </Stack>
          </AuthHandler>
        </AuthProvider>
      </PersistGate>
    </Provider>
  );
}
