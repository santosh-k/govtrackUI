import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

const COLORS = {
  primary: '#2196F3',
  background: '#F5F5F5',
  cardBackground: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#666666',
  border: '#E0E0E0',
  white: '#FFFFFF',
};

interface ProjectCardProps {
  projectName: string;
  projectId: string;
  status: string;
  progress: number;
  budget: string;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  projectName,
  projectId,
  status,
  progress,
  budget,
}) => {
  return (
    <TouchableOpacity style={styles.projectCard} activeOpacity={0.7}>
      <View style={styles.cardHeader}>
        <Text style={styles.projectName}>{projectName}</Text>
        <Text style={styles.projectId}>{projectId}</Text>
      </View>
      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Status:</Text>
          <Text style={styles.infoValue}>{status}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Progress:</Text>
          <Text style={styles.infoValue}>{progress}%</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Budget:</Text>
          <Text style={styles.infoValue}>{budget}</Text>
        </View>
      </View>
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function ProjectListScreen() {
  const params = useLocalSearchParams();
  const filter = params.filter as string || 'All Projects';

  const goBack = () => {
    router.back();
  };

  // Placeholder project data
  const projects: ProjectCardProps[] = [
    {
      projectName: 'Road Construction - NH 44',
      projectId: 'PRJ-2024-001',
      status: 'In Progress',
      progress: 68,
      budget: '₹2.5 Cr',
    },
    {
      projectName: 'Bridge Maintenance - City Center',
      projectId: 'PRJ-2024-002',
      status: 'On Track',
      progress: 82,
      budget: '₹1.8 Cr',
    },
    {
      projectName: 'Street Lighting Upgrade',
      projectId: 'PRJ-2024-003',
      status: 'Delayed',
      progress: 45,
      budget: '₹0.9 Cr',
    },
    {
      projectName: 'Water Supply Pipeline',
      projectId: 'PRJ-2024-004',
      status: 'In Progress',
      progress: 72,
      budget: '₹3.2 Cr',
    },
    {
      projectName: 'School Building Renovation',
      projectId: 'PRJ-2024-005',
      status: 'On Track',
      progress: 91,
      budget: '₹1.5 Cr',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={goBack}
          activeOpacity={0.6}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Project List</Text>
          <Text style={styles.headerSubtitle}>Showing: {filter}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.filterBadge}>
          <Ionicons name="filter" size={16} color={COLORS.primary} />
          <Text style={styles.filterText}>{filter}</Text>
        </View>

        {projects.map((project, index) => (
          <ProjectCard key={index} {...project} />
        ))}

        <View style={styles.bottomSpacer} />
      </ScrollView>
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
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
    marginRight: 8,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  filterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 6,
  },
  projectCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 12,
    marginBottom: 12,
  },
  projectName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  projectId: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  cardBody: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  progressBarContainer: {
    marginTop: 8,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#E3F2FD',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  bottomSpacer: {
    height: 24,
  },
});
