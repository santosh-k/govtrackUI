import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const COLORS = {
  activeTab: '#2196F3', // Blue for active tab
  inactiveTab: '#9E9E9E', // Gray for inactive tabs
  tabBarBackground: '#FFFFFF',
  tabBarBorder: '#E0E0E0',
};

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  // Reduce bottom padding by 10px, but ensure minimum of 8px
  const adjustedBottomPadding = Math.max(insets.bottom - 10, 8);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.activeTab,
        tabBarInactiveTintColor: COLORS.inactiveTab,
        tabBarStyle: {
          backgroundColor: COLORS.tabBarBackground,
          borderTopWidth: 1,
          borderTopColor: COLORS.tabBarBorder,
          height: 60 + adjustedBottomPadding,
          paddingBottom: adjustedBottomPadding,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="complaints"
        options={{
          title: 'Complaints',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="projects"
        options={{
          title: 'Projects',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="folder-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="checkmark-done-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
