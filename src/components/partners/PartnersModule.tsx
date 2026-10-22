import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Building2,
  Phone,
  Mail,
  MapPin,
  Edit2,
  Trash2,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { Partner, PartnerType } from '../../types/erp';
import { PartnerModal } from './PartnerModal';

export const PartnersModule: React.FC = () => {
  const { db, addPartner, updatePartner, deletePartner } = useERP();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | PartnerType>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const filteredPartners = db.partners.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.document.includes(searchTerm) ||
      (p.contactName && p.contactName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.email && p.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.address?.city && p.address.city.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = typeFilter === 'all' || p.type === typeFilter;

    return matchesSearch && matchesType;
  });

  const handleOpenCreate = () => {
    setEditingPartner(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (partner: Partner) => {
    setEditingPartner(partner);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (!window.confirm(`Deseja realmente excluir o parceiro "${name}"?`)) {
      return;
    }

    const res = deletePartner(id);
    if (res.success) {
      setStatusMessage({ text: `Parceiro "${name}" excluído com sucesso.`, type: 'success' });
      setTimeout(() => setStatusMessage(null), 4000);
    } else {
      setStatusMessage({ text: res.message || 'Erro ao excluir parceiro.', type: 'error' });
      setTimeout(() => setStatusMessage(null), 6000);
    }
  };

  const handleSave = (data: Omit<Partner, 'id' | 'createdAt'>) => {
    if (editingPartner) {
      const res = updatePartner(editingPartner.id, data);
      if (res.success) {
        setStatusMessage({ text: 'Parceiro atualizado com sucesso.', type: 'success' });
        setTimeout(() => setStatusMessage(null), 4000);
      }
      return res;
    } else {
      const res = addPartner(data);
      if (res.success) {
        setStatusMessage({ text: 'Parceiro cadastrado com sucesso!', type: 'success' });
        setTimeout(() => setStatusMessage(null), 4000);
      }
      return res;
    }
  };

  const customersCount = db.partners.filter((p) => p.type === 'customer' || p.type === 'both').length;
  const suppliersCount = db.partners.filter((p) => p.type === 'supplier' || p.type === 'both').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Clientes & Fornecedores
              </h1>
              <span className="text-xs text-slate-400 font-mono">
                ({db.partners.length} registros)
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Gerencie a carteira de clientes para pedidos e os fornecedores para compra de matéria-prima.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Novo Parceiro
            </button>
          </div>
        </div>

        {/* Quick count chips */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-6 text-xs font-mono">
          <span className="text-slate-600">
            Clientes: <strong className="text-indigo-700">{customersCount}</strong>
          </span>
          <span className="text-slate-300">·</span>
          <span className="text-slate-600">
            Fornecedores: <strong className="text-emerald-700">{suppliersCount}</strong>
          </span>
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

      {/* Toolbar & Filter Tabs */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium w-full sm:w-auto">
          <button
            onClick={() => setTypeFilter('all')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              typeFilter === 'all'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todos ({db.partners.length})
          </button>
          <button
            onClick={() => setTypeFilter('customer')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              typeFilter === 'customer'
                ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Clientes
          </button>
          <button
            onClick={() => setTypeFilter('supplier')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              typeFilter === 'supplier'
                ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Fornecedores
          </button>
          <button
            onClick={() => setTypeFilter('both')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              typeFilter === 'both'
                ? 'bg-white text-violet-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ambos
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome, documento ou cidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        {filteredPartners.length === 0 ? (
          <div className="py-16 text-center">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-700">
              Nenhum parceiro encontrado
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {searchTerm || typeFilter !== 'all'
                ? 'Tente ajustar os filtros ou a busca.'
                : 'Cadastre seus clientes para vincular a pedidos de venda.'}
            </p>
            {!searchTerm && typeFilter === 'all' && (
              <button
                onClick={handleOpenCreate}
                className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Cadastrar Parceiro
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Nome / Razão Social</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">Documento</th>
                  <th className="py-3 px-4">Contato</th>
                  <th className="py-3 px-4">Localização</th>
                  <th className="py-3 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPartners.map((partner) => {
                  const typeLabel =
                    partner.type === 'customer'
                      ? 'Cliente'
                      : partner.type === 'supplier'
                      ? 'Fornecedor'
                      : 'Ambos';

                  const typeColor =
                    partner.type === 'customer'
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      : partner.type === 'supplier'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-violet-50 text-violet-700 border border-violet-200';

                  return (
                    <tr key={partner.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{partner.name}</div>
                        {partner.notes && (
                          <div className="text-[11px] text-slate-400 truncate max-w-xs">
                            {partner.notes}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded ${typeColor}`}>
                          {typeLabel}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-700 whitespace-nowrap">
                        {partner.document}
                      </td>

                      <td className="py-3 px-4 space-y-0.5">
                        {partner.contactName && (
                          <div className="font-medium text-slate-800">{partner.contactName}</div>
                        )}
                        <div className="flex items-center gap-2 text-slate-500 font-mono text-[11px]">
                          {partner.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" />
                              {partner.phone}
                            </span>
                          )}
                          {partner.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-400" />
                              {partner.email}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-600">
                        {partner.address?.city ? (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>
                              {partner.address.city}/{partner.address.state || 'BR'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(partner)}
                            title="Editar parceiro"
                            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(partner.id, partner.name)}
                            title="Excluir parceiro"
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

      <PartnerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editingPartner}
      />
    </div>
  );
};
