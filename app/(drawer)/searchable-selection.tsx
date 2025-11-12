import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  FlatList,
  Platform,
  TextInput,
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
  hover: '#F9F9F9',
};

interface Item {
  id: string;
  name: string;
  designation?: string;
}

export default function SearchableSelectionScreen() {
  const params = useLocalSearchParams();
  const title = params.title as string;
  const items = JSON.parse(params.items as string) as Item[];
  // const returnTo = params.returnTo as string; // Reserved for future use
  const field = params.field as string;

  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectItem = (item: Item) => {
    // Navigate back to assign-complaint with the selected item
    router.replace({
      pathname: '/assign-complaint',
      params: {
        selectedItem: JSON.stringify(item),
        selectedField: field,
        complaintId: params.complaintId as string,
      },
    });
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
      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
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
});
