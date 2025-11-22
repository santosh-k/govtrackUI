import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  FlatList,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
  Modal,
  ScrollView,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { COLORS, SPACING } from '@/theme';
import { AssetFilterBottomSheet, AssetFilters } from '@/components/AssetFilterBottomSheet';

// Types
interface AssetDetails {
  [key: string]: string;
}

interface Asset {
  id: string;
  name: string;
  category: 'Road' | 'Building';
  lastInspectionDate: string;
  department: string;
  division: string;
  subDivision: string;
  inspectionDate: string;
  details: AssetDetails;
}

// Mock Assets Data with Enhanced Structure
const ASSETS_DATA: Asset[] = [
  {
    id: 'AST-2024-001',
    name: 'National Highway 44 Widening Project Section A',
    category: 'Road',
    lastInspectionDate: '15-Mar-2024',
    department: 'Roads & Infrastructure',
    division: 'North Division',
    subDivision: 'Sub-Div A',
    inspectionDate: '2024-03-15',
    details: {
      'Starting Point': 'Delhi Border, NH-44',
      'Ending Point': 'Panipat Junction',
      'Length': '2.5 KM',
      'No. of Lanes': '4',
      'Lane Length': '3.75m each',
      'Right of Way': '60 meters',
      'Surface Type': 'Asphalt Concrete',
      'Traffic Volume': 'High (15,000+ vehicles/day)',
      'Last Maintenance': '10-Jan-2024',
      'Condition': 'Good',
    },
  },
  {
    id: 'AST-2024-002',
    name: 'Municipal Corporation Building - Main Block',
    category: 'Building',
    lastInspectionDate: '12-Mar-2024',
    department: 'Civil',
    division: 'Central Division',
    subDivision: 'Sub-Div B',
    inspectionDate: '2024-03-12',
    details: {
      'Cost': '₹8.5 Crore',
      'Building Client': 'Delhi Municipal Corporation',
      'Year of Construction': '2018',
      'Type of Construction': 'RCC Frame Structure',
      'Total Area': '12,500 sq ft',
      'No. of Floors': '5 (G+4)',
      'Occupancy Type': 'Government Office',
      'Fire Safety': 'Compliant',
      'Last Renovation': '2022',
      'Structural Health': 'Excellent',
    },
  },
  {
    id: 'AST-2024-003',
    name: 'Ring Road Section - West Delhi Corridor',
    category: 'Road',
    lastInspectionDate: '18-Mar-2024',
    department: 'Roads & Infrastructure',
    division: 'West Division',
    subDivision: 'Sub-Div A',
    inspectionDate: '2024-03-18',
    details: {
      'Starting Point': 'Punjabi Bagh Junction',
      'Ending Point': 'Rajouri Garden Metro',
      'Length': '3.2 KM',
      'No. of Lanes': '6',
      'Lane Length': '3.5m each',
      'Right of Way': '75 meters',
      'Surface Type': 'Concrete Pavement',
      'Traffic Volume': 'Very High (25,000+ vehicles/day)',
      'Last Maintenance': '05-Feb-2024',
      'Condition': 'Fair - Minor Repairs Needed',
    },
  },
  {
    id: 'AST-2024-004',
    name: 'Government School Building - Primary Wing',
    category: 'Building',
    lastInspectionDate: '10-Mar-2024',
    department: 'Civil',
    division: 'East Division',
    subDivision: 'Sub-Div C',
    inspectionDate: '2024-03-10',
    details: {
      'Cost': '₹4.2 Crore',
      'Building Client': 'Education Department, Delhi',
      'Year of Construction': '2015',
      'Type of Construction': 'Load Bearing Masonry',
      'Total Area': '8,200 sq ft',
      'No. of Floors': '3 (G+2)',
      'Occupancy Type': 'Educational Institution',
      'Fire Safety': 'Compliant',
      'Last Renovation': '2020',
      'Structural Health': 'Good',
    },
  },
  {
    id: 'AST-2024-005',
    name: 'Mathura Road Extension - South District',
    category: 'Road',
    lastInspectionDate: '22-Mar-2024',
    department: 'Roads & Infrastructure',
    division: 'South Division',
    subDivision: 'Sub-Div B',
    inspectionDate: '2024-03-22',
    details: {
      'Starting Point': 'Ashram Chowk',
      'Ending Point': 'Badarpur Border',
      'Length': '5.8 KM',
      'No. of Lanes': '8',
      'Lane Length': '3.5m each',
      'Right of Way': '80 meters',
      'Surface Type': 'Asphalt Concrete',
      'Traffic Volume': 'Very High (30,000+ vehicles/day)',
      'Last Maintenance': '20-Dec-2023',
      'Condition': 'Good',
    },
  },
  {
    id: 'AST-2024-006',
    name: 'District Hospital Complex - East Wing',
    category: 'Building',
    lastInspectionDate: '08-Mar-2024',
    department: 'Civil',
    division: 'South Division',
    subDivision: 'Sub-Div A',
    inspectionDate: '2024-03-08',
    details: {
      'Cost': '₹15.0 Crore',
      'Building Client': 'Health Department, Delhi',
      'Year of Construction': '2019',
      'Type of Construction': 'RCC Frame Structure',
      'Total Area': '25,000 sq ft',
      'No. of Floors': '6 (G+5)',
      'Occupancy Type': 'Healthcare Facility',
      'Fire Safety': 'Compliant with NOC',
      'Last Renovation': 'N/A',
      'Structural Health': 'Excellent',
    },
  },
  {
    id: 'AST-2024-007',
    name: 'Outer Ring Road - North Section',
    category: 'Road',
    lastInspectionDate: '25-Feb-2024',
    department: 'Roads & Infrastructure',
    division: 'North Division',
    subDivision: 'Sub-Div B',
    inspectionDate: '2024-02-25',
    details: {
      'Starting Point': 'Wazirabad Bridge',
      'Ending Point': 'GTK Depot Junction',
      'Length': '4.1 KM',
      'No. of Lanes': '6',
      'Lane Length': '3.75m each',
      'Right of Way': '70 meters',
      'Surface Type': 'Concrete Pavement',
      'Traffic Volume': 'High (18,000+ vehicles/day)',
      'Last Maintenance': '15-Jan-2024',
      'Condition': 'Excellent',
    },
  },
  {
    id: 'AST-2024-008',
    name: 'Community Center Building - Sector 12',
    category: 'Building',
    lastInspectionDate: '05-Mar-2024',
    department: 'Civil',
    division: 'West Division',
    subDivision: 'Sub-Div B',
    inspectionDate: '2024-03-05',
    details: {
      'Cost': '₹6.8 Crore',
      'Building Client': 'DDA - Delhi Development Authority',
      'Year of Construction': '2017',
      'Type of Construction': 'RCC Frame Structure',
      'Total Area': '15,000 sq ft',
      'No. of Floors': '4 (G+3)',
      'Occupancy Type': 'Community/Recreation',
      'Fire Safety': 'Compliant',
      'Last Renovation': '2021',
      'Structural Health': 'Good',
    },
  },
  {
    id: 'AST-2024-009',
    name: 'Street Light Network - Vasant Vihar',
    category: 'Road',
    lastInspectionDate: '01-Feb-2024',
    department: 'Electrical',
    division: 'Central Division',
    subDivision: 'Sub-Div A',
    inspectionDate: '2024-02-01',
    details: {
      'Starting Point': 'Vasant Vihar Main Market',
      'Ending Point': 'Nelson Mandela Marg',
      'Length': '1.8 KM',
      'No. of Lanes': '4',
      'Lane Length': '3.5m each',
      'Right of Way': '45 meters',
      'Surface Type': 'Asphalt',
      'Traffic Volume': 'Medium (8,000+ vehicles/day)',
      'Last Maintenance': '10-Dec-2023',
      'Condition': 'Good',
    },
  },
  {
    id: 'AST-2024-010',
    name: 'Sports Complex Building - North District',
    category: 'Building',
    lastInspectionDate: '28-Jan-2024',
    department: 'Civil',
    division: 'North Division',
    subDivision: 'Sub-Div C',
    inspectionDate: '2024-01-28',
    details: {
      'Cost': '₹12.5 Crore',
      'Building Client': 'Sports Authority of Delhi',
      'Year of Construction': '2020',
      'Type of Construction': 'Steel Frame Structure',
      'Total Area': '35,000 sq ft',
      'No. of Floors': '3 (G+2)',
      'Occupancy Type': 'Sports/Recreation',
      'Fire Safety': 'Compliant',
      'Last Renovation': 'N/A',
      'Structural Health': 'Excellent',
    },
  },
];

// Dynamic Asset Card Component
interface DynamicAssetCardProps {
  asset: Asset;
  onCardPress: () => void;
  onStartInspection: () => void;
}

const DynamicAssetCard: React.FC<DynamicAssetCardProps> = ({
  asset,
  onCardPress,
  onStartInspection,
}) => {
  // Render Road-specific details
  const renderRoadDetails = () => (
    <View style={styles.detailsGrid}>
      <View style={styles.detailRow}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Starting Point</Text>
          <Text style={styles.detailValue} numberOfLines={2}>
            {asset.details['Starting Point']}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Length</Text>
          <Text style={styles.detailValue}>{asset.details['Length']}</Text>
        </View>
      </View>
      <View style={styles.detailRow}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Ending Point</Text>
          <Text style={styles.detailValue} numberOfLines={2}>
            {asset.details['Ending Point']}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>No. of Lanes</Text>
          <Text style={styles.detailValue}>{asset.details['No. of Lanes']}</Text>
        </View>
      </View>
      <View style={styles.detailRow}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Right of Way</Text>
          <Text style={styles.detailValue}>{asset.details['Right of Way']}</Text>
        </View>
      </View>
    </View>
  );

  // Render Building-specific details
  const renderBuildingDetails = () => (
    <View style={styles.detailsGrid}>
      <View style={styles.detailRow}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Cost</Text>
          <Text style={styles.detailValue}>{asset.details['Cost']}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Year of Construction</Text>
          <Text style={styles.detailValue}>{asset.details['Year of Construction']}</Text>
        </View>
      </View>
      <View style={styles.detailRow}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Building Client</Text>
          <Text style={styles.detailValue} numberOfLines={2}>
            {asset.details['Building Client']}
          </Text>
        </View>
      </View>
      <View style={styles.detailRow}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Type of Construction</Text>
          <Text style={styles.detailValue} numberOfLines={2}>
            {asset.details['Type of Construction']}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.card}>
      {/* Touchable card body */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onCardPress}
        style={styles.cardBody}
      >
        {/* Header */}
        <View style={styles.cardHeader}>
          <Text style={styles.assetId}>{asset.id}</Text>
          <View style={styles.categoryBadge}>
            <Ionicons
              name={asset.category === 'Road' ? 'git-network-outline' : 'business-outline'}
              size={14}
              color={COLORS.primary}
            />
            <Text style={styles.categoryText}>{asset.category}</Text>
          </View>
        </View>

        {/* Asset Name */}
        <Text style={styles.assetName} numberOfLines={3}>
          {asset.name}
        </Text>

        {/* Dynamic Details based on Category */}
        {asset.category === 'Road' ? renderRoadDetails() : renderBuildingDetails()}
      </TouchableOpacity>

      {/* Footer */}
      <View style={styles.cardFooter}>
        <View style={styles.lastInspectionContainer}>
          <Ionicons name="calendar-outline" size={14} color={COLORS.textSecondary} />
          <Text style={styles.lastInspectionText}>Last Insp: {asset.lastInspectionDate}</Text>
        </View>
        <TouchableOpacity
          style={styles.startInspectionButton}
          onPress={onStartInspection}
          activeOpacity={0.8}
        >
          <Ionicons name="clipboard-outline" size={16} color={COLORS.white} />
          <Text style={styles.startInspectionText}>Start Inspection</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Asset Details Bottom Sheet Component
interface AssetDetailsBottomSheetProps {
  visible: boolean;
  asset: Asset | null;
  onClose: () => void;
}

const AssetDetailsBottomSheet: React.FC<AssetDetailsBottomSheetProps> = ({
  visible,
  asset,
  onClose,
}) => {
  const [slideAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
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

  if (!asset) return null;

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [600, 0],
  });

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
            <View style={styles.sheetHeaderLeft}>
              <Ionicons
                name={asset.category === 'Road' ? 'git-network-outline' : 'business-outline'}
                size={24}
                color={COLORS.primary}
              />
              <View style={styles.sheetHeaderText}>
                <Text style={styles.sheetAssetName} numberOfLines={2}>
                  {asset.name}
                </Text>
                <Text style={styles.sheetAssetId}>{asset.id}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          {/* Scrollable Details */}
          <ScrollView style={styles.sheetContent} showsVerticalScrollIndicator={false}>
            <View style={styles.detailsSection}>
              <Text style={styles.sectionTitle}>Asset Details</Text>

              {/* Category Badge */}
              <View style={styles.detailRowSheet}>
                <Text style={styles.detailLabelSheet}>Category</Text>
                <View style={styles.categoryBadgeLarge}>
                  <Ionicons
                    name={asset.category === 'Road' ? 'git-network-outline' : 'business-outline'}
                    size={16}
                    color={COLORS.primary}
                  />
                  <Text style={styles.categoryTextLarge}>{asset.category}</Text>
                </View>
              </View>

              {/* Last Inspection */}
              <View style={[styles.detailRowSheet, styles.detailRowAlt]}>
                <Text style={styles.detailLabelSheet}>Last Inspection</Text>
                <Text style={styles.detailValueSheet}>{asset.lastInspectionDate}</Text>
              </View>

              {/* Department */}
              <View style={styles.detailRowSheet}>
                <Text style={styles.detailLabelSheet}>Department</Text>
                <Text style={styles.detailValueSheet}>{asset.department}</Text>
              </View>

              {/* Division */}
              <View style={[styles.detailRowSheet, styles.detailRowAlt]}>
                <Text style={styles.detailLabelSheet}>Division</Text>
                <Text style={styles.detailValueSheet}>{asset.division}</Text>
              </View>

              {/* Sub-Division */}
              <View style={styles.detailRowSheet}>
                <Text style={styles.detailLabelSheet}>Sub-Division</Text>
                <Text style={styles.detailValueSheet}>{asset.subDivision}</Text>
              </View>

              {/* All Details from details object */}
              {Object.entries(asset.details).map(([key, value], index) => (
                <View
                  key={key}
                  style={[styles.detailRowSheet, (index + 3) % 2 === 0 ? styles.detailRowAlt : null]}
                >
                  <Text style={styles.detailLabelSheet}>{key}</Text>
                  <Text style={styles.detailValueSheet}>{value}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

// Helper function to parse date from DD-MM-YYYY to Date object
const parseDate = (dateStr: string): Date | null => {
  if (!dateStr || dateStr.length !== 10) return null;
  const parts = dateStr.split('-');
  if (parts.length !== 3) return null;
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
  const year = parseInt(parts[2], 10);
  const date = new Date(year, month, day);
  return isNaN(date.getTime()) ? null : date;
};

// Helper function to parse date from YYYY-MM-DD to Date object
const parseISODate = (dateStr: string): Date | null => {
  if (!dateStr || dateStr.length !== 10) return null;
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date;
};

// Main Asset List Screen
export default function AssetListScreen() {
  const params = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);
  const [filters, setFilters] = useState<AssetFilters>({
    category: '',
    department: '',
    division: '',
    subDivision: '',
    fromDate: '',
    toDate: '',
  });

  // Update filters from selection screens when returning
  React.useEffect(() => {
    if (params.selectedCategory) {
      setFilters((prev) => ({ ...prev, category: params.selectedCategory as string }));
    }
    if (params.selectedDepartment) {
      setFilters((prev) => ({ ...prev, department: params.selectedDepartment as string }));
    }
    if (params.selectedDivision) {
      setFilters((prev) => ({ ...prev, division: params.selectedDivision as string }));
    }
    if (params.selectedSubDivision) {
      setFilters((prev) => ({ ...prev, subDivision: params.selectedSubDivision as string }));
    }
  }, [params]);

  const navigateBack = () => {
    router.push('/(drawer)/search-asset');
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const handleCardPress = (asset: Asset) => {
    setSelectedAsset(asset);
    setBottomSheetVisible(true);
  };

  const handleStartInspection = (asset: Asset) => {
    router.push({
      pathname: '/(drawer)/create-inspection',
      params: { assetId: asset.id, assetName: asset.name },
    });
  };

  const closeBottomSheet = () => {
    setBottomSheetVisible(false);
    setTimeout(() => setSelectedAsset(null), 300);
  };

  const handleApplyFilters = (newFilters: AssetFilters) => {
    setFilters(newFilters);
  };

  const hasActiveFilters = () => {
    return (
      filters.category ||
      filters.department ||
      filters.division ||
      filters.subDivision ||
      filters.fromDate ||
      filters.toDate
    );
  };

  // Navigation handlers for selection screens
  const handleOpenCategorySelector = () => {
    setFilterSheetVisible(false);
    router.push({
      pathname: '/(drawer)/selection-screen',
      params: {
        title: 'Select Category',
        options: JSON.stringify(['Road', 'Building']),
        returnScreen: 'asset-list',
        returnParam: 'selectedCategory',
      },
    });
  };

  const handleOpenDepartmentSelector = () => {
    setFilterSheetVisible(false);
    router.push({
      pathname: '/(drawer)/selection-screen',
      params: {
        title: 'Select Department',
        options: JSON.stringify([
          'Roads & Infrastructure',
          'Civil',
          'Electrical',
        ]),
        returnScreen: 'asset-list',
        returnParam: 'selectedDepartment',
      },
    });
  };

  const handleOpenDivisionSelector = () => {
    setFilterSheetVisible(false);
    router.push({
      pathname: '/(drawer)/selection-screen',
      params: {
        title: 'Select Division',
        options: JSON.stringify([
          'North Division',
          'South Division',
          'East Division',
          'West Division',
          'Central Division',
        ]),
        returnScreen: 'asset-list',
        returnParam: 'selectedDivision',
      },
    });
  };

  const handleOpenSubDivisionSelector = () => {
    setFilterSheetVisible(false);
    router.push({
      pathname: '/(drawer)/selection-screen',
      params: {
        title: 'Select Sub-Division',
        options: JSON.stringify([
          'Sub-Div A',
          'Sub-Div B',
          'Sub-Div C',
        ]),
        returnScreen: 'asset-list',
        returnParam: 'selectedSubDivision',
      },
    });
  };

  // Filter assets based on search query and filters
  const filteredAssets = useMemo(() => {
    let assets = ASSETS_DATA;

    // Apply filters
    if (filters.category) {
      assets = assets.filter((asset) => asset.category === filters.category);
    }

    if (filters.department) {
      assets = assets.filter((asset) => asset.department === filters.department);
    }

    if (filters.division) {
      assets = assets.filter((asset) => asset.division === filters.division);
    }

    if (filters.subDivision) {
      assets = assets.filter((asset) => asset.subDivision === filters.subDivision);
    }

    // Date range filtering
    if (filters.fromDate || filters.toDate) {
      const fromDate = filters.fromDate ? parseDate(filters.fromDate) : null;
      const toDate = filters.toDate ? parseDate(filters.toDate) : null;

      assets = assets.filter((asset) => {
        const assetDate = parseISODate(asset.inspectionDate);
        if (!assetDate) return false;

        if (fromDate && assetDate < fromDate) return false;
        if (toDate && assetDate > toDate) return false;

        return true;
      });
    }

    // Apply local search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      assets = assets.filter((asset) => {
        const nameMatch = asset.name.toLowerCase().includes(query);
        const idMatch = asset.id.toLowerCase().includes(query);
        return nameMatch || idMatch;
      });
    }

    return assets;
  }, [searchQuery, filters]);

  const renderAssetItem = ({ item }: { item: Asset }) => (
    <DynamicAssetCard
      asset={item}
      onCardPress={() => handleCardPress(item)}
      onStartInspection={() => handleStartInspection(item)}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="file-tray-outline" size={64} color="#CCCCCC" />
      <Text style={styles.emptyStateTitle}>No assets found</Text>
      <Text style={styles.emptyStateText}>
        {hasActiveFilters()
          ? 'No assets match your filter criteria.\nTry adjusting your filters.'
          : 'No assets match your search criteria.\nTry adjusting your search terms.'}
      </Text>
    </View>
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.cardBackground} />

        {/* Header */}
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={navigateBack}
              activeOpacity={0.6}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Asset List</Text>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setFilterSheetVisible(true)}
              activeOpacity={0.6}
            >
              <Ionicons name="funnel-outline" size={24} color={COLORS.text} />
              {hasActiveFilters() && <View style={styles.filterBadge} />}
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons
              name="search"
              size={20}
              color={COLORS.textSecondary}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by asset name or ID..."
              placeholderTextColor={COLORS.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={clearSearch}
                style={styles.clearButton}
                activeOpacity={0.6}
              >
                <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Asset List */}
        <FlatList
          data={filteredAssets}
          renderItem={renderAssetItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          keyboardShouldPersistTaps="handled"
        />

        {/* Asset Details Bottom Sheet */}
        <AssetDetailsBottomSheet
          visible={bottomSheetVisible}
          asset={selectedAsset}
          onClose={closeBottomSheet}
        />

        {/* Asset Filter Bottom Sheet */}
        <AssetFilterBottomSheet
          visible={filterSheetVisible}
          currentFilters={filters}
          onApply={handleApplyFilters}
          onClose={() => setFilterSheetVisible(false)}
          onOpenCategorySelector={handleOpenCategorySelector}
          onOpenDepartmentSelector={handleOpenDepartmentSelector}
          onOpenDivisionSelector={handleOpenDivisionSelector}
          onOpenSubDivisionSelector={handleOpenSubDivisionSelector}
        />
      </SafeAreaView>
    </TouchableWithoutFeedback>
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
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: SPACING.sm,
    marginLeft: -SPACING.sm,
    marginRight: SPACING.sm,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  filterButton: {
    padding: SPACING.sm,
    marginRight: -SPACING.sm,
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.error,
  },
  // Search Bar Styles
  searchContainer: {
    backgroundColor: COLORS.cardBackground,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  listContent: {
    padding: SPACING.md,
  },
  // Asset Card Styles
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardBody: {
    padding: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  assetId: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  assetName: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 14,
    lineHeight: 23,
  },
  detailsGrid: {
    gap: 10,
  },
  detailRow: {
    flexDirection: 'row',
    gap: 12,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  lastInspectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  lastInspectionText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  startInspectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  startInspectionText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.white,
  },
  // Bottom Sheet Styles
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
    maxHeight: '80%',
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sheetHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  sheetHeaderText: {
    flex: 1,
  },
  sheetAssetName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  sheetAssetId: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  closeButton: {
    padding: 4,
  },
  sheetContent: {
    flex: 1,
  },
  detailsSection: {
    padding: SPACING.md,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailRowSheet: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  detailRowAlt: {
    backgroundColor: '#F9F9F9',
  },
  detailLabelSheet: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    flex: 1,
    marginRight: 12,
  },
  detailValueSheet: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
    textAlign: 'right',
  },
  categoryBadgeLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 6,
  },
  categoryTextLarge: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
