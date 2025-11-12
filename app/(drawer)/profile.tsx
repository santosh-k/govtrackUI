import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import ProfileHeader from '@/components/ProfileHeader';
import { RootState } from '../../src/store';

const COLORS = {
  primary: '#FF851B',
  background: '#FDFDFD',
  text: '#1A1A1A',
  textSecondary: '#666666',
  white: '#FFFFFF',
  border: '#E0E0E0',
  profileBg: '#E3F2FD',
  profileBorder: '#2196F3',
};

interface ProfileItemProps {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  reducedMargin?: boolean;
}

function ProfileItem({ label, value, icon, reducedMargin }: ProfileItemProps) {
  return (
    <View style={[styles.profileItem, reducedMargin && styles.profileItemReduced]}>
      <View style={styles.profileItemHeader}>
        <Ionicons name={icon} size={20} color={COLORS.profileBorder} style={styles.itemIcon} />
        <Text style={styles.profileLabel}>{label}</Text>
      </View>
      <Text style={styles.profileValue}>{value}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const user = useSelector((state: RootState) => state.auth.user);

  // ✅ Safe data extraction (no more crashes)
  const userData = {
    fullName: user ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() : '',
    email: user?.email ?? '',
    designation:
      Array.isArray(user?.designations) && user.designations.length > 0
        ? user.designations[0]?.displayName ?? ''
        : '',
    department:
      Array.isArray(user?.departments) && user.departments.length > 0
        ? user.departments[0]?.name ?? ''
        : '',
    address: user?.address ?? '',
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ProfileHeader userData={userData} />

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
          <Text style={styles.profileName}>
            {userData.fullName || 'No Name Available'}
          </Text>
          <Text style={styles.profileDesignation}>
            {userData.designation || 'No Designation'}
          </Text>
        </View>

        {/* Profile Information */}
        <View style={styles.profileInfoSection}>
          <ProfileItem
            label="Full Name"
            value={userData.fullName || 'Not provided'}
            icon="person-outline"
          />
          <ProfileItem
            label="Email Address"
            value={userData.email || 'Not provided'}
            icon="mail-outline"
          />
          <ProfileItem
            label="Designation"
            value={userData.designation || 'Not provided'}
            icon="briefcase-outline"
            reducedMargin
          />
          <ProfileItem
            label="Department"
            value={userData.department || 'Not provided'}
            icon="business-outline"
          />
          <ProfileItem
            label="Residential Address"
            value={userData.address || 'Not provided'}
            icon="location-outline"
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
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.profileBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 3,
    borderColor: COLORS.profileBorder,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  profileDesignation: {
    fontSize: 15,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  profileInfoSection: {
    marginTop: 0,
    paddingHorizontal: 16,
  },
  profileItem: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  profileItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemIcon: {
    marginRight: 8,
  },
  profileLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  profileValue: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    lineHeight: 24,
    marginLeft: 28,
  },
  profileItemReduced: {
    marginBottom: 6,
  },
});
