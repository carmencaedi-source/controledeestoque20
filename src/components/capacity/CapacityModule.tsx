import React, { useState } from 'react';
import {
  Gauge,
  Clock,
  Users,
  Calendar,
  Zap,
  CheckCircle2,
  AlertTriangle,
  PlaySquare,
  ArrowRight,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';

export const CapacityModule: React.FC<{ onNavigateToOPs?: () => void }> = ({ onNavigateToOPs }) => {
  const {
    db,
    updateCapacity,
    getTotalCapacityHours,
    getOccupiedHours,
    getCapacityOccupancyRate,
  } = useERP();

  const [workingDays, setWorkingDays] = useState(db.capacity.workingDays);
  const [hoursPerDay, setHoursPerDay] = useState(db.capacity.hoursPerDay);
  const [activeWorkstations, setActiveWorkstations] = useState(db.capacity.activeWorkstations);
  const [efficiencyRatePercent, setEfficiencyRatePercent] = useState(db.capacity.efficiencyRatePercent);
  const [periodLabel, setPeriodLabel] = useState(db.capacity.periodLabel);
  const [notes, setNotes] = useState(db.capacity.notes || '');
  const [isSaved, setIsSaved] = useState(false);

  // Cálculos matemáticos de capacidade
  const rawCapacityHours = workingDays * hoursPerDay * activeWorkstations;
  const effectiveCapacityHours = getTotalCapacityHours();
  const occupiedHours = getOccupiedHours();
  const occupancyRate = getCapacityOccupancyRate();
  const freeHours = Math.max(0, Number((effectiveCapacityHours - occupiedHours).toFixed(1)));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCapacity({
      periodLabel: periodLabel.trim() || 'Mês Operacional',
      workingDays: Number(workingDays) || 22,
      hoursPerDay: Number(hoursPerDay) || 8,
      activeWorkstations: Number(activeWorkstations) || 1,
      efficiencyRatePercent: Number(efficiencyRatePercent) || 100,
      notes: notes.trim(),
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  // OPs ativas alocadas
  const activeOPs = db.productionOrders.filter(
    (op) => op.status === 'waiting' || op.status === 'in_progress'
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Planejamento da Capacidade Produtiva
              </h1>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Dimensione a disponibilidade horária da oficina ou fábrica para equilibrar a demanda de pedidos sem gargalos.
            </p>
          </div>
        </div>
      </div>

      {/* Main KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Capacidade Efetiva Líquida */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block">
            Capacidade Efetiva (Mês)
          </span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-bold font-mono text-indigo-700">
              {effectiveCapacityHours}
            </span>
            <span className="text-xs text-slate-500 font-mono">horas úteis</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 font-mono">
            Bruto: {rawCapacityHours}h (Eficiência: {efficiencyRatePercent}%)
          </div>
        </div>

        {/* Card 2: Horas Ocupadas */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block">
            Horas Alocadas em OPs
          </span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-bold font-mono text-amber-600">
              {occupiedHours}
            </span>
            <span className="text-xs text-slate-500 font-mono">horas</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-mono">
            {activeOPs.length} ordem(ns) em fila ou em execução
          </div>
        </div>

        {/* Card 3: Taxa de Ocupação */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block">
            Taxa de Ocupação da Fábrica
          </span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span
              className={`text-3xl font-bold font-mono ${
                occupancyRate > 90
                  ? 'text-rose-600'
                  : occupancyRate > 75
                  ? 'text-amber-600'
                  : 'text-emerald-700'
              }`}
            >
              {occupancyRate}%
            </span>
          </div>
          <div className="mt-2 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all ${
                occupancyRate > 90
                  ? 'bg-rose-500'
                  : occupancyRate > 75
                  ? 'bg-amber-500'
                  : 'bg-emerald-600'
              }`}
              style={{ width: `${Math.min(100, occupancyRate)}%` }}
            />
          </div>
        </div>

        {/* Card 4: Saldo Disponível */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block">
            Saldo de Horas Livres
          </span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-bold font-mono text-slate-900">
              {freeHours}
            </span>
            <span className="text-xs text-slate-500 font-mono">horas vagas</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            {freeHours > 0 ? 'Capacidade para aceitar novos pedidos' : 'Fábrica no limite operacional!'}
          </div>
        </div>
      </div>

      {/* Grid: Formulário de Configuração & OPs Alocadas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulário de Dimensionamento */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Parâmetros de Dimensionamento
              </h2>
              <p className="text-xs text-slate-500">
                Ajuste os parâmetros conforme a jornada e a equipe da empresa
              </p>
            </div>
            {isSaved && (
              <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Salvo!
              </span>
            )}
          </div>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Identificação do Período
              </label>
              <input
                type="text"
                placeholder="Ex: Mês Operacional Padrão"
                value={periodLabel}
                onChange={(e) => setPeriodLabel(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  Dias Úteis no Mês
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  required
                  value={workingDays}
                  onChange={(e) => setWorkingDays(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Ex: 22 dias úteis
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  Horas por Dia de Trabalho
                </label>
                <input
                  type="number"
                  min="1"
                  max="24"
                  step="0.5"
                  required
                  value={hoursPerDay}
                  onChange={(e) => setHoursPerDay(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Ex: 8.0 horas / turno
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-slate-500" />
                  Operários / Postos Ativos
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={activeWorkstations}
                  onChange={(e) => setActiveWorkstations(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Número de bancadas ou profissionais
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-slate-500" />
                  Eficiência Média (%)
                </label>
                <input
                  type="number"
                  min="10"
                  max="100"
                  required
                  value={efficiencyRatePercent}
                  onChange={(e) => setEfficiencyRatePercent(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Desconta paradas e manutenções (ex: 85%)
                </span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Notas do Planejamento Fabril
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observações sobre gargalos, turnos extras ou férias..."
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 leading-relaxed text-[11px]">
              <strong className="text-slate-900 block mb-0.5">Fórmula de Cálculo ERP:</strong>
              {workingDays} dias × {hoursPerDay}h/dia × {activeWorkstations} postos ={' '}
              <strong className="text-slate-800 font-mono">{rawCapacityHours}h teóricas</strong>.{' '}
              Com {efficiencyRatePercent}% de eficiência ={' '}
              <strong className="text-indigo-700 font-mono">{effectiveCapacityHours}h úteis disponíveis</strong>.
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer shadow-sm"
              >
                Atualizar Capacidade
              </button>
            </div>
          </form>
        </div>

        {/* Ordens Consumindo Capacidade */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Carga Alocada em Ordens Ativas
                </h2>
                <p className="text-xs text-slate-500">
                  Ordens de produção comprometendo o tempo da equipe
                </p>
              </div>
              {onNavigateToOPs && (
                <button
                  onClick={onNavigateToOPs}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 cursor-pointer"
                >
                  Ver OPs <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {activeOPs.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">
                <Gauge className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                Nenhuma ordem consumindo capacidade no momento. Fábrica com 100% de tempo livre para novas ordens.
              </div>
            ) : (
              <div className="space-y-3">
                {activeOPs.map((op) => {
                  const product = db.products.find((p) => p.id === op.productId);
                  const opHours = Number((op.estimatedDurationMinutes / 60).toFixed(1));
                  const percentageOfCapacity = effectiveCapacityHours > 0
                    ? ((opHours / effectiveCapacityHours) * 100).toFixed(1)
                    : 0;

                  return (
                    <div
                      key={op.id}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900">
                            {op.opNumber}
                          </span>
                          <span className="text-slate-300">·</span>
                          <span
                            className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                              op.status === 'in_progress'
                                ? 'bg-indigo-100 text-indigo-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {op.status === 'in_progress' ? 'Em Produção' : 'Aguardando'}
                          </span>
                        </div>
                        <div className="text-slate-700 font-medium mt-1">
                          {product?.name || 'Produto'}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          Quantidade: {op.quantity} {product?.unit || 'un'} · Prazo: {op.deadlineDate}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-mono font-bold text-indigo-700">
                          {opHours}h
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {percentageOfCapacity}% da capacidade
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>Carga Total Atual:</span>
            <span className="font-mono font-bold text-slate-900">
              {occupiedHours}h de {effectiveCapacityHours}h ({occupancyRate}%)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
