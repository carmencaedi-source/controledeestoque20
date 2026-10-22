import React from 'react';
import {
  X,
  BookOpen,
  Layers,
  Boxes,
  Users,
  Gauge,
  ShoppingCart,
  Clock,
  PlaySquare,
  CheckCircle2,
  Database,
  ArrowRight,
} from 'lucide-react';

interface HelpGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpGuideModal: React.FC<HelpGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const modulesGuide = [
    {
      num: '01',
      title: 'Ficha Técnica do Produto (BOM)',
      icon: Layers,
      color: 'text-indigo-600',
      description:
        'Cada produto fabricado possui sua "receita" ou lista de insumos (Bill of Materials). Nela, você cadastra quais matérias-primas são consumidas e a quantidade exata por unidade produzida. O sistema calcula automaticamente o custo de insumos da peça e sua margem sobre o preço de venda.',
    },
    {
      num: '02',
      title: 'Cadastro de Matéria-Prima',
      icon: Boxes,
      color: 'text-emerald-600',
      description:
        'Cadastre os materiais que sua empresa compra para produzir: madeira, tecidos, parafusos, tintas, embalagens, etc. Informe a unidade de medida (kg, m, un, l), quantidade em estoque, estoque mínimo de segurança e custo unitário. O sistema avisa quando um item precisa de reposição de compra.',
    },
    {
      num: '03',
      title: 'Clientes e Fornecedores',
      icon: Users,
      color: 'text-violet-600',
      description:
        'Cadastro unificado de parceiros comerciais. Um mesmo registro pode ser marcado como Cliente (para pedidos de venda), Fornecedor (para matérias-primas) ou Ambos. Inclui documento (CPF/CNPJ), contato direto, telefone, e-mail e endereço.',
    },
    {
      num: '04',
      title: 'Capacidade Produtiva',
      icon: Gauge,
      color: 'text-amber-600',
      description:
        'Planeje a jornada da sua fábrica: informe quantos dias úteis tem o mês, horas trabalhadas por dia, número de operários ou postos de trabalho e a taxa de eficiência (descontando paradas). O sistema calcula as horas totais disponíveis e compara com a carga de ordens ativas para evitar atrasos e gargalos.',
    },
    {
      num: '05',
      title: 'Cadastro de Pedidos de Venda',
      icon: ShoppingCart,
      color: 'text-blue-600',
      description:
        'Registre as vendas feitas aos clientes, prazos combinados de entrega e valores. Com um único clique no botão "Gerar Ordem de Produção", o ERP cria automaticamente as ordens de fabricação para todos os itens do pedido com as datas alinhadas.',
    },
    {
      num: '06',
      title: 'Tempo de Processo',
      icon: Clock,
      color: 'text-cyan-600',
      description:
        'Configurado no cadastro de cada produto (em minutos ou horas por peça). Ao planejar uma ordem de produção de 10 unidades, por exemplo, o sistema multiplica automaticamente esse tempo para prever a duração total no chão de fábrica e projetar o consumo da capacidade fabril.',
    },
    {
      num: '07',
      title: 'Ordens de Produção (OP)',
      icon: PlaySquare,
      color: 'text-indigo-600',
      description:
        'Representam o trabalho a ser feito no chão de fábrica. Podem ser geradas a partir de pedidos ou avulsas (para repor o estoque). Antes de iniciar, o sistema confere se há matéria-prima suficiente em estoque e emite alerta caso falte algum insumo.',
    },
    {
      num: '08',
      title: 'Acompanhamento da Produção',
      icon: CheckCircle2,
      color: 'text-emerald-600',
      description:
        'Acompanhe visualmente as ordens no Quadro Kanban ou na Tabela de Operações (Aguardando → Em Produção → Concluída → Cancelada). Ao iniciar, o sistema carimba a data de início real; ao concluir, carimba o término e baixa automaticamente o estoque de matérias-primas consumidas!',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Manual do Usuário & Arquitetura do Sistema
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Guia prático para operar o ERP de produção da sua empresa
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

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
          {/* Fluxo Relacional */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Fluxo Operacional Integrado do ERP
            </h4>
            <div className="flex flex-wrap items-center gap-2 text-slate-700 font-medium text-[11px] pt-1">
              <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-md">
                1. Matérias-Primas (Estoque)
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-md">
                2. Ficha Técnica & Tempo
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-md">
                3. Pedido de Cliente
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md">
                4. Ordem de Produção (OP)
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md">
                5. Baixa de Insumos & Conclusão
              </span>
            </div>
          </div>

          {/* Os 8 Módulos Explicados */}
          <div>
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs mb-3">
              Módulos do Sistema
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {modulesGuide.map((m) => {
                const Icon = m.icon;
                return (
                  <div
                    key={m.num}
                    className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1.5 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${m.color}`} />
                      <span className="font-mono text-[11px] text-slate-400 font-bold">
                        {m.num}.
                      </span>
                      <h5 className="font-bold text-slate-900 text-xs">
                        {m.title}
                      </h5>
                    </div>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      {m.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Justificativa Técnica da Persistência */}
          <div className="p-4 bg-indigo-50/60 border border-indigo-200 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs uppercase tracking-wider">
              <Database className="w-4 h-4 text-indigo-600" />
              Justificativa Técnica: Armazenamento Local Persistente (LocalStorage)
            </div>
            <p className="text-slate-700 leading-relaxed text-[11px]">
              O <strong>PlanoPME ERP</strong> foi construído utilizando persistência local no navegador (LocalStorage estruturado com esquema versionado e serialização JSON). Essa escolha arquitetural oferece vantagens decisivas para micro e pequenas empresas:
            </p>
            <ul className="list-disc pl-4 space-y-1 text-slate-600 text-[11px]">
              <li>
                <strong>Zero Custo e Zero Complexidade de Infraestrutura:</strong> Não requer instalação de servidores de banco de dados pesados (como MySQL ou Postgres) nem dependência de conexão com internet para funcionar no chão de fábrica.
              </li>
              <li>
                <strong>Velocidade Instantânea (0ms de latência):</strong> As fichas técnicas, cálculos de capacidade e alterações no Kanban respondem em tempo real sem atrasos de rede.
              </li>
              <li>
                <strong>Privacidade Absoluta das Fórmulas:</strong> As listas de matérias-primas e preços da empresa ficam armazenadas estritamente no dispositivo do próprio usuário.
              </li>
              <li>
                <strong>Backups Portáteis:</strong> O sistema possui ferramenta nativa para exportar e importar arquivos de backup em formato JSON padronizado a qualquer momento.
              </li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer shadow-sm"
          >
            Entendido, Voltar ao Sistema
          </button>
        </div>
      </div>
    </div>
  );
};
