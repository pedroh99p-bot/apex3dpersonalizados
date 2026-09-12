# Apex3D V0.6 — experiência comercial e conversão

Implementação em feat/apex-frontend-v06-conversion, criada a partir da V0.5 (353fb44). O mapeamento foi registrado antes da implementação, no commit fb14e9c. A base técnica permanece standalone, em HTML/CSS/JavaScript, sem novo framework ou dependência de runtime.

## Direção e rolagem

Objetivo: tornar a personalização mais visual e fácil de acompanhar, mantendo o contrato local robusto. Paleta Apex: vermelho, branco, grafite, creme quente e âmbar funcional. A ação principal continua Criar minha miniatura; a conclusão gera somente pedido de teste.

Navbar → hero com carrossel e preço inicial → Individual/Casal/Família/Pet → oito passos visuais → galeria com nove exemplos → configurador de oito etapas com resumo → benefícios → depoimentos de staging → FAQ → rodapé.

[ORIGINAL-SCROLL-MAP](ORIGINAL-SCROLL-MAP.md) contém a matriz RESTORE/REDESIGN/KEEP_V05/REMOVE, a inspeção de HTML, CSS, SVG, srcset, data attributes e JS original como texto, além das restrições originais de tamanho e caixa.

| Área | V0.5 | V0.6 |
| --- | --- | --- |
| Hero | Quatro transformações e CTA | Mantidos, com preço inicial derivado da configuração |
| Produtos | Imagens locais pequenas | Imagens maiores, preço inicial e seleção destacada |
| Processo | Três passos em texto | Oito cards grandes, seis fotografias + duas ilustrações próprias e destaque de acabamento |
| Galeria | Três comparações | Nove exemplos, filtros Pessoas/Casais/Pets, ampliação e retorno de foco |
| Configuração | Campos em sequência extensa | Oito etapas, atual/concluída/próxima, bloqueio por etapa e revisão integral |
| Tamanho | Apenas 6 cm | 6/10/15/20 cm em simulação autorizada |
| Adicionais | Controles simples | Cards com ícone, preço, adicionar/remover, quantidade e detalhes progressivos |
| Embalagem | Seletores textuais | Itens inclusos, três bases ilustradas e caixa com aviso de compatibilidade |
| Data | Campo obrigatório | Cards de modalidade, data e flexibilidade; expresso indisponível |
| Resumo | Lateral no desktop | Lateral com composição/tamanho e barra compacta mobile |
| Prova social | Espaço futuro | Três cards explicitamente reservados, sem depoimentos ou notas inventadas |

A comparação visual usa também uma cópia temporária do commit V0.5 em test-results/v05-comparison, sem modificar a branch antiga. Screenshots v05-compare-* registram a versão anterior. A V0.6 aumenta o número de imagens e apresenta um painel de configuração por vez, sem perder os campos e validações necessários.

## Mídia e componentes

Quinze novos WebP foram recuperados seletivamente: sete do processo, três bases, cinco exemplos. Somados aos sete já restaurados, são 22 assets com ORIGIN_REVIEW_REQUIRED. Todos estão locais, com origem, bytes e SHA-256 em [ASSET-MAP](ASSET-MAP.md). Não foram reeditados. As imagens de pedido/site e de caixa com marca POP foram descartadas; iconografia original substitui esses elementos. Família usa a composição visual já existente de Casal + Individual.

Doze SVGs originais estão em assets/icons. Não há fonte de ícones, JS/CSS remoto, plugin WordPress, logotipo concorrente ou depoimento copiado. Processo e galeria são identificados como referências para staging, sem alegar produção Apex. Fotos reais Apex e autorização de uso das referências permanecem pendentes.

Tokens estão em css/tokens.css; componentes novos em css/conversion.css. js/journey.js controla a progressão e js/conversion-page.js controla a galeria e seleção dos modelos. Carrossel preserva autoplay opcional, pausa, teclado, swipe e preferência por movimento reduzido. Diálogos nativos devolvem o foco.

## Tamanhos e preços autorizados para simulação

O proprietário informou preços aproximados e autorizou placeholders onde a oferta ainda não está definida. A interpretação adotada e comunicada é **por miniatura**; não é uma cotação aprovada.

| Tamanho | Individual / Pet principal | Casal, 2 pessoas | Família, 3 pessoas | Pessoa adicional |
| --- | --- | --- | --- | --- |
| 6 cm | R$100 | R$200 | R$300 | R$100 |
| 10 cm | R$150 | R$300 | R$450 | R$150 |
| 15 cm | R$170 | R$340 | R$510 | R$170 |
| 20 cm | R$200 | R$400 | R$600 | R$200 |

config/commercial.js centraliza unidades por tamanho; config/pricing.js deriva bases/acréscimos e lista extras. calculatePrice continua a única fonte funcional do total, com centavos inteiros e moeda BRL. Acrescentar pessoas inclui o ajuste de tamanho de cada uma. Mudar o tamanho preserva referências válidas.

Acessório simples/objeto simples: R$15. Detalhado/objeto detalhado: R$20. Pet adicional de 4 cm: R$79; nome na base R$19; nome + data R$29; caixa R$39. Estes últimos são placeholders herdados, mantidos onde não houve nova definição. A caixa aparece nos quatro tamanhos apenas para estruturar a experiência; sua compatibilidade física, especialmente em 20 cm, não foi homologada.

Hero, seleção, resumo e revisão informam estimativas. O draft tem pricing.status estimate e productionReady false. Não há conversão cambial, preço final, cobrança, promessa de prazo, modalidade expressa, minis ou caneca. Frete permanece a confirmar.

## Integridade preservada

Uploads mantêm MIME, limite de 10 MB, assinatura, decodificação, receipts, previews e ownership. Seleção inválida não apaga a válida, mas bloqueia o pedido até ser resolvida. Remover adicionais revoga anexos incompatíveis. A área inclui botão Adicionar fotos e guia com exemplo visual, sem edição da imagem.

O avanço valida a etapa ativa; a revisão valida o conjunto completo. Foto de outra pessoa não supre referência ausente. A data continua obrigatória, local, hoje ou futura; flexibilidade não acrescenta urgência ou preço. Qualquer edição invalida o draft e uma revisão desatualizada não pode gerar pedido. [APEX-MVP-CONTRACT](APEX-MVP-CONTRACT.md) descreve o contrato vigente.

## Mobile e QA

Grades usam minmax(0,1fr), limites de largura, imagens contidas e quebras de texto. Configurador usa uma coluna no mobile; controles acomodam 360 px. O resumo inferior só aparece na região de configuração e fica oculto durante diálogos. Espaço inferior permite rolar controles acima da barra. Não há overflow-x hidden/clip no html/body nem correção que esconda o defeito.

Validação concluída em 11/09/2026:

- **npm test: 24 testes aprovados.** Inclui quatro tamanhos × quatro produtos, pessoas extras, caixa, cálculo inteiro, upload e draft.
- **npm run test:smoke: 62 cenários aprovados** (13 fundação, 22 MVP, 12 visual, 15 conversão).
- **npm run test:smoke:build: 62 cenários aprovados diretamente em dist**, após executar npm run build.
- Larguras 360, 390, 430, 768, 1024 e 1440: oito etapas sem overflow; resumo mobile, revisão e interações verificados.
- Zero exceções JavaScript, zero respostas HTTP de erro de recursos e zero chamadas externas/transacionais nos cenários monitorados.
- Triagem static_site_lint sem erros; os avisos de ausência de WhatsApp (fora do fluxo local) e tipografia responsiva foram revisados. Labels explícitos e imagem inicial do lightbox foram ajustados, com nova execução dos 15 cenários de conversão na fonte e no build.

Evidências ignoradas no Git: test-results/{smoke,mvp-smoke,visual-smoke,conversion-smoke}.json e versões build-*.json. Capturas v06-* e build-v06-* em 1440/390 incluem hero, products, process, gallery, configurator, sizes, uploads, upsells, packaging, delivery, testimonials, review e sticky-total-390. Há capturas integrais extras de processo/galeria. Screenshots verificadas visualmente; referências de upload dos testes são sintéticas.

## Build, Git e limites

npm run build cria 60 arquivos públicos em dist, aproximadamente 979 KB totais nesta versão. A allowlist exclui snapshot original, docs, testes, credenciais e módulos legados. scripts/test-built-site.js repete as suítes com APEX_TEST_BUILD=1, e o servidor passa a servir exclusivamente dist. Nenhum original é publicado por esse caminho.

vercel.json mantém buildCommand npm run build, outputDirectory dist e cabeçalhos de staging/noindex. Não configurar public. O eventual Vercel Preview deve corresponder ao commit enviado nesta branch; o deploy de produção da V0.5 não serve como evidência do novo preview.

Baseline preservado: tag baseline-original-2026-09-11; index SHA-256 327d2941518821d6dc60e22ba842e43086557c90bfa5c21ee9bcfa3f3c7a65bb. Nenhum merge em main ou alteração da V0.5. Remote esperado: https://github.com/pedroh99p-bot/apex3dpersonalizados.

Pendências comerciais: homologar tarifas, escala por composição, dimensões e caixas, regras de ajustes, prazo/frete, portfólio e depoimentos reais. Próximo passo: revisar esta prévia e substituir as estimativas/referências por conteúdo aprovado. Backend e Asaas não foram iniciados.

## Commits da entrega

- fb14e9c: mapa original antes da implementação.
- 4960a04: tamanhos, preços provisórios e contrato do draft.
- 745ff5f: assets selecionados e SVGs locais.
- b10849c: página, configurador, adicionais, resumo e build público.
- Commit de testes: cobertura da conversão e execução direta em dist.
- Commit de documentação: contrato, inventário de origem, decisões e resultados.

A URL confirmada do preview e o status do push são informados na entrega após a publicação da branch. Não se presume uma URL a partir do nome do projeto.
