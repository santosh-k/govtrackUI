/**
 * Home Screen - Command Center Dashboard
 *
 * Central dashboard providing at-a-glance overview of all key modules.
 * Features:
 * - Welcome greeting with current date
 * - 2-column grid of module snapshot cards
 * - Critical alerts section for urgent items
 */

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
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Header from '@/components/Header';
import { COLORS } from '@/theme';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2; // 2 columns with padding

// Helper function to format current date
const getCurrentDate = (): string => {
  const date = new Date();
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const dayName = days[date.getDay()];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${dayName}, ${day} ${month} ${year}`;
};

// Snapshot Card Component
interface SnapshotCardProps {
  title: string;
  stat: string;
  subText: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  backgroundColor: string;
  onPress: () => void;
}

const SnapshotCard: React.FC<SnapshotCardProps> = ({
  title,
  stat,
  subText,
  icon,
  iconColor,
  backgroundColor,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[styles.snapshotCard, { backgroundColor }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardIconContainer}>
        <Ionicons name={icon} size={40} color={iconColor} />
      </View>
      <Text style={styles.cardStat}>{stat}</Text>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardSubText}>{subText}</Text>
    </TouchableOpacity>
  );
};

// Alert Card Component
interface AlertCardProps {
  message: string;
  type: 'warning' | 'critical';
  onPress?: () => void;
}

const AlertCard: React.FC<AlertCardProps> = ({ message, type, onPress }) => {
  const isWarning = type === 'warning';
  const borderColor = isWarning ? '#FF9800' : '#F44336';
  const backgroundColor = isWarning ? '#FFF8E1' : '#FFEBEE';
  const iconColor = isWarning ? '#F57C00' : '#D32F2F';
  const iconName = isWarning ? 'warning-outline' : 'alert-circle-outline';

  return (
    <TouchableOpacity
      style={[styles.alertCard, { backgroundColor, borderLeftColor: borderColor }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.alertIconContainer}>
        <Ionicons name={iconName} size={24} color={iconColor} />
      </View>
      <Text style={styles.alertMessage}>{message}</Text>
      <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
    </TouchableOpacity>
  );
};

export default function DashboardScreen() {
  const userName = 'Er Sabir Ali';
  const currentDate = getCurrentDate();

  // Navigation handlers
  const navigateToProjects = () => {
    router.push('/(drawer)/(tabs)/projects');
  };

  const navigateToComplaints = () => {
    router.push('/(drawer)/(tabs)/complaints');
  };

  const navigateToTasks = () => {
    router.push('/(drawer)/(tabs)/tasks');
  };

  const navigateToInspections = () => {
    router.push('/(drawer)/advanced-project-search');
  };

  const navigateToWaterLogging = () => {
    router.push('/water-logging/list');
  };

  const navigateToAssets = () => {
    router.push('/(drawer)/search-asset');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <Header />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section - Welcome & Date */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Welcome, {userName}</Text>
          <Text style={styles.dateText}>{currentDate}</Text>
        </View>

        {/* Snapshot Grid */}
        <View style={styles.gridContainer}>
          {/* Projects Card */}
          <SnapshotCard
            title="Projects"
            stat="12 Active"
            subText="2 Delayed"
            icon="folder-outline"
            iconColor="#2E7D32"
            backgroundColor="#D8F3DC"
            onPress={navigateToProjects}
          />

          {/* Complaints Card */}
          <SnapshotCard
            title="Complaints"
            stat="8 Pending"
            subText="1 SLA Breached"
            icon="document-text-outline"
            iconColor="#F57C00"
            backgroundColor="#FFE5D4"
            onPress={navigateToComplaints}
          />

          {/* My Tasks Card */}
          <SnapshotCard
            title="My Tasks"
            stat="5 Total"
            subText="2 Due Today"
            icon="checkmark-done-outline"
            iconColor="#1976D2"
            backgroundColor="#D4E9F7"
            onPress={navigateToTasks}
          />

          {/* Inspections Card */}
          <SnapshotCard
            title="Inspections"
            stat="3 Done"
            subText="1 Scheduled Today"
            icon="eye-outline"
            iconColor="#7B1FA2"
            backgroundColor="#E8D7F1"
            onPress={navigateToInspections}
          />

          {/* Water Logging Card */}
          <SnapshotCard
            title="Water Logging"
            stat="2 Active"
            subText="Critical Alert"
            icon="water-outline"
            iconColor="#00838F"
            backgroundColor="#D3F5F7"
            onPress={navigateToWaterLogging}
          />

          {/* Assets Card */}
          <SnapshotCard
            title="Assets"
            stat="View All"
            subText="Monitor Status"
            icon="business-outline"
            iconColor="#616161"
            backgroundColor="#EEEEEE"
            onPress={navigateToAssets}
          />
        </View>

        {/* Critical Alerts Section */}
        <View style={styles.alertsSection}>
          <Text style={styles.sectionTitle}>Requires Attention</Text>

          <AlertCard
            message="Project 'NH-44 Repair' is halted due to bottleneck."
            type="warning"
            onPress={navigateToProjects}
          />

          <AlertCard
            message="SLA Breached for Complaint #102"
            type="critical"
            onPress={navigateToComplaints}
          />

          <AlertCard
            message="Water logging at ITO Underpass - Critical severity"
            type="critical"
            onPress={navigateToWaterLogging}
          />
        </View>

        {/* Bottom Spacer */}
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
    paddingTop: 8,
  },
  welcomeSection: {
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  welcomeText: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  dateText: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  snapshotCard: {
    width: cardWidth,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    minHeight: 150,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  cardIconContainer: {
    marginBottom: 12,
  },
  cardStat: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
    textAlign: 'center',
  },
  cardSubText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  alertsSection: {
    marginTop: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  alertIconContainer: {
    marginRight: 12,
  },
  alertMessage: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    lineHeight: 20,
  },
  bottomSpacer: {
    height: 24,
  },
});
