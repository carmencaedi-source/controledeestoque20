import React from 'react';
import {
  Layers,
  Boxes,
  ShoppingCart,
  PlaySquare,
  AlertTriangle,
  ArrowRight,
  Plus,
  Gauge,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';

interface DashboardOverviewProps {
  onNavigate: (module: string) => void;
  onOpenNewOP: () => void;
  onOpenNewOrder: () => void;
  onOpenNewProduct: () => void;
  onOpenNewMaterial: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  onNavigate,
  onOpenNewOP,
  onOpenNewOrder,
  onOpenNewProduct,
  onOpenNewMaterial,
}) => {
  const {
    db,
    getTotalCapacityHours,
    getOccupiedHours,
    getCapacityOccupancyRate,
  } = useERP();

  const totalCapacityHours = getTotalCapacityHours();
  const occupiedHours = getOccupiedHours();
  const occupancyRate = getCapacityOccupancyRate();
  const availableHours = Math.max(0, Number((totalCapacityHours - occupiedHours).toFixed(1)));

  // Alertas de estoque
  const lowStockMaterials = db.rawMaterials.filter((m) => m.stockQuantity <= m.minStock);

  // Pedidos ativos
  const activeOrders = db.orders.filter((o) => o.status === 'pending' || o.status === 'in_production');
  const activeOrdersTotalValue = activeOrders.reduce((acc, o) => acc + o.totalValue, 0);

  // OPs ativas
  const activeOPs = db.productionOrders.filter(
    (op) => op.status === 'waiting' || op.status === 'in_progress'
  );

  return (
    <div className="space-y-6">
      {/* Top Banner / Boas-vindas operacional */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Painel de Planejamento & Controle da Produção (PCP)
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Gerencie a capacidade fabril, fichas técnicas (BOM), pedidos e o fluxo de ordens de produção.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={onOpenNewOP}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Nova Ordem (OP)
            </button>
            <button
              onClick={onOpenNewOrder}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors cursor-pointer"
            >
              <ShoppingCart className="w-3.5 h-3.5 text-slate-500" />
              Novo Pedido
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Capacidade Produtiva */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Ocupação da Fábrica
            </span>
            <Gauge className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {occupancyRate}%
            </span>
            <span className="text-xs text-slate-500 font-mono">
              ({occupiedHours}h de {totalCapacityHours}h)
            </span>
          </div>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all ${
                occupancyRate > 90
                  ? 'bg-rose-500'
                  : occupancyRate > 70
                  ? 'bg-amber-500'
                  : 'bg-indigo-600'
              }`}
              style={{ width: `${Math.min(100, occupancyRate)}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>Disponível: {availableHours}h</span>
            <button
              onClick={() => onNavigate('capacity')}
              className="text-indigo-600 hover:text-indigo-800 font-sans font-medium"
            >
              Ajustar &rarr;
            </button>
          </div>
        </div>

        {/* Card 2: Pedidos em Carteira */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Pedidos em Aberto
            </span>
            <ShoppingCart className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {activeOrders.length}
            </span>
            <span className="text-xs text-slate-500">pedidos</span>
          </div>
          <div className="mt-3 text-sm font-semibold font-mono text-slate-700">
            R$ {activeOrdersTotalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex justify-between">
            <span>Aguardando entrega</span>
            <button
              onClick={() => onNavigate('orders')}
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Ver pedidos &rarr;
            </button>
          </div>
        </div>

        {/* Card 3: Ordens de Produção Ativas */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Ordens no Chão de Fábrica
            </span>
            <PlaySquare className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {activeOPs.length}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              ({activeOPs.filter((o) => o.status === 'in_progress').length} em andamento)
            </span>
          </div>
          <div className="mt-3 text-xs text-slate-600 flex items-center gap-1 font-mono">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Tempo estimado total: {occupiedHours}h</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex justify-between">
            <span>Workflow operacional</span>
            <button
              onClick={() => onNavigate('tracking')}
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Kanban &rarr;
            </button>
          </div>
        </div>

        {/* Card 4: Alertas de Matéria-Prima */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Estoque de Insumos
            </span>
            <Boxes className="w-4 h-4 text-slate-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span
              className={`text-2xl font-bold font-mono ${
                lowStockMaterials.length > 0 ? 'text-rose-600' : 'text-slate-900'
              }`}
            >
              {lowStockMaterials.length}
            </span>
            <span className="text-xs text-slate-500">insumos críticos</span>
          </div>
          <div className="mt-3 text-xs text-slate-600 font-mono">
            Total cadastrado: {db.rawMaterials.length} matérias-primas
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex justify-between">
            <span>{lowStockMaterials.length > 0 ? 'Reposição necessária' : 'Estoque regular'}</span>
            <button
              onClick={() => onNavigate('materials')}
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Ver estoque &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: OPs Recentes + Alertas de Compras */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna 1 & 2: Ordens de Produção em Andamento */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Ordens de Produção Recentes
              </h2>
              <p className="text-xs text-slate-500">
                Status em tempo real das OPs programadas para a fábrica
              </p>
            </div>
            <button
              onClick={() => onNavigate('production')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              Ver todas ({db.productionOrders.length})
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {db.productionOrders.length === 0 ? (
            <div className="py-10 text-center text-slate-500 text-sm">
              Nenhuma ordem de produção cadastrada. Clique em "Nova Ordem (OP)" para emitir.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-medium uppercase tracking-wider">
                    <th className="pb-2.5">Código</th>
                    <th className="pb-2.5">Produto Fabricado</th>
                    <th className="pb-2.5 text-center">Qtd</th>
                    <th className="pb-2.5">Prazo</th>
                    <th className="pb-2.5">Tempo Previsto</th>
                    <th className="pb-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {db.productionOrders.slice(0, 5).map((op) => {
                    const product = db.products.find((p) => p.id === op.productId);
                    const hours = (op.estimatedDurationMinutes / 60).toFixed(1);
                    return (
                      <tr key={op.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 font-mono font-medium text-slate-900">
                          {op.opNumber}
                        </td>
                        <td className="py-3 font-medium text-slate-800">
                          {product?.name || 'Produto não encontrado'}
                        </td>
                        <td className="py-3 text-center font-mono font-semibold text-slate-900">
                          {op.quantity} {product?.unit || 'un'}
                        </td>
                        <td className="py-3 font-mono text-slate-600">
                          {op.deadlineDate}
                        </td>
                        <td className="py-3 font-mono text-slate-600">
                          {hours}h ({op.estimatedDurationMinutes}m)
                        </td>
                        <td className="py-3">
                          <span
                            className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded ${
                              op.status === 'in_progress'
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                : op.status === 'completed'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : op.status === 'waiting'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {op.status === 'in_progress'
                              ? 'Em Produção'
                              : op.status === 'completed'
                              ? 'Concluída'
                              : op.status === 'waiting'
                              ? 'Aguardando'
                              : 'Cancelada'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Coluna 3: Alertas e Ações Rápidas */}
        <div className="space-y-6">
          {/* Card Insumos Críticos */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Insumos para Reposição
              </h3>
              <button
                onClick={() => onNavigate('materials')}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Gerenciar
              </button>
            </div>

            {lowStockMaterials.length === 0 ? (
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Todos os insumos estão acima do estoque mínimo de segurança.</span>
              </div>
            ) : (
              <div className="space-y-2.5">
                {lowStockMaterials.map((mat) => (
                  <div
                    key={mat.id}
                    className="p-2.5 bg-amber-50/60 border border-amber-200 rounded-lg flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">{mat.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        Cód: {mat.code} · Mín: {mat.minStock} {mat.unit}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-rose-600">
                        {mat.stockQuantity} {mat.unit}
                      </div>
                      <div className="text-[10px] text-slate-400">em estoque</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Atalhos Rápidos */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-3">
              Atalhos de Operação
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={onOpenNewProduct}
                className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 text-left transition-colors cursor-pointer"
              >
                <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-600" />
                  Nova Ficha
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Cadastrar produto e BOM
                </div>
              </button>

              <button
                onClick={onOpenNewMaterial}
                className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 text-left transition-colors cursor-pointer"
              >
                <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <Boxes className="w-3.5 h-3.5 text-emerald-600" />
                  Novo Insumo
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Matéria-prima e custos
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
