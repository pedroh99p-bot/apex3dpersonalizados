import { pricing } from '../config/pricing.js';
import { formatMoney } from './pricing.js';
const examples = [
  ['individual-futebol','Paixões que ganham forma','pessoas'],
  ['individual-profissao','Sua profissão, sua história','pessoas'],
  ['casal','Uma criação a dois','casais'],
  ['pet','Um companheiro especial','pets'],
  ['profissao-chef','Os detalhes do seu dia a dia','pessoas'],
  ['musica','Sua paixão pela música','pessoas'],
  ['casal-memorias','Memórias compartilhadas','casais'],
  ['profissao-policial','O que faz parte de você','pessoas'],
  ['pet-companheiro','Personalidade e companhia','pets'],
];
export function setupConversionPage() {
  document.querySelector('#hero-from-price').textContent = formatMoney(Math.min(...Object.values(pricing.base)));
  const selected = product => document.querySelectorAll('[data-choose-product]').forEach(card => {
    card.setAttribute('aria-pressed', String(card.dataset.chooseProduct === product));
    let badge = card.querySelector('.selection-badge');
    if (!badge) { badge = document.createElement('span'); badge.className = 'selection-badge'; card.querySelector('.product-copy').prepend(badge); }
    badge.textContent = card.dataset.chooseProduct === product ? 'Selecionado ✓' : 'Personalize';
  });
  selected(document.querySelector('[data-product][aria-pressed=true]').dataset.product);
  document.addEventListener('apex:product', event => selected(event.detail.product));
  const gallery = document.querySelector('.work-gallery'), filters = document.querySelector('.gallery-filters');
  const lightbox = document.querySelector('#gallery-lightbox'), enlarged = document.querySelector('#gallery-enlarged');
  let returnTo;
  for (const [file,label,category] of examples) {
    const button = document.createElement('button'); button.type = 'button'; button.className = 'work-card'; button.dataset.category = category;
    const img = document.createElement('img'); img.src = '/assets/examples/' + file + '.webp'; img.width = img.height = 600; img.loading = 'lazy'; img.decoding = 'async'; img.alt = label + ': foto de referência, modelo e miniatura';
    const text = document.createElement('span'); text.textContent = label + ' ↗'; button.append(img,text);
    button.addEventListener('click', () => { returnTo = button; enlarged.src = img.src; enlarged.alt = img.alt; document.querySelector('#gallery-caption').textContent = label; lightbox.showModal(); document.querySelector('#gallery-close').focus(); });
    gallery.append(button);
  }
  for (const [id,label] of [['todos','Todos'],['pessoas','Pessoas'],['casais','Casais'],['pets','Pets']]) {
    const button = document.createElement('button'); button.type = 'button'; button.textContent = label; button.className = 'filter-chip'; button.dataset.galleryFilter = id; button.setAttribute('aria-pressed', String(id === 'todos'));
    button.addEventListener('click', () => { gallery.querySelectorAll('.work-card').forEach(card => card.hidden = id !== 'todos' && card.dataset.category !== id); filters.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed',String(b === button))); });
    filters.append(button);
  }
  document.querySelector('#gallery-close').addEventListener('click', () => lightbox.close());
  lightbox.addEventListener('close', () => returnTo?.focus());
}
