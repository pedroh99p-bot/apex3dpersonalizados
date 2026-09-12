import { products } from '../config/products.js';
import { pricing, specialObjectCategories } from '../config/pricing.js';
import { mvpRules } from '../config/mvp.js';
import { createOrderState, createFigure } from './state.js';
import { calculatePrice, formatMoney } from './pricing.js';
import { UploadStore } from './uploads.js';
import { minimumDesiredDate, displayDate } from './date.js';
import { createOrderDraft, validateOrderForProduction, buildOrder, safeOrderSummary } from './order.js';
import { renderOrderReview } from './review.js';
import { createJourney } from './journey.js';
import { sizes } from '../config/commercial.js';
import { icon } from './icons.js';

// All user values enter DOM through value/textContent, never markup.
function el(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}
const q = selector => document.querySelector(selector);
export function startConfigurator() {
  const initial = new URLSearchParams(location.search).get('tipo');
  let state = createOrderState(Object.hasOwn(products, initial) ? initial : 'individual');
  const store = new UploadStore(), failures = new Map();
  let epoch = 0, pending = 0, revision = 0, reviewedRevision = -1, draft = null;
  let inputId = 0;
  let journey;
  const form = q('#configurator'), review = q('#order-review'), confirmation = q('#order-confirmation');
  function touch() {
    revision++; draft = null;
    state.uploads = store.metadata();
    state.pricing = calculatePrice(state);
    updateSummary();
    journey?.refresh();
  }
  function updateSummary() {
    q('#summary-product').textContent = products[state.product].label;
    q('#summary-composition').textContent = state.size + ' cm · ' + (state.customizations.figures.length ? state.customizations.figures.length + ' pessoa(s)' : 'Pet principal');
    const lines = q('#summary-lines'); lines.replaceChildren();
    for (const line of state.pricing.lines) {
      const row = el('div', undefined, 'summary-line'); row.append(el('span', line.label), el('span', formatMoney(line.cents))); lines.append(row);
    }
    q('#summary-total').textContent = formatMoney(state.pricing.totalCents);
    q('#summary-date').textContent = state.shipping.date ? 'Data desejada: ' + displayDate(state.shipping.date) + ' · sujeita à confirmação' : 'Escolha quando você precisa receber.';
  }
  function textField(label, value, set, field, { type = 'text', placeholder = '', maxLength = 1000 } = {}) {
    const wrap = el('label', label, 'field'), input = el(type === 'textarea' ? 'textarea' : 'input');
    if (type !== 'textarea') input.type = type; else input.rows = 3;
    input.value = value || ''; input.maxLength = maxLength; input.placeholder = placeholder;
    input.dataset.field = field; input.addEventListener('input', () => { set(input.value); touch(); });
    wrap.append(input); return wrap;
  }
  function selectField(label, value, options, set, field) {
    const wrap = el('label', label, 'field'), input = el('select');
    for (const [id, title] of options) { const option = el('option', title); option.value = id; input.append(option); }
    input.value = String(value); input.dataset.field = field;
    input.addEventListener('change', () => { set(input.value); render(); });
    wrap.append(input); return wrap;
  }
  function countField(label, value, max, set, field, suffix = '') {
    const card = el('div', undefined, 'upsell-card'); card.dataset.selected = String(value > 0);
    const header = el('div', undefined, 'upsell-card-heading');
    header.append(icon(field === 'figures' ? 'person' : field === 'mf_pets_option' ? 'pet' : 'accessory'), el('h4', label));
    card.append(header, el('p', field === 'figures' ? 'Inclua mais uma pessoa na mesma criação.' : field === 'mf_pets_option' ? 'Seu companheiro também pode fazer parte.' : 'Um detalhe que conta mais sobre você.', 'help'));
    const actions = el('div', undefined, 'upsell-actions');
    const toggle = el('button', value ? 'Remover' : 'Adicionar', 'button secondary'); toggle.type = 'button'; toggle.dataset.toggleExtra = field;
    toggle.addEventListener('click', () => { set(value ? 0 : 1); render(); });
    actions.append(toggle, selectField('Quantidade', value, Array.from({ length: max + 1 }, (_, i) => [i, i ? i + suffix : 'Nenhum']), v => set(Number(v)), field));
    card.append(actions); return card;
  }
  function uploadField(label, field, multiple = true) {
    const wrap = el('div', undefined, 'upload-field'), labelEl = el('label', label), input = el('input');
    const uploadTitle = el('div', undefined, 'upload-title'); uploadTitle.append(icon('camera'), el('strong', 'Adicione suas fotos'));
    input.type = 'file'; input.accept = store.policy.mimeTypes.join(','); input.multiple = multiple; input.dataset.field = field;
    const help = el('p', 'JPG, PNG, WebP ou GIF · até ' + store.policy.maxBytes / 1_000_000 + ' MB por foto.', 'help');
    help.id = 'upload-help-' + (++inputId); input.setAttribute('aria-describedby', help.id);
    const previews = el('div', undefined, 'preview-list'), status = el('div');
    status.setAttribute('aria-live', 'polite');
    function display() {
      previews.replaceChildren(); status.replaceChildren();
      for (const entry of store.list().filter(u => u.owner.field === field)) {
        const card = el('div', undefined, 'preview'), img = el('img');
        img.src = entry.previewUrl; img.alt = 'Foto de referência: ' + label;
        const remove = el('button', 'Remover foto', 'text-button'); remove.type = 'button';
        remove.setAttribute('aria-label', 'Remover foto de ' + label);
        remove.addEventListener('click', () => { store.remove(entry.id); touch(); display(); });
        card.append(img, remove); previews.append(card);
      }
      if (failures.has(field)) {
        status.append(el('p', failures.get(field), 'file-error'));
        const discard = el('button', 'Descartar seleção inválida', 'text-button'); discard.type = 'button';
        discard.addEventListener('click', () => { failures.delete(field); touch(); display(); });
        status.append(discard);
      }
    }
    input.addEventListener('change', async () => {
      if (!input.files.length) return;
      const currentEpoch = epoch; pending++; touch(); input.disabled = true;
      status.textContent = 'Validando imagem…';
      try {
        await store.add({ itemId: 'main-1', field }, input.files, { multiple });
        if (currentEpoch === epoch) failures.delete(field);
      } catch (error) {
        if (currentEpoch === epoch) failures.set(field, error.message);
      } finally {
        if (currentEpoch === epoch) { pending--; input.disabled = false; input.value = ''; touch(); display(); }
      }
    });
    const guidance = el('p', 'Use luz natural, rosto visível e sem filtros. Uma foto de corpo inteiro ajuda na roupa e na pose.', 'help');
    const guide = el('details', undefined, 'photo-guide');
    guide.append(el('summary', 'Ver exemplo de uma boa referência'));
    const guideImage = el('img'); guideImage.src = '/assets/examples/' + (products[state.product].kind === 'pet' ? 'pet' : 'individual-profissao') + '.webp'; guideImage.alt = 'Exemplo: referência nítida e transformação em miniatura'; guideImage.width = guideImage.height = 180; guideImage.loading = 'lazy';
    guide.append(guideImage, el('p', 'Referência visual de teste: rosto ou focinho visível, boa luz e detalhes da roupa ou pelagem.', 'help'));
    const addPhotos = el('button', 'Adicionar fotos', 'button secondary'); addPhotos.type = 'button'; addPhotos.addEventListener('click', () => input.click());
    labelEl.append(input); wrap.append(uploadTitle, addPhotos, labelEl, help, guidance, guide, previews, status); display(); return wrap;
  }
  function section(number, title) {
    const node = el('section', undefined, 'form-section'), heading = el('div', undefined, 'form-heading');
    node.dataset.step = number === '02' ? 'photos' : 'personalization';
    heading.append(el('span', number === '02' ? '03' : '04'), el('h3', title)); node.append(heading); return node;
  }
  function personFields(figure, i, photosOnly = false) {
    const node = el('div', undefined, 'person-block');
    node.append(el('p', 'Pessoa ' + (i + 1) + (i >= products[state.product].figures ? ' · adicional' : ''), 'person-title'));
    if (photosOnly) {
      node.append(uploadField('Fotos da pessoa ' + (i + 1), figure.id + '.mf_face_photo_upload[]'));
      return node;
    }
    const row = el('div', undefined, 'field-row');
    row.append(selectField('Roupa', figure.outfit.mode, [['reference', 'Igual à foto'], ['custom', 'Personalizada']], v => {
      figure.outfit = { mode: v, description: '' };
    }, figure.id + '.outfit'));
    row.append(selectField('Pose', figure.pose.mode, [['reference', 'Baseada na referência'], ['custom', 'Personalizada']], v => {
      figure.pose = { mode: v, description: '' };
    }, figure.id + '.pose'));
    node.append(row);
    if (figure.outfit.mode === 'custom') {
      node.append(textField('Descreva a roupa', figure.outfit.description, v => figure.outfit.description = v, figure.id + '.outfit.description', { type: 'textarea' }));
      node.append(uploadField('Referência da roupa · opcional', figure.id + '.mf_outfit_photo_upload[]'));
    }
    if (figure.pose.mode === 'custom') node.append(textField('Descreva a pose', figure.pose.description, v => figure.pose.description = v, figure.id + '.pose.description', { type: 'textarea' }));
    return node;
  }
  function accessoryFields(f, i) {
    const node = el('div', undefined, 'extra-block'), prefix = 'figure-' + (i + 1);
    node.append(el('p', products[state.product].kind === 'pet' ? 'Detalhes para seu pet' : 'Detalhes para a pessoa ' + (i + 1), 'person-title'));
    for (const [key, stem, label, cents] of [['accessories', 'accessory', 'Acessório simples', pricing.accessory], ['logos', 'logo', 'Acessório detalhado', pricing.logo]]) {
      node.append(countField(label + ' · +' + formatMoney(cents) + ' cada', f[key], pricing.maxAccessories, v => {
        f[key] = v;
        for (let n = v + 1; n <= pricing.maxAccessories; n++) delete f.fields['mf_' + stem + '_detail_' + n];
      }, prefix + '.' + key));
      for (let n = 1; n <= f[key]; n++) {
        const field = 'mf_' + stem + '_detail_' + n;
        node.append(textField(label + ' ' + n + ' · descrição ou foto', f.fields[field], v => f.fields[field] = v, prefix + '.' + field));
        node.append(uploadField(label + ' ' + n + ' · referência', prefix + '.mf_' + stem + '_upload_' + n));
      }
    }
    for (const [id, category] of Object.entries(specialObjectCategories)) {
      const label = el('label', undefined, 'checkbox-field object-card'), check = el('input'); check.type = 'checkbox'; check.checked = f.specialAccessories.includes(id);
      label.append(icon('accessory')); label.dataset.selected = String(check.checked);
      check.addEventListener('change', () => {
        f.specialAccessories = check.checked ? [...f.specialAccessories, id] : f.specialAccessories.filter(s => s !== id);
        if (!check.checked) delete f.fields['object_' + id];
        render();
      });
      label.append(check, el('span', category.label + ' · +' + formatMoney(category.cents)), el('span', check.checked ? 'Remover' : 'Adicionar', 'object-action')); node.append(label);
      if (check.checked) {
        node.append(textField('Descreva o objeto ' + id, f.fields['object_' + id], v => f.fields['object_' + id] = v, prefix + '.object_' + id));
        node.append(uploadField('Foto do objeto ' + id + ' · opcional', prefix + '.mf_special_accessory_extra_photo_' + id));
      }
    }
    return node;
  }
  function render() {
    epoch++; pending = 0; store.cancelPending();
    const focusField = document.activeElement?.dataset.field;
    const picker = q('#product-picker'); picker.replaceChildren();
    for (const [id, product] of Object.entries(products)) {
      const button = el('button', product.label, 'product-option'); button.type = 'button'; button.dataset.product = id;
      button.setAttribute('aria-pressed', String(state.product === id));
      button.prepend(icon(product.kind === 'pet' ? 'pet' : 'person'));
      button.addEventListener('click', () => chooseProduct(id)); picker.append(button);
    }
    const sizeGrid = q('#size-fields'); sizeGrid.replaceChildren();
    for (const size of sizes) {
      const button = el('button', undefined, 'size-card'); button.type = 'button'; button.dataset.size = size.cm; button.dataset.field = 'size';
      button.setAttribute('aria-pressed', String(state.size === size.cm));
      const visual = el('div', undefined, 'size-visual size-' + size.cm); visual.append(icon(products[state.product].kind === 'pet' ? 'pet' : 'person'));
      button.append(visual, el('strong', size.cm + ' cm'), el('span', size.label), el('small', size.description), el('b', formatMoney(pricing.base.individual + pricing.humanSize[size.cm]) + ' por miniatura'), el('small', '+' + formatMoney(pricing.humanSize[size.cm]) + ' sobre 6 cm'));
      button.addEventListener('click', () => { state.size = size.cm; render(); }); sizeGrid.append(button);
    }
    const primary = q('#primary-fields'); primary.replaceChildren();
    const photos = section('02', 'Suas fotos são a referência');
    photos.append(el('p', 'Envie fotos nítidas, sem filtros. Aparência, cabelo e tom de pele serão baseados nas referências.', 'help'));
    const personalization = section('03', 'Os detalhes da sua criação');
    if (products[state.product].kind === 'human') {
      state.customizations.figures.forEach((f, i) => { photos.append(personFields(f, i, true)); personalization.append(personFields(f, i)); });
    } else {
      photos.append(selectField('Tipo do pet', state.customizations.pet.fields.mf_pet_type || '', [['', 'Selecione'], ...mvpRules.petTypes.map((v, i) => [v, mvpRules.additionalPetTypes[i]])], v => state.customizations.pet.fields.mf_pet_type = v, 'mf_pet_type'));
      photos.append(uploadField('Fotos do pet', 'mf_pet_photo[]'));
      personalization.append(textField('Pose e detalhes do pet · opcional', state.customizations.pet.fields.details, v => state.customizations.pet.fields.details = v, 'pet.details', { type: 'textarea', placeholder: 'Siga a referência ou conte o que você imagina.' }));
    }
    primary.append(photos, personalization);
    const upsells = q('#upsell-fields'); upsells.replaceChildren();
    const c = state.customizations;
    if (products[state.product].kind === 'human') {
      upsells.append(countField('Pessoa adicional · +' + formatMoney(pricing.additionalPerson + pricing.humanSize[state.size]) + ' cada', c.additionalPeople, pricing.maxAdditionalPeople, v => {
        c.additionalPeople = v;
        const count = products[state.product].figures + v;
        c.figures = Array.from({ length: count }, (_, i) => c.figures[i] || createFigure(i));
      }, 'figures'));
      if (c.additionalPeople) upsells.append(el('p', 'As fotos, a roupa e a pose das pessoas adicionais aparecem nas etapas 03 e 04.', 'help'));
    }
    upsells.append(countField('Pet adicional de 4 cm · +' + formatMoney(pricing.additionalPets[1]) + ' cada', c.pets.length, 3, v => {
      c.pets = Array.from({ length: v }, (_, i) => c.pets[i] || { type: '', size: 4, fields: {} });
    }, 'mf_pets_option'));
    c.pets.forEach((pet, i) => {
      upsells.append(selectField('Tipo do pet adicional ' + (i + 1), pet.type, [['', 'Selecione'], ...mvpRules.additionalPetTypes.map(v => [v, v])], v => pet.type = v, 'mf_pet_' + (i + 1) + '_type'));
      upsells.append(uploadField('Fotos do pet adicional ' + (i + 1), 'mf_pet_' + (i + 1) + '_photo[]'));
      upsells.append(textField('Detalhes do pet adicional ' + (i + 1) + ' · opcional', pet.fields.details, v => pet.fields.details = v, 'pet-' + (i + 1) + '.details'));
    });
    (products[state.product].kind === 'pet' ? [c.pet] : c.figures).forEach((f, i) => upsells.append(accessoryFields(f, i)));
    const pack = q('#packaging-fields'); pack.replaceChildren();
    const inclusions = el('div', undefined, 'inclusions');
    for (const [name, media] of [['Base sem gravação', 'base'], ['Embalagem padrão', 'box']]) {
      const card = el('article', undefined, 'included-card');
      if (media === 'base') { const img = el('img'); img.src = '/assets/products/base.webp'; img.alt = ''; img.width = img.height = 60; card.append(img); } else card.append(icon('box'));
      card.append(el('strong', name), el('span', 'Incluso', 'badge')); inclusions.append(card);
    }
    pack.append(inclusions);
    const baseChoice = selectField('Base', c.extras[0] || '', [['', 'Base sem gravação · inclusa'], ['base-com-nome', 'Nome · +' + formatMoney(pricing.extras['base-com-nome'])], ['base-com-nome-data', 'Nome + data · +' + formatMoney(pricing.extras['base-com-nome-data'])]], v => {
      c.extras = v ? [v] : []; c.fields = {};
    }, 'mf_extra_option[]');
    pack.append(baseChoice);
    const baseCards = el('div', undefined, 'base-choices');
    for (const [id, name, image] of [['', 'Sem gravação', 'base'], ['base-com-nome', 'Nome na base', 'base-nome'], ['base-com-nome-data', 'Nome + data', 'base-data']]) {
      const button = el('button', undefined, 'base-card'); button.type = 'button'; button.setAttribute('aria-pressed', String((c.extras[0] || '') === id));
      const img = el('img'); img.src = '/assets/products/' + image + '.webp'; img.alt = ''; img.width = img.height = 100;
      button.append(img, el('strong', name), el('span', id ? '+' + formatMoney(pricing.extras[id]) : 'Incluso'));
      button.addEventListener('click', () => { c.extras = id ? [id] : []; c.fields = {}; render(); }); baseCards.append(button);
    }
    pack.append(baseCards);
    if (c.extras.length) pack.append(textField('Nome para a base', c.fields.mf_extra_text_data, v => c.fields.mf_extra_text_data = v, 'mf_extra_text_data', { maxLength: 80 }));
    if (c.extras.includes('base-com-nome-data')) pack.append(textField('Data para gravar na base', c.fields.baseDate, v => c.fields.baseDate = v, 'baseDate', { type: 'date' }));
    pack.append(selectField('Embalagem', c.box.type, [['caja_standard', 'Embalagem padrão · inclusa'], ['caja_personalizada', 'Caixa personalizada · +' + formatMoney(pricing.box.caja_personalizada[state.size])]], v => {
      c.box = { type: v, dedication: false, fields: {} };
    }, 'mf_box_option'));
    const boxUpgrade = el('div', undefined, 'box-upgrade'); const boxToggle = el('button', c.box.type === 'caja_standard' ? 'Adicionar caixa personalizada' : 'Remover caixa personalizada', 'button secondary'); boxToggle.type = 'button';
    boxToggle.addEventListener('click', () => { c.box = { type: c.box.type === 'caja_standard' ? 'caja_personalizada' : 'caja_standard', dedication: false, fields: {} }; render(); });
    boxUpgrade.append(icon('box'), el('p', 'Uma apresentação com o seu nome. +' + formatMoney(pricing.box.caja_personalizada[state.size]) + ' estimados. Formato e dimensões a confirmar.'), boxToggle); pack.append(boxUpgrade);
    if (c.box.type !== 'caja_standard') {
      pack.append(textField('Nome para a caixa', c.box.fields.mf_box_character_name, v => c.box.fields.mf_box_character_name = v, 'mf_box_character_name', { maxLength: 80 }));
      pack.append(textField('Dedicatória na caixa · opcional', c.box.fields.mf_box_dedication_text, v => {
        c.box.fields.mf_box_dedication_text = v; c.box.dedication = Boolean(v.trim());
      }, 'mf_box_dedication_text', { type: 'textarea', maxLength: 500 }));
    }
    const active = new Set([...form.querySelectorAll('input[type=file]')].map(input => input.dataset.field));
    store.list().filter(u => !active.has(u.owner.field)).forEach(u => store.remove(u.id));
    for (const key of failures.keys()) if (!active.has(key)) failures.delete(key);
    touch();
    if (focusField) [...form.querySelectorAll('[data-field]')].find(input => input.dataset.field === focusField)?.focus({ preventScroll: true });
  }
  function chooseProduct(id) {
    if (state.product === id) return;
    store.clear(); failures.clear(); state = createOrderState(id);
    q('#needed-date').value = ''; q('#notes').value = '';
    q('#flexible-date').checked = false;
    q('#validation-errors').hidden = true; render();
    journey?.reset();
    document.dispatchEvent(new CustomEvent('apex:product', { detail: { product: id } }));
    history.replaceState(null, '', '?tipo=' + id + '#personalize');
    q('#product-picker [aria-pressed=true]').focus({ preventScroll: true });
  }
  function validation() {
    const result = validateOrderForProduction(state);
    if (pending) result.errors.push({ field: 'uploads', code: 'UPLOAD_PENDING', message: 'Aguarde a validação das imagens.' });
    for (const [field, message] of failures) result.errors.push({ field, code: 'UPLOAD_SELECTION_INVALID', message });
    result.valid = result.errors.length === 0; return result;
  }
  function showErrors(errors) {
    const panel = q('#validation-errors'); panel.replaceChildren();
    form.querySelectorAll('[aria-invalid]').forEach(n => n.removeAttribute('aria-invalid'));
    panel.hidden = !errors.length;
    if (!errors.length) return;
    panel.append(el('strong', 'Falta pouco. Confira estes detalhes:'));
    const list = el('ul'); panel.append(list);
    for (const error of errors) {
      const item = el('li'), button = el('button', error.message); button.type = 'button';
      const field = [...form.querySelectorAll('[data-field]')].find(n => n.dataset.field === error.field);
      field?.setAttribute('aria-invalid', 'true');
      button.addEventListener('click', () => {
        const liveField = [...form.querySelectorAll('[data-field]')].find(n => n.dataset.field === error.field);
        if (liveField) {
          journey?.revealField(error.field);
          for (let parent = liveField.parentElement; parent; parent = parent.parentElement) if (parent.tagName === 'DETAILS') parent.open = true;
          liveField.focus(); liveField.scrollIntoView({ block: 'center' });
        }
      });
      item.append(button); list.append(item);
    }
    panel.focus();
  }
  form.addEventListener('submit', event => {
    event.preventDefault();
    const result = validation(); showErrors(result.errors);
    if (!result.valid) return;
    reviewedRevision = revision;
    renderOrderReview(q('#review-content'), state, {
      uploads: store.list(),
      onEdit: () => review.close(),
      onGenerate: () => {
        const check = validation();
        if (reviewedRevision !== revision) check.errors.push({ field: 'order', code: 'REVIEW_STALE', message: 'A configuração mudou. Revise o pedido novamente.' });
        if (check.errors.length) { review.close(); showErrors(check.errors); return; }
        const result = createOrderDraft(state);
        if (!result.valid) { review.close(); showErrors(result.errors); return; }
        draft = result.orderDraft; review.close(); confirmation.showModal(); q('#confirmation-title').focus();
      },
    });
    review.showModal(); q('#review-title').focus(); review.scrollTop = 0;
  });
  q('#close-confirmation').addEventListener('click', () => confirmation.close());
  q('#needed-date').min = minimumDesiredDate();
  q('#needed-date').addEventListener('input', event => { state.shipping.date = event.target.value; touch(); });
  q('#notes').addEventListener('input', event => { state.notes = event.target.value; touch(); });
  q('#flexible-date').addEventListener('change', event => { state.shipping.flexible = event.target.checked; touch(); });
  const cards = q('#product-cards');
  for (const [id, product] of Object.entries(products)) {
    const button = el('button', undefined, 'product-card'); button.type = 'button'; button.dataset.chooseProduct = id;
    const art = el('div', undefined, 'product-visual'); art.setAttribute('aria-hidden', 'true');
    for (let i = 0; i < (product.figures || 1); i++) art.append(el('span', undefined, 'figure' + (product.kind === 'pet' ? ' pet-figure' : '')));
    const copy = el('div', undefined, 'product-copy'), bottom = el('div', undefined, 'product-card-bottom');
    bottom.append(el('span', 'A partir de ' + formatMoney(pricing.base[id])), el('span', '↗'));
    copy.append(el('h3', product.label), el('p', product.description), bottom); button.append(art, copy);
    button.addEventListener('click', () => { chooseProduct(id); q('#personalize').scrollIntoView(); });
    cards.append(button);
  }
  window.addEventListener('pagehide', () => store.clear());
  window.apexDevelopment = Object.freeze({
    inspect: () => safeOrderSummary(buildOrder(state)),
    validate: validation,
    inspectDraft: () => draft ? safeOrderSummary(draft) : null,
  });
  render();
  journey = createJourney({ validate: validation, showErrors, price: () => formatMoney(state.pricing.totalCents) });
}
