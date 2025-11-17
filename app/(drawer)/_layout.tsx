import { Drawer } from 'expo-router/drawer';
import CustomDrawer from '@/components/CustomDrawer';
import { DrawerContentComponentProps } from '@react-navigation/drawer';

export default function DrawerLayout() {
  return (
    <Drawer
      drawerContent={(props: DrawerContentComponentProps) => <CustomDrawer {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
        drawerStyle: {
          width: 280,
        },
        overlayColor: 'rgba(0, 0, 0, 0.5)',
        swipeEnabled: true,
        swipeEdgeWidth: 50,
      }}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{
          drawerLabel: 'Home',
          headerShown: false,
        }}
      />
      {/* ✅ Stack to manage complaint-related screens */}
      <Drawer.Screen
        name="complaints-stack"
        options={{
          drawerLabel: 'Complaints',
          headerShown: false,
        }}
      />
      <Drawer.Screen
        name="search-stack"
        options={{
          drawerLabel: 'Search',
          headerShown: false,
        }}
      />
    </Drawer>
  );
}
