import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

const COLORS = {
  background: '#F5F5F5',
  cardBackground: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#666666',
  textLight: '#9E9E9E',
  primary: '#2196F3',
  border: '#E0E0E0',
  searchBg: '#F8F8F8',
  selected: '#E3F2FD',
};

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
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredOptions = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return DEPARTMENTS;
    }
    const query = searchQuery.toLowerCase();
    return DEPARTMENTS.filter((option) => option.toLowerCase().includes(query));
  }, [searchQuery]);

  const handleSelectOption = (option: string) => {
    if (global.filterSelectionCallback) {
      global.filterSelectionCallback('department', option);
    }
    router.back();
  };

  const handleClearSelection = () => {
    if (global.filterSelectionCallback) {
      global.filterSelectionCallback('department', '');
    }
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.cardBackground} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.6}
        >
          <Ionicons name="arrow-back" size={28} color={COLORS.text} />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Select Department</Text>
        </View>

        <View style={styles.headerSpacer} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={COLORS.textLight} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            placeholderTextColor={COLORS.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.6}>
              <Ionicons name="close-circle" size={20} color={COLORS.textLight} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Options List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* All/Clear Option */}
        <TouchableOpacity
          style={[
            styles.optionItem,
            !selectedValue && styles.optionItemSelected,
          ]}
          onPress={handleClearSelection}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.optionText,
              !selectedValue && styles.optionTextSelected,
            ]}
          >
            All Departments
          </Text>
          {!selectedValue && (
            <Ionicons name="checkmark" size={24} color={COLORS.primary} />
          )}
        </TouchableOpacity>

        {filteredOptions.map((option, index) => {
          const isSelected = selectedValue === option;
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionItem,
                isSelected && styles.optionItemSelected,
              ]}
              onPress={() => handleSelectOption(option)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.optionText,
                  isSelected && styles.optionTextSelected,
                ]}
              >
                {option}
              </Text>
              {isSelected && (
                <Ionicons name="checkmark" size={24} color={COLORS.primary} />
              )}
            </TouchableOpacity>
          );
        })}

        {filteredOptions.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No results found</Text>
          </View>
        )}
      </ScrollView>
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
    justifyContent: 'space-between',
    backgroundColor: COLORS.cardBackground,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  headerSpacer: {
    width: 44,
  },
  searchContainer: {
    backgroundColor: COLORS.cardBackground,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.searchBg,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    paddingVertical: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  optionItemSelected: {
    backgroundColor: COLORS.selected,
    borderColor: COLORS.primary,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    flex: 1,
  },
  optionTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.textLight,
  },
});
