/**
 * Water Logging Points - List Screen
 *
 * Displays a list of reported water logging incidents with:
 * - Severity badges with color coding
 * - Location and type information
 * - Date/time stamps
 * - FAB for creating new reports
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  FlatList,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS, SPACING } from '@/theme';

// Types
interface WaterLoggingIncident {
  id: string;
  roadName: string;
  locationType: string;
  depth: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  dateTime: string;
  status: string;
  landmark?: string;
  address: string;
}

// Mock Data
const MOCK_INCIDENTS: WaterLoggingIncident[] = [
  {
    id: 'WL-2024-001',
    roadName: 'Ring Road near Rajouri Garden Metro',
    locationType: 'Road',
    depth: '1.5 ft',
    severity: 'High',
    dateTime: '20-Mar-2024 10:30 AM',
    status: 'Reported',
    landmark: 'Opposite Metro Station Gate 2',
    address: 'Ring Road, Rajouri Garden, Delhi',
  },
  {
    id: 'WL-2024-002',
    roadName: 'ITO Underpass - Central Section',
    locationType: 'Underpass',
    depth: '2.0 ft',
    severity: 'Critical',
    dateTime: '20-Mar-2024 09:15 AM',
    status: 'Reported',
    landmark: 'ITO Junction',
    address: 'ITO, Delhi',
  },
  {
    id: 'WL-2024-003',
    roadName: 'Nehru Park Main Gate',
    locationType: 'Park',
    depth: '0.8 ft',
    severity: 'Medium',
    dateTime: '19-Mar-2024 04:45 PM',
    status: 'Reported',
    landmark: 'Near Main Entrance',
    address: 'Nehru Park, Chanakyapuri, Delhi',
  },
  {
    id: 'WL-2024-004',
    roadName: 'Mathura Road Extension',
    locationType: 'Road',
    depth: '1.2 ft',
    severity: 'High',
    dateTime: '19-Mar-2024 02:20 PM',
    status: 'Reported',
    landmark: 'Near Ashram Chowk',
    address: 'Mathura Road, Delhi',
  },
  {
    id: 'WL-2024-005',
    roadName: 'Model Town Colony Road 5',
    locationType: 'Colony',
    depth: '0.5 ft',
    severity: 'Low',
    dateTime: '19-Mar-2024 11:00 AM',
    status: 'Reported',
    landmark: 'Near Community Center',
    address: 'Model Town, Delhi',
  },
  {
    id: 'WL-2024-006',
    roadName: 'Punjabi Bagh Flyover East Approach',
    locationType: 'Flyover',
    depth: '1.8 ft',
    severity: 'Critical',
    dateTime: '18-Mar-2024 03:30 PM',
    status: 'Reported',
    landmark: 'East Side Entry',
    address: 'Punjabi Bagh, Delhi',
  },
];

// Helper function to get severity color
const getSeverityColor = (severity: string): string => {
  switch (severity) {
    case 'Low':
      return '#4CAF50'; // Green
    case 'Medium':
      return '#FF9800'; // Orange
    case 'High':
      return '#FF5722'; // Deep Orange
    case 'Critical':
      return '#F44336'; // Red
    default:
      return COLORS.textSecondary;
  }
};

// Incident Card Component
interface IncidentCardProps {
  incident: WaterLoggingIncident;
  onPress: () => void;
}

const IncidentCard: React.FC<IncidentCardProps> = ({ incident, onPress }) => {
  const severityColor = getSeverityColor(incident.severity);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Top Row: Date/Time & Severity Badge */}
      <View style={styles.cardTopRow}>
        <View style={styles.dateTimeContainer}>
          <Ionicons name="time-outline" size={14} color={COLORS.textSecondary} />
          <Text style={styles.dateTimeText}>{incident.dateTime}</Text>
        </View>
        <View style={[styles.severityBadge, { backgroundColor: severityColor }]}>
          <Text style={styles.severityText}>{incident.severity}</Text>
        </View>
      </View>

      {/* Main Title */}
      <Text style={styles.roadName} numberOfLines={2}>
        {incident.roadName}
      </Text>

      {/* Subtitle */}
      <View style={styles.subtitleRow}>
        <Ionicons name="location-outline" size={14} color={COLORS.textSecondary} />
        <Text style={styles.subtitleText}>
          Type: {incident.locationType} | Depth: {incident.depth}
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.cardFooter}>
        <View style={styles.statusContainer}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Status: {incident.status}</Text>
        </View>
        <View style={styles.viewDetailsLink}>
          <Text style={styles.viewDetailsText}>View Details</Text>
          <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Main List Screen
export default function WaterLoggingListScreen() {
  const [incidents] = useState<WaterLoggingIncident[]>(MOCK_INCIDENTS);

  const handleBackPress = () => {
    router.back();
  };

  const handleIncidentPress = (incident: WaterLoggingIncident) => {
    // Navigate to details screen (to be implemented)
    console.log('View incident details:', incident.id);
  };

  const handleReportPress = () => {
    router.push('/water-logging/capture');
  };

  const renderIncidentItem = ({ item }: { item: WaterLoggingIncident }) => (
    <IncidentCard
      incident={item}
      onPress={() => handleIncidentPress(item)}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="water-outline" size={64} color="#CCCCCC" />
      <Text style={styles.emptyStateTitle}>No Water Logging Reports</Text>
      <Text style={styles.emptyStateText}>
        Tap the &quot;Report&quot; button below to create a new water logging report.
      </Text>
    </View>
  );

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

      {/* List */}
      <FlatList
        data={incidents}
        renderItem={renderIncidentItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleReportPress}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={24} color={COLORS.white} />
        <Text style={styles.fabText}>Report</Text>
      </TouchableOpacity>
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
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
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
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  listContent: {
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
    marginBottom: 10,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateTimeText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  severityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.white,
    textTransform: 'uppercase',
  },
  roadName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
    lineHeight: 22,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  subtitleText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
  },
  statusText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  viewDetailsLink: {
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
    bottom: 24,
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
