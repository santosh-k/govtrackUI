import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Animated,
  Keyboard,
  TouchableWithoutFeedback,
  ActionSheetIOS,
  Alert,
  Image,
  InteractionManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import ApiManager from '@/src/services/ApiManager';

const COLORS = {
  primary: '#2196F3',
  saffron: '#FF9800',
  background: '#F5F5F5',
  cardBackground: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#666666',
  textLight: '#9E9E9E',
  border: '#E0E0E0',
  inputBorder: '#E0E0E0',
  inputBorderActive: '#2196F3',
  profileBg: '#E3F2FD',
  error: '#D32F2F',
  success: '#4CAF50',
};

interface ModernInputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  error?: string;
  keyboardType?: 'default' | 'email-address';
}

function ModernInputField({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  error,
  keyboardType = 'default',
}: ModernInputFieldProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          multiline && styles.inputMultiline,
          isFocused && styles.inputFocused,
          error && styles.inputError,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textLight}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        keyboardType={keyboardType}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={14} color={COLORS.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

export default function EditProfileScreen() {
  const params = useLocalSearchParams();

  const [fullName, setFullName] = useState((params.fullName as string) || '');
  const [email, setEmail] = useState((params.email as string) || '');
  const [designation, setDesignation] = useState((params.designation as string) || '');
  const [department, setDepartment] = useState((params.department as string) || '');
  const [address, setAddress] = useState((params.address as string) || '');

  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isSuccessToast, setIsSuccessToast] = useState(false);

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [originalProfileImage] = useState<string | null>(null);

  const slideAnim = React.useRef(new Animated.Value(100)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Camera Permission Required', 'Please allow camera access to take photos.');
      return false;
    }
    return true;
  };

  const requestGalleryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Gallery Permission Required', 'Please allow photo library access.');
      return false;
    }
    return true;
  };

  const openCamera = async () => {
    if (!(await requestCameraPermission())) return;
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.length) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const openGallery = async () => {
    if (!(await requestGalleryPermission())) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.length) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const showImagePickerOptions = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo...', 'Choose from Gallery...'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) openCamera();
          if (buttonIndex === 2) openGallery();
        }
      );
    } else {
      Alert.alert('Update Profile Picture', 'Choose an option', [
        { text: 'Take Photo...', onPress: openCamera },
        { text: 'Choose from Gallery...', onPress: openGallery },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  const validateForm = () => {
    const newErrors = { fullName: '', email: '' };
    let valid = true;

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
      valid = false;
    }
    if (!email.trim()) {
      newErrors.email = 'Email address is required';
      valid = false;
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const showToastMessage = (message: string, success = true) => {
    setToastMessage(message);
    setIsSuccessToast(success);
    setShowToast(true);
    slideAnim.setValue(100);
    opacityAnim.setValue(0);

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

    // Auto-hide after 3 seconds
    setTimeout(() => {
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
        setToastMessage('');
      });
    }, 3000);
  };

  const handleSave = async () => {
    Keyboard.dismiss();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('firstName', fullName.split(' ')[0] || '');
      formData.append('lastName', fullName.split(' ').slice(1).join(' ') || '');
      formData.append('email', email);
      formData.append('phone', (params.phone as string) || '');
      formData.append('address', address);

      if (profileImage && profileImage !== originalProfileImage) {
        const imageUri = Platform.OS === 'ios'
          ? profileImage.replace('file://', '')
          : profileImage;
        const fileName = profileImage.split('/').pop() || 'profile.jpg';

        (formData as any).append('profile_img', {
          uri: Platform.OS === 'ios' ? `file://${imageUri}` : imageUri,
          name: fileName,
          type: 'image/jpeg',
        });
      }

      const response = await ApiManager.getInstance().updateProfile(formData);
      setIsLoading(false);

      if (response.success) {
         showToastMessage(response.message || 'Profile updated successfully', true);
        router.replace('/(drawer)/profile'); // go back safely to Profile screen
      } else {
       showToastMessage(response.message || 'Failed to update profile', false);
     }
    } catch (error) {
      setIsLoading(false);
      console.error('Profile update error:', error);
      showToastMessage('Something went wrong. Please try again.', false);
    }
  };

  const handleBack = () => {
    if (profileImage !== originalProfileImage) setProfileImage(originalProfileImage);
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.cardBackground} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.6}>
          <Ionicons name="arrow-back" size={28} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Edit Profile</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.profileSection}>
            <View style={styles.profilePictureWrapper}>
              <View style={styles.profilePicture}>
                {profileImage ? (
                  <Image source={{ uri: profileImage }} style={styles.profileImage} resizeMode="cover" />
                ) : (
                  <Ionicons name="person" size={60} color={COLORS.primary} />
                )}
              </View>
              <TouchableOpacity
                style={styles.editIconButton}
                activeOpacity={0.8}
                onPress={showImagePickerOptions}
              >
                <Ionicons name="pencil" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <View style={styles.userInfoContainer}>
              <Text style={styles.userName}>{fullName}</Text>
              <Text style={styles.userDesignation}>{designation}</Text>
              <Text style={styles.userDepartment}>{department}</Text>
            </View>
          </View>

          <View style={styles.formCard}>
            <ModernInputField label="Full Name" value={fullName} onChangeText={setFullName} placeholder="Enter your full name" error={errors.fullName} />
            <ModernInputField label="Email Address" value={email} onChangeText={setEmail} placeholder="Enter your email" keyboardType="email-address" error={errors.email} />
            <ModernInputField label="Designation" value={designation} onChangeText={setDesignation} placeholder="Enter your designation" />
            <ModernInputField label="Department" value={department} onChangeText={setDepartment} placeholder="Enter your department" />
            <ModernInputField label="Residential Address" value={address} onChangeText={setAddress} placeholder="Enter your residential address" multiline />
            <TouchableOpacity
              style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? <ActivityIndicator color="#FFFFFF" size="small" /> : <Text style={styles.saveButtonText}>Save Changes</Text>}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>

      {showToast && (
        <Animated.View
          style={[
            styles.toastContainer,
            {
              transform: [{ translateY: slideAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          <View
            style={[
              styles.toastContent,
              { backgroundColor: isSuccessToast ? COLORS.success : COLORS.error },
            ]}
          >
            <Ionicons name={isSuccessToast ? 'checkmark-circle' : 'alert-circle'} size={20} color="#FFFFFF" />
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.cardBackground,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: { padding: 8, marginLeft: -8 },
  headerTitleContainer: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  headerSpacer: { width: 44 },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 32 },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    backgroundColor: COLORS.cardBackground,
    marginBottom: 16,
  },
  profilePictureWrapper: { position: 'relative', marginRight: 20 },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.profileBg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.cardBackground,
    overflow: 'hidden',
  },
  profileImage: { width: '100%', height: '100%' },
  editIconButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.saffron,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.cardBackground,
  },
  userInfoContainer: { flex: 1, justifyContent: 'center' },
  userName: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  userDesignation: { fontSize: 15, color: COLORS.textSecondary, marginBottom: 2 },
  userDepartment: { fontSize: 13, color: COLORS.textLight },
  formCard: {
    backgroundColor: COLORS.cardBackground,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
  },
  inputContainer: { marginBottom: 24 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 8 },
  input: {
    fontSize: 16,
    fontWeight: '400',
    color: COLORS.text,
    paddingVertical: 12,
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.inputBorder,
  },
  inputFocused: { borderBottomColor: COLORS.inputBorderActive },
  inputMultiline: { minHeight: 80, textAlignVertical: 'top', paddingTop: 8 },
  inputError: { borderBottomColor: COLORS.error, borderBottomWidth: 2 },
  errorContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  errorText: { fontSize: 12, color: COLORS.error, marginLeft: 4 },
  saveButton: {
    backgroundColor: COLORS.saffron,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  toastContainer: { position: 'absolute', bottom: 40, left: 24, right: 24, zIndex: 1000 },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
  },
  toastText: { fontSize: 14, color: '#FFFFFF', marginLeft: 12, flex: 1, fontWeight: '500' },
});
