import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import FilterBottomSheet from '@/components/FilterBottomSheet';

const COLORS = {
  background: '#F5F5F5',
  cardBackground: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#666666',
  textLight: '#9E9E9E',
  primary: '#2196F3',
  saffron: '#FF9800',
  border: '#E0E0E0',
  searchBg: '#F8F8F8',
  filterActive: '#2196F3',
  filterInactive: '#F5F5F5',
  tagBackground: '#E3F2FD',
  tagText: '#2196F3',

  // Status colors
  statusOpen: '#F44336',
  statusInProgress: '#2196F3',
  statusResolved: '#4CAF50',
  statusClosed: '#757575',

  // SLA colors
  slaBreached: '#D32F2F',
  slaNearing: '#FF9800',
  slaOnTrack: '#4CAF50',

  // Attachment icon color
  attachmentIcon: '#9E9E9E',
};

interface Complaint {
  id: string;
  category: string;
  department: string;
  location: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  sla: 'Breached' | 'Nearing' | 'On Track';
  createdAt: string;
  hasPhotos?: boolean;
  hasVideos?: boolean;
  hasDocuments?: boolean;
}

const SAMPLE_COMPLAINTS: Complaint[] = [
  {
    id: 'C-2023-4513',
    category: 'Pothole Repair Request',
    department: 'Roads & Infrastructure - Zone West',
    location: 'Connaught Place, New Delhi',
    status: 'Open',
    sla: 'Breached',
    createdAt: '2023-12-01',
    hasPhotos: true,
    hasVideos: false,
    hasDocuments: true,
  },
  {
    id: 'C-2023-4514',
    category: 'Street Light Not Working',
    department: 'Electrical Services - Zone North',
    location: 'Karol Bagh Market Road',
    status: 'In Progress',
    sla: 'Nearing',
    createdAt: '2023-12-02',
    hasPhotos: true,
    hasVideos: false,
    hasDocuments: false,
  },
  {
    id: 'C-2023-4515',
    category: 'Water Supply Issue',
    department: 'Water & Sanitation - Zone East',
    location: 'Laxmi Nagar, Block C',
    status: 'Resolved',
    sla: 'On Track',
    createdAt: '2023-12-03',
    hasPhotos: false,
    hasVideos: false,
    hasDocuments: false,
  },
  {
    id: 'C-2023-4516',
    category: 'Garbage Collection Delay',
    department: 'Waste Management - Zone South',
    location: 'Greater Kailash Part 2',
    status: 'In Progress',
    sla: 'On Track',
    createdAt: '2023-12-04',
    hasPhotos: true,
    hasVideos: true,
    hasDocuments: true,
  },
  {
    id: 'C-2023-4517',
    category: 'Illegal Construction Report',
    department: 'Building & Planning - Zone Central',
    location: 'Nehru Place Commercial Complex',
    status: 'Open',
    sla: 'Breached',
    createdAt: '2023-12-05',
    hasPhotos: true,
    hasVideos: true,
    hasDocuments: false,
  },
  {
    id: 'C-2023-4518',
    category: 'Traffic Signal Malfunction',
    department: 'Traffic Management - Zone West',
    location: 'ITO Crossing, Central Delhi',
    status: 'Closed',
    sla: 'On Track',
    createdAt: '2023-12-06',
    hasPhotos: false,
    hasVideos: false,
    hasDocuments: true,
  },
  {
    id: 'C-2023-4519',
    category: 'Park Maintenance Required',
    department: 'Parks & Gardens - Zone North',
    location: 'Lodhi Garden, Main Entrance',
    status: 'In Progress',
    sla: 'Nearing',
    createdAt: '2023-12-07',
    hasPhotos: false,
    hasVideos: false,
    hasDocuments: false,
  },
];

interface ComplaintCardProps {
  complaint: Complaint;
  onPress: () => void;
}

function ComplaintCard({ complaint, onPress }: ComplaintCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open':
        return COLORS.statusOpen;
      case 'In Progress':
        return COLORS.statusInProgress;
      case 'Resolved':
        return COLORS.statusResolved;
      case 'Closed':
        return COLORS.statusClosed;
      default:
        return COLORS.textSecondary;
    }
  };

  return (
    <TouchableOpacity
      style={styles.complaintCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Top Section - ID (left) and Status Badge (right) */}
      <View style={styles.cardTopRow}>
        <Text style={styles.complaintId}>{complaint.id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(complaint.status) }]}>
          <Text style={styles.statusBadgeText}>{complaint.status}</Text>
        </View>
      </View>

      {/* Main Body - Category and Location */}
      <View style={styles.cardMainBody}>
        <Text style={styles.complaintCategory}>
          {complaint.category}
        </Text>
        <View style={styles.locationContainer}>
          <Ionicons name="location-outline" size={16} color={COLORS.primary} />
          <Text style={styles.complaintLocation}>
            {complaint.location}
          </Text>
        </View>
      </View>

      {/* Footer Section - Attachments/Department (left) and Action Button (right) */}
      <View style={styles.cardFooterSection}>
        <View style={styles.footerLeftBlock}>
          {/* Attachment Icons Row */}
          {(complaint.hasPhotos || complaint.hasVideos || complaint.hasDocuments) && (
            <View style={styles.attachmentsRow}>
              {complaint.hasPhotos && (
                <Ionicons name="camera-outline" size={18} color={COLORS.attachmentIcon} style={styles.attachmentIcon} />
              )}
              {complaint.hasVideos && (
                <Ionicons name="videocam-outline" size={18} color={COLORS.attachmentIcon} style={styles.attachmentIcon} />
              )}
              {complaint.hasDocuments && (
                <Ionicons name="document-attach-outline" size={18} color={COLORS.attachmentIcon} style={styles.attachmentIcon} />
              )}
            </View>
          )}
          {/* Department Text Below */}
          <Text style={styles.complaintDepartment} numberOfLines={2}>
            {complaint.department}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={onPress}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-forward" size={20} color={COLORS.cardBackground} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

export default function ComplaintsScreen() {
  const params = useLocalSearchParams();
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);

  // Check if navigation came from dashboard
  const fromDashboard = params.fromDashboard === 'true';
  const headerTitle = (params.title as string) || 'Complaints';

  // Filter states
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedZone, setSelectedZone] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');

  // Temporary filter states (for the bottom sheet)
  const [tempSelectedStatuses, setTempSelectedStatuses] = useState<string[]>([]);
  const [tempSelectedCategory, setTempSelectedCategory] = useState('');
  const [tempSelectedZone, setTempSelectedZone] = useState('');
  const [tempSelectedDepartment, setTempSelectedDepartment] = useState('');

  // Handle incoming filter parameter from dashboard
  useEffect(() => {
    if (params.filter) {
      const filterType = params.filter as string;

      // Map dashboard filter types to status filters
      switch (filterType) {
        case 'all':
          // Show all complaints - clear filters
          setSelectedStatuses([]);
          setSelectedCategory('');
          setSelectedZone('');
          setSelectedDepartment('');
          break;
        case 'pending':
          setSelectedStatuses(['Open']);
          break;
        case 'inProgress':
          setSelectedStatuses(['In Progress']);
          break;
        case 'completed':
          setSelectedStatuses(['Resolved']);
          break;
        case 'closed':
          setSelectedStatuses(['Closed']);
          break;
        case 'assignedByYou':
          // TODO: This would require additional data structure to filter by assigner
          // For now, clear filters as placeholder
          setSelectedStatuses([]);
          break;
        case 'completedByYou':
          // TODO: This would require additional data structure to filter by completer
          // For now, show resolved status as placeholder
          setSelectedStatuses(['Resolved']);
          break;
        default:
          break;
      }
    }
  }, [params.filter]);

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    let count = selectedStatuses.length;
    if (selectedCategory) count++;
    if (selectedZone) count++;
    if (selectedDepartment) count++;
    return count;
  }, [selectedStatuses, selectedCategory, selectedZone, selectedDepartment]);

  // Filter and search logic
  const filteredComplaints = useMemo(() => {
    let filtered = SAMPLE_COMPLAINTS;

    // Apply status filter
    if (selectedStatuses.length > 0) {
      filtered = filtered.filter((c) => selectedStatuses.includes(c.status));
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter((c) => c.category === selectedCategory);
    }

    // Apply zone filter
    if (selectedZone) {
      filtered = filtered.filter((c) => c.department.includes(selectedZone));
    }

    // Apply department filter
    if (selectedDepartment) {
      filtered = filtered.filter((c) => c.department === selectedDepartment);
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.id.toLowerCase().includes(query) ||
          c.category.toLowerCase().includes(query) ||
          c.department.toLowerCase().includes(query) ||
          c.location.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [searchQuery, selectedStatuses, selectedCategory, selectedZone, selectedDepartment]);

  const handleComplaintPress = (complaint: Complaint) => {
    router.push({
      pathname: '/(drawer)/complaint-details',
      params: { id: complaint.id },
    });
  };

  const handleFilterPress = () => {
    // Copy current filters to temp states
    setTempSelectedStatuses([...selectedStatuses]);
    setTempSelectedCategory(selectedCategory);
    setTempSelectedZone(selectedZone);
    setTempSelectedDepartment(selectedDepartment);
    setFilterSheetVisible(true);
  };

  const handleStatusToggle = (status: string) => {
    setTempSelectedStatuses((prev) => {
      if (prev.includes(status)) {
        return prev.filter((s) => s !== status);
      } else {
        return [...prev, status];
      }
    });
  };

  const handleCategoryPress = () => {
    // Set global callback to receive selection
    global.filterSelectionCallback = (type: string, value: string) => {
      if (type === 'category') {
        setTempSelectedCategory(value);
        // Re-open the filter sheet
        setTimeout(() => setFilterSheetVisible(true), 100);
      }
    };
    setFilterSheetVisible(false);
    router.push({
      pathname: '/(drawer)/select-category',
      params: { selected: tempSelectedCategory },
    });
  };

  const handleZonePress = () => {
    // Set global callback to receive selection
    global.filterSelectionCallback = (type: string, value: string) => {
      if (type === 'zone') {
        setTempSelectedZone(value);
        // Re-open the filter sheet
        setTimeout(() => setFilterSheetVisible(true), 100);
      }
    };
    setFilterSheetVisible(false);
    router.push({
      pathname: '/(drawer)/select-zone',
      params: { selected: tempSelectedZone },
    });
  };

  const handleDepartmentPress = () => {
    // Set global callback to receive selection
    global.filterSelectionCallback = (type: string, value: string) => {
      if (type === 'department') {
        setTempSelectedDepartment(value);
        // Re-open the filter sheet
        setTimeout(() => setFilterSheetVisible(true), 100);
      }
    };
    setFilterSheetVisible(false);
    router.push({
      pathname: '/(drawer)/select-department',
      params: { selected: tempSelectedDepartment },
    });
  };

  const handleApplyFilters = () => {
    setSelectedStatuses([...tempSelectedStatuses]);
    setSelectedCategory(tempSelectedCategory);
    setSelectedZone(tempSelectedZone);
    setSelectedDepartment(tempSelectedDepartment);
    setFilterSheetVisible(false);
  };

  const handleResetFilters = () => {
    setTempSelectedStatuses([]);
    setTempSelectedCategory('');
    setTempSelectedZone('');
    setTempSelectedDepartment('');
  };

  const handleRemoveFilter = (filterType: 'status' | 'category' | 'zone' | 'department', value?: string) => {
    switch (filterType) {
      case 'status':
        if (value) {
          setSelectedStatuses((prev) => prev.filter((s) => s !== value));
        }
        break;
      case 'category':
        setSelectedCategory('');
        break;
      case 'zone':
        setSelectedZone('');
        break;
      case 'department':
        setSelectedDepartment('');
        break;
    }
  };

  const handleBackPress = () => {
    router.back();
  };

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.cardBackground} />

      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={fromDashboard ? handleBackPress : openDrawer}
          activeOpacity={0.6}
        >
          <Ionicons
            name={fromDashboard ? 'arrow-back' : 'menu'}
            size={28}
            color={COLORS.text}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{headerTitle}</Text>

        <View style={styles.headerSpacer} />
      </View>

      {/* Search and Filter Bar */}
      <View style={styles.searchFilterContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={COLORS.textLight} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by ID or Category..."
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

        {/* Filter Button */}
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilterCount > 0 && styles.filterButtonActive,
          ]}
          onPress={handleFilterPress}
          activeOpacity={0.7}
        >
          <Ionicons
            name="filter"
            size={20}
            color={activeFilterCount > 0 ? COLORS.cardBackground : COLORS.text}
          />
          <Text
            style={[
              styles.filterButtonText,
              activeFilterCount > 0 && styles.filterButtonTextActive,
            ]}
          >
            Filter{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Active Filter Tags */}
      {activeFilterCount > 0 && (
        <View style={styles.activeFiltersContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.activeFiltersScrollContent}
          >
            {selectedStatuses.map((status) => (
              <View key={status} style={styles.filterTag}>
                <Text style={styles.filterTagText}>Status: {status}</Text>
                <TouchableOpacity
                  onPress={() => handleRemoveFilter('status', status)}
                  activeOpacity={0.6}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close-circle" size={16} color={COLORS.tagText} />
                </TouchableOpacity>
              </View>
            ))}
            {selectedCategory && (
              <View style={styles.filterTag}>
                <Text style={styles.filterTagText} numberOfLines={1}>
                  Category: {selectedCategory}
                </Text>
                <TouchableOpacity
                  onPress={() => handleRemoveFilter('category')}
                  activeOpacity={0.6}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close-circle" size={16} color={COLORS.tagText} />
                </TouchableOpacity>
              </View>
            )}
            {selectedZone && (
              <View style={styles.filterTag}>
                <Text style={styles.filterTagText}>Zone: {selectedZone}</Text>
                <TouchableOpacity
                  onPress={() => handleRemoveFilter('zone')}
                  activeOpacity={0.6}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close-circle" size={16} color={COLORS.tagText} />
                </TouchableOpacity>
              </View>
            )}
            {selectedDepartment && (
              <View style={styles.filterTag}>
                <Text style={styles.filterTagText} numberOfLines={1}>
                  Department: {selectedDepartment}
                </Text>
                <TouchableOpacity
                  onPress={() => handleRemoveFilter('department')}
                  activeOpacity={0.6}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close-circle" size={16} color={COLORS.tagText} />
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      )}

      {/* Complaints List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredComplaints.length > 0 ? (
          filteredComplaints.map((complaint) => (
            <ComplaintCard
              key={complaint.id}
              complaint={complaint}
              onPress={() => handleComplaintPress(complaint)}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={80} color={COLORS.textLight} />
            <Text style={styles.emptyStateText}>No complaints found</Text>
            <Text style={styles.emptyStateSubtext}>
              Try adjusting your search or filters
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Filter Bottom Sheet */}
      <FilterBottomSheet
        visible={filterSheetVisible}
        onClose={() => setFilterSheetVisible(false)}
        selectedStatuses={tempSelectedStatuses}
        selectedCategory={tempSelectedCategory}
        selectedZone={tempSelectedZone}
        selectedDepartment={tempSelectedDepartment}
        onStatusToggle={handleStatusToggle}
        onCategoryPress={handleCategoryPress}
        onZonePress={handleZonePress}
        onDepartmentPress={handleDepartmentPress}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
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
    justifyContent: 'space-between',
    backgroundColor: COLORS.cardBackground,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  headerButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 44,
  },
  searchFilterContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBackground,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 8,
  },
  searchBar: {
    flex: 1,
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
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.filterInactive,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
  },
  filterButtonActive: {
    backgroundColor: COLORS.filterActive,
    borderColor: COLORS.filterActive,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  filterButtonTextActive: {
    color: COLORS.cardBackground,
  },
  activeFiltersContainer: {
    backgroundColor: COLORS.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: 8,
  },
  activeFiltersScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.tagBackground,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
    maxWidth: 200,
  },
  filterTagText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.tagText,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  complaintCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  complaintId: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textLight,
    letterSpacing: 0.5,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.cardBackground,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  cardMainBody: {
    marginBottom: 16,
  },
  complaintCategory: {
    fontSize: 19,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
    lineHeight: 26,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
  },
  complaintLocation: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
  cardFooterSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
  },
  footerLeftBlock: {
    flex: 1,
    marginRight: 12,
  },
  attachmentsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  attachmentIcon: {
    opacity: 0.6,
  },
  complaintDepartment: {
    fontSize: 13,
    fontWeight: '400',
    color: COLORS.textLight,
    lineHeight: 18,
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: COLORS.textLight,
  },
});
