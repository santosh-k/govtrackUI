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

import React, { useState, useEffect, useCallback } from 'react';
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
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import { useFocusEffect } from '@react-navigation/native';

// Types
interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
}

export default function CreateTaskScreen() {
  const params = useLocalSearchParams();
  const projectId = params.projectId as string;
  const insets = useSafeAreaInsets();
  // State
  const [taskName, setTaskName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState<LocationData | null>(null);
  const [landmark, setLandmark] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [showMapModal, setShowMapModal] = useState(false);
  const [tempLocation, setTempLocation] = useState<LocationData | null>(null);
  const [currentTaskType, setCurrentTaskType] = useState('Standalone Task');
  const [selectedTaskType, setSelectedTaskType] = useState(currentTaskType);
  const [showTaskTypePicker, setShowTaskTypePicker] = useState(false);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedInspection, setSelectedInspection] = useState('');
  const [selectedInspectionId, setSelectedInspectionId] = useState<string | null>(null);
   const [currentPriority, setCurrentPriority] = useState('Low');
  const [selectedPriority, setSelectedPriority] = useState(currentPriority);
  const [showPriorityPicker, setShowPriorityPicker] = useState(false);
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
  const [tags, setTags] = useState('');
  

  // Date fields
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showDuePicker, setShowDuePicker] = useState(false);

   const Task_Type = [
  'Standalone Task',
  'Project Task',
  'Form Inspection',
];
 const PRIORITY = [
  'Low',
  'Medium',
  'High',
  'Urgent'
];

  // Read back selections returned from SelectionScreen / ProjectList
  useEffect(() => {
    if (params.selectedProject) {
      setSelectedProject(params.selectedProject as string);
    }
    if (params.selectedProjectId) {
      setSelectedProjectId(params.selectedProjectId as string);
    }
    if (params.selectedInspection) {
      setSelectedInspection(params.selectedInspection as string);
    }
    if (params.selectedInspectionId) {
      setSelectedInspectionId(params.selectedInspectionId as string);
    }
  }, [params.selectedProject, params.selectedProjectId, params.selectedInspection, params.selectedInspectionId]);

  /**
   * Request location permissions and get current location on mount
   */
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Location permission is required to create a task');
          setIsLoadingLocation(false);
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = currentLocation.coords;

        // Reverse geocode to get address
        const addresses = await Location.reverseGeocodeAsync({ latitude, longitude });
        const address = addresses[0]
          ? `${addresses[0].street || ''}, ${addresses[0].city || ''}, ${addresses[0].region || ''}`
          : 'Unknown Location';

        setLocation({ latitude, longitude, address });
        setTempLocation({ latitude, longitude, address });
        setIsLoadingLocation(false);
      } catch (error) {
        console.error('Error getting location:', error);
        Alert.alert('Error', 'Failed to get current location');
        setIsLoadingLocation(false);
      }
    })();
  }, []);

  /**
   * Update selected values when returning from SelectionScreen
   */
  useEffect(() => {
    if (params.selectedCategory) {
      setSelectedCategory(params.selectedCategory as string);
    }
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
   * Pre-fill form fields when coming from asset observation
   */
  useEffect(() => {
    if (params.assetName) {
      // Pre-fill task name with asset name if provided
      setTaskName(`Task for ${params.assetName as string}`);
    }
    if (params.observation) {
      // Pre-fill description with observation text
      setDescription(params.observation as string);
    }
  }, [params.assetName, params.observation]);

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
   * Confirms the adjusted location from the map modal
   */
  const handleConfirmLocation = async () => {
    if (tempLocation) {
      try {
        // Reverse geocode the new coordinates
        const addresses = await Location.reverseGeocodeAsync({
          latitude: tempLocation.latitude,
          longitude: tempLocation.longitude,
        });
        const address = addresses[0]
          ? `${addresses[0].street || ''}, ${addresses[0].city || ''}, ${addresses[0].region || ''}`
          : 'Unknown Location';

        setLocation({
          latitude: tempLocation.latitude,
          longitude: tempLocation.longitude,
          address,
        });
        setShowMapModal(false);
      } catch (error) {
        console.error('Error reverse geocoding:', error);
        Alert.alert('Error', 'Failed to get address for selected location');
      }
    }
  };

  /**
   * Handles form submission
   */
  const resetForm = () => {
    setTaskName('');
    setSelectedCategory('');
    setDescription('');
    setLocation(null);
    setLandmark('');
    setSelectedDepartment('');
    setSelectedDepartmentId(null);
    setCurrentTaskType('Standalone Task');
    setSelectedTaskType('Standalone Task');
    setSelectedProject('');
    setSelectedProjectId(null);
    setSelectedInspection('');
    setSelectedInspectionId(null);
    setCurrentPriority('Low');
    setSelectedPriority('Low');
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
    setTags('');
    setStartDate(null);
    setDueDate(null);
    setShowStartPicker(false);
    setShowDuePicker(false);
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!selectedTaskType || selectedTaskType.trim() === '') {
      Alert.alert('Validation Error', 'Please select a Task Type');
      return;
    }

    if (!taskName.trim()) {
      Alert.alert('Validation Error', 'Task name is required');
      return;
    }

    // Validate project/inspection selection more strictly using returned IDs when available
    if (selectedTaskType === 'Project Task' && !selectedProjectId && !selectedProject) {
      Alert.alert('Validation Error', 'Please select a Project for Project Task');
      return;
    }

    if (selectedTaskType === 'Form Inspection' && !selectedInspectionId && !selectedInspection) {
      Alert.alert('Validation Error', 'Please select an Inspection for Form Inspection');
      return;
    }

    // Validate assignment location: at least one of department/zone/circle/division/subDivision/designation/user
    const hasAssignment = !!(
      selectedDepartmentId || selectedZoneId || selectedCircleId || selectedDivisionId || selectedSubDivisionId || selectedDesignationId || selectedUserId ||
      selectedDepartment || selectedZone || selectedCircle || selectedDivision || selectedSubDivision || selectedDesignation || selectedUser
    );

    if (!hasAssignment) {
      Alert.alert('Validation Error', 'Please select at least one Assignment Location (Department, Zone, Circle, Division, Sub-Division, Designation or User)');
      return;
    }

    setIsSubmitting(true);

    try {
      // Validate dates if provided
      if (startDate && dueDate && moment(dueDate).isBefore(startDate, 'day')) {
        Alert.alert('Validation Error', 'Due date cannot be earlier than start date');
        setIsSubmitting(false);
        return;
      }

      // Build payload (map to API fields)
      const mapTaskType = (type: string | null | undefined) => {
        if (!type) return undefined;
        if (type === 'Standalone Task') return 'STANDALONE';
        if (type === 'Project Task') return 'PROJECT';
        if (type === 'Form Inspection') return 'INSPECTION';
        return undefined;
      };

      const mapPriority = (type: string | null | undefined) => {
        if (!type) return undefined;
        if (type === 'Low') return 'LOW';
        if (type === 'Medium') return 'MEDIUM';
        if (type === 'High') return 'HIGH';
        if (type === 'Urgent') return 'URGENT';
        return undefined;
      };

      const payload: any = {
        title: taskName.trim(),
        description: description || undefined,
        task_type: mapTaskType(selectedTaskType),
        priority: mapPriority(selectedPriority),
        status: 'PENDING',
        start_date: startDate ? moment(startDate).format('YYYY-MM-DD') : undefined,
        due_date: dueDate ? moment(dueDate).format('YYYY-MM-DD') : undefined,
        tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : undefined,
      };

      // Attach project / inspection IDs when available
      if (selectedProjectId) {
        payload.project_id = Number(selectedProjectId);
      } else if (selectedProject) {
        // fallback: we only have name, not ID
        // optionally map project name, but API expects id — warn in console
        console.warn('Project selected without id; consider selecting project from list to get id');
      }

      if (selectedInspectionId) {
        // API sample uses source_type/source_id for inspections — map if desired
        payload.source_type = 'inspection';
        payload.source_id = Number(selectedInspectionId);
      }

      // Assignment fields (use IDs when available)
      if (selectedUserId) payload.assigned_to = Number(selectedUserId);
      if (selectedDesignationId) payload.designation_id = Number(selectedDesignationId);
      if (selectedDepartmentId) payload.assign_department_id = Number(selectedDepartmentId);
      if (selectedZoneId) payload.assign_zone_id = Number(selectedZoneId);
      if (selectedCircleId) payload.assign_circle_id = Number(selectedCircleId);
      if (selectedDivisionId) payload.assign_division_id = Number(selectedDivisionId);
      if (selectedSubDivisionId) payload.assign_sub_division_id = Number(selectedSubDivisionId);

      // Call createTask API
      console.log('Submitting task payload:', payload);
      try {
        const ApiManagerModule = await import('@/src/services/ApiManager');
        const ApiManager = ApiManagerModule.default;
        const api = ApiManager.getInstance();
        const res = await api.createTask(payload);

        if (res && res.success) {
          // clear form then inform user and navigate back
          setIsSubmitting(false);
          resetForm();
          Alert.alert('Success', res.message || 'Task created successfully!', [
            {
              text: 'OK',
              onPress: () => {
                // Navigate back to project details if we have projectId else go back
                if (projectId) {
                  router.push({ pathname: '/(drawer)/project-details', params: { projectId } });
                } else {
                  router.back();
                }
              },
            },
          ]);
        } else {
          const msg = res?.message || 'Failed to create task';
          setIsSubmitting(false);
          Alert.alert('Error', msg);
        }
      } catch (err: any) {
        console.error('createTask error', err);
        setIsSubmitting(false);
        Alert.alert('Error', err?.message || 'Failed to create task');
      }
    } catch (error) {
      console.error('Error creating task:', error);
      Alert.alert('Error', 'Failed to create task. Please try again.');
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
        <Text style={styles.headerTitle}>Create Task</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={insets.bottom}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
        {/* Card 1: Task Details */}
         <View style={styles.card}>
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

            {/* Task Type Options */}
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
          {/* Select Project / Inspection (dynamic based on Task Type) */}
          {selectedTaskType !== 'Standalone Task' && (
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>{selectedTaskType === 'Project Task' ? 'Project' : 'Inspection'}</Text>
              <TouchableOpacity
                style={styles.dropdownTrigger}
                onPress={() => {
                  if (selectedTaskType === 'Project Task') {
                    // Open project list in picker mode (returns selected project back to this screen)
                    router.push({
                      pathname: '/(drawer)/task-data-selection-screen',
                     params: {
                        title: 'Select Projects',
                        dataKey: 'taskProjects',
                        currentValue: selectedProject,
                        returnTo: 'create-task',
                        returnField: 'selectedProject',
                      },
                    });
                  } else if (selectedTaskType === 'Form Inspection') {
                    // Use selection-screen for inspections (falls back to taskCategories for now)
                    router.push({
                      pathname: '/(drawer)/task-data-selection-screen',
                      params: {
                        title: 'Select Inspection',
                        dataKey: 'taskInspections',
                        currentValue: selectedInspection,
                        returnTo: 'create-task',
                        returnField: 'selectedInspection',
                      },
                    });
                  }
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.dropdownTriggerText, !(selectedTaskType === 'Project Task' ? selectedProject : selectedInspection) && styles.placeholderText]}>
                  {(selectedTaskType === 'Project Task' ? selectedProject : selectedInspection) || (selectedTaskType === 'Project Task' ? 'Select Project' : 'Select Inspection')}
                </Text>
                <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
          )}

            {/* Task Name */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Task Title</Text>
              <TextInput
                style={styles.textInput}
                value={taskName}
                onChangeText={setTaskName}
                placeholder="Enter task name..."
                placeholderTextColor={COLORS.textSecondary}
              />
            </View>

          

            {/* Task Description */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Task Description (Optional)</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Enter task description..."
                placeholderTextColor={COLORS.textSecondary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
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
                      selectedTaskType === priority && styles.statusOptionSelected,
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

            {/* Start Date & Due Date */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel1}>Start Date</Text>
              <TouchableOpacity
                style={styles.dropdownTrigger}
                onPress={() => setShowStartPicker(true)}
                activeOpacity={0.7}
              >
                <Text style={[styles.dropdownTriggerText, !startDate && styles.placeholderText]}>
                  {startDate ? moment(startDate).format('DD MMM YYYY') : 'Select start date'}
                </Text>
                <Ionicons name="calendar" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Due Date</Text>
              <TouchableOpacity
                style={styles.dropdownTrigger}
                onPress={() => setShowDuePicker(true)}
                activeOpacity={0.7}
              >
                <Text style={[styles.dropdownTriggerText, !dueDate && styles.placeholderText]}>
                  {dueDate ? moment(dueDate).format('DD MMM YYYY') : 'Select due date'}
                </Text>
                <Ionicons name="calendar" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        {/* Card 2: Task Location 
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Task Location</Text> */}

          {/* Location/Address Field 
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Address</Text>
            {isLoadingLocation ? (
              <View style={styles.loadingAddressContainer}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.loadingAddressText}>Getting your location...</Text>
              </View>
            ) : (
              <TextInput
                style={styles.textInput}
                value={location?.address || ''}
                editable={false}
                placeholder="Address will appear here"
                placeholderTextColor={COLORS.textSecondary}
              />
            )}
          </View> */}

          {/* Tappable Link to Adjust Location 
          <TouchableOpacity
            style={styles.adjustLocationLink}
            onPress={() => {
              if (location) {
                setTempLocation(location);
                setShowMapModal(true);
              } else {
                Alert.alert('Location Unavailable', 'Please wait for location to be detected');
              }
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="location" size={18} color={COLORS.primary} />
            <Text style={styles.adjustLocationText}>Tap to adjust location on map</Text>
          </TouchableOpacity> */}

          {/* Landmark Field 
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Landmark (Optional)</Text>
            <TextInput
              style={styles.textInput}
              value={landmark}
              onChangeText={setLandmark}
              placeholder="e.g., Opposite the main gate"
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>
        </View> */}

        {/* Card 3: Assign to Office/Department */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Assignment Location</Text>
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
                  returnTo: 'create-task',
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
                  returnTo: 'create-task',
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
                  returnTo: 'create-task',
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
                  returnTo: 'create-task',
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
                  returnTo: 'create-task',
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
                  returnTo: 'create-task',
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

           <Text style={styles.fieldLabel1}>User</Text>
          <TouchableOpacity
            style={styles.dropdownTrigger}
            onPress={() => {
              router.push({
                pathname: '/(drawer)/task-data-selection-screen',
                params: {
                  title: 'Select User',
                  dataKey: 'user',
                  currentValue: selectedUser,
                  returnTo: 'create-task',
                  returnField: 'selectedUser',
                  projectId: projectId || '',
                  department: selectedDepartment || '',
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

          {/* Tag Name */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel1}>Tag's</Text>
              <TextInput
                style={styles.textInput}
                value={tags}
                onChangeText={setTags}
                placeholder="Enter comma seperated tag"
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
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
          activeOpacity={0.8}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Text style={styles.submitButtonText}>Create Task</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Date Pickers (rendered when requested) */}
      {showStartPicker && (
        <DateTimePicker
          value={startDate || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selected) => {
            setShowStartPicker(Platform.OS === 'ios');
            if (selected) setStartDate(selected);
          }}
        />
      )}

      {showDuePicker && (
        <DateTimePicker
          value={dueDate || (startDate || new Date())}
          minimumDate={startDate || undefined}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selected) => {
            setShowDuePicker(Platform.OS === 'ios');
            if (selected) setDueDate(selected);
          }}
        />
      )}

      {/* Location Adjustment Modal */}
      <Modal visible={showMapModal} animationType="slide" onRequestClose={() => setShowMapModal(false)}>
        <SafeAreaView style={styles.mapModalContainer}>
          {/* Modal Header */}
          <View style={styles.mapModalHeader}>
            <TouchableOpacity onPress={() => setShowMapModal(false)} activeOpacity={0.7}>
              <Text style={styles.mapModalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.mapModalTitle}>Adjust Location</Text>
            <TouchableOpacity onPress={handleConfirmLocation} activeOpacity={0.7}>
              <Text style={styles.mapModalConfirm}>Confirm</Text>
            </TouchableOpacity>
          </View>

          {/* Location Adjustment UI */}
          {tempLocation && (
            <ScrollView style={styles.locationAdjustmentContainer} contentContainerStyle={styles.locationAdjustmentContent}>
              <View style={styles.locationIconContainer}>
                <Ionicons name="location" size={100} color={COLORS.primary} />
              </View>

              <Text style={styles.locationAdjustmentHint}>
                Current location coordinates. You can manually adjust them if needed.
              </Text>

              <View style={styles.coordinateInputContainer}>
                <Text style={styles.coordinateLabel}>Latitude</Text>
                <TextInput
                  style={styles.coordinateInput}
                  value={tempLocation.latitude.toString()}
                  onChangeText={(text) => {
                    const lat = parseFloat(text);
                    if (!isNaN(lat)) {
                      setTempLocation({ ...tempLocation, latitude: lat });
                    }
                  }}
                  keyboardType="numeric"
                  placeholder="Latitude"
                />
              </View>

              <View style={styles.coordinateInputContainer}>
                <Text style={styles.coordinateLabel}>Longitude</Text>
                <TextInput
                  style={styles.coordinateInput}
                  value={tempLocation.longitude.toString()}
                  onChangeText={(text) => {
                    const lng = parseFloat(text);
                    if (!isNaN(lng)) {
                      setTempLocation({ ...tempLocation, longitude: lng });
                    }
                  }}
                  keyboardType="numeric"
                  placeholder="Longitude"
                />
              </View>

              <TouchableOpacity
                style={styles.refreshLocationButton}
                onPress={async () => {
                  try {
                    const currentLocation = await Location.getCurrentPositionAsync({});
                    const { latitude, longitude } = currentLocation.coords;
                    setTempLocation({ ...tempLocation, latitude, longitude });
                  } catch {
                    Alert.alert('Error', 'Failed to get current location');
                  }
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="refresh" size={20} color={COLORS.white} />
                <Text style={styles.refreshLocationButtonText}>Refresh to Current Location</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>
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
});
