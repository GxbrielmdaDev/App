import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { formatCNPJ, formatCPF, onlyDigits } from '../utils/format';

export default function CPFCNPJInput({ value, onChange, disabled = false }) {
  const { colors } = useTheme();
  const [documentType, setDocumentType] = useState(() =>
    onlyDigits(value).length === 14 ? 'cnpj' : 'cpf'
  );
  const [showHint, setShowHint] = useState(false);

  const handleDocumentTypeChange = (type) => {
    if (type === documentType) return;
    setDocumentType(type);
    setShowHint(true);
    onChange('');
  };

  const handleInputChange = (text) => {
    const digits = onlyDigits(text);

    if (documentType === 'cpf') {
      if (digits.length <= 11) {
        onChange(formatCPF(digits));
      }
    } else if (digits.length <= 14) {
      onChange(formatCNPJ(digits));
    }
  };

  const placeholder = documentType === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00';

  const renderTypeButton = (type, label) => {
    const active = documentType === type;
    return (
      <Pressable
        key={type}
        onPress={() => handleDocumentTypeChange(type)}
        disabled={disabled}
        style={{
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 999,
          backgroundColor: active ? colors.primary : 'transparent',
          borderWidth: 1,
          borderColor: active ? colors.primary : colors.borderLight,
        }}
      >
        <Text
          style={{
            color: active ? '#ffffff' : colors.textSecondary,
            fontSize: 12.5,
            fontWeight: '700',
          }}
        >
          {label}
        </Text>
      </Pressable>
    );
  };

  return (
    <View>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
        {renderTypeButton('cpf', 'CPF')}
        {renderTypeButton('cnpj', 'CNPJ')}
      </View>

      <TextInput
        value={value}
        onChangeText={handleInputChange}
        placeholder={placeholder}
        editable={!disabled}
        keyboardType="numeric"
        placeholderTextColor={colors.textTertiary}
        maxLength={documentType === 'cpf' ? 14 : 18}
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.borderLight,
          borderWidth: 1,
          borderRadius: 12,
          color: colors.text,
          paddingHorizontal: 14,
          paddingVertical: 12,
          fontSize: 15,
        }}
      />

      {showHint ? (
        <Text style={{ color: colors.textTertiary, fontSize: 12, marginTop: 8 }}>
          O campo é limpo ao alterar o tipo de documento.
        </Text>
      ) : null}
    </View>
  );
}
