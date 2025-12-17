import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import selectionData from '@/data/selectionData.json';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  background: '#F5F5F5',
  cardBackground: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#666666',
  textLight: '#9E9E9E',
  border: '#E0E0E0',
  primary: '#FF9800',
  inputBackground: '#F8F8F8',
  selectedBackground: '#FFF3E0',
};

interface SelectionItem {
  id: string;
  name: string;
}

type DataKey = 'zones' | 'departments' | 'divisions' | 'subDivisions' | 'projectTypes' | 'taskCategories' | 'issueTypes' | 'assetCategories' | 'locationTypes' | 'affectedAreas' | 'waterLoggingCauses' | 'trafficImpacts' | 'severities' | 'circles' | 'sectors' | 'subSectors' | 'fundingTypes' | 'workTypes' | 'projectStatuses';

export default function TaskDataSelectionScreen() {
  const params = useLocalSearchParams();
  const title = params.title as string;
  const dataKey = params.dataKey as string; // accept dynamic keys like 'taskProjects' and 'taskInspections'
  const currentValue = params.currentValue as string;
  const returnField = params.returnField as string;
  const returnTo = params.returnTo as string;

  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<SelectionItem[]>([]);

  // Get data either from API (for some keys) or from local JSON
  const allData: SelectionItem[] = useMemo(() => {
    // If items are populated from API for the current key, prefer them
    if (items && items.length > 0) return items;
    // Fallback to static file
    return ((selectionData as any)[dataKey] || []) as SelectionItem[];
  }, [dataKey, items]);

  // Filter data based on search query (client-side)
  const filteredData = useMemo(() => {
    if (searchQuery.trim() === '') {
      return allData;
    }
    return allData.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allData, searchQuery]);

  // Fetchers for dynamic keys
  const fetchProjects = async (query = '') => {
    try {
      setLoading(true);
      const ApiManagerModule = await import('@/src/services/ApiManager');
      const ApiManager = ApiManagerModule.default;
      const api = ApiManager.getInstance();
      const res = await api.searchProjectList(query, 1, 50);
      if (res && res.success && Array.isArray(res.data)) {
        const mapped = res.data.map((p: any) => ({ id: String(p.id), name: `${p.project_id} - ${p.project_name}` }));
        setItems(mapped);
      } else {
        setItems([]);
      }
    } catch (err) {
      console.warn('searchProjectList error', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchInspections = async () => {
    try {
      setLoading(true);
      const ApiManagerModule = await import('@/src/services/ApiManager');
      const ApiManager = ApiManagerModule.default;
      const api = ApiManager.getInstance();
      const res = await api.fetchFilteredInspections();
      if (res && res.success && Array.isArray(res.data)) {
        const mapped = res.data.map((it: any) => ({ id: String(it.id), name: `${it.title} (${it.inspection_type}) - ${it.project?.project_id || ''}` }));
        setItems(mapped);
      } else {
        setItems([]);
      }
    } catch (err) {
      console.warn('fetchFilteredInspections error', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Generic fetch helpers for departments/zones/circles/divisions/subdivisions/designation/users
  const fetchDepartmentOptions = async () => {
    try {
      setLoading(true);
      const ApiManagerModule = await import('@/src/services/ApiManager');
      const ApiManager = ApiManagerModule.default;
      const api = ApiManager.getInstance();
      const res = await api.getFilterDepartmentOption();
      if (res && res.success && Array.isArray(res.data)) {
        setItems(res.data.map((d: any) => ({ id: String(d.id), name: d.name })));
      } else setItems([]);
    } catch (err) {
      console.warn('getFilterDepartmentOption error', err);
      setItems([]);
    } finally { setLoading(false); }
  };

  const fetchZones = async () => {
    try {
      setLoading(true);
      const ApiManagerModule = await import('@/src/services/ApiManager');
      const ApiManager = ApiManagerModule.default;
      const api = ApiManager.getInstance();
      const res = await api.fetchZones();
      if (res && res.success && Array.isArray(res.data)) {
        setItems(res.data.map((z: any) => ({ id: String(z.id), name: z.name })));
      } else setItems([]);
    } catch (err) {
      console.warn('fetchZones error', err);
      setItems([]);
    } finally { setLoading(false); }
  };

  const fetchCircles = async () => {
    try {
      setLoading(true);
      const zoneId = params.zoneId as string | undefined;
      if (!zoneId) {
        // No zone selected — nothing to fetch
        setItems([]);
        return;
      }

      const ApiManagerModule = await import('@/src/services/ApiManager');
      const ApiManager = ApiManagerModule.default;
      const api = ApiManager.getInstance();
      const res = await api.fetchCircles(zoneId);
      if (res && res.success && Array.isArray(res.data)) {
        setItems(res.data.map((c: any) => ({ id: String(c.id), name: c.name })));
      } else setItems([]);
    } catch (err) {
      console.warn('fetchCircles error', err);
      setItems([]);
    } finally { setLoading(false); }
  };

  const fetchDivisions = async () => {
    try {
      setLoading(true);
      const circleId = params.circleId as string | undefined;
      if (!circleId) {
        setItems([]);
        return;
      }

      const ApiManagerModule = await import('@/src/services/ApiManager');
      const ApiManager = ApiManagerModule.default;
      const api = ApiManager.getInstance();
      const res = await api.fetchDivisions(circleId);
      if (res && res.success && Array.isArray(res.data)) {
        setItems(res.data.map((d: any) => ({ id: String(d.id), name: d.name })));
      } else setItems([]);
    } catch (err) {
      console.warn('fetchDivisions error', err);
      setItems([]);
    } finally { setLoading(false); }
  };

  const fetchSubDivisions = async () => {
    try {
      setLoading(true);
      const divisionId = params.divisionId as string | undefined;
      if (!divisionId) {
        setItems([]);
        return;
      }

      const ApiManagerModule = await import('@/src/services/ApiManager');
      const ApiManager = ApiManagerModule.default;
      const api = ApiManager.getInstance();
      const res = await api.fetchSubDivisions(divisionId);
      if (res && res.success && Array.isArray(res.data)) {
        setItems(res.data.map((s: any) => ({ id: String(s.id), name: s.name })));
      } else setItems([]);
    } catch (err) {
      console.warn('fetchSubDivisions error', err);
      setItems([]);
    } finally { setLoading(false); }
  };

  const fetchAssignmentOptions = async () => {
    try {
      setLoading(true);
      const ApiManagerModule = await import('@/src/services/ApiManager');
      const ApiManager = ApiManagerModule.default;
      const api = ApiManager.getInstance();
      const res = await api.getAssignmentOptions();
      if (res && res.success && res.data) {
        // designations and users
        if (dataKey === 'designation') {
          setItems((res.data.designations || []).map((d: any) => ({ id: String(d.id), name: d.name })));
        } else if (dataKey === 'user') {
          setItems((res.data.users || []).map((u: any) => ({ id: String(u.id), name: u.name })));
        }
      } else setItems([]);
    } catch (err) {
      console.warn('getAssignmentOptions error', err);
      setItems([]);
    } finally { setLoading(false); }
  };

  // Fetch on mount or when dataKey changes
  React.useEffect(() => {
    setItems([]); // reset
    if (dataKey === 'taskProjects') {
      fetchProjects('');
    } else if (dataKey === 'taskInspections') {
      fetchInspections();
    } else if (dataKey === 'departments') {
      fetchDepartmentOptions();
    } else if (dataKey === 'zone' || dataKey === 'zones') {
      fetchZones();
    } else if (dataKey === 'circle' || dataKey === 'circles') {
      fetchCircles();
    } else if (dataKey === 'division' || dataKey === 'divisions') {
      fetchDivisions();
    } else if (dataKey === 'subDivision' || dataKey === 'subDivisions') {
      fetchSubDivisions();
    } else if (dataKey === 'designation' || dataKey === 'user') {
      fetchAssignmentOptions();
    } else {
      // static data (selectionData) will be used
      setLoading(false);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataKey]);

  // Debounce search for project API
  React.useEffect(() => {
    if (dataKey === 'taskProjects') {
      const t = setTimeout(() => {
        fetchProjects(searchQuery);
      }, 400);
      return () => clearTimeout(t);
    }
    // for other keys, items are filtered client-side
  }, [searchQuery, dataKey]);

  const handleBack = () => {
    router.back();
  };

  const handleSelectItem = (item: SelectionItem) => {
    // Navigate back to the calling screen with the selected value
    // If returnTo starts with '/', it's a full path (don't prepend drawer)
    // Otherwise, it's a drawer-relative path
    let pathname: any;
    if (returnTo) {
      pathname = returnTo.startsWith('/')
        ? returnTo
        : `/(drawer)/${returnTo}`;
    } else {
      pathname = '/(drawer)/advanced-project-search';
    }

    // Preserve all params except the selection-specific ones
    const { title: _title, dataKey: _dataKey, currentValue: _currentValue, returnField: _returnField, returnTo: _returnTo, ...restParams } = params;

    // also pass an ID param if helpful (e.g., selectedProjectId, selectedInspectionId)
    const extraIdParam: any = {};
    if (item && item.id) {
      extraIdParam[`${returnField}Id`] = item.id;
    }

    router.push({
      pathname,
      params: {
        ...restParams,
        [returnField]: item.name,
        ...extraIdParam,
      },
    });
  };

  const renderItem = ({ item }: { item: SelectionItem }) => {
    const isSelected = item.name === currentValue;

    return (
      <TouchableOpacity
        style={[styles.listItem, isSelected && styles.listItemSelected]}
        onPress={() => handleSelectItem(item)}
        activeOpacity={0.7}
      >
        <Text style={[styles.listItemText, isSelected && styles.listItemTextSelected]}>
          {item.name}
        </Text>
        {isSelected && (
          <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
        )}
      </TouchableOpacity>
    );
  };

  const renderSeparator = () => <View style={styles.separator} />;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.cardBackground} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.6}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={COLORS.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            placeholderTextColor={COLORS.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* List */}
      <FlatList
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={renderSeparator}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          loading ? (
            <View style={styles.emptyState}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.emptyStateText}>Loading...</Text>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={64} color={COLORS.textLight} />
              <Text style={styles.emptyStateText}>No results found</Text>
              <Text style={styles.emptyStateSubtext}>
                Try searching with different keywords
              </Text>
            </View>
          )
        }
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
  searchContainer: {
    backgroundColor: COLORS.cardBackground,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBackground,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    marginLeft: 10,
    paddingVertical: 0,
  },
  listContent: {
    flexGrow: 1,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.cardBackground,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  listItemSelected: {
    backgroundColor: COLORS.selectedBackground,
  },
  listItemText: {
    fontSize: 15,
    color: COLORS.text,
    flex: 1,
    fontWeight: '400',
  },
  listItemTextSelected: {
    fontWeight: '600',
    color: COLORS.primary,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
});
