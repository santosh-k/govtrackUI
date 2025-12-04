import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  TextInput,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS, SPACING } from '@/theme';

const SCREEN_HEIGHT = Dimensions.get('window').height;

export interface AssetFilters {
  category: string;
  department: string;
  division: string;
  subDivision: string;
  fromDate: string;
  toDate: string;
}

interface AssetFilterBottomSheetProps {
  visible: boolean;
  currentFilters: AssetFilters;
  onApply: (filters: AssetFilters) => void;
  onClose: () => void;
}

export const AssetFilterBottomSheet: React.FC<AssetFilterBottomSheetProps> = ({
  visible,
  currentFilters,
  onApply,
  onClose,
}) => {
  const [slideAnim] = useState(new Animated.Value(0));
  const [localFilters, setLocalFilters] = useState<AssetFilters>(currentFilters);

  useEffect(() => {
    setLocalFilters(currentFilters);
  }, [currentFilters, visible]);

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [SCREEN_HEIGHT, 0],
  });

  const handleReset = () => {
    const emptyFilters: AssetFilters = {
      category: '',
      department: '',
      division: '',
      subDivision: '',
      fromDate: '',
      toDate: '',
    };
    setLocalFilters(emptyFilters);
  };

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const updateFilter = (key: keyof AssetFilters, value: string) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Navigation to SelectionScreen with proper params
  const handleOpenCategorySelector = () => {
    onClose(); // Close the bottom sheet first
    setTimeout(() => {
      router.push({
        pathname: '/(drawer)/selection-screen',
        params: {
          title: 'Select Category',
          dataKey: 'assetCategories',
          currentValue: localFilters.category,
          returnField: 'filterCategory',
          returnTo: 'asset-list',
        },
      });
    }, 300);
  };

  const handleOpenDepartmentSelector = () => {
    onClose();
    setTimeout(() => {
      router.push({
        pathname: '/(drawer)/selection-screen',
        params: {
          title: 'Select Department',
          dataKey: 'departments',
          currentValue: localFilters.department,
          returnField: 'filterDepartment',
          returnTo: 'asset-list',
        },
      });
    }, 300);
  };

  const handleOpenDivisionSelector = () => {
    onClose();
    setTimeout(() => {
      router.push({
        pathname: '/(drawer)/selection-screen',
        params: {
          title: 'Select Division',
          dataKey: 'divisions',
          currentValue: localFilters.division,
          returnField: 'filterDivision',
          returnTo: 'asset-list',
        },
      });
    }, 300);
  };

  const handleOpenSubDivisionSelector = () => {
    onClose();
    setTimeout(() => {
      router.push({
        pathname: '/(drawer)/selection-screen',
        params: {
          title: 'Select Sub-Division',
          dataKey: 'subDivisions',
          currentValue: localFilters.subDivision,
          returnField: 'filterSubDivision',
          returnTo: 'asset-list',
        },
      });
    }, 300);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.modalOverlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.modalBackdrop} />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[
            styles.bottomSheetContainer,
            {
              transform: [{ translateY }],
            },
          ]}
        >
          {/* Handle Bar */}
          <View style={styles.handleBar} />

          {/* Header */}
          <View style={styles.sheetHeader}>
            <View style={styles.headerLeft}>
              <Ionicons name="funnel" size={24} color={COLORS.primary} />
              <Text style={styles.headerTitle}>Filter Assets</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          {/* Scrollable Content */}
          <ScrollView
            style={styles.sheetContent}
            contentContainerStyle={styles.sheetContentContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Category */}
            <View style={styles.filterField}>
              <Text style={styles.fieldLabel}>Category</Text>
              <TouchableOpacity
                style={styles.selectField}
                onPress={handleOpenCategorySelector}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.selectFieldText,
                    !localFilters.category && styles.placeholderText,
                  ]}
                >
                  {localFilters.category || 'Select Category'}
                </Text>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Department */}
            <View style={styles.filterField}>
              <Text style={styles.fieldLabel}>Department</Text>
              <TouchableOpacity
                style={styles.selectField}
                onPress={handleOpenDepartmentSelector}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.selectFieldText,
                    !localFilters.department && styles.placeholderText,
                  ]}
                >
                  {localFilters.department || 'Select Department'}
                </Text>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Division */}
            <View style={styles.filterField}>
              <Text style={styles.fieldLabel}>Division</Text>
              <TouchableOpacity
                style={styles.selectField}
                onPress={handleOpenDivisionSelector}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.selectFieldText,
                    !localFilters.division && styles.placeholderText,
                  ]}
                >
                  {localFilters.division || 'Select Division'}
                </Text>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Sub-Division */}
            <View style={styles.filterField}>
              <Text style={styles.fieldLabel}>Sub-Division</Text>
              <TouchableOpacity
                style={styles.selectField}
                onPress={handleOpenSubDivisionSelector}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.selectFieldText,
                    !localFilters.subDivision && styles.placeholderText,
                  ]}
                >
                  {localFilters.subDivision || 'Select Sub-Division'}
                </Text>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Inspection Date Range */}
            <View style={styles.filterField}>
              <Text style={styles.fieldLabel}>Inspection Date Range</Text>
              <View style={styles.dateRangeContainer}>
                <View style={styles.dateInputWrapper}>
                  <Text style={styles.dateInputLabel}>From Date</Text>
                  <TextInput
                    style={styles.dateInput}
                    placeholder="DD-MM-YYYY"
                    placeholderTextColor={COLORS.textSecondary}
                    value={localFilters.fromDate}
                    onChangeText={(text) => updateFilter('fromDate', text)}
                    maxLength={10}
                    keyboardType="numbers-and-punctuation"
                  />
                </View>
                <View style={styles.dateInputWrapper}>
                  <Text style={styles.dateInputLabel}>To Date</Text>
                  <TextInput
                    style={styles.dateInput}
                    placeholder="DD-MM-YYYY"
                    placeholderTextColor={COLORS.textSecondary}
                    value={localFilters.toDate}
                    onChangeText={(text) => updateFilter('toDate', text)}
                    maxLength={10}
                    keyboardType="numbers-and-punctuation"
                  />
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Footer Buttons */}
          <View style={styles.footerButtons}>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleReset}
              activeOpacity={0.7}
            >
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={handleApply}
              activeOpacity={0.8}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  bottomSheetContainer: {
    backgroundColor: COLORS.cardBackground,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: SCREEN_HEIGHT * 0.75,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  closeButton: {
    padding: 4,
  },
  sheetContent: {
    flex: 1,
  },
  sheetContentContainer: {
    padding: SPACING.md,
    paddingBottom: 20,
  },
  filterField: {
    marginBottom: SPACING.md + 4,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  selectField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
  },
  selectFieldText: {
    fontSize: 15,
    color: COLORS.text,
    flex: 1,
  },
  placeholderText: {
    color: COLORS.textSecondary,
  },
  dateRangeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  dateInputWrapper: {
    flex: 1,
  },
  dateInputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  dateInput: {
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.text,
  },
  footerButtons: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 12,
    backgroundColor: COLORS.cardBackground,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
  },
  applyButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
  },
});
