/**
 * Create Bottleneck Screen
 *
 * This screen allows users to add a new bottleneck to a project.
 * Currently displays a placeholder UI indicating the feature is coming soon.
 * Note: The Speed Dial FAB uses a modal for bottleneck creation instead of
 * navigating to this screen, but this screen exists for other potential entry points.
 *
 * @screen
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
import { router, useLocalSearchParams } from 'expo-router';

// Color constants for consistent styling
const COLORS = {
  background: '#F5F5F5',
  cardBackground: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#666666',
  border: '#E0E0E0',
  primary: '#2196F3',
};

/**
 * CreateBottleneckScreen Component
 *
 * Renders the create bottleneck interface with a back button
 * and placeholder content for the upcoming feature.
 */
export default function CreateBottleneckScreen() {
  // Extract route parameters
  const params = useLocalSearchParams();
  const projectId = params.projectId as string;

  /**
   * Handles back navigation
   * If projectId is present, navigates back to the Project Details screen
   * Otherwise, uses standard back navigation
   */
  const handleGoBack = () => {
    if (projectId) {
      // Navigate back to project details with the project ID
      router.push({
        pathname: '/(drawer)/project-details',
        params: { projectId },
      });
    } else {
      // Fallback to standard back navigation
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.cardBackground} />

      {/* Header with back button and title */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleGoBack}
          activeOpacity={0.6}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Bottleneck</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Placeholder content */}
      <View style={styles.content}>
        <View style={styles.placeholderContainer}>
          <Ionicons name="warning-outline" size={80} color={COLORS.textSecondary} />
          <Text style={styles.comingSoonText}>Coming Soon</Text>
          <Text style={styles.descriptionText}>
            The bottleneck creation feature will be available here.
          </Text>
        </View>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    minHeight: 60,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: 12,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  placeholderContainer: {
    alignItems: 'center',
    maxWidth: 300,
  },
  comingSoonText: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 24,
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
