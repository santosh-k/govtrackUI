import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Video, ResizeMode } from 'expo-av';
import { useDispatch, useSelector } from 'react-redux';
import UpdateActivityBottomSheet from '@/components/UpdateActivityBottomSheet';
import Toast from '@/components/Toast';
import {
  fetchComplaintDetails,
  selectComplaintDetails,
  selectComplaintDetailsLoading,
  selectComplaintDetailsError,
} from '@/src/store/complaintDetailsSlice';
import { AppDispatch } from '@/src/store/index';

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
  reportedByAddress: string;
  assignedTo?: string;
  assignedToDesignation?: string;
  media: MediaItem[];
}

// Sample complaint data based on the screenshot
/*const MOCK_COMPLAINT: ComplaintDetails = {
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
  reportedByAddress: '123, Karol Bagh, New Delhi, 110005',
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
}; */

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
  const params = useLocalSearchParams();
  const dispatch = useDispatch<AppDispatch>();

  // Redux selectors
  const complaintData = useSelector(selectComplaintDetails);
  const loading = useSelector(selectComplaintDetailsLoading);
  const error = useSelector(selectComplaintDetailsError);

  // Local state
  const [mediaViewerVisible, setMediaViewerVisible] = useState(false);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [updateSheetVisible, setUpdateSheetVisible] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Fetch complaint details on mount
  useEffect(() => {
    if (params.id) {
      dispatch(fetchComplaintDetails(params.id as string));
    }
  }, [params.id, dispatch]);

  // Handle assignment return
  useEffect(() => {
    if (params.assignedUser && params.showAssignmentToast === 'true') {
      // Show success toast
      setToastMessage('Complaint assigned successfully!');
      setToastVisible(true);

      // Clear params
      router.setParams({ assignedUser: undefined, assignedDesignation: undefined, showAssignmentToast: undefined });
    }
  }, [params.assignedUser, params.assignedDesignation, params.showAssignmentToast]);

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
    if (!complaintData) return;
    const address = encodeURIComponent(complaintData.location);
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

  const handleNavigateToLocation = async () => {
    if (!complaintData) return;
    const address = encodeURIComponent(complaintData.location);
    const url = Platform.select({
      ios: `maps://?daddr=${address}&dirflg=d`,
      android: `google.navigation:q=${address}&mode=d`,
    });

    const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${address}&travelmode=driving`;

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
      Alert.alert('Error', 'Unable to open navigation');
    }
  };

  const handleMediaPress = (index: number) => {
    setSelectedMediaIndex(index);
    setMediaViewerVisible(true);
  };

  const handleAssignTask = () => {
    if (!complaintData) return;
    router.push({
      pathname: '/assign-complaint',
      params: {
        complaintId: complaintData.complaintNumber,
      },
    });
  };

  const handleUpdateStatus = () => {
    setUpdateSheetVisible(true);
  };

  const handleUpdateSubmit = (status: string, description: string, attachments: any[]) => {
    // Close bottom sheet
    setUpdateSheetVisible(false);

    // Show success toast
    setToastMessage('Activity updated successfully!');
    setToastVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.cardBackground} />

      {/* Loading State */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading complaint details...</Text>
        </View>
      )}

      {/* Error State */}
      {error && !loading && (
        <View style={styles.errorOverlay}>
          <Ionicons name="alert-circle-outline" size={48} color="#D32F2F" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              if (params.id) {
                dispatch(fetchComplaintDetails(params.id as string));
              }
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Content - Only show when data is available */}
      {!loading && !error && complaintData && (
        <>
          {/* Header */}
          <View style={styles.header}>
            {/* Left: Back Arrow + Complaint ID */}
            <View style={styles.headerLeftSection}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.replace('/(drawer)/complaints-list')}
                activeOpacity={0.6}
              >
                <Ionicons name="arrow-back" size={28} color={COLORS.text} />
              </TouchableOpacity>
              <Text style={styles.headerComplaintId} numberOfLines={1}>
                {complaintData.complaintNumber}
              </Text>
            </View>

            {/* Center: Empty */}
            <View style={styles.headerCenter} />

            {/* Right: Status Badge */}
            <View
              style={[
                styles.headerStatusBadge,
                { backgroundColor: getStatusColor(complaintData.status) },
              ]}
            >
              <Text style={styles.headerStatusText}>{complaintData.statusDisplay}</Text>
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
              <Text style={styles.subjectTitle}>{complaintData.title}</Text>

              {/* Location with Map Pin Icon */}
              <TouchableOpacity
                style={styles.locationContainer}
                onPress={handleLocationPress}
                activeOpacity={0.7}
              >
                <Ionicons name="location" size={20} color={COLORS.linkBlue} />
                <Text style={styles.locationLink}>{complaintData.location}</Text>
              </TouchableOpacity>

              {/* Key Details Grid */}
              <View style={styles.detailsGrid}>
                {/* Two-Column Row: Complaint Type and Poll Number */}
                <View style={styles.gridRow}>
                  <GridItem label="Complaint Type" value={complaintData.complaintType} />
                  <GridItem label="Poll Number" value={complaintData.pollNumber} />
                </View>

                {/* Full-Width Row: Category */}
                <View style={styles.fullWidthRow}>
                  <Text style={styles.gridLabel}>Category</Text>
                  <Text style={styles.gridValue}>{complaintData.category}</Text>
                </View>
              </View>

              {/* Separator Line */}
              <View style={styles.primaryCardDivider} />

              {/* Assignment Footer Section */}
              <View style={styles.assignmentFooter}>
                <Text style={styles.assignmentLabel}>Assigned To:</Text>
                {complaintData.assignedTo ? (
                  <View style={styles.assignedPersonContainer}>
                    <Ionicons name="person-circle-outline" size={24} color={COLORS.primary} />
                    <View style={styles.assignedPersonDetails}>
                      <Text style={styles.assignedPersonName}>{complaintData.assignedTo}</Text>
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

        {/* Card 2: Interactive Map Card */}
        <TouchableOpacity
          style={styles.mapCard}
          onPress={handleNavigateToLocation}
          activeOpacity={0.85}
        >
          {/* Map Background Image - Using placeholder for demo */}
          <Image
            source={require('@/assets/images/map-placeholder.png')}
            style={styles.mapImage}
            resizeMode="cover"
          />

          {/* Address Overlay */}
          <View style={styles.mapAddressOverlay}>
            <View style={styles.mapAddressContent}>
              <Ionicons name="location-sharp" size={18} color="#FFFFFF" />
              <Text style={styles.mapAddressText} numberOfLines={2}>
                {complaintData.location}
              </Text>
            </View>
          </View>

          {/* Directions Button */}
          <View style={styles.directionsButton}>
            <Ionicons name="navigate" size={24} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        {/* Card 3: Additional Information */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Additional Information</Text>

          <View style={styles.detailsGrid}>
            <View style={styles.gridRow}>
              <GridItem label="Priority" value={complaintData.priorityDisplay} />
              <GridItem label="Source" value={complaintData.source} />
            </View>
            <View style={styles.gridRow}>
              <GridItem label="Created At" value={complaintData.createdAtFormatted} />
              <GridItem label="Last Updated" value={complaintData.lastUpdatedFormatted} />
            </View>
          </View>
        </View>

        {/* Card 4: Media Attachments */}
        {complaintData.images && complaintData.images.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Media Attachments</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.mediaScrollContent}
            >
              {complaintData.images.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.mediaThumbnail}
                  onPress={() => handleMediaPress(index)}
                  activeOpacity={0.7}
                >
                  <Image
                    source={{ uri: item.imagePath }}
                    style={styles.thumbnailImage}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Card 5: Complainant Information */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Reported By</Text>

          {/* Reported By Section */}
          <View style={styles.reportedByContainer}>
            <View style={styles.reportedByField}>
              <Text style={styles.reportedByLabel}>Name</Text>
              <Text style={styles.reportedByValue}>{complaintData.reportedBy?.name}</Text>
            </View>
            <View style={styles.reportedByField}>
              <Text style={styles.reportedByLabel}>Contact Number</Text>
              <Text style={styles.reportedByValue}>{complaintData.reportedBy?.contactNumber}</Text>
            </View>
            <View style={styles.reportedByField}>
              <Text style={styles.reportedByLabel}>Address</Text>
              <Text style={styles.reportedByValue}>{complaintData.reportedBy?.address}</Text>
            </View>
            {complaintData.reportedBy?.email && (
              <View style={styles.reportedByField}>
                <Text style={styles.reportedByLabel}>Email</Text>
                <Text style={styles.reportedByValue}>{complaintData.reportedBy.email}</Text>
              </View>
            )}
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
      {complaintData && (
        <MediaViewer
          visible={mediaViewerVisible}
          media={complaintData.images.map((img) => ({
            type: 'image' as const,
            uri: img.imagePath,
          }))}
          initialIndex={selectedMediaIndex}
          onClose={() => setMediaViewerVisible(false)}
        />
      )}

      {/* Update Activity Bottom Sheet */}
      <UpdateActivityBottomSheet
        visible={updateSheetVisible}
        currentStatus={complaintData.statusDisplay}
        onClose={() => setUpdateSheetVisible(false)}
        onSubmit={handleUpdateSubmit}
      />

      {/* Toast Notification */}
      <Toast
        visible={toastVisible}
        message={toastMessage}
        type="success"
        onHide={() => setToastVisible(false)}
      />
        </>
      )}
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
  fullWidthRow: {
    width: '100%',
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
    alignItems: 'flex-start',
    gap: 12,
  },
  personDetails: {
    flex: 1,
    gap: 8,
  },
  personDetailRow: {
    gap: 4,
  },
  personLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  personName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  personContact: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  reportedByContainer: {
    gap: 20,
  },
  reportedByField: {
    gap: 6,
  },
  reportedByLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  reportedByValue: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.text,
    lineHeight: 22,
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
    height: Platform.OS === 'ios' ? 100 : 90,
  },
  floatingActionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: COLORS.cardBackground,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
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
  // Map Card Styles
  mapCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 220,
    position: 'relative',
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
  mapImage: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.background,
  },
  mapAddressOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  mapAddressContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  mapAddressText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    lineHeight: 20,
  },
  directionsButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.saffron,
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
  // Loading and Error Overlay Styles
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 12,
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    paddingHorizontal: 32,
    gap: 20,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#D32F2F',
    textAlign: 'center',
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.cardBackground,
  },
});
