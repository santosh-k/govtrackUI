/**
 * Complaint Dashboard - Pastel Grid Design v3.0
 * Two-column grid with vertically centered, pastel-colored cards
 */
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Platform,
  Modal,
  InteractionManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { DrawerActions, useNavigation,useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/src/store';
import { fetchStats } from '@/src/store/statsSlice';
import ComplaintGroup from '../complaints-stack/complaint-group';

const COLORS = {
  background: '#F8F9FA',
  cardBackground: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#666666',
  primary: '#FF9800',
  border: '#E8E8E8',

  // Soft pastel card background colors
  pastelBlue: '#D4E9F7',
  pastelPink: '#FFE4E9',
  pastelPurple: '#E8D7F1',
  pastelGreen: '#D8F3DC',
  pastelYellow: '#FFF4D6',
  pastelPeach: '#FFE5D4',
  pastelMint: '#D3F5F7',

  // Icon colors (darker for contrast on pastel backgrounds)
  iconBlue: '#1976D2',
  iconPink: '#C2185B',
  iconPurple: '#7B1FA2',
  iconGreen: '#2E7D32',
  iconOrange: '#F57C00',
  iconTeal: '#00838F',
  iconPeach: '#D84315',
};

type QuickFilter = 'all' | 'today' | 'week' | 'month' | 'custom';

interface StatCardProps {
  title: string;
  value: number;
  icon: keyof typeof Ionicons.glyphMap;
  backgroundColor: string;
  iconColor: string;
  filterType: string;
  datFilter: string;
  onPress: () => void;
}

function StatCard({ title, value, icon, backgroundColor, iconColor, datFilter, onPress }: StatCardProps) {
  return (
    <TouchableOpacity
      style={[styles.statCard, { backgroundColor }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        {/* Top: Line-art icon */}
        <Ionicons name={icon} size={28} color={iconColor} />

        {/* Middle: Large bold number */}
        <Text style={styles.statNumber}>{value.toLocaleString()}</Text>

        {/* Bottom: Clear label */}
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function ComplaintDashboardScreen() {

  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const [selectedFilter, setSelectedFilter] = useState<QuickFilter>('all');
  const [dateRange, setDateRange] = useState('01 Jan - 31 Jan');
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const [compStats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  
   

  // Map fetched stats or use defaults
  const stats = compStats ? {
    total: compStats?.overview?.total_complaints ?? 0,
    pending: compStats?.overview?.pending ?? 0,
    inProgress: compStats?.overview?.in_progress ?? 0,
    completed: compStats?.overview?.completed ?? 0,
    assignedByYou: compStats?.your_activity?.assigned_by_you ?? 0,
    completedByYou: compStats?.your_activity?.completed_by_you ?? 0,
    closed: compStats?.overview?.closed ?? 0,
  } : {
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    assignedByYou: 0,
    completedByYou: 0,
    closed: 0,
  };

  /** ✅ Fetch stats from API **/
  const handleFetchStats = async (filter: string, startDate?: string, endDate?: string) => {
    setLoading(true);
    setError(null);

    try {
      // Dynamic import to avoid circular dependency
      const { default: ApiManager } = await import('@/src/services/ApiManager');
      let response;
      if (filter === 'custom') {
        response = await ApiManager.getInstance().getStats(filter, startDate, endDate);
        console.log('API Response:', response);
      } else {
        response = await ApiManager.getInstance().getStats(filter);
        console.log('API Response:', response);
      }

      if (response?.success && response?.data) {
        setStats(response.data);
        console.log('Stats set:', response.data);
        
        // Also dispatch to Redux for global access (especially for complaint summary)
        console.log('Dispatching fetchStats to Redux with params:', { filter, startDate, endDate });
        const reduxResult = await dispatch(fetchStats({
          filter,
          startDate,
          endDate
        }));
        console.log('Redux dispatch result:', reduxResult);
      } else {
        console.error('Invalid response structure:', response);
        setError('Invalid response structure');
      }
    } catch (err) {
      console.error('Stats fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetchStats('all');
  }, []);

  useEffect(() => {
  const task = InteractionManager.runAfterInteractions(() => {
    // clears lingering touches
  });
  return () => task.cancel();
}, []);
  const handleFilterChange = (filter: QuickFilter) => {
    if (filter === 'custom') {
      handleCustomDateRange();
      return;
    }

    setSelectedFilter(filter);
    if (filter == 'month'){
      handleFetchStats('this_month');
    }else if(filter == 'week'){
      handleFetchStats('this_week');
    }else if (filter == 'today'){
      handleFetchStats('today');
    }else if (filter == 'all'){
      handleFetchStats('all')
    }
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

  const handleStatCardPress = useCallback((filterType: string, title: string) => {
  let dateFilter: string;
  if (selectedFilter === 'month') dateFilter = 'this_month';
  else if (selectedFilter === 'week') dateFilter = 'this_week';
  else if (selectedFilter === 'today') dateFilter = 'today';
  else if (selectedFilter === 'all') dateFilter = 'all';
  else dateFilter = 'custom';

  const params: any = {
    filter: filterType,
    title,
    fromDashboard: 'true',
    dateFilter,
  };

  if (selectedStartDate && selectedEndDate) {
    params.startDate = formatDateForApi(selectedStartDate);
    params.endDate = formatDateForApi(selectedEndDate);
  }

  // Use push to navigate to complaints list
  router.push({
    pathname: '/complaints-stack/complaints-list',
    params,
  });

  console.log("Pushed to Listing Screen");

  
}, [selectedFilter, selectedStartDate, selectedEndDate]);



  const handleCustomDateRange = () => {
    setShowCalendarModal(true);
  };

  const handleDateSelect = (date: Date) => {
    if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
      // First selection or reset
      setSelectedStartDate(date);
      setSelectedEndDate(null);
    } else {
      // Second selection
      if (date < selectedStartDate) {
        // If selected date is before start, swap them
        setSelectedEndDate(selectedStartDate);
        setSelectedStartDate(date);
      } else {
        setSelectedEndDate(date);
      }
    }
  };
  const formatDateForApi = (date: Date): string => {
     const year = date.getFullYear();
     const month = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-based
     const day = String(date.getDate()).padStart(2, '0');
     return `${year}-${month}-${day}`;
  };
  const handleApplyDateRange = () => {
    if (selectedStartDate && selectedEndDate) {
      const startStr = selectedStartDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
      const endStr = selectedEndDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
      const startStrApi = formatDateForApi(selectedStartDate);
      const endStrApi = formatDateForApi(selectedEndDate);
      
      setDateRange(`${startStr} - ${endStr}`);
      setSelectedFilter('custom');
      setShowCalendarModal(false);
      console.log(startStrApi)
      console.log(endStrApi)
      handleFetchStats('custom', startStrApi, endStrApi);
    
    }
  };

  const handleCancelDateRange = () => {
    setShowCalendarModal(false);
    setSelectedStartDate(null);
    setSelectedEndDate(null);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(currentMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(currentMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add empty slots for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days in month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const isDateInRange = (date: Date) => {
    if (!selectedStartDate || !selectedEndDate) return false;
    return date >= selectedStartDate && date <= selectedEndDate;
  };

  const isSameDay = (date1: Date | null, date2: Date | null) => {
    if (!date1 || !date2) return false;
    return date1.toDateString() === date2.toDateString();
  };

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
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
       {/* Search Entry Point */}
        <TouchableOpacity
          style={styles.searchBar}
          activeOpacity={0.7}
          onPress={() => {
            router.push('/search-stack/complaint-search');
            console.log("Pushed Search Screen");
          }}
        >
          <Ionicons name="search" size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
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
            selectedFilter === 'all' && styles.filterPillActive,
          ]}
          onPress={() => handleFilterChange('all')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.filterPillText,
              selectedFilter === 'all' && styles.filterPillTextActive,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
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
        {loading && (
          <View style={{ alignItems: 'center', marginVertical: 32 }}>
            <Text style={{ color: COLORS.textSecondary }}>Loading stats...</Text>
          </View>
        )}
        
        {error && (
          <View style={{ alignItems: 'center', marginVertical: 16 }}>
            <Text style={{ color: 'red', fontWeight: '600' }}>{error}</Text>
          </View>
        )}

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Complaints"
            value={stats.total}
            icon="documents-outline"
            backgroundColor={COLORS.pastelBlue}
            iconColor={COLORS.iconBlue}
            filterType="all"
            datFilter={selectedFilter}
            onPress={() => handleStatCardPress('all', 'All Complaints')}
          />

          <StatCard
            title="Pending"
            value={stats.pending}
            icon="time-outline"
            backgroundColor={COLORS.pastelPink}
            iconColor={COLORS.iconPink}
            filterType="pending"
            datFilter={selectedFilter}
            onPress={() => handleStatCardPress('pending', 'Pending Complaints')}
          />

          <StatCard
            title="In Progress"
            value={stats.inProgress}
            icon="sync-outline"
            backgroundColor={COLORS.pastelPurple}
            iconColor={COLORS.iconPurple}
            filterType="inProgress"
            datFilter={selectedFilter}
            onPress={() => handleStatCardPress('inProgress', 'In Progress Complaints')}
          />

          <StatCard
            title="Closed"
            value={stats.closed}
            icon="close-circle-outline"
            backgroundColor={COLORS.pastelPeach}
            iconColor={COLORS.iconPeach}
            filterType="closed"
            datFilter={selectedFilter}
            onPress={() => handleStatCardPress('closed', 'Closed Complaints')}
          />
          <StatCard
            title="Completed by You"
            value={stats.completedByYou}
            icon="checkmark-done-outline"
            backgroundColor={COLORS.pastelMint}
            iconColor={COLORS.iconTeal}
            filterType="completedByYou"
            datFilter={selectedFilter}
            onPress={() => handleStatCardPress('completedByYou', 'Completed by You')}
          />
          <StatCard
            title="Assigned by You"
            value={stats.assignedByYou}
            icon="person-add-outline"
            backgroundColor={COLORS.pastelYellow}
            iconColor={COLORS.iconOrange}
            filterType="assignedByYou"
            datFilter={selectedFilter}
            onPress={() => handleStatCardPress('assignedByYou', 'Assigned by You')}
          />
        </View>
       <ComplaintGroup params={{ fromDashboard: 'true', cityId: 99 }} />
      </ScrollView>

      {/* Calendar Modal */}
      <Modal
        visible={showCalendarModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelDateRange}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Date Range</Text>
              <TouchableOpacity onPress={handleCancelDateRange} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            {/* Month Navigation */}
            <View style={styles.monthNavigation}>
              <TouchableOpacity onPress={() => navigateMonth('prev')} style={styles.navButton}>
                <Ionicons name="chevron-back" size={24} color={COLORS.primary} />
              </TouchableOpacity>
              <Text style={styles.monthYear}>
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </Text>
              <TouchableOpacity onPress={() => navigateMonth('next')} style={styles.navButton}>
                <Ionicons name="chevron-forward" size={24} color={COLORS.primary} />
              </TouchableOpacity>
            </View>

            {/* Weekday Headers */}
            <View style={styles.weekdayHeader}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <Text key={day} style={styles.weekdayText}>
                  {day}
                </Text>
              ))}
            </View>

            {/* Calendar Grid */}
            <View style={styles.calendarGrid}>
              {getDaysInMonth(currentMonth).map((date, index) => {
                if (!date) {
                  return <View key={`empty-${index}`} style={styles.dayCell} />;
                }

                const isStart = isSameDay(date, selectedStartDate);
                const isEnd = isSameDay(date, selectedEndDate);
                const inRange = isDateInRange(date);

                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dayCell,
                      inRange && styles.dayCellInRange,
                      (isStart || isEnd) && styles.dayCellSelected,
                    ]}
                    onPress={() => handleDateSelect(date)}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        (isStart || isEnd) && styles.dayTextSelected,
                      ]}
                    >
                      {date.getDate()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancelDateRange}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.applyButton,
                  (!selectedStartDate || !selectedEndDate) && styles.applyButtonDisabled,
                ]}
                onPress={handleApplyDateRange}
                disabled={!selectedStartDate || !selectedEndDate}
              >
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    height: 68, // match container height
    flexGrow: 0,
  },
  filterPillsContainer: {
     paddingHorizontal: 6,
     paddingTop: 8,
     paddingBottom: 8,
     gap: 8,
     height: 56,   // ← ADD THIS (choose any height you want)
     alignItems: 'center', // optional: vertical centering
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
    minHeight: 32,
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
    paddingBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statCard: {
    width: '30%',
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
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -1,
  },
  statTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  // Calendar Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  closeButton: {
    padding: 4,
  },
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  navButton: {
    padding: 8,
  },
  monthYear: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  weekdayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  weekdayText: {
    width: '14.28%',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  dayCellInRange: {
    backgroundColor: `${COLORS.primary}20`,
  },
  dayCellSelected: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  dayTextSelected: {
    color: COLORS.cardBackground,
    fontWeight: '700',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  applyButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
  },
  applyButtonDisabled: {
    backgroundColor: COLORS.border,
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.cardBackground,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginHorizontal: 8,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchPlaceholder: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginLeft: 12,
    flex: 1,
  },
});
