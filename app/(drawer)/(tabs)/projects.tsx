import React, { useEffect, useRef } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';
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
  iconColor: string;
  onPress: () => void;
}

interface DonutChartProps {
  percentage: number;
  color: string;
  label: string;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const DonutChart: React.FC<DonutChartProps> = ({ percentage, color, label }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const size = 120;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: percentage,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [percentage, animatedValue]);

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  return (
    <View style={styles.donutContainer}>
      <View style={styles.donutChartWrapper}>
        <Svg width={size} height={size}>
          {/* Background circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E8E8E8"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Animated progress circle */}
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            rotation="-90"
            origin={`${size / 2}, ${size / 2}`}
          />
        </Svg>
        {/* Center percentage text */}
        <View style={styles.donutCenterText}>
          <Text style={styles.donutPercentage}>{percentage}%</Text>
        </View>
      </View>
      {/* Label below chart */}
      <Text style={styles.donutLabel}>{label}</Text>
    </View>
  );
};

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  backgroundColor,
  iconColor,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[styles.statCard, { backgroundColor }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Top: Minimalist icon with unique color */}
      <Ionicons name={icon} size={48} color={iconColor} />

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
              iconColor="#2E7D32"
              onPress={() => navigateToProjectList('Construction Work')}
            />
            <StatCard
              title="Maintenance Work"
              value="18"
              icon="build-outline"
              backgroundColor="#FFE5D4"
              iconColor="#F57C00"
              onPress={() => navigateToProjectList('Maintenance Work')}
            />
            <StatCard
              title="Other Works"
              value="12"
              icon="cube-outline"
              backgroundColor="#E8D7F1"
              iconColor="#7B1FA2"
              onPress={() => navigateToProjectList('Other Works')}
            />
            <StatCard
              title="Total Projects"
              value="54"
              icon="apps-outline"
              backgroundColor="#D4E9F7"
              iconColor="#1976D2"
              onPress={() => navigateToProjectList('All Projects')}
            />
          </View>
        </View>

        {/* Section 2: Financial Summary */}
        <View style={styles.section}>
          <View style={styles.financialCard}>
            <View style={styles.donutChartsContainer}>
              <DonutChart
                percentage={79}
                color="#4CAF50"
                label="Spent of ₹12.4 Cr Budget"
              />
              <DonutChart
                percentage={72}
                color="#2196F3"
                label="Average Project Progress"
              />
            </View>
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
              iconColor="#C2185B"
              onPress={() => navigateToProjectList('Delayed Projects')}
            />
            <StatCard
              title="Critical Issues"
              value="5"
              icon="alert-circle-outline"
              backgroundColor="#FFF4D6"
              iconColor="#F9A825"
              onPress={() => navigateToProjectList('Projects with Critical Issues')}
            />
            <StatCard
              title="Inspections Overdue"
              value="12"
              icon="calendar-outline"
              backgroundColor="#FFEBCC"
              iconColor="#EF6C00"
              onPress={() => navigateToProjectList('Inspections Overdue')}
            />
            <StatCard
              title="Inspected Today"
              value="7"
              icon="checkmark-circle-outline"
              backgroundColor="#D3F5F7"
              iconColor="#00838F"
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
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  donutChartsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  donutContainer: {
    alignItems: 'center',
    flex: 1,
  },
  donutChartWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  donutCenterText: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  donutPercentage: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
  },
  donutLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 8,
    lineHeight: 18,
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
