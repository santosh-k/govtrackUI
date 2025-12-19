import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, FlatList, TouchableOpacity, Dimensions, Platform, ActivityIndicator, TextInput } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import Header from '@/components/Header';
import TaskFilterBottomSheet from '@/components/TaskFilterBottomSheet';
import { COLORS, SPACING } from '@/theme';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchMyTasks,
  fetchAssignedTasks,
  selectTasks,
  selectTasksLoading,
  selectTasksFetchingMore,
  selectTasksRefreshing,
  selectTasksPage,
  selectTasksHasMore,
  selectAssignedTasks,
  selectAssignedTasksLoading,
  selectAssignedTasksFetchingMore,
  selectAssignedTasksRefreshing,
  selectAssignedTasksPage,
  selectAssignedTasksHasMore,
} from '@/src/store/tasksSlice';
import { AppDispatch } from '@/src/store';
import { TabView, SceneMap } from 'react-native-tab-view';

// Types
interface Task {
  id: string;
  taskId: string;
  category: string;
  title: string;
  assignedBy: string;
  office: string;
  department: string;
  startDate: string;
  dueDate: string;
  time: string;
  status: 'PENDING' | 'In Progress' | 'COMPLETED' | 'Overdue';
}
type TabName = 'My Tasks' | 'All Task';

// Tasks are fetched from the API and stored in Redux

// Helper for status colors
const getStatusColor = (status: Task['status']) => {
  switch (status) {
    case 'COMPLETED': return COLORS.statusClosed;
    case 'In Progress': return COLORS.statusInProgress;
    case 'PENDING': return COLORS.statusOpen;
    case 'Overdue': return COLORS.statusResolved;
    default: return COLORS.statusOpen;
  }
};

// TaskCard
interface TaskCardProps { task: Task; onPress: () => void; }
function TaskCard({ task, onPress }: TaskCardProps) {
  console.log('Current task Status == ', task.status)
  const statusColor = getStatusColor(task.status);
  return (
    <TouchableOpacity style={styles.taskCard} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cardTopRow}>
        <Text style={styles.taskId}>{task.taskId}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <Text style={styles.statusText}>{task.status}</Text>
        </View>
      </View>
      <Text style={styles.categoryTitle}>{task.title}</Text>
      <View style={styles.assignedByContainer}>
        <View style={styles.infoRow}>
          <Ionicons name="business-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.infoText}>{task.category}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.assignedByText}>
            Assigned To: <Text style={styles.assignedByName}>{task.assignedBy}</Text>
           {/*  <Text style={styles.departmentText}> ({task.department})</Text> */}
          </Text>
        </View>
      </View>
      <View style={styles.cardFooter}>
        <View style={styles.dateColumn}>
          <View style={styles.dateTimeRow}>
            <Text style={styles.footerText}>Start Date:</Text>
            <Text style={styles.footerText}>{task.startDate}</Text>
          </View>

          <View style={styles.dateTimeRow}>
            <Text style={styles.footerText}>Due Date:</Text>
            <Text style={styles.footerText}>{task.dueDate}</Text>
          </View>
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
    { key: 'assignedByMe', title: 'All Tasks' },
  ]);

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedAssignedTo, setSelectedAssignedTo] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string | number | null>(null);
  const [selectedAssignedUserId, setSelectedAssignedUserId] = useState<string | number | null>(null);
  const [tempSelectedProject, setTempSelectedProject] = useState('');
  const [tempSelectedAssignedUser, setTempSelectedAssignedUser] = useState('');
  const [tempSelectedProjectId, setTempSelectedProjectId] = useState<string | number | null>(null);
  const [tempSelectedAssignedUserId, setTempSelectedAssignedUserId] = useState<string | number | null>(null);

  // Deep link support
  useEffect(() => {
    if (params.tab) {
      if (params.tab === 'my-tasks') setIndex(0);
      else if (params.tab === 'assigned-by-me') setIndex(1);
    }

    // Accept returned selections from selection screen (e.g., selectedProject, selectedProjectId, selectedAssignedUser, selectedAssignedUserId)
    let reopenedFromSelection = false;
    if (params.selectedProject) {
      setTempSelectedProject(params.selectedProject as string);
      reopenedFromSelection = true;
    }
    if (params.selectedProjectId) {
      setTempSelectedProjectId(params.selectedProjectId as string | number);
      reopenedFromSelection = true;
    }
    if (params.selectedAssignedUser) {
      setTempSelectedAssignedUser(params.selectedAssignedUser as string);
      reopenedFromSelection = true;
    }
    if (params.selectedAssignedUserId) {
      setTempSelectedAssignedUserId(params.selectedAssignedUserId as string | number);
      reopenedFromSelection = true;
    }

    // If we returned from the selection screen with new selections, re-open the filter sheet so the user can apply/inspect
    if (reopenedFromSelection) {
      // small delay to allow navigation stack to settle
      setTimeout(() => setFilterVisible(true), 220);
    }

  }, [params.tab, params.selectedProject, params.selectedProjectId, params.selectedAssignedUser, params.selectedAssignedUserId]);

  const handleTaskPress = (task: Task) => {
    router.push({ pathname: '/(drawer)/task-details', params: { taskId: task.id } });
  };
  const handleCreateTask = () => {
    router.push('/(drawer)/create-task');
  };

  const openFilter = () => {
    // initialize temp selections from current applied selections so the sheet starts with current filters
    setTempSelectedProject(selectedProject || '');
    setTempSelectedProjectId(selectedProjectId ?? null);
    setTempSelectedAssignedUser(selectedAssignedTo || '');
    setTempSelectedAssignedUserId(selectedAssignedUserId ?? null);
    setFilterVisible(true);
  };
  const closeFilter = () => setFilterVisible(false);

  const onStatusToggle = (status: string) => {
    setSelectedStatuses((prev) => (prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]));
  };

  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);
  const [selectedTaskType, setSelectedTaskType] = useState<string | null>(null);

  const onApplyFilters = (filters?: { priority?: string; task_type?: string }) => {
    // apply project/assigned temp selections now
    setSelectedProject(tempSelectedProject);
    setSelectedProjectId(tempSelectedProjectId ?? null);
    setSelectedAssignedTo(tempSelectedAssignedUser);
    setSelectedAssignedUserId(tempSelectedAssignedUserId ?? null);

    // store priority/task_type from bottom sheet
    if (filters?.priority) setSelectedPriority(filters.priority);
    else setSelectedPriority(null);

    if (filters?.task_type) setSelectedTaskType(filters.task_type);
    else setSelectedTaskType(null);

    // trigger a refresh with the applied filters
    const priorityParam = filters?.priority ? String(filters.priority).toUpperCase() : (selectedPriority ? String(selectedPriority).toUpperCase() : undefined);
    const taskTypeParam = filters?.task_type ? String(filters.task_type).toUpperCase() : (selectedTaskType ? String(selectedTaskType).toUpperCase() : undefined);
    const statusParam = selectedStatuses.length ? selectedStatuses.map(s => String(s).toUpperCase().replace(/\s+/g, '_')).join(',') : undefined;

    dispatch(fetchMyTasks({
      page: 1,
      refresh: true,
      search: searchQuery || undefined,
      status: statusParam,
      project_id: tempSelectedProjectId ?? undefined,
      assigned_to: tempSelectedAssignedUserId ?? undefined,
      priority: priorityParam,
      task_type: taskTypeParam,
    }));

    dispatch(fetchAssignedTasks({
      page: 1,
      refresh: true,
      search: searchQuery || undefined,
      status: statusParam,
      project_id: tempSelectedProjectId ?? undefined,
      assigned_to: tempSelectedAssignedUserId ?? undefined,
      priority: priorityParam,
      task_type: taskTypeParam,
    }));

    closeFilter();
  };

  const onResetFilters = () => {
    setSelectedStatuses([]);
    setSelectedProject('');
    setSelectedAssignedTo('');
    setSelectedProjectId(null);
    setSelectedAssignedUserId(null);
    setSelectedPriority(null);
    setSelectedTaskType(null);

    // also clear temp selections
    setTempSelectedProject('');
    setTempSelectedProjectId(null);
    setTempSelectedAssignedUser('');
    setTempSelectedAssignedUserId(null);

    closeFilter();

    // Refresh lists without filters
    dispatch(fetchMyTasks({ page: 1, refresh: true }));
    dispatch(fetchAssignedTasks({ page: 1, refresh: true }));
  };

  
  const handleProjectPress = () => {
      global.filterSelectionCallback = (type: string, value: any) => {
        if (type === 'project') {
          const name = String(value.name || '');
          const id = value.id ?? null;
          setTempSelectedProject(name);
          setTempSelectedProjectId(id);
          setTimeout(() => setFilterVisible(true), 300);
        }
      };
      setFilterVisible(false);
      router.push({
          pathname: '/(drawer)/task-data-selection-screen',
          params: {
            title: 'Select Projects',
            dataKey: 'taskProjects',
            currentValue: tempSelectedProject,
            returnTo: 'tasks',
            returnField: 'selectedProject',
          },
        });
    };
  const handleAssignedPress = () => {
      global.filterSelectionCallback = (type: string, value: any) => {
        if (type === 'assigned') {
          const name = String(value.name || '');
          const id = value.id ?? null;
          setTempSelectedAssignedUser(name);
          setTempSelectedAssignedUserId(id);
          setTimeout(() => setFilterVisible(true), 300);
        }
      };
      setFilterVisible(false);
      router.push({
          pathname: '/(drawer)/task-data-selection-screen',
          params: {
            title: 'Select Assigned User',
            dataKey: 'user',
            currentValue: tempSelectedAssignedUser,
            returnTo: 'tasks',
            returnField: 'selectedAssignedUser',
          },
        });
    };

 
  const renderTask = ({ item }: { item: Task }) => <TaskCard task={item} onPress={() => handleTaskPress(item)} />;

  // Scenes
  const dispatch = useDispatch<AppDispatch>();

  // Selectors
  const tasks = useSelector(selectTasks);
  const isLoading = useSelector(selectTasksLoading);
  const isFetchingMore = useSelector(selectTasksFetchingMore);
  const isRefreshing = useSelector(selectTasksRefreshing);
  const page = useSelector(selectTasksPage);
  const hasMore = useSelector(selectTasksHasMore);

  // Assigned-by-me selectors
  const assignedTasks = useSelector(selectAssignedTasks);
  const assignedIsLoading = useSelector(selectAssignedTasksLoading);
  const assignedIsFetchingMore = useSelector(selectAssignedTasksFetchingMore);
  const assignedIsRefreshing = useSelector(selectAssignedTasksRefreshing);
  const assignedPageState = useSelector(selectAssignedTasksPage);
  const assignedHasMore = useSelector(selectAssignedTasksHasMore);

  // Map server task to UI Task shape
  const mapServerTaskToTask = (t: any): Task => ({
    id: String(t.id),
    taskId: t.task_code || t.id,
    title: t.title,
    category: t.task_type || (t.project?.project_name ?? 'Task'),
    assignedBy: t.assignedUser ? `${t.assignedUser.first_name || ''} ${t.assignedUser.last_name || ''}`.trim() : (t.creator?.first_name ? `${t.creator.first_name} ${t.creator.last_name || ''}` : '—'),
    office: t.project?.project_name || '—',
    department: t.assign_department_id ? String(t.assign_department_id) : '',
    startDate: t.start_date || '',
    dueDate: t.due_date || '',
    time: '',
    status: (t.status || 'Pending') as Task['status'],
  });

  const onEndReached = () => {
    if (isFetchingMore || isLoading) return;
    if (!hasMore) return;
    dispatch(fetchMyTasks({
      page: page + 1,
      search: searchQuery || undefined,
      status: selectedStatuses.length ? selectedStatuses.map(s => String(s).toUpperCase().replace(/\s+/g, '_')).join(',') : undefined,
      project_id: selectedProjectId ?? undefined,
      assigned_to: selectedAssignedUserId ?? undefined,
      priority: selectedPriority ? String(selectedPriority).toUpperCase() : undefined,
      task_type: selectedTaskType ? String(selectedTaskType).toUpperCase() : undefined,
    }));
  };

  const onRefresh = () => {
    dispatch(fetchMyTasks({
      page: 1,
      refresh: true,
      search: searchQuery || undefined,
      status: selectedStatuses.length ? selectedStatuses.map(s => String(s).toUpperCase().replace(/\s+/g, '_')).join(',') : undefined,
      project_id: selectedProjectId ?? undefined,
      assigned_to: selectedAssignedUserId ?? undefined,
      priority: selectedPriority ? String(selectedPriority).toUpperCase() : undefined,
      task_type: selectedTaskType ? String(selectedTaskType).toUpperCase() : undefined,
    }));
  };

  const onAssignedEndReached = () => {
    if (assignedIsFetchingMore || assignedIsLoading) return;
    if (!assignedHasMore) return;
    dispatch(fetchAssignedTasks({
      page: assignedPageState + 1,
      search: searchQuery || undefined,
      status: selectedStatuses.length ? selectedStatuses.map(s => String(s).toUpperCase().replace(/\s+/g, '_')).join(',') : undefined,
      project_id: selectedProjectId ?? undefined,
      assigned_to: selectedAssignedUserId ?? undefined,
      priority: selectedPriority ? String(selectedPriority).toUpperCase() : undefined,
      task_type: selectedTaskType ? String(selectedTaskType).toUpperCase() : undefined,
    }));
  };

  const onAssignedRefresh = () => {
    dispatch(fetchAssignedTasks({
      page: 1,
      refresh: true,
      search: searchQuery || undefined,
      status: selectedStatuses.length ? selectedStatuses.map(s => String(s).toUpperCase().replace(/\s+/g, '_')).join(',') : undefined,
      project_id: selectedProjectId ?? undefined,
      assigned_to: selectedAssignedUserId ?? undefined,
      priority: selectedPriority ? String(selectedPriority).toUpperCase() : undefined,
      task_type: selectedTaskType ? String(selectedTaskType).toUpperCase() : undefined,
    }));
  };

  useEffect(() => {
    // Load when tab is active (preserve previous behavior if lists are empty)
    if (index === 0 && tasks.length === 0 && !isLoading) {
      dispatch(fetchMyTasks({ page: 1, search: searchQuery || undefined, status: selectedStatuses.length ? selectedStatuses.map(s => String(s).toUpperCase().replace(/\s+/g, '_')).join(',') : undefined, project_id: selectedProjectId ?? undefined, assigned_to: selectedAssignedUserId ?? undefined, priority: selectedPriority ? String(selectedPriority).toUpperCase() : undefined, task_type: selectedTaskType ? String(selectedTaskType).toUpperCase() : undefined }));
    }

    if (index === 1 && assignedTasks.length === 0 && !assignedIsLoading) {
      dispatch(fetchAssignedTasks({ page: 1, search: searchQuery || undefined, status: selectedStatuses.length ? selectedStatuses.map(s => String(s).toUpperCase().replace(/\s+/g, '_')).join(',') : undefined, project_id: selectedProjectId ?? undefined, assigned_to: selectedAssignedUserId ?? undefined, priority: selectedPriority ? String(selectedPriority).toUpperCase() : undefined, task_type: selectedTaskType ? String(selectedTaskType).toUpperCase() : undefined }));
    }
  }, [index]);

  const MyTasksRoute = () => (
    <FlatList
      data={filteredMyTasks}
      renderItem={renderTask}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      onEndReachedThreshold={0.6}
      onEndReached={onEndReached}
      refreshing={isRefreshing}
      onRefresh={onRefresh}
      ListFooterComponent={isFetchingMore ? <View style={{ padding: 12 }}><ActivityIndicator size="small" color={COLORS.primary} /></View> : null}
      ListEmptyComponent={isLoading ? (
        <View style={{ paddingTop: 24, alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ color: COLORS.textSecondary, marginTop: 12 }}>Tasks Loading</Text>
        </View>
      ) : (
        <View style={{ paddingTop: 24, alignItems: 'center' }}>
          <Text style={{ color: COLORS.textSecondary }}>No tasks found</Text>
        </View>
      )}
    />
  );
  const AssignedByMeRoute = () => (
    <FlatList
      data={filteredAssignedTasks}
      renderItem={renderTask}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      onEndReachedThreshold={0.6}
      onEndReached={onAssignedEndReached}
      refreshing={assignedIsRefreshing}
      onRefresh={onAssignedRefresh}
      ListFooterComponent={assignedIsFetchingMore ? <View style={{ padding: 12 }}><ActivityIndicator size="small" color={COLORS.primary} /></View> : null}
      ListEmptyComponent={assignedIsLoading ? (
        <View style={{ paddingTop: 24, alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ color: COLORS.textSecondary, marginTop: 12 }}>Tasks Loading</Text>
        </View>
      ) : (
        <View style={{ paddingTop: 24, alignItems: 'center' }}>
          <Text style={{ color: COLORS.textSecondary }}>No tasks found</Text>
        </View>
      )}
    />
  );

  // Prepare mapped + filtered lists
  const mappedMyTasks = tasks.map(mapServerTaskToTask);
  const mappedAssignedTasks = assignedTasks.map(mapServerTaskToTask);

  // Client-side fallback filters (still useful while server returns filtered results)
  const lowerSearch = searchQuery.trim().toLowerCase();
  const taskMatchesSearch = (t: Task) => {
    if (!lowerSearch) return true;
    return (
      String(t.title).toLowerCase().includes(lowerSearch) ||
      String(t.taskId).toLowerCase().includes(lowerSearch) ||
      String(t.category).toLowerCase().includes(lowerSearch) ||
      String(t.assignedBy).toLowerCase().includes(lowerSearch)
    );
  };

  const taskMatchesStatusFilter = (t: Task) => {
    if (!selectedStatuses.length) return true;
    // Compare lowercase equality of status strings
    return selectedStatuses.some((s) => s.toLowerCase() === String(t.status).toLowerCase());
  };

  const filteredMyTasks = mappedMyTasks.filter((t) => taskMatchesSearch(t) && taskMatchesStatusFilter(t));
  const filteredAssignedTasks = mappedAssignedTasks.filter((t) => taskMatchesSearch(t) && taskMatchesStatusFilter(t));

  const activeFilterCount = React.useMemo(() => {
    let count = 0;
    if (selectedStatuses.length) count += selectedStatuses.length;
    if (selectedPriority) count += 1;
    if (selectedTaskType) count += 1;
    if (selectedProjectId) count += 1;
    if (selectedAssignedUserId) count += 1;
    return count;
  }, [selectedStatuses, selectedPriority, selectedTaskType, selectedProjectId, selectedAssignedUserId]);

  // When search/filters change, re-fetch page 1 from server with debounce to keep lists in sync
  useEffect(() => {
    const t = setTimeout(() => {
      if (index === 0) {
        dispatch(fetchMyTasks({
          page: 1,
          search: searchQuery || undefined,
          status: selectedStatuses.length ? selectedStatuses.map(s => String(s).toUpperCase().replace(/\s+/g, '_')).join(',') : undefined,
          project_id: selectedProjectId ?? undefined,
          assigned_to: selectedAssignedUserId ?? undefined,
          priority: selectedPriority ? String(selectedPriority).toUpperCase() : undefined,
          task_type: selectedTaskType ? String(selectedTaskType).toUpperCase() : undefined,
          refresh: true,
        }));
      } else {
        dispatch(fetchAssignedTasks({
          page: 1,
          search: searchQuery || undefined,
          status: selectedStatuses.length ? selectedStatuses.map(s => String(s).toUpperCase().replace(/\s+/g, '_')).join(',') : undefined,
          project_id: selectedProjectId ?? undefined,
          assigned_to: selectedAssignedUserId ?? undefined,
          priority: selectedPriority ? String(selectedPriority).toUpperCase() : undefined,
          task_type: selectedTaskType ? String(selectedTaskType).toUpperCase() : undefined,
          refresh: true,
        }));
      }
    }, 400);

    return () => clearTimeout(t);
  }, [searchQuery, selectedStatuses, selectedProjectId, selectedAssignedUserId, index]);

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
      <Header title="Tasks" rightIconName="filter" onRightPress={openFilter} rightBadgeCount={activeFilterCount} />

      {renderTabBar()}

      {/* Search box below tabs */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={COLORS.textSecondary} style={{ marginLeft: 12 }} />
        <TextInput
          placeholder="Search tasks by title, id, category or assignee"
          placeholderTextColor={COLORS.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
          returnKeyType="search"
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 8, marginRight: 8 }}>
            <Ionicons name="close" size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 36 }} />
        )}
      </View>

      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={() => null} // hide default tab bar
      />

      {/* Filter sheet */}
      <TaskFilterBottomSheet
        visible={filterVisible}
        onClose={closeFilter}
        selectedStatuses={selectedStatuses}
        selectedProject={tempSelectedProject || selectedProject}
        selectedAssignedTo={tempSelectedAssignedUser || selectedAssignedTo}
        selectedPriority={selectedPriority}
        selectedTaskType={selectedTaskType}
        onStatusToggle={onStatusToggle}
        onProjectPress={handleProjectPress}
        onAssignedToPress={handleAssignedPress}
        onApply={onApplyFilters}
        onReset={onResetFilters}
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
  searchContainer: { flexDirection: 'row',
     alignItems: 'center',
      backgroundColor: COLORS.cardBackground,
       margin: SPACING.sm, borderRadius: 12, 
       borderWidth: 1, borderColor: 
       COLORS.border, height: 48 },
  searchInput: { flex: 1, paddingHorizontal: 12, color: COLORS.text, fontSize: 15 },
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
  cardFooter: { 
  flexDirection: 'row', 
  alignItems: 'center', 
  justifyContent: 'space-between', 
  paddingTop: 12, 
  borderTopWidth: 1, 
  borderTopColor: COLORS.border 
},

dateColumn: {
  flex: 1,
  flexDirection: 'column',   // ← This stacks vertically
  gap: 4,
},

dateTimeRow: { 
  flexDirection: 'row', 
  alignItems: 'center', 
  gap: 6 
},

footerText: { 
  fontSize: 13, 
  fontWeight: '500', 
  color: COLORS.textSecondary 
},

detailsIconContainer: { 
  width: 32, 
  height: 32, 
  borderRadius: 16, 
  backgroundColor: COLORS.background, 
  justifyContent: 'center', 
  alignItems: 'center' 
},
  fab: { position: 'absolute', bottom: 24, right: 24, flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary, paddingVertical: 14, paddingHorizontal: 20, borderRadius: 28, gap: 8, ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 }, android: { elevation: 8 } }) },
  fabText: { fontSize: 16, fontWeight: '600', color: COLORS.white },
});
