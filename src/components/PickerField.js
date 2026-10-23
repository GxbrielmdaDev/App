import { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { AppModal, AppTextInput } from './FormComponents';

export default function PickerField({
  value,
  placeholder,
  options = [],
  onSelect,
  getLabel = (item) => String(item?.nome ?? ''),
  getDescription,
  title,
  emptyMessage = 'Nenhuma opção disponível.',
}) {
  const { colors } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const openModal = () => {
    setSearch('');
    setIsOpen(true);
  };

  const closeModal = () => setIsOpen(false);

  const filteredOptions = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return options;
    return options.filter((item) => {
      const label = getLabel(item).toLowerCase();
      const description = getDescription ? String(getDescription(item) || '').toLowerCase() : '';
      return label.includes(term) || description.includes(term);
    });
  }, [search, options, getLabel, getDescription]);

  const handleSelect = (item) => {
    onSelect(item);
    closeModal();
  };

  return (
    <>
      <Pressable
        onPress={openModal}
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.borderLight,
          borderWidth: 1,
          borderRadius: 12,
          paddingHorizontal: 14,
          paddingVertical: 12,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
        }}
      >
        <Text
          numberOfLines={1}
          style={{ color: value ? colors.text : colors.textTertiary, fontSize: 15, flex: 1 }}
        >
          {value ? getLabel(value) : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.textTertiary} />
      </Pressable>

      <AppModal
        visible={isOpen}
        onClose={closeModal}
        title={title || placeholder}
        subtitle="Busque e selecione uma opção."
        scrollable={false}
      >
        <AppTextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar..."
          autoCorrect={false}
          autoFocus
        />

        <FlatList
          data={filteredOptions}
          keyExtractor={(item) => String(item.id)}
          keyboardShouldPersistTaps="handled"
          style={{ marginTop: 12, maxHeight: 360 }}
          ItemSeparatorComponent={() => (
            <View style={{ height: 1, backgroundColor: colors.border }} />
          )}
          ListHeaderComponent={
            value ? (
              <View>
                <Pressable
                  onPress={() => handleSelect(null)}
                  style={({ pressed }) => ({
                    paddingVertical: 12,
                    paddingHorizontal: 6,
                    backgroundColor: pressed ? colors.surfaceHover : 'transparent',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                  })}
                >
                  <Ionicons name="close-circle-outline" size={18} color={colors.textTertiary} />
                  <Text style={{ color: colors.textTertiary, fontSize: 14 }}>Limpar seleção</Text>
                </Pressable>
                <View style={{ height: 1, backgroundColor: colors.border }} />
              </View>
            ) : null
          }
          renderItem={({ item }) => {
            const selected = value?.id === item.id;
            const description = getDescription ? getDescription(item) : null;
            return (
              <Pressable
                onPress={() => handleSelect(item)}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  paddingVertical: 13,
                  paddingHorizontal: 6,
                  backgroundColor: pressed ? colors.surfaceHover : 'transparent',
                })}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text, fontSize: 15, fontWeight: selected ? '700' : '400' }}>
                    {getLabel(item)}
                  </Text>
                  {description ? (
                    <Text style={{ color: colors.textTertiary, fontSize: 12.5, marginTop: 2 }}>
                      {description}
                    </Text>
                  ) : null}
                </View>
                {selected ? <Ionicons name="checkmark-circle" size={20} color={colors.primaryLight} /> : null}
              </Pressable>
            );
          }}
          ListEmptyComponent={
            <View style={{ paddingVertical: 22, alignItems: 'center' }}>
              <Text style={{ color: colors.textTertiary, fontSize: 14 }}>{emptyMessage}</Text>
            </View>
          }
        />
      </AppModal>
    </>
  );
}
