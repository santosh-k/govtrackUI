/**
 * Water Logging Points - List Screen
 *
 * Features:
 * - Two-tab interface (Logging Points vs Removal Points)
 * - Interactive status updates with auto-move between tabs
 * - Search functionality by road name or place name
 * - Simplified list cards with status badges
 * - Detailed bottom sheet for viewing full incident data
 * - Status update sheet for changing incident status
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  FlatList,
  Platform,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS, SPACING } from '@/theme';
import WaterLoggingDetailsBottomSheet, {
  WaterLoggingIncident,
} from '@/components/WaterLoggingDetailsBottomSheet';
import WaterLoggingStatusUpdateSheet from '@/components/WaterLoggingStatusUpdateSheet';
import { SafeAreaView } from 'react-native-safe-area-context';

// Initial Mock Data
const INITIAL_MOCK_INCIDENTS: WaterLoggingIncident[] = [
  {
    id: 'WL-2024-001',
    roadName: 'Ring Road near Rajouri Garden Metro',
    locationType: 'Road',
    division: 'West Division',
    landmark: 'Opposite Metro Station Gate 2',
    address: 'Ring Road, Rajouri Garden, West Delhi',
    dateTime: '20-Mar-2024, 10:30 AM',
    severity: 'High',
    affectedArea: 'Both',
    maxWaterDepth: '1.5 ft',
    approxArea: '200 m',
    mainCause: 'Choked Drain',
    trafficImpact: 'Heavy Disruption',
    status: 'Reported',
    latitude: 28.6448,
    longitude: 77.1178,
    media: [
      {
        id: 'm1',
        uri: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=400',
        type: 'image',
      },
      {
        id: 'm2',
        uri: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400',
        type: 'image',
      },
      {
        id: 'm3',
        uri: 'https://images.unsplash.com/photo-1563207153-f403bf289096?w=400',
        type: 'image',
      },
    ],
  },
  {
    id: 'WL-2024-002',
    roadName: 'ITO Underpass - Central Section',
    locationType: 'Underpass',
    division: 'Central Division',
    landmark: 'ITO Junction',
    address: 'ITO, Central Delhi',
    dateTime: '20-Mar-2024, 09:15 AM',
    severity: 'Critical',
    affectedArea: 'Entire Area',
    maxWaterDepth: '2.0 ft',
    approxArea: '350 m',
    mainCause: 'Heavy Rain',
    trafficImpact: 'Completely Blocked',
    status: 'Reported',
    latitude: 28.6289,
    longitude: 77.2411,
    media: [
      {
        id: 'm4',
        uri: 'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?w=400',
        type: 'image',
      },
      {
        id: 'm5',
        uri: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400',
        type: 'image',
      },
    ],
  },
  {
    id: 'WL-2024-003',
    roadName: 'Nehru Park Main Gate',
    locationType: 'Park',
    division: 'Central Division',
    landmark: 'Near Main Entrance',
    address: 'Nehru Park, Chanakyapuri, Central Delhi',
    dateTime: '19-Mar-2024, 04:45 PM',
    severity: 'Medium',
    affectedArea: 'Park Center',
    maxWaterDepth: '0.8 ft',
    approxArea: '150 m',
    mainCause: 'Heavy Rain',
    trafficImpact: 'No Impact',
    status: 'Cleared',
    latitude: 28.5944,
    longitude: 77.1954,
  },
  {
    id: 'WL-2024-004',
    roadName: 'Mathura Road Extension',
    locationType: 'Road',
    division: 'South Division',
    landmark: 'Near Ashram Chowk',
    address: 'Mathura Road, South Delhi',
    dateTime: '19-Mar-2024, 02:20 PM',
    severity: 'High',
    affectedArea: 'Carriageway',
    maxWaterDepth: '1.2 ft',
    approxArea: '180 m',
    mainCause: 'Sewer Overflow',
    trafficImpact: 'Partial',
    status: 'Working',
    latitude: 28.5672,
    longitude: 77.2499,
    media: [
      {
        id: 'm6',
        uri: 'https://images.unsplash.com/photo-1504490374041-7a5c14e8e92a?w=400',
        type: 'image',
      },
    ],
  },
  {
    id: 'WL-2024-005',
    roadName: 'Model Town Colony Road 5',
    locationType: 'Colony',
    division: 'North Division',
    landmark: 'Near Community Center',
    address: 'Model Town, North Delhi',
    dateTime: '19-Mar-2024, 11:00 AM',
    severity: 'Low',
    affectedArea: 'Left',
    maxWaterDepth: '0.5 ft',
    approxArea: '80 m',
    mainCause: 'Heavy Rain',
    trafficImpact: 'No Impact',
    status: 'Cleared',
    latitude: 28.7156,
    longitude: 77.1914,
  },
  {
    id: 'WL-2024-006',
    roadName: 'Punjabi Bagh Flyover East Approach',
    locationType: 'Flyover',
    division: 'West Division',
    landmark: 'East Side Entry',
    address: 'Punjabi Bagh, West Delhi',
    dateTime: '18-Mar-2024, 03:30 PM',
    severity: 'Critical',
    affectedArea: 'Both',
    maxWaterDepth: '1.8 ft',
    approxArea: '280 m',
    mainCause: 'Pipe Burst',
    trafficImpact: 'Completely Blocked',
    status: 'Cleared',
    latitude: 28.6692,
    longitude: 77.1316,
    media: [
      {
        id: 'm7',
        uri: 'https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?w=400',
        type: 'image',
      },
      {
        id: 'm8',
        uri: 'https://images.unsplash.com/photo-1518893063132-36e46dbe2428?w=400',
        type: 'image',
      },
      {
        id: 'm9',
        uri: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400',
        type: 'image',
      },
      {
        id: 'm10',
        uri: 'https://images.unsplash.com/photo-1582731223093-ea98f5f4b8d5?w=400',
        type: 'image',
      },
    ],
  },
  {
    id: 'WL-2024-007',
    roadName: 'Connaught Place Inner Circle',
    locationType: 'Road',
    division: 'Central Division',
    landmark: 'Block A Entry',
    address: 'Connaught Place, Central Delhi',
    dateTime: '18-Mar-2024, 01:15 PM',
    severity: 'Medium',
    affectedArea: 'Right',
    maxWaterDepth: '0.9 ft',
    approxArea: '120 m',
    mainCause: 'Choked Drain',
    trafficImpact: 'Partial',
    status: 'Reported',
    latitude: 28.6315,
    longitude: 77.2167,
  },
  {
    id: 'WL-2024-008',
    roadName: 'Dwarka Sector 21 Metro Station',
    locationType: 'Road',
    division: 'West Division',
    landmark: 'Near Metro Gate 1',
    address: 'Sector 21, Dwarka, West Delhi',
    dateTime: '17-Mar-2024, 05:00 PM',
    severity: 'Low',
    affectedArea: 'Left',
    maxWaterDepth: '0.6 ft',
    approxArea: '95 m',
    mainCause: 'Heavy Rain',
    trafficImpact: 'No Impact',
    status: 'Cleared',
    latitude: 28.5528,
    longitude: 77.0588,
  },
];

// Helper function to get status color
const getStatusColor = (status: string): string => {
  switch (status) {
    case 'Reported':
      return '#FF9800'; // Orange
    case 'Working':
      return '#2196F3'; // Blue
    case 'Cleared':
      return '#4CAF50'; // Green
    default:
      return COLORS.textSecondary;
  }
};

// Simplified Incident Card Component with Interactive Status
interface IncidentCardProps {
  incident: WaterLoggingIncident;
  onPress: () => void;
  onStatusPress: () => void;
}

const IncidentCard: React.FC<IncidentCardProps> = ({ incident, onPress, onStatusPress }) => {
  const statusColor = getStatusColor(incident.status);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Top Row: Date & Time | Interactive Status Button */}
      <View style={styles.cardTopRow}>
        <View style={styles.dateTimeContainer}>
          <Ionicons name="time-outline" size={14} color={COLORS.textSecondary} />
          <Text style={styles.dateTimeText}>{incident.dateTime}</Text>
        </View>
        <TouchableOpacity
          style={[styles.statusButton, { backgroundColor: statusColor }]}
          onPress={(e) => {
            e.stopPropagation();
            onStatusPress();
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.statusButtonText}>{incident.status}</Text>
          <Ionicons name="chevron-down" size={14} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Main Content: Road Name */}
      <Text style={styles.roadName} numberOfLines={2}>
        {incident.roadName}
      </Text>

      {/* Location Type */}
      <View style={styles.metaRow}>
        <Ionicons name="business-outline" size={14} color={COLORS.textSecondary} />
        <Text style={styles.metaText}>{incident.locationType}</Text>
      </View>

      {/* Address */}
      <View style={styles.addressRow}>
        <Ionicons name="location-outline" size={14} color={COLORS.textSecondary} />
        <Text style={styles.addressText} numberOfLines={1}>
          {incident.address}
        </Text>
      </View>

      {/* Landmark (if available) */}
      {incident.landmark && (
        <View style={styles.landmarkRow}>
          <Ionicons name="pin-outline" size={14} color={COLORS.textSecondary} />
          <Text style={styles.landmarkText} numberOfLines={1}>
            {incident.landmark}
          </Text>
        </View>
      )}

      {/* Footer: Division | View Details Link */}
      <View style={styles.cardFooter}>
        <View style={styles.divisionContainer}>
          <Ionicons name="business" size={14} color={COLORS.textSecondary} />
          <Text style={styles.divisionText}>{incident.division}</Text>
        </View>
        <View style={styles.viewDetailsContainer}>
          <Text style={styles.viewDetailsText}>View Full Details</Text>
          <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Main List Screen
export default function WaterLoggingListScreen() {
  const [activeTab, setActiveTab] = useState<'logging' | 'removal'>('logging');
  const [searchQuery, setSearchQuery] = useState('');
  const [incidents, setIncidents] = useState<WaterLoggingIncident[]>(INITIAL_MOCK_INCIDENTS);
  const [selectedIncident, setSelectedIncident] = useState<WaterLoggingIncident | null>(null);
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [statusUpdateSheetVisible, setStatusUpdateSheetVisible] = useState(false);
  const [incidentToUpdate, setIncidentToUpdate] = useState<string | null>(null);

  // Filter incidents by tab
  const tabFilteredIncidents = useMemo(() => {
    if (activeTab === 'logging') {
      return incidents.filter((incident) => incident.status !== 'Cleared');
    } else {
      return incidents.filter((incident) => incident.status === 'Cleared');
    }
  }, [activeTab, incidents]);

  // Filter by search query
  const filteredIncidents = useMemo(() => {
    if (searchQuery.trim() === '') {
      return tabFilteredIncidents;
    }
    const query = searchQuery.toLowerCase();
    return tabFilteredIncidents.filter(
      (incident) =>
        incident.roadName.toLowerCase().includes(query) ||
        incident.landmark?.toLowerCase().includes(query) ||
        incident.address.toLowerCase().includes(query)
    );
  }, [tabFilteredIncidents, searchQuery]);

  const handleBackPress = () => {
    router.back();
  };

  const handleReportPress = () => {
    router.push('/water-logging/capture');
  };

  const handleCardPress = (incident: WaterLoggingIncident) => {
    setSelectedIncident(incident);
    setBottomSheetVisible(true);
  };

  const handleStatusPress = (incidentId: string) => {
    setIncidentToUpdate(incidentId);
    setStatusUpdateSheetVisible(true);
  };

  const handleCloseBottomSheet = () => {
    setBottomSheetVisible(false);
    setTimeout(() => setSelectedIncident(null), 300);
  };

  const handleStatusUpdate = (data: { newStatus: 'Working' | 'Cleared'; media: any[]; remarks: string }) => {
    if (!incidentToUpdate) return;

    setIncidents((prevIncidents) =>
      prevIncidents.map((incident) => {
        if (incident.id === incidentToUpdate) {
          return {
            ...incident,
            status: data.newStatus,
            media: [...(incident.media || []), ...data.media],
          };
        }
        return incident;
      })
    );

    setStatusUpdateSheetVisible(false);
    setIncidentToUpdate(null);
  };

  const renderIncidentItem = ({ item }: { item: WaterLoggingIncident }) => (
    <IncidentCard
      incident={item}
      onPress={() => handleCardPress(item)}
      onStatusPress={() => handleStatusPress(item.id)}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="water-outline" size={64} color="#CCCCCC" />
      <Text style={styles.emptyStateTitle}>
        {activeTab === 'logging' ? 'No Active Reports' : 'No Cleared Reports'}
      </Text>
      <Text style={styles.emptyStateText}>
        {activeTab === 'logging'
          ? 'Tap the &quot;Report&quot; button below to create a new water logging report.'
          : 'Cleared water logging incidents will appear here.'}
      </Text>
    </View>
  );

  const currentIncident = incidents.find((inc) => inc.id === incidentToUpdate);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.cardBackground} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackPress}
          activeOpacity={0.6}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Water Logging Points</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'logging' && styles.tabActive]}
          onPress={() => setActiveTab('logging')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'logging' && styles.tabTextActive]}>
            Logging Points
          </Text>
          {activeTab === 'logging' && <View style={styles.tabIndicator} />}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'removal' && styles.tabActive]}
          onPress={() => setActiveTab('removal')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'removal' && styles.tabTextActive]}>
            Removal Points
          </Text>
          {activeTab === 'removal' && <View style={styles.tabIndicator} />}
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={COLORS.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by road name or place..."
            placeholderTextColor={COLORS.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
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
        data={filteredIncidents}
        renderItem={renderIncidentItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
      />

      {/* Floating Action Button - Only visible on Logging Points tab */}
      {activeTab === 'logging' && (
        <TouchableOpacity
          style={styles.fab}
          onPress={handleReportPress}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={24} color={COLORS.white} />
          <Text style={styles.fabText}>Report</Text>
        </TouchableOpacity>
      )}

      {/* Details Bottom Sheet */}
      <WaterLoggingDetailsBottomSheet
        visible={bottomSheetVisible}
        incident={selectedIncident}
        onClose={handleCloseBottomSheet}
      />

      {/* Status Update Sheet */}
      <WaterLoggingStatusUpdateSheet
        visible={statusUpdateSheetVisible}
        incidentId={incidentToUpdate}
        currentStatus={currentIncident?.status || 'Reported'}
        onClose={() => {
          setStatusUpdateSheetVisible(false);
          setIncidentToUpdate(null);
        }}
        onUpdate={handleStatusUpdate}
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
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    position: 'relative',
  },
  tabActive: {
    // Active tab styling handled by indicator
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.primary,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: COLORS.primary,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  searchContainer: {
    backgroundColor: COLORS.cardBackground,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    paddingVertical: 0,
  },
  listContent: {
    flexGrow: 1,
    padding: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
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
    marginBottom: 12,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateTimeText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  statusButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
    textTransform: 'uppercase',
  },
  roadName: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
    lineHeight: 23,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  metaText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  addressText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  landmarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  landmarkText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  divisionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  divisionText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  viewDetailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewDetailsText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
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
  fab: {
    position: 'absolute',
    bottom: 48,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 28,
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  fabText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
});
