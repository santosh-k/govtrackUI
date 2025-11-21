import 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { Provider, useDispatch } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '../src/store';
import { ActivityIndicator, View } from 'react-native';
import { router } from 'expo-router';
import { AuthProvider, AuthContext } from '../src/contexts/AuthContext';
import { useContext, useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import crashlytics from "@react-native-firebase/crashlytics";

// 🔥 Firebase Messaging
import messaging from "@react-native-firebase/messaging";
import { 
  requestUserPermission, 
  getFcmToken,
  foregroundMessageListener,
  setupTokenRefreshListener,
  displayNotification,
} from "../src/services/notifications";

// -------------------------------------------------------------
// 🔥 GLOBAL CRASHLYTICS ERROR HANDLER
// -------------------------------------------------------------
ErrorUtils.setGlobalHandler((error, isFatal) => {
  crashlytics().recordError(error);
  if (isFatal) {
    console.log("Fatal JS Error:", error);
    // Optional: show custom crash UI
  }
});

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
  // 🔥 FIREBASE MESSAGING INITIALIZATION
  useEffect(() => {
    async function initFCM() {
      console.log('🔥 Initializing FCM...');
      
      // Step 1: Request permissions
      const hasPermission = await requestUserPermission();
      if (hasPermission) {
        // Step 2: Get and send FCM token to backend
        await getFcmToken();
        
        // Step 3: Listen for token refreshes
        const unsubscribeTokenRefresh = setupTokenRefreshListener();
        
        // Step 4: Listen for foreground messages
        const unsubscribeForeground = foregroundMessageListener();
        
        // Step 5: Handle background messages
        messaging().setBackgroundMessageHandler(
          async remoteMessage => {
            console.log('📱 Background Message Received:', remoteMessage);
            // Display notification even when app is backgrounded
            await displayNotification(remoteMessage);
          }
        );
        
        // Cleanup function
        return () => {
          unsubscribeForeground?.();
          unsubscribeTokenRefresh?.();
        };
      } else {
        console.warn('⚠️ Notification permission not granted');
      }
    }

    const cleanup = initFCM();
    return () => {
      cleanup?.then(fn => fn?.());
    };
  }, []);

  return (
    <SafeAreaProvider>
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
    </SafeAreaProvider>
    
  );
}
