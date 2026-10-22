import React from 'react';
import {
  LayoutDashboard,
  Layers,
  Boxes,
  Users,
  Gauge,
  ShoppingCart,
  Clock,
  PlaySquare,
  KanbanSquare,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';

interface SidebarProps {
  activeModule: string;
  setActiveModule: (module: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeModule, setActiveModule }) => {
  const { db } = useERP();

  // Contadores para os badges informativos
  const lowStockCount = db.rawMaterials.filter((m) => m.stockQuantity <= m.minStock).length;
  const pendingOrdersCount = db.orders.filter((o) => o.status === 'pending' || o.status === 'in_production').length;
  const activeOPsCount = db.productionOrders.filter((op) => op.status === 'waiting' || op.status === 'in_progress').length;

  const menuSections = [
    {
      group: 'Visão Geral',
      items: [
        { id: 'dashboard', label: 'Painel Geral', icon: LayoutDashboard },
      ],
    },
    {
      group: 'Cadastros Base',
      items: [
        {
          id: 'materials',
          label: 'Matérias-Primas',
          icon: Boxes,
          badge: lowStockCount > 0 ? `${lowStockCount} baixo` : undefined,
          badgeType: 'warning',
        },
        {
          id: 'products',
          label: 'Fichas Técnicas',
          icon: Layers,
          badge: `${db.products.length}`,
        },
        {
          id: 'partners',
          label: 'Clientes e Fornecedores',
          icon: Users,
          badge: `${db.partners.length}`,
        },
      ],
    },
    {
      group: 'Planejamento & Vendas',
      items: [
        {
          id: 'capacity',
          label: 'Capacidade Produtiva',
          icon: Gauge,
        },
        {
          id: 'orders',
          label: 'Pedidos de Clientes',
          icon: ShoppingCart,
          badge: pendingOrdersCount > 0 ? `${pendingOrdersCount}` : undefined,
          badgeType: 'info',
        },
      ],
    },
    {
      group: 'Chão de Fábrica',
      items: [
        {
          id: 'production',
          label: 'Ordens de Produção',
          icon: PlaySquare,
          badge: activeOPsCount > 0 ? `${activeOPsCount}` : undefined,
          badgeType: 'accent',
        },
        {
          id: 'tracking',
          label: 'Acompanhamento Kanban',
          icon: KanbanSquare,
        },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="p-4 border-b border-slate-100">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2">
          Módulos ERP
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-6 overflow-y-auto">
        {menuSections.map((sec, i) => (
          <div key={i} className="space-y-1">
            <h4 className="px-3 text-xs font-medium text-slate-400 tracking-wider uppercase mb-1">
              {sec.group}
            </h4>
            {sec.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeModule === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveModule(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer text-left ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-600' : 'text-slate-500'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-xs font-mono px-1.5 py-0.5 rounded text-right whitespace-nowrap ${
                        item.badgeType === 'warning'
                          ? 'bg-amber-100 text-amber-800 font-medium'
                          : item.badgeType === 'accent'
                          ? 'bg-indigo-100 text-indigo-800 font-medium'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Box rodapé da sidebar com status de sincronização */}
      <div className="p-4 border-t border-slate-100 bg-slate-50 text-xs text-slate-500">
        <div className="flex items-center justify-between">
          <span className="font-medium text-slate-700">Armazenamento</span>
          <span className="text-emerald-700 font-mono text-[11px]">Local / Salvo</span>
        </div>
        <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">
          Dados persistidos no navegador. Faça cópias periódicas no botão Backup.
        </p>
      </div>
    </aside>
  );
};
