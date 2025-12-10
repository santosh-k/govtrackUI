import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch } from '@/src/store';
import {
  fetchZones,
  fetchCircles,
  fetchDivisions,
  setSelectedZone,
  setSelectedCircle,
  setSelectedDivision,
  selectZones,
  selectCircles,
  selectDivisions,
  selectSelectedZoneId,
  selectSelectedCircleId,
  selectSelectedDivisionId,
  selectIsLoadingZones,
  selectIsLoadingCircles,
  selectIsLoadingDivisions,
  selectLocationError,
} from '@/src/store/locationSlice';

const COLORS = {
  background: '#F5F5F5',
  cardBackground: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#666666',
  textPlaceholder: '#BDBDBD',
  border: '#E0E0E0',
  primary: '#FF9800',
  inputBackground: '#F8F8F8',
};
export const extractSearchData = (text?: string): string => {
  if (!text) return "";

  return [
    text.match(/ComplaintName:\s*([^,]+)/)?.[1],
    text.match(/Complaint No:\s*([^,]+)/)?.[1],
    text.match(/Location:\s*([^,]+)/)?.[1],
  ]
    .filter(Boolean)
    .join("|");
};
export default function SearchComplaintScreen() {
    const insets = useSafeAreaInsets();
    const dispatch = useDispatch<AppDispatch>();

    // Redux selectors
    const zones = useSelector(selectZones);
    const circles = useSelector(selectCircles);
    const divisions = useSelector(selectDivisions);
    const selectedZoneId = useSelector(selectSelectedZoneId);
    const selectedCircleId = useSelector(selectSelectedCircleId);
    const selectedDivisionId = useSelector(selectSelectedDivisionId);
    const isLoadingZones = useSelector(selectIsLoadingZones);
    const isLoadingCircles = useSelector(selectIsLoadingCircles);
    const isLoadingDivisions = useSelector(selectIsLoadingDivisions);
    const locationError = useSelector(selectLocationError);

    // Local state
    const [complaintName, setComplaintName] = useState('');
    const [complaintNumber, setComplaintNumber] = useState('');
    const [location, setLocation] = useState('');
    const [selectedZoneName, setSelectedZoneName] = useState('');
    const [selectedCircleName, setSelectedCircleName] = useState('');
    const [selectedDivisionName, setSelectedDivisionName] = useState('');

    // Fetch zones on component mount
    useEffect(() => {
      dispatch(fetchZones());
    }, [dispatch]);

    // Fetch circles when zone is selected
    useEffect(() => {
      if (selectedZoneId) {
        dispatch(fetchCircles(selectedZoneId));
      }
    }, [selectedZoneId, dispatch]);

    // Fetch divisions when circle is selected
    useEffect(() => {
      if (selectedCircleId) {
        dispatch(fetchDivisions(selectedCircleId));
      }
    }, [selectedCircleId, dispatch]);

    // Update zone name when selectedZoneId changes
    useEffect(() => {
      if (selectedZoneId) {
        const zone = zones.find((z) => z.id === selectedZoneId);
        if (zone) {
          setSelectedZoneName(zone.name);
        }
      } else {
        setSelectedZoneName('');
      }
    }, [selectedZoneId, zones]);

    // Update circle name when selectedCircleId changes
    useEffect(() => {
      if (selectedCircleId) {
        const circle = circles.find((c) => c.id === selectedCircleId);
        if (circle) {
          setSelectedCircleName(circle.name);
        }
      } else {
        setSelectedCircleName('');
      }
    }, [selectedCircleId, circles]);

    // Update division name when selectedDivisionId changes
    useEffect(() => {
      if (selectedDivisionId) {
        const division = divisions.find((d) => d.id === selectedDivisionId);
        if (division) {
          setSelectedDivisionName(division.name);
        }
      } else {
        setSelectedDivisionName('');
      }
    }, [selectedDivisionId, divisions]);

  const goBack = () => {
    // Simply go back to previous screen (dashboard)
    router.back();
  };

  const handleZonePress = () => {
    if (isLoadingZones) {
      Alert.alert('Loading', 'Please wait while zones are loading...');
      return;
    }
    
    router.push({
      pathname: '/search-stack/complaint-searchable-selection',
      params: { 
        title: 'Select Zone',
        type: 'zone',
        items: JSON.stringify(zones),
        selected: selectedZoneName,
        fromSearch: 'true',
      },
    });
  };

  const handleCirclePress = () => {
    if (!selectedZoneId) {
      Alert.alert('Please select a Zone first');
      return;
    }

    if (isLoadingCircles) {
      Alert.alert('Loading', 'Please wait while circles are loading...');
      return;
    }
    
    router.push({
      pathname: '/search-stack/complaint-searchable-selection',
      params: { 
        title: 'Select Circle',
        type: 'circle',
        items: JSON.stringify(circles),
        selected: selectedCircleName,
        fromSearch: 'true',
      },
    });
  };

  const handleDivisionPress = () => {
    if (!selectedCircleId) {
      Alert.alert('Please select a Circle first');
      return;
    }

    if (isLoadingDivisions) {
      Alert.alert('Loading', 'Please wait while divisions are loading...');
      return;
    }
    
    router.push({
      pathname: '/search-stack/complaint-searchable-selection',
      params: { 
        title: 'Select Division',
        type: 'division',
        items: JSON.stringify(divisions),
        selected: selectedDivisionName,
        fromSearch: 'true',
      },
    });
  };

  // Handle selection callback from searchable-selection screen
  useEffect(() => {
    const setCallback = () => {
      global.searchSelectionCallback = (type: string, value: any) => {
        console.log('Selection Callback:', type, value);
        if (type === 'zone') {
          if (value && typeof value === 'object' && value.id) {
            console.log('Dispatching setSelectedZone with ID:', value.id);
            dispatch(setSelectedZone(Number(value.id)));
          }
        } else if (type === 'circle') {
          if (value && typeof value === 'object' && value.id) {
            console.log('Dispatching setSelectedCircle with ID:', value.id);
            dispatch(setSelectedCircle(Number(value.id)));
          }
        } else if (type === 'division') {
          if (value && typeof value === 'object' && value.id) {
            console.log('Dispatching setSelectedDivision with ID:', value.id);
            dispatch(setSelectedDivision(Number(value.id)));
          }
        }
      };
    };

    setCallback();

    return () => {
      // Cleanup callback
      delete (global as any).searchSelectionCallback;
    };
  }, [dispatch]);

  const handleFindComplaints = () => {
    const filterParts = [];
    if (complaintName) filterParts.push(`ComplaintName: ${complaintName}`);
    if (complaintNumber) filterParts.push(`Complaint No: ${complaintNumber}`);
    if (location) filterParts.push(`Location: ${location}`);

    
    let params: any = { fromDashboard: 'true' };

    if (filterParts.length > 0) {
      // At least one field filled, build search query
      const searchParts = [];
      if (complaintName) searchParts.push(complaintName);
      if (complaintNumber) searchParts.push(complaintNumber);
      if (location) searchParts.push(location);
      params.searchData = searchParts.join("|");
      params.filter = 'all';
    } else {
      // No fields filled, show all complaints for this month
      params.filter = 'all';
      params.searchData = '';
    }

    // Add zone, circle, and division IDs if selected
    if (selectedZoneId) {
      params.zoneId = selectedZoneId;
    }
    if (selectedCircleId) {
      params.circleId = selectedCircleId;
    }
    if (selectedDivisionId) {
      params.divisionId = selectedDivisionId;
    }

    // Reset fields
    setComplaintName('');
    setComplaintNumber('');
    setLocation('');
    dispatch(setSelectedZone(null));
    dispatch(setSelectedCircle(null));
    dispatch(setSelectedDivision(null));

    console.log('Find Complaints - Params:', params);
    router.push({
      pathname: '/complaints-stack/complaints-list',
      params,
    });
  };

  return (
    <SafeAreaView style={[styles.container,{
    
    }]} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={goBack}
          activeOpacity={0.6}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search Complaint</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formSection}>
          <Text style={styles.formTitle}>Enter Details</Text>
          <Text style={styles.formSubtitle}>
            Fill one or more fields to search for complaints
          </Text>

          {/* Zone Section */}
          <View style={styles.filterSection}>
            <Text style={styles.sectionTitle}>Zone</Text>
            <TouchableOpacity
              style={styles.selectionRow}
              onPress={handleZonePress}
              activeOpacity={0.7}
              disabled={isLoadingZones}
            >
              <Text style={styles.selectionLabel}>
                {selectedZoneName || 'All Zones'}
              </Text>
              {isLoadingZones ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
              )}
            </TouchableOpacity>
          </View>

          {/* Circle Section */}
          <View style={styles.filterSection}>
            <Text style={styles.sectionTitle}>Circle</Text>
            <TouchableOpacity
              style={[styles.selectionRow, !selectedZoneId && styles.disabledRow]}
              onPress={handleCirclePress}
              activeOpacity={0.7}
              disabled={!selectedZoneId || isLoadingCircles}
            >
              <Text style={[styles.selectionLabel, !selectedZoneId && styles.disabledText]}>
                {selectedCircleName || 'All Circles'}
              </Text>
              {isLoadingCircles ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
              )}
            </TouchableOpacity>
          </View>

          {/* Division Section */}
          <View style={styles.filterSection}>
            <Text style={styles.sectionTitle}>Division</Text>
            <TouchableOpacity
              style={[styles.selectionRow, !selectedCircleId && styles.disabledRow]}
              onPress={handleDivisionPress}
              activeOpacity={0.7}
              disabled={!selectedCircleId || isLoadingDivisions}
            >
              <Text style={[styles.selectionLabel, !selectedCircleId && styles.disabledText]}>
                {selectedDivisionName || 'All Divisions'}
              </Text>
              {isLoadingDivisions ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
              )}
            </TouchableOpacity>
          </View>

          {/* Error Message */}
          {locationError && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={16} color="#D32F2F" />
              <Text style={styles.errorText}>{locationError}</Text>
            </View>
          )}

          {/* TEXT INPUT 1 */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Complaint Name</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter Complaint Name"
              placeholderTextColor={COLORS.textPlaceholder}
              value={complaintName}
              onChangeText={setComplaintName}
            />
          </View>

          {/* TEXT INPUT 2 */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Complaint Number</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter Complaint Number"
              placeholderTextColor={COLORS.textPlaceholder}
              keyboardType="number-pad"
              value={complaintNumber}
              onChangeText={setComplaintNumber}
            />
          </View>

          {/* TEXT INPUT 3 */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Location</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter Location"
              placeholderTextColor={COLORS.textPlaceholder}
              value={location}
              onChangeText={setLocation}
            />
          </View>
        </View>
      </ScrollView>

      {/* Button */}
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity
          style={styles.findButton}
          onPress={handleFindComplaints}
          activeOpacity={0.8}
        >
          <Ionicons name="search" size={20} color="#FFFFFF" />
          <Text style={styles.findButtonText}>Find Complaints</Text>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
  formSection: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 24,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  textInput: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '500',
  },
  bottomButtonContainer: {
    // position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.cardBackground,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  },
  findButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  findButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 8,
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
  disabledRow: {
    opacity: 0.6,
    backgroundColor: '#FAFAFA',
  },
  selectionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    flex: 1,
  },
  disabledText: {
    color: COLORS.textPlaceholder,
  },
  errorContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 13,
    color: '#D32F2F',
    marginLeft: 8,
    flex: 1,
  },
});
