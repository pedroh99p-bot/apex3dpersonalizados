import assert from 'node:assert/strict';
import { suite } from './browser-helpers.js';
await suite('conversion-smoke', 4177, async ({ page, run, open, field, total, inspect, go, upload, complete, review, generate, extras }) => {
  const current = () => page.locator('#journey-stepper').getAttribute('data-current-step');
  const prefix = process.env.APEX_TEST_BUILD === '1' ? 'build-v06' : 'v06';
  const shot = async (name, width, selector) => {
    await page.locator(selector).evaluate(n => n.scrollIntoView({block:'start',behavior:'instant'}));
    await page.locator(selector).evaluate(async n => { await Promise.all([...n.querySelectorAll('img')].map(img => { img.loading='eager'; return img.decode(); })); });
    await page.screenshot({ path:'test-results/'+prefix+'-'+name+'-'+width+'.png' });
  };
  await run('Rolagem com oito passos de processo, nove exemplos e depoimentos explícitos de staging', async () => {
    assert.equal(await page.locator('.process-card').count(),8);
    assert.equal(await page.locator('.work-card').count(),9);
    assert.equal(await page.locator('.testimonial-card').count(),3);
    assert.ok((await page.locator('.testimonial-card').allTextContents()).every(t=>t.includes('STAGING')&&t.includes('Ainda sem depoimento')));
    assert.match(await page.locator('#hero-from-price').innerText(),/100,00/);
    for(const selector of ['#como-funciona','#exemplos','#avaliacoes']){
      await page.locator(selector).scrollIntoViewIfNeeded();
      await page.locator(selector).evaluate(async n => { await Promise.all([...n.querySelectorAll('img')].map(img=>img.decode())); });
    }
  });
  await run('Filtros da galeria, ampliação, Escape e retorno de foco', async () => {
    await page.locator('[data-gallery-filter="pets"]').click();
    assert.equal(await page.locator('.work-card:visible').count(),2);
    await page.locator('.work-card:visible').first().click();
    assert.equal(await page.locator('#gallery-lightbox').evaluate(n=>n.open),true);
    await page.keyboard.press('Escape');
    assert.equal(await page.evaluate(()=>document.activeElement.className),'work-card');
    await page.locator('[data-gallery-filter="todos"]').click();
    assert.equal(await page.locator('.work-card:visible').count(),9);
  });
  await run('Avanço por etapa bloqueia foto ausente, conclui etapa válida e preserva referência', async () => {
    await open(); await go('product');
    await page.locator('#journey-next').click(); assert.equal(await current(),'size');
    assert.equal(await page.locator('[data-journey-step="product"]').getAttribute('data-complete'),'true');
    await page.locator('[data-size="15"]').click(); await total(17000);
    await page.locator('#journey-next').click(); assert.equal(await current(),'photos');
    await page.locator('#journey-next').click(); assert.equal(await current(),'photos');
    assert.match(await page.locator('#validation-errors').innerText(),/foto de referência/);
    await upload('figure-1.mf_face_photo_upload[]');
    await page.locator('#journey-next').click(); assert.equal(await current(),'personalization');
    await go('size'); await page.locator('[data-size="20"]').click();
    await total(20000); assert.equal((await inspect()).uploads.length,1);
    assert.equal(await page.locator('#configurator [data-step]:visible').count(),1);
  });
  await run('Tamanhos de pessoas e pets atualizam estado, resumo e preço', async () => {
    for(const [product,count] of [['individual',1],['casal',2],['familia',3],['pet',1]]){
      await open(product); await go('size');
      for(const [size,unit] of [[6,10000],[10,15000],[15,17000],[20,20000]]){
        await page.locator('[data-size="'+size+'"]').click(); await total(unit*count);
        assert.equal((await inspect()).items[0].sizeCm,size);
        assert.match(await page.locator('#summary-composition').innerText(),new RegExp(size+' cm'));
      }
    }
  });
  await run('Cards de adicionais permitem adicionar e remover sem dados residuais', async () => {
    await complete(); await go('size'); await page.locator('[data-size="10"]').click(); await extras();
    await page.locator('[data-toggle-extra="figures"]').click(); await total(30000);
    assert.match(await page.locator('.upsell-card').first().innerText(),/150,00/);
    await upload('figure-2.mf_face_photo_upload[]'); await extras();
    await page.locator('[data-toggle-extra="figures"]').click(); await total(15000);
    assert.equal((await inspect()).uploads.length,1);
    await page.locator('[data-toggle-extra="figure-1.accessories"]').click(); await total(16500);
    await field('figure-1.mf_accessory_detail_1').fill('Livro sintético');
    await page.locator('[data-toggle-extra="figure-1.accessories"]').click(); await total(15000);
    assert.equal(await page.locator('[data-field="figure-1.mf_accessory_detail_1"]').count(),0);
  });
  await run('Data flexível e caixa de 20 cm permanecem estimativas no pedido de teste', async () => {
    await complete(); await go('size'); await page.locator('[data-size="20"]').click();
    await go('packaging'); await page.getByRole('button',{name:'Adicionar caixa personalizada',exact:true}).click();
    await field('mf_box_character_name').fill('Exemplo de caixa'); await total(23900);
    await field('mf_shipping_flexible').check(); await review();
    assert.match(await page.locator('#review-content').innerText(),/preços provisórios/);
    assert.equal(await page.locator('#review-content dt').filter({hasText:'Data flexível'}).evaluate(n=>n.nextElementSibling.textContent),'Sim');
    await generate();
    const draft = await page.evaluate(()=>window.apexDevelopment.inspectDraft());
    assert.equal(draft.productionReady,false); assert.equal(draft.pricing.status,'estimate');
    await page.locator('#close-confirmation').click();
  });
  for(const width of [1440,1024,768,430,390,360]){
    await run('Oito etapas sem overflow ou corte mascarado em '+width+'px',async()=>{
      await page.setViewportSize({width,height:1000}); await complete();
      for(const step of ['product','size','photos','personalization','extras','packaging','delivery','review']){
        await go(step);
        assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),step+' overflow');
        assert.ok(await page.evaluate(()=>![document.documentElement,document.body].some(n=>['hidden','clip'].includes(getComputedStyle(n).overflowX))), 'Overflow mascarado');
        assert.equal(await page.locator('#configurator [data-step]:visible').count(),1);
      }
      if(width<=800){
        await go('size'); await page.locator('#mobile-order-bar').waitFor({state:'visible'});
        assert.equal(await page.locator('#mobile-total').innerText(),await page.locator('#summary-total').innerText());
        const bar=await page.locator('#mobile-order-bar').boundingBox(); assert.ok(bar.y+bar.height<=1001);
        await page.locator('#mobile-continue').click(); assert.equal(await current(),'photos');
      }else{
        assert.equal(await page.locator('.order-summary').evaluate(n=>getComputedStyle(n).position),'sticky');
      }
    });
  }
  for(const width of [1440,390]){
    await run('Evidências visuais V0.6 em '+width+'px',async()=>{
      await page.setViewportSize({width,height:width===390?1400:1000}); await page.emulateMedia({reducedMotion:'reduce'}); await complete();
      for(const [name,selector] of [['hero','#inicio'],['products','#produtos'],['process','#como-funciona'],['gallery','#exemplos'],['testimonials','#avaliacoes']]) { await shot(name,width,selector); if(['process','gallery'].includes(name)) await page.locator(selector).screenshot({path:'test-results/'+prefix+'-'+name+'-full-'+width+'.png'}); }
      for(const [name,step] of [['configurator','product'],['sizes','size'],['uploads','photos'],['upsells','extras'],['packaging','packaging'],['delivery','delivery']]){
        await go(step); if(width<=800)await page.locator('#mobile-order-bar').waitFor({state:'visible'});
        await shot(name,width,'#journey-stepper');
      }
      if(width===390) await page.screenshot({path:'test-results/'+prefix+'-sticky-total-390.png'});
      await review(); await page.screenshot({path:'test-results/'+prefix+'-review-'+width+'.png'}); await page.keyboard.press('Escape');
    });
  }
});
