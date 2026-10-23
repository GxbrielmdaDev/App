export const formatCurrency = (value) => `R$ ${Number(value || 0).toFixed(2)}`;

export const formatDateTime = (value) => {
  if (value === null || value === undefined || value === '') return '';

  const normalized = String(value).replace(/(\.\d{3})\d+/, '$1');
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return String(value);

  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

// Formata CPF: XXX.XXX.XXX-XX
export const formatCPF = (value) => {
  const cleaned = String(value || '').replace(/\D/g, '').substring(0, 11);
  return cleaned
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{2})$/, '$1-$2');
};

// Formata CNPJ: NN.NNN.NNN/NNNN-NN
export const formatCNPJ = (value) => {
  const cleaned = String(value || '').replace(/\D/g, '').substring(0, 14);
  return cleaned
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{2})$/, '$1-$2');
};

export const onlyDigits = (value) => String(value || '').replace(/\D/g, '');

export const parseNumber = (value) => {
  if (value === null || value === undefined || value === '') return 0;
  const parsed = Number(String(value).replace(',', '.'));
  return Number.isNaN(parsed) ? 0 : parsed;
};
