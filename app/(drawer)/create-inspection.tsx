/**
 * Create Inspection Screen
 *
 * This screen allows users to create a new inspection for a project.
 * Currently displays a placeholder UI indicating the feature is coming soon.
 *
 * @screen
 */

import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import ComingSoonScreen from '@/components/ComingSoonScreen';

export default function CreateInspectionScreen() {
  const params = useLocalSearchParams();
  const projectId = params.projectId as string;

  return (
    <ComingSoonScreen
      title="Create New Inspection"
      description="The inspection creation feature will be available here."
      icon="clipboard-outline"
      iconColor="#2196F3"
      projectId={projectId}
    />
  );
}
