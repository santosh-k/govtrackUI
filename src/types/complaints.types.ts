/** Service/Category Information */
export interface Service {
  id: number;
  service_name_en: string;
  service_code: string;
}

/** Sub-service/Child Category */
export interface ServiceChild {
  id: number;
  service_name_en: string;
  service_code: string;
}

/** Complaint Option/Type */
export interface ComplaintOption {
  id: number;
  option_name: string;
}

/** Main Complaint Data Model */
export interface Complaint {
  id: number;
  complaint_number: string;
  user_id: number | null;
  created_by_admin: number | null;
  complainant_name: string;
  contact_no: string;
  email: string | null;
  address: string | null;
  service_id: number;
  service_child_id: number | null;
  complaint_option_id: number;
  description: string;
  location_address: string;
  latitude: string;
  longitude: string;
  priority: number;
  status: 'submitted' | 'assigned' | 'in_progress' | 'closed' | 'resolved';
  source: string;
  poll_no: string | null;
  flat_no: string | null;
  complaint_location_id: number | null;
  assigned_department_id: number | null;
  assigned_to_user_id: number | null;
  assigned_at: string | null;
  assigned_by: number | null;
  resolved_at: string | null;
  resolved_by: number | null;
  created_at: string;
  updated_at: string;
  
  // Related data
  service: Service;
  serviceChild: ServiceChild | null;
  complaintOption: ComplaintOption;
  
  // Display fields
  status_display: string;
  priority_display: string;
  age_days: number;
  photos: boolean;
  videos: boolean;
  documents: boolean;
  zone: string | null
}
/** Pagination Info */
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}

/** Filter Options for Dropdowns */
export interface Category {
  id: number;
  name: string;
  code: string;
}

export interface Zone {
  id: number;
  name: string;
  code: string;
}

export interface Department {
  id: number;
  name: string;
}

export interface StatusOption {
  value: string;
  label: string;
}

export interface PriorityOption {
  value: number;
  label: string;
}

export interface FilterOptions {
  categories: Category[];
  zones: Zone[];
  departments: Department[];
  statuses: StatusOption[];
  priorities: PriorityOption[];
}

/** Current Filters Applied */
export interface CurrentFilters {
  status: string;
  stats_filter: string;
  search: string;
  filter: string;
}

/** Sort Configuration */
export interface SortConfig {
  field: string;
  order: 'asc' | 'desc';
}

/** Complete Complaints List Response */
export interface ComplaintsListResponse {
  success: boolean;
  data: {
    complaints: Complaint[];
    pagination: Pagination;
    filters: CurrentFilters;
    filter_options: FilterOptions;
    sort: SortConfig;
  };
}

/** Single Complaint Detail Response */
export interface ComplaintDetailResponse {
  success: boolean;
  data: Complaint;
}

/** Redux State Shape for Complaints List */
export interface ComplaintsState {
  isLoading: boolean;
  error: string | null;
  complaints: Complaint[];
  pagination: Pagination | null;
  filterOptions: FilterOptions | null;
  currentFilters: CurrentFilters | null;
  currentPage: number;
  statusFilter: string;
  searchQuery: string;
}

/** Redux State Shape for Complaint Details */
export interface ComplaintDetailsState {
  isLoading: boolean;
  error: string | null;
  data: Complaint | null;
  complaintId: string | number | null;
}
