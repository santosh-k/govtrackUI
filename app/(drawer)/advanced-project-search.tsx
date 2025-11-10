import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

const COLORS = {
  background: '#F5F5F5',
  cardBackground: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#666666',
  border: '#E0E0E0',
  primary: '#FF9800', // Saffron/Orange accent
  inputBackground: '#F8F8F8',
};

export default function SearchProjectScreen() {
  const params = useLocalSearchParams();

  const [selectedProjectType, setSelectedProjectType] = useState<string>('');
  const [selectedDivision, setSelectedDivision] = useState<string>('');
  const [selectedSubDivision, setSelectedSubDivision] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedZone, setSelectedZone] = useState<string>('');

  // Update state when returning from selection screen
  useEffect(() => {
    if (params.projectType) setSelectedProjectType(params.projectType as string);
    if (params.division) setSelectedDivision(params.division as string);
    if (params.subDivision) setSelectedSubDivision(params.subDivision as string);
    if (params.department) setSelectedDepartment(params.department as string);
    if (params.zone) setSelectedZone(params.zone as string);
  }, [params]);

  const goBack = () => {
    router.back();
  };

  const handleFindProjects = () => {
    // Build filter string
    const filterParts = [];
    if (selectedProjectType) filterParts.push(selectedProjectType);
    if (selectedDivision) filterParts.push(selectedDivision);
    if (selectedSubDivision) filterParts.push(selectedSubDivision);
    if (selectedDepartment) filterParts.push(selectedDepartment);
    if (selectedZone) filterParts.push(selectedZone);

    const filterDisplay = filterParts.length > 0
      ? `Search Results - ${filterParts.join(', ')}`
      : 'Search Results';

    // Navigate to project list with filters
    router.push({
      pathname: '/(drawer)/project-list',
      params: {
        filter: filterDisplay,
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
        <Text style={styles.headerTitle}>Search Project</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Filter Form Section */}
        <View style={styles.formSection}>
          <Text style={styles.formTitle}>Select Filters</Text>
          <Text style={styles.formSubtitle}>
            Choose one or more criteria to search for projects
          </Text>

          {/* Project Type Dropdown */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Project Type</Text>
            <TouchableOpacity
              style={styles.dropdownContainer}
              onPress={() => {
                router.push({
                  pathname: '/(drawer)/select-project-filter',
                  params: {
                    filterType: 'projectType',
                    currentValue: selectedProjectType,
                  },
                });
              }}
            >
              <Ionicons name="construct-outline" size={20} color={COLORS.textSecondary} />
              <Text style={[styles.dropdownText, selectedProjectType && styles.dropdownTextSelected]}>
                {selectedProjectType || 'Select project type'}
              </Text>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Division Dropdown */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Division</Text>
            <TouchableOpacity
              style={styles.dropdownContainer}
              onPress={() => {
                router.push({
                  pathname: '/(drawer)/select-project-filter',
                  params: {
                    filterType: 'division',
                    currentValue: selectedDivision,
                  },
                });
              }}
            >
              <Ionicons name="business-outline" size={20} color={COLORS.textSecondary} />
              <Text style={[styles.dropdownText, selectedDivision && styles.dropdownTextSelected]}>
                {selectedDivision || 'Select division'}
              </Text>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Sub-Division Dropdown */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Sub-Division</Text>
            <TouchableOpacity
              style={styles.dropdownContainer}
              onPress={() => {
                router.push({
                  pathname: '/(drawer)/select-project-filter',
                  params: {
                    filterType: 'subDivision',
                    currentValue: selectedSubDivision,
                  },
                });
              }}
            >
              <Ionicons name="git-branch-outline" size={20} color={COLORS.textSecondary} />
              <Text style={[styles.dropdownText, selectedSubDivision && styles.dropdownTextSelected]}>
                {selectedSubDivision || 'Select sub-division'}
              </Text>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Department Dropdown */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Department</Text>
            <TouchableOpacity
              style={styles.dropdownContainer}
              onPress={() => {
                router.push({
                  pathname: '/(drawer)/select-project-filter',
                  params: {
                    filterType: 'department',
                    currentValue: selectedDepartment,
                  },
                });
              }}
            >
              <Ionicons name="briefcase-outline" size={20} color={COLORS.textSecondary} />
              <Text style={[styles.dropdownText, selectedDepartment && styles.dropdownTextSelected]}>
                {selectedDepartment || 'Select department'}
              </Text>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Zone Dropdown */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Zone</Text>
            <TouchableOpacity
              style={styles.dropdownContainer}
              onPress={() => {
                router.push({
                  pathname: '/(drawer)/select-project-filter',
                  params: {
                    filterType: 'zone',
                    currentValue: selectedZone,
                  },
                });
              }}
            >
              <Ionicons name="map-outline" size={20} color={COLORS.textSecondary} />
              <Text style={[styles.dropdownText, selectedZone && styles.dropdownTextSelected]}>
                {selectedZone || 'Select zone'}
              </Text>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Find Project Button */}
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity
          style={styles.findButton}
          onPress={handleFindProjects}
          activeOpacity={0.8}
        >
          <Ionicons name="search" size={20} color="#FFFFFF" />
          <Text style={styles.findButtonText}>Find Project</Text>
        </TouchableOpacity>
      </View>
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
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  dropdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBackground,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dropdownText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textSecondary,
    marginLeft: 12,
  },
  dropdownTextSelected: {
    color: COLORS.text,
    fontWeight: '500',
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
