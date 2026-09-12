import assert from 'node:assert/strict';
import { suite } from './browser-helpers.js';
await suite('mvp-smoke', 4175, async ({ page, run, open, field, inspect, total, upload, fixture, complete, review, generate, extras, go }) => {
  await run('Configuração incompleta bloqueia revisão e permite focar o erro', async () => {
    await go('review'); await page.locator('.review-button').click();
    assert.equal(await page.locator('#order-review').evaluate(n => n.open), false);
    assert.equal(await page.evaluate(() => window.apexDevelopment.inspectDraft()), null);
    await page.locator('#validation-errors button').first().click();
    assert.equal(await page.evaluate(() => document.activeElement.type), 'file');
  });
  for (const product of ['individual','pet','casal','familia']) {
    await run('Fluxo válido até orderDraft em BRL: ' + product, async () => {
      await complete(product); await review();
      assert.match(await page.locator('#review-content').innerText(), /R\$/);
      assert.doesNotMatch(await page.locator('#review-content').innerText(), /mf_|€|schemaVersion/);
      assert.equal(await page.evaluate(() => window.apexDevelopment.inspectDraft()), null);
      await generate();
      assert.match(await page.locator('#order-confirmation').innerText(), /Nenhum pedido foi enviado/);
    });
  }
  await run('Data passada bloqueia; hoje não acrescenta urgência', async () => {
    await complete(); await field('mf_shipping_date').fill('2000-01-01');
    await go('review'); await page.locator('.review-button').click(); assert.match(await page.locator('#validation-errors').innerText(), /passado/);
    await total(10000);
    await field('mf_shipping_date').fill(await page.locator('#needed-date').getAttribute('min'));
    assert.equal((await page.evaluate(() => window.apexDevelopment.validate())).valid, true);
  });
  await run('Roupa e pose personalizadas exigem descrição e aceitam foto opcional', async () => {
    await field('figure-1.outfit').selectOption('custom'); await field('figure-1.pose').selectOption('custom');
    await go('review'); await page.locator('.review-button').click(); assert.match(await page.locator('#validation-errors').innerText(), /roupa personalizada/);
    await field('figure-1.outfit.description').fill('Jaqueta vermelha'); await field('figure-1.pose.description').fill('Segurando um livro');
    await upload('figure-1.mf_outfit_photo_upload[]'); await review();
    assert.match(await page.locator('#review-content').innerText(), /Jaqueta vermelha/);
    await page.getByRole('button', { name: 'Editar criação', exact: true }).click();
    await field('figure-1.outfit').selectOption('reference');
    assert.equal((await inspect()).uploads.length, 1);
  });
  await run('Seleção inválida bloqueia sem perder foto válida; descarte recupera', async () => {
    await field('figure-1.mf_face_photo_upload[]').setInputFiles({ name: 'x.svg', mimeType: 'image/svg+xml', buffer: Buffer.from('<svg/>') });
    await page.getByRole('button', { name: 'Descartar seleção inválida' }).waitFor();
    assert.equal((await inspect()).uploads.length, 1);
    await go('review'); await page.locator('.review-button').click(); assert.match(await page.locator('#validation-errors').innerText(), /Tipo inválido/);
    await go('photos'); await page.getByRole('button', { name: 'Descartar seleção inválida' }).click();
    assert.equal((await page.evaluate(() => window.apexDevelopment.validate())).valid, true);
  });
  await run('PNG danificado rejeitado pelo decodificador real', async () => {
    await field('figure-1.mf_face_photo_upload[]').setInputFiles({ name: 'x.png', mimeType: 'image/png', buffer: fixture.subarray(0, 16) });
    await page.getByRole('button', { name: 'Descartar seleção inválida' }).waitFor();
    assert.match(await page.locator('.file-error').innerText(), /danificada/);
    await page.getByRole('button', { name: 'Descartar seleção inválida' }).click();
  });
  await run('Homônimos têm recibos próprios, remoção não afeta outras fotos', async () => {
    await upload('figure-1.mf_face_photo_upload[]');
    const images = (await inspect()).uploads; assert.equal(images.length, 2); assert.notEqual(images[0].id, images[1].id);
    await page.getByRole('button', { name: 'Remover foto de Fotos da pessoa 1', exact: true }).first().click();
    assert.equal((await inspect()).uploads.length, 1);
  });
  await run('Combinação: pessoa, pet, acessórios, objeto, base e caixa', async () => {
    await complete(); await extras();
    await field('figures').selectOption('1'); await upload('figure-2.mf_face_photo_upload[]');
    await field('mf_pets_option').selectOption('1'); await field('mf_pet_1_type').selectOption('Cão'); await upload('mf_pet_1_photo[]');
    await field('figure-1.accessories').selectOption('1'); await field('figure-1.mf_accessory_detail_1').fill('Livro');
    await field('figure-1.logos').selectOption('1'); await field('figure-1.mf_logo_detail_1').fill('Capacete detalhado');
    await page.getByLabel('Objeto detalhado · +R$').first().check();
    await field('figure-1.object_detalhado').fill('Instrumento musical');
    await field('mf_extra_option[]').selectOption('base-com-nome-data'); await field('mf_extra_text_data').fill('Ana'); await field('baseDate').fill('2020-01-01');
    await field('mf_box_option').selectOption('caja_personalizada'); await field('mf_box_character_name').fill('Memórias');
    await total(40200); await review(); await generate();
    const result = await page.evaluate(() => window.apexDevelopment.inspectDraft());
    assert.equal(result.pricing.totalCents, 40200); assert.equal(result.uploads.length, 3);
    assert.deepEqual(result.uploads.map(u => u.owner.field), ['figure-1.mf_face_photo_upload[]','figure-2.mf_face_photo_upload[]','mf_pet_1_photo[]']);
  });
  for (const width of [1440,1024,768,430,390,360]) {
    await run('Upsells e revisão responsivos em ' + width + 'px', async () => {
      if (await page.locator('#order-confirmation').evaluate(n => n.open)) await page.locator('#close-confirmation').click();
      await page.setViewportSize({ width, height: 1000 });
      await extras(); await page.locator('#upsells').scrollIntoViewIfNeeded();
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await page.screenshot({ path: 'test-results/apex-upsells-' + width + '.png' });
      await review();
      assert.ok(await page.locator('#order-review').evaluate(n => n.scrollWidth <= n.clientWidth));
      assert.equal(await page.evaluate(() => document.activeElement.id), 'review-title');
      await page.screenshot({ path: 'test-results/apex-review-' + width + '.png' });
      await page.keyboard.press('Escape');
    });
  }
  await run('Remover adicionais limpa fotos incompatíveis e invalida draft', async () => {
    await field('figures').selectOption('0'); await field('mf_pets_option').selectOption('0');
    assert.equal((await inspect()).uploads.length, 1); assert.equal(await page.evaluate(() => window.apexDevelopment.inspectDraft()), null);
  });
  await run('Trocar produto limpa configuração, data, notas e todos os anexos', async () => {
    await field('notes').fill('Uma observação');
    await go('product'); await page.locator('[data-product="pet"]').click();
    assert.equal((await inspect()).uploads.length, 0); await total(10000);
    assert.equal(await page.locator('#notes').inputValue(), ''); assert.equal(await page.locator('#needed-date').inputValue(), '');
  });
  await run('Alteração durante revisão bloqueia geração até revisar novamente', async () => {
    await complete(); await review();
    await page.evaluate(() => {
      const notes = document.querySelector('#notes'); notes.value = 'Mudou';
      notes.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await page.getByRole('button', { name: 'Gerar pedido de teste', exact: true }).click();
    assert.match(await page.locator('#validation-errors').innerText(), /configuração mudou/);
    assert.equal(await page.evaluate(() => window.apexDevelopment.inspectDraft()), null);
  });
  await run('Conteúdo do usuário permanece texto na revisão', async () => {
    await field('notes').fill('<img src=x onerror=alert(1)>');
    await review(); assert.equal(await page.locator('#review-content img[src=x]').count(), 0);
    assert.match(await page.locator('#review-content').innerText(), /<img src=x/);
    await page.keyboard.press('Escape');
  });
});
