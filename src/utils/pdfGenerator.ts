/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { jsPDF } from 'jspdf';
import { CandidateInfo, ChecklistState, VehicleType } from '../types';
import { calculateEvaluation } from './evaluationHelper';

export function generateEvaluationPDF(
  candidateInfo: CandidateInfo,
  vehicleType: VehicleType,
  checklist: ChecklistState,
  instructorObservations: string
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const results = calculateEvaluation(checklist);

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  let y = 15;

  // Helper inside to print a header on new pages
  const addHeader = (pageNum: number) => {
    // Top border accent bar - dark gray for grayscale print friendliness
    doc.setFillColor(40, 40, 40); 
    doc.rect(0, 0, pageWidth, 5, 'F');

    // Small running header
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    doc.text('GRUPO VENO - SISTEMA DE AVALIAÇÃO PRÁTICA DE MOTORISTAS', 15, 10);
    doc.text(`Página ${pageNum}`, pageWidth - 25, 10);
    doc.setDrawColor(200, 200, 200);
    doc.line(15, 12, pageWidth - 15, 12);
  };

  // Page 1 header
  addHeader(1);
  y = 22;

  // Header Title
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0); // Pure Black for maximum contrast
  doc.text('Ficha de Avaliação Prática de Direção', 15, y);
  
  y += 5;
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60); // Dark Gray
  doc.text('Relatório Oficial de Desempenho e Capacidades do Candidato', 15, y);

  y += 10;

  // Candidate info box panel - light clean gray panel with high contrast borders
  doc.setFillColor(250, 250, 250); 
  doc.setDrawColor(180, 180, 180); 
  doc.roundedRect(15, y, pageWidth - 30, 48, 2, 2, 'FD');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0); 
  doc.text('DADOS DO CANDIDATO E DO TESTE', 20, y + 7);

  doc.setDrawColor(180, 180, 180);
  doc.line(18, y + 10, pageWidth - 18, y + 10);

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(70, 70, 70); 

  // Line 1
  doc.text('Nome:', 20, y + 16);
  doc.text('CNH Pretendida:', 130, y + 16);

  // Values Part 1
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.text(candidateInfo.name || '-', 33, y + 16);
  doc.text(candidateInfo.cnhCategory || '-', 160, y + 16);

  // Line 2 titles
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(70, 70, 70);
  doc.setFontSize(9);
  doc.text('Veículo:', 20, y + 25);
  doc.text('Data do Teste:', 75, y + 25);
  doc.text('Fuso / Horário:', 130, y + 25);

  // Values Part 2
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.text(vehicleType, 35, y + 25);
  doc.text(candidateInfo.date ? new Date(candidateInfo.date).toLocaleDateString('pt-BR') : '-', 100, y + 25);
  doc.text(`${candidateInfo.startTime || '--:--'} às ${candidateInfo.endTime || '--:--'}`, 157, y + 25);

  // Line 3 titles
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(70, 70, 70);
  doc.setFontSize(9);
  doc.text('Instrutor Avaliador:', 20, y + 34);

  // Values Part 3
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.text(candidateInfo.instructorName || 'Kleber Simão', 53, y + 34);

  y += 54;

  // Results box status panel
  doc.setFillColor(242, 242, 242); // very light gray for background
  doc.setDrawColor(180, 180, 180);
  doc.roundedRect(15, y, pageWidth - 30, 32, 2, 2, 'FD');

  // Draw Result Badge
  // In Black and White: we use solid black, solid dark gray, or thick bordered box with high contrast
  let badgeFillColor = { r: 0, g: 0, b: 0 }; // Default solid black
  let textLabel = 'APTO';
  let isApto = true;

  if (results.classification === 'APTO_RESSALVAS') {
    badgeFillColor = { r: 100, g: 100, b: 100 }; // Dark gray for secondary
    textLabel = 'APTO COM RESSALVAS';
    isApto = true;
  } else if (results.classification === 'INAPTO') {
    badgeFillColor = { r: 0, g: 0, b: 0 }; // Black background for emphasis
    textLabel = 'INAPTO';
    isApto = false;
  }

  // Draw grayscale status label
  doc.setFillColor(badgeFillColor.r, badgeFillColor.g, badgeFillColor.b);
  doc.roundedRect(20, y + 7, 75, 18, 1, 1, 'F');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255); // White text inside badge
  doc.text(textLabel, 24, y + 18, { maxWidth: 67 });

  // Grid Stats in Results panel
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(8);
  doc.text('APROVEITAMENTO', 105, y + 10);
  doc.text('REQUISITOS CONFORMES', 145, y + 10);
  doc.text('NÃO CONFORMIDADES', 145, y + 21);

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0); // Pure solid black for numerical score percentage
  doc.text(`${results.score.toFixed(1)}%`, 105, y + 22);

  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text(`${results.totalConforme} / ${results.totalAnswered} itens`, 145, y + 15);

  // Bold or plain black text for non-conformities depending on amount
  doc.setFont('Helvetica', results.totalNaoConforme > 0 ? 'bold' : 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text(`${results.totalNaoConforme} item(ns)`, 145, y + 26);

  y += 38;

  // Let's print Critical Failures list if they exist - styled purely with clear gray & strong double lines
  if (results.hasCriticalFailure) {
    doc.setFillColor(245, 245, 245); 
    doc.setDrawColor(0, 0, 0); // Solid black high-visibility border
    doc.roundedRect(15, y, pageWidth - 30, 20, 1.5, 1.5, 'FD');

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0); // Pure black
    doc.text('ATENÇÃO: FALHAS CRÍTICAS IDENTIFICADAS [!] INAPTO', 20, y + 6);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(40, 40, 40);
    const criticalListString = results.criticalFailuresTriggered.join(', ');
    doc.text(`O teste de direção resultou em Inaptidão imediata devido à(s) seguinte(s) infração(ões) crítica(s):`, 20, y + 11);
    doc.setFont('Helvetica', 'bold');
    doc.text(doc.splitTextToSize(criticalListString, pageWidth - 45), 20, y + 15);
    
    y += 25;
  }

  // Instructor Observations
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text('PARECER E OBSERVAÇÕES DO INSTRUTOR', 15, y + 5);
  y += 7;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(100, 100, 100); // Stronger gray border
  doc.roundedRect(15, y, pageWidth - 30, 24, 1, 1, 'D');

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0); // Pure black for observation text
  const obsLines = doc.splitTextToSize(instructorObservations || 'Nenhuma observação adicional registrada.', pageWidth - 36);
  doc.text(obsLines, 18, y + 5);

  y += 28;

  // Draw signature fields on Page 1 bottom
  doc.setDrawColor(180, 180, 180);
  // Line Instructor
  doc.line(20, y + 12, 95, y + 12);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.text('Assinatura do Instrutor Avaliador', 20, y + 17);

  // Line Candidate
  doc.setDrawColor(180, 180, 180);
  doc.line(115, y + 12, 190, y + 12);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.text(candidateInfo.name || 'Assinatura do Candidato', 115, y + 17);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  doc.text('Candidato Avaliado', 115, y + 21);

  // Date footer
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  doc.text(`Data de Emissão: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR').slice(0, 5)}`, 15, y + 29);

  // Trigger browser download
  const formattedCandidateName = (candidateInfo.name || 'Candidato').replace(/\s+/g, '_').toLowerCase();
  doc.save(`avaliacao_${formattedCandidateName}_${new Date().toISOString().slice(0, 10)}.pdf`);
}
