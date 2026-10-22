import React from 'react';
import { Database, Download, HelpCircle, RefreshCw } from 'lucide-react';
import { useERP } from '../../context/ERPContext';

interface HeaderProps {
  activeModule: string;
  setActiveModule: (module: string) => void;
  onOpenHelp: () => void;
  onOpenBackup: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeModule,
  setActiveModule,
  onOpenHelp,
  onOpenBackup,
}) => {
  const { lastSync } = useERP();

  const navLinks = [
    { id: 'dashboard', label: 'Visão Geral' },
    { id: 'production', label: 'Produção & OPs' },
    { id: 'orders', label: 'Pedidos' },
    { id: 'products', label: 'Fichas Técnicas' },
    { id: 'materials', label: 'Matérias-Primas' },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveModule('dashboard')}
              className="text-left group cursor-pointer focus:outline-none"
            >
              <span className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors whitespace-nowrap">
                PlanoPME <span className="text-indigo-600 font-semibold text-sm">ERP</span>
              </span>
            </button>
          </div>

          {/* Zone 2: Clean single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => setActiveModule(link.id)}
                className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
                  activeModule === link.id
                    ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                    : 'hover:text-slate-900 hover:border-b-2 hover:border-slate-300'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Zone 3: Primary Actions (Backup & Guia Operacional) */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={onOpenBackup}
              title="Backup, exportação e importação de dados"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <Database className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">Backup & Dados</span>
            </button>

            <button
              onClick={onOpenHelp}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Manual do Sistema</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
