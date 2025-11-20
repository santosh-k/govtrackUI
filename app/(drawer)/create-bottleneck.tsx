/**
 * Add Bottleneck Screen
 *
 * A comprehensive bottleneck reporting screen with card-based layout:
 * - Issue Details (type, description)
 * - Add Attachments (Optional) with gallery-style component
 *
 * Features:
 * - Searchable issue type dropdown using global SelectionScreen
 * - Gallery-style attachment component (reused from Create Complaint)
 * - Form validation and submission
 *
 * @screen
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { COLORS, SPACING } from '@/theme';
import * as ImagePicker from 'expo-image-picker';

// Types
interface Attachment {
  id: string;
  uri: string;
  type: 'image' | 'video';
}

export default function CreateBottleneckScreen() {
  const params = useLocalSearchParams();
  const projectId = params.projectId as string;
  const returnTab = params.returnTab as string;

  // State
  const [selectedIssueType, setSelectedIssueType] = useState('');
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Update selected issue type when returning from SelectionScreen
   */
  useEffect(() => {
    if (params.selectedIssueType) {
      setSelectedIssueType(params.selectedIssueType as string);
    }
  }, [params.selectedIssueType]);

  /**
   * Handles back navigation
   */
  const handleGoBack = () => {
    if (projectId) {
      router.push({
        pathname: '/(drawer)/project-details',
        params: {
          projectId,
          ...(returnTab && { activeTab: returnTab }),
        },
      });
    } else {
      router.back();
    }
  };

  /**
   * Handles attachment selection
   */
  const handleAddAttachment = () => {
    Alert.alert('Add Attachment', 'Choose an option', [
      {
        text: 'Take Photo',
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Permission needed', 'Camera permission is required');
            return;
          }

          const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            quality: 0.8,
          });

          if (!result.canceled && result.assets[0]) {
            const newAttachment: Attachment = {
              id: `attach-${Date.now()}`,
              uri: result.assets[0].uri,
              type: 'image',
            };
            setAttachments([...attachments, newAttachment]);
          }
        },
      },
      {
        text: 'Choose from Gallery',
        onPress: async () => {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Permission needed', 'Gallery permission is required');
            return;
          }

          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: false,
            quality: 0.8,
          });

          if (!result.canceled && result.assets[0]) {
            const newAttachment: Attachment = {
              id: `attach-${Date.now()}`,
              uri: result.assets[0].uri,
              type: result.assets[0].type === 'video' ? 'video' : 'image',
            };
            setAttachments([...attachments, newAttachment]);
          }
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  /**
   * Removes an attachment
   */
  const removeAttachment = (id: string) => {
    setAttachments(attachments.filter((att) => att.id !== id));
  };

  /**
   * Handles form submission
   */
  const handleSubmit = async () => {
    // Validate required fields
    if (!selectedIssueType) {
      Alert.alert('Validation Error', 'Please select an issue type');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Validation Error', 'Description is required');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Show success message and navigate back to Project Details with Bottlenecks tab active
      Alert.alert('Success', 'Bottleneck reported successfully!', [
        {
          text: 'OK',
          onPress: () => {
            if (projectId) {
              router.push({
                pathname: '/(drawer)/project-details',
                params: {
                  projectId,
                  activeTab: 'Bottlenecks',
                },
              });
            } else {
              router.back();
            }
          },
        },
      ]);
    } catch (error) {
      console.error('Error creating bottleneck:', error);
      Alert.alert('Error', 'Failed to report bottleneck. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.cardBackground} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleGoBack}
          activeOpacity={0.6}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Bottleneck</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Card 1: Issue Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Issue Details</Text>

          {/* Issue Type Dropdown */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Issue Type</Text>
            <TouchableOpacity
              style={styles.dropdownTrigger}
              onPress={() => {
                router.push({
                  pathname: '/(drawer)/selection-screen',
                  params: {
                    title: 'Select Issue Type',
                    dataKey: 'issueTypes',
                    currentValue: selectedIssueType,
                    returnTo: 'create-bottleneck',
                    returnField: 'selectedIssueType',
                    projectId: projectId || '',
                    returnTab: returnTab || '',
                  },
                });
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.dropdownText, !selectedIssueType && styles.placeholderText]}>
                {selectedIssueType || 'Select issue type'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Description */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Description</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe the bottleneck issue in detail..."
              placeholderTextColor={COLORS.textSecondary}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Card 2: Add Attachments (Optional) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Add Attachments (Optional)</Text>

          {/* Gallery-Style Attachments */}
          {attachments.length === 0 ? (
            /* Initial State: Large "Add Photo/Video" Tile */
            <TouchableOpacity
              style={styles.initialAddTile}
              onPress={handleAddAttachment}
              activeOpacity={0.7}
            >
              <Ionicons name="camera-outline" size={40} color={COLORS.primary} />
              <Text style={styles.initialAddTileText}>Add Photo/Video</Text>
            </TouchableOpacity>
          ) : (
            /* Gallery View: Thumbnails + Add More Button */
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.galleryScrollView}
              contentContainerStyle={styles.galleryScrollContent}
            >
              {attachments.map((att) => (
                <View key={att.id} style={styles.galleryThumbnail}>
                  <Image source={{ uri: att.uri }} style={styles.galleryThumbImage} />
                  {att.type === 'video' && (
                    <View style={styles.videoIndicator}>
                      <Ionicons name="play-circle" size={20} color={COLORS.white} />
                    </View>
                  )}
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeAttachment(att.id)}
                  >
                    <Ionicons name="close-circle" size={24} color={COLORS.error} />
                  </TouchableOpacity>
                </View>
              ))}

              {/* Permanent "Add More" Button */}
              <TouchableOpacity
                style={styles.addMoreTile}
                onPress={handleAddAttachment}
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={32} color={COLORS.primary} />
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>

        {/* Bottom spacing for fixed button */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Fixed Submit Button */}
      <View style={styles.submitButtonContainer}>
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
          activeOpacity={0.8}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Text style={styles.submitButtonText}>Save Bottleneck</Text>
          )}
        </TouchableOpacity>
      </View>
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
    backgroundColor: COLORS.cardBackground,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
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
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  fieldContainer: {
    marginBottom: SPACING.md,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  textInput: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.text,
  },
  textArea: {
    minHeight: 120,
    paddingTop: 12,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
  },
  dropdownText: {
    fontSize: 15,
    color: COLORS.text,
  },
  placeholderText: {
    color: COLORS.textSecondary,
  },
  submitButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.cardBackground,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  // Gallery-Style Attachment Styles
  initialAddTile: {
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingBottom: 20,
  },
  initialAddTileText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  galleryScrollView: {
    marginTop: 0,
  },
  galleryScrollContent: {
    gap: SPACING.sm,
  },
  galleryThumbnail: {
    position: 'relative',
    width: 120,
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
  },
  galleryThumbImage: {
    width: '100%',
    height: '100%',
  },
  videoIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -10 }, { translateY: -10 }],
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: COLORS.white,
    borderRadius: 12,
  },
  addMoreTile: {
    width: 120,
    height: 120,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
