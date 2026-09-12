import { calculatePrice } from './pricing.js';
import { giftProduct } from '../config/products.js';
import { validateOrderForProduction } from './validation.js';
export { validateOrderForProduction } from './validation.js';

export function createOrderDraft(state, options) {
  const validation = validateOrderForProduction(state, options);
  if (!validation.valid) return { ...validation, orderDraft: null };
  const orderDraft = { ...buildOrder(state), id: crypto.randomUUID(), productionValidation: 'passed', productionReady: false, createdAt: new Date().toISOString() };
  return { valid: true, errors: [], orderDraft };
}

export function validateOrder(state) {
  const errors = [];
  try { calculatePrice(state); } catch (error) { errors.push(error.message); }
  if (state.gift.enabled && state.gift.imageSource === 'upload' && !state.uploads.some(u => u.owner.itemId === 'gift-1')) errors.push('Adicione a imagem da caneca ou escolha o esboço.');
  if (state.customizations.fields.mf_special_other || state.customizations.figures.some(f => f.fields.mf_special_other) || state.customizations.pet.fields.mf_special_other) errors.push('O acessório “Outro” precisa de orçamento; preço ainda não aprovado na oferta.');
  const ownerIds = new Set(['main-1', 'gift-1']);
  for (const upload of state.uploads) if (!ownerIds.has(upload.owner.itemId) || !upload.owner.field) errors.push('Imagem sem associação válida.');
  return errors;
}
export function buildOrder(state) {
  const errors = validateOrder(state);
  if (errors.length) throw new Error(errors.join(' '));
  const price = calculatePrice(state);
  const uploads = state.uploads.filter(u => u.owner.itemId !== 'gift-1' || (state.gift.enabled && state.gift.imageSource === 'upload'));
  const items = [{ id: 'main-1', productId: state.product, quantity: state.quantity, sizeCm: state.size,
    customizations: structuredClone(state.customizations), uploads: uploads.filter(u => u.owner.itemId === 'main-1').map(u => u.id),
    pricing: { unitCents: price.unitTotalCents, totalCents: price.mainTotalCents } }];
  if (state.gift.enabled) items.push({ id: 'gift-1', productId: giftProduct.id, quantity: 1,
    customizations: { imageSource: state.gift.imageSource, sourceItemId: state.gift.imageSource === 'sketch' ? 'main-1' : null, text: state.gift.text },
    uploads: uploads.filter(u => u.owner.itemId === 'gift-1').map(u => u.id), pricing: { unitCents: price.giftTotalCents, totalCents: price.giftTotalCents } });
  return { schemaVersion: 2, mode: 'homologation', status: 'draft', customer: null, items,
    uploads: structuredClone(uploads), pricing: price, shipping: { ...state.shipping }, notes: state.notes };
}
// Representação permitida para inspeção: sem nomes de arquivos, textos livres ou dados pessoais.
export function safeOrderSummary(order) {
  return { schemaVersion: order.schemaVersion, mode: order.mode, status: order.status, productionValidation: order.productionValidation, productionReady: order.productionReady, customer: null,
    items: order.items.map(item => ({ id: item.id, productId: item.productId, quantity: item.quantity, sizeCm: item.sizeCm,
      uploadIds: item.uploads, pricing: item.pricing })),
    uploads: order.uploads.map(u => ({ id: u.id, owner: u.owner, type: u.type, size: u.size })),
    pricing: order.pricing, hasNotes: Boolean(order.notes) };
}
