import { fetch } from 'expo/fetch';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { loadSettings, resolveBaseUrl } from './api';

const REPORT_TIMEOUT = 60000;

const downloadReportFile = async (section) => {
  const { reportUrl } = await loadSettings();
  const baseUrl = resolveBaseUrl(reportUrl);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REPORT_TIMEOUT);

  let response;
  try {
    response = await fetch(`${baseUrl}/api/relatorios/gerar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secao: section }),
      signal: controller.signal,
    });
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new Error('Tempo esgotado ao gerar o relatório. Verifique o serviço de relatórios.');
    }
    throw new Error(`Não foi possível conectar ao serviço de relatórios em ${baseUrl}.`);
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new Error(`Erro HTTP ${response.status} ao gerar o relatório.`);
  }

  const bytes = await response.bytes();
  const date = new Date().toISOString().split('T')[0];
  const file = new File(Paths.cache, `relatorio_${section}_${date}.pdf`);

  if (file.exists) {
    file.delete();
  }
  await file.write(bytes);

  return file;
};

export const downloadAndOpenReport = async (section) => {
  const file = await downloadReportFile(section);

  let canPreview = false;
  try {
    canPreview = await File.canPreview(file);
  } catch {
    canPreview = false;
  }

  if (canPreview) {
    await File.preview(file, { title: `Relatório de ${section}` });
    return;
  }

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, {
      mimeType: 'application/pdf',
      dialogTitle: `Relatório de ${section}`,
      UTI: 'com.adobe.pdf',
    });
    return;
  }

  throw new Error('Nenhum aplicativo disponível para abrir o PDF.');
};
