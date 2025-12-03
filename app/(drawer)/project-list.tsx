import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  FlatList,
  TextInput,
  Keyboard,
  Platform,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { RootState } from '@/src/store';
import moment from 'moment';

const COLORS = {
  background: '#F5F5F5',
  cardBackground: '#FFFFFF',
  text: '#1A1A1A',
  saffron: '#FF9800',
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

type ProjectStatus = 'planning' | 'aa approval' | 'technical sanction' | 'tender allotment' | 'work award' | 'working' | 'completed' | 'handovered' | 'dropped';

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
}

// Helper function to get status colors
const getStatusColors = (status: ProjectStatus) => {
  switch (status) {
    case 'planning':
      return { bg: '#FEF9C3', text: '#854D0E' };
    case 'aa approval':
      return { bg: '#DBEAFE', text: '#1E40AF' };
    case 'technical sanction':
      return { bg: '#F3E8FF', text: '#6B21A8' };
    case 'tender allotment':
      return { bg: '#FFEDD5', text: '#9A3412' };
       case 'work award':
      return { bg: '#CCFBF1', text: '#115E59' };
       case 'working':
      return { bg: '#DCFCE7', text: '#166534' };
        case 'completed':
      return { bg: '#D1FAE5', text: '#065F46' };
       case 'handovered':
      return { bg: '#CFFAFE', text: '#155E75' };
       case 'dropped':
      return { bg: '#FEE2E2', text: '#991B1B' };
    default:
      return { bg: '#E0E7FF', text: '#3730A3' };
  }
};

interface ProjectCardProps {
  project: Project;
  onPress: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onPress }) => {
  const statusColors = getStatusColors(project.status);

  const amountToShow = project.tender_amount 
  ? project.tender_amount 
  : project.sanctioned_amount 
  ? project.sanctioned_amount 
  : project.estimated_cost;


  const hasFinancialProgress = project?.latest_financial_progress && 
                             Object.keys(project.latest_financial_progress).length > 0;

  const hasTargetDate = project?.target_completion_date != null;

  const formatNumberINR = (num) => {
  if (num >= 10000000) {
    return (num / 10000000).toFixed(2) + " Cr";
  } else if (num >= 100000) {
    return (num / 100000).toFixed(2) + " Lakh";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(2) + "K";
  } else {
    return num.toString();
  }
};

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Top Row: Project ID and Status Badge */}
      <View style={styles.cardTopRow}>
        <Text style={styles.projectId}>{project?.project_id}</Text>
         {project?.status != null &&
        <View style={[styles.statusBadge, { backgroundColor: statusColors.bg , paddingHorizontal: 0}]}>
         
          <Text style={[styles.statusText, { color: statusColors.text ,textTransform: 'capitalize', marginHorizontal: 10}]}>
            {project?.status}
          </Text>
        </View>
}

      </View>

      {/* Main Body: Project Name and Type */}
      <Text style={styles.projectName} >
        {project?.project_name}
      </Text>
      <Text style={styles.projectType}>{project?.category?.name}</Text>

      {/* Progress Section */}
      <View style={styles.progressSection}>
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${Math.max(0, Math.min(100, project?.latest_physical_progress?.physical_progress_percent || 0))}%`, backgroundColor: statusColors.text },
            ]}
          />
        </View>
        <Text style={styles.progressText}>{Math.max(0, Math.min(100, project?.latest_physical_progress?.physical_progress_percent || 0))}%</Text>
      </View>

      {/* Financials Section - 2x2 Grid */}
      {/* <View style={styles.financialsSection}> */}
        {/* Top Row */}

       
       {(amountToShow || hasFinancialProgress) && (
  <View style={styles.financialRow}>
    {amountToShow && (
      <View style={styles.financialStatBlockLeft}>
        <Text style={styles.financialLabel}>Total Cost</Text>
        <Text style={styles.financialValue}>{formatNumberINR(amountToShow)}</Text>
      </View>
    )}

    {hasFinancialProgress && (
      <View style={styles.financialStatBlockRight}>
        <Text style={styles.financialLabel}>Expenditure</Text>
        <Text style={styles.financialValue}>
          {formatNumberINR(project?.latest_financial_progress?.expenditure_till_date)}
        </Text>
      </View>
    )}
  </View>
)}

        {/* Bottom Row */}
      {(hasTargetDate || hasFinancialProgress) && (
  <View style={styles.financialRow}>
    {hasTargetDate && (
      <View style={styles.financialStatBlockLeft}>
        <Text style={styles.financialLabel}>Exp. Comp. Date</Text>
        <Text style={styles.financialValue}>
          {moment(project?.target_completion_date).format('DD-MMM-YY')}
        </Text>
      </View>
    )}

    {hasFinancialProgress && (
      <View style={styles.financialStatBlockRight}>
        <Text style={styles.financialLabel}>Financial Exp.</Text>
        <Text style={styles.financialValue}>
          {`${project?.latest_financial_progress?.cumulative_expenditure_percent}%`}
        </Text>
      </View>
    )}
  </View>
)}

      {/* Footer Row: Dates and Action */}
      <View style={styles.cardFooter}>
        <Text style={styles.datesText}>
          Start: {moment(project?.start_date).format('DD-MMM-YY')} | End: {moment(project?.end_date).format('DD-MMM-YY')}
        </Text>
          {/* <TouchableOpacity
            style={styles.actionButton}
            onPress={onPress}
            activeOpacity={0.8}
          >
          <Ionicons name="arrow-forward" size={20} color={COLORS.cardBackground} />

        </TouchableOpacity>*/}
        <View style={styles.detailsIconContainer}>
          <Ionicons name="chevron-forward" size={20} color={COLORS.saffron} />
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
      zone: 'North Zone',
      department: 'Road Department',
      division: 'NH Division',
      subDivision: 'NH-44 Sub-Division',
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
      zone: 'Central Zone',
      department: 'Bridge Department',
      division: 'City Bridge Division',
      subDivision: 'Central Sub-Division',
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
      zone: 'South Zone',
      department: 'Electrical Department',
      division: 'Street Lighting Division',
      subDivision: 'South Sub-Division',
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
  const params = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState('');

  // Get filter params from advanced search
  const filterZone = params.zone as string || '';
  const filterDepartment = params.department as string || '';
  const filterDivision = params.division as string || '';
  const filterSubDivision = params.subDivision as string || '';
  const filterProjectType = params.projectType as string || '';
  const filterSearchText = params.searchText as string || '';

  const [projects, setProjects] = useState<any[]>([]);
const [page, setPage] = useState(1);
const [limit] = useState(20);
const [isLoading, setIsLoading] = useState(false);
const [isListEnd, setIsListEnd] = useState(false); // no more data

  const navigateBack = () => {
    router.push('/(drawer)/(tabs)/projects');
  };

  const navigateToProjectDetails = (projectId: string, projectName: string, projectCode: string) => {
   
    router.push({
      pathname: '/(drawer)/project-details',
      params: { projectId ,projectName, projectCode},
    });
  };

  const clearSearch = () => {
    setSearchQuery('');
  };
  const user = useSelector((state: RootState) => state.auth.user);


  const displayDesignation = user?.departments?.[0]?.id as number | undefined;
  
useEffect(() => {
  if (displayDesignation !== undefined) {
    setPage(1);
    setProjects([]);   // reset list
    setIsListEnd(false);
    fetchProjectList(displayDesignation, 1, limit);
  }
}, [displayDesignation]);
  
  
  
   const fetchProjectList = async (id: number, page: number, limit: number) => {
  if (isLoading || isListEnd) return;

  setIsLoading(true);

  try {
    const ApiManager = (await import('@/src/services/ApiManager')).default;
    const response = await ApiManager.getInstance().getProjectList(id, page, limit);

    if (response?.success && response?.data?.length > 0) {
      setProjects(prev => [...prev, ...response.data]);  // append new page
    } else {
      setIsListEnd(true); // no more pages
    }
  } catch (error) {
    console.log("Error fetching projects:", error);
  } finally {
    setIsLoading(false);
  }
};


const loadMore = () => {
  if (!isLoading && !isListEnd) {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProjectList(displayDesignation!, nextPage, limit);
  }
};

  // Filter projects based on search query and advanced search filters
  const filteredProjects = useMemo(() => {
    let projects = ALL_PROJECTS;

    // Apply advanced search filters
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
  }, [searchQuery, filterZone, filterDepartment, filterDivision, filterSubDivision, filterProjectType, filterSearchText]);

  const renderProjectItem = ({ item }: { item: Project }) => (
    <ProjectCard
      project={item}
      onPress={() => navigateToProjectDetails(item?.id, item?.project_name, item?.project_id)}
    />
  );

  const renderFooter = () => {
  if (!isLoading) return null;
  return (
    <ActivityIndicator size="small" color="#000" style={{ padding: 16 }} />
  );
};

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
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
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

         {isLoading && (
                      <View style={{ alignItems: 'center', marginVertical: 32 }}>
                        <Text style={{ color: COLORS.textSecondary }}>Loading stats...</Text>
                      </View>
                    )}

        {/* List */}
        <FlatList
          data={projects}
          renderItem={renderProjectItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={searchQuery.length > 0 ? renderEmptyState : null}
          keyboardShouldPersistTaps="handled"
           onEndReached={loadMore}
  onEndReachedThreshold={0.5}
  ListFooterComponent={renderFooter}

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
  actionButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: COLORS.saffron,
      justifyContent: 'center',
      alignItems: 'center',
      ...Platform.select({
        ios: {
          shadowColor: COLORS.saffron,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        },
        android: {
          elevation: 6,
        },
      }),
    },
    detailsIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
      },
});
