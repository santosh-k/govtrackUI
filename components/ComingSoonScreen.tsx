/**
 * ComingSoonScreen Component
 *
 * A reusable placeholder screen for features under development.
 * Displays an icon, title, description, and optional back button.
 *
 * @component
 * @example
 * <ComingSoonScreen
 *   title="Create Task"
 *   description="The Create Task feature is currently under development."
 *   icon="construct-outline"
 *   projectId={projectId}
 * />
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS, SPACING } from '@/theme';

interface ComingSoonScreenProps {
  /** Screen title shown in header */
  title: string;
  /** Description text shown below the icon */
  description: string;
  /** Ionicons icon name to display */
  icon: keyof typeof Ionicons.glyphMap;
  /** Project ID for context-aware navigation */
  projectId?: string;
  /** Custom icon color (defaults to primary) */
  iconColor?: string;
  /** Custom icon size (defaults to 80) */
  iconSize?: number;
}

/**
 * ComingSoonScreen - Placeholder screen for features under development
 */
export default function ComingSoonScreen({
  title,
  description,
  icon,
  projectId,
  iconColor = COLORS.primary,
  iconSize = 80,
}: ComingSoonScreenProps) {
  /**
   * Handles back navigation
   * If projectId is present, navigates back to the Project Details screen
   * Otherwise, uses standard back navigation
   */
  const handleGoBack = () => {
    if (projectId) {
      router.push({
        pathname: '/(drawer)/project-details',
        params: { projectId },
      });
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Header with back button and title */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleGoBack}
          activeOpacity={0.6}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>

      {/* Coming Soon content */}
      <View style={styles.contentContainer}>
        <Ionicons name={icon} size={iconSize} color={iconColor} />
        <Text style={styles.title}>Coming Soon</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
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
    backgroundColor: COLORS.cardBackground,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: SPACING.sm,
    marginLeft: -SPACING.sm,
    marginRight: SPACING.sm,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm + 4,
  },
  description: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
