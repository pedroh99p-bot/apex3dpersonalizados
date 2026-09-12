import test from 'node:test';
import assert from 'node:assert/strict';
import { createOrderState, createFigure } from '../js/state.js';
import { UploadStore } from '../js/uploads.js';
import { calculatePrice } from '../js/pricing.js';
import { validateOrderForProduction, createOrderDraft, safeOrderSummary } from '../js/order.js';
import { validateDesiredDate } from '../js/date.js';
const now = new Date(2030, 4, 10, 12), options = { now };
const codes = state => validateOrderForProduction(state, options).errors.map(e => e.code);
const file = () => new File([new Uint8Array([137,80,78,71,13,10,26,10])], 'fixture.png', { type: 'image/png' });
async function complete(t, product = 'individual') {
  const state = createOrderState(product), store = new UploadStore(); t.after(() => store.clear());
  state.shipping.date = '2030-05-10';
  for (const f of state.customizations.figures) await store.add({ itemId: 'main-1', field: f.id + '.mf_face_photo_upload[]' }, [file()]);
  if (product === 'pet') {
    state.customizations.pet.fields.mf_pet_type = 'cao';
    await store.add({ itemId: 'main-1', field: 'mf_pet_photo[]' }, [file()]);
  }
  state.uploads = store.metadata(); return { state, store };
}
test('quatro produtos geram draft BRL validado sem características manuais', async t => {
  for (const [type, expected] of [['individual',10000],['pet',10000],['casal',20000],['familia',30000]]) {
    const { state } = await complete(t, type), result = createOrderDraft(state, options);
    assert.equal(result.valid, true, JSON.stringify(result.errors));
    assert.equal(result.orderDraft.pricing.totalCents, expected); assert.equal(result.orderDraft.pricing.currency, 'BRL');
    assert.equal(result.orderDraft.productionValidation, 'passed'); assert.equal(result.orderDraft.productionReady, false); assert.equal(result.orderDraft.pricing.status, 'estimate'); assert.equal(result.orderDraft.shipping.date, '2030-05-10');
    assert.equal(result.orderDraft.customer, null);
  }
});
test('foto principal obrigatória bloqueia draft com erro estruturado', async t => {
  const { state } = await complete(t); state.uploads = [];
  const result = createOrderDraft(state, options);
  assert.equal(result.orderDraft, null); assert.equal(result.valid, false);
  assert.ok(result.errors.some(e => e.field === 'figure-1.mf_face_photo_upload[]' && e.code === 'PHOTO_REQUIRED' && e.message));
});
test('roupa e pose personalizadas exigem descrição, referência não exige', async t => {
  const { state } = await complete(t), figure = state.customizations.figures[0];
  for (const key of ['outfit', 'pose']) {
    figure[key] = { mode: 'custom', description: '' }; assert.ok(codes(state).includes('PERSONALIZATION_DETAIL'));
    figure[key].description = 'Referência sintética'; assert.equal(codes(state).length, 0);
  }
  figure.referenceMode = 'manual'; assert.ok(codes(state).includes('REFERENCE_REQUIRED'));
});
test('produto, tamanho e quantidade de pessoas precisam ser coerentes', async t => {
  const { state } = await complete(t); state.product = ''; state.size = null;
  assert.ok(codes(state).includes('PRODUCT_REQUIRED')); assert.ok(codes(state).includes('SIZE_REQUIRED'));
  state.product = 'casal'; assert.ok(codes(state).includes('FIGURE_COUNT'));
});
test('pessoa adicional exige sua própria foto', async t => {
  const { state, store } = await complete(t); state.customizations.additionalPeople = 1; state.customizations.figures.push(createFigure(1));
  assert.ok(codes(state).includes('PHOTO_REQUIRED'));
  await store.add({ itemId: 'main-1', field: 'figure-2.mf_face_photo_upload[]' }, [file()]); state.uploads = store.metadata();
  assert.equal(createOrderDraft(state, options).orderDraft.pricing.totalCents, 20000);
});
test('datas passadas/inexistentes rejeitadas, hoje e fim de semana aceitos', async t => {
  const { state } = await complete(t);
  for (const [date, code] of [['', 'DATE_REQUIRED'], ['2030-05-09', 'DATE_PAST'], ['2030-02-30', 'DATE_INVALID']]) {
    state.shipping.date = date; assert.ok(codes(state).includes(code));
  }
  assert.equal(validateDesiredDate('2030-05-11', options), null); assert.equal(validateDesiredDate('2030-05-10', options), null);
  assert.equal(validateDesiredDate('2030-05-10', { now, rule: { required: true, minLeadDays: 2, excludedWeekdays: [] } }).code, 'DATE_UNAVAILABLE');
});
test('bytes, MIME e metadados inventados não passam', async t => {
  const { state } = await complete(t); state.uploads[0].size = 10_000_001; assert.ok(codes(state).includes('UPLOAD_INVALID'));
  state.uploads[0].size = 8; state.uploads[0].type = 'text/html'; assert.ok(codes(state).includes('UPLOAD_INVALID'));
  state.uploads[0].type = 'image/png'; state.uploads[0].id = 'inventado'; assert.ok(codes(state).includes('UPLOAD_INVALID'));
});
test('foto de uma pessoa não substitui a da outra', async t => {
  const { state } = await complete(t, 'casal'); state.uploads.pop();
  const forged = structuredClone(state.uploads[0]); forged.owner.field = 'figure-2.mf_face_photo_upload[]'; state.uploads.push(forged);
  assert.ok(codes(state).includes('PHOTO_REQUIRED')); assert.ok(codes(state).includes('UPLOAD_INVALID')); assert.ok(codes(state).includes('UPLOAD_DUPLICATE'));
});
test('recibo removido e owner inativo bloqueiam o pedido', async t => {
  const { state, store } = await complete(t);
  await store.add({ itemId: 'main-1', field: 'mf_pet_1_photo[]' }, [file()]); state.uploads = store.metadata();
  assert.ok(codes(state).includes('UPLOAD_OWNER'));
  store.remove(state.uploads[0].id); assert.ok(codes(state).includes('UPLOAD_INVALID'));
});
test('preço divergente ou opção desconhecida bloqueia produção', async t => {
  const { state } = await complete(t); state.pricing = calculatePrice(state); state.pricing.totalCents = 1;
  assert.ok(codes(state).includes('PRICE_STALE'));
  state.pricing = null; state.customizations.figures[0].eyes = 'inexistente'; assert.ok(codes(state).includes('PRICE_INVALID'));
});
test('base, data da base, caixa e acessórios exigem detalhes', async t => {
  const { state } = await complete(t), c = state.customizations;
  c.box.type = 'caja_personalizada'; c.figures[0].accessories = 1; c.figures[0].specialAccessories = ['simples']; c.extras = ['base-com-nome-data'];
  for (const code of ['BOX_DETAIL','ACCESSORY_DETAIL','OBJECT_DETAIL','BASE_TEXT_REQUIRED','BASE_DATE_REQUIRED']) assert.ok(codes(state).includes(code));
  c.box.fields.mf_box_character_name = 'Apex'; c.fields.mf_extra_text_data = 'Nome'; c.fields.baseDate = '2020-01-01';
  c.figures[0].fields.mf_accessory_detail_1 = 'Livro'; c.figures[0].fields.object_simples = 'Bola';
  assert.equal(codes(state).length, 0);
});
test('pets adicionais exigem tipo e fotos próprias', async t => {
  const { state, store } = await complete(t); state.customizations.pets = [{ type: '', size: 4, fields: {} }];
  assert.ok(codes(state).includes('PET_CONFIGURATION')); assert.ok(codes(state).includes('PHOTO_REQUIRED'));
  state.customizations.pets[0].type = 'Cão'; await store.add({ itemId: 'main-1', field: 'mf_pet_1_photo[]' }, [file()]);
  state.uploads = store.metadata(); assert.equal(codes(state).length, 0);
});
test('estado malformado retorna erros e inspeção omite dados pessoais', async t => {
  for (const state of [null, {}, { customizations: [] }]) assert.equal(validateOrderForProduction(state).valid, false);
  const { state } = await complete(t); state.notes = 'nota-sintetica';
  const draft = createOrderDraft(state, options).orderDraft;
  assert.doesNotMatch(JSON.stringify(safeOrderSummary(draft)), /nota-sintetica|fixture\.png|base64|previewUrl/);
});
