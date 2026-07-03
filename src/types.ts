export type UserRole =
  | 'JP'
  | 'RESP_GESTION'
  | 'RESP_ARQUITECTO_SEG'
  | 'GERENTE_APROBADORA'
  | 'RESP_PRESUPUESTO_EY'
  | 'RESP_EVAL_TECNICA_EY'
  | 'ADMIN'
  | 'RESP_EVAL_DOC_EY'
  | 'RESP_CIBER_HALLAZGOS';

export type DacState =
  | 'BORRADOR'
  | 'SOLICITADO'
  | 'EN MODIFICACIÓN'
  | 'RECHAZADO'
  | 'EN LLENADO'
  | 'EN REVISIÓN ARQUITECTURA'
  | 'EN KICK-OFF'
  | 'EN PRESUPUESTO'
  | 'PRESUPUESTO APROBADO'
  | 'PRESUPUESTO RECHAZADO'
  | 'EN EJECUCIÓN TÉCNICA'
  | 'INFORME ENTREGADO'
  | 'BRECHAS IDENTIFICADAS'
  | 'EN CORRECCIÓN'
  | 'SOLICITUD RETEST'
  | 'EN RETEST'
  | 'RETEST APROBADO'
  | 'RESULTADO EMITIDO'
  | 'EN EVALUACIÓN DOCUMENTAL'
  | 'RESULTADO POR PROVEEDOR GENERADO'
  | 'RESULTADO LICITACIÓN APROBADO';

export type FindingState =
  | 'NUEVO'
  | 'EN CORRECCIÓN'
  | 'EN REVISIÓN CORRECCIÓN'
  | 'CORREGIDO'
  | 'ACEPTACIÓN DE RIESGO'
  | 'NO APLICA';

export type Criticidad = 'CRÍTICA' | 'ALTA' | 'MEDIA' | 'BAJA';

export type DacType = 'Implementación' | 'Licitación' | 'Renovación' | 'Actualización';

export type SelloType = 'Verde' | 'Amarillo' | 'Rojo' | 'Pendiente';

export interface Comment {
  id: string;
  author: string;
  role: string;
  text: string;
  date: string;
}

export interface Log {
  id: string;
  date: string;
  text: string;
  user: string;
}

export interface Evidence {
  id: string;
  name: string;
  url: string;
  uploadDate: string;
  state: 'Aprobado' | 'Rechazado' | 'En revisión';
  comment?: string;
}

export interface Finding {
  id: string;
  dacId: string;
  title: string;
  description: string;
  state: FindingState;
  criticidad: Criticidad;
  origin: string;
  assignedTo: string;
  email: string;
  limitDate: string;
  recommendation: string;
  mitigationPlan?: string;
  responsibleInternal?: string;
  responsibleEmail?: string;
  proposedDate?: string;
  evidences: Evidence[];
  comments: Comment[];
  logs: Log[];
}

export interface SupplierEvaluation {
  id: string;
  name: string;
  rut: string;
  contact: string;
  marco: string;
  date: string;
  score: number;
  seal: SelloType;
  evidences: string[];
  comments?: string;
}

export interface DacRequest {
  id: string;
  projectName: string;
  jpName: string;
  jpEmail: string;
  jpPhone: string;
  jpRut: string;
  jpCargo: string;
  companyName: string;
  companyRut: string;
  companyAddress: string;
  companyWebsite: string;
  companySize: string;
  description: string;
  type: DacType;
  scope: string[];
  criticidad: 'Crítico' | 'Alto' | 'Medio' | 'Bajo';
  startDate: string;
  durationMonths: number;
  budgetEstimate: number;
  justification: string;
  state: DacState;
  score?: number;
  seal?: SelloType;
  dacForm?: any; // Form state
  docHistory?: { id: string; name: string; date: string; state: string; action: string }[];
  suppliers?: SupplierEvaluation[];
}
