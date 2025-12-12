export interface DeviceInfo {
  deviceToken?: string;
  deviceType?: string;
  deviceModel?: string;
  osVersion?: string;
  appVersion?: string;
  deviceId?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
  deviceInfo?: DeviceInfo;
}

export interface Department {
  id: number;
  name: string;
  description?: string;
}

export interface Zone {
  id: number;
  name: string;
}
export interface Circle {
  id: number;
  name: string;
}
export interface SubDivision {
  id: number;
  name: string;
}

export interface Division {
  id: number;
  name: string | null;
}

export interface Level {
  id: number;
  name: string;
  index: number;
}

export interface Designation {
  id: number;
  name: string;
  displayName: string;
  description: string;
  level: Level;
  department: Department;
}

export interface Permission {
  name: string;
  displayName: string;
  category: string;
  module: string | null;
}

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  isActive: boolean;
  address: string | null;
  profile_image?: string;
  level:string;
  isAdminUser: boolean;
  isZonalUser: boolean;
  isCircleUser: boolean;
  isDivisionUser: boolean;
  isSubDivisionUser: boolean;
  zone: Zone;
  circle: Circle;
  division: Division;
  subDivision: SubDivision;
  designations: Designation[];
  departments: Department[];
  permissions: Permission[];
}

export interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    refreshToken: string;
    expiresIn: number;
    user: User;
  };
}