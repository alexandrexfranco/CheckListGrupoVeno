/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CandidateInfo, ChecklistState, VehicleType } from '../types';
import { calculateEvaluation } from '../utils/evaluationHelper';
import { generateEvaluationPDF } from '../utils/pdfGenerator';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  FileText, 
  RotateCcw, 
  Trophy, 
  ChevronRight, 
  Calendar, 
  Clock, 
  Car,
  User,
  AlertCircle
} from 'lucide-react';

interface EvaluationSummaryProps {
  candidateInfo: CandidateInfo | null;
  vehicleType: VehicleType;
  checklist: ChecklistState;
  onRestart: () => void;
  // This helps bubble up that a report was successfully committed so the list updates
  onSaveSession: (instructorNotes: string) => void;
  onBackToHome?: () => void;
}

export default function EvaluationSummary({
  candidateInfo,
  vehicleType,
  checklist,
  onRestart,
  onSaveSession,
  onBackToHome
}: EvaluationSummaryProps) {
  const [instructorNotes, setInstructorNotes] = useState('');
  const [errorNotes, setErrorNotes] = useState('');
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [savedToHistory, setSavedToHistory] = useState(false);

  if (!candidateInfo) return null;

  const results = calculateEvaluation(checklist);

  const handlePdfGeneration = () => {
    if (!instructorNotes.trim()) {
      setErrorNotes('Requerido: Preencha o parecer ou observações do instrutor antes de emitir o relatório.');
      const textarea = document.getElementById('instructor-notes-textarea');
      if (textarea) {
        textarea.scrollIntoView({ behavior: 'smooth' });
        textarea.focus();
      }
      return;
    }
    
    setErrorNotes('');
    setIsPdfGenerating(true);
    
    // Proactively save to history if not saved yet
    if (!savedToHistory) {
      onSaveSession(instructorNotes);
      setSavedToHistory(true);
    }

    try {
      generateEvaluationPDF(candidateInfo, vehicleType, checklist, instructorNotes);
    } catch (err) {
      console.error(err);
    } finally {
      setIsPdfGenerating(false);
    }
  };

  const handleAutoSave = () => {
    if (!instructorNotes.trim()) {
      setErrorNotes('Requerido: Digite uma observação ou parecer antes de salvar.');
      return;
    }
    setErrorNotes('');
    onSaveSession(instructorNotes);
    setSavedToHistory(true);
  };

  // Status mapping elements
  let statusColor = 'bg-emerald-50 border-emerald-200 text-emerald-800';
  let badgeColor = 'bg-emerald-500 text-white';
  let statusText = '🟢 APTO';
  let statusDesc = 'O candidato atingiu o nível de exigência necessário para a vaga, demonstrando direção segura.';
  let StatusIcon = CheckCircle2;

  if (results.classification === 'APTO_RESSALVAS') {
    statusColor = 'bg-amber-50 border-amber-200 text-amber-800';
    badgeColor = 'bg-amber-500 text-white';
    statusText = '🟡 APTO COM RESSALVAS';
    statusDesc = 'O candidato foi aprovado, mas necessita de pontos de atenção e acompanhamento técnico.';
    StatusIcon = AlertTriangle;
  } else if (results.classification === 'INAPTO') {
    statusColor = 'bg-red-50 border-red-200 text-red-800';
    badgeColor = 'bg-red-500 text-white';
    statusText = '🔴 INAPTO';
    statusDesc = results.hasCriticalFailure 
      ? 'Reprovado automaticamente por cometer uma ou mais falhas críticas durante a avaliação, independentemente do score.'
      : 'O candidato obteve aproveitamento abaixo do mínimo exigido (75%) para aprovação.';
    StatusIcon = XCircle;
  }

  return (
    <div className="space-y-6" id="evaluation-summary-dashboard">
      
      {/* RESULT CARD - MAIN BADGE OUTCOME */}
      <div className={`rounded-3xl border p-6 flex flex-col items-center text-center space-y-4 shadow-xs transition-all ${statusColor}`}>
        <div className={`p-4 rounded-full ${badgeColor} shadow-sm`}>
          <StatusIcon className="w-10 h-10" />
        </div>
        
        <div>
          <span className="text-xxs uppercase tracking-widest font-bold opacity-70 block mb-1">Resultado Final</span>
          <h2 className="text-2xl font-black">{statusText}</h2>
          <p className="text-xs max-w-md mt-2 leading-relaxed opacity-90">{statusDesc}</p>
        </div>

        {/* SCORE DISPLAY BAR */}
        <div className="w-full max-w-xs pt-1">
          <div className="flex items-center justify-between text-xs font-bold mb-1 opacity-80">
            <span>Aproveitamento</span>
            <span>{results.score.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-black/10 h-3 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-550 ${
                results.classification === 'APTO' 
                  ? 'bg-emerald-600' 
                  : results.classification === 'APTO_RESSALVAS' 
                    ? 'bg-amber-600' 
                    : 'bg-red-600'
              }`}
              style={{ width: `${results.score}%` }}
            />
          </div>
          <p className="text-[10px] mt-1 text-center opacity-70">Nota mínima para Apto: 90% | Ressalvas: 75%</p>
        </div>
      </div>

      {/* DETAILED STATS COUNTER GRID */}
      <div className="grid grid-cols-3 gap-3">
        {/* STAT 1: TOTAL */}
        <div className="bg-white rounded-2xl border border-slate-100 p-3 shadow-xxs text-center">
          <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wide">Avaliado</span>
          <span className="text-lg font-black text-slate-800">{results.totalAnswered}</span>
          <span className="text-xxs text-slate-400 block">Itens respondidos</span>
        </div>

        {/* STAT 2: CONFORME */}
        <div className="bg-white rounded-2xl border border-slate-100 p-3 shadow-xxs text-center">
          <span className="text-[10px] text-emerald-600 font-bold block uppercase tracking-wide">Conformes</span>
          <span className="text-lg font-black text-emerald-600">{results.totalConforme}</span>
          <span className="text-xxs text-slate-400 block">Itens aprovados</span>
        </div>

        {/* STAT 3: NÃO CONFORME */}
        <div className="bg-white rounded-2xl border border-slate-100 p-3 shadow-xxs text-center">
          <span className="text-[10px] text-red-600 font-bold block uppercase tracking-wide">Inconformes</span>
          <span className="text-lg font-black text-red-600">{results.totalNaoConforme}</span>
          <span className="text-xxs text-slate-400 block">Itens reprovados</span>
        </div>
      </div>

      {/* CRITICAL FAILURES CALLOUT BOX */}
      {results.hasCriticalFailure && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 space-y-2.5">
          <div className="flex items-center space-x-2 text-red-800 font-bold text-xs uppercase tracking-wider">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span>Infrações Críticas Cometidas</span>
          </div>
          <p className="text-xs text-red-700 leading-normal">
            As seguintes falhas foram marcadas como <b>Não Conforme</b>, anulando o aproveitamento geral e reprovando o candidato por critério de segurança:
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {results.criticalFailuresTriggered.map((infraction, i) => (
              <li key={i} className="flex items-start space-x-1.5 text-xs text-red-900 bg-white/70 px-2.5 py-1.5 rounded-lg border border-red-100 font-medium">
                <span className="text-red-600 font-bold">🚨</span>
                <span>{infraction}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* QUICK RETROSPECT OF CANDIDATE AND VEHICLE */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-xxs space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-1.5">Resumo das Credenciais</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs leading-normal">
          <div>
            <span className="text-slate-400 font-medium block">Instrutor:</span>
            <span className="text-slate-800 font-bold block truncate">{candidateInfo.instructorName || 'Kleber Simão'}</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">Candidato:</span>
            <span className="text-slate-800 font-bold block truncate">{candidateInfo.name}</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">Tipo Veículo:</span>
            <span className="text-slate-800 font-bold block">{vehicleType}</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">CNH pretendida:</span>
            <span className="text-slate-800 font-bold block">Categoria {candidateInfo.cnhCategory}</span>
          </div>
        </div>
      </div>

      {/* PARECER FINAL: REQUIRED TEXTAREA INPUT */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs space-y-3">
        <label htmlFor="instructor-notes-textarea" className="text-sm font-bold text-slate-800 block">
          Observações do Instrutor (Parecer Técnico) *
        </label>
        <span className="text-xxs text-slate-400 block">Descreva sumariamente a conduta, pontos fortes, vícios de condução ou os motivos de desclassificação. Campo obrigatório.</span>
        
        <textarea
          id="instructor-notes-textarea"
          className={`w-full min-h-[120px] p-3 text-sm rounded-xl border focus:outline-none focus:ring-2 transition-all ${
            errorNotes 
              ? 'border-red-300 focus:ring-red-200 focus:border-red-500 bg-red-50/10' 
              : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-500'
          }`}
          placeholder="Ex: O candidato demonstrou excelente controle de embreagem e bom alinhamento em manobras. Teve bom comportamento defensivo em cruzamentos, contudo precisa atentar para observação constante de retrovisores..."
          value={instructorNotes}
          onChange={(e) => {
            setInstructorNotes(e.target.value);
            if (e.target.value.trim()) {
              setErrorNotes('');
            }
          }}
        />
        {errorNotes && <p className="text-xs font-bold text-red-650 text-red-600 bg-red-50 p-2 rounded-lg">{errorNotes}</p>}

        {/* Small quick tags to speed up comments */}
        <div className="space-y-1 pt-1">
          <span className="text-[10px] text-slate-400 block font-semibold">Modelos de Diagnóstico (Toque para Inserir):</span>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              className="px-2 py-1 bg-slate-50 hover:bg-slate-100 text-[10px] text-slate-600 rounded-md cursor-pointer border border-slate-150"
              onClick={() => {
                const sample = `Candidato obteve ótimo controle técnica geral. Movimentações seguras de acordo com a sinalização e respeito integral a vias públicas. Apto para atividades profissionais.`;
                setInstructorNotes(sample);
                setErrorNotes('');
              }}
            >
              Exemplo: Excelente Desempenho (APTO)
            </button>
            <button
              type="button"
              className="px-2 py-1 bg-slate-50 hover:bg-slate-100 text-[10px] text-slate-600 rounded-md cursor-pointer border border-slate-150"
              onClick={() => {
                const sample = `Candidato cumpriu o trajeto com poucas inconformidades. Apresentou leve hesitação nas manobras de retorno e baliza secundária, mas mantém condução defensiva satisfatória. Aprovado com ressalvas.`;
                setInstructorNotes(sample);
                setErrorNotes('');
              }}
            >
              Exemplo: Mediano com Ressalvas
            </button>
            <button
              type="button"
              className="px-2 py-1 bg-slate-50 hover:bg-slate-100 text-[10px] text-slate-600 rounded-md cursor-pointer border border-slate-150"
              onClick={() => {
                const sample = `Candidato reprovado devido ao cometimento de infração grave de segurança (falha crítica flagrada de forma evidente durante o percurso). Inapto para condução de veículos da empresa.`;
                setInstructorNotes(sample);
                setErrorNotes('');
              }}
            >
              Exemplo: Reprovado por Falha Crítica
            </button>
          </div>
        </div>
      </div>

      {/* CORE FINAL ACTION BUTTON PANEL */}
      <div className="space-y-3 pt-2">
        {/* ACTION 1: GENERATE RELATÓRIO PDF */}
        <button
          id="btn-generate-pdf"
          type="button"
          disabled={isPdfGenerating}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-4 px-6 rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer text-base flex items-center justify-center space-x-2"
          onClick={handlePdfGeneration}
        >
          <FileText className="w-5 h-5" />
          <span>{isPdfGenerating ? 'Redigindo Documento PDF...' : 'Gerar Relatório PDF Oficial'}</span>
        </button>

        {/* EXTRA HELP BUTTON: BACKUPS HISTORY SAVE */}
        {!savedToHistory && instructorNotes.trim() && (
          <button
            type="button"
            onClick={handleAutoSave}
            className="w-full bg-blue-50 text-blue-800 hover:bg-blue-100 font-bold py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer block text-center"
          >
            ✓ Salvar Avaliação no Histórico Local
          </button>
        )}

        {savedToHistory && (
          <div className="text-center text-xs text-emerald-700 font-semibold bg-emerald-50 py-2.5 rounded-xl border border-emerald-100">
            ✓ Avaliação sincronizada com o Histórico Local do dispositivo.
          </div>
        )}

        {/* ACTION 2: VOLTAR AO INÍCIO */}
        {onBackToHome && (
          <button
            id="btn-back-to-home"
            type="button"
            className="w-full bg-blue-600 hover:bg-blue-750 hover:bg-blue-700 text-white font-semibold py-3.5 px-6 rounded-xl transition-all cursor-pointer text-sm flex items-center justify-center space-x-2 shadow-md active:scale-[0.98]"
            onClick={onBackToHome}
          >
            <span>Voltar para a Tela Inicial</span>
          </button>
        )}

        {/* ACTION 3: COMPASS RESET NEW ASSESSMENT */}
        <button
          id="btn-new-evaluation"
          type="button"
          className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-3.5 px-6 rounded-xl transition-all cursor-pointer text-sm flex items-center justify-center space-x-2 border border-slate-200"
          onClick={onRestart}
        >
          <RotateCcw className="w-4 h-4" />
          <span>Iniciar Nova Avaliação do Zero</span>
        </button>
      </div>

    </div>
  );
}
