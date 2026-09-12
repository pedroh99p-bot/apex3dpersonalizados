import { pricing as p, specialObjectCategories } from '../config/pricing.js';
import { products } from '../config/products.js';

export const formatMoney = cents => new Intl.NumberFormat(p.locale, { style: 'currency', currency: p.currency }).format(cents / 100);
const value = (map, key) => {
  if (!Object.hasOwn(map, key)) throw new Error('Opção de preço desconhecida.');
  return map[key];
};
export function expectedFigureCount(state) {
  const product = value(products, state.product), extra = state.customizations.additionalPeople;
  if (!Number.isInteger(extra) || extra < 0 || extra > p.maxAdditionalPeople || (product.kind === 'pet' && extra)) throw new Error('Quantidade de pessoas adicionais inválida.');
  return product.figures + extra;
}
export function calculatePrice(state) {
  const product = value(products, state.product), c = state.customizations;
  if (!Number.isSafeInteger(state.quantity) || state.quantity < 1) throw new Error('Quantidade inválida.');
  if (c.figures.length !== expectedFigureCount(state)) throw new Error('Quantidade de pessoas incompatível.');
  const lines = [];
  const add = (code, label, cents) => {
    if (!Number.isSafeInteger(cents) || cents < 0) throw new Error('Preço indisponível.');
    if (cents || code === 'base') lines.push({ code, label, cents });
  };
  add('base', product.label, value(p.base, state.product));
  add('size', 'Tamanho', value(product.kind === 'pet' ? p.petSize : p.humanSize, state.size) * (c.figures.length || 1));
  add('people', 'Pessoa adicional', c.additionalPeople * p.additionalPerson);
  const accessories = product.kind === 'pet' ? [c.pet] : c.figures;
  c.figures.forEach(f => {
    value(p.eyes, f.eyes); value(p.mouth, f.mouth);
    if (typeof f.glasses !== 'boolean') throw new Error('Referência inválida.');
  });
  if (product.kind === 'pet') value(p.petEyes, c.pet.eyes);
  accessories.forEach((f, i) => {
    for (const [key, cents, label] of [['accessories', p.accessory, 'Acessório simples'], ['logos', p.logo, 'Acessório detalhado']]) {
      if (!Number.isInteger(f[key]) || f[key] < 0 || f[key] > p.maxAccessories) throw new Error('Quantidade de acessórios inválida.');
      add('accessory:' + i + ':' + key, label + (product.kind === 'pet' ? ' · pet' : ' · pessoa ' + (i + 1)), f[key] * cents);
    }
    if (new Set(f.specialAccessories).size !== f.specialAccessories.length) throw new Error('Objeto duplicado.');
    for (const id of f.specialAccessories) add('object:' + i + ':' + id, specialObjectCategories[id]?.label || 'Objeto', value(p.specialAccessories, id));
  });
  add('pets', 'Pet adicional', value(p.additionalPets, c.pets.length));
  c.pets.forEach(pet => value(p.additionalPetSize, pet.size));
  add('minis', 'Mini', value(p.minis, c.minis.quantity));
  value(p.miniSize, c.minis.size);
  const baseLabels = { 'base-com-nome': 'Nome na base', 'base-com-nome-data': 'Nome + data na base' };
  for (const extra of c.extras) add(extra, baseLabels[extra], value(p.extras, extra));
  add('box', 'Caixa personalizada', value(value(p.box, c.box.type), state.size));
  value(p.shipping, state.shipping.option);
  if (state.gift.enabled) throw new Error('Caneca ainda sem preço aprovado.');
  const unitTotalCents = lines.reduce((sum, line) => sum + line.cents, 0);
  const mainTotalCents = unitTotalCents * state.quantity;
  if (!Number.isSafeInteger(mainTotalCents)) throw new Error('Total fora do limite numérico.');
  return { currency: p.currency, status: p.status, lines, unitTotalCents, mainTotalCents, giftTotalCents: 0, totalCents: mainTotalCents, freightCents: null, finalCheckout: false };
}
