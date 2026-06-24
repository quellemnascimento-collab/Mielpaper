# Miel Paper Co. — Configuração do Sistema Olist

## O que é e por que usar
A Olist (Olist ERP / Tray, dependendo do plano) centraliza gestão de pedidos, estoque, emissão de nota fiscal e integração com marketplaces e e-commerce próprio — reduz trabalho manual de conciliar vendas entre canais.

## Etapas de configuração

### 1. Conta e dados fiscais
- Cadastrar CNPJ, regime tributário (Simples Nacional/Lucro Presumido) e certificado digital A1 para emissão de NF-e.
- Configurar dados bancários para liquidação de marketplaces conectados.

### 2. Cadastro de produtos
- Importar os 5 SKUs da coleção cápsula (ver `LINHA_DE_PRODUTOS.md`) com: nome, descrição, fotos, peso/dimensões (para cálculo de frete), categoria fiscal (NCM) e código de barras.
- Vincular preço de venda por canal (e-commerce direto vs. marketplace, considerando a comissão — ver `financeiro/PRECIFICACAO.csv`).

### 3. Integração de canais
- Conectar e-commerce próprio (www.mielpaper.com.br) à Olist via plataforma de loja compatível (Tray, VTEX, Shopify com integração).
- Conectar marketplaces selecionados (apenas os alinhados ao posicionamento premium — evitar marketplaces de commodity que diluam a marca).

### 4. Gestão de estoque
- Definir estoque mínimo de segurança por SKU (gatilho de reposição).
- Ativar sincronização automática de estoque entre canais para evitar venda de produto esgotado.

### 5. Emissão fiscal e logística
- Configurar emissão automática de NF-e por pedido.
- Cadastrar transportadoras/Correios e regras de frete (frete fixo ou por região, conforme estratégia de margem).

### 6. Relatórios
- Configurar relatórios de vendas por canal e por SKU — alimentam o DRE mensal (`financeiro/DRE_MENSAL.csv`) e os indicadores de gestão (`financeiro/INDICADORES_GESTAO.csv`).

## Responsável
Setor de Operações (ver `ORGANOGRAMA_E_GESTAO.md`) é quem opera o dia a dia da Olist (pedidos, estoque, conciliação); Financeiro usa os relatórios extraídos para o DRE.

## Pendência
Confirmar com a Olist qual plano (ERP completo vs. apenas integrador de marketplace) atende ao volume inicial da Miel, e formalizar contrato/onboarding com o time de suporte deles.
