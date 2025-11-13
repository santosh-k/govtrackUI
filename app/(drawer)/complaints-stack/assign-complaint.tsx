import React, { useState, useEffect } from 'react';
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
  Image,
  ActionSheetIOS,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import Toast from '@/components/Toast';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAssignmentOptions, selectAssignment } from '@/src/store/assignmentSlice';
import { clearSelection } from '@/src/store/selectionSlice';
import { AppDispatch, RootState } from '@/src/store';

const COLORS = {
  background: '#F5F5F5',
  cardBackground: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#666666',
  textLight: '#9E9E9E',
  primary: '#FF9800',
  success: '#4CAF50',
  border: '#E0E0E0',
  divider: '#EEEEEE',
  disabled: '#F5F5F5',
  disabledText: '#BDBDBD',
};

// Mock hierarchical data
const MOCK_DATA = {
  divisions: [
    { id: '1', name: 'Civil Lines Division' },
    { id: '2', name: 'Karol Bagh Division' },
    { id: '3', name: 'Patparganj Division' },
    { id: '4', name: 'Mayur Vihar Division' },
    { id: '5', name: 'Saket Division' },
    { id: '6', name: 'Defence Colony Division' },
  ],
  subDivisions: {
    '1': [
      { id: '1-1', name: 'SD-1 Civil Lines', divisionId: '1' },
      { id: '1-2', name: 'SD-2 Civil Lines', divisionId: '1' },
    ],
    '2': [
      { id: '2-1', name: 'SD-1 Karol Bagh', divisionId: '2' },
      { id: '2-2', name: 'SD-2 Karol Bagh', divisionId: '2' },
    ],
    '3': [
      { id: '3-1', name: 'SD-1 Patparganj', divisionId: '3' },
      { id: '3-2', name: 'SD-2 Patparganj', divisionId: '3' },
    ],
    '4': [
      { id: '4-1', name: 'SD-1 Mayur Vihar', divisionId: '4' },
    ],
    '5': [
      { id: '5-1', name: 'SD-1 Saket', divisionId: '5' },
    ],
    '6': [
      { id: '6-1', name: 'SD-1 Defence Colony', divisionId: '6' },
    ],
  },
  departments: {
    '1-1': [
      { id: 'd1', name: 'Public Works Department', subDivisionId: '1-1' },
      { id: 'd2', name: 'Water Supply', subDivisionId: '1-1' },
    ],
    '1-2': [
      { id: 'd3', name: 'Electrical Maintenance', subDivisionId: '1-2' },
    ],
    '2-1': [
      { id: 'd4', name: 'Road Maintenance', subDivisionId: '2-1' },
      { id: 'd5', name: 'Public Works Department', subDivisionId: '2-1' },
    ],
    '2-2': [
      { id: 'd6', name: 'Water Supply', subDivisionId: '2-2' },
    ],
    '3-1': [
      { id: 'd7', name: 'Public Works Department', subDivisionId: '3-1' },
    ],
    '3-2': [
      { id: 'd8', name: 'Electrical Maintenance', subDivisionId: '3-2' },
    ],
    '4-1': [
      { id: 'd9', name: 'Road Maintenance', subDivisionId: '4-1' },
    ],
    '5-1': [
      { id: 'd10', name: 'Public Works Department', subDivisionId: '5-1' },
    ],
    '6-1': [
      { id: 'd11', name: 'Water Supply', subDivisionId: '6-1' },
    ],
  },
  designations: {
    d1: [
      { id: 'des1', name: 'Executive Engineer', departmentId: 'd1' },
      { id: 'des2', name: 'Assistant Engineer', departmentId: 'd1' },
    ],
    d2: [
      { id: 'des3', name: 'Chief Engineer', departmentId: 'd2' },
    ],
    d3: [
      { id: 'des4', name: 'Electrical Engineer', departmentId: 'd3' },
    ],
    d4: [
      { id: 'des5', name: 'Road Engineer', departmentId: 'd4' },
    ],
    d5: [
      { id: 'des6', name: 'Assistant Engineer', departmentId: 'd5' },
    ],
    d6: [
      { id: 'des7', name: 'Senior Engineer', departmentId: 'd6' },
    ],
    d7: [
      { id: 'des8', name: 'Executive Engineer', departmentId: 'd7' },
    ],
    d8: [
      { id: 'des9', name: 'Technician', departmentId: 'd8' },
    ],
    d9: [
      { id: 'des10', name: 'Supervisor', departmentId: 'd9' },
    ],
    d10: [
      { id: 'des11', name: 'Junior Engineer', departmentId: 'd10' },
    ],
    d11: [
      { id: 'des12', name: 'Senior Engineer', departmentId: 'd11' },
    ],
  },
  allUsers: [
    { id: 'u1', name: 'Rajesh Kumar', designation: 'Executive Engineer' },
    { id: 'u2', name: 'Priya Sharma', designation: 'Executive Engineer' },
    { id: 'u3', name: 'Er Sabir Ali', designation: 'Assistant Engineer' },
    { id: 'u4', name: 'Amit Patel', designation: 'Assistant Engineer' },
    { id: 'u5', name: 'Neha Singh', designation: 'Junior Engineer' },
    { id: 'u6', name: 'Suresh Reddy', designation: 'Chief Engineer' },
    { id: 'u7', name: 'Kavita Desai', designation: 'Senior Engineer' },
    { id: 'u8', name: 'Ravi Verma', designation: 'Electrical Engineer' },
    { id: 'u9', name: 'Ankit Gupta', designation: 'Technician' },
    { id: 'u10', name: 'Deepak Yadav', designation: 'Road Engineer' },
    { id: 'u11', name: 'Sanjay Mishra', designation: 'Supervisor' },
    { id: 'u12', name: 'Rahul Verma', designation: 'Junior Engineer' },
  ],
};

interface Selection {
  id: string;
  name: string;
  designation?: string;
}

interface Attachment {
  uri: string;
  type: 'image' | 'video' | 'document';
  name?: string;
}

interface DropdownFieldProps {
  label: string;
  value?: string;
  placeholder: string;
  onPress: () => void;
  disabled?: boolean;
}

function DropdownField({ label, value, placeholder, onPress, disabled = false }: DropdownFieldProps) {
  return (
    <View style={styles.dropdownContainer}>
      <Text style={styles.dropdownLabel}>{label}</Text>
      <TouchableOpacity
        style={[styles.dropdownButton, disabled && styles.dropdownButtonDisabled]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.dropdownText,
            !value && styles.dropdownPlaceholder,
            disabled && styles.dropdownTextDisabled,
          ]}
        >
          {value || placeholder}
        </Text>
        <Ionicons
          name="chevron-down"
          size={20}
          color={disabled ? COLORS.disabledText : COLORS.textSecondary}
        />
      </TouchableOpacity>
    </View>
  );
}

export default function AssignComplaintScreen() {
  const params = useLocalSearchParams();
  const complaintId = params.complaintId as string;

  // Group assignment states
  const [division, setDivision] = useState<Selection | null>(null);
  const [subDivision, setSubDivision] = useState<Selection | null>(null);
  const [department, setDepartment] = useState<Selection | null>(null);
  const [designation, setDesignation] = useState<Selection | null>(null);

  // Individual user assignment state
  const [user, setUser] = useState<Selection | null>(null);

  const [comment, setComment] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const dispatch = useDispatch<AppDispatch>();
  const assignmentState = useSelector(selectAssignment);
  const optionsLoading = assignmentState?.loading;
  const divisions = assignmentState?.divisions?.length ? assignmentState.divisions : MOCK_DATA.divisions;
  const subDivisions = assignmentState?.subdivisions || [];
  const departments = assignmentState?.departments || [];
  const designations = assignmentState?.designations || [];
  const allUsers = assignmentState?.users?.length ? assignmentState.users : MOCK_DATA.allUsers;
  const selections = useSelector((state: RootState) => state.selection?.byField || {});

  // Handle selection dispatched to Redux from searchable-selection screens
  useEffect(() => {
    if (!selections) return;

    const applySelection = (fieldName: string) => {
      const sel = selections[fieldName];
      if (!sel) return;
      // Only apply if complaintId matches (or if none provided)
      if (sel.complaintId && sel.complaintId !== complaintId) return;

      const item = sel.item;
      switch (fieldName) {
        case 'division':
          setDivision(item);
          setSubDivision(null);
          setDepartment(null);
          setDesignation(null);
          break;
        case 'subDivision':
          setSubDivision(item);
          setDepartment(null);
          setDesignation(null);
          break;
        case 'department':
          setDepartment(item);
          setDesignation(null);
          break;
        case 'designation':
          setDesignation(item);
          break;
        case 'user':
          setUser(item);
          break;
      }

  // clear the selection after applying
  dispatch(clearSelection({ field: fieldName }));
    };

    // try each possible field
    ['division', 'subDivision', 'department', 'designation', 'user'].forEach(applySelection);
  }, [selections, complaintId, dispatch]);

  // Fetch assignment options on mount
  const authToken = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    // dispatch redux thunk to load options (ApiManager called inside thunk)
    // Wait for auth token to be available so ApiManager has a token to attach
    if (authToken) {
      dispatch(fetchAssignmentOptions() as any);
    }
  }, [authToken]);

  // Attachment handlers
  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleTakePhotoOrVideo = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera permission is required to take photos or videos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 0.8,
      allowsEditing: false,
      videoMaxDuration: 60,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setAttachments((prev) => [
        ...prev,
        {
          uri: asset.uri,
          type: (asset.type === 'video' ? 'video' : 'image') as 'image' | 'video',
        },
      ]);
    }
  };

  const handleChooseFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Gallery permission is required to select photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 0.8,
      allowsEditing: false,
      allowsMultipleSelection: true,
    });

    if (!result.canceled) {
      const newAttachments = result.assets.map((asset) => ({
        uri: asset.uri,
        type: (asset.type === 'video' ? 'video' : 'image') as 'image' | 'video',
      }));
      setAttachments((prev) => [...prev, ...newAttachments]);
    }
  };

  const handleChooseFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
        multiple: true,
      });

      if (!result.canceled && result.assets) {
        const newAttachments = result.assets.map((asset) => ({
          uri: asset.uri,
          type: 'document' as const,
          name: asset.name,
        }));
        setAttachments((prev) => [...prev, ...newAttachments]);
      }
    } catch {
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const showAttachmentOptions = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo or Video', 'Choose from Gallery', 'Choose File'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) handleTakePhotoOrVideo();
          else if (buttonIndex === 2) handleChooseFromGallery();
          else if (buttonIndex === 3) handleChooseFile();
        }
      );
    } else {
      Alert.alert(
        'Attach Files',
        'Choose an option',
        [
          { text: 'Take Photo or Video', onPress: handleTakePhotoOrVideo },
          { text: 'Choose from Gallery', onPress: handleChooseFromGallery },
          { text: 'Choose File', onPress: handleChooseFile },
          { text: 'Cancel', style: 'cancel' },
        ],
        { cancelable: true }
      );
    }
  };

  const handleDivisionSelect = () => {
    router.push({
      pathname: '/complaints-stack/Complaint-searchable-selection',
      params: {
        title: 'Select Division',
        items: JSON.stringify(divisions),
        field: 'division',
        complaintId: complaintId,
      },
    });
  };

  const handleSubDivisionSelect = () => {
    if (!division) return;
    const subs = subDivisions.filter((s) => Number(s.divisionId) === Number(division.id));
    router.push({
      pathname: '/complaints-stack/Complaint-searchable-selection',
      params: {
        title: 'Select Sub-Division',
        items: JSON.stringify(subs),
        field: 'subDivision',
        complaintId: complaintId,
      },
    });
  };

  const handleDepartmentSelect = () => {
    // departments may be filtered by subdivision or division if such mapping exists
    let deps: any[] = departments;
    if (subDivision && (subDivision as any).departmentId) {
      deps = departments.filter((d) => Number(d.id) === Number((subDivision as any).departmentId));
    } else if (division && (division as any).departmentId) {
      deps = departments.filter((d) => Number(d.id) === Number((division as any).departmentId));
    }
    // fallback: show all departments
    router.push({
      pathname: '/complaints-stack/Complaint-searchable-selection',
      params: {
        title: 'Select Department',
        items: JSON.stringify(deps.length ? deps : departments),
        field: 'department',
        complaintId: complaintId,
      },
    });
  };

  const handleDesignationSelect = () => {
    if (!department) return;
    const des = designations.filter((d) => Number(d.departmentId) === Number(department.id));
    router.push({
      pathname: '/complaints-stack/Complaint-searchable-selection',
      params: {
        title: 'Select Designation',
        items: JSON.stringify(des.length ? des : designations),
        field: 'designation',
        complaintId: complaintId,
      },
    });
  };

  const handleUserSelect = () => {
    // Filter users based on selected division/subDivision/department/designation
    const filtered = (allUsers as any[]).filter((u) => {
      if (division && (u as any).divisionId !== null && Number((u as any).divisionId) !== Number(division.id)) return false;
      if (subDivision && (u as any).subdivisionId !== null && Number((u as any).subdivisionId) !== Number(subDivision.id)) return false;
      if (department && (u as any).departmentId !== null && Number((u as any).departmentId) !== Number(department.id)) return false;
      if (designation && (u as any).designationId !== null && Number((u as any).designationId) !== Number(designation.id)) return false;
      return true;
    });

    router.push({
      pathname: '/complaints-stack/Complaint-searchable-selection',
      params: {
        title: 'Select User',
        items: JSON.stringify(filtered.length ? filtered : allUsers),
        field: 'user',
        complaintId: complaintId,
      },
    });
  };

  const handleAssign = async () => {
    setIsSubmitting(true);

    // Log attachments for API submission
    console.log('Assignment data:', {
      division,
      subDivision,
      department,
      designation,
      user,
      comment,
      attachments,
    });

    // Simulate assignment process
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);

    // Determine the most specific assignment target
    let assignedTo = '';
    let assignedDesignation = '';

    // Priority: User > Designation > Department > Sub-Division > Division
    if (user) {
      assignedTo = user.name;
      assignedDesignation = user.designation || '';
      setToastMessage(`Assigned to ${user.name}!`);
    } else if (designation) {
      assignedTo = designation.name;
      assignedDesignation = 'Group';
      setToastMessage(`Assigned to ${designation.name}!`);
    } else if (department) {
      assignedTo = department.name;
      assignedDesignation = 'Department';
      setToastMessage(`Assigned to ${department.name}!`);
    } else if (subDivision) {
      assignedTo = subDivision.name;
      assignedDesignation = 'Sub-Division';
      setToastMessage(`Assigned to ${subDivision.name}!`);
    } else if (division) {
      assignedTo = division.name;
      assignedDesignation = 'Division';
      setToastMessage(`Assigned to ${division.name}!`);
    }

    // Reset form after successful assignment
    setDivision(null);
    setSubDivision(null);
    setDepartment(null);
    setDesignation(null);
    setUser(null);
    setComment('');
    setAttachments([]);

    // Show success toast
    setToastVisible(true);

    // Navigate back to complaint details after a brief delay
    setTimeout(() => {
      router.replace({
        pathname: '/(drawer)/complaints-stack/complaint-details',
        params: {
          complaintId: complaintId,
          assignedUser: assignedTo,
          assignedDesignation: assignedDesignation,
          showAssignmentToast: 'true',
        },
      });
    }, 1500);
  };

  const handleBackPress = () => {
    // Navigate back to complaint details
    router.replace({
      pathname: '/(drawer)/complaints-stack/complaint-details',
      params: {
        complaintId: complaintId,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.cardBackground} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackPress}
          activeOpacity={0.6}
        >
          <Ionicons name="arrow-back" size={28} color={COLORS.text} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Assign Complaint</Text>

        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Section 1: Assign to a Group */}
        <View style={styles.card}>
          <DropdownField
            label="Division"
            value={division?.name}
            placeholder="Select a division"
            onPress={handleDivisionSelect}
          />

          <DropdownField
            label="Sub-Division"
            value={subDivision?.name}
            placeholder="Select a sub-division"
            onPress={handleSubDivisionSelect}
            disabled={!division}
          />

          <DropdownField
            label="Department"
            value={department?.name}
            placeholder="Select a department"
            onPress={handleDepartmentSelect}
            disabled={!subDivision}
          />

          <DropdownField
            label="Designation"
            value={designation?.name}
            placeholder="Select a designation"
            onPress={handleDesignationSelect}
            disabled={!department}
          />
          <Text style={styles.sectionTitle}>Assign to a Specific User</Text>
          <Text style={styles.sectionSubtitle}>
            Search and select any user directly
          </Text>

          <DropdownField
            label="User"
            value={user?.name}
            placeholder="Search for a user"
            onPress={handleUserSelect}
          />
        </View>

        

        

        {/* Comment Card */}
        <View style={styles.card}>
          <Text style={styles.commentLabel}>Comment (Optional)</Text>
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
           <Text style={styles.commentLabel}>Add Attachments (Optional)</Text>
          <TouchableOpacity
            style={styles.attachButton}
            onPress={showAttachmentOptions}
            activeOpacity={0.7}
          >
            <Ionicons name="attach" size={24} color={COLORS.textSecondary} />
            <Text style={styles.attachButtonText}>Add Photo, Video, or File</Text>
          </TouchableOpacity>

          {/* Attachment Previews */}
          {attachments.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.attachmentPreviewContainer}
            >
              {attachments.map((attachment, index) => (
                <View key={index} style={styles.attachmentPreview}>
                  {attachment.type === 'document' ? (
                    <View style={styles.documentPreview}>
                      <Ionicons name="document" size={32} color={COLORS.textSecondary} />
                      <Text
                        style={styles.documentName}
                        numberOfLines={2}
                        ellipsizeMode="middle"
                      >
                        {attachment.name || 'Document'}
                      </Text>
                    </View>
                  ) : (
                    <Image
                      source={{ uri: attachment.uri }}
                      style={styles.previewImage}
                    />
                  )}
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveAttachment(index)}
                  >
                    <Ionicons name="close-circle" size={24} color="#FF3B30" />
                  </TouchableOpacity>
                  {attachment.type === 'video' && (
                    <View style={styles.videoIndicator}>
                      <Ionicons name="play-circle" size={32} color="#FFFFFF" />
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>
          )}
        </View>
        {/* Spacer for button */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Assign Button - Always Visible */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.assignButton}
          onPress={handleAssign}
          disabled={isSubmitting}
          activeOpacity={0.8}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.assignButtonText}>Assign</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Toast Notification */}
      <Toast
        visible={toastVisible}
        message={toastMessage}
        type="success"
        onHide={() => setToastVisible(false)}
      />
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
    padding: 16,
    marginBottom: 16,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.textSecondary,
    marginBottom: 20,
    lineHeight: 20,
  },
  dropdownContainer: {
    marginBottom: 16,
  },
  dropdownLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 50,
  },
  dropdownButtonDisabled: {
    backgroundColor: COLORS.disabled,
    opacity: 0.6,
  },
  dropdownText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.text,
  },
  dropdownPlaceholder: {
    color: COLORS.textLight,
    fontWeight: '400',
  },
  dropdownTextDisabled: {
    color: COLORS.disabledText,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
    paddingHorizontal: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.divider,
  },
  dividerText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textLight,
    marginHorizontal: 16,
    letterSpacing: 1,
  },
  commentLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 10,
    marginTop: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
  assignButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  // Attachment styles
  attachButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: COLORS.cardBackground,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  attachButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  attachmentPreviewContainer: {
    gap: 12,
    marginTop: 16,
  },
  attachmentPreview: {
    width: 100,
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.background,
    position: 'relative',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  documentPreview: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  documentName: {
    fontSize: 10,
    fontWeight: '500',
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
  },
  videoIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
});
