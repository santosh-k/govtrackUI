import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Platform,
  Dimensions,
  ActivityIndicator,
  ActionSheetIOS,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const COLORS = {
  background: '#FFFFFF',
  overlay: 'rgba(0, 0, 0, 0.5)',
  text: '#1A1A1A',
  textSecondary: '#666666',
  textLight: '#9E9E9E',
  border: '#E0E0E0',
  divider: '#EEEEEE',
  primary: '#FF9800',
  inputBackground: '#F5F5F5',
  success: '#4CAF50',
};

const STATUS_OPTIONS = [
  'Submitted',
  'Assigned',
  'In Progress',
  'Resolved',
  'Closed',
  'Reopened',
];

interface Attachment {
  uri: string;
  type: 'image' | 'video' | 'document';
  name?: string;
}

interface UpdateActivityBottomSheetProps {
  visible: boolean;
  currentStatus: string;
  onClose: () => void;
  onSubmit: (status: string, description: string, attachments: Attachment[]) => void;
}

export default function UpdateActivityBottomSheet({
  visible,
  currentStatus,
  onClose,
  onSubmit,
}: UpdateActivityBottomSheetProps) {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);

  const handleReset = () => {
    setSelectedStatus(currentStatus);
    setDescription('');
    setAttachments([]);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleTakePhotoOrVideo = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera permission is required to take photos or videos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All, // Changed from Images to All
      quality: 0.8,
      allowsEditing: false, // Disabled editing to support videos
      videoMaxDuration: 60, // Optional: limit video to 60 seconds
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setAttachments((prev) => [
        ...prev,
        {
          uri: asset.uri,
          type: (asset.type === 'video' ? 'video' : 'image') as 'image' | 'video',
        },
      ]);
    }
  };

  const handleChooseFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Gallery permission is required to select photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 0.8,
      allowsEditing: false,
      allowsMultipleSelection: true,
    });

    if (!result.canceled) {
      const newAttachments = result.assets.map((asset) => ({
        uri: asset.uri,
        type: (asset.type === 'video' ? 'video' : 'image') as 'image' | 'video',
      }));
      setAttachments((prev) => [...prev, ...newAttachments]);
    }
  };

  const handleChooseFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
        multiple: true,
      });

      if (!result.canceled && result.assets) {
        const newAttachments = result.assets.map((asset) => ({
          uri: asset.uri,
          type: 'document' as const,
          name: asset.name,
        }));
        setAttachments((prev) => [...prev, ...newAttachments]);
      }
    } catch {
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const showAttachmentOptions = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo or Video', 'Choose from Gallery', 'Choose File'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) handleTakePhotoOrVideo();
          else if (buttonIndex === 2) handleChooseFromGallery();
          else if (buttonIndex === 3) handleChooseFile();
        }
      );
    } else {
      Alert.alert(
        'Attach Files',
        'Choose an option',
        [
          { text: 'Take Photo or Video', onPress: handleTakePhotoOrVideo },
          { text: 'Choose from Gallery', onPress: handleChooseFromGallery },
          { text: 'Choose File', onPress: handleChooseFile },
          { text: 'Cancel', style: 'cancel' },
        ],
        { cancelable: true }
      );
    }
  };

  const handleSubmit = async () => {
    if (!selectedStatus) {
      Alert.alert('Required', 'Please select a status');
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate API call
    onSubmit(selectedStatus, description, attachments);
    setIsSubmitting(false);
    handleReset();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.overlayTouchable}
          activeOpacity={1}
          onPress={handleClose}
        />
        <View style={styles.bottomSheet}>
          {/* Grabber Handle */}
          <View style={styles.grabberContainer}>
            <View style={styles.grabber} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Update Activity</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Content Container */}
          <View style={styles.contentContainer}>
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
            {/* Status Selector */}
            <View style={styles.section}>
              <Text style={styles.label}>Status</Text>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setShowStatusPicker(!showStatusPicker)}
              >
                <Text style={styles.dropdownText}>{selectedStatus}</Text>
                <Ionicons
                  name={showStatusPicker ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={COLORS.textSecondary}
                />
              </TouchableOpacity>

              {/* Status Options */}
              {showStatusPicker && (
                <View style={styles.statusOptions}>
                  {STATUS_OPTIONS.map((status) => (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.statusOption,
                        selectedStatus === status && styles.statusOptionSelected,
                      ]}
                      onPress={() => {
                        setSelectedStatus(status);
                        setShowStatusPicker(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.statusOptionText,
                          selectedStatus === status && styles.statusOptionTextSelected,
                        ]}
                      >
                        {status}
                      </Text>
                      {selectedStatus === status && (
                        <Ionicons name="checkmark" size={20} color={COLORS.primary} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Description Input */}
            <View style={styles.section}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Add a comment or describe the update..."
                placeholderTextColor={COLORS.textLight}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={description}
                onChangeText={setDescription}
              />
            </View>

            {/* Attach Files */}
            <View style={styles.section}>
              <Text style={styles.label}>Attach Files</Text>
              <TouchableOpacity
                style={styles.attachButton}
                onPress={showAttachmentOptions}
              >
                <Ionicons name="attach" size={24} color={COLORS.textSecondary} />
                <Text style={styles.attachButtonText}>Add Photo, Video, or File</Text>
              </TouchableOpacity>

              {/* Attachment Previews */}
              {attachments.length > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.attachmentPreviewContainer}
                >
                  {attachments.map((attachment, index) => (
                    <View key={index} style={styles.attachmentPreview}>
                      {attachment.type === 'document' ? (
                        <View style={styles.documentPreview}>
                          <Ionicons name="document" size={32} color={COLORS.textSecondary} />
                          <Text
                            style={styles.documentName}
                            numberOfLines={2}
                            ellipsizeMode="middle"
                          >
                            {attachment.name || 'Document'}
                          </Text>
                        </View>
                      ) : (
                        <Image
                          source={{ uri: attachment.uri }}
                          style={styles.previewImage}
                        />
                      )}
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => handleRemoveAttachment(index)}
                      >
                        <Ionicons name="close-circle" size={24} color="#FF3B30" />
                      </TouchableOpacity>
                      {attachment.type === 'video' && (
                        <View style={styles.videoIndicator}>
                          <Ionicons name="play-circle" size={32} color="#FFFFFF" />
                        </View>
                      )}
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>
          </ScrollView>

          {/* Submit Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Update</Text>
              )}
            </TouchableOpacity>
          </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  overlayTouchable: {
    flex: 1,
  },
  bottomSheet: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: SCREEN_HEIGHT * 0.85,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  grabberContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  grabber: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.divider,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: 0.3,
  },
  closeButton: {
    padding: 4,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    flexGrow: 1,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.inputBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dropdownText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
  },
  statusOptions: {
    marginTop: 8,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    overflow: 'hidden',
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  statusOptionSelected: {
    backgroundColor: '#FFF3E0',
  },
  statusOptionText: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.text,
  },
  statusOptionTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  textInput: {
    backgroundColor: COLORS.inputBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: COLORS.text,
    minHeight: 120,
    lineHeight: 22,
  },
  attachButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 20,
    gap: 12,
  },
  attachButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  attachmentPreviewContainer: {
    marginTop: 16,
    gap: 12,
  },
  attachmentPreview: {
    width: 100,
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.inputBackground,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  documentPreview: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  documentName: {
    fontSize: 10,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: COLORS.background,
    borderRadius: 12,
  },
  videoIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  footer: {
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});
