import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  FlatList,
  TextInput,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { DrawerActions, useNavigation, useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import FilterBottomSheet from '@/components/FilterBottomSheet';
import * as Clipboard from 'expo-clipboard';
import Toast from '@/components/Toast';
import {
  fetchComplaints,
  setStatusFilter,
  setSearchQuery,
  selectComplaints,
  selectComplaintsLoading,
  selectComplaintsError,
  selectComplaintsPagination,
  selectCurrentPage,
} from '@/src/store/complaintsSlice';

import {
  fetchZones,
  fetchCircles,
  fetchDivisions,
  setSelectedZone,
  setSelectedCircle,
  setSelectedDivision,
  selectZones,
  selectCircles,
  selectDivisions,
  selectSelectedZoneId,
  selectSelectedCircleId,
  selectSelectedDivisionId,
  selectIsLoadingZones,
  selectIsLoadingCircles,
  selectIsLoadingDivisions,
  selectLocationError,
} from '@/src/store/locationSlice';

import { AppDispatch, RootState } from '@/src/store/index';

const COLORS = {
  background: '#F5F5F5',
  cardBackground: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#666666',
  textLight: '#9E9E9E',
  primary: '#2196F3',
  saffron: '#FF9800',
  border: '#E0E0E0',
  searchBg: '#F8F8F8',
  filterActive: '#2196F3',
  filterInactive: '#F5F5F5',
  tagBackground: '#E3F2FD',
  tagText: '#2196F3',

  // Status colors
  statusOpen: '#F44336',
  statusInProgress: '#2196F3',
  statusResolved: '#4CAF50',
  statusClosed: '#757575',

  // SLA colors
  slaBreached: '#D32F2F',
  slaNearing: '#FF9800',
  slaOnTrack: '#4CAF50',

  // Attachment icon color
  attachmentIcon: '#9E9E9E',
};

interface Complaint {
  id: string;
  complaint_number: string;
  category: string;
  department: string;
  serviceChild: string;
  location: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed' | string;
  sla: 'Breached' | 'Nearing' | 'On Track' | string;
  createdAt: string;
  hasPhotos?: boolean;
  hasVideos?: boolean;
  hasDocuments?: boolean;
  zone: string | undefined;
  priority: number;
}

interface ComplaintCardProps {
  complaint: Complaint;
  onPress: () => void;
  onCopy: (text: string) => void;
}
function ComplaintCard({ complaint, onPress, onCopy }: ComplaintCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open':
        return COLORS.statusOpen;
      case 'In Progress':
        return COLORS.statusInProgress;
      case 'Resolved':
        return COLORS.statusResolved;
      case 'Closed':
        return COLORS.statusClosed;
      default:
        return COLORS.textSecondary;
    }
  };
  const getPriorityColor = (priorityId: number) => {
  switch (priorityId) {
    case 1:
      return '#FF3B30'; // red
    case 2:
      return '#FFCC00'; // yellow
    case 3:
      return '#4CAF50'; // green
    default:
      return '#9E9E9E'; // fallback grey
  }
};
  return (
    <TouchableOpacity
      style={styles.complaintCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Top Section - ID (left) and Status Badge (right) */}
      <View style={styles.cardTopRow}>
        <TouchableOpacity
          onLongPress={() => onCopy(complaint.complaint_number)}
          style={{ flexDirection: 'row', alignItems: 'center' }}
        >
          <Text style={styles.complaintId}>
            {complaint.complaint_number}
          </Text>

          <TouchableOpacity
            onPress={() => onCopy(complaint.complaint_number)}
            style={{ marginLeft: 6 }}
          >
            <Ionicons name="copy-outline" size={18} color="#444" />
          </TouchableOpacity>
        </TouchableOpacity>

        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(complaint.status) },
          ]}
        >
          <Text style={styles.statusBadgeText}>{complaint.status}</Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <Text style={styles.complaintCategory} numberOfLines={1} ellipsizeMode="tail">
            {complaint.department + (complaint?.zone ? ` ${complaint.zone}` : '')}
          </Text>

          {/* Priority Icon */}
          <Ionicons
            name="alert-circle"
            size={18}
            color={getPriorityColor(complaint?.priority)}
            style={{ marginLeft: 6 }}
          />
        </View>
      {/* Main Body - Category and Location */}
      <View style={styles.cardMainBody}>
        <Text style={styles.complaintSubCategory}>
          {complaint.serviceChild
            ? `${complaint.category}/${complaint.serviceChild}`
            : complaint.category}
        </Text>
        <View style={styles.locationContainer}>
          <Ionicons name="location-outline" size={16} color={COLORS.primary} />
          <Text style={styles.complaintLocation}>
            {complaint.location}
          </Text>
        </View>
      </View>

      {/* Footer Section - Attachments/Department (left) and Action Button (right) */}
      <View style={styles.cardFooterSection}>
        <View style={styles.footerLeftBlock}>
          {/* Attachment Icons Row */}
          {(complaint.hasPhotos || complaint.hasVideos || complaint.hasDocuments) && (
            <View style={styles.attachmentsRow}>
              {complaint.hasPhotos && (
                <Ionicons name="camera-outline" size={18} color={COLORS.attachmentIcon} style={styles.attachmentIcon} />
              )}
              {complaint.hasVideos && (
                <Ionicons name="videocam-outline" size={18} color={COLORS.attachmentIcon} style={styles.attachmentIcon} />
              )}
              {complaint.hasDocuments && (
                <Ionicons name="document-attach-outline" size={18} color={COLORS.attachmentIcon} style={styles.attachmentIcon} />
              )}
            </View>
          )}
          {/* Department Text Below */}
        </View>
      </View>
      {/* Footer Row: Dates and Action */}
        <View style={styles.cardFooter}>
            <Text style={styles.datesText}>
              Created At: {complaint.createdAt}
            </Text>
            <View style={styles.detailsIconContainer}>
              <Ionicons name="chevron-forward" size={20} color={COLORS.saffron} />
            </View>
        </View>
    </TouchableOpacity> 
  );
}

export default function ComplaintsScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();

  // Redux selectors
  const complaints = useSelector(selectComplaints);
  const loading = useSelector(selectComplaintsLoading);
  const error = useSelector(selectComplaintsError);
  const pagination = useSelector(selectComplaintsPagination);
  const currentPage = useSelector(selectCurrentPage);

  // Local state
  const [searchQuery, setSearchQueryLocal] = useState('');
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);
  const [currentStatusParam, setCurrentStatusParam] = useState<string>('');
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [nextPageToLoad, setNextPageToLoad] = useState(2);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const zones = useSelector(selectZones);
  const circles = useSelector(selectCircles);
  const divisions = useSelector(selectDivisions);
  const isLoadingZones = useSelector(selectIsLoadingZones);
  const isLoadingCircles = useSelector(selectIsLoadingCircles);
  const isLoadingDivisions = useSelector(selectIsLoadingDivisions);
  const locationError = useSelector(selectLocationError);
  const user = useSelector((state: RootState) => state.auth.user);
  const fromSearchScreenRef = useRef(false);
  const defaultsApplied = useRef(false);
  const expectedCategoryIdRef = useRef<string | number | null>(null);

  // Clear all previous filters and search data on mount or when params change
  useEffect(() => {
    console.log('ComplaintsScreen - Clearing all previous filters and search on params change', 'categoryId:', params.categoryId);
    
    // Clear complaints from Redux IMMEDIATELY when params change
    dispatch({ type: 'complaints/clearComplaints' });
    
    // Reset pagination tracking
    setNextPageToLoad(2);
    
    // Clear all local filter states (but NOT categoryId/categoryName if they're in params)
    setSearchQueryLocal('');
    setSelectedStatuses([]);
    // Only clear category if it's not coming from params
    if (!params.categoryId && !params.categoryName) {
      setSelectedCategory('');
      setSelectedCategoryId(null);
    }
    setSelectedZone('');
    setSelectedCircle('');
    setSelectedDivision('');
    setSelectedZoneId(null);
    setSelectedCircleId(null);
    setSelectedDivisionId(null);
    setCurrentStatusParam('');
    
    // Clear temp filter states (do NOT persist these)
    setTempSelectedStatuses([]);
    setTempSelectedCategory('');
    setTempSelectedZone('');
    setTempSelectedCircle('');
    setTempSelectedDivision('');
    setTempSelectedCategoryId(null);
    setTempSelectedZoneId(null);
    setTempSelectedCircleId(null);
    setTempSelectedDivisionId(null);
    // Set UI-only defaults from logged-in user so filter sheet shows defaults
    // Do NOT rely on these for API requests unless user applies filters
    if (user) {
      if (user.isZonalUser) {
        setSelectedZone(String(user.zone?.name || ''));
        setSelectedZoneId(user.zone?.id ?? null);
      }
      if (user.isCircleUser) {
        setSelectedZone(String(user.zone?.name || ''));
        setSelectedZoneId(user.zone?.id ?? null);
        setSelectedCircle(String(user.circle?.name || ''));
        setSelectedCircleId(user.circle?.id ?? null);
      }
      if (user.isDivisionUser) {
        setSelectedZone(String(user.zone?.name || ''));
        setSelectedZoneId(user.zone?.id ?? null);
        setSelectedCircle(String(user.circle?.name || ''));
        setSelectedCircleId(user.circle?.id ?? null);
        setSelectedDivision(String(user.division?.name || ''));
        setSelectedDivisionId(user.division?.id ?? null);
      }
    }
  }, [params.filter, params.dateFilter, params.start_date, params.end_date, params.categoryId, params.categoryName, params.searchData, dispatch]);

  // Check if navigation came from dashboard
  const fromDashboard = params.fromDashboard === 'true';
  const headerTitle = (params.title as string) || 'Complaints';

  // Filter states
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedZone, setSelectedZone] = useState('');
  const [selectedCircle, setSelectedCircle] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | number | null>(null);
  const [selectedZoneId, setSelectedZoneId] = useState<string | number | null>(null);
  const [selectedCircleId, setSelectedCircleId] = useState<string | number | null>(null);
  const [selectedDivisionId, setSelectedDivisionId] = useState<string | number | null>(null);


  // Temporary filter states (for the bottom sheet)
  const [tempSelectedStatuses, setTempSelectedStatuses] = useState<string[]>([]);
  const [tempSelectedCategory, setTempSelectedCategory] = useState('');
  const [tempSelectedZone, setTempSelectedZone] = useState('');
  const [tempSelectedCircle, setTempSelectedCircle] = useState('');
  const [tempSelectedDivision, setTempSelectedDivision] = useState('');
  const [tempSelectedCategoryId, setTempSelectedCategoryId] = useState<string | number | null>(null);
  const [tempSelectedZoneId, setTempSelectedZoneId] = useState<string | number | null>(null);
  const [tempSelectedCircleId, setTempSelectedCircleId] = useState<string | number | null>(null);
  const [tempSelectedDivisionId, setTempSelectedDivisionId] = useState<string | number | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const copyToClipboard = (text: string) => {
  Clipboard.setStringAsync(text);
  setToastMessage('Copied to clipboard');
  setToastVisible(true);
  };  

  // Map dashboard filter to API status
  const getApiStatus = (filterType: string): string => {
    switch (filterType) {
      case 'pending':
        return 'pending';
      case 'inProgress':
        return 'in_progress';
      case 'completed':
        return 'resolved';
      case 'closed':
        return 'closed';
      case 'completedByYou':
        return 'completed_by_you'
      case  'assignedByYou':
        return 'assigned_by_you'
      default:
        return 'total'; // default to 'open' for 'all'
    }
  };

  // Map UI status labels to API status values
  const mapLabelToApiStatus = (label: string): string => {
    switch (label) {
      case 'Open':
        return 'submitted';
      case 'In Progress':
        return 'in_progress';
      case 'Resolved':
        return 'resolved';
      case 'Closed':
        return 'closed';
      case 'High Priority':
        return 'high_priority'
      default:
        return label.toLowerCase();
    }
  };

  // Fetch complaints from Redux
  const handleFetchComplaints = async (page: number = 1, statusFilter?: string, isInfiniteScroll: boolean = false, overrideCategoryId?: string | number | null) => {
    //const status = typeof statusFilter === 'string' && statusFilter !== undefined ? statusFilter : currentStatusParam || '';
    const status = currentStatusParam || '';
    const stats_filter = getApiStatus(params.filter as string) || 'total';
    const filter =  params.dateFilter as string || 'all'
    const start_date = params.start_date as string 
    const end_date = params.end_date as string
    
    // Extract zone, circle, division IDs from params (from search screen)
    const paramsZoneId = params.zoneId as string | number | undefined;
    const paramsCircleId = params.circleId as string | number | undefined;
    const paramsDivisionId = params.divisionId as string | number | undefined;
    
    // Use overrideCategoryId if provided (for stat card navigation), otherwise use state
    const categoryIdToUse = overrideCategoryId !== undefined ? overrideCategoryId : selectedCategoryId;
    
    // Use zone/circle/division from params if available, otherwise use selected state
    const zoneIdToUse = paramsZoneId || (fromSearchScreenRef.current ? selectedZoneId : null) || (tempSelectedZoneId ? selectedZoneId : null);
    const circleIdToUse = paramsCircleId || (fromSearchScreenRef.current ? selectedCircleId : null) || (tempSelectedCircleId ? selectedCircleId : null);
    const divisionIdToUse = paramsDivisionId || (fromSearchScreenRef.current ? selectedDivisionId : null) || (tempSelectedDivisionId ? selectedDivisionId : null); // Note: mapping division to department
    
    console.log('fetchComplaint Api Called')
    console.log('Current Date Filter == ', filter)
    console.log('Start Date == ', start_date)
    console.log('End Date == ', end_date)
    console.log('Category ID being sent == ', categoryIdToUse)
    console.log('Zone ID being sent == ', zoneIdToUse)
    console.log('Circle ID being sent == ', circleIdToUse)
    console.log('Division ID being sent == ', divisionIdToUse)
    console.log('All Params == ', params)
    
    // Only clear complaints when starting a new filter/search (page 1), not for infinite scroll
    if (page === 1 && !isInfiniteScroll) {
      dispatch({ type: 'complaints/clearComplaints' });
    }
    
    dispatch(
      fetchComplaints({
        stats_filter,
        filter,
        status,
        page,
        limit: 10,
        search: searchQuery,
        isInfiniteScroll,
        category_id: categoryIdToUse,
        zone_id: zoneIdToUse,
        circle_id: circleIdToUse,
        division_id: divisionIdToUse,
        start_date: start_date ?? undefined,
        end_date: end_date ?? undefined,
      })
    );
  };

  // Fetch on mount and when filter changes
  useEffect(() => {
    console.log('ComplaintList - Mount/Filter Effect - params.filter:', params.filter, 'params.categoryId:', params.categoryId);
    
    const searchData = params.searchData as string || undefined
    if (searchData) {
      dispatch(setSearchQuery(searchData));
      setSearchQueryLocal(searchData);   
      handleFetchComplaints(1, currentStatusParam, false);
    } else if (params.filter) {
      // Coming from either stat card or complaint group or search screen
      console.log('ComplaintList - Filter params detected, will fetch after category state updates');
      // Don't fetch here - let the category effect or search screen effect handle it
    }
  }, [params.filter, params.dateFilter, params.start_date, params.end_date, params.categoryId]);

  // Dedicated effect for search screen navigation (zone/circle/division filtering)
  // Only trigger when actual search params (zone/circle/division) are present.
  // Stat-card navigation is handled by the category/filter effects to avoid duplicate calls.
  useEffect(() => {
    const hasSearchParams = params.zoneId || params.circleId || params.divisionId;

    if (hasSearchParams) {
      console.log('ComplaintList - Search screen navigation detected, fetching complaints');
      console.log('Search params - zoneId:', params.zoneId, 'circleId:', params.circleId, 'divisionId:', params.divisionId);
      handleFetchComplaints(1, currentStatusParam, false, null);
    }
  }, [params.zoneId, params.circleId, params.divisionId]);

  /* useFocusEffect(
    useCallback(() => {
      if (params.filter) {
        handleFetchComplaints(1, currentStatusParam, false);
      }
    }, [params.filter, params.dateFilter, params.start_date, params.end_date, selectedCategoryId, selectedZoneId, selectedDepartmentId, selectedStatuses, searchQuery])
  ); */
  // Handle incoming filter parameter from dashboard
 /* useEffect(() => {
    if (params.filter) {
      const filterType = params.filter as string;
      let newSelectedStatuses: string[] = [];
      // Map dashboard filter types to status filters
      switch (filterType) {
        case 'all':
          // Show all complaints - clear filters
          newSelectedStatuses = [];
          setSelectedCategory('');
          setSelectedZone('');
          setSelectedCircle('');
          setSelectedDivision('');
          break;
        case 'pending':
          newSelectedStatuses = ['Open'];
          break;
        case 'inProgress':
          newSelectedStatuses = ['In Progress'];
          break;
        case 'completed':
          newSelectedStatuses = ['Resolved'];
          break;
        case 'closed':
          newSelectedStatuses = ['Closed'];
          break;
        case 'assignedByYou':
          newSelectedStatuses = [];
          break;
        case 'completedByYou':
          newSelectedStatuses = ['Resolved'];
          break;
        default:
          break;
      }     
      setSelectedStatuses(newSelectedStatuses);
      // Update currentStatusParam based on new selected statuses
      const statusParam = newSelectedStatuses && newSelectedStatuses.length > 0
        ? newSelectedStatuses.map(mapLabelToApiStatus).join(',')
        : '';
      setCurrentStatusParam(statusParam);
    }
  }, [params.filter]); */

  // Handle categoryId from complaint group navigation
  useEffect(() => {
    const categoryId = params.categoryId as string | number | undefined;
    const categoryName = params.categoryName as string | undefined;
    const hasSearchParams = params.zoneId || params.circleId || params.divisionId;
    
    console.log('ComplaintList - CategoryId useEffect triggered - categoryId:', categoryId, 'categoryName:', categoryName, 'params.filter:', params.filter);
    
    if (categoryId && categoryName) {
      console.log('ComplaintList - Setting category from complaint group - ID:', categoryId, 'Name:', categoryName);
      // Set the expected categoryId BEFORE clearing to prevent stale data
      expectedCategoryIdRef.current = categoryId;
      // Clear complaints immediately before setting new category
      dispatch({ type: 'complaints/clearComplaints' });
      setSelectedCategoryId(categoryId as any);
      setSelectedCategory(categoryName);
      // Will fetch in next useEffect when selectedCategoryId is updated
    } else if (!categoryId && params.filter && !hasSearchParams) {
      // Coming from stat card (NOT from search screen with zone/circle/division)
      // Skip this if search params are present - let the search params effect handle it
      console.log('ComplaintList - Clearing category filters (from stat card), now fetching with categoryId=null');
      expectedCategoryIdRef.current = null;
      dispatch({ type: 'complaints/clearComplaints' });
      setSelectedCategoryId(null);
      setSelectedCategory('');
      // Fetch IMMEDIATELY with null categoryId to avoid using stale state
      handleFetchComplaints(1, currentStatusParam, false, null);
    }
  }, [params.categoryId, params.categoryName, params.filter, params.zoneId, params.circleId, params.divisionId, dispatch, currentStatusParam, selectedStatuses]);

  // Fetch after categoryId is set (only if it's from complaint group, not stat card)
  useEffect(() => {
    if (selectedCategoryId !== null && selectedCategory && params.categoryId && selectedCategoryId === expectedCategoryIdRef.current) {
      // Only fetch if categoryId came from params (complaint group) AND matches expected
      console.log('ComplaintList - Fetching after categoryId state updated from complaint group:', selectedCategoryId, selectedCategory);
      handleFetchComplaints(1, currentStatusParam, false, selectedCategoryId);
    }
  }, [selectedCategoryId, selectedCategory, params.categoryId, currentStatusParam]);

  // Reset loading state when complaints finish loading
  useEffect(() => {
    if (!loading && isLoadingMore) {
      setIsLoadingMore(false);
      // Update nextPageToLoad for the next pagination request
      if (pagination && pagination.page) {
        setNextPageToLoad(pagination.page + 1);
        console.log('Updated nextPageToLoad to:', pagination.page + 1);
      }
    }
  }, [loading, isLoadingMore, pagination]);

  // Transform API complaints to display format
  const transformedComplaints = useMemo(() => {
    return complaints.map((complaint: any) => ({
      id: complaint.id.toString(),
      complaint_number: complaint.complaint_number,
      category: complaint.complaintOption?.option_name || complaint.service?.service_name_en || 'Unknown',
      department: complaint.service?.service_name_en || 'Unknown Department',
      serviceChild: complaint.serviceChild?.service_name_en || '',
      location: complaint.location_address || 'Unknown Location',
      // Normalize status to human-readable labels used by the UI filters
      status: (
        (complaint.status_display && String(complaint.status_display)) ||
        (function () {
          const s = String(complaint.status || '').toLowerCase();
          switch (s) {
            case 'in_progress':
              return 'In Progress';
            case 'submitted':
            case 'open':
              return 'Open';
            case 'resolved':
              return 'Resolved';
            case 'closed':
              return 'Closed';
            default:
              // fallback to original status or 'Open'
              return complaint.status || 'Open';
          }
        })()
      ),
      sla: 'On Track', // SLA status from API if available
      createdAt: new Date(complaint.created_at).toLocaleDateString(),
      hasPhotos: !!complaint.photos, // Check if complaint has photos
      hasVideos: !!complaint.videos, // Check if complaint has videos
      hasDocuments: !!complaint.documents, // Check if complaint has documents
      zone: complaint.zone,
      priority: complaint.priority,
    }));
  }, [complaints]);

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    let count = selectedStatuses.length;
    if (selectedCategory) count++;
    if (selectedZone) count++;
    if (selectedCircle) count++;
     if (selectedDivision) count++;
    return count;
  }, [selectedStatuses, selectedCategory, selectedZone, selectedCircle, selectedDivision]);

  // Filter and search logic
  const filteredComplaints = useMemo(() => {
    // Always display API results directly when search or any filter is active
    if (searchQuery.trim() || selectedStatuses.length > 0 || selectedCategory || selectedZone || selectedCircle || selectedDivision || selectedCategoryId || selectedZoneId || selectedCircleId, selectedDivisionId) {
      return transformedComplaints;
    }
    // If no search or filters, return all complaints
    return transformedComplaints;
  }, [searchQuery, selectedStatuses, selectedCategory, selectedZone, selectedCircle, selectedDivision, transformedComplaints, selectedCategoryId, selectedZoneId, selectedCircleId, selectedDivisionId]);

  const handleComplaintPress = (complaint: Complaint) => {
    router.push({
     pathname: '/(drawer)/complaints-stack/complaint-details',
     params: { id: complaint.id },
});
  };
    useEffect(() => {
          dispatch(fetchZones());
      }, [dispatch]);
    // Apply defaults from user once
  useEffect(() => {
    if (!user || defaultsApplied.current) return;
    if (user.isZonalUser) {
      setSelectedZone(String(user.zone.name || ''));
      setSelectedZoneId(user.zone.id ?? null);
      dispatch(fetchCircles(user.zone.id));
    }
    if (user.isCircleUser) {
      setSelectedZone(String(user.zone.name || ''));
      setSelectedZoneId(user.zone.id ?? null);
      setSelectedCircle(String(user.circle.name || ''));
      setSelectedCircleId(user.circle.id ?? null);
      dispatch(fetchCircles(user.zone.id));
      dispatch(fetchDivisions(user.circle.id));
    }
    if (user.isDivisionUser) {
      setSelectedZone(String(user.zone.name || ''));
      setSelectedZoneId(user.zone.id ?? null);
      setSelectedCircle(String(user.circle.name || ''));
      setSelectedCircleId(user.circle.id ?? null);
      setSelectedDivision(String(user.division.name || ''));
      setSelectedDivisionId(user.division.id ?? null);
      dispatch(fetchCircles(user.zone.id));
      dispatch(fetchDivisions(user.circle.id));
    }
    defaultsApplied.current = true;
  }, [user, dispatch]);

    // Fetch circles when zone is selected
    useEffect(() => {
      if (tempSelectedZoneId) {
        dispatch(fetchCircles(tempSelectedZoneId));
      }
    }, [tempSelectedZoneId, dispatch]);

    // Fetch divisions when circle is selected
    useEffect(() => {
      if (tempSelectedCircleId) {
        dispatch(fetchDivisions(tempSelectedCircleId));
      }
    }, [tempSelectedCircleId, dispatch]);

    // Update zone name when selectedZoneId changes
    useEffect(() => {
      if (selectedZoneId) {
        const zone = zones.find((z) => z.id === selectedZoneId);
        if (zone) {
          setSelectedZone(zone.name);
        }
      } else {
        setSelectedZone('');
      }
    }, [selectedZoneId, zones]);

    // Update circle name when selectedCircleId changes
    useEffect(() => {
      if (selectedCircleId) {
        const circle = circles.find((c) => c.id === selectedCircleId);
        if (circle) {
          setSelectedCircle(circle.name);
        }
      } else {
        setSelectedCircle('');
      }
    }, [selectedCircleId, circles]);

    // Update division name when selectedDivisionId changes
    useEffect(() => {
      if (selectedDivisionId) {
        const division = divisions.find((d) => d.id === selectedDivisionId);
        if (division) {
          setSelectedDivision(division.name);
        }
      } else {
        setSelectedDivision('');
      }
    }, [selectedDivisionId, divisions]);


  const handleFilterPress = () => {
    // Copy current filters to temp states
    // Resolve display names and ids from selected state, zones/circles/divisions arrays,
    // and finally fallback to logged-in user's defaults when nothing else is set.
    let zoneNameToUse = selectedZone || (selectedZoneId ? zones.find((z) => z.id === selectedZoneId)?.name || '' : '');
    let zoneIdToUse = selectedZoneId ?? null;
    let circleNameToUse = selectedCircle || (selectedCircleId ? circles.find((c) => c.id === selectedCircleId)?.name || '' : '');
    let circleIdToUse = selectedCircleId ?? null;
    let divisionNameToUse = selectedDivision || (selectedDivisionId ? divisions.find((d) => d.id === selectedDivisionId)?.name || '' : '');
    let divisionIdToUse = selectedDivisionId ?? null;

    // If nothing is selected, prefer the logged-in user's defaults (but only if present)
    if ((!zoneNameToUse || !zoneIdToUse) && user) {
      if (user.zone) {
        zoneNameToUse = zoneNameToUse || String(user.zone.name || '');
        zoneIdToUse = zoneIdToUse ?? (user.zone.id ?? null);
      }
    }

    if ((!circleNameToUse || !circleIdToUse) && user) {
      // Only apply circle default when user has a circle (isCircleUser or isDivisionUser)
      if (user.isCircleUser || user.isDivisionUser) {
        circleNameToUse = circleNameToUse || String(user.circle?.name || '');
        circleIdToUse = circleIdToUse ?? (user.circle?.id ?? null);
      }
    }

    if ((!divisionNameToUse || !divisionIdToUse) && user) {
      // Only apply division default for division users
      if (user.isDivisionUser) {
        divisionNameToUse = divisionNameToUse || String(user.division?.name || '');
        divisionIdToUse = divisionIdToUse ?? (user.division?.id ?? null);
      }
    }

    setTempSelectedStatuses([...selectedStatuses]);
    setTempSelectedCategory(selectedCategory);
    setTempSelectedZone(zoneNameToUse);
    setTempSelectedCircle(circleNameToUse);
    setTempSelectedDivision(divisionNameToUse);
    setTempSelectedCategoryId(selectedCategoryId);
    setTempSelectedZoneId(zoneIdToUse);
    setTempSelectedCircleId(circleIdToUse);
    setTempSelectedDivisionId(divisionIdToUse);
    setFilterSheetVisible(true);
  };

  const handleStatusToggle = (status: string) => {
    setTempSelectedStatuses((prev) => {
      if (prev.includes(status)) {
        return prev.filter((s) => s !== status);
      } else {
        return [...prev, status];
      }
    });
  };

  const handleCategoryPress = () => {
    // Set global callback to receive selection
    global.filterSelectionCallback = (type: string, value: any) => {
      if (type === 'category') {
        // value can be { id, name } or legacy string
        if (value && typeof value === 'object') {
          setTempSelectedCategory(String(value.name || ''));
          setTempSelectedCategoryId(value.id ?? null);
        } else {
          setTempSelectedCategory(String(value || ''));
          setTempSelectedCategoryId(null);
        }
        // Re-open the filter sheet
        setTimeout(() => setFilterSheetVisible(true), 300);
      }
    };
    setFilterSheetVisible(false);
    router.push({
      pathname: '/(drawer)/complaints-stack/select-category',
      params: { selected: tempSelectedCategory },
    });
  };

  const handleZonePress = () => {
    if (user?.isCircleUser || user?.isDivisionUser) {
      setToastMessage("You don't have permission to change Zone.")
      setToastVisible(true);
      return;
    }
    global.filterSelectionCallback = (type: string, value: any) => {
      if (type === 'zone') {
        setTempSelectedZone(String(value.name || ''));
        setTempSelectedZoneId(value.id ?? null);
        setTimeout(() => setFilterSheetVisible(true), 300);
      }
    };
    setFilterSheetVisible(false);
    router.push({
      pathname: '/complaints-stack/filter-selection-screen',
      params: { 
        title: 'Select Zone',
        type: 'zone',
        items: JSON.stringify(zones),
        selected: tempSelectedZone,
        fromSearch: 'true',
      },

    });
  };

  const handleCirclePress = () => {
    if (user?.isDivisionUser) {
      setToastMessage("You don't have permission to change Circle.")
      setToastVisible(true);
      return;
    }
    global.filterSelectionCallback = (type: string, value: any) => {
      if (type === 'circle') {
        setTempSelectedCircle(String(value.name || ''));
        setTempSelectedCircleId(value.id ?? null);
        setTimeout(() => setFilterSheetVisible(true), 300);
      }
    };
    setFilterSheetVisible(false);
    router.push({
      pathname: '/complaints-stack/filter-selection-screen',
       params: { 
        title: 'Select Circle',
        type: 'circle',
        items: JSON.stringify(circles),
        selected: tempSelectedCircle,
        fromSearch: 'true',
      },
    });
  };

  const handleDivisionPress = () => {
    global.filterSelectionCallback = (type: string, value: any) => {
      if (type === 'division') {
        setTempSelectedDivision(String(value.name || ''));
        setTempSelectedDivisionId(value.id ?? null);
        setTimeout(() => setFilterSheetVisible(true), 300);
      }
    };
    setFilterSheetVisible(false);
    router.push({
      pathname: '/complaints-stack/filter-selection-screen',
      params: { 
        title: 'Select Division',
        type: 'division',
        items: JSON.stringify(divisions),
        selected: tempSelectedDivision,
        fromSearch: 'true',
      },
    });
  };

  const handleApplyFilters = () => {
    console.log(tempSelectedStatuses)
    console.log(tempSelectedCategory)
    console.log(tempSelectedDivision)
    console.log(tempSelectedZone)
    setSelectedStatuses([...tempSelectedStatuses]);
    setSelectedCategory(tempSelectedCategory);
    setSelectedZone(tempSelectedZone);
    setSelectedCircle(tempSelectedCircle);
    setSelectedDivision(tempSelectedDivision);
    setSelectedCategoryId(tempSelectedCategoryId);
    setSelectedZoneId(tempSelectedZoneId);
    setSelectedCircleId(tempSelectedCircleId);
    setSelectedDivisionId(tempSelectedDivisionId);
    setFilterSheetVisible(false);

    // Reset pagination when applying filters
    setNextPageToLoad(2);

    // Fetch complaints with new filters (reset to page 1)
    // Use tempSelected*Id directly because React state updates are async
    const stats_filter = getApiStatus(params.filter as string) || 'total';
    const filter = params.dateFilter as string || 'all'
    const start_date = params.start_date as string 
    const end_date = params.end_date as string
    // Convert tempSelectedStatuses (labels) to API status param (comma-separated)
    const statusParam = tempSelectedStatuses && tempSelectedStatuses.length > 0
      ? tempSelectedStatuses.map(mapLabelToApiStatus).join(',')
      : '';

    // Persist the status param so subsequent automatic fetches use it
    setCurrentStatusParam(statusParam);
    dispatch(
      fetchComplaints({
        stats_filter,
        filter,
        status: statusParam,
        page: 1,
        limit: 10,
        search: searchQuery,
        isInfiniteScroll: false,
        category_id: tempSelectedCategoryId ?? undefined,
        zone_id: tempSelectedZoneId ?? undefined,
        circle_id: tempSelectedCircleId ?? undefined,
        division_id: tempSelectedDivisionId ?? undefined,
        start_date: start_date ?? undefined,
        end_date: end_date ?? undefined 
      })
    );
  };

  const handleResetFilters = () => {
    setTempSelectedStatuses([]);
    setTempSelectedCategory('');
    setTempSelectedZone('');
    setTempSelectedCircle('');
    setTempSelectedDivision('');
    setTempSelectedCategoryId(null);
    setTempSelectedZoneId(null);
    setTempSelectedCircleId(null);
    setTempSelectedDivisionId(null);
  };

  const handleRemoveFilter = (filterType: 'status' | 'category' | 'zone' | 'circle' | 'division', value?: string) => {
    // Compute new filter values synchronously so we can immediately refetch
    const stats_filter = getApiStatus(params.filter as string) || 'total';
    const filter = params.dateFilter as string || 'all'
    const start_date = params.start_date as string 
    const end_date = params.end_date as string

    switch (filterType) {
      case 'status': {
        // Remove the status label and compute new status param
        const newSelectedStatuses = value ? selectedStatuses.filter((s) => s !== value) : [...selectedStatuses];
        setSelectedStatuses(newSelectedStatuses);
        const statusParam = newSelectedStatuses && newSelectedStatuses.length > 0
          ? newSelectedStatuses.map(mapLabelToApiStatus).join(',')
          : '';
        // Persist the status param so subsequent fetches use it
        setCurrentStatusParam(statusParam);
        dispatch(
          fetchComplaints({
            stats_filter,
            filter,
            status: statusParam,
            page: 1,
            limit: 10,
            search: searchQuery,
            isInfiniteScroll: false,
            category_id: selectedCategoryId ?? undefined,
            zone_id: selectedZoneId ?? undefined,
            circle_id: selectedCircleId ?? undefined,
            division_id: selectedDivisionId ?? undefined,
            start_date: start_date ?? undefined,
            end_date: end_date ?? undefined,
          })
        );
        break;
      }
      case 'category': {
        setSelectedCategory('');
        setSelectedCategoryId(null);
        dispatch(
          fetchComplaints({
            stats_filter,
            filter,
            status: currentStatusParam || '',
            page: 1,
            limit: 10,
            search: searchQuery,
            isInfiniteScroll: false,
            category_id: undefined,
            zone_id: selectedZoneId ?? undefined,
            circle_id: selectedCircleId ?? undefined,
            division_id: selectedDivisionId ?? undefined,
            start_date: start_date ?? undefined,
            end_date: end_date ?? undefined,
          })
        );
        break;
      }
      case 'zone': {
        setSelectedZone('');
        setSelectedZoneId(null);
        dispatch(
          fetchComplaints({
            stats_filter,
            filter,
            status: currentStatusParam || '',
            page: 1,
            limit: 10,
            search: searchQuery,
            isInfiniteScroll: false,
            category_id: selectedCategoryId ?? undefined,
            zone_id: undefined,
            circle_id: selectedCircleId ?? undefined,
            division_id: selectedDivisionId ?? undefined,
            start_date: start_date ?? undefined,
            end_date: end_date ?? undefined,
          })
        );
        break;
      }
      case 'circle': {
        setSelectedCircle('');
        setSelectedCircleId(null);
        dispatch(
          fetchComplaints({
            stats_filter,
            filter,
            status: currentStatusParam || '',
            page: 1,
            limit: 10,
            search: searchQuery,
            isInfiniteScroll: false,
            category_id: selectedCategoryId ?? undefined,
            zone_id: selectedZoneId ?? undefined,
            circle_id: undefined,
            division_id: selectedDivisionId ?? undefined,
            start_date: start_date ?? undefined,
            end_date: end_date ?? undefined,
          })
        );
        break;
      }
      case 'division': {
        setSelectedDivision('');
        setSelectedDivisionId(null);
        dispatch(
          fetchComplaints({
            stats_filter,
            filter,
            status: currentStatusParam || '',
            page: 1,
            limit: 10,
            search: searchQuery,
            isInfiniteScroll: false,
            category_id: selectedCategoryId ?? undefined,
            zone_id: selectedZoneId ?? undefined,
            circle_id: selectedCircleId ?? undefined,
            division_id: undefined,
            start_date: start_date ?? undefined,
            end_date: end_date ?? undefined,
          })
        );
        break;
      }
    }
  };

  const handleBackPress = () => {
    router.back();
  };

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  // Handle infinite scroll
  const handleInfiniteScroll = useCallback(() => {
    // Prevent duplicate requests
    if (isLoadingMore || loading) {
      console.log('Already loading, skipping infinite scroll');
      return;
    }
    
    // Check if there are more pages to load
    if (pagination && pagination.has_next) {
      console.log('Loading next page:', nextPageToLoad);
      setIsLoadingMore(true);
      handleFetchComplaints(nextPageToLoad, currentStatusParam, true, selectedCategoryId);
    } else {
      console.log('No more pages. has_next:', pagination?.has_next);
    }
  }, [pagination, nextPageToLoad, isLoadingMore, loading, currentStatusParam, selectedCategoryId]);

  // Handle pull to refresh
  const handleRefresh = useCallback(async () => {
  console.log('Pull to refresh triggered');
  setIsRefreshing(true);
  setNextPageToLoad(2);
  
  // Use only original params (no user defaults for zone/circle/division)
  const stats_filter = getApiStatus(params.filter as string) || 'total';
  const filter = params.dateFilter as string || 'all';
  const start_date = params.start_date as string;
  const end_date = params.end_date as string;
  
  // Only include search/filter params, not defaults
  // Normalize array params to single values
  const normalizeParam = (value: any): string | number | null => {
    if (Array.isArray(value)) return value[0] ?? null;
    return value ?? null;
  };
  const zoneIdForRefresh = normalizeParam(params.zoneId) || (fromSearchScreenRef.current && tempSelectedZoneId ? tempSelectedZoneId : null);
  const circleIdForRefresh = normalizeParam(params.circleId) || (fromSearchScreenRef.current && tempSelectedCircleId ? tempSelectedCircleId : null);
  const divisionIdForRefresh = normalizeParam(params.divisionId) || (fromSearchScreenRef.current && tempSelectedDivisionId ? tempSelectedDivisionId : null);
  
  dispatch(
    fetchComplaints({
      stats_filter,
      filter,
      status: currentStatusParam || '',
      page: 1,
      limit: 10,
      search: searchQuery,
      isInfiniteScroll: false,
      category_id: selectedCategoryId ?? undefined,
      zone_id: zoneIdForRefresh ?? undefined,
      circle_id: circleIdForRefresh ?? undefined,
      division_id: divisionIdForRefresh ?? undefined,
      start_date: start_date ?? undefined,
      end_date: end_date ?? undefined,
    })
  );
  
  setTimeout(() => {
    setIsRefreshing(false);
  }, 500);
}, [params, currentStatusParam, selectedCategoryId, searchQuery, tempSelectedZoneId, tempSelectedCircleId, tempSelectedDivisionId, dispatch, fromSearchScreenRef]);

  // Handle search query change
  const handleSearchChange = (text: string) => {
    setSearchQueryLocal(text);
    // Reset pagination when searching
    setNextPageToLoad(2);
    if (text.trim()) {
      // Reset to page 1 when searching
      dispatch(setSearchQuery(text));
      handleFetchComplaints(1, undefined, false);
    } else {
      dispatch(setSearchQuery(''));
      handleFetchComplaints(1, undefined, false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.cardBackground} translucent={Platform.OS === 'android'} />

      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={fromDashboard ? handleBackPress : openDrawer}
          activeOpacity={0.6}
        >
          <Ionicons
            name={fromDashboard ? 'arrow-back' : 'menu'}
            size={28}
            color={COLORS.text}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{headerTitle}</Text>

        <View style={styles.headerSpacer} />
      </View>

      {/* Search and Filter Bar */}
      <View style={styles.searchFilterContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={COLORS.textLight} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by ID or Category..."
            placeholderTextColor={COLORS.textLight}
            value={searchQuery}
            onChangeText={handleSearchChange}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearchChange('')} activeOpacity={0.6}>
              <Ionicons name="close-circle" size={20} color={COLORS.textLight} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Button */}
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilterCount > 0 && styles.filterButtonActive,
          ]}
          onPress={handleFilterPress}
          activeOpacity={0.7}
        >
          <Ionicons
            name="filter"
            size={20}
            color={activeFilterCount > 0 ? COLORS.cardBackground : COLORS.text}
          />
          <Text
            style={[
              styles.filterButtonText,
              activeFilterCount > 0 && styles.filterButtonTextActive,
            ]}
          >
            Filter{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Active Filter Tags 
      {activeFilterCount > 0 && (
        <View style={styles.activeFiltersContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.activeFiltersScrollContent}
          >
            {selectedStatuses.map((status) => (
              <View key={status} style={styles.filterTag}>
                <Text style={styles.filterTagText}>Status: {status}</Text>
                <TouchableOpacity
                  onPress={() => handleRemoveFilter('status', status)}
                  activeOpacity={0.6}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close-circle" size={16} color={COLORS.tagText} />
                </TouchableOpacity>
              </View>
            ))}
            {selectedCategory && (
              <View style={styles.filterTag}>
                <Text style={styles.filterTagText} numberOfLines={1}>
                  Category: {selectedCategory}
                </Text>
                <TouchableOpacity
                  onPress={() => handleRemoveFilter('category')}
                  activeOpacity={0.6}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close-circle" size={16} color={COLORS.tagText} />
                </TouchableOpacity>
              </View>
            )}
            {selectedZone && (
              <View style={styles.filterTag}>
                <Text style={styles.filterTagText}>Zone: {selectedZone}</Text>
                <TouchableOpacity
                  onPress={() => handleRemoveFilter('zone')}
                  activeOpacity={0.6}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close-circle" size={16} color={COLORS.tagText} />
                </TouchableOpacity>
              </View>
            )}
            {selectedCircle && (
              <View style={styles.filterTag}>
                <Text style={styles.filterTagText} numberOfLines={1}>
                  Circle: {selectedCircle}
                </Text>
                <TouchableOpacity
                  onPress={() => handleRemoveFilter('circle')}
                  activeOpacity={0.6}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close-circle" size={16} color={COLORS.tagText} />
                </TouchableOpacity>
              </View>
            )}
            {selectedCircle && (
              <View style={styles.filterTag}>
                <Text style={styles.filterTagText} numberOfLines={1}>
                  Division: {selectedDivision}
                </Text>
                <TouchableOpacity
                  onPress={() => handleRemoveFilter('division')}
                  activeOpacity={0.6}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close-circle" size={16} color={COLORS.tagText} />
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      )} */}

      {/* Loading Progress Bar */}
      {loading && (
        <View style={styles.loadingContainer}>
          {Platform.OS === 'android' ? (
            <View style={styles.loadingProgress}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.loadingText}>Loading complaints...</Text>
            </View>
          ) : (
            <View style={styles.loadingProgress}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.loadingText}>Loading complaints...</Text>
            </View>
          )}
        </View>
      )}

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={20} color="#D32F2F" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Complaints List */}
      <FlatList
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        data={filteredComplaints}
        keyExtractor={(item) => item.id}
        renderItem={({ item: complaint }) => (
          <ComplaintCard
            complaint={complaint}
            onPress={() => handleComplaintPress(complaint)}
            onCopy={copyToClipboard}
          />
        )
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
            title="Pull to refresh"
            titleColor={COLORS.textSecondary}
            progressBackgroundColor={COLORS.cardBackground}
          />
        }
        ListFooterComponent={() => {
          if (filteredComplaints.length === 0) return null;
          return loading ? (
            <View style={styles.bottomLoadingContainer}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.bottomLoadingText}>Loading more complaints...</Text>
            </View>
          ) : null;
        }}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={80} color={COLORS.textLight} />
            <Text style={styles.emptyStateText}>No complaints found</Text>
            <Text style={styles.emptyStateSubtext}>
              Try adjusting your search or filters
            </Text>
          </View>
        )}
        onEndReached={() => {
          console.log('Reached end of list');
          handleInfiniteScroll();
        }}
        onEndReachedThreshold={0.3}
        scrollEventThrottle={300}
        removeClippedSubviews={true}
      />

      {/* Filter Bottom Sheet */}
      <FilterBottomSheet
        visible={filterSheetVisible}
        onClose={() => setFilterSheetVisible(false)}
        selectedStatuses={tempSelectedStatuses}
        selectedCategory={tempSelectedCategory}
        selectedZone={tempSelectedZone}
        selectedCircle={tempSelectedCircle}
        selectedDivision={tempSelectedDivision}
        onStatusToggle={handleStatusToggle}
        onCategoryPress={handleCategoryPress}
        onZonePress={handleZonePress}
        onCirclePress={handleCirclePress}
        onDivisionPress={handleDivisionPress}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />
      {/* Toast Notification */}
      <Toast
        visible={toastVisible}
        message={toastMessage}
        type="success"
        onHide={() => setToastVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    ...Platform.select({
      android: {
        paddingTop: 0,
        paddingBottom: 0,
      },
    }),
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
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  headerButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 44,
  },
  searchFilterContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBackground,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 8,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.searchBg,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    paddingVertical: 0,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.filterInactive,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
  },
  filterButtonActive: {
    backgroundColor: COLORS.filterActive,
    borderColor: COLORS.filterActive,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  filterButtonTextActive: {
    color: COLORS.cardBackground,
  },
  activeFiltersContainer: {
    backgroundColor: COLORS.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: 8,
  },
  activeFiltersScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.tagBackground,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
    maxWidth: 200,
  },
  filterTagText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.tagText,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  complaintCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  complaintId: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textLight,
    letterSpacing: 0.5,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.cardBackground,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  cardMainBody: {
    marginBottom: 16,
  },
  complaintCategory: {
    fontSize: 19,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
    lineHeight: 26,
  },
  complaintSubCategory: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 8,
    lineHeight: 26,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
  },
  complaintLocation: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
  cardFooterSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
  },
  detailsIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
  },
  footerLeftBlock: {
    flex: 1,
    marginRight: 12,
  },
  attachmentsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  attachmentIcon: {
    opacity: 0.6,
  },
  complaintDepartment: {
    fontSize: 13,
    fontWeight: '400',
    color: COLORS.textLight,
    lineHeight: 18,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.saffron,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.saffron,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  // Loading and Error Styles
  loadingContainer: {
    paddingVertical: 12,
    backgroundColor: COLORS.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  loadingProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFEBEE',
    borderBottomWidth: 1,
    borderBottomColor: '#EF5350',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#D32F2F',
    fontWeight: '500',
    flex: 1,
  },
  // Pagination Styles
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginTop: 16,
    marginBottom: 24,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    gap: 12,
  },
  paginationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.primary,
    gap: 4,
  },
  paginationButtonDisabled: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
    opacity: 0.5,
  },
  paginationButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  paginationButtonTextDisabled: {
    color: COLORS.textLight,
  },
  paginationInfo: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  paginationInfoText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  // Infinite Scroll Loading Indicator
  bottomLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  bottomLoadingText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  datesText: {
    fontSize: 12,
    fontWeight: '400',
    color: COLORS.textSecondary,
    flex: 1,
  },
});

