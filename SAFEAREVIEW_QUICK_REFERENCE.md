# SafeAreaView Quick Reference Guide

## At a Glance

| Metric | Value |
|--------|-------|
| **Total files with SafeAreaView** | 29 |
| **Files needing fixes** | 27 |
| **Files already correct** | 2 |
| **Total SafeAreaView instances** | 31 |
| **Compliance rate** | 6.9% |

---

## The Two Required Fixes

### Fix #1: Import Statement (27 files)

```diff
- import { SafeAreaView } from 'react-native';
+ import { SafeAreaView } from 'react-native-safe-area-context';
```

### Fix #2: Add edges Prop (All 29 files)

```diff
- <SafeAreaView style={styles.container}>
+ <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
```

---

## Files by Status

### ✓ Already Correct (2 files)
- `app/(drawer)/complaints-stack/Complaint-History.tsx` - Correct import only
- `app/(drawer)/complaints-stack/complaints-list.tsx` - PERFECT (use as reference)

### ❌ Need Both Fixes (27 files)

#### Tab Navigation (Priority 1)
1. `app/(drawer)/(tabs)/complaints.tsx`
2. `app/(drawer)/(tabs)/dashboard.tsx`
3. `app/(drawer)/(tabs)/projects.tsx`
4. `app/(drawer)/(tabs)/tasks.tsx`

#### Creation Screens (Priority 2)
5. `app/(drawer)/create-complaint.tsx` ⚠️ (3 instances)
6. `app/(drawer)/create-task.tsx` ⚠️ (2 instances)
7. `app/(drawer)/create-inspection.tsx`
8. `app/(drawer)/create-bottleneck.tsx`

#### Selection & Category Screens (Priority 2)
9. `app/(drawer)/complaints-stack/select-category.tsx`
10. `app/(drawer)/complaints-stack/select-department.tsx`
11. `app/(drawer)/complaints-stack/select-zone.tsx`
12. `app/(drawer)/complaints-stack/Complaint-searchable-selection.tsx`
13. `app/(drawer)/selection-screen.tsx`
14. `app/(drawer)/searchable-selection.tsx`

#### Management & Profile Screens (Priority 2)
15. `app/(drawer)/complaints-stack/assign-complaint.tsx`
16. `app/(drawer)/assign-task.tsx`
17. `app/(drawer)/advanced-project-search.tsx`
18. `app/(drawer)/project-details.tsx`
19. `app/(drawer)/project-list.tsx`
20. `app/(drawer)/profile.tsx`
21. `app/(drawer)/profile-edit.tsx`

#### Utility Screens (Priority 3)
22. `app/(drawer)/my-task.tsx`
23. `app/(drawer)/placeholder.tsx`
24. `app/(drawer)/settings.tsx`
25. `app/(drawer)/task-details.tsx`
26. `app/(drawer)/search-stack/complaint-search.tsx`

---

## Common Patterns for Import Changes

### Pattern 1: Multi-line Import
```typescript
// BEFORE
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,  // ← Remove this line
  StatusBar,
  ScrollView,
} from 'react-native';

// AFTER
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
```

### Pattern 2: Single-line Import
```typescript
// BEFORE
import { SafeAreaView } from 'react-native';

// AFTER
import { SafeAreaView } from 'react-native-safe-area-context';
```

### Pattern 3: With useSafeAreaInsets
```typescript
// BEFORE
import { SafeAreaView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// AFTER (combine both)
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
```

---

## Common Patterns for Component Changes

### Pattern 1: Simple Component
```typescript
// BEFORE
<SafeAreaView style={styles.container}>
  {/* content */}
</SafeAreaView>

// AFTER
<SafeAreaView style={styles.container} edges={['top', 'bottom']}>
  {/* content */}
</SafeAreaView>
```

### Pattern 2: With Inline Styles
```typescript
// BEFORE
<SafeAreaView style={[styles.container, { marginTop: 10 }]}>

// AFTER
<SafeAreaView style={[styles.container, { marginTop: 10 }]} edges={['top', 'bottom']}>
```

### Pattern 3: With Props
```typescript
// BEFORE
<SafeAreaView style={styles.container} testID="safe-area">

// AFTER
<SafeAreaView style={styles.container} testID="safe-area" edges={['top', 'bottom']}>
```

---

## Files with Multiple Instances ⚠️

### `app/(drawer)/create-complaint.tsx` (3 instances)
- Location 1: Main container (line ~288)
- Location 2: Map modal (line ~479)
- Location 3: Department modal (line ~561)

### `app/(drawer)/create-task.tsx` (2 instances)
- Location 1: Main container (line ~188)
- Location 2: Map modal (line ~370)

---

## What edges={['top', 'bottom']} Does

| Platform | Effect |
|----------|--------|
| **iOS** | Prevents overlap with notch, status bar, home indicator |
| **Android** | Prevents overlap with status bar and navigation bar |
| **Both** | Ensures gesture pill area is respected on bottom |

---

## Testing Points

After fixing each file, verify:

```
Visual checks:
[ ] Status bar area not overlapped (top)
[ ] Navigation bar area not overlapped (bottom)
[ ] No layout shifts or glitches
[ ] Text is readable
[ ] Buttons are tappable

Cross-device:
[ ] iPhone SE (small, no notch)
[ ] iPhone 12 (standard, with notch)
[ ] iPhone 13 Pro Max (large, with notch)
[ ] Android 9 (API 28)
[ ] Android 12+ (API 31+)

Orientations:
[ ] Portrait mode
[ ] Landscape mode
[ ] Device orientation change

Edge cases:
[ ] Keyboard visible
[ ] Multiple SafeAreaView in one screen
```

---

## Priority Implementation Order

### Batch 1 (Test First)
1. `app/(drawer)/(tabs)/complaints.tsx`
2. `app/(drawer)/(tabs)/tasks.tsx`
3. Test thoroughly on both platforms

### Batch 2 (High Visibility)
4. `app/(drawer)/(tabs)/dashboard.tsx`
5. `app/(drawer)/(tabs)/projects.tsx`
6. Test after batch 1 passes

### Batch 3 (Creation Flows)
7. `app/(drawer)/create-complaint.tsx` (3 instances)
8. `app/(drawer)/create-task.tsx` (2 instances)
9. `app/(drawer)/create-inspection.tsx`
10. `app/(drawer)/create-bottleneck.tsx`

### Batch 4 (Selection & Categories)
11-14. All select-* and searchable-selection files

### Batch 5 (Management)
15-21. Profile, project, and assignment files

### Batch 6 (Utility)
22-26. Remaining files

---

## Verification Script

After making changes, run this to verify:

```bash
# Check for old imports
grep -r "from 'react-native'" app | grep SafeAreaView

# Check for edges prop coverage
grep -r "SafeAreaView" app --include="*.tsx" | grep -v "edges="

# Compile check
npm run type-check
```

---

## Reference Patterns by File Type

### Tab Screen Pattern
```typescript
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabScreen() {
  const insets = useSafeAreaInsets();
  
  return (
    <SafeAreaView 
      style={[styles.container, {
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }]} 
      edges={['top', 'bottom']}
    >
      {/* content */}
    </SafeAreaView>
  );
}
```

### Simple Screen Pattern
```typescript
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SimpleScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" />
      {/* content */}
    </SafeAreaView>
  );
}
```

### Modal Screen Pattern
```typescript
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ModalScreen() {
  return (
    <SafeAreaView 
      style={styles.modalContainer}
      edges={['top', 'bottom']}
    >
      {/* modal content */}
    </SafeAreaView>
  );
}
```

---

## Estimated Time Per File

| File Type | Time | Complexity |
|-----------|------|-----------|
| Single SafeAreaView | 2 min | Low |
| Multiple SafeAreaView | 3-4 min | Medium |
| With useSafeAreaInsets | 3 min | Medium |

**Total for 27 files: ~70-80 minutes of coding**
**Total with testing: 5-6 hours**

---

## Troubleshooting

### Issue: Import not found
```
Error: Cannot find module 'react-native-safe-area-context'
```
**Solution:** Run `npm install` or check package.json - it should already be installed

### Issue: edges prop not working
```
React warning: edges is not a valid prop
```
**Solution:** Verify SafeAreaView is imported from 'react-native-safe-area-context' not 'react-native'

### Issue: Bottom navigation overlapped
```
Layout issue on Android
```
**Solution:** Make sure edges={['top', 'bottom']} is added to SafeAreaView

---

## Success Criteria

✓ All 27 files updated
✓ No import errors during build
✓ No TypeScript errors
✓ Content doesn't overlap system bars on iOS
✓ Content doesn't overlap system UI on Android
✓ All orientations work correctly
✓ QA signs off on testing

---

## Quick Links

- **Detailed Analysis:** `SAFEAREVIEW_ANALYSIS.md`
- **Code Changes:** `SAFEAREVIEW_CODE_CHANGES.md`
- **Executive Summary:** `SAFEAREVIEW_SUMMARY.md`

