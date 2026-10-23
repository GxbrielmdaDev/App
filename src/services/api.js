import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export const DEFAULT_API_URL = 'https://atlas-control-xzn0.onrender.com'; // backend hospedado no Render (utilizado para o desenvolvimento)
export const DEFAULT_REPORT_URL = 'http://suaapiaqui.com';

const API_URL_KEY = 'atlas-control:api-url';
const REPORT_URL_KEY = 'atlas-control:report-url';


const REQUEST_TIMEOUT = 60000;

let settings = {
  apiUrl: DEFAULT_API_URL,
  reportUrl: DEFAULT_REPORT_URL,
  loaded: false,
};

export const normalizeBaseUrl = (url) => {
  let value = (url || '').trim().replace(/\/+$/, '');
  if (value && !/^https?:\/\//i.test(value)) {
    value = `http://${value}`;
  }
  return value;
};

export const isValidHttpUrl = (value) => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

export const resolveBaseUrl = (url) => {
  const normalized = normalizeBaseUrl(url);
  if (Platform.OS === 'android') {
    return normalized
      .replace('://localhost', '://10.0.2.2')
      .replace('://127.0.0.1', '://10.0.2.2');
  }
  return normalized;
};

export async function loadSettings() {
  if (settings.loaded) return settings;

  try {
    const [apiUrl, reportUrl] = await Promise.all([
      AsyncStorage.getItem(API_URL_KEY),
      AsyncStorage.getItem(REPORT_URL_KEY),
    ]);
    settings = {
      apiUrl: apiUrl || DEFAULT_API_URL,
      reportUrl: reportUrl || DEFAULT_REPORT_URL,
      loaded: true,
    };
  } catch {
    settings = { ...settings, loaded: true };
  }

  return settings;
}

export function getSettings() {
  return settings;
}

export async function saveSettings({ apiUrl, reportUrl }) {
  const nextApiUrl = normalizeBaseUrl(apiUrl) || DEFAULT_API_URL;
  const nextReportUrl = normalizeBaseUrl(reportUrl) || DEFAULT_REPORT_URL;

  if (!isValidHttpUrl(nextApiUrl)) {
    throw new Error(`Endereço inválido para a API: "${String(apiUrl || '').trim()}".`);
  }
  if (!isValidHttpUrl(nextReportUrl)) {
    throw new Error(
      `Endereço inválido para o serviço de relatórios: "${String(reportUrl || '').trim()}".`
    );
  }

  settings = {
    apiUrl: nextApiUrl,
    reportUrl: nextReportUrl,
    loaded: true,
  };

  await Promise.all([
    AsyncStorage.setItem(API_URL_KEY, nextApiUrl),
    AsyncStorage.setItem(REPORT_URL_KEY, nextReportUrl),
  ]);

  return settings;
}

export async function resetSettings() {
  settings = {
    apiUrl: DEFAULT_API_URL,
    reportUrl: DEFAULT_REPORT_URL,
    loaded: true,
  };

  try {
    await AsyncStorage.multiRemove([API_URL_KEY, REPORT_URL_KEY]);
  } catch {
  }

  return settings;
}

const extractErrorMessage = (data, status) => {
  const detail = data?.detail;

  if (Array.isArray(detail)) {
    return detail.map((item) => item?.msg || JSON.stringify(item)).join('\n');
  }
  if (typeof detail === 'string' && detail) {
    return detail;
  }
  return `Erro HTTP ${status}`;
};

const formatError = (path, expected) =>
  new Error(
    `A resposta de "${path}" não veio no formato esperado (${expected}). Confira a URL da API nas configurações.`
  );

const request = async (path, options = {}) => {
  const { expect, ...fetchOptions } = options;

  const { apiUrl } = await loadSettings();
  const baseUrl = resolveBaseUrl(apiUrl);

  const headers = { ...(fetchOptions.headers || {}) };
  if (fetchOptions.body) {
    headers['Content-Type'] = 'application/json';
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  let response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      ...fetchOptions,
      headers,
      signal: controller.signal,
    });
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new Error(
        'Tempo de conexão esgotado. O servidor pode estar iniciando (cold start) ou fora do ar.'
      );
    }
    throw new Error(`Não foi possível conectar à API em ${baseUrl}. Verifique o endereço nas configurações.`);
  } finally {
    clearTimeout(timeout);
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    // resposta sem JSON
  }

  if (!response.ok) {
    throw new Error(extractErrorMessage(data, response.status));
  }

  if (expect === 'array' && !Array.isArray(data)) {
    throw formatError(path, 'lista');
  }
  if (expect === 'object' && (data === null || typeof data !== 'object' || Array.isArray(data))) {
    throw formatError(path, 'objeto');
  }

  return data;
};

// Produtos
export const listProducts = () => request('/products/', { expect: 'array' });
export const createProduct = (product) =>
  request('/products/', { method: 'POST', body: JSON.stringify(product) });
export const updateProduct = (id, product) =>
  request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(product) });
export const deleteProduct = (id) =>
  request(`/products/${id}`, { method: 'DELETE' });
export const getCategories = () => request('/products/categories/list', { expect: 'array' });

// Clientes
export const listClients = () => request('/clients/', { expect: 'array' });
export const createClient = (client) =>
  request('/clients/', { method: 'POST', body: JSON.stringify(client) });
export const updateClient = (id, client) =>
  request(`/clients/${id}`, { method: 'PUT', body: JSON.stringify(client) });
export const deleteClient = (id) =>
  request(`/clients/${id}`, { method: 'DELETE' });

// Vendas
export const listSales = () => request('/sales/', { expect: 'array' });
export const createSale = (sale) =>
  request('/sales/', { method: 'POST', body: JSON.stringify(sale) });

// Analytics
export const getProfitLossData = () =>
  request('/sales/analytics/profit-loss', { expect: 'object' });
export const getProductsByCategory = () =>
  request('/sales/analytics/products-by-category', { expect: 'array' });
