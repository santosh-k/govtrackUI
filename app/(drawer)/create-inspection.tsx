/**
 * Create Inspection Screen
 *
 * A comprehensive inspection creation screen with two modes:
 * - Quick Inspection: Simple status, remarks, and attachments
 * - Full Inspection: Detailed checklist with Yes/No/N/A questions
 *
 * Features:
 * - Dynamic form content based on selected mode
 * - Modern segmented control for mode switching
 * - Attachment upload support
 * - Success feedback with navigation to Inspections tab
 *
 * @screen
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
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { COLORS, SPACING } from '@/theme';
import * as ImagePicker from 'expo-image-picker';

// Types
type InspectionMode = 'quick' | 'full';
type InspectionStatus = 'Passed' | 'Failed' | 'Needs Follow-up' | '';
type ChecklistAnswer = 'Yes' | 'No' | 'N/A' | '';

interface Attachment {
  id: string;
  uri: string;
  type: 'image' | 'video' | 'document';
  name?: string;
}

interface ChecklistItem {
  id: string;
  question: string;
  answer: ChecklistAnswer;
}

export default function CreateInspectionScreen() {
  const params = useLocalSearchParams();
  const projectId = params.projectId as string;

  // State
  const [inspectionMode, setInspectionMode] = useState<InspectionMode>('quick');
  const [status, setStatus] = useState<InspectionStatus>('');
  const [remarks, setRemarks] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  // Full inspection checklist
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    { id: '1', question: 'Whether bell mouths pipes and curb channels are clean:', answer: '' },
    { id: '2', question: 'Whether there is any blockage apparent in the drain:', answer: '' },
    { id: '3', question: 'Whether there is any encroachment on drain:', answer: '' },
    { id: '4', question: 'Whether water is overflowing from the drain:', answer: '' },
  ]);

  /**
   * Handles back navigation
   */
  const handleGoBack = () => {
    if (projectId) {
      router.push({
        pathname: '/(drawer)/project-details',
        params: { projectId },
      });
    } else {
      router.back();
    }
  };

  /**
   * Updates checklist answer for a specific question
   */
  const updateChecklistAnswer = (id: string, answer: ChecklistAnswer) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, answer } : item))
    );
  };

  /**
   * Handles attachment selection (camera or gallery)
   */
  const handleAddAttachment = async () => {
    Alert.alert(
      'Add Attachment',
      'Choose an option',
      [
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
      ]
    );
  };

  /**
   * Removes an attachment
   */
  const removeAttachment = (id: string) => {
    setAttachments(attachments.filter((att) => att.id !== id));
  };

  /**
   * Validates and submits the inspection
   */
  const handleSubmit = async () => {
    // Validation
    if (inspectionMode === 'quick' && !status) {
      Alert.alert('Required Field', 'Please select an inspection status');
      return;
    }

    if (inspectionMode === 'full') {
      const unanswered = checklist.filter((item) => !item.answer);
      if (unanswered.length > 0) {
        Alert.alert('Incomplete Checklist', 'Please answer all checklist questions');
        return;
      }
    }

    if (!remarks.trim()) {
      Alert.alert('Required Field', 'Please provide remarks');
      return;
    }

    // Simulate submission
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);

      // Navigate back to Project Details with Inspections tab active
      router.push({
        pathname: '/(drawer)/project-details',
        params: { projectId, activeTab: 'Inspections' },
      });

      // Show success message
      setTimeout(() => {
        Alert.alert('Success', 'Inspection submitted successfully!');
      }, 300);
    }, 1500);
  };

  /**
   * Renders status dropdown options
   */
  const renderStatusDropdown = () => {
    if (!showStatusDropdown) return null;

    const statuses: InspectionStatus[] = ['Passed', 'Failed', 'Needs Follow-up'];

    return (
      <View style={styles.dropdownContainer}>
        {statuses.map((s) => (
          <TouchableOpacity
            key={s}
            style={styles.dropdownOption}
            onPress={() => {
              setStatus(s);
              setShowStatusDropdown(false);
            }}
          >
            <Text style={styles.dropdownOptionText}>{s}</Text>
            {status === s && <Ionicons name="checkmark" size={20} color={COLORS.primary} />}
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  /**
   * Renders Quick Inspection form
   */
  const renderQuickInspection = () => (
    <View style={styles.formSection}>
      {/* Status Field */}
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Status *</Text>
        <TouchableOpacity
          style={styles.dropdownTrigger}
          onPress={() => setShowStatusDropdown(!showStatusDropdown)}
        >
          <Text style={[styles.dropdownText, !status && styles.placeholderText]}>
            {status || 'Select status'}
          </Text>
          <Ionicons
            name={showStatusDropdown ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={COLORS.textSecondary}
          />
        </TouchableOpacity>
        {renderStatusDropdown()}
      </View>

      {/* Remarks */}
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Remarks *</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Enter your remarks here..."
          placeholderTextColor={COLORS.textSecondary}
          value={remarks}
          onChangeText={setRemarks}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />
      </View>

      {/* Attachments */}
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Attachments</Text>
        <TouchableOpacity style={styles.attachmentTile} onPress={handleAddAttachment}>
          <Ionicons name="cloud-upload-outline" size={32} color={COLORS.primary} />
          <Text style={styles.attachmentTileText}>Tap to add photos, videos, or files</Text>
        </TouchableOpacity>

        {attachments.length > 0 && (
          <View style={styles.attachmentsList}>
            {attachments.map((att) => (
              <View key={att.id} style={styles.attachmentItem}>
                <Ionicons
                  name={att.type === 'image' ? 'image' : att.type === 'video' ? 'videocam' : 'document'}
                  size={20}
                  color={COLORS.primary}
                />
                <Text style={styles.attachmentName} numberOfLines={1}>
                  {att.name || 'Attachment'}
                </Text>
                <TouchableOpacity onPress={() => removeAttachment(att.id)}>
                  <Ionicons name="close-circle" size={20} color={COLORS.error} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );

  /**
   * Renders Full Inspection checklist
   */
  const renderFullInspection = () => (
    <View style={styles.formSection}>
      <Text style={styles.checklistHeader}>Inspection Checklist</Text>

      {checklist.map((item, index) => (
        <View key={item.id} style={styles.checklistRow}>
          <Text style={styles.checklistQuestion}>
            {index + 1}. {item.question}
          </Text>
          <View style={styles.answerButtonGroup}>
            {(['Yes', 'No', 'N/A'] as ChecklistAnswer[]).map((answer) => (
              <TouchableOpacity
                key={answer}
                style={[
                  styles.answerButton,
                  item.answer === answer && styles.answerButtonActive,
                ]}
                onPress={() => updateChecklistAnswer(item.id, answer)}
              >
                <Text
                  style={[
                    styles.answerButtonText,
                    item.answer === answer && styles.answerButtonTextActive,
                  ]}
                >
                  {answer}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      {/* Overall Remarks */}
      <View style={[styles.fieldContainer, { marginTop: SPACING.lg }]}>
        <Text style={styles.fieldLabel}>Overall Remarks *</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Enter overall remarks here..."
          placeholderTextColor={COLORS.textSecondary}
          value={remarks}
          onChangeText={setRemarks}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />
      </View>

      {/* Attachments */}
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Attachments</Text>
        <TouchableOpacity style={styles.attachmentTile} onPress={handleAddAttachment}>
          <Ionicons name="cloud-upload-outline" size={32} color={COLORS.primary} />
          <Text style={styles.attachmentTileText}>Tap to add photos, videos, or files</Text>
        </TouchableOpacity>

        {attachments.length > 0 && (
          <View style={styles.attachmentsList}>
            {attachments.map((att) => (
              <View key={att.id} style={styles.attachmentItem}>
                <Ionicons
                  name={att.type === 'image' ? 'image' : att.type === 'video' ? 'videocam' : 'document'}
                  size={20}
                  color={COLORS.primary}
                />
                <Text style={styles.attachmentName} numberOfLines={1}>
                  {att.name || 'Attachment'}
                </Text>
                <TouchableOpacity onPress={() => removeAttachment(att.id)}>
                  <Ionicons name="close-circle" size={20} color={COLORS.error} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.cardBackground} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack} activeOpacity={0.6}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Inspection</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Static Inspection Type - Simple Text Display */}
        <View style={styles.inspectionTypeContainer}>
          <Text style={styles.inspectionTypeLabel}>Inspection Type: </Text>
          <Text style={styles.inspectionTypeValue}>Project Inspection</Text>
        </View>

        {/* Inspection Mode Switcher */}
        <View style={styles.segmentedControl}>
          <TouchableOpacity
            style={[styles.segment, inspectionMode === 'quick' && styles.segmentActive]}
            onPress={() => setInspectionMode('quick')}
            activeOpacity={0.8}
          >
            <Text
              style={[styles.segmentText, inspectionMode === 'quick' && styles.segmentTextActive]}
            >
              Quick Inspection
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segment, inspectionMode === 'full' && styles.segmentActive]}
            onPress={() => setInspectionMode('full')}
            activeOpacity={0.8}
          >
            <Text style={[styles.segmentText, inspectionMode === 'full' && styles.segmentTextActive]}>
              Full Inspection
            </Text>
          </TouchableOpacity>
        </View>

        {/* Dynamic Form Content */}
        {inspectionMode === 'quick' ? renderQuickInspection() : renderFullInspection()}

        {/* Bottom spacing for fixed button */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.submitButtonContainer}>
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
          activeOpacity={0.8}
        >
          {isSubmitting ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.submitButtonText}>Submit Inspection</Text>
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
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  backButton: {
    padding: SPACING.sm,
    marginLeft: -SPACING.sm,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  inspectionTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  inspectionTypeLabel: {
    fontSize: 13,
    fontWeight: '400',
    color: COLORS.textSecondary,
  },
  inspectionTypeValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBackground,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    borderRadius: 12,
    padding: 4,
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
  segment: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  segmentActive: {
    backgroundColor: COLORS.primary,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  segmentTextActive: {
    color: COLORS.white,
  },
  formSection: {
    marginTop: SPACING.md,
  },
  fieldContainer: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.cardBackground,
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dropdownText: {
    fontSize: 15,
    color: COLORS.text,
  },
  placeholderText: {
    color: COLORS.textSecondary,
  },
  dropdownContainer: {
    backgroundColor: COLORS.cardBackground,
    marginTop: SPACING.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dropdownOptionText: {
    fontSize: 15,
    color: COLORS.text,
  },
  textArea: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.text,
    minHeight: 120,
  },
  attachmentTile: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    paddingVertical: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachmentTileText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  attachmentsList: {
    marginTop: SPACING.sm,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  attachmentName: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  checklistHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  checklistRow: {
    backgroundColor: COLORS.cardBackground,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  checklistQuestion: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: SPACING.sm + 4,
  },
  answerButtonGroup: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  answerButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    alignItems: 'center',
  },
  answerButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  answerButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  answerButtonTextActive: {
    color: COLORS.white,
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
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
});
