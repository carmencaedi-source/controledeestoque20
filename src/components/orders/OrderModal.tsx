import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, AlertCircle } from 'lucide-react';
import { Order, OrderItem, OrderStatus } from '../../types/erp';
import { useERP } from '../../context/ERPContext';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (order: Omit<Order, 'id' | 'createdAt'>) => { success: boolean; message?: string };
  initialData?: Order | null;
}

export const OrderModal: React.FC<OrderModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const { db } = useERP();

  const [orderNumber, setOrderNumber] = useState('');
  const [partnerId, setPartnerId] = useState('');
  const [orderDate, setOrderDate] = useState('');
  const [deliveryDeadline, setDeliveryDeadline] = useState('');
  const [status, setStatus] = useState<OrderStatus>('pending');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<OrderItem[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  // Clientes disponíveis
  const customers = db.partners.filter((p) => p.type === 'customer' || p.type === 'both');

  useEffect(() => {
    if (initialData) {
      setOrderNumber(initialData.orderNumber || '');
      setPartnerId(initialData.partnerId || '');
      setOrderDate(initialData.orderDate || '');
      setDeliveryDeadline(initialData.deliveryDeadline || '');
      setStatus(initialData.status || 'pending');
      setNotes(initialData.notes || '');
      setItems(initialData.items ? [...initialData.items] : []);
    } else {
      const todayStr = new Date().toISOString().split('T')[0];
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 15);
      const deadlineStr = futureDate.toISOString().split('T')[0];

      setOrderNumber(`PED-${new Date().getFullYear()}-${String(db.orders.length + 101).padStart(3, '0')}`);
      setPartnerId(customers[0]?.id || '');
      setOrderDate(todayStr);
      setDeliveryDeadline(deadlineStr);
      setStatus('pending');
      setNotes('');
      setItems(
        db.products.length > 0
          ? [{ productId: db.products[0].id, quantity: 1, unitPrice: db.products[0].salePrice || 0 }]
          : []
      );
    }
    setErrorMessage('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const totalValue = items.reduce(
    (acc, it) => acc + (it.quantity || 0) * (it.unitPrice || 0),
    0
  );

  const handleAddItem = () => {
    if (db.products.length === 0) {
      setErrorMessage('Nenhum produto cadastrado para adicionar ao pedido.');
      return;
    }
    const prod = db.products[0];
    setItems([...items, { productId: prod.id, quantity: 1, unitPrice: prod.salePrice || 0 }]);
  };

  const handleUpdateItem = (index: number, field: keyof OrderItem, value: any) => {
    const newItems = [...items];
    if (field === 'productId') {
      const prod = db.products.find((p) => p.id === value);
      newItems[index] = {
        ...newItems[index],
        productId: value,
        unitPrice: prod ? prod.salePrice : newItems[index].unitPrice,
      };
    } else {
      newItems[index] = {
        ...newItems[index],
        [field]: Number(value),
      };
    }
    setItems(newItems);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!partnerId) {
      setErrorMessage('Selecione um cliente para o pedido.');
      return;
    }
    if (!orderDate) {
      setErrorMessage('Informe a data do pedido.');
      return;
    }
    if (!deliveryDeadline) {
      setErrorMessage('Informe o prazo de entrega prometido.');
      return;
    }
    if (items.length === 0) {
      setErrorMessage('Adicione pelo menos um produto ao pedido.');
      return;
    }

    for (const it of items) {
      if (!it.productId) {
        setErrorMessage('Selecione um produto válido em todos os itens.');
        return;
      }
      if (it.quantity <= 0) {
        setErrorMessage('A quantidade do produto deve ser maior que zero.');
        return;
      }
      if (it.unitPrice < 0) {
        setErrorMessage('O preço unitário não pode ser negativo.');
        return;
      }
    }

    const res = onSave({
      orderNumber: orderNumber.trim(),
      partnerId,
      orderDate,
      deliveryDeadline,
      items,
      totalValue: Number(totalValue.toFixed(2)),
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
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {initialData ? 'Editar Pedido de Venda' : 'Novo Pedido de Cliente'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Registre a demanda comercial com produtos, quantidades e prazos
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
                Número do Pedido
              </label>
              <input
                type="text"
                required
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="w-full px-3 py-2 font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div className="col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Cliente <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={partnerId}
                onChange={(e) => setPartnerId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600"
              >
                <option value="">Selecione um cliente...</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.document})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Data do Pedido
              </label>
              <input
                type="date"
                required
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                className="w-full px-3 py-2 font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Prazo Prometido (Entrega) <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={deliveryDeadline}
                onChange={(e) => setDeliveryDeadline(e.target.value)}
                className="w-full px-3 py-2 font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Status do Pedido
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as OrderStatus)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600"
              >
                <option value="pending">Pendente</option>
                <option value="in_production">Em Produção</option>
                <option value="completed">Concluído / Entregue</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
          </div>

          {/* Produtos do Pedido */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-900 uppercase tracking-wider">
                Itens do Pedido
              </label>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Adicionar Produto
              </button>
            </div>

            {items.length === 0 ? (
              <div className="p-4 border border-dashed border-slate-300 rounded-lg text-center text-slate-400">
                Nenhum produto incluído. Clique em "Adicionar Produto" acima.
              </div>
            ) : (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
                    <tr>
                      <th className="py-2 px-3">Produto</th>
                      <th className="py-2 px-3 text-center w-24">Quantidade</th>
                      <th className="py-2 px-3 text-right w-28">Preço Unit. (R$)</th>
                      <th className="py-2 px-3 text-right w-28">Subtotal</th>
                      <th className="py-2 px-2 text-center w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((it, idx) => {
                      const subtotal = (it.quantity || 0) * (it.unitPrice || 0);

                      return (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-2 px-3">
                            <select
                              value={it.productId}
                              onChange={(e) => handleUpdateItem(idx, 'productId', e.target.value)}
                              className="w-full px-2 py-1 bg-white border border-slate-300 rounded focus:outline-none focus:border-indigo-600"
                            >
                              {db.products.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.code} - {p.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="number"
                              min="1"
                              required
                              value={it.quantity}
                              onChange={(e) => handleUpdateItem(idx, 'quantity', e.target.value)}
                              className="w-full px-2 py-1 font-mono text-center bg-white border border-slate-300 rounded focus:outline-none focus:border-indigo-600"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              required
                              value={it.unitPrice}
                              onChange={(e) => handleUpdateItem(idx, 'unitPrice', e.target.value)}
                              className="w-full px-2 py-1 font-mono text-right bg-white border border-slate-300 rounded focus:outline-none focus:border-indigo-600"
                            />
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-semibold text-slate-900">
                            R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-2 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
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
                      <td colSpan={3} className="py-2 px-3 font-semibold text-slate-700 text-right">
                        Valor Total do Pedido:
                      </td>
                      <td className="py-2 px-3 font-mono font-bold text-emerald-700 text-right text-sm">
                        R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Observações Comerciais ou Instruções de Entrega
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Endereço de entrega alternativo, nota fiscal ou requisitos do cliente..."
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
              {initialData ? 'Salvar Pedido' : 'Registrar Pedido'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
