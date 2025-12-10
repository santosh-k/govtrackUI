import messaging from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';
import { Platform, PermissionsAndroid } from 'react-native';

// Module-level storage for the current FCM token so other modules can read it
let currentFcmToken = null;

/**
 * ✅ Configure notification handler for how notifications appear
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * ✅ Step 1: Request User Permission for Notifications
 */
export async function requestUserPermission() {
  try {
    // For Android 13+, request POST_NOTIFICATIONS permission
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const status = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        {
          title: 'Notification Permission',
          message: 'App needs permission to send notifications',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      if (status !== PermissionsAndroid.RESULTS.GRANTED) {
        console.warn('POST_NOTIFICATIONS permission denied');
        return false;
      }
    }

    // Request Firebase messaging permission
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('✅ Notification permissions granted:', authStatus);
    }
    return enabled;
  } catch (error) {
    console.error('❌ Error requesting notification permission:', error);
    return false;
  }
}

/**
 * ✅ Step 2: Get FCM Token and Send to Backend
 */
export async function getFcmToken() {
  try {
    const fcmToken = await messaging().getToken();
    if (fcmToken) {
      console.log('✅ FCM Token:', fcmToken);
      // Cache token for other modules
      currentFcmToken = fcmToken;

      // 🔥 CRITICAL: Send token to your backend so it can send notifications
      await sendTokenToBackend(fcmToken);

      return fcmToken;
    } else {
      console.warn('❌ Failed to get FCM token');
      return null;
    }
  } catch (error) {
    console.error('❌ Error getting FCM token:', error);
    return null;
  }
}

/**
 * ✅ Step 3: Send FCM Token to Backend
 * Replace with your actual backend endpoint
 */
async function sendTokenToBackend(token) {
  try {
    // Dynamically import ApiManager to avoid circular import on startup
    try {
      const mod = await import('./ApiManager');
      const ApiManagerClass = mod && (mod.default || mod.ApiManager);
      if (ApiManagerClass && typeof ApiManagerClass.getInstance === 'function') {
        const api = ApiManagerClass.getInstance();
        // Use fetchWithAuth helper to POST to our endpoint
        const resp = await api.fetchWithAuth('/api/notifications/register-token', {
          method: 'POST',
          body: JSON.stringify({ fcmToken: token, platform: Platform.OS }),
        });
        // parse response if any
        let json = null;
        try {
          json = await resp.json();
        } catch (e) {
          // ignore
        }
        console.log('✅ FCM token sent to backend:', json || '[no json]');
      } else {
        console.warn('ApiManager not available to send FCM token');
      }
    } catch (err) {
      console.warn('Could not import ApiManager to send token:', err);
    }
  } catch (error) {
    console.error('❌ Error sending FCM token to backend:', error);
  }
}

/**
 * ✅ Step 4: Listen for Token Refresh (Important!)
 * FCM tokens can change - update backend when they do
 */
export function setupTokenRefreshListener() {
  try {
    const unsubscribe = messaging().onTokenRefresh(token => {
      console.log('🔄 FCM Token Refreshed:', token);
      // Update cached token and send new token to backend immediately
      currentFcmToken = token;
      sendTokenToBackend(token);
    });
    return unsubscribe;
  } catch (error) {
    console.error('❌ Error setting up token refresh listener:', error);
  }
}

/**
 * Return currently cached FCM token, or null if not yet fetched.
 */
export function getCurrentFcmToken() {
  return currentFcmToken;
}

/**
 * Ensure we have an FCM token — return the cached token or attempt to fetch one.
 * Use this from other modules to avoid circular imports (dynamic import recommended).
 */
export async function ensureFcmToken() {
  if (currentFcmToken) return currentFcmToken;
  return await getFcmToken();
}

/**
 * ✅ Step 5: Handle Foreground Messages (When app is open)
 * Display notification card to user
 */
export function foregroundMessageListener() {
  try {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('📱 Foreground Message Received:', remoteMessage);
      
      // Display visual notification using notifee
      await displayNotification(remoteMessage);
    });
    return unsubscribe;
  } catch (error) {
    console.error('❌ Error setting up foreground listener:', error);
  }
}

/**
 * ✅ Step 6: Display Notification Card using expo-notifications
 * This shows the actual notification UI to the user
 */
export async function displayNotification(remoteMessage) {
  try {
    const { title, body } = remoteMessage.notification || {};
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: title || 'New Message',
        body: body || '',
        data: remoteMessage.data || {},
        sound: 'default',
        badge: 1,
      },
      trigger: null, // Show immediately
    });

    console.log('✅ Notification displayed to user');
  } catch (error) {
    console.error('❌ Error displaying notification:', error);
  }
}
