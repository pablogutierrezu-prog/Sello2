import React, { useState, useMemo } from 'react';
import { Finding, FindingState, UserRole, Comment, Log, Evidence } from '../types';
import {
  AlertTriangle,
  Search,
  Clock,
  ShieldCheck,
  CheckCircle,
  FileText,
  User,
  Send,
  Upload,
  ChevronRight,
  MessageSquare,
  History,
  X,
  FileSignature,
  FileX,
  Check
} from 'lucide-react';

interface HallazgosProps {
  key?: string | null;
  findings: Finding[];
  currentRole: UserRole;
  selectedFindingId: string | null;
  onSelectFinding: (id: string | null) => void;
  onUpdateFindingState: (id: string, newState: FindingState) => void;
  onAddFindingComment: (id: string, comment: Comment) => void;
  onAddFindingEvidence: (id: string, file: Evidence) => void;
  onUpdateFindingPlan: (id: string, plan: string, internal: string, email: string, date: string) => void;
  onAddFindingLog: (id: string, log: Log) => void;
}

export default function HallazgosView({
  findings,
  currentRole,
  selectedFindingId,
  onSelectFinding,
  onUpdateFindingState,
  onAddFindingComment,
  onAddFindingEvidence,
  onUpdateFindingPlan,
  onAddFindingLog
}: HallazgosProps) {
  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterState, setFilterState] = useState<string>('ALL');
  const [filterCriticidad, setFilterCriticidad] = useState<string>('ALL');

  // Active finding select
  const activeFinding = findings.find(f => f.id === selectedFindingId) || null;

  // New Comment input
  const [newCommentText, setNewCommentText] = useState('');
  // New Mitigation Plan fields (local state for edits)
  const [mitigationText, setMitigationText] = useState(activeFinding?.mitigationPlan || '');
  const [respName, setRespName] = useState(activeFinding?.responsibleInternal || '');
  const [respEmail, setRespEmail] = useState(activeFinding?.responsibleEmail || '');
  const [propDate, setPropDate] = useState(activeFinding?.proposedDate || '');
  const [isEditingPlan, setIsEditingPlan] = useState(false);

  // Review Reject reason
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectBox, setShowRejectBox] = useState(false);

  // SLA Calculation help
  const getSlaDetails = (criticidad: string, limitStr: string, state: string) => {
    if (state === 'CORREGIDO' || state === 'NO APLICA' || state === 'ACEPTACIÓN DE RIESGO') {
      return { text: 'Cumplido', color: 'text-verde-petroleo bg-emerald-50 border-verde-petroleo/20', isOverdue: false };
    }

    const today = new Date('2026-06-23'); // Reference date
    const limit = new Date(limitStr);
    const diffTime = limit.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: `Vencido hace ${Math.abs(diffDays)} días`, color: 'text-granate bg-red-50 border-granate/20 font-bold', isOverdue: true };
    } else if (diffDays <= 1) {
      return { text: 'Vence mañana (URGENTE) 🚨', color: 'text-granate bg-red-50 border-granate/20 font-bold', isOverdue: true };
    } else if (diffDays <= 5) {
      return { text: `Vence en ${diffDays} días (URGENTE)`, color: 'text-cobre bg-orange-50 border-cobre/20 font-semibold', isOverdue: false };
    } else {
      return { text: `Vence en ${diffDays} días`, color: 'text-gray-500 bg-gray-50 border-gray-200', isOverdue: false };
    }
  };

  // State colors
  const getFindingStateColor = (state: FindingState) => {
    switch (state) {
      case 'NUEVO':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'EN CORRECCIÓN':
        return 'bg-blue-50 text-azul border-azul/20';
      case 'EN REVISIÓN CORRECCIÓN':
        return 'bg-amber-50 text-oro border-oro/20';
      case 'CORREGIDO':
        return 'bg-emerald-50 text-verde-petroleo border-verde-petroleo/20';
      case 'ACEPTACIÓN DE RIESGO':
        return 'bg-amber-50 text-cobre border-cobre/20';
      case 'NO APLICA':
        return 'bg-gray-100 text-gray-500 border-gray-300';
      default:
        return 'bg-gray-50 text-gray-600';
    }
  };

  // Criticidad Badge
  const getCritColor = (crit: string) => {
    switch (crit) {
      case 'CRÍTICA':
        return 'bg-granate text-white font-bold';
      case 'ALTA':
        return 'bg-cobre text-white';
      case 'MEDIA':
        return 'bg-oro text-white';
      case 'BAJA':
        return 'bg-verde-petroleo text-white';
      default:
        return 'bg-gray-400 text-white';
    }
  };

  // Row Level Security (RLS) Filtering
  const filteredFindings = useMemo(() => {
    return findings.filter(f => {
      // JP only sees their own findings
      const matchesRls = (currentRole === 'RESP_CIBER_HALLAZGOS' || currentRole === 'ADMIN') || f.email === 'jperez@codelco.cl';

      // Search term
      const matchesSearch = 
        f.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.dacId.includes(searchTerm);

      // State filter
      const matchesState = filterState === 'ALL' || f.state === filterState;

      // Severity filter
      const matchesCrit = filterCriticidad === 'ALL' || f.criticidad === filterCriticidad;

      return matchesRls && matchesSearch && matchesState && matchesCrit;
    });
  }, [findings, currentRole, searchTerm, filterState, filterCriticidad]);

  // Handle Comment submit
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !activeFinding) return;

    const authorName = currentRole === 'JP' ? 'Juan Pérez' 
      : currentRole === 'RESP_CIBER_HALLAZGOS' ? 'Resp. Ciberseguridad de Hallazgos'
      : currentRole === 'ADMIN' ? 'Administrador'
      : 'Especialista Ciberseguridad';

    const commentObj: Comment = {
      id: `c_${Date.now()}`,
      author: authorName,
      role: currentRole,
      text: newCommentText,
      date: new Date().toLocaleString('es-CL', { hour12: false })
    };

    onAddFindingComment(activeFinding.id, commentObj);
    
    // Add activity log
    onAddFindingLog(activeFinding.id, {
      id: `log_${Date.now()}`,
      date: new Date().toLocaleString('es-CL', { hour12: false }),
      text: `Usuario ingresó un nuevo comentario en el hilo.`,
      user: activeFinding.email
    });

    setNewCommentText('');
  };

  // Handle Evidence upload simulation
  const handleUploadMockEvidence = () => {
    if (!activeFinding) return;

    const randomNum = Math.floor(Math.random() * 900) + 100;
    const fileObj: Evidence = {
      id: `e_${Date.now()}`,
      name: `Evidence_Corrective_Action_H${randomNum}.pdf`,
      url: '#',
      uploadDate: new Date().toLocaleString('es-CL', { hour12: false }),
      state: 'En revisión'
    };

    onAddFindingEvidence(activeFinding.id, fileObj);
    onUpdateFindingState(activeFinding.id, 'EN REVISIÓN CORRECCIÓN');

    onAddFindingLog(activeFinding.id, {
      id: `log_${Date.now()}`,
      date: new Date().toLocaleString('es-CL', { hour12: false }),
      text: `JP cargó una nueva evidencia de corrección: ${fileObj.name}. Estado cambió a EN REVISIÓN CORRECCIÓN.`,
      user: 'jperez@codelco.cl'
    });
  };

  // Handle Mitigation plan save
  const handleSavePlan = () => {
    if (!activeFinding) return;
    onUpdateFindingPlan(activeFinding.id, mitigationText, respName, respEmail, propDate);
    onUpdateFindingState(activeFinding.id, 'EN CORRECCIÓN');
    setIsEditingPlan(false);

    onAddFindingLog(activeFinding.id, {
      id: `log_${Date.now()}`,
      date: new Date().toLocaleString('es-CL', { hour12: false }),
      text: `JP configuró Plan de Mitigación. Responsable: ${respName}. Fecha propuesta: ${propDate}. Estado cambió a EN CORRECCIÓN.`,
      user: 'jperez@codelco.cl'
    });
  };

  // Revisor Action: Approve
  const handleApproveMitigation = () => {
    if (!activeFinding) return;
    onUpdateFindingState(activeFinding.id, 'CORREGIDO');

    // Update state of evidences to Approved
    activeFinding.evidences.forEach(ev => {
      if (ev.state === 'En revisión') ev.state = 'Aprobado';
    });

    onAddFindingLog(activeFinding.id, {
      id: `log_${Date.now()}`,
      date: new Date().toLocaleString('es-CL', { hour12: false }),
      text: `Ciberseguridad validó y APROBÓ las evidencias de corrección. Hallazgo cerrado como CORREGIDO.`,
      user: 'revisor.ciber@codelco.cl'
    });
  };

  // Revisor Action: Reject
  const handleRejectMitigation = () => {
    if (!activeFinding || !rejectReason.trim()) return;
    onUpdateFindingState(activeFinding.id, 'EN CORRECCIÓN');

    // Reject evidence
    const lastRev = activeFinding.evidences.filter(e => e.state === 'En revisión');
    if (lastRev.length > 0) {
      lastRev[lastRev.length - 1].state = 'Rechazado';
      lastRev[lastRev.length - 1].comment = rejectReason;
    }

    onAddFindingLog(activeFinding.id, {
      id: `log_${Date.now()}`,
      date: new Date().toLocaleString('es-CL', { hour12: false }),
      text: `Ciberseguridad RECHAZÓ las evidencias de corrección. Motivo: "${rejectReason}". Estado regresó a EN CORRECCIÓN.`,
      user: 'revisor.ciber@codelco.cl'
    });

    // Append comment automatically
    onAddFindingComment(activeFinding.id, {
      id: `c_${Date.now()}`,
      author: 'Revisor Ciberseguridad',
      role: 'REVISOR',
      text: `Evidencia rechazada: ${rejectReason}`,
      date: new Date().toLocaleString('es-CL', { hour12: false })
    });

    setRejectReason('');
    setShowRejectBox(false);
  };

  // Action: Risk waiver (Aceptación de riesgo)
  const handleRiskWaiverUpload = () => {
    if (!activeFinding) return;
    onUpdateFindingState(activeFinding.id, 'ACEPTACIÓN DE RIESGO');

    onAddFindingLog(activeFinding.id, {
      id: `log_${Date.now()}`,
      date: new Date().toLocaleString('es-CL', { hour12: false }),
      text: `JP cargó Carta de Aceptación de Riesgo formal (Waiver). Firmas obtenidas. Hallazgo clasificado como ACEPTACIÓN DE RIESGO.`,
      user: 'jperez@codelco.cl'
    });
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] w-full overflow-hidden text-xs bg-gray-50" id="hallazgos-view">
      
      {/* LEFT COLUMN: Findings list */}
      <div className="w-full lg:w-96 bg-white border-b lg:border-b-0 lg:border-r border-crema/20 shrink-0 overflow-y-auto flex flex-col p-4 md:p-6">
        <div className="border-b border-gray-100 pb-3 mb-4">
          <h3 className="text-xs font-bold text-gris-azulado font-display uppercase tracking-widest leading-tight">
            Hallazgos de Seguridad
          </h3>
          <span className="text-[10px] text-gray-400 block mt-1 leading-none">
            {filteredFindings.length} Registros detectados
          </span>
        </div>

        {/* Filters */}
        <div className="space-y-2 mb-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por ID, título..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-crema/30 rounded-sm text-[11px] focus:outline-none focus:border-cobre bg-surface-custom/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <select
              value={filterState}
              onChange={(e) => setFilterState(e.target.value)}
              className="w-full p-1.5 border border-crema/30 rounded-sm bg-white text-[10px] font-semibold cursor-pointer focus:outline-none"
            >
              <option value="ALL">TODOS ESTADOS</option>
              <option value="NUEVO">NUEVO</option>
              <option value="EN CORRECCIÓN">EN CORRECCIÓN</option>
              <option value="EN REVISIÓN CORRECCIÓN">EN REVISIÓN</option>
              <option value="CORREGIDO">CORREGIDO</option>
              <option value="ACEPTACIÓN DE RIESGO">ACEPTACIÓN RIESGO</option>
              <option value="NO APLICA">NO APLICA</option>
            </select>

            <select
              value={filterCriticidad}
              onChange={(e) => setFilterCriticidad(e.target.value)}
              className="w-full p-1.5 border border-crema/30 rounded-sm bg-white text-[10px] font-semibold cursor-pointer focus:outline-none"
            >
              <option value="ALL">CRITICIDAD</option>
              <option value="CRÍTICA">🔴 CRÍTICA</option>
              <option value="ALTA">🟠 ALTA</option>
              <option value="MEDIA">🟡 MEDIA</option>
              <option value="BAJA">🟢 BAJA</option>
            </select>
          </div>
        </div>

        {/* Scrollable list items */}
        <div className="space-y-2.5 flex-1 overflow-y-auto">
          {filteredFindings.length === 0 ? (
            <div className="text-center py-12 text-gray-400 font-sans">
              <AlertTriangle className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="font-semibold text-xs">No hay hallazgos para mostrar</p>
            </div>
          ) : (
            filteredFindings.map((f) => {
              const isSelected = activeFinding?.id === f.id;
              const sla = getSlaDetails(f.criticidad, f.limitDate, f.state);
              return (
                <button
                  key={f.id}
                  onClick={() => {
                    onSelectFinding(f.id);
                    setIsEditingPlan(false);
                    // Load current values
                    setMitigationText(f.mitigationPlan || '');
                    setRespName(f.responsibleInternal || '');
                    setRespEmail(f.responsibleEmail || '');
                    setPropDate(f.proposedDate || '');
                  }}
                  className={`w-full text-left p-3.5 border rounded-sm shadow-3xs transition-all focus:outline-none block ${
                    isSelected
                      ? 'bg-cobre/5 border-cobre'
                      : 'bg-white border-crema/10 hover:border-cobre/30'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1.5 border-b border-gray-100 pb-1.5 mb-1.5 text-[10px] font-bold">
                    <span className="text-cobre font-sans">{f.id.includes('-H') && f.id.indexOf('-H') === 8 ? `${f.id.slice(0, 4)}-${f.id.slice(4, 8)}${f.id.slice(8)}` : f.id}</span>
                    <span className={`px-2 py-0.5 rounded-sm uppercase ${getFindingStateColor(f.state)}`}>
                      {f.state}
                    </span>
                  </div>

                  <h4 className="font-display font-bold text-gray-800 text-[11px] leading-tight break-words truncate">
                    {f.title}
                  </h4>

                  <div className="flex items-center justify-between mt-3 text-[10px] font-semibold">
                    <span className={`px-2 py-0.5 rounded-sm uppercase font-bold text-[9px] ${getCritColor(f.criticidad)}`}>
                      {f.criticidad}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded-sm border ${sla.color} font-sans`}>
                      {sla.text}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Finding Detail Overview */}
      {activeFinding ? (
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
          {/* Main info card */}
          <div className="bg-white border border-crema/20 p-5 rounded-sm shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3 mb-4 text-xs font-bold font-sans">
              <div className="flex items-center space-x-2">
                <span className="text-cobre text-sm">{activeFinding.id.includes('-H') && activeFinding.id.indexOf('-H') === 8 ? `${activeFinding.id.slice(0, 4)}-${activeFinding.id.slice(4, 8)}${activeFinding.id.slice(8)}` : activeFinding.id}</span>
                <span className="text-gray-300">|</span>
                <span className="text-gray-500 font-sans">Asociado a DAC: {activeFinding.dacId.length === 8 ? `${activeFinding.dacId.slice(0, 4)}-${activeFinding.dacId.slice(4)}` : activeFinding.dacId}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-0.5 rounded-full border text-[10px] uppercase font-bold ${getFindingStateColor(activeFinding.state)}`}>
                  {activeFinding.state}
                </span>
                <span className={`px-2.5 py-0.5 rounded-sm text-[10px] font-bold ${getCritColor(activeFinding.criticidad)}`}>
                  {activeFinding.criticidad}
                </span>
              </div>
            </div>

            <h2 className="text-base font-bold font-display text-gris-azulado uppercase tracking-wide leading-tight">
              {activeFinding.title}
            </h2>
            <p className="text-xs text-gray-600 font-sans mt-2.5 leading-relaxed bg-surface-custom/30 p-3.5 border border-crema/10 rounded-sm">
              {activeFinding.description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-[11px] text-gray-500 font-sans">
              <div className="space-y-1">
                <span>Origen del Reporte:</span>
                <strong className="text-gray-700 block">{activeFinding.origin}</strong>
              </div>
              <div className="space-y-1">
                <span>JP Asignado:</span>
                <strong className="text-gray-700 block">{activeFinding.assignedTo} ({activeFinding.email})</strong>
              </div>
            </div>
          </div>

          {/* SLA Targets & Recommendation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-crema/20 p-5 rounded-sm shadow-sm space-y-3.5">
              <h3 className="text-xs font-bold text-gris-azulado font-display uppercase tracking-wider border-b border-gray-100 pb-2 flex items-center">
                <Clock className="w-4 h-4 mr-2 text-cobre" />
                Vencimiento y SLA Oficial
              </h3>
              <div className="text-xs space-y-2 font-sans text-gray-600">
                <div className="flex justify-between border-b border-gray-50 pb-1">
                  <span>Fecha Límite (SLA):</span>
                  <strong className="text-gray-800">{activeFinding.limitDate}</strong>
                </div>
                <div className="flex justify-between border-b border-gray-50 pb-1">
                  <span>Plazo de Corrección:</span>
                  <strong className="text-gray-800">
                    {activeFinding.criticidad === 'CRÍTICA' ? '5 Días Hábiles' : activeFinding.criticidad === 'ALTA' ? '10 Días Hábiles' : '15 Días Hábiles'}
                  </strong>
                </div>
                <div className="flex justify-between items-center">
                  <span>Estado de SLA:</span>
                  <span className={`px-2 py-0.5 rounded-sm border ${getSlaDetails(activeFinding.criticidad, activeFinding.limitDate, activeFinding.state).color} font-bold`}>
                    {getSlaDetails(activeFinding.criticidad, activeFinding.limitDate, activeFinding.state).text}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-crema/20 p-5 rounded-sm shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-gris-azulado font-display uppercase tracking-wider border-b border-gray-100 pb-2 flex items-center">
                <ShieldCheck className="w-4 h-4 mr-2 text-verde-petroleo" />
                Recomendación de Remediación
              </h3>
              <p className="text-xs text-gray-600 font-sans leading-relaxed">
                {activeFinding.recommendation}
              </p>
            </div>
          </div>

          {/* Plan de Mitigación (Editable by JP) */}
          <div className="bg-white border border-crema/20 p-5 rounded-sm shadow-sm space-y-4">
            <div className="border-b border-gray-100 pb-2 flex justify-between items-center">
              <h3 className="text-xs font-bold text-gris-azulado font-display uppercase tracking-wider flex items-center">
                <FileText className="w-4 h-4 mr-2 text-cobre" />
                Plan de Mitigación / Acción
              </h3>
              {!isEditingPlan && (activeFinding.state === 'NUEVO' || activeFinding.state === 'EN CORRECCIÓN') && (currentRole === 'JP' || currentRole === 'ADMIN') && (
                <button
                  onClick={() => {
                    setIsEditingPlan(true);
                    setMitigationText(activeFinding.mitigationPlan || '');
                    setRespName(activeFinding.responsibleInternal || '');
                    setRespEmail(activeFinding.responsibleEmail || '');
                    setPropDate(activeFinding.proposedDate || '');
                  }}
                  className="text-cobre font-bold uppercase text-[10px] tracking-wider hover:underline focus:outline-none"
                >
                  📝 Configurar Plan
                </button>
              )}
            </div>

            {isEditingPlan ? (
              <div className="space-y-4 font-sans text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-gray-600">Descripción del Plan de Acción</label>
                  <textarea
                    rows={3}
                    placeholder="Describa los pasos y configuraciones que aplicará para mitigar este hallazgo..."
                    value={mitigationText}
                    onChange={(e) => setMitigationText(e.target.value)}
                    className="w-full px-3 py-2 border border-crema/30 rounded-sm bg-white text-xs focus:outline-none focus:border-cobre"
                  ></textarea>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-600">Responsable Interno</label>
                    <input
                      type="text"
                      placeholder="Nombre del técnico"
                      value={respName}
                      onChange={(e) => setRespName(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-crema/30 rounded-sm bg-white text-xs focus:outline-none focus:border-cobre"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-gray-600">Email de Contacto</label>
                    <input
                      type="email"
                      placeholder="email@codelco.cl"
                      value={respEmail}
                      onChange={(e) => setRespEmail(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-crema/30 rounded-sm bg-white text-xs focus:outline-none focus:border-cobre"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-gray-600">Fecha Estimada Solución</label>
                    <input
                      type="date"
                      value={propDate}
                      onChange={(e) => setPropDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-crema/30 rounded-sm bg-white text-xs focus:outline-none focus:border-cobre"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setIsEditingPlan(false)}
                    className="px-3 py-1.5 border border-gray-300 rounded-sm text-[10px] font-bold uppercase font-display"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSavePlan}
                    className="px-4 py-1.5 bg-cobre text-white rounded-sm text-[10px] font-bold uppercase font-display"
                  >
                    Guardar Plan
                  </button>
                </div>
              </div>
            ) : activeFinding.mitigationPlan ? (
              <div className="space-y-2 text-xs font-sans text-gray-600 leading-relaxed">
                <p className="font-medium bg-gray-50 p-3 rounded-sm border border-gray-100">
                  {activeFinding.mitigationPlan}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] pt-1">
                  <span>Responsable: <strong>{activeFinding.responsibleInternal}</strong></span>
                  <span>Email: <strong>{activeFinding.responsibleEmail}</strong></span>
                  <span>Propuesto para: <strong>{activeFinding.proposedDate}</strong></span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic font-sans py-2">
                No se ha configurado un plan de acción para este hallazgo.
              </p>
            )}
          </div>

          {/* Evidencias de Corrección */}
          <div className="bg-white border border-crema/20 p-5 rounded-sm shadow-sm space-y-4">
            <div className="border-b border-gray-100 pb-2 flex justify-between items-center">
              <h3 className="text-xs font-bold text-gris-azulado font-display uppercase tracking-wider flex items-center">
                <Upload className="w-4 h-4 mr-2 text-cobre" />
                Evidencias de Remediación
              </h3>
              {(activeFinding.state === 'NUEVO' || activeFinding.state === 'EN CORRECCIÓN') && (currentRole === 'JP' || currentRole === 'ADMIN') && (
                <button
                  onClick={handleUploadMockEvidence}
                  className="bg-cobre hover:bg-cobre-oscuro text-white px-3.5 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-wider font-display flex items-center shadow-3xs focus:outline-none"
                >
                  <Upload className="w-3.5 h-3.5 mr-1" />
                  Cargar Evidencia
                </button>
              )}
            </div>

            <div className="space-y-2.5">
              {activeFinding.evidences.length === 0 ? (
                <p className="text-xs text-gray-400 italic font-sans py-2">
                  No se han cargado evidencias de corrección aún para este hallazgo.
                </p>
              ) : (
                activeFinding.evidences.map(ev => (
                  <div key={ev.id} className="border border-gray-100 p-3.5 rounded-sm bg-white shadow-3xs flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs font-sans">
                      <div className="flex items-center min-w-0">
                        <FileText className="w-4 h-4 text-cobre mr-2 shrink-0" />
                        <span className="font-bold text-gray-700 truncate">{ev.name}</span>
                        <span className="text-[10px] text-gray-400 ml-2">({ev.uploadDate})</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        ev.state === 'Aprobado' ? 'bg-emerald-50 text-verde-petroleo' : ev.state === 'Rechazado' ? 'bg-red-50 text-granate' : 'bg-amber-50 text-oro'
                      }`}>
                        {ev.state}
                      </span>
                    </div>

                    {ev.comment && (
                      <p className="text-[11px] text-granate bg-red-50/50 p-2 rounded-sm border border-red-100 italic">
                        <strong>Motivo de rechazo Ciberseguridad:</strong> "{ev.comment}"
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* WAIVER / RISK WAIVER SIMULATION BUTTON */}
            {(activeFinding.state === 'NUEVO' || activeFinding.state === 'EN CORRECCIÓN') && (currentRole === 'JP' || currentRole === 'ADMIN') && (
              <div className="bg-surface-custom border border-crema/20 p-4 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-sans">
                <div>
                  <h4 className="font-bold text-cobre uppercase font-display text-[11px]">¿No es posible remediar técnicamente este hallazgo?</h4>
                  <p className="text-gray-500 font-sans mt-0.5">Puedes cargar la Carta de Aceptación de Riesgo formal (Waiver firmado por Gerencia) para avanzar.</p>
                </div>
                <button
                  onClick={handleRiskWaiverUpload}
                  className="bg-gris-azulado hover:bg-black text-white px-4 py-2 rounded-sm text-[10px] font-bold uppercase tracking-wider font-display shrink-0 flex items-center justify-center focus:outline-none"
                >
                  <FileSignature className="w-4 h-4 mr-1.5 text-crema" />
                  Cargar Carta Riesgo
                </button>
              </div>
            )}
          </div>

          {/* CONSOLE FOR REVISOR DECISION */}
          {(currentRole === 'RESP_CIBER_HALLAZGOS' || currentRole === 'ADMIN') && activeFinding.state === 'EN REVISIÓN CORRECCIÓN' && (
            <div className="bg-white border-2 border-verde-petroleo/30 p-5 rounded-sm shadow-md space-y-4">
              <h3 className="text-xs font-bold text-verde-petroleo font-display uppercase tracking-wider flex items-center border-b border-gray-100 pb-2">
                <CheckCircle className="w-5 h-5 mr-2 text-verde-petroleo" />
                Consola de Evaluación de Evidencias - Ciberseguridad
              </h3>
              <p className="text-xs text-gray-600 font-sans">
                Como Responsable de Ciberseguridad de Hallazgos, evalúe las evidencias provistas por el JP y apruebe para cerrar el hallazgo, o rechace solicitando ajustes.
              </p>

              {showRejectBox ? (
                <div className="space-y-2 text-xs font-sans animate-fade-in">
                  <label className="font-bold text-gray-700 block">Escriba el motivo técnico del rechazo:</label>
                  <textarea
                    rows={2}
                    placeholder="Ej: El screenshot no valida la IP del servidor de producción o falta validar..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full px-3 py-2 border border-crema/30 rounded-sm text-xs focus:outline-none"
                  ></textarea>
                  <div className="flex space-x-2 justify-end">
                    <button
                      onClick={() => setShowRejectBox(false)}
                      className="px-3 py-1.5 border border-gray-300 rounded-sm font-semibold uppercase text-[10px] font-display"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleRejectMitigation}
                      className="px-4 py-1.5 bg-granate text-white rounded-sm font-bold uppercase text-[10px] font-display"
                    >
                      Enviar Rechazo
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex space-x-3 justify-end">
                  <button
                    onClick={() => setShowRejectBox(true)}
                    className="px-4 py-2 border border-granate text-granate hover:bg-red-50 rounded-sm text-xs font-bold uppercase tracking-wider font-display flex items-center shadow-3xs"
                  >
                    <FileX className="w-4 h-4 mr-1.5" />
                    Rechazar Evidencias
                  </button>
                  <button
                    onClick={handleApproveMitigation}
                    className="px-5 py-2 bg-verde-petroleo hover:bg-emerald-900 text-white rounded-sm text-xs font-bold uppercase tracking-wider font-display flex items-center shadow-md cursor-pointer"
                  >
                    <Check className="w-4 h-4 mr-1.5" />
                    Aprobar y Cerrar Hallazgo
                  </button>
                </div>
              )}
            </div>
          )}

          {/* HISTORIAL / AUDIT TRAIL TIMELINE */}
          <div className="bg-white border border-crema/20 p-5 rounded-sm shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-gris-azulado font-display uppercase tracking-wider border-b border-gray-100 pb-2 flex items-center">
              <History className="w-4 h-4 mr-2 text-cobre" />
              Historial de Auditoría e Hitos
            </h3>

            <div className="space-y-4 relative pl-4 border-l border-gray-100">
              {activeFinding.logs.map(log => (
                <div key={log.id} className="relative text-xs font-sans text-gray-600">
                  {/* Dot on timeline */}
                  <span className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 bg-cobre rounded-full border-2 border-white shadow-3xs"></span>
                  <div className="flex items-center justify-between text-[10px] font-semibold text-gray-400 mb-0.5">
                    <span>{log.date}</span>
                    <span>Modificó: {log.user}</span>
                  </div>
                  <p className="font-semibold text-gray-700 font-sans">{log.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* COMENTARIOS HILO INTERACTIVO */}
          <div className="bg-white border border-crema/20 p-5 rounded-sm shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-gris-azulado font-display uppercase tracking-wider border-b border-gray-100 pb-2 flex items-center">
              <MessageSquare className="w-4 h-4 mr-2 text-cobre" />
              Hilo de Coordinación y Comentarios ({activeFinding.comments.length})
            </h3>

            <div className="space-y-3.5 divide-y divide-gray-50 max-h-96 overflow-y-auto">
              {activeFinding.comments.map(comm => (
                <div key={comm.id} className="pt-3.5 first:pt-0">
                  <div className="flex items-center justify-between text-[10px] font-bold mb-1.5 font-sans">
                    <span className="text-gris-azulado flex items-center">
                      <User className="w-3.5 h-3.5 text-cobre mr-1" />
                      {comm.author} ({comm.role})
                    </span>
                    <span className="text-gray-400 font-sans">{comm.date}</span>
                  </div>
                  <p className="text-xs text-gray-600 font-sans leading-relaxed bg-gray-50/50 p-2.5 rounded-sm border border-gray-100/30">
                    {comm.text}
                  </p>
                </div>
              ))}
            </div>

            {/* Comment Form */}
            <form onSubmit={handleAddComment} className="flex gap-2 pt-3 border-t border-gray-100">
              <input
                type="text"
                placeholder="Escriba un comentario o aclaración técnica..."
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                className="flex-1 px-3 py-2 border border-crema/30 rounded-sm text-xs focus:outline-none focus:border-cobre bg-surface-custom/20 focus:bg-white"
              />
              <button
                type="submit"
                className="bg-cobre hover:bg-cobre-oscuro text-white px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-wider font-display flex items-center shadow-xs focus:outline-none shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-gray-400 font-sans">
          <AlertTriangle className="w-16 h-16 text-gray-300 mb-3" />
          <p className="font-bold text-sm uppercase font-display text-gris-azulado">Seleccione un Hallazgo</p>
          <p className="text-xs text-gray-400 mt-1 max-w-sm text-center">
            Escoja un hallazgo de la lista de la izquierda para ver su detalle, definir el plan de mitigación, cargar evidencias de remediación o auditar su historial completo.
          </p>
        </div>
      )}
    </div>
  );
}
