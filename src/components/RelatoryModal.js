import { useState } from 'react';
import { Alert, View } from 'react-native';
import { AppModal, PrimaryButton, SecondaryButton } from './FormComponents';
import { downloadAndOpenReport } from '../services/reports';

const sections = [
  { name: 'Produtos', value: 'produtos' },
  { name: 'Clientes', value: 'clientes' },
  { name: 'Vendas', value: 'vendas' },
];

export default function RelatoryModal({ isOpen, onClose }) {
  const [loadingSection, setLoadingSection] = useState(null);

  const handleDownload = async (section) => {
    setLoadingSection(section);
    try {
      await downloadAndOpenReport(section);
      onClose();
    } catch (error) {
      Alert.alert('Erro ao gerar relatório', error.message);
    } finally {
      setLoadingSection(null);
    }
  };

  return (
    <AppModal
      visible={isOpen}
      onClose={loadingSection ? () => {} : onClose}
      title="Relatórios"
      subtitle="De qual seção você deseja imprimir o relatório? Clique em uma das opções para baixar o PDF."
    >
      <View style={{ gap: 10 }}>
        {sections.map((section) => (
          <PrimaryButton
            key={section.value}
            title={section.name}
            icon="document-text-outline"
            onPress={() => handleDownload(section.value)}
            loading={loadingSection === section.value}
            disabled={Boolean(loadingSection) && loadingSection !== section.value}
          />
        ))}
      </View>

      <SecondaryButton
        title="Cancelar"
        onPress={onClose}
        disabled={Boolean(loadingSection)}
        style={{ marginTop: 10 }}
      />

      <View style={{ height: 4 }} />
    </AppModal>
  );
}
