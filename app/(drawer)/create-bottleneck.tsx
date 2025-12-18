/**
 * Add Bottleneck Screen
 *
 * A comprehensive bottleneck reporting screen with card-based layout:
 * - Issue Details (type, description)
 * - Add Attachments (Optional) with gallery-style component
 *
 * Features:
 * - Searchable issue type dropdown using global SelectionScreen
 * - Gallery-style attachment component (reused from Create Complaint)
 * - Form validation and submission
 *
 * @screen
 */

import React, {useState, useEffect} from 'react';
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
  Image,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {router, useLocalSearchParams} from 'expo-router';
import {COLORS, SPACING} from '@/theme';
import * as ImagePicker from 'expo-image-picker';
import {SafeAreaView} from 'react-native-safe-area-context';
import {store} from '@/src/store';

// Types
interface Attachment {
  id: string;
  uri: string;
  type: 'image' | 'video';
}

export default function CreateBottleneckScreen() {
  const params = useLocalSearchParams();
  const projectId = params.projectId as string;
  const returnTab = params.returnTab as string;

  // State
  const [selectedIssueType, setSelectedIssueType] = useState('');
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Update selected issue type when returning from SelectionScreen
   */
  useEffect(() => {
    if (params.selectedIssueType) {
      setSelectedIssueType(params.selectedIssueType as string);
    }
  }, [params.selectedIssueType]);

  console.log('params.selectedIssueType1212', params.selectedIssueType);

  /**
   * Handles back navigation
   */
  const handleGoBack = () => {
    if (projectId) {
      router.push({
        pathname: '/(drawer)/project-details',
        params: {
          projectId,
          ...(returnTab && {activeTab: returnTab}),
        },
      });
    } else {
      router.back();
    }
  };

  /**
   * Handles attachment selection
   */

  console.log('attachments21222', attachments);

  // const handleAddAttachment = () => {
  //   Alert.alert('Add Attachment', 'Choose an option', [
  //     {
  //       text: 'Take Photo',
  //       onPress: async () => {
  //         const {status} = await ImagePicker.requestCameraPermissionsAsync();
  //         if (status !== 'granted') {
  //           Alert.alert('Permission needed', 'Camera permission is required');
  //           return;
  //         }

  //         const result = await ImagePicker.launchCameraAsync({
  //           mediaTypes: ImagePicker.MediaTypeOptions.Images,
  //           allowsEditing: false,
  //           quality: 0.8,
  //         });

  //         if (!result.canceled && result.assets[0]) {
  //           const newAttachment: Attachment = {
  //             id: `attach-${Date.now()}`,
  //             uri: result.assets[0].uri,
  //             type: 'image',
  //           };
  //           setAttachments([...attachments, newAttachment]);
  //         }
  //       },
  //     },
  //     {
  //       text: 'Choose from Gallery',
  //       onPress: async () => {
  //         const {status} =
  //           await ImagePicker.requestMediaLibraryPermissionsAsync();
  //         if (status !== 'granted') {
  //           Alert.alert('Permission needed', 'Gallery permission is required');
  //           return;
  //         }

  //         const result = await ImagePicker.launchImageLibraryAsync({
  //           mediaTypes: ImagePicker.MediaTypeOptions.All,
  //           allowsEditing: false,
  //           quality: 0.8,
  //         });

  //         if (!result.canceled && result.assets[0]) {
  //           const newAttachment: Attachment = {
  //             id: `attach-${Date.now()}`,
  //             uri: result.assets[0].uri,
  //             type: result.assets[0].type === 'video' ? 'video' : 'image',
  //           };
  //           setAttachments([...attachments, newAttachment]);
  //         }
  //       },
  //     },
  //     {text: 'Cancel', style: 'cancel'},
  //   ]);
  // };

  const handleAddAttachment = () => {
    if (attachments.length >= 5) {
      Alert.alert('Limit Reached', 'You can add only up to 5 images.');
      return;
    }

    Alert.alert('Add Attachment', 'Choose an option', [
      {
        text: 'Take Photo',
        onPress: async () => {
          if (attachments.length >= 5) {
            Alert.alert('Limit Reached', 'You can add only up to 5 images.');
            return;
          }

          const {status} = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Permission needed', 'Camera permission is required');
            return;
          }

          const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images, // 👈 only images
            allowsEditing: false,
            quality: 0.8,
          });

          if (!result.canceled && result.assets[0]) {
            const newAttachment: Attachment = {
              id: result.assets[0].fileName,
              uri: result.assets[0].uri,
              type: result.assets[0].mimeType, // 👈 image only
            };
            setAttachments([...attachments, newAttachment]);
          }
        },
      },

      {
        text: 'Choose from Gallery',
        onPress: async () => {
          if (attachments.length >= 5) {
            Alert.alert('Limit Reached', 'You can add only up to 5 images.');
            return;
          }

          const {status} =
            await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Permission needed', 'Gallery permission is required');
            return;
          }

          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images, // 👈 only images
            allowsEditing: false,
            quality: 0.8,
          });

          if (!result.canceled && result.assets[0]) {
            console.log('result1111', result);

            const newAttachment: Attachment = {
              id: result.assets[0].fileName,
              uri: result.assets[0].uri,
              type: result.assets[0].mimeType, // 👈 image only
            };
            setAttachments([...attachments, newAttachment]);
          }
        },
      },

      {text: 'Cancel', style: 'cancel'},
    ]);
  };
  /**
   * Removes an attachment
   */
  const removeAttachment = (id: string) => {
    setAttachments(attachments.filter(att => att.id !== id));
  };

  /**
   * Handles form submission
   */
  const handleSubmit = async () => {
    // Validate required fields
    if (!selectedIssueType) {
      Alert.alert('Validation Error', 'Please select an issue type');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Validation Error', 'Description is required');
      return;
    }

    setIsSubmitting(true);

    // try {
    //   // Simulate API call
    //   await new Promise(resolve => setTimeout(resolve, 1500));

    //   <

    //   return
    //   // Show success message and navigate back to Project Details with Bottlenecks tab active
    //   Alert.alert('Success', 'Bottleneck reported successfully!', [
    //     {
    //       text: 'OK',
    //       onPress: () => {
    //         if (projectId) {
    //           router.push({
    //             pathname: '/(drawer)/project-details',
    //             params: {
    //               projectId,
    //               activeTab: 'Bottlenecks',
    //             },
    //           });
    //         } else {
    //           router.back();
    //         }
    //       },
    //     },
    //   ]);
    // } catch (error) {
    //   console.error('Error creating bottleneck:', error);
    //   Alert.alert('Error', 'Failed to report bottleneck. Please try again.');
    // } finally {
    //   setIsSubmitting(false);
    // }

    const payload: any = {
      severity: selectedIssueType.toLowerCase(),
      description: description || undefined,
      issue_images: attachments[0]?.uri,
      //  task_type: mapTaskType(selectedTaskType),
      //  priority: mapPriority(selectedPriority),
      //  status: 'PENDING',
      //  start_date: startDate ? moment(startDate).format('YYYY-MM-DD') : undefined,
      //  due_date: dueDate ? moment(dueDate).format('YYYY-MM-DD') : undefined,
      //  tags: tags
      //    ? tags
      //        .split(',')
      //        .map(t => t.trim())
      //        .filter(Boolean)
      //    : undefined,
    };

    // try {
    //   const ApiManagerModule = await import('@/src/services/ApiManager');
    //   const ApiManager = ApiManagerModule.default;
    //   const api = ApiManager.getInstance();
    //   const res = await api.createBottleNeck(payload, projectId);

    //   if (res && res.success) {
    //     console.log('dsddddd', res);

    //     // clear form then inform user and navigate back
    //     setIsSubmitting(false);
    //     setSelectedIssueType('');
    //     setDescription('');
    //     // resetForm();
    //     Alert.alert(
    //       'Success',
    //       res.message || 'Bottleneck created successfully!',
    //       [
    //         {
    //           text: 'OK',
    //           onPress: () => {
    //             // Navigate back to project details if we have projectId else go back
    //             if (projectId) {
    //               router.push({
    //                 pathname: '/(drawer)/project-details',
    //                 params: {
    //                   projectId,
    //                   activeTab: 'Bottlenecks',
    //                 },
    //               });
    //             } else {
    //               router.back();
    //             }
    //           },
    //         },
    //       ],
    //     );
    //   } else {
    //     const msg = res?.message || 'Failed to create bottleneck';
    //     setIsSubmitting(false);
    //     Alert.alert('Error', msg);
    //   }
    // } catch (error) {
    //   console.error('Error creating bottleneck:', error);
    //   Alert.alert('Error', 'Failed to report bottleneck. Please try again.');
    // } finally {
    //   setIsSubmitting(false);
    // }
    const token = store.getState().auth.token;

    try {
      const formData = new FormData();

      formData.append('severity', selectedIssueType?.toLowerCase());
      formData.append('description', description?.trim());

      // Multiple images (React Native format)
      // formData.append('issue_images', {
      //   uri: attachments[0]?.uri,
      //   type: 'image/png',
      //   name: 'image1.png',
      // });

      if (attachments?.length > 0) {
        attachments.forEach((image, index) => {
          formData.append('issue_images', {
            uri: image.uri,
            name: image.id,
            type: image.type,
          });
        });
      }

      console.log('formData1222221', JSON.stringify(formData));

      const response = await fetch(
        `https://pwddev.thesst.com/admin/pms/api/projects/${projectId}/bottleneck`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            // Accept: 'application/json',
            // ❗ Do NOT set Content-Type here - RN will do it automatically
          },
          body: formData,
        },
      );

      const result = await response.json();

      if (result && result.success) {
        console.log('dsddddd', result);

        // clear form then inform user and navigate back
        setIsSubmitting(false);

        // resetForm();
        Alert.alert(
          'Success',
          result.message || 'Bottleneck created successfully!',
          [
            {
              text: 'OK',
              onPress: () => {
                setSelectedIssueType('');
                setDescription('');
                setAttachments([]);
                // Navigate back to project details if we have projectId else go back
                if (projectId) {
                  router.push({
                    pathname: '/(drawer)/project-details',
                    params: {
                      projectId,
                      activeTab: 'Bottlenecks',
                    },
                  });
                } else {
                  router.back();
                }
              },
            },
          ],
        );
      } else {
        const msg = result?.message || 'Failed to create bottleneck';
        setIsSubmitting(false);
        Alert.alert('Error', msg);
      }
    } catch (error) {
      console.log('Upload error:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.cardBackground}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleGoBack}
          activeOpacity={0.6}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Bottleneck</Text>
        <View style={{width: 24}} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Card 1: Issue Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Details</Text>

          {/* Issue Type Dropdown */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Severity Type</Text>
            <TouchableOpacity
              style={styles.dropdownTrigger}
              onPress={() => {
                router.push({
                  pathname: '/(drawer)/selection-screen',
                  params: {
                    title: 'Select Issue Type',
                    dataKey: 'issueTypes',
                    currentValue: selectedIssueType,
                    returnTo: 'create-bottleneck',
                    returnField: 'selectedIssueType',
                    projectId: projectId || '',
                    returnTab: returnTab || '',
                  },
                });
              }}
              activeOpacity={0.7}>
              <Text
                style={[
                  styles.dropdownText,
                  !selectedIssueType && styles.placeholderText,
                ]}>
                {selectedIssueType
                  ? selectedIssueType === 'Low'
                    ? `${selectedIssueType} - Minor issue, can be addressed later`
                    : selectedIssueType === 'Medium'
                    ? `${selectedIssueType} - Moderate impact on progress`
                    : selectedIssueType === 'High'
                    ? `${selectedIssueType} - Significant impact, needs attention`
                    : `${selectedIssueType} - Project blocking issue`
                  : 'Select severity type'}
              </Text>
              <Ionicons
                name="chevron-down"
                size={20}
                color={COLORS.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* Description */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Description</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe the bottleneck issue in detail..."
              placeholderTextColor={COLORS.textSecondary}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Card 2: Add Attachments (Optional) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Add Attachments (Optional)</Text>

          {/* Gallery-Style Attachments */}
          {attachments.length === 0 ? (
            /* Initial State: Large "Add Photo/Video" Tile */
            <TouchableOpacity
              style={styles.initialAddTile}
              onPress={handleAddAttachment}
              activeOpacity={0.7}>
              <Ionicons
                name="camera-outline"
                size={40}
                color={COLORS.primary}
              />
              <Text style={styles.initialAddTileText}>Add Photo/Video</Text>
            </TouchableOpacity>
          ) : (
            /* Gallery View: Thumbnails + Add More Button */
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.galleryScrollView}
              contentContainerStyle={styles.galleryScrollContent}>
              {attachments.map(att => (
                <View key={att.id} style={styles.galleryThumbnail}>
                  <Image
                    source={{uri: att.uri}}
                    style={styles.galleryThumbImage}
                  />
                  {att.type === 'video' && (
                    <View style={styles.videoIndicator}>
                      <Ionicons
                        name="play-circle"
                        size={20}
                        color={COLORS.white}
                      />
                    </View>
                  )}
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeAttachment(att.id)}>
                    <Ionicons
                      name="close-circle"
                      size={24}
                      color={COLORS.error}
                    />
                  </TouchableOpacity>
                </View>
              ))}

              {/* Permanent "Add More" Button */}
              {attachments.length < 5 && (
                <TouchableOpacity
                  style={styles.addMoreTile}
                  onPress={handleAddAttachment}
                  activeOpacity={0.7}>
                  <Ionicons name="add" size={32} color={COLORS.primary} />
                </TouchableOpacity>
              )}
            </ScrollView>
          )}
        </View>

        {/* Bottom spacing for fixed button */}
        <View style={{height: 100}} />
      </ScrollView>

      {/* Fixed Submit Button */}
      <View style={styles.submitButtonContainer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            isSubmitting && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting}
          activeOpacity={0.8}>
          {isSubmitting ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Text style={styles.submitButtonText}>Save Bottleneck</Text>
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
        shadowOffset: {width: 0, height: 2},
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
        shadowOffset: {width: 0, height: 2},
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
    minHeight: 120,
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
        shadowOffset: {width: 0, height: -2},
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
  // Gallery-Style Attachment Styles
  initialAddTile: {
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingBottom: 20,
  },
  initialAddTileText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  galleryScrollView: {
    marginTop: 0,
  },
  galleryScrollContent: {
    gap: SPACING.sm,
  },
  galleryThumbnail: {
    position: 'relative',
    width: 120,
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
  },
  galleryThumbImage: {
    width: '100%',
    height: '100%',
  },
  videoIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{translateX: -10}, {translateY: -10}],
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: COLORS.white,
    borderRadius: 12,
  },
  addMoreTile: {
    width: 120,
    height: 120,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
