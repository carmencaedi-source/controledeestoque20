import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { RawMaterial } from '../../types/erp';

interface MaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (material: Omit<RawMaterial, 'id' | 'updatedAt'>) => { success: boolean; message?: string };
  initialData?: RawMaterial | null;
}

const COMMON_UNITS = [
  { value: 'un', label: 'Unidade (un)' },
  { value: 'kg', label: 'Quilograma (kg)' },
  { value: 'g', label: 'Grama (g)' },
  { value: 'm', label: 'Metro linear (m)' },
  { value: 'm²', label: 'Metro quadrado (m²)' },
  { value: 'm³', label: 'Metro cúbico (m³)' },
  { value: 'l', label: 'Litro (l)' },
  { value: 'ml', label: 'Mililitro (ml)' },
  { value: 'cx', label: 'Caixa (cx)' },
  { value: 'pc', label: 'Pacote (pc)' },
];

export const MaterialModal: React.FC<MaterialModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('un');
  const [customUnit, setCustomUnit] = useState('');
  const [stockQuantity, setStockQuantity] = useState<number | string>(0);
  const [minStock, setMinStock] = useState<number | string>(0);
  const [unitCost, setUnitCost] = useState<number | string>(0);
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (initialData) {
      setCode(initialData.code || '');
      setName(initialData.name || '');
      const isKnown = COMMON_UNITS.some((u) => u.value === initialData.unit);
      if (isKnown) {
        setUnit(initialData.unit);
        setCustomUnit('');
      } else {
        setUnit('custom');
        setCustomUnit(initialData.unit || '');
      }
      setStockQuantity(initialData.stockQuantity);
      setMinStock(initialData.minStock);
      setUnitCost(initialData.unitCost);
      setNotes(initialData.notes || '');
    } else {
      setCode('');
      setName('');
      setUnit('un');
      setCustomUnit('');
      setStockQuantity(0);
      setMinStock(0);
      setUnitCost(0);
      setNotes('');
    }
    setErrorMessage('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Por favor, informe o nome da matéria-prima.');
      return;
    }

    const selectedUnit = unit === 'custom' ? customUnit.trim() : unit;
    if (!selectedUnit) {
      setErrorMessage('Por favor, defina a unidade de medida.');
      return;
    }

    const qty = Number(stockQuantity);
    const min = Number(minStock);
    const cost = Number(unitCost);

    if (isNaN(qty) || qty < 0) {
      setErrorMessage('A quantidade em estoque deve ser um número maior ou igual a zero.');
      return;
    }
    if (isNaN(min) || min < 0) {
      setErrorMessage('O estoque mínimo deve ser um número maior ou igual a zero.');
      return;
    }
    if (isNaN(cost) || cost < 0) {
      setErrorMessage('O custo unitário deve ser um valor monetário válido.');
      return;
    }

    const res = onSave({
      code: code.trim(),
      name: name.trim(),
      unit: selectedUnit,
      stockQuantity: qty,
      minStock: min,
      unitCost: cost,
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
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {initialData ? 'Editar Matéria-Prima' : 'Nova Matéria-Prima'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Informe os dados de estoque e custo do insumo fabril
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Código / SKU
              </label>
              <input
                type="text"
                placeholder="Ex: MP-001"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nome da Matéria-Prima <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Madeira Cedro Rosa Seca"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Unidade de Medida <span className="text-rose-500">*</span>
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              >
                {COMMON_UNITS.map((u) => (
                  <option key={u.value} value={u.value}>
                    {u.label}
                  </option>
                ))}
                <option value="custom">Outra (personalizada)...</option>
              </select>
            </div>

            {unit === 'custom' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Especifique a Unidade <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: rolo, tambor"
                  value={customUnit}
                  onChange={(e) => setCustomUnit(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Custo Unitário (R$) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs text-slate-400 font-mono">
                  R$
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={unitCost}
                  onChange={(e) => setUnitCost(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Estoque Atual <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Saldo físico disponível
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Estoque Mínimo (Alerta)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={minStock}
                onChange={(e) => setMinStock(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Nível de segurança para compras
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Observações / Especificação Técnica
            </label>
            <textarea
              rows={2}
              placeholder="Dimensões, fornecedor habitual, lote ou detalhes adicionais..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer shadow-sm"
            >
              {initialData ? 'Salvar Alterações' : 'Cadastrar Matéria-Prima'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
