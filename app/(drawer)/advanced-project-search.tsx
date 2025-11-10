import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const COLORS = {
  background: '#F5F5F5',
  cardBackground: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#666666',
  border: '#E0E0E0',
  primary: '#2196F3',
  inputBackground: '#F8F8F8',
};

interface Project {
  id: string;
  name: string;
  contractor: string;
  status: 'On Track' | 'Delayed' | 'At Risk';
  category: 'Construction' | 'Maintenance';
}

// Mock project data
const ALL_PROJECTS: Project[] = [
  { id: 'PRJ-2024-001', name: 'Road Construction - NH 44', contractor: 'ABC Builders', status: 'On Track', category: 'Construction' },
  { id: 'PRJ-2024-002', name: 'Bridge Maintenance - City Center', contractor: 'XYZ Infrastructure', status: 'On Track', category: 'Maintenance' },
  { id: 'PRJ-2024-003', name: 'Street Lighting Upgrade', contractor: 'LightTech Solutions', status: 'Delayed', category: 'Maintenance' },
  { id: 'PRJ-2024-004', name: 'Water Supply Pipeline', contractor: 'AquaFlow Systems', status: 'On Track', category: 'Construction' },
  { id: 'PRJ-2024-005', name: 'School Building Renovation', contractor: 'BuildPro Contractors', status: 'At Risk', category: 'Construction' },
  { id: 'PRJ-2024-006', name: 'Park Development - North Zone', contractor: 'Green Spaces Ltd', status: 'On Track', category: 'Construction' },
  { id: 'PRJ-2024-007', name: 'Drainage System Repair', contractor: 'ABC Builders', status: 'Delayed', category: 'Maintenance' },
  { id: 'PRJ-2024-008', name: 'Hospital Wing Extension', contractor: 'MedBuild Corp', status: 'On Track', category: 'Construction' },
  { id: 'PRJ-2024-009', name: 'Traffic Signal Maintenance', contractor: 'SignalTech', status: 'On Track', category: 'Maintenance' },
  { id: 'PRJ-2024-010', name: 'Community Hall Construction', contractor: 'BuildPro Contractors', status: 'At Risk', category: 'Construction' },
];

export default function AdvancedProjectSearchScreen() {
  const [searchText, setSearchText] = useState('');
  const [contractor, setContractor] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const statusOptions = ['On Track', 'Delayed', 'At Risk'];
  const categoryOptions = ['Construction', 'Maintenance'];

  // Live filtering logic
  const filteredProjects = useMemo(() => {
    return ALL_PROJECTS.filter((project) => {
      // Filter by search text (Project Name or ID)
      const matchesSearch = searchText === '' ||
        project.name.toLowerCase().includes(searchText.toLowerCase()) ||
        project.id.toLowerCase().includes(searchText.toLowerCase());

      // Filter by contractor
      const matchesContractor = contractor === '' ||
        project.contractor.toLowerCase().includes(contractor.toLowerCase());

      // Filter by status
      const matchesStatus = selectedStatus === '' || project.status === selectedStatus;

      // Filter by category
      const matchesCategory = selectedCategory === '' || project.category === selectedCategory;

      return matchesSearch && matchesContractor && matchesStatus && matchesCategory;
    });
  }, [searchText, contractor, selectedStatus, selectedCategory]);

  const goBack = () => {
    router.back();
  };

  const navigateToProjectDetails = (projectId: string) => {
    router.push({
      pathname: '/(drawer)/project-details',
      params: { projectId },
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'On Track':
        return '#4CAF50';
      case 'Delayed':
        return '#F44336';
      case 'At Risk':
        return '#FF9800';
      default:
        return COLORS.textSecondary;
    }
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
        <Text style={styles.headerTitle}>Advanced Project Search</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Form Section */}
        <View style={styles.formSection}>
          {/* Project Name/ID Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Project Name/ID</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="document-text-outline" size={20} color={COLORS.textSecondary} />
              <TextInput
                style={styles.textInput}
                placeholder="Enter project name or ID"
                placeholderTextColor={COLORS.textSecondary}
                value={searchText}
                onChangeText={setSearchText}
              />
              {searchText !== '' && (
                <TouchableOpacity onPress={() => setSearchText('')}>
                  <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Contractor Name Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Contractor Name</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="business-outline" size={20} color={COLORS.textSecondary} />
              <TextInput
                style={styles.textInput}
                placeholder="Enter contractor name"
                placeholderTextColor={COLORS.textSecondary}
                value={contractor}
                onChangeText={setContractor}
              />
              {contractor !== '' && (
                <TouchableOpacity onPress={() => setContractor('')}>
                  <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Status Dropdown */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Status</Text>
            <TouchableOpacity
              style={styles.dropdownContainer}
              onPress={() => setShowStatusModal(true)}
            >
              <Ionicons name="flag-outline" size={20} color={COLORS.textSecondary} />
              <Text style={[styles.dropdownText, selectedStatus && styles.dropdownTextSelected]}>
                {selectedStatus || 'Select status'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Work Category Dropdown */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Work Category</Text>
            <TouchableOpacity
              style={styles.dropdownContainer}
              onPress={() => setShowCategoryModal(true)}
            >
              <Ionicons name="grid-outline" size={20} color={COLORS.textSecondary} />
              <Text style={[styles.dropdownText, selectedCategory && styles.dropdownTextSelected]}>
                {selectedCategory || 'Select category'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Clear Filters Button */}
          {(searchText || contractor || selectedStatus || selectedCategory) && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => {
                setSearchText('');
                setContractor('');
                setSelectedStatus('');
                setSelectedCategory('');
              }}
            >
              <Ionicons name="refresh" size={18} color={COLORS.primary} />
              <Text style={styles.clearButtonText}>Clear All Filters</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Results Section */}
        <View style={styles.resultsSection}>
          <Text style={styles.resultsTitle}>
            Results ({filteredProjects.length})
          </Text>

          {filteredProjects.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={64} color={COLORS.textSecondary} />
              <Text style={styles.emptyStateText}>No projects found</Text>
              <Text style={styles.emptyStateSubtext}>
                Try adjusting your search criteria
              </Text>
            </View>
          ) : (
            filteredProjects.map((project) => (
              <TouchableOpacity
                key={project.id}
                style={styles.projectCard}
                onPress={() => navigateToProjectDetails(project.id)}
                activeOpacity={0.7}
              >
                <View style={styles.projectCardHeader}>
                  <Text style={styles.projectName}>{project.name}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(project.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(project.status) }]}>
                      {project.status}
                    </Text>
                  </View>
                </View>
                <Text style={styles.projectId}>{project.id}</Text>
                <View style={styles.projectMeta}>
                  <Ionicons name="business" size={14} color={COLORS.textSecondary} />
                  <Text style={styles.projectMetaText}>{project.contractor}</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* Status Modal */}
      <Modal
        visible={showStatusModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowStatusModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowStatusModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Status</Text>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                setSelectedStatus('');
                setShowStatusModal(false);
              }}
            >
              <Text style={styles.modalOptionText}>All Statuses</Text>
              {selectedStatus === '' && (
                <Ionicons name="checkmark" size={20} color={COLORS.primary} />
              )}
            </TouchableOpacity>
            {statusOptions.map((status) => (
              <TouchableOpacity
                key={status}
                style={styles.modalOption}
                onPress={() => {
                  setSelectedStatus(status);
                  setShowStatusModal(false);
                }}
              >
                <Text style={styles.modalOptionText}>{status}</Text>
                {selectedStatus === status && (
                  <Ionicons name="checkmark" size={20} color={COLORS.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Category Modal */}
      <Modal
        visible={showCategoryModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCategoryModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Category</Text>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                setSelectedCategory('');
                setShowCategoryModal(false);
              }}
            >
              <Text style={styles.modalOptionText}>All Categories</Text>
              {selectedCategory === '' && (
                <Ionicons name="checkmark" size={20} color={COLORS.primary} />
              )}
            </TouchableOpacity>
            {categoryOptions.map((category) => (
              <TouchableOpacity
                key={category}
                style={styles.modalOption}
                onPress={() => {
                  setSelectedCategory(category);
                  setShowCategoryModal(false);
                }}
              >
                <Text style={styles.modalOptionText}>{category}</Text>
                {selectedCategory === category && (
                  <Ionicons name="checkmark" size={20} color={COLORS.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
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
    paddingBottom: 24,
  },
  formSection: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBackground,
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 15,
    color: COLORS.text,
  },
  dropdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBackground,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
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
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  clearButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 6,
  },
  resultsSection: {
    marginBottom: 24,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  projectCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  projectCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  projectName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  projectId: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  projectMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  projectMetaText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginLeft: 6,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalOptionText: {
    fontSize: 16,
    color: COLORS.text,
  },
});
