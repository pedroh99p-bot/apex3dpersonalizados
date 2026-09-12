import test from 'node:test';
import assert from 'node:assert/strict';
import { createOrderState, createFigure } from '../js/state.js';
import { calculatePrice, formatMoney } from '../js/pricing.js';
import { UploadStore } from '../js/uploads.js';
import { pricing } from '../config/pricing.js';
for (const [product, expected] of [['individual',10000],['pet',10000],['casal',20000],['familia',30000]]) {
  test('oferta BRL: ' + product, () => {
    const price = calculatePrice(createOrderState(product));
    assert.equal(price.totalCents, expected); assert.equal(price.currency, 'BRL');
    assert.match(formatMoney(expected), /R\$/); assert.equal(price.freightCents, null);
  });
}
test('pessoas adicionais preservam contagem e preço por pessoa', () => {
  const state = createOrderState('familia'); state.customizations.additionalPeople = 2;
  state.customizations.figures.push(createFigure(3), createFigure(4));
  assert.equal(calculatePrice(state).totalCents, 50000);
  state.customizations.figures.pop(); assert.throws(() => calculatePrice(state));
  const pet = createOrderState('pet'); pet.customizations.additionalPeople = 1; assert.throws(() => calculatePrice(pet));
});
test('cada upsell usa a tabela central em centavos', () => {
  const cases = [
    [s => s.customizations.pets.push({ type: 'Cão', size: 4, fields: {} }), 7900],
    [s => s.customizations.figures[0].accessories = 1, 1500],
    [s => s.customizations.figures[0].logos = 1, 2000],
    [s => s.customizations.extras = ['base-com-nome'], 1900],
    [s => s.customizations.extras = ['base-com-nome-data'], 2900],
    [s => s.customizations.box.type = 'caja_personalizada', 3900],
    [s => s.customizations.figures[0].specialAccessories = ['detalhado'], 2000],
  ];
  for (const [set, delta] of cases) { const s = createOrderState(); set(s); assert.equal(calculatePrice(s).totalCents, 10000 + delta); }
});
test('combinação de adicionais, quantidade e total sem floats', () => {
  const s = createOrderState(); const c = s.customizations;
  c.additionalPeople = 1; c.figures.push(createFigure(1));
  c.pets = [{ type: 'Cão', size: 4, fields: {} }];
  c.figures[0].accessories = 1; c.figures[0].logos = 1; c.figures[0].specialAccessories = ['detalhado'];
  c.extras = ['base-com-nome-data']; c.box.type = 'caja_personalizada';
  assert.equal(calculatePrice(s).totalCents, 40200);
  s.quantity = 2; assert.equal(calculatePrice(s).totalCents, 80400);
  assert.equal(pricing.status, 'estimate');
});
test('opções fora da tabela provisória e valores arbitrários são rejeitados', () => {
  for (const change of [
    s => s.quantity = -1, s => s.quantity = 1.5, s => s.size = 25,
    s => s.gift.enabled = true, s => s.customizations.minis.quantity = 1,
    s => s.customizations.figures[0].specialAccessories = ['inventado'],
    s => s.customizations.figures[0].accessories = -1,
    s => s.shipping.option = 'envio_express',
  ]) { const s = createOrderState(); change(s); assert.throws(() => calculatePrice(s)); }
  const s = createOrderState(); s.price = 1; assert.equal(calculatePrice(s).totalCents, 10000);
});
const png = new Uint8Array([137,80,78,71,13,10,26,10]);
test('quatro tamanhos cobram por miniatura, incluindo pessoas adicionais', () => {
  for (const [size, unit] of [[6,10000],[10,15000],[15,17000],[20,20000]]) {
    for (const [product, count] of [['individual',1],['pet',1],['casal',2],['familia',3]]) {
      const state = createOrderState(product); state.size = size;
      assert.equal(calculatePrice(state).totalCents, unit * count);
      state.customizations.box.type = 'caja_personalizada';
      assert.equal(calculatePrice(state).totalCents, unit * count + 3900);
      if (product !== 'pet') {
        state.customizations.additionalPeople = 1;
        state.customizations.figures.push(createFigure(count));
        assert.equal(calculatePrice(state).totalCents, unit * (count + 1) + 3900);
      }
    }
  }
});
test('upload: MIME, assinatura, bytes, homônimos, substituição e remoção', async () => {
  const store = new UploadStore({ maxBytes: 8, mimeTypes: ['image/png'], maxFilesPerField: 2 });
  const owner = { itemId: 'main-1', field: 'figure-1.face' };
  const good = new File([png], 'mesmo.png', { type: 'image/png' });
  await store.add(owner, [good, good], { multiple: true });
  assert.equal(store.list().length, 2); assert.notEqual(store.list()[0].id, store.list()[1].id);
  await assert.rejects(store.add(owner, [good], { multiple: true }), /Limite/);
  await assert.rejects(store.add(owner, [new File([png, 'x'], 'grande.png', { type: 'image/png' })]), /MB/);
  await assert.rejects(store.add(owner, [new File(['html'], 'falso.png', { type: 'image/png' })]), /conteúdo/);
  await assert.rejects(store.add(owner, [new File(['x'], 'x.svg', { type: 'image/svg+xml' })]), /Tipo/);
  assert.equal(store.list().length, 2);
  store.remove(store.list()[0].id); assert.equal(store.list().length, 1);
  await store.add(owner, [good]); assert.equal(store.list().length, 1);
  assert.equal(store.metadata()[0].file, undefined); store.clear(); assert.equal(store.list().length, 0);
});
test('upload pendente é cancelado em troca de composição', async () => {
  const store = new UploadStore(), file = new File([png], 'referencia.png', { type: 'image/png' });
  const pending = store.add({ itemId: 'main-1', field: 'foto' }, [file]);
  store.cancelPending(); await pending; assert.equal(store.list().length, 0);
});
