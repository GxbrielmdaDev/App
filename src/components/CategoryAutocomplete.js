import { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { AppModal, AppTextInput } from './FormComponents';

export default function CategoryAutocomplete({ value, onChange, categories = [] }) {
  const { colors } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const openModal = () => {
    setSearch(value || '');
    setIsOpen(true);
  };

  const closeModal = () => setIsOpen(false);

  const filteredCategories = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return categories;
    return categories.filter((category) => category.toLowerCase().includes(term));
  }, [search, categories]);

  const trimmedSearch = search.trim();
  const showNewCategoryOption =
    trimmedSearch.length > 0 &&
    !categories.some((category) => category.toLowerCase() === trimmedSearch.toLowerCase());

  const handleSelect = (category) => {
    onChange(category);
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
          {value || 'Selecione ou digite uma categoria'}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.textTertiary} />
      </Pressable>

      <AppModal
        visible={isOpen}
        onClose={closeModal}
        title="Categoria"
        subtitle="Selecione uma categoria existente ou digite para criar uma nova."
        scrollable={false}
      >
        <AppTextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Digite para buscar ou criar"
          autoFocus
          autoCorrect={false}
        />

        <FlatList
          data={filteredCategories}
          keyExtractor={(item) => item}
          keyboardShouldPersistTaps="handled"
          style={{ marginTop: 12, maxHeight: 320 }}
          ItemSeparatorComponent={() => (
            <View style={{ height: 1, backgroundColor: colors.border }} />
          )}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => handleSelect(item)}
              style={({ pressed }) => ({
                paddingVertical: 14,
                paddingHorizontal: 6,
                backgroundColor: pressed ? colors.surfaceHover : 'transparent',
              })}
            >
              <Text style={{ color: colors.text, fontSize: 15 }}>{item}</Text>
            </Pressable>
          )}
          ListHeaderComponent={
            showNewCategoryOption ? (
              <Pressable
                onPress={() => handleSelect(trimmedSearch)}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  paddingVertical: 14,
                  paddingHorizontal: 6,
                  backgroundColor: pressed ? colors.surfaceHover : 'transparent',
                })}
              >
                <Ionicons name="add-circle-outline" size={20} color={colors.primaryLight} />
                <Text style={{ color: colors.text, fontSize: 15, flex: 1 }}>
                  Adicionar nova categoria: <Text style={{ fontWeight: '700' }}>{trimmedSearch}</Text>
                </Text>
              </Pressable>
            ) : null
          }
          ListEmptyComponent={
            !showNewCategoryOption ? (
              <View style={{ paddingVertical: 22, alignItems: 'center' }}>
                <Text style={{ color: colors.textTertiary, fontSize: 14, textAlign: 'center' }}>
                  {categories.length === 0
                    ? 'Digite uma categoria para adicionar a primeira.'
                    : 'Nenhuma categoria encontrada.'}
                </Text>
              </View>
            ) : null
          }
        />
      </AppModal>
    </>
  );
}
