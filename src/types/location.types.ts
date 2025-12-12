// Zone Types
export interface Zone {
  id: number;
  department_id: number;
  name: string;
  status: boolean;
  boundry_e: string | null;
  boundry_w: string | null;
  boundry_n: string | null;
  boundry_s: string | null;
  created_at: string;
  updated_at: string;
}

// Circle Types
export interface Circle {
  id: number;
  department_id: number;
  pwd_zone_id: number;
  name: string;
  status: boolean;
  code: string | null;
  created_at: string;
  updated_at: string;
}

// Division Types
export interface Division {
  id: number;
  department_id: number;
  pwd_zone_id: number;
  pwd_circle_id: number;
  name: string;
  code: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// API Response Types
export interface LocationApiResponse<T> {
  success: boolean;
  data: T[];
  option_selected?: string | null;
}

// Location State Types
export interface LocationState {
  zones: Zone[];
  circles: Circle[];
  divisions: Division[];
  selectedZoneId: number | null;
  selectedCircleId: number | null;
  selectedDivisionId: number | null;
  isLoadingZones: boolean;
  isLoadingCircles: boolean;
  isLoadingDivisions: boolean;
  error: string | null;
}
