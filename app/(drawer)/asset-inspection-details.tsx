import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import ComingSoonScreen from '@/components/ComingSoonScreen';

export default function AssetInspectionDetailsScreen() {
  const params = useLocalSearchParams();
  const assetId = params.assetId as string;

  return (
    <ComingSoonScreen
      title="Asset Inspection Details"
      description={`Detailed inspection view for ${assetId || 'this asset'} is currently under development. This will include asset information, inspection history, maintenance records, and action buttons.`}
      icon="clipboard-outline"
    />
  );
}
