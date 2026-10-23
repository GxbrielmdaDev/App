import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import AppHeader from '../components/AppHeader';
import PickerField from '../components/PickerField';
import {
  AlertMessage,
  AppModal,
  AppTextInput,
  EmptyState,
  FormField,
  IconButton,
  Panel,
  PrimaryButton,
  SecondaryButton,
} from '../components/FormComponents';
import { useTheme } from '../contexts/ThemeContext';
import { createSale, listClients, listProducts, listSales } from '../services/api';
import { formatCurrency, formatDateTime, parseNumber } from '../utils/format';

export default function Sales() {
  const { colors } = useTheme();
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [clients, setClients] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [quantity, setQuantity] = useState('1');
  const [formError, setFormError] = useState('');
  const [screenError, setScreenError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [salesData, productsData, clientsData] = await Promise.all([
        listSales(),
        listProducts(),
        listClients(),
      ]);
      setSales(salesData);
      setProducts(productsData);
      setClients(clientsData);
      setScreenError('');
    } catch (err) {
      setScreenError(err.message);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      await loadData();
      setLoading(false);
    };
    load();
  }, [loadData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const quantityNumber = parseNumber(quantity);

  const productById = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products]
  );
  const clientById = useMemo(
    () => new Map(clients.map((client) => [client.id, client])),
    [clients]
  );

  const totals = useMemo(() => {
    const salePrice = selectedProduct ? Number(selectedProduct.valor_venda) : 0;
    const costPrice = selectedProduct ? Number(selectedProduct.valor_compra) : 0;
    return {
      total: salePrice * quantityNumber,
      profit: (salePrice - costPrice) * quantityNumber,
    };
  }, [selectedProduct, quantityNumber]);

  const openModal = () => {
    setSelectedProduct(null);
    setSelectedClient(null);
    setQuantity('1');
    setFormError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (submitting) return;
    setIsModalOpen(false);
  };

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    if (product) {
      const stock = Number(product.quantidade || 0);
      if (quantityNumber > stock) {
        setQuantity(String(Math.max(1, stock)));
      }
    }
  };

  const changeQuantity = (delta) => {
    const stock = selectedProduct ? Number(selectedProduct.quantidade || 0) : Infinity;
    const next = Math.max(1, Math.min(quantityNumber + delta, stock));
    setQuantity(String(next));
  };

  const handleQuantityChange = (text) => {
    setQuantity(text.replace(/[^0-9]/g, ''));
  };

  const handleSubmit = async () => {
    setFormError('');

    if (!selectedProduct || !selectedClient) {
      setFormError('Escolha produto e cliente.');
      return;
    }
    if (!quantityNumber || quantityNumber < 1) {
      setFormError('Informe uma quantidade válida.');
      return;
    }
    if (quantityNumber > Number(selectedProduct.quantidade || 0)) {
      setFormError('Produto não disponível em estoque para essa quantidade.');
      return;
    }

    setSubmitting(true);
    try {
      await createSale({
        produto_id: selectedProduct.id,
        cliente_id: selectedClient.id,
        quantidade: quantityNumber,
        valor_total: Number(totals.total.toFixed(2)),
        lucro: Number(totals.profit.toFixed(2)),
      });
      setSuccess('Venda registrada com sucesso.');
      setIsModalOpen(false);
      await loadData();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const renderSale = (sale) => {
    const productName =
      sale.produto?.nome || productById.get(sale.produto_id)?.nome || `Produto #${sale.produto_id}`;
    const clientName =
      sale.cliente?.nome || clientById.get(sale.cliente_id)?.nome || `Cliente #${sale.cliente_id}`;

    return (
      <View
        key={sale.id}
        style={{
          backgroundColor: colors.surfaceAlt,
          borderRadius: 18,
          borderWidth: 1,
          borderColor: colors.border,
          padding: 16,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
          <Text style={{ color: colors.text, fontSize: 15.5, fontWeight: '700', flex: 1 }}>
            {productName}
          </Text>
          <Text style={{ color: colors.text, fontSize: 15, fontWeight: '700' }}>
            {formatCurrency(sale.valor_total)}
          </Text>
        </View>

        <Text style={{ color: colors.textTertiary, fontSize: 12.5, marginTop: 2 }}>
          {clientName} · {sale.quantidade} un
        </Text>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, gap: 10 }}>
          <Text style={{ color: colors.success, fontSize: 13, fontWeight: '600' }}>
            Lucro: {formatCurrency(sale.lucro)}
          </Text>
          <Text style={{ color: colors.textTertiary, fontSize: 12.5 }}>
            {formatDateTime(sale.data)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <AppHeader
        title="Vendas"
        subtitle="Registro de vendas e histórico financeiro"
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
        <PrimaryButton title="Registrar nova venda" icon="cart-outline" onPress={openModal} />

        <AlertMessage message={success} type="success" onClose={() => setSuccess('')} style={{ marginTop: 0 }} />
        <AlertMessage message={screenError} type="error" onClose={() => setScreenError('')} style={{ marginTop: 0 }} />

        <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600', marginTop: 4 }}>
          Histórico de vendas
        </Text>

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ paddingVertical: 32 }} />
        ) : sales.length === 0 ? (
          <Panel>
            <EmptyState icon="cart-outline" message="Nenhuma venda registrada." />
          </Panel>
        ) : (
          <View style={{ gap: 12 }}>{sales.map(renderSale)}</View>
        )}
      </ScrollView>

      <AppModal
        visible={isModalOpen}
        onClose={closeModal}
        title="Registrar nova venda"
        subtitle="Selecione o produto, o cliente e a quantidade."
      >
        <FormField label="Produto" required>
          <PickerField
            value={selectedProduct}
            placeholder="Selecione um produto"
            title="Selecionar produto"
            options={products}
            onSelect={handleSelectProduct}
            getDescription={(product) =>
              `${product.categoria} · Estoque: ${product.quantidade} un`
            }
            emptyMessage="Nenhum produto cadastrado."
          />
        </FormField>

        <FormField label="Cliente" required>
          <PickerField
            value={selectedClient}
            placeholder="Selecione um cliente"
            title="Selecionar cliente"
            options={clients}
            onSelect={setSelectedClient}
            getDescription={(client) => `${client.cpf_cnpj} · ${client.cidade} - ${client.estado}`}
            emptyMessage="Nenhum cliente cadastrado."
          />
        </FormField>

        <FormField label="Quantidade" required>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <IconButton icon="remove" onPress={() => changeQuantity(-1)} />
            <AppTextInput
              value={quantity}
              onChangeText={handleQuantityChange}
              keyboardType="number-pad"
              style={{ flex: 1, textAlign: 'center' }}
            />
            <IconButton icon="add" onPress={() => changeQuantity(1)} />
          </View>
          {selectedProduct ? (
            <Text style={{ color: colors.textTertiary, fontSize: 12, marginTop: 8 }}>
              Estoque disponível: {selectedProduct.quantidade} un
            </Text>
          ) : null}
        </FormField>

        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: colors.border,
            padding: 14,
            gap: 12,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: colors.textSecondary, fontSize: 14 }}>Valor total</Text>
            <Text style={{ color: colors.text, fontSize: 14, fontWeight: '700' }}>
              {formatCurrency(totals.total)}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: colors.textSecondary, fontSize: 14 }}>Lucro estimado</Text>
            <Text style={{ color: colors.success, fontSize: 14, fontWeight: '700' }}>
              {formatCurrency(totals.profit)}
            </Text>
          </View>
        </View>

        <AlertMessage message={formError} type="error" />

        <PrimaryButton
          title="Registrar venda"
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
