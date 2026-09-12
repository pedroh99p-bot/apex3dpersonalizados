import { commercialRules } from './commercial.js';
const baseUnit = commercialRules.unitSizeCents[6];
// Simulação V0.6: valores provisórios; homologar antes de cobrar/produzir.
export const specialObjectCategories = Object.freeze({
  simples: { label: 'Objeto simples', cents: 1500 },
  detalhado: { label: 'Objeto detalhado', cents: 2000 },
});
export const pricing = Object.freeze({
  currency: 'BRL', locale: 'pt-BR', status: 'estimate',
  base: { individual: baseUnit, pet: baseUnit, casal: baseUnit * 2, familia: baseUnit * 3 },
  additionalPerson: baseUnit, maxAdditionalPeople: 3,
  humanSize: Object.fromEntries(Object.entries(commercialRules.unitSizeCents).map(([cm, cents]) => [cm, cents - baseUnit])),
  petSize: Object.fromEntries(Object.entries(commercialRules.unitSizeCents).map(([cm, cents]) => [cm, cents - baseUnit])),
  eyes: { ojos_standard: 0 }, mouth: { sin_boca: 0 }, glasses: 0,
  petEyes: { estandar: 0 },
  additionalPets: { 0: 0, 1: 7900, 2: 15800, 3: 23700 },
  additionalPetSize: { 4: 0 },
  accessory: 1500, logo: 2000, maxAccessories: 5,
  specialAccessories: Object.fromEntries(Object.entries(specialObjectCategories).map(([id, c]) => [id, c.cents])),
  extras: { 'base-com-nome': 1900, 'base-com-nome-data': 2900 },
  // Arquitetura preservada, opções sem preço aprovado indisponíveis nesta prévia.
  minis: { 0: 0 }, miniSize: { 4: 0 },
  // Caixas maiores: placeholder de R$39, sem garantia de compatibilidade física.
  box: { caja_standard: { 6: 0, 10: 0, 15: 0, 20: 0 }, caja_personalizada: { 6: 3900, 10: 3900, 15: 3900, 20: 3900 } },
  dedication: 0, shipping: { envio_estandard: 0 }, gift: null,
});
