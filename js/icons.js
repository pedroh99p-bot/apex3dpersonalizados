export function icon(name) {
  const img = document.createElement('img');
  img.src = '/assets/icons/' + name + '.svg'; img.alt = ''; img.width = img.height = 24; img.className = 'apex-icon';
  return img;
}
