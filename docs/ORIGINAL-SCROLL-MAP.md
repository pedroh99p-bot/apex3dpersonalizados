# Mapa de rolagem original → Apex V0.6

Registrado antes da implementação. Base: baseline-original-2026-09-11, comparada à V0.5 353fb44. O HTML original permanece intacto. Objetivo: tornar produto/preço/processo visíveis e organizar configuração progressiva, sem marca ou transações do concorrente.

## Ordem completa e decisões

| Elemento original / linhas | Decisão | Destino Apex |
| --- | --- | --- |
| Documento / H1–25 | KEEP_V05 | Manter HTML semântico, PT-BR, metadados de staging e FAQ honesto. |
| Dados estruturados / H26–191 | REMOVE | Integração, promessa ou oferta não homologada; não executar nem importar. |
| Infraestrutura / H192–757 | REMOVE | Integração, promessa ou oferta não homologada; não executar nem importar. |
| Header / H763–912 | REDESIGN | Recuperar hierarquia, composição e clareza com tokens, componentes e estado Apex. |
| Hero/galeria / H914–1155 | RESTORE | Galeria local e cards de processo com imagens inspecionadas e ORIGIN_REVIEW_REQUIRED. |
| Oferta/prova/vídeo / H1156–1247 | REDESIGN | Recuperar hierarquia, composição e clareza com tokens, componentes e estado Apex. |
| Escolha do modelo / H1248–1345 | REDESIGN | Recuperar hierarquia, composição e clareza com tokens, componentes e estado Apex. |
| Formulário e CTA / H1349–1389 | REDESIGN | Recuperar hierarquia, composição e clareza com tokens, componentes e estado Apex. |
| Esboço/B2B / H1390–1441 | REMOVE | Integração, promessa ou oferta não homologada; não executar nem importar. |
| Minidepoimentos / H1442–1545 | REDESIGN | Cards estruturados claramente identificados como espaços reservados, sem notas/comentários fictícios. |
| Configurador/container / H1547–6748 | REDESIGN | Recuperar hierarquia, composição e clareza com tokens, componentes e estado Apex. |
| Rosto/cabelo/olhos/óculos/boca / H1559–2101 | KEEP_V05 | A foto permanece referência visual; não cobrar aparência nem reabrir etapas manuais desnecessárias. |
| Pele / H2102–2228 | KEEP_V05 | A foto permanece referência visual; não cobrar aparência nem reabrir etapas manuais desnecessárias. |
| Roupa / H2229–2396 | REDESIGN | Recuperar hierarquia, composição e clareza com tokens, componentes e estado Apex. |
| Pets adicionais / H2397–2919 | REDESIGN | Recuperar hierarquia, composição e clareza com tokens, componentes e estado Apex. |
| Acessórios e logos / H2920–4586 | REDESIGN | Recuperar hierarquia, composição e clareza com tokens, componentes e estado Apex. |
| Catálogo especial / H3036–4498 (dentro de extras) | REDESIGN | Recuperar hierarquia, composição e clareza com tokens, componentes e estado Apex. |
| Logos / H4509–4586 | REDESIGN | Recuperar hierarquia, composição e clareza com tokens, componentes e estado Apex. |
| Tamanho humano/comparação / H4587–4726 | REDESIGN | Recuperar hierarquia, composição e clareza com tokens, componentes e estado Apex. |
| Tamanho do pet principal / H4727–4846 | REDESIGN | Recuperar hierarquia, composição e clareza com tokens, componentes e estado Apex. |
| Espécie/foto pet principal / H4847–5098 | REDESIGN | Recuperar hierarquia, composição e clareza com tokens, componentes e estado Apex. |
| Olhos pet / H5099–5277 | KEEP_V05 | A foto permanece referência visual; não cobrar aparência nem reabrir etapas manuais desnecessárias. |
| Acessórios/extras pet legados / H5278–5643 | REDESIGN | Recuperar hierarquia, composição e clareza com tokens, componentes e estado Apex. |
| Minis / H5644–5863 | REMOVE | Integração, promessa ou oferta não homologada; não executar nem importar. |
| Bases/proteção/ímãs / H5864–6149 | REDESIGN | Recuperar hierarquia, composição e clareza com tokens, componentes e estado Apex. |
| Caixa/dedicatória / H6150–6371 | REDESIGN | Recuperar hierarquia, composição e clareza com tokens, componentes e estado Apex. |
| Prazo/data/comentários / H6372–6516 | REDESIGN | Recuperar hierarquia, composição e clareza com tokens, componentes e estado Apex. |
| Upsell de presente / H6517–6687 | REMOVE | Integração, promessa ou oferta não homologada; não executar nem importar. |
| Grupos técnicos pet / H6688–6702 | REMOVE | Integração, promessa ou oferta não homologada; não executar nem importar. |
| Resumo / H6708–6744 | REDESIGN | Recuperar hierarquia, composição e clareza com tokens, componentes e estado Apex. |
| Números/prova social / H6750–6799 | REMOVE | Não reaproveitar contadores nem resultados comerciais de terceiros. |
| Avaliações / H6800–6985 | REDESIGN | Cards estruturados claramente identificados como espaços reservados, sem notas/comentários fictícios. |
| Processo / H6986–7108 | RESTORE | Galeria local e cards de processo com imagens inspecionadas e ORIGIN_REVIEW_REQUIRED. |
| FAQ / H7109–7253 | KEEP_V05 | Manter HTML semântico, PT-BR, metadados de staging e FAQ honesto. |
| Trabalhos / H7254–7325 | RESTORE | Galeria local e cards de processo com imagens inspecionadas e ORIGIN_REVIEW_REQUIRED. |
| Garantias / H7326–7406 | REDESIGN | Recuperar hierarquia, composição e clareza com tokens, componentes e estado Apex. |
| Modal vídeo / H7408–7423 | REMOVE | Integração, promessa ou oferta não homologada; não executar nem importar. |
| Carrinho lateral / H7424–7499 | REMOVE | Integração, promessa ou oferta não homologada; não executar nem importar. |
| Barra fixa / H7500–7540 | REDESIGN | Recuperar hierarquia, composição e clareza com tokens, componentes e estado Apex. |
| Footer / H7541–7646 | REDESIGN | Recuperar hierarquia, composição e clareza com tokens, componentes e estado Apex. |
| Consentimento/scripts finais / H7648–7942 | REMOVE | Integração, promessa ou oferta não homologada; não executar nem importar. |

## Evidência além do HTML

- CSS original consultado por leitura HTTP, sem execução/incorporação: info-tabs (grades 3/2/1 colunas, cards de 26 px e creme), summary-card (painel arredondado, divisão de preço), step-nav (estado/progresso), extra-step (cards 3 colunas e badges), delivery-section (cards de modalidade e calendário).
- JS original consultado como texto: product-hero.js usa legendas/tipos, setActiveSlide, filtro e pointerdown/move/up; step-nav.js calcula próximo/concluído, etapas opcionais e erros. A V0.6 terá implementação própria e validação Apex.
- SVG inline: inventário INLINE-ASSETS, 268 ocorrências; ícones de etapa, controles, caminhão, estrelas e marcas. Recriar sistema local de traço consistente sem ícones de marca.
- backgrounds e fontes: ASSET-INVENTORY registra URLs de CSS e fontes; não reintroduzir fontes externas ou sprites históricos.
- Galeria H917–1153 usa src/srcset/sizes, loading e data-mf-slide-legend. Processo H7006–7094 usa nove WebP; bases/caixas H5919–6253 são WebP; avaliar visualmente antes de usar.
- Evidência de consulta temporária: test-results/v06-baseline-inspection.json (status, hashes e propriedades). Inventários históricos mantêm as origens completas.

## Rolagem V0.5 versus V0.6

V0.5: navbar → hero → confiança → três passos em texto → modelos → formulário inteiro → três exemplos → benefícios → FAQ → footer.

V0.6: navbar → hero com preço inicial → modelos selecionáveis → oito passos visuais de processo → galeria densa → configurador progressivo/resumo → confiança/depoimentos de staging → FAQ → footer. CTAs apontam à configuração, sem checkout.

## Tamanhos originais e limite de homologação

| Regra | Original (EUR, só referência) | Apex aprovado no início |
| --- | --- | --- |
| Humano | 6 +0; 10 +20; 15 +45; 20 +65, por pessoa nos produtos de duas figuras | 6 cm +R$0 |
| Pet principal | 6 +0; 10 +20; 15 +40; 20 +60 | 6 cm +R$0 |
| Pet adicional | 4 +0; 6 +10; 10 +40 | 4 cm, +R$79 por pet |
| Caixa individual | 6/10 +10; 15 +15 | 6 cm +R$39 |
| Caixa dupla | 6/10 +15; 15 +20 | Sem tabela Apex separada |
| Caixa 20 cm | Indisponível | Não liberar sem regra e preço Apex |
| Extras | Base suporte/proteção/ímãs incluídos no original; nome +6; nome/data +10; grama +8 | Só base sem gravação/embalagem padrão inclusas; nome +R$19, nome/data +R$29 |

Não converter EUR por simples troca de símbolo. Valores BRL para 10/15/20 e caixas aguardam informação do proprietário. Se não houver aprovação, mostrar apenas 6 cm selecionável; medidas maiores podem ser informadas como indisponíveis, sem preço inventado nem badge “mais escolhido”.
