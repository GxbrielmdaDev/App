import { useEffect } from 'react';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../contexts/ThemeContext';
import { loadSettings } from '../services/api';
import Dashboard from '../pages/Dashboard';
import Products from '../pages/Products';
import Clients from '../pages/Clients';
import Sales from '../pages/Sales';

const Tab = createBottomTabNavigator();

const tabIcons = {
  Dashboard: ['stats-chart', 'stats-chart-outline'],
  Produtos: ['cube', 'cube-outline'],
  Clientes: ['people', 'people-outline'],
  Vendas: ['cart', 'cart-outline'],
};

export default function AppNavigator() {
  const { isDark, colors } = useTheme();

  useEffect(() => {
    loadSettings();
  }, []);

  const baseTheme = isDark ? DarkTheme : DefaultTheme;
  const navigationTheme = {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      notification: colors.primary,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textTertiary,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            borderTopWidth: 1,
          },
          tabBarLabelStyle: { fontSize: 11.5, fontWeight: '600' },
          tabBarIcon: ({ focused, color, size }) => {
            const [filled, outline] = tabIcons[route.name] || ['ellipse', 'ellipse-outline'];
            return <Ionicons name={focused ? filled : outline} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Dashboard" component={Dashboard} />
        <Tab.Screen name="Produtos" component={Products} />
        <Tab.Screen name="Clientes" component={Clients} />
        <Tab.Screen name="Vendas" component={Sales} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
