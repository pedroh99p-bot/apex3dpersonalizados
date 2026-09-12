# Apex3D V0.6 — contrato do configurador local

Este documento descreve a branch feat/apex-frontend-v06-conversion e substitui o contrato das etapas anteriores. O histórico permanece no Git. Entrada: dev.html; publicação: dist/index.html. O index.html da raiz é o snapshot original preservado.

O resultado é um pedido de teste em memória. Não há backend, checkout, pagamento, conta, envio externo, frete calculado ou persistência de fotos. A aprovação do modelo é uma etapa comercial futura; esta interface não a executa.

## Jornada e regras

| Etapa | Contrato atual |
| --- | --- |
| 1. Produto | Individual: uma pessoa; Casal: duas; Família: três; Pet: um animal principal. Trocar produto limpa escolhas, fotos, data, flexibilidade, notas e draft. |
| 2. Tamanho | 6/10/15/20 cm, selecionáveis para simulação. R$100/150/170/200 por miniatura humana ou pet principal. Estado numérico, preços inteiros em centavos. |
| 3. Fotos | Uma ou mais referências próprias por pessoa ou pet principal; pessoas adicionais também aparecem aqui. Aparência segue as fotos, sem seletores manuais de cabelo/pele. |
| 4. Roupa e pose | Igual à referência por padrão. Roupa/pose personalizadas exigem descrição; foto de roupa é opcional. Pet tem descrição opcional. |
| 5. Adicionais | Até três pessoas extras para produtos humanos, cobradas conforme tamanho; até três pets de 4 cm a R$79 cada; acessórios simples R$15, detalhados R$20, objetos simples/detalhados R$15/R$20. Tudo provisório. |
| 6. Base e embalagem | Base sem gravação e embalagem padrão inclusas na simulação. Nome R$19 ou nome + data R$29; uma base paga por vez. Caixa personalizada R$39 para todos os tamanhos, dimensões/compatibilidade pendentes. |
| 7. Data | Data real, hoje ou futura no calendário local, obrigatória. Flexibilidade booleana opcional, sem alterar preço. Sem prazo mínimo adicional ou bloqueio de finais de semana. Expresso indisponível. |
| 8. Revisão | Revalida tudo, abre diálogo com referências, escolhas, data, flexibilidade e valores provisórios. Gerar pedido de teste revalida e cria o draft local. |

O avanço valida a etapa atual. O stepper permite voltar e editar; pular etapas não remove a validação integral antes da revisão. Só um painel aparece por vez. Etapas concluídas com novos erros voltam a indicar Revisar. O resumo lateral e a barra mobile sempre usam calculatePrice. Erros revelam a etapa correta e focam o campo vivo, inclusive depois de renderizações.

Adicionais pagos só revelam campos de detalhe após a seleção. Cada acessório/objeto exige texto ou sua própria foto. Pessoa/pet adicional exige referência própria; remoção revoga anexos inativos. Nome de base é obrigatório quando escolhido; base com data exige data real. Caixa paga exige nome; dedicatória textual é opcional. Minis, caneca, ímãs, proteção extra e frete expresso não são oferecidos.

## Preços provisórios

O proprietário autorizou placeholders para estruturar a experiência. config/commercial.js contém os preços unitários por tamanho; config/pricing.js deriva bases/tamanhos e centraliza extras. A UI não define tarifas. Casal/Família custam duas/três unidades e pessoas adicionais seguem o tamanho do conjunto. Pet adicional é outra opção, de 4 cm, ainda com placeholder herdado de R$79.

A caixa de R$39 para 20 cm não representa homologação física: o original sequer a oferecia. Há aviso na escolha e na revisão. O pedido distingue preço unitário e total, moeda BRL, pricing.status = estimate, freightCents = null e finalCheckout = false. Nenhum valor é definitivo nem inclui frete.

## Uploads e integridade

JPEG, PNG, WebP e GIF, até 10.000.000 bytes por arquivo. Validação de MIME, tamanho, assinatura e decodificação real no navegador. Arquivo inválido não substitui referência válida; a seleção inválida precisa ser corrigida ou descartada. Upload pendente bloqueia finalização. Mudanças de composição cancelam uploads pendentes e revogam os incompatíveis.

Files e previews Blob ficam em memória; o estado guarda metadados com IDs próprios e owner { itemId, field }. Recibos internos do UploadStore verificam disponibilidade, ID, tipo, tamanho, nome e destino. Reutilizar o ID de outra pessoa ou inventar metadados falha. Há preview, remoção, botão Adicionar fotos e guia visual; não há recorte, edição ou regravação do arquivo. Recarregar ou sair perde a sessão.

## Validação e pedido

validateOrderForProduction é o nome histórico do validador local. Retorna { valid, errors: [{ field, code, message }] }. Verifica estrutura, opções, quantidades, referências, ownership, detalhes, datas e preço recalculado. Isso não comprova viabilidade de fabricação.

createOrderDraft retorna orderDraft nulo se inválido. Em sucesso: schemaVersion 2, mode homologation, status draft, productionValidation passed (apenas contrato local), **productionReady false**, customer null, ID, data de criação, itens, personalizações, anexos, valores, prazo/data e observações. Qualquer edição invalida o draft. Mudança durante revisão bloqueia geração com REVIEW_STALE. A UI também verifica uploads pendentes/seleções inválidas.

A revisão usa textContent para conteúdo do usuário e aceita teclado/Escape. window.apexDevelopment.inspect()/inspectDraft() fornecem só representação segura: não expõem Files, nomes de arquivos ou textos pessoais. Nenhum dado pessoal é registrado no console ou enviado pela rede.

## Módulos e validação

- js/journey.js: oito etapas, avanço, foco, estados e barra mobile.
- js/ui.js: campos, cards, uploads, resumo e integração do fluxo.
- js/pricing.js: única função de cálculo; js/order.js e js/validation.js: contrato/draft.
- js/conversion-page.js: preço do hero, seleção dos modelos, galeria/filtros/lightbox.
- css/tokens.css e css/conversion.css: paleta e componentes Apex.
- scripts/build-staging.js: allowlist explícita dos arquivos públicos.

npm test verifica cálculo/recibos/validação. npm run test:smoke exercita a fonte, oito etapas e larguras 360/390/430/768/1024/1440. npm run test:smoke:build gera dist e executa as mesmas suítes diretamente nessa pasta. Resultados e capturas ficam em test-results/, ignorado pelo Git.

Limites e inventário detalhado: [V0.6](APEX-FRONTEND-V06-CONVERSION.md), [assets](ASSET-MAP.md) e [mapa original](ORIGINAL-SCROLL-MAP.md). Preços, produção, caixa, prazo, origem de mídia e avaliações reais ainda precisam de homologação comercial.
