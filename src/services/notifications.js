import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';

export async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled = 
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  return enabled;
}

export async function getFcmToken() {
  let fcmToken = await messaging().getToken();
  console.log("FCM TOKEN:", fcmToken);
  return fcmToken;
}

export function foregroundMessageListener() {
  return messaging().onMessage(async remoteMessage => {
    console.log("Foreground Message:", remoteMessage);
  });
}
