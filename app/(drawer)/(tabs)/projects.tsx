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
  statusLabel?: string;
  statusColor?: string;
  accentColor?: string;
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
  statusLabel,
  statusColor,
  accentColor,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.statCard,
        accentColor && { borderLeftWidth: 4, borderLeftColor: accentColor },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      {statusLabel && (
        <View style={[styles.statusPill, { backgroundColor: statusColor }]}>
          <Text style={styles.statusText}>{statusLabel}</Text>
        </View>
      )}
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
              statusLabel="On Track"
              statusColor={COLORS.green}
              onPress={() => navigateToProjectList('Construction Work')}
            />
            <StatCard
              title="Maintenance Work"
              value="18"
              statusLabel="In Progress"
              statusColor={COLORS.primary}
              onPress={() => navigateToProjectList('Maintenance Work')}
            />
            <StatCard
              title="Other Works"
              value="12"
              statusLabel="Active"
              statusColor={COLORS.green}
              onPress={() => navigateToProjectList('Other Works')}
            />
            <StatCard
              title="Total Projects"
              value="54"
              statusLabel="Overall"
              statusColor={COLORS.textSecondary}
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
              accentColor={COLORS.red}
              onPress={() => navigateToProjectList('Delayed Projects')}
            />
            <StatCard
              title="Critical Issues"
              value="5"
              accentColor={COLORS.red}
              onPress={() => navigateToProjectList('Projects with Critical Issues')}
            />
            <StatCard
              title="Inspections Overdue"
              value="12"
              accentColor={COLORS.orange}
              onPress={() => navigateToProjectList('Inspections Overdue')}
            />
            <StatCard
              title="Inspected Today"
              value="7"
              accentColor={COLORS.green}
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
  statValue: {
    fontSize: 36,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  statusPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
  },
  bottomSpacer: {
    height: 24,
  },
});
