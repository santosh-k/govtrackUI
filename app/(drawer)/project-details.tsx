import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Modal,
  TextInput,
  FlatList,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');

const COLORS = {
  background: '#F5F5F5',
  cardBackground: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#666666',
  textLight: '#999999',
  border: '#E0E0E0',
  primary: '#2196F3',
  // Status colors
  statusOnTrack: '#4CAF50',
  statusOnTrackBg: '#E8F5E9',
  statusAtRisk: '#FF9800',
  statusAtRiskBg: '#FFF3E0',
  statusDelayed: '#F44336',
  statusDelayedBg: '#FFEBEE',
  statusCompleted: '#2196F3',
  statusCompletedBg: '#E3F2FD',
  // Priority colors
  priorityHigh: '#F44336',
  priorityMedium: '#FF9800',
  priorityLow: '#4CAF50',
  fabBackground: '#2196F3',
};

type ProjectStatus = 'On Track' | 'At Risk' | 'Delayed' | 'Completed';
type TabName = 'Overview' | 'Media' | 'Inspections' | 'Bottlenecks';
type InspectionStatus = 'Passed' | 'Failed' | 'Pending';
type Priority = 'High' | 'Medium' | 'Low';

interface MediaItem {
  id: string;
  type: 'image' | 'video';
  uri: string;
  thumbnail?: string;
}

interface Inspection {
  id: string;
  date: string;
  inspector: string;
  status: InspectionStatus;
}

interface Bottleneck {
  id: string;
  title: string;
  reportedBy: string;
  date: string;
  priority: Priority;
}

// Helper function to get status colors
const getStatusColors = (status: ProjectStatus) => {
  switch (status) {
    case 'On Track':
      return { bg: COLORS.statusOnTrackBg, text: COLORS.statusOnTrack };
    case 'At Risk':
      return { bg: COLORS.statusAtRiskBg, text: COLORS.statusAtRisk };
    case 'Delayed':
      return { bg: COLORS.statusDelayedBg, text: COLORS.statusDelayed };
    case 'Completed':
      return { bg: COLORS.statusCompletedBg, text: COLORS.statusCompleted };
    default:
      return { bg: COLORS.statusOnTrackBg, text: COLORS.statusOnTrack };
  }
};

// Donut Chart Component
const DonutChart: React.FC<{ percentage: number; size?: number }> = ({
  percentage,
  size = 180
}) => {
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (percentage / 100) * circumference;

  return (
    <View style={styles.donutContainer}>
      <Svg width={size} height={size}>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E8E8E8"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={COLORS.primary}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={styles.donutCenterText}>
        <Text style={styles.donutPercentage}>{percentage}%</Text>
        <Text style={styles.donutLabel}>Complete</Text>
      </View>
    </View>
  );
};

export default function ProjectDetailsScreen() {
  const params = useLocalSearchParams();
  const projectId = params.projectId as string;

  const [activeTab, setActiveTab] = useState<TabName>('Overview');
  const [projectStatus, setProjectStatus] = useState<ProjectStatus>('On Track');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<ProjectStatus>('On Track');
  const [statusComment, setStatusComment] = useState('');
  const [showMediaViewer, setShowMediaViewer] = useState(false);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [showAddInspectionModal, setShowAddInspectionModal] = useState(false);
  const [showAddBottleneckModal, setShowAddBottleneckModal] = useState(false);

  // Sample data
  const projectName = 'National Highway 44 Widening and Resurfacing Project';
  const progress = 75;
  const startDate = '01-Jan-24';
  const endDate = '31-Dec-24';
  const totalCost = '₹5.0 Cr';
  const expenditure = '₹3.8 Cr';
  const expectedCompletionDate = '31-Mar-25';
  const financialExpenditure = '76%';
  const lastUpdated = '15-Dec-24, 2:30 PM';

  const mediaItems: MediaItem[] = [
    { id: '1', type: 'image', uri: 'https://via.placeholder.com/400x300/4CAF50/FFFFFF?text=Site+Photo+1' },
    { id: '2', type: 'video', uri: 'https://via.placeholder.com/400x300/2196F3/FFFFFF?text=Video+1', thumbnail: 'https://via.placeholder.com/400x300/2196F3/FFFFFF?text=Video+1' },
    { id: '3', type: 'image', uri: 'https://via.placeholder.com/400x300/FF9800/FFFFFF?text=Site+Photo+2' },
    { id: '4', type: 'image', uri: 'https://via.placeholder.com/400x300/9C27B0/FFFFFF?text=Site+Photo+3' },
    { id: '5', type: 'video', uri: 'https://via.placeholder.com/400x300/F44336/FFFFFF?text=Video+2', thumbnail: 'https://via.placeholder.com/400x300/F44336/FFFFFF?text=Video+2' },
    { id: '6', type: 'image', uri: 'https://via.placeholder.com/400x300/00BCD4/FFFFFF?text=Site+Photo+4' },
  ];

  const inspections: Inspection[] = [
    { id: '1', date: '15-Dec-24', inspector: 'John Smith', status: 'Passed' },
    { id: '2', date: '01-Dec-24', inspector: 'Sarah Johnson', status: 'Passed' },
    { id: '3', date: '15-Nov-24', inspector: 'Mike Wilson', status: 'Failed' },
    { id: '4', date: '01-Nov-24', inspector: 'Emily Davis', status: 'Passed' },
  ];

  const bottlenecks: Bottleneck[] = [
    { id: '1', title: 'Material Delivery Delayed', reportedBy: 'Site Manager', date: '10-Dec-24', priority: 'High' },
    { id: '2', title: 'Weather Conditions', reportedBy: 'Contractor', date: '05-Dec-24', priority: 'Medium' },
    { id: '3', title: 'Equipment Maintenance', reportedBy: 'Engineer', date: '01-Dec-24', priority: 'Low' },
  ];

  const goBack = () => {
    router.push('/(drawer)/project-list');
  };

  const handleStatusPress = () => {
    setNewStatus(projectStatus);
    setStatusComment('');
    setShowStatusModal(true);
  };

  const handleSaveStatus = () => {
    setProjectStatus(newStatus);
    setShowStatusModal(false);
    Alert.alert('Success', 'Project status updated successfully');
  };

  const handleMediaPress = (index: number) => {
    setSelectedMediaIndex(index);
    setShowMediaViewer(true);
  };

  const handleUploadMedia = async () => {
    Alert.alert(
      'Upload Media',
      'Choose an option',
      [
        { text: 'Take Photo or Video', onPress: () => takePhoto() },
        { text: 'Choose from Gallery', onPress: () => pickFromGallery() },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required');
      return;
    }
    // Implementation would go here
    Alert.alert('Info', 'Camera functionality would open here');
  };

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Gallery permission is required');
      return;
    }
    // Implementation would go here
    Alert.alert('Info', 'Gallery picker would open here');
  };

  const statusColors = getStatusColors(projectStatus);

  const renderOverviewTab = () => (
    <ScrollView
      style={styles.tabContent}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.overviewContent}
    >
      {/* Progress Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Project Progress</Text>
        <View style={styles.progressCardContent}>
          <DonutChart percentage={progress} />
          <View style={styles.datesContainer}>
            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>Start Date:</Text>
              <Text style={styles.dateValue}>{startDate}</Text>
            </View>
            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>End Date:</Text>
              <Text style={styles.dateValue}>{endDate}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Financials Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Financial Summary</Text>
        <View style={styles.financialsGrid}>
          <View style={styles.financialItem}>
            <Text style={styles.financialLabel}>Total Cost</Text>
            <Text style={styles.financialValue}>{totalCost}</Text>
          </View>
          <View style={styles.financialItem}>
            <Text style={styles.financialLabel}>Expenditure</Text>
            <Text style={styles.financialValue}>{expenditure}</Text>
          </View>
          <View style={styles.financialItem}>
            <Text style={styles.financialLabel}>Exp. Comp. Date</Text>
            <Text style={styles.financialValue}>{expectedCompletionDate}</Text>
          </View>
          <View style={styles.financialItem}>
            <Text style={styles.financialLabel}>Financial Exp.</Text>
            <Text style={styles.financialValue}>{financialExpenditure}</Text>
          </View>
        </View>
      </View>

      {/* Last Updated Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Last Updated</Text>
        <Text style={styles.lastUpdatedText}>{lastUpdated}</Text>
      </View>
    </ScrollView>
  );

  const renderMediaTab = () => (
    <View style={styles.tabContent}>
      <FlatList
        data={mediaItems}
        numColumns={3}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={styles.mediaThumbnail}
            onPress={() => handleMediaPress(index)}
            activeOpacity={0.8}
          >
            <Image source={{ uri: item.uri }} style={styles.thumbnailImage} />
            {item.type === 'video' && (
              <View style={styles.playIconOverlay}>
                <Ionicons name="play-circle" size={40} color="white" />
              </View>
            )}
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.mediaGrid}
        showsVerticalScrollIndicator={false}
      />

      {/* FAB for Upload Media */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleUploadMedia}
        activeOpacity={0.8}
      >
        <Ionicons name="camera" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );

  const renderInspectionsTab = () => (
    <View style={styles.tabContent}>
      <FlatList
        data={inspections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.inspectionCard}
            onPress={() => Alert.alert('Inspection Details', `Inspection by ${item.inspector}`)}
            activeOpacity={0.7}
          >
            <View style={styles.inspectionHeader}>
              <Text style={styles.inspectionDate}>{item.date}</Text>
              <View style={[
                styles.inspectionStatusBadge,
                { backgroundColor: item.status === 'Passed' ? COLORS.statusOnTrackBg : item.status === 'Failed' ? COLORS.statusDelayedBg : COLORS.statusAtRiskBg }
              ]}>
                <Text style={[
                  styles.inspectionStatusText,
                  { color: item.status === 'Passed' ? COLORS.statusOnTrack : item.status === 'Failed' ? COLORS.statusDelayed : COLORS.statusAtRisk }
                ]}>
                  {item.status}
                </Text>
              </View>
            </View>
            <Text style={styles.inspectorName}>Inspector: {item.inspector}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* FAB for Add Inspection */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowAddInspectionModal(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="clipboard" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );

  const renderBottlenecksTab = () => (
    <View style={styles.tabContent}>
      <FlatList
        data={bottlenecks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.bottleneckCard}>
            <View style={styles.bottleneckHeader}>
              <Text style={styles.bottleneckTitle}>{item.title}</Text>
              <View style={[
                styles.priorityBadge,
                { backgroundColor: item.priority === 'High' ? COLORS.priorityHigh : item.priority === 'Medium' ? COLORS.priorityMedium : COLORS.priorityLow }
              ]}>
                <Text style={styles.priorityText}>{item.priority}</Text>
              </View>
            </View>
            <Text style={styles.bottleneckMeta}>Reported by: {item.reportedBy}</Text>
            <Text style={styles.bottleneckDate}>{item.date}</Text>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* FAB for Add Bottleneck */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowAddBottleneckModal(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="warning" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.cardBackground} />

      {/* Unified Header */}
      <View style={styles.unifiedHeader}>
        {/* Left: Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={goBack}
          activeOpacity={0.6}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>

        {/* Middle: Project Info */}
        <View style={styles.headerProjectInfo}>
          <Text style={styles.headerProjectName} numberOfLines={1}>{projectName}</Text>
          <Text style={styles.headerProjectId}>{projectId}</Text>
        </View>

        {/* Right: Status Button */}
        <TouchableOpacity
          style={[styles.headerStatusButton, { backgroundColor: statusColors.bg }]}
          onPress={handleStatusPress}
          activeOpacity={0.7}
        >
          <Text style={[styles.headerStatusText, { color: statusColors.text }]}>
            {projectStatus}
          </Text>
          <Ionicons name="chevron-down" size={14} color={statusColors.text} style={styles.headerChevronIcon} />
        </TouchableOpacity>
      </View>

      {/* Tab Navigator */}
      <View style={styles.tabBar}>
        {(['Overview', 'Media', 'Inspections', 'Bottlenecks'] as TabName[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      {activeTab === 'Overview' && renderOverviewTab()}
      {activeTab === 'Media' && renderMediaTab()}
      {activeTab === 'Inspections' && renderInspectionsTab()}
      {activeTab === 'Bottlenecks' && renderBottlenecksTab()}

      {/* Status Update Modal */}
      <Modal
        visible={showStatusModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowStatusModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Update Project Status</Text>
              <TouchableOpacity onPress={() => setShowStatusModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Select Status</Text>
            <View style={styles.statusOptions}>
              {(['On Track', 'At Risk', 'Delayed', 'Completed'] as ProjectStatus[]).map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusOption,
                    newStatus === status && styles.selectedStatusOption,
                    { borderColor: getStatusColors(status).text }
                  ]}
                  onPress={() => setNewStatus(status)}
                >
                  <Text style={[
                    styles.statusOptionText,
                    newStatus === status && { color: getStatusColors(status).text }
                  ]}>
                    {status}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Comment (Optional)</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Add a comment about the status change..."
              placeholderTextColor={COLORS.textSecondary}
              value={statusComment}
              onChangeText={setStatusComment}
              multiline
              numberOfLines={4}
            />

            <TouchableOpacity style={styles.saveButton} onPress={handleSaveStatus}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Media Viewer Modal */}
      <Modal
        visible={showMediaViewer}
        transparent={false}
        animationType="fade"
        onRequestClose={() => setShowMediaViewer(false)}
      >
        <View style={styles.mediaViewerContainer}>
          <TouchableOpacity
            style={styles.closeMediaButton}
            onPress={() => setShowMediaViewer(false)}
          >
            <Ionicons name="close" size={32} color="white" />
          </TouchableOpacity>

          <FlatList
            data={mediaItems}
            horizontal
            pagingEnabled
            initialScrollIndex={selectedMediaIndex}
            getItemLayout={(data, index) => ({
              length: width,
              offset: width * index,
              index,
            })}
            renderItem={({ item }) => (
              <View style={styles.mediaViewerItem}>
                <Image
                  source={{ uri: item.uri }}
                  style={styles.fullImage}
                  resizeMode="contain"
                />
                {item.type === 'video' && (
                  <TouchableOpacity style={styles.playButton}>
                    <Ionicons name="play-circle" size={80} color="white" />
                  </TouchableOpacity>
                )}
              </View>
            )}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
          />
        </View>
      </Modal>

      {/* Add Inspection Modal */}
      <Modal
        visible={showAddInspectionModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddInspectionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Add New Inspection</Text>
              <TouchableOpacity onPress={() => setShowAddInspectionModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <Text style={styles.placeholderFormText}>
              Form to add new inspection would go here with fields for inspector name, date, and status.
            </Text>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => {
                setShowAddInspectionModal(false);
                Alert.alert('Success', 'Inspection added successfully');
              }}
            >
              <Text style={styles.saveButtonText}>Save Inspection</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add Bottleneck Modal */}
      <Modal
        visible={showAddBottleneckModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddBottleneckModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Add New Bottleneck</Text>
              <TouchableOpacity onPress={() => setShowAddBottleneckModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <Text style={styles.placeholderFormText}>
              Form to add new bottleneck would go here with fields for title, description, and priority.
            </Text>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => {
                setShowAddBottleneckModal(false);
                Alert.alert('Success', 'Bottleneck added successfully');
              }}
            >
              <Text style={styles.saveButtonText}>Save Bottleneck</Text>
            </TouchableOpacity>
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
  // Unified Header Styles
  unifiedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    minHeight: 70,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
    marginRight: 8,
  },
  headerProjectInfo: {
    flex: 1,
    marginRight: 12,
    justifyContent: 'center',
  },
  headerProjectName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  headerProjectId: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  headerStatusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerStatusText: {
    fontSize: 12,
    fontWeight: '700',
    marginRight: 4,
  },
  headerChevronIcon: {
    marginLeft: 2,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  tabContent: {
    flex: 1,
  },
  overviewContent: {
    padding: 16,
  },
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  progressCardContent: {
    alignItems: 'center',
  },
  donutContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  donutCenterText: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  donutPercentage: {
    fontSize: 36,
    fontWeight: '700',
    color: COLORS.text,
  },
  donutLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  datesContainer: {
    width: '100%',
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dateLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  dateValue: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  financialsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  financialItem: {
    width: '50%',
    marginBottom: 16,
  },
  financialLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textLight,
    marginBottom: 4,
  },
  financialValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  lastUpdatedText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  mediaGrid: {
    padding: 4,
  },
  mediaThumbnail: {
    width: (width - 16) / 3,
    height: (width - 16) / 3,
    padding: 2,
    position: 'relative',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  playIconOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.fabBackground,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  listContent: {
    padding: 16,
  },
  inspectionCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  inspectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  inspectionDate: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  inspectionStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  inspectionStatusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  inspectorName: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  bottleneckCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  bottleneckHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bottleneckTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
    marginRight: 8,
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'white',
  },
  bottleneckMeta: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  bottleneckDate: {
    fontSize: 13,
    fontWeight: '400',
    color: COLORS.textLight,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: COLORS.cardBackground,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '80%',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  statusOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  statusOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedStatusOption: {
    backgroundColor: COLORS.background,
  },
  statusOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  textArea: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: COLORS.text,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  placeholderFormText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginVertical: 32,
    lineHeight: 22,
  },
  mediaViewerContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  closeMediaButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  mediaViewerItem: {
    width: width,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: width,
    height: '100%',
  },
  playButton: {
    position: 'absolute',
  },
});
