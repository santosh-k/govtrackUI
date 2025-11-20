# SafeAreaView Fixes - Implementation Checklist

## Quick Checklist

Use this to track your progress as you fix each file.

---

## Phase 1: Tab Navigation Screens (4 files)
Priority: **HIGH** - These are primary navigation screens

- [ ] **1. `app/(drawer)/(tabs)/complaints.tsx`**
  - [ ] Remove SafeAreaView from react-native import
  - [ ] Add SafeAreaView import from react-native-safe-area-context
  - [ ] Combine with existing useSafeAreaInsets import
  - [ ] Add edges prop to SafeAreaView
  - [ ] Test on iOS
  - [ ] Test on Android

- [ ] **2. `app/(drawer)/(tabs)/dashboard.tsx`**
  - [ ] Remove SafeAreaView from react-native import
  - [ ] Add SafeAreaView import from react-native-safe-area-context
  - [ ] Combine with existing useSafeAreaInsets import
  - [ ] Add edges prop to SafeAreaView
  - [ ] Test on iOS
  - [ ] Test on Android

- [ ] **3. `app/(drawer)/(tabs)/projects.tsx`**
  - [ ] Remove SafeAreaView from react-native import
  - [ ] Add SafeAreaView import from react-native-safe-area-context
  - [ ] Combine with existing useSafeAreaInsets import
  - [ ] Add edges prop to SafeAreaView
  - [ ] Test on iOS
  - [ ] Test on Android

- [ ] **4. `app/(drawer)/(tabs)/tasks.tsx`**
  - [ ] Remove SafeAreaView from react-native import
  - [ ] Add SafeAreaView import from react-native-safe-area-context
  - [ ] Combine with existing useSafeAreaInsets import
  - [ ] Add edges prop to SafeAreaView
  - [ ] Test on iOS
  - [ ] Test on Android

---

## Phase 2A: Creation Screens (4 files)
Priority: **MEDIUM** - User-facing creation flows

- [ ] **5. `app/(drawer)/create-complaint.tsx`**
  - [ ] Remove SafeAreaView from react-native import
  - [ ] Add SafeAreaView import from react-native-safe-area-context
  - [ ] Add edges prop to **1st SafeAreaView** (main container)
  - [ ] Add edges prop to **2nd SafeAreaView** (map modal)
  - [ ] Add edges prop to **3rd SafeAreaView** (department modal)
  - [ ] Test on iOS
  - [ ] Test on Android

- [ ] **6. `app/(drawer)/create-task.tsx`**
  - [ ] Remove SafeAreaView from react-native import
  - [ ] Add SafeAreaView import from react-native-safe-area-context
  - [ ] Add edges prop to **1st SafeAreaView** (main container)
  - [ ] Add edges prop to **2nd SafeAreaView** (map modal)
  - [ ] Test on iOS
  - [ ] Test on Android

- [ ] **7. `app/(drawer)/create-inspection.tsx`**
  - [ ] Remove SafeAreaView from react-native import
  - [ ] Add SafeAreaView import from react-native-safe-area-context
  - [ ] Add edges prop to SafeAreaView
  - [ ] Test on iOS
  - [ ] Test on Android

- [ ] **8. `app/(drawer)/create-bottleneck.tsx`**
  - [ ] Remove SafeAreaView from react-native import
  - [ ] Add SafeAreaView import from react-native-safe-area-context
  - [ ] Add edges prop to SafeAreaView
  - [ ] Test on iOS
  - [ ] Test on Android

---

## Phase 2B: Selection & Category Screens (6 files)
Priority: **MEDIUM** - Selection flows

- [ ] **9. `app/(drawer)/complaints-stack/select-category.tsx`**
  - [ ] Remove SafeAreaView from react-native import
  - [ ] Add SafeAreaView import from react-native-safe-area-context
  - [ ] Add edges prop to SafeAreaView
  - [ ] Test on iOS
  - [ ] Test on Android

- [ ] **10. `app/(drawer)/complaints-stack/select-department.tsx`**
  - [ ] Remove SafeAreaView from react-native import
  - [ ] Add SafeAreaView import from react-native-safe-area-context
  - [ ] Add edges prop to SafeAreaView
  - [ ] Test on iOS
  - [ ] Test on Android

- [ ] **11. `app/(drawer)/complaints-stack/select-zone.tsx`**
  - [ ] Remove SafeAreaView from react-native import
  - [ ] Add SafeAreaView import from react-native-safe-area-context
  - [ ] Add edges prop to SafeAreaView
  - [ ] Test on iOS
  - [ ] Test on Android

- [ ] **12. `app/(drawer)/complaints-stack/Complaint-searchable-selection.tsx`**
  - [ ] Remove SafeAreaView from react-native import
  - [ ] Add SafeAreaView import from react-native-safe-area-context
  - [ ] Add edges prop to SafeAreaView
  - [ ] Test on iOS
  - [ ] Test on Android

- [ ] **13. `app/(drawer)/selection-screen.tsx`**
  - [ ] Remove SafeAreaView from react-native import
  - [ ] Add SafeAreaView import from react-native-safe-area-context
  - [ ] Add edges prop to SafeAreaView
  - [ ] Test on iOS
  - [ ] Test on Android

- [ ] **14. `app/(drawer)/searchable-selection.tsx`**
  - [ ] Remove SafeAreaView from react-native import
  - [ ] Add SafeAreaView import from react-native-safe-area-context
  - [ ] Add edges prop to SafeAreaView
  - [ ] Test on iOS
  - [ ] Test on Android

---

## Phase 2C: Complaint Management Screens (3 files)
Priority: **MEDIUM**

- [ ] **15. `app/(drawer)/complaints-stack/assign-complaint.tsx`**
  - [ ] Remove SafeAreaView from react-native import
  - [ ] Add SafeAreaView import from react-native-safe-area-context
  - [ ] Add edges prop to SafeAreaView
  - [ ] Test on iOS
  - [ ] Test on Android

- [ ] **16. `app/(drawer)/advanced-project-search.tsx`**
  - [ ] Remove SafeAreaView from react-native import
  - [ ] Add SafeAreaView import from react-native-safe-area-context
  - [ ] Add edges prop to SafeAreaView
  - [ ] Test on iOS
  - [ ] Test on Android

- [ ] **17. `app/(drawer)/search-stack/complaint-search.tsx`**
  - [ ] Remove SafeAreaView from react-native import
  - [ ] Add SafeAreaView import from react-native-safe-area-context
  - [ ] Add edges prop to SafeAreaView
  - [ ] Test on iOS
  - [ ] Test on Android

---

## Phase 3A: Profile & Project Management (7 files)
Priority: **MEDIUM-LOW**

- [ ] **18. `app/(drawer)/profile.tsx`**
  - [ ] Remove SafeAreaView from react-native import
  - [ ] Add SafeAreaView import from react-native-safe-area-context
  - [ ] Add edges prop to SafeAreaView
  - [ ] Test on iOS
  - [ ] Test on Android

- [ ] **19. `app/(drawer)/profile-edit.tsx`**
  - [ ] Remove SafeAreaView from react-native import
  - [ ] Add SafeAreaView import from react-native-safe-area-context
  - [ ] Add edges prop to SafeAreaView
  - [ ] Test on iOS
  - [ ] Test on Android

- [ ] **20. `app/(drawer)/project-list.tsx`**
  - [ ] Remove SafeAreaView from react-native import
  - [ ] Add SafeAreaView import from react-native-safe-area-context
  - [ ] Add edges prop to SafeAreaView
  - [ ] Test on iOS
  - [ ] Test on Android

- [ ] **21. `app/(drawer)/project-details.tsx`**
  - [ ] Remove SafeAreaView from react-native import
  - [ ] Add SafeAreaView import from react-native-safe-area-context
  - [ ] Add edges prop to SafeAreaView
  - [ ] Test on iOS
  - [ ] Test on Android

- [ ] **22. `app/(drawer)/assign-task.tsx`**
  - [ ] Remove SafeAreaView from react-native import
  - [ ] Add SafeAreaView import from react-native-safe-area-context
  - [ ] Add edges prop to SafeAreaView
  - [ ] Test on iOS
  - [ ] Test on Android

- [ ] **23. `app/(drawer)/task-details.tsx`**
  - [ ] Remove SafeAreaView from react-native import
  - [ ] Add SafeAreaView import from react-native-safe-area-context
  - [ ] Add edges prop to SafeAreaView
  - [ ] Test on iOS
  - [ ] Test on Android

- [ ] **24. `app/(drawer)/settings.tsx`**
  - [ ] Remove SafeAreaView from react-native import
  - [ ] Add SafeAreaView import from react-native-safe-area-context
  - [ ] Add edges prop to SafeAreaView
  - [ ] Test on iOS
  - [ ] Test on Android

---

## Phase 3B: Utility Screens (3 files)
Priority: **LOW**

- [ ] **25. `app/(drawer)/my-task.tsx`**
  - [ ] Remove SafeAreaView from react-native import
  - [ ] Add SafeAreaView import from react-native-safe-area-context
  - [ ] Add edges prop to SafeAreaView
  - [ ] Test on iOS
  - [ ] Test on Android

- [ ] **26. `app/(drawer)/placeholder.tsx`**
  - [ ] Remove SafeAreaView from react-native import
  - [ ] Add SafeAreaView import from react-native-safe-area-context
  - [ ] Add edges prop to SafeAreaView
  - [ ] Test on iOS
  - [ ] Test on Android

- [ ] **27. `app/(drawer)/complaints-stack/Complaint-History.tsx`** ⚠️ BONUS
  - [ ] Already has correct import ✓
  - [ ] Add edges prop to SafeAreaView (optional but recommended)
  - [ ] Test on iOS
  - [ ] Test on Android

---

## Final Verification

### Code Quality
- [ ] All files compile without errors
- [ ] TypeScript type checking passes (`npm run type-check`)
- [ ] No ESLint warnings
- [ ] No console errors or warnings

### Testing
- [ ] Phase 1 tested on iOS + Android
- [ ] Phase 2 tested on iOS + Android
- [ ] Phase 3 tested on iOS + Android
- [ ] Orientations (portrait/landscape) tested
- [ ] Different device sizes tested

### Documentation
- [ ] Update CHANGELOG.md
- [ ] Add PR description
- [ ] Link to this analysis

---

## Progress Tracking

| Phase | Status | Files | Completed | %  |
|-------|--------|-------|-----------|-----|
| Phase 1 | ⬜ | 4 | 0 | 0% |
| Phase 2A | ⬜ | 4 | 0 | 0% |
| Phase 2B | ⬜ | 6 | 0 | 0% |
| Phase 2C | ⬜ | 3 | 0 | 0% |
| Phase 3A | ⬜ | 7 | 0 | 0% |
| Phase 3B | ⬜ | 3 | 0 | 0% |
| **TOTAL** | **⬜** | **27** | **0** | **0%** |

---

## Notes

```
Phase 1 started: ____________
Phase 1 completed: ____________

Phase 2A-C started: ____________
Phase 2 completed: ____________

Phase 3A-B started: ____________
Phase 3 completed: ____________

Testing completed: ____________

Issues encountered:
- 
- 
- 

Devices tested:
- iOS: ____________________
- Android: ____________________
```

---

## Reference Files

- **Perfect Reference:** `app/(drawer)/complaints-stack/complaints-list.tsx`
- **Good Import Only:** `app/(drawer)/complaints-stack/Complaint-History.tsx`

Always check these files if you're unsure about the pattern!

