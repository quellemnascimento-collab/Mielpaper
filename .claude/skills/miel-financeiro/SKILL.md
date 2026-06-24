---
name: miel-financeiro
description: Gestão financeira da Miel Paper Co. — DRE, fluxo de caixa, precificação, indicadores de gestão e plano de investimento. Use ao montar planilhas, calcular preços, projetar caixa ou analisar indicadores financeiros da Miel Paper.
---

# Miel Paper Co. — Gestão Financeira

## Regra inegociável
**Nunca preencher números financeiros fictícios.** Se não houver dado real (cotação, venda, custo), deixar em branco/`[definir]` e explicitar o que falta para calcular.

## Estrutura de gestão
| Área | Função |
|---|---|
| Fluxo de caixa | Controle diário, projeção de 13 semanas |
| Precificação | Markup por categoria, considerando posicionamento premium |
| DRE mensal | Receita, CMV, despesas operacionais, margem de contribuição, resultado |
| Planejamento de investimento | Uso de capital, prioridades de alocação |
| Indicadores de gestão | CAC, LTV, ticket médio, giro de estoque, ponto de equilíbrio |

## Planilhas-modelo (estrutura de referência, ver `financeiro/`)
- `DRE_MENSAL.csv`: Receita Bruta (e-commerce/marketplace/B2B/eventos) → Deduções → Receita Líquida → CMV (matéria-prima/mão de obra/embalagem) → Lucro Bruto → Despesas Operacionais (marketing, plataforma/Olist, logística, folha, pró-labore, contabilidade, aluguel, outras) → EBITDA → Resultado Líquido → Margens.
- `FLUXO_DE_CAIXA_13_SEMANAS.csv`: saldo inicial + entradas (e-commerce/marketplace/B2B/aportes) - saídas (fornecedores, folha, marketing, plataforma, logística, impostos, contabilidade, outras) = saldo final, semana a semana.
- `PRECIFICACAO.csv`: por SKU — custo matéria-prima + mão de obra + embalagem = custo unitário → markup → preço sugerido → comissão marketplace → frete médio → margem de contribuição (R$ e %).
- `INDICADORES_GESTAO.csv`: CAC, ticket médio, LTV, taxa de recompra, giro de estoque, ponto de equilíbrio (unidades e R$) — com fórmulas.

## Plano de ação — vendas
1. Pré-venda/lista de espera (valida demanda, caixa antecipado).
2. Coleção cápsula com SKUs reduzidos (minimiza capital em estoque).
3. Canal direto (e-commerce) como prioridade (maior margem).
4. Parcerias B2B/lojas conceito como segunda onda.

## Plano de ação — investimento
Capital inicial deve cobrir: 1ª produção, identidade de marca/e-commerce, estoque mínimo viável, marketing de lançamento, 3-6 meses de reserva de caixa. Priorizar produto e prova de demanda antes de investir em estrutura/equipe.

## Cadência de gestão
- **Semanal:** fluxo de caixa e vendas.
- **Mensal:** DRE, CAC/LTV, giro de estoque.
- **Trimestral:** revisão de portfólio e prioridades de investimento.

## Como aplicar esta skill
Ao montar qualquer análise financeira para a Miel, usar exatamente esta estrutura de categorias/linhas, e recusar-se a estimar números sem base real — pedir a cotação/dado antes de preencher.
