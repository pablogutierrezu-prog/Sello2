import React, { useState, useMemo, useEffect } from 'react';
import { DacRequest, SupplierEvaluation, SelloType, UserRole, DacState } from '../types';
import {
  Gavel,
  Shield,
  ShieldAlert,
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
  Award,
  RefreshCw,
  Sliders,
  Settings,
  ShieldCheck,
  Check,
  FileText,
  ArrowLeft,
  ArrowRight,
  Save,
  Send,
  Lock,
  Users,
  CheckCircle2,
  Sparkles,
  Info,
  HelpCircle,
  DollarSign
} from 'lucide-react';

interface LicitacionesProps {
  dacs: DacRequest[];
  currentRole: UserRole;
  onUpdateDacState: (id: string, newState: DacState) => void;
  onSelectDac: (id: string | null) => void;
}

// 10 Standard ISO 27001 Controls for Codelco Cybersecurity Seal Audit
interface AuditControl {
  id: string;
  name: string;
  desc: string;
  category: string;
}

const AUDIT_CONTROLS: AuditControl[] = [
  { id: 'A.5', name: 'Políticas de Seguridad', desc: 'Existencia de directrices aprobadas por la gerencia para seguridad de la información.', category: 'Gobernanza' },
  { id: 'A.6', name: 'Organización de Seguridad', desc: 'Asignación de roles, responsabilidades y marco de contacto con autoridades.', category: 'Gobernanza' },
  { id: 'A.7', name: 'Seguridad de Recursos Humanos', desc: 'Controles antes, durante y al término de la relación laboral.', category: 'Personal' },
  { id: 'A.8', name: 'Gestión de Activos', desc: 'Inventario de activos de información y clasificación según confidencialidad.', category: 'Activos' },
  { id: 'A.9', name: 'Control de Acceso', desc: 'Políticas de contraseñas, MFA, y gestión de privilegios de usuario.', category: 'Técnico' },
  { id: 'A.10', name: 'Criptografía', desc: 'Cifrado de datos en tránsito y en reposo para protección de secretos.', category: 'Técnico' },
  { id: 'A.12', name: 'Seguridad de Operaciones', desc: 'Procedimientos documentados, protección contra malware, respaldos periódicos.', category: 'Operaciones' },
  { id: 'A.13', name: 'Seguridad de Comunicaciones', desc: 'Segmentación de redes, firewalls, cifrado en canales de red.', category: 'Redes' },
  { id: 'A.14', name: 'Desarrollo de Sistemas', desc: 'Ciclo de vida de desarrollo seguro (SDLC) y control de cambios.', category: 'Desarrollo' },
  { id: 'A.15', name: 'Relación con Proveedores', desc: 'Acuerdos de confidencialidad y auditorías de seguridad a subcontratistas.', category: 'Terceros' }
];

// Defined Navigation Sections matching user instructions
type NavigationSection =
  | 'INICIO'
  | 'PRESENTACION'
  | 'ARQUITECTURA'
  | 'CONTROLES'
  | 'PRESUPUESTO'
  | 'SLAS'
  | 'RESOLUCION'
  | 'ANEXOS';

export default function LicitacionesView({
  dacs,
  currentRole,
  onUpdateDacState,
  onSelectDac
}: LicitacionesProps) {
  
  // Find dacs of type Licitación
  const licitaciones = useMemo(() => {
    return dacs.filter(d => d.type === 'Licitación');
  }, [dacs]);

  const [activeDacId, setActiveDacId] = useState<string>(() => {
    const initialLicitacion = licitaciones[0] || dacs.find(d => d.type === 'Licitación') || dacs[1] || dacs[0];
    return initialLicitacion?.id || '';
  });

  const activeDac = useMemo(() => {
    return dacs.find(d => d.id === activeDacId) || licitaciones[0] || dacs[0];
  }, [dacs, activeDacId, licitaciones]);

  // Selected Section (formerly Sheet Tab)
  const [activeSection, setActiveSection] = useState<NavigationSection>('INICIO');
  const [mobileSectionsOpen, setMobileSectionsOpen] = useState<boolean>(false);

  // Supplier state inside current active DAC (Ensure we always have 4 suppliers as per PDF)
  const [localSuppliers, setLocalSuppliers] = useState<SupplierEvaluation[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('s1');

  // Dynamic state for control scores per supplier: Record<supplierId, Record<controlId, score>>
  const [controlsState, setControlsState] = useState<Record<string, Record<string, number>>>({});
  const [controlsObservations, setControlsObservations] = useState<Record<string, Record<string, string>>>({});

  // 1. Ponderación de Marcos and Aspecto a Evaluar state
  const [wtGobierno, setWtGobierno] = useState<number>(40);
  const [wtBitsight, setWtBitsight] = useState<number>(30);
  const [wtAmbito, setWtAmbito] = useState<number>(30);

  // Scores of the 4 Empresas in the three categories
  const [weightedScores, setWeightedScores] = useState<Record<string, { gobierno: number; bitsight: number; ambito: number }>>({
    's1': { gobierno: 92, bitsight: 88, ambito: 90 },
    's2': { gobierno: 85, bitsight: 74, ambito: 80 },
    's3': { gobierno: 55, bitsight: 60, ambito: 50 },
    's4': { gobierno: 95, bitsight: 92, ambito: 94 }
  });

  // Budget parameters state
  const [hhBase, setHhBase] = useState<number>(40);
  const [costPerHour, setCostPerHour] = useState<number>(150);
  const [adminCosts, setAdminCosts] = useState<number>(5000);
  const [volumeDiscount, setVolumeDiscount] = useState<number>(10);

  // New matching budget state to replicate "6. Presupuesto Servicio"
  const [budgetConsulting, setBudgetConsulting] = useState<string>('5400');
  const [budgetLicensing, setBudgetLicensing] = useState<string>('2100');
  const [budgetPentesting, setBudgetPentesting] = useState<string>('3500');

  // Success notifications toast
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Chosen winner for resolution page
  const [chosenWinnerId, setChosenWinnerId] = useState<string>('s1');
  const [conclusionText, setConclusionText] = useState<string>(
    'El Oferente cumple satisfactoriamente con los requisitos de ciberseguridad exigidos por Codelco, demostrando la capacidad de garantizar la integridad, confidencialidad y disponibilidad de la información en sus procesos. No se identifican brechas relevantes que impidan su adjudicación o el avance posterior de la solución a Producción.'
  );
  const [recommendationsText, setRecommendationsText] = useState<string>(
    '1. Mantener actualizados los certificados de seguridad trimestralmente.\n2. Habilitar MFA obligatorio en todos los puntos de conexión externos.\n3. Ejecutar análisis estático de código (SAST) antes de cada entrega de software.'
  );

  // Dynamic project inputs (Ficha Licitación sheet)
  const [projectInputs, setProjectInputs] = useState({
    projectName: '',
    jpName: '',
    jpEmail: '',
    jpPhone: '',
    jpCargo: '',
    division: 'Gerencia de Abastecimiento',
    specialistName: 'Especialista encargado de consolidar este informe',
    marcosEvaluados: 'ISO 27001 + NIST + Bitsight',
    serviciosEjecutados: 'Licitación',
    url: 'https://fundicion.codelco.cl/api/v1',
    criticidad: 'Alto' as 'Crítico' | 'Alto' | 'Medio' | 'Bajo',
    startDate: '2026-08-01',
    durationMonths: 12
  });

  // Hoja 0: Responsables and metadata
  const [responsables, setResponsables] = useState({
    proyecto: { nombre: 'Juan Pérez', cargo: 'Jefe de Proyecto TI' },
    licitacion: { nombre: 'María González', cargo: 'Encargada de Licitaciones' },
    gestion: { nombre: 'Carlos Rodríguez', cargo: 'Analista Ciberseguridad IT/OT' },
    servicio: { nombre: 'Ana Morales', cargo: 'Líder Técnico de Negocio' },
    evaluacion: { nombre: 'Andrés Silva', cargo: 'Especialista Ciberseguridad' }
  });

  const [fechaDac, setFechaDac] = useState('29/06/2026');
  const [numeroDac, setNumeroDac] = useState('');

  // Page 1 States: Ficha de Presentación / Alcance (Power Apps styled web form states)
  const [grafosCeco, setGrafosCeco] = useState('GG-3001-2026 / CeCo 4102');
  const [firmadoJP, setFirmadoJP] = useState(false);
  const [descFuncionalidad, setDescFuncionalidad] = useState('Plataforma web integrada para la monitorización en tiempo real de variables de ciberseguridad industrial y redes operacionales (OT).');
  const [responsableLicitacion, setResponsableLicitacion] = useState('María González');
  const [cantidadProveedores, setCantidadProveedores] = useState(4);

  // Page 2 States: Arquitectura de Seguridad (Excel to Power Apps mapping)
  const [logicalLocation, setLogicalLocation] = useState({
    rag: true,
    risc: false,
    dmz: false,
    cloud: true
  });

  const [networkSiteLocation, setNetworkSiteLocation] = useState({
    interna: true,
    proveedorExterno: false
  });

  const [exposureAccess, setExposureAccess] = useState({
    internet: true,
    redInterna: true,
    usuariosExternos: false,
    usuariosInternos: true,
    remotoTerceros: true,
    autenticacionDefinidos: true
  });

  const [deploymentModel, setDeploymentModel] = useState({
    onPremise: false,
    cloud: true,
    hibrido: false
  });

  const [cloudServiceType, setCloudServiceType] = useState({
    saas: true,
    paas: false,
    iaas: false
  });

  const [hasIntegrations, setHasIntegrations] = useState<'si' | 'no'>('si');

  const [integrationTypes, setIntegrationTypes] = useState({
    conexionDirectaBD: false,
    integracionAPIs: true,
    autenticacionSSO: true,
    mensajeriaEventos: false,
    transferenciaArchivos: true,
    transferenciaAPIsTerceros: false,
    comunicacionInternaDirecta: false,
    cargaPuntualManual: true
  });

  // Marcos de Seguridad (Pestaña 3)
  const [marcosSeleccionados, setMarcosSeleccionados] = useState({
    evalBitsight: true,
    marcoGobierno: true,
    evalCloud_cloud: true,
    evalCloud_integracion: true,
    evalOnPrem_desarrollo: false,
    evalOnPrem_integracion: false,
    evalDesarrolloSeguro_desarrollo: true,
    evalComponenteIntegracion_integracion: true
  });

  const [comentariosMarco, setComentariosMarco] = useState(
    "El Marco de Gobierno es obligatorio y transversal para cualquier tipo de evaluación. Dado el modelo de despliegue y las integraciones de red detectadas, se han seleccionado adicionalmente los Marcos de Ciberseguridad Cloud e Integración para asegurar los controles de exposición de APIs corporativas."
  );

  const [excepcionesConsiderar, setExcepcionesConsiderar] = useState(
    "En esta pestaña se detalla que no existen excepciones temporales ni permanentes asociadas a la tecnología actual del aplicativo. Todos los controles del estándar GCRT-P-001 son plenamente exigibles para la licitación en curso."
  );

  // Tecnología del aplicativo checkboxes
  const [tecnologia, setTecnologia] = useState({
    movil: false,
    web: true,
    local: false,
    llm: false,
    agente: false,
    otro: false,
    otroDetalle: ''
  });

  // Caracterización del activo (single select radio value)
  const [caracterizacionActivo, setCaracterizacionActivo] = useState('evaluacion_aplicativo'); // 'evaluacion_funcionalidad' | 'evaluacion_aplicativo' | 'evaluacion_portal' | 'evaluacion_portal_masivo'

  // Proceso de negocio
  const [areaResponsableProc, setAreaResponsableProc] = useState('Gerencia Corporativa de Tecnología y Ciberseguridad');
  const [divisionesSoporte, setDivisionesSoporte] = useState('División Ventanas, División Chuquicamata, División El Teniente');
  const [isValidadoResponsable, setIsValidadoResponsable] = useState<'si' | 'no'>('si');
  
  const [tipoInfo, setTipoInfo] = useState({
    confidencial: true,
    usoInterno: true,
    accesoGeneral: false,
    informacionPersonal: false
  });

  const [valoracionActivo, setValoracionActivo] = useState<'Critico' | 'Muy Alto' | 'Alto' | 'Medio' | 'Bajo'>('Alto');

  const [procesoNegocioApoya, setProcesoNegocioApoya] = useState({
    recursosReservas: false,
    fure: false,
    gestionProyectos: true,
    comercializacionCobre: false,
    mincohidro: false,
    otro: false,
    otroDetalle: ''
  });

  // Financieras y Operación
  const [costoEstimado, setCostoEstimado] = useState('USD 45.000 - USD 74.999');
  const [cantidadUsuarios, setCantidadUsuarios] = useState('75 a 149 usuarios');
  const [temporalidadAplicativo, setTemporalidadAplicativo] = useState('Permanente - Producción (mayor a 12 meses)');

  // States for Responsable de Arquitectura review (Page 1 bottom)
  const [arquitectoReview, setArquitectoReview] = useState<'Suficiente' | 'Suficiente con observaciones' | 'Insuficiente'>('Suficiente');
  const [arquitectoComments, setArquitectoComments] = useState('La arquitectura propuesta a nivel de diseño cumple satisfactoriamente con la topología RAG/DMZ. Se aprueba la continuación del flujo de licitación.');
  const [firmadoArquitecto, setFirmadoArquitecto] = useState(false);

  // Role permissions checks
  const canEditPresentacion = useMemo(() => ['JP', 'RESP_GESTION', 'ADMIN'].includes(currentRole), [currentRole]);
  const canEditArquitecturaReview = useMemo(() => ['RESP_ARQUITECTO_SEG', 'ADMIN'].includes(currentRole), [currentRole]);
  const canEditArquitectura = useMemo(() => ['JP', 'RESP_GESTION', 'ADMIN'].includes(currentRole), [currentRole]);
  const canEditControles = useMemo(() => ['GERENTE_APROBADORA', 'RESP_GESTION', 'ADMIN'].includes(currentRole), [currentRole]);
  const canEditPresupuesto = useMemo(() => ['RESP_PRESUPUESTO_EY', 'RESP_EVAL_TECNICA_EY', 'RESP_EVAL_DOC_EY', 'ADMIN'].includes(currentRole), [currentRole]);
  const canEditSlas = useMemo(() => ['GERENTE_APROBADORA', 'JP', 'RESP_GESTION', 'ADMIN'].includes(currentRole), [currentRole]);
  const canEditResolucion = useMemo(() => ['GERENTE_APROBADORA', 'RESP_GESTION', 'ADMIN'].includes(currentRole), [currentRole]);

  // Helper banner for read-only vs editable mode feedback
  const renderRoleBanner = (isEditable: boolean, allowedRolesText: string) => {
    return (
      <div className={`p-3.5 rounded-sm flex items-center justify-between border ${
        isEditable 
          ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900 shadow-3xs' 
          : 'bg-amber-50/50 border-amber-200 text-amber-900 shadow-3xs'
      } text-xs font-sans mb-5`}>
        <div className="flex items-center gap-2.5">
          {isEditable ? (
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </div>
          ) : (
            <Lock className="w-4 h-4 text-amber-600 shrink-0" />
          )}
          <div>
            <span className="font-extrabold text-xs">Modo {isEditable ? 'Edición Habilitada' : 'Solo Lectura'}:</span>{' '}
            <span className="text-[11px] text-gray-600 font-medium">
              {isEditable 
                ? `Tu rol (${currentRole}) tiene permisos de escritura.` 
                : `No tienes permisos de edición. Editable solo por: ${allowedRolesText}.`}
            </span>
          </div>
        </div>
        <span className={`px-2.5 py-0.5 rounded-sm font-black text-[9px] uppercase tracking-wider font-mono shadow-3xs ${
          isEditable ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
        }`}>
          {currentRole}
        </span>
      </div>
    );
  };

  // Sync states when active DAC changes
  useEffect(() => {
    if (activeDac) {
      setNumeroDac(`DAC ${activeDac.id.substring(0, 4)}L`);
      // Set project inputs
      setProjectInputs({
        projectName: activeDac.projectName,
        jpName: activeDac.jpName,
        jpEmail: activeDac.jpEmail,
        jpPhone: activeDac.jpPhone || '+56 2 2690 3000',
        jpCargo: activeDac.jpCargo || 'Jefe de Proyecto TI',
        division: 'División Ventanas',
        specialistName: 'Especialista Corporativo de Ciberseguridad',
        marcosEvaluados: 'ISO 27001 + NIST + Bitsight',
        serviciosEjecutados: 'Licitación',
        url: 'https://fundicion.codelco.cl/api/v1',
        criticidad: activeDac.criticidad,
        startDate: activeDac.startDate,
        durationMonths: activeDac.durationMonths
      });

      // Always populate with 4 standard companies (Empresa 1 to 4) as required by PDF and user
      const defaultSuppliersList: SupplierEvaluation[] = [
        { id: 's1', name: 'Sonda S.A. (Empresa 1)', rut: '96.502.120-K', contact: 'contacto@sonda.com', marco: 'ISO 27001 + Bitsight', date: '21/06/2026', score: 91, seal: 'Verde', evidences: [] },
        { id: 's2', name: 'Entel Digital (Empresa 2)', rut: '96.804.310-2', contact: 'soporte@enteldigital.cl', marco: 'ISO 27001 + Bitsight', date: '22/06/2026', score: 80, seal: 'Amarillo', evidences: [] },
        { id: 's3', name: 'Kyndryl Chile (Empresa 3)', rut: '76.402.110-5', contact: 'info@kyndryl.com', marco: 'ISO 27001 + Bitsight', date: '23/06/2026', score: 55, seal: 'Rojo', evidences: [] },
        { id: 's4', name: 'Accenture S.A. (Empresa 4)', rut: '89.430.200-3', contact: 'chile.admin@accenture.com', marco: 'ISO 27001 + Bitsight', date: '24/06/2026', score: 94, seal: 'Verde', evidences: [] }
      ];

      setLocalSuppliers(defaultSuppliersList);
      setSelectedSupplierId('s1');
      setChosenWinnerId('s1');

      // Initialize detailed controls for each supplier if not already initialized
      const newControlsState = { ...controlsState };
      const newObservationsState = { ...controlsObservations };

      defaultSuppliersList.forEach(sup => {
        if (!newControlsState[sup.id]) {
          const baseScore = sup.score;
          newControlsState[sup.id] = {};
          newObservationsState[sup.id] = {};

          AUDIT_CONTROLS.forEach((ctrl, index) => {
            let variation = 0;
            if (index % 3 === 0) variation = 4;
            if (index % 3 === 1) variation = -6;
            if (index % 3 === 2) variation = 2;

            const initialVal = sup.id === 's3' 
              ? Math.min(75, Math.max(30, baseScore + variation * 2))
              : Math.min(100, Math.max(20, baseScore + variation));

            newControlsState[sup.id][ctrl.id] = Math.round(initialVal);
            newObservationsState[sup.id][ctrl.id] = sup.id === 's3'
              ? `Control cuenta con brechas de implementación técnica.`
              : `Auditoría documental valida el nivel de madurez reportado en evidencias.`;
          });
        }
      });

      setControlsState(newControlsState);
      setControlsObservations(newObservationsState);
    }
  }, [activeDacId]);

  // Recalculate average score for a supplier based on active control values (used in Controles section)
  const getRecalculatedSupplierScore = (supplierId: string) => {
    const supControls = controlsState[supplierId];
    if (!supControls) return 0;
    const values = Object.values(supControls) as number[];
    const total = values.reduce((sum: number, val: number) => sum + val, 0);
    return Math.round(total / AUDIT_CONTROLS.length);
  };

  // Map score to Codelco Seal
  const getSealFromScore = (score: number): SelloType => {
    if (score >= 90) return 'Verde';
    if (score >= 70) return 'Amarillo';
    return 'Rojo';
  };

  const getSelloColor = (seal: SelloType) => {
    switch (seal) {
      case 'Verde':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Amarillo':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Rojo':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Sync section 2 scores with section 3 (the control checklist updates "gobierno" score of section 2 dynamically!)
  useEffect(() => {
    const updatedScores = { ...weightedScores };
    let changed = false;
    Object.keys(controlsState).forEach(supId => {
      const avgControlScore = getRecalculatedSupplierScore(supId);
      if (updatedScores[supId] && updatedScores[supId].gobierno !== avgControlScore) {
        updatedScores[supId].gobierno = avgControlScore;
        changed = true;
      }
    });
    if (changed) {
      setWeightedScores(updatedScores);
    }
  }, [controlsState]);

  // Compute the final weighted score for a supplier (from Section 2 Ponderations)
  const getFinalWeightedScore = (supId: string) => {
    const scores = weightedScores[supId];
    if (!scores) return 0;
    const totalWeight = wtGobierno + wtBitsight + wtAmbito;
    if (totalWeight === 0) return 0;
    const weightedSum =
      scores.gobierno * wtGobierno +
      scores.bitsight * wtBitsight +
      scores.ambito * wtAmbito;
    return Math.round(weightedSum / totalWeight);
  };

  // Computed properties of active suppliers reflecting live edits (based on final weighted score)
  const computedSuppliers = useMemo(() => {
    return localSuppliers.map(sup => {
      const liveScore = getFinalWeightedScore(sup.id);
      const liveSeal = getSealFromScore(liveScore);
      return {
        ...sup,
        score: liveScore,
        seal: liveSeal
      };
    });
  }, [localSuppliers, weightedScores, wtGobierno, wtBitsight, wtAmbito]);

  // Active supplier selected for detail inspection
  const activeSupplier = useMemo(() => {
    return computedSuppliers.find(s => s.id === selectedSupplierId) || computedSuppliers[0];
  }, [computedSuppliers, selectedSupplierId]);

  // Live budget calculations with parameters
  const budgetCalc = useMemo(() => {
    const qty = computedSuppliers.length || 4;
    const totalHh = hhBase * qty;
    const subtotalAuditoria = totalHh * costPerHour;
    const totalBruto = subtotalAuditoria + adminCosts;
    const isDiscountApplicable = qty > 2;
    const discountAmount = isDiscountApplicable ? totalBruto * (volumeDiscount / 100) : 0;
    const totalNeto = totalBruto - discountAmount;
    return { qty, totalHh, subtotalAuditoria, totalBruto, discountAmount, totalNeto, isDiscountApplicable };
  }, [computedSuppliers, hhBase, costPerHour, adminCosts, volumeDiscount]);

  const handleUpdateControlScore = (supplierId: string, controlId: string, value: number) => {
    setControlsState(prev => ({
      ...prev,
      [supplierId]: {
        ...prev[supplierId],
        [controlId]: value
      }
    }));
  };

  const handleUpdateControlObservation = (supplierId: string, controlId: string, text: string) => {
    setControlsObservations(prev => ({
      ...prev,
      [supplierId]: {
        ...prev[supplierId],
        [controlId]: text
      }
    }));
  };

  const handleApproveLicitacion = () => {
    if (!activeDac) return;
    onUpdateDacState(activeDac.id, 'RESULTADO LICITACIÓN APROBADO');
    showToast(`🏆 Dictamen final y adjudicación de Sello oficiales registrados para la licitación del DAC ${activeDac.id}. Datos sincronizados de forma inmutable.`);
  };

  const showToast = (message: string) => {
    setSuccessToast(message);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const getSelloBadgeDetails = (seal: SelloType) => {
    switch (seal) {
      case 'Verde':
        return {
          title: 'AUTORIZADO CYBER',
          subtitle: 'CUMPLIMIENTO TOTAL',
          bgColor: 'bg-emerald-600',
          textColor: 'text-emerald-100',
          borderColor: 'border-emerald-700',
          bgLight: 'bg-emerald-50 text-emerald-800 border-emerald-200'
        };
      case 'Amarillo':
        return {
          title: 'AUTORIZADO CYBER',
          subtitle: 'CON OBSERVACIONES',
          bgColor: 'bg-amber-500',
          textColor: 'text-amber-100',
          borderColor: 'border-amber-600',
          bgLight: 'bg-amber-50 text-amber-800 border-amber-200'
        };
      case 'Rojo':
        return {
          title: 'NO AUTORIZADO CYBER',
          subtitle: 'NO CUMPLE',
          bgColor: 'bg-rose-600',
          textColor: 'text-rose-100',
          borderColor: 'border-rose-700',
          bgLight: 'bg-rose-50 text-rose-800 border-rose-200'
        };
      default:
        return {
          title: 'EVALUACIÓN',
          subtitle: 'PENDIENTE',
          bgColor: 'bg-gray-500',
          textColor: 'text-gray-100',
          borderColor: 'border-gray-600',
          bgLight: 'bg-gray-100 text-gray-800 border-gray-200'
        };
    }
  };

  // Navigations metadata representing exactly what is requested (0 to 7)
  const sections = useMemo(() => {
    const isPresentacionLocked = !canEditPresentacion && !canEditArquitecturaReview;
    const isArquitecturaLocked = !canEditArquitectura;
    const isControlesLocked = !canEditControles;
    const isPresupuestoLocked = !canEditPresupuesto;
    const isSlasLocked = !canEditSlas;
    const isResolucionLocked = !canEditResolucion;

    return [
      { id: 'INICIO', label: '0. Inicio', icon: Clock, desc: 'Introducción al proceso consolidado de obtención de Sellos para Licitaciones Codelco.', locked: false },
      { id: 'PRESENTACION', label: '1. Presentación del Servicio', icon: isPresentacionLocked ? Lock : FileText, desc: 'Resumen del alcance general del proyecto, jefatura y proveedores oferentes.', locked: isPresentacionLocked },
      { id: 'ARQUITECTURA', label: '2. Arquitectura de Seg.', icon: isArquitecturaLocked ? Lock : Database, desc: 'Ponderación porcentual de marcos y tabla general de evaluación técnica.', locked: isArquitecturaLocked },
      { id: 'CONTROLES', label: '3. Controles de Seguridad', icon: isControlesLocked ? Lock : Sliders, desc: 'Comprobación técnica interactiva de los 10 dominios de seguridad ISO 27001.', locked: isControlesLocked },
      { id: 'PRESUPUESTO', label: '4. Presupuesto Servicio', icon: isPresupuestoLocked ? Lock : Calculator, desc: 'Simulación de carga de horas y costos de evaluación según HU-18.', locked: isPresupuestoLocked },
      { id: 'SLAS', label: '5. Consideraciones y SLAs', icon: isSlasLocked ? Lock : ShieldAlert, desc: 'Tiempos de respuesta requeridos, criticidades corporativas y plazos.', locked: isSlasLocked },
      { id: 'RESOLUCION', label: '6. Resolución', icon: isResolucionLocked ? Lock : Gavel, desc: 'Dictamen oficial de sellado de ciberseguridad y conclusión ejecutiva.', locked: isResolucionLocked },
      { id: 'ANEXOS', label: '7. Anexos (Sellos)', icon: Award, desc: 'Detalle de sellado inmutable, descargas oficiales de insignias y certificados.', locked: false }
    ] as { id: NavigationSection; label: string; icon: any; desc: string; locked: boolean }[];
  }, [canEditPresentacion, canEditArquitecturaReview, canEditArquitectura, canEditControles, canEditPresupuesto, canEditSlas, canEditResolucion]);

  // All sections are visible to all roles (read-only if they don't have edit permission)
  const visibleSections = sections;

  const handleSectionClick = (secId: NavigationSection) => {
    setActiveSection(secId);
    setMobileSectionsOpen(false);
  };

  const currentIndex = visibleSections.findIndex(s => s.id === activeSection);
  const currentSection = visibleSections[currentIndex];

  const handlePrevSection = () => {
    if (currentIndex > 0) {
      setActiveSection(visibleSections[currentIndex - 1].id);
    }
  };

  const handleNextSection = () => {
    if (currentIndex < visibleSections.length - 1) {
      setActiveSection(visibleSections[currentIndex + 1].id);
    }
  };

  const progressPercent = activeDac?.state === 'RESULTADO LICITACIÓN APROBADO' ? 100 : 80;

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] w-full overflow-hidden text-xs bg-gray-50 animate-fade-in" id="licitaciones-view">
      
      {/* Mobile navigation header bar */}
      <div className="lg:hidden bg-white border-b border-crema/20 p-4 flex items-center justify-between shadow-xs shrink-0 w-full" id="licitaciones-mobile-bar">
        <div className="min-w-0 flex-1 pr-2">
          <p className="text-[10px] uppercase font-bold text-gray-400">Sección Activa</p>
          <p className="font-extrabold text-cobre text-sm leading-tight truncate">
            {visibleSections.find(s => s.id === activeSection)?.label}
          </p>
        </div>
        <button
          onClick={() => setMobileSectionsOpen(!mobileSectionsOpen)}
          className="px-3.5 py-2 bg-cobre hover:bg-cobre-oscuro text-white text-[10px] font-bold uppercase tracking-wider rounded-sm shadow-xs flex items-center gap-1.5 cursor-pointer focus:outline-none shrink-0"
          id="toggle-sections-mobile"
        >
          <span>{mobileSectionsOpen ? 'Ocultar Secciones' : 'Ver Secciones'}</span>
          <span className="text-xs">{mobileSectionsOpen ? '▲' : '▼'}</span>
        </button>
      </div>

      {/* LEFT COLUMN: Section Steps Guide */}
      <div className={`${mobileSectionsOpen ? 'flex' : 'hidden'} lg:flex w-full lg:w-72 bg-white border-b lg:border-b-0 lg:border-r border-crema/20 shrink-0 overflow-y-auto flex-col p-4 md:p-6`} id="licitaciones-sidebar">
        <div className="mb-4">
          <button
            onClick={() => onSelectDac(null)}
            className="text-cobre font-bold uppercase text-[10px] tracking-wider flex items-center hover:underline focus:outline-none cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Volver al Dashboard
          </button>
        </div>

        <div className="border-b border-gray-100 pb-3 mb-4">
          <h3 className="text-xs font-bold text-gris-azulado font-display uppercase tracking-widest leading-tight">
            PROCESO LICITACIÓN
          </h3>
          <span className="text-[10px] text-gray-400 block mt-1 leading-none">
            N° DAC: <strong>{activeDac.id.length === 8 ? `${activeDac.id.slice(0, 4)}-${activeDac.id.slice(4)}` : activeDac.id}</strong>
          </span>
        </div>

        {/* Vertical navigation list */}
        <div className="space-y-1 flex-1">
          {visibleSections.map((sec) => {
            const isCurrent = activeSection === sec.id;
            const SecIcon = sec.icon;
            return (
              <button
                key={sec.id}
                onClick={() => handleSectionClick(sec.id)}
                className={`w-full text-left p-2.5 rounded-sm flex items-start gap-2.5 transition-all focus:outline-none border ${
                  isCurrent
                    ? 'bg-cobre/5 border-cobre text-cobre font-bold'
                    : sec.locked
                    ? 'bg-gray-50 border-transparent text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                    : 'bg-transparent border-transparent text-gray-600 hover:bg-surface-custom/50 hover:text-cobre'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {sec.locked ? (
                    <Lock className={`w-4 h-4 ${isCurrent ? 'text-cobre font-bold' : 'text-gray-400'}`} />
                  ) : isCurrent ? (
                    <SecIcon className="w-4 h-4 text-cobre" />
                  ) : (
                    <SecIcon className="w-4 h-4 text-gray-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1 flex items-center justify-between">
                  <p className="font-semibold text-[11px] leading-tight break-words">{sec.label}</p>
                  {sec.locked && !isCurrent && (
                    <span className="text-[10px] text-gray-400 font-bold ml-1" title="Sección de solo lectura para su rol">🔒</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Dynamic active bidding selector inside sidebar */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1.5 font-sans">
            Licitación Activa:
          </label>
          <div className="relative">
            <select
              value={activeDacId}
              onChange={(e) => setActiveDacId(e.target.value)}
              className="w-full pl-2.5 pr-8 py-1.5 border border-crema/30 rounded-sm bg-white font-semibold text-xs text-gris-azulado focus:outline-none focus:border-cobre appearance-none cursor-pointer"
            >
              {licitaciones.map(l => (
                <option key={l.id} value={l.id}>
                  DAC {l.id} - {l.projectName.substring(0, 16)}...
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2 top-2 pointer-events-none" />
          </div>
        </div>

        {/* Progress bar in sidebar footer */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="flex justify-between text-[10px] font-bold text-gray-500 mb-1.5 font-sans">
            <span>PROGRESO EVALUACIÓN</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div className="bg-cobre h-1.5 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Content space */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col justify-between">
        <div className="space-y-8 max-w-4xl mx-auto w-full">
          
          {/* DYNAMIC NAVIGATION PAGES (0 to 7) */}

          {/* PAGE 0: INICIO */}
          {activeSection === 'INICIO' && (
            <div className="bg-white border border-crema/20 rounded-sm p-6 md:p-8 shadow-xs space-y-6 animate-fade-in" id="pagina-inicio-dac">
              
              {/* Header Excel Replicating Box */}
              <div className="grid grid-cols-12 border border-gray-300 rounded-xs bg-white overflow-hidden text-[11px] select-none font-sans" id="codelco-excel-header">
                {/* Logo Cell (3 cols) */}
                <div className="col-span-12 sm:col-span-3 border-b sm:border-b-0 sm:border-r border-gray-300 p-4 flex flex-col items-center justify-center bg-white text-center">
                  <div className="flex flex-col items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-12 h-12 text-[#E05206]">
                      <circle cx="50" cy="42" r="24" fill="none" stroke="currentColor" strokeWidth="8" />
                      <path d="M50,42 L50,88" stroke="currentColor" strokeWidth="8" strokeLinecap="square" />
                      <path d="M35,66 L65,66" stroke="currentColor" strokeWidth="8" strokeLinecap="square" />
                      <circle cx="50" cy="42" r="10" fill="currentColor" />
                    </svg>
                    <span className="text-[#E05206] font-extrabold text-sm tracking-wider mt-1">CODELCO</span>
                  </div>
                </div>

                {/* Title Cell (5 cols) */}
                <div className="col-span-12 sm:col-span-5 border-b sm:border-b-0 sm:border-r border-gray-300 p-4 flex flex-col justify-center text-center">
                  <h4 className="font-extrabold text-[10px] text-gray-700 tracking-wide mb-1 leading-tight">
                    GERENCIA CORPORATIVA DE CIBERSEGURIDAD Y APLICACIONES DEL NEGOCIO
                  </h4>
                  <div className="h-[1px] bg-gray-200 my-1"></div>
                  <h3 className="font-black text-xs text-gray-900 tracking-normal uppercase leading-tight">
                    DECLARACIÓN DE ALCANCE DE CIBERSEGURIDAD (DAC) PARA LICITACIONES
                  </h3>
                </div>

                {/* Confidentiality Cell (2 cols) */}
                <div className="col-span-12 sm:col-span-2 border-b sm:border-b-0 sm:border-r border-gray-300 p-3 flex flex-col items-center justify-center text-center bg-white">
                  <span className="font-extrabold text-[8px] text-red-600 leading-tight uppercase tracking-tighter mb-1.5 block">
                    DOCUMENTO CONFIDENCIAL PROPIEDAD CODELCO
                  </span>
                  <div className="relative flex items-center justify-center">
                    <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center shadow-xs">
                      <span className="text-white font-black text-lg">C</span>
                    </div>
                    <div className="absolute -top-1 -right-1 bg-white p-0.5 rounded-full border border-gray-200">
                      <Lock className="w-3 h-3 text-red-600" />
                    </div>
                  </div>
                </div>

                {/* Risk and Security Cell (2 cols) */}
                <div className="col-span-12 sm:col-span-2 p-3 flex flex-col sm:flex-row items-center justify-center gap-2 bg-white text-center sm:text-left">
                  <div className="p-2 bg-cyan-50 text-cyan-700 rounded-full border border-cyan-200 shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-[9px] text-cyan-900 tracking-tighter leading-none uppercase">RIESGO TECNOLÓGICO</p>
                    <p className="text-[8px] text-gray-500 font-mono font-bold leading-none mt-0.5">Ciberseguridad IT/OT</p>
                  </div>
                </div>
              </div>

              {/* IMPORTANT Purple-Striped Box */}
              <div className="grid grid-cols-1 md:grid-cols-12 border border-[#8b1e60]/20 rounded-xs overflow-hidden" id="codelco-excel-important">
                <div 
                  className="md:col-span-2 p-4 text-center font-black text-white uppercase flex items-center justify-center tracking-widest text-[11px]"
                  style={{ backgroundImage: 'repeating-linear-gradient(45deg, #7d1c5a, #7d1c5a 10px, #8c2468 10px, #8c2468 20px)' }}
                >
                  IMPORTANTE
                </div>
                <div className="md:col-span-10 p-4 bg-[#fcf0f7] text-[#8b1e60] text-xs font-sans italic leading-relaxed flex items-center">
                  <p>
                    Pestaña inicial que contiene las instrucciones generales y las definiciones clave del documento. <br className="hidden md:inline" />
                    <strong>Debe ser revisada en su totalidad antes de completar el DAC</strong>, con el fin de asegurar un entendimiento claro, preciso y consistente de los conceptos, criterios y campos requeridos, permitiendo así una correcta y homogénea completitud del documento.
                  </p>
                </div>
              </div>

              {/* Responsables and Metadata Grid */}
              <div className="grid grid-cols-12 gap-6" id="codelco-excel-responsables">
                {/* Left side: Responsables table */}
                <div className="col-span-12 lg:col-span-9 space-y-2">
                  <div className="overflow-x-auto border border-gray-300 rounded-xs">
                    <table className="w-full border-collapse text-left font-sans text-[11px]">
                      <thead>
                        <tr className="bg-[#e05206] text-white font-extrabold text-xs">
                          <th className="p-2 border-r border-gray-300 w-1/3">Responsables</th>
                          <th className="p-2 border-r border-gray-300 w-1/3">Nombre y Apellido</th>
                          <th className="p-2 w-1/3">Cargo</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-300 text-gray-800">
                        <tr className="bg-white">
                          <td className="p-2 font-bold bg-gray-50 border-r border-gray-300">Responsable del Proyecto</td>
                          <td className="p-1 border-r border-gray-300">
                            <input
                              type="text"
                              value={responsables.proyecto.nombre}
                              onChange={(e) => setResponsables({
                                ...responsables,
                                proyecto: { ...responsables.proyecto, nombre: e.target.value }
                              })}
                              className="w-full px-2 py-1 bg-transparent hover:bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-500 font-medium text-xs text-gray-900 rounded-xs"
                              placeholder="Escriba nombre..."
                            />
                          </td>
                          <td className="p-1">
                            <input
                              type="text"
                              value={responsables.proyecto.cargo}
                              onChange={(e) => setResponsables({
                                ...responsables,
                                proyecto: { ...responsables.proyecto, cargo: e.target.value }
                              })}
                              className="w-full px-2 py-1 bg-transparent hover:bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-500 text-xs text-gray-900 rounded-xs"
                              placeholder="Escriba cargo..."
                            />
                          </td>
                        </tr>
                        <tr className="bg-white">
                          <td className="p-2 font-bold bg-gray-50 border-r border-gray-300">Responsable Proceso de Licitación</td>
                          <td className="p-1 border-r border-gray-300">
                            <input
                              type="text"
                              value={responsables.licitacion.nombre}
                              onChange={(e) => setResponsables({
                                ...responsables,
                                licitacion: { ...responsables.licitacion, nombre: e.target.value }
                              })}
                              className="w-full px-2 py-1 bg-transparent hover:bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-500 font-medium text-xs text-gray-900 rounded-xs"
                              placeholder="Escriba nombre..."
                            />
                          </td>
                          <td className="p-1">
                            <input
                              type="text"
                              value={responsables.licitacion.cargo}
                              onChange={(e) => setResponsables({
                                ...responsables,
                                licitacion: { ...responsables.licitacion, cargo: e.target.value }
                              })}
                              className="w-full px-2 py-1 bg-transparent hover:bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-500 text-xs text-gray-900 rounded-xs"
                              placeholder="Escriba cargo..."
                            />
                          </td>
                        </tr>
                        <tr className="bg-white">
                          <td className="p-2 font-bold bg-gray-50 border-r border-gray-300">Responsable Gestión Evaluación</td>
                          <td className="p-1 border-r border-gray-300">
                            <input
                              type="text"
                              value={responsables.gestion.nombre}
                              onChange={(e) => setResponsables({
                                ...responsables,
                                gestion: { ...responsables.gestion, nombre: e.target.value }
                              })}
                              className="w-full px-2 py-1 bg-transparent hover:bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-500 font-medium text-xs text-gray-900 rounded-xs"
                              placeholder="Escriba nombre..."
                            />
                          </td>
                          <td className="p-1">
                            <input
                              type="text"
                              value={responsables.gestion.cargo}
                              onChange={(e) => setResponsables({
                                ...responsables,
                                gestion: { ...responsables.gestion, cargo: e.target.value }
                              })}
                              className="w-full px-2 py-1 bg-transparent hover:bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-500 text-xs text-gray-900 rounded-xs"
                              placeholder="Escriba cargo..."
                            />
                          </td>
                        </tr>
                        <tr className="bg-white">
                          <td className="p-2 font-bold bg-gray-50 border-r border-gray-300">Responsable Servicio Contratado</td>
                          <td className="p-1 border-r border-gray-300">
                            <input
                              type="text"
                              value={responsables.servicio.nombre}
                              onChange={(e) => setResponsables({
                                ...responsables,
                                servicio: { ...responsables.servicio, nombre: e.target.value }
                              })}
                              className="w-full px-2 py-1 bg-transparent hover:bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-500 font-medium text-xs text-gray-900 rounded-xs"
                              placeholder="Escriba nombre..."
                            />
                          </td>
                          <td className="p-1">
                            <input
                              type="text"
                              value={responsables.servicio.cargo}
                              onChange={(e) => setResponsables({
                                ...responsables,
                                servicio: { ...responsables.servicio, cargo: e.target.value }
                              })}
                              className="w-full px-2 py-1 bg-transparent hover:bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-500 text-xs text-gray-900 rounded-xs"
                              placeholder="Escriba cargo..."
                            />
                          </td>
                        </tr>
                        <tr className="bg-white">
                          <td className="p-2 font-bold bg-gray-50 border-r border-gray-300">Responsable Evaluación</td>
                          <td className="p-1 border-r border-gray-300">
                            <input
                              type="text"
                              value={responsables.evaluacion.nombre}
                              onChange={(e) => setResponsables({
                                ...responsables,
                                evaluacion: { ...responsables.evaluacion, nombre: e.target.value }
                              })}
                              className="w-full px-2 py-1 bg-transparent hover:bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-500 font-medium text-xs text-gray-900 rounded-xs"
                              placeholder="Escriba nombre..."
                            />
                          </td>
                          <td className="p-1">
                            <input
                              type="text"
                              value={responsables.evaluacion.cargo}
                              onChange={(e) => setResponsables({
                                ...responsables,
                                evaluacion: { ...responsables.evaluacion, cargo: e.target.value }
                              })}
                              className="w-full px-2 py-1 bg-transparent hover:bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-500 text-xs text-gray-900 rounded-xs"
                              placeholder="Escriba cargo..."
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Right side: Fecha and DAC N° table */}
                <div className="col-span-12 lg:col-span-3 flex flex-col justify-start">
                  <div className="border border-gray-300 rounded-xs overflow-hidden">
                    <table className="w-full border-collapse text-left font-sans text-[11px]">
                      <tbody>
                        <tr className="border-b border-gray-300 bg-white">
                          <td className="p-3 font-extrabold bg-[#e05206] text-white text-center w-24">Fecha</td>
                          <td className="p-2 bg-[#f4f4f4]">
                            <input
                              type="text"
                              value={fechaDac}
                              onChange={(e) => setFechaDac(e.target.value)}
                              className="w-full text-center px-1 py-0.5 bg-transparent font-bold font-mono text-xs text-gray-700 focus:outline-none"
                            />
                          </td>
                        </tr>
                        <tr className="bg-white">
                          <td className="p-3 font-extrabold bg-[#e05206] text-white text-center">DAC N°</td>
                          <td className="p-2 bg-[#f4f4f4]">
                            <input
                              type="text"
                              value={numeroDac}
                              onChange={(e) => setNumeroDac(e.target.value)}
                              className="w-full text-center px-1 py-0.5 bg-transparent font-bold font-mono text-xs text-gray-700 focus:outline-none"
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Instructions Box */}
              <div className="border border-gray-300 rounded-xs overflow-hidden bg-white" id="codelco-excel-instructions">
                <div className="bg-[#e05206] text-white p-2.5 text-center font-extrabold text-xs tracking-wider uppercase">
                  Instrucciones
                </div>
                <div className="p-5 space-y-4 text-gray-800 leading-relaxed text-xs">
                  <div>
                    <h5 className="font-bold text-gray-950 mb-1 text-sm">¿Qué es el DAC?</h5>
                    <p className="font-sans text-gray-700">
                      El DAC - Licitaciones (Declaración de Alcance de Ciberseguridad para licitaciones) es un documento que reúne la información esencial necesaria para que Ciberseguridad pueda analizar, estimar y asignar los servicios requeridos dentro de una licitación tecnológica.
                    </p>
                  </div>

                  <div>
                    <p className="mb-3 font-sans text-gray-700">
                      Este formulario permite comprender el alcance de la solución, identificar el tipo de información que manejará el aplicativo y así determinar qué revisiones o requerimientos de seguridad deben aplicarse durante el proceso. Su propósito es asegurar que la evaluación de ciberseguridad se ejecute de manera clara, trazable y coherente.
                    </p>
                    <p className="font-sans text-gray-700">
                      El documento se estructura en secciones diseñadas para capturar antecedentes técnicos y funcionales relevantes del servicio solicitado, considerando los distintos escenarios en los que podría implementarse.
                    </p>
                  </div>

                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-[#e05206] font-extrabold uppercase tracking-wide text-[11px] font-sans">
                      IMPORTANTE: en la parte superior de cada pestaña del archivo se indica el responsable encargado de ingresar la información solicitada.
                    </p>
                  </div>
                </div>
              </div>

              {/* Sheets Navigation Matrix */}
              <div className="space-y-3" id="codelco-excel-sheets-map">
                <h4 className="font-bold text-gris-azulado uppercase text-[11px] tracking-wider mb-2">
                  Estructura y Hojas del Proceso
                </h4>
                
                <div className="overflow-x-auto border border-gray-300 rounded-xs">
                  <table className="w-full border-collapse text-left font-sans text-xs">
                    <thead>
                      <tr className="bg-gray-100 border-b border-gray-300 text-gray-800 font-extrabold text-xs">
                        <th className="p-3 border-r border-gray-300 w-1/4">Hoja</th>
                        <th className="p-3 w-3/4">Descripción de la hoja</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-gray-700 bg-white">
                      <tr className="hover:bg-gray-50/50">
                        <td className="p-3 border-r border-gray-300 font-bold">
                          <button
                            onClick={() => handleSectionClick('PRESENTACION')}
                            className="text-blue-600 hover:text-blue-800 font-extrabold hover:underline focus:outline-none cursor-pointer text-left text-xs"
                          >
                            1. Presentación del Servicio
                          </button>
                        </td>
                        <td className="p-3 text-gray-600">
                          Define el contexto general de la solución, incluyendo la caracterización del activo, la necesidad del servicio y la información del proceso de negocio que dicho activo soporta.
                        </td>
                      </tr>
                      <tr className="hover:bg-gray-50/50">
                        <td className="p-3 border-r border-gray-300 font-bold">
                          <button
                            onClick={() => handleSectionClick('ARQUITECTURA')}
                            className="text-blue-600 hover:text-blue-800 font-extrabold hover:underline focus:outline-none cursor-pointer text-left text-xs"
                          >
                            2. Arquitectura de Seguridad
                          </button>
                        </td>
                        <td className="p-3 text-gray-600">
                          Describe la ubicación lógica y de red, infraestructura involucrada, niveles de exposición e integraciones relevantes.
                        </td>
                      </tr>
                      <tr className="hover:bg-gray-50/50">
                        <td className="p-3 border-r border-gray-300 font-bold">
                          <button
                            onClick={() => handleSectionClick('CONTROLES')}
                            className="text-blue-600 hover:text-blue-800 font-extrabold hover:underline focus:outline-none cursor-pointer text-left text-xs"
                          >
                            3. Controles de Seguridad
                          </button>
                        </td>
                        <td className="p-3 text-gray-600">
                          Selecciona los controles de seguridad y marcos de referencia aplicables a la evaluación.
                        </td>
                      </tr>
                      <tr className="hover:bg-gray-50/50">
                        <td className="p-3 border-r border-gray-300 font-bold">
                          <button
                            onClick={() => handleSectionClick('PRESUPUESTO')}
                            className="text-blue-600 hover:text-blue-800 font-extrabold hover:underline focus:outline-none cursor-pointer text-left text-xs"
                          >
                            4. Presupuesto Servicio
                          </button>
                        </td>
                        <td className="p-3 text-gray-600">
                          Detalla la estimación de esfuerzos y horas para la evaluación inicial de la solución tecnológica.
                        </td>
                      </tr>
                      <tr className="hover:bg-gray-50/50">
                        <td className="p-3 border-r border-gray-300 font-bold">
                          <button
                            onClick={() => handleSectionClick('SLAS')}
                            className="text-blue-600 hover:text-blue-800 font-extrabold hover:underline focus:outline-none cursor-pointer text-left text-xs"
                          >
                            5. Consideraciones y SLAs
                          </button>
                        </td>
                        <td className="p-3 text-gray-600">
                          Contiene los cantidad de días propuestos para cada paso del Proceso Sello Evaluación Ciberseguridad
                        </td>
                      </tr>
                      <tr className="hover:bg-gray-50/50">
                        <td className="p-3 border-r border-gray-300 font-bold">
                          <button
                            onClick={() => handleSectionClick('RESOLUCION')}
                            className="text-blue-600 hover:text-blue-800 font-extrabold hover:underline focus:outline-none cursor-pointer text-left text-xs"
                          >
                            6. Resolución
                          </button>
                        </td>
                        <td className="p-3 text-gray-600">
                          Esta hoja consolida los resultados finales de la evaluación de ciberseguridad del aplicativo. Incluye el detalle por marco y servicio, el resultado final (Sello de Ciberseguridad), y la conclusión ejecutiva.
                        </td>
                      </tr>
                      <tr className="hover:bg-gray-50/50">
                        <td className="p-3 border-r border-gray-300 font-bold">
                          <button
                            onClick={() => handleSectionClick('ANEXOS')}
                            className="text-blue-600 hover:text-blue-800 font-extrabold hover:underline focus:outline-none cursor-pointer text-left text-xs"
                          >
                            7. Anexos
                          </button>
                        </td>
                        <td className="p-3 text-gray-600">
                          Sección en donde se presentan los tipos de sellos de resolución final del DAC.
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Additional Considerations */}
              <div className="p-5 border border-gray-300 bg-gray-50 rounded-xs space-y-2.5 text-xs text-gray-800" id="codelco-excel-additional-considerations">
                <h5 className="font-extrabold text-gray-900 tracking-wide text-[13px]">
                  Consideraciones adicionales:
                </h5>
                <ul className="space-y-2 list-disc pl-5 font-sans text-gray-700">
                  <li className="leading-relaxed">
                    Cada campo debe ser completado o seleccionado conforme al alcance de la solución que se someterá a revisión por la Gerencia Corporativa de Ciberseguridad IT/OT y Riesgo Tecnológico.
                  </li>
                  <li className="leading-relaxed">
                    La precisión y completitud de la información entregada permitirá definir adecuadamente las actividades y estimar los tiempos de ejecución de los marcos que apliquen para la evaluación.
                  </li>
                </ul>
              </div>

            </div>
          )}

          {/* PAGE 1: PRESENTACIÓN DEL SERVICIO (REDISEÑADO CON EL ESTILO REAL E IMPONENTE DE LA HOJA 1 DE IMPLEMENTACIÓN) */}
          {activeSection === 'PRESENTACION' && (
            <div className="space-y-6 animate-fade-in font-sans" id="pagina-presentacion-form">
              {renderRoleBanner(canEditPresentacion, "Jefe de Proyecto TI (JP), Responsable del Sistema o Administrador")}

              {/* CARD 1: CONTROL DEL DOCUMENTO */}
              <div className="bg-white border border-crema/20 rounded-sm p-6 md:p-8 shadow-xs space-y-6">
                <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-cobre font-display uppercase tracking-wider flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-cobre" />
                      Control del Documento
                    </h3>
                    <p className="text-[10px] text-gray-400 font-sans mt-0.5">
                      Establece el folio oficial de SharePoint y la firma digital del responsable del sistema.
                    </p>
                  </div>
                  <span className="text-[10px] text-verde-petroleo font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full uppercase font-mono">
                    HOJA_1 (CONTROL)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="block font-bold text-gray-600">
                      Folio Único DAC
                    </label>
                    <input
                      type="text"
                      value={numeroDac}
                      onChange={(e) => setNumeroDac(e.target.value)}
                      disabled={!canEditPresentacion || firmadoJP}
                      className="w-full px-2.5 py-1.5 bg-gray-50 border border-crema/20 rounded-sm font-mono font-bold text-xs text-gris-azulado focus:outline-none disabled:opacity-75 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block font-bold text-gray-600">
                      Fecha Oficial Registro
                    </label>
                    <input
                      type="text"
                      value={fechaDac}
                      onChange={(e) => setFechaDac(e.target.value)}
                      disabled={!canEditPresentacion || firmadoJP}
                      className="w-full px-2.5 py-1.5 bg-gray-50 border border-crema/20 rounded-sm font-mono text-xs text-gris-azulado focus:outline-none disabled:opacity-75 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block font-bold text-gray-600">
                      Código CeCo / Grafos Licitación
                    </label>
                    <input
                      type="text"
                      value={grafosCeco}
                      onChange={(e) => setGrafosCeco(e.target.value)}
                      disabled={!canEditPresentacion || firmadoJP}
                      className="w-full px-2.5 py-1.5 bg-white border border-crema/30 rounded-sm font-mono text-xs text-gris-azulado focus:outline-none focus:border-cobre disabled:bg-gray-50 disabled:cursor-not-allowed"
                      placeholder="Ej: CeCo 4102 / GG-3001"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block font-bold text-gray-600">
                      Jefe de Proyecto TI Asignado
                    </label>
                    <input
                      type="text"
                      value={projectInputs.jpName}
                      onChange={(e) => setProjectInputs({ ...projectInputs, jpName: e.target.value })}
                      disabled={!canEditPresentacion || firmadoJP}
                      className="w-full px-2.5 py-1.5 bg-white border border-crema/30 rounded-sm text-xs text-gris-azulado focus:outline-none focus:border-cobre disabled:bg-gray-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* MODULO DE FIRMA (Aprobación Digital JP) */}
                <div className="pt-4 border-t border-gray-100 space-y-3 bg-surface-custom/25 p-4 border border-dashed rounded-sm">
                  <span className="block text-xs font-bold text-gris-azulado uppercase tracking-wider">
                    Firmar Formulario (Aprobación Digital JP):
                  </span>

                  {!firmadoJP ? (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <p className="text-[11px] text-gray-500 leading-relaxed max-w-xl">
                        Al presionar el botón inferior, registrará su identidad como Jefe de Proyecto TI a cargo, oficializando la Declaración de Alcance de Ciberseguridad (DAC) para el proceso de licitación.
                      </p>
                      <button
                        type="button"
                        disabled={!canEditPresentacion}
                        onClick={() => {
                          setFirmadoJP(true);
                          showToast('✍️ Firma del JP registrada con éxito para la Declaración de Alcance (DAC).');
                        }}
                        className="py-2.5 px-6 bg-cobre hover:bg-cobre-oscuro text-white font-bold text-xs uppercase tracking-wider rounded-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer focus:outline-none shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Lock className="w-4 h-4" />
                        Registrar Firma del JP
                      </button>
                    </div>
                  ) : (
                    <div className="border border-emerald-200 bg-emerald-50/50 p-4 space-y-2 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="p-0.5 bg-emerald-600 text-white rounded-xs">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-extrabold text-[10px] text-verde-petroleo uppercase tracking-wide">
                            FIRMA DIGITAL COMPROBADA
                          </span>
                        </div>
                        <p className="text-[11px] text-verde-petroleo leading-snug font-sans">
                          Solicitud firmada digitalmente por <strong>{projectInputs.jpName || responsables.proyecto.nombre}</strong> el {fechaDac}. Formulario asegurado contra cambios accidentales.
                        </p>
                      </div>

                      <button
                        type="button"
                        disabled={!canEditPresentacion}
                        onClick={() => {
                          setFirmadoJP(false);
                          showToast('🔓 Firma digital removida. El alcance vuelve a estar editable.');
                        }}
                        className="text-xs font-bold text-cobre hover:underline focus:outline-none cursor-pointer shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Revocar Firma / Editar Nuevamente
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* CARD 2: FORMULARIO PRESTACIÓN DE SERVICIOS */}
              <div className="bg-white border border-crema/20 rounded-sm p-6 md:p-8 shadow-xs space-y-6">
                    
                    {/* Header de la Sección */}
                    <div className="border-b border-gray-100 pb-3">
                      <h3 className="text-sm font-bold text-cobre font-display uppercase tracking-wider flex items-center">
                        <FileText className="w-5 h-5 mr-2 text-cobre" />
                        1. FORMULARIO PRESTACIÓN DE SERVICIOS
                      </h3>
                      <p className="text-[10px] text-gray-400 font-sans mt-0.5">
                        Paso obligatorio: Caracterización técnica y variables del aplicativo del oferente.
                      </p>
                    </div>

                    {/* Contenido del Formulario */}
                    <div className="space-y-6 text-xs">
                      
                      {/* SECCIÓN A: Datos Generales */}
                      <div className="space-y-3">
                        <span className="font-display font-bold text-xs uppercase text-gris-azulado tracking-wider block border-b border-gray-100 pb-1.5">
                          A. Datos Generales de la Solución
                        </span>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="font-bold text-gray-600 block">
                              Nombre del Proyecto / Aplicativo <span className="text-cobre font-black">*</span>
                            </label>
                            <input
                              type="text"
                              value={projectInputs.projectName}
                              onChange={(e) => setProjectInputs({ ...projectInputs, projectName: e.target.value })}
                              disabled={!canEditPresentacion || firmadoJP}
                              className="w-full px-2.5 py-1.5 border border-crema/30 rounded-sm bg-white focus:outline-none focus:border-cobre text-xs disabled:bg-gray-50 disabled:cursor-not-allowed"
                              placeholder="Escriba nombre de la licitación o sistema"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="font-bold text-gray-600 block">
                              Responsable Proceso de Licitación <span className="text-cobre font-black">*</span>
                            </label>
                            <input
                              type="text"
                              value={responsableLicitacion}
                              onChange={(e) => setResponsableLicitacion(e.target.value)}
                              disabled={!canEditPresentacion || firmadoJP}
                              className="w-full px-2.5 py-1.5 border border-crema/30 rounded-sm bg-white focus:outline-none focus:border-cobre text-xs disabled:bg-gray-50 disabled:cursor-not-allowed"
                              placeholder="Nombre de la encargada de licitaciones"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                          <div className="md:col-span-8 space-y-1">
                            <label className="font-bold text-gray-600 block">
                              Breve descripción de la funcionalidad <span className="text-cobre font-black">*</span>
                            </label>
                            <textarea
                              value={descFuncionalidad}
                              onChange={(e) => setDescFuncionalidad(e.target.value)}
                              disabled={!canEditPresentacion || firmadoJP}
                              rows={3}
                              className="w-full px-2.5 py-1.5 border border-crema/30 rounded-sm bg-white focus:outline-none focus:border-cobre text-xs leading-relaxed resize-none disabled:bg-gray-50 disabled:cursor-not-allowed"
                              placeholder="Indique el propósito, lógica de negocio y características clave del aplicativo"
                            />
                          </div>

                          <div className="md:col-span-4 space-y-1">
                            <label className="font-bold text-gray-600 block">
                              Oferentes a evaluar <span className="text-cobre font-black">*</span>
                            </label>
                            <div className="relative">
                              <input
                                type="number"
                                min="1"
                                max="10"
                                value={cantidadProveedores}
                                onChange={(e) => setCantidadProveedores(parseInt(e.target.value) || 1)}
                                disabled={!canEditPresentacion || firmadoJP}
                                className="w-full px-2.5 py-1.5 border border-crema/30 rounded-sm bg-white focus:outline-none focus:border-cobre font-mono font-bold text-xs disabled:bg-gray-50 disabled:cursor-not-allowed"
                              />
                              <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-[9px] font-bold text-gray-400 uppercase bg-gray-50 border-l border-crema/20 px-2 rounded-r-sm">
                                Empresas
                              </div>
                            </div>
                            <p className="text-[9px] text-gray-400 font-semibold leading-tight mt-1">
                              * Se evaluarán hasta {cantidadProveedores} empresas de forma comparativa.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* SECCIÓN B: Tipo de Tecnología */}
                      <div className="space-y-3 pt-3 border-t border-gray-100">
                        <span className="font-display font-bold text-xs uppercase text-gris-azulado tracking-wider block border-b border-gray-100 pb-1.5">
                          B. Tipo de Tecnología del Aplicativo
                        </span>
                        <p className="text-[10px] text-gray-400">Seleccione todas las tecnologías que aplican para este desarrollo.</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {/* Móvil */}
                          <div 
                            onClick={() => setTecnologia({ ...tecnologia, movil: !tecnologia.movil })}
                            className={`p-3 border rounded-sm cursor-pointer select-none transition-colors flex items-start gap-3 ${
                              tecnologia.movil ? 'border-cobre bg-cobre/5' : 'border-crema/20 bg-white hover:bg-surface-custom/30'
                            }`}
                          >
                            <div className={`w-4 h-4 border ${tecnologia.movil ? 'border-cobre bg-cobre' : 'border-gray-300 bg-white'} flex items-center justify-center shrink-0 mt-0.5 rounded-xs`}>
                              {tecnologia.movil && <span className="text-white text-[10px] font-bold">✓</span>}
                            </div>
                            <div>
                              <span className="block font-bold text-xs text-gris-azulado">Aplicación Móvil (Android/iOS)</span>
                              <span className="block text-[10px] text-gray-500 leading-tight mt-0.5">Software optimizado para dispositivos móviles corporativos o privados.</span>
                            </div>
                          </div>

                          {/* Web */}
                          <div 
                            onClick={() => setTecnologia({ ...tecnologia, web: !tecnologia.web })}
                            className={`p-3 border rounded-sm cursor-pointer select-none transition-colors flex items-start gap-3 ${
                              tecnologia.web ? 'border-cobre bg-cobre/5' : 'border-crema/20 bg-white hover:bg-surface-custom/30'
                            }`}
                          >
                            <div className={`w-4 h-4 border ${tecnologia.web ? 'border-cobre bg-cobre' : 'border-gray-300 bg-white'} flex items-center justify-center shrink-0 mt-0.5 rounded-xs`}>
                              {tecnologia.web && <span className="text-white text-[10px] font-bold">✓</span>}
                            </div>
                            <div>
                              <span className="block font-bold text-xs text-gris-azulado">Aplicación Web / Portal</span>
                              <span className="block text-[10px] text-gray-500 leading-tight mt-0.5">Ejecutada en navegadores, con acceso vía protocolo HTTPS corporativo.</span>
                            </div>
                          </div>

                          {/* Local */}
                          <div 
                            onClick={() => setTecnologia({ ...tecnologia, local: !tecnologia.local })}
                            className={`p-3 border rounded-sm cursor-pointer select-none transition-colors flex items-start gap-3 ${
                              tecnologia.local ? 'border-cobre bg-cobre/5' : 'border-crema/20 bg-white hover:bg-surface-custom/30'
                            }`}
                          >
                            <div className={`w-4 h-4 border ${tecnologia.local ? 'border-cobre bg-cobre' : 'border-gray-300 bg-white'} flex items-center justify-center shrink-0 mt-0.5 rounded-xs`}>
                              {tecnologia.local && <span className="text-white text-[10px] font-bold">✓</span>}
                            </div>
                            <div>
                              <span className="block font-bold text-xs text-gris-azulado">On-Premise / Servidores Locales</span>
                              <span className="block text-[10px] text-gray-500 leading-tight mt-0.5">Instalación física en salas de servidores internas de Codelco.</span>
                            </div>
                          </div>

                          {/* LLM */}
                          <div 
                            onClick={() => setTecnologia({ ...tecnologia, llm: !tecnologia.llm })}
                            className={`p-3 border rounded-sm cursor-pointer select-none transition-colors flex items-start gap-3 ${
                              tecnologia.llm ? 'border-cobre bg-cobre/5' : 'border-crema/20 bg-white hover:bg-surface-custom/30'
                            }`}
                          >
                            <div className={`w-4 h-4 border ${tecnologia.llm ? 'border-cobre bg-cobre' : 'border-gray-300 bg-white'} flex items-center justify-center shrink-0 mt-0.5 rounded-xs`}>
                              {tecnologia.llm && <span className="text-white text-[10px] font-bold">✓</span>}
                            </div>
                            <div>
                              <span className="block font-bold text-xs text-gris-azulado">Modelos de IA / LLM (Inteligencia Artificial)</span>
                              <span className="block text-[10px] text-gray-500 leading-tight mt-0.5">Incorporación de LLMs generativos, redes neuronales o APIs de IA.</span>
                            </div>
                          </div>

                          {/* Agente */}
                          <div 
                            onClick={() => setTecnologia({ ...tecnologia, agente: !tecnologia.agente })}
                            className={`p-3 border rounded-sm cursor-pointer select-none transition-colors flex items-start gap-3 ${
                              tecnologia.agente ? 'border-cobre bg-cobre/5' : 'border-crema/20 bg-white hover:bg-surface-custom/30'
                            }`}
                          >
                            <div className={`w-4 h-4 border ${tecnologia.agente ? 'border-cobre bg-cobre' : 'border-gray-300 bg-white'} flex items-center justify-center shrink-0 mt-0.5 rounded-xs`}>
                              {tecnologia.agente && <span className="text-white text-[10px] font-bold">✓</span>}
                            </div>
                            <div>
                              <span className="block font-bold text-xs text-gris-azulado">Agentes Inteligentes Autónomos</span>
                              <span className="block text-[10px] text-gray-500 leading-tight mt-0.5">Software con autonomía funcional para toma de decisiones sobre datos.</span>
                            </div>
                          </div>

                          {/* Otro */}
                          <div 
                            onClick={() => setTecnologia({ ...tecnologia, otro: !tecnologia.otro })}
                            className={`p-3 border rounded-sm cursor-pointer select-none transition-colors flex flex-col gap-2 ${
                              tecnologia.otro ? 'border-cobre bg-cobre/5' : 'border-crema/20 bg-white hover:bg-surface-custom/30'
                            }`}
                          >
                            <div className="flex items-start gap-3 w-full">
                              <div className={`w-4 h-4 border ${tecnologia.otro ? 'border-cobre bg-cobre' : 'border-gray-300 bg-white'} flex items-center justify-center shrink-0 mt-0.5 rounded-xs`}>
                                {tecnologia.otro && <span className="text-white text-[10px] font-bold">✓</span>}
                              </div>
                              <div className="grow">
                                <span className="block font-bold text-xs text-gris-azulado">Otras Tecnologías (SCADA/IoT/PLCs)</span>
                                <span className="block text-[10px] text-gray-500 leading-tight mt-0.5">Redes industriales operacionales (OT) o dispositivos de campo especializados.</span>
                              </div>
                            </div>
                            {tecnologia.otro && (
                              <div className="w-full pt-1.5" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="text"
                                  value={tecnologia.otroDetalle}
                                  onChange={(e) => setTecnologia({ ...tecnologia, otroDetalle: e.target.value })}
                                  className="w-full px-2.5 py-1.5 border border-cobre bg-white text-xs rounded-sm outline-none focus:outline-none"
                                  placeholder="Especifique tipo de hardware o tecnología..."
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* SECCIÓN C: Caracterización del Activo */}
                      <div className="space-y-3 pt-3 border-t border-gray-100">
                        <span className="font-display font-bold text-xs uppercase text-gris-azulado tracking-wider block border-b border-gray-100 pb-1.5">
                          C. Caracterización del Activo a Evaluar
                        </span>
                        <p className="text-[10px] text-gray-400">Establece la categoría del activo que definirá los marcos de control aplicados.</p>
                        
                        <div className="space-y-2">
                          {/* Funcionalidad */}
                          <div 
                            onClick={() => setCaracterizacionActivo('evaluacion_funcionalidad')}
                            className={`p-3 border rounded-sm cursor-pointer flex items-center justify-between transition-all ${
                              caracterizacionActivo === 'evaluacion_funcionalidad' ? 'border-cobre bg-cobre/5' : 'border-crema/20 bg-white hover:bg-surface-custom/30'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-4 h-4 border rounded-full ${caracterizacionActivo === 'evaluacion_funcionalidad' ? 'border-cobre' : 'border-gray-300'} bg-white flex items-center justify-center shrink-0`}>
                                {caracterizacionActivo === 'evaluacion_funcionalidad' && <div className="w-2.5 h-2.5 bg-cobre rounded-full"></div>}
                              </div>
                              <div>
                                <span className="font-bold text-xs text-gris-azulado">Evaluación de Funcionalidad</span>
                                <p className="text-[10px] text-gray-500 mt-0.5">Análisis enfocado puramente en un alcance funcional o módulo complementario acotado.</p>
                              </div>
                            </div>
                            <span className="text-[9px] font-mono bg-gray-50 text-gray-600 px-2 py-0.5 border border-crema/10 font-bold uppercase rounded-sm">FUNCIONALIDAD</span>
                          </div>

                          {/* Aplicativo */}
                          <div 
                            onClick={() => setCaracterizacionActivo('evaluacion_aplicativo')}
                            className={`p-3 border rounded-sm cursor-pointer flex items-center justify-between transition-all ${
                              caracterizacionActivo === 'evaluacion_aplicativo' ? 'border-cobre bg-cobre/5' : 'border-crema/20 bg-white hover:bg-surface-custom/30'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-4 h-4 border rounded-full ${caracterizacionActivo === 'evaluacion_aplicativo' ? 'border-cobre' : 'border-gray-300'} bg-white flex items-center justify-center shrink-0`}>
                                {caracterizacionActivo === 'evaluacion_aplicativo' && <div className="w-2.5 h-2.5 bg-cobre rounded-full"></div>}
                              </div>
                              <div>
                                <span className="font-bold text-xs text-gris-azulado">Evaluación de Aplicativo (Selección por Defecto)</span>
                                <p className="text-[10px] text-gray-500 mt-0.5">Revisión profunda a nivel de infraestructura, base de datos y lógica del aplicativo del proveedor.</p>
                              </div>
                            </div>
                            <span className="text-[9px] font-mono bg-gray-50 text-gray-600 px-2 py-0.5 border border-crema/10 font-bold uppercase rounded-sm">APLICATIVO_STANDARD</span>
                          </div>

                          {/* Portal */}
                          <div 
                            onClick={() => setCaracterizacionActivo('evaluacion_portal')}
                            className={`p-3 border rounded-sm cursor-pointer flex items-center justify-between transition-all ${
                              caracterizacionActivo === 'evaluacion_portal' ? 'border-cobre bg-cobre/5' : 'border-crema/20 bg-white hover:bg-surface-custom/30'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-4 h-4 border rounded-full ${caracterizacionActivo === 'evaluacion_portal' ? 'border-cobre' : 'border-gray-300'} bg-white flex items-center justify-center shrink-0`}>
                                {caracterizacionActivo === 'evaluacion_portal' && <div className="w-2.5 h-2.5 bg-cobre rounded-full"></div>}
                              </div>
                              <div>
                                <span className="font-bold text-xs text-gris-azulado">Evaluación de Portal</span>
                                <p className="text-[10px] text-gray-500 mt-0.5">Sistemas con múltiples integraciones, autenticación federada AD, e interfaces de usuario avanzadas.</p>
                              </div>
                            </div>
                            <span className="text-[9px] font-mono bg-gray-50 text-gray-600 px-2 py-0.5 border border-crema/10 font-bold uppercase rounded-sm">PORTAL_INTRA</span>
                          </div>

                          {/* Portal Masivo */}
                          <div 
                            onClick={() => setCaracterizacionActivo('evaluacion_portal_masivo')}
                            className={`p-3 border rounded-sm cursor-pointer flex items-center justify-between transition-all ${
                              caracterizacionActivo === 'evaluacion_portal_masivo' ? 'border-cobre bg-cobre/5' : 'border-crema/20 bg-white hover:bg-surface-custom/30'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-4 h-4 border rounded-full ${caracterizacionActivo === 'evaluacion_portal_masivo' ? 'border-cobre' : 'border-gray-300'} bg-white flex items-center justify-center shrink-0`}>
                                {caracterizacionActivo === 'evaluacion_portal_masivo' && <div className="w-2.5 h-2.5 bg-cobre rounded-full"></div>}
                              </div>
                              <div>
                                <span className="font-bold text-xs text-gris-azulado">Evaluación de Portal Público Masivo</span>
                                <p className="text-[10px] text-gray-500 mt-0.5">Exposición pública a internet general, con altos requisitos de mitigación de ataques DDOS/WAF.</p>
                              </div>
                            </div>
                            <span className="text-[9px] font-mono bg-gray-50 text-gray-600 px-2 py-0.5 border border-crema/10 font-bold uppercase rounded-sm">PÚBLICO_EXTERNO</span>
                          </div>
                        </div>
                      </div>

                      {/* SECCIÓN D: Clasificación del Proceso y Tipo de Información */}
                      <div className="space-y-4 pt-3 border-t border-gray-100">
                        <span className="font-display font-bold text-xs uppercase text-gris-azulado tracking-wider block border-b border-gray-100 pb-1.5">
                          D. Clasificación del Proceso y Tipo de Información
                        </span>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="font-bold text-gray-600 block">Área Responsable de la Licitación</label>
                            <input
                              type="text"
                              value={areaResponsableProc}
                              onChange={(e) => setAreaResponsableProc(e.target.value)}
                              className="w-full px-2.5 py-1.5 border border-crema/30 rounded-sm bg-white focus:outline-none focus:border-cobre text-xs"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="font-bold text-gray-600 block">Divisiones que soportarán la solución *</label>
                            <input
                              type="text"
                              value={divisionesSoporte}
                              onChange={(e) => setDivisionesSoporte(e.target.value)}
                              className="w-full px-2.5 py-1.5 border border-crema/30 rounded-sm bg-white focus:outline-none focus:border-cobre text-xs"
                            />
                          </div>
                        </div>

                        {/* Toggle de Validación */}
                        <div className="p-4 border border-crema/10 bg-surface-custom/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-sm">
                          <div className="max-w-md">
                            <span className="block font-bold text-xs text-gris-azulado">¿Clasificación Validada por Responsable de Proceso?</span>
                            <span className="block text-[10px] text-gray-500 mt-0.5">Confirma si el área de negocio ya revisó y visó las clasificaciones dadas a la información.</span>
                          </div>
                          
                          <div className="flex items-center space-x-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => setIsValidadoResponsable('si')}
                              className={`px-3 py-1.5 border font-bold text-[10px] uppercase transition-all rounded-sm cursor-pointer focus:outline-none ${
                                isValidadoResponsable === 'si'
                                  ? 'bg-verde-petroleo text-white border-verde-petroleo'
                                  : 'bg-white text-gray-500 border-crema/30 hover:bg-surface-custom'
                              }`}
                            >
                              SÍ, VALIDADO
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsValidadoResponsable('no')}
                              className={`px-3 py-1.5 border font-bold text-[10px] uppercase transition-all rounded-sm cursor-pointer focus:outline-none ${
                                isValidadoResponsable === 'no'
                                  ? 'bg-cobre text-white border-cobre'
                                  : 'bg-white text-gray-500 border-crema/30 hover:bg-surface-custom'
                              }`}
                            >
                              NO VALIDADO
                            </button>
                          </div>
                        </div>

                        {/* Tipos de Datos y Valoración */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          {/* Tipo de Datos Checkbox List */}
                          <div className="space-y-2">
                            <label className="block font-bold text-gray-600">Tipo de Datos que Maneja el Sistema:</label>
                            <div className="p-3 border border-crema/10 space-y-2.5 bg-white rounded-sm">
                              
                              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                                <div 
                                  onClick={() => setTipoInfo({ ...tipoInfo, confidencial: !tipoInfo.confidencial })}
                                  className={`w-4 h-4 border ${tipoInfo.confidencial ? 'border-cobre bg-cobre' : 'border-gray-300 bg-white'} flex items-center justify-center shrink-0 mt-0.5 rounded-xs`}
                                >
                                  {tipoInfo.confidencial && <span className="text-white text-[10px] font-bold">✓</span>}
                                </div>
                                <div className="min-w-0">
                                  <span className="font-bold text-xs text-gris-azulado">Datos Confidenciales</span>
                                  <p className="text-[10px] text-gray-500 leading-tight">Información de reservas de mineral, secretos técnicos o estrategias.</p>
                                </div>
                              </label>

                              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                                <div 
                                  onClick={() => setTipoInfo({ ...tipoInfo, usoInterno: !tipoInfo.usoInterno })}
                                  className={`w-4 h-4 border ${tipoInfo.usoInterno ? 'border-cobre bg-cobre' : 'border-gray-300 bg-white'} flex items-center justify-center shrink-0 mt-0.5 rounded-xs`}
                                >
                                  {tipoInfo.usoInterno && <span className="text-white text-[10px] font-bold">✓</span>}
                                </div>
                                <div className="min-w-0">
                                  <span className="font-bold text-xs text-gris-azulado">Datos de Uso Interno</span>
                                  <p className="text-[10px] text-gray-500 leading-tight">Documentación operacional que requiere usuario corporativo.</p>
                                </div>
                              </label>

                              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                                <div 
                                  onClick={() => setTipoInfo({ ...tipoInfo, accesoGeneral: !tipoInfo.accesoGeneral })}
                                  className={`w-4 h-4 border ${tipoInfo.accesoGeneral ? 'border-cobre bg-cobre' : 'border-gray-300 bg-white'} flex items-center justify-center shrink-0 mt-0.5 rounded-xs`}
                                >
                                  {tipoInfo.accesoGeneral && <span className="text-white text-[10px] font-bold">✓</span>}
                                </div>
                                <div className="min-w-0">
                                  <span className="font-bold text-xs text-gris-azulado">Datos de Acceso General</span>
                                  <p className="text-[10px] text-gray-500 leading-tight">Información pública, comunicados o manuales genéricos.</p>
                                </div>
                              </label>

                              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                                <div 
                                  onClick={() => setTipoInfo({ ...tipoInfo, informacionPersonal: !tipoInfo.informacionPersonal })}
                                  className={`w-4 h-4 border ${tipoInfo.informacionPersonal ? 'border-cobre bg-cobre' : 'border-gray-300 bg-white'} flex items-center justify-center shrink-0 mt-0.5 rounded-xs`}
                                >
                                  {tipoInfo.informacionPersonal && <span className="text-white text-[10px] font-bold">✓</span>}
                                </div>
                                <div className="min-w-0">
                                  <span className="font-bold text-xs text-gris-azulado">Datos de Carácter Personal (Ley 19.628)</span>
                                  <p className="text-[10px] text-gray-500 leading-tight">RUTs, nombres, correos privados, datos biométricos, sueldos.</p>
                                </div>
                              </label>
                            </div>
                          </div>

                          {/* Valoración Crítica del Negocio */}
                          <div className="space-y-2">
                            <label className="block font-bold text-gray-600">Valoración Crítica del Negocio:</label>
                            <div className="p-3 border border-crema/10 bg-white rounded-sm space-y-3 flex flex-col justify-center h-[142px]">
                              <p className="text-[10px] text-gray-500 leading-snug">
                                Nivel de criticidad operacional si este activo se viera afectado:
                              </p>
                              
                              <div className="grid grid-cols-5 gap-1 bg-gray-50 p-1 border border-crema/10 rounded-sm">
                                {(['Critico', 'Muy Alto', 'Alto', 'Medio', 'Bajo'] as const).map((level) => {
                                  const isSelected = valoracionActivo === level;
                                  let colorClass = '';
                                  if (isSelected) {
                                    if (level === 'Critico') colorClass = 'bg-[#a80000] text-white';
                                    else if (level === 'Muy Alto') colorClass = 'bg-[#d83b01] text-white';
                                    else if (level === 'Alto') colorClass = 'bg-cobre text-white';
                                    else if (level === 'Medio') colorClass = 'bg-gray-500 text-white';
                                    else colorClass = 'bg-gray-400 text-white';
                                  }
                                  return (
                                    <button
                                      key={level}
                                      type="button"
                                      onClick={() => setValoracionActivo(level)}
                                      className={`py-1.5 text-[10px] font-bold uppercase text-center transition-all rounded-xs cursor-pointer focus:outline-none ${
                                        isSelected ? colorClass : 'text-gray-600 hover:bg-gray-100 bg-white'
                                      }`}
                                    >
                                      {level === 'Critico' ? 'Crítico' : level}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Proceso de Negocio Corporativo Codelco que apoya la solución */}
                        <div className="space-y-2 pt-2 border-t border-gray-100">
                          <label className="block font-bold text-gray-600">
                            Proceso de Negocio Corporativo Codelco que apoya la solución:
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 bg-surface-custom/10 p-3 border border-crema/10 rounded-sm">
                            
                            {/* Recursos y Reservas */}
                            <label className="flex items-center gap-2 cursor-pointer select-none p-1 hover:bg-white rounded-xs">
                              <div 
                                onClick={() => setProcesoNegocioApoya({ ...procesoNegocioApoya, recursosReservas: !procesoNegocioApoya.recursosReservas })}
                                className={`w-3.5 h-3.5 border ${procesoNegocioApoya.recursosReservas ? 'border-cobre bg-cobre' : 'border-gray-300 bg-white'} flex items-center justify-center shrink-0 rounded-xs`}
                              >
                                {procesoNegocioApoya.recursosReservas && <span className="text-white text-[9px] font-bold">✓</span>}
                              </div>
                              <span className="font-semibold text-xs text-gris-azulado">Recursos y Reservas</span>
                            </label>

                            {/* FURE */}
                            <label className="flex items-center gap-2 cursor-pointer select-none p-1 hover:bg-white rounded-xs">
                              <div 
                                onClick={() => setProcesoNegocioApoya({ ...procesoNegocioApoya, fure: !procesoNegocioApoya.fure })}
                                className={`w-3.5 h-3.5 border ${procesoNegocioApoya.fure ? 'border-cobre bg-cobre' : 'border-gray-300 bg-white'} flex items-center justify-center shrink-0 rounded-xs`}
                              >
                                {procesoNegocioApoya.fure && <span className="text-white text-[9px] font-bold">✓</span>}
                              </div>
                              <span className="font-semibold text-xs text-gris-azulado">FURE (Fundiciones/Refi.)</span>
                            </label>

                            {/* Proyectos */}
                            <label className="flex items-center gap-2 cursor-pointer select-none p-1 hover:bg-white rounded-xs">
                              <div 
                                onClick={() => setProcesoNegocioApoya({ ...procesoNegocioApoya, gestionProyectos: !procesoNegocioApoya.gestionProyectos })}
                                className={`w-3.5 h-3.5 border ${procesoNegocioApoya.gestionProyectos ? 'border-cobre bg-cobre' : 'border-gray-300 bg-white'} flex items-center justify-center shrink-0 rounded-xs`}
                              >
                                {procesoNegocioApoya.gestionProyectos && <span className="text-white text-[9px] font-bold">✓</span>}
                              </div>
                              <span className="font-semibold text-xs text-gris-azulado">Gestión Proyectos (VP)</span>
                            </label>

                            {/* Comercialización */}
                            <label className="flex items-center gap-2 cursor-pointer select-none p-1 hover:bg-white rounded-xs">
                              <div 
                                onClick={() => setProcesoNegocioApoya({ ...procesoNegocioApoya, comercializacionCobre: !procesoNegocioApoya.comercializacionCobre })}
                                className={`w-3.5 h-3.5 border ${procesoNegocioApoya.comercializacionCobre ? 'border-cobre bg-cobre' : 'border-gray-300 bg-white'} flex items-center justify-center shrink-0 rounded-xs`}
                              >
                                {procesoNegocioApoya.comercializacionCobre && <span className="text-white text-[9px] font-bold">✓</span>}
                              </div>
                              <span className="font-semibold text-xs text-gris-azulado">Comercialización Cobre</span>
                            </label>

                            {/* MinCoHidro */}
                            <label className="flex items-center gap-2 cursor-pointer select-none p-1 hover:bg-white rounded-xs">
                              <div 
                                onClick={() => setProcesoNegocioApoya({ ...procesoNegocioApoya, mincohidro: !procesoNegocioApoya.mincohidro })}
                                className={`w-3.5 h-3.5 border ${procesoNegocioApoya.mincohidro ? 'border-cobre bg-cobre' : 'border-gray-300 bg-white'} flex items-center justify-center shrink-0 rounded-xs`}
                              >
                                {procesoNegocioApoya.mincohidro && <span className="text-white text-[9px] font-bold">✓</span>}
                              </div>
                              <span className="font-semibold text-xs text-gris-azulado">MinCoHidro (Sistemas)</span>
                            </label>

                            {/* Otro */}
                            <div className="flex flex-col gap-1 p-1">
                              <label className="flex items-center gap-2 cursor-pointer select-none">
                                <div 
                                  onClick={() => setProcesoNegocioApoya({ ...procesoNegocioApoya, otro: !procesoNegocioApoya.otro })}
                                  className={`w-3.5 h-3.5 border ${procesoNegocioApoya.otro ? 'border-cobre bg-cobre' : 'border-gray-300 bg-white'} flex items-center justify-center shrink-0 rounded-xs`}
                                >
                                  {procesoNegocioApoya.otro && <span className="text-white text-[9px] font-bold">✓</span>}
                                </div>
                                <span className="font-semibold text-xs text-gris-azulado">Otro Proceso</span>
                              </label>
                              {procesoNegocioApoya.otro && (
                                <input
                                  type="text"
                                  value={procesoNegocioApoya.otroDetalle}
                                  onChange={(e) => setProcesoNegocioApoya({ ...procesoNegocioApoya, otroDetalle: e.target.value })}
                                  className="w-full px-2 py-1 border border-cobre bg-white text-[10px] rounded-sm outline-none mt-1"
                                  placeholder="Escriba proceso de negocio..."
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* SECCIÓN E: Consideraciones Financieras */}
                      <div className="space-y-3 pt-3 border-t border-gray-100">
                        <span className="font-display font-bold text-xs uppercase text-gris-azulado tracking-wider block border-b border-gray-100 pb-1.5">
                          E. Clasificaciones de Operación y Escala Financiera
                        </span>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                          {/* Costo Estimado */}
                          <div className="space-y-2">
                            <span className="block font-bold text-xs text-gris-azulado uppercase pb-1 border-b border-gray-100">
                              Rango Presupuesto Proyecto
                            </span>
                            <div className="space-y-1.5">
                              {[
                                'USD 0 - USD 9.999',
                                'USD 10.000 - USD 19.999',
                                'USD 20.000 - USD 44.999',
                                'USD 45.000 - USD 74.999',
                                'USD 75.000 a USD 99.999',
                                '≥ USD 100.000'
                              ].map((opt) => (
                                <label
                                  key={opt}
                                  onClick={() => setCostoEstimado(opt)}
                                  className={`flex items-center gap-2.5 p-2 border text-[11px] cursor-pointer select-none rounded-sm transition-colors ${
                                    costoEstimado === opt
                                      ? 'border-cobre bg-cobre/5 font-bold text-cobre'
                                      : 'border-crema/10 bg-white hover:bg-surface-custom/30'
                                  }`}
                                >
                                  <div className={`w-3.5 h-3.5 border rounded-full ${costoEstimado === opt ? 'border-cobre' : 'border-gray-300'} bg-white flex items-center justify-center shrink-0`}>
                                    {costoEstimado === opt && <div className="w-2 h-2 bg-cobre rounded-full"></div>}
                                  </div>
                                  {opt}
                                </label>
                              ))}
                            </div>
                          </div>

                          {/* Usuarios Estimados */}
                          <div className="space-y-2">
                            <span className="block font-bold text-xs text-gris-azulado uppercase pb-1 border-b border-gray-100">
                              Usuarios Estimados Activos
                            </span>
                            <div className="space-y-1.5">
                              {[
                                '1 a 24 usuarios',
                                '25 a 74 usuarios',
                                '75 a 149 usuarios',
                                '150 a 499 usuarios',
                                '500 a 999 usuarios',
                                '≥ USD 1.000 usuarios'
                              ].map((opt) => (
                                <label
                                  key={opt}
                                  onClick={() => setCantidadUsuarios(opt)}
                                  className={`flex items-center gap-2.5 p-2 border text-[11px] cursor-pointer select-none rounded-sm transition-colors ${
                                    cantidadUsuarios === opt
                                      ? 'border-cobre bg-cobre/5 font-bold text-cobre'
                                      : 'border-crema/10 bg-white hover:bg-surface-custom/30'
                                  }`}
                                >
                                  <div className={`w-3.5 h-3.5 border rounded-full ${cantidadUsuarios === opt ? 'border-cobre' : 'border-gray-300'} bg-white flex items-center justify-center shrink-0`}>
                                    {cantidadUsuarios === opt && <div className="w-2 h-2 bg-cobre rounded-full"></div>}
                                  </div>
                                  {opt === '≥ USD 1.000 usuarios' ? '≥ 1.000 usuarios' : opt}
                                </label>
                              ))}
                            </div>
                          </div>

                          {/* Temporalidad */}
                          <div className="space-y-2">
                            <span className="block font-bold text-xs text-gris-azulado uppercase pb-1 border-b border-gray-100">
                              Ciclo de Vida del Software
                            </span>
                            <div className="space-y-1.5">
                              {[
                                'Temporal - Piloto/POC (menor a 3 meses)',
                                'Temporal - Proyecto corto (de 3 a 12 meses)',
                                'Permanente - Producción (mayor a 12 meses)'
                              ].map((opt) => (
                                <label
                                  key={opt}
                                  onClick={() => setTemporalidadAplicativo(opt)}
                                  className={`flex items-center gap-2.5 p-2 border text-[11px] cursor-pointer select-none rounded-sm transition-colors ${
                                    temporalidadAplicativo === opt
                                      ? 'border-cobre bg-cobre/5 font-bold text-cobre'
                                      : 'border-crema/10 bg-white hover:bg-surface-custom/30'
                                  }`}
                                >
                                  <div className={`w-3.5 h-3.5 border rounded-full ${temporalidadAplicativo === opt ? 'border-cobre' : 'border-gray-300'} bg-white flex items-center justify-center shrink-0`}>
                                    {temporalidadAplicativo === opt && <div className="w-2 h-2 bg-cobre rounded-full"></div>}
                                  </div>
                                  {opt}
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>

                  </div>

              {/* CARD 3: PROVIDERS IN SHAREPOINT & ACTIONS */}
              <div className="bg-white border border-crema/20 rounded-sm p-6 md:p-8 shadow-xs space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-cobre font-display uppercase tracking-wider flex items-center">
                    <Users className="w-5 h-5 mr-2 text-cobre" />
                    Proveedores en Lista SharePoint ({cantidadProveedores})
                  </h3>
                  <p className="text-[10px] text-gray-400 font-sans mt-0.5">
                    Estos oferentes serán evaluados automáticamente en el siguiente paso de Arquitectura.
                  </p>
                </div>

                {/* SharePoint List Column Headers */}
                <div className="border border-crema/15 rounded-sm overflow-hidden text-xs">
                  <div className="grid grid-cols-12 bg-gray-50 p-3 font-bold text-gris-azulado border-b border-crema/15">
                    <div className="col-span-8">Empresa (Proveedor)</div>
                    <div className="col-span-4 text-right">ID Licitación</div>
                  </div>
                  <div className="divide-y divide-crema/10 bg-white">
                    {computedSuppliers.slice(0, cantidadProveedores).map((sup, idx) => (
                      <div key={sup.id} className="grid grid-cols-12 p-3 hover:bg-surface-custom/35 transition-colors items-center">
                        <div className="col-span-8">
                          <span className="font-bold text-gris-azulado truncate block text-xs">{sup.name.split(' (')[0]}</span>
                          <span className="block text-[10px] text-gray-400 font-mono">RUT: {sup.rut}</span>
                        </div>
                        <div className="col-span-4 text-right">
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 font-mono text-[10px] font-bold rounded-sm">
                            EMP {idx + 1}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
              </div>

              {/* CARD 4: REVISIÓN DE CUMPLIMIENTO - RESPONSABLE DE ARQUITECTURA */}
              <div className="bg-white border border-crema/20 rounded-sm p-6 md:p-8 shadow-xs space-y-6">
                <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-cobre font-display uppercase tracking-wider flex items-center">
                      <Shield className="w-5 h-5 mr-2 text-cobre" />
                      Revisión de Arquitectura de Seguridad (Suficiencia y Cumplimiento)
                    </h3>
                    <p className="text-[10px] text-gray-400 font-sans mt-0.5">
                      Completado por el Responsable de Arquitectura para certificar razonabilidad y nivel de cumplimiento a nivel de diseño.
                    </p>
                  </div>
                  <span className="text-[10px] text-cobre font-bold bg-orange-50 border border-orange-200 px-2.5 py-0.5 rounded-full uppercase font-mono">
                    REVISIÓN ARQUITECTURA
                  </span>
                </div>

                {renderRoleBanner(canEditArquitecturaReview, "Responsable de Arquitectura de Seguridad (RESP_ARQUITECTO_SEG) o Administrador")}

                <div className="space-y-5">
                  {/* Dictamen de Suficiencia */}
                  <div className="space-y-2">
                    <label className="block font-bold text-xs text-gray-700 uppercase tracking-wide">
                      Dictamen de Suficiencia de la Arquitectura Propuesta:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {(['Suficiente', 'Suficiente con observaciones', 'Insuficiente'] as const).map((opt) => {
                        const isSelected = arquitectoReview === opt;
                        const colorClass = 
                          opt === 'Suficiente' 
                            ? isSelected ? 'border-emerald-600 bg-emerald-50/40 text-emerald-950 font-bold' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                            : opt === 'Suficiente con observaciones'
                              ? isSelected ? 'border-amber-600 bg-amber-50/40 text-amber-950 font-bold' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                              : isSelected ? 'border-red-600 bg-red-50/40 text-red-950 font-bold' : 'border-gray-200 text-gray-600 hover:bg-gray-50';

                        const dotColor = 
                          opt === 'Suficiente' 
                            ? 'bg-emerald-600' 
                            : opt === 'Suficiente con observaciones' 
                              ? 'bg-amber-600' 
                              : 'bg-red-600';

                        return (
                          <button
                            type="button"
                            key={opt}
                            disabled={!canEditArquitecturaReview || firmadoArquitecto}
                            onClick={() => setArquitectoReview(opt)}
                            className={`p-3 border rounded-sm flex items-center gap-3 text-left transition-all text-xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${colorClass}`}
                          >
                            <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 bg-white ${
                              isSelected ? (opt === 'Suficiente' ? 'border-emerald-600' : opt === 'Suficiente con observaciones' ? 'border-amber-600' : 'border-red-600') : 'border-gray-300'
                            }`}>
                              {isSelected && <div className={`w-1.5 h-1.5 ${dotColor} rounded-full`}></div>}
                            </div>
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Comentarios del Arquitecto */}
                  <div className="space-y-1">
                    <label className="block font-bold text-xs text-gray-700 uppercase tracking-wide">
                      Suficiencia, razonabilidad y observaciones adicionales:
                    </label>
                    <textarea
                      value={arquitectoComments}
                      onChange={(e) => setArquitectoComments(e.target.value)}
                      disabled={!canEditArquitecturaReview || firmadoArquitecto}
                      rows={4}
                      className="w-full px-3 py-2 border border-crema/30 rounded-sm bg-white focus:outline-none focus:border-cobre text-xs leading-relaxed disabled:bg-gray-50 disabled:cursor-not-allowed"
                      placeholder="Escriba el informe de suficiencia del Responsable de Arquitectura..."
                    />
                  </div>

                  {/* Quick tags for Architect */}
                  {canEditArquitecturaReview && !firmadoArquitecto && (
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="text-[8px] text-gray-400 font-bold uppercase">Respuestas Rápidas:</span>
                      <button
                        type="button"
                        onClick={() => setArquitectoComments(
                          "La arquitectura propuesta a nivel de diseño cumple satisfactoriamente con la topología RAG/DMZ. Se aprueba la continuación del flujo de licitación."
                        )}
                        className="px-2 py-0.5 bg-gray-50 hover:bg-gray-100 text-[8px] font-bold uppercase rounded-sm border border-gray-200 text-gray-600 transition-colors cursor-pointer"
                      >
                        Suficiente Estándar
                      </button>
                      <button
                        type="button"
                        onClick={() => setArquitectoComments(
                          "Se determina que el diseño es Suficiente, pero se levanta la observación de requerir un canal de comunicación encriptado por VPN IPSec dedicado entre Codelco y la nube del oferente antes del despliegue productivo."
                        )}
                        className="px-2 py-0.5 bg-gray-50 hover:bg-gray-100 text-[8px] font-bold uppercase rounded-sm border border-gray-200 text-gray-600 transition-colors cursor-pointer"
                      >
                        Suficiente con VPN Obs
                      </button>
                    </div>
                  )}

                  {/* MODULO DE FIRMA DEL ARQUITECTO */}
                  <div className="pt-4 border-t border-gray-150 space-y-3 bg-surface-custom/25 p-4 border border-dashed rounded-sm">
                    <span className="block text-xs font-bold text-gris-azulado uppercase tracking-wider">
                      Firmar Evaluación de Arquitectura (Responsable de Arquitectura):
                    </span>

                    {!firmadoArquitecto ? (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <p className="text-[11px] text-gray-500 leading-relaxed max-w-xl">
                          Al presionar el botón de la derecha, confirmará su visación digital de la propuesta de arquitectura a nivel de diseño, permitiendo el avance oficial en SharePoint.
                        </p>
                        <button
                          type="button"
                          disabled={!canEditArquitecturaReview}
                          onClick={() => {
                            setFirmadoArquitecto(true);
                            showToast('✍️ Firma del Responsable de Arquitectura registrada exitosamente.');
                          }}
                          className="py-2.5 px-6 bg-cobre hover:bg-cobre-oscuro text-white font-bold text-xs uppercase tracking-wider rounded-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer focus:outline-none shrink-0 disabled:opacity-45 disabled:cursor-not-allowed"
                        >
                          <Lock className="w-4 h-4" />
                          Registrar Firma Arquitectura
                        </button>
                      </div>
                    ) : (
                      <div className="border border-emerald-200 bg-emerald-50/50 p-4 space-y-2 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="p-0.5 bg-emerald-600 text-white rounded-xs">
                              <Check className="w-3.5 h-3.5" />
                            </div>
                            <span className="font-extrabold text-[10px] text-verde-petroleo uppercase tracking-wide">
                              VISACIÓN DE ARQUITECTURA REGISTRADA
                            </span>
                          </div>
                          <p className="text-[11px] text-verde-petroleo leading-snug font-sans">
                            Evaluación visada y cerrada digitalmente por el <strong>Responsable de Arquitectura de Seguridad</strong> el {fechaDac}.
                          </p>
                        </div>

                        <button
                          type="button"
                          disabled={!canEditArquitecturaReview}
                          onClick={() => {
                            setFirmadoArquitecto(false);
                            showToast('🔓 Firma de Arquitectura removida. Sección nuevamente editable.');
                          }}
                          className="text-xs font-bold text-cobre hover:underline focus:outline-none cursor-pointer shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Revocar Firma / Editar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ACCIONES DE NAVEGACIÓN */}
                <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      showToast('💾 Office 365: Borrador guardado localmente en SharePoint de Codelco.');
                    }}
                    className="py-2.5 px-5 bg-white hover:bg-gray-50 text-gris-azulado border border-crema/30 font-bold text-xs uppercase tracking-wide rounded-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer focus:outline-none"
                  >
                    <Save className="w-4 h-4 text-cobre" />
                    Guardar en SharePoint
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSectionClick('ARQUITECTURA')}
                    className="py-2.5 px-6 bg-cobre hover:bg-cobre-oscuro text-white font-bold text-xs uppercase tracking-wide rounded-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-cobre"
                  >
                    Siguiente: Ir a Arquitectura
                    <ArrowRight className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* PAGE 2: ARQUITECTURA DE SEG. */}
          {activeSection === 'ARQUITECTURA' && (
            <div className="space-y-6 animate-fade-in font-sans" id="pagina-arquitectura-form">
              {renderRoleBanner(canEditArquitectura, "Jefe de Proyecto TI (JP), Responsable del Sistema o Administrador")}
              
              {/* CARD 1: FICHA GENERAL DE LA LICITACIÓN (Adapted from Excel Header) */}
              <div className="bg-white border border-crema/20 rounded-sm p-6 shadow-xs space-y-4">
                <div className="border-b border-gray-100 pb-2.5 flex items-center justify-between">
                  <h3 className="text-xs font-black text-cobre font-display uppercase tracking-wider flex items-center">
                    <FileText className="w-4 h-4 mr-1.5 text-cobre" />
                    Información General del Proyecto
                  </h3>
                  <span className="text-[10px] text-cobre font-bold bg-orange-50 border border-orange-200 px-2.5 py-0.5 rounded-full uppercase font-mono">
                    HOJA_2 (DATOS)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs font-sans">
                  {/* Left Column (8 cols in grid) */}
                  <div className="md:col-span-8 border border-gray-200 rounded-sm overflow-hidden divide-y divide-gray-150">
                    <div className="grid grid-cols-12 items-center">
                      <div className="col-span-4 bg-[#e05206] text-white font-extrabold px-3 py-2 text-[11px] uppercase tracking-wider">
                        Nombre de Proyecto:
                      </div>
                      <div className="col-span-8 px-3 py-2 text-gris-azulado font-bold bg-gray-50">
                        {projectInputs.projectName || '0'}
                      </div>
                    </div>

                    <div className="grid grid-cols-12 items-center">
                      <div className="col-span-4 bg-[#e05206] text-white font-extrabold px-3 py-2 text-[11px] uppercase tracking-wider">
                        Nombre Jefe Proyecto (JP):
                      </div>
                      <div className="col-span-8 px-3 py-2 text-gris-azulado font-bold bg-gray-50">
                        {projectInputs.jpName || '0'}
                      </div>
                    </div>

                    <div className="grid grid-cols-12 items-center">
                      <div className="col-span-4 bg-[#e05206] text-white font-extrabold px-3 py-2 text-[11px] uppercase tracking-wider">
                        URL:
                      </div>
                      <div className="col-span-8 px-3 py-2 font-mono text-gray-500 bg-gray-50 truncate">
                        {projectInputs.url || '0'}
                      </div>
                    </div>

                    <div className="grid grid-cols-12 items-center">
                      <div className="col-span-4 bg-[#e05206] text-white font-extrabold px-3 py-2 text-[11px] uppercase tracking-wider">
                        División(es) Codelco:
                      </div>
                      <div className="col-span-8 px-3 py-2 text-gris-azulado font-bold bg-gray-50">
                        {projectInputs.division || '0'}
                      </div>
                    </div>
                  </div>

                  {/* Right Column (4 cols in grid) */}
                  <div className="md:col-span-4 border border-gray-200 rounded-sm overflow-hidden divide-y divide-gray-150 flex flex-col justify-between">
                    <div className="grid grid-cols-12 items-center h-full">
                      <div className="col-span-5 bg-[#e05206] text-white font-extrabold px-3 py-2 text-[11px] uppercase tracking-wider text-center flex items-center justify-center h-full">
                        Fecha:
                      </div>
                      <div className="col-span-7 px-3 py-2 text-gris-azulado font-bold bg-gray-50 font-mono text-center">
                        {fechaDac || '00-ene'}
                      </div>
                    </div>

                    <div className="grid grid-cols-12 items-center h-full">
                      <div className="col-span-5 bg-[#e05206] text-white font-extrabold px-3 py-2 text-[11px] uppercase tracking-wider text-center flex items-center justify-center h-full">
                        DAC N°:
                      </div>
                      <div className="col-span-7 px-3 py-2 text-gris-azulado font-extrabold bg-gray-50 font-mono text-center">
                        {numeroDac || 'dac 01L'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CARD 2: UBICACIÓN LÓGICA & SITIO DE RED */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* UBICACIÓN LÓGICA */}
                <div className="bg-white border border-crema/20 rounded-sm p-5 shadow-xs space-y-4">
                  <div className="bg-[#e05206] text-white font-extrabold text-[11px] py-1.5 px-3 uppercase tracking-wider rounded-xs text-center">
                    Ubicación lógica donde se implementará la solución
                  </div>

                  <div className="space-y-2.5 pt-1">
                    {[
                      { key: 'rag', label: 'RAG - Red de Aplicaciones de Gestión' },
                      { key: 'risc', label: 'RISC - Red Industrial de Seguridad y Control' },
                      { key: 'dmz', label: 'DMZ - Zona desmilitarizada (exposición externa controlada)' },
                      { key: 'cloud', label: 'Cloud - Proveedor externo o entorno hospedado fuera del Data Center' }
                    ].map((item) => (
                      <button
                        type="button"
                        key={item.key}
                        disabled={!canEditArquitectura}
                        onClick={() => setLogicalLocation({
                          ...logicalLocation,
                          [item.key as keyof typeof logicalLocation]: !logicalLocation[item.key as keyof typeof logicalLocation]
                        })}
                        className={`w-full p-3 border rounded-sm flex items-center justify-between text-left transition-all disabled:opacity-85 disabled:cursor-not-allowed ${
                          logicalLocation[item.key as keyof typeof logicalLocation]
                            ? 'border-cobre bg-orange-50/20 text-gris-azulado font-bold shadow-xs'
                            : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50/50'
                        }`}
                      >
                        <span className="text-xs">{item.label}</span>
                        <div className={`w-5 h-5 border rounded-sm flex items-center justify-center shrink-0 ${
                          logicalLocation[item.key as keyof typeof logicalLocation] ? 'border-cobre bg-cobre text-white' : 'border-gray-300 bg-white'
                        }`}>
                          {logicalLocation[item.key as keyof typeof logicalLocation] && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* UBICACIÓN DEL SITIO DE RED */}
                <div className="bg-white border border-crema/20 rounded-sm p-5 shadow-xs flex flex-col justify-between space-y-4">
                  <div className="space-y-4">
                    <div className="bg-[#e05206] text-white font-extrabold text-[11px] py-1.5 px-3 uppercase tracking-wider rounded-xs text-center">
                      Ubicación del sitio de red
                    </div>

                    <div className="space-y-2.5 pt-1">
                      {[
                        { key: 'interna', label: 'Sitio en red Interna (incluye nube Codelco)' },
                        { key: 'proveedorExterno', label: 'Sitio en red de proveedor externo' }
                      ].map((item) => (
                        <button
                          type="button"
                          key={item.key}
                          disabled={!canEditArquitectura}
                          onClick={() => setNetworkSiteLocation({
                            ...networkSiteLocation,
                            [item.key as keyof typeof networkSiteLocation]: !networkSiteLocation[item.key as keyof typeof networkSiteLocation]
                          })}
                          className={`w-full p-3 border rounded-sm flex items-center justify-between text-left transition-all disabled:opacity-85 disabled:cursor-not-allowed ${
                            networkSiteLocation[item.key as keyof typeof networkSiteLocation]
                              ? 'border-cobre bg-orange-50/20 text-gris-azulado font-bold shadow-xs'
                              : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50/50'
                          }`}
                        >
                          <span className="text-xs">{item.label}</span>
                          <div className={`w-5 h-5 border rounded-sm flex items-center justify-center shrink-0 ${
                            networkSiteLocation[item.key as keyof typeof networkSiteLocation] ? 'border-cobre bg-cobre text-white' : 'border-gray-300 bg-white'
                          }`}>
                            {networkSiteLocation[item.key as keyof typeof networkSiteLocation] && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* INFO CARD DE AYUDA DE INFRAESTRUCTURA */}
                  <div className="p-3 bg-gray-50 border border-gray-150 rounded-sm text-[10px] text-gray-500 leading-relaxed space-y-1">
                    <span className="font-bold text-gris-azulado uppercase block">Pauta de Redes:</span>
                    <p>
                      La segmentación de red asegura que soluciones de gestión corporativa (RAG) no tengan conectividad directa hacia redes industriales de control (RISC) sin la debida intermediación de firewalls.
                    </p>
                  </div>
                </div>
              </div>

              {/* CARD 3: EXPOSICIÓN DEL SERVICIO Y ACCESOS */}
              <div className="bg-white border border-crema/20 rounded-sm p-5 shadow-xs space-y-4">
                <div className="bg-[#e05206] text-white font-extrabold text-[11px] py-1.5 px-3 uppercase tracking-wider rounded-xs text-center">
                  Exposición del(los) servicio(s) y acceso(s)
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  
                  {/* Left Column: Impact Info Block */}
                  <div className="md:col-span-4 p-4 border border-dashed border-[#e05206]/30 bg-orange-50/10 rounded-sm space-y-3">
                    <span className="font-extrabold text-[11px] text-cobre uppercase tracking-wider block">
                      Pautas de Impacto & Exposición:
                    </span>
                    <div className="space-y-2 text-xs text-gray-600 leading-relaxed font-sans">
                      <div className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-[#e05206] shrink-0 mt-0.5" />
                        <div>
                          <strong>Acceso Externo:</strong> requiere análisis de vulnerabilidades y pruebas éticas de penetración (Ethical Hacking + DAST).
                        </div>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-[#e05206] shrink-0 mt-0.5" />
                        <div>
                          <strong>Acceso Terceros:</strong> obliga a suscribir Carta de Compromiso de Riesgo si los controles de acceso son insuficientes.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Checkboxes Questionnaire */}
                  <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {[
                      { key: 'internet', label: 'Acceso desde internet' },
                      { key: 'redInterna', label: 'Acceso desde red interna' },
                      { key: 'usuariosExternos', label: 'Acceso por usuarios externos' },
                      { key: 'usuariosInternos', label: 'Acceso por usuarios internos' },
                      { key: 'remotoTerceros', label: 'Acceso remoto de terceros/proveedores' },
                      { key: 'autenticacionDefinidos', label: 'Mecanismos de autenticación definidos' }
                    ].map((item) => (
                      <button
                        type="button"
                        key={item.key}
                        disabled={!canEditArquitectura}
                        onClick={() => setExposureAccess({
                          ...exposureAccess,
                          [item.key as keyof typeof exposureAccess]: !exposureAccess[item.key as keyof typeof exposureAccess]
                        })}
                        className={`p-3 border rounded-sm flex items-center justify-between text-left transition-all disabled:opacity-85 disabled:cursor-not-allowed ${
                          exposureAccess[item.key as keyof typeof exposureAccess]
                            ? 'border-cobre bg-orange-50/20 text-gris-azulado font-bold shadow-xs'
                            : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50/50'
                        }`}
                      >
                        <span className="text-xs">{item.label}</span>
                        <div className={`w-5 h-5 border rounded-sm flex items-center justify-center shrink-0 ${
                          exposureAccess[item.key as keyof typeof exposureAccess] ? 'border-cobre bg-cobre text-white' : 'border-gray-300 bg-white'
                        }`}>
                          {exposureAccess[item.key as keyof typeof exposureAccess] && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </button>
                    ))}
                  </div>

                </div>
              </div>

              {/* CARD 4: INFRAESTRUCTURA A EVALUAR */}
              <div className="bg-white border border-crema/20 rounded-sm p-5 shadow-xs space-y-4">
                <div className="bg-[#e05206] text-white font-extrabold text-[11px] py-1.5 px-3 uppercase tracking-wider rounded-xs text-center">
                  Infraestructura a evaluar
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
                  
                  {/* Modelo de Despliegue */}
                  <div className="space-y-3">
                    <span className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Modelo de Despliegue:
                    </span>
                    <div className="space-y-2">
                      {[
                        { key: 'onPremise', label: 'On-Premise' },
                        { key: 'cloud', label: 'Cloud' },
                        { key: 'hibrido', label: 'Híbrido' }
                      ].map((item) => (
                        <button
                          type="button"
                          key={item.key}
                          disabled={!canEditArquitectura}
                          onClick={() => {
                            setDeploymentModel({
                              onPremise: item.key === 'onPremise',
                              cloud: item.key === 'cloud',
                              hibrido: item.key === 'hibrido'
                            });
                          }}
                          className={`w-full p-3 border rounded-sm flex items-center justify-between text-left transition-all disabled:opacity-85 disabled:cursor-not-allowed ${
                            deploymentModel[item.key as keyof typeof deploymentModel]
                              ? 'border-cobre bg-orange-50/20 text-gris-azulado font-bold shadow-xs'
                              : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50/50'
                          }`}
                        >
                          <span className="text-xs">{item.label}</span>
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 bg-white ${
                            deploymentModel[item.key as keyof typeof deploymentModel] ? 'border-cobre' : 'border-gray-300'
                          }`}>
                            {deploymentModel[item.key as keyof typeof deploymentModel] && <div className="w-2.5 h-2.5 bg-cobre rounded-full" />}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tipo de Servicio en la Nube */}
                  <div className={`space-y-3 transition-opacity duration-300 ${deploymentModel.cloud || deploymentModel.hibrido ? 'opacity-100' : 'opacity-40'}`}>
                    <span className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Si selecciona "Cloud", indique el tipo de servicio correspondiente:
                    </span>
                    <div className="space-y-2">
                      {[
                        { key: 'saas', label: 'SaaS - Software as a Service' },
                        { key: 'paas', label: 'PaaS - Platform as a Service' },
                        { key: 'iaas', label: 'IaaS - Infrastructure as a Service' }
                      ].map((item) => (
                        <button
                          type="button"
                          key={item.key}
                          disabled={!canEditArquitectura || (!deploymentModel.cloud && !deploymentModel.hibrido)}
                          onClick={() => {
                            setCloudServiceType({
                              saas: item.key === 'saas',
                              paas: item.key === 'paas',
                              iaas: item.key === 'iaas'
                            });
                          }}
                          className={`w-full p-3 border rounded-sm flex items-center justify-between text-left transition-all disabled:opacity-85 disabled:cursor-not-allowed ${
                            cloudServiceType[item.key as keyof typeof cloudServiceType] && (deploymentModel.cloud || deploymentModel.hibrido)
                              ? 'border-cobre bg-orange-50/20 text-gris-azulado font-bold shadow-xs'
                              : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50/50'
                          }`}
                        >
                          <span className="text-xs">{item.label}</span>
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 bg-white ${
                            cloudServiceType[item.key as keyof typeof cloudServiceType] && (deploymentModel.cloud || deploymentModel.hibrido) ? 'border-cobre' : 'border-gray-300'
                          }`}>
                            {cloudServiceType[item.key as keyof typeof cloudServiceType] && (deploymentModel.cloud || deploymentModel.hibrido) && <div className="w-2.5 h-2.5 bg-cobre rounded-full" />}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

              {/* CARD 5: INTEGRACIONES UTILIZADAS */}
              <div className="bg-white border border-crema/20 rounded-sm p-5 shadow-xs space-y-4">
                <div className="bg-[#e05206] text-white font-extrabold text-[11px] py-1.5 px-3 uppercase tracking-wider rounded-xs text-center">
                  Integraciones utilizadas
                </div>

                <div className="space-y-4">
                  {/* Si / No Selector */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gray-50 border border-gray-200 rounded-sm">
                    <span className="text-xs font-bold text-gray-700">
                      ¿El sistema contará con integraciones con otras plataformas de la organización?
                    </span>
                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        type="button"
                        disabled={!canEditArquitectura}
                        onClick={() => setHasIntegrations('si')}
                        className={`px-4 py-1.5 text-xs font-bold uppercase rounded-sm border transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                          hasIntegrations === 'si'
                            ? 'bg-cobre text-white border-cobre shadow-xs'
                            : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        Sí
                      </button>
                      <button
                        type="button"
                        disabled={!canEditArquitectura}
                        onClick={() => setHasIntegrations('no')}
                        className={`px-4 py-1.5 text-xs font-bold uppercase rounded-sm border transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                          hasIntegrations === 'no'
                            ? 'bg-cobre text-white border-cobre shadow-xs'
                            : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        No
                      </button>
                    </div>
                  </div>

                  {/* Integration Types Questionnaire if Yes */}
                  {hasIntegrations === 'si' && (
                    <div className="space-y-3 pt-1 animate-fade-in">
                      <span className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide">
                        Indicar el tipo de integración (marcar todas las que apliquen):
                      </span>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                        {[
                          { key: 'conexionDirectaBD', label: 'Conexión directa a base de datos' },
                          { key: 'integracionAPIs', label: 'Integración mediante APIs y servicios web (REST, SOAP, GraphQL)' },
                          { key: 'autenticacionSSO', label: 'Autenticación, SSO e integración con IAM' },
                          { key: 'mensajeriaEventos', label: 'Mensajería y gestión de eventos (MQ, Kafka, Webhooks)' },
                          { key: 'transferenciaArchivos', label: 'Transferencia de archivos (SFTP, FTPS)' },
                          { key: 'transferenciaAPIsTerceros', label: 'Transferencia (exposición/consumo) de APIs de terceros' },
                          { key: 'comunicacionInternaDirecta', label: 'Comunicación interna directa (puertos abiertos, HTTP interno)' },
                          { key: 'cargaPuntualManual', label: 'Carga de información puntual o manual' }
                        ].map((item) => (
                          <button
                            type="button"
                            key={item.key}
                            disabled={!canEditArquitectura}
                            onClick={() => setIntegrationTypes({
                              ...integrationTypes,
                              [item.key as keyof typeof integrationTypes]: !integrationTypes[item.key as keyof typeof integrationTypes]
                            })}
                            className={`p-3 border rounded-sm flex items-center justify-between text-left transition-all disabled:opacity-85 disabled:cursor-not-allowed ${
                              integrationTypes[item.key as keyof typeof integrationTypes]
                                ? 'border-cobre bg-orange-50/20 text-gris-azulado font-bold shadow-xs'
                                : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50/50'
                            }`}
                          >
                            <span className="text-xs">{item.label}</span>
                            <div className={`w-5 h-5 border rounded-sm flex items-center justify-center shrink-0 ${
                              integrationTypes[item.key as keyof typeof integrationTypes] ? 'border-cobre bg-cobre text-white' : 'border-gray-300 bg-white'
                            }`}>
                              {integrationTypes[item.key as keyof typeof integrationTypes] && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ACCIONES DE NAVEGACIÓN */}
              <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={!canEditArquitectura}
                  onClick={() => {
                    showToast('💾 Office 365: Datos de Arquitectura guardados en SharePoint de Codelco.');
                  }}
                  className="py-2.5 px-5 bg-white hover:bg-gray-50 text-gris-azulado border border-crema/30 font-bold text-xs uppercase tracking-wide rounded-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer focus:outline-none disabled:opacity-55 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4 text-cobre" />
                  Guardar en SharePoint
                </button>

                <button
                  type="button"
                  onClick={() => handleSectionClick('CONTROLES')}
                  className="py-2.5 px-6 bg-cobre hover:bg-cobre-oscuro text-white font-bold text-xs uppercase tracking-wide rounded-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-cobre"
                >
                  Siguiente: Ir a Controles
                  <ArrowRight className="w-4 h-4 text-white" />
                </button>
              </div>

            </div>
          )}

          {/* PAGE 3: CONTROLES DE SEGURIDAD */}
          {activeSection === 'CONTROLES' && (
            <div className="space-y-6 animate-fade-in font-sans" id="pagina-controles-form">
              {renderRoleBanner(canEditControles, "Gerencia Corporativa de Ciberseguridad y Aplicaciones del Negocio (GERENTE_APROBADORA) o Administrador")}
              
              {/* CARD 1: EXCEL REPLICATING FRAMEWORK MATRIZ */}
              <div className="bg-white border border-crema/20 rounded-sm p-6 shadow-xs space-y-4">
                <div className="border-b border-gray-100 pb-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-cobre font-display uppercase tracking-wider flex items-center">
                      <ShieldCheck className="w-5 h-5 mr-2 text-cobre" />
                      3. MARCOS DE SEGURIDAD APLICABLES
                    </h3>
                    <p className="text-[10px] text-gray-400 font-sans mt-0.5">
                      Establezca los marcos de ciberseguridad correspondientes según el alcance tecnológico definido en la Hoja 2.
                    </p>
                  </div>
                  <span className="text-[10px] text-cobre font-bold bg-orange-50 border border-orange-200 px-2.5 py-0.5 rounded-full uppercase font-mono self-start sm:self-auto">
                    HOJA_3 (MARCOS)
                  </span>
                </div>

                {/* AI / Auto-select helper row */}
                <div className="p-4 bg-gradient-to-r from-orange-50/40 via-white to-gray-50 border border-orange-100 rounded-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-3xs">
                  <div className="flex items-start gap-2.5">
                    <div className="p-2 bg-orange-500/10 rounded-sm shrink-0">
                      <Sparkles className="w-5 h-5 text-cobre" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-gris-azulado block">Sugerencia Inteligente Power Apps</span>
                      <span className="text-[10px] text-gray-400 block mt-0.5">Sincroniza y activa de forma interactiva los marcos de ciberseguridad según el modelo de despliegue y tecnología de la Hoja 2.</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={!canEditControles}
                    onClick={() => {
                      const autoMarcos = {
                        evalBitsight: true,
                        marcoGobierno: true,
                        evalCloud_cloud: deploymentModel.cloud || deploymentModel.hibrido,
                        evalCloud_integracion: hasIntegrations === 'si',
                        evalOnPrem_desarrollo: deploymentModel.onPremise,
                        evalOnPrem_integracion: deploymentModel.onPremise && hasIntegrations === 'si',
                        evalDesarrolloSeguro_desarrollo: tecnologia.web || tecnologia.movil,
                        evalComponenteIntegracion_integracion: hasIntegrations === 'si'
                      };
                      setMarcosSeleccionados(autoMarcos);
                      showToast('✨ Power Apps: Marcos de Seguridad sincronizados con la arquitectura de la Hoja 2 con éxito.');
                    }}
                    className="py-1.5 px-3 bg-cobre hover:bg-cobre-oscuro text-white font-bold text-[10px] uppercase tracking-wider rounded-sm transition-all flex items-center gap-1.5 cursor-pointer shadow-xs border border-cobre shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Auto-sincronizar Marcos
                  </button>
                </div>

                {/* Visual Power Apps Matrix Table */}
                <div className="overflow-x-auto border border-gray-200 rounded-sm">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-gris-azulado text-white font-bold text-[10px] uppercase tracking-wider border-b border-gray-300">
                        <th className="p-3 pl-4 w-1/3">Ámbito</th>
                        <th className="p-3 w-1/3">Marco de Seguridad</th>
                        <th className="p-3 text-center w-1/3">Selección / Aplicabilidad</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-150 bg-white text-gray-700">
                      
                      {/* BITSIGHT */}
                      <tr className="hover:bg-gray-50/50">
                        <td className="p-3 pl-4 font-bold text-gray-800">Evaluación Bitsight</td>
                        <td className="p-3 text-gray-500 font-sans">Análisis con Herramienta Bitsight</td>
                        <td className="p-3">
                          <div className="flex justify-center">
                            <button
                              type="button"
                              disabled={!canEditControles}
                              onClick={() => setMarcosSeleccionados({
                                ...marcosSeleccionados,
                                evalBitsight: !marcosSeleccionados.evalBitsight
                              })}
                              className={`w-40 py-1.5 px-3 rounded-sm text-[10px] font-bold uppercase transition-all flex items-center justify-between border cursor-pointer disabled:opacity-80 disabled:cursor-not-allowed ${
                                marcosSeleccionados.evalBitsight
                                  ? 'bg-orange-50 text-cobre border-orange-200 shadow-3xs'
                                  : 'bg-white text-gray-400 border-gray-200 hover:bg-gray-50'
                              }`}
                            >
                              <span>Aplica</span>
                              <div className={`w-4 h-4 border rounded-xs flex items-center justify-center shrink-0 ${
                                marcosSeleccionados.evalBitsight ? 'border-cobre bg-cobre text-white' : 'border-gray-300'
                              }`}>
                                {marcosSeleccionados.evalBitsight && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* GOBIERNO */}
                      <tr className="bg-gray-50/40 hover:bg-gray-50/60">
                        <td className="p-3 pl-4 font-bold text-gray-850">Marco de Gobierno</td>
                        <td className="p-3 text-gray-500 font-sans">Marco de Gobierno</td>
                        <td className="p-3">
                          <div className="flex justify-center">
                            <button
                              type="button"
                              disabled
                              className="w-40 py-1.5 px-3 rounded-sm text-[10px] font-bold uppercase bg-orange-50 text-cobre border border-orange-200 flex items-center justify-between select-none opacity-90"
                            >
                              <span>Siempre Aplica</span>
                              <div className="w-4 h-4 border border-cobre bg-cobre text-white rounded-xs flex items-center justify-center">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </div>
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* CLOUD */}
                      <tr className="hover:bg-gray-50/50">
                        <td className="p-3 pl-4 font-bold text-gray-800">Evaluación Ámbito Cloud</td>
                        <td className="p-3 text-gray-500 font-sans">
                          <div className="space-y-1">
                            <span className="block font-semibold">Marco Cloud</span>
                            <span className="block text-[9.5px] text-gray-400">Marco de Integración</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-col gap-1.5 items-center justify-center">
                            <button
                              type="button"
                              disabled={!canEditControles}
                              onClick={() => setMarcosSeleccionados({
                                ...marcosSeleccionados,
                                evalCloud_cloud: !marcosSeleccionados.evalCloud_cloud
                              })}
                              className={`w-40 py-1 px-2.5 rounded-sm text-[9px] font-bold uppercase transition-all flex items-center justify-between border cursor-pointer disabled:opacity-80 disabled:cursor-not-allowed ${
                                marcosSeleccionados.evalCloud_cloud
                                  ? 'bg-orange-50 text-cobre border-orange-200 shadow-3xs'
                                  : 'bg-white text-gray-400 border-gray-200'
                              }`}
                            >
                              <span>Marco Cloud</span>
                              <div className={`w-4 h-4 border rounded-xs flex items-center justify-center shrink-0 ${
                                marcosSeleccionados.evalCloud_cloud ? 'border-cobre bg-cobre text-white' : 'border-gray-300'
                              }`}>
                                {marcosSeleccionados.evalCloud_cloud && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                            </button>

                            <button
                              type="button"
                              disabled={!canEditControles}
                              onClick={() => setMarcosSeleccionados({
                                ...marcosSeleccionados,
                                evalCloud_integracion: !marcosSeleccionados.evalCloud_integracion
                              })}
                              className={`w-40 py-1 px-2.5 rounded-sm text-[9px] font-bold uppercase transition-all flex items-center justify-between border cursor-pointer disabled:opacity-80 disabled:cursor-not-allowed ${
                                marcosSeleccionados.evalCloud_integracion
                                  ? 'bg-orange-50 text-cobre border-orange-200 shadow-3xs'
                                  : 'bg-white text-gray-400 border-gray-200'
                              }`}
                            >
                              <span>Marco de Integración</span>
                              <div className={`w-4 h-4 border rounded-xs flex items-center justify-center shrink-0 ${
                                marcosSeleccionados.evalCloud_integracion ? 'border-cobre bg-cobre text-white' : 'border-gray-300'
                              }`}>
                                {marcosSeleccionados.evalCloud_integracion && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* ON-PREMISE */}
                      <tr className="hover:bg-gray-50/50">
                        <td className="p-3 pl-4 font-bold text-gray-800">Evaluación Ámbito On-Premise</td>
                        <td className="p-3 text-gray-500 font-sans">
                          <div className="space-y-1">
                            <span className="block font-semibold">Desarrollo Seguro</span>
                            <span className="block text-[9.5px] text-gray-400">Marco de Integración</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-col gap-1.5 items-center justify-center">
                            <button
                              type="button"
                              disabled={!canEditControles}
                              onClick={() => setMarcosSeleccionados({
                                ...marcosSeleccionados,
                                evalOnPrem_desarrollo: !marcosSeleccionados.evalOnPrem_desarrollo
                              })}
                              className={`w-40 py-1 px-2.5 rounded-sm text-[9px] font-bold uppercase transition-all flex items-center justify-between border cursor-pointer disabled:opacity-80 disabled:cursor-not-allowed ${
                                marcosSeleccionados.evalOnPrem_desarrollo
                                  ? 'bg-orange-50 text-cobre border-orange-200 shadow-3xs'
                                  : 'bg-white text-gray-400 border-gray-200'
                              }`}
                            >
                              <span>Desarrollo Seguro</span>
                              <div className={`w-4 h-4 border rounded-xs flex items-center justify-center shrink-0 ${
                                marcosSeleccionados.evalOnPrem_desarrollo ? 'border-cobre bg-cobre text-white' : 'border-gray-300'
                              }`}>
                                {marcosSeleccionados.evalOnPrem_desarrollo && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                            </button>

                            <button
                              type="button"
                              disabled={!canEditControles}
                              onClick={() => setMarcosSeleccionados({
                                ...marcosSeleccionados,
                                evalOnPrem_integracion: !marcosSeleccionados.evalOnPrem_integracion
                              })}
                              className={`w-40 py-1 px-2.5 rounded-sm text-[9px] font-bold uppercase transition-all flex items-center justify-between border cursor-pointer disabled:opacity-80 disabled:cursor-not-allowed ${
                                marcosSeleccionados.evalOnPrem_integracion
                                  ? 'bg-orange-50 text-cobre border-orange-200 shadow-3xs'
                                  : 'bg-white text-gray-400 border-gray-200'
                              }`}
                            >
                              <span>Marco de Integración</span>
                              <div className={`w-4 h-4 border rounded-xs flex items-center justify-center shrink-0 ${
                                marcosSeleccionados.evalOnPrem_integracion ? 'border-cobre bg-cobre text-white' : 'border-gray-300'
                              }`}>
                                {marcosSeleccionados.evalOnPrem_integracion && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* DESARROLLO SEGURO */}
                      <tr className="hover:bg-gray-50/50">
                        <td className="p-3 pl-4 font-bold text-gray-800">Evaluación Desarrollo Seguro</td>
                        <td className="p-3 text-gray-500 font-sans">Desarrollo Seguro</td>
                        <td className="p-3">
                          <div className="flex justify-center">
                            <button
                              type="button"
                              disabled={!canEditControles}
                              onClick={() => setMarcosSeleccionados({
                                ...marcosSeleccionados,
                                evalDesarrolloSeguro_desarrollo: !marcosSeleccionados.evalDesarrolloSeguro_desarrollo
                              })}
                              className={`w-40 py-1.5 px-3 rounded-sm text-[10px] font-bold uppercase transition-all flex items-center justify-between border cursor-pointer disabled:opacity-80 disabled:cursor-not-allowed ${
                                marcosSeleccionados.evalDesarrolloSeguro_desarrollo
                                  ? 'bg-orange-50 text-cobre border-orange-200 shadow-3xs'
                                  : 'bg-white text-gray-400 border-gray-200 hover:bg-gray-50'
                              }`}
                            >
                              <span>Aplica</span>
                              <div className={`w-4 h-4 border rounded-xs flex items-center justify-center shrink-0 ${
                                marcosSeleccionados.evalDesarrolloSeguro_desarrollo ? 'border-cobre bg-cobre text-white' : 'border-gray-300'
                              }`}>
                                {marcosSeleccionados.evalDesarrolloSeguro_desarrollo && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* COMPONENTE DE INTEGRACIÓN */}
                      <tr className="hover:bg-gray-50/50">
                        <td className="p-3 pl-4 font-bold text-gray-800">Evaluación Componente de Integración</td>
                        <td className="p-3 text-gray-500 font-sans">Marco de Integración</td>
                        <td className="p-3">
                          <div className="flex justify-center">
                            <button
                              type="button"
                              disabled={!canEditControles}
                              onClick={() => setMarcosSeleccionados({
                                ...marcosSeleccionados,
                                evalComponenteIntegracion_integracion: !marcosSeleccionados.evalComponenteIntegracion_integracion
                              })}
                              className={`w-40 py-1.5 px-3 rounded-sm text-[10px] font-bold uppercase transition-all flex items-center justify-between border cursor-pointer disabled:opacity-80 disabled:cursor-not-allowed ${
                                marcosSeleccionados.evalComponenteIntegracion_integracion
                                  ? 'bg-orange-50 text-cobre border-orange-200 shadow-3xs'
                                  : 'bg-white text-gray-400 border-gray-200 hover:bg-gray-50'
                              }`}
                            >
                              <span>Aplica</span>
                              <div className={`w-4 h-4 border rounded-xs flex items-center justify-center shrink-0 ${
                                marcosSeleccionados.evalComponenteIntegracion_integracion ? 'border-cobre bg-cobre text-white' : 'border-gray-300'
                              }`}>
                                {marcosSeleccionados.evalComponenteIntegracion_integracion && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                            </button>
                          </div>
                        </td>
                      </tr>

                    </tbody>
                  </table>
                </div>
              </div>

              {/* CARD 2: OBSERVACIONES Y CONSIDERACIONES ESPECIALES */}
              <div className="bg-white border border-crema/20 rounded-sm p-6 shadow-xs space-y-6">
                <div className="border-b border-gray-100 pb-2.5 flex items-center justify-between">
                  <h3 className="text-xs font-black text-cobre font-display uppercase tracking-wider flex items-center">
                    <HelpCircle className="w-4 h-4 mr-1.5 text-cobre" />
                    Observaciones y Consideraciones Especiales del Marco
                  </h3>
                  <span className="text-[9px] text-gray-400 font-sans uppercase font-bold tracking-wider">Norma GCRT-P-001 Codelco</span>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  
                  {/* COMENTARIOS MARCO */}
                  <div className="space-y-3 border border-gray-150 p-4 rounded-sm bg-gray-50/20 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1 text-cobre">
                        <FileText className="w-4 h-4" />
                        <span className="font-bold text-xs uppercase tracking-wider">1. Comentarios del Marco a Evaluar:</span>
                      </div>
                      <p className="text-[10px] text-gray-500 leading-relaxed mb-3">
                        En esta sección se deben detallar las razones por las cuales se seleccionó el marco aplicable, considerando el alcance del proyecto y los requerimientos definidos por el Jefe de Proyecto. El Marco de Gobierno, al ser mandatorio y transversal, siempre es incluido en el análisis.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <textarea
                        value={comentariosMarco}
                        onChange={(e) => setComentariosMarco(e.target.value)}
                        disabled={!canEditControles}
                        rows={5}
                        placeholder="Escriba los comentarios y justificaciones técnicas de la selección de marcos..."
                        className="w-full text-xs p-3 border border-gray-200 rounded-sm bg-white focus:outline-none focus:border-cobre font-sans resize-y shadow-3xs text-gray-700 leading-relaxed disabled:bg-gray-50 disabled:cursor-not-allowed"
                      />
                      
                      {/* Power Apps Quick Fill Tags */}
                      {canEditControles && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-[8px] text-gray-400 font-bold uppercase mr-1">Rápido:</span>
                          <button
                            type="button"
                            onClick={() => setComentariosMarco(
                              "El proyecto, dado que involucra una integración mediante APIs and exposición de servicios web, requiere la aplicación obligatoria del Marco de Gobierno corporativo y un análisis continuo mediante la herramienta Bitsight. Adicionalmente, dado el modelo de despliegue Cloud/Híbrido identificado, se evaluarán de manera preventiva los controles asociados al Marco Cloud."
                            )}
                            className="px-2 py-0.5 bg-white hover:bg-gray-100 text-[8px] font-bold uppercase rounded-sm border border-gray-200 text-gray-600 transition-colors cursor-pointer"
                          >
                            Justificación Cloud + APIs
                          </button>
                          <button
                            type="button"
                            onClick={() => setComentariosMarco(
                              "Se aplica evaluación estándar con base en el Marco de Gobierno y análisis Bitsight. No se requieren marcos adicionales de integración o desarrollo debido a que la solución opera como software empaquetado cerrado sin interconexión de bases de datos externas."
                            )}
                            className="px-2 py-0.5 bg-white hover:bg-gray-100 text-[8px] font-bold uppercase rounded-sm border border-gray-200 text-gray-600 transition-colors cursor-pointer"
                          >
                            Justificación Estándar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* EXCEPCIONES CONSIDERAR */}
                  <div className="space-y-3 border border-gray-150 p-4 rounded-sm bg-gray-50/20 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1 text-cobre">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="font-bold text-xs uppercase tracking-wider">2. Excepciones a considerar:</span>
                      </div>
                      <p className="text-[10px] text-gray-500 leading-relaxed mb-3">
                        En esta sección se deben indicar las posibles excepciones a considerar en la evaluación. Si algún control no aplica debido a limitaciones tecnológicas u otros factores aprobados en el procedimiento GCRT-P-001, detállelo aquí.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <textarea
                        value={excepcionesConsiderar}
                        onChange={(e) => setExcepcionesConsiderar(e.target.value)}
                        disabled={!canEditControles}
                        rows={5}
                        placeholder="Escriba aquí los detalles de excepciones aprobadas o justificaciones técnicas de controles no aplicables..."
                        className="w-full text-xs p-3 border border-gray-200 rounded-sm bg-white focus:outline-none focus:border-cobre font-sans resize-y shadow-3xs text-gray-700 leading-relaxed disabled:bg-gray-50 disabled:cursor-not-allowed"
                      />

                      {/* Power Apps Quick Fill Tags */}
                      {canEditControles && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-[8px] text-gray-400 font-bold uppercase mr-1">Rápido:</span>
                          <button
                            type="button"
                            onClick={() => setExcepcionesConsiderar(
                              "No se contemplan excepciones ni exclusión de controles en el análisis actual del servicio. Todos los requisitos de ciberseguridad corporativos declarados en GCRT-P-001 son exigibles en su totalidad para los proveedores participantes."
                            )}
                            className="px-2 py-0.5 bg-white hover:bg-gray-100 text-[8px] font-bold uppercase rounded-sm border border-gray-200 text-gray-600 transition-colors cursor-pointer"
                          >
                            Sin Excepciones (Recomendado)
                          </button>
                          <button
                            type="button"
                            onClick={() => setExcepcionesConsiderar(
                              "Se declara excepción temporal justificada para el control de encriptación de base de datos en reposo, dado que el motor opera en un volumen aislado y cifrado a nivel de hardware por la infraestructura On-Premise del proveedor bajo supervisión de Codelco."
                            )}
                            className="px-2 py-0.5 bg-white hover:bg-gray-100 text-[8px] font-bold uppercase rounded-sm border border-gray-200 text-gray-600 transition-colors cursor-pointer"
                          >
                            Exclusión Cifrado On-Prem
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                </div>

                {/* ACCIONES DE NAVEGACIÓN */}
                <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-end gap-3">
                  <button
                    type="button"
                    disabled={!canEditControles}
                    onClick={() => {
                      showToast('💾 Office 365: Datos de marcos de seguridad y consideraciones guardados en SharePoint de Codelco.');
                    }}
                    className="py-2.5 px-5 bg-white hover:bg-gray-50 text-gris-azulado border border-crema/30 font-bold text-xs uppercase tracking-wide rounded-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer focus:outline-none disabled:opacity-55 disabled:cursor-not-allowed"
                  >
                    <Save className="w-4 h-4 text-cobre" />
                    Guardar en SharePoint
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSectionClick('PRESUPUESTO')}
                    className="py-2.5 px-6 bg-cobre hover:bg-cobre-oscuro text-white font-bold text-xs uppercase tracking-wide rounded-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-cobre"
                  >
                    Siguiente: Ir a Presupuesto
                    <ArrowRight className="w-4 h-4 text-white" />
                  </button>
                </div>

              </div>

            </div>
          )}

          {/* PAGE 4: PRESUPUESTO SERVICIO */}
          {activeSection === 'PRESUPUESTO' && (
            <div className="bg-white border border-crema/20 rounded-sm p-6 md:p-8 shadow-xs space-y-6">
              <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-cobre font-display uppercase tracking-wider flex items-center">
                    <DollarSign className="w-5 h-5 mr-2 text-cobre" />
                    4. Presupuesto Servicio Ciberseguridad
                  </h3>
                  <p className="text-[10px] text-gray-400 font-sans mt-0.5">
                    Declaración del presupuesto asignado a servicios de auditoría y controles técnicos.
                  </p>
                </div>
                <span className="text-[10px] text-cobre font-bold bg-orange-50 border border-orange-200 px-2.5 py-0.5 rounded-full uppercase font-mono">
                  HOJA_4 (PRESUPUESTO)
                </span>
              </div>

              {renderRoleBanner(canEditPresupuesto, "Responsables EY Evaluadores (Presupuesto, Técnico, Documental) o Administrador")}

              <div className="space-y-5 font-sans text-xs">
                {/* State of financing banner */}
                <div className="p-3 bg-orange-50/30 border border-orange-100 rounded-sm flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gris-azulado text-[11px] uppercase">Estado de Financiamiento</p>
                    <p className="text-gray-500 text-[10px]">Asignación presupuestaria centralizada en VP de Tecnología.</p>
                  </div>
                  <span className="px-3 py-1 rounded-sm bg-orange-100 text-cobre border border-orange-200 font-bold text-[10px] uppercase">
                    Presupuesto Aprobado
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-600">Consultoría Ciberseguridad (USD)</label>
                    <input
                      type="number"
                      value={budgetConsulting}
                      onChange={(e) => setBudgetConsulting(e.target.value)}
                      disabled={!canEditPresupuesto}
                      className="w-full px-2.5 py-1.5 border border-crema/30 rounded-sm bg-white focus:outline-none focus:border-cobre font-mono font-bold disabled:bg-gray-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-gray-600">Licencias y Herramientas (USD)</label>
                    <input
                      type="number"
                      value={budgetLicensing}
                      onChange={(e) => setBudgetLicensing(e.target.value)}
                      disabled={!canEditPresupuesto}
                      className="w-full px-2.5 py-1.5 border border-crema/30 rounded-sm bg-white focus:outline-none focus:border-cobre font-mono font-bold disabled:bg-gray-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-gray-600">Pentesting Inicial (USD)</label>
                    <input
                      type="number"
                      value={budgetPentesting}
                      onChange={(e) => setBudgetPentesting(e.target.value)}
                      disabled={!canEditPresupuesto}
                      className="w-full px-2.5 py-1.5 border border-crema/30 rounded-sm bg-white focus:outline-none focus:border-cobre font-mono font-bold disabled:bg-gray-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-between items-center font-bold text-xs">
                  <span className="text-gray-500 uppercase">Costo Total Estimado Servicios de Seguridad:</span>
                  <span className="text-cobre text-sm font-sans tracking-tight">
                    USD ${(parseFloat(budgetConsulting || '0') + parseFloat(budgetLicensing || '0') + parseFloat(budgetPentesting || '0')).toLocaleString('es-CL')}
                  </span>
                </div>

                {/* Navigation actions */}
                <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-end gap-3">
                  <button
                    type="button"
                    disabled={!canEditPresupuesto}
                    onClick={() => {
                      showToast('💾 Office 365: Presupuesto guardado en SharePoint de Codelco.');
                    }}
                    className="py-2.5 px-5 bg-white hover:bg-gray-50 text-gris-azulado border border-crema/30 font-bold text-xs uppercase tracking-wide rounded-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer focus:outline-none disabled:opacity-55 disabled:cursor-not-allowed"
                  >
                    <Save className="w-4 h-4 text-cobre" />
                    Guardar en SharePoint
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSectionClick('SLAS')}
                    className="py-2.5 px-6 bg-cobre hover:bg-cobre-oscuro text-white font-bold text-xs uppercase tracking-wide rounded-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-cobre"
                  >
                    Siguiente: Ir a SLAs
                    <ArrowRight className="w-4 h-4 text-white" />
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* PAGE 5: CONSIDERACIONES Y SLAS */}
          {activeSection === 'SLAS' && (
            <div className="bg-white border border-crema/20 rounded-sm p-6 md:p-8 shadow-xs space-y-6">
              <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-cobre font-display uppercase tracking-wider flex items-center">
                    <ShieldAlert className="w-5 h-5 mr-2 text-cobre" />
                    5. Consideraciones y SLAs del Servicio
                  </h3>
                  <p className="text-[10px] text-gray-400 font-sans mt-0.5">
                    Plazos oficiales comprometidos y tiempos de respuesta exigidos según directivas Codelco.
                  </p>
                </div>
                <span className="text-[10px] text-cobre font-bold bg-orange-50 border border-orange-200 px-2.5 py-0.5 rounded-full uppercase font-mono">
                  HOJA_5 (SLAS)
                </span>
              </div>

              {renderRoleBanner(canEditSlas, "Jefe de Proyecto TI (JP), Gerencia de Ciberseguridad o Administrador")}

              <div className="space-y-4 font-sans text-xs text-gray-700">
                <div className="p-3 bg-orange-50/40 border border-orange-100 rounded-sm text-[11px] leading-relaxed flex gap-3">
                  <Lock className="w-5 h-5 text-cobre shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-cobre uppercase">Planificación y Tiempos de Respuesta Estándar</strong>
                    <p className="text-gray-600 mt-0.5">La siguiente matriz detalla los hitos, plazos propuestos en días hábiles y las responsabilidades para la obtención del Sello de Ciberseguridad y la Evaluación de la Licitación.</p>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-sm overflow-x-auto mt-4">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-cobre text-white font-bold text-[10px] uppercase tracking-wider border-b border-gray-300">
                        <th className="p-3 w-[40%]">HITO</th>
                        <th className="p-3 text-center w-[15%]">Días Hábiles propuestos</th>
                        <th className="p-3 w-[25%]">Responsable</th>
                        <th className="p-3 w-[20%]">Observaciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-150 bg-white text-gray-700">
                      
                      {/* SUBHEADER 1 */}
                      <tr className="bg-gris-azulado text-white font-bold text-[10px] uppercase tracking-wider">
                        <td colSpan={4} className="p-2.5 pl-4">
                          Sello Evaluación Ciberseguridad
                        </td>
                      </tr>

                      {/* Group 1 Row 1 */}
                      <tr className="hover:bg-gray-50/50">
                        <td className="p-2.5 pl-4 font-medium text-gray-800">Solicitado el sello, enviar DAC al JP.</td>
                        <td className="p-2.5 text-center font-bold text-gray-900 font-mono">2</td>
                        <td className="p-2.5 text-gray-500 font-sans">Especialista Ciberseguridad Aplicativa</td>
                        <td rowSpan={9} className="p-3 text-[10px] text-gray-500 font-normal bg-gray-50/30 align-middle border-l border-gray-150 leading-relaxed text-center">
                          En caso de presentarse dudas, retrasos o requerirse aclaraciones que generen iteraciones adicionales entre los equipos, el SLA propuesto podría verse afectado
                        </td>
                      </tr>

                      {/* Group 1 Row 2 */}
                      <tr className="hover:bg-gray-50/50">
                        <td className="p-2.5 pl-4 font-medium text-gray-800">Completar DAC (JP)</td>
                        <td className="p-2.5 text-center font-bold text-gray-900 font-mono">5</td>
                        <td className="p-2.5 text-gray-500 font-sans">Jefe de Proyecto</td>
                      </tr>

                      {/* Group 1 Row 3 */}
                      <tr className="hover:bg-gray-50/50">
                        <td className="p-2.5 pl-4 font-medium text-gray-800">Revisión DAC</td>
                        <td className="p-2.5 text-center font-bold text-gray-900 font-mono">2</td>
                        <td className="p-2.5 text-gray-500 font-sans">Especialista Ciberseguridad Aplicativa</td>
                      </tr>

                      {/* Group 1 Row 4 */}
                      <tr className="hover:bg-gray-50/50">
                        <td className="p-2.5 pl-4 font-medium text-gray-800">Completar DAC: estimación y definir marcos de Ciberseguridad a revisar.</td>
                        <td className="p-2.5 text-center font-bold text-gray-900 font-mono">2</td>
                        <td className="p-2.5 text-gray-500 font-sans">Especialista Ciberseguridad Aplicativa</td>
                      </tr>

                      {/* Group 1 Row 5 */}
                      <tr className="hover:bg-gray-50/50">
                        <td className="p-2.5 pl-4 font-medium text-gray-800">Realizar estimación de horas</td>
                        <td className="p-2.5 text-center font-bold text-gray-900 font-mono">3</td>
                        <td className="p-2.5 text-gray-500 font-sans">Especialista Servicio Contratado</td>
                      </tr>

                      {/* Group 1 Row 6 */}
                      <tr className="hover:bg-gray-50/50">
                        <td className="p-2.5 pl-4 font-medium text-gray-800">Aprobación Ciberseguridad</td>
                        <td className="p-2.5 text-center font-bold text-gray-900 font-mono">2</td>
                        <td className="p-2.5 text-gray-500 font-sans">Gerenta Corporativa Ciberseguridad y Riesgo Tecnológico</td>
                      </tr>

                      {/* Group 1 Row 7 */}
                      <tr className="hover:bg-gray-50/50">
                        <td className="p-2.5 pl-4 font-medium text-gray-800">Aprobación Jefe de Proyecto y confirmar Grafo/CeCo</td>
                        <td className="p-2.5 text-center font-bold text-gray-900 font-mono">2</td>
                        <td className="p-2.5 text-gray-500 font-sans">Jefe de Proyecto</td>
                      </tr>

                      {/* Group 1 Row 8 */}
                      <tr className="hover:bg-gray-50/50">
                        <td className="p-2.5 pl-4 font-medium text-gray-800">Revisión solicitud y coordinar inicio</td>
                        <td className="p-2.5 text-center font-bold text-gray-900 font-mono">1</td>
                        <td className="p-2.5 text-gray-500 font-sans">Especialista Ciberseguridad Aplicativa</td>
                      </tr>

                      {/* Group 1 Row 9 */}
                      <tr className="hover:bg-gray-50/50">
                        <td className="p-2.5 pl-4 font-medium text-gray-800">Elaboración informe de cumplimiento (Sello verde/amarillo/rojo) una vez finalizados todos los servicios</td>
                        <td className="p-2.5 text-center font-bold text-gray-900 font-mono">3</td>
                        <td className="p-2.5 text-gray-500 font-sans">Especialista Ciberseguridad Aplicativa</td>
                      </tr>

                      {/* SUBHEADER 2 */}
                      <tr className="bg-gris-azulado text-white font-bold text-[10px] uppercase tracking-wider">
                        <td colSpan={4} className="p-2.5 pl-4">
                          Evaluación Licitación
                        </td>
                      </tr>

                      {/* Group 2 Row 1 */}
                      <tr className="hover:bg-gray-50/50">
                        <td className="p-2.5 pl-4 font-medium text-gray-800">Solicitud Inicio de Evaluación</td>
                        <td className="p-2.5 text-center font-bold text-gray-900 font-mono">2</td>
                        <td className="p-2.5 text-gray-500 font-sans">Especialista Ciberseguridad Aplicativa</td>
                        <td rowSpan={5} className="p-3 text-[10px] text-gray-500 font-normal bg-gray-50/30 align-middle border-l border-gray-150 leading-relaxed text-center">
                          En caso de presentarse dudas, retrasos o requerirse aclaraciones que generen iteraciones adicionales entre los equipos, el SLA propuesto podría verse afectado
                        </td>
                      </tr>

                      {/* Group 2 Row 2 */}
                      <tr className="hover:bg-gray-50/50">
                        <td className="p-2.5 pl-4 font-medium text-gray-800">Envío de Evidencias proporcionada por los Proveedores</td>
                        <td className="p-2.5 text-center font-bold text-gray-900 font-mono">3</td>
                        <td className="p-2.5 text-gray-500 font-sans">Jefe de Proyecto</td>
                      </tr>

                      {/* Group 2 Row 3 */}
                      <tr className="hover:bg-gray-50/50">
                        <td className="p-2.5 pl-4 font-medium text-gray-800">Evaluación controles de seguridad</td>
                        <td className="p-2.5 text-center font-bold text-gray-900 font-mono">5</td>
                        <td className="p-2.5 text-gray-500 font-sans">Especialista Servicio Contratado</td>
                      </tr>

                      {/* Group 2 Row 4 */}
                      <tr className="hover:bg-gray-50/50">
                        <td className="p-2.5 pl-4 font-medium text-gray-800">Elaboración de informe detallado</td>
                        <td className="p-2.5 text-center font-bold text-gray-900 font-mono">2</td>
                        <td className="p-2.5 text-gray-500 font-sans">Especialista Servicio Contratado</td>
                      </tr>

                      {/* Group 2 Row 5 */}
                      <tr className="hover:bg-gray-50/50">
                        <td className="p-2.5 pl-4 font-medium text-gray-800">Entrega de resolución con Sellos por proveedor</td>
                        <td className="p-2.5 text-center font-bold text-gray-900 font-mono">2</td>
                        <td className="p-2.5 text-gray-500 font-sans">Especialista Ciberseguridad Aplicativa</td>
                      </tr>

                    </tbody>
                  </table>
                </div>

                {/* Navigation actions */}
                <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-end gap-3">
                  <button
                    type="button"
                    disabled={!canEditSlas}
                    onClick={() => {
                      showToast('💾 Office 365: Consideraciones de SLAs guardadas en SharePoint de Codelco.');
                    }}
                    className="py-2.5 px-5 bg-white hover:bg-gray-50 text-gris-azulado border border-crema/30 font-bold text-xs uppercase tracking-wide rounded-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer focus:outline-none disabled:opacity-55 disabled:cursor-not-allowed"
                  >
                    <Save className="w-4 h-4 text-cobre" />
                    Guardar en SharePoint
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSectionClick('RESOLUCION')}
                    className="py-2.5 px-6 bg-cobre hover:bg-cobre-oscuro text-white font-bold text-xs uppercase tracking-wide rounded-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-cobre"
                  >
                    Siguiente: Ir a Resolución
                    <ArrowRight className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PAGE 6: RESOLUCIÓN */}
          {activeSection === 'RESOLUCION' && (
            <div className="bg-white border border-crema/20 rounded-sm p-6 md:p-8 shadow-xs space-y-6">
              <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-cobre font-display uppercase tracking-wider flex items-center">
                    <Gavel className="w-5 h-5 mr-2 text-cobre" />
                    6. DICTAMEN DE SELLO Y RESOLUCIÓN DE LICITACIÓN
                  </h3>
                  <p className="text-[10px] text-gray-400 font-sans mt-0.5">
                    {currentSection.desc}
                  </p>
                </div>
                <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full uppercase font-mono">
                  HOJA_6 (RESOLUCIÓN)
                </span>
              </div>

              {renderRoleBanner(canEditResolucion, "Gerencia Corporativa de Ciberseguridad (GERENTE_APROBADORA), Responsable Gestión o Administrador")}

              <div className="space-y-6 font-sans text-xs">
                
                {/* Visual Badge Display Side-by-side with selection */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Left Column: Select Winner Supplier */}
                  <div className="space-y-4 md:col-span-1">
                    <div className="space-y-1.5">
                      <label className="font-bold text-gray-600 block">1. Seleccionar Oferente Adjudicado:</label>
                      <select
                        value={chosenWinnerId}
                        onChange={(e) => setChosenWinnerId(e.target.value)}
                        disabled={!canEditResolucion}
                        className="w-full px-2.5 py-1.5 border border-crema/30 rounded-sm bg-white font-bold text-xs text-gris-azulado focus:outline-none focus:border-cobre cursor-pointer disabled:bg-gray-50 disabled:cursor-not-allowed"
                      >
                        {computedSuppliers.map(s => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.score}%)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-sm space-y-2 font-mono">
                      <div className="flex justify-between text-[11px]">
                        <span>Puntaje Final:</span>
                        <strong className="text-gray-900">{computedSuppliers.find(s => s.id === chosenWinnerId)?.score}%</strong>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span>Sello Obtenido:</span>
                        <span className="font-bold text-cobre">Sello {computedSuppliers.find(s => s.id === chosenWinnerId)?.seal}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span>RUT Oferente:</span>
                        <span>{computedSuppliers.find(s => s.id === chosenWinnerId)?.rut}</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle Column: Authorized cyber stamp visual (Matches page 2 and 5 graphics) */}
                  <div className="md:col-span-2 flex flex-col items-center justify-center border border-dashed border-gray-200 p-5 rounded-sm bg-white">
                    <span className="text-[9px] font-mono text-gray-400 uppercase tracking-widest block font-bold mb-3">
                      Estampado Digital de Seguridad Oficial Codelco
                    </span>

                    {/* High-fidelity Codelco Seal Graphic */}
                    {(() => {
                      const sealType = computedSuppliers.find(s => s.id === chosenWinnerId)?.seal || 'Pendiente';
                      const badge = getSelloBadgeDetails(sealType);

                      return (
                        <div className="flex flex-col items-center space-y-3">
                          <div className={`w-36 h-36 rounded-full ${badge.bgColor} text-white flex flex-col items-center justify-center p-3 border-4 ${badge.borderColor} shadow-lg text-center font-display`}>
                            <span className="text-[8px] font-bold tracking-widest uppercase text-white/80">CODELCO</span>
                            <span className="text-xs font-black tracking-wider leading-none mt-1">{badge.title}</span>
                            
                            {/* Stars block */}
                            <div className="flex space-x-1 my-1.5">
                              <span className="text-xs">★</span>
                              <span className="text-xs">★</span>
                              <span className="text-xs">★</span>
                              <span className="text-xs">★</span>
                              <span className="text-xs">★</span>
                            </div>

                            <span className="text-[9px] font-black tracking-widest border-t border-white/30 pt-1 leading-none">{badge.subtitle}</span>
                            <span className="text-[7px] font-mono tracking-wider text-white/70 mt-2">N° DAC-01L</span>
                          </div>

                          <span className={`px-3 py-0.5 rounded-full text-[10px] font-bold border mt-2 uppercase tracking-wide ${badge.bgLight}`}>
                            DIAL RES: {sealType === 'Verde' ? 'AUTORIZADO' : sealType === 'Amarillo' ? 'APROBADO CON CONDICIONES' : 'RECHAZADO'}
                          </span>
                        </div>
                      );
                    })()}
                  </div>

                </div>

                {/* Recommendations and Conclusiones Form */}
                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <span className="font-display font-bold text-xs uppercase text-gris-azulado tracking-wider block border-b border-gray-100 pb-1.5">
                    Dictamen Técnico de Ciberseguridad
                  </span>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="font-bold text-gray-600 block">Conclusión Ejecutiva del Auditor *</label>
                      <textarea
                        value={conclusionText}
                        onChange={(e) => setConclusionText(e.target.value)}
                        disabled={!canEditResolucion}
                        className="w-full h-24 bg-white border border-crema/30 rounded-sm p-2.5 focus:outline-none focus:border-cobre font-sans disabled:bg-gray-50 disabled:cursor-not-allowed"
                        placeholder="Escriba las conclusiones de la evaluación del Sello de Ciberseguridad..."
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-gray-600 block">Recomendaciones y Condiciones para el Proveedor Adjudicado *</label>
                      <textarea
                        value={recommendationsText}
                        onChange={(e) => setRecommendationsText(e.target.value)}
                        disabled={!canEditResolucion}
                        className="w-full h-24 bg-white border border-crema/30 rounded-sm p-2.5 focus:outline-none focus:border-cobre font-mono leading-tight disabled:bg-gray-50 disabled:cursor-not-allowed"
                        placeholder="Enumere las recomendaciones del plan de acción..."
                      />
                    </div>
                  </div>
                </div>

                {/* Approvers list */}
                <div className="pt-4 border-t border-gray-150 flex items-center space-x-3 text-[10px] text-gray-500 font-medium">
                  <div className="w-9 h-9 rounded-full bg-gris-azulado/10 text-gris-azulado font-bold flex items-center justify-center text-xs shrink-0">
                    GC
                  </div>
                  <div>
                    <p className="font-bold text-gray-700">Gerencia Corporativa de Ciberseguridad y TIC Codelco</p>
                    <p className="text-[9px]">Aprobación digital inmutable registrada para licitación N° {activeDac.id}</p>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* PAGE 7: ANEXOS (SELLOS) */}
          {activeSection === 'ANEXOS' && (
            <div className="bg-white border border-crema/20 rounded-sm p-6 md:p-8 shadow-xs space-y-6">
              <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-cobre font-display uppercase tracking-wider flex items-center">
                    <Award className="w-5 h-5 mr-2 text-cobre" />
                    7. ANEXOS Y CERTIFICADOS DE SELLO
                  </h3>
                  <p className="text-[10px] text-gray-400 font-sans mt-0.5">
                    {currentSection.desc}
                  </p>
                </div>
                <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full uppercase font-mono">
                  HOJA_7 (CERTIFICADOS)
                </span>
              </div>

              {renderRoleBanner(true, "Todos los roles (Permitido para consulta y descarga)")}

              <div className="space-y-6 font-sans text-xs text-gray-700 leading-relaxed">
                
                {/* Official Sheet representation to match the user's uploaded image */}
                <div className="border border-gray-200 rounded-sm bg-white overflow-hidden shadow-xs">
                  {/* Top Header Grid */}
                  <div className="grid grid-cols-3 border-b border-gray-200 text-center font-bold text-xs bg-white">
                    <div className="p-3 text-[#E05206] font-black tracking-widest text-xs flex items-center justify-center">
                      CODELCO
                    </div>
                    <div className="p-3 text-slate-700 font-extrabold uppercase text-[10px] border-l border-r border-gray-200 flex items-center justify-center font-mono">
                      Sellos
                    </div>
                    <div className="p-3 text-red-600 font-black tracking-widest text-xs flex items-center justify-center">
                      CODELCO
                    </div>
                  </div>

                  <div className="p-5 md:p-6 space-y-6">
                    {/* Purple Banner */}
                    <div className="flex w-full items-stretch border border-purple-200 rounded-sm overflow-hidden min-h-[48px]">
                      <div className="bg-purple-900 text-white font-black text-[10px] px-6 py-4 flex items-center justify-center uppercase tracking-wider relative shrink-0" style={{ backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.1) 0, rgba(255,255,255,0.1) 2px, transparent 0, transparent 8px)' }}>
                        IMPORTANTE
                      </div>
                      <div className="bg-purple-100/60 text-purple-950 font-medium italic text-xs px-5 py-4 flex items-center flex-1">
                        Sellos de resolución final
                      </div>
                      <div className="w-8 shrink-0 bg-blue-800 animate-pulse" style={{ backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.1) 0, rgba(255,255,255,0.1) 2px, transparent 0, transparent 8px)' }}></div>
                    </div>

                    {/* Seals Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4 justify-items-center">
                      
                      {/* SEAL 1: GREEN (AUTORIZADO / CUMPLIMIENTO TOTAL) */}
                      <div className="flex flex-col items-center justify-center p-6 bg-white rounded-sm border border-gray-50 shadow-xs hover:shadow-md transition-shadow">
                        <svg viewBox="0 0 200 200" className="w-48 h-48 select-none">
                          <circle cx="100" cy="100" r="95" fill="none" stroke="#10b981" strokeWidth="4" />
                          <circle cx="100" cy="100" r="88" fill="none" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3,3" />
                          
                          {/* Paths for text */}
                          <path id="top-arc-path-green" d="M 30,100 A 70,70 0 0,1 170,100" fill="none" stroke="none" />
                          <path id="bottom-arc-path-green" d="M 170,100 A 70,70 0 0,1 30,100" fill="none" stroke="none" />
                          
                          {/* Curved green background ribbons */}
                          <path d="M 18,100 A 82,82 0 0,1 182,100 L 164,100 A 64,64 0 0,0 36,100 Z" fill="#10b981" />
                          <path d="M 18,100 A 82,82 0 0,0 182,100 L 164,100 A 64,64 0 0,1 36,100 Z" fill="#10b981" />

                          {/* Text along path */}
                          <text fill="#ffffff" fontFamily="sans-serif" fontSize="12" fontWeight="900" letterSpacing="2.5" textAnchor="middle">
                            <textPath href="#top-arc-path-green" startOffset="50%">AUTORIZADO</textPath>
                          </text>
                          
                          <text fill="#ffffff" fontFamily="sans-serif" fontSize="10.5" fontWeight="900" letterSpacing="1.2" textAnchor="middle">
                            <textPath href="#bottom-arc-path-green" startOffset="50%">CUMPLIMIENTO TOTAL</textPath>
                          </text>

                          {/* Stars in the center */}
                          <g fill="#10b981">
                            <text x="62" y="80" fontSize="14" textAnchor="middle">★</text>
                            <text x="81" y="73" fontSize="14" textAnchor="middle">★</text>
                            <text x="100" y="71" fontSize="17" textAnchor="middle">★</text>
                            <text x="119" y="73" fontSize="14" textAnchor="middle">★</text>
                            <text x="138" y="80" fontSize="14" textAnchor="middle">★</text>
                          </g>

                          {/* Big center text */}
                          <text x="100" y="125" fontFamily="sans-serif" fontSize="30" fontWeight="900" fill="#1e293b" textAnchor="middle" letterSpacing="2">CYBER</text>
                        </svg>
                      </div>

                      {/* SEAL 2: RED (NO AUTORIZADO / NO CUMPLE) */}
                      <div className="flex flex-col items-center justify-center p-6 bg-white rounded-sm border border-gray-50 shadow-xs hover:shadow-md transition-shadow">
                        <svg viewBox="0 0 200 200" className="w-48 h-48 select-none">
                          <circle cx="100" cy="100" r="95" fill="none" stroke="#dc2626" strokeWidth="4" />
                          <circle cx="100" cy="100" r="88" fill="none" stroke="#dc2626" strokeWidth="1.5" strokeDasharray="3,3" />
                          
                          {/* Paths for text */}
                          <path id="top-arc-path-red" d="M 30,100 A 70,70 0 0,1 170,100" fill="none" stroke="none" />
                          <path id="bottom-arc-path-red" d="M 170,100 A 70,70 0 0,1 30,100" fill="none" stroke="none" />
                          
                          {/* Curved red background ribbons */}
                          <path d="M 18,100 A 82,82 0 0,1 182,100 L 164,100 A 64,64 0 0,0 36,100 Z" fill="#dc2626" />
                          <path d="M 18,100 A 82,82 0 0,0 182,100 L 164,100 A 64,64 0 0,1 36,100 Z" fill="#dc2626" />

                          {/* Text along path */}
                          <text fill="#ffffff" fontFamily="sans-serif" fontSize="11" fontWeight="900" letterSpacing="2" textAnchor="middle">
                            <textPath href="#top-arc-path-red" startOffset="50%">NO AUTORIZADO</textPath>
                          </text>
                          
                          <text fill="#ffffff" fontFamily="sans-serif" fontSize="12" fontWeight="900" letterSpacing="2" textAnchor="middle">
                            <textPath href="#bottom-arc-path-red" startOffset="50%">NO CUMPLE</textPath>
                          </text>

                          {/* Star in the center */}
                          <g fill="#dc2626">
                            <text x="100" y="75" fontSize="16" textAnchor="middle">★</text>
                          </g>

                          {/* Big center text */}
                          <text x="100" y="125" fontFamily="sans-serif" fontSize="30" fontWeight="900" fill="#1e293b" textAnchor="middle" letterSpacing="2">CYBER</text>
                        </svg>
                      </div>

                    </div>
                  </div>
                </div>

                {/* Digital Download Book section */}
                <div className="bg-gray-50 border border-gray-200 rounded-sm p-5 space-y-4">
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <h4 className="font-bold text-gris-azulado uppercase text-[11px] tracking-wider flex items-center">
                      <FileSpreadsheet className="w-4 h-4 mr-1.5 text-cobre" />
                      Certificados de Sellos de Seguridad Emitidos
                    </h4>
                    <button
                      onClick={() => showToast('📥 Descarga iniciada: Excel de Resultados Licitación DAC_' + activeDac.id + '.xlsx')}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[10px] uppercase rounded-sm flex items-center gap-1 focus:outline-none"
                    >
                      <Download className="w-3.5 h-3.5" /> Descargar Libro Completo
                    </button>
                  </div>

                  {/* List of downloadable individual certificates */}
                  <div className="space-y-2">
                    {computedSuppliers.map(sup => (
                      <div key={sup.id} className="flex justify-between items-center p-3 bg-white border border-gray-150 rounded-sm">
                        <div className="flex items-center space-x-3">
                          <Award className={`w-5 h-5 ${sup.seal === 'Verde' ? 'text-emerald-600' : sup.seal === 'Amarillo' ? 'text-amber-500' : 'text-rose-600'}`} />
                          <div>
                            <p className="font-bold text-gray-800">{sup.name}</p>
                            <p className="text-[9px] text-gray-400 font-mono">HASH INMUTABLE: SHA256-COD-{sup.id.toUpperCase()}-302193</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.5 rounded-full border text-[8px] font-bold ${getSelloColor(sup.seal)}`}>
                            Sello {sup.seal}
                          </span>
                          <button
                            onClick={() => showToast(`📥 Descarga de certificado para ${sup.name} en formato PDF`)}
                            className="p-1.5 hover:bg-gray-100 text-gray-500 hover:text-cobre border border-transparent hover:border-gray-200 rounded-xs focus:outline-none"
                            title="Descargar Certificado PDF"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-surface-custom/20 border border-crema/10 rounded-sm text-[10px] mt-4 leading-relaxed">
                  <strong className="text-gris-azulado uppercase">POLÍTICA CORPORATIVA DE INCENTIVOS DE CIBERSEGURIDAD CODELCO:</strong>
                  <p className="text-gray-600 mt-1">
                    Aquellos oferentes certificados con **Sello Verde** u **Oro** obtienen de forma automática una bonificación del **5%** en su ponderación técnica de licitación para futuros proyectos corporativos de sistemas de información o tecnología operacional.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION STEPS ACTIONS BUTTONS FOOTER */}
          <div className="flex items-center justify-between border-t border-gray-200 pt-4 font-sans font-semibold shrink-0">
            <button
              onClick={handlePrevSection}
              disabled={currentIndex <= 0}
              className="px-4 py-2 border border-gray-300 rounded-sm hover:bg-gray-50 flex items-center gap-2.5 text-xs text-gray-700 disabled:opacity-40 focus:outline-none cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Sección Anterior
            </button>
            
            <button
              onClick={handleNextSection}
              disabled={currentIndex >= visibleSections.length - 1}
              className="px-4 py-2 bg-gris-azulado hover:bg-black rounded-sm flex items-center gap-2.5 text-xs text-white disabled:opacity-40 focus:outline-none cursor-pointer"
            >
              Siguiente Sección
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* TOAST SUCCESS PANEL */}
      {successToast && (
        <div className="fixed bottom-5 right-5 bg-gris-azulado text-white border border-crema/30 p-4 rounded-sm shadow-2xl flex items-center space-x-3 z-50 text-xs animate-slide-up max-w-sm">
          <CheckCircle2 className="text-cobre w-5 h-5 animate-bounce shrink-0" />
          <div>
            <p className="font-bold">Notificación de SharePoint</p>
            <p className="text-crema text-[10px] mt-0.5">{successToast}</p>
          </div>
        </div>
      )}
    </div>
  );
}
