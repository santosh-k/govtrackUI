import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Platform,
  Dimensions,
  Modal,
  Image,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Video, ResizeMode } from 'expo-av';

const COLORS = {
  background: '#F5F5F5',
  cardBackground: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#666666',
  textLight: '#9E9E9E',
  primary: '#2196F3',
  saffron: '#FF9800',
  border: '#E0E0E0',
  linkBlue: '#1976D2',
  divider: '#EEEEEE',

  // Status colors
  statusSubmitted: '#FF9800',
  statusOpen: '#F44336',
  statusInProgress: '#2196F3',
  statusResolved: '#4CAF50',
  statusClosed: '#757575',
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface MediaItem {
  type: 'image' | 'video';
  uri: string;
  thumbnail?: string;
}

interface ComplaintDetails {
  id: string;
  subject: string;
  status: string;
  location: string;
  complaintType: string;
  category: string;
  pollNumber: string;
  priority: string;
  source: string;
  createdAt: string;
  lastUpdated: string;
  reportedByName: string;
  reportedByContact: string;
  assignedTo?: string;
  assignedToDesignation?: string;
  media: MediaItem[];
}

// Sample complaint data based on the screenshot
const MOCK_COMPLAINT: ComplaintDetails = {
  id: 'PWD202511070002',
  subject: 'Complaint from neil sparx',
  status: 'SUBMITTED',
  location: 'Patparganj, New Delhi, Delhi, India',
  complaintType: 'Residential Colony',
  category: 'House alloted, possession not given',
  pollNumber: 'dsfsfsfsf',
  priority: '3',
  source: 'Mobile App',
  createdAt: '07/11/2025 09:02',
  lastUpdated: '07/11/2025 09:02',
  reportedByName: 'neil sparx',
  reportedByContact: '5555555555',
  assignedTo: 'Er Sabir Ali', // Set to undefined or remove this line to test "Not Yet Assigned"
  assignedToDesignation: 'Assistant Engineer',
  media: [
    {
      type: 'image',
      uri: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&q=80',
    },
    {
      type: 'image',
      uri: 'https://images.unsplash.com/photo-1590004953392-5aba2e72269a?w=800&q=80',
    },
    {
      type: 'video',
      uri: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80',
    },
  ],
};

interface GridItemProps {
  label: string;
  value: string;
}

function GridItem({ label, value }: GridItemProps) {
  return (
    <View style={styles.gridItem}>
      <Text style={styles.gridLabel}>{label}</Text>
      <Text style={styles.gridValue}>{value}</Text>
    </View>
  );
}

interface MediaViewerProps {
  visible: boolean;
  media: MediaItem[];
  initialIndex: number;
  onClose: () => void;
}

function MediaViewer({ visible, media, initialIndex, onClose }: MediaViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'left' && currentIndex < media.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (direction === 'right' && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const currentMedia = media[currentIndex];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.mediaViewerContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />

        {/* Close Button */}
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
          activeOpacity={0.8}
        >
          <Ionicons name="close" size={32} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Media Counter */}
        <View style={styles.mediaCounter}>
          <Text style={styles.mediaCounterText}>
            {currentIndex + 1} / {media.length}
          </Text>
        </View>

        {/* Media Content */}
        <View style={styles.mediaContent}>
          {currentMedia.type === 'image' ? (
            <Image
              source={{ uri: currentMedia.uri }}
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
          ) : (
            <Video
              source={{ uri: currentMedia.uri }}
              style={styles.fullScreenVideo}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay={false}
            />
          )}
        </View>

        {/* Navigation Arrows */}
        {currentIndex > 0 && (
          <TouchableOpacity
            style={[styles.navButton, styles.navButtonLeft]}
            onPress={() => handleSwipe('right')}
            activeOpacity={0.8}
          >
            <Ionicons name="chevron-back" size={40} color="#FFFFFF" />
          </TouchableOpacity>
        )}

        {currentIndex < media.length - 1 && (
          <TouchableOpacity
            style={[styles.navButton, styles.navButtonRight]}
            onPress={() => handleSwipe('left')}
            activeOpacity={0.8}
          >
            <Ionicons name="chevron-forward" size={40} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
    </Modal>
  );
}

export default function ComplaintDetailsScreen() {
  // In a real app, fetch complaint details based on ID using useLocalSearchParams()
  const complaint = MOCK_COMPLAINT;

  const [mediaViewerVisible, setMediaViewerVisible] = useState(false);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'SUBMITTED':
        return COLORS.statusSubmitted;
      case 'OPEN':
        return COLORS.statusOpen;
      case 'IN PROGRESS':
        return COLORS.statusInProgress;
      case 'RESOLVED':
        return COLORS.statusResolved;
      case 'CLOSED':
        return COLORS.statusClosed;
      default:
        return COLORS.textSecondary;
    }
  };

  const handleLocationPress = async () => {
    const address = encodeURIComponent(complaint.location);
    const url = Platform.select({
      ios: `maps:0,0?q=${address}`,
      android: `geo:0,0?q=${address}`,
    });

    const webUrl = `https://www.google.com/maps/search/?api=1&query=${address}`;

    try {
      if (url) {
        const supported = await Linking.canOpenURL(url);
        if (supported) {
          await Linking.openURL(url);
        } else {
          await Linking.openURL(webUrl);
        }
      } else {
        await Linking.openURL(webUrl);
      }
    } catch {
      Alert.alert('Error', 'Unable to open maps');
    }
  };

  const handleMediaPress = (index: number) => {
    setSelectedMediaIndex(index);
    setMediaViewerVisible(true);
  };

  const handleAssignTask = () => {
    Alert.alert('Coming Soon', 'Assign Task functionality will be available soon');
  };

  const handleUpdateStatus = () => {
    Alert.alert('Coming Soon', 'Update Status functionality will be available soon');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.cardBackground} />

      {/* Header */}
      <View style={styles.header}>
        {/* Left: Back Arrow + Complaint ID */}
        <View style={styles.headerLeftSection}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.6}
          >
            <Ionicons name="arrow-back" size={28} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerComplaintId} numberOfLines={1}>
            {complaint.id}
          </Text>
        </View>

        {/* Center: Empty */}
        <View style={styles.headerCenter} />

        {/* Right: Status Badge */}
        <View
          style={[
            styles.headerStatusBadge,
            { backgroundColor: getStatusColor(complaint.status) },
          ]}
        >
          <Text style={styles.headerStatusText}>{complaint.status}</Text>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Card 1: Complaint Details (Primary Card - Comprehensive Summary) */}
        <View style={[styles.card, styles.primaryCard]}>
          {/* Subject - Main Title */}
          <Text style={styles.subjectTitle}>{complaint.subject}</Text>

          {/* Location with Map Pin Icon */}
          <TouchableOpacity
            style={styles.locationContainer}
            onPress={handleLocationPress}
            activeOpacity={0.7}
          >
            <Ionicons name="location" size={20} color={COLORS.linkBlue} />
            <Text style={styles.locationLink}>{complaint.location}</Text>
          </TouchableOpacity>

          {/* Key Details Grid */}
          <View style={styles.detailsGrid}>
            <View style={styles.gridRow}>
              <GridItem label="Complaint Type" value={complaint.complaintType} />
              <GridItem label="Category" value={complaint.category} />
            </View>
            <View style={styles.gridRow}>
              <GridItem label="Poll Number" value={complaint.pollNumber} />
              <View style={styles.gridItem} />
            </View>
          </View>

          {/* Separator Line */}
          <View style={styles.primaryCardDivider} />

          {/* Assignment Footer Section */}
          <View style={styles.assignmentFooter}>
            <Text style={styles.assignmentLabel}>Assigned To:</Text>
            {complaint.assignedTo ? (
              <View style={styles.assignedPersonContainer}>
                <Ionicons name="person-circle-outline" size={24} color={COLORS.primary} />
                <View style={styles.assignedPersonDetails}>
                  <Text style={styles.assignedPersonName}>{complaint.assignedTo}</Text>
                  {complaint.assignedToDesignation && (
                    <Text style={styles.assignedPersonDesignation}>
                      {complaint.assignedToDesignation}
                    </Text>
                  )}
                </View>
              </View>
            ) : (
              <View style={styles.notAssignedFooter}>
                <Ionicons name="person-add-outline" size={18} color={COLORS.textLight} />
                <Text style={styles.notAssignedFooterText}>Not Yet Assigned</Text>
              </View>
            )}
          </View>
        </View>

        {/* Card 2: Additional Information */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Additional Information</Text>

          <View style={styles.detailsGrid}>
            <View style={styles.gridRow}>
              <GridItem label="Priority" value={complaint.priority} />
              <GridItem label="Source" value={complaint.source} />
            </View>
            <View style={styles.gridRow}>
              <GridItem label="Created At" value={complaint.createdAt} />
              <GridItem label="Last Updated" value={complaint.lastUpdated} />
            </View>
          </View>
        </View>

        {/* Card 3: Media Attachments */}
        {complaint.media.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Media Attachments</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.mediaScrollContent}
            >
              {complaint.media.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.mediaThumbnail}
                  onPress={() => handleMediaPress(index)}
                  activeOpacity={0.7}
                >
                  <Image
                    source={{ uri: item.type === 'video' ? item.thumbnail : item.uri }}
                    style={styles.thumbnailImage}
                  />
                  {item.type === 'video' && (
                    <View style={styles.playIconContainer}>
                      <Ionicons name="play-circle" size={40} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Card 4: Complainant Information */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Reported By</Text>

          {/* Reported By Section */}
          <View style={styles.personInfo}>
            <Ionicons name="person-circle-outline" size={28} color={COLORS.textSecondary} />
            <View style={styles.personDetails}>
              <Text style={styles.personName}>{complaint.reportedByName}</Text>
              <Text style={styles.personContact}>{complaint.reportedByContact}</Text>
            </View>
          </View>
        </View>

        {/* Spacer for floating action bar */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Floating Action Bar */}
      <View style={styles.floatingActionBar}>
        <TouchableOpacity
          style={[styles.actionBarButton, styles.assignButton]}
          onPress={handleAssignTask}
          activeOpacity={0.8}
        >
          <Ionicons name="person-add-outline" size={20} color={COLORS.cardBackground} />
          <Text style={styles.actionBarButtonText}>Assign Task</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBarButton, styles.updateButton]}
          onPress={handleUpdateStatus}
          activeOpacity={0.8}
        >
          <Ionicons name="refresh-outline" size={20} color={COLORS.cardBackground} />
          <Text style={styles.actionBarButtonText}>Update Status</Text>
        </TouchableOpacity>
      </View>

      {/* Media Viewer Modal */}
      <MediaViewer
        visible={mediaViewerVisible}
        media={complaint.media}
        initialIndex={selectedMediaIndex}
        onClose={() => setMediaViewerVisible(false)}
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
  headerLeftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerComplaintId: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  headerCenter: {
    flex: 0,
  },
  headerStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 8,
  },
  headerStatusText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.cardBackground,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  primaryCard: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 20,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 20,
    letterSpacing: 0.2,
  },
  subjectTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 14,
    lineHeight: 32,
    letterSpacing: 0.2,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    gap: 8,
  },
  locationLink: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.linkBlue,
    lineHeight: 22,
    textDecorationLine: 'underline',
  },
  detailsGrid: {
    gap: 16,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 16,
  },
  gridItem: {
    flex: 1,
  },
  gridLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textLight,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  gridValue: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.text,
    lineHeight: 22,
  },
  mediaScrollContent: {
    gap: 12,
  },
  mediaThumbnail: {
    width: 120,
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.background,
    position: 'relative',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  playIconContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  primaryCardDivider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginTop: 24,
    marginBottom: 20,
  },
  assignmentFooter: {
    gap: 12,
  },
  assignmentLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  assignedPersonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  assignedPersonDetails: {
    flex: 1,
  },
  assignedPersonName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 3,
  },
  assignedPersonDesignation: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.textSecondary,
  },
  notAssignedFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notAssignedFooterText: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.textLight,
    fontStyle: 'italic',
  },
  peopleSection: {
    marginBottom: 0,
  },
  peopleSectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textLight,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  personInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  personDetails: {
    flex: 1,
  },
  personName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  personContact: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.textSecondary,
  },
  peopleDivider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: 20,
  },
  notAssignedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  notAssignedText: {
    fontSize: 15,
    fontWeight: '400',
    color: COLORS.textLight,
    fontStyle: 'italic',
  },
  bottomSpacer: {
    height: 80,
  },
  floatingActionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: COLORS.cardBackground,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  actionBarButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  assignButton: {
    backgroundColor: COLORS.primary,
  },
  updateButton: {
    backgroundColor: COLORS.saffron,
  },
  actionBarButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.cardBackground,
  },
  // Media Viewer Styles
  mediaViewerContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    right: 20,
    zIndex: 10,
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 24,
  },
  mediaCounter: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  mediaCounterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  mediaContent: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  fullScreenVideo: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    marginTop: -30,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 12,
    borderRadius: 30,
    zIndex: 10,
  },
  navButtonLeft: {
    left: 20,
  },
  navButtonRight: {
    right: 20,
  },
});
