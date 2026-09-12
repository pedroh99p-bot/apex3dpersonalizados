import assert from 'node:assert/strict';
import { suite } from './browser-helpers.js';
await suite('smoke', 4174, async ({ page, run, open, total, origin }) => {
  await run('Apex local, logo íntegra, metadados e ausência de marca/moeda herdadas', async () => {
    assert.match(await page.title(), /Apex3D/);
    assert.doesNotMatch(await page.locator('body').innerText(), /mifunko|funko|€|EUR/i);
    assert.equal(await page.locator('html').getAttribute('lang'), 'pt-BR');
    assert.equal(await page.locator('link[href^="https"],script[src^="https"],img[src^="https"]').count(), 0);
    assert.ok(await page.locator('.site-header img').evaluate(img => img.complete && img.naturalWidth === 1536));
    assert.equal((await fetch(origin + '/legacy-template')).status, 404);
    assert.equal((await fetch(origin + '/.git/config')).status, 404);
    const response = await fetch(origin);
    assert.match(response.headers.get('content-security-policy'), /connect-src 'none'/);
  });
  for (const [product, price] of [['individual',10000],['pet',10000],['casal',20000],['familia',30000]]) {
    await run('Oferta e seleção de produto: ' + product, async () => {
      await page.locator('[data-choose-product="' + product + '"]').click();
      await total(price); assert.equal(await page.locator('[data-product="' + product + '"]').getAttribute('aria-pressed'), 'true');
      assert.match(await page.locator('#summary-total').innerText(), /R\$/);
    });
  }
  for (const width of [1440,1024,768,430,390,360]) {
    await run('Landing e configurador responsivos em ' + width + 'px', async () => {
      await page.setViewportSize({ width, height: 1000 }); await open();
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Overflow horizontal');
      for (const selector of ['.site-header','.hero','#product-cards','#configurator','.order-summary']) {
        const box = await page.locator(selector).boundingBox();
        assert.ok(box.x >= 0 && box.x + box.width <= width + 1, selector);
      }
      await page.screenshot({ path: 'test-results/apex-landing-' + width + '.png', fullPage: true });
      await page.locator('#personalize').scrollIntoViewIfNeeded();
      await page.screenshot({ path: 'test-results/apex-config-' + width + '.png' });
    });
  }
  await run('Navegação por teclado e FAQ nativos', async () => {
    await page.locator('.faq summary').first().focus(); await page.keyboard.press('Enter');
    assert.equal(await page.locator('.faq details').first().evaluate(n => n.open), true);
    await page.locator('.site-header a[href="#personalize"]').first().focus();
    await page.keyboard.press('Enter'); assert.match(page.url(), /#personalize/);
  });
});
