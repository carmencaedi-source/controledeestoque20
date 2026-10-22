/**
 * PlanoPME ERP - Sistema Integrado de Planejamento e Controle de Produção (PCP)
 */

import React, { useState } from 'react';
import { ERPProvider, useERP } from './context/ERPContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { RawMaterialsModule } from './components/materials/RawMaterialsModule';
import { ProductsModule } from './components/products/ProductsModule';
import { PartnersModule } from './components/partners/PartnersModule';
import { CapacityModule } from './components/capacity/CapacityModule';
import { OrdersModule } from './components/orders/OrdersModule';
import { ProductionModule } from './components/production/ProductionModule';
import { HelpGuideModal } from './components/help/HelpGuideModal';
import { BackupModal } from './components/common/BackupModal';
import { ProductionOrderModal } from './components/production/ProductionOrderModal';
import { OrderModal } from './components/orders/OrderModal';
import { ProductModal } from './components/products/ProductModal';
import { MaterialModal } from './components/materials/MaterialModal';

function ERPAppContent() {
  const { addProductionOrder, addOrder, addProduct, addRawMaterial } = useERP();

  const [activeModule, setActiveModule] = useState('dashboard');
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);

  // Modais de criação direta via atalhos do Dashboard
  const [isNewOPOpen, setIsNewOPOpen] = useState(false);
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [isNewProductOpen, setIsNewProductOpen] = useState(false);
  const [isNewMaterialOpen, setIsNewMaterialOpen] = useState(false);
  const [preselectedProductIdForOP, setPreselectedProductIdForOP] = useState<string | undefined>(undefined);

  const handleEmitOPForProduct = (productId: string) => {
    setPreselectedProductIdForOP(productId);
    setIsNewOPOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Bar */}
      <Header
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenBackup={() => setIsBackupOpen(true)}
      />

      {/* Main Body: Sidebar + Viewport Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar activeModule={activeModule} setActiveModule={setActiveModule} />

        {/* Viewport Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeModule === 'dashboard' && (
            <DashboardOverview
              onNavigate={(mod) => setActiveModule(mod)}
              onOpenNewOP={() => {
                setPreselectedProductIdForOP(undefined);
                setIsNewOPOpen(true);
              }}
              onOpenNewOrder={() => setIsNewOrderOpen(true)}
              onOpenNewProduct={() => setIsNewProductOpen(true)}
              onOpenNewMaterial={() => setIsNewMaterialOpen(true)}
            />
          )}

          {activeModule === 'materials' && <RawMaterialsModule />}

          {activeModule === 'products' && (
            <ProductsModule onEmitOPForProduct={handleEmitOPForProduct} />
          )}

          {activeModule === 'partners' && <PartnersModule />}

          {activeModule === 'capacity' && (
            <CapacityModule onNavigateToOPs={() => setActiveModule('tracking')} />
          )}

          {activeModule === 'orders' && (
            <OrdersModule onNavigateToTracking={() => setActiveModule('tracking')} />
          )}

          {activeModule === 'production' && (
            <ProductionModule
              initialViewMode="table"
              preselectedProductId={preselectedProductIdForOP}
            />
          )}

          {activeModule === 'tracking' && (
            <ProductionModule
              initialViewMode="kanban"
              preselectedProductId={preselectedProductIdForOP}
            />
          )}
        </main>
      </div>

      {/* Modais Globais de Apoio */}
      <HelpGuideModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      <BackupModal isOpen={isBackupOpen} onClose={() => setIsBackupOpen(false)} />

      {/* Modais Rápidos */}
      <ProductionOrderModal
        isOpen={isNewOPOpen}
        onClose={() => {
          setIsNewOPOpen(false);
          setPreselectedProductIdForOP(undefined);
        }}
        onSave={(data) => {
          const res = addProductionOrder(data);
          if (res.success) {
            setActiveModule('tracking');
          }
          return res;
        }}
        preselectedProductId={preselectedProductIdForOP}
      />

      <OrderModal
        isOpen={isNewOrderOpen}
        onClose={() => setIsNewOrderOpen(false)}
        onSave={(data) => {
          const res = addOrder(data);
          if (res.success) {
            setActiveModule('orders');
          }
          return res;
        }}
      />

      <ProductModal
        isOpen={isNewProductOpen}
        onClose={() => setIsNewProductOpen(false)}
        onSave={(data) => {
          const res = addProduct(data);
          if (res.success) {
            setActiveModule('products');
          }
          return res;
        }}
      />

      <MaterialModal
        isOpen={isNewMaterialOpen}
        onClose={() => setIsNewMaterialOpen(false)}
        onSave={(data) => {
          const res = addRawMaterial(data);
          if (res.success) {
            setActiveModule('materials');
          }
          return res;
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <ERPProvider>
      <ERPAppContent />
    </ERPProvider>
  );
}
