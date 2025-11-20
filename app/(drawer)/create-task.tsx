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
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { COLORS, SPACING } from '@/theme';
import * as Location from 'expo-location';

// Types
interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
}

export default function CreateTaskScreen() {
  const params = useLocalSearchParams();
  const projectId = params.projectId as string;

  // State
  const [taskName, setTaskName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState<LocationData | null>(null);
  const [landmark, setLandmark] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [showMapModal, setShowMapModal] = useState(false);
  const [tempLocation, setTempLocation] = useState<LocationData | null>(null);

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
  }, [params.selectedCategory, params.selectedDepartment]);

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
  const handleSubmit = async () => {
    // Validate required fields
    if (!taskName.trim()) {
      Alert.alert('Validation Error', 'Task name is required');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Show success message
      Alert.alert('Success', 'Task created successfully!', [
        {
          text: 'OK',
          onPress: () => {
            if (projectId) {
              router.push({
                pathname: '/(drawer)/project-details',
                params: { projectId },
              });
            } else {
              router.back();
            }
          },
        },
      ]);
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

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Card 1: Task Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Task Details</Text>

          {/* Task Name */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Task Name</Text>
            <TextInput
              style={styles.textInput}
              value={taskName}
              onChangeText={setTaskName}
              placeholder="Enter task name..."
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>

          {/* Category Dropdown */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Category</Text>
            <TouchableOpacity
              style={styles.dropdownTrigger}
              onPress={() => {
                router.push({
                  pathname: '/(drawer)/selection-screen',
                  params: {
                    title: 'Select Category',
                    dataKey: 'taskCategories',
                    currentValue: selectedCategory,
                    returnTo: 'create-task',
                    returnField: 'selectedCategory',
                    projectId: projectId || '',
                  },
                });
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.dropdownText, !selectedCategory && styles.placeholderText]}>
                {selectedCategory || 'Select category'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
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
        </View>

        {/* Card 2: Task Location */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Task Location</Text>

          {/* Location/Address Field */}
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
          </View>

          {/* Tappable Link to Adjust Location */}
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
          </TouchableOpacity>

          {/* Landmark Field */}
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
        </View>

        {/* Card 3: Assign to Office/Department */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Assign to Office/Department</Text>
          <TouchableOpacity
            style={styles.dropdownTrigger}
            onPress={() => {
              router.push({
                pathname: '/(drawer)/selection-screen',
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
            <Text style={[styles.dropdownText, !selectedDepartment && styles.placeholderText]}>
              {selectedDepartment || 'Select department'}
            </Text>
            <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
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
            <Text style={styles.submitButtonText}>Create Task</Text>
          )}
        </TouchableOpacity>
      </View>

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
  dropdownText: {
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
});
