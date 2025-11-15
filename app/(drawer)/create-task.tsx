/**
 * Create Task Screen
 *
 * This screen allows users to create a new task for a project.
 * Currently displays a placeholder UI indicating the feature is coming soon.
 *
 * @screen
 */

import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import ComingSoonScreen from '@/components/ComingSoonScreen';

export default function CreateTaskScreen() {
  const params = useLocalSearchParams();
  const projectId = params.projectId as string;

  return (
    <ComingSoonScreen
      title="Create Task"
      description="The Create Task feature is currently under development. Check back soon!"
      icon="construct-outline"
      projectId={projectId}
    />
  );
}
