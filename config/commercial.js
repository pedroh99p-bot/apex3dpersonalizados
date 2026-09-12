export const sizes = Object.freeze([
  { cm: 6, label: 'Compacta', description: 'Pequena no tamanho. Cheia de personalidade.' },
  { cm: 10, label: 'Em destaque', description: 'Um equilíbrio entre presença e delicadeza.' },
  { cm: 15, label: 'Mais presença', description: 'Mais espaço para apreciar os detalhes.' },
  { cm: 20, label: 'Grande formato', description: 'Para ocupar um lugar especial.' },
]);
export const commercialRules = Object.freeze({
  pricesAreEstimates: true, priceLabel: 'Estimativa de teste',
  // Provisional user-supplied unit prices, not a production-approved quote.
  unitSizeCents: { 6: 10000, 10: 15000, 15: 17000, 20: 20000 },
});
