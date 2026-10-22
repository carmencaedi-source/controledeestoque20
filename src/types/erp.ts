/**
 * PlanoPME ERP - Definições de Tipos e Entidades do Sistema
 */

// 1. Matéria-Prima
export interface RawMaterial {
  id: string;
  code: string;              // Ex: MP-001
  name: string;              // Ex: Madeira Maciça Cedro
  unit: string;              // Ex: kg, m, m², m³, un, l
  stockQuantity: number;     // Quantidade física atual
  minStock: number;          // Quantidade mínima de segurança
  unitCost: number;          // Custo unitário em R$
  notes?: string;
  updatedAt: string;
}

// Item componente da Ficha Técnica (BOM - Bill of Materials)
export interface ProductBOMItem {
  materialId: string;        // Referência à Matéria-Prima
  quantity: number;          // Quantidade consumida por unidade produzida
}

// 2. Produto Acabado & Ficha Técnica
export interface Product {
  id: string;
  code: string;              // Ex: PROD-001
  name: string;              // Ex: Mesa de Jantar 6 Lugares
  category: string;          // Ex: Mesas, Cadeiras, Armários
  unit: string;              // Ex: un, kit, conjunto
  salePrice: number;         // Preço de venda em R$
  processTimeMinutes: number;// Tempo de processo por unidade em minutos
  bom: ProductBOMItem[];     // Lista de insumos necessários por unidade
  stockQuantity: number;     // Estoque de produtos prontos
  description?: string;
  updatedAt: string;
}

// 3. Clientes e Fornecedores
export type PartnerType = 'customer' | 'supplier' | 'both';

export interface PartnerAddress {
  street: string;
  number: string;
  complement?: string;
  neighborhood?: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface Partner {
  id: string;
  type: PartnerType;         // 'customer' | 'supplier' | 'both'
  name: string;              // Razão Social ou Nome Fantasia
  document: string;          // CNPJ ou CPF
  contactName?: string;      // Pessoa de contato
  email: string;
  phone: string;
  address: PartnerAddress;
  notes?: string;
  createdAt: string;
}

// 4. Capacidade Produtiva
export interface CapacityConfig {
  id: string;
  periodLabel: string;             // Ex: "Outubro/2024" ou "Mensal"
  workingDays: number;             // Ex: 22 dias úteis no mês
  hoursPerDay: number;             // Ex: 8 horas diárias
  activeWorkstations: number;      // Ex: 3 operários / postos de trabalho
  efficiencyRatePercent: number;   // Ex: 85% de eficiência média
  notes?: string;
}

// 5. Pedidos de Clientes
export interface OrderItem {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export type OrderStatus = 'pending' | 'in_production' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  orderNumber: string;             // Ex: PED-1001
  partnerId: string;               // Referência ao Cliente
  orderDate: string;               // Data do pedido (YYYY-MM-DD)
  deliveryDeadline: string;        // Prazo prometido (YYYY-MM-DD)
  items: OrderItem[];
  totalValue: number;              // Valor total em R$
  status: OrderStatus;             // 'pending' | 'in_production' | 'completed' | 'cancelled'
  notes?: string;
  createdAt: string;
}

// 6 & 7 & 8. Ordens de Produção (OP) e Acompanhamento
export type OPStatus = 'waiting' | 'in_progress' | 'completed' | 'cancelled';

export interface ProductionOrder {
  id: string;
  opNumber: string;                // Ex: OP-2024-001
  productId: string;               // Produto a fabricar
  quantity: number;                // Quantidade planejada
  orderId?: string;                // Pedido de origem (opcional)
  scheduledStartDate: string;      // Início previsto (YYYY-MM-DD)
  deadlineDate: string;            // Prazo limite (YYYY-MM-DD)
  estimatedDurationMinutes: number;// Calculado: processTimeMinutes * quantity
  status: OPStatus;                // 'waiting' | 'in_progress' | 'completed' | 'cancelled'
  realStartDate?: string;          // Registrado quando entra 'in_progress'
  realEndDate?: string;            // Registrado quando entra 'completed'
  stockDeducted: boolean;          // Indica se insumos foram baixados do estoque
  notes?: string;
  createdAt: string;
}

// Estado consolidado do banco de dados local
export interface ERPDatabase {
  rawMaterials: RawMaterial[];
  products: Product[];
  partners: Partner[];
  capacity: CapacityConfig;
  orders: Order[];
  productionOrders: ProductionOrder[];
  version: number;
  lastSync: string;
}
