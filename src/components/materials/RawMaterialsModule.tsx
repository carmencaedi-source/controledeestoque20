import React, { useState } from 'react';
import {
  Boxes,
  Plus,
  Search,
  AlertTriangle,
  Edit2,
  Trash2,
  ArrowUpDown,
  SlidersHorizontal,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { RawMaterial } from '../../types/erp';
import { MaterialModal } from './MaterialModal';
import { StockAdjustModal } from './StockAdjustModal';

interface RawMaterialsModuleProps {
  isModalOpen?: boolean;
  onCloseModal?: () => void;
}

export const RawMaterialsModule: React.FC<RawMaterialsModuleProps> = () => {
  const { db, addRawMaterial, updateRawMaterial, deleteRawMaterial, adjustMaterialStock } = useERP();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterLowStockOnly, setFilterLowStockOnly] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<RawMaterial | null>(null);
  const [adjustingMaterial, setAdjustingMaterial] = useState<RawMaterial | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const filteredMaterials = db.rawMaterials.filter((mat) => {
    const matchesSearch =
      mat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mat.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (mat.notes && mat.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    if (filterLowStockOnly) {
      return matchesSearch && mat.stockQuantity <= mat.minStock;
    }
    return matchesSearch;
  });

  const totalInventoryValue = db.rawMaterials.reduce(
    (acc, m) => acc + (m.stockQuantity || 0) * (m.unitCost || 0),
    0
  );

  const lowStockCount = db.rawMaterials.filter((m) => m.stockQuantity <= m.minStock).length;

  const handleOpenCreate = () => {
    setEditingMaterial(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (material: RawMaterial) => {
    setEditingMaterial(material);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir a matéria-prima "${name}"?`)) {
      return;
    }

    const res = deleteRawMaterial(id);
    if (res.success) {
      setStatusMessage({ text: `Matéria-prima "${name}" excluída com sucesso.`, type: 'success' });
      setTimeout(() => setStatusMessage(null), 4000);
    } else {
      setStatusMessage({ text: res.message || 'Erro ao excluir.', type: 'error' });
      setTimeout(() => setStatusMessage(null), 6000);
    }
  };

  const handleSave = (data: Omit<RawMaterial, 'id' | 'updatedAt'>) => {
    if (editingMaterial) {
      const res = updateRawMaterial(editingMaterial.id, data);
      if (res.success) {
        setStatusMessage({ text: 'Matéria-prima atualizada com sucesso.', type: 'success' });
        setTimeout(() => setStatusMessage(null), 4000);
      }
      return res;
    } else {
      const res = addRawMaterial(data);
      if (res.success) {
        setStatusMessage({ text: 'Matéria-prima cadastrada com sucesso.', type: 'success' });
        setTimeout(() => setStatusMessage(null), 4000);
      }
      return res;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Metrics Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Cadastro de Matérias-Primas & Insumos
              </h1>
              <span className="text-xs text-slate-400 font-mono">
                ({db.rawMaterials.length} itens)
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Controle de estoque, custos unitários e insumos consumidos na fabricação dos produtos.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer shadow-sm whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              Nova Matéria-Prima
            </button>
          </div>
        </div>

        {/* Informative indicators */}
        <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-slate-400 uppercase tracking-wider text-[11px] block font-medium">
              Valor Total do Estoque
            </span>
            <span className="text-base font-bold font-mono text-slate-900">
              R$ {totalInventoryValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div>
            <span className="text-slate-400 uppercase tracking-wider text-[11px] block font-medium">
              Itens Abaixo do Mínimo
            </span>
            <span
              className={`text-base font-bold font-mono ${
                lowStockCount > 0 ? 'text-rose-600' : 'text-slate-900'
              }`}
            >
              {lowStockCount} {lowStockCount === 1 ? 'item' : 'itens'}
            </span>
          </div>

          <div className="col-span-2 sm:col-span-1 flex items-center sm:justify-end">
            <button
              onClick={() => setFilterLowStockOnly(!filterLowStockOnly)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                filterLowStockOnly
                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              {filterLowStockOnly ? 'Mostrando Apenas Críticos' : 'Filtrar Estoque Crítico'}
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

      {/* Search & Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por código ou nome do insumo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white"
          />
        </div>

        <div className="text-xs text-slate-500 font-mono">
          Exibindo {filteredMaterials.length} de {db.rawMaterials.length} insumos
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        {filteredMaterials.length === 0 ? (
          <div className="py-16 text-center">
            <Boxes className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-700">
              Nenhuma matéria-prima encontrada
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {searchTerm || filterLowStockOnly
                ? 'Tente ajustar os filtros ou termo de busca.'
                : 'Cadastre as matérias-primas e insumos que sua empresa utiliza.'}
            </p>
            {!searchTerm && !filterLowStockOnly && (
              <button
                onClick={handleOpenCreate}
                className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Cadastrar Matéria-Prima
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Código</th>
                  <th className="py-3 px-4">Nome do Insumo</th>
                  <th className="py-3 px-4 text-center">Unidade</th>
                  <th className="py-3 px-4 text-right">Estoque Físico</th>
                  <th className="py-3 px-4 text-right">Estoque Mínimo</th>
                  <th className="py-3 px-4 text-right">Custo Unitário</th>
                  <th className="py-3 px-4 text-right">Subtotal em Estoque</th>
                  <th className="py-3 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMaterials.map((mat) => {
                  const isLow = mat.stockQuantity <= mat.minStock;
                  const totalValue = (mat.stockQuantity || 0) * (mat.unitCost || 0);

                  return (
                    <tr
                      key={mat.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isLow ? 'bg-amber-50/30' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-mono font-medium text-slate-900 whitespace-nowrap">
                        {mat.code}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{mat.name}</div>
                        {mat.notes && (
                          <div className="text-[11px] text-slate-400 truncate max-w-xs">
                            {mat.notes}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-slate-600">
                        {mat.unit}
                      </td>
                      <td className="py-3 px-4 text-right font-mono">
                        <span
                          className={`font-semibold ${
                            isLow ? 'text-rose-600 font-bold' : 'text-slate-900'
                          }`}
                        >
                          {mat.stockQuantity} {mat.unit}
                        </span>
                        {isLow && (
                          <div className="text-[10px] text-rose-500 font-sans">
                            Estoque baixo!
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-500">
                        {mat.minStock} {mat.unit}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-800">
                        R$ {mat.unitCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900">
                        R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setAdjustingMaterial(mat)}
                            title="Ajustar estoque (Entrada/Saída)"
                            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                          >
                            <ArrowUpDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(mat)}
                            title="Editar matéria-prima"
                            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(mat.id, mat.name)}
                            title="Excluir matéria-prima"
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

      {/* Modais */}
      <MaterialModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editingMaterial}
      />

      <StockAdjustModal
        isOpen={!!adjustingMaterial}
        material={adjustingMaterial}
        onClose={() => setAdjustingMaterial(null)}
        onAdjust={(id, delta, reason) => {
          adjustMaterialStock(id, delta, reason);
          setStatusMessage({
            text: `Estoque de ${adjustingMaterial?.name} atualizado com sucesso (${delta > 0 ? '+' : ''}${delta} ${adjustingMaterial?.unit}).`,
            type: 'success',
          });
          setTimeout(() => setStatusMessage(null), 4000);
        }}
      />
    </div>
  );
};
