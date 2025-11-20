import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

// ---------- TYPES ----------
type ComplaintStatus = 'Submitted' | 'Assigned' | 'In Progress' | 'Closed' | 'ReOpened';

// ---------- COLORS ----------
const COLORS = {
  background: '#F5F5F5',
  cardBackground: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#666666',
  textLight: '#999999',
  border: '#E0E0E0',
  primary: '#2196F3',
};

// ---------- MAIN COMPONENT ----------
const ComplaintHistory = () => {
  const params = useLocalSearchParams();

  // history will now be ANY[] directly
  const receivedHistory: any[] = params.history
    ? JSON.parse(params.history as string)
    : [];

  const [activityHistory, setActivityHistory] = useState<any[]>([]);

  useEffect(() => {
    if (receivedHistory?.length) {
      setActivityHistory(receivedHistory);
    }
  }, []);

  // ---------- STATUS COLOR HELPER ----------
  const getStatusColors = (status: ComplaintStatus) => {
    switch (status) {
      case 'Submitted':
        return { text: '#383737ff'}
      case 'Assigned':
        return { text: '#2196F3' };
      case 'In Progress':
        return { text: '#FF9800' };
      case 'Closed':
        return { text: '#95d497ff' };
      case 'ReOpened':
        return { text: '#F44336' };
      default:
        return { text: COLORS.text };
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.tabContent}>
        {/* Header */}
        <View style={styles.header}>
        {/* Left: Back Arrow + Complaint ID */}
        <View style={styles.headerLeftSection}>
            <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.6}
            >
            <Ionicons name="arrow-back" size={28} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.headerComplaintId} numberOfLines={1}>
            Complaint History
            </Text>
        </View>
        </View>
        {activityHistory.length === 0 ? (
          <View style={styles.emptyActivityState}>
            <Ionicons name="time-outline" size={64} color={COLORS.textLight} />
            <Text style={styles.emptyActivityTitle}>No Activity Yet</Text>
            <Text style={styles.emptyActivityText}>
              Status updates will appear here
            </Text>
          </View>
        ) : (
          <FlatList
            data={activityHistory}
            keyExtractor={(item: any) => item.id}
            contentContainerStyle={styles.activityListContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => {
              const statusColors = getStatusColors(item.status);
              const isLast = index === activityHistory.length - 1;

              return (
                <View style={styles.timelineItem}>
                  {/* Timeline Node */}
                  <View style={styles.timelineLineContainer}>
                    <View style={[styles.timelineNode, { backgroundColor: statusColors.text }]} />
                    {!isLast && <View style={styles.timelineLine} />}
                  </View>

                  {/* Card */}
                  <View style={styles.activityCard}>
                    <Text style={[styles.activityStatusText, { color: statusColors.text }]}>
                      Status changed to {item.status}
                    </Text>

                    <Text style={styles.activityMeta}>
                      by{' '}
                      <Text style={styles.activityAuthor}>
                        {item.actionBy || 'Unknown'}
                      </Text>{' '}
                      ({item.designation || 'N/A'}) at {item.date}{' '} {item.time}
                    </Text>

                    {item.remarks && (
                      <Text style={styles.activityRemarks}>{item.remarks}</Text>
                    )}

                    {item.location && (
                      <View style={styles.activityLocationContainer}>
                        <Ionicons name="location" size={16} color={COLORS.primary} />
                        <Text style={styles.activityLocationText}>
                          {item.location.latitude.toFixed(4)}, {item.location.longitude.toFixed(4)}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default ComplaintHistory;

// ---------- STYLES ----------
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  tabContent: { flex: 1 },
  activityListContent: { padding: 16 },
  emptyActivityState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 80 },
  emptyActivityTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text, marginTop: 16, marginBottom: 8 },
  emptyActivityText: { fontSize: 14, color: COLORS.textSecondary },
  timelineItem: { flexDirection: 'row', marginBottom: 24 },
  timelineLineContainer: { width: 40, alignItems: 'center' },
  timelineNode: { width: 16, height: 16, borderRadius: 8, marginTop: 4 },
  timelineLine: { width: 2, flex: 1, backgroundColor: COLORS.border, marginTop: 8 },
  activityCard: { flex: 1, backgroundColor: COLORS.cardBackground, borderRadius: 12, padding: 16, marginLeft: 12 },
  activityStatusText: { fontSize: 16, fontWeight: '700' },
  activityMeta: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 12, lineHeight: 18 },
  activityAuthor: { fontWeight: '700', color: COLORS.text },
  activityRemarks: { fontSize: 14, color: COLORS.text, marginBottom: 12 },
  activityLocationContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background, padding: 8, borderRadius: 8, marginBottom: 12 },
  activityLocationText: { fontSize: 13, color: COLORS.textSecondary, marginLeft: 6 },
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
    headerLeftSection: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      gap: 8,
    },
    backButton: {
      padding: 8,
      marginLeft: -8,
    },
    headerComplaintId: {
      fontSize: 16,
      fontWeight: '600',
      color: COLORS.text,
      flex: 1,
    },
});
