import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from 'react-native';
import AppHeader from '../components/AppHeader';
import { AlertMessage, Panel, StatCard } from '../components/FormComponents';
import { ProfitLossChart, ProductsByCategoryChart } from '../components/Charts';
import { useTheme } from '../contexts/ThemeContext';
import {
  getProductsByCategory,
  getProfitLossData,
  listClients,
  listProducts,
  listSales,
} from '../services/api';
import { formatCurrency } from '../utils/format';

export default function Dashboard() {
  const { colors } = useTheme();
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [clients, setClients] = useState([]);
  const [profitLossData, setProfitLossData] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [productsData, salesData, clientsData, profitData, categoryProductsData] =
        await Promise.all([
          listProducts(),
          listSales(),
          listClients(),
          getProfitLossData(),
          getProductsByCategory(),
        ]);

      setProducts(productsData);
      setSales(salesData);
      setClients(clientsData);
      setProfitLossData(profitData);
      setCategoryData(categoryProductsData);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      await loadData();
    };
    load();
  }, [loadData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const totalStock = products.reduce((sum, product) => sum + Number(product.quantidade || 0), 0);
  const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.valor_total || 0), 0);
  const totalProfit = sales.reduce((sum, sale) => sum + Number(sale.lucro || 0), 0);

  const summaryRow = (label, value, bold = false) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
      <Text style={{ color: colors.text, fontSize: 14.5, flex: 1 }}>{label}</Text>
      <Text
        style={{
          color: colors.text,
          fontSize: 14.5,
          fontWeight: bold ? '700' : '400',
        }}
      >
        {value}
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <AppHeader title="Dashboard" subtitle="Atlas Control · Gestão de Estoque" onRefresh={loadData} />

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 16 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          <StatCard label="Produtos cadastrados" value={products.length} />
          <StatCard label="Quantidade em estoque" value={totalStock} />
          <StatCard label="Vendas realizadas" value={sales.length} />
          <StatCard label="Lucro total" value={formatCurrency(totalProfit)} />
        </View>

        <Panel
          title="Resumo de operações"
          subtitle="Acompanhe o inventário, vendas e clientes cadastrados no mesmo lugar."
        >
          <View style={{ gap: 14 }}>
            {summaryRow('Total de clientes', clients.length)}
            {summaryRow('Receita total', formatCurrency(totalRevenue), true)}
            {summaryRow(
              'Média de lucro por venda',
              formatCurrency(sales.length ? totalProfit / sales.length : 0),
              true
            )}
          </View>
        </Panel>

        <Panel
          title="Lucro vs Prejuízo"
          subtitle="Análise visual do desempenho financeiro total do sistema."
        >
          {loading ? (
            <ActivityIndicator color={colors.primary} style={{ paddingVertical: 24 }} />
          ) : (
            <ProfitLossChart data={profitLossData} />
          )}
        </Panel>

        <Panel
          title="Produtos por Categoria"
          subtitle="Distribuição de produtos cadastrados por categoria."
        >
          {loading ? (
            <ActivityIndicator color={colors.primary} style={{ paddingVertical: 24 }} />
          ) : (
            <ProductsByCategoryChart data={categoryData} />
          )}
        </Panel>

        <AlertMessage message={error} type="error" onClose={() => setError('')} />
      </ScrollView>
    </View>
  );
}
