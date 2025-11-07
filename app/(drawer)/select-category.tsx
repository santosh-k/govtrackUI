import React from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import SelectionScreen from '@/components/SelectionScreen';

const CATEGORIES = [
  'Pothole Repair',
  'Streetlight Outage',
  'Water Leakage',
  'Building Maintenance',
  'Garbage Collection Issue',
  'Damaged Signage',
  'Park Maintenance',
];

export default function SelectCategoryScreen() {
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
      title="Select Category"
      options={CATEGORIES}
      selectedValue={selectedValue}
      onSelect={handleSelect}
    />
  );
}
