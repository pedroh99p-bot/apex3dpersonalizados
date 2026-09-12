import { cp, mkdir, readFile, writeFile, rm, realpath } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
const root = await realpath(fileURLToPath(new URL('../', import.meta.url)));
const output = resolve(root, 'dist');
const actual = await realpath(output).catch(error => { if (error.code === 'ENOENT') return output; throw error; });
if (dirname(actual) !== root || actual !== output) throw new Error('Destino de build fora do workspace.');
await rm(output, { recursive: true, force: true });
await mkdir(output);
// Explicit public files; never the historical index, docs or credentials.
const publicFiles = [
  "js/journey.js",
  "js/icons.js",
  "js/conversion-page.js",
  "config/commercial.js",
  "css/conversion.css",
  "assets/process/modelagem.webp",
  "assets/process/cor.webp",
  "assets/process/impressao.webp",
  "assets/process/acabamento.webp",
  "assets/process/pintura.webp",
  "assets/process/embalagem.webp",
  "assets/process/envio.webp",
  "assets/products/base.webp",
  "assets/products/base-nome.webp",
  "assets/products/base-data.webp",
  "assets/examples/profissao-chef.webp",
  "assets/examples/profissao-policial.webp",
  "assets/examples/musica.webp",
  "assets/examples/casal-memorias.webp",
  "assets/examples/pet-companheiro.webp",
  "assets/icons/accessory.svg",
  "assets/icons/base.svg",
  "assets/icons/box.svg",
  "assets/icons/brush.svg",
  "assets/icons/calendar.svg",
  "assets/icons/camera.svg",
  "assets/icons/check.svg",
  "assets/icons/person.svg",
  "assets/icons/pet.svg",
  "assets/icons/printer.svg",
  "assets/icons/ruler.svg",
  "assets/icons/truck.svg",
  'js/main.js','js/ui.js','js/state.js','js/pricing.js','js/uploads.js','js/date.js','js/validation.js','js/order.js','js/review.js',
  'js/carousel.js','js/product-imagery.js',
  'css/tokens.css','css/apex.css',
  'config/brand.js','config/products.js','config/pricing.js','config/uploads.js','config/mvp.js',
  'assets/brand/apex-logo.webp',
  'assets/products/individual.webp','assets/products/casal.webp','assets/products/pet.webp',
  'assets/examples/individual-futebol.webp','assets/examples/individual-profissao.webp','assets/examples/casal.webp','assets/examples/pet.webp',
];
for (const file of publicFiles) {
  const target = resolve(output, file); await mkdir(dirname(target), { recursive: true }); await cp(resolve(root, file), target);
}
await writeFile(resolve(output, 'index.html'), await readFile(resolve(root, 'dev.html')));
await writeFile(resolve(output, '_headers'), "/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: no-referrer\n  X-Frame-Options: DENY\n  X-Robots-Tag: noindex, nofollow\n");
console.log('Staging estático: ' + output);
