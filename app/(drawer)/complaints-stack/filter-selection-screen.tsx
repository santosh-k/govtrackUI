import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  FlatList,
  Platform,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { setSelection } from '@/src/store/selectionSlice';
import { AppDispatch } from '@/src/store';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  selectZones,
  selectCircles,
  selectDivisions,
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
  textLight: '#9E9E9E',
  primary: '#FF9800',
  border: '#E0E0E0',
  divider: '#EEEEEE',
  hover: '#F9F9F9'
};

interface Item {
  id: string | number;
  name: string;
  designation?: string;
}

export default function FilterSelectionScreen() {
  const params = useLocalSearchParams();
  const title = params.title as string;
  const itemsParam = params.items as string;
  const fallbackItems = itemsParam ? (JSON.parse(itemsParam) as Item[]) : [];
  const field = params.field as string;
  const type = params.type as string;
  const fromSearch = params.fromSearch as string;

  const [searchQuery, setSearchQuery] = useState('');
  const dispatch = useDispatch<AppDispatch>();

  // Get Redux data for zones/circles/divisions
  const zones = useSelector(selectZones);
  const circles = useSelector(selectCircles);
  const divisions = useSelector(selectDivisions);
  const isLoadingZones = useSelector(selectIsLoadingZones);
  const isLoadingCircles = useSelector(selectIsLoadingCircles);
  const isLoadingDivisions = useSelector(selectIsLoadingDivisions);
  const locationError = useSelector(selectLocationError);

  // Determine which data to use based on type, with fallback to route params
  const items = useMemo(() => {
    console.log('🔄 Determining items for type:', type, 'zones:', zones.length, 'circles:', circles.length, 'divisions:', divisions.length);
    
    if (type === 'zone' && zones.length > 0) {
      console.log('✅ Using Redux zones data');
      return zones;
    } else if (type === 'circle' && circles.length > 0) {
      console.log('✅ Using Redux circles data');
      return circles;
    } else if (type === 'division' && divisions.length > 0) {
      console.log('✅ Using Redux divisions data');
      return divisions;
    } else {
      console.log('⚠️ Using fallback data from route params');
      return fallbackItems;
    }
  }, [type, zones, circles, divisions, fallbackItems]);

  const isLoading = useMemo(() => {
    if (type === 'zone') return isLoadingZones;
    if (type === 'circle') return isLoadingCircles;
    if (type === 'division') return isLoadingDivisions;
    return false;
  }, [type, isLoadingZones, isLoadingCircles, isLoadingDivisions]);

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectItem = (item: Item) => {
    console.log('handleSelectItem called with:', { type, item });
    if (fromSearch === 'true' && global.searchSelectionCallback) {
      // Use search callback for search screen
      console.log('Calling searchSelectionCallback with:', { type, item });
      global.searchSelectionCallback(type, { id: item.id, name: item.name });
      // Go back to complaint-search screen
      router.back();
    } else {
      // Use filter callback for filter/complaints list
      if (global.filterSelectionCallback) {
        global.filterSelectionCallback(type || field, { id: item.id, name: item.name });
      }
      // Dispatch selection to Redux and go back
      dispatch(setSelection({ field, item, complaintId: params.complaintId as string }));
      router.back();
    }
  };

  const renderItem = ({ item }: { item: Item }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => handleSelectItem(item)}
      activeOpacity={0.7}
    >
      <View style={styles.itemContent}>
        <Text style={styles.itemName}>{item.name}</Text>
        {item.designation && (
          <Text style={styles.itemDesignation}>{item.designation}</Text>
        )}
      </View>
      <Ionicons name="checkmark" size={24} color={COLORS.primary} style={styles.checkIcon} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
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

        <Text style={styles.headerTitle}>{title}</Text>

        <View style={styles.headerSpacer} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={COLORS.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            placeholderTextColor={COLORS.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={COLORS.textLight} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading {type}...</Text>
        </View>
      ) : locationError ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#D32F2F" />
          <Text style={styles.errorText}>{locationError}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          renderItem={renderItem}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={48} color={COLORS.textLight} />
              <Text style={styles.emptyText}>No results found</Text>
              <Text style={styles.emptySubtext}>Try a different search term</Text>
            </View>
          )}
        />
      )}
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
    backgroundColor: COLORS.background,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    padding: 0,
  },
  listContent: {
    flexGrow: 1,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.cardBackground,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 4,
  },
  itemDesignation: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.textSecondary,
  },
  checkIcon: {
    opacity: 0,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginLeft: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.textLight,
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#D32F2F',
    marginTop: 16,
    textAlign: 'center',
  },
});
