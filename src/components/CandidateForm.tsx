/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { CandidateInfo, VehicleType } from '../types';
import { User, Award, Calendar, Clock, Inbox, Zap, Settings, ShieldCheck } from 'lucide-react';

interface CandidateFormProps {
  onComplete: (info: CandidateInfo, vehicleType: VehicleType) => void;
  initialInfo?: CandidateInfo;
  initialVehicleType?: VehicleType;
}

export default function CandidateForm({ onComplete, initialInfo, initialVehicleType }: CandidateFormProps) {
  const [name, setName] = useState(initialInfo?.name || '');
  const [cnhCategory, setCnhCategory] = useState(initialInfo?.cnhCategory || 'B');
  
  // Set default date to today, defaulted to local timezone ISO date string
  const [date, setDate] = useState(() => {
    if (initialInfo?.date) return initialInfo.date;
    const today = new Date();
    const tzOffset = today.getTimezoneOffset() * 60000; // offset in milliseconds
    const localISOTime = (new Date(Date.now() - tzOffset)).toISOString().slice(0, 10);
    return localISOTime;
  });

  // Set default hours
  const [startTime, setStartTime] = useState(() => {
    if (initialInfo?.startTime) return initialInfo.startTime;
    const now = new Date();
    return now.toTimeString().slice(0, 5); // "HH:MM"
  });

  const [endTime, setEndTime] = useState(() => {
    if (initialInfo?.endTime) return initialInfo.endTime;
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30); // default test duration: 30 mins
    return now.toTimeString().slice(0, 5); // "HH:MM"
  });

  const [vehicleType, setVehicleType] = useState<VehicleType>(initialVehicleType || 'Manual');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!name.trim()) newErrors.name = 'Nome completo é obrigatório';
    if (!cnhCategory) newErrors.cnhCategory = 'Categoria CNH é obrigatória';
    if (!date) newErrors.date = 'Data do teste é obrigatória';
    if (!startTime) newErrors.startTime = 'Hora de início é obrigatória';
    if (!endTime) newErrors.endTime = 'Hora de término é obrigatória';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onComplete(
        {
          name: name.trim(),
          cnhCategory,
          date,
          startTime,
          endTime,
          instructorName: 'Kleber Simão',
        },
        vehicleType
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" id="candidate-form-sub">
      {/* SECTION 1: CANDIDATE INFORMATION */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs space-y-4">
        <div className="flex items-center space-x-2 pb-2 border-b border-slate-50">
          <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
            <User className="w-5 h-5" />
          </div>
          <h2 className="text-base font-semibold text-slate-800">Identificação do Candidato</h2>
        </div>

        {/* Nome do Instrutor (Locked) */}
        <div className="space-y-1">
          <label htmlFor="input-instructor-name" className="text-xs font-semibold text-slate-500 block">
            Nome do Instrutor Avaliador
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
            </span>
            <input
              id="input-instructor-name"
              type="text"
              readOnly
              disabled
              className="w-full pl-9 pr-3 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 text-slate-700 font-semibold cursor-not-allowed outline-none select-none"
              value="Kleber Simão"
            />
          </div>
        </div>

        {/* Candidate Name Input */}
        <div className="space-y-1">
          <label htmlFor="input-candidate-name" className="text-xs font-medium text-slate-500 block">
            Nome Completo do Candidato *
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <User className="w-4 h-4" />
            </span>
            <input
              id="input-candidate-name"
              type="text"
              className={`w-full pl-9 pr-3 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all ${
                errors.name 
                  ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                  : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-500'
              }`}
              placeholder="Digite o nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
        </div>

        {/* CNH Select */}
        <div className="space-y-1">
          <label htmlFor="select-candidate-cnh" className="text-xs font-medium text-slate-500 block">
            Categoria Pretendida (CNH) *
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
              <Award className="w-4 h-4" />
            </span>
            <select
              id="select-candidate-cnh"
              className="w-full pl-9 pr-8 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white transition-all appearance-none"
              value={cnhCategory}
              onChange={(e) => setCnhCategory(e.target.value)}
            >
              <option value="A">Categoria A (Moto)</option>
              <option value="B">Categoria B (Carro)</option>
              <option value="C">Categoria C (Carga)</option>
              <option value="D">Categoria D (Ônibus/Microônibus)</option>
              <option value="E">Categoria E (Articulado/Carreta)</option>
            </select>
            <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 pointer-events-none">
              ▼
            </span>
          </div>
        </div>

        {/* Date and Time Fields Grid (highly polished) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label htmlFor="input-candidate-date" className="text-xs font-medium text-slate-500 block">
              Data do Teste *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                <Calendar className="w-4 h-4" />
              </span>
              <input
                id="input-candidate-date"
                type="date"
                className="w-full pl-9 pr-3 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="input-candidate-start" className="text-xs font-medium text-slate-500 block">
              Hora de Início *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                <Clock className="w-4 h-4" />
              </span>
              <input
                id="input-candidate-start"
                type="time"
                className="w-full pl-9 pr-3 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="input-candidate-end" className="text-xs font-medium text-slate-500 block">
              Hora de Término *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                <Clock className="w-4 h-4" />
              </span>
              <input
                id="input-candidate-end"
                type="time"
                className="w-full pl-9 pr-3 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: VEHICLE SELECTION (Etapa 2) */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs space-y-4">
        <div className="flex items-center space-x-2 pb-2 border-b border-slate-50">
          <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
            <Settings className="w-5 h-5" />
          </div>
          <h2 className="text-base font-semibold text-slate-800">Tipo de Veículo do Teste</h2>
        </div>

        <p className="text-xs text-slate-400">
          Selecione obrigatoriamente a motorização do veículo para fins de registro e critérios específicos de embreagem.
        </p>

        {/* Large touch targets layout, perfect on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Option 1: MANUAL */}
          <button
            id="vehicle-select-manual"
            type="button"
            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all cursor-pointer text-center outline-none ${
              vehicleType === 'Manual'
                ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 group shadow-sm'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
            }`}
            onClick={() => setVehicleType('Manual')}
          >
            <div className={`p-2.5 rounded-full mb-2 ${
              vehicleType === 'Manual' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              {/* Manual Icon - gearshift stick representation */}
              <Settings className="w-6 h-6" />
            </div>
            <span className="text-sm font-semibold block">Manual</span>
            <span className="text-xxs text-slate-400 mt-1">Troca embreagem manual</span>
          </button>

          {/* Option 2: AUTOMÁTICO */}
          <button
            id="vehicle-select-auto"
            type="button"
            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all cursor-pointer text-center outline-none ${
              vehicleType === 'Automático'
                ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 group shadow-sm'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
            }`}
            onClick={() => setVehicleType('Automático')}
          >
            <div className={`p-2.5 rounded-full mb-2 ${
              vehicleType === 'Automático' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="text-sm font-semibold block">Automático</span>
            <span className="text-xxs text-slate-400 mt-1">Transmissão automática</span>
          </button>

          {/* Option 3: ELÉTRICO */}
          <button
            id="vehicle-select-electric"
            type="button"
            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all cursor-pointer text-center outline-none ${
              vehicleType === 'Elétrico'
                ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 group shadow-sm'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
            }`}
            onClick={() => setVehicleType('Elétrico')}
          >
            <div className={`p-2.5 rounded-full mb-2 ${
              vehicleType === 'Elétrico' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              <Zap className="w-6 h-6" />
            </div>
            <span className="text-sm font-semibold block">Elétrico</span>
            <span className="text-xxs text-slate-400 mt-1">Carros híbridos ou elétricos</span>
          </button>
        </div>
      </div>

      {/* FOOTER ACTION BUTTON - BIG & AUDIBLE TOUCH TARGET */}
      <div className="pt-2">
        <button
          id="btn-start-evaluation"
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-all shadow-md active:scale-[0.98] outline-none text-base cursor-pointer flex items-center justify-center space-x-2"
        >
          <span>Iniciar Checklist & Avaliação</span>
        </button>
      </div>
    </form>
  );
}
