/**
 * Task Details Screen - Multi-Tab Interface
 *
 * A comprehensive task details view with:
 * - Back arrow in main header
 * - Sticky sub-header with Task Category and tappable Status Badge
 * - Tab Navigator: Details, Media, History
 * - Details Tab: Description card, Location card, People card
 * - Media Tab: Reused from Project Media (grid + FAB)
 * - History Tab: Reused from Project Activity (timeline)
 */

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
  Image,
  FlatList,
  Linking,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { COLORS, SPACING } from '@/theme';
import UpdateActivityBottomSheet from '@/components/UpdateActivityBottomSheet';
import AddMediaSheet from '@/components/AddMediaSheet';
import Toast from '@/components/Toast';
import { Video, ResizeMode } from 'expo-av';

// Types
type TabName = 'Details' | 'Media' | 'History';
type MediaFilterType = 'Photos' | 'Videos' | 'Documents';
type TaskStatus = 'Pending' | 'In Progress' | 'Completed' | 'Overdue';

interface MediaItem {
  id: string;
  type: 'image' | 'video' | 'document';
  uri: string;
  thumbnail?: string;
  filename?: string;
}

interface ActivityItem {
  id: string;
  type: 'status_change' | 'reply';
  user: string;
  designation: string;
  timestamp: string;
  statusFrom?: string;
  statusTo?: string;
  message?: string;
}

interface TaskDetails {
  id: string;
  taskId: string;
  category: string;
  description: string;
  location: string;
  assignedBy: string;
  assignedByOffice: string;
  assignedTo: string;
  assignedToPosition: string;
  status: TaskStatus;
}

// Mock data
const MOCK_TASK: TaskDetails = {
  id: '1',
  taskId: 'TSK-2024-001',
  category: 'Road Inspection',
  description: 'Conduct a thorough inspection of the NH-44 road section between KM 15 to KM 25. Check for potholes, cracks, drainage issues, and road markings. Document all findings with photos and prepare a detailed report.',
  location: 'National Highway 44, Sector 15, New Delhi, India',
  assignedBy: 'Er Sabir Ali',
  assignedByOffice: 'Central Department',
  assignedTo: 'Rajesh Kumar',
  assignedToPosition: 'Field Inspector',
  status: 'In Progress',
};

const MOCK_MEDIA: MediaItem[] = [
  { id: '1', type: 'image', uri: 'https://via.placeholder.com/400x300/4CAF50/FFFFFF?text=Road+Photo+1' },
  { id: '2', type: 'image', uri: 'https://via.placeholder.com/400x300/2196F3/FFFFFF?text=Road+Photo+2' },
  { id: '3', type: 'video', uri: 'https://via.placeholder.com/400x300/FF9800/FFFFFF?text=Inspection+Video', thumbnail: 'https://via.placeholder.com/400x300/FF9800/FFFFFF?text=Inspection+Video' },
  { id: '4', type: 'document', uri: 'https://example.com/report.pdf', filename: 'Inspection_Report.pdf' },
  { id: '5', type: 'image', uri: 'https://via.placeholder.com/400x300/9C27B0/FFFFFF?text=Road+Photo+3' },
  { id: '6', type: 'image', uri: 'https://via.placeholder.com/400x300/F44336/FFFFFF?text=Damage+Photo' },
];

const MOCK_ACTIVITY: ActivityItem[] = [
  {
    id: '1',
    type: 'status_change',
    user: 'Rajesh Kumar',
    designation: 'Field Inspector',
    timestamp: '15 Jan 2024, 02:30 PM',
    statusFrom: 'Pending',
    statusTo: 'In Progress',
  },
  {
    id: '2',
    type: 'reply',
    user: 'Rajesh Kumar',
    designation: 'Field Inspector',
    timestamp: '15 Jan 2024, 10:45 AM',
    message: 'Started the inspection. Initial findings show minor cracks in the road surface.',
  },
  {
    id: '3',
    type: 'status_change',
    user: 'Er Sabir Ali',
    designation: 'Senior Engineer',
    timestamp: '15 Jan 2024, 10:30 AM',
    statusFrom: undefined,
    statusTo: 'Pending',
  },
];

// Helper function to get status color
const getStatusColor = (status: TaskStatus) => {
  switch (status) {
    case 'Completed':
      return COLORS.success;
    case 'In Progress':
      return COLORS.info;
    case 'Pending':
      return COLORS.warning;
    case 'Overdue':
      return COLORS.error;
    default:
      return COLORS.textSecondary;
  }
};

// Media Viewer Component
interface MediaViewerProps {
  visible: boolean;
  media: MediaItem[];
  initialIndex: number;
  onClose: () => void;
}

function MediaViewer({ visible, media, initialIndex, onClose }: MediaViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const currentMedia = media[currentIndex];

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'left' && currentIndex < media.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (direction === 'right' && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.mediaViewerContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />

        {/* Close Button */}
        <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.8}>
          <Ionicons name="close" size={32} color={COLORS.white} />
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
            <Image source={{ uri: currentMedia.uri }} style={styles.fullScreenImage} resizeMode="contain" />
          ) : currentMedia.type === 'video' ? (
            <Video
              source={{ uri: currentMedia.uri }}
              style={styles.fullScreenVideo}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay={false}
            />
          ) : (
            <View style={styles.documentViewerPlaceholder}>
              <Ionicons name="document-text" size={100} color={COLORS.white} />
              <Text style={styles.documentFilename}>{currentMedia.filename}</Text>
            </View>
          )}
        </View>

        {/* Navigation Arrows */}
        {currentIndex > 0 && (
          <TouchableOpacity
            style={[styles.navButton, styles.navButtonLeft]}
            onPress={() => handleSwipe('right')}
            activeOpacity={0.8}
          >
            <Ionicons name="chevron-back" size={40} color={COLORS.white} />
          </TouchableOpacity>
        )}

        {currentIndex < media.length - 1 && (
          <TouchableOpacity
            style={[styles.navButton, styles.navButtonRight]}
            onPress={() => handleSwipe('left')}
            activeOpacity={0.8}
          >
            <Ionicons name="chevron-forward" size={40} color={COLORS.white} />
          </TouchableOpacity>
        )}
      </View>
    </Modal>
  );
}

export default function TaskDetailsScreen() {
  const params = useLocalSearchParams();
  // Task ID from params (can be used to fetch actual task data from API)
  const taskId = params.taskId as string;
  const [activeTab, setActiveTab] = useState<TabName>('Details');
  // In a real app, fetch task data based on taskId
  const [taskData] = useState<TaskDetails>(MOCK_TASK);

  // Log taskId for debugging (in production, this would fetch from API)
  React.useEffect(() => {
    if (taskId) {
      console.log('Task ID:', taskId);
    }
  }, [taskId]);
  const [taskStatus, setTaskStatus] = useState<TaskStatus>(MOCK_TASK.status);
  const [mediaItems] = useState<MediaItem[]>(MOCK_MEDIA);
  const [activityItems] = useState<ActivityItem[]>(MOCK_ACTIVITY);
  const [mediaFilter, setMediaFilter] = useState<MediaFilterType>('Photos');
  const [showStatusSheet, setShowStatusSheet] = useState(false);
  const [showMediaSheet, setShowMediaSheet] = useState(false);
  const [showMediaViewer, setShowMediaViewer] = useState(false);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const statusColor = getStatusColor(taskStatus);

  // Filter media based on type
  const filteredMedia = mediaItems.filter((item) => {
    if (mediaFilter === 'Photos') return item.type === 'image';
    if (mediaFilter === 'Videos') return item.type === 'video';
    if (mediaFilter === 'Documents') return item.type === 'document';
    return true;
  });

  const handleLocationPress = async () => {
    const address = encodeURIComponent(taskData.location);
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

  const handleStatusUpdate = (status: string, description: string, attachments: any[]) => {
    setTaskStatus(status as TaskStatus);
    setShowStatusSheet(false);
    setToastMessage('Status updated successfully!');
    setToastVisible(true);
  };

  const handleMediaPress = (index: number) => {
    setSelectedMediaIndex(index);
    setShowMediaViewer(true);
  };

  const renderDetailsTab = () => (
    <ScrollView style={styles.tabContent} contentContainerStyle={styles.tabContentPadding} showsVerticalScrollIndicator={false}>
      {/* Task Description Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Task Description</Text>
        <Text style={styles.descriptionText}>{taskData.description}</Text>
      </View>

      {/* Location Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Location</Text>
        <TouchableOpacity style={styles.locationContainer} onPress={handleLocationPress} activeOpacity={0.7}>
          <Ionicons name="location" size={20} color={COLORS.info} />
          <Text style={styles.locationText}>{taskData.location}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.mapLink} onPress={handleLocationPress} activeOpacity={0.7}>
          <Ionicons name="map-outline" size={16} color={COLORS.primary} />
          <Text style={styles.mapLinkText}>Tap to adjust location on map</Text>
        </TouchableOpacity>
      </View>

      {/* People Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>People</Text>

        {/* Assigned By Section */}
        <View style={styles.peopleSection}>
          <Text style={styles.peopleSectionLabel}>Assigned By</Text>
          <View style={styles.personInfo}>
            <Ionicons name="person-circle-outline" size={40} color={COLORS.primary} />
            <View style={styles.personDetails}>
              <Text style={styles.personName}>{taskData.assignedBy}</Text>
              <Text style={styles.personOffice}>{taskData.assignedByOffice}</Text>
            </View>
          </View>
        </View>

        <View style={styles.peopleDivider} />

        {/* Assigned To Section */}
        <View style={styles.peopleSection}>
          <Text style={styles.peopleSectionLabel}>Assigned To</Text>
          <View style={styles.personInfo}>
            <Ionicons name="person-circle-outline" size={40} color={COLORS.info} />
            <View style={styles.personDetails}>
              <Text style={styles.personName}>{taskData.assignedTo}</Text>
              <Text style={styles.personOffice}>{taskData.assignedToPosition}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={{ height: 24 }} />
    </ScrollView>
  );

  const renderMediaTab = () => (
    <View style={styles.tabContent}>
      {/* Media Filter Switcher */}
      <View style={styles.mediaSwitcher}>
        {(['Photos', 'Videos', 'Documents'] as MediaFilterType[]).map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[styles.switcherButton, mediaFilter === filter && styles.switcherButtonActive]}
            onPress={() => setMediaFilter(filter)}
            activeOpacity={0.7}
          >
            <Text style={[styles.switcherText, mediaFilter === filter && styles.switcherTextActive]}>
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Media Grid */}
      <FlatList
        data={filteredMedia}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={styles.mediaGrid}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={styles.mediaThumbnail}
            onPress={() => handleMediaPress(index)}
            activeOpacity={0.7}
          >
            {item.type === 'document' ? (
              <View style={styles.documentThumbnail}>
                <Ionicons name="document-text" size={32} color={COLORS.textSecondary} />
                <Text style={styles.documentName} numberOfLines={2}>
                  {item.filename}
                </Text>
              </View>
            ) : (
              <Image source={{ uri: item.type === 'video' ? item.thumbnail : item.uri }} style={styles.thumbnailImage} />
            )}
            {item.type === 'video' && (
              <View style={styles.playIconOverlay}>
                <Ionicons name="play-circle" size={36} color={COLORS.white} />
              </View>
            )}
          </TouchableOpacity>
        )}
      />

      {/* FAB for Media Upload */}
      <TouchableOpacity
        style={styles.mediaFab}
        onPress={() => setShowMediaSheet(true)}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );

  const renderHistoryTab = () => (
    <ScrollView style={styles.tabContent} contentContainerStyle={styles.tabContentPadding} showsVerticalScrollIndicator={false}>
      {/* Timeline */}
      <View style={styles.timeline}>
        {activityItems.map((item, index) => (
          <View key={item.id} style={styles.timelineItem}>
            {/* Timeline Connector */}
            <View style={styles.timelineConnector}>
              <View style={[styles.timelineDot, item.type === 'status_change' && styles.timelineDotStatus]} />
              {index < activityItems.length - 1 && <View style={styles.timelineLine} />}
            </View>

            {/* Activity Content */}
            <View style={styles.activityContent}>
              <View style={styles.activityHeader}>
                <View>
                  <Text style={styles.activityUser}>{item.user}</Text>
                  <Text style={styles.activityDesignation}>{item.designation}</Text>
                </View>
                <Text style={styles.activityTimestamp}>{item.timestamp}</Text>
              </View>

              {item.type === 'status_change' ? (
                <View style={styles.statusChangeContainer}>
                  <Text style={styles.statusChangeLabel}>Changed status</Text>
                  {item.statusFrom && (
                    <View style={styles.statusChangeRow}>
                      <View style={[styles.statusChangeBadge, { backgroundColor: getStatusColor(item.statusFrom as TaskStatus) }]}>
                        <Text style={styles.statusChangeText}>{item.statusFrom}</Text>
                      </View>
                      <Ionicons name="arrow-forward" size={16} color={COLORS.textSecondary} />
                      <View style={[styles.statusChangeBadge, { backgroundColor: getStatusColor(item.statusTo as TaskStatus) }]}>
                        <Text style={styles.statusChangeText}>{item.statusTo}</Text>
                      </View>
                    </View>
                  )}
                  {!item.statusFrom && (
                    <View style={[styles.statusChangeBadge, { backgroundColor: getStatusColor(item.statusTo as TaskStatus) }]}>
                      <Text style={styles.statusChangeText}>{item.statusTo}</Text>
                    </View>
                  )}
                </View>
              ) : (
                <Text style={styles.activityMessage}>{item.message}</Text>
              )}
            </View>
          </View>
        ))}
      </View>

      {/* Add Reply Button */}
      <TouchableOpacity style={styles.addReplyButton} onPress={() => setShowStatusSheet(true)} activeOpacity={0.7}>
        <Ionicons name="chatbox-outline" size={20} color={COLORS.primary} />
        <Text style={styles.addReplyText}>Add Reply / Comment</Text>
      </TouchableOpacity>

      <View style={{ height: 24 }} />
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.cardBackground} />

      {/* Main Header: Only Back Arrow */}
      <View style={styles.mainHeader}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.6}>
          <Ionicons name="arrow-back" size={28} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* Sticky Sub-Header: Task Category + Status Badge */}
      <View style={styles.stickySubHeader}>
        <Text style={styles.taskCategory} numberOfLines={1}>
          {taskData.category}
        </Text>
        <TouchableOpacity
          style={[styles.statusBadge, { backgroundColor: statusColor }]}
          onPress={() => setShowStatusSheet(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.statusText}>{taskStatus}</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Navigator */}
      <View style={styles.tabBar}>
        {(['Details', 'Media', 'History'] as TabName[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      {activeTab === 'Details' && renderDetailsTab()}
      {activeTab === 'Media' && renderMediaTab()}
      {activeTab === 'History' && renderHistoryTab()}

      {/* Update Status Bottom Sheet */}
      <UpdateActivityBottomSheet
        visible={showStatusSheet}
        currentStatus={taskStatus}
        onClose={() => setShowStatusSheet(false)}
        onSubmit={handleStatusUpdate}
      />

      {/* Add Media Sheet */}
      <AddMediaSheet
        visible={showMediaSheet}
        onClose={() => setShowMediaSheet(false)}
        onPhotoTaken={() => {
          setToastMessage('Photo captured successfully!');
          setToastVisible(true);
        }}
        onMediaSelected={() => {
          setToastMessage('Media added successfully!');
          setToastVisible(true);
        }}
      />

      {/* Media Viewer */}
      <MediaViewer
        visible={showMediaViewer}
        media={filteredMedia}
        initialIndex={selectedMediaIndex}
        onClose={() => setShowMediaViewer(false)}
      />

      {/* Toast */}
      <Toast visible={toastVisible} message={toastMessage} type="success" onHide={() => setToastVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  mainHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  stickySubHeader: {
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
  taskCategory: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.white,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.primary,
  },
  tabContent: {
    flex: 1,
  },
  tabContentPadding: {
    padding: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 15,
    fontWeight: '400',
    color: COLORS.text,
    lineHeight: 22,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  locationText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.info,
    lineHeight: 20,
    textDecorationLine: 'underline',
  },
  mapLink: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: 6,
  },
  mapLinkText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.primary,
  },
  peopleSection: {
    marginBottom: 0,
  },
  peopleSectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
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
  personOffice: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.textSecondary,
  },
  peopleDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 16,
  },
  mediaSwitcher: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBackground,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  switcherButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    alignItems: 'center',
  },
  switcherButtonActive: {
    backgroundColor: COLORS.primary,
  },
  switcherText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  switcherTextActive: {
    color: COLORS.white,
  },
  mediaGrid: {
    padding: SPACING.sm,
    paddingBottom: 100,
  },
  mediaThumbnail: {
    width: '31.33%',
    aspectRatio: 1,
    margin: '1%',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: COLORS.background,
    position: 'relative',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  documentThumbnail: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    backgroundColor: COLORS.background,
  },
  documentName: {
    fontSize: 10,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  playIconOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  mediaFab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  timeline: {
    paddingVertical: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  timelineConnector: {
    width: 40,
    alignItems: 'center',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.textSecondary,
  },
  timelineDotStatus: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: COLORS.border,
    marginTop: 4,
    minHeight: 40,
  },
  activityContent: {
    flex: 1,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  activityUser: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  activityDesignation: {
    fontSize: 13,
    fontWeight: '400',
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  activityTimestamp: {
    fontSize: 12,
    fontWeight: '400',
    color: COLORS.textSecondary,
  },
  statusChangeContainer: {
    marginTop: 4,
  },
  statusChangeLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  statusChangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusChangeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusChangeText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.white,
    textTransform: 'uppercase',
  },
  activityMessage: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.text,
    lineHeight: 20,
  },
  addReplyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.cardBackground,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
    gap: 8,
  },
  addReplyText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
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
    color: COLORS.white,
  },
  mediaContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
  },
  fullScreenVideo: {
    width: '100%',
    height: '100%',
  },
  documentViewerPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  documentFilename: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.white,
    marginTop: 16,
    textAlign: 'center',
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
