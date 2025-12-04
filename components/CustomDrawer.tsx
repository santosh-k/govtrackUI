import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../src/store';
import {
  DrawerContentScrollView,
  DrawerContentComponentProps,
} from '@react-navigation/drawer';

const COLORS = {
  background: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#666666',
  primary: '#2196F3',
  border: '#eeeeeeff',
};

interface MenuItem {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
}

const menuItems: MenuItem[] = [
  {
    id: 'home',
    label: 'Home',
    icon: 'home-outline',
    route: '/(drawer)/(tabs)/dashboard'
  },
  {
    id: 'project-inspections',
    label: 'Project Inspections',
    icon: 'clipboard-outline',
    route: '/(drawer)/advanced-project-search'
  },
  {
    id: 'assets-inspections',
    label: 'Assets Inspections',
    icon: 'business-outline',
    route: '/(drawer)/search-asset'
  },
  {
    id: 'water-logging-point',
    label: 'Water Logging Point',
    icon: 'water-outline',
    route: '/water-logging/list'
  },
  {
    id: 'water-logging-removal',
    label: 'Water Logging Removal',
    icon: 'water-outline',
    route: '/(drawer)/water-logging-removal'
  },
  {
    id: 'street-light-inspection',
    label: 'Street Light Inspections',
    icon: 'bulb-outline',
    route: '/(drawer)/street-light-inspection'
  },
  {
    id: 'my-profile',
    label: 'My Profile',
    icon: 'person-outline',
    route: '/(drawer)/profile'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'settings-outline',
    route: '/(drawer)/settings'
  },
];

export default function CustomDrawer(props: DrawerContentComponentProps) {
  const user = useSelector((state: RootState) => state.auth.user);

  const displayName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Guest User';
  const displayDesignation = user?.designations?.[0]?.displayName || '';
  // Prefer division name, then zone, then department
  const displayDivision = user?.division?.name || user?.zone?.name || user?.departments?.[0]?.name || '';
  const handleMenuItemPress = (route: string) => {
    // Close drawer first
    props.navigation.closeDrawer();
    // Navigate to the route
    router.push(route as any);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Profile Section */}
        <View style={styles.profileContainer}>
          <View style={styles.profilePicture}>
            {user?.profile_image ? (
              <Image
                source={{ uri: user.profile_image }}
                style={styles.profileImage}
                resizeMode="cover"
              />
            ) : (
              <Ionicons name="person" size={48} color={COLORS.primary} />
            )}
          </View>
          <Text style={styles.userName}>{displayName}{displayDesignation ? `, ${displayDesignation}` : ''}</Text>
          {displayDivision ? <Text style={styles.userDivision}>{displayDivision}</Text> : null}
          {user?.departments?.[0]?.name ? (
            <Text style={styles.userDepartment}>{user.departments[0].name}</Text>
          ) : null}
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              activeOpacity={0.6}
              onPress={() => handleMenuItemPress(item.route)}
            >
              <Ionicons name={item.icon} size={24} color={COLORS.text} />
              <Text style={styles.menuItemText}>{item.label}</Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={COLORS.textSecondary}
                style={styles.chevronIcon}
              />
            </TouchableOpacity>
          ))}
        </View>
      </DrawerContentScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingTop: 0,
  },
  profileContainer: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  profilePicture: {
    width: 70,
    height: 70,
    borderRadius: 70,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: COLORS.primary,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 70,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 12,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  userDivision: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 6,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  userDepartment: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  menuSection: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
    marginLeft: 16,
  },
  chevronIcon: {
    marginLeft: 'auto',
  },
});
