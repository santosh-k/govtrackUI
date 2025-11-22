import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

const COLORS = {
  background: '#F5F5F5',
  cardBackground: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#666666',
  textPlaceholder: '#BDBDBD',
  border: '#E0E0E0',
  primary: '#FF9800',
  inputBackground: '#F8F8F8',
};

export default function SearchAssetScreen() {
  const params = useLocalSearchParams();

  const [selectedZone, setSelectedZone] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedDivision, setSelectedDivision] = useState<string>('');
  const [selectedSubDivision, setSelectedSubDivision] = useState<string>('');
  const [selectedAssetCategory, setSelectedAssetCategory] = useState<string>('');
  const [searchText, setSearchText] = useState<string>('');

  // Update state when returning from selection screen
  useEffect(() => {
    if (params.zone) setSelectedZone(params.zone as string);
    if (params.department) setSelectedDepartment(params.department as string);
    if (params.division) setSelectedDivision(params.division as string);
    if (params.subDivision) setSelectedSubDivision(params.subDivision as string);
    if (params.assetCategory) setSelectedAssetCategory(params.assetCategory as string);
  }, [params]);

  const goBack = () => {
    router.back();
  };

  const handleFindAssets = () => {
    // Build filter string
    const filterParts = [];
    if (selectedZone) filterParts.push(selectedZone);
    if (selectedDepartment) filterParts.push(selectedDepartment);
    if (selectedDivision) filterParts.push(selectedDivision);
    if (selectedSubDivision) filterParts.push(selectedSubDivision);
    if (selectedAssetCategory) filterParts.push(selectedAssetCategory);
    if (searchText) filterParts.push(searchText);

    const filterDisplay = filterParts.length > 0
      ? `Search Results - ${filterParts.join(', ')}`
      : 'Search Results';

    // Reset all form fields
    setSelectedZone('');
    setSelectedDepartment('');
    setSelectedDivision('');
    setSelectedSubDivision('');
    setSelectedAssetCategory('');
    setSearchText('');

    // Navigate to asset list with filters
    router.push({
      pathname: '/(drawer)/asset-list',
      params: {
        filter: filterDisplay,
        zone: selectedZone,
        department: selectedDepartment,
        division: selectedDivision,
        subDivision: selectedSubDivision,
        assetCategory: selectedAssetCategory,
        searchText: searchText,
      },
    });
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
        <Text style={styles.headerTitle}>Search Assets</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
        {/* Filter Form Section */}
        <View style={styles.formSection}>
          <Text style={styles.formTitle}>Select Filters</Text>
          <Text style={styles.formSubtitle}>
            Choose one or more criteria to search for assets
          </Text>

          {/* Zone Dropdown */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Zone</Text>
            <TouchableOpacity
              style={styles.dropdownContainer}
              onPress={() => {
                router.push({
                  pathname: '/(drawer)/selection-screen',
                  params: {
                    title: 'Select a Zone',
                    dataKey: 'zones',
                    returnField: 'zone',
                    returnTo: 'search-asset',
                    currentValue: selectedZone,
                  },
                });
              }}
            >
              <Text style={[styles.dropdownText, !selectedZone && styles.dropdownTextPlaceholder]}>
                {selectedZone || 'Select a Zone'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Department Dropdown */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Department</Text>
            <TouchableOpacity
              style={styles.dropdownContainer}
              onPress={() => {
                router.push({
                  pathname: '/(drawer)/selection-screen',
                  params: {
                    title: 'Select a Department',
                    dataKey: 'departments',
                    returnField: 'department',
                    returnTo: 'search-asset',
                    currentValue: selectedDepartment,
                  },
                });
              }}
            >
              <Text style={[styles.dropdownText, !selectedDepartment && styles.dropdownTextPlaceholder]}>
                {selectedDepartment || 'Select a Department'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Division Dropdown */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Division</Text>
            <TouchableOpacity
              style={styles.dropdownContainer}
              onPress={() => {
                router.push({
                  pathname: '/(drawer)/selection-screen',
                  params: {
                    title: 'Select a Division',
                    dataKey: 'divisions',
                    returnField: 'division',
                    returnTo: 'search-asset',
                    currentValue: selectedDivision,
                  },
                });
              }}
            >
              <Text style={[styles.dropdownText, !selectedDivision && styles.dropdownTextPlaceholder]}>
                {selectedDivision || 'Select a Division'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Sub-Division Dropdown */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Sub-Division</Text>
            <TouchableOpacity
              style={styles.dropdownContainer}
              onPress={() => {
                router.push({
                  pathname: '/(drawer)/selection-screen',
                  params: {
                    title: 'Select a Sub-Division',
                    dataKey: 'subDivisions',
                    returnField: 'subDivision',
                    returnTo: 'search-asset',
                    currentValue: selectedSubDivision,
                  },
                });
              }}
            >
              <Text style={[styles.dropdownText, !selectedSubDivision && styles.dropdownTextPlaceholder]}>
                {selectedSubDivision || 'Select a Sub-Division'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Asset Category Dropdown */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Asset Category</Text>
            <TouchableOpacity
              style={styles.dropdownContainer}
              onPress={() => {
                router.push({
                  pathname: '/(drawer)/selection-screen',
                  params: {
                    title: 'Select an Asset Category',
                    dataKey: 'assetCategories',
                    returnField: 'assetCategory',
                    returnTo: 'search-asset',
                    currentValue: selectedAssetCategory,
                  },
                });
              }}
            >
              <Text style={[styles.dropdownText, !selectedAssetCategory && styles.dropdownTextPlaceholder]}>
                {selectedAssetCategory || 'Select an Asset Category'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Free-Text Search Box */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Asset Name or ID (Optional)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter asset name or ID..."
              placeholderTextColor={COLORS.textPlaceholder}
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>
        </View>
      </ScrollView>

        {/* Find Assets Button */}
        <View style={styles.bottomButtonContainer}>
          <TouchableOpacity
            style={styles.findButton}
            onPress={handleFindAssets}
            activeOpacity={0.8}
          >
            <Ionicons name="search" size={20} color="#FFFFFF" />
            <Text style={styles.findButtonText}>Find Assets</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardAvoidingView: {
    flex: 1,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
  formSection: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 24,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  dropdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    minHeight: 52,
  },
  dropdownText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '500',
  },
  dropdownTextPlaceholder: {
    color: COLORS.textPlaceholder,
    fontWeight: '400',
  },
  textInput: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: COLORS.text,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    minHeight: 52,
  },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.cardBackground,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  },
  findButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  findButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});
