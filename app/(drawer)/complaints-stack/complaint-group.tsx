import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '@/src/store';

interface ComplaintItem {
  category_id: number;
  name: string;
  total: number;
  progress: number;
  closed: number;
}

interface ComplaintGroupProps {
  params?: Record<string, any>;
}

const COLORS = {
  background: '#F5F5F5',
  text: '#1A1A1A',
  cardBackground: '#FFFFFF',
  border: '#D9D9D9',
  primary: '#007AFF',
  lightPrimary: '#E6F0FF',
};

const ComplaintGroup: React.FC<ComplaintGroupProps> = ({ params = {} }) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('division');

  // Get stats data from Redux
  const statsData = useSelector((state: RootState) => state.stats.data);
  const statsLoading = useSelector((state: RootState) => state.stats.isLoading);

  // Debug logging
  useEffect(() => {
    console.log('ComplaintGroup - statsData:', statsData);
    console.log('ComplaintGroup - statsLoading:', statsLoading);
    console.log('ComplaintGroup - complaint_summary:', statsData?.complaint_summary);
  }, [statsData, statsLoading]);

  // Get tabs and data from complaint_summary
  const tabs = useMemo(() => {
    const tabsFromRedux = statsData?.complaint_summary?.tabs ?? [];
    console.log('ComplaintGroup - tabs from Redux:', tabsFromRedux);
    return tabsFromRedux.length > 0 ? tabsFromRedux : ['division', 'zone', 'circle'];
  }, [statsData]);

  // Get the data for the active tab
  const complaintData = useMemo(() => {
    const summaryData = statsData?.complaint_summary?.data;
    if (!summaryData) {
      console.log('ComplaintGroup - No summary data available');
      return [];
    }

    // Cast activeTab to valid tab type
    const tabKey = activeTab as keyof typeof summaryData;
    const data = summaryData[tabKey] ?? [];
    console.log('ComplaintGroup - data for tab', activeTab, ':', data);
    return data;
  }, [statsData, activeTab]);

  const onSelect = (item: ComplaintItem) => {
    // Get dateFilter from params or default to 'all'
    const dateFilter = params.dateFilter || 'all';
    const selectedStartDate = params.start_date;
    const selectedEndDate = params.end_date;

    const navigationParams: any = {
      ...params,
      // Add complaint summary specific params
      groupType: item.name,
      groupId: item.category_id,
      categoryId: item.category_id, // Add category_id as a filter for the API
      categoryName: item.name,
      // Preserve date filter params
      dateFilter,
    };

    // Add custom date params if they exist
    if (selectedStartDate) {
      navigationParams.start_date = selectedStartDate;
    }
    if (selectedEndDate) {
      navigationParams.end_date = selectedEndDate;
    }

    console.log('ComplaintGroup - Navigation params:', navigationParams);

    router.push({
      pathname: '/complaints-stack/complaints-list',
      params: navigationParams,
    });
  };

  const renderRow = ({ item }: { item: ComplaintItem }) => (
    <Pressable
      style={({ pressed }) => [
        styles.tableRow,
        pressed && { backgroundColor: COLORS.lightPrimary },
      ]}
      android_ripple={{ color: COLORS.lightPrimary }}
      onPress={() => onSelect(item)}
    >
      <Text style={[styles.cell, styles.categoryCell]}>{item.name}</Text>
      <Text style={styles.cell}>{item.total}</Text>
      <Text style={styles.cell}>{item.progress}</Text>
      <Text style={styles.cell}>{item.closed}</Text>
    </Pressable>
  );

  if (statsLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Complaint Summary</Text>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Complaint Summary</Text>

      {/* TABS UI */}
      <View style={styles.tabContainer}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[
              styles.tabButton,
              activeTab === tab && styles.activeTabButton,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* TABLE HEADER */}
      <View style={styles.tableHeader}>
        <Text style={[styles.headerCell, styles.categoryCell]}>Category</Text>
        <Text style={styles.headerCell}>Total</Text>
        <Text style={styles.headerCell}>Progress</Text>
        <Text style={styles.headerCell}>Closed</Text>
      </View>

      {/* TABLE LIST */}
      <FlatList
        data={complaintData}
        renderItem={renderRow}
        keyExtractor={(item) => item.category_id.toString()}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
        ListEmptyComponent={
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Text style={{ color: COLORS.border, fontSize: 14 }}>No data available</Text>
          </View>
        }
      />
    </View>
  );
};

export default ComplaintGroup;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 8,
    marginTop: 25
  },

  // ---------------- TABS ----------------
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },

  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: "#EFEFEF",
  },

  activeTabButton: {
    backgroundColor: COLORS.primary,
  },

  tabText: {
    color: "#444",
    fontSize: 13,
    fontWeight: "600",
  },

  activeTabText: {
    color: "#fff",
  },

  // ---------------- HEADER ----------------
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#EEE",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },

  headerCell: {
    flex: 1,
    fontWeight: "700",
    textAlign: "center",
    color: COLORS.text,
    fontSize: 13,
  },

  // ---------------- ROW ----------------
  tableRow: {
    flexDirection: "row",
    paddingVertical: 18,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },

  cell: {
    flex: 1,
    textAlign: "center",
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.text,
  },

  categoryCell: {
    flex: 2,
    textAlign: "left",
    paddingLeft: 12,
  },
  sectionTitle: {
  fontSize: 20,
  fontWeight: '700',
  color: COLORS.text,
  marginLeft: 16,
  marginBottom: 12,
  marginTop: 12,
},
});
