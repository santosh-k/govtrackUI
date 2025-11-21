import React, { useState, useMemo } from 'react';
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
import selectionData from '@/data/selectionData.json';

const COLORS = {
  background: '#F5F5F5',
  cardBackground: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#666666',
  textLight: '#9E9E9E',
  border: '#E0E0E0',
  primary: '#FF9800',
  inputBackground: '#F8F8F8',
  selectedBackground: '#FFF3E0',
};

interface SelectionItem {
  id: string;
  name: string;
}

type DataKey = 'zones' | 'departments' | 'divisions' | 'subDivisions' | 'projectTypes' | 'taskCategories' | 'issueTypes' | 'assetCategories';

export default function SelectionScreen() {
  const params = useLocalSearchParams();
  const title = params.title as string;
  const dataKey = params.dataKey as DataKey;
  const currentValue = params.currentValue as string;
  const returnField = params.returnField as string;
  const returnTo = params.returnTo as string;

  const [searchQuery, setSearchQuery] = useState('');

  // Get data from JSON based on dataKey
  const allData: SelectionItem[] = useMemo(() => {
    return (selectionData[dataKey] || []) as SelectionItem[];
  }, [dataKey]);

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (searchQuery.trim() === '') {
      return allData;
    }
    return allData.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allData, searchQuery]);

  const handleBack = () => {
    router.back();
  };

  const handleSelectItem = (item: SelectionItem) => {
    // Navigate back to the calling screen with the selected value
    const pathname = returnTo
      ? (`/(drawer)/${returnTo}` as any)
      : '/(drawer)/advanced-project-search';

    // Preserve all params except the selection-specific ones
    const { title: _title, dataKey: _dataKey, currentValue: _currentValue, returnField: _returnField, returnTo: _returnTo, ...restParams } = params;

    router.push({
      pathname,
      params: {
        ...restParams,
        [returnField]: item.name,
      },
    });
  };

  const renderItem = ({ item }: { item: SelectionItem }) => {
    const isSelected = item.name === currentValue;

    return (
      <TouchableOpacity
        style={[styles.listItem, isSelected && styles.listItemSelected]}
        onPress={() => handleSelectItem(item)}
        activeOpacity={0.7}
      >
        <Text style={[styles.listItemText, isSelected && styles.listItemTextSelected]}>
          {item.name}
        </Text>
        {isSelected && (
          <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
        )}
      </TouchableOpacity>
    );
  };

  const renderSeparator = () => <View style={styles.separator} />;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.cardBackground} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
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
            placeholderTextColor={COLORS.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
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
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={renderSeparator}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={64} color={COLORS.textLight} />
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
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    marginLeft: 10,
    paddingVertical: 0,
  },
  listContent: {
    flexGrow: 1,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.cardBackground,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  listItemSelected: {
    backgroundColor: COLORS.selectedBackground,
  },
  listItemText: {
    fontSize: 15,
    color: COLORS.text,
    flex: 1,
    fontWeight: '400',
  },
  listItemTextSelected: {
    fontWeight: '600',
    color: COLORS.primary,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
});
