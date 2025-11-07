import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Platform,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

const COLORS = {
  background: '#F5F5F5',
  cardBackground: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#666666',
  textLight: '#9E9E9E',
  primary: '#FF9800',
  border: '#E0E0E0',
  divider: '#EEEEEE',
  disabled: '#F5F5F5',
  disabledText: '#BDBDBD',
};

// Mock hierarchical data
const MOCK_DATA = {
  circles: [
    { id: '1', name: 'North Delhi Circle' },
    { id: '2', name: 'South Delhi Circle' },
    { id: '3', name: 'East Delhi Circle' },
  ],
  divisions: {
    '1': [
      { id: '1-1', name: 'Civil Lines Division', circleId: '1' },
      { id: '1-2', name: 'Karol Bagh Division', circleId: '1' },
    ],
    '2': [
      { id: '2-1', name: 'Saket Division', circleId: '2' },
      { id: '2-2', name: 'Defence Colony Division', circleId: '2' },
    ],
    '3': [
      { id: '3-1', name: 'Patparganj Division', circleId: '3' },
      { id: '3-2', name: 'Mayur Vihar Division', circleId: '3' },
    ],
  },
  subDivisions: {
    '1-1': [
      { id: '1-1-1', name: 'SD-1 Civil Lines', divisionId: '1-1' },
      { id: '1-1-2', name: 'SD-2 Civil Lines', divisionId: '1-1' },
    ],
    '1-2': [
      { id: '1-2-1', name: 'SD-1 Karol Bagh', divisionId: '1-2' },
    ],
    '2-1': [
      { id: '2-1-1', name: 'SD-1 Saket', divisionId: '2-1' },
    ],
    '2-2': [
      { id: '2-2-1', name: 'SD-1 Defence Colony', divisionId: '2-2' },
    ],
    '3-1': [
      { id: '3-1-1', name: 'SD-1 Patparganj', divisionId: '3-1' },
      { id: '3-1-2', name: 'SD-2 Patparganj', divisionId: '3-1' },
    ],
    '3-2': [
      { id: '3-2-1', name: 'SD-1 Mayur Vihar', divisionId: '3-2' },
    ],
  },
  departments: [
    { id: 'd1', name: 'Public Works Department' },
    { id: 'd2', name: 'Water Supply' },
    { id: 'd3', name: 'Electrical Maintenance' },
    { id: 'd4', name: 'Road Maintenance' },
  ],
  designations: {
    d1: [
      { id: 'des1', name: 'Executive Engineer', departmentId: 'd1' },
      { id: 'des2', name: 'Assistant Engineer', departmentId: 'd1' },
      { id: 'des3', name: 'Junior Engineer', departmentId: 'd1' },
    ],
    d2: [
      { id: 'des4', name: 'Chief Engineer', departmentId: 'd2' },
      { id: 'des5', name: 'Senior Engineer', departmentId: 'd2' },
    ],
    d3: [
      { id: 'des6', name: 'Electrical Engineer', departmentId: 'd3' },
      { id: 'des7', name: 'Technician', departmentId: 'd3' },
    ],
    d4: [
      { id: 'des8', name: 'Road Engineer', departmentId: 'd4' },
      { id: 'des9', name: 'Supervisor', departmentId: 'd4' },
    ],
  },
  users: {
    des1: [
      { id: 'u1', name: 'Rajesh Kumar', designationId: 'des1', designation: 'Executive Engineer' },
      { id: 'u2', name: 'Priya Sharma', designationId: 'des1', designation: 'Executive Engineer' },
    ],
    des2: [
      { id: 'u3', name: 'Er Sabir Ali', designationId: 'des2', designation: 'Assistant Engineer' },
      { id: 'u4', name: 'Amit Patel', designationId: 'des2', designation: 'Assistant Engineer' },
    ],
    des3: [
      { id: 'u5', name: 'Neha Singh', designationId: 'des3', designation: 'Junior Engineer' },
    ],
    des4: [
      { id: 'u6', name: 'Suresh Reddy', designationId: 'des4', designation: 'Chief Engineer' },
    ],
    des5: [
      { id: 'u7', name: 'Kavita Desai', designationId: 'des5', designation: 'Senior Engineer' },
    ],
    des6: [
      { id: 'u8', name: 'Ravi Verma', designationId: 'des6', designation: 'Electrical Engineer' },
    ],
    des7: [
      { id: 'u9', name: 'Ankit Gupta', designationId: 'des7', designation: 'Technician' },
    ],
    des8: [
      { id: 'u10', name: 'Deepak Yadav', designationId: 'des8', designation: 'Road Engineer' },
    ],
    des9: [
      { id: 'u11', name: 'Sanjay Mishra', designationId: 'des9', designation: 'Supervisor' },
    ],
  },
};

interface Selection {
  id: string;
  name: string;
  designation?: string;
}

export default function AssignComplaintScreen() {
  const params = useLocalSearchParams();
  // const complaintId = params.complaintId as string; // Will be used for API calls

  const [circle, setCircle] = useState<Selection | null>(null);
  const [division, setDivision] = useState<Selection | null>(null);
  const [subDivision, setSubDivision] = useState<Selection | null>(null);
  const [department, setDepartment] = useState<Selection | null>(null);
  const [designation, setDesignation] = useState<Selection | null>(null);
  const [user, setUser] = useState<Selection | null>(null);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCircleSelect = () => {
    router.push({
      pathname: '/searchable-selection',
      params: {
        title: 'Select Circle',
        items: JSON.stringify(MOCK_DATA.circles),
        returnTo: 'assign-complaint',
        field: 'circle',
      },
    });
  };

  const handleDivisionSelect = () => {
    if (!circle) return;
    const divisions = (MOCK_DATA.divisions as any)[circle.id] || [];
    router.push({
      pathname: '/searchable-selection',
      params: {
        title: 'Select Division',
        items: JSON.stringify(divisions),
        returnTo: 'assign-complaint',
        field: 'division',
      },
    });
  };

  const handleSubDivisionSelect = () => {
    if (!division) return;
    const subDivisions = (MOCK_DATA.subDivisions as any)[division.id] || [];
    router.push({
      pathname: '/searchable-selection',
      params: {
        title: 'Select Sub-Division',
        items: JSON.stringify(subDivisions),
        returnTo: 'assign-complaint',
        field: 'subDivision',
      },
    });
  };

  const handleDepartmentSelect = () => {
    router.push({
      pathname: '/searchable-selection',
      params: {
        title: 'Select Department',
        items: JSON.stringify(MOCK_DATA.departments),
        returnTo: 'assign-complaint',
        field: 'department',
      },
    });
  };

  const handleDesignationSelect = () => {
    if (!department) return;
    const designations = (MOCK_DATA.designations as any)[department.id] || [];
    router.push({
      pathname: '/searchable-selection',
      params: {
        title: 'Select Designation',
        items: JSON.stringify(designations),
        returnTo: 'assign-complaint',
        field: 'designation',
      },
    });
  };

  const handleUserSelect = () => {
    if (!designation) return;
    const users = (MOCK_DATA.users as any)[designation.id] || [];
    router.push({
      pathname: '/searchable-selection',
      params: {
        title: 'Select User',
        items: JSON.stringify(users),
        returnTo: 'assign-complaint',
        field: 'user',
      },
    });
  };

  // Handle selection from searchable screen
  React.useEffect(() => {
    if (params.selectedItem) {
      const item = JSON.parse(params.selectedItem as string);
      const field = params.selectedField as string;

      switch (field) {
        case 'circle':
          setCircle(item);
          // Reset dependent fields
          setDivision(null);
          setSubDivision(null);
          setDepartment(null);
          setDesignation(null);
          setUser(null);
          break;
        case 'division':
          setDivision(item);
          setSubDivision(null);
          setDepartment(null);
          setDesignation(null);
          setUser(null);
          break;
        case 'subDivision':
          setSubDivision(item);
          setDepartment(null);
          setDesignation(null);
          setUser(null);
          break;
        case 'department':
          setDepartment(item);
          setDesignation(null);
          setUser(null);
          break;
        case 'designation':
          setDesignation(item);
          setUser(null);
          break;
        case 'user':
          setUser(item);
          break;
      }

      // Clear the params to avoid re-triggering
      router.setParams({ selectedItem: undefined, selectedField: undefined });
    }
  }, [params.selectedItem, params.selectedField]);

  const handleAssign = async () => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate API call

    // Navigate back with assignment data
    router.back();
    router.setParams({
      assignedUser: user?.name,
      assignedDesignation: user?.designation,
      showAssignmentToast: 'true',
    });
  };

  const isAssignButtonEnabled = user !== null;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.cardBackground} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.6}
        >
          <Ionicons name="arrow-back" size={28} color={COLORS.text} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Assign Complaint</Text>

        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          {/* Circle */}
          <View style={styles.field}>
            <Text style={styles.label}>Circle</Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={handleCircleSelect}
              activeOpacity={0.7}
            >
              <Text style={[styles.dropdownText, !circle && styles.placeholderText]}>
                {circle?.name || 'Select a circle'}
              </Text>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Division */}
          <View style={styles.field}>
            <Text style={styles.label}>Division</Text>
            <TouchableOpacity
              style={[styles.dropdown, !circle && styles.dropdownDisabled]}
              onPress={handleDivisionSelect}
              activeOpacity={0.7}
              disabled={!circle}
            >
              <Text
                style={[
                  styles.dropdownText,
                  !division && styles.placeholderText,
                  !circle && styles.disabledText,
                ]}
              >
                {division?.name || 'Select a division'}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={circle ? COLORS.textSecondary : COLORS.disabledText}
              />
            </TouchableOpacity>
          </View>

          {/* Sub-Division */}
          <View style={styles.field}>
            <Text style={styles.label}>Sub-Division</Text>
            <TouchableOpacity
              style={[styles.dropdown, !division && styles.dropdownDisabled]}
              onPress={handleSubDivisionSelect}
              activeOpacity={0.7}
              disabled={!division}
            >
              <Text
                style={[
                  styles.dropdownText,
                  !subDivision && styles.placeholderText,
                  !division && styles.disabledText,
                ]}
              >
                {subDivision?.name || 'Select a sub-division'}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={division ? COLORS.textSecondary : COLORS.disabledText}
              />
            </TouchableOpacity>
          </View>

          {/* Department */}
          <View style={styles.field}>
            <Text style={styles.label}>Department</Text>
            <TouchableOpacity
              style={[styles.dropdown, !subDivision && styles.dropdownDisabled]}
              onPress={handleDepartmentSelect}
              activeOpacity={0.7}
              disabled={!subDivision}
            >
              <Text
                style={[
                  styles.dropdownText,
                  !department && styles.placeholderText,
                  !subDivision && styles.disabledText,
                ]}
              >
                {department?.name || 'Select a department'}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={subDivision ? COLORS.textSecondary : COLORS.disabledText}
              />
            </TouchableOpacity>
          </View>

          {/* Designation */}
          <View style={styles.field}>
            <Text style={styles.label}>Designation</Text>
            <TouchableOpacity
              style={[styles.dropdown, !department && styles.dropdownDisabled]}
              onPress={handleDesignationSelect}
              activeOpacity={0.7}
              disabled={!department}
            >
              <Text
                style={[
                  styles.dropdownText,
                  !designation && styles.placeholderText,
                  !department && styles.disabledText,
                ]}
              >
                {designation?.name || 'Select a designation'}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={department ? COLORS.textSecondary : COLORS.disabledText}
              />
            </TouchableOpacity>
          </View>

          {/* User */}
          <View style={styles.field}>
            <Text style={styles.label}>User</Text>
            <TouchableOpacity
              style={[styles.dropdown, !designation && styles.dropdownDisabled]}
              onPress={handleUserSelect}
              activeOpacity={0.7}
              disabled={!designation}
            >
              <Text
                style={[
                  styles.dropdownText,
                  !user && styles.placeholderText,
                  !designation && styles.disabledText,
                ]}
              >
                {user?.name || 'Select a user'}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={designation ? COLORS.textSecondary : COLORS.disabledText}
              />
            </TouchableOpacity>
          </View>

          {/* Comment */}
          <View style={styles.field}>
            <Text style={styles.label}>Comment (Optional)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Add any notes or instructions..."
              placeholderTextColor={COLORS.textLight}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={comment}
              onChangeText={setComment}
            />
          </View>
        </View>

        {/* Spacer for button */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Assign Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.assignButton, !isAssignButtonEnabled && styles.assignButtonDisabled]}
          onPress={handleAssign}
          disabled={!isAssignButtonEnabled || isSubmitting}
          activeOpacity={0.8}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.assignButtonText}>Assign</Text>
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
    justifyContent: 'space-between',
    backgroundColor: COLORS.cardBackground,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
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
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  field: {
    marginBottom: 20,
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
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dropdownDisabled: {
    backgroundColor: COLORS.disabled,
    borderColor: COLORS.divider,
  },
  dropdownText: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.text,
    flex: 1,
  },
  placeholderText: {
    color: COLORS.textLight,
    fontWeight: '400',
  },
  disabledText: {
    color: COLORS.disabledText,
  },
  textInput: {
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: COLORS.text,
    minHeight: 100,
    lineHeight: 22,
  },
  bottomSpacer: {
    height: 90,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.cardBackground,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  assignButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
  },
  assignButtonDisabled: {
    backgroundColor: COLORS.disabledText,
    opacity: 0.5,
  },
  assignButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});
