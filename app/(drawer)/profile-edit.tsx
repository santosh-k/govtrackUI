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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

const COLORS = {
  primary: '#2196F3', // Blue
  saffron: '#FF9800', // Saffron accent
  background: '#F5F5F5', // Light gray background
  cardBackground: '#FFFFFF', // White card
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
  keyboardType = 'default'
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
          error && styles.inputError
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

  const [fullName, setFullName] = useState(params.fullName as string || '');
  const [email, setEmail] = useState(params.email as string || '');
  const [designation, setDesignation] = useState(params.designation as string || '');
  const [department, setDepartment] = useState(params.department as string || '');
  const [address, setAddress] = useState(params.address as string || '');

  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Profile picture state
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [originalProfileImage] = useState<string | null>(null);

  const slideAnim = React.useRef(new Animated.Value(100)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const requestCameraPermission = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Camera Permission Required',
          'Please allow camera access to take photos.',
          [{ text: 'OK' }]
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      return false;
    }
  };

  const requestGalleryPermission = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Gallery Permission Required',
          'Please allow photo library access to choose images.',
          [{ text: 'OK' }]
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error requesting gallery permission:', error);
      return false;
    }
  };

  const openCamera = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error opening camera:', error);
      Alert.alert('Error', 'Failed to open camera. Please try again.');
    }
  };

  const openGallery = async () => {
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error opening gallery:', error);
      Alert.alert('Error', 'Failed to open gallery. Please try again.');
    }
  };

  const showImagePickerOptions = () => {
    if (Platform.OS === 'ios') {
      // iOS Action Sheet
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo...', 'Choose from Gallery...'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            openCamera();
          } else if (buttonIndex === 2) {
            openGallery();
          }
        }
      );
    } else {
      // Android Alert (Action Sheet style)
      Alert.alert(
        'Update Profile Picture',
        'Choose an option',
        [
          {
            text: 'Take Photo...',
            onPress: openCamera,
          },
          {
            text: 'Choose from Gallery...',
            onPress: openGallery,
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ],
        { cancelable: true }
      );
    }
  };

  const validateForm = () => {
    const newErrors = {
      fullName: '',
      email: '',
    };

    let isValid = true;

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
      isValid = false;
    }

    if (!email.trim()) {
      newErrors.email = 'Email address is required';
      isValid = false;
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const showSuccessToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    slideAnim.setValue(100);
    opacityAnim.setValue(0);

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
        router.push('/(drawer)/profile');
      });
    }, 3000);
  };

  const handleSave = async () => {
    // Dismiss keyboard
    Keyboard.dismiss();

    // Validate form
    if (!validateForm()) {
      return;
    }

    // Show loading state
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      console.log('Saving profile data:', {
        fullName, email, designation, department, address, profileImage
      });

      // Here you would upload the profile image to your server
      // and save all the profile data

      setIsLoading(false);
      showSuccessToast('Profile updated successfully');
    }, 1500);
  };

  const handleBack = () => {
    // Revert profile image if not saved
    if (profileImage !== originalProfileImage) {
      setProfileImage(originalProfileImage);
    }
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.cardBackground} />

      {/* Header */}
      <View style={styles.header}>
        {/* Left: Back Arrow */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.6}
        >
          <Ionicons name="arrow-back" size={28} color={COLORS.text} />
        </TouchableOpacity>

        {/* Center: Title */}
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Edit Profile</Text>
        </View>

        {/* Right: Empty space for balance */}
        <View style={styles.headerSpacer} />
      </View>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Profile Picture Section */}
          <View style={styles.profileSection}>
            {/* Profile Picture on Left */}
            <View style={styles.profilePictureWrapper}>
              <View style={styles.profilePicture}>
                {profileImage ? (
                  <Image
                    source={{ uri: profileImage }}
                    style={styles.profileImage}
                    resizeMode="cover"
                  />
                ) : (
                  <Ionicons name="person" size={60} color={COLORS.primary} />
                )}
              </View>
              {/* Edit Icon Button Overlay */}
              <TouchableOpacity
                style={styles.editIconButton}
                activeOpacity={0.8}
                onPress={showImagePickerOptions}
              >
                <Ionicons name="pencil" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* User Information on Right */}
            <View style={styles.userInfoContainer}>
              <Text style={styles.userName}>{fullName}</Text>
              <Text style={styles.userDesignation}>{designation}</Text>
              <Text style={styles.userDepartment}>{department}</Text>
            </View>
          </View>

          {/* White Form Card */}
          <View style={styles.formCard}>
            <ModernInputField
              label="Full Name"
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter your full name"
              error={errors.fullName}
            />

            <ModernInputField
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              error={errors.email}
            />

            <ModernInputField
              label="Designation"
              value={designation}
              onChangeText={setDesignation}
              placeholder="Enter your designation"
            />

            <ModernInputField
              label="Department"
              value={department}
              onChangeText={setDepartment}
              placeholder="Enter your department"
            />

            <ModernInputField
              label="Residential Address"
              value={address}
              onChangeText={setAddress}
              placeholder="Enter your residential address"
              multiline={true}
            />

            {/* Save Button - Inside Card */}
            <TouchableOpacity
              style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>

      {/* Success Toast */}
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
          <View style={styles.toastContent}>
            <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.cardBackground,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  headerSpacer: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    backgroundColor: COLORS.cardBackground,
    marginBottom: 16,
  },
  profilePictureWrapper: {
    position: 'relative',
    marginRight: 20,
  },
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
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
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
    ...Platform.select({
      ios: {
        shadowColor: COLORS.saffron,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  userInfoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  userDesignation: {
    fontSize: 15,
    fontWeight: '400',
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  userDepartment: {
    fontSize: 13,
    fontWeight: '400',
    color: COLORS.textLight,
    lineHeight: 18,
  },
  formCard: {
    backgroundColor: COLORS.cardBackground,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  input: {
    fontSize: 16,
    fontWeight: '400',
    color: COLORS.text,
    paddingVertical: 12,
    paddingHorizontal: 0,
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.inputBorder,
  },
  inputFocused: {
    borderBottomColor: COLORS.inputBorderActive,
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: 8,
  },
  inputError: {
    borderBottomColor: COLORS.error,
    borderBottomWidth: 2,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginLeft: 4,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: COLORS.saffron,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.saffron,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
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
    backgroundColor: COLORS.success,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  toastText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 12,
    flex: 1,
    fontWeight: '500',
    lineHeight: 20,
  },
});
