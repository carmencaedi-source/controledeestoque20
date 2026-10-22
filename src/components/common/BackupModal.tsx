import React, { useRef, useState } from 'react';
import {
  X,
  Download,
  Upload,
  RefreshCw,
  Database,
  CheckCircle2,
  AlertTriangle,
  HardDrive,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({ isOpen, onClose }) => {
  const { db, exportBackup, importBackup, resetToDemoData } = useERP();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const res = importBackup(content);
        if (res.success) {
          setMessage({ text: 'Backup restaurado com sucesso!', type: 'success' });
        } else {
          setMessage({ text: res.message, type: 'error' });
        }
      } catch (err) {
        setMessage({ text: 'Falha ao ler o arquivo selecionado.', type: 'error' });
      }
    };
    reader.readAsText(file);
    // Limpa valor para permitir re-upload do mesmo arquivo
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleResetDemo = () => {
    if (
      window.confirm(
        'Tem certeza que deseja restaurar os dados de demonstração da fábrica? Suas alterações atuais serão substituídas.'
      )
    ) {
      resetToDemoData();
      setMessage({ text: 'Dados de demonstração restaurados com sucesso!', type: 'success' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Gerenciamento de Dados & Backup
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Cópia de segurança, exportação e restauração de dados do ERP
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          {message && (
            <div
              className={`p-3 rounded-lg text-xs font-medium flex items-center justify-between border ${
                message.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              <span>{message.text}</span>
              <button onClick={() => setMessage(null)} className="text-slate-400 ml-2">
                &times;
              </button>
            </div>
          )}

          {/* Estatísticas de armazenamento */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
            <div className="flex items-center justify-between font-semibold text-slate-700">
              <span className="flex items-center gap-1.5">
                <HardDrive className="w-4 h-4 text-slate-500" />
                Registros Atualmente Salvos no Navegador
              </span>
              <span className="font-mono text-emerald-700">100% Persistente</span>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-[11px] text-slate-600">
              <div>Matérias-Primas: <strong>{db.rawMaterials.length}</strong></div>
              <div>Produtos (BOM): <strong>{db.products.length}</strong></div>
              <div>Parceiros: <strong>{db.partners.length}</strong></div>
              <div>Pedidos: <strong>{db.orders.length}</strong></div>
              <div>Ordens (OP): <strong>{db.productionOrders.length}</strong></div>
              <div>Versão: <strong>v{db.version}</strong></div>
            </div>
          </div>

          {/* Opção 1: Exportar Backup */}
          <div className="p-4 border border-slate-200 rounded-xl space-y-2 hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-xs">
                  Exportar Cópia de Segurança (JSON)
                </h4>
                <p className="text-[11px] text-slate-500">
                  Baixe um arquivo contendo todas as fichas, insumos, pedidos e histórico.
                </p>
              </div>
              <button
                onClick={exportBackup}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer shadow-xs whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5" />
                Baixar Backup
              </button>
            </div>
          </div>

          {/* Opção 2: Importar Backup */}
          <div className="p-4 border border-slate-200 rounded-xl space-y-2 hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-xs">
                  Restaurar de Arquivo JSON
                </h4>
                <p className="text-[11px] text-slate-500">
                  Carregue um arquivo .json exportado anteriormente neste sistema.
                </p>
              </div>
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors cursor-pointer whitespace-nowrap">
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                Selecionar Arquivo
                <input
                  type="file"
                  accept=".json"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Opção 3: Restaurar dados de demonstração */}
          <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1 text-amber-900">
                  <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
                  Restaurar Demonstração (ArteMadeira PME)
                </h4>
                <p className="text-[11px] text-slate-600">
                  Recarrega o catálogo exemplo com produtos, pedidos e OPs padrão.
                </p>
              </div>
              <button
                onClick={handleResetDemo}
                className="px-3 py-1.5 text-xs font-medium text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                Restaurar Padrão
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
