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
import ProfileHeader from '@/components/ProfileHeader';

const COLORS = {
  primary: '#FF851B', // Saffron/Orange
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
  const userData = {
    fullName: 'Er Sabir Ali',
    email: 'sabir.ali@pwd.gov.in',
    designation: 'Assistant Engineer',
    department: 'Public Works Department',
    address: '123, PWD Staff Quarters, New Delhi',
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
          <Text style={styles.profileName}>Er Sabir Ali</Text>
          <Text style={styles.profileDesignation}>Assistant Engineer</Text>
        </View>

        {/* Profile Information */}
        <View style={styles.profileInfoSection}>
          <ProfileItem
            label="Full Name"
            value="Er Sabir Ali"
            icon="person-outline"
          />
          <ProfileItem
            label="Email Address"
            value="sabir.ali@pwd.gov.in"
            icon="mail-outline"
          />
          <ProfileItem
            label="Designation"
            value="Assistant Engineer"
            icon="briefcase-outline"
            reducedMargin={true}
          />
          <ProfileItem
            label="Department"
            value="Public Works Department"
            icon="business-outline"
          />
          <ProfileItem
            label="Residential Address"
            value="123, PWD Staff Quarters, New Delhi"
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
    marginBottom: 16,
    borderWidth: 3,
    borderColor: COLORS.profileBorder,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  profileDesignation: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  profileInfoSection: {
    marginTop: 16,
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
