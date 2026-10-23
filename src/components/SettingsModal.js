import { useEffect, useState } from 'react';
import { Platform, Text, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import {
  DEFAULT_API_URL,
  DEFAULT_REPORT_URL,
  loadSettings,
  saveSettings,
} from '../services/api';
import {
  AlertMessage,
  AppModal,
  AppTextInput,
  FormField,
  PrimaryButton,
  SecondaryButton,
} from './FormComponents';

export default function SettingsModal({ isOpen, onClose, onSaved }) {
  const { colors } = useTheme();
  const [apiUrl, setApiUrl] = useState(DEFAULT_API_URL);
  const [reportUrl, setReportUrl] = useState(DEFAULT_REPORT_URL);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    let active = true;

    loadSettings().then((loaded) => {
      if (!active) return;
      setApiUrl(loaded.apiUrl);
      setReportUrl(loaded.reportUrl);
      setError('');
    });

    return () => {
      active = false;
    };
  }, [isOpen]);

  const handleSave = async () => {
    if (!apiUrl.trim()) {
      setError('Informe o endereço da API.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await saveSettings({ apiUrl, reportUrl });
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      setError(err?.message || 'Não foi possível salvar as configurações.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setApiUrl(DEFAULT_API_URL);
    setReportUrl(DEFAULT_REPORT_URL);
    setError('');
  };

  return (
    <AppModal
      visible={isOpen}
      onClose={onClose}
      title="Configurações"
      subtitle="Endereços dos serviços usados pelo aplicativo."
    >
      <FormField label="URL da API (backend FastAPI)">
        <AppTextInput
          value={apiUrl}
          onChangeText={setApiUrl}
          placeholder={DEFAULT_API_URL}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
        />
      </FormField>

      <FormField label="URL do serviço de relatórios (.NET)">
        <AppTextInput
          value={reportUrl}
          onChangeText={setReportUrl}
          placeholder={DEFAULT_REPORT_URL}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
        />
      </FormField>

      <AlertMessage message={error} type="error" />

      <PrimaryButton
        title="Salvar configurações"
        icon="save-outline"
        onPress={handleSave}
        loading={saving}
        style={{ marginTop: 16 }}
      />

      <SecondaryButton
        title="Restaurar padrão"
        icon="refresh-outline"
        onPress={handleReset}
        disabled={saving}
        style={{ marginTop: 10 }}
      />

      <View style={{ height: 4 }} />
    </AppModal>
  );
}
