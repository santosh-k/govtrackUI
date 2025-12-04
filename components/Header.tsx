import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions, useNavigation } from '@react-navigation/native';

const COLORS = {
  background: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#666666',
  border: '#E0E0E0',
  iconColor: '#1A1A1A',
};

interface HeaderProps {
  title?: string;
  /** Greeting text for dashboard mode (e.g., "Welcome, Er Sabir Ali") */
  greeting?: string;
  /** Subtitle text for dashboard mode (e.g., "Mon, 25 Sep 2024") */
  subtitle?: string;
}

export default function Header({ title, greeting, subtitle }: HeaderProps) {
  const navigation = useNavigation();

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  // Greeting mode: displays welcome message and date
  const isGreetingMode = Boolean(greeting);

  return (
    <View style={[styles.container, isGreetingMode && styles.containerGreeting]}>
      {/* Left: Hamburger Menu Icon */}
      <TouchableOpacity
        style={styles.menuButton}
        onPress={openDrawer}
        activeOpacity={0.6}
      >
        <Ionicons name="menu" size={28} color={COLORS.iconColor} />
      </TouchableOpacity>

      {/* Greeting Mode: Welcome message and date */}
      {isGreetingMode && (
        <View style={styles.greetingContainer}>
          <Text style={styles.greetingText}>{greeting}</Text>
          {subtitle && <Text style={styles.subtitleText}>{subtitle}</Text>}
        </View>
      )}

      {/* Center: Title (standard mode, when no greeting) */}
      {!isGreetingMode && title && (
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
        </View>
      )}

      {/* Right: Spacer for balance (only needed in greeting mode) */}
      {isGreetingMode && <View style={styles.rightSpacer} />}
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
  containerGreeting: {
    paddingVertical: 14,
  },
  menuButton: {
    padding: 8,
    marginLeft: -8,
  },
  titleContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: -1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  greetingContainer: {
    flex: 1,
    marginLeft: 12,
  },
  greetingText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  subtitleText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  rightSpacer: {
    width: 36,
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  welcomeText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '400',
  },
  userName: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
    marginTop: 2,
  },
});
