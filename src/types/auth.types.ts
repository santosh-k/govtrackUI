export interface LoginRequest {
  username: string;
  password: string;
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
  zone: Zone;
  division: Division;
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