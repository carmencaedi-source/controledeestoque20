import React, { useState } from 'react';
import {
  PlaySquare,
  Plus,
  Search,
  KanbanSquare,
  Table as TableIcon,
  Clock,
  Calendar,
  Play,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Trash2,
  Edit2,
  User,
  Package,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { ProductionOrder, OPStatus } from '../../types/erp';
import { ProductionOrderModal } from './ProductionOrderModal';
import { OPDetailsModal } from './OPDetailsModal';

interface ProductionModuleProps {
  initialViewMode?: 'kanban' | 'table';
  preselectedProductId?: string;
}

export const ProductionModule: React.FC<ProductionModuleProps> = ({
  initialViewMode = 'kanban',
  preselectedProductId,
}) => {
  const {
    db,
    addProductionOrder,
    updateProductionOrder,
    deleteProductionOrder,
    updateOPStatus,
    checkMaterialAvailability,
  } = useERP();

  const [viewMode, setViewMode] = useState<'kanban' | 'table'>(initialViewMode);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | OPStatus>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingOP, setEditingOP] = useState<ProductionOrder | null>(null);
  const [viewingOP, setViewingOP] = useState<ProductionOrder | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const filteredOPs = db.productionOrders.filter((op) => {
    const product = db.products.find((p) => p.id === op.productId);
    const order = op.orderId ? db.orders.find((o) => o.id === op.orderId) : null;
    const customer = order ? db.partners.find((p) => p.id === order.partnerId) : null;

    const matchesSearch =
      op.opNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product && product.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order && order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (customer && customer.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || op.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleOpenCreate = () => {
    setEditingOP(null);
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (op: ProductionOrder) => {
    setEditingOP(op);
    setIsCreateModalOpen(true);
  };

  const handleDelete = (id: string, num: string) => {
    if (!window.confirm(`Deseja realmente excluir a ordem de produção ${num}?`)) {
      return;
    }

    const res = deleteProductionOrder(id);
    if (res.success) {
      setStatusMessage({ text: `Ordem ${num} excluída com sucesso.`, type: 'success' });
      setTimeout(() => setStatusMessage(null), 4000);
    } else {
      setStatusMessage({ text: res.message || 'Erro ao excluir.', type: 'error' });
      setTimeout(() => setStatusMessage(null), 6000);
    }
  };

  const handleSave = (data: Omit<ProductionOrder, 'id' | 'createdAt' | 'stockDeducted'>) => {
    if (editingOP) {
      const res = updateProductionOrder(editingOP.id, data);
      if (res.success) {
        setStatusMessage({ text: 'Ordem de produção atualizada com sucesso.', type: 'success' });
        setTimeout(() => setStatusMessage(null), 4000);
      }
      return res;
    } else {
      const res = addProductionOrder(data);
      if (res.success) {
        setStatusMessage({ text: 'Ordem de produção emitida com sucesso!', type: 'success' });
        setTimeout(() => setStatusMessage(null), 4000);
      }
      return res;
    }
  };

  const handleStatusChange = (id: string, newStatus: OPStatus, deductStock: boolean = true) => {
    const res = updateOPStatus(id, newStatus, deductStock);
    if (res.success) {
      const target = db.productionOrders.find((o) => o.id === id);
      const label =
        newStatus === 'in_progress'
          ? 'iniciada'
          : newStatus === 'completed'
          ? 'concluída (estoque atualizado)'
          : newStatus === 'waiting'
          ? 'retornada para aguardando'
          : 'cancelada';

      setStatusMessage({
        text: `Ordem ${target?.opNumber || ''} ${label} com sucesso.`,
        type: 'success',
      });
      setTimeout(() => setStatusMessage(null), 4000);

      // Atualiza o modal de detalhes caso esteja aberto
      if (viewingOP && viewingOP.id === id) {
        const updated = db.productionOrders.find((o) => o.id === id);
        if (updated) {
          setViewingOP({ ...updated, status: newStatus });
        }
      }
    }
  };

  const kanbanColumns: Array<{ id: OPStatus; label: string; color: string; desc: string }> = [
    { id: 'waiting', label: 'Aguardando', color: 'border-amber-300 bg-amber-50/50', desc: 'Em fila de programação' },
    { id: 'in_progress', label: 'Em Produção', color: 'border-indigo-300 bg-indigo-50/50', desc: 'No chão de fábrica' },
    { id: 'completed', label: 'Concluídas', color: 'border-emerald-300 bg-emerald-50/50', desc: 'Finalizadas e conferidas' },
    { id: 'cancelled', label: 'Canceladas', color: 'border-slate-300 bg-slate-50', desc: 'Suspensas / canceladas' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Ordens & Acompanhamento da Produção (PCP)
              </h1>
              <span className="text-xs text-slate-400 font-mono">
                ({db.productionOrders.length} OPs)
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Controle de chão de fábrica, cálculo de duração, datas reais e movimentação automática de insumos.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* View Mode Switcher */}
            <div className="flex items-center p-1 bg-slate-100 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setViewMode('kanban')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'kanban'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <KanbanSquare className="w-3.5 h-3.5" />
                Quadro Kanban
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                Tabela
              </button>
            </div>

            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer shadow-sm whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              Emitir Nova OP
            </button>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-3 rounded-lg text-xs font-medium flex items-center justify-between border ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <span>{statusMessage.text}</span>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-slate-400 hover:text-slate-700 ml-2"
          >
            &times;
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todas ({db.productionOrders.length})
          </button>
          <button
            onClick={() => setStatusFilter('waiting')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              statusFilter === 'waiting'
                ? 'bg-white text-amber-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Aguardando
          </button>
          <button
            onClick={() => setStatusFilter('in_progress')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              statusFilter === 'in_progress'
                ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Em Produção
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              statusFilter === 'completed'
                ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Concluídas
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por OP, produto ou pedido..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white"
          />
        </div>
      </div>

      {/* VIEW 1: QUADRO KANBAN */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {kanbanColumns.map((col) => {
            const columnOPs = filteredOPs.filter((op) => op.status === col.id);

            return (
              <div
                key={col.id}
                className="bg-slate-100/70 rounded-xl p-3 border border-slate-200 flex flex-col min-h-[500px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      {col.label}
                    </h3>
                    <p className="text-[10px] text-slate-400">{col.desc}</p>
                  </div>
                  <span className="text-xs font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700">
                    {columnOPs.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {columnOPs.length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-400">
                      Nenhuma OP nesta etapa
                    </div>
                  ) : (
                    columnOPs.map((op) => {
                      const product = db.products.find((p) => p.id === op.productId);
                      const order = op.orderId ? db.orders.find((o) => o.id === op.orderId) : null;
                      const customer = order ? db.partners.find((p) => p.id === order.partnerId) : null;
                      const hours = Math.floor(op.estimatedDurationMinutes / 60);
                      const mins = op.estimatedDurationMinutes % 60;
                      const durationStr = `${hours}h ${mins > 0 ? `${mins}m` : ''}`;

                      const availability = product
                        ? checkMaterialAvailability(product.id, op.quantity)
                        : { available: true, missingMaterials: [] };

                      return (
                        <div
                          key={op.id}
                          className="bg-white rounded-lg p-3.5 border border-slate-200 shadow-xs hover:border-slate-300 transition-all space-y-2.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-bold text-slate-900">
                              {op.opNumber}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setViewingOP(op)}
                                title="Ver detalhes completos da OP"
                                className="p-1 text-slate-400 hover:text-indigo-600 rounded hover:bg-slate-50 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleOpenEdit(op)}
                                title="Editar OP"
                                className="p-1 text-slate-400 hover:text-indigo-600 rounded hover:bg-slate-50 cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div>
                            <h4 className="text-xs font-bold text-slate-800 line-clamp-1">
                              {product?.name || 'Produto'}
                            </h4>
                            <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono mt-0.5">
                              <span>Qtd: <strong className="text-slate-800">{op.quantity} {product?.unit || 'un'}</strong></span>
                              <span className="flex items-center gap-1 text-indigo-700 font-semibold">
                                <Clock className="w-3 h-3" />
                                {durationStr}
                              </span>
                            </div>
                          </div>

                          {/* Vinculo de Pedido / Cliente */}
                          {order && (
                            <div className="text-[11px] text-slate-500 font-mono truncate border-t border-slate-100 pt-1.5 flex items-center gap-1">
                              <User className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{customer?.name || order.orderNumber}</span>
                            </div>
                          )}

                          {/* Prazo e Verificação de Insumos */}
                          <div className="flex items-center justify-between text-[11px] font-mono border-t border-slate-100 pt-1.5">
                            <span className="flex items-center gap-1 text-slate-600">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              {op.deadlineDate}
                            </span>

                            {op.status === 'waiting' && (
                              <span
                                title={
                                  availability.available
                                    ? 'Insumos disponíveis'
                                    : `Faltam ${availability.missingMaterials.length} insumos`
                                }
                                className={`text-[10px] font-medium flex items-center gap-0.5 ${
                                  availability.available ? 'text-emerald-700' : 'text-rose-600 font-bold'
                                }`}
                              >
                                {availability.available ? (
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <AlertTriangle className="w-3 h-3 text-rose-600" />
                                )}
                                {availability.available ? 'Insumos OK' : 'Falta Insumo'}
                              </span>
                            )}
                          </div>

                          {/* Ações Rápidas de Avanço */}
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                            {op.status === 'waiting' && (
                              <button
                                onClick={() => handleStatusChange(op.id, 'in_progress')}
                                className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors cursor-pointer shadow-xs"
                              >
                                <Play className="w-3 h-3" />
                                Iniciar Produção
                              </button>
                            )}

                            {op.status === 'in_progress' && (
                              <button
                                onClick={() => handleStatusChange(op.id, 'completed', true)}
                                className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors cursor-pointer shadow-xs"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                Concluir & Baixar
                              </button>
                            )}

                            {op.status === 'completed' && (
                              <div className="w-full text-center text-[11px] text-emerald-700 font-mono font-medium py-1">
                                ✓ Concluída
                              </div>
                            )}

                            {op.status === 'cancelled' && (
                              <button
                                onClick={() => handleStatusChange(op.id, 'waiting')}
                                className="w-full text-center text-[11px] text-slate-500 hover:text-slate-800 font-medium py-1"
                              >
                                Reativar OP
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: TABELA DETALHADA */}
      {viewMode === 'table' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          {filteredOPs.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs">
              Nenhuma ordem de produção encontrada com os filtros atuais.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Número OP</th>
                    <th className="py-3 px-4">Produto Fabricado</th>
                    <th className="py-3 px-4 text-center">Quantidade</th>
                    <th className="py-3 px-4">Origem / Pedido</th>
                    <th className="py-3 px-4">Duração Prevista</th>
                    <th className="py-3 px-4">Prazo Limite</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOPs.map((op) => {
                    const product = db.products.find((p) => p.id === op.productId);
                    const order = op.orderId ? db.orders.find((o) => o.id === op.orderId) : null;
                    const customer = order ? db.partners.find((p) => p.id === order.partnerId) : null;
                    const hours = Math.floor(op.estimatedDurationMinutes / 60);
                    const mins = op.estimatedDurationMinutes % 60;
                    const durationStr = `${hours}h ${mins > 0 ? `${mins}m` : ''}`;

                    return (
                      <tr key={op.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          {op.opNumber}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{product?.name || 'Produto'}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{product?.code}</div>
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-semibold text-slate-800">
                          {op.quantity} {product?.unit || 'un'}
                        </td>
                        <td className="py-3 px-4">
                          {order ? (
                            <div>
                              <div className="font-mono text-slate-800">{order.orderNumber}</div>
                              <div className="text-[11px] text-slate-500 truncate max-w-xs">{customer?.name}</div>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Avulsa (Estoque)</span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-700">
                          {durationStr} ({op.estimatedDurationMinutes}m)
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-700">
                          {op.deadlineDate}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded border ${
                              op.status === 'in_progress'
                                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                : op.status === 'completed'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : op.status === 'waiting'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
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
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => setViewingOP(op)}
                              title="Ver Detalhes da OP"
                              className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleOpenEdit(op)}
                              title="Editar OP"
                              className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(op.id, op.opNumber)}
                              title="Excluir OP"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modais */}
      <ProductionOrderModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleSave}
        initialData={editingOP}
        preselectedProductId={preselectedProductId}
      />

      <OPDetailsModal
        isOpen={!!viewingOP}
        op={viewingOP}
        onClose={() => setViewingOP(null)}
        onAdvanceStatus={handleStatusChange}
        onEdit={(op) => {
          setViewingOP(null);
          handleOpenEdit(op);
        }}
      />
    </div>
  );
};
