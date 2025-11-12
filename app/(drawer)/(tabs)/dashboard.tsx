import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Header from '@/components/Header';

const COLORS = {
  background: '#FDFDFD',
  text: '#1A1A1A',
};

export default function DashboardScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <Header />

      <View style={styles.content}>
        <Text style={styles.comingSoonText}>Coming Soon</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  comingSoonText: {
    fontSize: 28,
    fontWeight: '600',
    color: COLORS.text,
    letterSpacing: 0.5,
  },
});
