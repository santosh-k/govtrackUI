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

  // Soft pastel colors for icon circle backgrounds
  pastelBlue: '#E3F2FD',
  pastelPink: '#FCE4EC',
  pastelPurple: '#F3E5F5',
  pastelGreen: '#E8F5E9',
  pastelYellow: '#FFF9E6',
  pastelPeach: '#FFE8DC',
  pastelLavender: '#EDE7F6',
  pastelMint: '#E0F7FA',

  // Vibrant colors for icons (white icons on these backgrounds)
  iconBlue: '#42A5F5',
  iconPink: '#EC407A',
  iconPurple: '#AB47BC',
  iconGreen: '#66BB6A',
  iconOrange: '#FFA726',
  iconTeal: '#26C6DA',
  iconGrey: '#78909C',
  iconPeach: '#FF7043',
};

type QuickFilter = 'today' | 'week' | 'month' | 'custom';

interface StatCardProps {
  title: string;
  value: number;
  icon: keyof typeof Ionicons.glyphMap;
  iconCircleColor: string;
  iconBackgroundColor: string;
  filterType: string;
  onPress: () => void;
}

function StatCard({ title, value, icon, iconCircleColor, iconBackgroundColor, onPress }: StatCardProps) {
  return (
    <TouchableOpacity
      style={styles.statCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        {/* Left: Colored circle with white icon */}
        <View style={[styles.iconCircle, { backgroundColor: iconBackgroundColor }]}>
          <Ionicons name={icon} size={28} color="#FFFFFF" />
        </View>

        {/* Right: Stats info (number on top, label below) */}
        <View style={styles.statsInfo}>
          <Text style={styles.statNumber}>{value.toLocaleString()}</Text>
          <Text style={styles.statTitle}>{title}</Text>
        </View>
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
            iconCircleColor={COLORS.pastelBlue}
            iconBackgroundColor={COLORS.iconBlue}
            filterType="all"
            onPress={() => handleStatCardPress('all', 'All Complaints')}
          />

          <StatCard
            title="Pending"
            value={stats.pending}
            icon="time-outline"
            iconCircleColor={COLORS.pastelPink}
            iconBackgroundColor={COLORS.iconPink}
            filterType="pending"
            onPress={() => handleStatCardPress('pending', 'Pending Complaints')}
          />

          <StatCard
            title="In Progress"
            value={stats.inProgress}
            icon="sync-outline"
            iconCircleColor={COLORS.pastelPurple}
            iconBackgroundColor={COLORS.iconPurple}
            filterType="inProgress"
            onPress={() => handleStatCardPress('inProgress', 'In Progress Complaints')}
          />

          <StatCard
            title="Completed"
            value={stats.completed}
            icon="checkmark-circle-outline"
            iconCircleColor={COLORS.pastelGreen}
            iconBackgroundColor={COLORS.iconGreen}
            filterType="completed"
            onPress={() => handleStatCardPress('completed', 'Completed Complaints')}
          />

          <StatCard
            title="Assigned by You"
            value={stats.assignedByYou}
            icon="person-add-outline"
            iconCircleColor={COLORS.pastelYellow}
            iconBackgroundColor={COLORS.iconOrange}
            filterType="assignedByYou"
            onPress={() => handleStatCardPress('assignedByYou', 'Assigned by You')}
          />

          <StatCard
            title="Completed by You"
            value={stats.completedByYou}
            icon="checkmark-done-outline"
            iconCircleColor={COLORS.pastelMint}
            iconBackgroundColor={COLORS.iconTeal}
            filterType="completedByYou"
            onPress={() => handleStatCardPress('completedByYou', 'Completed by You')}
          />

          <StatCard
            title="Closed"
            value={stats.closed}
            icon="close-circle-outline"
            iconCircleColor={COLORS.pastelPeach}
            iconBackgroundColor={COLORS.iconPeach}
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  filterPill: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  customRangePill: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 12,
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  filterPillTextActive: {
    color: COLORS.cardBackground,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  statsGrid: {
    gap: 12,
  },
  statCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 16,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsInfo: {
    flex: 1,
    gap: 4,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
});
