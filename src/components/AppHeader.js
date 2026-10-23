import { useState } from 'react';
import { Image, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { IconButton } from './FormComponents';
import RelatoryModal from './RelatoryModal';
import SettingsModal from './SettingsModal';
import logo from '../../assets/atlas-logo.png';

export default function AppHeader({ title, subtitle, onRefresh }) {
  const { isDark, colors, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <View
      style={{
        paddingTop: insets.top + 10,
        paddingHorizontal: 16,
        paddingBottom: 12,
        backgroundColor: colors.background,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Image source={logo} style={{ width: 38, height: 38 }} resizeMode="contain" />

        <View style={{ flex: 1, marginRight: 2 }}>
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={{ color: colors.textTertiary, fontSize: 12 }} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        <IconButton
          icon="document-text-outline"
          onPress={() => setIsReportOpen(true)}
          size={20}
        />
        <IconButton
          icon={isDark ? 'sunny-outline' : 'moon-outline'}
          onPress={toggleTheme}
          size={20}
        />
        <IconButton
          icon="settings-outline"
          onPress={() => setIsSettingsOpen(true)}
          size={20}
        />
      </View>

      <RelatoryModal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSaved={onRefresh}
      />
    </View>
  );
}
