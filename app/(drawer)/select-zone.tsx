import React from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import SelectionScreen from '@/components/SelectionScreen';

const ZONES = [
  'North Delhi',
  'South Delhi',
  'East Delhi',
  'West Delhi',
  'Central Delhi',
  'New Delhi',
];

export default function SelectZoneScreen() {
  const params = useLocalSearchParams();
  const selectedValue = params.selected as string;

  const handleSelect = (value: string) => {
    // Navigate back with the selected value
    if (router.canGoBack()) {
      router.back();
    }
    // The parent screen will handle updating the filter state
  };

  return (
    <SelectionScreen
      title="Select Zone"
      options={ZONES}
      selectedValue={selectedValue}
      onSelect={handleSelect}
    />
  );
}
