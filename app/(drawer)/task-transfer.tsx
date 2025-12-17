/**
 * Create Task Screen
 *
 * A comprehensive task creation screen with card-based layout:
 * - Task Details (name, category, description)
 * - Task Location with Map
 * - Assign to Office/Department
 *
 * Features:
 * - Searchable dropdowns using global SelectionScreen
 * - Interactive map with location selection (reused from Create Complaint)
 * - Form validation and submission
 *
 * @screen
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
  Modal,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { COLORS, SPACING } from '@/theme';
import * as Location from 'expo-location';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { RootState } from '@/src/store';
import { selectTaskDetails } from '@/src/store/taskDetailsSlice';

import moment from 'moment';

// Types
interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
}

export default function TaskTransferScreen() {
  const params = useLocalSearchParams();
  const projectId = params.projectId as string;
  const taskId = params.taskId as string;
  const insets = useSafeAreaInsets();
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [missingTaskId, setMissingTaskId] = useState<boolean>(!taskId);
  const [effectiveTaskId, setEffectiveTaskId] = useState<string | null>(taskId || null);
  const taskDetails = useSelector(selectTaskDetails);
  const [selectedZone, setSelectedZone] = useState('');
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [selectedCircle, setSelectedCircle] = useState('');
  const [selectedCircleId, setSelectedCircleId] = useState<string | null>(null);
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedDivisionId, setSelectedDivisionId] = useState<string | null>(null);
  const [selectedSubDivision, setSelectedSubDivision] = useState('');
  const [selectedSubDivisionId, setSelectedSubDivisionId] = useState<string | null>(null);
  const [selectedDesignation, setSelectedDesignation] = useState('');
  const [selectedDesignationId, setSelectedDesignationId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [transferReason, setTransferReason] = useState('');
  
  
  /**
   * Update selected values when returning from SelectionScreen
   */
  useEffect(() => {
   
    if (params.selectedDepartment) {
      setSelectedDepartment(params.selectedDepartment as string);
    }
    if (params.selectedDepartmentId) {
      setSelectedDepartmentId(params.selectedDepartmentId as string);
    }

    // Zones / Circles / Divisions / SubDivisions / Designation / User
    if (params.selectedZone) {
      setSelectedZone(params.selectedZone as string);
    }
    if (params.selectedZoneId) {
      setSelectedZoneId(params.selectedZoneId as string);
    }

    if (params.selectedCircle) {
      setSelectedCircle(params.selectedCircle as string);
    }
    if (params.selectedCircleId) {
      setSelectedCircleId(params.selectedCircleId as string);
    }

    if (params.selectedDivision) {
      setSelectedDivision(params.selectedDivision as string);
    }
    if (params.selectedDivisionId) {
      setSelectedDivisionId(params.selectedDivisionId as string);
    }

    if (params.selectedSubDivision) {
      setSelectedSubDivision(params.selectedSubDivision as string);
    }
    if (params.selectedSubDivisionId) {
      setSelectedSubDivisionId(params.selectedSubDivisionId as string);
    }

    if (params.selectedDesignation) {
      setSelectedDesignation(params.selectedDesignation as string);
    }
    if (params.selectedDesignationId) {
      setSelectedDesignationId(params.selectedDesignationId as string);
    }

    if (params.selectedUser) {
      setSelectedUser(params.selectedUser as string);
    }
    if (params.selectedUserId) {
      setSelectedUserId(params.selectedUserId as string);
    }

  }, [
    params.selectedCategory,
    params.selectedDepartment,
    params.selectedZone,
    params.selectedZoneId,
    params.selectedCircle,
    params.selectedCircleId,
    params.selectedDivision,
    params.selectedDivisionId,
    params.selectedSubDivision,
    params.selectedSubDivisionId,
    params.selectedDesignation,
    params.selectedDesignationId,
    params.selectedUser,
    params.selectedUserId,
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

  React.useEffect(() => {
    // Resolve effective task id from params or from store if absent
    const idFromStore = taskDetails?.task?.id ? String(taskDetails.task.id) : null;
    const resolved = taskId || idFromStore || null;
    setEffectiveTaskId(resolved);
    setMissingTaskId(!resolved);
    // helpful debug info when diagnosing intermittent null taskId issues
    console.log('TaskTransfer resolved task id:', resolved, 'params.taskId:', taskId, 'storeId:', idFromStore);
  }, [taskId, taskDetails]);

  /**
   * Handles form submission
   */
  const resetForm = () => {
    setSelectedDepartment('');
    setSelectedDepartmentId(null);
    setSelectedZone('');
    setSelectedZoneId(null);
    setSelectedCircle('');
    setSelectedCircleId(null);
    setSelectedDivision('');
    setSelectedDivisionId(null);
    setSelectedSubDivision('');
    setSelectedSubDivisionId(null);
    setSelectedDesignation('');
    setSelectedDesignationId(null);
    setSelectedUser('');
    setSelectedUserId(null);
    
  };

  const handleSubmit = async () => {
    // Validation: require Department -> Zone -> User selected in order
    if (!selectedDepartmentId) {
      Alert.alert('Validation Error', 'Please select a Department first');
      return;
    }

    if (!selectedZoneId) {
      Alert.alert('Validation Error', 'Please select a Zone after selecting a Department');
      return;
    }

    if (!selectedUserId) {
      Alert.alert('Validation Error', 'Please select a User to transfer the task to');
      return;
    }

    setIsSubmitting(true);

    try {
     
      try {
        const ApiManagerModule = await import('@/src/services/ApiManager');
        const ApiManager = ApiManagerModule.default;
        const api = ApiManager.getInstance();
        if (!effectiveTaskId) {
          // Avoid throwing—show user friendly alert and bail out to preserve UX
          setIsSubmitting(false);
          Alert.alert('Error', 'No task selected to transfer. Please open Transfer from a task context and try again.');
          return;
        }

        const res = await api.transferTask(effectiveTaskId, { to_user_id: Number(selectedUserId), transfer_reason: transferReason });

        if (res && res.success) {
          // clear form then inform user and close transfer screen
          setIsSubmitting(false);
          resetForm();
          Alert.alert('Success', res.message || 'Task transferred successfully', [
            {
              text: 'OK',
              onPress: () => {
                // Close transfer screen
                router.back();
              },
            },
          ]);
        } else {
          const msg = res?.message || 'Failed to Transfer task';
          setIsSubmitting(false);
          Alert.alert('Error', msg);
        }
      } catch (err: any) {
        console.error('transferTask error', err);
        setIsSubmitting(false);
        Alert.alert('Error', err?.message || 'Failed to Transfer task');
      }
    } catch (error) {
      console.error('Error creating task:', error);
      Alert.alert('Error', 'Failed to Transfer task. Please try again.');
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
        <Text style={styles.headerTitle}>Transfer Task</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={insets.bottom}
        style={{ flex: 1 }}
      >
        {missingTaskId && (
          <View style={styles.banner}>
            <Text style={styles.bannerText}>
              No task context detected. Please open Transfer from a task's details to ensure the transfer applies to a specific task.
            </Text>
          </View>
        )}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
      
        
        {/* Card 3: Assign to Office/Department */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Transfer Location</Text>
          <Text style={styles.fieldLabel}>Department</Text>
          <TouchableOpacity
            style={styles.dropdownTrigger}
            onPress={() => {
              router.push({
                pathname: '/(drawer)/task-data-selection-screen',
                params: {
                  title: 'Select Department',
                  dataKey: 'departments',
                  currentValue: selectedDepartment,
                  returnTo: 'task-transfer',
                  returnField: 'selectedDepartment',
                  projectId: projectId || '',
                },
              });
            }}
            activeOpacity={0.7}
          >
            <Text style={[styles.dropdownTriggerText, !selectedDepartment && styles.placeholderText]}>
              {selectedDepartment || 'Select department'}
            </Text>
            <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <Text style={styles.fieldLabel1}>Zone</Text>
          <TouchableOpacity
            style={styles.dropdownTrigger}
            onPress={() => {
              router.push({
                pathname: '/(drawer)/task-data-selection-screen',
                params: {
                  title: 'Select Zone',
                  dataKey: 'zone',
                  currentValue: selectedZone,
                  returnTo: 'task-transfer',
                  returnField: 'selectedZone',
                  projectId: projectId || '',
                },
              });
            }}
            activeOpacity={0.7}
          >
            <Text style={[styles.dropdownTriggerText, !selectedZone && styles.placeholderText]}>
              {selectedZone || 'Select Zone'}
            </Text>
            <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>

           <Text style={styles.fieldLabel1}>Circle</Text>
          <TouchableOpacity
            style={styles.dropdownTrigger}
            onPress={() => {
              router.push({
                pathname: '/(drawer)/task-data-selection-screen',
                params: {
                  title: 'Select Circle',
                  dataKey: 'circle',
                  currentValue: selectedCircle,
                  returnTo: 'task-transfer',
                  returnField: 'selectedCircle',
                  projectId: projectId || '',
                  zoneId: selectedZoneId || '',
                },
              });
            }}
            activeOpacity={0.7}
          >
            <Text style={[styles.dropdownTriggerText, !selectedCircle && styles.placeholderText]}>
              {selectedCircle || 'Select Circle'}
            </Text>
            <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>

           <Text style={styles.fieldLabel1}>Division</Text>
          <TouchableOpacity
            style={styles.dropdownTrigger}
            onPress={() => {
              router.push({
                pathname: '/(drawer)/task-data-selection-screen',
                params: {
                  title: 'Select Division',
                  dataKey: 'division',
                  currentValue: selectedDivision,
                  returnTo: 'task-transfer',
                  returnField: 'selectedDivision',
                  projectId: projectId || '',
                  circleId: selectedCircleId || '',
                },
              });
            }}
            activeOpacity={0.7}
          >
            <Text style={[styles.dropdownTriggerText, !selectedDivision && styles.placeholderText]}>
              {selectedDivision || 'Select Division'}
            </Text>
            <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>

           <Text style={styles.fieldLabel1}>Sub-Division</Text>
          <TouchableOpacity
            style={styles.dropdownTrigger}
            onPress={() => {
              router.push({
                pathname: '/(drawer)/task-data-selection-screen',
                params: {
                  title: 'Select Sub-Division',
                  dataKey: 'subDivision',
                  currentValue: selectedSubDivision,
                  returnTo: 'task-transfer',
                  returnField: 'selectedSubDivision',
                  projectId: projectId || '',
                  divisionId: selectedDivisionId || '',
                },
              });
            }}
            activeOpacity={0.7}
          >
            <Text style={[styles.dropdownTriggerText, !selectedSubDivision && styles.placeholderText]}>
              {selectedSubDivision || 'Select Sub-Division'}
            </Text>
            <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>

           <Text style={styles.fieldLabel1}>Designation</Text>
          <TouchableOpacity
            style={styles.dropdownTrigger}
            onPress={() => {
              router.push({
                pathname: '/(drawer)/task-data-selection-screen',
                params: {
                  title: 'Select Designation',
                  dataKey: 'designation',
                  currentValue: selectedDesignation,
                  returnTo: 'task-transfer',
                  returnField: 'selectedDesignation',
                  projectId: projectId || '',
                  department: selectedDepartment || '',
                  divisionId: selectedDivisionId || '',
                  subdivisionId: selectedSubDivisionId || '',
                },
              });
            }}
            activeOpacity={0.7}
          >
            <Text style={[styles.dropdownTriggerText, !selectedDesignation && styles.placeholderText]}>
              {selectedDesignation || 'Select Designation'}
            </Text>
            <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>

           <Text style={styles.fieldLabel1}>Transfer To</Text>
          <TouchableOpacity
            style={styles.dropdownTrigger}
            onPress={() => {
              router.push({
                pathname: '/(drawer)/task-data-selection-screen',
                params: {
                  title: 'Select User',
                  dataKey: 'user',
                  currentValue: selectedUser,
                  returnTo: 'task-transfer',
                  returnField: 'selectedUser',
                  projectId: projectId || '',
                  department: selectedDepartment || '',
                  departmentId: selectedDepartmentId || '',
                  zoneId: selectedZoneId || '',
                  circleId: selectedCircleId || '',
                  divisionId: selectedDivisionId || '',
                  subdivisionId: selectedSubDivisionId || '',
                },
              });
            }}
            activeOpacity={0.7}
          >
            <Text style={[styles.dropdownTriggerText, !selectedUser && styles.placeholderText]}>
              {selectedUser || 'Select User'}
            </Text>
            <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
            {/* Transfer Reason */}
            <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel1}>Transfer Reason</Text>
                <TextInput
                style={styles.textInput}
                value={transferReason}
                onChangeText={setTransferReason}
                placeholder="(Optionl) Explain why this task is transfer"
                placeholderTextColor={COLORS.textSecondary}
                />
            </View>

        </View>
       
          
        {/* Bottom spacing for fixed button */}
        <View style={{ height: 48 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Fixed Submit Button */}
      <View style={[styles.submitButtonContainer, { bottom: insets.bottom }]}>
        <TouchableOpacity
          style={[styles.submitButton, (isSubmitting || !effectiveTaskId) && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting || !effectiveTaskId}
          activeOpacity={0.8}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Text style={styles.submitButtonText}>Transfer Task</Text>
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
  fieldLabel1: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    marginTop: 12
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
    minHeight: 100,
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
  dropdownTriggerText: {
    fontSize: 15,
    color: COLORS.text,
  },
  placeholderText: {
    color: COLORS.textSecondary,
  },
  loadingAddressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    gap: SPACING.sm,
  },
  loadingAddressText: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  adjustLocationLink: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginTop: 0,
    marginBottom: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: 6,
  },
  adjustLocationText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  submitButtonContainer: {
    position: 'absolute',
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
  // Map Modal Styles
  mapModalContainer: {
    flex: 1,
    backgroundColor: COLORS.cardBackground,
  },
  mapModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  mapModalCancel: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  mapModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  mapModalConfirm: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  locationAdjustmentContainer: {
    flex: 1,
  },
  locationAdjustmentContent: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  locationIconContainer: {
    marginVertical: SPACING.xl,
  },
  locationAdjustmentHint: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  coordinateInputContainer: {
    width: '100%',
    marginBottom: SPACING.md,
  },
  coordinateLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  coordinateInput: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.text,
  },
  refreshLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 14,
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  refreshLocationButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
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
  banner: {
    backgroundColor: '#FFF3E0',
    padding: SPACING.md,
    borderRadius: 8,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#FFCC80',
  },
  bannerText: {
    color: '#6A4E00',
    fontSize: 13,
    lineHeight: 18,
  },
});
