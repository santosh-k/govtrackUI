import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';

interface ComplaintItem {
  id: string;
  category: string;
  total: number;
  inProgress: number;
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

const dummyData: ComplaintItem[] = [
  { id: '1', category: 'Street Light', total: 25, inProgress: 8, closed: 7 },
  { id: '2', category: 'Pot Hole', total: 12, inProgress: 5, closed: 3 },
  { id: '3', category: 'Damaged Road', total: 18, inProgress: 7, closed: 5 },
  { id: '4', category: 'Garbage', total: 9, inProgress: 3, closed: 4 },
  { id: '5', category: 'Water Leakage', total: 14, inProgress: 4, closed: 5 },
];

const TABS = ["Cateogeory", "Zone", "Circle"];

const ComplaintGroup: React.FC<ComplaintGroupProps> = ({ params = {} }) => {
  const [activeTab, setActiveTab] = useState("Cateogeory");
  const router = useRouter();
  // ---------------- FILTER TABLE DATA BASED ON TAB ----------------
  const filteredData = dummyData.filter(item => {
    if (activeTab === "Cateogeory") return true;
    if (activeTab === "Zone") return item.inProgress > 0;
    if (activeTab === "Circle") return item.closed > 0;
    return true;
  });
const onSelect = (item: ComplaintItem) => { 
    router.push({ pathname: '/complaints-stack/complaints-list', 
        params: { ...params, // passed from parent screen groupType: item.category, groupId: item.id,
         },
    }); };
  const renderRow = ({ item }: { item: ComplaintItem }) => (
    <Pressable
      style={({ pressed }) => [
        styles.tableRow,
        pressed && { backgroundColor: COLORS.lightPrimary },
      ]}
      android_ripple={{ color: COLORS.lightPrimary }}
      onPress={() => onSelect(item)}>
      <Text style={[styles.cell, styles.categoryCell]}>{item.category}</Text>
      <Text style={styles.cell}>{item.total}</Text>
      <Text style={styles.cell}>{item.inProgress}</Text>
      <Text style={styles.cell}>{item.closed}</Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
    <Text style={styles.sectionTitle}>Complaint Summary</Text>

      {/* ---------------- TABS UI ---------------- */}
      <View style={styles.tabContainer}>
        {TABS.map(tab => (
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
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ---------------- TABLE HEADER ---------------- */}
      <View style={styles.tableHeader}>
        <Text style={[styles.headerCell, styles.categoryCell]}>Category</Text>
        <Text style={styles.headerCell}>Total</Text>
        <Text style={styles.headerCell}>Progress</Text>
        <Text style={styles.headerCell}>Closed</Text>
      </View>

      {/* ---------------- TABLE LIST ---------------- */}
      <FlatList
        data={filteredData}
        renderItem={renderRow}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
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
    paddingVertical: 14,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },

  cell: {
    flex: 1,
    textAlign: "center",
    fontSize: 14,
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
