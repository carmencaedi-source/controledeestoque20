import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  RawMaterial,
  Product,
  Partner,
  CapacityConfig,
  Order,
  ProductionOrder,
  ERPDatabase,
  OPStatus,
  OrderStatus,
} from '../types/erp';
import {
  loadDatabase,
  saveDatabase,
  exportDatabaseAsJSON,
  parseImportedJSON,
  resetDatabaseToInitial,
} from '../services/storage';

interface MaterialAvailabilityCheck {
  available: boolean;
  missingMaterials: Array<{
    materialId: string;
    materialName: string;
    unit: string;
    required: number;
    inStock: number;
    missing: number;
  }>;
}

interface ERPContextType {
  db: ERPDatabase;
  lastSync: string;

  // Raw Materials (Matérias-Primas)
  addRawMaterial: (material: Omit<RawMaterial, 'id' | 'updatedAt'>) => { success: boolean; message?: string; id?: string };
  updateRawMaterial: (id: string, material: Partial<Omit<RawMaterial, 'id' | 'updatedAt'>>) => { success: boolean; message?: string };
  deleteRawMaterial: (id: string) => { success: boolean; message?: string };
  adjustMaterialStock: (id: string, deltaQuantity: number, reason?: string) => void;

  // Products & Ficha Técnica (BOM)
  addProduct: (product: Omit<Product, 'id' | 'updatedAt'>) => { success: boolean; message?: string; id?: string };
  updateProduct: (id: string, product: Partial<Omit<Product, 'id' | 'updatedAt'>>) => { success: boolean; message?: string };
  deleteProduct: (id: string) => { success: boolean; message?: string };
  calculateProductCost: (productId: string) => number;
  checkMaterialAvailability: (productId: string, quantityToProduce: number) => MaterialAvailabilityCheck;

  // Partners (Clientes e Fornecedores)
  addPartner: (partner: Omit<Partner, 'id' | 'createdAt'>) => { success: boolean; message?: string; id?: string };
  updatePartner: (id: string, partner: Partial<Omit<Partner, 'id' | 'createdAt'>>) => { success: boolean; message?: string };
  deletePartner: (id: string) => { success: boolean; message?: string };

  // Capacity (Capacidade Produtiva)
  updateCapacity: (config: Partial<Omit<CapacityConfig, 'id'>>) => void;
  getTotalCapacityHours: () => number;
  getOccupiedHours: () => number;
  getCapacityOccupancyRate: () => number;

  // Orders (Pedidos)
  addOrder: (order: Omit<Order, 'id' | 'createdAt'>) => { success: boolean; message?: string; id?: string };
  updateOrder: (id: string, order: Partial<Omit<Order, 'id' | 'createdAt'>>) => { success: boolean; message?: string };
  deleteOrder: (id: string) => { success: boolean; message?: string };
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  generateProductionOrdersFromOrder: (orderId: string) => { success: boolean; message: string; createdCount: number };

  // Production Orders (Ordens de Produção & Acompanhamento)
  addProductionOrder: (op: Omit<ProductionOrder, 'id' | 'createdAt' | 'stockDeducted'>) => { success: boolean; message?: string; id?: string };
  updateProductionOrder: (id: string, op: Partial<Omit<ProductionOrder, 'id' | 'createdAt'>>) => { success: boolean; message?: string };
  deleteProductionOrder: (id: string) => { success: boolean; message?: string };
  updateOPStatus: (id: string, status: OPStatus, deductStock?: boolean) => { success: boolean; message?: string };

  // Utilities
  exportBackup: () => void;
  importBackup: (jsonContent: string) => { success: boolean; message: string };
  resetToDemoData: () => void;
}

const ERPContext = createContext<ERPContextType | undefined>(undefined);

export const ERPProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [db, setDb] = useState<ERPDatabase>(() => loadDatabase());

  // Salva no LocalStorage sempre que o estado db mudar
  useEffect(() => {
    saveDatabase(db);
  }, [db]);

  // ==========================================
  // MATÉRIAS-PRIMAS
  // ==========================================
  const addRawMaterial = useCallback((materialData: Omit<RawMaterial, 'id' | 'updatedAt'>) => {
    if (!materialData.name?.trim()) {
      return { success: false, message: 'O nome da matéria-prima é obrigatório.' };
    }
    if (!materialData.unit?.trim()) {
      return { success: false, message: 'A unidade de medida é obrigatória.' };
    }
    const newId = `mat-${Date.now()}`;
    const newCode = materialData.code?.trim() || `MP-${String(db.rawMaterials.length + 1).padStart(3, '0')}`;

    const newMaterial: RawMaterial = {
      ...materialData,
      id: newId,
      code: newCode,
      stockQuantity: Number(materialData.stockQuantity) || 0,
      minStock: Number(materialData.minStock) || 0,
      unitCost: Number(materialData.unitCost) || 0,
      updatedAt: new Date().toISOString(),
    };

    setDb((prev) => ({
      ...prev,
      rawMaterials: [newMaterial, ...prev.rawMaterials],
    }));

    return { success: true, id: newId };
  }, [db.rawMaterials.length]);

  const updateRawMaterial = useCallback((id: string, materialData: Partial<Omit<RawMaterial, 'id' | 'updatedAt'>>) => {
    setDb((prev) => ({
      ...prev,
      rawMaterials: prev.rawMaterials.map((m) =>
        m.id === id
          ? {
              ...m,
              ...materialData,
              stockQuantity: materialData.stockQuantity !== undefined ? Number(materialData.stockQuantity) : m.stockQuantity,
              minStock: materialData.minStock !== undefined ? Number(materialData.minStock) : m.minStock,
              unitCost: materialData.unitCost !== undefined ? Number(materialData.unitCost) : m.unitCost,
              updatedAt: new Date().toISOString(),
            }
          : m
      ),
    }));
    return { success: true };
  }, []);

  const deleteRawMaterial = useCallback((id: string) => {
    // Validação de relacionamento: verificar se insumo é usado em alguma Ficha Técnica
    const usedInProducts = db.products.filter((p) => p.bom.some((b) => b.materialId === id));
    if (usedInProducts.length > 0) {
      const prodNames = usedInProducts.map((p) => `"${p.name}"`).join(', ');
      return {
        success: false,
        message: `Não é possível excluir: esta matéria-prima está vinculada na Ficha Técnica de: ${prodNames}. Remova-a das fichas primeiro.`,
      };
    }

    setDb((prev) => ({
      ...prev,
      rawMaterials: prev.rawMaterials.filter((m) => m.id !== id),
    }));
    return { success: true };
  }, [db.products]);

  const adjustMaterialStock = useCallback((id: string, deltaQuantity: number, _reason?: string) => {
    setDb((prev) => ({
      ...prev,
      rawMaterials: prev.rawMaterials.map((m) =>
        m.id === id
          ? {
              ...m,
              stockQuantity: Math.max(0, Number((m.stockQuantity + deltaQuantity).toFixed(4))),
              updatedAt: new Date().toISOString(),
            }
          : m
      ),
    }));
  }, []);

  // ==========================================
  // PRODUTOS & FICHA TÉCNICA (BOM)
  // ==========================================
  const addProduct = useCallback((productData: Omit<Product, 'id' | 'updatedAt'>) => {
    if (!productData.name?.trim()) {
      return { success: false, message: 'O nome do produto é obrigatório.' };
    }
    const newId = `prod-${Date.now()}`;
    const newCode = productData.code?.trim() || `PRD-${String(db.products.length + 1).padStart(3, '0')}`;

    const newProduct: Product = {
      ...productData,
      id: newId,
      code: newCode,
      salePrice: Number(productData.salePrice) || 0,
      processTimeMinutes: Number(productData.processTimeMinutes) || 0,
      stockQuantity: Number(productData.stockQuantity) || 0,
      bom: productData.bom || [],
      updatedAt: new Date().toISOString(),
    };

    setDb((prev) => ({
      ...prev,
      products: [newProduct, ...prev.products],
    }));

    return { success: true, id: newId };
  }, [db.products.length]);

  const updateProduct = useCallback((id: string, productData: Partial<Omit<Product, 'id' | 'updatedAt'>>) => {
    setDb((prev) => ({
      ...prev,
      products: prev.products.map((p) =>
        p.id === id
          ? {
              ...p,
              ...productData,
              salePrice: productData.salePrice !== undefined ? Number(productData.salePrice) : p.salePrice,
              processTimeMinutes: productData.processTimeMinutes !== undefined ? Number(productData.processTimeMinutes) : p.processTimeMinutes,
              stockQuantity: productData.stockQuantity !== undefined ? Number(productData.stockQuantity) : p.stockQuantity,
              bom: productData.bom !== undefined ? productData.bom : p.bom,
              updatedAt: new Date().toISOString(),
            }
          : p
      ),
    }));
    return { success: true };
  }, []);

  const deleteProduct = useCallback((id: string) => {
    // Validação de integridade: verificar se há Pedidos ou OPs ativas com este produto
    const openOrders = db.orders.filter(
      (o) => o.status !== 'cancelled' && o.items.some((i) => i.productId === id)
    );
    if (openOrders.length > 0) {
      return {
        success: false,
        message: `Não é possível excluir: o produto consta em ${openOrders.length} pedido(s) cadastrado(s).`,
      };
    }

    const openOPs = db.productionOrders.filter(
      (op) => op.productId === id && (op.status === 'waiting' || op.status === 'in_progress')
    );
    if (openOPs.length > 0) {
      return {
        success: false,
        message: `Não é possível excluir: existem ${openOPs.length} ordem(ns) de produção em aberto para este produto.`,
      };
    }

    setDb((prev) => ({
      ...prev,
      products: prev.products.filter((p) => p.id !== id),
    }));
    return { success: true };
  }, [db.orders, db.productionOrders]);

  const calculateProductCost = useCallback((productId: string): number => {
    const product = db.products.find((p) => p.id === productId);
    if (!product || !product.bom || product.bom.length === 0) return 0;

    let totalCost = 0;
    for (const item of product.bom) {
      const material = db.rawMaterials.find((m) => m.id === item.materialId);
      if (material) {
        totalCost += (item.quantity || 0) * (material.unitCost || 0);
      }
    }
    return Number(totalCost.toFixed(2));
  }, [db.products, db.rawMaterials]);

  const checkMaterialAvailability = useCallback((productId: string, quantityToProduce: number): MaterialAvailabilityCheck => {
    const product = db.products.find((p) => p.id === productId);
    if (!product || !product.bom || product.bom.length === 0) {
      return { available: true, missingMaterials: [] };
    }

    const missing: Array<{
      materialId: string;
      materialName: string;
      unit: string;
      required: number;
      inStock: number;
      missing: number;
    }> = [];

    for (const item of product.bom) {
      const material = db.rawMaterials.find((m) => m.id === item.materialId);
      const required = item.quantity * quantityToProduce;
      const inStock = material ? material.stockQuantity : 0;
      if (inStock < required) {
        missing.push({
          materialId: item.materialId,
          materialName: material ? material.name : 'Insumo desconhecido',
          unit: material ? material.unit : 'un',
          required: Number(required.toFixed(2)),
          inStock: Number(inStock.toFixed(2)),
          missing: Number((required - inStock).toFixed(2)),
        });
      }
    }

    return {
      available: missing.length === 0,
      missingMaterials: missing,
    };
  }, [db.products, db.rawMaterials]);

  // ==========================================
  // CLIENTES E FORNECEDORES (PARTNERS)
  // ==========================================
  const addPartner = useCallback((partnerData: Omit<Partner, 'id' | 'createdAt'>) => {
    if (!partnerData.name?.trim()) {
      return { success: false, message: 'O nome / razão social é obrigatório.' };
    }
    const newId = `part-${Date.now()}`;
    const newPartner: Partner = {
      ...partnerData,
      id: newId,
      createdAt: new Date().toISOString(),
    };

    setDb((prev) => ({
      ...prev,
      partners: [newPartner, ...prev.partners],
    }));
    return { success: true, id: newId };
  }, []);

  const updatePartner = useCallback((id: string, partnerData: Partial<Omit<Partner, 'id' | 'createdAt'>>) => {
    setDb((prev) => ({
      ...prev,
      partners: prev.partners.map((p) => (p.id === id ? { ...p, ...partnerData } : p)),
    }));
    return { success: true };
  }, []);

  const deletePartner = useCallback((id: string) => {
    const tiedOrders = db.orders.filter((o) => o.partnerId === id);
    if (tiedOrders.length > 0) {
      return {
        success: false,
        message: `Não é possível excluir: este cliente possui ${tiedOrders.length} pedido(s) registrado(s).`,
      };
    }

    setDb((prev) => ({
      ...prev,
      partners: prev.partners.filter((p) => p.id !== id),
    }));
    return { success: true };
  }, [db.orders]);

  // ==========================================
  // CAPACIDADE PRODUTIVA
  // ==========================================
  const updateCapacity = useCallback((config: Partial<Omit<CapacityConfig, 'id'>>) => {
    setDb((prev) => ({
      ...prev,
      capacity: {
        ...prev.capacity,
        ...config,
      },
    }));
  }, []);

  const getTotalCapacityHours = useCallback((): number => {
    const cap = db.capacity;
    const workingDays = Number(cap.workingDays) || 0;
    const hoursPerDay = Number(cap.hoursPerDay) || 0;
    const workstations = Number(cap.activeWorkstations) || 0;
    const efficiency = (Number(cap.efficiencyRatePercent) || 100) / 100;
    const total = workingDays * hoursPerDay * workstations * efficiency;
    return Number(total.toFixed(1));
  }, [db.capacity]);

  const getOccupiedHours = useCallback((): number => {
    // Soma a duração em horas das OPs ativas (aguardando ou em produção)
    const activeOPs = db.productionOrders.filter(
      (op) => op.status === 'waiting' || op.status === 'in_progress'
    );
    const totalMinutes = activeOPs.reduce((acc, op) => acc + (op.estimatedDurationMinutes || 0), 0);
    return Number((totalMinutes / 60).toFixed(1));
  }, [db.productionOrders]);

  const getCapacityOccupancyRate = useCallback((): number => {
    const total = getTotalCapacityHours();
    if (total <= 0) return 0;
    const occupied = getOccupiedHours();
    return Number(Math.min(100, (occupied / total) * 100).toFixed(1));
  }, [getTotalCapacityHours, getOccupiedHours]);

  // ==========================================
  // PEDIDOS DE CLIENTES
  // ==========================================
  const addOrder = useCallback((orderData: Omit<Order, 'id' | 'createdAt'>) => {
    if (!orderData.partnerId) {
      return { success: false, message: 'Selecione um cliente para o pedido.' };
    }
    if (!orderData.items || orderData.items.length === 0) {
      return { success: false, message: 'O pedido deve conter pelo menos um item.' };
    }

    const newId = `ord-${Date.now()}`;
    const newNumber = orderData.orderNumber?.trim() || `PED-${String(db.orders.length + 1001)}`;

    const totalValue = orderData.items.reduce(
      (acc, item) => acc + (item.quantity || 0) * (item.unitPrice || 0),
      0
    );

    const newOrder: Order = {
      ...orderData,
      id: newId,
      orderNumber: newNumber,
      totalValue: Number(totalValue.toFixed(2)),
      createdAt: new Date().toISOString(),
    };

    setDb((prev) => ({
      ...prev,
      orders: [newOrder, ...prev.orders],
    }));

    return { success: true, id: newId };
  }, [db.orders.length]);

  const updateOrder = useCallback((id: string, orderData: Partial<Omit<Order, 'id' | 'createdAt'>>) => {
    setDb((prev) => ({
      ...prev,
      orders: prev.orders.map((o) => {
        if (o.id !== id) return o;
        const items = orderData.items || o.items;
        const totalValue = items.reduce(
          (acc, item) => acc + (item.quantity || 0) * (item.unitPrice || 0),
          0
        );
        return {
          ...o,
          ...orderData,
          items,
          totalValue: Number(totalValue.toFixed(2)),
        };
      }),
    }));
    return { success: true };
  }, []);

  const deleteOrder = useCallback((id: string) => {
    // Se houver OPs vinculadas que estão em andamento ou concluídas, alertar
    const activeOPs = db.productionOrders.filter(
      (op) => op.orderId === id && op.status !== 'cancelled'
    );
    if (activeOPs.length > 0) {
      return {
        success: false,
        message: `Existem ${activeOPs.length} ordem(ns) de produção vinculada(s) a este pedido. Cancele ou remova as OPs primeiro.`,
      };
    }

    setDb((prev) => ({
      ...prev,
      orders: prev.orders.filter((o) => o.id !== id),
    }));
    return { success: true };
  }, [db.productionOrders]);

  const updateOrderStatus = useCallback((id: string, status: OrderStatus) => {
    setDb((prev) => ({
      ...prev,
      orders: prev.orders.map((o) => (o.id === id ? { ...o, status } : o)),
    }));
  }, []);

  const generateProductionOrdersFromOrder = useCallback((orderId: string) => {
    const order = db.orders.find((o) => o.id === orderId);
    if (!order) return { success: false, message: 'Pedido não encontrado.', createdCount: 0 };

    let createdCount = 0;
    const newOPs: ProductionOrder[] = [];
    const todayStr = new Date().toISOString().split('T')[0];

    order.items.forEach((item, index) => {
      const product = db.products.find((p) => p.id === item.productId);
      if (!product) return;

      const duration = (product.processTimeMinutes || 0) * (item.quantity || 1);
      const opNum = `OP-${order.orderNumber.replace(/[^0-9]/g, '') || Date.now().toString().slice(-4)}-${index + 1}`;

      newOPs.push({
        id: `op-${Date.now()}-${index}`,
        opNumber: opNum,
        productId: product.id,
        quantity: item.quantity,
        orderId: order.id,
        scheduledStartDate: todayStr,
        deadlineDate: order.deliveryDeadline || todayStr,
        estimatedDurationMinutes: duration,
        status: 'waiting',
        stockDeducted: false,
        notes: `Gerada automaticamente a partir do pedido ${order.orderNumber}.`,
        createdAt: new Date().toISOString(),
      });
      createdCount++;
    });

    if (createdCount === 0) {
      return { success: false, message: 'Nenhum item válido para gerar ordens de produção.', createdCount: 0 };
    }

    setDb((prev) => ({
      ...prev,
      orders: prev.orders.map((o) => (o.id === orderId ? { ...o, status: 'in_production' } : o)),
      productionOrders: [...newOPs, ...prev.productionOrders],
    }));

    return {
      success: true,
      message: `${createdCount} Ordem(ns) de Produção gerada(s) com sucesso para o pedido ${order.orderNumber}!`,
      createdCount,
    };
  }, [db.orders, db.products]);

  // ==========================================
  // ORDENS DE PRODUÇÃO (OP) & ACOMPANHAMENTO
  // ==========================================
  const addProductionOrder = useCallback((opData: Omit<ProductionOrder, 'id' | 'createdAt' | 'stockDeducted'>) => {
    if (!opData.productId) {
      return { success: false, message: 'Selecione o produto a ser fabricado.' };
    }
    const quantity = Number(opData.quantity);
    if (!quantity || quantity <= 0) {
      return { success: false, message: 'A quantidade deve ser maior que zero.' };
    }

    const product = db.products.find((p) => p.id === opData.productId);
    const duration = opData.estimatedDurationMinutes || (product ? (product.processTimeMinutes || 0) * quantity : 0);
    const newId = `op-${Date.now()}`;
    const newOpNumber = opData.opNumber?.trim() || `OP-${new Date().getFullYear()}-${String(db.productionOrders.length + 1).padStart(3, '0')}`;

    const newOP: ProductionOrder = {
      ...opData,
      id: newId,
      opNumber: newOpNumber,
      quantity,
      estimatedDurationMinutes: duration,
      stockDeducted: false,
      createdAt: new Date().toISOString(),
    };

    setDb((prev) => ({
      ...prev,
      productionOrders: [newOP, ...prev.productionOrders],
    }));

    return { success: true, id: newId };
  }, [db.products, db.productionOrders.length]);

  const updateProductionOrder = useCallback((id: string, opData: Partial<Omit<ProductionOrder, 'id' | 'createdAt'>>) => {
    setDb((prev) => ({
      ...prev,
      productionOrders: prev.productionOrders.map((op) => {
        if (op.id !== id) return op;
        const quantity = opData.quantity !== undefined ? Number(opData.quantity) : op.quantity;
        const product = db.products.find((p) => p.id === (opData.productId || op.productId));
        const estimatedDurationMinutes =
          opData.estimatedDurationMinutes !== undefined
            ? opData.estimatedDurationMinutes
            : (product ? product.processTimeMinutes * quantity : op.estimatedDurationMinutes);

        return {
          ...op,
          ...opData,
          quantity,
          estimatedDurationMinutes,
        };
      }),
    }));
    return { success: true };
  }, [db.products]);

  const deleteProductionOrder = useCallback((id: string) => {
    setDb((prev) => ({
      ...prev,
      productionOrders: prev.productionOrders.filter((op) => op.id !== id),
    }));
    return { success: true };
  }, []);

  const updateOPStatus = useCallback((id: string, status: OPStatus, deductStock: boolean = true) => {
    setDb((prev) => {
      const targetOp = prev.productionOrders.find((op) => op.id === id);
      if (!targetOp) return prev;

      const nowIso = new Date().toISOString();
      let updatedRealStartDate = targetOp.realStartDate;
      let updatedRealEndDate = targetOp.realEndDate;
      let shouldDeduct = false;

      if (status === 'in_progress' && !updatedRealStartDate) {
        updatedRealStartDate = nowIso;
      }
      if (status === 'completed') {
        if (!updatedRealStartDate) updatedRealStartDate = nowIso;
        if (!updatedRealEndDate) updatedRealEndDate = nowIso;
        if (deductStock && !targetOp.stockDeducted) {
          shouldDeduct = true;
        }
      }

      // Se a ordem foi concluída e deve baixar insumos da matéria-prima
      let updatedRawMaterials = prev.rawMaterials;
      let updatedProducts = prev.products;

      if (shouldDeduct) {
        const product = prev.products.find((p) => p.id === targetOp.productId);
        if (product && product.bom && product.bom.length > 0) {
          // Baixar insumos
          updatedRawMaterials = prev.rawMaterials.map((mat) => {
            const bomItem = product.bom.find((b) => b.materialId === mat.id);
            if (!bomItem) return mat;
            const consumed = bomItem.quantity * targetOp.quantity;
            return {
              ...mat,
              stockQuantity: Math.max(0, Number((mat.stockQuantity - consumed).toFixed(4))),
              updatedAt: nowIso,
            };
          });
        }

        // Incrementar estoque do produto acabado
        updatedProducts = prev.products.map((p) =>
          p.id === targetOp.productId
            ? {
                ...p,
                stockQuantity: p.stockQuantity + targetOp.quantity,
                updatedAt: nowIso,
              }
            : p
        );
      }

      const updatedOPs = prev.productionOrders.map((op) =>
        op.id === id
          ? {
              ...op,
              status,
              realStartDate: updatedRealStartDate,
              realEndDate: updatedRealEndDate,
              stockDeducted: shouldDeduct ? true : op.stockDeducted,
            }
          : op
      );

      return {
        ...prev,
        rawMaterials: updatedRawMaterials,
        products: updatedProducts,
        productionOrders: updatedOPs,
      };
    });

    return { success: true };
  }, []);

  // ==========================================
  // BACKUP & RESTAURAÇÃO
  // ==========================================
  const exportBackup = useCallback(() => {
    exportDatabaseAsJSON(db);
  }, [db]);

  const importBackup = useCallback((jsonContent: string) => {
    try {
      const imported = parseImportedJSON(jsonContent);
      setDb(imported);
      saveDatabase(imported);
      return { success: true, message: 'Dados restaurados com sucesso!' };
    } catch (err) {
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Falha ao processar arquivo JSON de backup.',
      };
    }
  }, []);

  const resetToDemoData = useCallback(() => {
    const initial = resetDatabaseToInitial();
    setDb(initial);
  }, []);

  return (
    <ERPContext.Provider
      value={{
        db,
        lastSync: db.lastSync,
        addRawMaterial,
        updateRawMaterial,
        deleteRawMaterial,
        adjustMaterialStock,
        addProduct,
        updateProduct,
        deleteProduct,
        calculateProductCost,
        checkMaterialAvailability,
        addPartner,
        updatePartner,
        deletePartner,
        updateCapacity,
        getTotalCapacityHours,
        getOccupiedHours,
        getCapacityOccupancyRate,
        addOrder,
        updateOrder,
        deleteOrder,
        updateOrderStatus,
        generateProductionOrdersFromOrder,
        addProductionOrder,
        updateProductionOrder,
        deleteProductionOrder,
        updateOPStatus,
        exportBackup,
        importBackup,
        resetToDemoData,
      }}
    >
      {children}
    </ERPContext.Provider>
  );
};

export const useERP = (): ERPContextType => {
  const context = useContext(ERPContext);
  if (!context) {
    throw new Error('useERP deve ser usado dentro de um ERPProvider');
  }
  return context;
};
