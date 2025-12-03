import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

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
  
  const [complaintName, setComplaintName] = useState('');
  const [complaintNumber, setComplaintNumber] = useState('');
  const [location, setLocation] = useState('');

  const goBack = () => {
    // Simply go back to previous screen (dashboard)
    router.back();
  };

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

    // Reset fields
    setComplaintName('');
    setComplaintNumber('');
    setLocation('');

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
});
