/**
 * Complaint Dashboard - Pastel Grid Design v3.0
 * Two-column grid with vertically centered, pastel-colored cards
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { DrawerActions, useNavigation } from '@react-navigation/native';

const COLORS = {
  background: '#F8F9FA',
  cardBackground: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#666666',
  textLight: '#9E9E9E',
  primary: '#FF9800',
  border: '#E8E8E8',

  // Soft pastel card background colors (entire card)
  pastelBlue: '#D4E9F7',
  pastelPink: '#FFE4E9',
  pastelPurple: '#E8D7F1',
  pastelGreen: '#D8F3DC',
  pastelYellow: '#FFF4D6',
  pastelPeach: '#FFE5D4',
  pastelLavender: '#E6DFF3',
  pastelMint: '#D3F5F7',

  // Icon colors (darker for contrast on pastel backgrounds)
  iconBlue: '#1976D2',
  iconPink: '#C2185B',
  iconPurple: '#7B1FA2',
  iconGreen: '#2E7D32',
  iconOrange: '#F57C00',
  iconTeal: '#00838F',
  iconGrey: '#424242',
  iconPeach: '#D84315',
};

type QuickFilter = 'today' | 'week' | 'month' | 'custom';

interface StatCardProps {
  title: string;
  value: number;
  icon: keyof typeof Ionicons.glyphMap;
  backgroundColor: string;
  iconColor: string;
  filterType: string;
  onPress: () => void;
}

function StatCard({ title, value, icon, backgroundColor, iconColor, onPress }: StatCardProps) {
  return (
    <TouchableOpacity
      style={[styles.statCard, { backgroundColor }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        {/* Top: Line-art icon */}
        <Ionicons name={icon} size={48} color={iconColor} />

        {/* Middle: Large bold number */}
        <Text style={styles.statNumber}>{value.toLocaleString()}</Text>

        {/* Bottom: Clear label */}
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function ComplaintDashboardScreen() {
  const navigation = useNavigation();
  const [selectedFilter, setSelectedFilter] = useState<QuickFilter>('month');
  const [dateRange, setDateRange] = useState('01 Jan - 31 Jan');

  // Simulated stats - would come from API based on selected filter
  const stats = {
    total: 1247,
    pending: 342,
    inProgress: 156,
    completed: 689,
    assignedByYou: 89,
    completedByYou: 54,
    closed: 60,
  };

  const handleFilterChange = (filter: QuickFilter) => {
    if (filter === 'custom') {
      handleCustomDateRange();
      return;
    }

    setSelectedFilter(filter);
    // Update date range display based on filter
    const today = new Date();
    switch (filter) {
      case 'today':
        const todayStr = today.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
        setDateRange(todayStr);
        break;
      case 'week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        setDateRange(`${weekStart.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} - ${weekEnd.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}`);
        break;
      case 'month':
        setDateRange('01 Jan - 31 Jan');
        break;
    }
  };

  const handleStatCardPress = (filterType: string, title: string) => {
    // Navigate to complaints list with pre-applied filter and title
    router.push({
      pathname: '/complaints-list',
      params: {
        filter: filterType,
        title: title,
        fromDashboard: 'true',
      },
    });
  };

  const handleCustomDateRange = () => {
    // TODO: Open date picker modal
    console.log('Open date picker');
  };

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.cardBackground} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={openDrawer}
          activeOpacity={0.6}
        >
          <Ionicons name="menu" size={28} color={COLORS.text} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Complaints Dashboard</Text>

        <View style={styles.headerSpacer} />
      </View>

      {/* Horizontal Filter Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterPillsContainer}
        style={styles.filterPillsScroll}
      >
        <TouchableOpacity
          style={[
            styles.filterPill,
            selectedFilter === 'today' && styles.filterPillActive,
          ]}
          onPress={() => handleFilterChange('today')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.filterPillText,
              selectedFilter === 'today' && styles.filterPillTextActive,
            ]}
          >
            Today
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterPill,
            selectedFilter === 'week' && styles.filterPillActive,
          ]}
          onPress={() => handleFilterChange('week')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.filterPillText,
              selectedFilter === 'week' && styles.filterPillTextActive,
            ]}
          >
            This Week
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterPill,
            selectedFilter === 'month' && styles.filterPillActive,
          ]}
          onPress={() => handleFilterChange('month')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.filterPillText,
              selectedFilter === 'month' && styles.filterPillTextActive,
            ]}
          >
            This Month
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterPill, styles.customRangePill]}
          onPress={() => handleFilterChange('custom')}
          activeOpacity={0.7}
        >
          <Ionicons name="calendar-outline" size={18} color={COLORS.textSecondary} />
          <Text style={styles.filterPillText}>{dateRange}</Text>
          <Ionicons name="chevron-down" size={16} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </ScrollView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Complaints"
            value={stats.total}
            icon="documents-outline"
            backgroundColor={COLORS.pastelBlue}
            iconColor={COLORS.iconBlue}
            filterType="all"
            onPress={() => handleStatCardPress('all', 'All Complaints')}
          />

          <StatCard
            title="Pending"
            value={stats.pending}
            icon="time-outline"
            backgroundColor={COLORS.pastelPink}
            iconColor={COLORS.iconPink}
            filterType="pending"
            onPress={() => handleStatCardPress('pending', 'Pending Complaints')}
          />

          <StatCard
            title="In Progress"
            value={stats.inProgress}
            icon="sync-outline"
            backgroundColor={COLORS.pastelPurple}
            iconColor={COLORS.iconPurple}
            filterType="inProgress"
            onPress={() => handleStatCardPress('inProgress', 'In Progress Complaints')}
          />

          <StatCard
            title="Completed"
            value={stats.completed}
            icon="checkmark-circle-outline"
            backgroundColor={COLORS.pastelGreen}
            iconColor={COLORS.iconGreen}
            filterType="completed"
            onPress={() => handleStatCardPress('completed', 'Completed Complaints')}
          />

          <StatCard
            title="Assigned by You"
            value={stats.assignedByYou}
            icon="person-add-outline"
            backgroundColor={COLORS.pastelYellow}
            iconColor={COLORS.iconOrange}
            filterType="assignedByYou"
            onPress={() => handleStatCardPress('assignedByYou', 'Assigned by You')}
          />

          <StatCard
            title="Completed by You"
            value={stats.completedByYou}
            icon="checkmark-done-outline"
            backgroundColor={COLORS.pastelMint}
            iconColor={COLORS.iconTeal}
            filterType="completedByYou"
            onPress={() => handleStatCardPress('completedByYou', 'Completed by You')}
          />

          <StatCard
            title="Closed"
            value={stats.closed}
            icon="close-circle-outline"
            backgroundColor={COLORS.pastelPeach}
            iconColor={COLORS.iconPeach}
            filterType="closed"
            onPress={() => handleStatCardPress('closed', 'Closed Complaints')}
          />
        </View>
      </ScrollView>
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
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  menuButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  headerSpacer: {
    width: 44,
  },
  filterPillsScroll: {
    backgroundColor: COLORS.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterPillsContainer: {
    paddingHorizontal: 6,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 8,
  },
  filterPill: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
  },
  filterPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  customRangePill: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 20,
  },
  filterPillText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  filterPillTextActive: {
    color: COLORS.cardBackground,
  },
  scrollView: {
    flex: 0,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statCard: {
    width: '47%',
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  cardContent: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  statNumber: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -1,
  },
  statTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
