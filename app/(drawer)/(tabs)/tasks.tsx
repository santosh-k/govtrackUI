/**
 * Tasks Screen - Main Task List View
 *
 * Displays a scrollable list of task cards with:
 * - Task ID and Status Badge
 * - Task Category (main title)
 * - Assigned By name and Office
 * - Assignment Date and Time
 * - Floating Action Button to create new task
 */

import React, { useState } from 'react';
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
import { router } from 'expo-router';
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

// Sample data
const MOCK_TASKS: Task[] = [
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
  {
    id: '5',
    taskId: 'TSK-2024-005',
    category: 'Equipment Maintenance',
    assignedBy: 'Suresh Patel',
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
    assignedBy: 'Er Anil Mehta',
    office: 'Structural Engineering',
    date: '11 Jan 2024',
    time: '01:00 PM',
    status: 'Pending',
    department: 'Structural Dept.',
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
  const [tasks] = useState<Task[]>(MOCK_TASKS);

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
      <Header title="My Tasks" />

      <FlatList
        data={tasks}
        renderItem={renderTask}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Action Button */}
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
