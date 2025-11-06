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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

const COLORS = {
  primary: '#FF851B', // Saffron/Orange
  background: '#FDFDFD',
  text: '#1A1A1A',
  textSecondary: '#666666',
  white: '#FFFFFF',
  border: '#E0E0E0',
  inputBorder: '#CCCCCC',
  inputBorderActive: '#FF851B',
  profileBg: '#E3F2FD',
  profileBorder: '#2196F3',
};

interface EditHeaderProps {
  onSave: () => void;
  onCancel: () => void;
}

function EditProfileHeader({ onSave, onCancel }: EditHeaderProps) {
  return (
    <View style={styles.header}>
      {/* Left: Cancel Button */}
      <TouchableOpacity
        style={styles.headerButton}
        onPress={onCancel}
        activeOpacity={0.6}
      >
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>

      {/* Center: Title */}
      <View style={styles.headerTitleContainer}>
        <Text style={styles.headerTitle}>Edit Profile</Text>
      </View>

      {/* Right: Save Button */}
      <TouchableOpacity
        style={styles.headerButton}
        onPress={onSave}
        activeOpacity={0.6}
      >
        <Text style={styles.saveText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
}

interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  icon: keyof typeof Ionicons.glyphMap;
  placeholder?: string;
  multiline?: boolean;
}

function InputField({ label, value, onChangeText, icon, placeholder, multiline }: InputFieldProps) {
  return (
    <View style={styles.inputGroup}>
      <View style={styles.inputHeader}>
        <Ionicons name={icon} size={20} color={COLORS.profileBorder} style={styles.inputIcon} />
        <Text style={styles.inputLabel}>{label}</Text>
      </View>
      <TextInput
        style={[styles.input, multiline && styles.inputMultiline]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textSecondary}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
      />
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

  const handleSave = () => {
    // In a real app, you would save the data here
    console.log('Saving profile data:', { fullName, email, designation, department, address });

    // Navigate back to profile screen
    router.back();
  };

  const handleCancel = () => {
    // Navigate back without saving
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <EditProfileHeader onSave={handleSave} onCancel={handleCancel} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Picture Section */}
        <View style={styles.profilePictureSection}>
          <View style={styles.profilePicture}>
            <Ionicons name="person" size={48} color={COLORS.profileBorder} />
          </View>
          <TouchableOpacity style={styles.changePhotoButton} activeOpacity={0.7}>
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Edit Form */}
        <View style={styles.formSection}>
          <InputField
            label="Full Name"
            value={fullName}
            onChangeText={setFullName}
            icon="person-outline"
            placeholder="Enter your full name"
          />
          <InputField
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            icon="mail-outline"
            placeholder="Enter your email"
          />
          <InputField
            label="Designation"
            value={designation}
            onChangeText={setDesignation}
            icon="briefcase-outline"
            placeholder="Enter your designation"
          />
          <InputField
            label="Department"
            value={department}
            onChangeText={setDepartment}
            icon="business-outline"
            placeholder="Enter your department"
          />
          <InputField
            label="Residential Address"
            value={address}
            onChangeText={setAddress}
            icon="location-outline"
            placeholder="Enter your residential address"
            multiline={true}
          />
        </View>
      </ScrollView>
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
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerButton: {
    padding: 8,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '400',
    color: COLORS.text,
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  profilePictureSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.profileBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: COLORS.profileBorder,
  },
  changePhotoButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  changePhotoText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.primary,
  },
  formSection: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  inputGroup: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    marginLeft: 28,
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
});
