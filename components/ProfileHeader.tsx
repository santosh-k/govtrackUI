import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const COLORS = {
  background: '#FFFFFF',
  text: '#1A1A1A',
  border: '#E0E0E0',
  iconColor: '#1A1A1A',
};

interface ProfileHeaderProps {
  userData?: {
    fullName: string;
    email: string;
    designation: string;
    department: string;
    address: string;
  };
}

export default function ProfileHeader({ userData }: ProfileHeaderProps) {
  const handleBack = () => {
    router.push('/(drawer)/(tabs)/dashboard');
  };

  const handleEdit = () => {
    if (userData) {
      router.push({
        pathname: '/(drawer)/profile-edit',
        params: {
          fullName: userData.fullName,
          email: userData.email,
          designation: userData.designation,
          department: userData.department,
          address: userData.address,
        },
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* Left: Back Arrow Icon */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={handleBack}
        activeOpacity={0.6}
      >
        <Ionicons name="arrow-back" size={28} color={COLORS.iconColor} />
      </TouchableOpacity>

      {/* Center: Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Profile</Text>
      </View>

      {/* Right: Edit Text + Icon */}
      <TouchableOpacity
        style={styles.editButton}
        onPress={handleEdit}
        activeOpacity={0.6}
      >
        <Text style={styles.editText}>Edit</Text>
        <Ionicons name="pencil-sharp" size={16} color={COLORS.iconColor} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    marginRight: -8,
  },
  editText: {
    fontSize: 16,
    fontWeight: '400',
    color: COLORS.text,
    marginRight: 4,
  },
});
