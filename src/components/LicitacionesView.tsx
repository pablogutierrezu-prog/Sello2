import React, { useState, useMemo, useEffect } from 'react';
import { DacRequest, SupplierEvaluation, SelloType, UserRole, DacState } from '../types';
import {
  Gavel,
  ShieldCheck,
  Database,
  Calculator,
  ChevronRight,
  TrendingUp,
  FileSpreadsheet,
  Download,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  ExternalLink,
  ChevronDown,
  Paperclip,
  Send,
  HelpCircle,
  FileText,
  Mail,
  AlertCircle,
  Play,
  RotateCcw,
  Check,
  X,
  Plus,
  Lock,
  Layers,
  Settings,
  Shield,
  Cpu,
  Share2,
  Eye,
  Info,
  Calendar,
  MessageSquare
} from 'lucide-react';

interface LicitacionesProps {
  dacs: DacRequest[];
  currentRole: UserRole;
  onUpdateDacState: (id: string, newState: DacState) => void;
  onSelectDac: (id: string) => void;
}

// Group the 9 official states into 3 phases for better visual organization
const PHASES = [
  { id: 'P1', name: 'Fase 1: Solicitud y Llenado', states: ['SOLICITADO', 'EN LLENADO'] },
  { id: 'P2', name: 'Fase 2: Presupuesto y Aprobación', states: ['EN PRESUPUESTO', 'APROBADO POR GERENCIA', 'DEVUELTO PARA CORRECCIÓN', 'APROBADO POR JP'] },
  { id: 'P3', name: 'Fase 3: Evaluación y Cierre', states: ['INFORME ENTREGADO', 'RESULTADO POR PROVEEDOR GENERADO', 'CERRADO'] }
];

// Sequential order of the 9 official states of the DAC-L
const ORDERED_STATES: DacState[] = [
  'SOLICITADO',
  'EN LLENADO',
  'EN PRESUPUESTO',
  'APROBADO POR GERENCIA',
  'DEVUELTO PARA CORRECCIÓN',
  'APROBADO POR JP',
  'INFORME ENTREGADO',
  'RESULTADO POR PROVEEDOR GENERADO',
  'CERRADO'
];

export default function LicitacionesView({
  dacs,
  currentRole: initialRole,
  onUpdateDacState,
  onSelectDac
}: LicitacionesProps) {
  // Switcher of roles for demonstration
  const [simulatedRole, setSimulatedRole] = useState<UserRole>('RESP_GESTION');

  // Filter dacs of type Licitación
  const licitaciones = useMemo(() => {
    return dacs.filter(d => d.type === 'Licitación');
  }, [dacs]);

  // Selected DAC id
  const [activeDacId, setActiveDacId] = useState<string>(() => {
    return licitaciones[0]?.id || dacs[0]?.id || '';
  });

  const activeDac = useMemo(() => {
    return dacs.find(d => d.id === activeDacId) || licitaciones[0] || dacs[0];
  }, [dacs, activeDacId, licitaciones]);

  // Safe mapping of state to the 9 official ones
  const currentState = useMemo((): DacState => {
    if (!activeDac) return 'SOLICITADO';
    const st = activeDac.state;
    // Map any old legacy state gracefully to a valid new state
    if (ORDERED_STATES.includes(st)) {
      return st;
    }
    if (st === 'BORRADOR') return 'SOLICITADO';
    if (st === 'RESULTADO LICITACIÓN APROBADO') return 'CERRADO';
    if (st === 'EN EVALUACIÓN DOCUMENTAL') return 'INFORME ENTREGADO';
    return 'SOLICITADO';
  }, [activeDac]);

  // Suppliers state for editing technical scores
  const [supplierScores, setSupplierScores] = useState<Record<string, number>>({
    's1': 92,
    's2': 78,
    's3': 65,
    'n_s1': 91,
    'n_s2': 82,
    'n_s3': 61
  });

  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('s1');
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [showSharepointLogs, setShowSharepointLogs] = useState(true);

  // Budget calculations
  const [hhBase, setHhBase] = useState<number>(45);
  const [costPerHour, setCostPerHour] = useState<number>(140);

  // Form fields for "EN LLENADO"
  const [selectedFramework, setSelectedFramework] = useState<'ISO 27001' | 'NIST SP 800-53'>('ISO 27001');
  const [architectureDescription, setArchitectureDescription] = useState('Plataforma híbrida expuesta con balanceador de carga corporativo y base de datos relacional.');
  const [scopeControls, setScopeControls] = useState<string[]>(['MFA', 'RBAC', 'Encryption', 'Auditoría']);

  // SharePoint Report URL for "INFORME ENTREGADO"
  const [sharepointReportUrl, setSharepointReportUrl] = useState('https://codelco.sharepoint.com/teams/ciber/evaluaciones/informe_tecnico_backup.pdf');

  // Logs ledger in SharePoint
  const [sharepointLogs, setSharepointLogs] = useState<Array<{ id: string, date: string, state: DacState, text: string, actor: string }>>([
    { id: 'l1', date: '2026-06-20 10:15', state: 'SOLICITADO', text: 'El JP inició la solicitud de licitación para el proceso "Plataforma Cloud Backup".', actor: 'mgonzalez@codelco.cl (JP)' }
  ]);

  // Synchronize simulated role with initialRole prop on load
  useEffect(() => {
    if (initialRole === 'JP') {
      setSimulatedRole('JP');
    } else if (initialRole === 'GERENTE_APROBADORA') {
      setSimulatedRole('GERENTE_APROBADORA');
    } else if (initialRole === 'RESP_PRESUPUESTO_EY') {
      setSimulatedRole('RESP_PRESUPUESTO_EY');
    } else if (initialRole === 'RESP_EVAL_DOC_EY') {
      setSimulatedRole('RESP_EVAL_DOC_EY');
    } else if (initialRole === 'RESP_GESTION') {
      setSimulatedRole('RESP_GESTION');
    } else {
      setSimulatedRole('RESP_GESTION'); // Default to evaluation manager for bidding
    }
  }, [initialRole]);

  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => {
      setSuccessToast(null);
    }, 4500);
  };

  // Determine active responsible actor for current state
  const responsibleActor = useMemo(() => {
    switch (currentState) {
      case 'SOLICITADO':
        return { name: 'Gestor de Evaluación (Ciberseguridad)', code: 'RESP_GESTION', color: 'text-blue-700 bg-blue-50 border-blue-200' };
      case 'EN LLENADO':
        return { name: 'Jefe de Proyecto (JP)', code: 'JP', color: 'text-cobre bg-orange-50 border-orange-200' };
      case 'EN PRESUPUESTO':
        return { name: 'Responsable de Presupuesto (EY)', code: 'RESP_PRESUPUESTO_EY', color: 'text-purple-600 bg-purple-50 border-purple-200' };
      case 'APROBADO POR GERENCIA':
        return { name: 'Jefe de Proyecto (JP)', code: 'JP', color: 'text-cobre bg-orange-50 border-orange-200' };
      case 'DEVUELTO PARA CORRECCIÓN':
        return { name: 'Responsable de Presupuesto (EY)', code: 'RESP_PRESUPUESTO_EY', color: 'text-purple-600 bg-purple-50 border-purple-200' };
      case 'APROBADO POR JP':
        return { name: 'Responsable de Evaluación Documental', code: 'RESP_EVAL_DOC_EY', color: 'text-amber-700 bg-amber-50 border-amber-200' };
      case 'INFORME ENTREGADO':
        return { name: 'Gestor de Evaluación (Ciberseguridad)', code: 'RESP_GESTION', color: 'text-blue-700 bg-blue-50 border-blue-200' };
      case 'RESULTADO POR PROVEEDOR GENERADO':
        return { name: 'Gestor de Evaluación (Ciberseguridad)', code: 'RESP_GESTION', color: 'text-blue-700 bg-blue-50 border-blue-200' };
      case 'CERRADO':
        return { name: 'Proceso Finalizado', code: 'ADMIN', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
      default:
        return { name: 'Administrador', code: 'ADMIN', color: 'text-gray-700 bg-gray-50 border-gray-200' };
    }
  }, [currentState]);

  const isUserAuthorized = simulatedRole === responsibleActor.code || simulatedRole === 'ADMIN';

  // Sello color styles helper
  const getSelloColor = (seal: SelloType) => {
    switch (seal) {
      case 'Verde':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Amarillo':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Rojo':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-gray-50 text-gray-500 border-gray-200';
    }
  };

  const getSelloFromScore = (score: number): SelloType => {
    if (score >= 90) return 'Verde';
    if (score >= 70) return 'Amarillo';
    return 'Rojo';
  };

  // Active supplier details helper
  const activeSupplier = useMemo(() => {
    if (!activeDac) return undefined;
    const list = activeDac.suppliers || [];
    const sup = list.find(s => s.id === selectedSupplierId) || list[0];
    if (!sup) return undefined;

    const editedScore = supplierScores[sup.id] ?? sup.score;
    const editedSeal = getSelloFromScore(editedScore);
    return {
      ...sup,
      score: editedScore,
      seal: editedSeal
    };
  }, [activeDac, selectedSupplierId, supplierScores]);

  // Budget calculations
  const budgetCalc = useMemo(() => {
    const qty = activeDac?.suppliers?.length || 3;
    const totalHh = hhBase * qty;
    const totalCost = totalHh * costPerHour;
    return { qty, totalHh, totalCost };
  }, [activeDac, hhBase, costPerHour]);

  // Logger helper
  const addSharepointLog = (newState: DacState, text: string) => {
    const actorEmail =
      simulatedRole === 'JP' ? 'mgonzalez@codelco.cl (JP)' :
      simulatedRole === 'RESP_GESTION' ? 'gestor.eval@codelco.cl (Gestor Ciber)' :
      simulatedRole === 'GERENTE_APROBADORA' ? 'gerente.ciber@codelco.cl (Gerente)' :
      simulatedRole === 'RESP_PRESUPUESTO_EY' ? 'presupuestos.ey@ey.com (EY)' :
      simulatedRole === 'RESP_EVAL_DOC_EY' ? 'evaluador.ey@ey.com (EY)' : 'admin@codelco.cl';

    const logObj = {
      id: `l_${Date.now()}`,
      date: new Date().toLocaleString('es-CL', { hour12: false }),
      state: newState,
      text,
      actor: actorEmail
    };
    setSharepointLogs(prev => [logObj, ...prev]);
  };

  // Perform state transition
  const handleTransitionState = (newState: DacState, customLogText?: string) => {
    if (!activeDac) return;
    onUpdateDacState(activeDac.id, newState);

    const defaultLogText = `Cambio de estado del DAC-L de forma simulada a: ${newState}.`;
    addSharepointLog(newState, customLogText || defaultLogText);
    triggerToast(`Estado del DAC ${activeDac.id} actualizado a: ${newState}`);
  };

  // Edit supplier scores
  const handleUpdateSupplierScore = (supId: string, val: number) => {
    const scoreVal = Math.min(100, Math.max(0, val));
    setSupplierScores(prev => ({
      ...prev,
      [supId]: scoreVal
    }));
    triggerToast(`Puntaje de Oferente actualizado a ${scoreVal}%. Sello recalculado.`);
  };

  // Get Power Automate automated alert content
  const getNotificationContent = (state: DacState) => {
    switch (state) {
      case 'SOLICITADO':
        return {
          to: 'gestor.eval@codelco.cl',
          type: 'Email + Teams (Power Automate)',
          subject: '📢 Nueva Solicitud DAC-L Iniciada',
          body: 'El Jefe de Proyecto ha iniciado un nuevo proceso de licitación. Pendiente aprobación del Gestor de Ciberseguridad para generar el número de registro oficial.'
        };
      case 'EN LLENADO':
        return {
          to: 'mgonzalez@codelco.cl',
          type: 'Email (Power Automate)',
          subject: '📝 Solicitud Aprobada - Formulario DAC Habilitado',
          body: `La solicitud fue visada. Se generó oficialmente el registro DAC-L-${activeDac?.id || '20260002'}. Por favor, complete la información general y el marco de arquitectura.`
        };
      case 'EN PRESUPUESTO':
        return {
          to: 'presupuestos.ey@ey.com',
          type: 'Portal EY API',
          subject: '💵 Solicitud de Estimación de Presupuesto',
          body: 'El formulario técnico de licitación está listo. Por favor ingrese las horas estimadas (HH) de consultoría para evaluar técnicamente a los oferentes.'
        };
      case 'APROBADO POR GERENCIA':
        return {
          to: 'mgonzalez@codelco.cl',
          type: 'Teams Bot (Power Automate)',
          subject: '✅ Presupuesto de Evaluación Aprobado por Gerencia',
          body: `El presupuesto para auditar a los oferentes ha sido autorizado por la Gerente de Ciberseguridad. Listo para validación y firma del JP.`
        };
      case 'DEVUELTO PARA CORRECCIÓN':
        return {
          to: 'presupuestos.ey@ey.com',
          type: 'Email (Alerta)',
          subject: '⚠️ Presupuesto Devuelto para Corrección',
          body: 'La Gerencia de Ciberseguridad ha observado el presupuesto propuesto. Se requiere ajustar horas o costo para re-enviar la cotización.'
        };
      case 'APROBADO POR JP':
        return {
          to: 'evaluador.ey@ey.com',
          type: 'Email',
          subject: '🔍 DAC-L Autorizado - Iniciar Evaluación Documental',
          body: 'El Jefe de Proyecto validó y aprobó formalmente el DAC-L. Habilitado para realizar la evaluación y cargar el informe técnico final.'
        };
      case 'INFORME ENTREGADO':
        return {
          to: 'gestor.eval@codelco.cl',
          type: 'Teams Alert (Ciberseguridad)',
          subject: '📄 Informe de Evaluación Entregado',
          body: 'El Evaluador Documental de EY ha cargado el informe técnico oficial de la licitación en SharePoint. Listo para generar la tabla de cumplimiento.'
        };
      case 'RESULTADO POR PROVEEDOR GENERADO':
        return {
          to: 'gestor.eval@codelco.cl',
          type: 'Email (Alerta de Cierre)',
          subject: '🏆 Resultados Listos para Publicar',
          body: 'Se ha consolidado exitosamente la tabla de cumplimiento y los sellos (Verde/Amarillo/Rojo) de los oferentes. Pendiente confirmación de cierre.'
        };
      case 'CERRADO':
        return {
          to: 'abastecimiento@codelco.cl, proveedores@codelco.cl',
          type: 'SharePoint Publicación + Email',
          subject: '🏆 Proceso DAC-L Cerrado - Sellos de Ciberseguridad Emitidos',
          body: 'La evaluación de ciberseguridad para esta licitación ha finalizado formalmente. Se han publicado los sellos definitivos para cada oferente.'
        };
      default:
        return { to: 'jp@codelco.cl', type: 'Sistema', subject: 'Alerta General', body: 'Proceso de licitación actualizado.' };
    }
  };

  const notification = getNotificationContent(currentState);

  // Toggle checklist values based on current state index
  const dacLNumber = `DAC-L-${activeDac?.id || '20260002'}`;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] w-full overflow-hidden text-xs bg-gray-50 font-sans" id="licitaciones-view">
      
      {/* TOP COMPACT PLAYGROUND CONTROLLER */}
      <div className="bg-gris-azulado text-white px-4 py-3 border-b border-white/10 shrink-0 flex flex-wrap items-center justify-between gap-3 shadow-md" id="simulation-bar">
        <div className="flex items-center space-x-2">
          <Gavel className="w-5 h-5 text-cobre animate-pulse" />
          <div>
            <h3 className="font-extrabold text-xs tracking-wider uppercase font-display flex items-center gap-1.5">
              <span>Buzón del Sello de Ciberseguridad en Licitaciones (DAC-L)</span>
              <span className="bg-cobre text-white text-[9px] font-mono px-2 py-0.5 rounded-full font-bold">
                9 ESTADOS OFICIALES
              </span>
            </h3>
            <p className="text-[10px] text-crema/70 leading-none">Interactúe con los roles y estados oficiales para simular el ciclo de adquisiciones tecnológicas.</p>
          </div>
        </div>

        {/* Dynamic Role Switcher */}
        <div className="flex items-center space-x-2.5 text-[10px] font-bold">
          <span className="text-crema/80">Simular Actor:</span>
          <div className="flex bg-white/10 p-0.5 rounded-sm border border-white/20">
            {([
              { code: 'JP', label: 'JP (Codelco)' },
              { code: 'RESP_GESTION', label: 'Gestor Ciber' },
              { code: 'GERENTE_APROBADORA', label: 'Gerente' },
              { code: 'RESP_PRESUPUESTO_EY', label: 'Presupuesto EY' },
              { code: 'RESP_EVAL_DOC_EY', label: 'Evaluador EY' }
            ] as { code: UserRole, label: string }[]).map((r) => (
              <button
                key={r.code}
                onClick={() => setSimulatedRole(r.code)}
                className={`px-2 py-1 rounded-xs transition-all cursor-pointer uppercase text-[9px] font-extrabold ${
                  simulatedRole === r.code 
                    ? 'bg-cobre text-white shadow-sm font-black' 
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
                id={`role-btn-${r.code}`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* THREE PANES CONTAINER */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* LEFT COLUMN: 9-State Steps map */}
        <div className="w-full lg:w-[310px] bg-white border-b lg:border-b-0 lg:border-r border-gray-200 shrink-0 flex flex-col overflow-y-auto p-4 md:p-5" id="steps-panel">
          <div className="border-b border-gray-100 pb-2.5 mb-3 flex items-center justify-between">
            <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">
              Ciclo de Vida DAC-L (9 Estados)
            </h4>
            <span className="text-[9px] bg-gray-100 text-gray-600 font-bold px-1.5 py-0.5 rounded-xs font-mono">
              {dacLNumber}
            </span>
          </div>

          <p className="text-[10px] text-gray-400 leading-snug mb-4">
            Forzar simulación a cualquier estado para evaluar el comportamiento del portal:
          </p>

          <div className="space-y-4 flex-1">
            {PHASES.map((phase) => {
              const isPhaseActive = phase.states.includes(currentState);
              return (
                <div key={phase.id} className={`p-2.5 rounded-xs border transition-all ${
                  isPhaseActive 
                    ? 'bg-cobre/5 border-cobre/20 ring-1 ring-cobre/10' 
                    : 'bg-gray-50/50 border-gray-100'
                }`}>
                  <h5 className={`font-extrabold text-[10px] uppercase tracking-wide flex items-center gap-1.5 ${
                    isPhaseActive ? 'text-cobre' : 'text-gray-500'
                  }`}>
                    <Layers className="w-3.5 h-3.5" />
                    {phase.name}
                  </h5>

                  <div className="mt-2 space-y-1.5 pl-2.5 border-l border-gray-200">
                    {phase.states.map((st) => {
                      const isActive = currentState === st;
                      const isPast = ORDERED_STATES.indexOf(currentState) > ORDERED_STATES.indexOf(st as DacState);
                      
                      return (
                        <button
                          key={st}
                          onClick={() => handleTransitionState(st as DacState, `Simulación: Usuario forzó manualmente el estado a "${st}".`)}
                          className={`w-full text-left p-1.5 rounded-xs text-[9px] font-semibold transition-all relative group flex items-center justify-between ${
                            isActive
                              ? 'bg-cobre text-white border border-cobre font-extrabold shadow-sm'
                              : isPast
                              ? 'text-emerald-700 bg-emerald-50/60 hover:bg-emerald-100/60 border border-emerald-100/50'
                              : 'text-gray-500 bg-white hover:bg-gray-100 border border-gray-100 hover:border-gray-200'
                          }`}
                          id={`step-btn-${st}`}
                        >
                          <span className="truncate pr-1 uppercase tracking-tight">{st.replace(/_/g, ' ')}</span>
                          <span className="shrink-0 flex items-center">
                            {isActive ? (
                              <Play className="w-2.5 h-2.5 fill-white text-white animate-pulse" />
                            ) : isPast ? (
                              <Check className="w-3 h-3 font-bold" />
                            ) : (
                              <Clock className="w-3 h-3 text-gray-300 group-hover:text-cobre transition-colors" />
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100">
            <button
              onClick={() => {
                if (confirm('¿Está seguro de reiniciar la simulación del DAC-L al estado SOLICITADO?')) {
                  handleTransitionState('SOLICITADO', 'Simulación reiniciada por el usuario. Estado de inicio SOLICITADO.');
                }
              }}
              className="w-full py-1.5 border border-dashed border-red-200 text-rose-700 bg-rose-50 hover:bg-rose-100 text-[10px] font-bold uppercase rounded-sm transition-all flex items-center justify-center gap-1 cursor-pointer"
              id="reset-simulation-btn"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reiniciar Flujo Licitación
            </button>
          </div>
        </div>

        {/* MIDDLE COLUMN: Detail & Actions */}
        <div className="flex-1 bg-gray-50 p-4 md:p-6 overflow-y-auto flex flex-col space-y-6" id="middle-content">
          
          {/* Success Toast display */}
          {successToast && (
            <div className="bg-emerald-600 text-white px-4 py-3 rounded-xs shadow-md flex items-center justify-between text-xs animate-fade-in font-sans" id="success-toast">
              <span className="flex items-center gap-2 font-semibold">
                <Check className="w-4 h-4 bg-white text-emerald-600 rounded-full p-0.5" />
                {successToast}
              </span>
              <button onClick={() => setSuccessToast(null)} className="text-white/80 hover:text-white ml-3 focus:outline-none">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Active Process Metadata summary card */}
          <div className="bg-white border border-gray-200 p-5 rounded-xs shadow-xs" id="metadata-summary">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3 mb-4">
              <div className="flex items-center space-x-2 text-xs font-bold">
                <span className="text-cobre font-mono uppercase font-black">{dacLNumber}</span>
                <span className="text-gray-300">|</span>
                <span className="text-gray-500">Tipo de Proceso: Licitación de Ciberseguridad</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="text-[10px] font-bold text-gray-400">Proceso Activo:</span>
                <select
                  value={activeDacId}
                  onChange={(e) => setActiveDacId(e.target.value)}
                  className="px-2 py-1 border border-gray-200 rounded-sm bg-white font-bold text-gris-azulado text-[10px]"
                >
                  {licitaciones.map(l => (
                    <option key={l.id} value={l.id}>DAC {l.id} - {l.projectName.slice(0, 30)}...</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <h2 className="text-sm font-extrabold text-gris-azulado uppercase tracking-wide">
                {activeDac?.projectName || 'Plataforma Cloud Backup'}
              </h2>
              <p className="text-gray-500 font-sans leading-relaxed text-[11px]">
                {activeDac?.description || 'Servicio de backup y recuperación ante desastres en la nube para servidores y bases de datos críticas de las divisiones norte y centro.'}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-gray-50 text-[10px] text-gray-500">
                <div>
                  <span className="block text-gray-400">JP Codelco:</span>
                  <strong className="text-gray-700 font-bold">{activeDac?.jpName || 'María González'}</strong>
                </div>
                <div>
                  <span className="block text-gray-400">División:</span>
                  <strong className="text-gray-700 font-bold">Corporativa</strong>
                </div>
                <div>
                  <span className="block text-gray-400">Criticidad DAC:</span>
                  <strong className="text-cobre font-bold uppercase">🔴 {activeDac?.criticidad || 'Alto'}</strong>
                </div>
                <div>
                  <span className="block text-gray-400">Oferentes:</span>
                  <strong className="text-emerald-700 font-bold">{activeDac?.suppliers?.length || 3} en Competencia</strong>
                </div>
              </div>
            </div>
          </div>

          {/* MAIN ACTIONS AREA DEPENDING ON CURRENT STATE */}
          <div className="bg-white border border-gray-200 rounded-xs shadow-xs p-5 space-y-4" id="actions-panel">
            
            {/* Active State Details Header */}
            <div className="border-b border-gray-100 pb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="space-y-0.5">
                <span className="text-[9px] text-gray-400 uppercase font-extrabold tracking-wider block">Estado de Licitación</span>
                <h3 className="text-xs font-extrabold text-gris-azulado font-display uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cobre animate-ping"></span>
                  {currentState.replace(/_/g, ' ')}
                </h3>
              </div>

              {/* Actor Tag info */}
              <div className={`px-2.5 py-1 border rounded-sm text-[10px] font-bold flex items-center gap-1.5 ${responsibleActor.color}`}>
                <User className="w-3.5 h-3.5" />
                <span>Responsable Activo: {responsibleActor.name}</span>
              </div>
            </div>

            {/* Simulated Action Panel Content */}
            <div className="bg-gray-50/50 p-4 border border-gray-100 rounded-xs space-y-4">
              
              {/* Task descriptions and custom state views */}
              <div className="space-y-2 text-[11px] text-gray-600">
                <span className="font-extrabold text-gray-500 uppercase text-[9px] tracking-wider block">Procedimiento Técnico en este Estado:</span>
                
                {/* 1. SOLICITADO */}
                {currentState === 'SOLICITADO' && (
                  <div className="space-y-2.5">
                    <p className="leading-relaxed">
                      El proceso de licitación ha sido iniciado formalmente por el JP en SharePoint. El Gestor de Ciberseguridad debe evaluar los términos de referencia (TDR) iniciales y visar la solicitud para habilitar el registro formal del DAC-L.
                    </p>
                    <div className="p-3 bg-blue-50 border border-blue-100 rounded-xs space-y-2">
                      <h6 className="font-bold text-blue-800 text-[10px] uppercase flex items-center gap-1">
                        <Paperclip className="w-3.5 h-3.5" /> Términos de Referencia Solicitados
                      </h6>
                      <div className="flex items-center justify-between text-[10px] font-mono text-gray-600 bg-white p-2 rounded border border-gray-100">
                        <span className="truncate">Términos_Referencia_Backup_Borrador.pdf</span>
                        <a href="#view" onClick={(e) => { e.preventDefault(); triggerToast("Visualizando TDR en visor integrado de SharePoint"); }} className="text-cobre hover:underline flex items-center gap-0.5">
                          Ver <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. EN LLENADO */}
                {currentState === 'EN LLENADO' && (
                  <div className="space-y-3">
                    <p className="leading-relaxed">
                      La solicitud fue aprobada. Se ha generado oficialmente el identificador <strong className="text-cobre font-mono">{dacLNumber}</strong>. El Jefe de Proyecto debe completar el formulario técnico indicando el marco de referencia primario, la descripción arquitectónica y los controles aplicables antes de estimar costos.
                    </p>

                    {/* Interactive Form for JP */}
                    <div className="bg-white p-4 border border-gray-100 rounded-xs space-y-3">
                      <h5 className="font-bold text-gris-azulado text-[10px] uppercase border-b border-gray-50 pb-1 flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-cobre" /> Formulario DAC-L: Especificaciones de Seguridad
                      </h5>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[10px]">
                        <div className="space-y-1">
                          <label className="font-bold text-gray-500 uppercase text-[8px] block">Marco de Seguridad Primario:</label>
                          <div className="flex gap-2">
                            {(['ISO 27001', 'NIST SP 800-53'] as const).map(f => (
                              <button
                                type="button"
                                key={f}
                                onClick={() => setSelectedFramework(f)}
                                className={`flex-1 py-1 px-2 border rounded-sm font-bold text-center transition-all ${
                                  selectedFramework === f
                                    ? 'bg-cobre text-white border-cobre'
                                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                                }`}
                              >
                                {f}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-gray-500 uppercase text-[8px] block">Controles en Alcance:</label>
                          <div className="grid grid-cols-2 gap-1.5">
                            {['MFA', 'RBAC', 'Encryption', 'Auditoría', 'Pentest', 'Corta-fuegos'].map(ctrl => {
                              const included = scopeControls.includes(ctrl);
                              return (
                                <label key={ctrl} className="flex items-center space-x-1.5 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={included}
                                    onChange={() => {
                                      if (included) {
                                        setScopeControls(scopeControls.filter(c => c !== ctrl));
                                      } else {
                                        setScopeControls([...scopeControls, ctrl]);
                                      }
                                    }}
                                    className="rounded-3xs text-cobre focus:ring-cobre border-gray-300 w-3 h-3"
                                  />
                                  <span className="text-[10px]">{ctrl}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1 text-[10px]">
                        <label className="font-bold text-gray-500 uppercase text-[8px] block">Descripción de la Arquitectura del Sistema:</label>
                        <textarea
                          value={architectureDescription}
                          onChange={(e) => setArchitectureDescription(e.target.value)}
                          className="w-full p-2 border border-gray-200 rounded bg-gray-50/50 font-sans focus:outline-none focus:border-cobre text-[10px]"
                          rows={2}
                          placeholder="Indique cómo se compone la solución tecnológica de la licitación..."
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. EN PRESUPUESTO */}
                {currentState === 'EN PRESUPUESTO' && (
                  <div className="space-y-3">
                    <p className="leading-relaxed">
                      El Responsable de Presupuesto de EY debe revisar el alcance tecnológico definido en el formulario DAC-L y proponer la cotización de horas de consultoría (HH) para realizar la evaluación de los oferentes técnicos.
                    </p>
                    <div className="bg-purple-50/50 p-3.5 border border-purple-100 rounded-xs space-y-2">
                      <h6 className="font-bold text-purple-700 text-[10px] uppercase flex items-center gap-1">
                        <Calculator className="w-3.5 h-3.5" /> Parámetros de Cotización de Horas (HU-18)
                      </h6>
                      <div className="grid grid-cols-2 gap-3 text-[10px]">
                        <div className="space-y-1 bg-white p-2 border border-purple-100 rounded">
                          <span className="text-gray-400 block font-bold text-[8px]">Base HH por Oferente:</span>
                          <div className="flex items-center space-x-1 mt-0.5">
                            <input
                              type="number"
                              value={hhBase}
                              onChange={(e) => setHhBase(Math.max(1, parseInt(e.target.value) || 1))}
                              className="w-full px-2 py-0.5 border border-gray-200 rounded font-bold text-center text-purple-700"
                            />
                            <span className="font-semibold text-gray-500">HH</span>
                          </div>
                        </div>
                        <div className="space-y-1 bg-white p-2 border border-purple-100 rounded">
                          <span className="text-gray-400 block font-bold text-[8px]">Costo Tarifa por Hora (USD):</span>
                          <div className="flex items-center space-x-1 mt-0.5">
                            <span className="text-gray-500 font-bold">$</span>
                            <input
                              type="number"
                              value={costPerHour}
                              onChange={(e) => setCostPerHour(Math.max(1, parseInt(e.target.value) || 1))}
                              className="w-full px-1 py-0.5 border border-gray-200 rounded font-bold text-center text-purple-700"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="bg-white p-2 rounded border border-purple-100 flex items-center justify-between text-[10px]">
                        <span className="font-semibold text-purple-600">Presupuesto Estimado Final:</span>
                        <strong className="text-purple-800 text-xs font-black">USD ${budgetCalc.totalCost.toLocaleString('es-CL')}</strong>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. APROBADO POR GERENCIA */}
                {currentState === 'APROBADO POR GERENCIA' && (
                  <div className="space-y-2.5">
                    <p className="leading-relaxed">
                      La Gerente de Ciberseguridad ha visado y aprobado formalmente el presupuesto cotizado por EY de <strong>USD ${budgetCalc.totalCost.toLocaleString('es-CL')}</strong>. El Jefe de Proyecto (JP) debe ahora realizar la validación final del DAC-L para dar el pase formal a la ejecución del servicio de evaluación de oferentes.
                    </p>
                    <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xs text-[10px] space-y-1 text-emerald-800 font-sans">
                      <span className="font-bold block uppercase text-[8px]">Aprobación Gerencial Completada:</span>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span>Presupuesto validado con Hash de firma digital de Gerencia: <code className="bg-white px-1 py-0.5 rounded border text-[9px] font-mono">0x8892fbc0a2</code></span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. DEVUELTO PARA CORRECCIÓN */}
                {currentState === 'DEVUELTO PARA CORRECCIÓN' && (
                  <div className="space-y-3">
                    <p className="leading-relaxed text-rose-800">
                      El presupuesto ha sido devuelto con observaciones por la Gerente. El Responsable de Presupuesto de EY debe ajustar las horas estimadas de evaluación técnica o re-negociar la tarifa horaria para someterlo nuevamente a aprobación.
                    </p>
                    <div className="p-3 bg-rose-50 border border-rose-100 rounded text-[10px] space-y-1">
                      <span className="font-bold text-rose-700 block uppercase text-[8px]">Observaciones del Rechazo:</span>
                      <p className="italic text-gray-700">"El valor total de la cotización supera las tarifas máximas permitidas para auditorías de tipo Licitación. Se solicita re-cotizar con una base máxima de 40 HH por oferente."</p>
                    </div>

                    <div className="bg-white p-3 border border-gray-100 rounded space-y-2">
                      <span className="font-bold text-gray-500 uppercase text-[8px] block">Ajustar Tarifas de Corrección:</span>
                      <div className="grid grid-cols-2 gap-3 text-[10px]">
                        <div>
                          <span className="text-gray-400">Horas Base:</span>
                          <input
                            type="number"
                            value={hhBase}
                            onChange={(e) => setHhBase(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-full px-2 py-1 border rounded font-bold text-center"
                          />
                        </div>
                        <div>
                          <span className="text-gray-400">Tarifa USD:</span>
                          <input
                            type="number"
                            value={costPerHour}
                            onChange={(e) => setCostPerHour(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-full px-2 py-1 border rounded font-bold text-center"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. APROBADO POR JP */}
                {currentState === 'APROBADO POR JP' && (
                  <div className="space-y-2.5">
                    <p className="leading-relaxed">
                      El Jefe de Proyecto ha validado el proceso de cotización y firmado el DAC-L. Ahora, el Evaluador Documental de EY debe iniciar formalmente el análisis de la documentación de cumplimiento normativo provista por los oferentes y entregar el informe técnico consolidado.
                    </p>
                    <div className="bg-amber-50 border border-amber-100 p-3 rounded text-[10px] space-y-1.5 text-amber-800">
                      <span className="font-bold block uppercase text-[8px]">Pendiente Carga de Informe de Evaluación:</span>
                      <div className="space-y-1">
                        <label className="block text-gray-600">Ruta / URL del Informe Técnico (SharePoint):</label>
                        <input
                          type="text"
                          value={sharepointReportUrl}
                          onChange={(e) => setSharepointReportUrl(e.target.value)}
                          className="w-full p-2 border border-amber-200 rounded bg-white text-gray-700 text-[10px] font-mono focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 7. INFORME ENTREGADO */}
                {currentState === 'INFORME ENTREGADO' && (
                  <div className="space-y-3">
                    <p className="leading-relaxed">
                      El Evaluador Documental de EY ha entregado formalmente el informe técnico final. El Gestor de Ciberseguridad de Codelco debe revisar el documento, validar las puntuaciones técnicas y sellos de cada oferente en competencia en el panel de la derecha.
                    </p>
                    <div className="p-3 bg-blue-50 border border-blue-100 rounded-xs space-y-2">
                      <h6 className="font-bold text-blue-800 text-[10px] uppercase flex items-center gap-1">
                        <Paperclip className="w-3.5 h-3.5" /> Informe de Evaluación de Licitación Entregado
                      </h6>
                      <div className="flex items-center justify-between text-[10px] font-mono text-gray-600 bg-white p-2.5 rounded border border-gray-100">
                        <span className="truncate pr-2">{sharepointReportUrl}</span>
                        <a href={sharepointReportUrl} target="_blank" rel="noopener noreferrer" className="text-cobre hover:underline shrink-0 flex items-center gap-0.5">
                          Ver Informe <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* 8. RESULTADO POR PROVEEDOR GENERADO */}
                {currentState === 'RESULTADO POR PROVEEDOR GENERADO' && (
                  <div className="space-y-2.5">
                    <p className="leading-relaxed">
                      El Gestor de Ciberseguridad ha procesado las calificaciones de la matriz técnica de oferentes. La tabla de cumplimiento con el Sello de Ciberseguridad asignado (Verde, Amarillo o Rojo) para cada competidor ha sido generada con éxito. Listo para el cierre final del proceso.
                    </p>
                    <div className="bg-emerald-50 border border-emerald-200 rounded p-3 space-y-2 text-emerald-800 text-[10px]">
                      <span className="font-bold uppercase text-[8px] block">Consolidado de Resultados DAC-L:</span>
                      <div className="grid grid-cols-3 gap-1 text-center font-mono font-bold">
                        <div className="bg-white p-1 rounded border border-emerald-100">
                          <span className="text-gray-400 block text-[7px]">Secure Corp</span>
                          <span className="text-emerald-700 text-[9px]">🟢 Verde ({supplierScores['s1'] ?? 92}%)</span>
                        </div>
                        <div className="bg-white p-1 rounded border border-emerald-100">
                          <span className="text-gray-400 block text-[7px]">Cyber Armor</span>
                          <span className="text-amber-700 text-[9px]">🟡 Amarillo ({supplierScores['s2'] ?? 78}%)</span>
                        </div>
                        <div className="bg-white p-1 rounded border border-emerald-100">
                          <span className="text-gray-400 block text-[7px]">Vuln Shield</span>
                          <span className="text-rose-700 text-[9px]">🔴 Rojo ({supplierScores['s3'] ?? 65}%)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 9. CERRADO */}
                {currentState === 'CERRADO' && (
                  <div className="space-y-2.5">
                    <p className="leading-relaxed">
                      El proceso de licitación {dacLNumber} ha concluido con éxito. El Sello de Ciberseguridad oficial ha sido emitido inmutablemente en SharePoint Ledger y se han expedido los certificados digitales oficiales de cumplimiento.
                    </p>
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded font-bold flex items-center gap-1.5">
                      <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span>Proceso Certificado con Sello de Ciberseguridad Codelco</span>
                    </div>
                  </div>
                )}

              </div>

              {/* DYNAMIC CHECKLIST FOR EACH STATE */}
              <div className="space-y-1.5 pt-2 border-t border-gray-200 text-[10px] text-gray-500">
                <span className="font-extrabold text-gray-400 uppercase tracking-widest block text-[8px] mb-1">Requisitos de Cumplimiento:</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" checked={ORDERED_STATES.indexOf(currentState) >= 1} disabled className="rounded-sm border-gray-300 text-cobre focus:ring-cobre text-[9px] w-3 h-3" />
                    <span>N° DAC-L oficial generado en SharePoint</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" checked={ORDERED_STATES.indexOf(currentState) >= 2} disabled className="rounded-sm border-gray-300 text-cobre focus:ring-cobre text-[9px] w-3 h-3" />
                    <span>Marco de seguridad y arquitectura declarados</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" checked={ORDERED_STATES.indexOf(currentState) >= 3} disabled className="rounded-sm border-gray-300 text-cobre focus:ring-cobre text-[9px] w-3 h-3" />
                    <span>Cotización de presupuesto calculada (HU-18)</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" checked={ORDERED_STATES.indexOf(currentState) >= 8} disabled className="rounded-sm border-gray-300 text-cobre focus:ring-cobre text-[9px] w-3 h-3" />
                    <span>Emisión de Certificados de Sello Digital</span>
                  </label>
                </div>
              </div>

              {/* WARNING INFO IF ROLE MISMATCH */}
              {!isUserAuthorized && (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-sm text-[10px] text-amber-700 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5 animate-pulse" />
                  <div>
                    <strong>Aviso de Simulación:</strong> El rol simulado activo es <strong>{simulatedRole}</strong>, pero el responsable oficial de este estado es <strong>{responsibleActor.code}</strong>. Cambie el rol arriba para habilitar los botones de acción del flujo.
                  </div>
                </div>
              )}
            </div>

            {/* INTERACTIVE ACTIONS BUTTONS BOX */}
            <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center gap-3">
              <span className="text-[10px] font-bold text-gray-400">Acciones del Flujo:</span>

              {/* 1. SOLICITADO */}
              {currentState === 'SOLICITADO' && (
                <button
                  onClick={() => handleTransitionState('EN LLENADO', `El Gestor de Evaluación aprobó la solicitud de licitación. N° DAC-L generado con éxito.`)}
                  disabled={!isUserAuthorized}
                  className="px-4 py-2 bg-cobre hover:bg-cobre-oscuro text-white font-bold uppercase rounded-xs shadow-sm cursor-pointer tracking-wider disabled:opacity-40 transition-all text-[9px]"
                  id="action-approve-solicitud"
                >
                  ✅ Aprobar Solicitud y Generar N° DAC-L
                </button>
              )}

              {/* 2. EN LLENADO */}
              {currentState === 'EN LLENADO' && (
                <button
                  onClick={() => handleTransitionState('EN PRESUPUESTO', `El JP finalizó el llenado del formulario declarando el marco ${selectedFramework}. Solicitud de cotización enviada.`)}
                  disabled={!isUserAuthorized}
                  className="px-4 py-2 bg-cobre hover:bg-cobre-oscuro text-white font-bold uppercase rounded-xs shadow-sm cursor-pointer tracking-wider disabled:opacity-40 transition-all text-[9px]"
                  id="action-save-llenado"
                >
                  📝 Guardar Especificaciones y Solicitar Cotización
                </button>
              )}

              {/* 3. EN PRESUPUESTO */}
              {currentState === 'EN PRESUPUESTO' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleTransitionState('APROBADO POR GERENCIA', `La Gerente aprobó el presupuesto estimado de USD $${budgetCalc.totalCost.toLocaleString('es-CL')}.`)}
                    disabled={simulatedRole !== 'GERENTE_APROBADORA' && simulatedRole !== 'ADMIN'}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase rounded-xs shadow-sm cursor-pointer tracking-wider disabled:opacity-40 transition-all text-[9px]"
                    id="action-approve-budget"
                  >
                    💵 Aprobar Presupuesto (Gerente)
                  </button>
                  <button
                    onClick={() => handleTransitionState('DEVUELTO PARA CORRECCIÓN', 'La Gerente rechazó el presupuesto por tarifas elevadas y devolvió el DAC para corrección.')}
                    disabled={simulatedRole !== 'GERENTE_APROBADORA' && simulatedRole !== 'ADMIN'}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold uppercase rounded-xs shadow-sm cursor-pointer tracking-wider disabled:opacity-40 transition-all text-[9px]"
                    id="action-reject-budget"
                  >
                    ❌ Devolver para Corrección
                  </button>
                </div>
              )}

              {/* 4. APROBADO POR GERENCIA */}
              {currentState === 'APROBADO POR GERENCIA' && (
                <button
                  onClick={() => handleTransitionState('APROBADO POR JP', `El JP de Codelco validó y aprobó digitalmente el presupuesto de USD $${budgetCalc.totalCost.toLocaleString('es-CL')}.`)}
                  disabled={!isUserAuthorized}
                  className="px-4 py-2 bg-cobre hover:bg-cobre-oscuro text-white font-bold uppercase rounded-xs shadow-sm cursor-pointer tracking-wider disabled:opacity-40 transition-all text-[9px]"
                  id="action-jp-sign"
                >
                  🖋️ Firmar y Aprobar Presupuesto (Firma JP)
                </button>
              )}

              {/* 5. DEVUELTO PARA CORRECCIÓN */}
              {currentState === 'DEVUELTO PARA CORRECCIÓN' && (
                <button
                  onClick={() => handleTransitionState('EN PRESUPUESTO', `EY ajustó el presupuesto a USD $${budgetCalc.totalCost.toLocaleString('es-CL')} y lo reenvió a Gerencia.`)}
                  disabled={!isUserAuthorized}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold uppercase rounded-xs shadow-sm cursor-pointer tracking-wider disabled:opacity-40 transition-all text-[9px]"
                  id="action-resubmit-budget"
                >
                  🔄 Re-enviar Presupuesto Ajustado
                </button>
              )}

              {/* 6. APROBADO POR JP */}
              {currentState === 'APROBADO POR JP' && (
                <button
                  onClick={() => handleTransitionState('INFORME ENTREGADO', `El Evaluador Documental cargó y entregó el informe de evaluación técnica en SharePoint.`)}
                  disabled={!isUserAuthorized}
                  className="px-4 py-2 bg-cobre hover:bg-cobre-oscuro text-white font-bold uppercase rounded-xs shadow-sm cursor-pointer tracking-wider disabled:opacity-40 transition-all text-[9px]"
                  id="action-deliver-report"
                >
                  📤 Entregar Informe Técnico en SharePoint
                </button>
              )}

              {/* 7. INFORME ENTREGADO */}
              {currentState === 'INFORME ENTREGADO' && (
                <button
                  onClick={() => handleTransitionState('RESULTADO POR PROVEEDOR GENERADO', 'El Gestor de Evaluación generó las calificaciones y sellos en la matriz comparativa de oferentes.')}
                  disabled={!isUserAuthorized}
                  className="px-4 py-2 bg-cobre hover:bg-cobre-oscuro text-white font-bold uppercase rounded-xs shadow-sm cursor-pointer tracking-wider disabled:opacity-40 transition-all text-[9px]"
                  id="action-generate-matrix"
                >
                  🏆 Generar Tabla de Cumplimiento y Sellos
                </button>
              )}

              {/* 8. RESULTADO POR PROVEEDOR GENERADO */}
              {currentState === 'RESULTADO POR PROVEEDOR GENERADO' && (
                <button
                  onClick={() => handleTransitionState('CERRADO', 'El Gestor finalizó el proceso de licitación. Certificados y Sellos publicados.')}
                  disabled={!isUserAuthorized}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase rounded-xs shadow-sm cursor-pointer tracking-wider disabled:opacity-40 transition-all text-[9px]"
                  id="action-close-process"
                >
                  🔒 Cerrar Proceso DAC-L y Publicar Sello
                </button>
              )}

              {/* 9. CERRADO */}
              {currentState === 'CERRADO' && (
                <div className="flex items-center gap-2">
                  <span className="text-emerald-700 font-extrabold bg-emerald-50 px-2.5 py-1 rounded-sm border border-emerald-200">
                    Proceso Certificado Definitivamente
                  </span>
                  <button
                    onClick={() => {
                      if (confirm('¿Desea reiniciar el DAC-L al estado SOLICITADO para simular de nuevo?')) {
                        handleTransitionState('SOLICITADO', 'Simulación reiniciada desde el estado final.');
                      }
                    }}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold uppercase text-[9px] rounded-xs cursor-pointer border border-gray-200 transition-all"
                  >
                    Simular de Nuevo
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* DYNAMIC DIGITAL CERTIFICATE EMISSION (Only visible if Cerrado) */}
          {currentState === 'CERRADO' && (
            <div className="bg-white border-2 border-emerald-500 rounded-sm p-5 shadow-md relative overflow-hidden animate-fade-in font-sans" id="digital-certificate">
              <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-500 text-white transform rotate-45 translate-x-12 -translate-y-12 flex items-end justify-center pb-4 select-none">
                <span className="text-[8px] font-bold tracking-widest uppercase">EMITIDO</span>
              </div>

              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <ShieldCheck className="w-12 h-12 text-emerald-600 animate-bounce" />
                </div>
                
                <div className="space-y-1">
                  <h4 className="text-xs font-extrabold uppercase tracking-widest text-emerald-800">
                    CERTIFICADO DIGITAL DE SELLOS DE CIBERSEGURIDAD
                  </h4>
                  <p className="text-[9px] text-gray-400">CORPORACIÓN NACIONAL DEL COBRE DE CHILE (CODELCO)</p>
                </div>

                <div className="border-t border-b border-gray-100 py-3 my-2 space-y-2 text-left">
                  <p className="text-[11px] text-gray-600 leading-relaxed px-2 text-center">
                    Se certifica inmutablemente en el registro SharePoint Ledger que el proceso de licitación para la adquisición de <strong>"{activeDac?.projectName || 'Plataforma Cloud Backup'}"</strong> ({dacLNumber}) ha finalizado formalmente. Se han evaluado los estándares bajo el marco <strong>{selectedFramework}</strong>.
                  </p>

                  <div className="grid grid-cols-3 gap-2 max-w-sm mx-auto pt-2 text-center">
                    <div className="bg-emerald-50/50 p-1.5 border border-emerald-100 rounded-xs">
                      <span className="text-gray-400 block uppercase text-[7px] font-bold">Secure Corp</span>
                      <strong className="text-emerald-700 text-[10px] uppercase block">🟢 VERDE</strong>
                    </div>
                    <div className="bg-amber-50/50 p-1.5 border border-amber-100 rounded-xs">
                      <span className="text-gray-400 block uppercase text-[7px] font-bold">Cyber Armor</span>
                      <strong className="text-amber-700 text-[10px] block">🟡 AMARILLO</strong>
                    </div>
                    <div className="bg-rose-50/50 p-1.5 border border-rose-100 rounded-xs">
                      <span className="text-gray-400 block uppercase text-[7px] font-bold">Vuln Shield</span>
                      <strong className="text-rose-700 text-[10px] block">🔴 ROJO</strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-6 px-2">
                  <div className="w-12 h-12 bg-gray-100 border border-gray-200 rounded-sm shrink-0 flex items-center justify-center relative p-1">
                    <div className="grid grid-cols-4 gap-0.5 w-full h-full opacity-70">
                      {Array.from({ length: 16 }).map((_, i) => (
                        <div key={i} className={`rounded-3xs ${i % 3 === 0 || i % 5 === 1 ? 'bg-gray-800' : 'bg-transparent'}`} />
                      ))}
                    </div>
                  </div>

                  <div className="text-left text-[9px] text-gray-500 space-y-0.5 font-sans flex-1">
                    <span className="block">📜 <strong>Registro SHA-256:</strong> 0xdf81b9ac28...</span>
                    <span className="block">📅 <strong>Fecha Registro:</strong> {new Date().toLocaleDateString('es-CL')}</span>
                    <span className="block">🏢 <strong>Firmado por:</strong> Dirección de Seguridad de la Información</span>
                  </div>

                  <button
                    onClick={() => triggerToast('📥 Certificado PDF consolidado descargado exitosamente de SharePoint.')}
                    className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[8px] rounded-xs uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all shrink-0 shadow-sm"
                  >
                    <Download className="w-3 h-3" />
                    Descargar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* POWER AUTOMATE NOTIFICATION COMPONENT */}
          <div className="bg-white border border-gray-200 rounded-xs p-4 shadow-xs space-y-3" id="power-automate-box">
            <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-1.5 flex items-center">
              <Mail className="w-4 h-4 mr-1.5 text-cobre" />
              Power Automate: Registro de Alerta de Estado
            </h4>
            <div className="text-[11px] space-y-2 font-sans text-gray-600 bg-gray-50 p-3 border border-gray-100 rounded-xs">
              <div className="flex justify-between border-b border-gray-200/50 pb-1">
                <span className="text-gray-400 font-bold uppercase text-[8px]">Para:</span>
                <span className="font-mono font-bold text-gray-700">{notification.to}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200/50 pb-1">
                <span className="text-gray-400 font-bold uppercase text-[8px]">Canal / Conector:</span>
                <span className="text-gray-700 font-bold uppercase text-[9px]">{notification.type}</span>
              </div>
              <div className="border-b border-gray-200/50 pb-1">
                <span className="text-gray-400 font-bold uppercase text-[8px] block">Asunto:</span>
                <strong className="text-gris-azulado block text-[10px]">{notification.subject}</strong>
              </div>
              <div>
                <span className="text-gray-400 font-bold uppercase text-[8px] block">Cuerpo del Mensaje:</span>
                <p className="text-[10px] italic leading-relaxed mt-0.5">"{notification.body}"</p>
              </div>
            </div>
          </div>

          {/* SHAREPOINT LOG LEDGER */}
          <div className="bg-white border border-gray-200 rounded-xs p-4 shadow-xs space-y-3" id="sharepoint-ledger-box">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 flex items-center">
                <Database className="w-4 h-4 mr-1.5 text-cobre" />
                Libro de Trazabilidad Inmutable (SharePoint Ledger)
              </h4>
              <button
                onClick={() => setShowSharepointLogs(!showSharepointLogs)}
                className="text-gray-400 hover:text-cobre text-[10px] uppercase font-bold tracking-wider underline cursor-pointer"
              >
                {showSharepointLogs ? 'Ocultar Ledger' : 'Ver Ledger'}
              </button>
            </div>

            {showSharepointLogs && (
              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {sharepointLogs.map((log) => (
                  <div key={log.id} className="p-2.5 bg-gray-50 border border-gray-100 rounded-xs text-[10px] font-sans flex flex-col md:flex-row md:items-center justify-between gap-1">
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-gray-400 font-bold">{log.date}</span>
                        <span className="text-gray-300">|</span>
                        <span className="text-cobre font-extrabold uppercase text-[8px] bg-cobre/10 px-1.5 py-0.5 rounded-xs">{log.state}</span>
                      </div>
                      <p className="text-gray-700 font-medium leading-relaxed">{log.text}</p>
                    </div>
                    <span className="text-[9px] text-gray-400 shrink-0 font-mono italic md:text-right">
                      {log.actor}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Comparative Matrix & Calculator */}
        <div className="w-full lg:w-[360px] bg-white border-t lg:border-t-0 lg:border-l border-gray-200 shrink-0 flex flex-col overflow-y-auto p-4 md:p-5" id="right-panel">
          
          <div className="border-b border-gray-100 pb-2.5 mb-4">
            <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
              <FileSpreadsheet className="w-4 h-4 text-cobre" />
              Matriz Técnica de Oferentes
            </h4>
            <p className="text-[10px] text-gray-400 mt-1">Inspeccione las propuestas y ajuste calificaciones para recalcular el sello.</p>
          </div>

          {/* Supplier score list */}
          <div className="space-y-3 flex-1" id="suppliers-list">
            {activeDac?.suppliers?.map((sup) => {
              const isSelected = selectedSupplierId === sup.id;
              const currentScore = supplierScores[sup.id] ?? sup.score;
              const currentSeal = getSelloFromScore(currentScore);

              return (
                <div
                  key={sup.id}
                  onClick={() => setSelectedSupplierId(sup.id)}
                  className={`p-3 border rounded-xs shadow-3xs transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-cobre/5 border-cobre/50 ring-1 ring-cobre/10'
                      : 'bg-white border-gray-100 hover:border-cobre/20'
                  }`}
                  id={`supplier-card-${sup.id}`}
                >
                  <div className="flex items-center justify-between border-b border-gray-50 pb-1.5 mb-2 text-[10px] font-bold">
                    <span className="text-gray-700">{sup.name}</span>
                    <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold ${getSelloColor(currentSeal)}`}>
                      Sello {currentSeal}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-500 font-sans">
                    <div>
                      <span className="text-gray-400 block uppercase text-[8px] font-bold">RUT:</span>
                      <strong className="text-gray-700 font-mono">{sup.rut}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 block uppercase text-[8px] font-bold">Puntaje Técnico:</span>
                      <div className="flex items-center space-x-1">
                        <input
                          type="number"
                          value={currentScore}
                          onChange={(e) => handleUpdateSupplierScore(sup.id, parseInt(e.target.value) || 0)}
                          onClick={(e) => e.stopPropagation()}
                          disabled={currentState === 'CERRADO'}
                          className="w-12 px-1 py-0.5 border border-gray-200 rounded-sm font-extrabold text-gris-azulado text-center text-[10px]"
                        />
                        <span className="font-bold text-gray-700">%</span>
                      </div>
                    </div>
                  </div>

                  {isSelected && activeSupplier && (
                    <div className="mt-3 pt-2.5 border-t border-gray-100 space-y-2.5 text-[10px] text-gray-600 font-sans">
                      <div>
                        <span className="font-extrabold text-gray-400 uppercase text-[8px] block">Observaciones Evaluador:</span>
                        <p className="italic text-gray-500 mt-0.5">"{activeSupplier.comments}"</p>
                      </div>
                      <div className="space-y-1">
                        <span className="font-extrabold text-gray-400 uppercase text-[8px] block">Evidencias Adjuntadas:</span>
                        <div className="flex flex-col gap-1">
                          {activeSupplier.evidences.map(ev => (
                            <span key={ev} className="px-1.5 py-1 bg-gray-50 border border-gray-100 rounded-xs font-mono text-[9px] flex items-center justify-between">
                              <span className="truncate pr-1">{ev}</span>
                              <Paperclip className="w-3 h-3 text-cobre shrink-0" />
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* DYNAMIC AUTOMATED BUDGET CALCULATOR (HU-18) */}
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-3 bg-gray-50 p-3.5 rounded-xs border border-gray-100 font-sans shadow-3xs" id="budget-calculator">
            <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 flex items-center">
              <Calculator className="w-4 h-4 mr-1.5 text-cobre animate-pulse" />
              Presupuesto Automático (HU-18)
            </h4>
            <p className="text-[10px] text-gray-500 leading-normal">
              Cálculo de presupuesto parametrizado de acuerdo a las horas de evaluación por oferente técnico cotizadas en el proceso:
            </p>

            <div className="space-y-2 text-[10px] font-medium text-gray-600">
              <div className="flex justify-between items-center bg-white p-2 border border-gray-100 rounded">
                <span>Horas Base (por Oferente):</span>
                <span className="font-extrabold text-gris-azulado font-mono">{hhBase} HH</span>
              </div>

              <div className="flex justify-between items-center bg-white p-2 border border-gray-100 rounded">
                <span>Tarifa de Consultoría (USD/Hr):</span>
                <span className="font-extrabold text-gris-azulado font-mono">USD ${costPerHour}/Hr</span>
              </div>

              <div className="flex justify-between border-t border-gray-200 pt-2 font-bold text-cobre">
                <span>Total Horas Consolidadas:</span>
                <span>{budgetCalc.totalHh} HH</span>
              </div>

              <div className="flex justify-between font-extrabold text-xs text-emerald-700">
                <span>PRESUPUESTO ESTIMADO:</span>
                <span>USD ${budgetCalc.totalCost.toLocaleString('es-CL')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
