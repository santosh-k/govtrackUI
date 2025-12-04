/**
 * Water Logging Details Bottom Sheet
 *
 * Displays full incident details including:
 * - Header with road name and severity
 * - Measurements section
 * - Analysis (cause & impact)
 * - Location details
 * - Media gallery
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Animated,
  Dimensions,
  Modal,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '@/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.75;

// Types
interface MediaAttachment {
  id: string;
  uri: string;
  type: 'image' | 'video';
}

export interface WaterLoggingIncident {
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
  latitude?: number;
  longitude?: number;
}

interface WaterLoggingDetailsBottomSheetProps {
  visible: boolean;
  incident: WaterLoggingIncident | null;
  onClose: () => void;
}

// Helper function to get severity color
const getSeverityColor = (severity: string): string => {
  switch (severity) {
    case 'Low':
      return '#4CAF50';
    case 'Medium':
      return '#FF9800';
    case 'High':
      return '#FF5722';
    case 'Critical':
      return '#F44336';
    default:
      return COLORS.textSecondary;
  }
};

export default function WaterLoggingDetailsBottomSheet({
  visible,
  incident,
  onClose,
}: WaterLoggingDetailsBottomSheetProps) {
  const slideAnim = useRef(new Animated.Value(SHEET_HEIGHT)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        stiffness: 200,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SHEET_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  if (!incident) return null;

  const severityColor = getSeverityColor(incident.severity);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <Animated.View
          style={[
            styles.sheet,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* Handle Bar */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <Text style={styles.headerTitle} numberOfLines={2}>
                {incident.roadName}
              </Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <View style={styles.headerBottom}>
              <View style={[styles.severityBadge, { backgroundColor: severityColor }]}>
                <Text style={styles.severityText}>{incident.severity}</Text>
              </View>
              <View style={styles.dateTimeContainer}>
                <Ionicons name="time-outline" size={14} color={COLORS.textSecondary} />
                <Text style={styles.dateTimeText}>{incident.dateTime}</Text>
              </View>
            </View>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Measurements Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Measurements</Text>
              <View style={styles.measurementsGrid}>
                <View style={styles.measurementCard}>
                  <Ionicons name="arrow-down" size={20} color={COLORS.primary} />
                  <Text style={styles.measurementLabel}>Max Water Depth</Text>
                  <Text style={styles.measurementValue}>{incident.maxWaterDepth}</Text>
                </View>
                <View style={styles.measurementCard}>
                  <Ionicons name="resize-outline" size={20} color={COLORS.primary} />
                  <Text style={styles.measurementLabel}>Approx Area</Text>
                  <Text style={styles.measurementValue}>{incident.approxArea}</Text>
                </View>
                <View style={[styles.measurementCard, styles.measurementCardFull]}>
                  <Ionicons name="layers-outline" size={20} color={COLORS.primary} />
                  <Text style={styles.measurementLabel}>Affected Area</Text>
                  <Text style={styles.measurementValue}>{incident.affectedArea}</Text>
                </View>
              </View>
            </View>

            {/* Analysis Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Analysis</Text>
              <View style={styles.analysisContainer}>
                <View style={styles.causeCard}>
                  <View style={styles.causeHeader}>
                    <Ionicons name="warning-outline" size={20} color="#FF5722" />
                    <Text style={styles.causeLabel}>Main Cause</Text>
                  </View>
                  <Text style={styles.causeValue}>{incident.mainCause}</Text>
                </View>
                <View style={styles.impactCard}>
                  <View style={styles.impactHeader}>
                    <Ionicons name="car-outline" size={20} color="#2196F3" />
                    <Text style={styles.impactLabel}>Traffic Impact</Text>
                  </View>
                  <Text style={styles.impactValue}>{incident.trafficImpact}</Text>
                </View>
              </View>
            </View>

            {/* Location Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Location Details</Text>
              <View style={styles.locationDetails}>
                <View style={styles.locationRow}>
                  <Ionicons name="business-outline" size={18} color={COLORS.textSecondary} />
                  <View style={styles.locationTextContainer}>
                    <Text style={styles.locationLabel}>Type</Text>
                    <Text style={styles.locationValue}>{incident.locationType}</Text>
                  </View>
                </View>
                <View style={styles.locationRow}>
                  <Ionicons name="location-outline" size={18} color={COLORS.textSecondary} />
                  <View style={styles.locationTextContainer}>
                    <Text style={styles.locationLabel}>Division</Text>
                    <Text style={styles.locationValue}>{incident.division}</Text>
                  </View>
                </View>
                {incident.landmark && (
                  <View style={styles.locationRow}>
                    <Ionicons name="pin-outline" size={18} color={COLORS.textSecondary} />
                    <View style={styles.locationTextContainer}>
                      <Text style={styles.locationLabel}>Landmark</Text>
                      <Text style={styles.locationValue}>{incident.landmark}</Text>
                    </View>
                  </View>
                )}
                <View style={styles.locationRow}>
                  <Ionicons name="map-outline" size={18} color={COLORS.textSecondary} />
                  <View style={styles.locationTextContainer}>
                    <Text style={styles.locationLabel}>Address</Text>
                    <Text style={styles.locationValue}>{incident.address}</Text>
                  </View>
                </View>
                {incident.latitude && incident.longitude && (
                  <View style={styles.locationRow}>
                    <Ionicons name="navigate-outline" size={18} color={COLORS.textSecondary} />
                    <View style={styles.locationTextContainer}>
                      <Text style={styles.locationLabel}>GPS Coordinates</Text>
                      <Text style={styles.locationValue}>
                        {incident.latitude.toFixed(6)}, {incident.longitude.toFixed(6)}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </View>

            {/* Evidence Section */}
            {incident.media && incident.media.length > 0 && (
              <View style={styles.section}>
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
                          <Ionicons name="play-circle" size={40} color={COLORS.white} />
                        </View>
                      )}
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Status Footer */}
            <View style={styles.statusFooter}>
              <View style={styles.statusContainer}>
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor:
                        incident.status === 'Cleared' ? '#4CAF50' : '#FF9800',
                    },
                  ]}
                />
                <Text style={styles.statusText}>Status: {incident.status}</Text>
              </View>
              <Text style={styles.incidentId}>{incident.id}</Text>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    height: SHEET_HEIGHT,
    backgroundColor: COLORS.cardBackground,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
  },
  header: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    lineHeight: 28,
    marginRight: 12,
  },
  closeButton: {
    padding: 4,
  },
  headerBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  severityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  severityText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
    textTransform: 'uppercase',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateTimeText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  section: {
    marginTop: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  measurementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  measurementCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#F5F5F5',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  measurementCardFull: {
    minWidth: '100%',
  },
  measurementLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  measurementValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  analysisContainer: {
    gap: 12,
  },
  causeCard: {
    backgroundColor: '#FFEBEE',
    padding: 14,
    borderRadius: 12,
  },
  causeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  causeLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#C62828',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  causeValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#D32F2F',
  },
  impactCard: {
    backgroundColor: '#E3F2FD',
    padding: 14,
    borderRadius: 12,
  },
  impactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  impactLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1565C0',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  impactValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1976D2',
  },
  locationDetails: {
    gap: 14,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  locationValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    lineHeight: 20,
  },
  mediaGallery: {
    marginTop: 4,
  },
  mediaGalleryContent: {
    gap: 12,
  },
  mediaThumbnail: {
    width: 140,
    height: 140,
    borderRadius: 12,
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
    marginTop: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  incidentId: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
  },
});
