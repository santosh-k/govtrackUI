import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const COLORS = {
  background: '#F5F5F5',
  cardBackground: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#666666',
  border: '#E0E0E0',
  blue: '#2196F3',
  red: '#F44336',
  chevron: '#999999',
};

interface SettingsItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  iconColor: string;
  onPress: () => void;
}

function SettingsItem({ icon, label, iconColor, onPress }: SettingsItemProps) {
  return (
    <TouchableOpacity
      style={styles.settingsItem}
      onPress={onPress}
      activeOpacity={0.6}
    >
      <View style={styles.itemLeft}>
        <Ionicons name={icon} size={24} color={iconColor} style={styles.itemIcon} />
        <Text style={styles.itemLabel}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.chevron} />
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const handleBack = () => {
    router.back();
  };

  const handleLogout = () => {
    router.replace('/');
  };

  const handlePlaceholder = (title: string) => {
    router.push({
      pathname: '/(drawer)/placeholder',
      params: { title },
    });
  };

  const settingsItems = [
    {
      icon: 'information-circle-outline' as keyof typeof Ionicons.glyphMap,
      label: 'About Us',
      iconColor: COLORS.blue,
      onPress: () => handlePlaceholder('About Us'),
    },
    {
      icon: 'business-outline' as keyof typeof Ionicons.glyphMap,
      label: 'Organisation Structure',
      iconColor: COLORS.blue,
      onPress: () => handlePlaceholder('Organisation Structure'),
    },
    {
      icon: 'book-outline' as keyof typeof Ionicons.glyphMap,
      label: 'Directory',
      iconColor: COLORS.blue,
      onPress: () => handlePlaceholder('Directory'),
    },
    {
      icon: 'globe-outline' as keyof typeof Ionicons.glyphMap,
      label: 'Website',
      iconColor: COLORS.blue,
      onPress: () => handlePlaceholder('Website'),
    },
    {
      icon: 'shield-checkmark-outline' as keyof typeof Ionicons.glyphMap,
      label: 'Privacy Policy',
      iconColor: COLORS.blue,
      onPress: () => handlePlaceholder('Privacy Policy'),
    },
    {
      icon: 'call-outline' as keyof typeof Ionicons.glyphMap,
      label: 'Contact US',
      iconColor: COLORS.blue,
      onPress: () => handlePlaceholder('Contact US'),
    },
    {
      icon: 'people-outline' as keyof typeof Ionicons.glyphMap,
      label: 'Language / भाषा',
      iconColor: COLORS.blue,
      onPress: () => handlePlaceholder('Language / भाषा'),
    },
    {
      icon: 'map-outline' as keyof typeof Ionicons.glyphMap,
      label: 'PWD Delhi Roadmap',
      iconColor: COLORS.blue,
      onPress: () => handlePlaceholder('PWD Delhi Roadmap'),
    },
    {
      icon: 'trash-outline' as keyof typeof Ionicons.glyphMap,
      label: 'Delete Account',
      iconColor: COLORS.red,
      onPress: () => handlePlaceholder('Delete Account'),
    },
    {
      icon: 'log-out-outline' as keyof typeof Ionicons.glyphMap,
      label: 'Logout',
      iconColor: COLORS.red,
      onPress: handleLogout,
    },
  ];

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
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        {/* Right: Empty space for balance */}
        <View style={styles.headerSpacer} />
      </View>

      {/* Settings List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.settingsCard}>
          {settingsItems.map((item, index) => (
            <View key={index}>
              <SettingsItem
                icon={item.icon}
                label={item.label}
                iconColor={item.iconColor}
                onPress={item.onPress}
              />
              {index < settingsItems.length - 1 && <View style={styles.separator} />}
            </View>
          ))}
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
    padding: 16,
  },
  settingsCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    overflow: 'hidden',
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
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: COLORS.cardBackground,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemIcon: {
    marginRight: 16,
    width: 24,
  },
  itemLabel: {
    fontSize: 16,
    fontWeight: '400',
    color: COLORS.text,
    flex: 1,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: 56,
  },
});
