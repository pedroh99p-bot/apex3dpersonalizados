import { products } from '../config/products.js';
import { specialObjectCategories } from '../config/pricing.js';
import { mvpRules } from '../config/mvp.js';
import { calculatePrice, formatMoney } from './pricing.js';
import { displayDate } from './date.js';
const node = (tag, text, className) => {
  const element = document.createElement(tag);
  if (text !== undefined) element.textContent = text;
  if (className) element.className = className;
  return element;
};
export function renderOrderReview(container, state, { uploads = [], onEdit, onGenerate }) {
  container.replaceChildren();
  const header = node('div', undefined, 'review-heading'), title = node('h2', 'Revise sua criação');
  title.id = 'review-title'; title.tabIndex = -1;
  const close = node('button', '×', 'close-review'); close.type = 'button'; close.setAttribute('aria-label', 'Fechar revisão'); close.addEventListener('click', onEdit);
  header.append(title, close); container.append(node('p', 'DO SEU JEITO, EM CADA DETALHE', 'eyebrow'), header);
  const section = (title, rows, photos = []) => {
    const block = node('section', undefined, 'review-section'), dl = node('dl');
    block.append(node('h3', title), dl);
    for (const [label, value] of rows) { dl.append(node('dt', label), node('dd', String(value))); }
    if (photos.length) {
      const gallery = node('div', undefined, 'review-photos');
      for (const photo of photos) {
        const img = node('img'); img.src = photo.previewUrl; img.alt = 'Referência para ' + title; gallery.append(img);
      }
      block.append(gallery);
    }
    container.append(block);
  };
  const photos = field => uploads.filter(u => u.owner.itemId === 'main-1' && u.owner.field === field);
  const c = state.customizations, product = products[state.product], price = calculatePrice(state);
  const total = node('div', undefined, 'total-row'); total.append(node('span', 'Total estimado'), node('strong', formatMoney(price.totalCents))); container.append(total);
  container.append(node('p', 'Simulação com preços provisórios. Valores, tamanhos e embalagem serão confirmados antes de qualquer produção ou cobrança.', 'review-warning'));
  section('Sua miniatura', [['Produto', product.label + ' · ' + state.size + ' cm'], ['Composição', product.kind === 'pet' ? 'Pet principal' : c.figures.length + ' pessoa(s), incluindo ' + c.additionalPeople + ' adicional(is)'], ['Fotos anexadas', state.uploads.length]]);
  c.figures.forEach((f, i) => {
    const reference = photos(f.id + '.mf_face_photo_upload[]');
    section('Pessoa ' + (i + 1), [
      ['Aparência', 'Baseada nas fotos de referência'],
      ['Fotos', reference.length + ' referência(s)'],
      ['Roupa', f.outfit.mode === 'reference' ? 'Igual à foto' : f.outfit.description],
      ['Pose', f.pose.mode === 'reference' ? 'Baseada na referência' : f.pose.description],
    ], [...reference, ...photos(f.id + '.mf_outfit_photo_upload[]')]);
  });
  if (product.kind === 'pet') section('Seu pet', [['Tipo', mvpRules.additionalPetTypes[mvpRules.petTypes.indexOf(c.pet.fields.mf_pet_type)]], ['Pose e detalhes', c.pet.fields.details || 'Baseados na referência']], photos('mf_pet_photo[]'));
  c.pets.forEach((pet, i) => section('Pet adicional ' + (i + 1), [['Tipo', pet.type], ['Tamanho', pet.size + ' cm'], ['Detalhes', pet.fields.details || 'Baseados na referência']], photos('mf_pet_' + (i + 1) + '_photo[]')));
  (product.kind === 'pet' ? [c.pet] : c.figures).forEach((f, i) => {
    const prefix = 'figure-' + (i + 1), target = product.kind === 'pet' ? 'pet' : 'pessoa ' + (i + 1);
    for (const [key, stem, label] of [['accessories', 'accessory', 'Acessório simples'], ['logos', 'logo', 'Acessório detalhado']]) {
      for (let n = 1; n <= f[key]; n++) section(label + ' ' + n + ' · ' + target, [['Descrição', f.fields['mf_' + stem + '_detail_' + n] || 'Conforme foto']], photos(prefix + '.mf_' + stem + '_upload_' + n));
    }
    for (const id of f.specialAccessories) section(specialObjectCategories[id].label + ' · ' + target, [['Descrição', f.fields['object_' + id] || 'Conforme foto']], photos(prefix + '.mf_special_accessory_extra_photo_' + id));
  });
  const bases = { 'base-com-nome': 'Nome na base', 'base-com-nome-data': 'Nome + data na base' };
  const packRows = [['Base', bases[c.extras[0]] || 'Sem gravação'], ['Caixa', c.box.type === 'caja_standard' ? 'Embalagem padrão' : 'Personalizada']];
  if (c.extras.length) packRows.push(['Nome na base', c.fields.mf_extra_text_data]);
  if (c.extras.includes('base-com-nome-data')) packRows.push(['Data na base', displayDate(c.fields.baseDate)]);
  if (c.box.type !== 'caja_standard') {
    packRows.push(['Nome na caixa', c.box.fields.mf_box_character_name]);
    if (c.box.dedication) packRows.push(['Dedicatória', c.box.fields.mf_box_dedication_text]);
  }
  section('Base e embalagem', packRows);
  section('Últimos detalhes', [['Data desejada', displayDate(state.shipping.date)], ['Data flexível', state.shipping.flexible ? 'Sim' : 'Não'], ['Observações', state.notes || 'Nenhuma observação']]);
  const base = price.lines.find(l => l.code === 'base').cents;
  section('Valores de homologação', [['Preço base', formatMoney(base)], ...price.lines.filter(l => l.code !== 'base').map(l => [l.label, formatMoney(l.cents)]), ['Adicionais', formatMoney(price.unitTotalCents - base)], ['Total estimado', formatMoney(price.totalCents)], ['Frete', 'A confirmar']]);
  container.append(node('p', 'Confirmaremos a disponibilidade da data após o pedido. Você aprova o modelo antes da produção. Nesta homologação, gerar o pedido de teste não envia dados nem realiza pagamento.', 'review-warning'));
  const actions = node('div', undefined, 'review-actions'), edit = node('button', 'Editar criação', 'button secondary'), generate = node('button', 'Gerar pedido de teste', 'button');
  edit.type = generate.type = 'button'; edit.addEventListener('click', onEdit); generate.addEventListener('click', onGenerate);
  actions.append(edit, generate); container.append(actions);
}
