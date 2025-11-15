import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  primary: '#FF9800', // Saffron/Orange
  overlay: 'rgba(0, 0, 0, 0.5)',
  white: '#FFFFFF',
  text: '#1A1A1A',
};

interface SpeedDialAction {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}

interface SpeedDialFABProps {
  actions: SpeedDialAction[];
}

export default function SpeedDialFAB({ actions }: SpeedDialFABProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [animation] = useState(new Animated.Value(0));
  const [rotateAnimation] = useState(new Animated.Value(0));

  const toggleMenu = () => {
    const toValue = isOpen ? 0 : 1;

    Animated.parallel([
      Animated.spring(animation, {
        toValue,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnimation, {
        toValue,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    setIsOpen(!isOpen);
  };

  const handleActionPress = (action: SpeedDialAction) => {
    toggleMenu();
    setTimeout(() => {
      action.onPress();
    }, 100);
  };

  const rotation = rotateAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  const overlayOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <TouchableWithoutFeedback onPress={toggleMenu}>
          <Animated.View
            style={[
              styles.overlay,
              {
                opacity: overlayOpacity,
              },
            ]}
          />
        </TouchableWithoutFeedback>
      )}

      {/* Action Buttons */}
      {isOpen && (
        <View style={styles.actionContainer}>
          {actions.map((action, index) => {
            const translateY = animation.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -(52 * (actions.length - index))],
            });

            const scale = animation.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 1],
            });

            const opacity = animation.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0, 0, 1],
            });

            return (
              <Animated.View
                key={index}
                style={[
                  styles.actionButton,
                  {
                    transform: [{ translateY }, { scale }],
                    opacity,
                  },
                ]}
              >
                <TouchableOpacity
                  style={styles.actionButtonTouchable}
                  onPress={() => handleActionPress(action)}
                  activeOpacity={0.8}
                >
                  <View style={styles.actionContent}>
                    <View style={styles.actionIconContainer}>
                      <Ionicons name={action.icon} size={20} color={COLORS.primary} />
                    </View>
                    <Text style={styles.actionLabel}>{action.label}</Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      )}

      {/* Main FAB */}
      <TouchableOpacity
        style={styles.mainFab}
        onPress={toggleMenu}
        activeOpacity={0.8}
      >
        <Animated.View style={{ transform: [{ rotate: rotation }] }}>
          <Ionicons name="add" size={24} color={COLORS.white} />
        </Animated.View>
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.overlay,
    zIndex: 998,
  },
  actionContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    zIndex: 999,
  },
  actionButton: {
    marginBottom: 0,
  },
  actionButtonTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  actionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginRight: 4,
  },
  mainFab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
});
