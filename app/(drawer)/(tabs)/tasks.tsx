/**
 * Tasks Screen - Main Task List View with Tabs
 *
 * Displays a two-tabbed interface:
 * - My Tasks: Tasks assigned to the user
 * - Assigned by Me: Tasks the user has assigned to others
 *
 * Features:
 * - Tab navigation with clean, professional styling
 * - Reusable TaskCard component for both tabs
 * - Floating Action Button visible on both tabs
 * - Navigation to task details and create task screens
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  FlatList,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import Header from '@/components/Header';
import { COLORS, SPACING } from '@/theme';

// Types
interface Task {
  id: string;
  taskId: string;
  category: string;
  assignedBy: string;
  office: string;
  department: string;
  date: string;
  time: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Overdue';
}

type TabName = 'My Tasks' | 'Assigned by Me';

// Sample data - Tasks assigned TO the user
const MY_TASKS: Task[] = [
  {
    id: '1',
    taskId: 'TSK-2024-001',
    category: 'Road Inspection',
    assignedBy: 'Er Sabir Ali',
    office: 'Central Department',
    date: '15 Jan 2024',
    time: '10:30 AM',
    status: 'In Progress',
    department: 'Roads Dept.',
  },
  {
    id: '2',
    taskId: 'TSK-2024-002',
    category: 'Building Safety Audit',
    assignedBy: 'Dr Priya Sharma',
    office: 'Safety Division',
    date: '14 Jan 2024',
    time: '02:15 PM',
    status: 'Pending',
    department: 'Safety Dept.',
  },
  {
    id: '3',
    taskId: 'TSK-2024-003',
    category: 'Material Quality Check',
    assignedBy: 'Ar Rajesh Kumar',
    office: 'Quality Assurance',
    date: '13 Jan 2024',
    time: '09:00 AM',
    status: 'Completed',
    department: 'Quality Dept.',
  },
  {
    id: '4',
    taskId: 'TSK-2024-004',
    category: 'Site Documentation',
    assignedBy: 'Er Mohammed Ali',
    office: 'Documentation Wing',
    date: '10 Jan 2024',
    time: '11:45 AM',
    status: 'Overdue',
    department: 'Admin Dept.',
  },
];

// Sample data - Tasks assigned BY the user to others
const ASSIGNED_BY_ME_TASKS: Task[] = [
  {
    id: '5',
    taskId: 'TSK-2024-005',
    category: 'Equipment Maintenance',
    assignedBy: 'You',
    office: 'Mechanical Wing',
    date: '12 Jan 2024',
    time: '03:30 PM',
    status: 'In Progress',
    department: 'Mechanical Dept.',
  },
  {
    id: '6',
    taskId: 'TSK-2024-006',
    category: 'Structural Assessment',
    assignedBy: 'You',
    office: 'Structural Engineering',
    date: '11 Jan 2024',
    time: '01:00 PM',
    status: 'Pending',
    department: 'Structural Dept.',
  },
  {
    id: '7',
    taskId: 'TSK-2024-007',
    category: 'Electrical Safety Check',
    assignedBy: 'You',
    office: 'Electrical Division',
    date: '09 Jan 2024',
    time: '09:15 AM',
    status: 'Completed',
    department: 'Electrical Dept.',
  },
  {
    id: '8',
    taskId: 'TSK-2024-008',
    category: 'Water Pipeline Inspection',
    assignedBy: 'You',
    office: 'Water Resources',
    date: '08 Jan 2024',
    time: '02:00 PM',
    status: 'In Progress',
    department: 'Water Dept.',
  },
];

// Helper function to get status colors
const getStatusColor = (status: Task['status']) => {
  switch (status) {
    case 'Completed':
      return COLORS.success;
    case 'In Progress':
      return COLORS.info;
    case 'Pending':
      return COLORS.warning;
    case 'Overdue':
      return COLORS.error;
    default:
      return COLORS.textSecondary;
  }
};

// TaskCard Component
interface TaskCardProps {
  task: Task;
  onPress: () => void;
}

function TaskCard({ task, onPress }: TaskCardProps) {
  const statusColor = getStatusColor(task.status);

  return (
    <TouchableOpacity
      style={styles.taskCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Top Row: Task ID and Status Badge */}
      <View style={styles.cardTopRow}>
        <Text style={styles.taskId}>{task.taskId}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <Text style={styles.statusText}>{task.status}</Text>
        </View>
      </View>

      {/* Main Body: Category Title */}
      <Text style={styles.categoryTitle}>{task.category}</Text>

      {/* Office and Assigned By Info */}
      <View style={styles.assignedByContainer}>
        {/* Office - First Line */}
        <View style={styles.infoRow}>
          <Ionicons name="business-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.infoText}>{task.office}</Text>
        </View>

        {/* Assigned By with Department - Second Line */}
        <View style={styles.infoRow}>
          <Text style={styles.assignedByText}>
            by <Text style={styles.assignedByName}>{task.assignedBy}</Text>
            <Text style={styles.departmentText}> ({task.department})</Text>
          </Text>
        </View>
      </View>

      {/* Footer: Date, Time and Details Icon */}
      <View style={styles.cardFooter}>
        <View style={styles.dateTimeRow}>
          <Ionicons name="calendar-outline" size={14} color={COLORS.textSecondary} />
          <Text style={styles.footerText}>{task.date}</Text>
          <Ionicons name="time-outline" size={14} color={COLORS.textSecondary} style={{ marginLeft: 12 }} />
          <Text style={styles.footerText}>{task.time}</Text>
        </View>

        {/* Details Icon */}
        <View style={styles.detailsIconContainer}>
          <Ionicons name="chevron-forward" size={20} color={COLORS.primary} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function TasksScreen() {
  const params = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState<TabName>('My Tasks');
  const [myTasks] = useState<Task[]>(MY_TASKS);
  const [assignedByMeTasks] = useState<Task[]>(ASSIGNED_BY_ME_TASKS);

  // Handle deep linking to specific tab via URL parameter
  useEffect(() => {
    if (params.tab) {
      const tabParam = params.tab as string;
      if (tabParam === 'my-tasks') {
        setActiveTab('My Tasks');
      } else if (tabParam === 'assigned-by-me') {
        setActiveTab('Assigned by Me');
      }
    }
  }, [params.tab]);

  // Determine which tasks to display based on active tab
  const displayedTasks = activeTab === 'My Tasks' ? myTasks : assignedByMeTasks;

  const handleTaskPress = (task: Task) => {
    router.push({
      pathname: '/(drawer)/task-details',
      params: { taskId: task.id },
    });
  };

  const handleCreateTask = () => {
    router.push('/(drawer)/create-task');
  };

  const renderTask = ({ item }: { item: Task }) => (
    <TaskCard task={item} onPress={() => handleTaskPress(item)} />
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Header with Hamburger Menu */}
      <Header title="Tasks" />

      {/* Tab Navigator */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'My Tasks' && styles.tabActive]}
          onPress={() => setActiveTab('My Tasks')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'My Tasks' && styles.tabTextActive]}>
            My Tasks
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Assigned by Me' && styles.tabActive]}
          onPress={() => setActiveTab('Assigned by Me')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'Assigned by Me' && styles.tabTextActive]}>
            Assigned by Me
          </Text>
        </TouchableOpacity>
      </View>

      {/* Task List */}
      <FlatList
        data={displayedTasks}
        renderItem={renderTask}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Action Button - Visible on both tabs */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleCreateTask}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={24} color={COLORS.white} />
        <Text style={styles.fabText}>Create Task</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.primary,
  },
  listContent: {
    padding: SPACING.md,
    paddingBottom: 100, // Space for FAB
  },
  taskCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.md,
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
        elevation: 3,
      },
    }),
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  taskId: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.white,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
    lineHeight: 24,
  },
  assignedByContainer: {
    marginBottom: 12,
    gap: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  assignedByText: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.textSecondary,
  },
  assignedByName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  departmentText: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.textSecondary,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  footerText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  detailsIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 28,
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  fabText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
});
