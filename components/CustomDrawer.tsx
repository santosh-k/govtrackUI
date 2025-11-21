import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
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
  logoutButton: '#FF851B',
  subMenuBackground: '#F8F8F8',
};

interface MenuItem {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route?: string;
  hasSubMenu?: boolean;
  subItems?: SubMenuItem[];
}

interface SubMenuItem {
  id: string;
  label: string;
  route: string;
}

const menuItems: MenuItem[] = [
  { id: 'home', label: 'Home', icon: 'home-outline', route: '/(drawer)/(tabs)/dashboard' },
  { id: 'complaints', label: 'Complaints', icon: 'document-text-outline', route: '/(drawer)/(tabs)/complaints' },
  { id: 'projects', label: 'Projects', icon: 'folder-outline', route: '/(drawer)/(tabs)/projects' },
  {
    id: 'inspections',
    label: 'Inspections',
    icon: 'clipboard-outline',
    hasSubMenu: true,
    subItems: [
      { id: 'project-inspection', label: 'Project Inspection', route: '/(drawer)/advanced-project-search' },
      { id: 'assets-inspection', label: 'Assets Inspection', route: '/(drawer)/search-asset' },
      { id: 'water-logging-point', label: 'Water Logging Point', route: '/(drawer)/placeholder' },
      { id: 'water-logging-removal', label: 'Water Logging Removal', route: '/(drawer)/placeholder' },
      { id: 'street-light-inspection', label: 'Street Light Inspection', route: '/(drawer)/placeholder' },
    ],
  },
  { id: 'my-task', label: 'My Task', icon: 'checkmark-done-outline', route: '/(drawer)/(tabs)/tasks?tab=my-tasks' },
  { id: 'assign-task', label: 'Assign Task', icon: 'add-circle-outline', route: '/(drawer)/(tabs)/tasks?tab=assigned-by-me' },
  { id: 'my-profile', label: 'My Profile', icon: 'person-outline', route: '/(drawer)/profile' },
  { id: 'settings', label: 'Settings', icon: 'settings-outline', route: '/(drawer)/settings' },
];

export default function CustomDrawer(props: DrawerContentComponentProps) {
  const [expandedMenus, setExpandedMenus] = useState<{ [key: string]: boolean }>({});

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId],
    }));
  };

  const handleMenuItemPress = (item: MenuItem) => {
    if (item.hasSubMenu) {
      toggleMenu(item.id);
    } else if (item.route) {
      // Close drawer first
      props.navigation.closeDrawer();
      // Navigate to the route
      router.push(item.route as any);
    }
  };

  const handleSubMenuItemPress = (route: string) => {
    // Close drawer first
    props.navigation.closeDrawer();
    // Navigate to the route
    router.push(route as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Profile Section */}
        <View style={styles.profileContainer}>
          <View style={styles.profilePicture}>
            <Ionicons name="person" size={48} color={COLORS.primary} />
          </View>
          <Text style={styles.userName}>Er Sabir Ali , Assistant Engineer</Text>
          <Text style={styles.userDivision}>HC&ND Elect Sub Division (M 4513)</Text>
          <Text style={styles.userDepartment}>Public Works Department</Text>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item) => (
            <View key={item.id}>
              {/* Main Menu Item */}
              <TouchableOpacity
                style={styles.menuItem}
                activeOpacity={0.6}
                onPress={() => handleMenuItemPress(item)}
              >
                <Ionicons name={item.icon} size={24} color={COLORS.text} />
                <Text style={styles.menuItemText}>{item.label}</Text>
                {item.hasSubMenu ? (
                  <Ionicons
                    name={expandedMenus[item.id] ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={COLORS.textSecondary}
                    style={styles.chevronIcon}
                  />
                ) : (
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={COLORS.textSecondary}
                    style={styles.chevronIcon}
                  />
                )}
              </TouchableOpacity>

              {/* Sub Menu Items (Collapsible) */}
              {item.hasSubMenu && expandedMenus[item.id] && item.subItems && (
                <View style={styles.subMenuContainer}>
                  {item.subItems.map((subItem) => (
                    <TouchableOpacity
                      key={subItem.id}
                      style={styles.subMenuItem}
                      activeOpacity={0.6}
                      onPress={() => handleSubMenuItemPress(subItem.route)}
                    >
                      <View style={styles.subMenuDot} />
                      <Text style={styles.subMenuItemText}>{subItem.label}</Text>
                      <Ionicons
                        name="chevron-forward"
                        size={18}
                        color={COLORS.textSecondary}
                        style={styles.subMenuChevron}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
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
  // Sub Menu Styles
  subMenuContainer: {
    backgroundColor: COLORS.subMenuBackground,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  subMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingLeft: 56,
    paddingRight: 16,
  },
  subMenuDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.textSecondary,
    marginRight: 12,
  },
  subMenuItemText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '400',
  },
  subMenuChevron: {
    marginLeft: 'auto',
  },
});
