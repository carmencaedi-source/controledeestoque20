import React from 'react';
import {
  X,
  Clock,
  Calendar,
  Play,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Ban,
  PackageCheck,
  User,
} from 'lucide-react';
import { ProductionOrder, OPStatus } from '../../types/erp';
import { useERP } from '../../context/ERPContext';

interface OPDetailsModalProps {
  op: ProductionOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onAdvanceStatus: (id: string, newStatus: OPStatus, deductStock?: boolean) => void;
  onEdit: (op: ProductionOrder) => void;
}

export const OPDetailsModal: React.FC<OPDetailsModalProps> = ({
  op,
  isOpen,
  onClose,
  onAdvanceStatus,
  onEdit,
}) => {
  const { db, checkMaterialAvailability } = useERP();

  if (!isOpen || !op) return null;

  const product = db.products.find((p) => p.id === op.productId);
  const order = op.orderId ? db.orders.find((o) => o.id === op.orderId) : null;
  const customer = order ? db.partners.find((p) => p.id === order.partnerId) : null;

  const hours = Math.floor(op.estimatedDurationMinutes / 60);
  const mins = op.estimatedDurationMinutes % 60;
  const durationStr = `${hours}h ${mins > 0 ? `${mins}m` : ''}`;

  const availability = product
    ? checkMaterialAvailability(product.id, op.quantity)
    : { available: true, missingMaterials: [] };

  const formatDate = (isoStr?: string) => {
    if (!isoStr) return '-';
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-bold text-slate-900 font-mono">
              {op.opNumber}
            </h3>
            <span
              className={`text-xs font-medium px-2.5 py-0.5 rounded border ${
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
                ? 'Aguardando Início'
                : 'Cancelada'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onEdit(op);
              }}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium px-2 py-1 rounded hover:bg-indigo-50 cursor-pointer"
            >
              Editar OP
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          {/* Produto & Quantidade */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Produto a Fabricar
              </span>
              <h4 className="text-base font-bold text-slate-900 mt-0.5">
                {product?.name || 'Produto não identificado'}
              </h4>
              <span className="text-slate-500 font-mono">
                Cód: {product?.code} · Categoria: {product?.category}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Quantidade
              </span>
              <span className="text-2xl font-bold font-mono text-slate-900">
                {op.quantity} {product?.unit || 'un'}
              </span>
            </div>
          </div>

          {/* Origem e Cronograma */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 border border-slate-200 rounded-lg space-y-2">
              <span className="font-semibold text-slate-700 uppercase tracking-wider text-[11px] block">
                Vínculo Comercial
              </span>
              {order ? (
                <div className="space-y-1">
                  <div className="font-mono font-medium text-slate-800">
                    Pedido: {order.orderNumber}
                  </div>
                  <div className="flex items-center gap-1 text-slate-600">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>{customer?.name || 'Cliente'}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Prazo do pedido: {order.deliveryDeadline}
                  </div>
                </div>
              ) : (
                <div className="text-slate-500 italic">
                  Ordem avulsa emitida para formação de estoque.
                </div>
              )}
            </div>

            <div className="p-3 border border-slate-200 rounded-lg space-y-1.5">
              <span className="font-semibold text-slate-700 uppercase tracking-wider text-[11px] block">
                Planejamento de Tempo
              </span>
              <div className="flex justify-between font-mono">
                <span className="text-slate-500">Início Previsto:</span>
                <span className="text-slate-800 font-medium">{op.scheduledStartDate}</span>
              </div>
              <div className="flex justify-between font-mono">
                <span className="text-slate-500">Prazo Limite:</span>
                <span className="text-slate-800 font-bold">{op.deadlineDate}</span>
              </div>
              <div className="flex justify-between font-mono text-indigo-700 font-semibold">
                <span>Duração Estimada:</span>
                <span>{durationStr} ({op.estimatedDurationMinutes}m)</span>
              </div>
            </div>
          </div>

          {/* Registro Real de Execução */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="font-semibold text-slate-700 uppercase tracking-wider text-[11px] block mb-2">
              Acompanhamento Real do Chão de Fábrica
            </span>
            <div className="grid grid-cols-2 gap-4 font-mono">
              <div>
                <span className="text-slate-400 text-[11px] block">Data/Hora Início Real:</span>
                <span className="font-medium text-slate-800">
                  {formatDate(op.realStartDate)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Data/Hora Fim Real:</span>
                <span className="font-medium text-slate-800">
                  {formatDate(op.realEndDate)}
                </span>
              </div>
            </div>
            {op.stockDeducted && (
              <div className="mt-2.5 pt-2 border-t border-slate-200 text-emerald-700 flex items-center gap-1.5 font-medium">
                <PackageCheck className="w-4 h-4" />
                <span>Matérias-primas baixadas e estoque de produto acabado creditado.</span>
              </div>
            )}
          </div>

          {/* Matérias-Primas da Ficha Técnica & Estoque */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-slate-700 uppercase tracking-wider text-[11px]">
                Insumos Necessários (Ficha Técnica × {op.quantity} un)
              </span>
              {!availability.available && op.status === 'waiting' && (
                <span className="text-rose-600 font-medium flex items-center gap-1 text-[11px]">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Alerta: Estoque insuficiente
                </span>
              )}
            </div>

            {product?.bom && product.bom.length > 0 ? (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px]">
                    <tr>
                      <th className="py-2 px-3">Matéria-Prima</th>
                      <th className="py-2 px-3 text-right">Por Unidade</th>
                      <th className="py-2 px-3 text-right">Total para a OP</th>
                      <th className="py-2 px-3 text-right">Estoque Atual</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {product.bom.map((b, i) => {
                      const mat = db.rawMaterials.find((m) => m.id === b.materialId);
                      const totalReq = b.quantity * op.quantity;
                      const hasEnough = mat ? mat.stockQuantity >= totalReq : false;

                      return (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-medium text-slate-900">
                            {mat?.name || 'Insumo'}
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-slate-500">
                            {b.quantity} {mat?.unit || 'un'}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-semibold text-slate-800">
                            {totalReq.toFixed(2)} {mat?.unit || 'un'}
                          </td>
                          <td className="py-2 px-3 text-right font-mono">
                            <span className={hasEnough ? 'text-emerald-700' : 'text-rose-600 font-bold'}>
                              {mat ? mat.stockQuantity : 0} {mat?.unit || 'un'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-slate-400 italic">Produto sem ficha técnica configurada.</div>
            )}
          </div>

          {op.notes && (
            <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-lg">
              <span className="text-[11px] font-semibold text-amber-800 block mb-0.5">
                Observações Operacionais:
              </span>
              <p className="text-slate-700">{op.notes}</p>
            </div>
          )}
        </div>

        {/* Workflow Actions Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {op.status !== 'waiting' && (
              <button
                type="button"
                onClick={() => onAdvanceStatus(op.id, 'waiting')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Retornar para Aguardando
              </button>
            )}

            {op.status !== 'cancelled' && op.status !== 'completed' && (
              <button
                type="button"
                onClick={() => onAdvanceStatus(op.id, 'cancelled')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              >
                <Ban className="w-3.5 h-3.5" />
                Cancelar OP
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {op.status === 'waiting' && (
              <button
                type="button"
                onClick={() => onAdvanceStatus(op.id, 'in_progress')}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer shadow-sm"
              >
                <Play className="w-3.5 h-3.5" />
                Iniciar Produção
              </button>
            )}

            {op.status === 'in_progress' && (
              <button
                type="button"
                onClick={() => onAdvanceStatus(op.id, 'completed', true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer shadow-sm"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Concluir OP & Baixar Insumos
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
