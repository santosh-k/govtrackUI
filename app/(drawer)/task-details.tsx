/**
 * Task Details Screen - Redesigned
 *
 * A streamlined task details view with:
 * - Simple header: Back arrow + Task Category + Status Badge
 * - Details Tab: Description with location + Replies & Activity
 * - Media Tab: Unified grid (all media types, no filter)
 * - History Tab: Read-only timeline (no reply input)
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
  TextInput,
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
type TaskStatus = 'Pending' | 'In Progress' | 'Completed' | 'Overdue';

interface MediaItem {
  id: string;
  type: 'image' | 'video' | 'document';
  uri: string;
  thumbnail?: string;
  filename?: string;
  timestamp: string;
}

interface ReplyItem {
  id: string;
  user: string;
  message: string;
  timestamp: string;
}

interface HistoryItem {
  id: string;
  user: string;
  designation: string;
  timestamp: string;
  statusFrom?: string;
  statusTo?: string;
  event: string;
}

interface TaskDetails {
  id: string;
  taskId: string;
  category: string;
  description: string;
  location: string;
  status: TaskStatus;
}

// Mock data
const MOCK_TASK: TaskDetails = {
  id: '1',
  taskId: 'TSK-2024-001',
  category: 'Road Inspection',
  description: 'Conduct a thorough inspection of the NH-44 road section between KM 15 to KM 25. Check for potholes, cracks, drainage issues, and road markings. Document all findings with photos and prepare a detailed report.',
  location: 'National Highway 44, Sector 15, New Delhi, India',
  status: 'In Progress',
};

const MOCK_MEDIA: MediaItem[] = [
  { id: '1', type: 'image', uri: 'https://via.placeholder.com/400x300/4CAF50/FFFFFF?text=Road+Photo+1', timestamp: '2024-01-15T10:30:00Z' },
  { id: '2', type: 'image', uri: 'https://via.placeholder.com/400x300/2196F3/FFFFFF?text=Road+Photo+2', timestamp: '2024-01-15T11:00:00Z' },
  { id: '3', type: 'video', uri: 'https://via.placeholder.com/400x300/FF9800/FFFFFF?text=Inspection+Video', thumbnail: 'https://via.placeholder.com/400x300/FF9800/FFFFFF?text=Inspection+Video', timestamp: '2024-01-15T11:30:00Z' },
  { id: '4', type: 'document', uri: 'https://example.com/report.pdf', filename: 'Inspection_Report.pdf', timestamp: '2024-01-15T12:00:00Z' },
  { id: '5', type: 'image', uri: 'https://via.placeholder.com/400x300/9C27B0/FFFFFF?text=Road+Photo+3', timestamp: '2024-01-15T14:00:00Z' },
  { id: '6', type: 'image', uri: 'https://via.placeholder.com/400x300/F44336/FFFFFF?text=Damage+Photo', timestamp: '2024-01-15T14:30:00Z' },
];

const MOCK_REPLIES: ReplyItem[] = [
  {
    id: '1',
    user: 'Rajesh Kumar',
    message: 'Started the inspection. Initial findings show minor cracks in the road surface.',
    timestamp: '15 Jan 2024, 10:45 AM',
  },
  {
    id: '2',
    user: 'Er Sabir Ali',
    message: 'Good progress. Please ensure you document all findings with photos and GPS coordinates.',
    timestamp: '15 Jan 2024, 11:30 AM',
  },
  {
    id: '3',
    user: 'Rajesh Kumar',
    message: 'Completed section 1 inspection. Found significant drainage issues near KM 17. Photos uploaded.',
    timestamp: '15 Jan 2024, 02:15 PM',
  },
];

const MOCK_HISTORY: HistoryItem[] = [
  {
    id: '1',
    user: 'Rajesh Kumar',
    designation: 'Field Inspector',
    timestamp: '15 Jan 2024, 02:30 PM',
    statusFrom: 'Pending',
    statusTo: 'In Progress',
    event: 'Changed status',
  },
  {
    id: '2',
    user: 'Er Sabir Ali',
    designation: 'Senior Engineer',
    timestamp: '15 Jan 2024, 10:30 AM',
    statusFrom: undefined,
    statusTo: 'Pending',
    event: 'Task created',
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
  const [replies, setReplies] = useState<ReplyItem[]>(MOCK_REPLIES);
  const [historyItems] = useState<HistoryItem[]>(MOCK_HISTORY);
  const [showStatusSheet, setShowStatusSheet] = useState(false);
  const [showMediaSheet, setShowMediaSheet] = useState(false);
  const [showMediaViewer, setShowMediaViewer] = useState(false);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [replyText, setReplyText] = useState('');

  const statusColor = getStatusColor(taskStatus);

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

  const handleAddReply = () => {
    if (!replyText.trim()) {
      Alert.alert('Required', 'Please enter a reply message');
      return;
    }

    const newReply: ReplyItem = {
      id: `${replies.length + 1}`,
      user: 'You',
      message: replyText,
      timestamp: new Date().toLocaleString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setReplies([...replies, newReply]);
    setReplyText('');
    setToastMessage('Reply added successfully!');
    setToastVisible(true);
  };

  const renderDetailsTab = () => (
    <ScrollView style={styles.tabContent} contentContainerStyle={styles.tabContentPadding} showsVerticalScrollIndicator={false}>
      {/* Task Description & Location Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Task Description</Text>
        <Text style={styles.descriptionText}>{taskData.description}</Text>

        {/* Location Section (integrated into same card) */}
        <View style={styles.locationSection}>
          <View style={styles.locationDivider} />
          <Text style={styles.locationLabel}>Location</Text>
          <TouchableOpacity style={styles.locationContainer} onPress={handleLocationPress} activeOpacity={0.7}>
            <Ionicons name="location" size={20} color={COLORS.info} />
            <Text style={styles.locationText}>{taskData.location}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.mapLink} onPress={handleLocationPress} activeOpacity={0.7}>
            <Ionicons name="map-outline" size={16} color={COLORS.primary} />
            <Text style={styles.mapLinkText}>Tap to view location on map</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Replies & Activity Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Replies & Activity</Text>

        {/* Reply List */}
        {replies.length > 0 ? (
          <View style={styles.replyList}>
            {replies.map((reply) => (
              <View key={reply.id} style={styles.replyItem}>
                <View style={styles.replyHeader}>
                  <View style={styles.replyUserContainer}>
                    <Ionicons name="person-circle-outline" size={32} color={COLORS.primary} />
                    <Text style={styles.replyUser}>{reply.user}</Text>
                  </View>
                  <Text style={styles.replyTimestamp}>{reply.timestamp}</Text>
                </View>
                <Text style={styles.replyMessage}>{reply.message}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyReplies}>
            <Ionicons name="chatbubbles-outline" size={48} color={COLORS.textSecondary} />
            <Text style={styles.emptyRepliesText}>No replies yet</Text>
          </View>
        )}

        {/* Add Reply Form */}
        <View style={styles.addReplyForm}>
          <View style={styles.replyFormDivider} />
          <Text style={styles.addReplyLabel}>Add Reply</Text>
          <TextInput
            style={styles.replyInput}
            placeholder="Type your reply here..."
            placeholderTextColor={COLORS.textSecondary}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            value={replyText}
            onChangeText={setReplyText}
          />
          <TouchableOpacity
            style={[styles.addReplyButton, !replyText.trim() && styles.addReplyButtonDisabled]}
            onPress={handleAddReply}
            disabled={!replyText.trim()}
            activeOpacity={0.7}
          >
            <Ionicons name="send" size={18} color={COLORS.white} />
            <Text style={styles.addReplyButtonText}>Send Reply</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ height: 24 }} />
    </ScrollView>
  );

  const renderMediaTab = () => {
    // Unified media grid - no filtering
    const sortedMedia = [...mediaItems].sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return (
      <View style={styles.tabContent}>
        {sortedMedia.length > 0 ? (
          <FlatList
            data={sortedMedia}
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
        ) : (
          <View style={styles.emptyMediaContainer}>
            <Ionicons name="images-outline" size={80} color={COLORS.textSecondary} />
            <Text style={styles.emptyMediaText}>No media has been attached to this task</Text>
            <Text style={styles.emptyMediaSubtext}>Tap the + button below to add photos, videos, or documents</Text>
          </View>
        )}

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
  };

  const renderHistoryTab = () => (
    <ScrollView style={styles.tabContent} contentContainerStyle={styles.tabContentPadding} showsVerticalScrollIndicator={false}>
      {/* Read-only Timeline */}
      <View style={styles.timeline}>
        {historyItems.map((item, index) => (
          <View key={item.id} style={styles.timelineItem}>
            {/* Timeline Connector */}
            <View style={styles.timelineConnector}>
              <View style={styles.timelineDot} />
              {index < historyItems.length - 1 && <View style={styles.timelineLine} />}
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

              <View style={styles.statusChangeContainer}>
                <Text style={styles.statusChangeLabel}>{item.event}</Text>
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
                {!item.statusFrom && item.statusTo && (
                  <View style={[styles.statusChangeBadge, { backgroundColor: getStatusColor(item.statusTo as TaskStatus) }]}>
                    <Text style={styles.statusChangeText}>{item.statusTo}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        ))}
      </View>

      <View style={{ height: 24 }} />
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.cardBackground} />

      {/* Redesigned Header: Back Arrow + Task Category + Status Badge */}
      <View style={styles.header}>
        {/* Left: Back Arrow */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.6}>
          <Ionicons name="arrow-back" size={28} color={COLORS.text} />
        </TouchableOpacity>

        {/* Center: Task Category */}
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {taskData.category}
          </Text>
        </View>

        {/* Right: Status Badge */}
        <TouchableOpacity
          style={[styles.headerStatusBadge, { backgroundColor: statusColor }]}
          onPress={() => setShowStatusSheet(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.headerStatusText}>{taskStatus}</Text>
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
        media={mediaItems}
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
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  headerStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  headerStatusText: {
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
  locationSection: {
    marginTop: 16,
  },
  locationDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: 12,
  },
  locationLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
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
  replyList: {
    gap: 12,
  },
  replyItem: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 12,
  },
  replyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  replyUserContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  replyUser: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  replyTimestamp: {
    fontSize: 12,
    fontWeight: '400',
    color: COLORS.textSecondary,
  },
  replyMessage: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.text,
    lineHeight: 20,
  },
  emptyReplies: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyRepliesText: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginTop: 12,
  },
  addReplyForm: {
    marginTop: 16,
  },
  replyFormDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: 12,
  },
  addReplyLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  replyInput: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: COLORS.text,
    minHeight: 80,
    lineHeight: 20,
    marginBottom: 12,
  },
  addReplyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  addReplyButtonDisabled: {
    opacity: 0.5,
  },
  addReplyButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
  },
  emptyMediaContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyMediaText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 16,
    textAlign: 'center',
  },
  emptyMediaSubtext: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
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
