/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Category, ChecklistState, EVALUATION_CATEGORIES, EvaluationItem, EvaluationStatus, VehicleType } from '../types';
import { ClipboardCheck, Sparkles, AlertTriangle, MessageSquarePlus, ChevronDown, ChevronUp, Check, X, Search, Filter } from 'lucide-react';

interface ChecklistEvaluatorProps {
  vehicleType: VehicleType;
  checklist: ChecklistState;
  onChange: (itemId: string, status: EvaluationStatus, observation: string) => void;
  onBulkConforme: () => void;
  onProceed: () => void;
  onBack: () => void;
}

// Quick presets for observation depending on the item or category to complete in 1 tap!
const QUICK_OBSERVATION_PRESETS: { [category: string]: string[] } = {
  general: [
    'Esqueceu sinalizador (seta)',
    'Deixou motor apagar (morrer)',
    'Uso incorreto dos retrovisores',
    'Falta de atenção constante',
    'Posição inadequada da marcha',
    'Flechada súbita no freio',
    'Manobra com hesitação',
    'Falta de cinto de segurança',
    'Desrespeitou semáforo',
    'Segurança comprometida'
  ]
};

export default function ChecklistEvaluator({
  vehicleType,
  checklist,
  onChange,
  onBulkConforme,
  onProceed,
  onBack
}: ChecklistEvaluatorProps) {
  const [expandedCategories, setExpandedCategories] = useState<{ [catId: string]: boolean }>({
    preparacao_inicial: true, // start with first expanded
    partida_veiculo: true
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'pending' | 'nao_conforme'>('all');
  const [activeItemNotes, setActiveItemNotes] = useState<string | null>(null);

  const toggleCategory = (catId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [catId]: !prev[catId]
    }));
  };

  const expandAll = () => {
    const allExp: { [catId: string]: boolean } = {};
    EVALUATION_CATEGORIES.forEach(c => {
      allExp[c.id] = true;
    });
    setExpandedCategories(allExp);
  };

  const collapseAll = () => {
    const allExp: { [catId: string]: boolean } = {};
    EVALUATION_CATEGORIES.forEach(c => {
      allExp[c.id] = false;
    });
    setExpandedCategories(allExp);
  };

  // Progress metrics
  const totalItems = EVALUATION_CATEGORIES.flatMap(c => c.items).length;
  const evaluatedItems = Object.keys(checklist).filter(id => checklist[id].status !== 'PENDING').length;
  const progressPercent = Math.round((evaluatedItems / totalItems) * 100);

  // Helper to check if a category is fully completed
  const isCategoryComplete = (category: Category) => {
    return category.items.every(item => {
      const state = checklist[item.id];
      return state && state.status !== 'PENDING';
    });
  };

  const isCategoryHasDefect = (category: Category) => {
    return category.items.some(item => {
      const state = checklist[item.id];
      return state && state.status === 'NAO_CONFORME';
    });
  };

  return (
    <div className="space-y-6" id="checklist-evaluator-root">
      {/* FLOATING OR TOP PROGRESS CONTAINER */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm space-y-3 sticky top-0 z-30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ClipboardCheck className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Filtro & Progresso</h3>
              <p className="text-xxs text-slate-400">Preenchimento obrigatório para prosseguir</p>
            </div>
          </div>
          <span className="text-xs font-bold font-mono text-blue-700 bg-blue-50 px-2 py-1 rounded-md">
            {evaluatedItems} / {totalItems} ITENS ({progressPercent}%)
          </span>
        </div>

        {/* Outer progress bar bar */}
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
          <div 
            className="bg-blue-600 h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* DYNAMIC ACTION HELPER BAR: MASS COMPLETE YIELDS HIGH UX HIGHLIGHT */}
        <div className="grid grid-cols-1 sm:flex sm:items-center sm:justify-between gap-2.5 pt-1">
          <button
            id="btn-fast-conforme"
            type="button"
            className="w-full sm:w-auto text-center py-2.5 px-4 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer border border-emerald-200"
            onClick={onBulkConforme}
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Preencher Restantes como Conforme ✔</span>
          </button>

          <div className="flex items-center justify-between sm:justify-end space-x-3 text-xs">
            <button 
              type="button" 
              onClick={expandAll} 
              className="text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
            >
              Expandir Tudo
            </button>
            <span className="text-slate-300">|</span>
            <button 
              type="button" 
              onClick={collapseAll} 
              className="text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
            >
              Recolher Tudo
            </button>
          </div>
        </div>
      </div>

      {/* FILTER AND QUICK SEARCH */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            id="search-checklist-input"
            type="text"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            placeholder="Pesquisar item (ex: baliza, cinto)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Segmented Filter Option buttons */}
        <div className="flex rounded-xl bg-slate-100 p-1 text-xs">
          <button
            type="button"
            className={`flex-1 py-1.5 px-2 rounded-lg font-medium text-center transition-all cursor-pointer ${
              filterType === 'all' ? 'bg-white text-slate-800 shadow-xs font-semibold' : 'text-slate-500 hover:text-slate-800'
            }`}
            onClick={() => setFilterType('all')}
          >
            Todos
          </button>
          <button
            type="button"
            className={`flex-1 py-1.5 px-2 rounded-lg font-medium text-center transition-all cursor-pointer ${
              filterType === 'pending' ? 'bg-white text-slate-800 shadow-xs font-semibold' : 'text-slate-500 hover:text-slate-800'
            }`}
            onClick={() => setFilterType('pending')}
          >
            Pendentes ({totalItems - evaluatedItems})
          </button>
          <button
            type="button"
            className={`flex-1 py-1.5 px-2 rounded-lg font-medium text-center transition-all cursor-pointer ${
              filterType === 'nao_conforme' ? 'bg-white text-slate-800 shadow-xs font-semibold' : 'text-slate-500 hover:text-slate-800'
            }`}
            onClick={() => setFilterType('nao_conforme')}
          >
            Não Conf.
          </button>
        </div>
      </div>

      {/* DETAILED CATEGORIES checklist */}
      <div className="space-y-4">
        {EVALUATION_CATEGORIES.map((category) => {
          // Filter items inside this category based on searching and filtering settings
          const filteredItems = category.items.filter(item => {
            // Apply text keyword filter
            const matchesText = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                (item.criticalName && item.criticalName.toLowerCase().includes(searchTerm.toLowerCase()));
            
            // Apply status selector filter
            const itemState = checklist[item.id];
            const status = itemState ? itemState.status : 'PENDING';
            
            if (filterType === 'pending') {
              return matchesText && status === 'PENDING';
            }
            if (filterType === 'nao_conforme') {
              return matchesText && status === 'NAO_CONFORME';
            }
            return matchesText;
          });

          // Skip section rendering if searching/filtering yielded zero elements in this section
          if (filteredItems.length === 0) return null;

          const isExpanded = expandedCategories[category.id] ?? false;
          const isCategoryCompleteStatus = isCategoryComplete(category);
          const isCategoryDamaged = isCategoryHasDefect(category);

          return (
            <div 
              key={category.id} 
              className={`bg-white rounded-2xl border transition-all overflow-hidden ${
                isCategoryDamaged 
                  ? 'border-red-100 hover:border-red-200' 
                  : isCategoryCompleteStatus 
                    ? 'border-emerald-100 hover:border-emerald-200' 
                    : 'border-slate-100'
              }`}
            >
              {/* Category Header Bar */}
              <button
                id={`accordion-title-${category.id}`}
                type="button"
                className={`w-full px-5 py-4 flex items-center justify-between text-left cursor-pointer transition-colors outline-none focus:outline-none ${
                  isCategoryDamaged 
                    ? 'bg-red-50/30' 
                    : isCategoryCompleteStatus 
                      ? 'bg-emerald-50/20' 
                      : 'hover:bg-slate-50/50'
                }`}
                onClick={() => toggleCategory(category.id)}
              >
                <div className="flex items-center space-x-2.5">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                    {category.title}
                  </h3>
                  
                  {/* Status Badges for Category Completion */}
                  {isCategoryDamaged ? (
                    <span className="text-xxs px-1.5 py-0.5 bg-red-100 text-red-700 font-bold rounded-md flex items-center space-x-1">
                      <AlertTriangle className="w-3 h-3 block" />
                      <span>FALHA DETECTADA</span>
                    </span>
                  ) : isCategoryCompleteStatus ? (
                    <span className="text-xxs px-1.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-md">
                      CONCLUÍDO
                    </span>
                  ) : (
                    <span className="text-xxs px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded-md">
                      EM PROGRESSO
                    </span>
                  )}
                </div>

                <div className="text-slate-400">
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </button>

              {/* Collapsed/Expanded Content Checklist Grid Items */}
              {isExpanded && (
                <div className="p-4 sm:p-5 border-t border-slate-50 divide-y divide-slate-100">
                  {filteredItems.map((item) => {
                    const itemState = checklist[item.id];
                    const currentStatus = itemState ? itemState.status : 'PENDING';
                    const currentObs = itemState ? itemState.observation : '';

                    const isSelectedConforme = currentStatus === 'CONFORME';
                    const isSelectedNaoConforme = currentStatus === 'NAO_CONFORME';

                    return (
                      <div 
                        key={item.id} 
                        id={`checklist-item-row-${item.id}`}
                        className={`py-4 first:pt-0 last:pb-0 transition-all ${
                          isSelectedNaoConforme ? 'bg-red-50/20 -mx-4 px-4 rounded-xl' : ''
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          {/* Item Name Content */}
                          <div className="flex-1 space-y-1">
                            <span className="text-sm font-medium text-slate-705 block leading-tight">
                              {item.name}
                            </span>
                            {item.isCritical && (
                              <div className="inline-flex items-center space-x-1 text-red-600 bg-red-50 text-xxs font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wide">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                <span>FALHA CRÍTICA: {item.criticalName}</span>
                              </div>
                            )}

                            {/* Show shortened note if there is any */}
                            {currentObs && !activeItemNotes && (
                              <div className="flex items-center space-x-1 text-xs text-slate-500 italic bg-amber-50 border border-amber-100 px-2 py-0.5 rounded inline-block">
                                <span className="font-bold">Nota:</span>
                                <span>{currentObs}</span>
                              </div>
                            )}
                          </div>

                          {/* Large touch control buttons (Mobile Tactility!) */}
                          <div className="flex items-center space-x-2 w-full sm:w-auto">
                            {/* Button: CONFORME */}
                            <button
                              id={`btn-item-conforme-${item.id}`}
                              type="button"
                              className={`flex-1 sm:flex-initial py-3 px-4 rounded-xl font-semibold text-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer outline-none border ${
                                isSelectedConforme
                                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300'
                              }`}
                              onClick={() => onChange(item.id, 'CONFORME', currentObs)}
                            >
                              <Check className="w-4 h-4" />
                              <span>Conforme</span>
                            </button>

                            {/* Button: NÃO CONFORME */}
                            <button
                              id={`btn-item-naoconforme-${item.id}`}
                              type="button"
                              className={`flex-1 sm:flex-initial py-3 px-4 rounded-xl font-semibold text-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer outline-none border ${
                                isSelectedNaoConforme
                                  ? 'bg-red-600 border-red-600 text-white shadow-xs'
                                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300 hover:text-red-600'
                              }`}
                              onClick={() => {
                                onChange(item.id, 'NAO_CONFORME', currentObs);
                                // Automatically focus note area for immediate context entries!
                                setActiveItemNotes(item.id);
                              }}
                            >
                              <X className="w-4 h-4" />
                              <span>Não Conforme</span>
                            </button>

                            {/* Button: ADD OBSERVATION (Quick icon trigger) */}
                            <button
                              id={`btn-item-obs-trigger-${item.id}`}
                              type="button"
                              className={`p-3 rounded-xl border transition-all cursor-pointer outline-none flex items-center justify-center ${
                                currentObs 
                                  ? 'bg-amber-150 border-amber-300 text-amber-800' 
                                  : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'
                              }`}
                              onClick={() => setActiveItemNotes(activeItemNotes === item.id ? null : item.id)}
                              title="Inserir Observação"
                            >
                              <MessageSquarePlus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Expandable Notes Section with Fast-Clicks Tags (High conversion UI) */}
                        {(activeItemNotes === item.id || isSelectedNaoConforme) && (
                          <div className="mt-3.5 bg-slate-50/70 p-3.5 rounded-xl border border-slate-105 space-y-3 animation-fade-in block">
                            <div className="flex items-center justify-between">
                              <label htmlFor={`input-obs-${item.id}`} className="text-xxs font-bold text-slate-500 uppercase tracking-wider block">
                                Registrar Justificativa / Observação:
                              </label>
                              {activeItemNotes === item.id && (
                                <button 
                                  type="button"
                                  onClick={() => setActiveItemNotes(null)}
                                  className="text-[10px] text-blue-600 hover:underline cursor-pointer font-bold"
                                >
                                  Fechar Editor ✕
                                </button>
                              )}
                            </div>

                            <input
                              id={`input-obs-${item.id}`}
                              type="text"
                              className="w-full bg-white px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                              placeholder="Digite uma observação rápida..."
                              value={currentObs}
                              onChange={(e) => onChange(item.id, currentStatus, e.target.value)}
                            />

                            {/* Fast-clicking presets list for extreme ease in high stressful real car drives */}
                            <div className="space-y-1">
                              <span className="text-[10px] text-slate-400 block font-semibold">Inserção Rápida (1-Toque):</span>
                              <div className="flex flex-wrap gap-1.5">
                                {QUICK_OBSERVATION_PRESETS.general.map((preset) => (
                                  <button
                                    key={preset}
                                    type="button"
                                    className="px-2 py-1 bg-white border border-slate-200 hover:border-slate-350 text-[10.5px] text-slate-600 hover:text-slate-800 rounded-md transition-all cursor-pointer font-medium"
                                    onClick={() => {
                                      onChange(item.id, currentStatus, preset);
                                    }}
                                  >
                                    + {preset}
                                  </button>
                                ))}
                                {/* Empty tag to quickly clear */}
                                {currentObs && (
                                  <button
                                    type="button"
                                    className="px-2 py-1 bg-red-50 border border-red-100 text-[10.5px] text-red-600 rounded-md cursor-pointer font-bold"
                                    onClick={() => onChange(item.id, currentStatus, '')}
                                  >
                                    Limpar Texto
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* COMPARED FOOTER ACTIONS */}
      <div className="flex items-center space-x-3 pt-4">
        {/* BUTTON: BACK */}
        <button
          id="btn-checklist-back"
          type="button"
          className="flex-1 bg-white border border-slate-200 text-slate-700 font-semibold py-3.5 px-4 rounded-xl hover:bg-slate-50 transition-all outline-none text-sm cursor-pointer flex items-center justify-center space-x-2"
          onClick={onBack}
        >
          <span>Voltar</span>
        </button>

        {/* BUTTON: REGISTER RESULTS */}
        <button
          id="btn-checklist-proceed"
          type="button"
          className={`flex-[2] text-white font-semibold py-3.5 px-4 rounded-xl transition-all shadow-md active:scale-[0.98] outline-none text-sm flex items-center justify-center space-x-2 cursor-pointer ${
            evaluatedItems === totalItems
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-slate-700 hover:bg-slate-800'
          }`}
          onClick={onProceed}
        >
          <span>Avançar para Conclusão</span>
          {evaluatedItems < totalItems && (
            <span className="text-[10px] ml-1 bg-yellow-500 text-slate-900 px-1.5 py-0.5 rounded font-bold">
              {totalItems - evaluatedItems} PENDENTES
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
