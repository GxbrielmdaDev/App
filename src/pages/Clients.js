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
import CPFCNPJInput from '../components/CPFCNPJInput';
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
import { createClient, deleteClient, listClients, updateClient } from '../services/api';

const emptyForm = {
  nome: '',
  cpf_cnpj: '',
  cidade: '',
  estado: '',
};

export default function Clients() {
  const { colors } = useTheme();
  const [clients, setClients] = useState([]);
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

  const loadClients = useCallback(async () => {
    try {
      const data = await listClients();
      setClients(data);
      setScreenError('');
    } catch (err) {
      setScreenError(err.message);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      await loadClients();
      setLoading(false);
    };
    load();
  }, [loadClients]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadClients();
    setRefreshing(false);
  };

  const filteredClients = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return clients;
    return clients.filter(
      (client) =>
        String(client.nome || '').toLowerCase().includes(term) ||
        String(client.cpf_cnpj || '').toLowerCase().includes(term)
    );
  }, [clients, search]);

  const openCreate = () => {
    setEditingId(null);
    setFormValues(emptyForm);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEdit = (client) => {
    setEditingId(client.id);
    setFormValues({
      nome: client.nome,
      cpf_cnpj: client.cpf_cnpj,
      cidade: client.cidade,
      estado: client.estado,
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

    if (
      !formValues.nome.trim() ||
      !formValues.cpf_cnpj.trim() ||
      !formValues.cidade.trim() ||
      !formValues.estado.trim()
    ) {
      setFormError('Preencha todos os campos obrigatórios.');
      return;
    }

    const clientData = {
      nome: formValues.nome.trim(),
      cpf_cnpj: formValues.cpf_cnpj.trim(),
      cidade: formValues.cidade.trim(),
      estado: formValues.estado.trim().toUpperCase(),
    };

    setSubmitting(true);
    try {
      if (editingId) {
        await updateClient(editingId, clientData);
        setSuccess('Cliente atualizado com sucesso.');
      } else {
        await createClient(clientData);
        setSuccess('Cliente cadastrado com sucesso.');
      }
      setFormValues(emptyForm);
      setEditingId(null);
      setIsModalOpen(false);
      await loadClients();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (client) => {
    Alert.alert(
      'Excluir cliente',
      `Deseja realmente excluir "${client.nome}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteClient(client.id);
              setSuccess('Cliente excluído com sucesso.');
              await loadClients();
            } catch (err) {
              setScreenError(err.message);
            }
          },
        },
      ]
    );
  };

  const renderClient = (client) => (
    <View
      key={client.id}
      style={{
        backgroundColor: colors.surfaceAlt,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 16,
      }}
    >
      <Text style={{ color: colors.text, fontSize: 15.5, fontWeight: '700' }}>{client.nome}</Text>
      <Text style={{ color: colors.textTertiary, fontSize: 12.5, marginTop: 2 }}>
        {client.cpf_cnpj}
      </Text>

      <View style={{ flexDirection: 'row', gap: 8, marginTop: 10, alignItems: 'center' }}>
        <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
          {client.cidade} - {client.estado}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
        <SecondaryButton
          title="Editar"
          icon="create-outline"
          compact
          onPress={() => openEdit(client)}
          style={{ flex: 1 }}
        />
        <SecondaryButton
          title="Excluir"
          icon="trash-outline"
          compact
          destructive
          onPress={() => handleDelete(client)}
          style={{ flex: 1 }}
        />
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <AppHeader
        title="Clientes"
        subtitle="Controle de clientes e histórico de cadastros"
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
            placeholder="Buscar por nome ou CPF/CNPJ"
            autoCorrect={false}
            style={{ flex: 1 }}
          />
          <PrimaryButton title="Novo" icon="add" compact onPress={openCreate} />
        </View>

        <AlertMessage message={success} type="success" onClose={() => setSuccess('')} style={{ marginTop: 0 }} />
        <AlertMessage message={screenError} type="error" onClose={() => setScreenError('')} style={{ marginTop: 0 }} />

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ paddingVertical: 32 }} />
        ) : filteredClients.length === 0 ? (
          <Panel>
            <EmptyState
              icon="people-outline"
              message={search ? 'Nenhum cliente encontrado.' : 'Nenhum cliente cadastrado.'}
            />
          </Panel>
        ) : (
          <View style={{ gap: 12 }}>{filteredClients.map(renderClient)}</View>
        )}
      </ScrollView>

      <AppModal
        visible={isModalOpen}
        onClose={closeModal}
        title={editingId ? 'Editar cliente' : 'Novo cliente'}
        subtitle={editingId ? 'Atualize as informações do cliente.' : 'Preencha os dados do novo cliente.'}
      >
        <FormField label="Nome" required>
          <AppTextInput
            value={formValues.nome}
            onChangeText={(text) => setFormValues({ ...formValues, nome: text })}
            placeholder="Nome completo ou razão social"
          />
        </FormField>

        <FormField label="CPF/CNPJ" required>
          <CPFCNPJInput
            value={formValues.cpf_cnpj}
            onChange={(cpf_cnpj) => setFormValues({ ...formValues, cpf_cnpj })}
          />
        </FormField>

        <FormField label="Cidade" required>
          <AppTextInput
            value={formValues.cidade}
            onChangeText={(text) => setFormValues({ ...formValues, cidade: text })}
            placeholder="Ex.: São Paulo"
          />
        </FormField>

        <FormField label="Estado" required>
          <AppTextInput
            value={formValues.estado}
            onChangeText={(text) => setFormValues({ ...formValues, estado: text })}
            placeholder="Ex.: SP"
            autoCapitalize="characters"
            maxLength={2}
          />
        </FormField>

        <AlertMessage message={formError} type="error" />

        <PrimaryButton
          title={editingId ? 'Salvar alterações' : 'Cadastrar cliente'}
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
