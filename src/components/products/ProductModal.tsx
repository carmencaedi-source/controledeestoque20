import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, AlertCircle, Clock, Calculator } from 'lucide-react';
import { Product, ProductBOMItem } from '../../types/erp';
import { useERP } from '../../context/ERPContext';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Omit<Product, 'id' | 'updatedAt'>) => { success: boolean; message?: string };
  initialData?: Product | null;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const { db } = useERP();

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [unit, setUnit] = useState('un');
  const [salePrice, setSalePrice] = useState<number | string>(0);
  const [processTimeMinutes, setProcessTimeMinutes] = useState<number | string>(60);
  const [stockQuantity, setStockQuantity] = useState<number | string>(0);
  const [description, setDescription] = useState('');
  const [bom, setBom] = useState<ProductBOMItem[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (initialData) {
      setCode(initialData.code || '');
      setName(initialData.name || '');
      setCategory(initialData.category || '');
      setUnit(initialData.unit || 'un');
      setSalePrice(initialData.salePrice || 0);
      setProcessTimeMinutes(initialData.processTimeMinutes || 0);
      setStockQuantity(initialData.stockQuantity || 0);
      setDescription(initialData.description || '');
      setBom(initialData.bom ? [...initialData.bom] : []);
    } else {
      setCode('');
      setName('');
      setCategory('Geral');
      setUnit('un');
      setSalePrice(0);
      setProcessTimeMinutes(60);
      setStockQuantity(0);
      setDescription('');
      setBom([]);
    }
    setErrorMessage('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  // Cálculo ao vivo do custo dos insumos da Ficha Técnica
  const calculatedCost = bom.reduce((acc, item) => {
    const mat = db.rawMaterials.find((m) => m.id === item.materialId);
    return acc + (item.quantity || 0) * (mat ? mat.unitCost : 0);
  }, 0);

  const priceNum = Number(salePrice) || 0;
  const estimatedMargin = priceNum > 0 ? ((priceNum - calculatedCost) / priceNum) * 100 : 0;

  const handleAddBOMItem = () => {
    // Escolhe primeiro insumo disponível que ainda não esteja no BOM
    const availableMat = db.rawMaterials.find((m) => !bom.some((b) => b.materialId === m.id));
    if (!availableMat) {
      if (db.rawMaterials.length === 0) {
        setErrorMessage('Nenhuma matéria-prima cadastrada no sistema. Cadastre insumos primeiro.');
      } else {
        setErrorMessage('Todas as matérias-primas cadastradas já foram incluídas na ficha.');
      }
      return;
    }
    setBom([...bom, { materialId: availableMat.id, quantity: 1 }]);
  };

  const handleUpdateBOMItem = (index: number, field: keyof ProductBOMItem, value: any) => {
    const newBom = [...bom];
    newBom[index] = {
      ...newBom[index],
      [field]: field === 'quantity' ? Number(value) : value,
    };
    setBom(newBom);
  };

  const handleRemoveBOMItem = (index: number) => {
    setBom(bom.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Por favor, informe o nome do produto.');
      return;
    }

    const price = Number(salePrice);
    const procTime = Number(processTimeMinutes);
    const stock = Number(stockQuantity);

    if (isNaN(price) || price < 0) {
      setErrorMessage('O preço de venda deve ser um número maior ou igual a zero.');
      return;
    }
    if (isNaN(procTime) || procTime < 0) {
      setErrorMessage('O tempo de processo deve ser um número maior ou igual a zero minutos.');
      return;
    }
    if (isNaN(stock) || stock < 0) {
      setErrorMessage('O estoque inicial deve ser um número maior ou igual a zero.');
      return;
    }

    // Valida itens da ficha técnica
    for (const b of bom) {
      if (!b.materialId) {
        setErrorMessage('Selecione uma matéria-prima válida em todos os itens da ficha.');
        return;
      }
      if (b.quantity <= 0) {
        setErrorMessage('A quantidade do insumo na ficha técnica deve ser maior que zero.');
        return;
      }
    }

    const res = onSave({
      code: code.trim(),
      name: name.trim(),
      category: category.trim() || 'Geral',
      unit: unit.trim() || 'un',
      salePrice: price,
      processTimeMinutes: procTime,
      stockQuantity: stock,
      description: description.trim(),
      bom,
    });

    if (res.success) {
      onClose();
    } else if (res.message) {
      setErrorMessage(res.message);
    }
  };

  const timeMin = Number(processTimeMinutes) || 0;
  const hours = Math.floor(timeMin / 60);
  const remainingMins = timeMin % 60;
  const timeFormatted = `${hours}h ${remainingMins > 0 ? `${remainingMins}m` : ''}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {initialData ? 'Editar Produto e Ficha Técnica' : 'Novo Produto & Ficha Técnica (BOM)'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Defina as matérias-primas e o tempo de processo por unidade
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Dados Gerais do Produto */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              1. Informações Básicas
            </h4>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-1">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Código / SKU
                </label>
                <input
                  type="text"
                  placeholder="Ex: PRD-001"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome do Produto <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Mesa de Jantar 6 Lugares"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Categoria
                </label>
                <input
                  type="text"
                  placeholder="Ex: Mesas, Cadeiras, Decoração"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Unidade
                </label>
                <input
                  type="text"
                  placeholder="Ex: un, kit"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Estoque Pronto
                </label>
                <input
                  type="number"
                  min="0"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>
            </div>

            {/* Tempo de processo e Preço de venda */}
            <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-indigo-600" />
                    Tempo de Processo / Unidade <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] font-mono text-indigo-700 font-semibold">
                    ≈ {timeFormatted}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="Minutos"
                    value={processTimeMinutes}
                    onChange={(e) => setProcessTimeMinutes(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                  <span className="text-xs text-slate-500 font-mono whitespace-nowrap">minutos</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Usado para estimar a duração automática das ordens de produção.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Preço de Venda Praticado (R$)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs text-slate-400 font-mono">
                    R$
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
                <div className="mt-1 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Custo Insumos: R$ {calculatedCost.toFixed(2)}</span>
                  {priceNum > 0 && (
                    <span className={`font-mono font-medium ${estimatedMargin >= 30 ? 'text-emerald-700' : 'text-amber-700'}`}>
                      Margem: {estimatedMargin.toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Descrição e Especificações
              </label>
              <textarea
                rows={2}
                placeholder="Detalhes de acabamento, modelo ou características..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>
          </div>

          {/* Ficha Técnica (BOM - Bill of Materials) */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5 text-indigo-600" />
                  2. Ficha Técnica (Matérias-Primas por Unidade)
                </h4>
                <p className="text-[11px] text-slate-500">
                  Informe quais matérias-primas e quantidades são consumidas para fabricar 1 {unit || 'un'}.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddBOMItem}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Adicionar Insumo
              </button>
            </div>

            {bom.length === 0 ? (
              <div className="p-4 border border-dashed border-slate-300 rounded-lg text-center text-xs text-slate-500">
                Nenhum insumo adicionado à ficha técnica ainda. Clique em "Adicionar Insumo" acima para definir as matérias-primas necessárias.
              </div>
            ) : (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-medium">
                    <tr>
                      <th className="py-2 px-3">Matéria-Prima</th>
                      <th className="py-2 px-3 text-center w-28">Quantidade</th>
                      <th className="py-2 px-3 text-right">Custo Unit.</th>
                      <th className="py-2 px-3 text-right">Subtotal</th>
                      <th className="py-2 px-2 text-center w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bom.map((item, index) => {
                      const material = db.rawMaterials.find((m) => m.id === item.materialId);
                      const subtotal = (item.quantity || 0) * (material ? material.unitCost : 0);

                      return (
                        <tr key={index} className="hover:bg-slate-50">
                          <td className="py-2 px-3">
                            <select
                              value={item.materialId}
                              onChange={(e) => handleUpdateBOMItem(index, 'materialId', e.target.value)}
                              className="w-full px-2 py-1 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:border-indigo-600"
                            >
                              {db.rawMaterials.map((m) => (
                                <option key={m.id} value={m.id}>
                                  {m.code} - {m.name} ({m.unit})
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="py-2 px-3">
                            <div className="flex items-center gap-1 justify-center">
                              <input
                                type="number"
                                step="0.001"
                                min="0.001"
                                required
                                value={item.quantity}
                                onChange={(e) => handleUpdateBOMItem(index, 'quantity', e.target.value)}
                                className="w-20 px-2 py-1 text-xs font-mono text-right bg-white border border-slate-300 rounded focus:outline-none focus:border-indigo-600"
                              />
                              <span className="text-[11px] font-mono text-slate-500 w-6">
                                {material?.unit || 'un'}
                              </span>
                            </div>
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-slate-600">
                            R$ {material ? material.unitCost.toFixed(2) : '0.00'}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-semibold text-slate-900">
                            R$ {subtotal.toFixed(2)}
                          </td>
                          <td className="py-2 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveBOMItem(index)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-slate-50 border-t border-slate-200">
                    <tr>
                      <td colSpan={3} className="py-2.5 px-3 font-semibold text-slate-700 text-right">
                        Custo Total Estimado de Insumos por Unidade:
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900 text-right text-sm">
                        R$ {calculatedCost.toFixed(2)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* Modal Footer */}
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
              {initialData ? 'Salvar Ficha Técnica' : 'Cadastrar Produto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
