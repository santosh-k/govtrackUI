import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Animated,
  Dimensions,
  Platform,
  Pressable,
  PanResponder,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const COLORS = {
  background: '#F5F5F5',
  cardBackground: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#666666',
  textLight: '#9E9E9E',
  primary: '#2196F3',
  border: '#E0E0E0',
  inputBackground: '#F5F5F5',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.75;

interface FilterBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  selectedStatuses: string[];
  selectedProject: string;
  selectedAssignedTo: string;
  selectedPriority?: string | null;
  selectedTaskType?: string | null;
  //selectedDepartment: string;
  onStatusToggle: (status: string) => void;
  onProjectPress: () => void;
  onAssignedToPress: () => void;
  onApply: (filters?: { priority?: string; task_type?: string }) => void;
  onReset: () => void;
}
//PENDING, IN_PROGRESS, ON_HOLD, COMPLETED, CANCELLED
const STATUS_OPTIONS = ['Pending',  'In Progress', 'On Hold', 'Completed', 'Canceled'];
//OBSERVATION, PROJECT, STANDALONE, INSPECTION
const Task_Type = [
  'Observation',
  'Project',
  'Standalone',
  'Inspection'
];

export default function TaskFilterBottomSheet({
  visible,
  onClose,
  selectedStatuses,
  selectedProject,
  selectedAssignedTo,
  selectedPriority: selectedPriorityProp,
  selectedTaskType: selectedTaskTypeProp,
  onStatusToggle,
  onProjectPress,
  onAssignedToPress,
  onApply,
  onReset,
}: FilterBottomSheetProps) {
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const lastGestureDy = useRef(0);
  const [currentPriority, setCurrentPriority] = useState('Low');
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);
  const [showPriorityPicker, setShowPriorityPicker] = useState(false);
  const [currentTaskType, setCurrentTaskType] = useState('Standalone Task');
  const [selectedTaskType, setSelectedTaskType] = useState<string | null>(null);
  const [showTaskTypePicker, setShowTaskTypePicker] = useState(false);

  // sync with props when opened
  useEffect(() => {
    if (visible) {
      setSelectedPriority(selectedPriorityProp ?? null);
      setSelectedTaskType(selectedTaskTypeProp ?? null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const PRIORITY = [
  'Low',
  'Medium',
  'High',
  'Urgent'
];
  

  const insets= useSafeAreaInsets();

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: SHEET_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, translateY]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only capture swipe down gestures
        return gestureState.dy > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        // Only allow dragging down (positive dy)
        if (gestureState.dy > 0) {
          lastGestureDy.current = gestureState.dy;
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        // If dragged down more than 150px or swiped fast, close the sheet
        if (gestureState.dy > 150 || gestureState.vy > 0.5) {
          Animated.timing(translateY, {
            toValue: SHEET_HEIGHT,
            duration: 250,
            useNativeDriver: true,
          }).start(() => {
            onClose();
          });
        } else {
          // Otherwise, snap back to open position
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 65,
            friction: 11,
          }).start();
        }
      },
    })
  ).current;

  const handleBackdropPress = () => {
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={[styles.modalContainer]}>
        {/* Backdrop */}
        <Pressable style={styles.backdrop} onPress={handleBackdropPress} />

        {/* Bottom Sheet */}
        <Animated.View
          style={[
            styles.bottomSheet,
            {
              transform: [{ translateY }],
                paddingBottom: insets.bottom
            },
          ]}
          {...panResponder.panHandlers}
        >
          {/* Handle Bar */}
          <View style={styles.handleBar} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Filter Tasks</Text>
            <TouchableOpacity onPress={onClose} activeOpacity={0.6}>
              <Ionicons name="close" size={28} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          {/* Filter Content */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Status Section */}
            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>Status</Text>
              <View style={styles.checkboxContainer}>
                {STATUS_OPTIONS.map((status) => {
                  const isSelected = selectedStatuses.includes(status);
                  return (
                    <TouchableOpacity
                      key={status}
                      style={styles.checkboxRow}
                      onPress={() => onStatusToggle(status)}
                      activeOpacity={0.7}
                    >
                      <View
                        style={[
                          styles.checkbox,
                          isSelected && styles.checkboxSelected,
                        ]}
                      >
                        {isSelected && (
                          <Ionicons name="checkmark" size={18} color={COLORS.cardBackground} />
                        )}
                      </View>
                      <Text style={styles.checkboxLabel}>{status}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.fieldLabel}>Priority</Text>
                <TouchableOpacity
                    style={styles.dropdown}
                    onPress={() => setShowPriorityPicker(!showPriorityPicker)}
                >
                    <Text style={styles.dropdownText}>{selectedPriority}</Text>
                    <Ionicons
                    name={showPriorityPicker ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={COLORS.textSecondary}
                    />
                </TouchableOpacity>
                {/* Priority Options */}
                {showPriorityPicker && (
                    <View style={styles.statusOptions}>
                    {PRIORITY.map((priority) => (
                        <TouchableOpacity
                        key={priority}
                        style={[
                            styles.statusOption,
                            selectedPriority === priority && styles.statusOptionSelected,
                        ]}
                        onPress={() => {
                            setSelectedPriority(priority);
                            setCurrentPriority(priority)
                            setShowPriorityPicker(false);
                        }}
                        >
                        <Text
                            style={[
                            styles.statusOptionText,
                            selectedPriority === priority && styles.statusOptionTextSelected,
                            ]}
                        >
                            {priority}
                        </Text>
                        {selectedPriority === priority && (
                            <Ionicons name="checkmark" size={20} color={COLORS.primary} />
                        )}
                        </TouchableOpacity>
                    ))}
                    </View>
                )}
            </View>
            <View style={styles.section}>
                <Text style={styles.fieldLabel}>Task Type</Text>
                <TouchableOpacity
                    style={styles.dropdown}
                    onPress={() => setShowTaskTypePicker(!showTaskTypePicker)}
                >
                    <Text style={styles.dropdownText}>{selectedTaskType}</Text>
                    <Ionicons
                    name={showTaskTypePicker ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={COLORS.textSecondary}
                    />
                </TouchableOpacity>
                {/* Priority Options */}
                {showTaskTypePicker && (
                    <View style={styles.statusOptions}>
                    {Task_Type.map((type) => (
                        <TouchableOpacity
                        key={type}
                        style={[
                            styles.statusOption,
                            selectedTaskType === type && styles.statusOptionSelected,
                        ]}
                        onPress={() => {
                            setSelectedTaskType(type);
                            setCurrentTaskType(type)
                            setShowTaskTypePicker(false);
                        }}
                        >
                        <Text
                            style={[
                            styles.statusOptionText,
                            selectedTaskType === type && styles.statusOptionTextSelected,
                            ]}
                        >
                            {type}
                        </Text>
                        {selectedTaskType === type && (
                            <Ionicons name="checkmark" size={20} color={COLORS.primary} />
                        )}
                        </TouchableOpacity>
                    ))}
                    </View>
                )}
            </View>
            <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Project</Text>
                <TouchableOpacity
                style={styles.dropdownTrigger}
                onPress={onProjectPress}
                activeOpacity={0.7}
                >
                <Text style={[styles.dropdownTriggerText]}>
                    {selectedProject || 'All Projects'}
                </Text>
                <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
            </View>
            <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Assigned To</Text>
                <TouchableOpacity
                style={styles.dropdownTrigger}
                onPress={onAssignedToPress}
                activeOpacity={0.7}
                >
                <Text style={[styles.dropdownTriggerText]}>
                    {selectedAssignedTo || 'All Users'}
                </Text>
                <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
            </View>
          </ScrollView>
          {/* Action Buttons */}
          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={onReset}
              activeOpacity={0.7}
            >
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => onApply({ priority: selectedPriority ?? undefined, task_type: selectedTaskType ?? undefined })}
              activeOpacity={0.8}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_HEIGHT,
    backgroundColor: COLORS.cardBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 20,
      },
    }),
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  filterSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  checkboxContainer: {
    gap: 12,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkboxLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
  },
  selectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  applyButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.cardBackground,
  },
   section: {
    marginBottom: 24,
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
        borderBottomColor: COLORS.border,
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
    fieldLabel: {
          fontSize: 14,
          fontWeight: '500',
          color: COLORS.text,
          marginBottom: 8,
    },
    fieldContainer: {
        marginBottom: 16,
      },
      dropdownTrigger: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: COLORS.background,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: COLORS.border,
          paddingHorizontal: 16,
          paddingVertical: 12,
        },
        dropdownTriggerText: {
            fontSize: 15,
            color: COLORS.text,
          },
});