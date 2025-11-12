import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions, useNavigation } from '@react-navigation/native';

const COLORS = {
  background: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#666666',
  border: '#E0E0E0',
  iconColor: '#1A1A1A',
};

interface HeaderProps {
  title?: string;
}

export default function Header({ title }: HeaderProps) {
  const navigation = useNavigation();

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  return (
    <View style={styles.container}>
      {/* Left: Hamburger Menu Icon */}
      <TouchableOpacity
        style={styles.menuButton}
        onPress={openDrawer}
        activeOpacity={0.6}
      >
        <Ionicons name="menu" size={28} color={COLORS.iconColor} />
      </TouchableOpacity>

      {/* Center: Title (optional) */}
      {title && (
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
        </View>
      )}

      {/* Right: User Welcome */}
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  menuButton: {
    padding: 8,
    marginLeft: -8,
  },
  titleContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: -1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  welcomeText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '400',
  },
  userName: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
    marginTop: 2,
  },
});
