/**
 * Create Complaint Screen
 *
 * A comprehensive complaint creation screen with card-based layout:
 * - Add Attachments (Optional)
 * - Complaint Location with Map
 * - Complaint Details with Type Selection
 * - Assign Department
 *
 * Features:
 * - Image/video attachment support
 * - Interactive map with location selection
 * - Radio button complaint type selection
 * - Searchable department dropdown
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
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { COLORS, SPACING } from '@/theme';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

// Types
interface Attachment {
  id: string;
  uri: string;
  type: 'image' | 'video';
}

interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
}

type ComplaintType =
  | 'Material Quality Issue'
  | 'Safety Violation'
  | 'Work Delay'
  | 'Equipment Failure'
  | 'Contract Violation'
  | '';

const COMPLAINT_TYPES: ComplaintType[] = [
  'Material Quality Issue',
  'Safety Violation',
  'Work Delay',
  'Equipment Failure',
  'Contract Violation',
];

const DEPARTMENTS = [
  'Engineering',
  'Quality Control',
  'Safety',
  'Procurement',
  'Construction',
  'Project Management',
  'Administration',
];

export default function CreateComplaintScreen() {
  const params = useLocalSearchParams();
  const projectId = params.projectId as string;

  // State
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [landmark, setLandmark] = useState('');
  const [selectedType, setSelectedType] = useState<ComplaintType>('');
  const [description, setDescription] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [showMapModal, setShowMapModal] = useState(false);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [departmentSearch, setDepartmentSearch] = useState('');
  const [tempLocation, setTempLocation] = useState<LocationData | null>(null);

  /**
   * Request location permissions and get current location on mount
   */
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Location permission is required to create a complaint');
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
   * Handles map location confirmation
   */
  const handleConfirmLocation = async () => {
    if (tempLocation) {
      // Reverse geocode to get updated address
      try {
        const addresses = await Location.reverseGeocodeAsync({
          latitude: tempLocation.latitude,
          longitude: tempLocation.longitude,
        });
        const address = addresses[0]
          ? `${addresses[0].street || ''}, ${addresses[0].city || ''}, ${addresses[0].region || ''}`
          : 'Unknown Location';

        setLocation({ ...tempLocation, address });
        setShowMapModal(false);
      } catch (error) {
        console.error('Error reverse geocoding:', error);
        setLocation(tempLocation);
        setShowMapModal(false);
      }
    }
  };

  /**
   * Filters departments based on search query
   */
  const getFilteredDepartments = () => {
    if (!departmentSearch.trim()) return DEPARTMENTS;
    return DEPARTMENTS.filter((dept) =>
      dept.toLowerCase().includes(departmentSearch.toLowerCase())
    );
  };

  /**
   * Validates and submits the complaint
   */
  const handleSubmit = async () => {
    // Validation
    if (!location) {
      Alert.alert('Required Field', 'Please select a location for the complaint');
      return;
    }

    if (!selectedType) {
      Alert.alert('Required Field', 'Please select a complaint type');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Required Field', 'Please provide a description');
      return;
    }

    // Simulate submission
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);

      // Navigate back to Project Details
      router.push({
        pathname: '/(drawer)/project-details',
        params: { projectId },
      });

      // Show success message
      setTimeout(() => {
        Alert.alert('Success', 'Complaint submitted successfully!');
      }, 300);
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.cardBackground} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack} activeOpacity={0.6}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Complaint</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Card 1: Complaint Details (WHAT) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Select Complaint Type</Text>

          {/* Complaint Type Radio List */}
          <View style={styles.radioList}>
            {COMPLAINT_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={styles.radioOption}
                onPress={() => setSelectedType(type)}
                activeOpacity={0.7}
              >
                <View style={styles.radioButton}>
                  {selectedType === type && <View style={styles.radioButtonInner} />}
                </View>
                <Text style={styles.radioText}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Description */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Description *</Text>
            <TextInput
              style={styles.textArea}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe the complaint in detail..."
              placeholderTextColor={COLORS.textSecondary}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>

          {/* Compact Attachment Row */}
          <View style={styles.compactAttachmentRow}>
            <Text style={styles.compactAttachmentLabel}>Add Photo or Video (Optional)</Text>
            <TouchableOpacity
              style={styles.compactAddButton}
              onPress={handleAddAttachment}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>

          {/* Dynamic Thumbnail Gallery */}
          {attachments.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.compactAttachmentsScrollView}
              contentContainerStyle={styles.compactAttachmentsScrollContent}
            >
              {attachments.map((att) => (
                <View key={att.id} style={styles.attachmentItem}>
                  <Image source={{ uri: att.uri }} style={styles.attachmentThumb} />
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
            </ScrollView>
          )}
        </View>

        {/* Card 2: Complaint Location (WHERE) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Complaint Location</Text>

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

        {/* Card 3: Assign Department (WHO) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Assign to Department</Text>
          <TouchableOpacity
            style={styles.dropdownTrigger}
            onPress={() => setShowDepartmentModal(true)}
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
            <Text style={styles.submitButtonText}>Submit Complaint</Text>
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

      {/* Department Selection Modal */}
      <Modal
        visible={showDepartmentModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDepartmentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.departmentModal}>
            {/* Modal Header */}
            <View style={styles.departmentModalHeader}>
              <Text style={styles.departmentModalTitle}>Select Department</Text>
              <TouchableOpacity onPress={() => setShowDepartmentModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color={COLORS.textSecondary} />
              <TextInput
                style={styles.searchInput}
                value={departmentSearch}
                onChangeText={setDepartmentSearch}
                placeholder="Search departments..."
                placeholderTextColor={COLORS.textSecondary}
              />
            </View>

            {/* Department List */}
            <ScrollView style={styles.departmentList}>
              {getFilteredDepartments().map((dept) => (
                <TouchableOpacity
                  key={dept}
                  style={styles.departmentOption}
                  onPress={() => {
                    setSelectedDepartment(dept);
                    setShowDepartmentModal(false);
                    setDepartmentSearch('');
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.departmentOptionText}>{dept}</Text>
                  {selectedDepartment === dept && (
                    <Ionicons name="checkmark" size={20} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
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
  scrollContent: {
    paddingVertical: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.cardBackground,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    borderRadius: 12,
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
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  // Location Card Styles
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
    marginBottom: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: 6,
  },
  adjustLocationText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  // Compact Attachment Styles
  compactAttachmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  compactAttachmentLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  compactAddButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactAttachmentsScrollView: {
    marginTop: SPACING.md,
  },
  compactAttachmentsScrollContent: {
    gap: SPACING.sm,
  },
  attachmentItem: {
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
  },
  attachmentThumb: {
    width: '100%',
    height: '100%',
  },
  videoIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -10,
    marginTop: -10,
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: COLORS.white,
    borderRadius: 12,
  },
  fieldContainer: {
    marginBottom: SPACING.md,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
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
  radioList: {
    marginBottom: SPACING.md,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: SPACING.sm,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  radioText: {
    fontSize: 15,
    color: COLORS.text,
    flex: 1,
  },
  textArea: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.text,
    minHeight: 120,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background,
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
    fontWeight: '700',
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
    fontWeight: '600',
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
    paddingHorizontal: SPACING.lg,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  refreshLocationButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  departmentModal: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    width: '100%',
    maxHeight: '70%',
    overflow: 'hidden',
  },
  departmentModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  departmentModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  departmentList: {
    maxHeight: 400,
  },
  departmentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  departmentOptionText: {
    fontSize: 15,
    color: COLORS.text,
  },
});
