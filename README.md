# Apex3D · Frontend comercial V0.6

Implementação standalone em HTML, CSS e JavaScript local. Oferta em BRL, personalização guiada por fotos, adicionais progressivos, revisão e pedido de teste. Sem backend, pagamento, envio externo ou persistência das fotos.

A entrada comercial é **dev.html**. O **index.html da raiz é um snapshot histórico preservado** e não deve ser publicado como a página Apex.

## Executar e homologar

- **npm run dev**: página comercial em http://127.0.0.1:4173/.
- **npm test**: testes de cálculo, uploads e contrato de produção.
- **npm run test:smoke**: Playwright com Edge; evidências em test-results/ (ignorado).
- **npm run test:smoke:build**: gera dist e repete todas as suítes diretamente no build.
- **npm run build**: cria **dist/** com a página Apex como index e somente arquivos públicos autorizados. Configure a hospedagem de staging para publicar **dist**, nunca a raiz.

Node.js é suficiente para executar e gerar o site. Para os testes de navegador, disponibilize Playwright e Edge. O runner aceita APEX_PLAYWRIGHT_PATH apontando ao módulo playwright/index.mjs e APEX_BROWSER para selecionar outro canal Chromium instalado.

### Deploy na Vercel

O arquivo vercel.json define o projeto como estático, executa **npm run build** e publica **dist**. Não use public como Output Directory. Mantenha Root Directory na raiz deste repositório e faça o deploy de um commit que contenha essa configuração, na branch feat/apex-frontend-v06-conversion. Os cabeçalhos de homologação também estão configurados para a Vercel.

## Contrato atual

Consulte [APEX-FRONTEND-V06-CONVERSION](docs/APEX-FRONTEND-V06-CONVERSION.md) para identidade, oferta, preços de homologação, limites e resultado dos testes; [dependências atuais](docs/APEX-DEPENDENCIES.md) e [procedência dos assets](docs/ASSET-MAP.md).

Simulação autorizada: 6 cm R$100, 10 cm R$150, 15 cm R$170 e 20 cm R$200 por miniatura. Casal/Família multiplicam por duas/três pessoas. Acessórios simples/detalhados R$15/R$20; demais extras com estimativas explícitas. Tudo provisório, sem cobrança e sem frete. Tabelas em config/commercial.js e config/pricing.js.

Fotos permanecem em memória com validação e recibos internos por pessoa/pet/adicional. O CTA “Gerar pedido de teste” gera um rascunho local: não faz cobrança, não envia pedido e não inicia produção. Recarregar encerra a configuração. A inspeção em window.apexDevelopment omite textos livres e nomes dos arquivos.

## Baseline preservado

- Tag: baseline-original-2026-09-11.
- Commit: 175babe2df4ffa416f6feae680019600689c72a7.
- index.html: 560.040 bytes; SHA-256 327d2941518821d6dc60e22ba842e43086557c90bfa5c21ee9bcfa3f3c7a65bb.
- Fundação anterior: branch refactor/apex-foundation.
- V0.5: branch feat/apex-frontend-v05.
- Origin: https://github.com/pedroh99p-bot/apex3dpersonalizados.

O contrato atual está em docs/APEX-MVP-CONTRACT.md e a matriz da reconstrução em docs/ORIGINAL-SCROLL-MAP.md. Os inventários TECHNICAL-MAP, USER-FLOW, PRICING, LOCAL-REIMPLEMENTATION, DEPENDENCY-CLASSIFICATION e VISUAL-RESTORATION descrevem fases anteriores. As decisões V0.6 prevalecem sobre esses históricos. A prévia usa 22 imagens restauradas locais, marcadas ORIGIN_REVIEW_REQUIRED em docs/ASSET-MAP.md; além da logo Apex e ícones originais.
