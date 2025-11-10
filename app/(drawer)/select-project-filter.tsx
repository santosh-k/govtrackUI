import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  TextInput,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

const COLORS = {
  background: '#F5F5F5',
  cardBackground: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#666666',
  border: '#E0E0E0',
  primary: '#FF9800',
  inputBackground: '#F8F8F8',
};

// Mock data for each filter type
const FILTER_DATA: { [key: string]: string[] } = {
  projectType: [
    'Construction Work',
    'Maintenance Work',
    'Road Development',
    'Building Construction',
    'Infrastructure Development',
    'Renovation Project',
  ],
  division: [
    'North Division',
    'South Division',
    'East Division',
    'West Division',
    'Central Division',
  ],
  subDivision: [
    'North Sub-Division A',
    'North Sub-Division B',
    'South Sub-Division A',
    'South Sub-Division B',
    'East Sub-Division A',
    'East Sub-Division B',
    'West Sub-Division A',
    'West Sub-Division B',
  ],
  department: [
    'Public Works Department',
    'Water Supply Department',
    'Electrical Department',
    'Roads & Bridges Department',
    'Building Department',
    'Urban Development Department',
  ],
  zone: [
    'Zone 1 - North',
    'Zone 2 - South',
    'Zone 3 - East',
    'Zone 4 - West',
    'Zone 5 - Central',
    'Zone 6 - Suburban',
  ],
};

const TITLES: { [key: string]: string } = {
  projectType: 'Select Project Type',
  division: 'Select Division',
  subDivision: 'Select Sub-Division',
  department: 'Select Department',
  zone: 'Select Zone',
};

export default function SelectProjectFilterScreen() {
  const params = useLocalSearchParams();
  const filterType = params.filterType as string;
  const currentValue = params.currentValue as string;

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState<string[]>([]);

  const title = TITLES[filterType] || 'Select Option';

  useEffect(() => {
    const data = FILTER_DATA[filterType] || [];
    if (searchQuery.trim() === '') {
      setFilteredData(data);
    } else {
      const filtered = data.filter((item) =>
        item.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredData(filtered);
    }
  }, [searchQuery, filterType]);

  const goBack = () => {
    router.back();
  };

  const handleSelectItem = (item: string) => {
    // Navigate back with the selected value
    router.push({
      pathname: '/(drawer)/advanced-project-search',
      params: {
        [filterType]: item,
      },
    });
  };

  const renderItem = ({ item }: { item: string }) => {
    const isSelected = item === currentValue;

    return (
      <TouchableOpacity
        style={[styles.listItem, isSelected && styles.listItemSelected]}
        onPress={() => handleSelectItem(item)}
        activeOpacity={0.7}
      >
        <Text style={[styles.listItemText, isSelected && styles.listItemTextSelected]}>
          {item}
        </Text>
        {isSelected && (
          <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={goBack}
          activeOpacity={0.6}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={COLORS.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            placeholderTextColor={COLORS.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* List */}
      <FlatList
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item}-${index}`}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={64} color={COLORS.textSecondary} />
            <Text style={styles.emptyStateText}>No results found</Text>
            <Text style={styles.emptyStateSubtext}>
              Try searching with different keywords
            </Text>
          </View>
        }
      />
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
  searchContainer: {
    backgroundColor: COLORS.cardBackground,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBackground,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    marginLeft: 8,
    paddingVertical: 0,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.cardBackground,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  listItemSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  listItemText: {
    fontSize: 15,
    color: COLORS.text,
    flex: 1,
  },
  listItemTextSelected: {
    fontWeight: '600',
    color: COLORS.primary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
});
