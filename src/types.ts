/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type VehicleType = 'Elétrico' | 'Manual' | 'Automático';

export type EvaluationStatus = 'PENDING' | 'CONFORME' | 'NAO_CONFORME';

export interface EvaluationItem {
  id: string;
  name: string;
  isCritical?: boolean;
  criticalName?: string; // Human name of critical infraction
}

export interface Category {
  id: string;
  title: string;
  items: EvaluationItem[];
}

export interface CandidateInfo {
  name: string;
  cpf?: string;
  cnhCategory: string;
  date: string;
  startTime: string;
  endTime: string;
  instructorName?: string;
}

export interface ChecklistState {
  [itemId: string]: {
    status: EvaluationStatus;
    observation: string;
  };
}

export interface EvaluationSession {
  id: string;
  candidateInfo: CandidateInfo;
  vehicleType: VehicleType;
  checklist: ChecklistState;
  instructorObservations: string;
  dateCreated: string;
}

export const EVALUATION_CATEGORIES: Category[] = [
  {
    id: 'preparacao_inicial',
    title: 'Preparação Inicial',
    items: [
      { id: 'prep_banco', name: 'Ajusta banco corretamente' },
      { id: 'prep_retrovisores', name: 'Ajusta retrovisores' },
      { id: 'prep_cinto', name: 'Utiliza cinto de segurança', isCritical: true, criticalName: 'Não utiliza cinto' },
      { id: 'prep_painel', name: 'Verifica painel antes de sair' },
      { id: 'prep_liga', name: 'Liga o veículo corretamente' },
      { id: 'prep_comandos', name: 'Conhece comandos básicos' }
    ]
  },
  {
    id: 'partida_veiculo',
    title: 'Partida do Veículo',
    items: [
      { id: 'part_seta', name: 'Aciona seta antes de sair' },
      { id: 'part_ponto_cego', name: 'Observa ponto cego' },
      { id: 'part_freio', name: 'Solta freio corretamente' },
      { id: 'part_seguranca', name: 'Inicia movimentação com segurança' }
    ]
  },
  {
    id: 'dominio_veiculo',
    title: 'Domínio do Veículo',
    items: [
      { id: 'dom_pedais', name: 'Uso correto dos pedais' },
      { id: 'dom_embreagem', name: 'Controle da embreagem (se manual)' },
      { id: 'dom_marchas', name: 'Troca de marchas' },
      { id: 'dom_freio_uso', name: 'Uso adequado do freio' },
      { id: 'dom_acelerador', name: 'Uso adequado do acelerador' },
      { id: 'dom_re', name: 'Realiza marcha ré corretamente' },
      { id: 'dom_estacionamento', name: 'Estaciona corretamente' }
    ]
  },
  {
    id: 'direcao_defensiva',
    title: 'Direção Defensiva',
    items: [
      { id: 'def_distancia', name: 'Mantém distância segura' },
      { id: 'def_retrovisores_freq', name: 'Observa retrovisores frequentemente' },
      { id: 'def_antecipacao', name: 'Antecipação de riscos' },
      { id: 'def_atencao', name: 'Demonstra atenção constante' },
      { id: 'def_reacao_risco', name: 'Reage adequadamente a situações de risco' },
      { id: 'def_direcao_def', name: 'Evita direção perigosa', isCritical: true, criticalName: 'Direção perigosa' },
      { id: 'def_terceiros_risco', name: 'Não coloca terceiros em risco', isCritical: true, criticalName: 'Coloca terceiros em risco' }
    ]
  },
  {
    id: 'sinalizacao',
    title: 'Sinalização',
    items: [
      { id: 'sin_setas_uso', name: 'Utiliza setas corretamente' },
      { id: 'sin_vertical', name: 'Respeita sinalização vertical (placas)' },
      { id: 'sin_horizontal', name: 'Respeita sinalização horizontal (faixas)' },
      { id: 'sin_semaforos', name: 'Respeita semáforos', isCritical: true, criticalName: 'Desrespeita semáforo' },
      { id: 'sin_preferenciais', name: 'Respeita preferenciais', isCritical: true, criticalName: 'Não respeita preferencial' }
    ]
  },
  {
    id: 'cruzamentos_conversoes',
    title: 'Cruzamentos e Conversões',
    items: [
      { id: 'cruz_velocidade', name: 'Reduz velocidade adequadamente' },
      { id: 'cruz_lados_via', name: 'Observa ambos os lados da via' },
      { id: 'cruz_conversoes_ok', name: 'Realiza conversões corretamente' },
      { id: 'cruz_posicao_faixa', name: 'Posiciona-se corretamente na faixa' }
    ]
  },
  {
    id: 'controle_conducao',
    title: 'Controle e Condução',
    items: [
      { id: 'cond_vel_compativel', name: 'Mantém velocidade compatível' },
      { id: 'cond_trajetoria_segura', name: 'Mantém trajetória segura' },
      { id: 'cond_frenagens_suaves', name: 'Realiza frenagens suaves' },
      { id: 'cond_controle', name: 'Demonstra controle do veículo' }
    ]
  },
  {
    id: 'manobras',
    title: 'Manobras',
    items: [
      { id: 'man_baliza', name: 'Baliza' },
      { id: 'man_estacionamento_vaga', name: 'Estacionamento' },
      { id: 'man_saida_vaga', name: 'Saída de vaga' },
      { id: 'man_retorno', name: 'Retorno' },
      { id: 'man_conversao', name: 'Conversão em esquina' }
    ]
  },
  {
    id: 'comportamento',
    title: 'Comportamento',
    items: [
      { id: 'comp_concentracao', name: 'Concentração durante o trajeto' },
      { id: 'comp_atencao_seg', name: 'Atenção à segurança' },
      { id: 'comp_orientacoes', name: 'Cumprimento das orientações' },
      { id: 'comp_postura', name: 'Postura profissional' }
    ]
  }
];
