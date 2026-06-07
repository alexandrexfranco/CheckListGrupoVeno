/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CandidateInfo, ChecklistState, EvaluationSession, VehicleType } from './types';
import CandidateForm from './components/CandidateForm';
import ChecklistEvaluator from './components/ChecklistEvaluator';
import EvaluationSummary from './components/EvaluationSummary';
import HistoryList from './components/HistoryList';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Car, 
  UserCheck, 
  ListChecks, 
  Award, 
  HelpCircle, 
  BookOpen, 
  Clipboard,
  History,
  Download
} from 'lucide-react';

type Step = 'IDENTIFICACAO' | 'CHECKLIST' | 'SUMMARY';

export default function App() {
  const [step, setStep] = useState<Step>('IDENTIFICACAO');
  const [candidateInfo, setCandidateInfo] = useState<CandidateInfo | null>(null);
  const [vehicleType, setVehicleType] = useState<VehicleType>('Manual');
  const [checklist, setChecklist] = useState<ChecklistState>({});
  const [sessions, setSessions] = useState<EvaluationSession[]>([]);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    window.addEventListener('appinstalled', () => {
      setIsInstallable(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User prompt outcome: ${outcome}`);
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  // Load history from localStorage on startup
  useEffect(() => {
    const storaged = localStorage.getItem('driver_evaluations_sessions');
    if (storaged) {
      try {
        setSessions(JSON.parse(storaged));
      } catch (e) {
        console.error('Falha ao parsear sessões do histórico local:', e);
      }
    }
  }, []);

  const handleCandidateFormComplete = (info: CandidateInfo, vType: VehicleType) => {
    setCandidateInfo(info);
    setVehicleType(vType);
    setStep('CHECKLIST');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleChecklistChange = (itemId: string, status: any, observation: string) => {
    setChecklist(prev => ({
      ...prev,
      [itemId]: { status, observation }
    }));
  };

  const handleBulkConforme = () => {
    // Collect all items in nested categories
    const bulkUpdate = { ...checklist };
    
    // Import categories and load items
    import('./types').then(({ EVALUATION_CATEGORIES }) => {
      const allItems = EVALUATION_CATEGORIES.flatMap(c => c.items);
      allItems.forEach(item => {
        // Only set to conforme if the item is currently unselected or pending
        if (!bulkUpdate[item.id] || bulkUpdate[item.id].status === 'PENDING') {
          bulkUpdate[item.id] = { status: 'CONFORME', observation: '' };
        }
      });
      setChecklist(bulkUpdate);
    });
  };

  const handleProceedToSummary = () => {
    setStep('SUMMARY');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToForm = () => {
    setStep('IDENTIFICACAO');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRestart = () => {
    if (window.confirm('Iniciar nova avaliação? Dados atuais preenchidos serão resetados.')) {
      setCandidateInfo(null);
      setChecklist({});
      setStep('IDENTIFICACAO');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Safe Session committing and localStorage sync
  const handleSaveSession = (instructorNotes: string) => {
    if (!candidateInfo) return;

    const newSession: EvaluationSession = {
      id: Date.now().toString(),
      candidateInfo,
      vehicleType,
      checklist,
      instructorObservations: instructorNotes,
      dateCreated: new Date().toISOString()
    };

    const updated = [newSession, ...sessions];
    setSessions(updated);
    localStorage.setItem('driver_evaluations_sessions', JSON.stringify(updated));
  };

  const handleDeleteSession = (sessionId: string) => {
    const updated = sessions.filter(s => s.id !== sessionId);
    setSessions(updated);
    localStorage.setItem('driver_evaluations_sessions', JSON.stringify(updated));
  };

  const handleClearAllHistory = () => {
    setSessions([]);
    localStorage.removeItem('driver_evaluations_sessions');
  };

  const handleSelectSession = (session: EvaluationSession) => {
    setCandidateInfo(session.candidateInfo);
    setVehicleType(session.vehicleType);
    setChecklist(session.checklist);
    setStep('SUMMARY');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCloneCandidate = (session: EvaluationSession) => {
    // Keep credentials but initiate fresh date/hours and clear checklist results
    const today = new Date();
    const tzOffset = today.getTimezoneOffset() * 60000;
    const localISO = (new Date(Date.now() - tzOffset)).toISOString().slice(0, 10);

    setCandidateInfo({
      ...session.candidateInfo,
      date: localISO,
      startTime: today.toTimeString().slice(0, 5),
      endTime: ''
    });
    setVehicleType(session.vehicleType);
    setChecklist({});
    setStep('IDENTIFICACAO');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 font-sans selection:bg-blue-100" id="driver-app-container">
      
      {/* CORPORATE NAV BAR */}
      <header className="bg-slate-900 text-white shadow-md border-b border-slate-800 sticky top-0 z-40" id="app-nav-header">
        <div className="max-w-4xl mx-auto px-4 py-3 pb-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-1 bg-white rounded-xl shadow-inner flex items-center justify-center w-9 h-9">
              <img src="/icon.png" alt="Logo Grupo Veno" className="w-7 h-7 object-contain" />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-tight leading-none uppercase">Grupo Veno</h1>
              <span className="text-[10px] text-slate-400 font-bold block mt-0.5 tracking-wider">AVALIAÇÃO PRÁTICA DE MOTORISTAS</span>
            </div>
          </div>
          {isInstallable && (
            <button 
              onClick={handleInstallApp}
              className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black px-3.5 py-1.5 rounded-xl shadow-md transition-all border border-emerald-500/20 cursor-pointer active:scale-95 duration-150"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Instalar App</span>
            </button>
          )}
        </div>
      </header>

      {/* CORE WRAPPER SCENE */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        
        {/* PROGRESS STEPPER HEADER */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-xxs" id="flow-stepper">
          <div className="flex items-center justify-between max-w-lg mx-auto relative">
            
            {/* Step 1: Identificação */}
            <div className="flex flex-col items-center space-y-1.5 z-10">
              <div className={`p-2 rounded-full border transition-all ${
                step === 'IDENTIFICACAO' 
                  ? 'bg-blue-600 border-blue-600 text-white scale-110 shadow-sm' 
                  : 'bg-slate-100 border-slate-200 text-slate-500'
              }`}>
                <UserCheck className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">1. Identificação</span>
            </div>

            {/* Link line 1-2 */}
            <div className={`flex-1 h-0.5 mx-2 -mt-4 transition-colors ${
              step !== 'IDENTIFICACAO' ? 'bg-blue-600' : 'bg-slate-200'
            }`} />

            {/* Step 2: Checklist */}
            <div className="flex flex-col items-center space-y-1.5 z-10">
              <div className={`p-2 rounded-full border transition-all ${
                step === 'CHECKLIST' 
                  ? 'bg-blue-600 border-blue-600 text-white scale-110 shadow-sm' 
                  : step === 'SUMMARY'
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : 'bg-slate-100 border-slate-200 text-slate-500'
              }`}>
                <ListChecks className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">2. Checklist</span>
            </div>

            {/* Link line 2-3 */}
            <div className={`flex-1 h-0.5 mx-2 -mt-4 transition-colors ${
              step === 'SUMMARY' ? 'bg-blue-600' : 'bg-slate-200'
            }`} />

            {/* Step 3: Conclusão */}
            <div className="flex flex-col items-center space-y-1.5 z-10">
              <div className={`p-2 rounded-full border transition-all ${
                step === 'SUMMARY' 
                  ? 'bg-blue-600 border-blue-600 text-white scale-110 shadow-sm' 
                  : 'bg-slate-100 border-slate-200 text-slate-500'
              }`}>
                <Award className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">3. Resultado</span>
            </div>

          </div>
        </div>

        {/* WIZARD SCREENS ROUTING INTERACTIVE SLIDES */}
        <AnimatePresence mode="wait">
          {step === 'IDENTIFICACAO' && (
            <motion.div
              key="identificacao-pane"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {/* Main candidate credentials card */}
              <div className="md:col-span-2 space-y-4">
                <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-5 rounded-3xl shadow-sm space-y-1">
                  <h2 className="text-lg font-black tracking-tight uppercase">Novo Teste Prático</h2>
                  <p className="text-xs text-blue-150 leading-relaxed">
                    Preencha os dados do condutor e selecione a categoria veicular para iniciar a captura de pontos de conformidade e falhas críticas.
                  </p>
                </div>

                <CandidateForm 
                  onComplete={handleCandidateFormComplete}
                  initialInfo={candidateInfo || undefined}
                  initialVehicleType={vehicleType}
                />
              </div>

              {/* Sidebar: Offline device evaluations history logs */}
              <div className="md:col-span-1 space-y-4">
                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs space-y-3">
                  <div className="flex items-center space-x-2 border-b border-slate-50 pb-2.5">
                    <History className="w-5 h-5 text-slate-500" />
                    <div>
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Histórico Local</h3>
                      <p className="text-[10px] text-slate-400 leading-none">Dados salvos no seu navegador</p>
                    </div>
                  </div>

                  <HistoryList 
                    sessions={sessions}
                    onDeleteSession={handleDeleteSession}
                    onClearAll={handleClearAllHistory}
                    onSelectSession={handleSelectSession}
                    onCloneCandidate={handleCloneCandidate}
                  />
                </div>

                {/* HELPFUL SYSTEM ACCENT CARD (Anti-ai-slop, clean and informative) */}
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-xs leading-relaxed text-blue-800">
                  <p className="font-bold flex items-center mb-1">
                    <span className="mr-1.5">💡</span> Dica do Avaliador
                  </p>
                  <p className="text-[11px] text-blue-750">
                    O aplicativo foi desenhado para operação em campo de alta velocidade. Durante o teste, você pode marcar tudo como "Conforme" em 1 toque e registrar apenas as infrações que de fato acontecerem.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'CHECKLIST' && (
            <motion.div
              key="checklist-pane"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-4"
            >
              <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xxs">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">TESTE ATIVO</span>
                    <h2 className="text-base font-black text-slate-800 tracking-tight flex items-center truncate">
                      Candidato: <span className="text-blue-600 ml-1 truncate">{candidateInfo?.name}</span>
                    </h2>
                  </div>
                  <div className="bg-indigo-50 border border-indigo-100 text-indigo-800 rounded-lg px-2.5 py-1 text-xs font-semibold leading-none">
                    Veículo: {vehicleType}
                  </div>
                </div>
              </div>

              <ChecklistEvaluator 
                vehicleType={vehicleType}
                checklist={checklist}
                onChange={handleChecklistChange}
                onBulkConforme={handleBulkConforme}
                onProceed={handleProceedToSummary}
                onBack={handleBackToForm}
              />
            </motion.div>
          )}

          {step === 'SUMMARY' && (
            <motion.div
              key="summary-pane"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
            >
              <EvaluationSummary 
                candidateInfo={candidateInfo!}
                vehicleType={vehicleType}
                checklist={checklist}
                onRestart={handleRestart}
                onSaveSession={handleSaveSession}
              />
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* REASSURING CORPORATE SMALL FOOTER */}
      <footer className="bg-slate-900 border-t border-slate-850 py-6 text-center text-slate-500 text-xxs mt-12 space-y-1">
        <p>© 2026 Grupo Veno. Todos os direitos reservados.</p>
        <p className="text-[9px] text-slate-600 uppercase tracking-widest font-black">Desenvolvido por: Alexandre de Oliveira Franco</p>
      </footer>

    </div>
  );
}
