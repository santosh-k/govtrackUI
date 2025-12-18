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
  /** Optional right icon name from Ionicons (e.g., 'filter', 'search') */
  rightIconName?: string;
  /** Optional handler for right icon press */
  onRightPress?: () => void;
  rightIconColor?: string;
  /** Optional numeric badge to show on the right icon */
  rightBadgeCount?: number;
}

export default function Header({ title, greeting, subtitle, rightIconName, onRightPress, rightIconColor, rightBadgeCount }: HeaderProps) {
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

      {/* Right: Optional action button (e.g., filter) */}
      {rightIconName && onRightPress ? (
        <TouchableOpacity style={styles.rightButton} onPress={onRightPress} activeOpacity={0.7}>
          <Ionicons name={rightIconName as any} size={26} color={rightIconColor || COLORS.iconColor} />
          {typeof rightBadgeCount === 'number' && rightBadgeCount > 0 && (
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>{rightBadgeCount > 99 ? '99+' : String(rightBadgeCount)}</Text>
            </View>
          )}
        </TouchableOpacity>
      ) : isGreetingMode ? (
        <View style={styles.rightSpacer} />
      ) : null}
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
  rightButton: {
    padding: 8,
    marginRight: -8,
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
  badgeContainer: {
    position: 'absolute',
    right: -6,
    top: -6,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  }
});
