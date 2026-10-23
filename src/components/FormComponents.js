import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';

export function Panel({ title, subtitle, children, style, contentStyle }) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: colors.surfaceAlt,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: colors.border,
          padding: 18,
        },
        style,
      ]}
    >
      {title ? (
        <Text style={{ color: colors.text, fontSize: 17, fontWeight: '600', marginBottom: subtitle ? 6 : 14 }}>
          {title}
        </Text>
      ) : null}
      {subtitle ? (
        <Text style={{ color: colors.textSecondary, fontSize: 13.5, marginBottom: 14 }}>{subtitle}</Text>
      ) : null}
      <View style={contentStyle}>{children}</View>
    </View>
  );
}

export function StatCard({ label, value }) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        flexGrow: 1,
        flexBasis: '47%',
        backgroundColor: colors.surfaceAlt,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 16,
      }}
    >
      <Text style={{ color: colors.textSecondary, fontSize: 12.5, marginBottom: 8 }}>{label}</Text>
      <Text style={{ color: colors.text, fontSize: 22, fontWeight: '700' }} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
    </View>
  );
}

export function FormField({ label, children, style, required = false }) {
  const { colors } = useTheme();
  return (
    <View style={[{ marginBottom: 14 }, style]}>
      <Text style={{ color: colors.text, fontSize: 14, fontWeight: '500', marginBottom: 8 }}>
        {label}
        {required ? <Text style={{ color: colors.primary }}> *</Text> : null}
      </Text>
      {children}
    </View>
  );
}

export function AppTextInput({ style, multiline, ...props }) {
  const { colors } = useTheme();
  return (
    <TextInput
      placeholderTextColor={colors.textTertiary}
      multiline={multiline}
      style={[
        {
          backgroundColor: colors.surface,
          borderColor: colors.borderLight,
          borderWidth: 1,
          borderRadius: 12,
          color: colors.text,
          paddingHorizontal: 14,
          paddingVertical: 12,
          fontSize: 15,
        },
        multiline && { minHeight: 84, textAlignVertical: 'top' },
        style,
      ]}
      {...props}
    />
  );
}

export function PrimaryButton({ title, onPress, loading = false, disabled = false, icon, style, compact = false }) {
  const { colors } = useTheme();
  const blocked = disabled || loading;
  return (
    <Pressable
      onPress={blocked ? undefined : onPress}
      disabled={blocked}
      style={({ pressed }) => [
        {
          backgroundColor: colors.primary,
          borderRadius: 12,
          paddingVertical: compact ? 10 : 14,
          paddingHorizontal: compact ? 16 : 20,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        },
        pressed && { backgroundColor: colors.primaryDark },
        blocked && { opacity: 0.6 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color="#ffffff" size="small" />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={18} color="#ffffff" /> : null}
          <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: compact ? 14 : 15 }}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}

export function SecondaryButton({ title, onPress, icon, style, compact = false, destructive = false }) {
  const { colors } = useTheme();
  const tint = destructive ? colors.error : colors.text;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          backgroundColor: destructive ? colors.errorBg : 'transparent',
          borderWidth: 1,
          borderColor: destructive ? colors.error : colors.borderLight,
          borderRadius: 12,
          paddingVertical: compact ? 10 : 13,
          paddingHorizontal: compact ? 16 : 20,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        },
        pressed && { backgroundColor: colors.surfaceHover },
        style,
      ]}
    >
      {icon ? <Ionicons name={icon} size={18} color={tint} /> : null}
      <Text style={{ color: tint, fontWeight: '600', fontSize: compact ? 14 : 15 }}>{title}</Text>
    </Pressable>
  );
}

export function IconButton({ icon, onPress, color, size = 22, style, hitSlop = 8 }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      hitSlop={hitSlop}
      style={({ pressed }) => [
        {
          width: 40,
          height: 40,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
        },
        pressed && { backgroundColor: colors.surfaceHover },
        style,
      ]}
    >
      <Ionicons name={icon} size={size} color={color || colors.textSecondary} />
    </Pressable>
  );
}

export function AlertMessage({ message, type = 'error', onClose, style }) {
  const { colors } = useTheme();
  if (!message) return null;

  const isSuccess = type === 'success';
  const tint = isSuccess ? colors.success : colors.error;

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          marginTop: 12,
          paddingHorizontal: 12,
          paddingVertical: 10,
          borderRadius: 10,
          backgroundColor: isSuccess ? colors.successBg : colors.errorBg,
          borderWidth: 1,
          borderColor: tint,
        },
        style,
      ]}
    >
      <Ionicons name={isSuccess ? 'checkmark-circle' : 'alert-circle'} size={18} color={tint} />
      <Text style={{ color: tint, flex: 1, fontSize: 13.5 }}>{message}</Text>
      {onClose ? (
        <Pressable onPress={onClose} hitSlop={8}>
          <Ionicons name="close" size={16} color={tint} />
        </Pressable>
      ) : null}
    </View>
  );
}

export function EmptyState({ message, icon = 'file-tray-outline' }) {
  const { colors } = useTheme();
  return (
    <View style={{ alignItems: 'center', paddingVertical: 28, gap: 10 }}>
      <Ionicons name={icon} size={34} color={colors.textTertiary} />
      <Text style={{ color: colors.textTertiary, fontSize: 14, textAlign: 'center' }}>{message}</Text>
    </View>
  );
}

export function AppModal({ visible, onClose, title, subtitle, children, footer, scrollable = true }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <Pressable style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0, 0, 0, 0.62)' }]} onPress={onClose} />
          <View
            style={{
              backgroundColor: colors.background,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              borderWidth: 1,
              borderColor: colors.border,
              paddingHorizontal: 18,
              paddingTop: 18,
              paddingBottom: Math.max(insets.bottom, 16),
              maxHeight: '90%',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 }}>
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>{title}</Text>
                {subtitle ? (
                  <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 4 }}>{subtitle}</Text>
                ) : null}
              </View>
              <Pressable onPress={onClose} hitSlop={10} style={{ padding: 4 }}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </Pressable>
            </View>

            {scrollable ? (
              <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                style={{ flexGrow: 0, flexShrink: 1 }}
              >
                {children}
              </ScrollView>
            ) : (
              <View style={{ flexShrink: 1 }}>{children}</View>
            )}

            {footer ? <View style={{ marginTop: 14 }}>{footer}</View> : null}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
