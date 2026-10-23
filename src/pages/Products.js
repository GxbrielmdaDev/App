import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import AppHeader from '../components/AppHeader';
import CategoryAutocomplete from '../components/CategoryAutocomplete';
import {
  AlertMessage,
  AppModal,
  AppTextInput,
  EmptyState,
  FormField,
  Panel,
  PrimaryButton,
  SecondaryButton,
} from '../components/FormComponents';
import { useTheme } from '../contexts/ThemeContext';
import {
  createProduct,
  deleteProduct,
  getCategories,
  listProducts,
  updateProduct,
} from '../services/api';
import { formatCurrency, parseNumber } from '../utils/format';

const emptyForm = {
  nome: '',
  categoria: '',
  quantidade: '',
  valor_venda: '',
  valor_compra: '',
  descricao: '',
};

export default function Products() {
  const { colors } = useTheme();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formValues, setFormValues] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState('');
  const [screenError, setScreenError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadProducts = useCallback(async () => {
    try {
      const data = await listProducts();
      setProducts(data);
      setScreenError('');
    } catch (err) {
      setScreenError(err.message);
    }
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      const cats = await getCategories();
      setCategories(cats);
    } catch (err) {
      console.warn('Erro ao carregar categorias:', err.message);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      await Promise.all([loadProducts(), loadCategories()]);
      setLoading(false);
    };
    load();
  }, [loadProducts, loadCategories]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadProducts(), loadCategories()]);
    setRefreshing(false);
  };

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return products;
    return products.filter(
      (product) =>
        String(product.nome || '').toLowerCase().includes(term) ||
        String(product.categoria || '').toLowerCase().includes(term)
    );
  }, [products, search]);

  const openCreate = () => {
    setEditingId(null);
    setFormValues(emptyForm);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEdit = (product) => {
    setEditingId(product.id);
    setFormValues({
      nome: product.nome,
      categoria: product.categoria,
      quantidade: String(product.quantidade ?? ''),
      valor_venda: String(product.valor_venda ?? ''),
      valor_compra: String(product.valor_compra ?? ''),
      descricao: product.descricao || '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (submitting) return;
    setIsModalOpen(false);
  };

  const handleSubmit = async () => {
    setFormError('');

    if (!formValues.nome.trim() || !formValues.categoria.trim()) {
      setFormError('Preencha o nome e a categoria do produto.');
      return;
    }
    if (
      formValues.quantidade === '' ||
      formValues.valor_venda === '' ||
      formValues.valor_compra === ''
    ) {
      setFormError('Preencha quantidade, valor de venda e valor de compra.');
      return;
    }

    const productData = {
      nome: formValues.nome.trim(),
      categoria: formValues.categoria.trim(),
      quantidade: Math.round(parseNumber(formValues.quantidade)),
      valor_venda: parseNumber(formValues.valor_venda),
      valor_compra: parseNumber(formValues.valor_compra),
      descricao: formValues.descricao.trim(),
    };

    setSubmitting(true);
    try {
      if (editingId) {
        await updateProduct(editingId, productData);
        setSuccess('Produto editado com sucesso.');
      } else {
        await createProduct(productData);
        setSuccess('Produto cadastrado com sucesso.');
      }
      setFormValues(emptyForm);
      setEditingId(null);
      setIsModalOpen(false);
      await Promise.all([loadProducts(), loadCategories()]);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (product) => {
    Alert.alert(
      'Excluir produto',
      `Deseja realmente excluir "${product.nome}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProduct(product.id);
              setSuccess('Produto excluído com sucesso.');
              await Promise.all([loadProducts(), loadCategories()]);
            } catch (err) {
              setScreenError(err.message);
            }
          },
        },
      ]
    );
  };

  const renderProduct = (product) => {
    const quantity = Number(product.quantidade || 0);
    const badgeColor =
      quantity === 0 ? colors.error : quantity <= 5 ? colors.warning : colors.textSecondary;

    return (
      <View
        key={product.id}
        style={{
          backgroundColor: colors.surfaceAlt,
          borderRadius: 18,
          borderWidth: 1,
          borderColor: colors.border,
          padding: 16,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text, fontSize: 15.5, fontWeight: '700' }}>
              {product.nome}
            </Text>
            <Text style={{ color: colors.textTertiary, fontSize: 12.5, marginTop: 2 }}>
              {product.categoria}
            </Text>
          </View>
          <View
            style={{
              borderWidth: 1,
              borderColor: badgeColor,
              borderRadius: 999,
              paddingHorizontal: 10,
              paddingVertical: 4,
            }}
          >
            <Text style={{ color: badgeColor, fontSize: 12, fontWeight: '700' }}>
              {quantity} un
            </Text>
          </View>
        </View>

        {product.descricao ? (
          <Text
            numberOfLines={2}
            style={{ color: colors.textTertiary, fontSize: 12.5, marginTop: 8 }}
          >
            {product.descricao}
          </Text>
        ) : null}

        <View style={{ flexDirection: 'row', gap: 16, marginTop: 12 }}>
          <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
            Venda: <Text style={{ color: colors.text, fontWeight: '700' }}>{formatCurrency(product.valor_venda)}</Text>
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
            Compra: <Text style={{ color: colors.text, fontWeight: '700' }}>{formatCurrency(product.valor_compra)}</Text>
          </Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
          <SecondaryButton
            title="Editar"
            icon="create-outline"
            compact
            onPress={() => openEdit(product)}
            style={{ flex: 1 }}
          />
          <SecondaryButton
            title="Excluir"
            icon="trash-outline"
            compact
            destructive
            onPress={() => handleDelete(product)}
            style={{ flex: 1 }}
          />
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <AppHeader
        title="Produtos"
        subtitle="Cadastro e gerenciamento de peças no estoque"
        onRefresh={handleRefresh}
      />

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 14 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
          <AppTextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar por nome ou categoria"
            autoCorrect={false}
            style={{ flex: 1 }}
          />
          <PrimaryButton title="Novo" icon="add" compact onPress={openCreate} />
        </View>

        <AlertMessage message={success} type="success" onClose={() => setSuccess('')} style={{ marginTop: 0 }} />
        <AlertMessage message={screenError} type="error" onClose={() => setScreenError('')} style={{ marginTop: 0 }} />

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ paddingVertical: 32 }} />
        ) : filteredProducts.length === 0 ? (
          <Panel>
            <EmptyState
              icon="cube-outline"
              message={search ? 'Nenhum produto encontrado.' : 'Nenhum produto cadastrado.'}
            />
          </Panel>
        ) : (
          <View style={{ gap: 12 }}>{filteredProducts.map(renderProduct)}</View>
        )}
      </ScrollView>

      <AppModal
        visible={isModalOpen}
        onClose={closeModal}
        title={editingId ? 'Editar produto' : 'Novo produto'}
        subtitle={editingId ? 'Atualize as informações do produto.' : 'Preencha os dados do novo produto.'}
      >
        <FormField label="Nome" required>
          <AppTextInput
            value={formValues.nome}
            onChangeText={(text) => setFormValues({ ...formValues, nome: text })}
            placeholder="Ex.: Filtro de óleo"
          />
        </FormField>

        <FormField label="Categoria" required>
          <CategoryAutocomplete
            value={formValues.categoria}
            onChange={(categoria) => setFormValues({ ...formValues, categoria })}
            categories={categories}
          />
        </FormField>

        <FormField label="Quantidade" required>
          <AppTextInput
            value={formValues.quantidade}
            onChangeText={(text) =>
              setFormValues({ ...formValues, quantidade: text.replace(/[^0-9]/g, '') })
            }
            placeholder="0"
            keyboardType="number-pad"
          />
        </FormField>

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <FormField label="Valor de venda" required>
              <AppTextInput
                value={formValues.valor_venda}
                onChangeText={(text) =>
                  setFormValues({ ...formValues, valor_venda: text.replace(/[^0-9.,]/g, '') })
                }
                placeholder="0.00"
                keyboardType="decimal-pad"
              />
            </FormField>
          </View>
          <View style={{ flex: 1 }}>
            <FormField label="Valor de compra" required>
              <AppTextInput
                value={formValues.valor_compra}
                onChangeText={(text) =>
                  setFormValues({ ...formValues, valor_compra: text.replace(/[^0-9.,]/g, '') })
                }
                placeholder="0.00"
                keyboardType="decimal-pad"
              />
            </FormField>
          </View>
        </View>

        <FormField label="Descrição">
          <AppTextInput
            value={formValues.descricao}
            onChangeText={(text) => setFormValues({ ...formValues, descricao: text })}
            placeholder="Detalhes opcionais do produto"
            multiline
          />
        </FormField>

        <AlertMessage message={formError} type="error" />

        <PrimaryButton
          title={editingId ? 'Salvar alterações' : 'Cadastrar produto'}
          icon="checkmark"
          onPress={handleSubmit}
          loading={submitting}
          style={{ marginTop: 14 }}
        />
        <SecondaryButton title="Cancelar" onPress={closeModal} disabled={submitting} style={{ marginTop: 10 }} />
        <View style={{ height: 4 }} />
      </AppModal>
    </View>
  );
}
