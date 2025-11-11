import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

const COLORS = {
  background: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#9E9E9E',
  separator: '#E8E8E8',
  border: '#E0E0E0',
};

interface Project {
  id: string;
  name: string;
  zone: string;
  department: string;
  division: string;
  subDivision: string;
  projectType: string;
}

export default function ProjectListScreen() {
  const params = useLocalSearchParams();
  const filter = params.filter as string || 'All Projects';

  const navigateBack = () => {
    // Always navigate back to Projects Dashboard
    router.push('/(drawer)/(tabs)/projects');
  };

  const navigateToProjectDetails = (projectId: string) => {
    router.push({
      pathname: '/(drawer)/project-details',
      params: { projectId },
    });
  };

  // Placeholder project data with PWD hierarchy
  const projects: Project[] = [
    {
      id: 'PRJ-2024-001',
      name: 'Road Construction - NH 44',
      zone: 'North Delhi',
      department: 'PWD Roads',
      division: 'Division 1',
      subDivision: 'Sub-Division A',
      projectType: 'Construction',
    },
    {
      id: 'PRJ-2024-002',
      name: 'Bridge Maintenance - City Center',
      zone: 'Central Delhi',
      department: 'PWD Bridges',
      division: 'Division 2',
      subDivision: 'Sub-Division B',
      projectType: 'Maintenance',
    },
    {
      id: 'PRJ-2024-003',
      name: 'Street Lighting Upgrade',
      zone: 'South Delhi',
      department: 'PWD Electrical',
      division: 'Division 3',
      subDivision: 'Sub-Division C',
      projectType: 'Upgrade',
    },
    {
      id: 'PRJ-2024-004',
      name: 'Water Supply Pipeline Installation',
      zone: 'East Delhi',
      department: 'PWD Water',
      division: 'Division 4',
      subDivision: 'Sub-Division D',
      projectType: 'Construction',
    },
    {
      id: 'PRJ-2024-005',
      name: 'School Building Renovation',
      zone: 'West Delhi',
      department: 'PWD Buildings',
      division: 'Division 5',
      subDivision: 'Sub-Division E',
      projectType: 'Renovation',
    },
    {
      id: 'PRJ-2024-006',
      name: 'Metro Station Connectivity Road',
      zone: 'North Delhi',
      department: 'PWD Roads',
      division: 'Division 1',
      subDivision: 'Sub-Division F',
      projectType: 'Construction',
    },
    {
      id: 'PRJ-2024-007',
      name: 'Drainage System Repair',
      zone: 'Central Delhi',
      department: 'PWD Drainage',
      division: 'Division 2',
      subDivision: 'Sub-Division G',
      projectType: 'Repair',
    },
    {
      id: 'PRJ-2024-008',
      name: 'Park Development Project',
      zone: 'South Delhi',
      department: 'PWD Horticulture',
      division: 'Division 3',
      subDivision: 'Sub-Division H',
      projectType: 'Development',
    },
  ];

  const renderProjectItem = ({ item }: { item: Project }) => (
    <TouchableOpacity
      style={styles.listItem}
      onPress={() => navigateToProjectDetails(item.id)}
      activeOpacity={0.6}
    >
      {/* Project Name - Primary Info */}
      <Text style={styles.projectName}>{item.name}</Text>

      {/* Secondary Info - Zone • Department • Division • Sub-Division • Project Type */}
      <Text style={styles.projectDetails}>
        {item.zone} • {item.department} • {item.division} • {item.subDivision} • {item.projectType}
      </Text>
    </TouchableOpacity>
  );

  const renderSeparator = () => <View style={styles.separator} />;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={navigateBack}
          activeOpacity={0.6}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{filter}</Text>
      </View>

      {/* List */}
      <FlatList
        data={projects}
        renderItem={renderProjectItem}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={renderSeparator}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
  },
  listItem: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  projectName: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
    lineHeight: 24,
  },
  projectDetails: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.separator,
    marginLeft: 20,
  },
});
