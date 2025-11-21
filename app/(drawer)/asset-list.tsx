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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

const COLORS = {
  background: '#F5F5F5',
  cardBackground: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#666666',
  textLight: '#999999',
  border: '#E0E0E0',
  searchBarBackground: '#F0F0F0',
  // Status colors
  statusOperational: '#4CAF50',
  statusOperationalBg: '#E8F5E9',
  statusMaintenance: '#FF9800',
  statusMaintenanceBg: '#FFF3E0',
  statusDefective: '#F44336',
  statusDefectiveBg: '#FFEBEE',
  statusInactive: '#9E9E9E',
  statusInactiveBg: '#F5F5F5',
};

type AssetStatus = 'Operational' | 'Maintenance' | 'Defective' | 'Inactive';

interface Asset {
  id: string;
  name: string;
  category: string;
  status: AssetStatus;
  zone?: string;
  department?: string;
  division?: string;
  subDivision?: string;
  location: string;
  installationDate: string;
  lastInspection: string;
}

// Helper function to get status colors
const getStatusColors = (status: AssetStatus) => {
  switch (status) {
    case 'Operational':
      return { bg: COLORS.statusOperationalBg, text: COLORS.statusOperational };
    case 'Maintenance':
      return { bg: COLORS.statusMaintenanceBg, text: COLORS.statusMaintenance };
    case 'Defective':
      return { bg: COLORS.statusDefectiveBg, text: COLORS.statusDefective };
    case 'Inactive':
      return { bg: COLORS.statusInactiveBg, text: COLORS.statusInactive };
    default:
      return { bg: COLORS.statusOperationalBg, text: COLORS.statusOperational };
  }
};

interface AssetCardProps {
  asset: Asset;
  onPress: () => void;
}

const AssetCard: React.FC<AssetCardProps> = ({ asset, onPress }) => {
  const statusColors = getStatusColors(asset.status);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Top Row: Asset ID and Status Badge */}
      <View style={styles.cardTopRow}>
        <Text style={styles.assetId}>{asset.id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
          <Text style={[styles.statusText, { color: statusColors.text }]}>
            {asset.status}
          </Text>
        </View>
      </View>

      {/* Asset Name (Bold) */}
      <Text style={styles.assetName} numberOfLines={2}>
        {asset.name}
      </Text>

      {/* Category • Zone • Department (Gray) */}
      <Text style={styles.assetMetadata} numberOfLines={1}>
        {asset.category} • {asset.zone || 'N/A'} • {asset.department || 'N/A'}
      </Text>

      {/* Additional Info */}
      <View style={styles.additionalInfo}>
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={14} color={COLORS.textLight} />
          <Text style={styles.infoText}>{asset.location}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={14} color={COLORS.textLight} />
          <Text style={styles.infoText}>Last Inspection: {asset.lastInspection}</Text>
        </View>
      </View>

      {/* View Details */}
      <View style={styles.cardFooter}>
        <View style={styles.viewDetailsContainer}>
          <Text style={styles.viewDetailsText}>View Details</Text>
          <Ionicons name="chevron-forward" size={16} color={COLORS.text} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Mock asset data
const ALL_ASSETS: Asset[] = [
  {
    id: 'AST-2024-001',
    name: 'MG Road Main Street Section A',
    category: 'Roads',
    status: 'Operational',
    zone: 'Zone 1 - North Delhi',
    department: 'Roads & Bridges Department',
    division: 'North Division',
    subDivision: 'North Sub-Division A',
    location: 'MG Road, Sector 14',
    installationDate: '15-Jan-2020',
    lastInspection: '10-Mar-2024',
  },
  {
    id: 'AST-2024-002',
    name: 'Municipal Corporation Building - Annex Block',
    category: 'Buildings',
    status: 'Maintenance',
    zone: 'Zone 5 - Central Delhi',
    department: 'Building Department',
    division: 'Central Division',
    subDivision: 'Central Sub-Division A',
    location: 'Civic Center, Connaught Place',
    installationDate: '01-Aug-2015',
    lastInspection: '05-Mar-2024',
  },
  {
    id: 'AST-2024-003',
    name: 'Yamuna River Bridge - Eastern Span',
    category: 'Bridges',
    status: 'Operational',
    zone: 'Zone 3 - East Delhi',
    department: 'Roads & Bridges Department',
    division: 'East Division',
    subDivision: 'East Sub-Division A',
    location: 'Yamuna River Crossing, NH-24',
    installationDate: '20-Nov-2018',
    lastInspection: '25-Feb-2024',
  },
  {
    id: 'AST-2024-004',
    name: 'High Voltage Transformer Station - Zone 2',
    category: 'Electrical',
    status: 'Defective',
    zone: 'Zone 2 - South Delhi',
    department: 'Electrical Department',
    division: 'South Division',
    subDivision: 'South Sub-Division A',
    location: 'Industrial Area, Okhla',
    installationDate: '10-Apr-2019',
    lastInspection: '20-Feb-2024',
  },
  {
    id: 'AST-2024-005',
    name: 'Nehru Park - Central Garden Complex',
    category: 'Parks',
    status: 'Operational',
    zone: 'Zone 7 - New Delhi',
    department: 'Horticulture Department',
    division: 'Central Division',
    subDivision: 'Central Sub-Division B',
    location: 'Chanakyapuri, New Delhi',
    installationDate: '05-Jun-2016',
    lastInspection: '15-Mar-2024',
  },
  {
    id: 'AST-2024-006',
    name: 'Main Drainage Canal - North Sector',
    category: 'Drains',
    status: 'Maintenance',
    zone: 'Zone 1 - North Delhi',
    department: 'Drainage Department',
    division: 'North Division',
    subDivision: 'North Sub-Division B',
    location: 'Model Town, Ring Road',
    installationDate: '22-Sep-2017',
    lastInspection: '08-Mar-2024',
  },
  {
    id: 'AST-2024-007',
    name: 'Ring Road Section - West Delhi Flyover',
    category: 'Roads',
    status: 'Operational',
    zone: 'Zone 4 - West Delhi',
    department: 'Roads & Bridges Department',
    division: 'West Division',
    subDivision: 'West Sub-Division A',
    location: 'Ring Road, Punjabi Bagh',
    installationDate: '12-Mar-2021',
    lastInspection: '18-Mar-2024',
  },
  {
    id: 'AST-2024-008',
    name: 'Government School Building - Primary Wing',
    category: 'Buildings',
    status: 'Operational',
    zone: 'Zone 6 - Suburban Delhi',
    department: 'Building Department',
    division: 'Special Projects Division',
    subDivision: 'East Sub-Division B',
    location: 'Rohini Sector 12',
    installationDate: '01-Apr-2014',
    lastInspection: '12-Mar-2024',
  },
  {
    id: 'AST-2024-009',
    name: 'Delhi Metro Connector Bridge',
    category: 'Bridges',
    status: 'Operational',
    zone: 'Zone 5 - Central Delhi',
    department: 'Roads & Bridges Department',
    division: 'Central Division',
    subDivision: 'Central Sub-Division A',
    location: 'Rajiv Chowk Metro Station',
    installationDate: '15-Dec-2019',
    lastInspection: '22-Mar-2024',
  },
  {
    id: 'AST-2024-010',
    name: 'Street Light Network - Vasant Vihar',
    category: 'Electrical',
    status: 'Operational',
    zone: 'Zone 7 - New Delhi',
    department: 'Electrical Department',
    division: 'Central Division',
    subDivision: 'Central Sub-Division B',
    location: 'Vasant Vihar, Main Road',
    installationDate: '10-Oct-2020',
    lastInspection: '19-Mar-2024',
  },
  {
    id: 'AST-2024-011',
    name: 'Lodhi Garden Recreation Area',
    category: 'Parks',
    status: 'Maintenance',
    zone: 'Zone 7 - New Delhi',
    department: 'Horticulture Department',
    division: 'Central Division',
    subDivision: 'Central Sub-Division A',
    location: 'Lodhi Road, Near India Habitat Centre',
    installationDate: '18-Jan-2015',
    lastInspection: '10-Mar-2024',
  },
  {
    id: 'AST-2024-012',
    name: 'Storm Water Drain System - East Zone',
    category: 'Drains',
    status: 'Defective',
    zone: 'Zone 3 - East Delhi',
    department: 'Drainage Department',
    division: 'East Division',
    subDivision: 'East Sub-Division B',
    location: 'Mayur Vihar, Phase III',
    installationDate: '30-Jul-2016',
    lastInspection: '05-Mar-2024',
  },
];

export default function AssetListScreen() {
  const params = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState('');

  // Get filter params from advanced search
  const filterZone = params.zone as string || '';
  const filterDepartment = params.department as string || '';
  const filterDivision = params.division as string || '';
  const filterSubDivision = params.subDivision as string || '';
  const filterAssetCategory = params.assetCategory as string || '';
  const filterSearchText = params.searchText as string || '';

  const navigateBack = () => {
    router.push('/(drawer)/search-asset');
  };

  const navigateToAssetDetails = (assetId: string) => {
    router.push({
      pathname: '/(drawer)/asset-inspection-details',
      params: { assetId },
    });
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  // Filter assets based on search query and advanced search filters
  const filteredAssets = useMemo(() => {
    let assets = ALL_ASSETS;

    // Apply advanced search filters
    if (filterZone) {
      assets = assets.filter((asset) => asset.zone === filterZone);
    }
    if (filterDepartment) {
      assets = assets.filter((asset) => asset.department === filterDepartment);
    }
    if (filterDivision) {
      assets = assets.filter((asset) => asset.division === filterDivision);
    }
    if (filterSubDivision) {
      assets = assets.filter((asset) => asset.subDivision === filterSubDivision);
    }
    if (filterAssetCategory) {
      assets = assets.filter((asset) => asset.category === filterAssetCategory);
    }
    if (filterSearchText) {
      const searchTextLower = filterSearchText.toLowerCase().trim();
      assets = assets.filter((asset) => {
        const nameMatch = asset.name.toLowerCase().includes(searchTextLower);
        const idMatch = asset.id.toLowerCase().includes(searchTextLower);
        return nameMatch || idMatch;
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
  }, [searchQuery, filterZone, filterDepartment, filterDivision, filterSubDivision, filterAssetCategory, filterSearchText]);

  const renderAssetItem = ({ item }: { item: Asset }) => (
    <AssetCard
      asset={item}
      onPress={() => navigateToAssetDetails(item.id)}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="search-outline" size={64} color={COLORS.textLight} />
      <Text style={styles.emptyStateTitle}>No assets found</Text>
      <Text style={styles.emptyStateText}>
        No assets match your search criteria.{'\n'}
        Try adjusting your search terms.
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

        {/* List */}
        <FlatList
          data={filteredAssets}
          renderItem={renderAssetItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={searchQuery.length > 0 ? renderEmptyState : null}
          keyboardShouldPersistTaps="handled"
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
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  // Search Bar Styles
  searchContainer: {
    backgroundColor: COLORS.cardBackground,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.searchBarBackground,
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
  // Empty State Styles
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
    padding: 16,
  },
  // Asset Card Styles
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTopRow: {
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
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  assetName: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
    lineHeight: 22,
  },
  assetMetadata: {
    fontSize: 13,
    fontWeight: '400',
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  additionalInfo: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 12,
    color: COLORS.textLight,
    marginLeft: 6,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 12,
  },
  viewDetailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewDetailsText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginRight: 4,
  },
});
