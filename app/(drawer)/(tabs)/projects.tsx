import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Header from '@/components/Header';

const COLORS = {
  primary: '#2196F3',
  background: '#F5F5F5',
  cardBackground: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#666666',
  white: '#FFFFFF',
  border: '#E0E0E0',
  progressBackground: '#E3F2FD',
  progressFill: '#2196F3',
  green: '#4CAF50',
  red: '#F44336',
  orange: '#FF9800',
  yellow: '#FFC107',
};

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2; // 2 columns with padding

interface StatCardProps {
  title: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  backgroundColor: string;
  onPress: () => void;
}

interface ProgressBarProps {
  label: string;
  progress: number;
  details: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ label, progress, details }) => {
  return (
    <View style={styles.progressContainer}>
      <Text style={styles.progressLabel}>{label}</Text>
      <View style={styles.progressBarBackground}>
        <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
      </View>
      <Text style={styles.progressDetails}>{details}</Text>
    </View>
  );
};

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  backgroundColor,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[styles.statCard, { backgroundColor }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Top: Minimalist icon */}
      <Ionicons name={icon} size={48} color="#1A1A1A" />

      {/* Middle: Large bold number */}
      <Text style={styles.statValue}>{value}</Text>

      {/* Bottom: Clear label */}
      <Text style={styles.statTitle}>{title}</Text>
    </TouchableOpacity>
  );
};

export default function ProjectsDashboardScreen() {
  const navigateToProjectList = (filter: string) => {
    router.push({
      pathname: '/(drawer)/project-list',
      params: { filter },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <Header title="Projects" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Section 1: Project Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Categories</Text>
          <View style={styles.gridContainer}>
            <StatCard
              title="Construction Work"
              value="24"
              icon="construct-outline"
              backgroundColor="#D8F3DC"
              onPress={() => navigateToProjectList('Construction Work')}
            />
            <StatCard
              title="Maintenance Work"
              value="18"
              icon="build-outline"
              backgroundColor="#FFE5D4"
              onPress={() => navigateToProjectList('Maintenance Work')}
            />
            <StatCard
              title="Other Works"
              value="12"
              icon="cube-outline"
              backgroundColor="#E8D7F1"
              onPress={() => navigateToProjectList('Other Works')}
            />
            <StatCard
              title="Total Projects"
              value="54"
              icon="apps-outline"
              backgroundColor="#D4E9F7"
              onPress={() => navigateToProjectList('All Projects')}
            />
          </View>
        </View>

        {/* Section 2: Financial Summary */}
        <View style={styles.section}>
          <View style={styles.financialCard}>
            <ProgressBar
              label="Budget vs. Expenditure"
              progress={79}
              details="Budget ₹12.4 Cr | Spent ₹9.8 Cr (79% Utilized)"
            />
            <View style={styles.divider} />
            <ProgressBar
              label="Average Project Progress"
              progress={72}
              details="72% Average Completion"
            />
          </View>
        </View>

        {/* Section 3: Project Health Indicators */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Health Indicators</Text>
          <View style={styles.gridContainer}>
            <StatCard
              title="Delayed Projects"
              value="8"
              icon="time-outline"
              backgroundColor="#FFE4E9"
              onPress={() => navigateToProjectList('Delayed Projects')}
            />
            <StatCard
              title="Critical Issues"
              value="5"
              icon="alert-circle-outline"
              backgroundColor="#FFF4D6"
              onPress={() => navigateToProjectList('Projects with Critical Issues')}
            />
            <StatCard
              title="Inspections Overdue"
              value="12"
              icon="calendar-outline"
              backgroundColor="#FFEBCC"
              onPress={() => navigateToProjectList('Inspections Overdue')}
            />
            <StatCard
              title="Inspected Today"
              value="7"
              icon="checkmark-circle-outline"
              backgroundColor="#D3F5F7"
              onPress={() => navigateToProjectList('Inspected Today')}
            />
          </View>
        </View>

        {/* Bottom Spacing */}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  financialCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  progressContainer: {
    marginVertical: 8,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  progressBarBackground: {
    height: 12,
    backgroundColor: COLORS.progressBackground,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.progressFill,
    borderRadius: 6,
  },
  progressDetails: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: cardWidth,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 160,
  },
  statValue: {
    fontSize: 40,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 12,
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  bottomSpacer: {
    height: 24,
  },
});
