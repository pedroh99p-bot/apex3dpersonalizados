import { startConfigurator } from './ui.js';
import { startHeroCarousel } from './carousel.js';
import { restoreProductImagery } from './product-imagery.js';
import { setupConversionPage } from './conversion-page.js';
try {
  startConfigurator();
  restoreProductImagery();
  setupConversionPage();
  startHeroCarousel();
  document.documentElement.dataset.apexReady = 'true';
} catch {
  const message = document.createElement('p');
  message.className = 'error-panel';
  message.textContent = 'Não foi possível iniciar a personalização. Recarregue a página para tentar novamente.';
  document.querySelector('#personalize').prepend(message);
}
