/**
 * Water Logging Points - List Screen
 *
 * Displays detailed water logging incidents with:
 * - Complete information in each card
 * - Severity badges with color coding
 * - Location and incident details
 * - Media gallery for photos/videos
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
  Image,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS, SPACING } from '@/theme';

// Types
interface MediaAttachment {
  id: string;
  uri: string;
  type: 'image' | 'video';
}

interface WaterLoggingIncident {
  id: string;
  roadName: string;
  locationType: string;
  division: string;
  landmark?: string;
  address: string;
  dateTime: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  affectedArea: string;
  maxWaterDepth: string;
  approxArea: string;
  mainCause: string;
  trafficImpact: string;
  status: string;
  media?: MediaAttachment[];
}

// Mock Data with complete details
const MOCK_INCIDENTS: WaterLoggingIncident[] = [
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
    status: 'Reported',
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
    status: 'Reported',
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
    status: 'Reported',
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
    status: 'Reported',
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

// Detail Row Component
interface DetailRowProps {
  label: string;
  value: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

const DetailRow: React.FC<DetailRowProps> = ({ label, value, icon }) => (
  <View style={styles.detailRow}>
    {icon && <Ionicons name={icon} size={14} color={COLORS.textSecondary} style={styles.detailIcon} />}
    <Text style={styles.detailLabel}>{label}:</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

// Incident Card Component with Full Details
interface IncidentCardProps {
  incident: WaterLoggingIncident;
}

const IncidentCard: React.FC<IncidentCardProps> = ({ incident }) => {
  const severityColor = getSeverityColor(incident.severity);

  return (
    <View style={styles.card}>
      {/* Header Row: Date/Time & Severity Badge */}
      <View style={styles.cardTopRow}>
        <View style={styles.dateTimeContainer}>
          <Ionicons name="time-outline" size={14} color={COLORS.textSecondary} />
          <Text style={styles.dateTimeText}>{incident.dateTime}</Text>
        </View>
        <View style={[styles.severityBadge, { backgroundColor: severityColor }]}>
          <Text style={styles.severityText}>{incident.severity}</Text>
        </View>
      </View>

      {/* Title Section */}
      <Text style={styles.roadName} numberOfLines={2}>
        {incident.roadName}
      </Text>
      <View style={styles.locationTypeBadge}>
        <Ionicons name="business-outline" size={14} color={COLORS.primary} />
        <Text style={styles.locationTypeText}>{incident.locationType}</Text>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Location Details Section */}
      <Text style={styles.sectionTitle}>Location Details</Text>
      <View style={styles.detailsContainer}>
        <DetailRow label="Division" value={incident.division} icon="location-outline" />
        {incident.landmark && (
          <DetailRow label="Landmark" value={incident.landmark} icon="pin-outline" />
        )}
        <DetailRow label="Address" value={incident.address} icon="map-outline" />
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Incident Details Section */}
      <Text style={styles.sectionTitle}>Incident Details</Text>
      <View style={styles.incidentDetailsGrid}>
        <View style={styles.gridItem}>
          <Text style={styles.gridLabel}>Max Water Depth</Text>
          <Text style={styles.gridValue}>{incident.maxWaterDepth}</Text>
        </View>
        <View style={styles.gridItem}>
          <Text style={styles.gridLabel}>Approx Area</Text>
          <Text style={styles.gridValue}>{incident.approxArea}</Text>
        </View>
        <View style={[styles.gridItem, styles.gridItemFull]}>
          <Text style={styles.gridLabel}>Side/Area Affected</Text>
          <Text style={styles.gridValue}>{incident.affectedArea}</Text>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Cause & Impact Section */}
      <Text style={styles.sectionTitle}>Cause & Impact</Text>
      <View style={styles.detailsContainer}>
        <View style={styles.causeImpactRow}>
          <View style={styles.causeContainer}>
            <Ionicons name="warning-outline" size={16} color="#FF5722" />
            <View style={styles.causeTextContainer}>
              <Text style={styles.causeLabel}>Main Cause</Text>
              <Text style={styles.causeValue}>{incident.mainCause}</Text>
            </View>
          </View>
          <View style={styles.impactContainer}>
            <Ionicons name="car-outline" size={16} color="#2196F3" />
            <View style={styles.impactTextContainer}>
              <Text style={styles.impactLabel}>Traffic Impact</Text>
              <Text style={styles.impactValue}>{incident.trafficImpact}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Media Gallery (if available) */}
      {incident.media && incident.media.length > 0 && (
        <>
          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>Evidence</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.mediaGallery}
            contentContainerStyle={styles.mediaGalleryContent}
          >
            {incident.media.map((media) => (
              <View key={media.id} style={styles.mediaThumbnail}>
                <Image source={{ uri: media.uri }} style={styles.mediaImage} />
                {media.type === 'video' && (
                  <View style={styles.videoOverlay}>
                    <Ionicons name="play-circle" size={32} color={COLORS.white} />
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        </>
      )}

      {/* Status Footer */}
      <View style={styles.statusFooter}>
        <View style={styles.statusContainer}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Status: {incident.status}</Text>
        </View>
        <Text style={styles.incidentId}>{incident.id}</Text>
      </View>
    </View>
  );
};

// Main List Screen
export default function WaterLoggingListScreen() {
  const [incidents] = useState<WaterLoggingIncident[]>(MOCK_INCIDENTS);

  const handleBackPress = () => {
    router.back();
  };

  const handleReportPress = () => {
    router.push('/water-logging/capture');
  };

  const renderIncidentItem = ({ item }: { item: WaterLoggingIncident }) => (
    <IncidentCard incident={item} />
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
    marginBottom: 12,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateTimeText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
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
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
    lineHeight: 23,
  },
  locationTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    marginBottom: 12,
  },
  locationTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailsContainer: {
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  detailIcon: {
    marginRight: 6,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginRight: 4,
  },
  detailValue: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.text,
  },
  incidentDetailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  gridItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F9F9F9',
    padding: 10,
    borderRadius: 8,
  },
  gridItemFull: {
    minWidth: '100%',
  },
  gridLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  gridValue: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  causeImpactRow: {
    flexDirection: 'row',
    gap: 12,
  },
  causeContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFEBEE',
    padding: 10,
    borderRadius: 8,
    gap: 8,
  },
  causeTextContainer: {
    flex: 1,
  },
  causeLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#C62828',
    marginBottom: 2,
  },
  causeValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D32F2F',
  },
  impactContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E3F2FD',
    padding: 10,
    borderRadius: 8,
    gap: 8,
  },
  impactTextContainer: {
    flex: 1,
  },
  impactLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1565C0',
    marginBottom: 2,
  },
  impactValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1976D2',
  },
  mediaGallery: {
    marginTop: 4,
  },
  mediaGalleryContent: {
    gap: 8,
  },
  mediaThumbnail: {
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    position: 'relative',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
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
    fontWeight: '500',
  },
  incidentId: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
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
