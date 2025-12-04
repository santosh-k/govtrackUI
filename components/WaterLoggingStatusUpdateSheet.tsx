/**
 * Water Logging Status Update Sheet
 *
 * Bottom sheet for updating incident status with:
 * - Status selection (Working/Cleared)
 * - Evidence upload (photos/videos)
 * - Remarks text input
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Animated,
  Dimensions,
  Modal,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SPACING } from '@/theme';
import AddMediaSheet from './AddMediaSheet';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.85;

interface MediaAttachment {
  id: string;
  uri: string;
  type: 'image' | 'video';
}

interface StatusUpdateData {
  newStatus: 'Working' | 'Cleared';
  media: MediaAttachment[];
  remarks: string;
}

interface WaterLoggingStatusUpdateSheetProps {
  visible: boolean;
  incidentId: string | null;
  currentStatus: string;
  onClose: () => void;
  onUpdate: (data: StatusUpdateData) => void;
}

export default function WaterLoggingStatusUpdateSheet({
  visible,
  incidentId,
  currentStatus,
  onClose,
  onUpdate,
}: WaterLoggingStatusUpdateSheetProps) {
  const slideAnim = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const [selectedStatus, setSelectedStatus] = useState<'Working' | 'Cleared'>('Working');
  const [remarks, setRemarks] = useState('');
  const [media, setMedia] = useState<MediaAttachment[]>([]);
  const [showMediaSheet, setShowMediaSheet] = useState(false);

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        stiffness: 200,
      }).start();
      // Reset form when opening
      setSelectedStatus('Working');
      setRemarks('');
      setMedia([]);
    } else {
      Animated.timing(slideAnim, {
        toValue: SHEET_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  const handleAddMedia = () => {
    setShowMediaSheet(true);
  };

  const handleMediaPicked = (result: ImagePicker.ImagePickerResult) => {
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      const newMedia: MediaAttachment = {
        id: `media-${Date.now()}-${Math.random()}`,
        uri: asset.uri,
        type: asset.type === 'video' ? 'video' : 'image',
      };
      setMedia((prevMedia) => [...prevMedia, newMedia]);
    }
    setShowMediaSheet(false);
  };

  const handleCloseMediaSheet = () => {
    setShowMediaSheet(false);
  };

  const handleRemoveMedia = (id: string) => {
    setMedia(media.filter((item) => item.id !== id));
  };

  const handleUpdate = () => {
    onUpdate({
      newStatus: selectedStatus,
      media,
      remarks,
    });
    onClose();
  };

  return (
    <>
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
              <Text style={styles.headerTitle}>Update Incident Status</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.content}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {/* Current Status Info */}
              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Incident ID:</Text>
                  <Text style={styles.infoValue}>{incidentId}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Current Status:</Text>
                  <Text style={styles.infoValue}>{currentStatus}</Text>
                </View>
              </View>

              {/* New Status Selection */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>New Status</Text>
                <View style={styles.statusOptions}>
                  <TouchableOpacity
                    style={[
                      styles.statusOption,
                      selectedStatus === 'Working' && styles.statusOptionActive,
                    ]}
                    onPress={() => setSelectedStatus('Working')}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.statusIconContainer,
                        selectedStatus === 'Working' && styles.statusIconContainerActive,
                      ]}
                    >
                      <Ionicons
                        name="construct"
                        size={24}
                        color={selectedStatus === 'Working' ? COLORS.white : COLORS.primaryBlue}
                      />
                    </View>
                    <Text
                      style={[
                        styles.statusOptionText,
                        selectedStatus === 'Working' && styles.statusOptionTextActive,
                      ]}
                    >
                      Working
                    </Text>
                    {selectedStatus === 'Working' && (
                      <Ionicons name="checkmark-circle" size={24} color={COLORS.primaryBlue} />
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.statusOption,
                      selectedStatus === 'Cleared' && styles.statusOptionActive,
                    ]}
                    onPress={() => setSelectedStatus('Cleared')}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.statusIconContainer,
                        selectedStatus === 'Cleared' && styles.statusIconContainerActive,
                      ]}
                    >
                      <Ionicons
                        name="checkmark-done"
                        size={24}
                        color={selectedStatus === 'Cleared' ? COLORS.white : COLORS.success}
                      />
                    </View>
                    <Text
                      style={[
                        styles.statusOptionText,
                        selectedStatus === 'Cleared' && styles.statusOptionTextActive,
                      ]}
                    >
                      Cleared
                    </Text>
                    {selectedStatus === 'Cleared' && (
                      <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Add Evidence */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Add Evidence (Optional)</Text>
                <View style={styles.mediaContainer}>
                  {media.map((item) => (
                    <View key={item.id} style={styles.mediaThumbnail}>
                      <Image source={{ uri: item.uri }} style={styles.mediaImage} />
                      <TouchableOpacity
                        style={styles.removeMediaButton}
                        onPress={() => handleRemoveMedia(item.id)}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="close-circle" size={24} color={COLORS.white} />
                      </TouchableOpacity>
                      {item.type === 'video' && (
                        <View style={styles.videoOverlay}>
                          <Ionicons name="play-circle" size={32} color={COLORS.white} />
                        </View>
                      )}
                    </View>
                  ))}
                  <TouchableOpacity
                    style={styles.addMediaButton}
                    onPress={handleAddMedia}
                    activeOpacity={0.6}
                  >
                    <View style={styles.addMediaIconContainer}>
                      <Ionicons name="camera" size={28} color={COLORS.primary} />
                    </View>
                    <Text style={styles.addMediaText}>Add Photo/Video</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Remarks */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Remarks (Optional)</Text>
                <TextInput
                  style={styles.remarksInput}
                  placeholder="Add any additional notes or observations..."
                  placeholderTextColor={COLORS.textSecondary}
                  value={remarks}
                  onChangeText={setRemarks}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </ScrollView>

            {/* Update Button */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.updateButton}
                onPress={handleUpdate}
                activeOpacity={0.8}
              >
                <Ionicons name="checkmark-circle" size={22} color={COLORS.white} />
                <Text style={styles.updateButtonText}>Update Status</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>

      {/* Add Media Sheet - Render conditionally to avoid modal stacking issues */}
      {showMediaSheet && (
        <AddMediaSheet
          visible={showMediaSheet}
          onClose={handleCloseMediaSheet}
          onPhotoTaken={handleMediaPicked}
          onMediaSelected={handleMediaPicked}
        />
      )}
    </>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  infoCard: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: SPACING.md,
    marginTop: SPACING.md,
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
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
  statusOptions: {
    gap: 12,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  statusOptionActive: {
    borderColor: COLORS.primaryBlue,
    backgroundColor: COLORS.white,
  },
  statusIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statusIconContainerActive: {
    backgroundColor: COLORS.primaryBlue,
  },
  statusOptionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  statusOptionTextActive: {
    fontWeight: '700',
    color: COLORS.primaryBlue,
  },
  mediaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  mediaThumbnail: {
    width: 100,
    height: 100,
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
  removeMediaButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addMediaButton: {
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 152, 0, 0.05)',
  },
  addMediaIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  addMediaText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  remarksInput: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: SPACING.md,
    fontSize: 15,
    color: COLORS.text,
    minHeight: 100,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  footer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  updateButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
});
