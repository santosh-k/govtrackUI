# Zone, Circle, and Division API Integration - Complete Documentation

## Overview
This implementation provides a complete Redux-based solution for fetching and managing hierarchical location data (Zones → Circles → Divisions) with proper API integration, state management, and UI feedback.

---

## Architecture

### 1. **API Layer** (`src/services/ApiManager.ts`)
Three new methods have been added to the ApiManager singleton:

```typescript
// Fetch all zones
public async fetchZones(): Promise<any>
// Response: { success: true, data: Zone[] }

// Fetch circles for a specific zone
public async fetchCircles(zoneId: number | string): Promise<any>
// Response: { success: true, data: Circle[] }

// Fetch divisions for a specific circle
public async fetchDivisions(circleId: number | string): Promise<any>
// Response: { success: true, data: Division[] }
```

**Key Features:**
- Uses existing `fetchExternalWithRetry()` method for automatic token refresh
- Proper error handling with meaningful error messages
- Uses `adminPmsUrl` base URL: `https://pwd.thesst.com/admin/pms/api`
- Automatically includes Bearer token in Authorization header

---

### 2. **Type Definitions** (`src/types/location.types.ts`)
Comprehensive TypeScript interfaces:

```typescript
interface Zone {
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

interface Circle {
  id: number;
  department_id: number;
  pwd_zone_id: number;
  name: string;
  status: boolean;
  code: string | null;
  created_at: string;
  updated_at: string;
}

interface Division {
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
```

---

### 3. **Redux State Management** (`src/store/locationSlice.ts`)
Complete Redux slice with async thunks:

#### **Async Thunks:**
```typescript
export const fetchZones = createAsyncThunk(...)
export const fetchCircles = createAsyncThunk(...)
export const fetchDivisions = createAsyncThunk(...)
```

#### **State Structure:**
```typescript
interface LocationState {
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
```

#### **Actions:**
```typescript
setSelectedZone(zoneId)      // Auto-clears circles & divisions
setSelectedCircle(circleId)  // Auto-clears divisions
setSelectedDivision(divisionId)
clearLocation()              // Reset all state
```

#### **Selectors:**
```typescript
selectZones, selectCircles, selectDivisions
selectSelectedZoneId, selectSelectedCircleId, selectSelectedDivisionId
selectIsLoadingZones, selectIsLoadingCircles, selectIsLoadingDivisions
selectLocationError
```

---

### 4. **Store Integration** (`src/store/index.ts`)
The location reducer has been added to the Redux store configuration:
```typescript
const rootReducer = combineReducers({
  // ... other reducers
  location: locationReducer,
});
```

---

## Usage Guide

### **In React Components**

#### **Step 1: Import Required Functions**
```typescript
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/src/store';
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
```

#### **Step 2: Setup Hooks in Component**
```typescript
const dispatch = useDispatch<AppDispatch>();
const zones = useSelector(selectZones);
const circles = useSelector(selectCircles);
const divisions = useSelector(selectDivisions);
const selectedZoneId = useSelector(selectSelectedZoneId);
const selectedCircleId = useSelector(selectSelectedCircleId);
const isLoadingZones = useSelector(selectIsLoadingZones);
const isLoadingCircles = useSelector(selectIsLoadingCircles);
const locationError = useSelector(selectLocationError);
```

#### **Step 3: Fetch Data Based on Selection**
```typescript
// Fetch zones on mount
useEffect(() => {
  dispatch(fetchZones());
}, [dispatch]);

// Fetch circles when zone changes
useEffect(() => {
  if (selectedZoneId) {
    dispatch(fetchCircles(selectedZoneId));
  }
}, [selectedZoneId, dispatch]);

// Fetch divisions when circle changes
useEffect(() => {
  if (selectedCircleId) {
    dispatch(fetchDivisions(selectedCircleId));
  }
}, [selectedCircleId, dispatch]);
```

#### **Step 4: Update Selection**
```typescript
const handleSelectZone = (zone: Zone) => {
  dispatch(setSelectedZone(zone.id));
};

const handleSelectCircle = (circle: Circle) => {
  dispatch(setSelectedCircle(circle.id));
};

const handleSelectDivision = (division: Division) => {
  dispatch(setSelectedDivision(division.id));
};
```

#### **Step 5: Display UI with Loading States**
```typescript
<TouchableOpacity
  disabled={isLoadingZones}
  onPress={handleZonePress}
>
  <Text>{zones.find(z => z.id === selectedZoneId)?.name || 'Select Zone'}</Text>
  {isLoadingZones ? (
    <ActivityIndicator size="small" color="#FF9800" />
  ) : (
    <Icon name="chevron-forward" />
  )}
</TouchableOpacity>
```

---

## Complete Example Implementation
The `complaint-search.tsx` screen has been fully updated with:

✅ **Zones Fetched on Mount** - Auto-loads all zones when screen opens
✅ **Cascading Selection** - Circles load when zone is selected
✅ **Auto-Clear Dependent Data** - Division clears when circle changes
✅ **Loading Indicators** - Visual feedback during API calls
✅ **Error Handling** - Error messages displayed to user
✅ **Disabled States** - Circle/Division disabled until prerequisites selected
✅ **Full Redux Integration** - Complete state management

### Key Features in complaint-search.tsx:
```typescript
// Fetch zones on mount
useEffect(() => {
  dispatch(fetchZones());
}, [dispatch]);

// Auto-fetch circles when zone selected
useEffect(() => {
  if (selectedZoneId) {
    dispatch(fetchCircles(selectedZoneId));
  }
}, [selectedZoneId, dispatch]);

// Auto-fetch divisions when circle selected
useEffect(() => {
  if (selectedCircleId) {
    dispatch(fetchDivisions(selectedCircleId));
  }
}, [selectedCircleId, dispatch]);

// Validation: Only allow circle selection after zone is selected
const handleCirclePress = () => {
  if (!selectedZoneId) {
    Alert.alert('Please select a Zone first');
    return;
  }
  // ... open selection screen
};

// Pass selected IDs to API call
const handleFindComplaints = () => {
  let params: any = {};
  if (selectedZoneId) params.zoneId = selectedZoneId;
  if (selectedCircleId) params.circleId = selectedCircleId;
  if (selectedDivisionId) params.divisionId = selectedDivisionId;
  // ... navigate to results
};
```

---

## API Endpoints

### Zones
```
GET https://pwd.thesst.com/admin/pms/api/zones
Headers: Authorization: Bearer {token}
Response: { success: true, data: Zone[] }
```

### Circles by Zone
```
GET https://pwd.thesst.com/admin/pms/api/zones/:zoneId/circles
Headers: Authorization: Bearer {token}
Response: { success: true, data: Circle[], option_selected: null }
```

### Divisions by Circle
```
GET https://pwd.thesst.com/admin/pms/api/circles/:circleId/divisions
Headers: Authorization: Bearer {token}
Response: { success: true, data: Division[], option_selected: null }
```

---

## Reusing in Other Screens

To use this same functionality in other screens (e.g., project creation, task assignment):

```typescript
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
} from '@/src/store/locationSlice';

// In component:
export default function AnotherScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const zones = useSelector(selectZones);
  const selectedZoneId = useSelector(selectSelectedZoneId);
  
  useEffect(() => {
    dispatch(fetchZones());
  }, [dispatch]);
  
  // ... rest of component
}
```

---

## Error Handling

Errors are automatically caught and stored in Redux state:
```typescript
const locationError = useSelector(selectLocationError);

// Display to user:
{locationError && (
  <View style={styles.errorContainer}>
    <Icon name="alert-circle" />
    <Text>{locationError}</Text>
  </View>
)}
```

---

## Files Modified/Created

1. ✅ **Created**: `src/types/location.types.ts` - Type definitions
2. ✅ **Created**: `src/store/locationSlice.ts` - Redux reducer & thunks
3. ✅ **Modified**: `src/services/ApiManager.ts` - Added 3 API methods
4. ✅ **Modified**: `src/store/index.ts` - Integrated location reducer
5. ✅ **Modified**: `app/(drawer)/search-stack/complaint-search.tsx` - Full integration

---

## Best Practices Implemented

✅ Async thunks for async operations
✅ Proper loading states for each API call
✅ Automatic token refresh on 401
✅ Error messages passed to UI
✅ Cascading data dependent on previous selection
✅ TypeScript for type safety
✅ Reusable across multiple screens
✅ Proper cleanup in Redux (auto-clear dependent data)
✅ No circular dependencies
✅ Consistent with existing codebase patterns

---

## Testing

You can test the implementation by:

1. Navigate to the Search Complaint screen
2. Zones should load automatically (see "All Zones" button)
3. Select a zone - Circles should load
4. Select a circle - Divisions should load
5. Use the selected IDs to filter complaints

---

## Future Enhancements

- Add caching to avoid re-fetching
- Add pagination for large datasets
- Add search/filtering within zones/circles/divisions
- Add offline support
- Add animations during loading

