import React, { useState } from 'react';
import { X, ArrowUpRight, ArrowDownRight, Layers } from 'lucide-react';
import { RawMaterial } from '../../types/erp';

interface StockAdjustModalProps {
  material: RawMaterial | null;
  isOpen: boolean;
  onClose: () => void;
  onAdjust: (id: string, delta: number, reason: string) => void;
}

export const StockAdjustModal: React.FC<StockAdjustModalProps> = ({
  material,
  isOpen,
  onClose,
  onAdjust,
}) => {
  const [type, setType] = useState<'add' | 'remove'>('add');
  const [quantity, setQuantity] = useState<number | string>('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!isOpen || !material) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const val = Number(quantity);
    if (isNaN(val) || val <= 0) {
      setError('Informe uma quantidade válida maior que zero.');
      return;
    }

    if (type === 'remove' && val > material.stockQuantity) {
      setError(`A quantidade de saída (${val} ${material.unit}) não pode ser maior que o estoque atual (${material.stockQuantity} ${material.unit}).`);
      return;
    }

    const delta = type === 'add' ? val : -val;
    onAdjust(material.id, delta, reason || (type === 'add' ? 'Entrada manual de insumo' : 'Saída manual / perda'));
    onClose();
  };

  const newProjectedStock =
    type === 'add'
      ? material.stockQuantity + (Number(quantity) || 0)
      : Math.max(0, material.stockQuantity - (Number(quantity) || 0));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Movimentação de Estoque
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 font-mono">
              {material.code} · {material.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs">
              {error}
            </div>
          )}

          {/* Tipo de Operação */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => setType('add')}
              className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                type === 'add'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowUpRight className="w-4 h-4 text-emerald-600" />
              Entrada (+ Compra)
            </button>
            <button
              type="button"
              onClick={() => setType('remove')}
              className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                type === 'remove'
                  ? 'bg-white text-rose-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowDownRight className="w-4 h-4 text-rose-600" />
              Saída (- Baixa/Perda)
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Quantidade ({material.unit}) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              autoFocus
              placeholder={`Ex: 5 ${material.unit}`}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-3 py-2 text-sm font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
            <div className="flex justify-between text-slate-500">
              <span>Estoque atual:</span>
              <span className="font-mono font-medium text-slate-800">
                {material.stockQuantity} {material.unit}
              </span>
            </div>
            <div className="flex justify-between font-semibold">
              <span className="text-slate-700">Novo estoque projetado:</span>
              <span
                className={`font-mono ${
                  newProjectedStock < material.minStock ? 'text-amber-600' : 'text-emerald-700'
                }`}
              >
                {newProjectedStock.toFixed(2)} {material.unit}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Motivo / Nota Fiscal / Observação
            </label>
            <input
              type="text"
              placeholder="Ex: NF 1492 - Fornecedor Cedro Forte"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`px-4 py-2 text-xs font-medium text-white rounded-lg transition-colors cursor-pointer shadow-sm ${
                type === 'add' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              Confirmar Movimentação
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
