import { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { darkColors, lightColors } from '../theme/colors';

const ThemeContext = createContext(null);
const STORAGE_KEY = 'atlas-control:theme';

export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme();
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    let active = true;

    const loadTheme = async () => {
      let saved = null;
      try {
        saved = await AsyncStorage.getItem(STORAGE_KEY);
      } catch {
        saved = null;
      }
      if (!active) return;
      if (saved) {
        setIsDark(saved === 'dark');
      } else {
        setIsDark(systemScheme !== 'light');
      }
    };

    loadTheme();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleTheme = () => {
    setIsDark((current) => {
      const next = !current;
      AsyncStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light').catch(() => {});
      return next;
    });
  };

  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ isDark, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de ThemeProvider');
  }
  return context;
}
