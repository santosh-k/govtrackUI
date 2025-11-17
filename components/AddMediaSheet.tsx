/**
 * AddMediaSheet Component
 *
 * A reusable bottom sheet component for media upload functionality.
 * Provides options for:
 * - Taking a photo or video with the camera
 * - Selecting from the device gallery
 * - Uploading documents
 *
 * @component
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '@/theme';

interface AddMediaSheetProps {
  /** Controls visibility of the sheet */
  visible: boolean;
  /** Callback function to close the sheet */
  onClose: () => void;
  /** Callback function when a photo/video is taken */
  onPhotoTaken?: (result: ImagePicker.ImagePickerResult) => void;
  /** Callback function when media is selected from gallery */
  onMediaSelected?: (result: ImagePicker.ImagePickerResult) => void;
  /** Callback function when a document is selected */
  onDocumentSelected?: () => void;
}

/**
 * AddMediaSheet - Bottom sheet for media upload options
 */
export default function AddMediaSheet({
  visible,
  onClose,
  onPhotoTaken,
  onMediaSelected,
  onDocumentSelected,
}: AddMediaSheetProps) {
  /**
   * Handles taking a photo or video with the camera
   */
  const handleTakePhotoOrVideo = async () => {
    onClose();

    // Request camera permissions
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Camera permission is required to take photos or videos.'
      );
      return;
    }

    try {
      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: false,
        quality: 0.8,
        videoMaxDuration: 60,
      });

      if (!result.canceled && onPhotoTaken) {
        onPhotoTaken(result);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open camera. Please try again.');
      console.error('Camera error:', error);
    }
  };

  /**
   * Handles selecting media from the device gallery
   */
  const handlePickFromGallery = async () => {
    onClose();

    // Request media library permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Gallery permission is required to select photos or videos.'
      );
      return;
    }

    try {
      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: false,
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && onMediaSelected) {
        onMediaSelected(result);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open gallery. Please try again.');
      console.error('Gallery error:', error);
    }
  };

  /**
   * Handles document selection
   */
  const handlePickDocument = () => {
    onClose();
    if (onDocumentSelected) {
      onDocumentSelected();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        {/* Touchable overlay to close the sheet */}
        <TouchableOpacity
          style={styles.overlayTouchable}
          activeOpacity={1}
          onPress={onClose}
        />

        {/* Bottom sheet content */}
        <View style={styles.sheet}>
          {/* Handle bar for visual indication */}
          <View style={styles.sheetHandle} />

          {/* Sheet title */}
          <Text style={styles.sheetTitle}>Add Media</Text>

          {/* Camera option */}
          <TouchableOpacity
            style={styles.option}
            onPress={handleTakePhotoOrVideo}
            activeOpacity={0.7}
          >
            <View style={styles.optionIconContainer}>
              <Ionicons name="camera" size={24} color={COLORS.primary} />
            </View>
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitle}>Take Photo or Video</Text>
              <Text style={styles.optionDescription}>
                Use your camera to capture new media
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>

          {/* Gallery option */}
          <TouchableOpacity
            style={styles.option}
            onPress={handlePickFromGallery}
            activeOpacity={0.7}
          >
            <View style={styles.optionIconContainer}>
              <Ionicons name="images" size={24} color={COLORS.primary} />
            </View>
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitle}>Choose from Gallery</Text>
              <Text style={styles.optionDescription}>
                Select existing photos or videos
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>

          {/* Document option */}
          <TouchableOpacity
            style={styles.option}
            onPress={handlePickDocument}
            activeOpacity={0.7}
          >
            <View style={styles.optionIconContainer}>
              <Ionicons name="document" size={24} color={COLORS.primary} />
            </View>
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitle}>Upload Document</Text>
              <Text style={styles.optionDescription}>
                Select a document file
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>

          {/* Cancel button */}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  overlayTouchable: {
    flex: 1,
  },
  sheet: {
    backgroundColor: COLORS.cardBackground,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
    paddingHorizontal: 20,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    marginBottom: 12,
  },
  optionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  cancelButton: {
    backgroundColor: COLORS.background,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
});
