/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EvaluationSession } from '../types';
import { calculateEvaluation } from '../utils/evaluationHelper';
import { generateEvaluationPDF } from '../utils/pdfGenerator';
import { 
  FileText, 
  Trash2, 
  Calendar, 
  Clock, 
  Car, 
  User, 
  GraduationCap, 
  ChevronRight,
  ShieldAlert,
  Download,
  Copy
} from 'lucide-react';

interface HistoryListProps {
  sessions: EvaluationSession[];
  onDeleteSession: (sessionId: string) => void;
  onClearAll: () => void;
  onSelectSession: (session: EvaluationSession) => void;
  onCloneCandidate: (session: EvaluationSession) => void;
}

export default function HistoryList({
  sessions,
  onDeleteSession,
  onClearAll,
  onSelectSession,
  onCloneCandidate
}: HistoryListProps) {

  const handleDownloadPDF = (session: EvaluationSession, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent selecting card
    try {
      generateEvaluationPDF(
        session.candidateInfo,
        session.vehicleType,
        session.checklist,
        session.instructorObservations
      );
    } catch (err) {
      console.error('Falha ao gerar PDF histórico:', err);
    }
  };

  if (sessions.length === 0) {
    return (
      <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-8 text-center text-slate-500 space-y-3" id="history-empty-container">
        <FileText className="w-10 h-10 text-slate-350 mx-auto" />
        <div className="space-y-1">
          <p className="text-sm font-semibold">Sem histórico de avaliações</p>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Avaliações concluídas e salvas serão listadas aqui de forma offline para fácil consulta e re-emissão de PDFs.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4" id="history-list-root">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Avaliações Recentes ({sessions.length})
        </h3>
        <button
          type="button"
          onClick={() => {
            if (window.confirm('Deseja realmente limpar todo o histórico de avaliações do dispositivo?')) {
              onClearAll();
            }
          }}
          className="text-xxs text-red-650 text-red-500 font-bold hover:underline cursor-pointer"
        >
          Limpar Tudo
        </button>
      </div>

      {/* History scroll list */}
      <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
        {sessions.map((session) => {
          const results = calculateEvaluation(session.checklist);
          let badgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-200';
          let statusText = 'APTO';

          if (results.classification === 'APTO_RESSALVAS') {
            badgeColor = 'bg-amber-50 text-amber-800 border-amber-200';
            statusText = 'RESSALVAS';
          } else if (results.classification === 'INAPTO') {
            badgeColor = 'bg-red-50 text-red-800 border-red-200';
            statusText = 'INAPTO';
          }

          return (
            <div
              key={session.id}
              onClick={() => onSelectSession(session)}
              className="group bg-white rounded-xl border border-slate-100 hover:border-blue-150 p-4 shadow-xxs hover:shadow-xs transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 text-left relative"
            >
              {/* Core session metrics */}
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${badgeColor}`}>
                    {statusText}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    Score: {results.score.toFixed(0)}%
                  </span>
                  <span className="text-xxs text-slate-400 flex items-center">
                    <Calendar className="w-3 h-3 mr-0.5" />
                    {new Date(session.dateCreated).toLocaleDateString('pt-BR')}
                  </span>
                </div>

                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                    {session.candidateInfo.name}
                  </h4>
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xxs text-slate-400">
                    <span className="flex items-center">
                      <Car className="w-3 h-3 mr-0.5" /> {session.vehicleType}
                    </span>
                    <span>•</span>
                    <span>CNH: {session.candidateInfo.cnhCategory}</span>
                    <span>•</span>
                    <span className="font-medium text-slate-500">Instrutor: {session.candidateInfo.instructorName || 'Kleber Simão'}</span>
                  </div>
                </div>
              </div>

              {/* Action operations controls */}
              <div className="flex items-center space-x-1 border-t border-slate-50 md:border-0 pt-2.5 md:pt-0 justify-end">
                {/* BUTTON: DOWNLOAD RESUME */}
                <button
                  type="button"
                  onClick={(e) => handleDownloadPDF(session, e)}
                  className="p-1 px-2.5 bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 rounded-lg text-xs font-semibold border border-slate-200 hover:border-emerald-200 transition-all flex items-center space-x-1 cursor-pointer"
                  title="Exportar PDF do histórico"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="text-[10px]">PDF</span>
                </button>

                {/* BUTTON: CLONE FOR RETRIAL */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloneCandidate(session);
                  }}
                  className="p-1 px-2.5 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-700 rounded-lg text-xs font-semibold border border-slate-200 hover:border-blue-200 transition-all flex items-center space-x-1 cursor-pointer"
                  title="Clonar dados (Reteste)"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span className="text-[10px]">Reteste</span>
                </button>

                {/* BUTTON: TRASH REMOVE */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`Deseja apagar o registro de ${session.candidateInfo.name}?`)) {
                      onDeleteSession(session.id);
                    }
                  }}
                  className="p-1 px-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100 transition-all cursor-pointer"
                  title="Excluir do dispositivo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
