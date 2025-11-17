import React, { useState, useEffect, useRef } from 'react';
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
  Animated,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import Slider from '@react-native-community/slider';
import { GestureHandlerRootView, PinchGestureHandler, State } from 'react-native-gesture-handler';
import SpeedDialFAB from '@/components/SpeedDialFAB';
import AddMediaSheet from '@/components/AddMediaSheet';

const { width, height } = Dimensions.get('window');

// Zoomable Image Component
const ZoomableImage: React.FC<{ uri: string }> = ({ uri }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const baseScale = useRef(1);

  const onPinchEvent = Animated.event(
    [{ nativeEvent: { scale: scale } }],
    { useNativeDriver: true }
  );

  const onPinchStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      baseScale.current *= event.nativeEvent.scale;
      scale.setValue(1);

      // Reset if zoomed out too much
      if (baseScale.current < 1) {
        baseScale.current = 1;
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
        }).start();
      }

      // Limit max zoom
      if (baseScale.current > 3) {
        baseScale.current = 3;
      }
    }
  };

  const animatedScale = Animated.multiply(baseScale.current, scale);

  return (
    <PinchGestureHandler
      onGestureEvent={onPinchEvent}
      onHandlerStateChange={onPinchStateChange}
    >
      <Animated.View style={[styles.zoomableContainer]}>
        <Animated.Image
          source={{ uri }}
          style={[styles.fullImage, { transform: [{ scale: animatedScale }] }]}
          resizeMode="contain"
        />
      </Animated.View>
    </PinchGestureHandler>
  );
};

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
  saffron: '#FF9933',
  success: '#4CAF50',
};

type ProjectStatus = 'On Track' | 'At Risk' | 'Delayed' | 'Completed';
type TabName = 'Overview' | 'Media' | 'Inspections' | 'Bottlenecks' | 'Activity';
type InspectionStatus = 'Passed' | 'Failed' | 'Pending';
type Priority = 'High' | 'Medium' | 'Low';
type MediaFilterType = 'Photos' | 'Videos' | 'Documents';

interface MediaItem {
  id: string;
  type: 'image' | 'video' | 'document';
  uri: string;
  thumbnail?: string;
  filename?: string;
}

interface LocationData {
  latitude: number;
  longitude: number;
  timestamp: number;
}

interface StatusUpdateActivity {
  id: string;
  status: ProjectStatus;
  previousStatus?: ProjectStatus;
  remarks: string;
  updatedBy: string;
  designation: string;
  timestamp: string;
  location?: LocationData;
  attachments: MediaItem[];
}

interface ProgressUpdate {
  id: string;
  progress: number;
  previousProgress: number;
  remarks: string;
  updatedBy: string;
  designation: string;
  timestamp: string;
  attachments: MediaItem[];
}

interface Inspection {
  id: string;
  date: string;
  title: string;
  inspector: string;
  inspectorPosition: string;
  inspectorDepartment: string;
  status: InspectionStatus;
  description: string;
  media: MediaItem[];
}

interface Bottleneck {
  id: string;
  title: string;
  reportedBy: string;
  reporterPosition: string;
  reporterDepartment: string;
  date: string;
  priority: Priority;
  description: string;
  media: MediaItem[];
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

// Animated Donut Chart Component
const DonutChart: React.FC<{ percentage: number; size?: number }> = ({
  percentage,
  size = 180
}) => {
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const animatedValue = useRef(new Animated.Value(percentage)).current;
  const [displayPercentage, setDisplayPercentage] = useState(percentage);

  useEffect(() => {
    // Animate to new percentage value
    Animated.timing(animatedValue, {
      toValue: percentage,
      duration: 1000,
      useNativeDriver: false,
    }).start();

    // Animate the text display
    const listener = animatedValue.addListener(({ value }) => {
      setDisplayPercentage(Math.round(value));
    });

    return () => {
      animatedValue.removeListener(listener);
    };
  }, [percentage, animatedValue]);

  const AnimatedCircle = Animated.createAnimatedComponent(Circle);

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

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
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={COLORS.primary}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={styles.donutCenterText}>
        <Text style={styles.donutPercentage}>{displayPercentage}%</Text>
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
  const [showAddProgressModal, setShowAddProgressModal] = useState(false);
  const [newProgress, setNewProgress] = useState(75);
  const [progressRemarks, setProgressRemarks] = useState('');
  const [isSavingProgress, setIsSavingProgress] = useState(false);
  const [showInspectionDetails, setShowInspectionDetails] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);
  const [showBottleneckDetails, setShowBottleneckDetails] = useState(false);
  const [selectedBottleneck, setSelectedBottleneck] = useState<Bottleneck | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const toastOpacity = useRef(new Animated.Value(0)).current;

  // Media tab states
  const [mediaFilter, setMediaFilter] = useState<MediaFilterType>('Photos');
  const [allMediaItems, setAllMediaItems] = useState<MediaItem[]>([]);
  const [showUploadSheet, setShowUploadSheet] = useState(false);

  // Status update enhancement states
  const [capturedLocation, setCapturedLocation] = useState<LocationData | null>(null);
  const [isCapturingLocation, setIsCapturingLocation] = useState(false);
  const [statusAttachments, setStatusAttachments] = useState<MediaItem[]>([]);
  const [activityHistory, setActivityHistory] = useState<StatusUpdateActivity[]>([]);
  const [viewerMediaItems, setViewerMediaItems] = useState<MediaItem[]>([]);

  // Progress update enhancement states
  const [progressAttachments, setProgressAttachments] = useState<MediaItem[]>([]);
  const [progressHistory, setProgressHistory] = useState<ProgressUpdate[]>([]);
  const [lastProgressUpdate, setLastProgressUpdate] = useState<ProgressUpdate | null>(null);

  // Sample data
  const projectName = 'National Highway 44 Widening and Resurfacing Project';
  const [progress, setProgress] = useState(75);
  const startDate = '01-Jan-24';
  const endDate = '31-Dec-24';
  const totalCostRaw = 5.0; // In Crores
  const expenditureRaw = 3.8; // In Crores
  const totalCost = '₹5.0 Cr';
  const expenditure = '₹3.8 Cr';
  const estimatedCost = '₹4.5 Cr';
  const expectedCompletionDate = '31-Mar-25';

  // Calculate remaining cost dynamically
  const remainingCostRaw = totalCostRaw - expenditureRaw;
  const remainingCost = `₹${remainingCostRaw.toFixed(1)} Cr`;
  const budgetUtilizationPercentage = Math.round((expenditureRaw / totalCostRaw) * 100);

  // Initialize media items with mixed content
  useEffect(() => {
    const initialMedia: MediaItem[] = [
      { id: '1', type: 'image', uri: 'https://via.placeholder.com/400x300/4CAF50/FFFFFF?text=Site+Photo+1' },
      { id: '2', type: 'video', uri: 'https://via.placeholder.com/400x300/2196F3/FFFFFF?text=Video+1', thumbnail: 'https://via.placeholder.com/400x300/2196F3/FFFFFF?text=Video+1' },
      { id: '3', type: 'image', uri: 'https://via.placeholder.com/400x300/FF9800/FFFFFF?text=Site+Photo+2' },
      { id: '4', type: 'document', uri: 'https://example.com/project-plan.pdf', filename: 'Project_Plan_2024.pdf' },
      { id: '5', type: 'image', uri: 'https://via.placeholder.com/400x300/9C27B0/FFFFFF?text=Site+Photo+3' },
      { id: '6', type: 'video', uri: 'https://via.placeholder.com/400x300/F44336/FFFFFF?text=Video+2', thumbnail: 'https://via.placeholder.com/400x300/F44336/FFFFFF?text=Video+2' },
      { id: '7', type: 'document', uri: 'https://example.com/safety-report.pdf', filename: 'Safety_Report.pdf' },
      { id: '8', type: 'image', uri: 'https://via.placeholder.com/400x300/00BCD4/FFFFFF?text=Site+Photo+4' },
      { id: '9', type: 'document', uri: 'https://example.com/budget.xlsx', filename: 'Budget_Analysis.xlsx' },
      { id: '10', type: 'image', uri: 'https://via.placeholder.com/400x300/E91E63/FFFFFF?text=Site+Photo+5' },
      { id: '11', type: 'video', uri: 'https://via.placeholder.com/400x300/3F51B5/FFFFFF?text=Video+3', thumbnail: 'https://via.placeholder.com/400x300/3F51B5/FFFFFF?text=Video+3' },
      { id: '12', type: 'document', uri: 'https://example.com/inspection.pdf', filename: 'Inspection_Report_Dec.pdf' },
    ];
    setAllMediaItems(initialMedia);
  }, []);

  const inspections: Inspection[] = [
    {
      id: '1',
      date: '15-Dec-24',
      title: 'Structural Integrity Check',
      inspector: 'Er Sabir Ali',
      inspectorPosition: 'Senior Civil Engineer',
      inspectorDepartment: 'Quality Assurance Department',
      status: 'Passed',
      description: 'Structural integrity assessment completed. All load-bearing elements inspected and found compliant with approved drawings. Concrete strength test results satisfactory. Foundation work meets specifications with proper reinforcement placement.',
      media: [
        { id: 'm1', type: 'image', uri: 'https://via.placeholder.com/400x300/4CAF50/FFFFFF?text=Foundation+Check' },
        { id: 'm2', type: 'image', uri: 'https://via.placeholder.com/400x300/8BC34A/FFFFFF?text=Reinforcement' },
        { id: 'm3', type: 'video', uri: 'https://via.placeholder.com/400x300/4CAF50/FFFFFF?text=Site+Video', thumbnail: 'https://via.placeholder.com/400x300/4CAF50/FFFFFF?text=Site+Video' },
      ],
    },
    {
      id: '2',
      date: '08-Dec-24',
      title: 'Safety Equipment Review',
      inspector: 'Dr Priya Sharma',
      inspectorPosition: 'Chief Safety Officer',
      inspectorDepartment: 'Safety & Compliance Division',
      status: 'Pending',
      description: 'Safety equipment inspection in progress. Awaiting certification documents for new scaffolding installation. Worker safety gear compliance check scheduled for completion by end of week...',
      media: [
        { id: 'm4', type: 'image', uri: 'https://via.placeholder.com/400x300/FF9800/FFFFFF?text=Safety+Gear' },
        { id: 'm5', type: 'document', uri: 'https://example.com/safety-checklist.pdf', filename: 'Safety_Checklist.pdf' },
      ],
    },
    {
      id: '3',
      date: '01-Dec-24',
      title: 'Architectural Finish Assessment',
      inspector: 'Ar Rajesh Kumar',
      inspectorPosition: 'Lead Architect',
      inspectorDepartment: 'Design & Planning',
      status: 'Passed',
      description: 'Architectural finish inspection completed successfully. All interior plastering work meets quality standards. Paint application uniform and defect-free. Door and window installations aligned with specifications.',
      media: [
        { id: 'm6', type: 'image', uri: 'https://via.placeholder.com/400x300/2196F3/FFFFFF?text=Interior+Work' },
        { id: 'm7', type: 'image', uri: 'https://via.placeholder.com/400x300/03A9F4/FFFFFF?text=Plastering' },
        { id: 'm8', type: 'image', uri: 'https://via.placeholder.com/400x300/00BCD4/FFFFFF?text=Finishing' },
        { id: 'm9', type: 'video', uri: 'https://via.placeholder.com/400x300/2196F3/FFFFFF?text=Walkthrough', thumbnail: 'https://via.placeholder.com/400x300/2196F3/FFFFFF?text=Walkthrough' },
      ],
    },
    {
      id: '4',
      date: '22-Nov-24',
      title: 'Column Alignment Inspection',
      inspector: 'Er Anil Mehta',
      inspectorPosition: 'Structural Engineer',
      inspectorDepartment: 'Structural Engineering Wing',
      status: 'Failed',
      description: 'Critical defects identified in column alignment on third floor. Reinforcement spacing does not comply with structural drawings. Immediate corrective action required. Recommend re-inspection after remedial work completion...',
      media: [
        { id: 'm10', type: 'image', uri: 'https://via.placeholder.com/400x300/F44336/FFFFFF?text=Defect+1' },
        { id: 'm11', type: 'image', uri: 'https://via.placeholder.com/400x300/E91E63/FFFFFF?text=Defect+2' },
        { id: 'm12', type: 'video', uri: 'https://via.placeholder.com/400x300/F44336/FFFFFF?text=Issue+Video', thumbnail: 'https://via.placeholder.com/400x300/F44336/FFFFFF?text=Issue+Video' },
        { id: 'm13', type: 'document', uri: 'https://example.com/defect-report.pdf', filename: 'Defect_Report_Nov22.pdf' },
      ],
    },
    {
      id: '5',
      date: '15-Nov-24',
      title: 'Electrical Systems Audit',
      inspector: 'Er Sarah Johnson',
      inspectorPosition: 'Electrical Engineer',
      inspectorDepartment: 'MEP Services',
      status: 'Passed',
      description: 'Electrical installation inspection completed. All wiring properly insulated and compliant with electrical codes. Distribution boards correctly labeled and earthing system verified.',
      media: [],
    },
    {
      id: '6',
      date: '08-Nov-24',
      title: 'Plumbing & Drainage Test',
      inspector: 'Er Mohammed Ali',
      inspectorPosition: 'Plumbing Engineer',
      inspectorDepartment: 'MEP Services',
      status: 'Passed',
      description: 'Plumbing and drainage system inspection successful. All pipes pressure tested without leakage. Sanitary fittings properly installed and functional. Water supply lines meet specifications.',
      media: [
        { id: 'm14', type: 'image', uri: 'https://via.placeholder.com/400x300/9C27B0/FFFFFF?text=Plumbing' },
      ],
    },
  ];

  const bottlenecks: Bottleneck[] = [
    {
      id: '1',
      title: 'Material Shortage Crisis',
      reportedBy: 'Vikram Singh',
      reporterPosition: 'Site Manager',
      reporterDepartment: 'Central Department',
      date: '10-Dec-24',
      priority: 'High',
      description: 'Critical delay in cement delivery affecting foundation work. Supplier has confirmed a 2-week delay due to transportation issues. This will impact the project timeline significantly. Need immediate alternative supplier arrangements.',
      media: [
        { id: 'bn1', type: 'image', uri: 'https://via.placeholder.com/400x300/F44336/FFFFFF?text=Delayed+Materials' },
        { id: 'bn2', type: 'image', uri: 'https://via.placeholder.com/400x300/E91E63/FFFFFF?text=Stock+Empty' },
        { id: 'bn3', type: 'document', uri: 'https://example.com/supplier-letter.pdf', filename: 'Supplier_Delay_Notice.pdf' },
      ],
    },
    {
      id: '2',
      title: 'Adverse Weather Conditions',
      reportedBy: 'Ramesh Kumar',
      reporterPosition: 'Lead Contractor',
      reporterDepartment: 'Operations Division',
      date: '05-Dec-24',
      priority: 'Medium',
      description: 'Heavy rainfall for the past week has halted outdoor construction activities. Ground conditions are not suitable for concrete pouring. Weather forecast shows continued rain for next 3-4 days. Work schedule needs to be revised.',
      media: [
        { id: 'bn4', type: 'image', uri: 'https://via.placeholder.com/400x300/FF9800/FFFFFF?text=Rain+Impact' },
        { id: 'bn5', type: 'video', uri: 'https://via.placeholder.com/400x300/FF9800/FFFFFF?text=Site+Flooded', thumbnail: 'https://via.placeholder.com/400x300/FF9800/FFFFFF?text=Site+Flooded' },
      ],
    },
    {
      id: '3',
      title: 'Equipment Maintenance Due',
      reportedBy: 'Suresh Patel',
      reporterPosition: 'Senior Engineer',
      reporterDepartment: 'Mechanical Wing',
      date: '01-Dec-24',
      priority: 'Low',
      description: 'Routine maintenance required for excavator and crane equipment. Scheduled maintenance will take 2 days. Impact on overall timeline is minimal as this can be done during off-peak hours.',
      media: [],
    },
    {
      id: '4',
      title: 'Skilled Labor Shortage',
      reportedBy: 'Anjali Sharma',
      reporterPosition: 'HR Manager',
      reporterDepartment: 'Human Resources',
      date: '28-Nov-24',
      priority: 'High',
      description: 'Shortage of skilled masons and welders impacting construction speed. Current team is overworked. Need to hire 10 additional skilled workers urgently to maintain project schedule.',
      media: [
        { id: 'bn6', type: 'image', uri: 'https://via.placeholder.com/400x300/F44336/FFFFFF?text=Understaffed' },
        { id: 'bn7', type: 'document', uri: 'https://example.com/staffing-report.pdf', filename: 'Staffing_Analysis_Nov.pdf' },
      ],
    },
    {
      id: '5',
      title: 'Permit Approval Delayed',
      reportedBy: 'Priya Menon',
      reporterPosition: 'Compliance Officer',
      reporterDepartment: 'Legal & Compliance',
      date: '22-Nov-24',
      priority: 'Medium',
      description: 'Environmental clearance permit for next phase is pending with municipal authorities. Application submitted 3 weeks ago. Follow-up meetings scheduled. May cause delay if not approved within next 10 days.',
      media: [
        { id: 'bn8', type: 'document', uri: 'https://example.com/permit-application.pdf', filename: 'Permit_Application.pdf' },
      ],
    },
    {
      id: '6',
      title: 'Concrete Quality Failure',
      reportedBy: 'Dr Anil Verma',
      reporterPosition: 'Quality Control Manager',
      reporterDepartment: 'Quality Assurance',
      date: '15-Nov-24',
      priority: 'High',
      description: 'Recent concrete batch (Batch 204) failed strength tests. Approximately 200 cubic meters affected. Need to investigate root cause and potentially remove and replace affected concrete. Major cost and time implications.',
      media: [
        { id: 'bn9', type: 'image', uri: 'https://via.placeholder.com/400x300/F44336/FFFFFF?text=Failed+Test' },
        { id: 'bn10', type: 'image', uri: 'https://via.placeholder.com/400x300/E91E63/FFFFFF?text=Sample+Analysis' },
        { id: 'bn11', type: 'document', uri: 'https://example.com/test-report.pdf', filename: 'Concrete_Test_Report_Batch204.pdf' },
        { id: 'bn12', type: 'video', uri: 'https://via.placeholder.com/400x300/F44336/FFFFFF?text=Site+Inspection', thumbnail: 'https://via.placeholder.com/400x300/F44336/FFFFFF?text=Site+Inspection' },
      ],
    },
  ];

  // Initialize progress history with placeholder data
  useEffect(() => {
    const initialProgressHistory: ProgressUpdate[] = [
      {
        id: 'prog-1',
        progress: 75,
        previousProgress: 60,
        remarks: 'Completed Phase 3 successfully. All major milestones achieved.',
        updatedBy: 'Er Sabir Ali',
        designation: 'Assistant Engineer',
        timestamp: '15-Dec-24 at 2:30 PM',
        attachments: [],
      },
    ];
    setProgressHistory(initialProgressHistory);
    setLastProgressUpdate(initialProgressHistory[0]);
  }, []);

  // Initialize activity history with placeholder data
  useEffect(() => {
    const initialHistory: StatusUpdateActivity[] = [
      {
        id: '1',
        status: 'On Track',
        previousStatus: 'At Risk',
        remarks: 'All critical issues have been resolved. Material delivery is now on schedule and weather conditions have improved significantly.',
        updatedBy: 'Er Sabir Ali',
        designation: 'Assistant Engineer',
        timestamp: '15-Dec-24 at 2:30 PM',
        location: {
          latitude: 28.6139,
          longitude: 77.2090,
          timestamp: Date.now(),
        },
        attachments: [
          { id: 'a1', type: 'image', uri: 'https://via.placeholder.com/400x300/4CAF50/FFFFFF?text=Site+Update+1' },
          { id: 'a2', type: 'image', uri: 'https://via.placeholder.com/400x300/2196F3/FFFFFF?text=Site+Update+2' },
        ],
      },
      {
        id: '2',
        status: 'At Risk',
        previousStatus: 'On Track',
        remarks: 'Material delivery has been delayed by 3 days due to supply chain issues. Monitoring situation closely.',
        updatedBy: 'Rajesh Kumar',
        designation: 'Project Manager',
        timestamp: '10-Dec-24 at 10:15 AM',
        location: {
          latitude: 28.6129,
          longitude: 77.2095,
          timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000,
        },
        attachments: [
          { id: 'a3', type: 'image', uri: 'https://via.placeholder.com/400x300/FF9800/FFFFFF?text=Delayed+Materials' },
        ],
      },
      {
        id: '3',
        status: 'On Track',
        previousStatus: undefined,
        remarks: 'Project commenced successfully. All equipment and materials are in place. Team is fully mobilized.',
        updatedBy: 'Priya Sharma',
        designation: 'Senior Engineer',
        timestamp: '01-Dec-24 at 9:00 AM',
        attachments: [
          { id: 'a4', type: 'image', uri: 'https://via.placeholder.com/400x300/4CAF50/FFFFFF?text=Project+Start+1' },
          { id: 'a5', type: 'image', uri: 'https://via.placeholder.com/400x300/9C27B0/FFFFFF?text=Project+Start+2' },
          { id: 'a6', type: 'video', uri: 'https://via.placeholder.com/400x300/F44336/FFFFFF?text=Opening+Video', thumbnail: 'https://via.placeholder.com/400x300/F44336/FFFFFF?text=Opening+Video' },
        ],
      },
    ];
    setActivityHistory(initialHistory);
  }, []);

  const goBack = () => {
    router.push('/(drawer)/project-list');
  };

  const handleStatusPress = () => {
    setNewStatus(projectStatus);
    setStatusComment('');
    setCapturedLocation(null);
    setStatusAttachments([]);
    setShowStatusModal(true);
  };

  const handleCaptureLocation = async () => {
    setIsCapturingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to capture your current location.');
        setIsCapturingLocation(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setCapturedLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: Date.now(),
      });
    } catch {
      Alert.alert('Error', 'Failed to capture location. Please try again.');
    } finally {
      setIsCapturingLocation(false);
    }
  };

  const handleAddStatusAttachment = async () => {
    Alert.alert(
      'Add Media',
      'Choose an option',
      [
        { text: 'Take Photo or Video', onPress: () => takeStatusPhoto() },
        { text: 'Choose from Gallery', onPress: () => pickStatusFromGallery() },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const takeStatusPhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const newAttachment: MediaItem = {
        id: `status-${Date.now()}`,
        type: result.assets[0].type === 'video' ? 'video' : 'image',
        uri: result.assets[0].uri,
        thumbnail: result.assets[0].uri,
      };
      setStatusAttachments([...statusAttachments, newAttachment]);
    }
  };

  const pickStatusFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Gallery permission is required');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const newAttachment: MediaItem = {
        id: `status-${Date.now()}`,
        type: result.assets[0].type === 'video' ? 'video' : 'image',
        uri: result.assets[0].uri,
        thumbnail: result.assets[0].uri,
      };
      setStatusAttachments([...statusAttachments, newAttachment]);
    }
  };

  const handleRemoveStatusAttachment = (id: string) => {
    setStatusAttachments(statusAttachments.filter(att => att.id !== id));
  };

  const handleSaveStatus = () => {
    const newActivity: StatusUpdateActivity = {
      id: `activity-${Date.now()}`,
      status: newStatus,
      previousStatus: projectStatus !== newStatus ? projectStatus : undefined,
      remarks: statusComment,
      updatedBy: 'Current User',
      designation: 'Engineer',
      timestamp: new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }).replace(',', ' at'),
      location: capturedLocation || undefined,
      attachments: statusAttachments,
    };

    setActivityHistory([newActivity, ...activityHistory]);
    setProjectStatus(newStatus);
    setShowStatusModal(false);

    // Show success toast
    setShowSuccessToast(true);
    Animated.sequence([
      Animated.timing(toastOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.timing(toastOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowSuccessToast(false);
    });
  };

  const handleUpdateProgressPress = () => {
    setNewProgress(progress);
    setProgressRemarks('');
    setProgressAttachments([]);
    setShowAddProgressModal(true);
  };

  const handleAddProgressAttachment = async () => {
    Alert.alert(
      'Add Media',
      'Choose an option',
      [
        { text: 'Take Photo or Video', onPress: () => takeProgressPhoto() },
        { text: 'Choose from Gallery', onPress: () => pickProgressFromGallery() },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const takeProgressPhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const newAttachment: MediaItem = {
        id: `progress-${Date.now()}`,
        type: result.assets[0].type === 'video' ? 'video' : 'image',
        uri: result.assets[0].uri,
        thumbnail: result.assets[0].uri,
      };
      setProgressAttachments([...progressAttachments, newAttachment]);
    }
  };

  const pickProgressFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Gallery permission is required');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const newAttachment: MediaItem = {
        id: `progress-${Date.now()}`,
        type: result.assets[0].type === 'video' ? 'video' : 'image',
        uri: result.assets[0].uri,
        thumbnail: result.assets[0].uri,
      };
      setProgressAttachments([...progressAttachments, newAttachment]);
    }
  };

  const handleRemoveProgressAttachment = (id: string) => {
    setProgressAttachments(progressAttachments.filter(att => att.id !== id));
  };

  const handleSaveProgress = async () => {
    setIsSavingProgress(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Create new progress update
    const newProgressUpdate: ProgressUpdate = {
      id: `prog-${Date.now()}`,
      progress: newProgress,
      previousProgress: progress,
      remarks: progressRemarks,
      updatedBy: 'Current User',
      designation: 'Engineer',
      timestamp: new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }).replace(',', ' at'),
      attachments: progressAttachments,
    };

    setProgressHistory([newProgressUpdate, ...progressHistory]);
    setLastProgressUpdate(newProgressUpdate);

    setIsSavingProgress(false);
    setShowAddProgressModal(false);

    // Update the progress
    setProgress(newProgress);

    // Show success toast
    setShowSuccessToast(true);
    Animated.sequence([
      Animated.timing(toastOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.timing(toastOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowSuccessToast(false);
    });
  };

  // Get filtered media items based on current filter
  const getFilteredMediaItems = (): MediaItem[] => {
    switch (mediaFilter) {
      case 'Photos':
        return allMediaItems.filter(item => item.type === 'image');
      case 'Videos':
        return allMediaItems.filter(item => item.type === 'video');
      case 'Documents':
        return allMediaItems.filter(item => item.type === 'document');
    }
  };

  // Get viewable media items (exclude documents for viewer)
  const getViewableMediaItems = (): MediaItem[] => {
    return getFilteredMediaItems().filter(item => item.type !== 'document');
  };

  const handleMediaPress = (item: MediaItem, index: number) => {
    if (item.type === 'document') {
      Alert.alert('Document', `Open ${item.filename || 'document'}`);
      return;
    }

    // For images and videos, open the viewer
    const viewableItems = getViewableMediaItems();
    const viewableIndex = viewableItems.findIndex(m => m.id === item.id);
    setViewerMediaItems(viewableItems);
    setSelectedMediaIndex(viewableIndex >= 0 ? viewableIndex : 0);
    setShowMediaViewer(true);
  };

  /**
   * Opens the Add Media sheet
   */
  const handleUploadMedia = () => {
    setShowUploadSheet(true);
  };

  /**
   * Handles photo/video capture from AddMediaSheet
   */
  const handlePhotoTaken = (result: ImagePicker.ImagePickerResult) => {
    if (result.assets && result.assets[0]) {
      const newMedia: MediaItem = {
        id: `media-${Date.now()}`,
        type: result.assets[0].type === 'video' ? 'video' : 'image',
        uri: result.assets[0].uri,
        thumbnail: result.assets[0].uri,
      };
      setAllMediaItems([newMedia, ...allMediaItems]);
      Alert.alert('Success', 'Media captured successfully');
    }
  };

  /**
   * Handles media selection from gallery via AddMediaSheet
   */
  const handleMediaSelected = (result: ImagePicker.ImagePickerResult) => {
    if (result.assets && result.assets[0]) {
      const newMedia: MediaItem = {
        id: `media-${Date.now()}`,
        type: result.assets[0].type === 'video' ? 'video' : 'image',
        uri: result.assets[0].uri,
        thumbnail: result.assets[0].uri,
      };
      setAllMediaItems([newMedia, ...allMediaItems]);
      Alert.alert('Success', 'Media added successfully');
    }
  };

  /**
   * Handles document selection via AddMediaSheet
   */
  const handleDocumentSelected = () => {
    // Simulate document picker
    const newDocument: MediaItem = {
      id: `doc-${Date.now()}`,
      type: 'document',
      uri: 'https://example.com/new-document.pdf',
      filename: `Document_${Date.now()}.pdf`,
    };
    setAllMediaItems([newDocument, ...allMediaItems]);
    Alert.alert('Success', 'Document uploaded successfully');
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
        <View style={styles.cardTitleRow}>
          <Text style={styles.cardTitle}>Project Progress</Text>
          <TouchableOpacity
            style={styles.updateButton}
            onPress={handleUpdateProgressPress}
            activeOpacity={0.7}
          >
            <Ionicons name="add-circle-outline" size={18} color={COLORS.saffron} />
            <Text style={styles.updateButtonText}>Update</Text>
          </TouchableOpacity>
        </View>
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

      {/* Financials Card - Comprehensive Mini-Dashboard */}
      <View style={styles.card}>
        {/* Card Header */}
        <Text style={styles.financialSummaryTitle}>Financial Summary</Text>

        {/* Primary Visual Indicator - Budget Utilization */}
        <View style={styles.budgetUtilizationSection}>
          <Text style={styles.budgetSummaryText}>
            {expenditure} Spent of {totalCost} Total Cost
          </Text>

          {/* Progress Bar with Percentage Overlay */}
          <View style={styles.budgetProgressBarContainer}>
            <View style={styles.budgetProgressBarBackground}>
              <View
                style={[
                  styles.budgetProgressBarFill,
                  { width: `${budgetUtilizationPercentage}%` }
                ]}
              />
            </View>
            <View style={styles.budgetPercentageOverlay}>
              <Text style={styles.budgetPercentageText}>
                {budgetUtilizationPercentage}% Utilized
              </Text>
            </View>
          </View>
        </View>

        {/* Divider Line */}
        <View style={styles.financialDivider} />

        {/* Detailed Financial Grid - 2 Columns */}
        <View style={styles.financialStatsGrid}>
          {/* Left Column */}
          <View style={styles.financialColumn}>
            <View style={styles.statBlock}>
              <Text style={styles.statLabel}>Remaining Cost</Text>
              <Text style={styles.statValue}>{remainingCost}</Text>
            </View>
            <View style={styles.statBlock}>
              <Text style={styles.statLabel}>Estimated Cost</Text>
              <Text style={styles.statValue}>{estimatedCost}</Text>
            </View>
          </View>

          {/* Right Column */}
          <View style={styles.financialColumn}>
            <View style={styles.statBlock}>
              <Text style={styles.statLabel}>Expenditure</Text>
              <Text style={styles.statValue}>{expenditure}</Text>
            </View>
            <View style={styles.statBlock}>
              <Text style={styles.statLabel}>Exp. Comp. Date</Text>
              <Text style={styles.statValue}>{expectedCompletionDate}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Status & Actions Card - Now Purely Informational */}
      <View style={styles.card}>
        <View style={styles.statusActionsContainer}>
          {/* Left Section: Inspections Overview */}
          <View style={styles.statusSection}>
            <Text style={styles.statusSectionTitle}>Inspections</Text>
            <View style={styles.statusStatsContainer}>
              <Text style={styles.statusStatText}>Total: <Text style={styles.statusStatValue}>12</Text></Text>
              <Text style={styles.statusStatText}>
                Overdue: <Text style={[styles.statusStatValue, styles.warningText]}>2</Text>
              </Text>
              <Text style={styles.statusLastUpdateText}>Last Update: 24-Jul-24, 10:30 AM</Text>
              <Text style={styles.statusLastUpdateByText}>By: Er Sabir Ali</Text>
            </View>
          </View>

          {/* Vertical Divider */}
          <View style={styles.verticalDivider} />

          {/* Right Section: Bottlenecks Overview */}
          <View style={styles.statusSection}>
            <Text style={styles.statusSectionTitle}>Bottlenecks</Text>
            <View style={styles.statusStatsContainer}>
              <Text style={styles.statusStatText}>Total: <Text style={styles.statusStatValue}>5</Text></Text>
              <Text style={styles.statusStatText}>
                High Priority: <Text style={[styles.statusStatValue, styles.warningText]}>1</Text>
              </Text>
              <Text style={styles.statusLastUpdateText}>Last Update: 23-Jul-24, 05:15 PM</Text>
              <Text style={styles.statusLastUpdateByText}>By: Test User</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderMediaTab = () => {
    const filteredMedia = getFilteredMediaItems();

    return (
      <View style={styles.tabContent}>
        {/* Media Grid */}
        {filteredMedia.length === 0 ? (
          <View style={styles.emptyMediaState}>
            <Ionicons name="images-outline" size={64} color={COLORS.textLight} />
            <Text style={styles.emptyMediaTitle}>No {mediaFilter} Yet</Text>
            <Text style={styles.emptyMediaText}>Tap the + button to upload</Text>
          </View>
        ) : (
          <FlatList
            data={filteredMedia}
            numColumns={3}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                style={styles.mediaThumbnail}
                onPress={() => handleMediaPress(item, index)}
                activeOpacity={0.8}
              >
                {item.type === 'document' ? (
                  <View style={styles.documentThumbnail}>
                    <Ionicons
                      name={item.filename?.endsWith('.pdf') ? 'document-text' : 'document'}
                      size={40}
                      color={COLORS.primary}
                    />
                    <Text style={styles.documentFilename} numberOfLines={2}>
                      {item.filename || 'Document'}
                    </Text>
                  </View>
                ) : (
                  <>
                    <Image source={{ uri: item.uri }} style={styles.thumbnailImage} />
                    {item.type === 'video' && (
                      <View style={styles.playIconOverlay}>
                        <Ionicons name="play-circle" size={40} color="white" />
                      </View>
                    )}
                  </>
                )}
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.mediaGrid}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Bottom Segmented Control Switcher */}
        <View style={styles.segmentedControlContainer}>
          <View style={styles.segmentedControl}>
            {(['Photos', 'Videos', 'Documents'] as MediaFilterType[]).map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.segmentedControlSegment,
                  mediaFilter === filter && styles.segmentedControlSegmentActive
                ]}
                onPress={() => setMediaFilter(filter)}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.segmentedControlText,
                  mediaFilter === filter && styles.segmentedControlTextActive
                ]}>
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    );
  };

  const getInspectionStatusColor = (status: InspectionStatus) => {
    switch (status) {
      case 'Passed':
        return { bg: '#E8F5E9', text: '#2E7D32' };
      case 'Failed':
        return { bg: '#FFEBEE', text: '#C62828' };
      case 'Pending':
        return { bg: '#FFF3E0', text: '#E65100' };
      default:
        return { bg: '#E8F5E9', text: '#2E7D32' };
    }
  };

  const handleInspectionPress = (inspection: Inspection) => {
    setSelectedInspection(inspection);
    setShowInspectionDetails(true);
  };

  const handleInspectionMediaPress = (media: MediaItem[], index: number) => {
    setViewerMediaItems(media);
    setSelectedMediaIndex(index);
    setShowMediaViewer(true);
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'High':
        return { bg: COLORS.priorityHigh, text: '#FFFFFF' };
      case 'Medium':
        return { bg: COLORS.priorityMedium, text: '#FFFFFF' };
      case 'Low':
        return { bg: COLORS.priorityLow, text: '#FFFFFF' };
      default:
        return { bg: COLORS.priorityMedium, text: '#FFFFFF' };
    }
  };

  const handleBottleneckPress = (bottleneck: Bottleneck) => {
    setSelectedBottleneck(bottleneck);
    setShowBottleneckDetails(true);
  };

  const handleBottleneckMediaPress = (media: MediaItem[], index: number) => {
    setViewerMediaItems(media);
    setSelectedMediaIndex(index);
    setShowMediaViewer(true);
  };

  const renderInspectionCard = ({ item }: { item: Inspection }) => {
    const statusColors = getInspectionStatusColor(item.status);
    const descriptionPreview = item.description.length > 80
      ? item.description.substring(0, 80) + '...'
      : item.description;

    // Filter only visual media (images and videos) for thumbnail preview
    const visualMedia = item.media.filter(m => m.type === 'image' || m.type === 'video');
    const hasMedia = visualMedia.length > 0;
    const displayMedia = visualMedia.slice(0, 3);
    const remainingCount = visualMedia.length - 3;

    return (
      <TouchableOpacity
        style={styles.inspectionCard}
        onPress={() => handleInspectionPress(item)}
        activeOpacity={0.7}
      >
        {/* Header with Date and Status */}
        <View style={styles.inspectionCardHeader}>
          <Text style={styles.inspectionDate}>{item.date}</Text>
          <View style={[styles.inspectionStatusBadge, { backgroundColor: statusColors.bg }]}>
            <Text style={[styles.inspectionStatusText, { color: statusColors.text }]}>
              {item.status}
            </Text>
          </View>
        </View>

        {/* Title/Heading */}
        <Text style={styles.inspectionTitle}>{item.title}</Text>

        {/* Description Preview */}
        <Text style={styles.inspectionDescription}>{descriptionPreview}</Text>

        {/* Media Thumbnail Preview Gallery */}
        {hasMedia && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.inspectionMediaPreview}
            contentContainerStyle={styles.inspectionMediaPreviewContent}
          >
            {displayMedia.map((media, index) => (
              <View key={media.id} style={styles.inspectionThumbnailWrapper}>
                <Image
                  source={{ uri: media.type === 'video' ? media.thumbnail : media.uri }}
                  style={styles.inspectionThumbnail}
                />
                {media.type === 'video' && (
                  <View style={styles.thumbnailPlayIcon}>
                    <Ionicons name="play-circle" size={24} color="white" />
                  </View>
                )}
              </View>
            ))}
            {remainingCount > 0 && (
              <View style={styles.inspectionThumbnailWrapper}>
                <View style={styles.remainingCountOverlay}>
                  <Text style={styles.remainingCountText}>+{remainingCount}</Text>
                </View>
              </View>
            )}
          </ScrollView>
        )}

        {/* Inspector Details */}
        <View style={styles.inspectorSection}>
          <Text style={styles.inspectorName}>
            by <Text style={styles.inspectorNameBold}>{item.inspector}</Text>
          </Text>
          <Text style={styles.inspectorMeta}>{item.inspectorPosition}</Text>
          <Text style={styles.inspectorMeta}>{item.inspectorDepartment}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderInspectionsTab = () => (
    <View style={styles.tabContent}>
      <FlatList
        data={inspections}
        keyExtractor={(item) => item.id}
        renderItem={renderInspectionCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );

  const renderBottleneckCard = ({ item }: { item: Bottleneck }) => {
    const priorityColors = getPriorityColor(item.priority);
    const descriptionPreview = item.description.length > 80
      ? item.description.substring(0, 80) + '...'
      : item.description;

    // Filter only visual media (images and videos) for thumbnail preview
    const visualMedia = item.media.filter(m => m.type === 'image' || m.type === 'video');
    const hasMedia = visualMedia.length > 0;
    const displayMedia = visualMedia.slice(0, 3);
    const remainingCount = visualMedia.length - 3;

    return (
      <TouchableOpacity
        style={styles.bottleneckCard}
        onPress={() => handleBottleneckPress(item)}
        activeOpacity={0.7}
      >
        {/* Header with Date and Priority */}
        <View style={styles.bottleneckCardHeader}>
          <Text style={styles.bottleneckDate}>{item.date}</Text>
          <View style={[styles.priorityBadge, { backgroundColor: priorityColors.bg }]}>
            <Text style={[styles.priorityText, { color: priorityColors.text }]}>
              {item.priority}
            </Text>
          </View>
        </View>

        {/* Title/Heading */}
        <Text style={styles.bottleneckTitle}>{item.title}</Text>

        {/* Description Preview */}
        <Text style={styles.bottleneckDescription}>{descriptionPreview}</Text>

        {/* Media Thumbnail Preview Gallery */}
        {hasMedia && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.bottleneckMediaPreview}
            contentContainerStyle={styles.bottleneckMediaPreviewContent}
          >
            {displayMedia.map((media, index) => (
              <View key={media.id} style={styles.bottleneckThumbnailWrapper}>
                <Image
                  source={{ uri: media.type === 'video' ? media.thumbnail : media.uri }}
                  style={styles.bottleneckThumbnail}
                />
                {media.type === 'video' && (
                  <View style={styles.thumbnailPlayIcon}>
                    <Ionicons name="play-circle" size={24} color="white" />
                  </View>
                )}
              </View>
            ))}
            {remainingCount > 0 && (
              <View style={styles.bottleneckThumbnailWrapper}>
                <View style={styles.remainingCountOverlay}>
                  <Text style={styles.remainingCountText}>+{remainingCount}</Text>
                </View>
              </View>
            )}
          </ScrollView>
        )}

        {/* Reporter Details */}
        <View style={styles.reporterSection}>
          <Text style={styles.reporterName}>
            by <Text style={styles.reporterNameBold}>{item.reportedBy}</Text>
          </Text>
          <Text style={styles.reporterMeta}>{item.reporterPosition}</Text>
          <Text style={styles.reporterMeta}>{item.reporterDepartment}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderBottlenecksTab = () => (
    <View style={styles.tabContent}>
      <FlatList
        data={bottlenecks}
        keyExtractor={(item) => item.id}
        renderItem={renderBottleneckCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );

  const renderActivityTab = () => (
    <View style={styles.tabContent}>
      {activityHistory.length === 0 ? (
        <View style={styles.emptyActivityState}>
          <Ionicons name="time-outline" size={64} color={COLORS.textLight} />
          <Text style={styles.emptyActivityTitle}>No Activity Yet</Text>
          <Text style={styles.emptyActivityText}>Status updates will appear here</Text>
        </View>
      ) : (
        <FlatList
          data={activityHistory}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => {
            const statusColors = getStatusColors(item.status);
            const isLast = index === activityHistory.length - 1;

            return (
              <View style={styles.timelineItem}>
                {/* Timeline Line and Node */}
                <View style={styles.timelineLineContainer}>
                  <View style={[styles.timelineNode, { backgroundColor: statusColors.text }]} />
                  {!isLast && <View style={styles.timelineLine} />}
                </View>

                {/* Activity Card */}
                <View style={styles.activityCard}>
                  {/* 1. Status Change Header */}
                  <View style={styles.activityHeader}>
                    <Text style={[styles.activityStatusText, { color: statusColors.text }]}>
                      Status changed to {item.status}
                    </Text>
                  </View>

                  {/* 2. Remarks */}
                  {item.remarks && (
                    <Text style={styles.activityRemarks}>{item.remarks}</Text>
                  )}

                  {/* 3. "Updated By" Information Footer */}
                  <Text style={styles.activityMeta}>
                    by <Text style={styles.activityAuthor}>{item.updatedBy}</Text> ({item.designation}) on {item.timestamp}
                  </Text>
                </View>
              </View>
            );
          }}
          contentContainerStyle={styles.activityListContent}
          showsVerticalScrollIndicator={false}
        />
      )}
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
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabBarContainer}
        contentContainerStyle={styles.tabBarContent}
      >
        {(['Overview', 'Media', 'Inspections', 'Bottlenecks', 'Activity'] as TabName[]).map((tab) => (
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
      </ScrollView>

      {/* Tab Content */}
      {activeTab === 'Overview' && renderOverviewTab()}
      {activeTab === 'Media' && renderMediaTab()}
      {activeTab === 'Inspections' && renderInspectionsTab()}
      {activeTab === 'Bottlenecks' && renderBottlenecksTab()}
      {activeTab === 'Activity' && renderActivityTab()}

      {/* Speed Dial FAB - Show on Overview, Media, Inspections, and Bottlenecks tabs */}
      {(activeTab === 'Overview' || activeTab === 'Media' || activeTab === 'Inspections' || activeTab === 'Bottlenecks') && (
        <SpeedDialFAB
          actions={[
            {
              icon: 'images-outline',
              label: 'Add Media',
              onPress: handleUploadMedia,
            },
            {
              icon: 'warning-outline',
              label: 'Add Bottleneck',
              onPress: () => router.push({
                pathname: '/(drawer)/create-bottleneck',
                params: { projectId, returnTab: activeTab },
              }),
            },
            {
              icon: 'checkmark-circle-outline',
              label: 'Create Task',
              onPress: () => router.push({
                pathname: '/(drawer)/create-task',
                params: { projectId, returnTab: activeTab },
              }),
            },
            {
              icon: 'document-text-outline',
              label: 'Create Complaint',
              onPress: () => router.push({
                pathname: '/(drawer)/create-complaint',
                params: { projectId, returnTab: activeTab },
              }),
            },
            {
              icon: 'clipboard-outline',
              label: 'New Inspection',
              onPress: () => router.push({
                pathname: '/(drawer)/create-inspection',
                params: { projectId, returnTab: activeTab },
              }),
            },
          ]}
        />
      )}

      {/* Status Update Modal */}
      <Modal
        visible={showStatusModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowStatusModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.statusUpdateBottomSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Update Project Status</Text>
              <TouchableOpacity onPress={() => setShowStatusModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
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

              <Text style={styles.inputLabel}>Remarks (Optional)</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Add a comment about the status change..."
                placeholderTextColor={COLORS.textSecondary}
                value={statusComment}
                onChangeText={setStatusComment}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              {/* Capture Location Button */}
              <TouchableOpacity
                style={[
                  styles.locationButton,
                  capturedLocation && styles.locationButtonSuccess
                ]}
                onPress={handleCaptureLocation}
                disabled={isCapturingLocation}
                activeOpacity={0.7}
              >
                {isCapturingLocation ? (
                  <ActivityIndicator color={COLORS.primary} size="small" />
                ) : (
                  <>
                    <Ionicons
                      name={capturedLocation ? 'checkmark-circle' : 'location'}
                      size={20}
                      color={capturedLocation ? COLORS.success : COLORS.primary}
                    />
                    <Text style={[
                      styles.locationButtonText,
                      capturedLocation && styles.locationButtonTextSuccess
                    ]}>
                      {capturedLocation ? 'Location Captured' : 'Capture Current Location'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Add Attachments Section */}
              <Text style={styles.inputLabel}>Attachments (Optional)</Text>
              <TouchableOpacity
                style={styles.addAttachmentButton}
                onPress={handleAddStatusAttachment}
                activeOpacity={0.7}
              >
                <Ionicons name="camera-outline" size={24} color={COLORS.textSecondary} />
                <Text style={styles.addAttachmentText}>Add Photo or Video</Text>
              </TouchableOpacity>

              {/* Attachment Thumbnails */}
              {statusAttachments.length > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.attachmentScrollView}
                >
                  {statusAttachments.map((attachment) => (
                    <View key={attachment.id} style={styles.attachmentThumbContainer}>
                      <Image source={{ uri: attachment.uri }} style={styles.attachmentThumb} />
                      <TouchableOpacity
                        style={styles.removeAttachmentButton}
                        onPress={() => handleRemoveStatusAttachment(attachment.id)}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="close-circle" size={24} color={COLORS.statusDelayed} />
                      </TouchableOpacity>
                      {attachment.type === 'video' && (
                        <View style={styles.attachmentVideoIndicator}>
                          <Ionicons name="play-circle" size={20} color="white" />
                        </View>
                      )}
                    </View>
                  ))}
                </ScrollView>
              )}
            </ScrollView>

            <TouchableOpacity style={styles.saveButton} onPress={handleSaveStatus}>
              <Text style={styles.saveButtonText}>Update</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Inspection Details Bottom Sheet */}
      <Modal
        visible={showInspectionDetails}
        transparent
        animationType="slide"
        onRequestClose={() => setShowInspectionDetails(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.inspectionDetailsBottomSheet}>
            {/* Grabber Handle */}
            <View style={styles.grabberHandle} />

            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Inspection Details</Text>
              <TouchableOpacity onPress={() => setShowInspectionDetails(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              {selectedInspection && (
                <>
                  {/* Summary Section */}
                  <View style={styles.inspectionDetailsSummary}>
                    <View style={styles.inspectionDetailsRow}>
                      <Text style={styles.inspectionDetailsDate}>{selectedInspection.date}</Text>
                      <View style={[
                        styles.inspectionStatusBadge,
                        { backgroundColor: getInspectionStatusColor(selectedInspection.status).bg }
                      ]}>
                        <Text style={[
                          styles.inspectionStatusText,
                          { color: getInspectionStatusColor(selectedInspection.status).text }
                        ]}>
                          {selectedInspection.status}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Description Section */}
                  <View style={styles.inspectionDetailsSection}>
                    <Text style={styles.inspectionDetailsSectionTitle}>Remarks & Observations</Text>
                    <Text style={styles.inspectionDetailsDescription}>{selectedInspection.description}</Text>
                  </View>

                  {/* Media Gallery Section */}
                  {selectedInspection.media.length > 0 && (
                    <View style={styles.inspectionDetailsSection}>
                      <Text style={styles.inspectionDetailsSectionTitle}>Attached Media</Text>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.inspectionMediaGallery}
                      >
                        {selectedInspection.media.map((media, index) => (
                          <TouchableOpacity
                            key={media.id}
                            style={styles.inspectionMediaThumbnail}
                            onPress={() => handleInspectionMediaPress(selectedInspection.media, index)}
                            activeOpacity={0.7}
                          >
                            {media.type === 'document' ? (
                              <View style={styles.documentThumbnail}>
                                <Ionicons name="document-text" size={40} color={COLORS.primary} />
                                <Text style={styles.documentFilename} numberOfLines={2}>
                                  {media.filename || 'Document'}
                                </Text>
                              </View>
                            ) : (
                              <>
                                <Image
                                  source={{ uri: media.type === 'video' ? media.thumbnail : media.uri }}
                                  style={styles.inspectionMediaThumbnailImage}
                                />
                                {media.type === 'video' && (
                                  <View style={styles.videoPlayIcon}>
                                    <Ionicons name="play-circle" size={32} color="white" />
                                  </View>
                                )}
                              </>
                            )}
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}

                  {/* Inspector Section */}
                  <View style={styles.inspectionDetailsSection}>
                    <Text style={styles.inspectionDetailsSectionTitle}>Inspector</Text>
                    <Text style={styles.inspectionDetailsInspectorName}>{selectedInspection.inspector}</Text>
                    <Text style={styles.inspectionDetailsMeta}>{selectedInspection.inspectorPosition}</Text>
                    <Text style={styles.inspectionDetailsMeta}>{selectedInspection.inspectorDepartment}</Text>
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Bottleneck Details Bottom Sheet */}
      <Modal
        visible={showBottleneckDetails}
        transparent
        animationType="slide"
        onRequestClose={() => setShowBottleneckDetails(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.bottleneckDetailsBottomSheet}>
            {/* Grabber Handle */}
            <View style={styles.grabberHandle} />

            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Bottleneck Details</Text>
              <TouchableOpacity onPress={() => setShowBottleneckDetails(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              {selectedBottleneck && (
                <>
                  {/* Summary Section */}
                  <View style={styles.bottleneckDetailsSummary}>
                    <View style={styles.bottleneckDetailsRow}>
                      <Text style={styles.bottleneckDetailsDate}>{selectedBottleneck.date}</Text>
                      <View style={[
                        styles.priorityBadge,
                        { backgroundColor: getPriorityColor(selectedBottleneck.priority).bg }
                      ]}>
                        <Text style={[
                          styles.priorityText,
                          { color: getPriorityColor(selectedBottleneck.priority).text }
                        ]}>
                          {selectedBottleneck.priority}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Description Section */}
                  <View style={styles.bottleneckDetailsSection}>
                    <Text style={styles.bottleneckDetailsSectionTitle}>Description</Text>
                    <Text style={styles.bottleneckDetailsDescription}>{selectedBottleneck.description}</Text>
                  </View>

                  {/* Media Gallery Section */}
                  {selectedBottleneck.media.length > 0 && (
                    <View style={styles.bottleneckDetailsSection}>
                      <Text style={styles.bottleneckDetailsSectionTitle}>Attached Media</Text>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.bottleneckMediaGallery}
                      >
                        {selectedBottleneck.media.map((media, index) => (
                          <TouchableOpacity
                            key={media.id}
                            style={styles.bottleneckMediaThumbnail}
                            onPress={() => handleBottleneckMediaPress(selectedBottleneck.media, index)}
                            activeOpacity={0.7}
                          >
                            {media.type === 'document' ? (
                              <View style={styles.documentThumbnail}>
                                <Ionicons name="document-text" size={40} color={COLORS.primary} />
                                <Text style={styles.documentFilename} numberOfLines={2}>
                                  {media.filename || 'Document'}
                                </Text>
                              </View>
                            ) : (
                              <>
                                <Image
                                  source={{ uri: media.type === 'video' ? media.thumbnail : media.uri }}
                                  style={styles.bottleneckMediaThumbnailImage}
                                />
                                {media.type === 'video' && (
                                  <View style={styles.videoPlayIcon}>
                                    <Ionicons name="play-circle" size={32} color="white" />
                                  </View>
                                )}
                              </>
                            )}
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}

                  {/* Reporter Section */}
                  <View style={styles.bottleneckDetailsSection}>
                    <Text style={styles.bottleneckDetailsSectionTitle}>Reported By</Text>
                    <Text style={styles.bottleneckDetailsReporterName}>{selectedBottleneck.reportedBy}</Text>
                    <Text style={styles.bottleneckDetailsMeta}>{selectedBottleneck.reporterPosition}</Text>
                    <Text style={styles.bottleneckDetailsMeta}>{selectedBottleneck.reporterDepartment}</Text>
                  </View>
                </>
              )}
            </ScrollView>
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
        <GestureHandlerRootView style={{ flex: 1 }}>
          <View style={styles.mediaViewerContainer}>
            <TouchableOpacity
              style={styles.closeMediaButton}
              onPress={() => setShowMediaViewer(false)}
            >
              <Ionicons name="close" size={32} color="white" />
            </TouchableOpacity>

            <FlatList
              data={viewerMediaItems.length > 0 ? viewerMediaItems : []}
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
                  {item.type === 'image' ? (
                    <ZoomableImage uri={item.uri} />
                  ) : (
                    <>
                      <Image
                        source={{ uri: item.uri }}
                        style={styles.fullImage}
                        resizeMode="contain"
                      />
                      <TouchableOpacity style={styles.playButton}>
                        <Ionicons name="play-circle" size={80} color="white" />
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              )}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
            />
          </View>
        </GestureHandlerRootView>
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

      {/* Add Progress Modal */}
      <Modal
        visible={showAddProgressModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddProgressModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.progressBottomSheet}>
            {/* Grabber Handle */}
            <View style={styles.grabberHandle} />

            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Update Project Progress</Text>
              <TouchableOpacity onPress={() => setShowAddProgressModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.progressScrollContent}>
              {/* 1. Refined Progress Slider Section */}
              <View style={styles.progressSliderSection}>
                <Text style={styles.compactPercentageText}>{newProgress}%</Text>

                <View style={styles.sliderContainer}>
                  <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={100}
                    step={1}
                    value={newProgress}
                    onValueChange={setNewProgress}
                    minimumTrackTintColor={COLORS.saffron}
                    maximumTrackTintColor={COLORS.border}
                    thumbTintColor={COLORS.saffron}
                  />
                  <View style={styles.sliderLabels}>
                    <Text style={styles.sliderLabel}>0%</Text>
                    <Text style={styles.sliderLabel}>50%</Text>
                    <Text style={styles.sliderLabel}>100%</Text>
                  </View>
                </View>
              </View>

              {/* 2. New Attachment Tile */}
              <TouchableOpacity
                style={styles.attachmentTile}
                onPress={handleAddProgressAttachment}
                activeOpacity={0.7}
              >
                <Ionicons name="attach-outline" size={20} color={COLORS.textSecondary} />
                <Text style={styles.attachmentTileText}>Add Photo, Video, or File</Text>
              </TouchableOpacity>

              {/* 3. Thumbnail Gallery (Dynamic - Only shows when files are attached) */}
              {progressAttachments.length > 0 && (
                <View style={styles.thumbnailGallery}>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                  >
                    {progressAttachments.map((attachment) => (
                      <View key={attachment.id} style={styles.galleryThumbContainer}>
                        <Image source={{ uri: attachment.uri }} style={styles.galleryThumb} />
                        <TouchableOpacity
                          style={styles.removeThumbButton}
                          onPress={() => handleRemoveProgressAttachment(attachment.id)}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="close-circle" size={22} color="white" />
                        </TouchableOpacity>
                        {attachment.type === 'video' && (
                          <View style={styles.galleryVideoOverlay}>
                            <Ionicons name="play-circle" size={28} color="white" />
                          </View>
                        )}
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* 4. Remarks Box */}
              <View style={styles.remarksSection}>
                <Text style={styles.inputLabel}>Remarks (Optional)</Text>
                <TextInput
                  style={styles.remarksTextArea}
                  placeholder="Add a comment about this progress update..."
                  placeholderTextColor={COLORS.textSecondary}
                  value={progressRemarks}
                  onChangeText={setProgressRemarks}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              {/* 5. Last Updated Section */}
              <View style={styles.lastUpdateSection}>
                <View style={styles.lastUpdateDivider} />
                <Text style={styles.lastUpdateTitle}>Last Update</Text>
                {lastProgressUpdate ? (
                  <View style={styles.lastUpdateInfo}>
                    <Text style={styles.lastUpdateText}>
                      by <Text style={styles.lastUpdateAuthor}>{lastProgressUpdate.updatedBy}</Text> ({lastProgressUpdate.designation}) on {lastProgressUpdate.timestamp}
                    </Text>
                    {lastProgressUpdate.remarks && (
                      <Text style={styles.lastUpdateRemarks}>
                        &ldquo;{lastProgressUpdate.remarks}&rdquo;
                      </Text>
                    )}
                  </View>
                ) : (
                  <Text style={styles.noUpdateText}>No previous updates recorded.</Text>
                )}
              </View>
            </ScrollView>

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.progressSaveButton, isSavingProgress && styles.disabledButton]}
              onPress={handleSaveProgress}
              disabled={isSavingProgress}
              activeOpacity={0.8}
            >
              {isSavingProgress ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.progressSaveButtonText}>Save Progress</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add Media Sheet - Reusable Component */}
      <AddMediaSheet
        visible={showUploadSheet}
        onClose={() => setShowUploadSheet(false)}
        onPhotoTaken={handlePhotoTaken}
        onMediaSelected={handleMediaSelected}
        onDocumentSelected={handleDocumentSelected}
      />

      {/* Success Toast */}
      {showSuccessToast && (
        <Animated.View
          style={[
            styles.successToast,
            {
              opacity: toastOpacity,
              transform: [
                {
                  translateY: toastOpacity.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Ionicons name="checkmark-circle" size={24} color="white" />
          <Text style={styles.successToastText}>Progress updated successfully!</Text>
        </Animated.View>
      )}
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
  tabBarContainer: {
    backgroundColor: COLORS.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    maxHeight: 52,
  },
  tabBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  tab: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
    marginHorizontal: 2,
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
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 153, 51, 0.1)',
    borderRadius: 20,
  },
  updateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.saffron,
    marginLeft: 4,
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
  // Financial Summary Card Styles - Redesigned
  financialSummaryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 20,
  },
  budgetUtilizationSection: {
    marginBottom: 20,
  },
  budgetSummaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 16,
    textAlign: 'center',
  },
  budgetProgressBarContainer: {
    position: 'relative',
    height: 24,
  },
  budgetProgressBarBackground: {
    height: 24,
    backgroundColor: '#E8E8E8',
    borderRadius: 12,
    overflow: 'hidden',
  },
  budgetProgressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
  },
  budgetPercentageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  budgetPercentageText: {
    fontSize: 13,
    fontWeight: '700',
    color: 'white',
  },
  financialDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: 24,
  },
  financialStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  financialColumn: {
    flex: 1,
    paddingHorizontal: 4,
  },
  statBlock: {
    marginBottom: 20,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textLight,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
  },
  // Status & Actions Card Styles
  statusActionsContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  statusSection: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  statusSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  statusStatsContainer: {
    marginBottom: 20,
  },
  statusStatText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  statusStatValue: {
    fontWeight: '700',
    color: COLORS.text,
  },
  warningText: {
    color: COLORS.statusDelayed,
  },
  statusLastUpdateText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginTop: 8,
    marginBottom: 4,
  },
  statusLastUpdateByText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
  },
  verticalDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginVertical: 8,
  },
  inspectionButton: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  bottleneckButton: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#424242',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'white',
  },
  // Media Tab Styles
  emptyMediaState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyMediaTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMediaText: {
    fontSize: 14,
    color: COLORS.textSecondary,
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
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  documentThumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  documentFilename: {
    fontSize: 10,
    fontWeight: '500',
    color: COLORS.text,
    textAlign: 'center',
    marginTop: 8,
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
  // Bottom Segmented Control Styles
  segmentedControlContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    padding: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
  segmentedControlSegment: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 18,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  segmentedControlSegmentActive: {
    backgroundColor: '#D0D0D0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  segmentedControlText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666666',
  },
  segmentedControlTextActive: {
    color: '#1A1A1A',
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
  },
  inspectionCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  inspectionCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
  inspectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
    marginTop: 2,
  },
  inspectionMediaPreview: {
    marginBottom: 12,
  },
  inspectionMediaPreviewContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inspectionThumbnailWrapper: {
    position: 'relative',
    marginRight: 8,
  },
  inspectionThumbnail: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: COLORS.background,
  },
  inspectorSection: {
    marginBottom: 12,
  },
  inspectorName: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.textSecondary,
  },
  inspectorNameBold: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  inspectorMeta: {
    fontSize: 12,
    fontWeight: '400',
    color: COLORS.textLight,
    marginTop: 2,
  },
  inspectionDescription: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  mediaIndicators: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  mediaIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottleneckCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  bottleneckCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  bottleneckDate: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '700',
  },
  bottleneckTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
    marginTop: 2,
  },
  reporterSection: {
    marginBottom: 12,
  },
  reporterName: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  reporterNameBold: {
    fontWeight: '700',
    color: COLORS.text,
  },
  reporterMeta: {
    fontSize: 13,
    fontWeight: '400',
    color: COLORS.textLight,
    marginTop: 2,
  },
  bottleneckDescription: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: 12,
  },
  bottleneckMediaPreview: {
    marginBottom: 12,
  },
  bottleneckMediaPreviewContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottleneckThumbnailWrapper: {
    position: 'relative',
    marginRight: 8,
  },
  bottleneckThumbnail: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: COLORS.background,
  },
  thumbnailPlayIcon: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
  },
  remainingCountOverlay: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  remainingCountText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
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
  zoomableContainer: {
    flex: 1,
    width: width,
    height: height,
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
  // Progress Bottom Sheet Styles
  progressBottomSheet: {
    backgroundColor: COLORS.cardBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: 24,
    height: '85%',
  },
  progressScrollContent: {
    flex: 1,
  },
  grabberHandle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  progressSliderSection: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  compactPercentageText: {
    fontSize: 42,
    fontWeight: '700',
    color: COLORS.saffron,
    marginBottom: 16,
  },
  sliderContainer: {
    width: '100%',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginTop: 8,
  },
  sliderLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  // New Attachment Tile Styles
  attachmentTile: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F8F8',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 4,
    marginBottom: 8,
  },
  attachmentTileText: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginLeft: 10,
  },
  // Thumbnail Gallery Styles
  thumbnailGallery: {
    marginBottom: 20,
    paddingVertical: 12,
  },
  galleryThumbContainer: {
    width: 100,
    height: 100,
    marginRight: 12,
    borderRadius: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  galleryThumb: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  removeThumbButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 11,
    width: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryVideoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  remarksSection: {
    marginTop: 8,
    marginBottom: 24,
  },
  remarksTextArea: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: COLORS.text,
    minHeight: 120,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  progressSaveButton: {
    backgroundColor: COLORS.saffron,
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    shadowColor: COLORS.saffron,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  progressSaveButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: 'white',
  },
  disabledButton: {
    opacity: 0.6,
  },
  // Success Toast Styles
  successToast: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: COLORS.success,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  successToastText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
    marginLeft: 12,
    flex: 1,
  },
  // Status Update Bottom Sheet Styles
  statusUpdateBottomSheet: {
    backgroundColor: COLORS.cardBackground,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '90%',
  },
  inspectionDetailsBottomSheet: {
    backgroundColor: COLORS.cardBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingTop: 12,
    height: '85%',
  },
  inspectionDetailsSummary: {
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: 16,
  },
  inspectionDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inspectionDetailsDate: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  inspectionDetailsSection: {
    marginBottom: 20,
  },
  inspectionDetailsSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  inspectionDetailsInspectorName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  inspectionDetailsMeta: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  inspectionDetailsDescription: {
    fontSize: 15,
    fontWeight: '400',
    color: COLORS.text,
    lineHeight: 22,
  },
  inspectionMediaGallery: {
    marginTop: 8,
  },
  inspectionMediaThumbnail: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginRight: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.background,
  },
  inspectionMediaThumbnailImage: {
    width: '100%',
    height: '100%',
  },
  videoPlayIcon: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  bottleneckDetailsBottomSheet: {
    backgroundColor: COLORS.cardBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingTop: 12,
    height: '85%',
  },
  bottleneckDetailsSummary: {
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: 16,
  },
  bottleneckDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottleneckDetailsDate: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  bottleneckDetailsSection: {
    marginBottom: 20,
  },
  bottleneckDetailsSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  bottleneckDetailsReporterName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  bottleneckDetailsMeta: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  bottleneckDetailsDescription: {
    fontSize: 15,
    fontWeight: '400',
    color: COLORS.text,
    lineHeight: 22,
  },
  bottleneckMediaGallery: {
    marginTop: 8,
  },
  bottleneckMediaThumbnail: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginRight: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.background,
  },
  bottleneckMediaThumbnailImage: {
    width: '100%',
    height: '100%',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  locationButtonSuccess: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderColor: COLORS.success,
  },
  locationButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 10,
  },
  locationButtonTextSuccess: {
    color: COLORS.success,
  },
  addAttachmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    paddingVertical: 40,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    marginBottom: 16,
  },
  addAttachmentText: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginLeft: 10,
  },
  attachmentScrollView: {
    marginBottom: 20,
  },
  attachmentThumbContainer: {
    width: 100,
    height: 100,
    marginRight: 12,
    position: 'relative',
  },
  attachmentThumb: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  removeAttachmentButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
  },
  attachmentVideoIndicator: {
    position: 'absolute',
    bottom: 8,
    right: 8,
  },
  // Activity Tab Styles
  emptyActivityState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyActivityTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyActivityText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  activityListContent: {
    padding: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  timelineLineContainer: {
    width: 40,
    alignItems: 'center',
  },
  timelineNode: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginTop: 4,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: COLORS.border,
    marginTop: 8,
  },
  activityCard: {
    flex: 1,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginLeft: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  activityHeader: {
    marginBottom: 8,
  },
  activityStatusText: {
    fontSize: 16,
    fontWeight: '700',
  },
  activityMeta: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginTop: 8,
  },
  activityAuthor: {
    fontWeight: '700',
    color: COLORS.text,
  },
  activityRemarks: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: 12,
  },
  activityFooterSeparator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  activityLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    marginBottom: 12,
  },
  activityLocationText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginLeft: 6,
    fontWeight: '500',
  },
  activityAttachmentsContainer: {
    marginTop: 12,
  },
  activityAttachmentThumb: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
    position: 'relative',
  },
  activityThumbImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  activityVideoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
  },
  // Last Update Section Styles
  lastUpdateSection: {
    marginTop: 24,
    marginBottom: 16,
  },
  lastUpdateDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: 16,
  },
  lastUpdateTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  lastUpdateInfo: {
    backgroundColor: COLORS.background,
    padding: 14,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  lastUpdateText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  lastUpdateAuthor: {
    fontWeight: '700',
    color: COLORS.text,
  },
  lastUpdateRemarks: {
    fontSize: 13,
    color: COLORS.text,
    fontStyle: 'italic',
    marginTop: 8,
    lineHeight: 18,
  },
  noUpdateText: {
    fontSize: 14,
    color: COLORS.textLight,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 16,
  },
});
