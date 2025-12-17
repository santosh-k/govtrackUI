/**
 * Task Details Screen - Redesigned
 *
 * A streamlined task details view with:
 * - Simple header: Back arrow + Task Category + Status Badge
 * - Details Tab: Description with location + Replies & Activity
 * - Media Tab: Unified grid (all media types, no filter)
 * - History Tab: Read-only timeline (no reply input)
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  Platform,
  Image,
  FlatList,
  Linking,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Keyboard,
  findNodeHandle,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { COLORS, SPACING } from '@/theme';
import UpdateActivityBottomSheet from '@/components/UpdateActivityBottomSheet';
import AddMediaSheet from '@/components/AddMediaSheet';
import Toast from '@/components/Toast';
import { Video, ResizeMode } from 'expo-av';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/src/store';
import ApiManager from '@/src/services/ApiManager';
import { fetchTaskDetails, selectTaskDetails, selectTaskDetailsLoading } from '@/src/store/taskDetailsSlice';


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
  uploading?: boolean;
}

interface ReplyItem {
  id: string;
  user: string;
  message: string;
  timestamp: string;
  userId?: number | string;
  reviewerRemarks?: string | null;
  raw?: any;
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
  title: string;
  category: string;
  description: string;
  assignedBy: string;
  date: string;
  location: string;
  status: TaskStatus;
}

// Mock data
const MOCK_TASK: TaskDetails = {
  id: '1',
  taskId: 'TSK-2024-001',
  title: '',
  category: 'Road Inspection',
  assignedBy: '',
  date: '',
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
  console.log('History Status==', status)
  switch (status) {
    case 'Completed':
      return COLORS.statusClosed;
    case 'In Progress':
      return COLORS.statusInProgress;
    case 'Pending':
      return COLORS.statusOpen;
    case 'Overdue':
      return COLORS.error;
    default:
      return COLORS.statusOpen;
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
  const [currentIndex, setCurrentIndex] = useState(() => {
    if (!Array.isArray(media) || media.length === 0) return 0;
    const idx = typeof initialIndex === 'number' ? initialIndex : 0;
    return Math.min(Math.max(idx, 0), media.length - 1);
  });

  // Keep index in-range when media or initialIndex changes
  React.useEffect(() => {
    if (!visible) return;
    if (!Array.isArray(media) || media.length === 0) {
      setCurrentIndex(0);
      return;
    }
    const idx = typeof initialIndex === 'number' ? initialIndex : 0;
    const clamped = Math.min(Math.max(idx, 0), media.length - 1);
    setCurrentIndex(clamped);
  }, [visible, media.length, initialIndex]);

  const currentMedia = media && media.length > 0 ? media[currentIndex] : undefined;

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
            {media && media.length > 0 ? `${currentIndex + 1} / ${media.length}` : '0 / 0'}
          </Text>
        </View>

        {/* Media Content */}
        <View style={styles.mediaContent}>
          {!currentMedia ? (
            <View style={styles.documentViewerPlaceholder}>
              <Ionicons name="alert-circle" size={64} color={COLORS.white} />
              <Text style={[styles.documentFilename, { marginTop: 12 }]}>No media available</Text>
            </View>
          ) : currentMedia.type === 'image' ? (
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
              <TouchableOpacity
                style={styles.openDocumentButton}
                onPress={async () => {
                  try {
                    await Linking.openURL(currentMedia.uri);
                  } catch {
                    Alert.alert('Error', 'Unable to open document');
                  }
                }}
              >
                <Text style={styles.openDocumentText}>Open Document</Text>
              </TouchableOpacity>
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
  const dispatch = useDispatch<AppDispatch>();
  const taskDetails = useSelector(selectTaskDetails);
  const taskDetailsLoading = useSelector(selectTaskDetailsLoading);

  // Local UI state is still used for interactions (replies add, media viewer, etc.)
  const [taskData, setTaskData] = useState<TaskDetails>(MOCK_TASK);

  // Gesture support for swiping tabs - using simple state tracking
  const lastGestureX = useRef(0);
  const gestureStartX = useRef(0);

  const handleSwipe = (xPos: number) => {
    const diff = gestureStartX.current - xPos;
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
      const tabs: TabName[] = ['Details', 'Media', 'History'];
      const currentIndex = tabs.indexOf(activeTab);

      if (diff > 0 && currentIndex < tabs.length - 1) {
        // Swiped left - go to next tab
        setActiveTab(tabs[currentIndex + 1]);
        gestureStartX.current = 0;
      } else if (diff < 0 && currentIndex > 0) {
        // Swiped right - go to previous tab
        setActiveTab(tabs[currentIndex - 1]);
        gestureStartX.current = 0;
      }
    }
  };

  // Log taskId for debugging (in production, this would fetch from API)
  React.useEffect(() => {
    if (taskId) {
      console.log('Task ID:', taskId);
    }
  }, [taskId]);

  // Fetch task details on mount or when taskId changes
  React.useEffect(() => {
    if (taskId) {
      dispatch(fetchTaskDetails(taskId));
    }
  }, [taskId]);

  // Map server task payload to UI models when taskDetails changes
  React.useEffect(() => {
    if (!taskDetails || !taskDetails.task) return;

    const t = taskDetails.task;

    // Map basic task info
    const mapped: TaskDetails = {
      id: String(t.id),
      taskId: t.task_code || String(t.id),
      title: t.title,
      category: t.task_type || (t.project?.project_name ?? 'Task'),
      assignedBy: t.assignedUser ? `${t.assignedUser.first_name || ''} ${t.assignedUser.last_name || ''}`.trim() : (t.creator?.first_name ? `${t.creator.first_name} ${t.creator.last_name || ''}` : '—'),
      date: t.due_date ? t.due_date : (t.start_date || ''),
      description: t.description || '',
      location: t.project?.project_name || (t.creator?.Zone?.name ?? '—'),
      status: (function mapStatus(s: string) {
        if (!s) return 'Pending';
        const key = s.toLowerCase();
        if (key.includes('pending')) return 'Pending';
        if (key.includes('in_progress') || key.includes('in progress')) return 'In Progress';
        if (key.includes('completed') || key.includes('resolved')) return 'Completed';
        if (key.includes('overdue')) return 'Overdue';
        return 'Pending';
      })(t.status || ''),
    };

    setTaskData(mapped);
    setTaskStatus(mapped.status);

    // Map attachments to media items
    const attachments = Array.isArray(t.attachments) ? t.attachments : [];
    const mappedMedia: MediaItem[] = attachments.map((a: any) => {
      const fileType: string = String(a.file_type || '').toLowerCase();
      let type: MediaItem['type'] = 'document';
      if (fileType.startsWith('image/')) type = 'image';
      else if (fileType.startsWith('video/')) type = 'video';

      return {
        id: String(a.id),
        type,
        uri: a.file_path,
        thumbnail: a.thumbnail || a.file_path,
        filename: a.file_name || '',
        timestamp: a.uploaded_at || a.created_at || new Date().toISOString(),
      };
    });
    setMediaItems(mappedMedia);

    // Map comments to replies
    const comments = Array.isArray(t.comments) ? t.comments : [];
    const mappedReplies: ReplyItem[] = comments.map((c: any) => ({
      id: String(c.id),
      user: c.user ? `${c.user.first_name || ''} ${c.user.last_name || ''}`.trim() || c.user.username || '—' : '—',
      message: c.comment || c.message || '',
      timestamp: c.created_at ? new Date(c.created_at).toLocaleString() : '',
      userId: c.user?.id || c.user_id,
      reviewerRemarks: c.reviewer_remarks ?? null,
      raw: c,
    }));
    setReplies(mappedReplies);
    const creatorId = t.created_by || t.creator?.id || null;
    setTaskCreatorId(creatorId);

    // Map history
    const history = Array.isArray(t.history) ? t.history : [];
    const mappedHistory: HistoryItem[] = history.map((h: any) => ({
      id: String(h.id),
      user: h.user ? `${h.user.first_name || ''} ${h.user.last_name || ''}`.trim() || h.user.username || '—' : '—',
      designation: h.user?.designation || '',
      timestamp: h.created_at ? new Date(h.created_at).toLocaleString() : '',
      statusFrom: undefined,
      statusTo: h.new_value || undefined,
      event: h.action || h.new_value || '',
    }));
    setHistoryItems(mappedHistory);
  }, [taskDetails]);
  const [taskStatus, setTaskStatus] = useState<TaskStatus>(MOCK_TASK.status);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(MOCK_MEDIA);
  const [uploadingAttachments, setUploadingAttachments] = useState<Record<string, boolean>>({});
  const [replies, setReplies] = useState<ReplyItem[]>(MOCK_REPLIES);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>(MOCK_HISTORY);
  const [showStatusSheet, setShowStatusSheet] = useState(false);
  const [showMediaSheet, setShowMediaSheet] = useState(false);
  const [showMediaViewer, setShowMediaViewer] = useState(false);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [replyText, setReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [reviewingReplyId, setReviewingReplyId] = useState<string | null>(null);
  const [taskCreatorId, setTaskCreatorId] = useState<number | string | null>(null);
  const user = useSelector((state: RootState) => state.auth.user);

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

  // Keyboard / reply helpers
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [replyFocused, setReplyFocused] = useState(false);
  const insets = useSafeAreaInsets();
  // Track focus in a ref to avoid stale closures inside keyboard listeners
  const replyFocusedRef = React.useRef(false);
  const replyInputRef = React.useRef<TextInput | null>(null);

  // Helper to ensure reply input scrolls into view with retries
  const scrollReplyIntoView = (attempt = 0) => {
    try {
      const node = replyInputRef.current ? findNodeHandle(replyInputRef.current) : null;

      if (node && scrollRef?.current && typeof (scrollRef.current as any).scrollToFocusedInput === 'function') {
        try {
          (scrollRef.current as any).scrollToFocusedInput(node);
        } catch (err) {
          console.warn('scrollToFocusedInput failed, falling back to scrollToEnd', err);
          scrollRef?.current?.scrollToEnd(true);
        }
      } else {
        scrollRef?.current?.scrollToEnd(true);
      }
    } catch (err) {
      console.warn('scrollReplyIntoView error', err);
    }

    if (attempt < 3) {
      setTimeout(() => scrollReplyIntoView(attempt + 1), 48);
    }
  };

  React.useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e: any) => {
      console.log('[task-details] keyboard show event', e?.endCoordinates?.height);
      setKeyboardVisible(true);
      setKeyboardHeight(e?.endCoordinates?.height || 0);

      // If user is focused on the reply input, ensure it is visible above keyboard
      if (replyFocusedRef.current) {
        setTimeout(() => scrollReplyIntoView(0), 50);
      }
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      console.log('[task-details] keyboard hide event');
      setKeyboardVisible(false);
      setKeyboardHeight(0);
      setReplyFocused(false);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);


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

  const handleMediaSelected = async (result: any) => {
  if (!result || result.canceled) return;

  const asset = result.assets?.[0];
  if (!asset || !asset.uri) return;

  if (!taskId) {
    Alert.alert('Error', 'No task id available to attach media');
    return;
  }

  const tempId = `tmp-${Date.now()}`;
  const type = (asset.type === 'video' ? 'video' : 'image') as MediaItem['type'];

  const tempItem: MediaItem = {
    id: tempId,
    type,
    uri: asset.uri,
    thumbnail: asset.uri,
    filename: asset.fileName || `upload.${(asset.uri || '').split('.').pop() || 'jpg'}`,
    timestamp: new Date().toISOString(),
    uploading: true,
  };

  setMediaItems(prev => [tempItem, ...prev]);
  setUploadingAttachments(prev => ({ ...prev, [tempId]: true }));

  try {
    // ----------------------------
    // Normalize URI
    // ----------------------------
    const fileUri = asset.uri.startsWith('file://')
      ? asset.uri
      : `file://${asset.uri.replace('content://', '')}`;

    // ----------------------------
    // Build FormData
    // ----------------------------
    const form = new FormData();
    form.append('attachments', {
      uri: fileUri,
      name: asset.fileName || tempItem.filename,
      type:
        asset.mimeType ||
        (asset.type === 'video'
          ? 'video/mp4'
          : 'image/jpeg'),
    } as any);

    const api = ApiManager.getInstance();

    // ----------------------------
    // Upload to server
    // ----------------------------
    const res: any = await api.uploadTaskAttachments(taskId, form);

    const uploaded = res?.data?.attachments?.[0];
    if (!uploaded) throw new Error('Upload failed');

    const mapped: MediaItem = {
      id: String(uploaded.id),
      type:
        uploaded.file_type?.startsWith('image')
          ? 'image'
          : uploaded.file_type?.startsWith('video')
          ? 'video'
          : 'document',
      uri: uploaded.file_path,
      thumbnail: uploaded.file_path,
      filename: uploaded.file_name,
      timestamp:
        uploaded.created_at ||
        uploaded.uploaded_at ||
        new Date().toISOString(),
    };

    setMediaItems(prev => prev.map(it => (it.id === tempId ? mapped : it)));
    setToastMessage(res.message || 'File uploaded successfully');
    setToastVisible(true);

  } catch (err: any) {
    console.warn('UPLOAD ERROR:', err);
    setMediaItems(prev =>
      prev.map(it =>
        it.id === tempId ? { ...it, uploading: false } : it
      )
    );

    Alert.alert(
      'Upload failed',
      err?.message ||
        'Unable to upload attachment. Tap the item to retry.'
    );

  } finally {
    setUploadingAttachments(prev => {
      const next = { ...prev };
      delete next[tempId];
      return next;
    });
  }
};
  
  const moveToTransfer = async (passedTaskId?: string | null) => {
    // Resolve best available task id: param > server taskDetails > local taskData
    const effectiveId = passedTaskId || (taskDetails && taskDetails.task && String(taskDetails.task.id)) || taskData?.id || null;
    if (!effectiveId) {
      Alert.alert('Error', 'Unable to transfer: task information is not available yet. Please try again after the task loads.');
      return;
    }

    router.push({ pathname: '/(drawer)/task-transfer', params: { taskId: effectiveId } });
  }
  const handleAddReply = async () => {
    const message = replyText.trim();
    if (!message) {
      Alert.alert('Required', 'Please enter a reply message');
      return;
    }
    // Prevent duplicate sends
    if (isSendingReply) return;

    setIsSendingReply(true);
    try {
      const api = ApiManager.getInstance();
      const payload = { comment: message, is_internal: false, comment_type: 'REPLY' };
      const res = await api.createTaskReply(taskId, payload);

      // Expecting created comment at res.data
      const created = res && res.data ? res.data : null;
      const newReply: ReplyItem = {
        id: created && created.id ? String(created.id) : `${Math.random()}`,
        user: created && created.user ? `${created.user.first_name || ''} ${created.user.last_name || ''}`.trim() || created.user.username || 'You' : 'You',
        message: created?.comment || message,
        timestamp: created?.created_at ? new Date(created.created_at).toLocaleString() : new Date().toLocaleString(),
        userId: created?.user?.id || user?.id,
        reviewerRemarks: created?.reviewer_remarks ?? null,
        raw: created,
      };

      setReplies(prev => [...prev, newReply]);
      setReplyText('');
      setToastMessage('Reply added successfully!');
      setToastVisible(true);
      Keyboard.dismiss();

      setTimeout(() => {
        scrollRef?.current?.scrollToEnd(true);
      }, 300);
    } catch (err: any) {
      console.warn('Failed to add reply', err);
      Alert.alert('Error', err?.message || 'Failed to add reply');
    } finally {
      setIsSendingReply(false);
    }
  };

  const handleReviewReply = async (replyId: string, action: 'APPROVED' | 'REJECTED') => {
    if (reviewingReplyId) return;

    setReviewingReplyId(replyId);
    try {
      const api = ApiManager.getInstance();
      const remark = action === 'REJECTED' ? 'Work not completed properly. Please fix the issues and resubmit.' : 'Reply approved. Good work completed on time.';
      const res = await api.reviewTaskReply(replyId, action === 'APPROVED' ? 'APPROVE' : 'REJECT', { remarks: remark });

      // Update local reply state to include reviewer remark (backend returns success message only)
      setReplies(prev => prev.map(r => (r.id === replyId ? { ...r, reviewerRemarks: remark } : r)));
      setToastMessage(action === 'APPROVED' ? 'Reply approved successfully' : 'Reply rejected successfully');
      setToastVisible(true);
    } catch (err: any) {
      console.warn('Review reply failed', err);
      Alert.alert('Error', err?.message || 'Failed to review reply');
    } finally {
      setReviewingReplyId(null);
    }
  };
  const scrollRef = useRef<KeyboardAwareScrollView>(null);
  const renderDetailsTab = () => {
  return (
    <TouchableWithoutFeedback onPress={() => { console.log('[TaskDetails] Outer TouchableWithoutFeedback pressed (dismiss)'); Keyboard.dismiss(); setReplyFocused(false); }}>
    <KeyboardAwareScrollView
      ref={scrollRef}
      style={styles.tabContent}
      contentContainerStyle={styles.tabContentPadding}
      enableOnAndroid={true}
      enableAutomaticScroll={true}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      extraScrollHeight={keyboardHeight ? keyboardHeight - insets.bottom : 140}
      extraHeight={keyboardHeight ? keyboardHeight - insets.bottom : 140}
      keyboardOpeningTime={0}
      showsVerticalScrollIndicator={false}
    >

      {/* Task Description Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Task Description</Text>
        <Text style={styles.descriptionText}>{taskData.description}</Text>

        {/* Location Section */}
        <View style={styles.locationSection}>
          <View style={styles.locationDivider} />
          {/* <Text style={styles.locationLabel}>Location</Text> */}
          <View style={styles.assignedByContainer}>
                  <View style={styles.infoRow}>
                    <Ionicons name="business-outline" size={16} color={COLORS.textSecondary} />
                    <Text style={styles.infoText}>{taskData.category}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.assignedByText}>
                      Assigned To: <Text style={styles.assignedByName}>{taskData.assignedBy}</Text>
                     {/*  <Text style={styles.departmentText}> ({task.department})</Text> */}
                    </Text>
                  </View>
                </View>
         {/*  <TouchableOpacity style={styles.locationContainer} onPress={handleLocationPress}>
            <Ionicons name="location" size={20} color={COLORS.info} />
            <Text style={styles.locationText}>{taskData.location}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.mapLink} onPress={handleLocationPress}>
            <Ionicons name="map-outline" size={16} color={COLORS.primary} />
            <Text style={styles.mapLinkText}>Tap to view location on map</Text>
          </TouchableOpacity> */}
          <View style={styles.cardFooter}>
                  <View style={styles.dateTimeRow}>
                    <Ionicons name="calendar-outline" size={14} color={COLORS.textSecondary} />
                    <Text style={styles.footerText}>{taskData.date}</Text>
                  </View>
                  {(() => {
                    const effectiveTaskIdInRender = taskData?.id || (taskDetails && taskDetails.task && String(taskDetails.task.id)) || null;
                    return (
                      <TouchableOpacity
                        style={[styles.detailsIconContainer, !effectiveTaskIdInRender ? { opacity: 0.5 } : null]}
                        activeOpacity={0.8}
                        onPress={() => moveToTransfer(effectiveTaskIdInRender ?? undefined)}
                        disabled={!effectiveTaskIdInRender}
                      >
                        <View style={styles.detailsIconContainer}>
                          <Ionicons name="swap-horizontal-outline" size={24} color={COLORS.primary} />
                        </View>
                      </TouchableOpacity>
                    );
                  })()}
                </View>
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
                {/* Approve / Reject buttons - visible only to task owner and when reply is not reviewed */}
                {user && taskCreatorId && Number(user.id) === Number(taskCreatorId) && !reply.reviewerRemarks && (
                  <View style={styles.replyActions}>
                    <TouchableOpacity
                      style={[styles.approveButton, reviewingReplyId === reply.id ? styles.actionDisabled : null]}
                      onPress={() => handleReviewReply(reply.id, 'APPROVED')}
                      disabled={reviewingReplyId === reply.id}
                    >
                      <Text style={styles.approveButtonText}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.rejectButton, reviewingReplyId === reply.id ? styles.actionDisabled : null]}
                      onPress={() => handleReviewReply(reply.id, 'REJECTED')}
                      disabled={reviewingReplyId === reply.id}
                    >
                      <Text style={styles.rejectButtonText}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyReplies}>
            <Ionicons name="chatbubbles-outline" size={48} color={COLORS.textSecondary} />
            <Text style={styles.emptyRepliesText}>No replies yet</Text>
          </View>
        )}

        {/* Add Reply Section */}
        <View style={styles.addReplyForm}>
          <View style={styles.replyFormDivider} />
          <Text style={styles.addReplyLabel}>Add Reply</Text>

          <TextInput
            ref={replyInputRef}
            style={styles.replyInput}
            placeholder="Type your reply here..."
            placeholderTextColor={COLORS.textSecondary}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            value={replyText}
            onChangeText={setReplyText}
            onFocus={() => {
              setReplyFocused(true);
              replyFocusedRef.current = true;

              // Try scrolling a few times to avoid timing issues with different keyboards
              scrollReplyIntoView(0);
            }}
            onBlur={() => {
              setReplyFocused(false);
              replyFocusedRef.current = false;
            }}
          />

          {/* Inline button is hidden when keyboard is visible to prefer floating send */}
          <TouchableOpacity
            style={[styles.addReplyButton, keyboardVisible && replyFocused ? styles.hidden : null, !replyText.trim() && styles.addReplyButtonDisabled]}
            disabled={!replyText.trim() || isSendingReply}
            activeOpacity={0.8}
            onPress={handleAddReply}
          >
            <Ionicons name="send" size={18} color="#fff" />
            <Text style={styles.addReplyButtonText}>Send Reply</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={{ height: keyboardVisible ? keyboardHeight + (insets.bottom || 0) + 24 : 40 }} />
    </KeyboardAwareScrollView>
    </TouchableWithoutFeedback>

    // Floating send button above keyboard
  );
};

// Dismiss overlay shown behind the floating button when replying
function KeyboardDismissOverlay({ visible, onDismiss }: { visible: boolean; onDismiss: () => void }) {
  if (!visible) return null;
  return (
    <TouchableWithoutFeedback onPress={() => { console.log('[TaskDetails] KeyboardDismissOverlay pressed'); onDismiss(); }}>
      <View style={styles.keyboardDismissOverlay} />
    </TouchableWithoutFeedback>
  );
}

// Floating send button (absolute, appears above keyboard when typing)
function FloatingSendButton({ visible, bottom, disabled, onPress }: { visible: boolean; bottom: number; disabled: boolean; onPress: () => void }) {
  if (!visible) return null;
  console.log('[TaskDetails] FloatingSendButton rendered visible, bottom=', bottom, 'disabled=', disabled);
  return (
    <View style={[floatingStyles.container, { bottom: bottom || 0 }] } pointerEvents="box-none">
      <TouchableOpacity
        style={[styles.addReplyButton, { width: '100%' }, disabled && styles.addReplyButtonDisabled]}
        disabled={disabled}
        activeOpacity={0.85}
        onPress={onPress}
      >
        <Ionicons name="send" size={18} color="#fff" />
        <Text style={styles.addReplyButtonText}>Send Reply</Text>
      </TouchableOpacity>
    </View>
  );
}

const floatingStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 12,
    right: 12,
    alignItems: 'stretch',
    zIndex: 60,
  },
});
  const sortedMedia = React.useMemo(() => {
    return [...mediaItems].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [mediaItems]);

  const renderMediaTab = () => {
    // Unified media grid - no filtering
    // const sortedMedia = [...mediaItems].sort((a, b) =>
    //   new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    // );

    return (
      <View style={styles.tabContent}>
        {taskDetailsLoading && sortedMedia.length === 0 ? (
          <View style={styles.emptyMediaContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={[styles.emptyMediaText, { marginTop: 12 }]}>Loading attachments…</Text>
          </View>
        ) : sortedMedia.length > 0 ? (
          <FlatList
            data={sortedMedia}
            keyExtractor={(item) => item.id}
            numColumns={3}
            contentContainerStyle={styles.mediaGrid}
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                style={styles.mediaThumbnail}
                onPress={() => {
                  // If an upload failed (uploading === false but id starts with tmp-), treat press as retry
                  if (item.id.startsWith('tmp-') && !item.uploading) {
                    // reattempt upload using the original local uri
                    handleMediaSelected({ canceled: false, assets: [{ uri: item.uri, fileName: item.filename, type: item.type === 'video' ? 'video' : 'image' }] });
                    // show spinner again
                    setMediaItems(prev => prev.map(it => (it.id === item.id ? { ...it, uploading: true } : it)));
                    return;
                  }
                  handleMediaPress(index);
                }}
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
                  <View>
                    <Image source={{ uri: item.type === 'video' ? item.thumbnail : item.uri }} style={styles.thumbnailImage} />
                    {item.uploading && (
                      <View style={styles.uploadOverlay}>
                        <ActivityIndicator size="small" color="#fff" />
                      </View>
                    )}
                    {!item.uploading && item.id.startsWith('tmp-') && (
                      <View style={[styles.uploadOverlay, { backgroundColor: 'rgba(0,0,0,0.25)' }]}>
                        <Text style={{ color: '#fff', fontWeight: '700' }}>Retry</Text>
                      </View>
                    )}
                  </View>
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
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
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
            {taskData.title}
          </Text>
        </View>

        {/* Right: Status Badge */}
        <TouchableOpacity
          style={[styles.headerStatusBadge, { backgroundColor: statusColor }]}
          onPress={() => setShowStatusSheet(false)}
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

      {/* Tab Content - with swipe gesture support */}
      <View 
        style={styles.tabContentContainer}
        onTouchStart={(e) => {
          gestureStartX.current = e.nativeEvent.pageX;
        }}
        onTouchEnd={(e) => {
          handleSwipe(e.nativeEvent.pageX);
        }}
      >
        {activeTab === 'Details' && renderDetailsTab()}
        {activeTab === 'Media' && renderMediaTab()}
        {activeTab === 'History' && renderHistoryTab()}
      </View>

      {/* Update Status Bottom Sheet */}
      <UpdateActivityBottomSheet
        visible={showStatusSheet}
        complaintId={taskId || ''}
        currentStatus={taskStatus}
        onClose={() => setShowStatusSheet(false)}
        onSubmit={handleStatusUpdate}
      />

      {/* Add Media Sheet */}
      <AddMediaSheet
        visible={showMediaSheet}
        onClose={() => setShowMediaSheet(false)}
        onPhotoTaken={(result) => {
          // Use the same handler for camera capture
          handleMediaSelected(result);
        }}
        onMediaSelected={(result) => {
          handleMediaSelected(result);
        }}
      />

      {/* Media Viewer */}
      <MediaViewer
        visible={showMediaViewer}
        media={sortedMedia}
        initialIndex={selectedMediaIndex}
        onClose={() => setShowMediaViewer(false)}
      />

      {/* Dismiss overlay while reply is focused (behind floating button) */}
      <KeyboardDismissOverlay visible={keyboardVisible && replyFocused} onDismiss={() => { Keyboard.dismiss(); setReplyFocused(false); }} />

      {/* Floating Send Button (shows when keyboard is visible and user is focused on reply) */}
      <FloatingSendButton visible={keyboardVisible && replyFocused} bottom={keyboardHeight + (insets.bottom || 0) + 16} disabled={!replyText.trim() || isSendingReply} onPress={handleAddReply} />

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
  tabContentContainer: {
    flex: 1,
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
  uploadOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  replyActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  approveButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: COLORS.success || '#22c55e',
    borderRadius: 6,
  },
  approveButtonText: {
    color: COLORS.white,
    fontWeight: '700',
  },
  rejectButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: COLORS.error || '#ef4444',
    borderRadius: 6,
  },
  rejectButtonText: {
    color: COLORS.white,
    fontWeight: '700',
  },
  actionDisabled: {
    opacity: 0.6,
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
  hidden: { display: 'none' },
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
  openDocumentButton: { marginTop: 16, paddingHorizontal: 18, paddingVertical: 10, backgroundColor: COLORS.primary, borderRadius: 10 },
  openDocumentText: { color: COLORS.white, fontWeight: '700' },
  // Keyboard dismiss overlay style (full screen transparent view)
  keyboardDismissOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 50,
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
  assignedByContainer: { marginBottom: 12, gap: 6 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoText: { fontSize: 14, fontWeight: '500', color: COLORS.textSecondary },
  assignedByText: { fontSize: 14, fontWeight: '400', color: COLORS.textSecondary },
  assignedByName: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.border },
  dateTimeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  footerText: { fontSize: 13, fontWeight: '500', color: COLORS.textSecondary },
  detailsIconContainer: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },
});
