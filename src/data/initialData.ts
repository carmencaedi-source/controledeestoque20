import { ERPDatabase } from '../types/erp';

export const INITIAL_ERP_DATA: ERPDatabase = {
  version: 1,
  lastSync: new Date().toISOString(),
  
  // 1. Matérias-Primas Cadastradas
  rawMaterials: [
    {
      id: 'mat-1',
      code: 'MP-001',
      name: 'Madeira Maciça Cedro Rosa',
      unit: 'm³',
      stockQuantity: 4.8,
      minStock: 2.0,
      unitCost: 3200.00,
      notes: 'Tábuas selecionadas secas em estufa 25mm',
      updatedAt: '2024-10-15T09:00:00Z',
    },
    {
      id: 'mat-2',
      code: 'MP-002',
      name: 'Tecido Linho Bege Imperial',
      unit: 'm',
      stockQuantity: 45.0,
      minStock: 20.0,
      unitCost: 48.00,
      notes: 'Tecido de alta durabilidade com proteção antimanchas',
      updatedAt: '2024-10-16T14:30:00Z',
    },
    {
      id: 'mat-3',
      code: 'MP-003',
      name: 'Espuma D33 Alta Resiliência',
      unit: 'm²',
      stockQuantity: 28.0,
      minStock: 15.0,
      unitCost: 35.00,
      notes: 'Espuma de 5cm para assento ergonômico',
      updatedAt: '2024-10-16T14:35:00Z',
    },
    {
      id: 'mat-4',
      code: 'MP-004',
      name: 'Parafuso Estrutural Torx 5x60mm',
      unit: 'un',
      stockQuantity: 420.0,
      minStock: 150.0,
      unitCost: 0.65,
      notes: 'Aço bicromatizado com rosca soberba',
      updatedAt: '2024-10-14T11:00:00Z',
    },
    {
      id: 'mat-5',
      code: 'MP-005',
      name: 'Verniz Poliuretano Fosco',
      unit: 'l',
      stockQuantity: 8.5,
      minStock: 10.0, // Abaixo do mínimo! Alerta para o usuário
      unitCost: 72.00,
      notes: 'Acabamento acetinado impermeável premium',
      updatedAt: '2024-10-18T16:00:00Z',
    },
    {
      id: 'mat-6',
      code: 'MP-006',
      name: 'Cola Especial para Madeira D3',
      unit: 'kg',
      stockQuantity: 12.0,
      minStock: 5.0,
      unitCost: 38.00,
      notes: 'Resistente à umidade interna e externa',
      updatedAt: '2024-10-15T10:15:00Z',
    },
    {
      id: 'mat-7',
      code: 'MP-007',
      name: 'Puxador Cava Latão Escovado',
      unit: 'un',
      stockQuantity: 18.0,
      minStock: 12.0,
      unitCost: 26.50,
      notes: 'Puxador embutido para gavetas de aparador',
      updatedAt: '2024-10-17T08:45:00Z',
    },
  ],

  // 2. Fichas Técnicas dos Produtos
  products: [
    {
      id: 'prod-1',
      code: 'PRD-001',
      name: 'Mesa de Jantar 6 Lugares Minimalista',
      category: 'Mesas',
      unit: 'un',
      salePrice: 2450.00,
      processTimeMinutes: 240, // 4 horas por unidade
      stockQuantity: 1,
      description: 'Mesa retangular em madeira maciça com tampo chanfrado e travamento reforçado.',
      updatedAt: '2024-10-18T10:00:00Z',
      bom: [
        { materialId: 'mat-1', quantity: 0.18 }, // Madeira: 0.18 m³
        { materialId: 'mat-4', quantity: 24 },   // Parafusos: 24 un
        { materialId: 'mat-5', quantity: 1.5 },  // Verniz: 1.5 l
        { materialId: 'mat-6', quantity: 0.8 },  // Cola: 0.8 kg
      ],
    },
    {
      id: 'prod-2',
      code: 'PRD-002',
      name: 'Cadeira Estofada Espaldar Curvo',
      category: 'Cadeiras',
      unit: 'un',
      salePrice: 490.00,
      processTimeMinutes: 90, // 1.5 horas por unidade
      stockQuantity: 6,
      description: 'Cadeira com encosto anatômico curvo e assento em linho impermeabilizado.',
      updatedAt: '2024-10-18T10:30:00Z',
      bom: [
        { materialId: 'mat-1', quantity: 0.035 }, // Madeira: 0.035 m³
        { materialId: 'mat-2', quantity: 1.2 },   // Tecido Linho: 1.2 m
        { materialId: 'mat-3', quantity: 0.8 },   // Espuma D33: 0.8 m²
        { materialId: 'mat-4', quantity: 12 },    // Parafusos: 12 un
        { materialId: 'mat-5', quantity: 0.3 },   // Verniz: 0.3 l
        { materialId: 'mat-6', quantity: 0.3 },   // Cola: 0.3 kg
      ],
    },
    {
      id: 'prod-3',
      code: 'PRD-003',
      name: 'Aparador Buffet 3 Gavetas Nórdico',
      category: 'Aparadores',
      unit: 'un',
      salePrice: 1780.00,
      processTimeMinutes: 180, // 3 horas por unidade
      stockQuantity: 2,
      description: 'Aparador com três gavetas telescópicas com puxadores de latão escovado.',
      updatedAt: '2024-10-18T11:00:00Z',
      bom: [
        { materialId: 'mat-1', quantity: 0.12 }, // Madeira: 0.12 m³
        { materialId: 'mat-4', quantity: 18 },   // Parafusos: 18 un
        { materialId: 'mat-5', quantity: 0.9 },  // Verniz: 0.9 l
        { materialId: 'mat-6', quantity: 0.5 },  // Cola: 0.5 kg
        { materialId: 'mat-7', quantity: 3 },    // Puxadores: 3 un
      ],
    },
  ],

  // 3. Clientes e Fornecedores
  partners: [
    {
      id: 'part-1',
      type: 'supplier',
      name: 'Madeireira Cedro Forte Ltda',
      document: '14.289.452/0001-89',
      contactName: 'Carlos Eduardo',
      email: 'comercial@cedroforte.com.br',
      phone: '(11) 98765-4321',
      address: {
        street: 'Rodovia das Indústrias',
        number: '1420',
        neighborhood: 'Distrito Industrial',
        city: 'Piracicaba',
        state: 'SP',
        zipCode: '13400-000',
      },
      notes: 'Principal fornecedor de cedro e madeiras nobres com certificado FSC.',
      createdAt: '2024-01-10T08:00:00Z',
    },
    {
      id: 'part-2',
      type: 'supplier',
      name: 'Química Vernizes & Resinas Brasil',
      document: '29.118.990/0001-44',
      contactName: 'Mariana Souza',
      email: 'vendas@quimicaresinas.com.br',
      phone: '(19) 3456-7890',
      address: {
        street: 'Av. dos Químicos',
        number: '85',
        neighborhood: 'Pólo Petroquímico',
        city: 'Campinas',
        state: 'SP',
        zipCode: '13050-100',
      },
      notes: 'Entrega semanal às terças-feiras.',
      createdAt: '2024-02-15T09:30:00Z',
    },
    {
      id: 'part-3',
      type: 'customer',
      name: 'Espaço Contemporâneo Decorações Ltda',
      document: '08.972.331/0001-52',
      contactName: 'Renata Vasconcelos',
      email: 'compras@espacocontemporaneo.com.br',
      phone: '(11) 99123-5566',
      address: {
        street: 'Alameda Gabriel Monteiro da Silva',
        number: '910',
        neighborhood: 'Jardins',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01442-000',
      },
      notes: 'Boutique de decoração de alto padrão. Pagamento 30 dias.',
      createdAt: '2024-03-20T14:00:00Z',
    },
    {
      id: 'part-4',
      type: 'customer',
      name: 'Studio Helena Valente Arquitetura',
      document: '382.491.708-25',
      contactName: 'Helena Valente',
      email: 'helena@valentedesign.com.br',
      phone: '(11) 97654-1122',
      address: {
        street: 'Rua Bela Cintra',
        number: '1240',
        complement: 'Cj 42',
        neighborhood: 'Consolação',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01415-000',
      },
      notes: 'Arquiteta parceira com pedidos residenciais frequentes.',
      createdAt: '2024-05-12T11:20:00Z',
    },
    {
      id: 'part-5',
      type: 'both',
      name: 'Ferragens & Acessórios União Ltda',
      document: '05.342.119/0001-18',
      contactName: 'Gilberto Lima',
      email: 'contato@ferragensuniao.com.br',
      phone: '(11) 2291-8800',
      address: {
        street: 'Rua do Gasômetro',
        number: '315',
        neighborhood: 'Brás',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '03004-000',
      },
      notes: 'Fornece ferragens e também adquire móveis para mostruário de lojas parceiras.',
      createdAt: '2024-04-02T16:45:00Z',
    },
  ],

  // 4. Capacidade Produtiva Configurada
  capacity: {
    id: 'cap-default',
    periodLabel: 'Mês Operacional Padrão',
    workingDays: 22,               // 22 dias úteis
    hoursPerDay: 8,                // 8 horas por dia
    activeWorkstations: 3,         // 3 marceneiros / postos de trabalho
    efficiencyRatePercent: 85,     // 85% de eficiência
    notes: 'Capacidade líquida estimada em 448.8 horas por mês considerando paradas de manutenção e trocas de ferramenta.',
  },

  // 5. Pedidos de Clientes
  orders: [
    {
      id: 'ord-1',
      orderNumber: 'PED-2024-001',
      partnerId: 'part-3', // Espaço Contemporâneo
      orderDate: '2024-10-10',
      deliveryDeadline: '2024-11-05',
      items: [
        { productId: 'prod-1', quantity: 2, unitPrice: 2450.00 }, // 2x Mesa = 4.900
        { productId: 'prod-2', quantity: 12, unitPrice: 490.00 }, // 12x Cadeira = 5.880
      ],
      totalValue: 10780.00,
      status: 'in_production',
      notes: 'Conjunto completo para showroom principal de fim de ano.',
      createdAt: '2024-10-10T10:00:00Z',
    },
    {
      id: 'ord-2',
      orderNumber: 'PED-2024-002',
      partnerId: 'part-4', // Studio Helena Valente
      orderDate: '2024-10-15',
      deliveryDeadline: '2024-11-12',
      items: [
        { productId: 'prod-3', quantity: 1, unitPrice: 1780.00 }, // 1x Aparador = 1.780
        { productId: 'prod-2', quantity: 4, unitPrice: 490.00 },  // 4x Cadeira = 1.960
      ],
      totalValue: 3740.00,
      status: 'pending',
      notes: 'Projeto Residência Jardins - Aguardando confirmação do tom do linho.',
      createdAt: '2024-10-15T14:30:00Z',
    },
    {
      id: 'ord-3',
      orderNumber: 'PED-2024-003',
      partnerId: 'part-5', // Ferragens União
      orderDate: '2024-09-20',
      deliveryDeadline: '2024-10-05',
      items: [
        { productId: 'prod-3', quantity: 2, unitPrice: 1780.00 },
      ],
      totalValue: 3560.00,
      status: 'completed',
      notes: 'Móveis entregues e faturados com pontualidade.',
      createdAt: '2024-09-20T09:00:00Z',
    },
  ],

  // 6, 7 & 8. Ordens de Produção (OP)
  productionOrders: [
    {
      id: 'op-1',
      opNumber: 'OP-2024-001',
      productId: 'prod-1', // Mesa de Jantar
      quantity: 2,
      orderId: 'ord-1',    // Vinculado a PED-2024-001
      scheduledStartDate: '2024-10-16',
      deadlineDate: '2024-10-25',
      estimatedDurationMinutes: 480, // 2 * 240min = 8h
      status: 'in_progress',
      realStartDate: '2024-10-16T08:00:00Z',
      stockDeducted: false,
      notes: 'Corte de madeira concluído, montando estrutura do tampo.',
      createdAt: '2024-10-11T09:00:00Z',
    },
    {
      id: 'op-2',
      opNumber: 'OP-2024-002',
      productId: 'prod-2', // Cadeira Estofada
      quantity: 12,
      orderId: 'ord-1',    // Vinculado a PED-2024-001
      scheduledStartDate: '2024-10-23',
      deadlineDate: '2024-11-02',
      estimatedDurationMinutes: 1080, // 12 * 90min = 18h
      status: 'waiting',
      stockDeducted: false,
      notes: 'Aguardando liberação da bancada de estofamento após montagem das mesas.',
      createdAt: '2024-10-11T09:15:00Z',
    },
    {
      id: 'op-3',
      opNumber: 'OP-2024-003',
      productId: 'prod-3', // Aparador Buffet
      quantity: 2,
      orderId: 'ord-3',    // Vinculado a PED-2024-003
      scheduledStartDate: '2024-09-22',
      deadlineDate: '2024-10-02',
      estimatedDurationMinutes: 360, // 2 * 180min = 6h
      status: 'completed',
      realStartDate: '2024-09-22T08:30:00Z',
      realEndDate: '2024-10-01T17:00:00Z',
      stockDeducted: true,
      notes: 'Lote finalizado com acabamento aprovado no controle de qualidade.',
      createdAt: '2024-09-21T11:00:00Z',
    },
  ],
};
