import React, { useState, useEffect, useRef, useContext } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../src/store';
import { loginStart, loginFailure } from '../src/store/authSlice';
import { AuthContext } from '../src/contexts/AuthContext';
import { User } from '../src/types/auth.types';

const COLORS = {
  primary: '#FF851B',
  background: '#FDFDFD',
  text: '#1A1A1A',
  textSecondary: '#666666',
  inputBorder: '#CCCCCC',
  inputBorderActive: '#FF851B',
  error: '#D32F2F',
  white: '#FFFFFF',
};
export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [localError, setLocalError] = useState('');

  const slideAnim = useRef(new Animated.Value(100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const dispatch = useDispatch();
  const { isLoading } = useSelector((state: RootState) => state.auth);
  const { login } = useContext(AuthContext);
  const router = useRouter();
 

  const showErrorToast = (message: string) => {
    setLocalError(message);
    setShowToast(true);
    slideAnim.setValue(100);
    opacityAnim.setValue(0);
  };

  useEffect(() => {
    if (showToast && localError) {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(slideAnim, { toValue: 100, duration: 300, useNativeDriver: true }),
          Animated.timing(opacityAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]).start(() => {
          setShowToast(false);
          setLocalError('');
        });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [showToast, localError, slideAnim, opacityAnim]);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      showErrorToast('Please enter both username and password.');
      return;
    }

    dispatch(loginStart());

    try {
      // Dynamic import to avoid circular dependency
      const { default: ApiManager } = await import('../src/services/ApiManager');
      const apiManager = ApiManager.getInstance();
      const response = await apiManager.login({ username: username.trim(), password: password.trim() });

      if (response.success) {
        const { token, refreshToken, user } = response.data as { token: string; refreshToken: string; user: User };

        // Save token securely and update Redux
        await login(token, refreshToken, user);
        // Navigation automatically handled in _layout.tsx via AuthHandler
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred during login.';
      dispatch(loginFailure(message));
      showErrorToast(message);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.scrollContent}>
          <View style={styles.contentContainer}>
            <View style={styles.logoContainer}>
              <Image source={require('@/assets/images/pwd-logo.png')} style={styles.logo} resizeMode="contain" />
            </View>

            <View style={styles.titleContainer}>
              <Text style={styles.title}>Login</Text>
              <Text style={styles.subtitle}>Public Works Department, Delhi</Text>
            </View>

            <View style={styles.formContainer}>
              {/* Username */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Username</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="person-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
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

              {/* Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, styles.passwordInput]}
                    placeholder="Enter your password"
                    placeholderTextColor={COLORS.textSecondary}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon} disabled={isLoading}>
                    <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Login Button */}
              <TouchableOpacity style={[styles.loginButton, isLoading && styles.loginButtonDisabled]} onPress={handleLogin} disabled={isLoading}>
                {isLoading ? <ActivityIndicator color={COLORS.white} size="small" /> : <Text style={styles.loginButtonText}>Login</Text>}
              </TouchableOpacity>

              {/* Forgot Password */}
              <TouchableOpacity style={styles.forgotPasswordContainer} onPress={() => router.push('/forgot-password')} activeOpacity={0.6}>
                <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>

      {/* Toast Notification */}
      {showToast && localError && (
        <Animated.View style={[styles.toastContainer, { transform: [{ translateY: slideAnim }], opacity: opacityAnim }]}>
          <View style={styles.toastContent}>
            <Ionicons name="alert-circle" size={20} color={COLORS.white} />
            <Text style={styles.toastText}>{localError}</Text>
          </View>
        </Animated.View>
      )}
    </KeyboardAvoidingView>
  );
}

// Styles remain unchanged (reuse your existing styles)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { flex: 1, justifyContent: 'center', paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 },
  contentContainer: { width: '100%', maxWidth: 400, alignSelf: 'center' },
  logoContainer: { alignItems: 'center', marginBottom: 32, marginTop: 0 },
  logo: { width: 120, height: 120 },
  titleContainer: { alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 28, fontWeight: '700', color: COLORS.text, marginBottom: 8, letterSpacing: 0.5 },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center' },
  formContainer: { width: '100%' },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 8, letterSpacing: 0.3 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderWidth: 1.5, borderColor: COLORS.inputBorder, borderRadius: 12, paddingHorizontal: 16, height: 54, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: COLORS.text, paddingVertical: 0 },
  passwordInput: { paddingRight: 40 },
  eyeIcon: { position: 'absolute', right: 16, padding: 4 },
  loginButton: { backgroundColor: COLORS.primary, height: 54, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 8, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  loginButtonDisabled: { opacity: 0.7 },
  loginButtonText: { fontSize: 17, fontWeight: '700', color: COLORS.white, letterSpacing: 0.5 },
  forgotPasswordContainer: { marginTop: 20, alignItems: 'center', paddingVertical: 8 },
  forgotPasswordText: { fontSize: 14, color: COLORS.primary, textDecorationLine: 'underline', fontWeight: '500', textAlign:'right' },
  toastContainer: { position: 'absolute', bottom: 40, left: 24, right: 24, zIndex: 1000 },
  toastContent: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2C2C2C', paddingHorizontal: 20, paddingVertical: 16, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8, borderLeftWidth: 4, borderLeftColor: COLORS.error },
  toastText: { fontSize: 14, color: COLORS.white, marginLeft: 12, flex: 1, fontWeight: '500', lineHeight: 20 },
});
