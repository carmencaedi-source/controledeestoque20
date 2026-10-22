import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Search,
  Clock,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  PlaySquare,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { Product } from '../../types/erp';
import { ProductModal } from './ProductModal';

interface ProductsModuleProps {
  onEmitOPForProduct?: (productId: string) => void;
}

export const ProductsModule: React.FC<ProductsModuleProps> = ({ onEmitOPForProduct }) => {
  const { db, addProduct, updateProduct, deleteProduct, calculateProductCost } = useERP();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Categorias únicas
  const categories = Array.from(new Set(db.products.map((p) => p.category || 'Geral')));

  const filteredProducts = db.products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (!window.confirm(`Deseja realmente excluir o produto "${name}"?`)) {
      return;
    }

    const res = deleteProduct(id);
    if (res.success) {
      setStatusMessage({ text: `Produto "${name}" excluído com sucesso.`, type: 'success' });
      setTimeout(() => setStatusMessage(null), 4000);
    } else {
      setStatusMessage({ text: res.message || 'Erro ao excluir.', type: 'error' });
      setTimeout(() => setStatusMessage(null), 6000);
    }
  };

  const handleSave = (data: Omit<Product, 'id' | 'updatedAt'>) => {
    if (editingProduct) {
      const res = updateProduct(editingProduct.id, data);
      if (res.success) {
        setStatusMessage({ text: 'Ficha técnica e produto atualizados com sucesso.', type: 'success' });
        setTimeout(() => setStatusMessage(null), 4000);
      }
      return res;
    } else {
      const res = addProduct(data);
      if (res.success) {
        setStatusMessage({ text: 'Produto cadastrado com sucesso!', type: 'success' });
        setTimeout(() => setStatusMessage(null), 4000);
      }
      return res;
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedProductId(expandedProductId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Produtos & Fichas Técnicas (BOM)
              </h1>
              <span className="text-xs text-slate-400 font-mono">
                ({db.products.length} cadastrados)
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Relação de matérias-primas por produto, tempo de produção fabril e custos estimados.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Novo Produto / Ficha
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

      {/* Filter toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por código, nome ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white"
            />
          </div>

          {categories.length > 0 && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-600"
            >
              <option value="all">Todas as Categorias</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="text-xs text-slate-500 font-mono">
          Exibindo {filteredProducts.length} de {db.products.length} produtos
        </div>
      </div>

      {/* Products List & BOM Expander */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl py-16 text-center">
          <Layers className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-700">
            Nenhum produto encontrado
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {searchTerm || selectedCategory !== 'all'
              ? 'Tente remover os filtros de busca.'
              : 'Cadastre o primeiro produto para montar sua Ficha Técnica.'}
          </p>
          {!searchTerm && selectedCategory === 'all' && (
            <button
              onClick={handleOpenCreate}
              className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Cadastrar Produto
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredProducts.map((product) => {
            const isExpanded = expandedProductId === product.id;
            const bomCost = calculateProductCost(product.id);
            const hours = Math.floor(product.processTimeMinutes / 60);
            const mins = product.processTimeMinutes % 60;
            const timeStr = `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
            const margin = product.salePrice > 0 ? ((product.salePrice - bomCost) / product.salePrice) * 100 : 0;

            return (
              <div
                key={product.id}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden transition-all shadow-xs"
              >
                {/* Main Product Row */}
                <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <button
                      onClick={() => toggleExpand(product.id)}
                      className="mt-0.5 p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                      title={isExpanded ? 'Recolher Ficha Técnica' : 'Expandir Ficha Técnica'}
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-indigo-600" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-indigo-700">
                          {product.code}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="text-xs text-slate-500 font-medium">
                          {product.category}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                        {product.name}
                      </h3>
                      {product.description && (
                        <p className="text-xs text-slate-500 mt-1 max-w-xl">
                          {product.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Operational Metrics strip */}
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                    <div>
                      <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
                        Tempo de Processo
                      </span>
                      <span className="font-mono font-semibold text-slate-800 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-indigo-600" />
                        {timeStr} <span className="text-slate-400 font-normal">({product.processTimeMinutes}m)</span>
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
                        Custo Ficha (BOM)
                      </span>
                      <span className="font-mono font-semibold text-slate-900">
                        R$ {bomCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
                        Preço de Venda
                      </span>
                      <span className="font-mono font-bold text-emerald-700">
                        R$ {product.salePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="hidden lg:block">
                      <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
                        Margem Bruta
                      </span>
                      <span className={`font-mono font-semibold ${margin >= 30 ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {margin.toFixed(1)}%
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 ml-auto md:ml-0">
                      {onEmitOPForProduct && (
                        <button
                          onClick={() => onEmitOPForProduct(product.id)}
                          title="Emitir Ordem de Produção deste produto"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
                        >
                          <PlaySquare className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Criar OP</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleOpenEdit(product)}
                        title="Editar produto e ficha técnica"
                        className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDelete(product.id, product.name)}
                        title="Excluir produto"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expander: Ficha Técnica (BOM) Details */}
                {isExpanded && (
                  <div className="px-5 py-4 bg-slate-50/70 border-t border-slate-100 text-xs">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                        <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                        Composição da Ficha Técnica por Unidade (1 {product.unit || 'un'})
                      </h4>
                      <span className="text-slate-500 font-mono">
                        {product.bom?.length || 0} matérias-primas
                      </span>
                    </div>

                    {(!product.bom || product.bom.length === 0) ? (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
                        Nenhum insumo associado a este produto. Edite o produto para adicionar matérias-primas.
                      </div>
                    ) : (
                      <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                        <table className="w-full text-left">
                          <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-medium uppercase text-[11px]">
                            <tr>
                              <th className="py-2 px-3">Código</th>
                              <th className="py-2 px-3">Matéria-Prima</th>
                              <th className="py-2 px-3 text-right">Qtd Consumida</th>
                              <th className="py-2 px-3 text-right">Custo Insumo</th>
                              <th className="py-2 px-3 text-right">Subtotal</th>
                              <th className="py-2 px-3 text-right">Estoque Atual</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {product.bom.map((b, idx) => {
                              const mat = db.rawMaterials.find((m) => m.id === b.materialId);
                              const subtotal = (b.quantity || 0) * (mat ? mat.unitCost : 0);
                              const isLow = mat ? mat.stockQuantity <= mat.minStock : false;

                              return (
                                <tr key={idx} className="hover:bg-slate-50">
                                  <td className="py-2 px-3 font-mono text-slate-500">
                                    {mat?.code || '-'}
                                  </td>
                                  <td className="py-2 px-3 font-medium text-slate-900">
                                    {mat?.name || 'Insumo não encontrado'}
                                  </td>
                                  <td className="py-2 px-3 text-right font-mono font-semibold text-slate-800">
                                    {b.quantity} {mat?.unit || 'un'}
                                  </td>
                                  <td className="py-2 px-3 text-right font-mono text-slate-600">
                                    R$ {mat ? mat.unitCost.toFixed(2) : '0.00'}
                                  </td>
                                  <td className="py-2 px-3 text-right font-mono font-semibold text-slate-900">
                                    R$ {subtotal.toFixed(2)}
                                  </td>
                                  <td className="py-2 px-3 text-right font-mono">
                                    <span className={isLow ? 'text-rose-600 font-semibold' : 'text-slate-600'}>
                                      {mat ? mat.stockQuantity : 0} {mat?.unit || 'un'}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                          <tfoot className="bg-slate-50 border-t border-slate-200 font-medium">
                            <tr>
                              <td colSpan={4} className="py-2 px-3 text-right text-slate-700">
                                Custo Total de Matérias-Primas por Peça:
                              </td>
                              <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                                R$ {bomCost.toFixed(2)}
                              </td>
                              <td></td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editingProduct}
      />
    </div>
  );
};
