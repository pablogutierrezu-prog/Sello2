import React, { useState, useMemo, useEffect } from 'react';
import { DacRequest, Finding, UserRole, DacState } from '../types';
import { DIVISIONES, GERENCIAS } from '../mockData';
import {
  FileText,
  CheckCircle2,
  Clock,
  ArrowLeft,
  ArrowRight,
  Save,
  Send,
  AlertTriangle,
  Upload,
  Paperclip,
  Trash2,
  Check,
  AlertOctagon,
  ChevronRight,
  MessageSquare,
  HelpCircle,
  Lock,
  User,
  Building,
  Shield,
  ShieldAlert,
  Server,
  Network,
  Calendar,
  Users,
  DollarSign,
  Briefcase,
  Layers,
  FileSpreadsheet,
  ShieldCheck
} from 'lucide-react';

interface FormulariosProps {
  key?: string | null;
  dacs: DacRequest[];
  findings: Finding[];
  currentRole: UserRole;
  selectedDacId: string | null;
  onSelectDac: (id: string | null) => void;
  onUpdateDacState: (id: string, newState: DacState) => void;
  onUpdateDacForm: (id: string, newForm: any) => void;
  onTriggerFinding: (dacId: string, findingData: Partial<Finding>) => void;
}

export default function FormulariosView({
  dacs,
  findings,
  currentRole,
  selectedDacId,
  onSelectDac,
  onUpdateDacState,
  onUpdateDacForm,
  onTriggerFinding
}: FormulariosProps) {
  // Select active DAC
  const activeDac = dacs.find(d => d.id === selectedDacId) || dacs[0] || {
    id: '',
    projectName: '',
    jpName: '',
    jpEmail: '',
    jpPhone: '',
    jpRut: '',
    jpCargo: '',
    companyName: '',
    companyRut: '',
    companyAddress: '',
    companyWebsite: '',
    companySize: '',
    description: '',
    type: 'Implementación',
    scope: [],
    criticidad: 'Medio',
    startDate: '',
    durationMonths: 12,
    budgetEstimate: 0,
    justification: '',
    state: 'BORRADOR'
  };

  const [activeSection, setActiveSection] = useState<string>('0'); // Default to Section 0 (Inicio) to match user requirements
  const [mobileSectionsOpen, setMobileSectionsOpen] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Form states matching active dac form
  const [formData, setFormData] = useState(() => {
    const dacForm = activeDac?.dacForm || {};
    return {
      mfaEnabled: dacForm.mfaEnabled || 'Sí',
      mfaTech: dacForm.mfaTech || ['Microsoft Authenticator', 'SMS'],
      mfaCoverageAdmin: dacForm.mfaCoverageAdmin || '100',
      mfaCoverageUsers: dacForm.mfaCoverageUsers || '85',
      mfaCoverageExternal: dacForm.mfaCoverageExternal || '100',
      rbacEnabled: dacForm.rbacEnabled || 'Sí',
      rbacRoles: dacForm.rbacRoles || '15',
      rbacMinimumPrivilege: dacForm.rbacMinimumPrivilege || 'Sí',
      encryptionTransit: dacForm.encryptionTransit || 'Sí',
      encryptionTransitProtocol: dacForm.encryptionTransitProtocol || ['TLS 1.3', 'TLS 1.2'],
      encryptionRepose: dacForm.encryptionRepose || 'No',
      vulnScanning: dacForm.vulnScanning || 'Sí',
      vulnFreq: dacForm.vulnFreq || 'Semanal',
      vulnTool: dacForm.vulnTool || 'Nessus Professional',
      vulnLastDate: dacForm.vulnLastDate || '2026-06-15',
      vulnCritical: dacForm.vulnCritical || '2',
      vulnHigh: dacForm.vulnHigh || '5',
      vulnMedium: dacForm.vulnMedium || '12',
      vulnLow: dacForm.vulnLow || '28',
      vulnRemediateDays: dacForm.vulnRemediateDays || { critical: '24', high: '72', medium: '7' },
      formComments: dacForm.formComments || '',

      // Section 1
      projectName: dacForm.projectName || activeDac?.projectName || '',
      jpName: dacForm.jpName || activeDac?.jpName || '',
      jpEmail: dacForm.jpEmail || activeDac?.jpEmail || '',
      jpPhone: dacForm.jpPhone || activeDac?.jpPhone || '',
      jpCargo: dacForm.jpCargo || activeDac?.jpCargo || '',
      jpRut: dacForm.jpRut || activeDac?.jpRut || '',
      companyName: dacForm.companyName || activeDac?.companyName || '',
      companyRut: dacForm.companyRut || activeDac?.companyRut || '',
      companyAddress: dacForm.companyAddress || activeDac?.companyAddress || '',
      companyWebsite: dacForm.companyWebsite || activeDac?.companyWebsite || '',
      catiCode: dacForm.catiCode || 'CATI-2026-991',
      vicepresidencia: dacForm.vicepresidencia || 'VP de Tecnología y Automatización (VPTA)',
      division: dacForm.division || 'Casa Matriz',
      gerencia: dacForm.gerencia || 'Gerencia de Ciberseguridad Corporativa',
      serviceDesc: dacForm.serviceDesc || activeDac?.description || '',

      // Section 2
      deploymentEnv: dacForm.deploymentEnv || 'SaaS (Nube Pública)',
      cloudProvider: dacForm.cloudProvider || 'Microsoft Azure / AWS',
      integrationType: dacForm.integrationType || 'API REST (HTTPS)',
      sensitiveData: dacForm.sensitiveData || 'Sí',
      otConnection: dacForm.otConnection || 'No',
      dataBaseEngine: dacForm.dataBaseEngine || 'PostgreSQL',
      authenticationMethod: dacForm.authenticationMethod || 'Microsoft Entra ID (SAML/OIDC)',
      backupPolicy: dacForm.backupPolicy || 'Diaria con retención de 30 días',
      disasterRecovery: dacForm.disasterRecovery || 'Sí, documentado y probado',
      dataFlowDesc: dacForm.dataFlowDesc || 'Intercambio de datos transaccionales mediante HTTPS. No se accede a redes de control de procesos (OT).',
      architectureEvaluation: dacForm.architectureEvaluation || 'Verde',

      // Section 3
      kickoffDate: dacForm.kickoffDate || '2026-06-18',
      kickoffHour: dacForm.kickoffHour || '10:30',
      kickoffStatus: dacForm.kickoffStatus || 'Completado',
      kickoffLink: dacForm.kickoffLink || 'https://teams.microsoft.com/l/meetup-join/codelco-kickoff-ciberseguridad-dac',
      kickoffMin: dacForm.kickoffMin || 'Se realizó alineación sobre los controles mínimos. El proveedor se compromete a cumplir con la directiva de MFA y cifrado. Se programaron escaneos de vulnerabilidades periódicos.',
      participants: dacForm.participants || ['JP Codelco', 'Arquitecto Ciberseguridad', 'Líder Técnico Proveedor'],
      kickoffPendingActions: dacForm.kickoffPendingActions || '1. Proveedor debe enviar evidencia de MFA configurado en ambiente de producción.\n2. Codelco programará análisis de vulnerabilidades automatizado.\n3. Validar cifrado en reposo de la base de datos Azure SQL.',

      // Section 6 & 6.1
      budgetConsulting: dacForm.budgetConsulting || '5400',
      budgetLicensing: dacForm.budgetLicensing || '2100',
      budgetPentesting: dacForm.budgetPentesting || '3500',
      budgetRetest: dacForm.budgetRetest || '1500',
      
      // Section 8
      verdict: dacForm.verdict || 'Aprobado con Observaciones',
      auditorComments: dacForm.auditorComments || 'Sello de Bronce pre-aprobado. Se requiere mitigar el cifrado de datos en reposo para optar al Sello de Plata.',
      exceptions: dacForm.exceptions || 'Ninguna',
      scoreEH: dacForm.scoreEH || 80,
      scoreDAST: dacForm.scoreDAST || 90,
      scoreSCAN: dacForm.scoreSCAN || 85
    };
  });

  // Mock upload files list
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([
    { name: 'politica_mfa_v2.pdf', size: '250 KB', date: '23/06/2026' },
    { name: 'screenshot_configuracion_mfa.png', size: '1.2 MB', date: '23/06/2026' },
    { name: 'reporte_cobertura_mfa.xlsx', size: '85 KB', date: '23/06/2026' }
  ]);

  const [dragOver, setDragOver] = useState(false);

  // Sections details precisely matching the sheets tabs of the Excel document
  const sections = useMemo(() => {
    const isUnlocked = ['RESP_PRESUPUESTO_EY', 'RESP_EVAL_TECNICA_EY', 'RESP_EVAL_DOC_EY', 'ADMIN'].includes(currentRole);
    return [
      { id: '0', label: '0. Inicio', state: 'complete', icon: HelpCircle },
      { id: '1', label: '1. Descripción solicitud', state: 'complete', icon: FileText },
      { id: '2', label: '2. Arquitectura de Seg.', state: 'complete', icon: Server },
      { id: '2.1', label: '2.1 Diagrama de Arq. Seg.', state: 'complete', icon: Network },
      { id: '3', label: '3. Kick-Off', state: 'complete', icon: Calendar },
      { id: '4', label: '4. Matriz de Decisión', state: isUnlocked ? 'active' : 'locked', locked: isUnlocked ? false : true, icon: isUnlocked ? FileText : Lock },
      { id: '5', label: '5. Controles de Seguridad', state: 'active', icon: Shield },
      { id: '6', label: '6. Presupuesto Servicio', state: 'pending', icon: DollarSign },
      { id: '6.1', label: '6.1 Presupuesto Retest', state: 'pending', icon: FileSpreadsheet },
      { id: '7', label: '7. Consideraciones y SLAs', state: isUnlocked ? 'active' : 'locked', locked: isUnlocked ? false : true, icon: isUnlocked ? Clock : Lock },
      { id: '8', label: '8. Resolución', state: 'pending', icon: Briefcase },
      { id: '9', label: '9. Anexos (Sellos)', state: 'pending', icon: Layers }
    ];
  }, [currentRole]);

  // Filter sections based on the current user role from the Excel user stories matrix (Sello en Procesos de Implementación y Operación)
  const visibleSections = useMemo(() => {
    return sections.filter(sec => {
      switch (sec.id) {
        case '0': // 0. Inicio -> HU-01, HU-02, HU-03 (JP, RESP_GESTION)
          return ['JP', 'RESP_GESTION', 'ADMIN'].includes(currentRole);
        case '1': // 1. Descripción solicitud -> HU-04 (JP)
          return ['JP', 'ADMIN'].includes(currentRole);
        case '2': // 2. Arquitectura de Seg. -> HU-04 (JP)
          return ['JP', 'ADMIN'].includes(currentRole);
        case '2.1': // 2.1 Diagrama de Arq. Seg. -> HU-05 (JP, RESP_ARQUITECTO_SEG)
          return ['JP', 'RESP_ARQUITECTO_SEG', 'ADMIN'].includes(currentRole);
        case '3': // 3. Kick-Off -> HU-06 (JP)
          return ['JP', 'ADMIN'].includes(currentRole);
        case '4': // 4. Matriz de Decisión -> HU-08 (JP, RESP_GESTION) + EY roles
          return ['JP', 'RESP_GESTION', 'ADMIN', 'RESP_PRESUPUESTO_EY', 'RESP_EVAL_TECNICA_EY', 'RESP_EVAL_DOC_EY'].includes(currentRole);
        case '5': // 5. Controles de Seguridad -> HU-09 (RESP_GESTION)
          return ['RESP_GESTION', 'ADMIN'].includes(currentRole);
        case '6': // 6. Presupuesto Servicio -> HU-10 (JP, GERENTE_APROBADORA, RESP_PRESUPUESTO_EY)
          return ['JP', 'GERENTE_APROBADORA', 'RESP_PRESUPUESTO_EY', 'ADMIN'].includes(currentRole);
        case '6.1': // 6.1 Presupuesto Retest -> HU-13 (JP, RESP_GESTION, GERENTE_APROBADORA)
          return ['JP', 'RESP_GESTION', 'GERENTE_APROBADORA', 'ADMIN'].includes(currentRole);
        case '7': // 7. Consideraciones y SLAs -> HU-07 (JP, RESP_GESTION) + EY roles
          return ['JP', 'RESP_GESTION', 'ADMIN', 'RESP_PRESUPUESTO_EY', 'RESP_EVAL_TECNICA_EY', 'RESP_EVAL_DOC_EY'].includes(currentRole);
        case '8': // 8. Resolución -> HU-14 (RESP_GESTION)
          return ['RESP_GESTION', 'ADMIN'].includes(currentRole);
        case '9': // 9. Anexos (Sellos) -> HU-16 (RESP_GESTION)
          return ['RESP_GESTION', 'ADMIN'].includes(currentRole);
        default:
          return true;
      }
    });
  }, [sections, currentRole]);

  // Adjust activeSection dynamically when the user switches role
  useEffect(() => {
    const isAllowed = visibleSections.some(sec => sec.id === activeSection);
    if (!isAllowed && visibleSections.length > 0) {
      setActiveSection(visibleSections[0].id);
    }
  }, [currentRole, visibleSections, activeSection]);

  // Handle value change
  const handleChange = (field: string, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onUpdateDacForm(activeDac.id, updated);

    // Dynamic Finding check: If "No" is chosen for Encryption in Repose, trigger finding!
    if (field === 'encryptionRepose' && value === 'No') {
      triggerAutomaticEncryptionFinding();
    }
  };

  const triggerAutomaticEncryptionFinding = () => {
    // Check if finding already exists
    const exists = findings.some(f => f.dacId === activeDac.id && f.title.includes('reposo'));
    if (!exists) {
      onTriggerFinding(activeDac.id, {
        title: 'Falta implementar cifrado de datos en reposo',
        description: `Durante el llenado del Formulario DAC para ${activeDac.projectName}, el JP declaró que el sistema no posee mecanismos de cifrado para datos almacenados (en reposo). Esto infringe la directriz de seguridad de datos corporativos de Codelco.`,
        criticidad: 'CRÍTICA',
        origin: 'Formulario DAC Autoevaluación',
        assignedTo: activeDac.jpName,
        email: activeDac.jpEmail,
        recommendation: 'Activar TDE (Transparent Data Encryption) en el motor de base de datos o cifrar a nivel de disco utilizando bitlocker / dm-crypt.'
      });
      showToast('⚠️ Hallazgo crítico detectado y creado en Gestión de Hallazgos');
    }
  };

  // Drag and drop mock uploader
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    // Simulate adding file
    const file = e.dataTransfer.files[0];
    if (file) {
      addMockFile(file.name, file.size);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      addMockFile(file.name, file.size);
    }
  };

  const addMockFile = (name: string, rawSize: number) => {
    const sizeStr = rawSize > 1024 * 1024 
      ? `${(rawSize / (1024 * 1024)).toFixed(1)} MB`
      : `${(rawSize / 1024).toFixed(0)} KB`;

    const newFile = {
      name,
      size: sizeStr,
      date: new Date().toLocaleDateString('es-CL')
    };

    setUploadedFiles([...uploadedFiles, newFile]);
    showToast(`✓ Archivo "${name}" cargado con éxito`);
  };

  const handleDeleteFile = (fileName: string) => {
    setUploadedFiles(uploadedFiles.filter(f => f.name !== fileName));
    showToast(`❌ Archivo "${fileName}" removido`);
  };

  const showToast = (message: string) => {
    setSuccessToast(message);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleSaveDraft = () => {
    onUpdateDacForm(activeDac.id, formData);
    showToast('💾 Borrador guardado exitosamente en SharePoint');
  };

  const handleSubmitToCodelco = () => {
    onUpdateDacForm(activeDac.id, formData);

    // If "No" in encryption in reposo, we must make sure the finding is triggered
    if (formData.encryptionRepose === 'No') {
      triggerAutomaticEncryptionFinding();
    }

    // Advance state to EN REVISIÓN ARQUITECTURA
    onUpdateDacState(activeDac.id, 'EN REVISIÓN ARQUITECTURA');
    showToast('📤 Formulario enviado con éxito a Revisión de Arquitectura');
  };

  const handleSectionClick = (secId: string) => {
    setActiveSection(secId);
    setMobileSectionsOpen(false);
  };

  if (!activeDac) {
    return (
      <div className="p-8 text-center text-gray-500 font-sans animate-fade-in" id="formularios-view">
        No hay una solicitud DAC activa seleccionada.
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] w-full overflow-hidden text-xs bg-gray-50" id="formularios-view">
      
      {/* Mobile view indicator & toggle */}
      <div className="lg:hidden bg-white border-b border-crema/20 p-4 flex items-center justify-between shadow-xs shrink-0 w-full" id="formularios-mobile-bar">
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
      <div className={`${mobileSectionsOpen ? 'flex' : 'hidden'} lg:flex w-full lg:w-72 bg-white border-b lg:border-b-0 lg:border-r border-crema/20 shrink-0 overflow-y-auto flex-col p-4 md:p-6`} id="formularios-sidebar">
        <div className="mb-4">
          <button
            onClick={() => onSelectDac(null)}
            className="text-cobre font-bold uppercase text-[10px] tracking-wider flex items-center hover:underline focus:outline-none"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Volver al Dashboard
          </button>
        </div>

        <div className="border-b border-gray-100 pb-3 mb-4">
          <h3 className="text-xs font-bold text-gris-azulado font-display uppercase tracking-widest leading-tight">
            Secciones DAC
          </h3>
          <span className="text-[10px] text-gray-400 block mt-1 leading-none">
            N° DAC: <strong>{activeDac.id.length === 8 ? `${activeDac.id.slice(0, 4)}-${activeDac.id.slice(4)}` : activeDac.id}</strong>
          </span>
        </div>

        {/* Vertical steps navigation */}
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
                    <span className="text-[10px] text-gray-400 font-bold ml-1" title="Sección aprobada y bloqueada">🔒</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Progress bar in sidebar footer */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="flex justify-between text-[10px] font-bold text-gray-500 mb-1.5 font-sans">
            <span>PROGRESO DEL FORMULARIO</span>
            <span>40%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div className="bg-cobre h-1.5 rounded-full" style={{ width: '40%' }}></div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Form Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col justify-between">
        <div className="space-y-8 max-w-4xl mx-auto w-full">
          {/* DAC Header Card */}
          <div className="bg-white border border-crema/20 p-5 rounded-sm shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border ${
                activeDac.state === 'EN LLENADO' ? 'bg-blue-50 text-azul border-azul/20' : 'bg-amber-50 text-oro border-oro/20'
              }`}>
                Estado: {activeDac.state}
              </span>
              <h2 className="text-base font-bold font-display text-gris-azulado uppercase mt-2.5 tracking-wide">
                {activeDac.projectName}
              </h2>
              <p className="text-xs text-gray-500 font-sans mt-0.5">
                JP: <strong>{activeDac.jpName}</strong> • Empresa: <strong>{activeDac.companyName}</strong>
              </p>
            </div>
            
            <div className="flex items-center space-x-2 shrink-0 self-end md:self-auto">
              <button
                onClick={handleSaveDraft}
                className="bg-white hover:bg-gray-50 text-gris-azulado border border-crema/40 px-3.5 py-2 rounded-sm text-xs font-bold uppercase tracking-wider font-display flex items-center shadow-xs cursor-pointer focus:outline-none"
              >
                <Save className="w-4 h-4 mr-1.5 text-cobre" />
                Guardar Borrador
              </button>
              {(currentRole === 'JP' || currentRole === 'ADMIN') && activeDac.state === 'EN LLENADO' && (
                <button
                  onClick={handleSubmitToCodelco}
                  className="bg-cobre hover:bg-cobre-oscuro text-white px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-wider font-display flex items-center shadow-xs cursor-pointer focus:outline-none"
                >
                  <Send className="w-4 h-4 mr-1.5" />
                  Enviar a revisión
                </button>
              )}
            </div>
          </div>

          {/* DYNAMIC SECTION VIEWER */}
          {activeSection === '0' && (
            <div className="bg-white border border-crema/20 rounded-sm p-6 md:p-8 shadow-xs space-y-6">
              <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-cobre font-display uppercase tracking-wider flex items-center">
                    <HelpCircle className="w-5 h-5 mr-2 text-cobre" />
                    0. Inicio y Directrices
                  </h3>
                  <p className="text-[10px] text-gray-400 font-sans mt-0.5">
                    Introducción al proceso de obtención del Sello de Ciberseguridad Codelco.
                  </p>
                </div>
                <span className="text-[10px] text-verde-petroleo font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full uppercase">
                  Paso Inicial
                </span>
              </div>

              <div className="space-y-4 font-sans text-xs text-gray-700 leading-relaxed">
                <div className="p-4 bg-surface-custom/30 border border-crema/10 rounded-sm">
                  <h4 className="font-bold text-gris-azulado uppercase text-[11px] mb-2">Directiva Corporativa de Seguridad</h4>
                  <p>
                    El presente formulario tiene carácter de <strong>Declaración Jurada de Controles</strong> y busca evaluar el nivel de ciberseguridad para el servicio: <strong className="text-cobre">{activeDac.projectName}</strong>.
                  </p>
                  <p className="mt-2">
                    De acuerdo con las normativas corporativas vigentes, todos los proveedores externos que almacenen, transmitan o procesen información sensible de Codelco deben certificar la correcta implementación de controles antes de la puesta en producción.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="p-4 bg-white border border-gray-100 rounded-sm space-y-1">
                    <span className="text-xs font-bold text-gray-400 block font-display">PASO 1</span>
                    <h5 className="font-bold text-gris-azulado">Llenar Autoevaluación</h5>
                    <p className="text-[10px] text-gray-500">Completar las secciones de Identificación, Arquitectura, y Controles de Seguridad.</p>
                  </div>
                  <div className="p-4 bg-white border border-gray-100 rounded-sm space-y-1">
                    <span className="text-xs font-bold text-gray-400 block font-display">PASO 2</span>
                    <h5 className="font-bold text-gris-azulado">Revisión Codelco</h5>
                    <p className="text-[10px] text-gray-500">El equipo de Arquitectura de Ciberseguridad valida los controles y emite hallazgos si existen brechas.</p>
                  </div>
                  <div className="p-4 bg-white border border-gray-100 rounded-sm space-y-1">
                    <span className="text-xs font-bold text-gray-400 block font-display">PASO 3</span>
                    <h5 className="font-bold text-gris-azulado">Sello de Seguridad</h5>
                    <p className="text-[10px] text-gray-500">Se otorga el Sello correspondiente (Bronce, Plata u Oro) habilitando la adjudicación definitiva.</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <h4 className="font-bold text-gris-azulado uppercase text-[11px] mb-3">Estado del Formulario</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center bg-gray-50 p-2.5 rounded-sm">
                      <span className="font-semibold text-gray-600">0. Inicio</span>
                      <span className="text-verde-petroleo font-bold">✓ Completado</span>
                    </div>
                    <div className="flex justify-between items-center bg-gray-50 p-2.5 rounded-sm">
                      <span className="font-semibold text-gray-600">1. Descripción solicitud</span>
                      <span className="text-verde-petroleo font-bold">✓ Completado</span>
                    </div>
                    <div className="flex justify-between items-center bg-gray-50 p-2.5 rounded-sm">
                      <span className="font-semibold text-gray-600">5. Controles de Seguridad</span>
                      <span className="text-cobre font-bold flex items-center">
                        <Clock className="w-3.5 h-3.5 mr-1" /> En Llenado (40%)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === '1' && (
            <div className="bg-white border border-crema/20 rounded-sm p-6 md:p-8 shadow-xs space-y-6">
              <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-cobre font-display uppercase tracking-wider flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-cobre" />
                    1. Descripción de la Solicitud
                  </h3>
                  <p className="text-[10px] text-gray-400 font-sans mt-0.5">
                    Identificación del Jefe de Proyecto (JP), división de origen y detalles de la empresa proveedora.
                  </p>
                </div>
              </div>

              <div className="space-y-5 font-sans text-xs">
                {/* 1.1 Datos del Proyecto */}
                <div className="space-y-3">
                  <span className="font-display font-bold text-xs uppercase text-gris-azulado tracking-wider block border-b border-gray-100 pb-1.5">
                    1.1 Información General del Proyecto
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-gray-600">Nombre del Proyecto / Servicio *</label>
                      <input
                        type="text"
                        value={formData.projectName}
                        onChange={(e) => handleChange('projectName', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-crema/30 rounded-sm bg-white focus:outline-none focus:border-cobre"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-gray-600">Código de Proyecto / CATI</label>
                      <input
                        type="text"
                        value={formData.catiCode}
                        onChange={(e) => handleChange('catiCode', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-crema/30 rounded-sm bg-white focus:outline-none focus:border-cobre"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-gray-600">Vicepresidencia Responsable</label>
                      <input
                        type="text"
                        value={formData.vicepresidencia}
                        onChange={(e) => handleChange('vicepresidencia', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-crema/30 rounded-sm bg-white focus:outline-none focus:border-cobre"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-gray-600">Gerencia Solicitante</label>
                      <input
                        type="text"
                        value={formData.gerencia}
                        onChange={(e) => handleChange('gerencia', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-crema/30 rounded-sm bg-white focus:outline-none focus:border-cobre"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-gray-600">División Codelco</label>
                      <select
                        value={formData.division}
                        onChange={(e) => handleChange('division', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-crema/30 rounded-sm bg-white focus:outline-none focus:border-cobre"
                      >
                        {DIVISIONES.map(div => (
                          <option key={div} value={div}>{div}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-gray-600">Descripción del Servicio</label>
                    <textarea
                      value={formData.serviceDesc}
                      onChange={(e) => handleChange('serviceDesc', e.target.value)}
                      rows={3}
                      className="w-full px-2.5 py-1.5 border border-crema/30 rounded-sm bg-white focus:outline-none focus:border-cobre"
                    />
                  </div>
                </div>

                {/* 1.2 Datos del PM / JP */}
                <div className="space-y-3 pt-3 border-t border-gray-100">
                  <span className="font-display font-bold text-xs uppercase text-gris-azulado tracking-wider block border-b border-gray-100 pb-1.5">
                    1.2 Datos del Jefe de Proyecto (JP) Codelco
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-gray-600">Nombre Completo *</label>
                      <input
                        type="text"
                        value={formData.jpName}
                        onChange={(e) => handleChange('jpName', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-crema/30 rounded-sm bg-white focus:outline-none focus:border-cobre"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-gray-600">Email Corporativo *</label>
                      <input
                        type="email"
                        value={formData.jpEmail}
                        onChange={(e) => handleChange('jpEmail', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-crema/30 rounded-sm bg-white focus:outline-none focus:border-cobre"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-gray-600">Cargo</label>
                      <input
                        type="text"
                        value={formData.jpCargo}
                        onChange={(e) => handleChange('jpCargo', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-crema/30 rounded-sm bg-white focus:outline-none focus:border-cobre"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-gray-600">RUT del JP</label>
                      <input
                        type="text"
                        value={formData.jpRut}
                        onChange={(e) => handleChange('jpRut', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-crema/30 rounded-sm bg-white focus:outline-none focus:border-cobre"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-gray-600">Teléfono del JP</label>
                      <input
                        type="text"
                        value={formData.jpPhone}
                        onChange={(e) => handleChange('jpPhone', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-crema/30 rounded-sm bg-white focus:outline-none focus:border-cobre"
                      />
                    </div>
                  </div>
                </div>

                {/* 1.3 Datos de la Empresa Proveedora */}
                <div className="space-y-3 pt-3 border-t border-gray-100">
                  <span className="font-display font-bold text-xs uppercase text-gris-azulado tracking-wider block border-b border-gray-100 pb-1.5">
                    1.3 Datos de la Empresa Proveedora
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-gray-600">Razón Social Empresa *</label>
                      <input
                        type="text"
                        value={formData.companyName}
                        onChange={(e) => handleChange('companyName', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-crema/30 rounded-sm bg-white focus:outline-none focus:border-cobre"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-gray-600">RUT Empresa</label>
                      <input
                        type="text"
                        value={formData.companyRut}
                        onChange={(e) => handleChange('companyRut', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-crema/30 rounded-sm bg-white focus:outline-none focus:border-cobre"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-gray-600">Dirección Comercial</label>
                      <input
                        type="text"
                        value={formData.companyAddress}
                        onChange={(e) => handleChange('companyAddress', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-crema/30 rounded-sm bg-white focus:outline-none focus:border-cobre"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-gray-600">Sitio Web Empresa</label>
                      <input
                        type="text"
                        value={formData.companyWebsite}
                        onChange={(e) => handleChange('companyWebsite', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-crema/30 rounded-sm bg-white focus:outline-none focus:border-cobre"
                      />
                    </div>
                    <div className="space-y-1 col-span-2">
                      <label className="font-bold text-gray-600">Tamaño de la Empresa</label>
                      <select
                        value={formData.companySize}
                        onChange={(e) => handleChange('companySize', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-crema/30 rounded-sm bg-white focus:outline-none focus:border-cobre"
                      >
                        <option value="Grande (>200 empleados)">Grande (&gt;200 empleados)</option>
                        <option value="Mediana (50-200 empleados)">Mediana (50-200 empleados)</option>
                        <option value="Pequeña (<50 empleados)">Pequeña (&lt;50 empleados)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === '2' && (
            <div className="bg-white border border-crema/20 rounded-sm p-6 md:p-8 shadow-xs space-y-6">
              <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-cobre font-display uppercase tracking-wider flex items-center">
                    <Server className="w-5 h-5 mr-2 text-cobre" />
                    2. Arquitectura de Seguridad
                  </h3>
                  <p className="text-[10px] text-gray-400 font-sans mt-0.5">
                    Entorno tecnológico de despliegue, nube utilizada e integraciones con Codelco.
                  </p>
                </div>
              </div>

              <div className="space-y-5 font-sans text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Entorno de Despliegue *</label>
                    <select
                      value={formData.deploymentEnv}
                      onChange={(e) => handleChange('deploymentEnv', e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-crema/30 rounded-sm bg-white focus:outline-none focus:border-cobre"
                    >
                      <option value="SaaS (Nube Pública)">SaaS (Nube Pública)</option>
                      <option value="PaaS (Plataforma como Servicio)">PaaS (Plataforma como Servicio)</option>
                      <option value="IaaS (Infraestructura como Servicio)">IaaS (Infraestructura como Servicio)</option>
                      <option value="On-Premises Codelco">On-Premises Codelco</option>
                      <option value="Híbrido">Híbrido (Nube + On-Premises)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Proveedor de Cloud principal</label>
                    <input
                      type="text"
                      value={formData.cloudProvider}
                      onChange={(e) => handleChange('cloudProvider', e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-crema/30 rounded-sm bg-white focus:outline-none focus:border-cobre"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Tipo de Integración con Codelco</label>
                    <select
                      value={formData.integrationType}
                      onChange={(e) => handleChange('integrationType', e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-crema/30 rounded-sm bg-white focus:outline-none focus:border-cobre"
                    >
                      <option value="API REST (HTTPS)">API REST (HTTPS)</option>
                      <option value="VPN IPsec Dedicada">VPN IPsec Dedicada</option>
                      <option value="Enlace Directo (ExpressRoute / DirectConnect)">Enlace Directo (ExpressRoute / DirectConnect)</option>
                      <option value="Intercambio de archivos SFTP">Intercambio de archivos SFTP</option>
                      <option value="Ninguna (Autónomo)">Ninguna (Autónomo)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">¿Almacena Datos Sensibles corporativos?</label>
                    <select
                      value={formData.sensitiveData}
                      onChange={(e) => handleChange('sensitiveData', e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-crema/30 rounded-sm bg-white focus:outline-none focus:border-cobre"
                    >
                      <option value="Sí">Sí (RUTs, Leyes de cobre, Datos geológicos, etc.)</option>
                      <option value="No">No (Solo datos generales de operación pública)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Motor de Base de Datos</label>
                    <select
                      value={formData.dataBaseEngine}
                      onChange={(e) => handleChange('dataBaseEngine', e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-crema/30 rounded-sm bg-white focus:outline-none focus:border-cobre"
                    >
                      <option value="PostgreSQL">PostgreSQL</option>
                      <option value="SQL Server">SQL Server</option>
                      <option value="Oracle Database">Oracle Database</option>
                      <option value="MySQL / MariaDB">MySQL / MariaDB</option>
                      <option value="MongoDB / NoSQL">MongoDB / NoSQL</option>
                      <option value="SAP HANA">SAP HANA</option>
                      <option value="No Aplica / Sin base de datos dedicada">No Aplica / Sin base de datos dedicada</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Método de Autenticación de la Aplicación</label>
                    <select
                      value={formData.authenticationMethod}
                      onChange={(e) => handleChange('authenticationMethod', e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-crema/30 rounded-sm bg-white focus:outline-none focus:border-cobre"
                    >
                      <option value="Microsoft Entra ID (SAML/OIDC)">Microsoft Entra ID (SAML/OIDC)</option>
                      <option value="Directorio Activo Local (LDAP)">Directorio Activo Local (LDAP)</option>
                      <option value="Autenticación Local (Base de datos propia)">Autenticación Local (Base de datos propia)</option>
                      <option value="OAuth2 Proveedor Externo">OAuth2 Proveedor Externo</option>
                      <option value="Sin autenticación requerida">Sin autenticación requerida</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Política de Respaldos</label>
                    <select
                      value={formData.backupPolicy}
                      onChange={(e) => handleChange('backupPolicy', e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-crema/30 rounded-sm bg-white focus:outline-none focus:border-cobre"
                    >
                      <option value="Diaria con retención de 30 días">Diaria con retención de 30 días</option>
                      <option value="Semanal">Semanal</option>
                      <option value="Mensual">Mensual</option>
                      <option value="No Aplica">No Aplica</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Plan de Recuperación ante Desastres (DRP)</label>
                    <select
                      value={formData.disasterRecovery}
                      onChange={(e) => handleChange('disasterRecovery', e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-crema/30 rounded-sm bg-white focus:outline-none focus:border-cobre"
                    >
                      <option value="Sí, documentado y probado">Sí, documentado y probado</option>
                      <option value="Sí, en proceso de implementación">Sí, en proceso de implementación</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="font-bold text-gray-700 block">
                    ¿Se conecta a la Red Operacional Industrial (OT) de Codelco? *
                  </label>
                  <div className="flex gap-4">
                    {['Sí', 'No'].map(opt => (
                      <label key={opt} className="inline-flex items-center cursor-pointer">
                        <input
                           type="radio"
                           name="otConnection"
                           value={opt}
                           checked={formData.otConnection === opt}
                           onChange={(e) => handleChange('otConnection', e.target.value)}
                           className="w-4 h-4 text-cobre border-gray-300 focus:ring-cobre cursor-pointer"
                        />
                        <span className="ml-2 font-semibold text-gray-700">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Descripción de Flujo de Datos Principales</label>
                  <textarea
                    value={formData.dataFlowDesc}
                    onChange={(e) => handleChange('dataFlowDesc', e.target.value)}
                    rows={4}
                    className="w-full px-2.5 py-1.5 border border-crema/30 rounded-sm bg-white focus:outline-none focus:border-cobre"
                  />
                </div>
              </div>
            </div>
          )}

          {activeSection === '2.1' && (
            <div className="bg-white border border-crema/20 rounded-sm p-6 md:p-8 shadow-xs space-y-6">
              <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-cobre font-display uppercase tracking-wider flex items-center">
                    <Network className="w-5 h-5 mr-2 text-cobre" />
                    2.1 Diagrama de Arquitectura de Seguridad
                  </h3>
                  <p className="text-[10px] text-gray-400 font-sans mt-0.5">
                    Subir y verificar el diagrama gráfico de flujos de datos y conexiones con Codelco.
                  </p>
                </div>
              </div>

              <div className="space-y-5 font-sans text-xs">
                {/* Visual diagram container */}
                <div className="p-6 bg-surface-custom/20 border border-crema/25 rounded-sm flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-full max-w-lg bg-white border border-gray-100 p-4 rounded-sm shadow-xs flex flex-col items-center justify-center space-y-3 min-h-[160px]">
                    <Network className="w-12 h-12 text-cobre/40 animate-pulse" />
                    <div className="space-y-1 text-center">
                      <p className="font-bold text-gris-azulado">diagrama_arquitectura_aprobado_v1.png</p>
                      <p className="text-[10px] text-gray-400">Dimensión: 1920x1080 • Tamaño: 1.4 MB • Fecha: 21/06/2026</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-verde-petroleo border border-emerald-200 font-bold text-[9px] uppercase tracking-wider">
                      Aprobado por Arquitecto Ciberseguridad Codelco
                    </span>
                  </div>
                </div>

                {/* Subir nuevo */}
                <div className="p-5 border-2 border-dashed border-gray-200 text-center rounded-sm space-y-2">
                  <Upload className="w-6 h-6 text-cobre mx-auto" />
                  <p className="font-semibold text-gris-azulado">Subir una nueva versión del Diagrama</p>
                  <label className="inline-block mt-1 px-4 py-1 bg-gris-azulado hover:bg-black text-white rounded-sm text-[10px] font-bold uppercase tracking-wider font-display cursor-pointer focus:outline-none">
                    Seleccionar Archivo
                    <input type="file" className="hidden" accept=".png,.jpg,.jpeg,.pdf" />
                  </label>
                  <p className="text-[9px] text-gray-400">Debe detallar cortafuegos, APIs, VPNs, protocolos y zonas de red DMZ.</p>
                </div>

                {/* Evaluación del Diagrama por Arquitecto de Ciberseguridad */}
                <div className="p-4 bg-surface-custom/30 border border-crema/20 rounded-sm space-y-3 mt-4">
                  <h4 className="font-bold text-gris-azulado text-[11px] uppercase tracking-wider flex items-center">
                    <ShieldCheck className="w-4 h-4 text-cobre mr-1.5" />
                    Evaluación de Arquitectura de Red y Conexiones (Hoja 2.1 B)
                  </h4>
                  <p className="text-[10px] text-gray-500 leading-normal">
                    Conforme a la directiva de Ciberseguridad Codelco, la evaluación del diagrama de arquitectura siempre avanza el flujo de trabajo hacia la fase de <strong>EN KICK-OFF</strong> sin detener el proceso. Sin embargo, la calificación obtenida incide directamente en el <strong>10% del puntaje ponderado final del Sello de Ciberseguridad</strong>.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {[
                      { val: 'Verde', label: '🟢 Verde (Aprobado Completo)', desc: 'Máxima ponderación (10% completo / 10 pts)' },
                      { val: 'Amarillo', label: '🟡 Amarillo (Aprobado con Observaciones)', desc: 'Ponderación parcial (5% parcial / 5 pts)' }
                    ].map(opt => (
                      <label key={opt.val} className="p-3 border border-gray-250 rounded-sm hover:bg-gray-50 cursor-pointer flex items-start gap-2.5">
                        <input
                          type="radio"
                          name="architectureEvaluation"
                          value={opt.val}
                          checked={formData.architectureEvaluation === opt.val}
                          disabled={!['RESP_ARQUITECTO_SEG', 'ADMIN'].includes(currentRole)}
                          onChange={(e) => handleChange('architectureEvaluation', e.target.value)}
                          className="w-4 h-4 text-cobre border-gray-300 focus:ring-cobre cursor-pointer mt-0.5 disabled:opacity-50"
                        />
                        <div className="text-[11px]">
                          <span className="font-bold text-gray-700 block">{opt.label}</span>
                          <span className="text-[10px] text-gray-400 font-sans">{opt.desc}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                  
                  {!['RESP_ARQUITECTO_SEG', 'ADMIN'].includes(currentRole) && (
                    <p className="text-[9px] text-gray-400 italic">
                      ※ Solo modificable por el rol de Responsable Arquitecto de Seguridad. Modo de solo lectura para el Jefe de Proyecto.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeSection === '3' && (
            <div className="bg-white border border-crema/20 rounded-sm p-6 md:p-8 shadow-xs space-y-6">
              <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-cobre font-display uppercase tracking-wider flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-cobre" />
                    3. Kick-Off de Alineación Ciberseguridad
                  </h3>
                  <p className="text-[10px] text-gray-400 font-sans mt-0.5">
                    Detalle de la reunión inicial de alineación sobre políticas de Sello de Seguridad de Codelco.
                  </p>
                </div>
              </div>

              <div className="space-y-5 font-sans text-xs">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-600">Fecha del Kick-Off *</label>
                    <input
                      type="date"
                      value={formData.kickoffDate}
                      onChange={(e) => handleChange('kickoffDate', e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-crema/30 rounded-sm bg-white focus:outline-none focus:border-cobre"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-gray-600">Hora del Kick-Off</label>
                    <input
                      type="text"
                      value={formData.kickoffHour}
                      onChange={(e) => handleChange('kickoffHour', e.target.value)}
                      placeholder="Ej: 10:30"
                      className="w-full px-2.5 py-1.5 border border-crema/30 rounded-sm bg-white focus:outline-none focus:border-cobre"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-gray-600">Estado de la Reunión</label>
                    <select
                      value={formData.kickoffStatus}
                      onChange={(e) => handleChange('kickoffStatus', e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-crema/30 rounded-sm bg-white focus:outline-none focus:border-cobre"
                    >
                      <option value="Completado">Completado</option>
                      <option value="Pendiente">Pendiente</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-600">Enlace de Reunión (Microsoft Teams)</label>
                  <input
                    type="text"
                    value={formData.kickoffLink}
                    onChange={(e) => handleChange('kickoffLink', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-crema/30 rounded-sm bg-white focus:outline-none focus:border-cobre text-blue-600 underline"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-gray-700 block">Participantes alineados en la reunión</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['JP Codelco', 'Arquitecto Ciberseguridad', 'Líder Técnico Proveedor', 'Especialista de Procesos OT', 'Encargado de Calidad'].map(part => {
                      const isChecked = formData.participants?.includes(part);
                      return (
                        <label key={part} className="inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              const next = isChecked
                                ? formData.participants.filter((p: string) => p !== part)
                                : [...formData.participants, part];
                              handleChange('participants', next);
                            }}
                            className="rounded border-gray-300 text-cobre focus:ring-cobre cursor-pointer"
                          />
                          <span className="ml-2 text-gray-700">{part}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-600">Minuta del Kick-Off / Acuerdos</label>
                  <textarea
                    value={formData.kickoffMin}
                    onChange={(e) => handleChange('kickoffMin', e.target.value)}
                    rows={3}
                    className="w-full px-2.5 py-1.5 border border-crema/30 rounded-sm bg-white focus:outline-none focus:border-cobre"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-600">Acciones Pendientes y Siguientes Pasos</label>
                  <textarea
                    value={formData.kickoffPendingActions}
                    onChange={(e) => handleChange('kickoffPendingActions', e.target.value)}
                    rows={3}
                    className="w-full px-2.5 py-1.5 border border-crema/30 rounded-sm bg-white focus:outline-none focus:border-cobre text-gray-600 font-mono text-[11px]"
                  />
                </div>
              </div>
            </div>
          )}

          {activeSection === '4' && (
            <div className="bg-white border border-crema/20 rounded-sm p-6 md:p-8 shadow-xs space-y-6">
              <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-cobre font-display uppercase tracking-wider flex items-center">
                    {['RESP_PRESUPUESTO_EY', 'RESP_EVAL_TECNICA_EY', 'RESP_EVAL_DOC_EY', 'ADMIN'].includes(currentRole) ? (
                      <CheckCircle2 className="w-5 h-5 mr-2 text-cobre" />
                    ) : (
                      <Lock className="w-5 h-5 mr-2 text-cobre" />
                    )}
                    4. Matriz de Decisión y Clasificación de Criticidad
                  </h3>
                  <p className="text-[10px] text-gray-400 font-sans mt-0.5">
                    Clasificación del sistema según activos y criticidad en base a la Directriz Corporativa Codelco.
                  </p>
                </div>
                {['RESP_PRESUPUESTO_EY', 'RESP_EVAL_TECNICA_EY', 'RESP_EVAL_DOC_EY', 'ADMIN'].includes(currentRole) ? (
                  <span className="text-[10px] text-green-700 font-bold bg-green-50 border border-green-200 px-2 py-0.5 rounded-full uppercase flex items-center">
                    <Check className="w-3 h-3 mr-1" /> Desbloqueada (EY)
                  </span>
                ) : (
                  <span className="text-[10px] text-red-600 font-bold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full uppercase flex items-center">
                    <Lock className="w-3 h-3 mr-1" /> Bloqueada
                  </span>
                )}
              </div>

              <div className="space-y-4 font-sans text-xs text-gray-700">
                {['RESP_PRESUPUESTO_EY', 'RESP_EVAL_TECNICA_EY', 'RESP_EVAL_DOC_EY', 'ADMIN'].includes(currentRole) ? (
                  <div className="p-3 bg-green-50 border border-green-100 rounded-sm text-[11px] leading-relaxed flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-700 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-green-700 uppercase">Acceso Desbloqueado para Consulta EY / Admin</strong>
                      <p className="text-gray-600 mt-0.5">Su rol cuenta con acceso completo de revisión a los parámetros y decisiones de criticidad de esta matriz.</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-sm text-[11px] leading-relaxed flex gap-3">
                    <Lock className="w-5 h-5 text-granate shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-granate uppercase">Sección aprobada y bloqueada</strong>
                      <p className="text-gray-600 mt-0.5">La clasificación ha sido auditada y sellada por la Dirección de Ciberseguridad. Cualquier solicitud de reclasificación debe ser coordinada por mesa de ayuda.</p>
                    </div>
                  </div>
                )}

                <div className="border border-gray-100 rounded-sm overflow-x-auto mt-4">
                  <table className="w-full text-left divide-y divide-gray-100 text-xs">
                    <thead className="bg-gray-50 text-gray-500 font-bold">
                      <tr>
                        <th className="p-2.5">Variable de Criticidad</th>
                        <th className="p-2.5">Valor Declarado</th>
                        <th className="p-2.5 text-center">Puntaje</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium">
                      <tr>
                        <td className="p-2.5">Sistemas Operacionales OT / Producción</td>
                        <td className="p-2.5 text-gray-500">No (Red TI Estándar)</td>
                        <td className="p-2.5 text-center">0 pts</td>
                      </tr>
                      <tr>
                        <td className="p-2.5">Almacenamiento de Datos Sensibles</td>
                        <td className="p-2.5 text-gray-500">Sí (SaaS Protegida)</td>
                        <td className="p-2.5 text-center">35 pts</td>
                      </tr>
                      <tr>
                        <td className="p-2.5">Integraciones críticas ERP (SAP)</td>
                        <td className="p-2.5 text-gray-500">No (Mediante API Intermedia)</td>
                        <td className="p-2.5 text-center">15 pts</td>
                      </tr>
                      <tr>
                        <td className="p-2.5">Volumen de Usuarios Activos</td>
                        <td className="p-2.5 text-gray-500">&gt; 500 Usuarios (Masivo)</td>
                        <td className="p-2.5 text-center">20 pts</td>
                      </tr>
                      <tr className="bg-surface-custom/30 text-gris-azulado font-bold">
                        <td className="p-2.5">Clasificación de Impacto Final</td>
                        <td className="p-2.5 uppercase">Medio-Crítico (Nivel 2)</td>
                        <td className="p-2.5 text-center text-cobre">70 pts</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="p-4 border border-crema/10 bg-surface-custom/20 space-y-2 rounded-sm">
                  <h4 className="font-bold text-gris-azulado uppercase text-[10px]">Requerimiento de Sello Mínimo</h4>
                  <p className="text-[11px] text-gray-600">Por la puntuación de <strong>70 pts (Impacto Medio-Crítico)</strong>, el servicio requiere un <strong className="text-verde-petroleo uppercase">Sello de Bronce</strong> como mínimo para iniciar operaciones y el proveedor se compromete a optar al <strong className="text-azul uppercase">Sello de Plata</strong> antes de 6 meses.</p>
                </div>
              </div>
            </div>
          )}

          {activeSection === '5' && (
            <div className="bg-white border border-crema/20 rounded-sm p-6 md:p-8 shadow-xs space-y-8">
              <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-cobre font-display uppercase tracking-wider flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-cobre" />
                    Sección 5: Controles de Seguridad Obligatorios
                  </h3>
                  <p className="text-[10px] text-gray-400 font-sans mt-0.5">
                    Definición de mecanismos de contención, protección y auditoría de ciberseguridad.
                  </p>
                </div>
                <span className="text-[10px] text-red-500 font-bold bg-red-50 border border-red-200 px-2 py-0.5 rounded-full uppercase">
                  Controles Obligatorios
                </span>
              </div>

              {/* 5.1 GESTION DE ACCESOS */}
              <div className="space-y-4">
                <div className="bg-surface-custom/40 p-3 border border-crema/10 flex justify-between items-center">
                  <span className="font-display font-bold text-xs uppercase text-gris-azulado tracking-wider">
                    5.1 Gestión de Accesos
                  </span>
                  <span className="text-[9px] text-cobre uppercase font-bold tracking-widest">
                    Directiva Corporativa CODELCO
                  </span>
                </div>

                <div className="space-y-4 font-sans text-xs">
                  {/* MFA radio control */}
                  <div className="space-y-2">
                    <label className="font-bold text-gray-700 block">
                      ¿Implementa autenticación multifactor (MFA)? * <span className="text-red-500 font-bold">(Obligatorio)</span>
                    </label>
                    <div className="flex flex-wrap gap-4">
                      {['Sí', 'No', 'Parcial'].map(opt => (
                        <label key={opt} className="inline-flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="mfaEnabled"
                            value={opt}
                            checked={formData.mfaEnabled === opt}
                            onChange={(e) => handleChange('mfaEnabled', e.target.value)}
                            className="w-4 h-4 text-cobre border-gray-300 focus:ring-cobre cursor-pointer"
                          />
                          <span className="ml-2 font-semibold text-gray-700">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* MFA Checklist */}
                  {formData.mfaEnabled !== 'No' && (
                    <div className="p-4 bg-gray-50 border border-gray-100 rounded-sm space-y-4 animate-fade-in">
                      <div className="space-y-1.5">
                        <label className="font-bold text-gray-600 block">Tecnología utilizada (Multiselección)</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {['Microsoft Authenticator', 'SMS', 'Email', 'Token físico', 'Biometría'].map(tech => {
                            const isChecked = formData.mfaTech?.includes(tech);
                            return (
                              <label key={tech} className="inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {
                                    const current = formData.mfaTech || [];
                                    const next = current.includes(tech)
                                      ? current.filter((t: string) => t !== tech)
                                      : [...current, tech];
                                    handleChange('mfaTech', next);
                                  }}
                                  className="rounded border-gray-300 text-cobre focus:ring-cobre cursor-pointer"
                                />
                                <span className="ml-2 text-gray-700">{tech}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      {/* Cobertura inputs */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="font-bold text-gray-600">Cobertura Administrativos %</label>
                          <input
                            type="number"
                            value={formData.mfaCoverageAdmin}
                            onChange={(e) => handleChange('mfaCoverageAdmin', e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-crema/30 rounded-sm bg-white focus:outline-none focus:border-cobre"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-bold text-gray-600">Cobertura Usuarios Finales %</label>
                          <input
                            type="number"
                            value={formData.mfaCoverageUsers}
                            onChange={(e) => handleChange('mfaCoverageUsers', e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-crema/30 rounded-sm bg-white focus:outline-none focus:border-cobre"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-bold text-gray-600">Cobertura Externos %</label>
                          <input
                            type="number"
                            value={formData.mfaCoverageExternal}
                            onChange={(e) => handleChange('mfaCoverageExternal', e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-crema/30 rounded-sm bg-white focus:outline-none focus:border-cobre"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* RBAC check */}
                  <div className="space-y-3 pt-3 border-t border-gray-50">
                    <div className="space-y-2">
                      <label className="font-bold text-gray-700 block">
                        ¿Implementa control de acceso basado en roles (RBAC)? *
                      </label>
                      <div className="flex gap-4">
                        {['Sí', 'No'].map(opt => (
                          <label key={opt} className="inline-flex items-center cursor-pointer">
                            <input
                              type="radio"
                              name="rbacEnabled"
                              value={opt}
                              checked={formData.rbacEnabled === opt}
                              onChange={(e) => handleChange('rbacEnabled', e.target.value)}
                              className="w-4 h-4 text-cobre border-gray-300 focus:ring-cobre cursor-pointer"
                            />
                            <span className="ml-2 font-semibold text-gray-700">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {formData.rbacEnabled === 'Sí' && (
                      <div className="p-3 bg-gray-50 border border-gray-100 rounded-sm grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
                        <div className="space-y-1">
                          <label className="font-bold text-gray-600">Número de Roles definidos</label>
                          <input
                            type="number"
                            value={formData.rbacRoles}
                            onChange={(e) => handleChange('rbacRoles', e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-crema/30 rounded-sm bg-white focus:outline-none focus:border-cobre"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-bold text-gray-600">¿Aplica principio de mínimo privilegio?</label>
                          <select
                            value={formData.rbacMinimumPrivilege}
                            onChange={(e) => handleChange('rbacMinimumPrivilege', e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-crema/30 rounded-sm bg-white focus:outline-none focus:border-cobre font-semibold"
                          >
                            <option value="Sí">Sí (Recomendado)</option>
                            <option value="No">No</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 5.2 CIFRADO DE DATOS */}
              <div className="space-y-4">
                <div className="bg-surface-custom/40 p-3 border border-crema/10 flex justify-between items-center">
                  <span className="font-display font-bold text-xs uppercase text-gris-azulado tracking-wider">
                    5.2 Cifrado de Datos
                  </span>
                  <span className="text-[9px] text-granate uppercase font-bold tracking-widest">
                    Crítico para Sello de Seguridad
                  </span>
                </div>

                <div className="space-y-5 font-sans text-xs">
                  {/* Transit encryption */}
                  <div className="space-y-2">
                    <label className="font-bold text-gray-700 block">
                      ¿Utiliza cifrado de datos en tránsito? * <span className="text-red-500 font-bold">(Obligatorio)</span>
                    </label>
                    <div className="flex gap-4">
                      {['Sí', 'No', 'Parcial'].map(opt => (
                        <label key={opt} className="inline-flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="encryptionTransit"
                            value={opt}
                            checked={formData.encryptionTransit === opt}
                            onChange={(e) => handleChange('encryptionTransit', e.target.value)}
                            className="w-4 h-4 text-cobre border-gray-300 focus:ring-cobre cursor-pointer"
                          />
                          <span className="ml-2 font-semibold text-gray-700">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {formData.encryptionTransit !== 'No' && (
                    <div className="p-3 bg-gray-50 border border-gray-100 rounded-sm space-y-2 animate-fade-in">
                      <label className="font-bold text-gray-600 block">Protocolos de cifrado en tránsito soportados</label>
                      <div className="flex flex-wrap gap-4">
                        {['TLS 1.3', 'TLS 1.2', 'TLS 1.1', 'SSL 3.0'].map(proto => {
                          const isChecked = formData.encryptionTransitProtocol?.includes(proto);
                          return (
                            <label key={proto} className="inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  const current = formData.encryptionTransitProtocol || [];
                                  const next = current.includes(proto)
                                    ? current.filter((p: string) => p !== proto)
                                    : [...current, proto];
                                  handleChange('encryptionTransitProtocol', next);
                                }}
                                className="rounded border-gray-300 text-cobre focus:ring-cobre cursor-pointer"
                              />
                              <span className="ml-2 text-gray-700 font-semibold">{proto}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Repose encryption - Trigger warning if "No" */}
                  <div className="space-y-2 relative">
                    <label className="font-bold text-gray-700 block">
                      ¿Utiliza cifrado de datos en reposo? * <span className="text-red-500 font-bold">(Obligatorio)</span>
                    </label>
                    <div className="flex gap-4">
                      {['Sí', 'No', 'Parcial'].map(opt => (
                        <label key={opt} className="inline-flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="encryptionRepose"
                            value={opt}
                            checked={formData.encryptionRepose === opt}
                            onChange={(e) => handleChange('encryptionRepose', e.target.value)}
                            className="w-4 h-4 text-cobre border-gray-300 focus:ring-cobre cursor-pointer"
                          />
                          <span className="ml-2 font-semibold text-gray-700">{opt}</span>
                        </label>
                      ))}
                    </div>

                    {/* DYNAMIC ALERT: Finding Detected */}
                    {formData.encryptionRepose === 'No' && (
                      <div className="mt-4 p-4 border border-granate/20 bg-red-50 rounded-sm flex gap-3.5 animate-slide-up">
                        <AlertOctagon className="w-6 h-6 text-granate shrink-0 mt-0.5 animate-bounce" />
                        <div className="text-xs">
                          <h5 className="font-display font-bold text-granate uppercase tracking-wide text-[11px]">
                            ⚠️ HALLAZGO DETECTADO AUTOMÁTICAMENTE: SLA 5 DÍAS HÁBILES
                          </h5>
                          <p className="text-gray-700 font-medium leading-relaxed mt-1">
                            La omisión de cifrado de datos en reposo infringe la Directiva N° 8 de Seguridad de Codelco para sistemas críticos. Al guardar o enviar esta sección, se creará un hallazgo crítico con ID <strong>{activeDac.id.length === 8 ? `${activeDac.id.slice(0, 4)}-${activeDac.id.slice(4)}` : activeDac.id}-H001</strong> asignado automáticamente a usted.
                          </p>
                          <div className="mt-3 flex items-center space-x-2">
                            <span className="px-2 py-0.5 bg-granate text-white rounded-sm text-[9px] font-bold uppercase font-sans">
                              ID Generado: {activeDac.id.length === 8 ? `${activeDac.id.slice(0, 4)}-${activeDac.id.slice(4)}` : activeDac.id}-H001
                            </span>
                            <span className="text-[10px] text-gray-400 font-sans">
                              (Visible en módulo Gestión Hallazgos)
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 5.3 GESTION DE VULNERABILIDADES */}
              <div className="space-y-4">
                <div className="bg-surface-custom/40 p-3 border border-crema/10 flex justify-between items-center">
                  <span className="font-display font-bold text-xs uppercase text-gris-azulado tracking-wider">
                    5.3 Gestión de Vulnerabilidades
                  </span>
                  <span className="text-[9px] text-cobre uppercase font-bold tracking-widest">
                    Auditoría e Integridad
                  </span>
                </div>

                <div className="space-y-4 font-sans text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-gray-600">¿Realiza escaneos periódicos? *</label>
                      <select
                        value={formData.vulnScanning}
                        onChange={(e) => handleChange('vulnScanning', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-crema/30 rounded-sm bg-white focus:outline-none focus:border-cobre"
                      >
                        <option value="Sí">Sí</option>
                        <option value="No">No</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-gray-600">Frecuencia de escaneo *</label>
                      <select
                        value={formData.vulnFreq}
                        onChange={(e) => handleChange('vulnFreq', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-crema/30 rounded-sm bg-white focus:outline-none focus:border-cobre"
                      >
                        <option value="Semanal">Semanal</option>
                        <option value="Quincenal">Quincenal</option>
                        <option value="Mensual">Mensual</option>
                        <option value="Trimestral">Trimestral</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-gray-600">Herramienta utilizada *</label>
                      <input
                        type="text"
                        value={formData.vulnTool}
                        onChange={(e) => handleChange('vulnTool', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-crema/30 rounded-sm bg-white focus:outline-none focus:border-cobre"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-gray-600">Fecha de último escaneo</label>
                      <input
                        type="date"
                        value={formData.vulnLastDate}
                        onChange={(e) => handleChange('vulnLastDate', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-crema/30 rounded-sm bg-white focus:outline-none focus:border-cobre"
                      />
                    </div>
                  </div>

                  {formData.vulnScanning === 'Sí' && (
                    <div className="p-3 bg-gray-50 border border-gray-100 rounded-sm space-y-3 animate-fade-in">
                      <span className="font-bold text-gray-600 uppercase text-[10px] block">Resultados del Último Análisis de Vulnerabilidades</span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="space-y-1">
                          <label className="font-semibold text-gray-500">N° Críticas (SLA 24h)</label>
                          <input
                            type="number"
                            value={formData.vulnCritical}
                            onChange={(e) => handleChange('vulnCritical', e.target.value)}
                            className="w-full px-2.5 py-1 border border-red-300 focus:border-red-500 text-red-700 bg-red-50/20 rounded-sm focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-semibold text-gray-500">N° Altas (SLA 72h)</label>
                          <input
                            type="number"
                            value={formData.vulnHigh}
                            onChange={(e) => handleChange('vulnHigh', e.target.value)}
                            className="w-full px-2.5 py-1 border-orange-300 focus:border-orange-500 text-orange-700 bg-orange-50/20 rounded-sm focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-semibold text-gray-500">N° Medias (SLA 7d)</label>
                          <input
                            type="number"
                            value={formData.vulnMedium}
                            onChange={(e) => handleChange('vulnMedium', e.target.value)}
                            className="w-full px-2.5 py-1 border-amber-300 focus:border-amber-500 text-amber-700 bg-amber-50/20 rounded-sm focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-semibold text-gray-500">N° Bajas (SLA 30d)</label>
                          <input
                            type="number"
                            value={formData.vulnLow}
                            onChange={(e) => handleChange('vulnLow', e.target.value)}
                            className="w-full px-2.5 py-1 border-emerald-300 focus:border-emerald-500 text-emerald-700 bg-emerald-50/20 rounded-sm focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* CLINK EVIDENCES / UPLOADER SIMULATOR */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <span className="font-display font-bold text-xs uppercase text-gris-azulado tracking-wider block">
                  📎 Evidencias de Controles Adjuntas
                </span>

                {/* Drag and Drop Box */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-sm p-8 text-center transition-all ${
                    dragOver
                      ? 'border-cobre bg-cobre/5'
                      : 'border-crema/40 bg-surface-custom/20 hover:bg-surface-custom/40'
                  }`}
                >
                  <Upload className="w-8 h-8 text-cobre mx-auto mb-2 animate-bounce" />
                  <p className="text-xs font-bold text-gris-azulado">
                    Arrastra y suelta tus evidencias aquí o
                  </p>
                  <label className="inline-block mt-2 px-4 py-1.5 bg-gris-azulado hover:bg-black text-white rounded-sm text-[10px] font-bold uppercase tracking-wider font-display cursor-pointer shadow-xs focus:outline-none">
                    Seleccionar Archivo
                    <input
                      type="file"
                      onChange={handleFileInput}
                      className="hidden"
                      accept=".pdf,.xlsx,.docx,.png,.jpg"
                    />
                  </label>
                  <p className="text-[10px] text-gray-400 mt-2 font-sans">
                    Formatos admitidos: PDF, XLSX, PNG, JPG (Máx. 10 MB por archivo)
                  </p>
                </div>

                {/* Uploaded Files list */}
                <div className="space-y-2 mt-4" id="uploaded-files-list">
                  {uploadedFiles.map((file) => (
                    <div
                      key={file.name}
                      className="bg-white border border-gray-100 px-3 py-2.5 rounded-sm flex items-center justify-between shadow-3xs"
                    >
                      <div className="flex items-center min-w-0">
                        <Paperclip className="w-4 h-4 text-cobre shrink-0 mr-2.5" />
                        <span className="font-semibold text-gray-700 font-sans text-xs truncate" title={file.name}>
                          {file.name}
                        </span>
                        <span className="text-[10px] text-gray-400 font-sans ml-2">
                          ({file.size})
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 text-[10px] font-sans">
                        <span className="text-gray-400 font-sans">{file.date}</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-verde-petroleo font-bold">
                          Cargado
                        </span>
                        <button
                          onClick={() => handleDeleteFile(file.name)}
                          className="text-gray-400 hover:text-granate focus:outline-none cursor-pointer"
                          title="Eliminar archivo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSection === '6' && (
            <div className="bg-white border border-crema/20 rounded-sm p-6 md:p-8 shadow-xs space-y-6">
              <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-cobre font-display uppercase tracking-wider flex items-center">
                    <DollarSign className="w-5 h-5 mr-2 text-cobre" />
                    6. Presupuesto Servicio Ciberseguridad
                  </h3>
                  <p className="text-[10px] text-gray-400 font-sans mt-0.5">
                    Declaración del presupuesto asignado a servicios de auditoría y controles técnicos.
                  </p>
                </div>
              </div>

              <div className="space-y-5 font-sans text-xs">
                <div className="p-3 bg-surface-custom/20 border border-crema/10 rounded-sm flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gris-azulado text-[11px] uppercase">Estado de Financiamiento</p>
                    <p className="text-gray-500 text-[10px]">Asignación presupuestaria centralizada en VP de Tecnología.</p>
                  </div>
                  <span className="px-3 py-1 rounded-sm bg-emerald-50 text-verde-petroleo border border-emerald-200 font-bold text-[10px] uppercase">
                    Presupuesto Aprobado
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-600">Consultoría Ciberseguridad (USD)</label>
                    <input
                      type="number"
                      value={formData.budgetConsulting}
                      onChange={(e) => handleChange('budgetConsulting', e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-crema/30 rounded-sm bg-white focus:outline-none focus:border-cobre"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-gray-600">Licencias y Herramientas (USD)</label>
                    <input
                      type="number"
                      value={formData.budgetLicensing}
                      onChange={(e) => handleChange('budgetLicensing', e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-crema/30 rounded-sm bg-white focus:outline-none focus:border-cobre"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-gray-600">Pentesting Inicial (USD)</label>
                    <input
                      type="number"
                      value={formData.budgetPentesting}
                      onChange={(e) => handleChange('budgetPentesting', e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-crema/30 rounded-sm bg-white focus:outline-none focus:border-cobre"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-between items-center font-bold text-xs">
                  <span className="text-gray-500 uppercase">Costo Total Estimado Servicios de Seguridad:</span>
                  <span className="text-cobre text-sm font-sans tracking-tight">
                    USD ${(parseFloat(formData.budgetConsulting || '0') + parseFloat(formData.budgetLicensing || '0') + parseFloat(formData.budgetPentesting || '0')).toLocaleString('es-CL')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeSection === '6.1' && (
            <div className="bg-white border border-crema/20 rounded-sm p-6 md:p-8 shadow-xs space-y-6">
              <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-cobre font-display uppercase tracking-wider flex items-center">
                    <FileSpreadsheet className="w-5 h-5 mr-2 text-cobre" />
                    6.1 Presupuesto de Retest
                  </h3>
                  <p className="text-[10px] text-gray-400 font-sans mt-0.5">
                    Provisión financiera para re-escaneos y validación de brechas corregidas.
                  </p>
                </div>
              </div>

              <div className="space-y-5 font-sans text-xs">
                <div className="p-4 border border-cobre/20 bg-cobre/5 rounded-sm">
                  <h4 className="font-bold text-cobre uppercase text-[10px] mb-1">💡 Política de Bonificación por Cumplimiento</h4>
                  <p className="text-gray-700 leading-relaxed text-[11px]">
                    Si las brechas de ciberseguridad identificadas son mitigadas exitosamente <strong>dentro del periodo establecido en los acuerdos de SLA</strong>, la primera jornada completa de retest estará <strong>100% bonificada por Codelco (Costo $0)</strong>.
                  </p>
                </div>

                <div className="space-y-1 max-w-xs">
                  <label className="font-bold text-gray-600">Presupuesto Proporcionado Retest Extra (USD)</label>
                  <input
                    type="number"
                    value={formData.budgetRetest}
                    onChange={(e) => handleChange('budgetRetest', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-crema/30 rounded-sm bg-white focus:outline-none focus:border-cobre"
                  />
                  <span className="text-[9px] text-gray-400 block mt-0.5">Provisionado únicamente en caso de requerir un segundo ciclo de retest.</span>
                </div>
              </div>
            </div>
          )}

          {activeSection === '7' && (
            <div className="bg-white border border-crema/20 rounded-sm p-6 md:p-8 shadow-xs space-y-6">
              <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-cobre font-display uppercase tracking-wider flex items-center">
                    {['RESP_PRESUPUESTO_EY', 'RESP_EVAL_TECNICA_EY', 'RESP_EVAL_DOC_EY', 'ADMIN'].includes(currentRole) ? (
                      <CheckCircle2 className="w-5 h-5 mr-2 text-cobre" />
                    ) : (
                      <Lock className="w-5 h-5 mr-2 text-cobre" />
                    )}
                    7. Consideraciones y SLAs del Servicio
                  </h3>
                  <p className="text-[10px] text-gray-400 font-sans mt-0.5">
                    Plazos oficiales comprometidos y tiempos de respuesta exigidos según directivas Codelco.
                  </p>
                </div>
                {['RESP_PRESUPUESTO_EY', 'RESP_EVAL_TECNICA_EY', 'RESP_EVAL_DOC_EY', 'ADMIN'].includes(currentRole) ? (
                  <span className="text-[10px] text-green-700 font-bold bg-green-50 border border-green-200 px-2 py-0.5 rounded-full uppercase flex items-center">
                    <Check className="w-3 h-3 mr-1" /> Desbloqueada (EY)
                  </span>
                ) : (
                  <span className="text-[10px] text-red-600 font-bold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full uppercase flex items-center">
                    <Lock className="w-3 h-3 mr-1" /> Bloqueada
                  </span>
                )}
              </div>

              <div className="space-y-4 font-sans text-xs text-gray-700">
                {['RESP_PRESUPUESTO_EY', 'RESP_EVAL_TECNICA_EY', 'RESP_EVAL_DOC_EY', 'ADMIN'].includes(currentRole) ? (
                  <div className="p-3 bg-green-50 border border-green-100 rounded-sm text-[11px] leading-relaxed flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-700 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-green-700 uppercase">Acceso Desbloqueado para Consulta EY / Admin</strong>
                      <p className="text-gray-600 mt-0.5">Su rol cuenta con acceso de consulta completo a las directivas, consideraciones y acuerdos de nivel de servicio (SLAs) corporativos.</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-sm text-[11px] leading-relaxed flex gap-3">
                    <Lock className="w-5 h-5 text-granate shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-granate uppercase">Directiva Corporativa Inflexible</strong>
                      <p className="text-gray-600 mt-0.5">Los plazos de resolución no admiten extensiones unilaterales. Toda prórroga debe ser evaluada por el Oficial de Ciberseguridad.</p>
                    </div>
                  </div>
                )}

                <div className="border border-gray-100 rounded-sm overflow-x-auto mt-4">
                  <table className="w-full text-left divide-y divide-gray-100 text-xs">
                    <thead className="bg-gray-50 text-gray-500 font-bold">
                      <tr>
                        <th className="p-2.5">Criticidad del Hallazgo</th>
                        <th className="p-2.5">Tiempos Máximos de Corrección (SLA)</th>
                        <th className="p-2.5">Consecuencia por Incumplimiento</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium">
                      <tr>
                        <td className="p-2.5 font-bold text-granate">CRÍTICA</td>
                        <td className="p-2.5">5 días hábiles</td>
                        <td className="p-2.5">Suspensión inmediata de accesos y revocación del sello</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-oro">ALTA</td>
                        <td className="p-2.5">15 días hábiles</td>
                        <td className="p-2.5">Retención de pago de hitos y advertencia contractual</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-azul">MEDIA</td>
                        <td className="p-2.5">30 días hábiles</td>
                        <td className="p-2.5">Revisión en comité técnico mensual</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-gray-500">BAJA</td>
                        <td className="p-2.5">60 días hábiles</td>
                        <td className="p-2.5">Incorporación en plan de mejora continuo</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeSection === '8' && (
            <div className="bg-white border border-crema/20 rounded-sm p-6 md:p-8 shadow-xs space-y-6">
              <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-cobre font-display uppercase tracking-wider flex items-center">
                    <Briefcase className="w-5 h-5 mr-2 text-cobre" />
                    8. Resolución y Veredicto Arquitectura
                  </h3>
                  <p className="text-[10px] text-gray-400 font-sans mt-0.5">
                    Evaluación final del Revisor de Ciberseguridad de Codelco y sellado técnico.
                  </p>
                </div>
              </div>

              <div className="space-y-5 font-sans text-xs">
                {/* CALCULADORA DE SELLO PONDERADO (REGLAS EXCEL HOJA 8) */}
                <div className="p-5 border border-crema/25 bg-surface-custom/20 rounded-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                    <h4 className="font-bold text-gris-azulado text-[11px] uppercase tracking-wider flex items-center">
                      <ShieldCheck className="w-4 h-4 text-cobre mr-1.5" />
                      Calculadora Ponderada del Sello de Ciberseguridad (Hoja 8)
                    </h4>
                    <span className="text-[10px] text-gray-400 font-sans font-bold">
                      Directriz Corporativa Codelco
                    </span>
                  </div>

                  <p className="text-[10px] text-gray-500 leading-normal">
                    La puntuación final se calcula de manera ponderada según cinco dominios técnicos clave de auditoría. Si el dominio de <strong>Controles de Seguridad (EC)</strong> resulta en <strong>ROJO</strong> (por incumplimiento de MFA o Cifrado), el Sello resultante <strong>nunca podrá ser ORO</strong>, limitando la calificación máxima a Plata.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-1">
                    {/* EH (50%) */}
                    <div className="space-y-1 p-2.5 bg-white border border-gray-150 rounded-sm">
                      <span className="text-[10px] font-bold text-gray-400 block uppercase">EH (50%)</span>
                      <label className="font-semibold text-gray-600 block text-[10px]" title="Ethical Hacking / Pentest">Puntaje Pentest</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.scoreEH}
                        disabled={currentRole === 'JP'}
                        onChange={(e) => handleChange('scoreEH', parseInt(e.target.value) || 0)}
                        className="w-full px-2 py-1 border border-crema/30 rounded-xs font-bold text-center focus:outline-none focus:border-cobre"
                      />
                      <span className="text-[9px] text-gray-400 text-center block mt-1">Pond: {((formData.scoreEH || 0) * 0.50).toFixed(1)} pts</span>
                    </div>

                    {/* EC (10%) */}
                    <div className="space-y-1 p-2.5 bg-white border border-gray-150 rounded-sm flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 block uppercase">EC (10%)</span>
                        <span className="font-semibold text-gray-600 block text-[10px] leading-tight">Autoevaluación</span>
                      </div>
                      <div className="text-center font-bold text-[11px] py-1 mt-1">
                        {formData.encryptionRepose === 'Sí' && formData.mfaEnabled === 'Sí' ? (
                          <span className="text-verde-petroleo bg-emerald-50 px-1.5 py-0.5 rounded-sm">🟢 VERDE (100)</span>
                        ) : formData.encryptionRepose === 'No' && formData.mfaEnabled === 'No' ? (
                          <span className="text-granate bg-red-50 px-1.5 py-0.5 rounded-sm">🔴 ROJO (0)</span>
                        ) : (
                          <span className="text-oro bg-amber-50 px-1.5 py-0.5 rounded-sm">🟡 AMARILLO (50)</span>
                        )}
                      </div>
                      <span className="text-[9px] text-gray-400 text-center block mt-1">
                        Pond: {(
                          (formData.encryptionRepose === 'Sí' && formData.mfaEnabled === 'Sí' ? 100 :
                           formData.encryptionRepose === 'No' && formData.mfaEnabled === 'No' ? 0 : 50) * 0.10
                        ).toFixed(1)} pts
                      </span>
                    </div>

                    {/* DAST (15%) */}
                    <div className="space-y-1 p-2.5 bg-white border border-gray-150 rounded-sm">
                      <span className="text-[10px] font-bold text-gray-400 block uppercase">DAST (15%)</span>
                      <label className="font-semibold text-gray-600 block text-[10px]">Análisis Web</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.scoreDAST}
                        disabled={currentRole === 'JP'}
                        onChange={(e) => handleChange('scoreDAST', parseInt(e.target.value) || 0)}
                        className="w-full px-2 py-1 border border-crema/30 rounded-xs font-bold text-center focus:outline-none focus:border-cobre"
                      />
                      <span className="text-[9px] text-gray-400 text-center block mt-1">Pond: {((formData.scoreDAST || 0) * 0.15).toFixed(1)} pts</span>
                    </div>

                    {/* SCAN (15%) */}
                    <div className="space-y-1 p-2.5 bg-white border border-gray-150 rounded-sm">
                      <span className="text-[10px] font-bold text-gray-400 block uppercase">SCAN (15%)</span>
                      <label className="font-semibold text-gray-600 block text-[10px]">Análisis Red</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.scoreSCAN}
                        disabled={currentRole === 'JP'}
                        onChange={(e) => handleChange('scoreSCAN', parseInt(e.target.value) || 0)}
                        className="w-full px-2 py-1 border border-crema/30 rounded-xs font-bold text-center focus:outline-none focus:border-cobre"
                      />
                      <span className="text-[9px] text-gray-400 text-center block mt-1">Pond: {((formData.scoreSCAN || 0) * 0.15).toFixed(1)} pts</span>
                    </div>

                    {/* Diagrama (10%) */}
                    <div className="space-y-1 p-2.5 bg-white border border-gray-150 rounded-sm flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 block uppercase">DIAG (10%)</span>
                        <span className="font-semibold text-gray-600 block text-[10px]">Arq. Red</span>
                      </div>
                      <div className="text-center font-bold text-[11px] py-1 mt-1">
                        {formData.architectureEvaluation === 'Verde' ? (
                          <span className="text-verde-petroleo bg-emerald-50 px-1.5 py-0.5 rounded-sm">🟢 VERDE (100)</span>
                        ) : (
                          <span className="text-oro bg-amber-50 px-1.5 py-0.5 rounded-sm">🟡 AMARIL (50)</span>
                        )}
                      </div>
                      <span className="text-[9px] text-gray-400 text-center block mt-1">
                        Pond: {((formData.architectureEvaluation === 'Verde' ? 100 : 50) * 0.10).toFixed(1)} pts
                      </span>
                    </div>
                  </div>

                  {/* RESULT CONSOLIDATION CARD */}
                  {(() => {
                    const valEH = (formData.scoreEH || 0) * 0.50;
                    const ecRating = (formData.encryptionRepose === 'Sí' && formData.mfaEnabled === 'Sí' ? 100 :
                                      formData.encryptionRepose === 'No' && formData.mfaEnabled === 'No' ? 0 : 50);
                    const valEC = ecRating * 0.10;
                    const valDAST = (formData.scoreDAST || 0) * 0.15;
                    const valSCAN = (formData.scoreSCAN || 0) * 0.15;
                    const valDIAG = (formData.architectureEvaluation === 'Verde' ? 100 : 50) * 0.10;
                    
                    const calculatedScore = Math.round(valEH + valEC + valDAST + valSCAN + valDIAG);
                    
                    let seal: 'Verde' | 'Amarillo' | 'Rojo' | 'Ninguno' = 'Ninguno';
                    let label = 'Sin Sello (No cumple mínimo)';
                    let colorClass = 'bg-red-50 text-granate border-granate/30';
                    
                    if (calculatedScore >= 95) {
                      if (ecRating === 0) {
                        seal = 'Amarillo';
                        label = 'Sello Amarillo (Penalizado por Controles Críticos en Rojo)';
                        colorClass = 'bg-amber-50 text-oro border-oro/30';
                      } else {
                        seal = 'Verde';
                        label = 'Sello Verde (Cumplimiento de Oro)';
                        colorClass = 'bg-emerald-50 text-verde-petroleo border-verde-petroleo/30';
                      }
                    } else if (calculatedScore >= 75) {
                      seal = 'Amarillo';
                      label = 'Sello Amarillo (Cumplimiento de Plata)';
                      colorClass = 'bg-amber-50 text-oro border-oro/30';
                    } else if (calculatedScore >= 45) {
                      seal = 'Rojo';
                      label = 'Sello Rojo (Cumplimiento de Bronce)';
                      colorClass = 'bg-rose-50 text-granate border-granate/40';
                    }
                    
                    return (
                      <div className={`p-4 border rounded-sm flex flex-col sm:flex-row items-center justify-between gap-4 ${colorClass}`}>
                        <div className="flex-1">
                          <p className="text-[10px] font-bold uppercase tracking-wider">Resultado Ponderado del Sello</p>
                          <p className="text-sm font-bold font-display mt-0.5">{label}</p>
                          <p className="text-[10px] opacity-75 mt-0.5">
                            Puntaje consolidado: <strong>{calculatedScore} de 100 pts</strong> (EH: {valEH.toFixed(1)} + EC: {valEC.toFixed(1)} + DAST: {valDAST.toFixed(1)} + SCAN: {valSCAN.toFixed(1)} + DIAG: {valDIAG.toFixed(1)})
                          </p>
                        </div>
                        {['RESP_GESTION', 'ADMIN'].includes(currentRole) && (
                          <button
                            type="button"
                            onClick={() => {
                              // Save score and seal to the active DAC
                              onUpdateDacForm(activeDac.id, {
                                ...formData,
                                score: calculatedScore,
                                seal: seal === 'Ninguno' ? undefined : seal,
                              });
                              onUpdateDacState(activeDac.id, 'RESULTADO LICITACIÓN APROBADO');
                              showToast('🏆 Sello de ciberseguridad calculado y certificado de licitación emitido con éxito.');
                            }}
                            className="bg-gris-azulado hover:bg-black text-white px-3.5 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-wider font-display transition-all shrink-0 cursor-pointer shadow-xs"
                          >
                            Emitir y Firmar Sello
                          </button>
                        )}
                      </div>
                    );
                  })()}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-600">Veredicto Final Revisor *</label>
                    <select
                      value={formData.verdict}
                      onChange={(e) => handleChange('verdict', e.target.value)}
                      disabled={currentRole === 'JP'}
                      className="w-full px-2.5 py-1.5 border border-crema/30 rounded-sm bg-white focus:outline-none focus:border-cobre disabled:opacity-60"
                    >
                      <option value="Aprobado">Aprobado (Sello Otorgado sin brechas)</option>
                      <option value="Aprobado con Observaciones">Aprobado con Observaciones (Habilitación Temporal)</option>
                      <option value="Rechazado con Brechas">Rechazado con Brechas (Requiere corrección urgente)</option>
                      <option value="En Evaluación">En Evaluación Documental</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-gray-600">Excepciones Autorizadas</label>
                    <input
                      type="text"
                      value={formData.exceptions}
                      onChange={(e) => handleChange('exceptions', e.target.value)}
                      disabled={currentRole === 'JP'}
                      className="w-full px-2.5 py-1.5 border border-crema/30 rounded-sm bg-white focus:outline-none focus:border-cobre disabled:opacity-60"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-gray-600">Comentarios Técnicos del Auditor Codelco</label>
                  <textarea
                    value={formData.auditorComments}
                    onChange={(e) => handleChange('auditorComments', e.target.value)}
                    disabled={currentRole === 'JP'}
                    rows={4}
                    className="w-full px-2.5 py-1.5 border border-crema/30 rounded-sm bg-white focus:outline-none focus:border-cobre disabled:opacity-60"
                  />
                  {currentRole === 'JP' && (
                    <span className="text-[9px] text-gray-400 block mt-0.5">※ Estos comentarios son de solo lectura para el Jefe de Proyecto. Solo modificable por Revisores y Auditores.</span>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center space-x-3 text-[10px] text-gray-500 font-medium">
                  <div className="w-9 h-9 rounded-full bg-gris-azulado/10 text-gris-azulado font-bold flex items-center justify-center text-xs">
                    CS
                  </div>
                  <div>
                    <p className="font-bold text-gray-700">Comité de Ciberseguridad Corporativo Codelco</p>
                    <p className="text-[9px]">Aprobación digital registrada el {activeDac.startDate || '21/06/2026'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === '9' && (
            <div className="bg-white border border-crema/20 rounded-sm p-6 md:p-8 shadow-xs space-y-6">
              <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-cobre font-display uppercase tracking-wider flex items-center">
                    <Layers className="w-5 h-5 mr-2 text-cobre" />
                    9. Anexos de Calificación y Sellos de Ciberseguridad
                  </h3>
                  <p className="text-[10px] text-gray-400 font-sans mt-0.5">
                    Guía de referencia rápida sobre el sistema de Sellos de Seguridad en Codelco.
                  </p>
                </div>
              </div>

              <div className="space-y-4 font-sans text-xs text-gray-700 leading-relaxed">
                <p>
                  Codelco clasifica y premia el nivel de cumplimiento técnico de sus proveedores a través de tres niveles de sellado de seguridad. El cumplimiento se mide sumando los puntajes obtenidos en los controles obligatorios.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                  <div className="p-4 border border-red-200 bg-red-50/50 rounded-sm space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="w-4 h-4 rounded-full bg-granate shrink-0"></span>
                      <h4 className="font-bold text-granate uppercase text-[11px]">Sello Bronce</h4>
                    </div>
                    <p className="text-[10px] text-gray-600">
                      <strong>Requisito:</strong> Cumplir con el 100% de los controles CRÍTICOS obligatorios (MFA, Cifrado en Tránsito).
                    </p>
                    <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 rounded-sm font-bold text-[9px]">Puntaje Mínimo: 45 pts</span>
                  </div>

                  <div className="p-4 border border-blue-200 bg-blue-50/50 rounded-sm space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="w-4 h-4 rounded-full bg-azul shrink-0"></span>
                      <h4 className="font-bold text-azul uppercase text-[11px]">Sello Plata</h4>
                    </div>
                    <p className="text-[10px] text-gray-600">
                      <strong>Requisito:</strong> Cumplir con 100% controles críticos + 80% de controles ALTOS (Cifrado Reposo, Escaneos de vulnerabilidades).
                    </p>
                    <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 rounded-sm font-bold text-[9px]">Puntaje Mínimo: 75 pts</span>
                  </div>

                  <div className="p-4 border border-amber-200 bg-amber-50/50 rounded-sm space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="w-4 h-4 rounded-full bg-oro shrink-0"></span>
                      <h4 className="font-bold text-oro uppercase text-[11px]">Sello Oro</h4>
                    </div>
                    <p className="text-[10px] text-gray-600">
                      <strong>Requisito:</strong> Cumplir con el 100% de controles críticos y altos, más al menos el 50% de controles medios y de mejora continua.
                    </p>
                    <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 rounded-sm font-bold text-[9px]">Puntaje Mínimo: 95 pts</span>
                  </div>
                </div>

                <div className="p-3 bg-surface-custom/20 border border-crema/10 rounded-sm text-[10px] mt-4">
                  <strong className="text-gris-azulado uppercase">Beneficio por Sello Oro:</strong>
                  <p className="text-gray-600 mt-1">Los proveedores certificados con Sello Oro obtienen prioridad y puntaje adicional bonificado en futuras licitaciones de la Corporación de acuerdo con la directiva general de abastecimiento.</p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION STEPS ACTIONS BUTTONS FOOTER */}
          <div className="flex items-center justify-between border-t border-gray-200 pt-4 font-sans font-semibold">
            <button
              onClick={() => {
                const currentIndex = visibleSections.findIndex(s => s.id === activeSection);
                if (currentIndex > 0) {
                  setActiveSection(visibleSections[currentIndex - 1].id);
                }
              }}
              disabled={visibleSections.findIndex(s => s.id === activeSection) <= 0}
              className="px-4 py-2 border border-gray-300 rounded-sm hover:bg-gray-50 flex items-center gap-2.5 text-xs text-gray-700 disabled:opacity-40 focus:outline-none"
            >
              <ArrowLeft className="w-4 h-4" />
              Sección Anterior
            </button>
            
            <button
              onClick={() => {
                const currentIndex = visibleSections.findIndex(s => s.id === activeSection);
                if (currentIndex < visibleSections.length - 1) {
                  setActiveSection(visibleSections[currentIndex + 1].id);
                }
              }}
              disabled={visibleSections.findIndex(s => s.id === activeSection) >= visibleSections.length - 1 || visibleSections.length <= 1}
              className="px-4 py-2 bg-gris-azulado hover:bg-black rounded-sm flex items-center gap-2.5 text-xs text-white disabled:opacity-40 focus:outline-none"
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
