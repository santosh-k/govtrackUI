/**
 * Create Complaint Screen
 *
 * This screen allows users to create a new complaint for a project.
 * Currently displays a placeholder UI indicating the feature is coming soon.
 *
 * @screen
 */

import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import ComingSoonScreen from '@/components/ComingSoonScreen';

export default function CreateComplaintScreen() {
  const params = useLocalSearchParams();
  const projectId = params.projectId as string;

  return (
    <ComingSoonScreen
      title="Create Complaint"
      description="The Create Complaint feature is currently under development. Check back soon!"
      icon="document-text-outline"
      projectId={projectId}
    />
  );
}
