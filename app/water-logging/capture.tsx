/**
 * Water Logging - Capture Screen
 *
 * Comprehensive form for reporting water logging incidents with:
 * - Location & Time details
 * - Severity & Extent measurements
 * - Cause & Impact information
 * - Photo/video evidence
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

export default function CaptureWaterLoggingScreen() {
  const params = useLocalSearchParams();

  // State - Card 1: Location & Time
  const [currentDateTime] = useState(new Date().toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }));
  const [location, setLocation] = useState<LocationData | null>(null);
  const [landmark, setLandmark] = useState('');
  const [roadPlaceName, setRoadPlaceName] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedLocationType, setSelectedLocationType] = useState('');

  // State - Card 2: Severity & Extent
  const [selectedSeverity, setSelectedSeverity] = useState('');
  const [selectedAffectedArea, setSelectedAffectedArea] = useState('');
  const [maxWaterDepth, setMaxWaterDepth] = useState('');
  const [approxArea, setApproxArea] = useState('');

  // State - Card 3: Cause & Impact
  const [selectedCause, setSelectedCause] = useState('');
  const [selectedTrafficImpact, setSelectedTrafficImpact] = useState('');

  // State - Card 4: Evidence
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  // Other state
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
          Alert.alert('Permission Denied', 'Location permission is required to report water logging');
          setIsLoadingLocation(false);
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = currentLocation.coords;

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
    if (params.selectedDivision) {
      setSelectedDivision(params.selectedDivision as string);
    }
    if (params.selectedLocationType) {
      setSelectedLocationType(params.selectedLocationType as string);
    }
    if (params.selectedSeverity) {
      setSelectedSeverity(params.selectedSeverity as string);
    }
    if (params.selectedAffectedArea) {
      setSelectedAffectedArea(params.selectedAffectedArea as string);
    }
    if (params.selectedCause) {
      setSelectedCause(params.selectedCause as string);
    }
    if (params.selectedTrafficImpact) {
      setSelectedTrafficImpact(params.selectedTrafficImpact as string);
    }
  }, [
    params.selectedDivision,
    params.selectedLocationType,
    params.selectedSeverity,
    params.selectedAffectedArea,
    params.selectedCause,
    params.selectedTrafficImpact,
  ]);

  /**
   * Handles back navigation
   */
  const handleGoBack = () => {
    router.back();
  };

  /**
   * Confirms the adjusted location from the map modal
   */
  const handleConfirmLocation = async () => {
    if (tempLocation) {
      try {
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
   * Handle image/video selection
   */
  const handleAddMedia = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera roll permissions to add media');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsMultipleSelection: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const newAttachment: Attachment = {
          id: Date.now().toString(),
          uri: asset.uri,
          type: asset.type === 'video' ? 'video' : 'image',
        };
        setAttachments([...attachments, newAttachment]);
      }
    } catch (error) {
      console.error('Error picking media:', error);
      Alert.alert('Error', 'Failed to add media');
    }
  };

  /**
   * Handle attachment deletion
   */
  const handleDeleteAttachment = (id: string) => {
    Alert.alert(
      'Delete Media',
      'Are you sure you want to remove this media?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setAttachments(attachments.filter((att) => att.id !== id));
          },
        },
      ]
    );
  };

  /**
   * Handles form submission
   */
  const handleSubmit = async () => {
    // Validate required fields
    if (!location) {
      Alert.alert('Validation Error', 'Location is required');
      return;
    }

    if (!selectedSeverity) {
      Alert.alert('Validation Error', 'Severity level is required');
      return;
    }

    if (!roadPlaceName.trim()) {
      Alert.alert('Validation Error', 'Road/Place name is required');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      Alert.alert(
        'Success',
        'Water logging report submitted successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              router.back();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error submitting report:', error);
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
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
        <Text style={styles.headerTitle}>Report Water Logging</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Card 1: Location & Time */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Location & Time</Text>

          {/* Date & Time */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Date & Time</Text>
            <View style={styles.readOnlyField}>
              <Ionicons name="calendar-outline" size={18} color={COLORS.textSecondary} />
              <Text style={styles.readOnlyText}>{currentDateTime}</Text>
            </View>
          </View>

          {/* Address */}
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

          {/* Adjust Location Link */}
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

          {/* Landmark */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Landmark (Optional)</Text>
            <TextInput
              style={styles.textInput}
              value={landmark}
              onChangeText={setLandmark}
              placeholder="e.g., Near Metro Station Gate 2"
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>

          {/* Road/Place Name */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Road/Place Name</Text>
            <TextInput
              style={styles.textInput}
              value={roadPlaceName}
              onChangeText={setRoadPlaceName}
              placeholder="Enter road or place name"
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>

          {/* Division Dropdown */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Division</Text>
            <TouchableOpacity
              style={styles.dropdownTrigger}
              onPress={() => {
                router.push({
                  pathname: '/(drawer)/selection-screen',
                  params: {
                    title: 'Select Division',
                    dataKey: 'divisions',
                    currentValue: selectedDivision,
                    returnTo: '/water-logging/capture',
                    returnField: 'selectedDivision',
                  },
                });
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.dropdownText, !selectedDivision && styles.placeholderText]}>
                {selectedDivision || 'Select division'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Location Type Dropdown */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Location Type</Text>
            <TouchableOpacity
              style={styles.dropdownTrigger}
              onPress={() => {
                router.push({
                  pathname: '/(drawer)/selection-screen',
                  params: {
                    title: 'Select Location Type',
                    dataKey: 'locationTypes',
                    currentValue: selectedLocationType,
                    returnTo: '/water-logging/capture',
                    returnField: 'selectedLocationType',
                  },
                });
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.dropdownText, !selectedLocationType && styles.placeholderText]}>
                {selectedLocationType || 'Select location type'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Card 2: Severity & Extent */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Severity & Extent</Text>

          {/* Severity Dropdown */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Severity</Text>
            <TouchableOpacity
              style={styles.dropdownTrigger}
              onPress={() => {
                router.push({
                  pathname: '/(drawer)/selection-screen',
                  params: {
                    title: 'Select Severity',
                    dataKey: 'severities',
                    currentValue: selectedSeverity,
                    returnTo: '/water-logging/capture',
                    returnField: 'selectedSeverity',
                  },
                });
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.dropdownText, !selectedSeverity && styles.placeholderText]}>
                {selectedSeverity || 'Select severity level'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Side/Area Affected Dropdown */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Side/Area Affected</Text>
            <TouchableOpacity
              style={styles.dropdownTrigger}
              onPress={() => {
                router.push({
                  pathname: '/(drawer)/selection-screen',
                  params: {
                    title: 'Select Affected Area',
                    dataKey: 'affectedAreas',
                    currentValue: selectedAffectedArea,
                    returnTo: '/water-logging/capture',
                    returnField: 'selectedAffectedArea',
                  },
                });
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.dropdownText, !selectedAffectedArea && styles.placeholderText]}>
                {selectedAffectedArea || 'Select affected area'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Measurements Row */}
          <View style={styles.fieldLabel}>
            <Text style={styles.fieldLabel}>Measurements</Text>
          </View>
          <View style={styles.measurementRow}>
            <View style={styles.measurementField}>
              <Text style={styles.measurementLabel}>Max Water Depth</Text>
              <TextInput
                style={styles.measurementInput}
                value={maxWaterDepth}
                onChangeText={setMaxWaterDepth}
                placeholder="e.g., 1.5 ft"
                placeholderTextColor={COLORS.textSecondary}
                keyboardType="default"
              />
            </View>
            <View style={styles.measurementField}>
              <Text style={styles.measurementLabel}>Approx Area</Text>
              <TextInput
                style={styles.measurementInput}
                value={approxArea}
                onChangeText={setApproxArea}
                placeholder="e.g., 50 m"
                placeholderTextColor={COLORS.textSecondary}
                keyboardType="default"
              />
            </View>
          </View>
        </View>

        {/* Card 3: Cause & Impact */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Cause & Impact</Text>

          {/* Main Cause Dropdown */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Main Cause</Text>
            <TouchableOpacity
              style={styles.dropdownTrigger}
              onPress={() => {
                router.push({
                  pathname: '/(drawer)/selection-screen',
                  params: {
                    title: 'Select Cause',
                    dataKey: 'waterLoggingCauses',
                    currentValue: selectedCause,
                    returnTo: '/water-logging/capture',
                    returnField: 'selectedCause',
                  },
                });
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.dropdownText, !selectedCause && styles.placeholderText]}>
                {selectedCause || 'Select main cause'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Traffic Impact Dropdown */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Traffic Impact</Text>
            <TouchableOpacity
              style={styles.dropdownTrigger}
              onPress={() => {
                router.push({
                  pathname: '/(drawer)/selection-screen',
                  params: {
                    title: 'Select Traffic Impact',
                    dataKey: 'trafficImpacts',
                    currentValue: selectedTrafficImpact,
                    returnTo: '/water-logging/capture',
                    returnField: 'selectedTrafficImpact',
                  },
                });
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.dropdownText, !selectedTrafficImpact && styles.placeholderText]}>
                {selectedTrafficImpact || 'Select traffic impact'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Card 4: Evidence */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Photographs & Video</Text>
          <Text style={styles.cardSubtitle}>Add photos or videos of the water logging</Text>

          {/* Gallery Grid */}
          <View style={styles.gallery}>
            {attachments.map((attachment) => (
              <View key={attachment.id} style={styles.attachmentTile}>
                <Image source={{ uri: attachment.uri }} style={styles.attachmentImage} />
                {attachment.type === 'video' && (
                  <View style={styles.videoOverlay}>
                    <Ionicons name="play-circle" size={32} color={COLORS.white} />
                  </View>
                )}
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteAttachment(attachment.id)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="close-circle" size={24} color={COLORS.error} />
                </TouchableOpacity>
              </View>
            ))}

            {/* Add Media Button */}
            <TouchableOpacity
              style={styles.addMediaButton}
              onPress={handleAddMedia}
              activeOpacity={0.7}
            >
              <Ionicons name="camera-outline" size={32} color={COLORS.primary} />
              <Text style={styles.addMediaText}>Add Media</Text>
            </TouchableOpacity>
          </View>
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
            <Text style={styles.submitButtonText}>Submit Report</Text>
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
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
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
  readOnlyField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    gap: 8,
  },
  readOnlyText: {
    fontSize: 15,
    color: COLORS.text,
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
  measurementRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  measurementField: {
    flex: 1,
  },
  measurementLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  measurementInput: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.text,
  },
  gallery: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  attachmentTile: {
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  attachmentImage: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: COLORS.white,
    borderRadius: 12,
  },
  addMediaButton: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
  },
  addMediaText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: 4,
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
