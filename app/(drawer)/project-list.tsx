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
import { router, useLocalSearchParams } from 'expo-router';
import ProjectFilterBottomSheet, { ProjectFilters } from '@/components/ProjectFilterBottomSheet';

const COLORS = {
  background: '#F5F5F5',
  cardBackground: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#666666',
  textLight: '#999999',
  border: '#E0E0E0',
  progressBackground: '#E8E8E8',
  searchBarBackground: '#F0F0F0',
  primary: '#FF9800',
  // Status colors
  statusOnTrack: '#4CAF50',
  statusOnTrackBg: '#E8F5E9',
  statusAtRisk: '#FF9800',
  statusAtRiskBg: '#FFF3E0',
  statusDelayed: '#F44336',
  statusDelayedBg: '#FFEBEE',
  statusCompleted: '#2196F3',
  statusCompletedBg: '#E3F2FD',
  statusOnHold: '#9E9E9E',
  statusOnHoldBg: '#F5F5F5',
  statusNotStarted: '#607D8B',
  statusNotStartedBg: '#ECEFF1',
};

type ProjectStatus = 'On Track' | 'At Risk' | 'Delayed' | 'Completed' | 'On Hold' | 'Not Started';

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
  zone?: string;
  department?: string;
  division?: string;
  subDivision?: string;
  circle?: string;
  sector?: string;
  subSector?: string;
  fundingType?: string;
  workType?: string;
  budgetInCrores?: number;
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
    case 'On Hold':
      return { bg: COLORS.statusOnHoldBg, text: COLORS.statusOnHold };
    case 'Not Started':
      return { bg: COLORS.statusNotStartedBg, text: COLORS.statusNotStarted };
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
      zone: 'Zone 1 - North Delhi',
      department: 'Roads & Bridges Department',
      division: 'North Division',
      subDivision: 'North Sub-Division A',
      circle: 'Circle 1 - Civil Lines',
      sector: 'Roads & Highways',
      subSector: 'National Highways',
      fundingType: 'Central Government Grant',
      workType: 'New Construction',
      budgetInCrores: 5.0,
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
      zone: 'Zone 5 - Central Delhi',
      department: 'Roads & Bridges Department',
      division: 'Central Division',
      subDivision: 'Central Sub-Division A',
      circle: 'Circle 5 - Chandni Chowk',
      sector: 'Roads & Highways',
      subSector: 'Flyovers & Bridges',
      fundingType: 'State Budget',
      workType: 'Repair & Maintenance',
      budgetInCrores: 8.2,
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
      zone: 'Zone 2 - South Delhi',
      department: 'Electrical Department',
      division: 'South Division',
      subDivision: 'South Sub-Division A',
      circle: 'Circle 8 - Dwarka',
      sector: 'Electrical & Power',
      subSector: 'Street Lighting',
      fundingType: 'Smart City Mission',
      workType: 'Upgradation',
      budgetInCrores: 2.5,
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
      zone: 'Zone 3 - East Delhi',
      department: 'Water Supply Department',
      division: 'East Division',
      subDivision: 'East Sub-Division A',
      circle: 'Circle 6 - Shahdara',
      sector: 'Water Resources',
      subSector: 'Water Supply Networks',
      fundingType: 'World Bank Loan',
      workType: 'Expansion',
      budgetInCrores: 12.0,
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
      zone: 'Zone 4 - West Delhi',
      department: 'Building Department',
      division: 'West Division',
      subDivision: 'West Sub-Division A',
      circle: 'Circle 7 - Rohini',
      sector: 'Buildings & Infrastructure',
      subSector: 'Schools & Colleges',
      fundingType: 'State Budget',
      workType: 'Renovation',
      budgetInCrores: 4.5,
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
      zone: 'Zone 7 - New Delhi',
      department: 'Roads & Bridges Department',
      division: 'Special Projects Division',
      subDivision: 'Central Sub-Division B',
      circle: 'Circle 2 - Karol Bagh',
      sector: 'Roads & Highways',
      subSector: 'City Roads',
      fundingType: 'PPP (Public-Private Partnership)',
      workType: 'New Construction',
      budgetInCrores: 6.8,
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
      zone: 'Zone 6 - Suburban Delhi',
      department: 'Drainage Department',
      division: 'Maintenance Division',
      subDivision: 'North Sub-Division B',
      circle: 'Circle 3 - Paharganj',
      sector: 'Sanitation & Drainage',
      subSector: 'Stormwater Drains',
      fundingType: 'Municipal Funds',
      workType: 'Repair & Maintenance',
      budgetInCrores: 3.2,
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
      zone: 'Zone 5 - Central Delhi',
      department: 'Horticulture Department',
      division: 'Central Division',
      subDivision: 'Central Sub-Division A',
      circle: 'Circle 4 - Sadar Bazaar',
      sector: 'Green Spaces & Parks',
      subSector: 'Government Buildings',
      fundingType: 'State Budget',
      workType: 'New Construction',
      budgetInCrores: 7.5,
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
      zone: 'Zone 3 - East Delhi',
      department: 'Roads & Bridges Department',
      division: 'Construction Division',
      subDivision: 'East Sub-Division B',
      circle: 'Circle 6 - Shahdara',
      sector: 'Roads & Highways',
      subSector: 'Flyovers & Bridges',
      fundingType: 'ADB Loan',
      workType: 'New Construction',
      budgetInCrores: 18.0,
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
      zone: 'Zone 7 - New Delhi',
      department: 'Urban Development Department',
      division: 'Special Projects Division',
      subDivision: 'Central Sub-Division B',
      circle: 'Circle 5 - Chandni Chowk',
      sector: 'Buildings & Infrastructure',
      subSector: 'Government Buildings',
      fundingType: 'Central Government Grant',
      workType: 'Restoration',
      budgetInCrores: 3.8,
    },
    {
      id: 'PRJ-2024-011',
      name: 'Hospital Wing Expansion Project',
      projectType: 'Building Construction',
      status: 'On Hold',
      progress: 15,
      startDate: '01-Apr-24',
      endDate: '31-Mar-25',
      totalCost: '₹25.0 Cr',
      expenditure: '₹4.0 Cr',
      expectedCompletionDate: '30-Jun-25',
      financialExpenditure: '16%',
      zone: 'Zone 2 - South Delhi',
      department: 'Building Department',
      division: 'South Division',
      subDivision: 'South Sub-Division B',
      circle: 'Circle 8 - Dwarka',
      sector: 'Buildings & Infrastructure',
      subSector: 'Hospitals & Healthcare',
      fundingType: 'JICA Loan',
      workType: 'Expansion',
      budgetInCrores: 25.0,
    },
    {
      id: 'PRJ-2024-012',
      name: 'Smart Traffic Management System',
      projectType: 'Infrastructure Development',
      status: 'Not Started',
      progress: 0,
      startDate: '01-Jul-24',
      endDate: '30-Jun-25',
      totalCost: '₹15.0 Cr',
      expenditure: '₹0.0 Cr',
      expectedCompletionDate: '30-Jun-25',
      financialExpenditure: '0%',
      zone: 'Zone 1 - North Delhi',
      department: 'Public Works Department',
      division: 'North Division',
      subDivision: 'North Sub-Division A',
      circle: 'Circle 1 - Civil Lines',
      sector: 'Urban Development',
      subSector: 'City Roads',
      fundingType: 'Smart City Mission',
      workType: 'New Construction',
      budgetInCrores: 15.0,
    },
  ];

const emptyFilters: ProjectFilters = {
  department: '',
  zone: '',
  circle: '',
  division: '',
  subDivision: '',
  sector: '',
  subSector: '',
  status: '',
  fundingType: '',
  workType: '',
  budgetMin: '',
  budgetMax: '',
};

export default function ProjectListScreen() {
  const params = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState<ProjectFilters>(emptyFilters);

  // Get filter params from advanced search
  const filterZone = params.zone as string || '';
  const filterDepartment = params.department as string || '';
  const filterDivision = params.division as string || '';
  const filterSubDivision = params.subDivision as string || '';
  const filterProjectType = params.projectType as string || '';
  const filterSearchText = params.searchText as string || '';

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

  const handleApplyFilters = (filters: ProjectFilters) => {
    setActiveFilters(filters);
  };

  const handleResetFilters = () => {
    setActiveFilters(emptyFilters);
  };

  // Count active filters for badge
  const getActiveFilterCount = (): number => {
    let count = 0;
    if (activeFilters.department) count++;
    if (activeFilters.zone) count++;
    if (activeFilters.circle) count++;
    if (activeFilters.division) count++;
    if (activeFilters.subDivision) count++;
    if (activeFilters.sector) count++;
    if (activeFilters.subSector) count++;
    if (activeFilters.status) count++;
    if (activeFilters.fundingType) count++;
    if (activeFilters.workType) count++;
    if (activeFilters.budgetMin || activeFilters.budgetMax) count++;
    return count;
  };

  // Filter projects based on search query, advanced search filters, and bottom sheet filters
  const filteredProjects = useMemo(() => {
    let projects = ALL_PROJECTS;

    // Apply advanced search filters (from navigation params)
    if (filterZone) {
      projects = projects.filter((project) => project.zone === filterZone);
    }
    if (filterDepartment) {
      projects = projects.filter((project) => project.department === filterDepartment);
    }
    if (filterDivision) {
      projects = projects.filter((project) => project.division === filterDivision);
    }
    if (filterSubDivision) {
      projects = projects.filter((project) => project.subDivision === filterSubDivision);
    }
    if (filterProjectType) {
      projects = projects.filter((project) => project.projectType === filterProjectType);
    }
    if (filterSearchText) {
      const searchTextLower = filterSearchText.toLowerCase().trim();
      projects = projects.filter((project) => {
        const nameMatch = project.name.toLowerCase().includes(searchTextLower);
        const idMatch = project.id.toLowerCase().includes(searchTextLower);
        return nameMatch || idMatch;
      });
    }

    // Apply bottom sheet filters
    if (activeFilters.department) {
      projects = projects.filter((project) => project.department === activeFilters.department);
    }
    if (activeFilters.zone) {
      projects = projects.filter((project) => project.zone === activeFilters.zone);
    }
    if (activeFilters.circle) {
      projects = projects.filter((project) => project.circle === activeFilters.circle);
    }
    if (activeFilters.division) {
      projects = projects.filter((project) => project.division === activeFilters.division);
    }
    if (activeFilters.subDivision) {
      projects = projects.filter((project) => project.subDivision === activeFilters.subDivision);
    }
    if (activeFilters.sector) {
      projects = projects.filter((project) => project.sector === activeFilters.sector);
    }
    if (activeFilters.subSector) {
      projects = projects.filter((project) => project.subSector === activeFilters.subSector);
    }
    if (activeFilters.status) {
      projects = projects.filter((project) => project.status === activeFilters.status);
    }
    if (activeFilters.fundingType) {
      projects = projects.filter((project) => project.fundingType === activeFilters.fundingType);
    }
    if (activeFilters.workType) {
      projects = projects.filter((project) => project.workType === activeFilters.workType);
    }

    // Budget range filter
    if (activeFilters.budgetMin) {
      const minBudget = parseFloat(activeFilters.budgetMin);
      if (!isNaN(minBudget)) {
        projects = projects.filter((project) =>
          project.budgetInCrores !== undefined && project.budgetInCrores >= minBudget
        );
      }
    }
    if (activeFilters.budgetMax) {
      const maxBudget = parseFloat(activeFilters.budgetMax);
      if (!isNaN(maxBudget)) {
        projects = projects.filter((project) =>
          project.budgetInCrores !== undefined && project.budgetInCrores <= maxBudget
        );
      }
    }

    // Apply local search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      projects = projects.filter((project) => {
        const nameMatch = project.name.toLowerCase().includes(query);
        const idMatch = project.id.toLowerCase().includes(query);
        return nameMatch || idMatch;
      });
    }

    return projects;
  }, [searchQuery, filterZone, filterDepartment, filterDivision, filterSubDivision, filterProjectType, filterSearchText, activeFilters]);

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
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setIsFilterVisible(true)}
              activeOpacity={0.6}
            >
              <Ionicons name="options-outline" size={24} color={COLORS.text} />
              {getActiveFilterCount() > 0 && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>{getActiveFilterCount()}</Text>
                </View>
              )}
            </TouchableOpacity>
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
          ListEmptyComponent={(searchQuery.length > 0 || getActiveFilterCount() > 0) ? renderEmptyState : null}
          keyboardShouldPersistTaps="handled"
        />

        {/* Filter Bottom Sheet */}
        <ProjectFilterBottomSheet
          visible={isFilterVisible}
          onClose={() => setIsFilterVisible(false)}
          onApply={handleApplyFilters}
          onReset={handleResetFilters}
          currentFilters={activeFilters}
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
  filterButton: {
    padding: 8,
    marginRight: -8,
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
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
