import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  FlatList,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const COLORS = {
  background: '#F5F5F5',
  cardBackground: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#666666',
  textLight: '#999999',
  border: '#E0E0E0',
  progressBackground: '#E8E8E8',
  searchBarBackground: '#F0F0F0',
  // Status colors
  statusOnTrack: '#4CAF50',
  statusOnTrackBg: '#E8F5E9',
  statusAtRisk: '#FF9800',
  statusAtRiskBg: '#FFF3E0',
  statusDelayed: '#F44336',
  statusDelayedBg: '#FFEBEE',
  statusCompleted: '#2196F3',
  statusCompletedBg: '#E3F2FD',
};

type ProjectStatus = 'On Track' | 'At Risk' | 'Delayed' | 'Completed';

interface Project {
  id: string;
  name: string;
  projectType: string;
  status: ProjectStatus;
  progress: number;
  startDate: string;
  endDate: string;
  totalCost: string;
  expenditure: string;
  expectedCompletionDate: string;
  financialExpenditure: string;
}

// Helper function to get status colors
const getStatusColors = (status: ProjectStatus) => {
  switch (status) {
    case 'On Track':
      return { bg: COLORS.statusOnTrackBg, text: COLORS.statusOnTrack };
    case 'At Risk':
      return { bg: COLORS.statusAtRiskBg, text: COLORS.statusAtRisk };
    case 'Delayed':
      return { bg: COLORS.statusDelayedBg, text: COLORS.statusDelayed };
    case 'Completed':
      return { bg: COLORS.statusCompletedBg, text: COLORS.statusCompleted };
    default:
      return { bg: COLORS.statusOnTrackBg, text: COLORS.statusOnTrack };
  }
};

interface ProjectCardProps {
  project: Project;
  onPress: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onPress }) => {
  const statusColors = getStatusColors(project.status);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Top Row: Project ID and Status Badge */}
      <View style={styles.cardTopRow}>
        <Text style={styles.projectId}>{project.id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
          <Text style={[styles.statusText, { color: statusColors.text }]}>
            {project.status}
          </Text>
        </View>
      </View>

      {/* Main Body: Project Name and Type */}
      <Text style={styles.projectName} numberOfLines={3}>
        {project.name}
      </Text>
      <Text style={styles.projectType}>{project.projectType}</Text>

      {/* Progress Section */}
      <View style={styles.progressSection}>
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${project.progress}%`, backgroundColor: statusColors.text },
            ]}
          />
        </View>
        <Text style={styles.progressText}>{project.progress}%</Text>
      </View>

      {/* Financials Section - 2x2 Grid */}
      <View style={styles.financialsSection}>
        {/* Top Row */}
        <View style={styles.financialRow}>
          <View style={styles.financialStatBlockLeft}>
            <Text style={styles.financialLabel}>Total Cost</Text>
            <Text style={styles.financialValue}>{project.totalCost}</Text>
          </View>
          <View style={styles.financialStatBlockRight}>
            <Text style={styles.financialLabel}>Expenditure</Text>
            <Text style={styles.financialValue}>{project.expenditure}</Text>
          </View>
        </View>

        {/* Bottom Row */}
        <View style={styles.financialRow}>
          <View style={styles.financialStatBlockLeft}>
            <Text style={styles.financialLabel}>Exp. Comp. Date</Text>
            <Text style={styles.financialValue}>{project.expectedCompletionDate}</Text>
          </View>
          <View style={styles.financialStatBlockRight}>
            <Text style={styles.financialLabel}>Financial Exp.</Text>
            <Text style={styles.financialValue}>{project.financialExpenditure}</Text>
          </View>
        </View>
      </View>

      {/* Footer Row: Dates and Action */}
      <View style={styles.cardFooter}>
        <Text style={styles.datesText}>
          Start: {project.startDate} | End: {project.endDate}
        </Text>
        <View style={styles.viewDetailsContainer}>
          <Text style={styles.viewDetailsText}>View Details</Text>
          <Ionicons name="chevron-forward" size={16} color={COLORS.text} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Sample project data with realistic information
const ALL_PROJECTS: Project[] = [
    {
      id: 'PRJ-2024-001',
      name: 'National Highway 44 Widening and Resurfacing Project',
      projectType: 'Road Construction',
      status: 'On Track',
      progress: 75,
      startDate: '01-Jan-24',
      endDate: '31-Dec-24',
      totalCost: '₹5.0 Cr',
      expenditure: '₹3.8 Cr',
      expectedCompletionDate: '31-Mar-25',
      financialExpenditure: '76%',
    },
    {
      id: 'PRJ-2024-002',
      name: 'City Center Bridge Maintenance and Structural Repair',
      projectType: 'Bridge Maintenance',
      status: 'At Risk',
      progress: 45,
      startDate: '15-Feb-24',
      endDate: '30-Nov-24',
      totalCost: '₹8.2 Cr',
      expenditure: '₹4.1 Cr',
      expectedCompletionDate: '15-Jan-25',
      financialExpenditure: '50%',
    },
    {
      id: 'PRJ-2024-003',
      name: 'LED Street Lighting Upgrade',
      projectType: 'Electrical Work',
      status: 'Completed',
      progress: 100,
      startDate: '10-Jan-24',
      endDate: '30-Jun-24',
      totalCost: '₹2.5 Cr',
      expenditure: '₹2.5 Cr',
      expectedCompletionDate: '30-Jun-24',
      financialExpenditure: '100%',
    },
    {
      id: 'PRJ-2024-004',
      name: 'Water Supply Pipeline Installation and Distribution Network Expansion for Eastern District',
      projectType: 'Water Infrastructure',
      status: 'Delayed',
      progress: 30,
      startDate: '01-Mar-24',
      endDate: '31-Aug-24',
      totalCost: '₹12.0 Cr',
      expenditure: '₹4.2 Cr',
      expectedCompletionDate: '31-Dec-24',
      financialExpenditure: '35%',
    },
    {
      id: 'PRJ-2024-005',
      name: 'Government School Building Renovation',
      projectType: 'Building Renovation',
      status: 'On Track',
      progress: 62,
      startDate: '20-Feb-24',
      endDate: '15-Oct-24',
      totalCost: '₹4.5 Cr',
      expenditure: '₹2.9 Cr',
      expectedCompletionDate: '15-Oct-24',
      financialExpenditure: '64%',
    },
    {
      id: 'PRJ-2024-006',
      name: 'Metro Station Connectivity Road',
      projectType: 'Road Construction',
      status: 'On Track',
      progress: 88,
      startDate: '05-Jan-24',
      endDate: '20-Sep-24',
      totalCost: '₹6.8 Cr',
      expenditure: '₹6.0 Cr',
      expectedCompletionDate: '20-Sep-24',
      financialExpenditure: '88%',
    },
    {
      id: 'PRJ-2024-007',
      name: 'Urban Drainage System Repair and Cleaning',
      projectType: 'Drainage Work',
      status: 'At Risk',
      progress: 55,
      startDate: '10-Apr-24',
      endDate: '30-Oct-24',
      totalCost: '₹3.2 Cr',
      expenditure: '₹1.9 Cr',
      expectedCompletionDate: '15-Nov-24',
      financialExpenditure: '59%',
    },
    {
      id: 'PRJ-2024-008',
      name: 'Central Park Development Project with Green Spaces and Recreation Facilities',
      projectType: 'Park Development',
      status: 'Delayed',
      progress: 25,
      startDate: '01-Feb-24',
      endDate: '31-Jul-24',
      totalCost: '₹7.5 Cr',
      expenditure: '₹2.3 Cr',
      expectedCompletionDate: '30-Oct-24',
      financialExpenditure: '31%',
    },
    {
      id: 'PRJ-2024-009',
      name: 'Flyover Construction - East-West Corridor',
      projectType: 'Flyover Construction',
      status: 'On Track',
      progress: 42,
      startDate: '01-Jan-24',
      endDate: '31-Dec-25',
      totalCost: '₹18.0 Cr',
      expenditure: '₹7.8 Cr',
      expectedCompletionDate: '31-Dec-25',
      financialExpenditure: '43%',
    },
    {
      id: 'PRJ-2024-010',
      name: 'Historical Monument Restoration',
      projectType: 'Heritage Conservation',
      status: 'Completed',
      progress: 100,
      startDate: '01-Nov-23',
      endDate: '30-May-24',
      totalCost: '₹3.8 Cr',
      expenditure: '₹3.8 Cr',
      expectedCompletionDate: '30-May-24',
      financialExpenditure: '100%',
    },
  ];

export default function ProjectListScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  const navigateBack = () => {
    router.push('/(drawer)/(tabs)/projects');
  };

  const navigateToProjectDetails = (projectId: string) => {
    router.push({
      pathname: '/(drawer)/project-details',
      params: { projectId },
    });
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  // Filter projects based on search query
  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) {
      return ALL_PROJECTS;
    }

    const query = searchQuery.toLowerCase().trim();
    return ALL_PROJECTS.filter((project) => {
      const nameMatch = project.name.toLowerCase().includes(query);
      const idMatch = project.id.toLowerCase().includes(query);
      return nameMatch || idMatch;
    });
  }, [searchQuery]);

  const renderProjectItem = ({ item }: { item: Project }) => (
    <ProjectCard
      project={item}
      onPress={() => navigateToProjectDetails(item.id)}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="search-outline" size={64} color={COLORS.textLight} />
      <Text style={styles.emptyStateTitle}>No projects found</Text>
      <Text style={styles.emptyStateText}>
        No projects match your search criteria.{'\n'}
        Try adjusting your search terms.
      </Text>
    </View>
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.cardBackground} />

        {/* Header */}
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={navigateBack}
              activeOpacity={0.6}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Projects List</Text>
          </View>
        </TouchableWithoutFeedback>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons
              name="search"
              size={20}
              color={COLORS.textSecondary}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by project name or ID..."
              placeholderTextColor={COLORS.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={clearSearch}
                style={styles.clearButton}
                activeOpacity={0.6}
              >
                <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* List */}
        <FlatList
          data={filteredProjects}
          renderItem={renderProjectItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={searchQuery.length > 0 ? renderEmptyState : null}
          keyboardShouldPersistTaps="handled"
        />
      </SafeAreaView>
    </TouchableWithoutFeedback>
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
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  // Search Bar Styles
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
    backgroundColor: COLORS.searchBarBackground,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  // Empty State Styles
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  listContent: {
    padding: 16,
  },
  // Project Card Styles
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  projectId: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  projectName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
    lineHeight: 24,
  },
  projectType: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.textLight,
    marginBottom: 16,
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.progressBackground,
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 12,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    minWidth: 42,
    textAlign: 'right',
  },
  // Financials Section
  financialsSection: {
    marginBottom: 16,
    marginTop: 16,
  },
  financialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  financialStatBlockLeft: {
    flex: 0.6,
    paddingHorizontal: 4,
  },
  financialStatBlockRight: {
    flex: 0.4,
    paddingHorizontal: 4,
  },
  financialLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textLight,
    marginBottom: 4,
  },
  financialValue: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  // Footer
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  datesText: {
    fontSize: 12,
    fontWeight: '400',
    color: COLORS.textSecondary,
    flex: 1,
  },
  viewDetailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 8,
  },
  viewDetailsText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginRight: 4,
  },
});
