import React, { useState } from 'react';
import {
  ShoppingCart,
  Plus,
  Search,
  PlaySquare,
  Calendar,
  User,
  Edit2,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { Order, OrderStatus } from '../../types/erp';
import { OrderModal } from './OrderModal';

interface OrdersModuleProps {
  onNavigateToTracking?: () => void;
}

export const OrdersModule: React.FC<OrdersModuleProps> = ({ onNavigateToTracking }) => {
  const {
    db,
    addOrder,
    updateOrder,
    deleteOrder,
    updateOrderStatus,
    generateProductionOrdersFromOrder,
  } = useERP();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const filteredOrders = db.orders.filter((order) => {
    const partner = db.partners.find((p) => p.id === order.partnerId);
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (partner && partner.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.notes && order.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleOpenCreate = () => {
    setEditingOrder(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (order: Order) => {
    setEditingOrder(order);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, num: string) => {
    if (!window.confirm(`Deseja realmente excluir o pedido ${num}?`)) {
      return;
    }

    const res = deleteOrder(id);
    if (res.success) {
      setStatusMessage({ text: `Pedido ${num} excluído com sucesso.`, type: 'success' });
      setTimeout(() => setStatusMessage(null), 4000);
    } else {
      setStatusMessage({ text: res.message || 'Erro ao excluir.', type: 'error' });
      setTimeout(() => setStatusMessage(null), 6000);
    }
  };

  const handleSave = (data: Omit<Order, 'id' | 'createdAt'>) => {
    if (editingOrder) {
      const res = updateOrder(editingOrder.id, data);
      if (res.success) {
        setStatusMessage({ text: 'Pedido atualizado com sucesso.', type: 'success' });
        setTimeout(() => setStatusMessage(null), 4000);
      }
      return res;
    } else {
      const res = addOrder(data);
      if (res.success) {
        setStatusMessage({ text: 'Pedido registrado com sucesso!', type: 'success' });
        setTimeout(() => setStatusMessage(null), 4000);
      }
      return res;
    }
  };

  const handleGenerateOP = (orderId: string) => {
    const res = generateProductionOrdersFromOrder(orderId);
    if (res.success) {
      setStatusMessage({ text: res.message, type: 'success' });
      setTimeout(() => setStatusMessage(null), 5000);
    } else {
      setStatusMessage({ text: res.message, type: 'error' });
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  const totalValueSum = filteredOrders.reduce((acc, o) => acc + o.totalValue, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Pedidos de Clientes
              </h1>
              <span className="text-xs text-slate-400 font-mono">
                ({db.orders.length} pedidos)
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Controle comercial, datas de entrega prometidas e emissão automática de ordens de produção.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Novo Pedido
            </button>
          </div>
        </div>

        {/* Total portfolio summary */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <span className="text-slate-500 font-mono">
              Total nesta visão: <strong className="text-slate-900 font-bold">R$ {totalValueSum.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
            </span>
          </div>
          {onNavigateToTracking && (
            <button
              onClick={onNavigateToTracking}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
            >
              Ver Quadro de Acompanhamento (Kanban) &rarr;
            </button>
          )}
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

      {/* Toolbar & Status Filters */}
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
            Todos ({db.orders.length})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              statusFilter === 'pending'
                ? 'bg-white text-amber-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pendentes
          </button>
          <button
            onClick={() => setStatusFilter('in_production')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              statusFilter === 'in_production'
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
            Concluídos
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por número, cliente ou anotação..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white"
          />
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl py-16 text-center">
          <ShoppingCart className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-700">
            Nenhum pedido encontrado
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {searchTerm || statusFilter !== 'all'
              ? 'Tente remover os filtros de busca.'
              : 'Cadastre o primeiro pedido de cliente para iniciar o fluxo fabril.'}
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <button
              onClick={handleOpenCreate}
              className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Novo Pedido
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const partner = db.partners.find((p) => p.id === order.partnerId);
            // Verifica se já existem OPs vinculadas a este pedido
            const linkedOPs = db.productionOrders.filter((op) => op.orderId === order.id);
            const hasOPs = linkedOPs.length > 0;

            const statusColors: Record<OrderStatus, string> = {
              pending: 'bg-amber-50 text-amber-700 border-amber-200',
              in_production: 'bg-indigo-50 text-indigo-700 border-indigo-200',
              completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
              cancelled: 'bg-slate-100 text-slate-600 border-slate-200',
            };

            const statusLabels: Record<OrderStatus, string> = {
              pending: 'Pendente',
              in_production: 'Em Produção',
              completed: 'Concluído',
              cancelled: 'Cancelado',
            };

            return (
              <div
                key={order.id}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs transition-all hover:border-slate-300"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Info Principal */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-slate-900">
                        {order.orderNumber}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="text-xs font-medium text-slate-700 flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {partner?.name || 'Cliente não encontrado'}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span
                        className={`text-[11px] font-medium px-2 py-0.5 rounded border ${
                          statusColors[order.status]
                        }`}
                      >
                        {statusLabels[order.status]}
                      </span>
                    </div>

                    {/* Datas */}
                    <div className="flex items-center gap-4 text-xs text-slate-500 font-mono">
                      <span>Data: {order.orderDate}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1 text-slate-700 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                        Prazo de Entrega: {order.deliveryDeadline}
                      </span>
                    </div>

                    {order.notes && (
                      <p className="text-xs text-slate-500 max-w-xl italic">
                        "{order.notes}"
                      </p>
                    )}
                  </div>

                  {/* Valor e Ações */}
                  <div className="flex flex-wrap items-center gap-4 lg:gap-6 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    <div className="text-left lg:text-right">
                      <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
                        Valor Total
                      </span>
                      <span className="text-base font-bold font-mono text-emerald-700">
                        R$ {order.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    {/* Botão Gerar OP */}
                    {!hasOPs && order.status !== 'cancelled' && order.status !== 'completed' ? (
                      <button
                        onClick={() => handleGenerateOP(order.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer shadow-xs"
                      >
                        <PlaySquare className="w-3.5 h-3.5" />
                        Gerar Ordem de Produção
                      </button>
                    ) : hasOPs ? (
                      <div className="text-xs text-slate-500 font-mono flex items-center gap-1 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{linkedOPs.length} OP(s) Vinculada(s)</span>
                      </div>
                    ) : null}

                    {/* Mudança Rápida de Status */}
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                      className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-600"
                    >
                      <option value="pending">Pendente</option>
                      <option value="in_production">Em Produção</option>
                      <option value="completed">Concluído</option>
                      <option value="cancelled">Cancelado</option>
                    </select>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(order)}
                        title="Editar pedido"
                        className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(order.id, order.orderNumber)}
                        title="Excluir pedido"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Lista de itens do pedido */}
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Produtos Encomendados
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                    {order.items.map((it, idx) => {
                      const prod = db.products.find((p) => p.id === it.productId);
                      return (
                        <div
                          key={idx}
                          className="p-2 bg-slate-50/80 rounded-md border border-slate-100 flex items-center justify-between"
                        >
                          <span className="font-medium text-slate-800 truncate mr-2">
                            {it.quantity}x {prod?.name || 'Produto'}
                          </span>
                          <span className="font-mono text-slate-600 shrink-0">
                            R$ {(it.quantity * it.unitPrice).toFixed(2)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <OrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editingOrder}
      />
    </div>
  );
};
