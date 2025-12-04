import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Animated,
  Dimensions,
  Platform,
  Pressable,
  PanResponder,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import selectionData from '@/data/selectionData.json';

const COLORS = {
  background: '#F5F5F5',
  cardBackground: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#666666',
  textLight: '#9E9E9E',
  textPlaceholder: '#BDBDBD',
  primary: '#FF9800',
  border: '#E0E0E0',
  overlay: 'rgba(0, 0, 0, 0.5)',
  inputBackground: '#F8F8F8',
  selectedBackground: '#FFF3E0',
  sectionHeader: '#F5F5F5',
};

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.85;

export interface ProjectFilters {
  department: string;
  zone: string;
  circle: string;
  division: string;
  subDivision: string;
  sector: string;
  subSector: string;
  status: string;
  fundingType: string;
  workType: string;
  budgetMin: string;
  budgetMax: string;
}

interface ProjectFilterBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: ProjectFilters) => void;
  onReset: () => void;
  currentFilters: ProjectFilters;
}

interface SelectionItem {
  id: string;
  name: string;
}

type DataKey = keyof typeof selectionData;

interface InlinePickerModalProps {
  visible: boolean;
  title: string;
  data: SelectionItem[];
  currentValue: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}

const InlinePickerModal: React.FC<InlinePickerModalProps> = ({
  visible,
  title,
  data,
  currentValue,
  onSelect,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = data.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={pickerStyles.overlay}>
        <View style={pickerStyles.container}>
          <View style={pickerStyles.header}>
            <Text style={pickerStyles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <View style={pickerStyles.searchContainer}>
            <Ionicons name="search" size={18} color={COLORS.textSecondary} />
            <TextInput
              style={pickerStyles.searchInput}
              placeholder="Search..."
              placeholderTextColor={COLORS.textPlaceholder}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery !== '' && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={COLORS.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          <ScrollView style={pickerStyles.list} showsVerticalScrollIndicator={false}>
            <TouchableOpacity
              style={[pickerStyles.item, !currentValue && pickerStyles.itemSelected]}
              onPress={() => {
                onSelect('');
                onClose();
              }}
            >
              <Text style={[pickerStyles.itemText, !currentValue && pickerStyles.itemTextSelected]}>
                All (No Filter)
              </Text>
              {!currentValue && <Ionicons name="checkmark" size={20} color={COLORS.primary} />}
            </TouchableOpacity>
            {filteredData.map((item) => {
              const isSelected = item.name === currentValue;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[pickerStyles.item, isSelected && pickerStyles.itemSelected]}
                  onPress={() => {
                    onSelect(item.name);
                    onClose();
                  }}
                >
                  <Text style={[pickerStyles.itemText, isSelected && pickerStyles.itemTextSelected]}>
                    {item.name}
                  </Text>
                  {isSelected && <Ionicons name="checkmark" size={20} color={COLORS.primary} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const pickerStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    width: '100%',
    maxHeight: SCREEN_HEIGHT * 0.7,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBackground,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 8,
    paddingVertical: 0,
  },
  list: {
    maxHeight: SCREEN_HEIGHT * 0.45,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  itemSelected: {
    backgroundColor: COLORS.selectedBackground,
  },
  itemText: {
    fontSize: 15,
    color: COLORS.text,
    flex: 1,
  },
  itemTextSelected: {
    fontWeight: '600',
    color: COLORS.primary,
  },
});

export default function ProjectFilterBottomSheet({
  visible,
  onClose,
  onApply,
  onReset,
  currentFilters,
}: ProjectFilterBottomSheetProps) {
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const [filters, setFilters] = useState<ProjectFilters>(currentFilters);

  // Picker modal state
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerTitle, setPickerTitle] = useState('');
  const [pickerData, setPickerData] = useState<SelectionItem[]>([]);
  const [pickerField, setPickerField] = useState<keyof ProjectFilters | ''>('');
  const [pickerCurrentValue, setPickerCurrentValue] = useState('');

  useEffect(() => {
    if (visible) {
      setFilters(currentFilters);
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: SHEET_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, translateY, currentFilters]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 5,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 150 || gestureState.vy > 0.5) {
          Animated.timing(translateY, {
            toValue: SHEET_HEIGHT,
            duration: 250,
            useNativeDriver: true,
          }).start(() => {
            onClose();
          });
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 65,
            friction: 11,
          }).start();
        }
      },
    })
  ).current;

  const openPicker = (title: string, dataKey: DataKey, field: keyof ProjectFilters) => {
    const data = (selectionData[dataKey] || []) as SelectionItem[];
    setPickerTitle(title);
    setPickerData(data);
    setPickerField(field);
    setPickerCurrentValue(filters[field]);
    setPickerVisible(true);
  };

  const handlePickerSelect = (value: string) => {
    if (pickerField) {
      setFilters((prev) => ({ ...prev, [pickerField]: value }));
    }
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    const emptyFilters: ProjectFilters = {
      department: '',
      zone: '',
      circle: '',
      division: '',
      subDivision: '',
      sector: '',
      subSector: '',
      status: '',
      fundingType: '',
      workType: '',
      budgetMin: '',
      budgetMax: '',
    };
    setFilters(emptyFilters);
    onReset();
  };

  const getActiveFilterCount = (): number => {
    let count = 0;
    if (filters.department) count++;
    if (filters.zone) count++;
    if (filters.circle) count++;
    if (filters.division) count++;
    if (filters.subDivision) count++;
    if (filters.sector) count++;
    if (filters.subSector) count++;
    if (filters.status) count++;
    if (filters.fundingType) count++;
    if (filters.workType) count++;
    if (filters.budgetMin || filters.budgetMax) count++;
    return count;
  };

  const renderDropdown = (
    label: string,
    value: string,
    title: string,
    dataKey: DataKey,
    field: keyof ProjectFilters
  ) => (
    <TouchableOpacity
      style={styles.dropdownContainer}
      onPress={() => openPicker(title, dataKey, field)}
      activeOpacity={0.7}
    >
      <Text style={[styles.dropdownText, !value && styles.dropdownTextPlaceholder]}>
        {value || `Select ${label}`}
      </Text>
      <Ionicons name="chevron-down" size={18} color={COLORS.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <Animated.View
          style={[styles.bottomSheet, { transform: [{ translateY }] }]}
          {...panResponder.panHandlers}
        >
          <View style={styles.handleBar} />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerTitle}>Filter Projects</Text>
              {getActiveFilterCount() > 0 && (
                <View style={styles.filterCountBadge}>
                  <Text style={styles.filterCountText}>{getActiveFilterCount()}</Text>
                </View>
              )}
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity onPress={handleReset} style={styles.resetHeaderButton}>
                <Text style={styles.resetHeaderText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} activeOpacity={0.6}>
                <Ionicons name="close" size={26} color={COLORS.text} />
              </TouchableOpacity>
            </View>
          </View>

          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Organizational Section */}
              <View style={styles.sectionHeader}>
                <Ionicons name="business-outline" size={18} color={COLORS.textSecondary} />
                <Text style={styles.sectionTitle}>Organizational</Text>
              </View>
              <View style={styles.filterSection}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Department</Text>
                  {renderDropdown('Department', filters.department, 'Select Department', 'departments', 'department')}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Zone</Text>
                  {renderDropdown('Zone', filters.zone, 'Select Zone', 'zones', 'zone')}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Circle</Text>
                  {renderDropdown('Circle', filters.circle, 'Select Circle', 'circles', 'circle')}
                </View>

                <View style={styles.rowInputs}>
                  <View style={[styles.inputGroup, styles.halfWidth]}>
                    <Text style={styles.inputLabel}>Division</Text>
                    {renderDropdown('Division', filters.division, 'Select Division', 'divisions', 'division')}
                  </View>
                  <View style={[styles.inputGroup, styles.halfWidth]}>
                    <Text style={styles.inputLabel}>Sub-Division</Text>
                    {renderDropdown('Sub-Division', filters.subDivision, 'Select Sub-Division', 'subDivisions', 'subDivision')}
                  </View>
                </View>
              </View>

              {/* Location Section */}
              <View style={styles.sectionHeader}>
                <Ionicons name="location-outline" size={18} color={COLORS.textSecondary} />
                <Text style={styles.sectionTitle}>Location / Sector</Text>
              </View>
              <View style={styles.filterSection}>
                <View style={styles.rowInputs}>
                  <View style={[styles.inputGroup, styles.halfWidth]}>
                    <Text style={styles.inputLabel}>Sector</Text>
                    {renderDropdown('Sector', filters.sector, 'Select Sector', 'sectors', 'sector')}
                  </View>
                  <View style={[styles.inputGroup, styles.halfWidth]}>
                    <Text style={styles.inputLabel}>Sub-Sector</Text>
                    {renderDropdown('Sub-Sector', filters.subSector, 'Select Sub-Sector', 'subSectors', 'subSector')}
                  </View>
                </View>
              </View>

              {/* Attributes Section */}
              <View style={styles.sectionHeader}>
                <Ionicons name="options-outline" size={18} color={COLORS.textSecondary} />
                <Text style={styles.sectionTitle}>Project Attributes</Text>
              </View>
              <View style={styles.filterSection}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Working Status</Text>
                  {renderDropdown('Status', filters.status, 'Select Status', 'projectStatuses', 'status')}
                </View>

                <View style={styles.rowInputs}>
                  <View style={[styles.inputGroup, styles.halfWidth]}>
                    <Text style={styles.inputLabel}>Funding Type</Text>
                    {renderDropdown('Funding', filters.fundingType, 'Select Funding Type', 'fundingTypes', 'fundingType')}
                  </View>
                  <View style={[styles.inputGroup, styles.halfWidth]}>
                    <Text style={styles.inputLabel}>Work Type</Text>
                    {renderDropdown('Work Type', filters.workType, 'Select Work Type', 'workTypes', 'workType')}
                  </View>
                </View>
              </View>

              {/* Budget Section */}
              <View style={styles.sectionHeader}>
                <Ionicons name="cash-outline" size={18} color={COLORS.textSecondary} />
                <Text style={styles.sectionTitle}>Budget Range (in Crores)</Text>
              </View>
              <View style={styles.filterSection}>
                <View style={styles.rowInputs}>
                  <View style={[styles.inputGroup, styles.halfWidth]}>
                    <Text style={styles.inputLabel}>Min Budget</Text>
                    <View style={styles.budgetInputContainer}>
                      <Text style={styles.currencySymbol}>₹</Text>
                      <TextInput
                        style={styles.budgetInput}
                        placeholder="0"
                        placeholderTextColor={COLORS.textPlaceholder}
                        value={filters.budgetMin}
                        onChangeText={(text) => setFilters((prev) => ({ ...prev, budgetMin: text }))}
                        keyboardType="numeric"
                      />
                      <Text style={styles.currencySuffix}>Cr</Text>
                    </View>
                  </View>
                  <View style={[styles.inputGroup, styles.halfWidth]}>
                    <Text style={styles.inputLabel}>Max Budget</Text>
                    <View style={styles.budgetInputContainer}>
                      <Text style={styles.currencySymbol}>₹</Text>
                      <TextInput
                        style={styles.budgetInput}
                        placeholder="100"
                        placeholderTextColor={COLORS.textPlaceholder}
                        value={filters.budgetMax}
                        onChangeText={(text) => setFilters((prev) => ({ ...prev, budgetMax: text }))}
                        keyboardType="numeric"
                      />
                      <Text style={styles.currencySuffix}>Cr</Text>
                    </View>
                  </View>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>

          {/* Apply Button */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.applyButton} onPress={handleApply} activeOpacity={0.8}>
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>

      {/* Inline Picker Modal */}
      <InlinePickerModal
        visible={pickerVisible}
        title={pickerTitle}
        data={pickerData}
        currentValue={pickerCurrentValue}
        onSelect={handlePickerSelect}
        onClose={() => setPickerVisible(false)}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_HEIGHT,
    backgroundColor: COLORS.cardBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 20,
      },
    }),
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  filterCountBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    paddingHorizontal: 6,
  },
  filterCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  resetHeaderButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  resetHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.sectionHeader,
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  dropdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    minHeight: 48,
  },
  dropdownText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  dropdownTextPlaceholder: {
    color: COLORS.textPlaceholder,
    fontWeight: '400',
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  budgetInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    minHeight: 48,
  },
  currencySymbol: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginRight: 4,
  },
  budgetInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
    paddingVertical: 0,
  },
  currencySuffix: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginLeft: 4,
  },
  actionButtons: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.cardBackground,
  },
  applyButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
