import React from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import SelectionScreen from '@/components/SelectionScreen';

const DEPARTMENTS = [
  'Roads & Infrastructure',
  'Electrical Maintenance',
  'Horticulture',
  'Building Projects',
  'Sanitation Department',
  'Water Management',
];

export default function SelectDepartmentScreen() {
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
      title="Select Department"
      options={DEPARTMENTS}
      selectedValue={selectedValue}
      onSelect={handleSelect}
    />
  );
}
