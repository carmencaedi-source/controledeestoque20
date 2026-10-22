import React, { useState, useEffect } from 'react';
import { X, Clock, AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';
import { ProductionOrder, OPStatus } from '../../types/erp';
import { useERP } from '../../context/ERPContext';

interface ProductionOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (op: Omit<ProductionOrder, 'id' | 'createdAt' | 'stockDeducted'>) => { success: boolean; message?: string };
  initialData?: ProductionOrder | null;
  preselectedProductId?: string;
}

export const ProductionOrderModal: React.FC<ProductionOrderModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  preselectedProductId,
}) => {
  const { db, checkMaterialAvailability } = useERP();

  const [opNumber, setOpNumber] = useState('');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState<number | string>(1);
  const [orderId, setOrderId] = useState('');
  const [scheduledStartDate, setScheduledStartDate] = useState('');
  const [deadlineDate, setDeadlineDate] = useState('');
  const [status, setStatus] = useState<OPStatus>('waiting');
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (initialData) {
      setOpNumber(initialData.opNumber || '');
      setProductId(initialData.productId || '');
      setQuantity(initialData.quantity || 1);
      setOrderId(initialData.orderId || '');
      setScheduledStartDate(initialData.scheduledStartDate || '');
      setDeadlineDate(initialData.deadlineDate || '');
      setStatus(initialData.status || 'waiting');
      setNotes(initialData.notes || '');
    } else {
      const todayStr = new Date().toISOString().split('T')[0];
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      const deadlineStr = futureDate.toISOString().split('T')[0];

      const initialProdId = preselectedProductId || db.products[0]?.id || '';
      const year = new Date().getFullYear();
      const nextNum = String(db.productionOrders.length + 1).padStart(3, '0');

      setOpNumber(`OP-${year}-${nextNum}`);
      setProductId(initialProdId);
      setQuantity(1);
      setOrderId('');
      setScheduledStartDate(todayStr);
      setDeadlineDate(deadlineStr);
      setStatus('waiting');
      setNotes('');
    }
    setErrorMessage('');
  }, [initialData, preselectedProductId, isOpen, db.products, db.productionOrders.length]);

  if (!isOpen) return null;

  const selectedProduct = db.products.find((p) => p.id === productId);
  const qtyNumber = Number(quantity) || 0;
  const estimatedDurationMinutes = selectedProduct
    ? (selectedProduct.processTimeMinutes || 0) * qtyNumber
    : 0;

  const hours = Math.floor(estimatedDurationMinutes / 60);
  const mins = estimatedDurationMinutes % 60;
  const formattedDuration = `${hours}h ${mins > 0 ? `${mins}m` : ''}`;

  // Verificação de disponibilidade de insumos
  const availability = selectedProduct
    ? checkMaterialAvailability(selectedProduct.id, qtyNumber)
    : { available: true, missingMaterials: [] };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!productId) {
      setErrorMessage('Selecione o produto a ser fabricado.');
      return;
    }
    if (qtyNumber <= 0) {
      setErrorMessage('A quantidade a produzir deve ser maior que zero.');
      return;
    }
    if (!scheduledStartDate) {
      setErrorMessage('Informe a data programada de início.');
      return;
    }
    if (!deadlineDate) {
      setErrorMessage('Informe o prazo limite de conclusão.');
      return;
    }

    const res = onSave({
      opNumber: opNumber.trim(),
      productId,
      quantity: qtyNumber,
      orderId: orderId || undefined,
      scheduledStartDate,
      deadlineDate,
      estimatedDurationMinutes,
      status,
      notes: notes.trim(),
    });

    if (res.success) {
      onClose();
    } else if (res.message) {
      setErrorMessage(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[92vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {initialData ? 'Editar Ordem de Produção' : 'Emissão de Ordem de Produção (OP)'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Planejamento operacional com cálculo automático de tempo de processo
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Número da OP <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={opNumber}
                onChange={(e) => setOpNumber(e.target.value)}
                className="w-full px-3 py-2 font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div className="col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Origem da Ordem
              </label>
              <select
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600"
              >
                <option value="">Avulsa (Reposição de Estoque)</option>
                {db.orders.map((o) => {
                  const partner = db.partners.find((p) => p.id === o.partnerId);
                  return (
                    <option key={o.id} value={o.id}>
                      {o.orderNumber} - {partner?.name} (Prazo: {o.deliveryDeadline})
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Produto a Fabricar <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600 font-medium"
              >
                <option value="">Selecione um produto...</option>
                {db.products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code} - {p.name} ({p.processTimeMinutes}min/un)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Quantidade <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="1"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-3 py-2 font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600"
                />
                <span className="font-mono text-slate-500">
                  {selectedProduct?.unit || 'un'}
                </span>
              </div>
            </div>
          </div>

          {/* Duração Estimada do Processo */}
          <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
              <div>
                <span className="font-semibold text-indigo-950 block">
                  Tempo Estimado de Produção
                </span>
                <span className="text-[11px] text-indigo-700 font-mono">
                  {qtyNumber} {selectedProduct?.unit || 'un'} × {selectedProduct?.processTimeMinutes || 0} min = {estimatedDurationMinutes} minutos
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-base font-bold font-mono text-indigo-900">
                {formattedDuration}
              </span>
            </div>
          </div>

          {/* Verificação ao Vivo de Disponibilidade de Matéria-Prima */}
          {selectedProduct && selectedProduct.bom && selectedProduct.bom.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700 uppercase tracking-wider text-[11px]">
                  Verificação de Estoque de Insumos (BOM)
                </span>
                {availability.available ? (
                  <span className="text-emerald-700 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Insumos suficientes em estoque
                  </span>
                ) : (
                  <span className="text-rose-600 font-medium flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Falta matéria-prima ({availability.missingMaterials.length} item(ns))
                  </span>
                )}
              </div>

              {!availability.available && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg space-y-1.5">
                  <span className="text-[11px] font-semibold text-rose-800 block">
                    Matérias-primas insuficientes para produzir {qtyNumber} {selectedProduct.unit}:
                  </span>
                  <div className="space-y-1">
                    {availability.missingMaterials.map((m, i) => (
                      <div key={i} className="flex justify-between text-[11px] font-mono text-rose-700">
                        <span>• {m.materialName}</span>
                        <span>
                          Necessário: {m.required} {m.unit} | Saldo atual: {m.inStock} {m.unit} (Falta: {m.missing} {m.unit})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Data Início Previsto
              </label>
              <input
                type="date"
                required
                value={scheduledStartDate}
                onChange={(e) => setScheduledStartDate(e.target.value)}
                className="w-full px-3 py-2 font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Prazo Limite (Entrega)
              </label>
              <input
                type="date"
                required
                value={deadlineDate}
                onChange={(e) => setDeadlineDate(e.target.value)}
                className="w-full px-3 py-2 font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Status Operacional
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as OPStatus)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600"
              >
                <option value="waiting">Aguardando Início</option>
                <option value="in_progress">Em Produção</option>
                <option value="completed">Concluída</option>
                <option value="cancelled">Cancelada</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Observações / Instruções para o Chão de Fábrica
            </label>
            <textarea
              rows={2}
              placeholder="Bancada responsável, prioridade de montagem ou detalhes de acabamento..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer shadow-sm"
            >
              {initialData ? 'Salvar Ordem' : 'Emitir Ordem de Produção'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
