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
  description: string;
  name: string;
  contactNumber: string;
  location: string;
  serviceType: string;
  complaintCategory: string;
  priority: string;
  source: string;
  pollNumber: string;
  flatNumber: string;
  createdAt: string;
  lastUpdated: string;
  media: MediaItem[];
}

// Sample complaint data based on the screenshot
const MOCK_COMPLAINT: ComplaintDetails = {
  id: 'PWD202511070002',
  subject: 'Complaint from neil sparx',
  status: 'SUBMITTED',
  description: 'sdfsfdsfsdsfdsfdsf',
  name: 'neil sparx',
  contactNumber: '5555555555',
  location: 'Patparganj, New Delhi, Delhi, India',
  serviceType: 'Residential Colony',
  complaintCategory: 'House alloted, possession not given',
  priority: '3',
  source: 'Mobile App',
  pollNumber: 'dsfsfsfsf',
  flatNumber: 'sdfdsfdsf',
  createdAt: '07/11/2025 09:02',
  lastUpdated: '07/11/2025 09:02',
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

interface InfoRowProps {
  label: string;
  value: string;
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
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

  const handleMediaPress = (index: number) => {
    setSelectedMediaIndex(index);
    setMediaViewerVisible(true);
  };

  const handleAssignTask = () => {
    // Show toast notification
    alert('Coming Soon: Assign Task functionality');
  };

  const handleUpdateStatus = () => {
    // Show toast notification
    alert('Coming Soon: Update Status functionality');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.cardBackground} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.6}
        >
          <Ionicons name="arrow-back" size={28} color={COLORS.text} />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {complaint.id}
          </Text>
        </View>

        <View style={styles.headerSpacer} />
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Card 1: Primary Details */}
        <View style={styles.card}>
          <Text style={styles.subjectTitle}>{complaint.subject}</Text>

          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(complaint.status) },
            ]}
          >
            <Text style={styles.statusBadgeText}>{complaint.status}</Text>
          </View>

          <Text style={styles.description}>{complaint.description}</Text>
        </View>

        {/* Card 2: Media Attachments */}
        {complaint.media.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Attached Media</Text>

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

        {/* Card 3: Complainant & Location Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Complainant & Location</Text>

          <InfoRow label="Name" value={complaint.name} />
          <InfoRow label="Contact Number" value={complaint.contactNumber} />
          <InfoRow label="Location" value={complaint.location} />
          <InfoRow label="Service Type" value={complaint.serviceType} />
          <InfoRow label="Complaint Category" value={complaint.complaintCategory} />
        </View>

        {/* Card 4: Additional Information */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Additional Information</Text>

          <View style={styles.gridContainer}>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Priority</Text>
              <Text style={styles.gridValue}>{complaint.priority}</Text>
            </View>

            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Source</Text>
              <Text style={styles.gridValue}>{complaint.source}</Text>
            </View>
          </View>

          <View style={styles.gridContainer}>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Poll Number</Text>
              <Text style={styles.gridValue}>{complaint.pollNumber}</Text>
            </View>

            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Flat Number</Text>
              <Text style={styles.gridValue}>{complaint.flatNumber}</Text>
            </View>
          </View>

          <View style={styles.gridContainer}>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Created At</Text>
              <Text style={styles.gridValue}>{complaint.createdAt}</Text>
            </View>

            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Last Updated</Text>
              <Text style={styles.gridValue}>{complaint.lastUpdated}</Text>
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
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  headerSpacer: {
    width: 44,
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
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  subjectTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
    lineHeight: 30,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.cardBackground,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 15,
    color: COLORS.textSecondary,
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
  infoRow: {
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textLight,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.text,
    lineHeight: 22,
  },
  gridContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  gridItem: {
    flex: 1,
  },
  gridLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textLight,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  gridValue: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    lineHeight: 20,
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
