import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  primary: '#FF851B', // Saffron/Orange
  background: '#FDFDFD', // Off-white
  text: '#1A1A1A',
  textSecondary: '#666666',
  inputBorder: '#CCCCCC',
  inputBorderActive: '#FF851B',
  success: '#4CAF50',
  white: '#FFFFFF',
};

export default function ForgotPasswordScreen() {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const slideAnim = useRef(new Animated.Value(100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // Toast animation effect
  useEffect(() => {
    if (showToast && successMessage) {
      // Slide up and fade in
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-dismiss after 3 seconds and navigate back
      const timer = setTimeout(() => {
        // Slide down and fade out
        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: 100,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setShowToast(false);
          setSuccessMessage('');
          // Navigate back to login screen
          router.replace('/');
        });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [showToast, successMessage, slideAnim, opacityAnim]);

  const showSuccessToast = (message: string) => {
    setSuccessMessage(message);
    setShowToast(true);
    // Reset animation values
    slideAnim.setValue(100);
    opacityAnim.setValue(0);
  };

  const handleSendResetLink = async () => {
    // Basic validation
    if (!username.trim()) {
      return;
    }

    // Show loading state
    setIsLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      setIsLoading(false);
      showSuccessToast(
        'If a matching account was found, reset instructions have been sent.'
      );
    }, 1500);
  };

  const handleBackToLogin = () => {
    router.back();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.scrollContent}>
          <View style={styles.contentContainer}>
          {/* Logo Section */}
          <View style={styles.logoContainer}>
            <Image
              source={require('@/assets/images/pwd-logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Title Section */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>
              Enter your username to receive reset instructions.
            </Text>
          </View>

          {/* Form Section */}
          <View style={styles.formContainer}>
            {/* Username Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Username</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={COLORS.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your username"
                  placeholderTextColor={COLORS.textSecondary}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* Send Reset Link Button */}
            <TouchableOpacity
              style={[styles.resetButton, isLoading && styles.resetButtonDisabled]}
              onPress={handleSendResetLink}
              disabled={isLoading || !username.trim()}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.white} size="small" />
              ) : (
                <Text style={styles.resetButtonText}>Receive Passwod</Text>
              )}
            </TouchableOpacity>

            {/* Back to Login Link */}
            <TouchableOpacity
              style={styles.backToLoginContainer}
              onPress={handleBackToLogin}
              activeOpacity={0.6}
            >
              <Ionicons name="arrow-back" size={16} color={COLORS.primary} />
              <Text style={styles.backToLoginText}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        </View>
        </View>
      </TouchableWithoutFeedback>

      {/* Success Toast Notification */}
      {showToast && successMessage && (
        <Animated.View
          style={[
            styles.toastContainer,
            {
              transform: [{ translateY: slideAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          <View style={styles.toastContent}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
            <Text style={styles.toastText}>{successMessage}</Text>
          </View>
        </Animated.View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 0,
    paddingBottom: 40,
  },
  contentContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 0,
  },
  logo: {
    width: 120,
    height: 120,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  formContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.inputBorder,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 54,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    paddingVertical: 0,
  },
  resetButton: {
    backgroundColor: COLORS.primary,
    height: 54,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  resetButtonDisabled: {
    opacity: 0.5,
  },
  resetButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  backToLoginContainer: {
    marginTop: 20,
    alignItems: 'center',
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  backToLoginText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
    marginLeft: 6,
  },
  toastContainer: {
    position: 'absolute',
    bottom: 40,
    left: 24,
    right: 24,
    zIndex: 1000,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2C',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
  },
  toastText: {
    fontSize: 14,
    color: COLORS.white,
    marginLeft: 12,
    flex: 1,
    fontWeight: '500',
    lineHeight: 20,
  },
});
