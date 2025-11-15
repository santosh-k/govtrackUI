/**
 * Create Complaint Screen
 *
 * This screen allows users to create a new complaint for a project.
 * Currently displays a placeholder UI indicating the feature is coming soon.
 * When navigated from the Speed Dial FAB, it receives the projectId as a parameter
 * and navigates back to the Project Details screen when the back button is pressed.
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
  primary: '#FF9800',
};

/**
 * CreateComplaintScreen Component
 *
 * Renders the create complaint interface with a back button
 * and placeholder content for the upcoming feature.
 */
export default function CreateComplaintScreen() {
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
        <Text style={styles.headerTitle}>Create Complaint</Text>
      </View>

      {/* Placeholder content */}
      <View style={styles.contentContainer}>
        <Ionicons name="document-text-outline" size={80} color={COLORS.primary} />
        <Text style={styles.title}>Coming Soon</Text>
        <Text style={styles.description}>
          The Create Complaint feature is currently under development. Check back soon!
        </Text>
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
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
    marginRight: 8,
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
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 24,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
