import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, FlatList, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import Header from '@/components/Header';
import { COLORS, SPACING } from '@/theme';
import { TabView, SceneMap } from 'react-native-tab-view';

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

// Sample data
const MY_TASKS: Task[] = [
  { id: '1', taskId: 'TSK-2024-001', category: 'Road Inspection', assignedBy: 'Er Sabir Ali', office: 'Central Department', date: '15 Jan 2024', time: '10:30 AM', status: 'In Progress', department: 'Roads Dept.' },
  { id: '2', taskId: 'TSK-2024-002', category: 'Building Safety Audit', assignedBy: 'Dr Priya Sharma', office: 'Safety Division', date: '14 Jan 2024', time: '02:15 PM', status: 'Pending', department: 'Safety Dept.' },
  { id: '3', taskId: 'TSK-2024-003', category: 'Material Quality Check', assignedBy: 'Ar Rajesh Kumar', office: 'Quality Assurance', date: '13 Jan 2024', time: '09:00 AM', status: 'Completed', department: 'Quality Dept.' },
  { id: '4', taskId: 'TSK-2024-004', category: 'Site Documentation', assignedBy: 'Er Mohammed Ali', office: 'Documentation Wing', date: '10 Jan 2024', time: '11:45 AM', status: 'Overdue', department: 'Admin Dept.' },
];
const ASSIGNED_BY_ME_TASKS: Task[] = [
  { id: '5', taskId: 'TSK-2024-005', category: 'Equipment Maintenance', assignedBy: 'You', office: 'Mechanical Wing', date: '12 Jan 2024', time: '03:30 PM', status: 'In Progress', department: 'Mechanical Dept.' },
  { id: '6', taskId: 'TSK-2024-006', category: 'Structural Assessment', assignedBy: 'You', office: 'Structural Engineering', date: '11 Jan 2024', time: '01:00 PM', status: 'Pending', department: 'Structural Dept.' },
  { id: '7', taskId: 'TSK-2024-007', category: 'Electrical Safety Check', assignedBy: 'You', office: 'Electrical Division', date: '09 Jan 2024', time: '09:15 AM', status: 'Completed', department: 'Electrical Dept.' },
  { id: '8', taskId: 'TSK-2024-008', category: 'Water Pipeline Inspection', assignedBy: 'You', office: 'Water Resources', date: '08 Jan 2024', time: '02:00 PM', status: 'In Progress', department: 'Water Dept.' },
];

// Helper for status colors
const getStatusColor = (status: Task['status']) => {
  switch (status) {
    case 'Completed': return COLORS.success;
    case 'In Progress': return COLORS.info;
    case 'Pending': return COLORS.warning;
    case 'Overdue': return COLORS.error;
    default: return COLORS.textSecondary;
  }
};

// TaskCard
interface TaskCardProps { task: Task; onPress: () => void; }
function TaskCard({ task, onPress }: TaskCardProps) {
  const statusColor = getStatusColor(task.status);
  return (
    <TouchableOpacity style={styles.taskCard} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cardTopRow}>
        <Text style={styles.taskId}>{task.taskId}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <Text style={styles.statusText}>{task.status}</Text>
        </View>
      </View>
      <Text style={styles.categoryTitle}>{task.category}</Text>
      <View style={styles.assignedByContainer}>
        <View style={styles.infoRow}>
          <Ionicons name="business-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.infoText}>{task.office}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.assignedByText}>
            by <Text style={styles.assignedByName}>{task.assignedBy}</Text>
            <Text style={styles.departmentText}> ({task.department})</Text>
          </Text>
        </View>
      </View>
      <View style={styles.cardFooter}>
        <View style={styles.dateTimeRow}>
          <Ionicons name="calendar-outline" size={14} color={COLORS.textSecondary} />
          <Text style={styles.footerText}>{task.date}</Text>
          <Ionicons name="time-outline" size={14} color={COLORS.textSecondary} style={{ marginLeft: 12 }} />
          <Text style={styles.footerText}>{task.time}</Text>
        </View>
        <View style={styles.detailsIconContainer}>
          <Ionicons name="chevron-forward" size={20} color={COLORS.primary} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function TasksScreen() {
  const insets = useSafeAreaInsets();
  const layout = Dimensions.get('window');
  const params = useLocalSearchParams();

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'myTasks', title: 'My Tasks' },
    { key: 'assignedByMe', title: 'Assigned by Me' },
  ]);

  // Deep link support
  useEffect(() => {
    if (params.tab) {
      if (params.tab === 'my-tasks') setIndex(0);
      else if (params.tab === 'assigned-by-me') setIndex(1);
    }
  }, [params.tab]);

  const handleTaskPress = (task: Task) => {
    router.push({ pathname: '/(drawer)/task-details', params: { taskId: task.id } });
  };
  const handleCreateTask = () => {
    router.push('/(drawer)/create-task');
  };
  const renderTask = ({ item }: { item: Task }) => <TaskCard task={item} onPress={() => handleTaskPress(item)} />;

  // Scenes
  const MyTasksRoute = () => (
    <FlatList
      data={MY_TASKS}
      renderItem={renderTask}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    />
  );
  const AssignedByMeRoute = () => (
    <FlatList
      data={ASSIGNED_BY_ME_TASKS}
      renderItem={renderTask}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    />
  );

  const renderScene = SceneMap({
    myTasks: MyTasksRoute,
    assignedByMe: AssignedByMeRoute,
  });

  // Custom Tab Bar (preserve your existing UI)
  const renderTabBar = () => (
    <View style={styles.tabBar}>
      {routes.map((r, idx) => (
        <TouchableOpacity
          key={r.key}
          style={[styles.tab, index === idx && styles.tabActive]}
          onPress={() => setIndex(idx)}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, index === idx && styles.tabTextActive]}>
            {r.title}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <Header title="Tasks" />

      {renderTabBar()}

      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={() => null} // hide default tab bar
      />

      <TouchableOpacity style={styles.fab} onPress={handleCreateTask} activeOpacity={0.85}>
        <Ionicons name="add" size={24} color={COLORS.white} />
        <Text style={styles.fabText}>Create Task</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// === Styles remain exactly the same as your original ===
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  tabBar: { flexDirection: 'row', backgroundColor: COLORS.cardBackground, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 14, borderBottomWidth: 3, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: COLORS.primary },
  tabText: { fontSize: 15, fontWeight: '600', color: COLORS.textSecondary },
  tabTextActive: { color: COLORS.primary },
  listContent: { padding: SPACING.md, paddingBottom: 100 },
  taskCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 }, android: { elevation: 3 } }),
  },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  taskId: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, letterSpacing: 0.5 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12 },
  statusText: { fontSize: 11, fontWeight: '700', color: COLORS.white, textTransform: 'uppercase', letterSpacing: 0.5 },
  categoryTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 12, lineHeight: 24 },
  assignedByContainer: { marginBottom: 12, gap: 6 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoText: { fontSize: 14, fontWeight: '500', color: COLORS.textSecondary },
  assignedByText: { fontSize: 14, fontWeight: '400', color: COLORS.textSecondary },
  assignedByName: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  departmentText: { fontSize: 14, fontWeight: '400', color: COLORS.textSecondary },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.border },
  dateTimeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  footerText: { fontSize: 13, fontWeight: '500', color: COLORS.textSecondary },
  detailsIconContainer: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },
  fab: { position: 'absolute', bottom: 24, right: 24, flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary, paddingVertical: 14, paddingHorizontal: 20, borderRadius: 28, gap: 8, ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 }, android: { elevation: 8 } }) },
  fabText: { fontSize: 16, fontWeight: '600', color: COLORS.white },
});
