# PlanoPME ERP - Sistema de Planejamento e Controle de Produção (PCP)

O **PlanoPME ERP** é um sistema completo, intuitivo e persistente de gestão empresarial voltado para pequenas empresas manufatureiras, marcenarias, confecções, serralherias e oficinas que precisam planejar a capacidade de produção, gerenciar fichas técnicas (BOM) e controlar o fluxo de ordens de produção.

---

## 1. Instruções de Instalação e Execução

### Pré-requisitos
- Node.js versão 18 ou superior instalado
- Gerenciador de pacotes `npm` ou `yarn`

### Passos para Executar Localmente

1. **Instalar as dependências:**
   ```bash
   npm install
   ```

2. **Iniciar o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```
   O aplicativo estará disponível em: [http://localhost:3000](http://localhost:3000)

3. **Construir para produção (Build):**
   ```bash
   npm run build
   ```

---

## 2. Escolha Tecnológica e Justificativa de Persistência

- **Frontend:** React 19 com TypeScript e Tailwind CSS v4 para uma interface moderna, ágil e livre de dependências pesadas.
- **Ícones & UI:** Lucide React com tipografia tabular (`font-mono tabular-nums`) para precisão de números e métricas financeiras.
- **Armazenamento de Dados:** **LocalStorage Estruturado com Esquema Versionado e Exportação/Importação JSON**.
  - **Justificativa:** Pequenas empresas e oficinas precisam de agilidade imediata, sem a complexidade ou custo de manutenção de um servidor SQL dedicado (como PostgreSQL ou SQLite nativo no servidor). O armazenamento no navegador é 100% persistente entre sessões, funciona sem internet no chão de fábrica (zero latência), garante privacidade total das fórmulas industriais e permite exportar cópias de segurança (backups em `.json`) a qualquer momento.

---

## 3. Estrutura do Banco de Dados & Entidades

O banco de dados relacional foi modelado com integridade referencial:

```
[RawMaterial (Matéria-Prima)]
     ▲
     │ (1:N em Ficha Técnica)
[Product.bom (Ficha Técnica / BOM)] ──► [Product (Produto Acabado)]
                                                ▲
                                                │ (1:N)
[Partner (Cliente / Fornecedor)] ──► [Order (Pedido)] ──► [ProductionOrder (OP)]
```

### Detalhamento das Entidades:

1. **`RawMaterial` (Matéria-Prima)**
   - `id`: Identificador único (`mat-...`)
   - `code`: Código / SKU (ex: `MP-001`)
   - `name`: Nome da matéria-prima (ex: `Madeira Cedro Rosa`)
   - `unit`: Unidade de medida (`kg`, `m`, `m²`, `m³`, `un`, `l`, etc.)
   - `stockQuantity`: Saldo físico atual em estoque
   - `minStock`: Estoque mínimo de segurança (dispara alerta visual de reposição)
   - `unitCost`: Custo unitário em R$
   - `notes`: Especificações técnicas e fornecedor habitual

2. **`Product` & `ProductBOMItem` (Produto e Ficha Técnica)**
   - `id`: Identificador (`prod-...`)
   - `code`: Código do produto (ex: `PRD-001`)
   - `name`: Nome do produto acabado (ex: `Mesa de Jantar 6 Lugares`)
   - `category`: Categoria comercial
   - `unit`: Unidade de venda (`un`, `kit`, etc.)
   - `salePrice`: Preço praticado de venda em R$
   - `processTimeMinutes`: **Tempo de processo por unidade** (em minutos)
   - `stockQuantity`: Saldo em estoque de peças acabadas
   - `bom`: Lista de matérias-primas e quantidades consumidas por unidade (`materialId`, `quantity`)
   - *Cálculos Dinâmicos:* Custo dos insumos somado automaticamente a partir dos custos unitários das matérias-primas e margem bruta calculada.

3. **`Partner` (Clientes e Fornecedores)**
   - `id`: Identificador (`part-...`)
   - `type`: Classificação (`customer` = Cliente, `supplier` = Fornecedor, `both` = Ambos)
   - `name`: Nome ou Razão Social
   - `document`: CPF ou CNPJ
   - `contactName`, `phone`, `email`: Dados de contato
   - `address`: Logradouro, número, bairro, cidade, UF, CEP

4. **`CapacityConfig` (Capacidade Produtiva)**
   - `periodLabel`: Nome do período de referência (ex: Mês Operacional)
   - `workingDays`: Dias úteis no período (ex: 22 dias)
   - `hoursPerDay`: Horas trabalhadas por turno (ex: 8h)
   - `activeWorkstations`: Quantidade de operários / bancadas ativas (ex: 3)
   - `efficiencyRatePercent`: Taxa média de eficiência fabril (ex: 85%)
   - *Cálculo:* `Capacidade Efetiva = Dias × Horas/dia × Postos × (Eficiência / 100)`

5. **`Order` (Pedidos de Clientes)**
   - `id`: Identificador (`ord-...`)
   - `orderNumber`: Número do pedido (ex: `PED-2024-001`)
   - `partnerId`: Referência ao Cliente cadastrado
   - `orderDate`: Data da venda
   - `deliveryDeadline`: Prazo prometido de entrega
   - `items`: Lista de produtos (`productId`, `quantity`, `unitPrice`)
   - `totalValue`: Valor total calculado do pedido
   - `status`: `pending`, `in_production`, `completed`, `cancelled`

6. **`ProductionOrder` (Ordens de Produção - OP)**
   - `id`: Identificador (`op-...`)
   - `opNumber`: Número da OP (ex: `OP-2024-001`)
   - `productId`: Referência ao Produto
   - `quantity`: Quantidade a ser fabricada
   - `orderId`: Referência opcional ao Pedido de Cliente de origem
   - `scheduledStartDate`: Data prevista de início
   - `deadlineDate`: Prazo limite para conclusão
   - `estimatedDurationMinutes`: Tempo estimado total (`processTimeMinutes × quantity`)
   - `status`: `waiting`, `in_progress`, `completed`, `cancelled`
   - `realStartDate`: Registrado quando entra em produção
   - `realEndDate`: Registrado quando a OP é concluída
   - `stockDeducted`: Booleano indicando baixa automática de insumos

---

## 4. Guia Simples de Como Usar Cada Módulo

1. **Matérias-Primas:**
   - Acesse a aba **Matérias-Primas** para cadastrar o estoque inicial dos insumos que você compra.
   - Utilize o botão de **Movimentação (Entrada/Saída)** para registrar compras ou perdas sem precisar editar todo o cadastro.
   - Itens que ficarem abaixo do estoque mínimo recebem um alerta destacado para compras.

2. **Fichas Técnicas dos Produtos:**
   - Cadastre o produto, definindo o preço de venda e o **Tempo de Processo** por peça (em minutos).
   - Adicione os insumos necessários na tabela de **Ficha Técnica (BOM)**. O ERP soma na hora o custo de fabricação da peça e exibe a margem de lucro prevista.

3. **Clientes e Fornecedores:**
   - Mantenha o cadastro unificado com CNPJ/CPF, telefone e endereço.
   - Defina se o parceiro é cliente, fornecedor ou ambos.

4. **Capacidade Produtiva:**
   - Configure os dias úteis, horas por dia e equipe disponível.
   - Acompanhe a barra de **Taxa de Ocupação da Fábrica**: ela mostra quantas horas já estão comprometidas com as ordens ativas e quantas horas sobram para novos pedidos.

5. **Pedidos de Clientes:**
   - Lance o pedido escolhendo o cliente e adicionando os produtos.
   - Com o pedido salvo, clique em **"Gerar Ordem de Produção"**: o sistema cria as OPs correspondentes automaticamente com o prazo alinhado ao pedido!

6. **Ordens de Produção & Acompanhamento (Kanban):**
   - Visualize o chão de fábrica em colunas: **Aguardando → Em Produção → Concluída**.
   - O cartão da OP avisa se há matéria-prima suficiente no estoque.
   - Ao clicar em **"Iniciar Produção"**, o sistema registra a data/hora real de início.
   - Ao clicar em **"Concluir & Baixar"**, o ERP carimba a data de fim, **baixa automaticamente as matérias-primas da ficha técnica do estoque** e incrementa a quantidade do produto acabado pronto para entrega.

7. **Backup & Restauração:**
   - No botão **"Backup & Dados"** do topo da tela, você pode baixar um arquivo `.json` com todas as suas informações para segurança ou carregar dados salvos anteriormente.

---

## 5. Suposições Adotadas

1. **Jornada Operacional e Capacidade:** A capacidade fabril foi modelada em horas úteis por período mensal, pois é o padrão mais comum em indústrias e oficinas PME. O cálculo desconta uma taxa percentual de paradas (manutenção/troca de ferramenta).
2. **Baixa de Estoque:** A dedução física das matérias-primas consumidas ocorre quando a Ordem de Produção é marcada como **Concluída**, garantindo que perdas ou cancelamentos prévios não afetem prematuramente o inventário.
3. **Ordens de Produção Avulsas:** Além das geradas a partir de pedidos de venda, o sistema permite a criação de OPs avulsas para formação de estoque antecipado.
