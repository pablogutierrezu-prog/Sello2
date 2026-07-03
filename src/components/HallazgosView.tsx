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
  Check,
  BarChart2,
  TrendingUp,
  Download,
  Mail,
  Calendar,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Sparkles,
  Info
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
  onUpdateFindingFields?: (id: string, fields: Partial<Finding>) => void;
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
  onAddFindingLog,
  onUpdateFindingFields
}: HallazgosProps) {
  // Main control states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterState, setFilterState] = useState<string>('ALL');
  const [filterCriticidad, setFilterCriticidad] = useState<string>('ALL');
  const [filterDac, setFilterDac] = useState<string>('ALL');
  const [filterOrigin, setFilterOrigin] = useState<string>('ALL');
  
  // Custom toggles
  const [showOverdueOnly, setShowOverdueOnly] = useState(false);
  const [showNext7DaysOnly, setShowNext7DaysOnly] = useState(false);
  
  // Metrics & Export modal toggles
  const [showMetricsModal, setShowMetricsModal] = useState(false);
  const [showNotificationToast, setShowNotificationToast] = useState<string | null>(null);

  // Active finding select
  const activeFinding = findings.find(f => f.id === selectedFindingId) || null;

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Form states for JP mitigation
  const [activeIntention, setActiveIntention] = useState<'REMEDIAR' | 'NO_REMEDIAR' | 'NO_APLICA'>(
    activeFinding?.intention === 'NO_REMEDIAR' ? 'NO_REMEDIAR' : 
    activeFinding?.intention === 'NO_APLICA' ? 'NO_APLICA' : 'REMEDIAR'
  );
  
  const [mitigationText, setMitigationText] = useState(activeFinding?.mitigationPlan || '');
  const [respName, setRespName] = useState(activeFinding?.responsibleInternal || '');
  const [respEmail, setRespEmail] = useState(activeFinding?.responsibleEmail || '');
  const [propDate, setPropDate] = useState(activeFinding?.proposedDate || '');
  const [noRemediarReason, setNoRemediarReason] = useState('');
  const [noAplicaReason, setNoAplicaReason] = useState('');
  const [isEditingPlan, setIsEditingPlan] = useState(false);

  // Revisor validation states
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');

  // Local state helper to reload values when active finding changes
  React.useEffect(() => {
    if (activeFinding) {
      setMitigationText(activeFinding.mitigationPlan || '');
      setRespName(activeFinding.responsibleInternal || '');
      setRespEmail(activeFinding.responsibleEmail || '');
      setPropDate(activeFinding.proposedDate || '');
      setActiveIntention(
        activeFinding.intention === 'NO_REMEDIAR' ? 'NO_REMEDIAR' : 
        activeFinding.intention === 'NO_APLICA' ? 'NO_APLICA' : 'REMEDIAR'
      );
      setNoRemediarReason(activeFinding.intention === 'NO_REMEDIAR' ? activeFinding.mitigationPlan || '' : '');
      setNoAplicaReason(activeFinding.intention === 'NO_APLICA' ? activeFinding.mitigationPlan || '' : '');
      setIsEditingPlan(false);
      setShowRejectBox(false);
      setRejectReason('');
    }
  }, [selectedFindingId, activeFinding]);

  // SLA Calculation helper
  const getDaysDiff = (limitDateStr: string) => {
    const today = new Date('2026-06-23'); // Official alignment reference date from mockup
    const limitDate = new Date(limitDateStr);
    const diffTime = limitDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getSlaDetails = (criticidad: string, limitStr: string, state: string) => {
    if (state === 'CORREGIDO' || state === 'NO APLICA' || state === 'ACEPTACIÓN DE RIESGO') {
      return { text: 'Cumplido', color: 'text-verde-petroleo bg-emerald-50 border-emerald-100', isOverdue: false, days: 0 };
    }

    const diffDays = getDaysDiff(limitStr);

    if (diffDays < 0) {
      return { text: `Vencido hace ${Math.abs(diffDays)} días`, color: 'text-granate bg-red-50 border-red-200 font-bold', isOverdue: true, days: diffDays };
    } else if (diffDays === 0) {
      return { text: 'Vence hoy (URGENTE) 🚨', color: 'text-granate bg-red-50 border-red-200 font-bold', isOverdue: true, days: diffDays };
    } else if (diffDays === 1) {
      return { text: 'Vence mañana (URGENTE) 🚨', color: 'text-granate bg-red-50 border-red-200 font-bold', isOverdue: true, days: diffDays };
    } else if (diffDays <= 5) {
      return { text: `Vence en ${diffDays} días (URGENTE)`, color: 'text-cobre bg-orange-50 border-orange-200 font-semibold', isOverdue: false, days: diffDays };
    } else {
      return { text: `Vence en ${diffDays} días`, color: 'text-gray-500 bg-gray-50 border-gray-200', isOverdue: false, days: diffDays };
    }
  };

  // State Color map
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
        return 'bg-amber-100 text-cobre border-cobre/30';
      case 'NO APLICA':
        return 'bg-gray-100 text-gray-500 border-gray-300';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  // Criticidad Badge Color map
  const getCritColor = (crit: string) => {
    switch (crit) {
      case 'CRÍTICA':
        return 'bg-granate text-white font-bold';
      case 'ALTA':
        return 'bg-cobre text-white font-semibold';
      case 'MEDIA':
        return 'bg-oro text-white';
      case 'BAJA':
        return 'bg-verde-petroleo text-white';
      default:
        return 'bg-gray-400 text-white';
    }
  };

  // Dynamic values parsed for select filters
  const uniqueDacs = useMemo(() => {
    return Array.from(new Set(findings.map(f => f.dacId))).sort();
  }, [findings]);

  const uniqueOrigins = useMemo(() => {
    return Array.from(new Set(findings.map(f => f.origin))).sort();
  }, [findings]);

  // SLA Days allocation according to official table
  const getSlaLimitDays = (crit: string) => {
    switch (crit) {
      case 'CRÍTICA': return 5;
      case 'ALTA': return 10;
      case 'MEDIA': return 15;
      case 'BAJA': return 20;
      default: return 15;
    }
  };

  // 1. FILTER & SORT PROCESS (SLA logic & RLS applied)
  const filteredFindings = useMemo(() => {
    let result = findings.filter(f => {
      // Row Level Security (RLS): JP role only sees findings assigned to Juan Pérez
      const matchesRls = (currentRole !== 'JP') || f.email === 'jperez@codelco.cl';

      // General Text Search
      const matchesSearch = 
        f.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.dacId.includes(searchTerm);

      // Criteria selectors
      const matchesState = filterState === 'ALL' || f.state === filterState;
      const matchesCrit = filterCriticidad === 'ALL' || f.criticidad === filterCriticidad;
      const matchesDac = filterDac === 'ALL' || f.dacId === filterDac;
      const matchesOrigin = filterOrigin === 'ALL' || f.origin === filterOrigin;

      // Special helper toggles
      const diffDays = getDaysDiff(f.limitDate);
      const isClosed = f.state === 'CORREGIDO' || f.state === 'NO APLICA' || f.state === 'ACEPTACIÓN DE RIESGO';
      
      const matchesOverdue = !showOverdueOnly || (!isClosed && diffDays < 0);
      const matchesNext7Days = !showNext7DaysOnly || (!isClosed && diffDays >= 0 && diffDays <= 7);

      return matchesRls && matchesSearch && matchesState && matchesCrit && matchesDac && matchesOrigin && matchesOverdue && matchesNext7Days;
    });

    // 2. SORTING CRITERIA: Criticidad ▼ (CRÍTICA, ALTA, MEDIA, BAJA) | Fecha límite ▲
    const critWeights = { 'CRÍTICA': 4, 'ALTA': 3, 'MEDIA': 2, 'BAJA': 1 };
    return result.sort((a, b) => {
      const weightA = critWeights[a.criticidad] || 0;
      const weightB = critWeights[b.criticidad] || 0;
      if (weightA !== weightB) {
        return weightB - weightA; // Descending severity
      }
      return new Date(a.limitDate).getTime() - new Date(b.limitDate).getTime(); // Ascending limit date
    });
  }, [findings, currentRole, searchTerm, filterState, filterCriticidad, filterDac, filterOrigin, showOverdueOnly, showNext7DaysOnly]);

  // Paginated chunk
  const paginatedFindings = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredFindings.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredFindings, currentPage]);

  const totalPages = Math.ceil(filteredFindings.length / itemsPerPage) || 1;

  // 3. DYNAMIC METRICS FOR DASHBOARD
  const dynamicMetrics = useMemo(() => {
    // JP RLS Filter applied if JP role
    const relevantFindings = findings.filter(f => (currentRole !== 'JP') || f.email === 'jperez@codelco.cl');
    
    const openFindings = relevantFindings.filter(f => f.state !== 'CORREGIDO' && f.state !== 'NO APLICA' && f.state !== 'ACEPTACIÓN DE RIESGO');
    const closedFindings = relevantFindings.filter(f => f.state === 'CORREGIDO');
    
    // Severity breakdown
    const criticos = openFindings.filter(f => f.criticidad === 'CRÍTICA').length;
    const altos = openFindings.filter(f => f.criticidad === 'ALTA').length;
    const medios = openFindings.filter(f => f.criticidad === 'MEDIA').length;
    const bajos = openFindings.filter(f => f.criticidad === 'BAJA').length;

    // Upcoming limits
    let en1Dia = 0;
    let en3Dias = 0;
    openFindings.forEach(f => {
      const diff = getDaysDiff(f.limitDate);
      if (diff === 1 || diff === 0) en1Dia++;
      if (diff > 1 && diff <= 3) en3Dias++;
    });

    return {
      totalAbiertos: openFindings.length,
      criticos,
      altos,
      medios,
      bajos,
      en1Dia,
      en3Dias,
      totalCorregidosMes: closedFindings.length + 8, // Adding historical closed count for premium view
      tasaExito: 92,
      tiempoProm: 4.2
    };
  }, [findings, currentRole]);

  // Reset page when filters shift
  const handleFilterChange = (setter: (val: string) => void, val: string) => {
    setter(val);
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setFilterState('ALL');
    setFilterCriticidad('ALL');
    setFilterDac('ALL');
    setFilterOrigin('ALL');
    setShowOverdueOnly(false);
    setShowNext7DaysOnly(false);
    setCurrentPage(1);
  };

  // 4. ACTION PROCESSORS

  // Trigger temporary notification banner
  const triggerToast = (msg: string) => {
    setShowNotificationToast(msg);
    setTimeout(() => {
      setShowNotificationToast(null);
    }, 4000);
  };

  // Add standard Comment
  const handleAddCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !activeFinding) return;

    const authorName = currentRole === 'JP' ? 'Juan Pérez (JP)' 
      : currentRole === 'RESP_CIBER_HALLAZGOS' ? 'Revisor Ciberseguridad'
      : currentRole === 'ADMIN' ? 'Administrador del Sistema'
      : 'Especialista Técnico';

    const commentObj: Comment = {
      id: `c_${Date.now()}`,
      author: authorName,
      role: currentRole,
      text: newCommentText,
      date: new Date().toLocaleString('es-CL', { hour12: false })
    };

    onAddFindingComment(activeFinding.id, commentObj);
    
    onAddFindingLog(activeFinding.id, {
      id: `log_${Date.now()}`,
      date: new Date().toLocaleString('es-CL', { hour12: false }),
      text: `Usuario ingresó un nuevo comentario aclaratorio.`,
      user: currentRole === 'JP' ? 'jperez@codelco.cl' : 'ciberseguridad@codelco.cl'
    });

    setNewCommentText('');
    triggerToast('Comentario registrado en el hilo de coordinación.');
  };

  // Save mitigation strategy
  const handleSaveRemediationPlan = () => {
    if (!activeFinding) return;

    if (activeIntention === 'REMEDIAR') {
      if (!mitigationText.trim() || !respName.trim() || !respEmail.trim() || !propDate) {
        alert('Por favor complete todos los campos del plan de remediación técnica.');
        return;
      }
      onUpdateFindingPlan(activeFinding.id, mitigationText, respName, respEmail, propDate);
      onUpdateFindingState(activeFinding.id, 'EN CORRECCIÓN');
      if (onUpdateFindingFields) {
        onUpdateFindingFields(activeFinding.id, { intention: 'REMEDIAR' });
      }

      onAddFindingLog(activeFinding.id, {
        id: `log_plan_${Date.now()}`,
        date: new Date().toLocaleString('es-CL', { hour12: false }),
        text: `JP definió intención de remediación: REMEDIAR. Plan: "${mitigationText.slice(0, 50)}...". Responsable: ${respName}. Fecha estimada: ${propDate}. Estado cambió a EN CORRECCIÓN.`,
        user: 'jperez@codelco.cl'
      });

      triggerToast('Plan de remediación guardado y notificado.');
    } else if (activeIntention === 'NO_REMEDIAR') {
      if (!noRemediarReason.trim()) {
        alert('Por favor detalle la justificación técnica de por qué no es posible remediar.');
        return;
      }
      onUpdateFindingPlan(activeFinding.id, noRemediarReason, 'Comité de Ciberseguridad', 'ciberseguridad@codelco.cl', activeFinding.limitDate);
      onUpdateFindingState(activeFinding.id, 'EN CORRECCIÓN');
      if (onUpdateFindingFields) {
        onUpdateFindingFields(activeFinding.id, { intention: 'NO_REMEDIAR' });
      }

      onAddFindingLog(activeFinding.id, {
        id: `log_noremediar_${Date.now()}`,
        date: new Date().toLocaleString('es-CL', { hour12: false }),
        text: `JP indicó imposibilidad de remediar técnicamente. Justificación: "${noRemediarReason.slice(0, 60)}...". Pendiente de subir Carta Waiver.`,
        user: 'jperez@codelco.cl'
      });

      triggerToast('Intención de Aceptación de Riesgo guardada. Por favor, proceda a cargar la Carta Waiver.');
    } else if (activeIntention === 'NO_APLICA') {
      if (!noAplicaReason.trim()) {
        alert('Por favor detalle la justificación técnica de por qué no aplica al contexto.');
        return;
      }
      onUpdateFindingPlan(activeFinding.id, noAplicaReason, 'Revisor de Ciberseguridad', 'ciberseguridad@codelco.cl', activeFinding.limitDate);
      onUpdateFindingState(activeFinding.id, 'EN REVISIÓN CORRECCIÓN'); // Shifts straight to review
      if (onUpdateFindingFields) {
        onUpdateFindingFields(activeFinding.id, { intention: 'NO_APLICA' });
      }

      onAddFindingLog(activeFinding.id, {
        id: `log_noaplica_${Date.now()}`,
        date: new Date().toLocaleString('es-CL', { hour12: false }),
        text: `JP indicó que el hallazgo NO APLICA. Justificación: "${noAplicaReason.slice(0, 60)}...". Estado cambió a EN REVISIÓN CORRECCIÓN para validación técnica.`,
        user: 'jperez@codelco.cl'
      });

      triggerToast('Solicitud de "No Aplica" enviada a revisión técnica de Ciberseguridad.');
    }

    setIsEditingPlan(false);
  };

  // Upload dynamic evidence strictly formatted: [DAC]-H[NNN]-Evidencia-V[X]-[Date].pdf
  const handleUploadIrreversibleEvidence = () => {
    if (!activeFinding) return;

    // Calculate version number based on current count
    const versionNum = activeFinding.evidences.length + 1;
    const formattedDacId = activeFinding.dacId;
    // Extract finding number (e.g., H001) from ID
    const findingSeq = activeFinding.id.includes('-H') ? activeFinding.id.split('-H')[1] : '001';
    
    const todayStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const officialFileName = `${formattedDacId}-H${findingSeq}-Evidencia-V${versionNum}-${todayStr}.pdf`;

    const newEvidence: Evidence = {
      id: `ev_${Date.now()}`,
      name: officialFileName,
      url: '#',
      uploadDate: new Date().toLocaleString('es-CL', { hour12: false }),
      state: 'En revisión'
    };

    onAddFindingEvidence(activeFinding.id, newEvidence);
    onUpdateFindingState(activeFinding.id, 'EN REVISIÓN CORRECCIÓN');

    onAddFindingLog(activeFinding.id, {
      id: `log_ev_${Date.now()}`,
      date: new Date().toLocaleString('es-CL', { hour12: false }),
      text: `JP cargó evidencia de remediación inmutable: ${officialFileName}. Estado cambió a EN REVISIÓN CORRECCIÓN.`,
      user: 'jperez@codelco.cl'
    });

    triggerToast(`Evidencia ${officialFileName} cargada correctamente. Estado actualizado a EN REVISIÓN.`);
  };

  // Waiver formal upload simulation (locks to Aceptación de Riesgo pending Ciberseguridad validation)
  const handleUploadFormalWaiverLetter = () => {
    if (!activeFinding) return;

    const findingSeq = activeFinding.id.includes('-H') ? activeFinding.id.split('-H')[1] : '001';
    const waiverFileName = `${activeFinding.dacId}-H${findingSeq}-Carta-AceptacionRiesgo-Firmada.pdf`;

    const newWaiver: Evidence = {
      id: `waiver_${Date.now()}`,
      name: waiverFileName,
      url: '#',
      uploadDate: new Date().toLocaleString('es-CL', { hour12: false }),
      state: 'En revisión'
    };

    onAddFindingEvidence(activeFinding.id, newWaiver);
    onUpdateFindingState(activeFinding.id, 'EN REVISIÓN CORRECCIÓN');
    
    if (onUpdateFindingFields) {
      onUpdateFindingFields(activeFinding.id, { waiverLetterLoaded: true });
    }

    onAddFindingLog(activeFinding.id, {
      id: `log_waiver_upload_${Date.now()}`,
      date: new Date().toLocaleString('es-CL', { hour12: false }),
      text: `JP cargó la Carta de Aceptación de Riesgo formal firmada: ${waiverFileName}. Requiere validación por Ciberseguridad para cierre formal.`,
      user: 'jperez@codelco.cl'
    });

    triggerToast('Carta de Aceptación de Riesgo (Waiver) cargada con éxito. Enviada a Ciberseguridad.');
  };

  // Revisor Ciberseguridad: APPROVAL
  const handleApproveByRevisor = () => {
    if (!activeFinding) return;

    let targetState: FindingState = 'CORREGIDO';
    let logText = '';

    if (activeFinding.intention === 'NO_REMEDIAR') {
      targetState = 'ACEPTACIÓN DE RIESGO';
      logText = 'Ciberseguridad validó la firma de la Carta Waiver. Hallazgo cerrado formalmente bajo ACEPTACIÓN DE RIESGO.';
    } else if (activeFinding.intention === 'NO_APLICA') {
      targetState = 'NO APLICA';
      logText = 'Ciberseguridad analizó los justificativos del JP y determinó que el hallazgo NO APLICA en este contexto.';
    } else {
      logText = 'Ciberseguridad validó satisfactoriamente las evidencias técnicas provistas. Hallazgo cerrado como CORREGIDO.';
    }

    onUpdateFindingState(activeFinding.id, targetState);

    // Update loaded evidences to Approved state
    activeFinding.evidences.forEach(ev => {
      if (ev.state === 'En revisión') {
        ev.state = 'Aprobado';
      }
    });

    onAddFindingLog(activeFinding.id, {
      id: `log_app_${Date.now()}`,
      date: new Date().toLocaleString('es-CL', { hour12: false }),
      text: logText,
      user: 'revisor.ciberseguridad@codelco.cl'
    });

    // Notify automatically
    onAddFindingComment(activeFinding.id, {
      id: `c_app_${Date.now()}`,
      author: 'Ciberseguridad Codelco',
      role: 'REVISOR',
      text: `Aprobación otorgada con éxito. El estado actual del hallazgo se ha consolidado en: ${targetState}.`,
      date: new Date().toLocaleString('es-CL', { hour12: false })
    });

    triggerToast(`Hallazgo aprobado y cerrado exitosamente como ${targetState}.`);
  };

  // Revisor Ciberseguridad: REJECT
  const handleRejectByRevisor = () => {
    if (!activeFinding || !rejectReason.trim()) return;

    onUpdateFindingState(activeFinding.id, 'EN CORRECCIÓN');

    // Reject latest pending evidence
    const pendingEvs = activeFinding.evidences.filter(e => e.state === 'En revisión');
    if (pendingEvs.length > 0) {
      pendingEvs[pendingEvs.length - 1].state = 'Rechazado';
      pendingEvs[pendingEvs.length - 1].comment = rejectReason;
    }

    onAddFindingLog(activeFinding.id, {
      id: `log_rej_${Date.now()}`,
      date: new Date().toLocaleString('es-CL', { hour12: false }),
      text: `Ciberseguridad RECHAZÓ las evidencias de remediación provistas. Motivo: "${rejectReason}". El estado regresó a EN CORRECCIÓN.`,
      user: 'revisor.ciberseguridad@codelco.cl'
    });

    onAddFindingComment(activeFinding.id, {
      id: `c_rej_${Date.now()}`,
      author: 'Ciberseguridad Codelco',
      role: 'REVISOR',
      text: `RECHAZO DE EVIDENCIA: ${rejectReason}. Por favor, aplique las correcciones y vuelva a adjuntar la evidencia técnica.`,
      date: new Date().toLocaleString('es-CL', { hour12: false })
    });

    setRejectReason('');
    setShowRejectBox(false);
    triggerToast('Evidencia rechazada. Se ha notificado al Jefe de Proyecto.');
  };

  // Simulating Excel export
  const handleSimulateExport = () => {
    onAddFindingLog(activeFinding ? activeFinding.id : 'General', {
      id: `log_exp_${Date.now()}`,
      date: new Date().toLocaleString('es-CL', { hour12: false }),
      text: `Usuario exportó matriz de hallazgos activa a formato Microsoft Excel.`,
      user: 'jperez@codelco.cl'
    });
    triggerToast('📥 Exportación completada con éxito. El archivo "Matriz_Hallazgos_Codelco.xlsx" ha sido descargado.');
  };

  // Simulating email notification
  const handleSendTeamReport = () => {
    onAddFindingLog(activeFinding ? activeFinding.id : 'General', {
      id: `log_rep_${Date.now()}`,
      date: new Date().toLocaleString('es-CL', { hour12: false }),
      text: `Se generó y envió reporte de estado de hallazgos por correo electrónico al equipo de proyecto.`,
      user: 'jperez@codelco.cl'
    });
    triggerToast('📧 Correo enviado. Reporte de trazabilidad despachado a jperez@codelco.cl y ciberseguridad@codelco.cl.');
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] w-full overflow-hidden text-xs bg-gray-50 font-sans" id="hallazgos-view">
      
      {/* LEFT COLUMN: List pane + Search filters + KPIs */}
      <div className="w-full lg:w-[480px] bg-white border-b lg:border-b-0 lg:border-r border-crema/20 shrink-0 overflow-y-auto flex flex-col p-4 md:p-5">
        
        {/* Title */}
        <div className="border-b border-gray-100 pb-3 mb-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-gris-azulado font-display uppercase tracking-widest leading-none flex items-center">
              <ShieldCheck className="w-4 h-4 mr-1.5 text-cobre" />
              Gestión de Hallazgos de Seguridad
            </h3>
            <span className="text-[10px] bg-gray-100 text-gray-500 font-bold px-2 py-0.5 rounded-full">
              {filteredFindings.length} Items
            </span>
          </div>
          <p className="text-[10px] text-gray-400 mt-1 leading-snug">
            Seguimiento de vulnerabilidades según SLAs de mitigación oficiales.
          </p>
        </div>

        {/* METRIC BOXES SUMMARY (Filtro por JP - RLS) */}
        <div className="grid grid-cols-3 gap-2 mb-4 bg-gray-50 p-2.5 rounded-sm border border-gray-100">
          <div className="bg-white p-2 rounded-xs border border-gray-100 shadow-3xs">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-[9px] font-extrabold uppercase tracking-tight">Abiertos</span>
              <AlertCircle className="w-3 h-3 text-red-500" />
            </div>
            <p className="text-lg font-extrabold text-gray-800 leading-tight mt-1">{dynamicMetrics.totalAbiertos}</p>
            <div className="text-[8px] text-gray-400 mt-1 space-y-0.5 leading-none font-sans">
              <span className="block"><strong className="text-granate">🔴 Crít: {dynamicMetrics.criticos}</strong></span>
              <span className="block"><strong className="text-cobre">🟠 Alt: {dynamicMetrics.altos}</strong></span>
            </div>
          </div>

          <div className="bg-white p-2 rounded-xs border border-gray-100 shadow-3xs">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-[9px] font-extrabold uppercase tracking-tight">Por Vencer</span>
              <Clock className="w-3 h-3 text-cobre" />
            </div>
            <p className="text-lg font-extrabold text-cobre leading-tight mt-1">{dynamicMetrics.en1Dia + dynamicMetrics.en3Dias}</p>
            <div className="text-[8px] text-gray-400 mt-1 space-y-0.5 leading-none font-sans">
              <span className="block text-granate">🚨 En 1d: {dynamicMetrics.en1Dia}</span>
              <span className="block text-oro">⏳ En 3d: {dynamicMetrics.en3Dias}</span>
            </div>
          </div>

          <div className="bg-white p-2 rounded-xs border border-gray-100 shadow-3xs">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-[9px] font-extrabold uppercase tracking-tight">Corregidos</span>
              <CheckCircle className="w-3 h-3 text-verde-petroleo" />
            </div>
            <p className="text-lg font-extrabold text-verde-petroleo leading-tight mt-1">{dynamicMetrics.totalCorregidosMes}</p>
            <div className="text-[8px] text-gray-400 mt-1 space-y-0.5 leading-none font-sans">
              <span className="block">Tasa: <strong>{dynamicMetrics.tasaExito}%</strong></span>
              <span className="block">Prom: <strong>{dynamicMetrics.tiempoProm}d</strong></span>
            </div>
          </div>
        </div>

        {/* SEARCH & DETAILED FILTERS */}
        <div className="bg-gray-50/50 p-3 rounded-sm border border-crema/10 space-y-2 mb-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por ID, título, sistemas..."
              value={searchTerm}
              onChange={(e) => handleFilterChange(setSearchTerm, e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-crema/30 rounded-sm text-[11px] focus:outline-none focus:border-cobre bg-white font-sans"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-0.5">
              <label className="text-[9px] uppercase font-bold text-gray-400 block">Estado</label>
              <select
                value={filterState}
                onChange={(e) => handleFilterChange(setFilterState, e.target.value)}
                className="w-full p-1.5 border border-crema/30 rounded-sm bg-white text-[10px] font-semibold cursor-pointer focus:outline-none text-gray-700"
              >
                <option value="ALL">Todos los Estados</option>
                <option value="NUEVO">NUEVO</option>
                <option value="EN CORRECCIÓN">EN CORRECCIÓN</option>
                <option value="EN REVISIÓN CORRECCIÓN">EN REVISIÓN</option>
                <option value="CORREGIDO">CORREGIDO</option>
                <option value="ACEPTACIÓN DE RIESGO">ACEPTACIÓN RIESGO</option>
                <option value="NO APLICA">NO APLICA</option>
              </select>
            </div>

            <div className="space-y-0.5">
              <label className="text-[9px] uppercase font-bold text-gray-400 block">Criticidad</label>
              <select
                value={filterCriticidad}
                onChange={(e) => handleFilterChange(setFilterCriticidad, e.target.value)}
                className="w-full p-1.5 border border-crema/30 rounded-sm bg-white text-[10px] font-semibold cursor-pointer focus:outline-none text-gray-700"
              >
                <option value="ALL">Todas</option>
                <option value="CRÍTICA">🔴 CRÍTICA</option>
                <option value="ALTA">🟠 ALTA</option>
                <option value="MEDIA">🟡 MEDIA</option>
                <option value="BAJA">🟢 BAJA</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="space-y-0.5">
              <label className="text-[9px] uppercase font-bold text-gray-400 block">ID DAC</label>
              <select
                value={filterDac}
                onChange={(e) => handleFilterChange(setFilterDac, e.target.value)}
                className="w-full p-1.5 border border-crema/30 rounded-sm bg-white text-[10px] font-semibold cursor-pointer focus:outline-none text-gray-700 text-ellipsis overflow-hidden"
              >
                <option value="ALL">Todos los DACs</option>
                {uniqueDacs.map(dacId => (
                  <option key={dacId} value={dacId}>{dacId}</option>
                ))}
              </select>
            </div>

            <div className="space-y-0.5">
              <label className="text-[9px] uppercase font-bold text-gray-400 block">Origen Reporte</label>
              <select
                value={filterOrigin}
                onChange={(e) => handleFilterChange(setFilterOrigin, e.target.value)}
                className="w-full p-1.5 border border-crema/30 rounded-sm bg-white text-[10px] font-semibold cursor-pointer focus:outline-none text-gray-700 text-ellipsis overflow-hidden"
              >
                <option value="ALL">Todos</option>
                {uniqueOrigins.map(origin => (
                  <option key={origin} value={origin}>{origin}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick SLA Filtering Toggles */}
          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-gray-100 items-center justify-between">
            <div className="flex gap-1">
              <button
                onClick={() => {
                  setShowOverdueOnly(!showOverdueOnly);
                  if (showNext7DaysOnly) setShowNext7DaysOnly(false);
                  setCurrentPage(1);
                }}
                className={`px-2 py-1 rounded-sm text-[9px] font-bold uppercase transition-all border cursor-pointer ${
                  showOverdueOnly 
                    ? 'bg-granate text-white border-granate' 
                    : 'bg-white text-granate border-red-200 hover:bg-red-50'
                }`}
              >
                🔴 Solo Vencidos
              </button>

              <button
                onClick={() => {
                  setShowNext7DaysOnly(!showNext7DaysOnly);
                  if (showOverdueOnly) setShowOverdueOnly(false);
                  setCurrentPage(1);
                }}
                className={`px-2 py-1 rounded-sm text-[9px] font-bold uppercase transition-all border cursor-pointer ${
                  showNext7DaysOnly 
                    ? 'bg-cobre text-white border-cobre' 
                    : 'bg-white text-cobre border-orange-200 hover:bg-orange-50'
                }`}
              >
                ⏰ Próximos 7 Días
              </button>
            </div>

            <button
              onClick={clearAllFilters}
              className="text-gray-400 hover:text-cobre text-[9px] font-bold uppercase tracking-wider underline cursor-pointer"
            >
              Limpiar Filtros
            </button>
          </div>
        </div>

        {/* ORDER BY WARNING & TABLE LIST HEADER */}
        <div className="text-[9px] text-gray-400 uppercase font-bold tracking-wider mb-2 flex items-center justify-between border-b border-gray-100 pb-1">
          <span>Lista de Hallazgos (Ordenado por Criticidad ▼ | Fecha límite ▲)</span>
          <span className="text-cobre">Mostrando {paginatedFindings.length} de {filteredFindings.length}</span>
        </div>

        {/* LIST PANEL CARD */}
        <div className="space-y-2.5 flex-1 overflow-y-auto">
          {paginatedFindings.length === 0 ? (
            <div className="text-center py-12 text-gray-400 font-sans border-2 border-dashed border-gray-100 bg-gray-50/50 p-4">
              <AlertTriangle className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="font-semibold text-xs">No se encontraron hallazgos</p>
              <p className="text-[10px] text-gray-400 mt-1">Intente remover o limpiar los criterios de búsqueda actuales.</p>
            </div>
          ) : (
            paginatedFindings.map((f) => {
              const isSelected = activeFinding?.id === f.id;
              const sla = getSlaDetails(f.criticidad, f.limitDate, f.state);
              return (
                <div
                  key={f.id}
                  onClick={() => onSelectFinding(f.id)}
                  className={`w-full text-left p-3.5 border rounded-xs shadow-3xs transition-all relative block cursor-pointer group ${
                    isSelected
                      ? 'bg-cobre/5 border-cobre/70 ring-1 ring-cobre/20'
                      : 'bg-white border-crema/10 hover:border-cobre/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1.5 border-b border-gray-100 pb-1.5 mb-1.5 text-[10px] font-bold">
                    <div className="flex flex-col">
                      <span className="text-cobre font-mono">{f.id}</span>
                      <span className="text-[9px] text-gray-400 font-sans">DAC: {f.dacId}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-sm uppercase text-[9px] border font-bold ${getFindingStateColor(f.state)}`}>
                      {f.state}
                    </span>
                  </div>

                  <h4 className="font-display font-extrabold text-gray-800 text-[11px] leading-tight break-words group-hover:text-cobre transition-colors">
                    {f.title}
                  </h4>

                  <div className="text-[10px] text-gray-400 mt-1.5 font-sans leading-none flex justify-between items-center">
                    <span>Origen: <strong>{f.origin}</strong></span>
                    <span>Límite: <strong>{f.limitDate}</strong></span>
                  </div>

                  <div className="flex items-center justify-between mt-3 text-[10px] font-semibold border-t border-gray-50 pt-2">
                    <span className={`px-2 py-0.5 rounded-sm uppercase font-extrabold text-[8px] ${getCritColor(f.criticidad)}`}>
                      {f.criticidad}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded-sm border text-[9px] ${sla.color} font-mono flex items-center gap-1`}>
                      {sla.days < 0 && !['CORREGIDO', 'NO APLICA', 'ACEPTACIÓN DE RIESGO'].includes(f.state) && (
                        <AlertCircle className="w-3 h-3 text-granate inline" />
                      )}
                      {sla.text}
                    </span>
                  </div>

                  {/* Absolute positioning button trigger */}
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-cobre text-white p-1 rounded-sm shadow-xs hidden lg:block">
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* PAGINATION CONTROLS */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-3">
            <span className="text-[10px] text-gray-400">
              Mostrando página <strong>{currentPage}</strong> de {totalPages}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-2 py-1 border border-gray-200 rounded-sm bg-white hover:bg-gray-50 disabled:opacity-40 text-[10px] font-bold cursor-pointer"
              >
                Anterior
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-2 py-1 rounded-sm text-[10px] font-bold cursor-pointer transition-all ${
                    currentPage === pageNum 
                      ? 'bg-cobre text-white border border-cobre' 
                      : 'border border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-2 py-1 border border-gray-200 rounded-sm bg-white hover:bg-gray-50 disabled:opacity-40 text-[10px] font-bold cursor-pointer"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}

        {/* BOTTOM LIST OPERATIONS */}
        <div className="grid grid-cols-3 gap-1.5 pt-3 border-t border-gray-100 mt-3">
          <button
            onClick={() => setShowMetricsModal(true)}
            className="px-2 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold uppercase text-[9px] rounded-xs flex items-center justify-center gap-1 cursor-pointer transition-all border border-gray-200"
          >
            <BarChart2 className="w-3.5 h-3.5 text-cobre" />
            Métricas
          </button>
          
          <button
            onClick={handleSimulateExport}
            className="px-2 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold uppercase text-[9px] rounded-xs flex items-center justify-center gap-1 cursor-pointer transition-all border border-gray-200"
          >
            <Download className="w-3.5 h-3.5 text-verde-petroleo" />
            Excel
          </button>

          <button
            onClick={handleSendTeamReport}
            className="px-2 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold uppercase text-[9px] rounded-xs flex items-center justify-center gap-1 cursor-pointer transition-all border border-gray-200"
          >
            <Mail className="w-3.5 h-3.5 text-azul" />
            Reportar
          </button>
        </div>
      </div>

      {/* RIGHT COLUMN: Finding Detail Overview Pane */}
      {activeFinding ? (
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
          
          {/* TOAST ALERT DISPLAY */}
          {showNotificationToast && (
            <div className="bg-emerald-600 text-white px-4 py-2.5 rounded-sm shadow-md flex items-center justify-between text-xs animate-fade-in font-sans">
              <span className="flex items-center gap-2 font-semibold">
                <Check className="w-4 h-4 bg-white text-emerald-600 rounded-full p-0.5" />
                {showNotificationToast}
              </span>
              <button onClick={() => setShowNotificationToast(null)} className="text-white/80 hover:text-white ml-3 focus:outline-none">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* 📌 SECCIÓN 1: INFORMACIÓN GENERAL */}
          <div className="bg-white border border-crema/20 p-5 rounded-xs shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3 mb-4 text-xs font-bold font-sans">
              <div className="flex items-center space-x-2">
                <span className="text-cobre text-sm font-mono">{activeFinding.id}</span>
                <span className="text-gray-300">|</span>
                <span className="text-gray-500 font-sans">DAC Asociado: {activeFinding.dacId}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2.5 py-0.5 rounded-full border text-[9px] uppercase font-bold ${getFindingStateColor(activeFinding.state)}`}>
                  {activeFinding.state}
                </span>
                <span className={`px-2.5 py-0.5 rounded-sm text-[9px] font-bold ${getCritColor(activeFinding.criticidad)}`}>
                  {activeFinding.criticidad}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-3">
                <h2 className="text-sm font-extrabold font-display text-gris-azulado uppercase tracking-wide leading-tight">
                  {activeFinding.title}
                </h2>
                <div className="text-xs text-gray-600 font-sans leading-relaxed bg-gray-50/50 p-3.5 border border-gray-100 rounded-xs">
                  <span className="text-[10px] font-extrabold uppercase text-gray-400 block mb-1">Descripción de la vulnerabilidad</span>
                  {activeFinding.description}
                </div>
              </div>

              {/* Sidebar stats */}
              <div className="bg-gray-50/50 p-4 border border-gray-100 rounded-xs space-y-2.5 text-[11px] text-gray-600">
                <div className="border-b border-gray-200/50 pb-1.5">
                  <span className="text-gray-400 block uppercase text-[8px] font-bold">Origen del Reporte</span>
                  <strong className="text-gray-700">{activeFinding.origin}</strong>
                </div>
                <div className="border-b border-gray-200/50 pb-1.5">
                  <span className="text-gray-400 block uppercase text-[8px] font-bold">JP Asignado</span>
                  <strong className="text-gray-700">{activeFinding.assignedTo}</strong>
                  <span className="block text-[10px] text-gray-500 font-mono">{activeFinding.email}</span>
                </div>
                <div className="border-b border-gray-200/50 pb-1.5">
                  <span className="text-gray-400 block uppercase text-[8px] font-bold">Sistemas Afectados</span>
                  <strong className="text-gray-700">{activeFinding.systemsAffected || 'SQL Server 2019 (Producción) y tablas de negocio'}</strong>
                </div>
                <div>
                  <span className="text-gray-400 block uppercase text-[8px] font-bold">Creado Por</span>
                  <strong className="text-gray-700">{activeFinding.createdBy || 'EY - Evaluador Técnico'}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* SLA Targets & Technical Recommendation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-crema/20 p-5 rounded-xs shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-gris-azulado font-display uppercase tracking-wider border-b border-gray-100 pb-2 flex items-center">
                <Clock className="w-4 h-4 mr-2 text-cobre" />
                SLA Oficial y Control de Tiempos
              </h3>
              <div className="text-xs space-y-2 font-sans text-gray-600">
                <div className="flex justify-between border-b border-gray-50 pb-1">
                  <span>Fecha de Detección:</span>
                  <strong className="text-gray-800">23/06/2026</strong>
                </div>
                <div className="flex justify-between border-b border-gray-50 pb-1">
                  <span>Plazo de Corrección Oficial:</span>
                  <strong className="text-gray-800">
                    {getSlaLimitDays(activeFinding.criticidad)} Días Hábiles
                  </strong>
                </div>
                <div className="flex justify-between border-b border-gray-50 pb-1">
                  <span>Fecha Límite (SLA):</span>
                  <strong className="text-gray-800">{activeFinding.limitDate}</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span>Estado de SLA:</span>
                  <span className={`px-2 py-0.5 rounded-sm border text-[10px] ${getSlaDetails(activeFinding.criticidad, activeFinding.limitDate, activeFinding.state).color} font-bold`}>
                    {getSlaDetails(activeFinding.criticidad, activeFinding.limitDate, activeFinding.state).text}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-crema/20 p-5 rounded-xs shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-gris-azulado font-display uppercase tracking-wider border-b border-gray-100 pb-2 flex items-center">
                <ShieldCheck className="w-4 h-4 mr-2 text-verde-petroleo" />
                Recomendación Técnica de EY
              </h3>
              <div className="text-xs text-gray-600 font-sans leading-relaxed bg-emerald-50/20 p-3 rounded-xs border border-emerald-500/10">
                {activeFinding.recommendation}
              </div>
            </div>
          </div>

          {/* 🎯 PLAN DE MITIGACIÓN / ACCIÓN (JP Selector Flow 6) */}
          <div className="bg-white border border-crema/20 p-5 rounded-xs shadow-sm space-y-4">
            <div className="border-b border-gray-100 pb-2 flex justify-between items-center">
              <div>
                <h3 className="text-xs font-bold text-gris-azulado font-display uppercase tracking-wider flex items-center">
                  <FileText className="w-4 h-4 mr-2 text-cobre" />
                  Plan de Mitigación / Acción Técnica (JP)
                </h3>
                <p className="text-[10px] text-gray-400 font-sans mt-0.5">Defina la intención de remediación para subsanar el hallazgo.</p>
              </div>

              {!isEditingPlan && (activeFinding.state === 'NUEVO' || activeFinding.state === 'EN CORRECCIÓN') && (currentRole === 'JP' || currentRole === 'ADMIN') && (
                <button
                  onClick={() => {
                    setIsEditingPlan(true);
                    setMitigationText(activeFinding.mitigationPlan || '');
                    setRespName(activeFinding.responsibleInternal || '');
                    setRespEmail(activeFinding.responsibleEmail || '');
                    setPropDate(activeFinding.proposedDate || '');
                  }}
                  className="bg-cobre text-white px-3 py-1 rounded-xs hover:bg-cobre-oscuro font-bold uppercase text-[10px] tracking-wider transition-all focus:outline-none cursor-pointer"
                >
                  📝 Configurar Plan
                </button>
              )}
            </div>

            {isEditingPlan ? (
              <div className="space-y-4 font-sans text-xs animate-fade-in bg-gray-50/50 p-4 border border-gray-100 rounded-xs">
                
                {/* FLOW INTENTION SELECTOR */}
                <div className="space-y-1">
                  <label className="font-extrabold text-gray-500 block uppercase text-[9px] tracking-wider">Indique la intención de remediación:</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveIntention('REMEDIAR')}
                      className={`py-2 px-3 border text-center font-bold uppercase text-[10px] rounded-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        activeIntention === 'REMEDIAR'
                          ? 'bg-cobre/10 text-cobre border-cobre font-extrabold shadow-3xs'
                          : 'bg-white hover:bg-gray-100 text-gray-500 border-gray-200'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      ✅ REMEDIAR
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setActiveIntention('NO_REMEDIAR')}
                      className={`py-2 px-3 border text-center font-bold uppercase text-[10px] rounded-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        activeIntention === 'NO_REMEDIAR'
                          ? 'bg-orange-500/10 text-orange-600 border-orange-500 font-extrabold shadow-3xs'
                          : 'bg-white hover:bg-gray-100 text-gray-500 border-gray-200'
                      }`}
                    >
                      <AlertCircle className="w-3.5 h-3.5 text-orange-500" />
                      ❌ NO REMEDIAR
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveIntention('NO_APLICA')}
                      className={`py-2 px-3 border text-center font-bold uppercase text-[10px] rounded-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        activeIntention === 'NO_APLICA'
                          ? 'bg-gray-700/10 text-gray-700 border-gray-600 font-extrabold shadow-3xs'
                          : 'bg-white hover:bg-gray-100 text-gray-500 border-gray-200'
                      }`}
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-gray-600" />
                      🚫 NO APLICA
                    </button>
                  </div>
                </div>

                {/* CONDITIONAL FORMS DEPENDING ON JP INTENTION */}
                {activeIntention === 'REMEDIAR' && (
                  <div className="space-y-4 animate-fade-in pt-2">
                    <div className="space-y-1">
                      <label className="font-bold text-gray-600 block">Plan de Acción / Habilitación Técnica</label>
                      <textarea
                        rows={3}
                        placeholder="Describa los pasos y configuraciones técnicas que aplicará para mitigar este hallazgo de seguridad..."
                        value={mitigationText}
                        onChange={(e) => setMitigationText(e.target.value)}
                        className="w-full px-3 py-2 border border-crema/30 rounded-sm bg-white text-xs focus:outline-none focus:border-cobre"
                      ></textarea>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="font-bold text-gray-600 block">Responsable Técnico Interno</label>
                        <input
                          type="text"
                          placeholder="Nombre del técnico ejecutor"
                          value={respName}
                          onChange={(e) => setRespName(e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-crema/30 rounded-sm bg-white text-xs focus:outline-none focus:border-cobre"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-gray-600 block">Email de Contacto</label>
                        <input
                          type="email"
                          placeholder="email@codelco.cl"
                          value={respEmail}
                          onChange={(e) => setRespEmail(e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-crema/30 rounded-sm bg-white text-xs focus:outline-none focus:border-cobre"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-gray-600 block">Fecha Estimada Mitigación</label>
                        <input
                          type="date"
                          value={propDate}
                          onChange={(e) => setPropDate(e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-crema/30 rounded-sm bg-white text-xs focus:outline-none focus:border-cobre"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeIntention === 'NO_REMEDIAR' && (
                  <div className="space-y-3 animate-fade-in pt-2 bg-amber-500/5 p-3 rounded-xs border border-orange-200">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-orange-700 font-bold uppercase text-[10px]">
                        <Info className="w-4 h-4" />
                        Aceptación de Riesgo Formal (Waiver)
                      </div>
                      <p className="text-[10px] text-gray-500 leading-snug">
                        Si es técnicamente inviable corregir la vulnerabilidad en este momento, justifique en detalle las causas del aplazamiento y la mitigación alternativa. Posteriormente se requiere subir la Carta de Aceptación de Riesgo firmada por JP + Jefe Directo + Gestor.
                      </p>
                    </div>
                    <div className="space-y-1 pt-1.5">
                      <label className="font-bold text-gray-700 block">Justificación Técnica de Inviabilidad:</label>
                      <textarea
                        rows={3}
                        placeholder="Ej: Restricción contractual del fabricante de software heredado que impide la modificación de APIs. Se aplicará Web Application Firewall como alternativa temporaria..."
                        value={noRemediarReason}
                        onChange={(e) => setNoRemediarReason(e.target.value)}
                        className="w-full px-3 py-2 border border-crema/30 rounded-sm bg-white text-xs focus:outline-none focus:border-cobre"
                      ></textarea>
                    </div>
                  </div>
                )}

                {activeIntention === 'NO_APLICA' && (
                  <div className="space-y-3 animate-fade-in pt-2 bg-gray-700/5 p-3 rounded-xs border border-gray-300">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-gray-700 font-bold uppercase text-[10px]">
                        <HelpCircle className="w-4 h-4" />
                        Justificación de "No Aplica"
                      </div>
                      <p className="text-[10px] text-gray-500 leading-snug">
                        Sustente con argumentos técnicos por qué este control de seguridad o hallazgo no aplica a la arquitectura de su solución técnica. Ciberseguridad auditará y aprobará si corresponde.
                      </p>
                    </div>
                    <div className="space-y-1 pt-1.5">
                      <label className="font-bold text-gray-700 block">Argumento de Exclusión Técnica:</label>
                      <textarea
                        rows={3}
                        placeholder="Ej: El hallazgo menciona falta de cifrado SSL en base de datos local, sin embargo, esta solución se conecta directamente mediante enlace MPLS privado extremo a extremo sin exposición pública..."
                        value={noAplicaReason}
                        onChange={(e) => setNoAplicaReason(e.target.value)}
                        className="w-full px-3 py-2 border border-crema/30 rounded-sm bg-white text-xs focus:outline-none focus:border-cobre"
                      ></textarea>
                    </div>
                  </div>
                )}

                {/* Form Buttons */}
                <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => setIsEditingPlan(false)}
                    className="px-3 py-1.5 border border-gray-300 rounded-sm text-[10px] font-bold uppercase font-display cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveRemediationPlan}
                    className="px-4 py-1.5 bg-cobre text-white rounded-sm text-[10px] font-bold uppercase font-display cursor-pointer hover:bg-cobre-oscuro transition-all"
                  >
                    Guardar Estrategia
                  </button>
                </div>
              </div>
            ) : (
              /* Display mitigative status when not editing */
              <div className="bg-gray-50/50 p-4 border border-gray-100 rounded-xs space-y-3.5">
                {activeFinding.intention ? (
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-1.5 text-gray-700">
                      <span className="text-[10px] uppercase font-extrabold text-gray-400">Intención JP:</span>
                      <strong className={`px-2 py-0.5 rounded-sm uppercase text-[9px] border font-bold ${
                        activeFinding.intention === 'REMEDIAR' ? 'bg-emerald-50 text-verde-petroleo border-verde-petroleo/20' :
                        activeFinding.intention === 'NO_REMEDIAR' ? 'bg-orange-50 text-orange-600 border-orange-500/20' :
                        'bg-gray-100 text-gray-700 border-gray-300'
                      }`}>
                        {activeFinding.intention === 'REMEDIAR' ? '✅ REMEDIAR' :
                         activeFinding.intention === 'NO_REMEDIAR' ? '❌ NO REMEDIAR' : '🚫 NO APLICA'}
                      </strong>
                    </div>

                    <div className="text-xs text-gray-700 font-sans leading-relaxed">
                      <span className="text-[9px] text-gray-400 uppercase font-bold block mb-0.5">Sustento del Plan de Acción / Justificación</span>
                      <p className="bg-white p-3 rounded-xs border border-gray-100 italic">
                        {activeFinding.mitigationPlan || 'Plan no especificado por el JP.'}
                      </p>
                    </div>

                    {activeFinding.intention === 'REMEDIAR' && activeFinding.responsibleInternal && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[10px] text-gray-500 font-sans bg-white p-2.5 rounded-sm border border-gray-100">
                        <span>Responsable: <strong className="text-gray-700">{activeFinding.responsibleInternal}</strong></span>
                        <span>Email: <strong className="text-gray-700 font-mono">{activeFinding.responsibleEmail}</strong></span>
                        <span>Compromiso: <strong className="text-gray-700">{activeFinding.proposedDate}</strong></span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <HelpCircle className="w-8 h-8 text-gray-300 mx-auto mb-1" />
                    <p className="text-xs text-gray-400 italic">No se ha configurado la intención o plan de acción para este hallazgo de seguridad.</p>
                    {(currentRole === 'JP' || currentRole === 'ADMIN') && (
                      <button
                        onClick={() => setIsEditingPlan(true)}
                        className="mt-2 text-cobre hover:underline font-extrabold uppercase text-[10px] tracking-wider cursor-pointer"
                      >
                        Definir Intención Ahora →
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 📎 EVIDENCIAS DE REMEDIACIÓN (Irreversible uploads) */}
          <div className="bg-white border border-crema/20 p-5 rounded-xs shadow-sm space-y-4">
            <div className="border-b border-gray-100 pb-2 flex justify-between items-center">
              <div>
                <h3 className="text-xs font-bold text-gris-azulado font-display uppercase tracking-wider flex items-center">
                  <Upload className="w-4 h-4 mr-2 text-cobre" />
                  Evidencias de Remediación Cargadas
                </h3>
                <p className="text-[10px] text-gray-400 font-sans mt-0.5">Permisos SharePoint restrictivos de solo lectura una vez subidos.</p>
              </div>

              {(activeFinding.state === 'NUEVO' || activeFinding.state === 'EN CORRECCIÓN') && (currentRole === 'JP' || currentRole === 'ADMIN') && (
                <button
                  onClick={handleUploadIrreversibleEvidence}
                  className="bg-cobre hover:bg-cobre-oscuro text-white px-3.5 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-wider font-display flex items-center shadow-3xs focus:outline-none transition-all cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 mr-1" />
                  Cargar Evidencia
                </button>
              )}
            </div>

            <div className="space-y-2.5">
              {activeFinding.evidences.length === 0 ? (
                <p className="text-xs text-gray-400 italic font-sans py-2">
                  No se han cargado documentos de evidencia técnica aún para este hallazgo.
                </p>
              ) : (
                activeFinding.evidences.map(ev => (
                  <div key={ev.id} className="border border-gray-100 p-3.5 rounded-xs bg-white shadow-3xs flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs font-sans">
                      <div className="flex items-center min-w-0">
                        <FileText className="w-4 h-4 text-cobre mr-2 shrink-0" />
                        <span className="font-bold text-gray-700 truncate">{ev.name}</span>
                        <span className="text-[10px] text-gray-400 ml-2 font-mono">({ev.uploadDate})</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                        ev.state === 'Aprobado' ? 'bg-emerald-50 text-verde-petroleo border-emerald-100' : 
                        ev.state === 'Rechazado' ? 'bg-red-50 text-granate border-red-100' : 'bg-amber-50 text-oro border-oro/20'
                      }`}>
                        {ev.state === 'Aprobado' ? '✅ APROBADO' : ev.state === 'Rechazado' ? '❌ RECHAZADO' : '⏳ EN REVISIÓN'}
                      </span>
                    </div>

                    {ev.comment && (
                      <p className="text-[11px] text-granate bg-red-50/50 p-2.5 border border-red-100 rounded-sm italic font-sans">
                        <strong>Motivo de rechazo Ciberseguridad:</strong> "{ev.comment}"
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* WAIVER LETTER BLOCK FOR RISK ACCEPTANCE FLOW 6 */}
            {activeFinding.intention === 'NO_REMEDIAR' && (activeFinding.state === 'NUEVO' || activeFinding.state === 'EN CORRECCIÓN') && (currentRole === 'JP' || currentRole === 'ADMIN') && (
              <div className="bg-surface-custom border-2 border-dashed border-orange-500/30 p-4 rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-sans">
                <div className="space-y-1">
                  <h4 className="font-extrabold text-orange-700 uppercase font-display text-[11px] flex items-center gap-1">
                    <FileSignature className="w-4 h-4 text-orange-600 animate-pulse" />
                    Carga Obligatoria de Carta Waiver (Aceptación de Riesgo)
                  </h4>
                  <p className="text-gray-500 font-sans leading-relaxed text-[10px]">
                    Para solicitar el estado de ACEPTACIÓN DE RIESGO, debe cargar el documento formal firmado por: <strong className="text-gray-700">JP + Jefe Directo + Gestor</strong>.
                  </p>
                </div>
                
                <button
                  onClick={handleUploadFormalWaiverLetter}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 rounded-sm text-[10px] font-bold uppercase tracking-wider font-display shrink-0 flex items-center justify-center focus:outline-none transition-all cursor-pointer shadow-sm"
                >
                  <FileSignature className="w-4 h-4 mr-1.5" />
                  Subir Carta Waiver
                </button>
              </div>
            )}

            <div className="text-[9px] text-gray-400 bg-gray-50 p-2.5 rounded-xs border border-gray-200 flex items-start gap-1.5 leading-snug">
              <Info className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
              <span>
                <strong>⚠️ Nota de Inmutabilidad de Trazabilidad:</strong> De acuerdo a las políticas de gobernanza de Codelco, la carga de evidencias técnicas y cartas de aceptación de riesgo es irreversible. Los archivos quedarán en modo solo lectura de manera inmediata.
              </span>
            </div>
          </div>

          {/* 🛡️ CONSOLA DE EVALUACIÓN DE CIBERSEGURIDAD (RESP_CIBER_HALLAZGOS & ADMIN) */}
          {(currentRole === 'RESP_CIBER_HALLAZGOS' || currentRole === 'ADMIN') && activeFinding.state === 'EN REVISIÓN CORRECCIÓN' && (
            <div className="bg-white border-2 border-verde-petroleo/30 p-5 rounded-xs shadow-md space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-2.5">
                <span className="p-1 bg-verde-petroleo text-white rounded-sm">
                  <ShieldCheck className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-xs font-bold text-verde-petroleo font-display uppercase tracking-wider">
                    Consola de Evaluación de Evidencias - Ciberseguridad Codelco
                  </h3>
                  <p className="text-[10px] text-gray-400 font-sans leading-none mt-0.5">Módulo de aprobación con trazabilidad para control regulatorio.</p>
                </div>
              </div>

              <div className="text-xs text-gray-600 font-sans bg-gray-50 p-3 rounded-xs border border-gray-200/50 leading-relaxed">
                El Jefe de Proyecto ha enviado una solicitud para evaluación. Por favor verifique las evidencias de remediación inmutables adjuntas en la sección superior antes de resolver:
                <div className="mt-2 text-[11px] space-y-1 text-gray-700">
                  <span>• Intención Declarada: <strong className="text-cobre uppercase">{activeFinding.intention || 'Remediar'}</strong></span>
                  {activeFinding.intention === 'NO_REMEDIAR' && (
                    <span className="block text-orange-600 font-bold">• REQUIERE: Validación de la firma del Waiver cargado.</span>
                  )}
                  {activeFinding.intention === 'NO_APLICA' && (
                    <span className="block text-gray-600 font-bold">• REQUIERE: Auditoría y aceptación técnica de exclusión.</span>
                  )}
                </div>
              </div>

              {showRejectBox ? (
                <div className="space-y-2 text-xs font-sans animate-fade-in bg-red-50 p-3 rounded-xs border border-red-100">
                  <label className="font-extrabold text-granate block uppercase text-[9px] tracking-wider">Escriba el motivo técnico del rechazo:</label>
                  <textarea
                    rows={2}
                    placeholder="Ej: El screenshot provisto no permite constatar que se haya habilitado la encriptación TDE sobre la instancia correcta de producción. Favor de adjuntar certificado de Always Encrypted..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full px-3 py-2 border border-red-200 rounded-sm text-xs focus:outline-none bg-white"
                  ></textarea>
                  <div className="flex space-x-2 justify-end pt-1">
                    <button
                      onClick={() => setShowRejectBox(false)}
                      className="px-3 py-1.5 border border-gray-300 rounded-sm font-semibold uppercase text-[10px] font-display cursor-pointer bg-white"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleRejectByRevisor}
                      className="px-4 py-1.5 bg-granate text-white rounded-sm font-bold uppercase text-[10px] font-display cursor-pointer hover:bg-red-800 transition-all"
                    >
                      Confirmar Rechazo
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex space-x-3 justify-end">
                  <button
                    onClick={() => setShowRejectBox(true)}
                    className="px-4 py-2 border border-granate text-granate hover:bg-red-50 rounded-sm text-xs font-bold uppercase tracking-wider font-display flex items-center shadow-3xs cursor-pointer transition-all"
                  >
                    <FileX className="w-4 h-4 mr-1.5" />
                    Rechazar Evidencias
                  </button>
                  <button
                    onClick={handleApproveByRevisor}
                    className="px-5 py-2 bg-verde-petroleo hover:bg-emerald-900 text-white rounded-sm text-xs font-bold uppercase tracking-wider font-display flex items-center shadow-md cursor-pointer transition-all"
                  >
                    <Check className="w-4 h-4 mr-1.5" />
                    Aprobar y Cerrar Hallazgo
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 🔔 RECORDATORIOS AUTOMÁTICOS PROGRAMADOS POR SLA */}
          <div className="bg-white border border-crema/20 p-5 rounded-xs shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-gris-azulado font-display uppercase tracking-wider border-b border-gray-100 pb-2 flex items-center">
              <Clock className="w-4 h-4 mr-2 text-cobre animate-pulse" />
              Cronograma de Recordatorios Automáticos Configurados
            </h3>
            
            <p className="text-[10px] text-gray-400 font-sans">
              Alertas proactivas de SLA gestionadas automáticamente (Power Automate - Flujo 3).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3 border border-gray-100 rounded-sm bg-gray-50/30 flex flex-col justify-between">
                <div>
                  <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider block">Fase Inicial</span>
                  <p className="text-xs font-semibold text-gray-700 mt-1">Gatillador Inmediato</p>
                </div>
                <span className="text-[9px] text-emerald-600 font-bold block mt-2">✓ Notificado a JP y Gestor</span>
              </div>

              <div className="p-3 border border-gray-100 rounded-sm bg-gray-50/30 flex flex-col justify-between">
                <div>
                  <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider block">Fase Preventiva</span>
                  <p className="text-xs font-semibold text-gray-700 mt-1">Alertas SLA Próximas</p>
                </div>
                <div className="text-[9px] text-gray-500 space-y-0.5 mt-2 leading-tight">
                  <span className="block">• Crítico: 3d y 1d antes</span>
                  <span className="block">• Alto: 5d, 3d y 1d antes</span>
                </div>
              </div>

              <div className="p-3 border border-gray-100 rounded-sm bg-gray-50/30 flex flex-col justify-between">
                <div>
                  <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider block">Fase Escalamiento</span>
                  <p className="text-xs font-semibold text-gray-700 mt-1">Gatillador de Incumplimiento</p>
                </div>
                <span className="text-[9px] text-granate font-bold block mt-2">🚨 Alertas automáticas a Gerencia</span>
              </div>
            </div>
          </div>

          {/* 📜 TIMELINE HISTORIAL DE AUDITORÍA */}
          <div className="bg-white border border-crema/20 p-5 rounded-xs shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-gris-azulado font-display uppercase tracking-wider border-b border-gray-100 pb-2 flex items-center">
              <History className="w-4 h-4 mr-2 text-cobre" />
              Historial de Auditoría e Hitos
            </h3>

            <div className="space-y-4 relative pl-4 border-l border-gray-100">
              {activeFinding.logs.map(log => (
                <div key={log.id} className="relative text-xs font-sans text-gray-600">
                  {/* Circle dot on timeline line */}
                  <span className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 bg-cobre rounded-full border-2 border-white shadow-3xs"></span>
                  <div className="flex items-center justify-between text-[10px] font-semibold text-gray-400 mb-0.5">
                    <span>{log.date}</span>
                    <span>Ejecutor: <strong>{log.user}</strong></span>
                  </div>
                  <p className="font-semibold text-gray-700 font-sans bg-gray-50/50 p-2 rounded-xs border border-gray-100/50">
                    {log.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 💬 COMENTARIOS / HILO DE COORDINACIÓN */}
          <div className="bg-white border border-crema/20 p-5 rounded-xs shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-gris-azulado font-display uppercase tracking-wider border-b border-gray-100 pb-2 flex items-center">
              <MessageSquare className="w-4 h-4 mr-2 text-cobre" />
              Hilo de Coordinación Técnica ({activeFinding.comments.length})
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

            {/* Comment input form */}
            <form onSubmit={handleAddCommentSubmit} className="flex gap-2 pt-3 border-t border-gray-100">
              <input
                type="text"
                placeholder="Escriba un comentario o aclaración técnica sobre la remediación..."
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                className="flex-1 px-3 py-2 border border-crema/30 rounded-sm text-xs focus:outline-none focus:border-cobre bg-surface-custom/10 focus:bg-white transition-all"
              />
              <button
                type="submit"
                className="bg-cobre hover:bg-cobre-oscuro text-white px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-wider font-display flex items-center shadow-xs focus:outline-none shrink-0 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-gray-400 bg-gray-50">
          <AlertTriangle className="w-16 h-16 text-gray-300 mb-3" />
          <h4 className="font-extrabold text-sm uppercase font-display text-gris-azulado">Seleccione un Hallazgo de Seguridad</h4>
          <p className="text-xs text-gray-400 mt-1.5 max-w-sm text-center leading-relaxed">
            Escoja un hallazgo del panel izquierdo para auditar la información general de la brecha, formular planes de mitigación técnica, adjuntar archivos de evidencias o ver la trazabilidad de aprobaciones.
          </p>
        </div>
      )}

      {/* METRICS DASHBOARD MODAL */}
      {showMetricsModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in backdrop-blur-xs">
          <div className="bg-white w-full max-w-2xl border border-crema/20 rounded-sm shadow-xl overflow-hidden font-sans">
            <div className="bg-gris-azulado text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-cobre" />
                <h3 className="text-xs font-extrabold uppercase tracking-widest font-display">
                  Métricas Globales de Hallazgos - Codelco Dashboard
                </h3>
              </div>
              <button onClick={() => setShowMetricsModal(false)} className="text-white/80 hover:text-white cursor-pointer focus:outline-none">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto max-h-[80vh]">
              {/* Average Remediation times */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold text-gray-700 uppercase tracking-wider border-b pb-1">
                  Tiempo Promedio de Remediación por Criticidad
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-red-50 rounded-sm border border-red-100 text-center">
                    <span className="text-[10px] uppercase font-bold text-red-700">🔴 Crítica</span>
                    <p className="text-lg font-extrabold text-red-900 mt-1">3.2 Días</p>
                    <span className="text-[9px] text-emerald-600 font-semibold">Meta 5d ✓</span>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-sm border border-orange-100 text-center">
                    <span className="text-[10px] uppercase font-bold text-orange-700">🟠 Alta</span>
                    <p className="text-lg font-extrabold text-orange-900 mt-1">7.8 Días</p>
                    <span className="text-[9px] text-emerald-600 font-semibold">Meta 10d ✓</span>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-sm border border-amber-100 text-center">
                    <span className="text-[10px] uppercase font-bold text-amber-700">🟡 Media</span>
                    <p className="text-lg font-extrabold text-amber-900 mt-1">12.5 Días</p>
                    <span className="text-[9px] text-emerald-600 font-semibold">Meta 15d ✓</span>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-sm border border-emerald-100 text-center">
                    <span className="text-[10px] uppercase font-bold text-emerald-700">🟢 Baja</span>
                    <p className="text-lg font-extrabold text-emerald-950 mt-1">16.2 Días</p>
                    <span className="text-[9px] text-emerald-600 font-semibold">Meta 20d ✓</span>
                  </div>
                </div>
              </div>

              {/* Progress and compliance bars */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center text-xs font-bold text-gray-700 mb-1">
                    <span>CUMPLIMIENTO GLOBAL DE SLA</span>
                    <span className="text-cobre">87% (SLA Promedio)</span>
                  </div>
                  <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden flex">
                    <div className="bg-cobre h-full rounded-full" style={{ width: '87%' }}></div>
                  </div>
                </div>

                {/* Distribution of origin */}
                <div className="space-y-2">
                  <span className="text-xs font-extrabold text-gray-700 uppercase tracking-wider block">Distribución por Origen del Reporte</span>
                  <div className="space-y-2 text-[11px] text-gray-600 font-sans">
                    <div className="space-y-1">
                      <div className="flex justify-between font-semibold">
                        <span>Ethical Hacking (Pentesting)</span>
                        <span>40%</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-xs overflow-hidden">
                        <div className="bg-gris-azulado h-full" style={{ width: '40%' }}></div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between font-semibold">
                        <span>Evaluación de Controles Ciberseguridad</span>
                        <span>30%</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-xs overflow-hidden">
                        <div className="bg-cobre h-full" style={{ width: '30%' }}></div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between font-semibold">
                        <span>Análisis de Código Estático (DAST/SAST)</span>
                        <span>20%</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-xs overflow-hidden">
                        <div className="bg-oro h-full" style={{ width: '20%' }}></div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between font-semibold">
                        <span>Escaner Automatizado de Infraestructura</span>
                        <span>10%</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-xs overflow-hidden">
                        <div className="bg-verde-petroleo h-full" style={{ width: '10%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status breakdowns */}
                <div className="space-y-2">
                  <span className="text-xs font-extrabold text-gray-700 uppercase tracking-wider block">Estado de Hallazgos en Sistema</span>
                  <div className="grid grid-cols-5 gap-2 text-center text-[10px] font-bold">
                    <div className="bg-purple-50 text-purple-700 p-2 rounded-xs border border-purple-100">
                      <span>NUEVO</span>
                      <p className="text-sm font-extrabold mt-0.5">15%</p>
                    </div>
                    <div className="bg-blue-50 text-azul p-2 rounded-xs border border-blue-100">
                      <span>EN REMED.</span>
                      <p className="text-sm font-extrabold mt-0.5">45%</p>
                    </div>
                    <div className="bg-amber-50 text-oro p-2 rounded-xs border border-amber-100">
                      <span>REVISIÓN</span>
                      <p className="text-sm font-extrabold mt-0.5">25%</p>
                    </div>
                    <div className="bg-emerald-50 text-verde-petroleo p-2 rounded-xs border border-emerald-100">
                      <span>CERRADO</span>
                      <p className="text-sm font-extrabold mt-0.5">20%</p>
                    </div>
                    <div className="bg-orange-50 text-cobre p-2 rounded-xs border border-orange-100 text-ellipsis overflow-hidden">
                      <span>WAIVER</span>
                      <p className="text-sm font-extrabold mt-0.5">8%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 flex justify-end border-t border-gray-100">
              <button
                onClick={() => setShowMetricsModal(false)}
                className="bg-cobre hover:bg-cobre-oscuro text-white px-5 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-wider font-display focus:outline-none transition-all cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
