import React, { useState, useMemo } from 'react';
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
import { router } from 'expo-router';
import Header from '@/components/Header';

const COLORS = {
  background: '#F5F5F5',
  cardBackground: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#666666',
  textLight: '#9E9E9E',
  primary: '#2196F3',
  saffron: '#FF9800', // Saffron accent
  border: '#E0E0E0',
  searchBg: '#F8F8F8',

  // Status colors
  statusOpen: '#F44336',
  statusInProgress: '#2196F3',
  statusResolved: '#4CAF50',
  statusClosed: '#757575',

  // SLA colors
  slaBreached: '#D32F2F',
  slaNearing: '#FF9800',
  slaOnTrack: '#4CAF50',

  // Filter chip colors
  chipActive: '#2196F3',
  chipInactive: '#E0E0E0',

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

type FilterType = 'All' | 'Open' | 'In Progress' | 'Resolved' | 'Breached';

interface FilterChipProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
}

function FilterChip({ label, isActive, onPress }: FilterChipProps) {
  return (
    <TouchableOpacity
      style={[styles.filterChip, isActive && styles.filterChipActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

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
      {/* Top Row - ID (left) and Status Badge (right) */}
      <View style={styles.cardTopRow}>
        <Text style={styles.complaintId}>{complaint.id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(complaint.status) }]}>
          <Text style={styles.statusBadgeText}>{complaint.status}</Text>
        </View>
      </View>

      {/* Middle Section - Core Details (Left Aligned) */}
      <View style={styles.cardMiddleSection}>
        <Text style={styles.complaintCategory} numberOfLines={2}>
          {complaint.category}
        </Text>
        <Text style={styles.complaintDepartment} numberOfLines={1}>
          {complaint.department}
        </Text>
        <View style={styles.locationContainer}>
          <Ionicons name="location-outline" size={16} color={COLORS.primary} />
          <Text style={styles.complaintLocation} numberOfLines={1}>
            {complaint.location}
          </Text>
        </View>
      </View>

      {/* Bottom Section - Attachments (left) and Action Button (right) */}
      <View style={styles.cardBottomSection}>
        <View style={styles.attachmentsContainer}>
          {complaint.hasPhotos && (
            <Ionicons name="camera-outline" size={20} color={COLORS.attachmentIcon} style={styles.attachmentIcon} />
          )}
          {complaint.hasVideos && (
            <Ionicons name="videocam-outline" size={20} color={COLORS.attachmentIcon} style={styles.attachmentIcon} />
          )}
          {complaint.hasDocuments && (
            <Ionicons name="document-attach-outline" size={20} color={COLORS.attachmentIcon} style={styles.attachmentIcon} />
          )}
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
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');

  // Filter and search logic
  const filteredComplaints = useMemo(() => {
    let filtered = SAMPLE_COMPLAINTS;

    // Apply filter
    if (activeFilter !== 'All') {
      if (activeFilter === 'Breached') {
        filtered = filtered.filter((c) => c.sla === 'Breached');
      } else {
        filtered = filtered.filter((c) => c.status === activeFilter);
      }
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
  }, [searchQuery, activeFilter]);

  const handleComplaintPress = (complaint: Complaint) => {
    router.push({
      pathname: '/(drawer)/complaint-details',
      params: { id: complaint.id },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.cardBackground} />
      <Header title="Complaints" />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
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
      </View>

      {/* Filter Chips */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          <FilterChip
            label="All"
            isActive={activeFilter === 'All'}
            onPress={() => setActiveFilter('All')}
          />
          <FilterChip
            label="Status: Open"
            isActive={activeFilter === 'Open'}
            onPress={() => setActiveFilter('Open')}
          />
          <FilterChip
            label="Status: In Progress"
            isActive={activeFilter === 'In Progress'}
            onPress={() => setActiveFilter('In Progress')}
          />
          <FilterChip
            label="Status: Resolved"
            isActive={activeFilter === 'Resolved'}
            onPress={() => setActiveFilter('Resolved')}
          />
          <FilterChip
            label="SLA: Breached"
            isActive={activeFilter === 'Breached'}
            onPress={() => setActiveFilter('Breached')}
          />
        </ScrollView>
      </View>

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
  filterContainer: {
    backgroundColor: COLORS.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: 12,
  },
  filterScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.chipInactive,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: COLORS.chipActive,
    borderColor: COLORS.chipActive,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  filterChipTextActive: {
    color: COLORS.cardBackground,
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
  cardMiddleSection: {
    marginBottom: 18,
    alignItems: 'flex-start',
  },
  complaintCategory: {
    fontSize: 19,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
    lineHeight: 26,
  },
  complaintDepartment: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.textSecondary,
    marginBottom: 6,
    lineHeight: 20,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  complaintLocation: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
  cardBottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  attachmentsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  attachmentIcon: {
    opacity: 0.6,
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
