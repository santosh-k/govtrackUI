# SafeAreaView - Specific Code Changes Required

This file contains the exact code changes needed for each file to fix SafeAreaView imports and add Android support via the edges prop.

---

## Pattern 1: Update Import Statement

For all 27 files that import from 'react-native', replace:

```typescript
// FIND AND REPLACE IN FIRST 20 LINES:

// Option A: Single import
import { SafeAreaView } from 'react-native';
// CHANGE TO:
import { SafeAreaView } from 'react-native-safe-area-context';

// Option B: Multi-line import block
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ...
} from 'react-native';

// CHANGE TO: Remove SafeAreaView from react-native import
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ...
} from 'react-native';

// AND ADD: New import for SafeAreaView
import { SafeAreaView } from 'react-native-safe-area-context';
```

---

## Pattern 2: Add edges Prop to SafeAreaView Components

For all SafeAreaView components in the file, change:

```typescript
// BEFORE
<SafeAreaView style={styles.container}>

// AFTER
<SafeAreaView style={styles.container} edges={['top', 'bottom']}>
```

If SafeAreaView has inline styles:

```typescript
// BEFORE
<SafeAreaView style={[styles.container, { customProp: value }]}>

// AFTER
<SafeAreaView style={[styles.container, { customProp: value }]} edges={['top', 'bottom']}>
```

---

## Files Requiring Import Changes Only (No SafeAreaView in render)

None - all 27 files need both changes.

---

## Special Cases

### Files with Multiple SafeAreaView Instances

**app/(drawer)/create-complaint.tsx** - 3 instances:
```typescript
// Instance 1 (main container)
<SafeAreaView style={styles.container} edges={['top', 'bottom']}>

// Instance 2 (map modal)
<SafeAreaView style={styles.mapModalContainer} edges={['top', 'bottom']}>

// Instance 3 (department modal)
<SafeAreaView style={styles.departmentModalContainer} edges={['top', 'bottom']}>
```

**app/(drawer)/create-task.tsx** - 2 instances:
```typescript
// Instance 1 (main container)
<SafeAreaView style={styles.container} edges={['top', 'bottom']}>

// Instance 2 (map modal)
<SafeAreaView style={styles.mapModalContainer} edges={['top', 'bottom']}>
```

### Files Already Using useSafeAreaInsets (Update Import)

**app/(drawer)/(tabs)/complaints.tsx:**
```typescript
// BEFORE
import { SafeAreaView, StatusBar, ... } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// AFTER - Combine into single import
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar, ... } from 'react-native';
```

**app/(drawer)/(tabs)/dashboard.tsx:**
Same pattern as complaints.tsx

**app/(drawer)/(tabs)/projects.tsx:**
Same pattern as complaints.tsx

**app/(drawer)/(tabs)/tasks.tsx:**
```typescript
// BEFORE
import { View, Text, StyleSheet, SafeAreaView, StatusBar, ... } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// AFTER
import { View, Text, StyleSheet, StatusBar, ... } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
```

---

## Complete File-by-File Changes

### 1. app/(drawer)/(tabs)/complaints.tsx

**Import Changes:**
```typescript
// OLD
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Platform,
  Modal,
  InteractionManager,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// NEW
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Platform,
  Modal,
  InteractionManager,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
```

**Component Changes:**
```typescript
// OLD (around line 343)
<SafeAreaView style={[styles.container,{
  paddingTop: insets.top,
  paddingBottom: insets.bottom
}]}>

// NEW
<SafeAreaView style={[styles.container,{
  paddingTop: insets.top,
  paddingBottom: insets.bottom
}]} edges={['top', 'bottom']}>
```

---

### 2. app/(drawer)/(tabs)/dashboard.tsx

**Import Changes:**
```typescript
// OLD
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// NEW
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
```

**Component Changes:**
```typescript
// OLD
<SafeAreaView style={[styles.container,{
  paddingTop: insets.top,
  paddingBottom: insets.bottom
}]}>

// NEW
<SafeAreaView style={[styles.container,{
  paddingTop: insets.top,
  paddingBottom: insets.bottom
}]} edges={['top', 'bottom']}>
```

---

### 3. app/(drawer)/(tabs)/projects.tsx

**Import Changes:**
```typescript
// OLD
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// NEW
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
```

**Component Changes:**
```typescript
// OLD
<SafeAreaView style={[styles.container,{
  paddingTop: insets.top,
  paddingBottom: insets.bottom
}]}>

// NEW
<SafeAreaView style={[styles.container,{
  paddingTop: insets.top,
  paddingBottom: insets.bottom
}]} edges={['top', 'bottom']}>
```

---

### 4. app/(drawer)/(tabs)/tasks.tsx

**Import Changes:**
```typescript
// OLD
import { View, Text, StyleSheet, SafeAreaView, StatusBar, FlatList, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// NEW
import { View, Text, StyleSheet, StatusBar, FlatList, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
```

**Component Changes:**
```typescript
// OLD
<SafeAreaView style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>

// NEW
<SafeAreaView style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]} edges={['top', 'bottom']}>
```

---

### 5. app/(drawer)/advanced-project-search.tsx

**Import Changes:**
```typescript
// OLD
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

// NEW
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
```

**Component Changes:**
```typescript
// OLD
<SafeAreaView style={styles.container}>

// NEW
<SafeAreaView style={styles.container} edges={['top', 'bottom']}>
```

---

### 6. app/(drawer)/assign-task.tsx

**Import Changes:**
```typescript
// OLD
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';

// NEW
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
```

**Component Changes:**
```typescript
// OLD
<SafeAreaView style={styles.container}>

// NEW
<SafeAreaView style={styles.container} edges={['top', 'bottom']}>
```

---

### 7. app/(drawer)/complaints-stack/Complaint-searchable-selection.tsx

**Import Changes:**
```typescript
// OLD
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  FlatList,
  Platform,
  TextInput,
} from 'react-native';

// NEW
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  FlatList,
  Platform,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
```

**Component Changes:**
```typescript
// OLD
<SafeAreaView style={styles.container}>

// NEW
<SafeAreaView style={styles.container} edges={['top', 'bottom']}>
```

---

### 8. app/(drawer)/complaints-stack/assign-complaint.tsx

**Import Changes:**
```typescript
// OLD
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Platform,
  TextInput,
  ActivityIndicator,
  Image,
  ActionSheetIOS,
  Alert,
} from 'react-native';

// NEW
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Platform,
  TextInput,
  ActivityIndicator,
  Image,
  ActionSheetIOS,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
```

**Component Changes:**
```typescript
// OLD
<SafeAreaView style={styles.container}>

// NEW
<SafeAreaView style={styles.container} edges={['top', 'bottom']}>
```

---

### 9. app/(drawer)/complaints-stack/complaint-details.tsx

**Import Changes:**
```typescript
// OLD
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Platform,
  Dimensions,
  Modal,
  Image,
  Linking,
  Alert,
  ActivityIndicator,
} from 'react-native';

// NEW
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Platform,
  Dimensions,
  Modal,
  Image,
  Linking,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
```

**Component Changes:**
```typescript
// OLD
<SafeAreaView style={styles.container}>

// NEW
<SafeAreaView style={styles.container} edges={['top', 'bottom']}>
```

---

### 10-27. Remaining Files

Follow the same pattern as files 5-9:
1. Remove SafeAreaView from 'react-native' import
2. Add `import { SafeAreaView } from 'react-native-safe-area-context';`
3. Add `edges={['top', 'bottom']}` prop to all `<SafeAreaView>` components

**Files to update:**
- app/(drawer)/complaints-stack/select-category.tsx
- app/(drawer)/complaints-stack/select-department.tsx
- app/(drawer)/complaints-stack/select-zone.tsx
- app/(drawer)/create-bottleneck.tsx
- app/(drawer)/create-complaint.tsx (3 instances)
- app/(drawer)/create-inspection.tsx
- app/(drawer)/create-task.tsx (2 instances)
- app/(drawer)/my-task.tsx
- app/(drawer)/placeholder.tsx
- app/(drawer)/profile-edit.tsx
- app/(drawer)/profile.tsx
- app/(drawer)/project-details.tsx
- app/(drawer)/project-list.tsx
- app/(drawer)/search-stack/complaint-search.tsx
- app/(drawer)/searchable-selection.tsx
- app/(drawer)/selection-screen.tsx
- app/(drawer)/settings.tsx
- app/(drawer)/task-details.tsx

---

## Validation Checklist

After making changes to each file, verify:

- [ ] SafeAreaView import is from 'react-native-safe-area-context'
- [ ] All useSafeAreaInsets imports are combined with SafeAreaView import
- [ ] All `<SafeAreaView>` components have `edges={['top', 'bottom']}` prop
- [ ] StatusBar component remains properly configured
- [ ] File still compiles without errors
- [ ] Component renders correctly on iOS and Android

---

## Testing Commands

```bash
# Type check the entire app
npm run type-check

# Build for iOS
eas build --platform ios --profile preview

# Build for Android
eas build --platform android --profile preview

# Test on iOS simulator
npm run ios

# Test on Android emulator
npm run android
```

---

## Reference: Complete Pattern

Here's the complete pattern for a corrected file:

```typescript
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MyScreen() {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView 
      style={styles.container}
      edges={['top', 'bottom']}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <ScrollView>
        {/* Content */}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
```

