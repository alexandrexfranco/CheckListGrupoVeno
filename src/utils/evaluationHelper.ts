/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChecklistState, EVALUATION_CATEGORIES, EvaluationStatus } from '../types';

export interface EvaluationResults {
  totalItems: number;
  totalAnswered: number;
  totalConforme: number;
  totalNaoConforme: number;
  totalPending: number;
  score: number; // percentage (0 to 100)
  hasCriticalFailure: boolean;
  criticalFailuresTriggered: string[]; // List of names of triggered critical failures
  classification: 'APTO' | 'APTO_RESSALVAS' | 'INAPTO';
}

export function calculateEvaluation(checklist: ChecklistState): EvaluationResults {
  const allItems = EVALUATION_CATEGORIES.flatMap(c => c.items);
  const totalItems = allItems.length;

  let totalConforme = 0;
  let totalNaoConforme = 0;
  let totalPending = 0;
  let hasCriticalFailure = false;
  const criticalFailuresTriggered: string[] = [];

  allItems.forEach(item => {
    const state = checklist[item.id];
    const status = state ? state.status : 'PENDING';

    if (status === 'CONFORME') {
      totalConforme++;
    } else if (status === 'NAO_CONFORME') {
      totalNaoConforme++;
      if (item.isCritical) {
        hasCriticalFailure = true;
        criticalFailuresTriggered.push(item.criticalName || item.name);
      }
    } else {
      totalPending++;
    }
  });

  const totalAnswered = totalConforme + totalNaoConforme;
  
  // Scoring formula: (Total Conforme ÷ Total Answered) * 100.
  // If no items have been marked yet, default score is 0.
  const score = totalAnswered > 0 ? (totalConforme / totalAnswered) * 100 : 0;

  // Determine classification based on instructions:
  // - APTO: Aproveitamento >= 90% and NO critical failure
  // - APTO COM RESSALVAS: Aproveitamento between 75% and 89% and NO critical failure
  // - INAPTO: Aproveitamento < 75% OR any critical failure
  let classification: 'APTO' | 'APTO_RESSALVAS' | 'INAPTO' = 'INAPTO';

  if (hasCriticalFailure) {
    classification = 'INAPTO';
  } else if (score >= 90) {
    classification = 'APTO';
  } else if (score >= 75) {
    classification = 'APTO_RESSALVAS';
  } else {
    classification = 'INAPTO';
  }

  return {
    totalItems,
    totalAnswered,
    totalConforme,
    totalNaoConforme,
    totalPending,
    score,
    hasCriticalFailure,
    criticalFailuresTriggered,
    classification
  };
}

export function formatCPF(value: string): string {
  const raw = value.replace(/\D/g, '');
  if (raw.length <= 3) return raw;
  if (raw.length <= 6) return `${raw.slice(0, 3)}.${raw.slice(3)}`;
  if (raw.length <= 9) return `${raw.slice(0, 3)}.${raw.slice(3, 6)}.${raw.slice(6)}`;
  return `${raw.slice(0, 3)}.${raw.slice(3, 6)}.${raw.slice(6, 9)}-${raw.slice(9, 11)}`;
}
