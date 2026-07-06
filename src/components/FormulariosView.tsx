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

      // AI & Personal Data Compliance fields (June 2026 update)
      technologyType: dacForm.technologyType || 'Web',
      useOfAI_validated: dacForm.useOfAI_validated || 'No',
      useOfAI_type: dacForm.useOfAI_type || 'IA Generativa (LLM)',
      useOfAI_impact: dacForm.useOfAI_impact || 'Apoyo informativo',
      useOfAI_personalData: dacForm.useOfAI_personalData || 'No',
      useOfAI_desc: dacForm.useOfAI_desc || 'Uso de un LLM comercial para resúmenes de minutas de reunión corporativas.',
      hasPersonalData: dacForm.hasPersonalData || 'No',
      personalDataCategory: dacForm.personalDataCategory || ['Identificación (Nombre, Correo)'],
      personalDataStorage: dacForm.personalDataStorage || 'Cloud',
      personalDataConsent: dacForm.personalDataConsent || 'Sí',

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
    return [
      { id: '0', label: '0. Inicio', state: 'complete', icon: HelpCircle },
      { id: '1', label: '1. Descripción solicitud', state: 'complete', icon: FileText },
      { id: '2', label: '2. Arquitectura de Seg.', state: 'complete', icon: Server },
      { id: '2.1', label: '2.1 Diagrama de Arq. Seg.', state: 'complete', icon: Network },
      { id: '3', label: '3. Kick-Off', state: 'complete', icon: Calendar },
      { id: '4', label: '4. Matriz de Decisión', state: 'active', icon: FileText },
      { id: '5', label: '5. Controles de Seguridad', state: 'active', icon: Shield },
      { id: '6', label: '6. Presupuesto Servicio', state: 'pending', icon: DollarSign },
      { id: '6.1', label: '6.1 Presupuesto Retest', state: 'pending', icon: FileSpreadsheet },
      { id: '7', label: '7. Consideraciones y SLAs', state: 'active', icon: Clock },
      { id: '8', label: '8. Resolución', state: 'pending', icon: Briefcase },
      { id: '9', label: '9. Anexos (Sellos)', state: 'pending', icon: Layers }
    ];
  }, []);

  // Filter sections based on the current user role from the Excel user stories matrix
  // Transversal rule: All sections are always visible to all roles as read-only, except for restricted editing
  const visibleSections = useMemo(() => {
    return sections;
  }, [sections]);

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
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] w-full overflow-hidden text-xs bg-gray-50 relative" id="formularios-view">
      
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
      <div className={`${
        mobileSectionsOpen 
          ? 'absolute top-[61px] left-0 right-0 z-30 flex max-h-[calc(100vh-8rem)] border-b shadow-lg' 
          : 'hidden'
      } lg:relative lg:top-0 lg:z-0 lg:flex lg:max-h-none lg:shadow-none w-full lg:w-72 bg-white lg:border-b-0 lg:border-r border-crema/20 shrink-0 overflow-y-auto flex-col p-4 md:p-6`} id="formularios-sidebar">
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

                {/* 1.4 Tipo de Tecnología y Datos Especiales */}
                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <span className="font-display font-bold text-xs uppercase text-gris-azulado tracking-wider block border-b border-gray-100 pb-1.5">
                    1.4 Clasificación de Tecnología e Información Especial (Normativa de Cumplimiento)
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-gray-700 block">Tipo de Tecnología Principal *</label>
                      <select
                        value={formData.technologyType}
                        onChange={(e) => handleChange('technologyType', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-crema/30 rounded-sm bg-white focus:outline-none focus:border-cobre font-semibold text-gris-azulado"
                      >
                        <option value="Web">Web Application</option>
                        <option value="Móvil">Aplicación Móvil (iOS / Android)</option>
                        <option value="Local">Local / Escritorio (On-Premises)</option>
                        <option value="LLM">Modelo de Lenguaje (LLM / IA Generativa)</option>
                        <option value="Agente Inteligente">Agente Autónomo Inteligente</option>
                        <option value="Otro">Otro (Especificar en descripción)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-gray-700 block">¿Maneja Datos Personales? *</label>
                      <select
                        value={formData.hasPersonalData}
                        onChange={(e) => handleChange('hasPersonalData', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-crema/30 rounded-sm bg-white focus:outline-none focus:border-cobre font-semibold text-gris-azulado"
                      >
                        <option value="No">No (Solo datos operativos o públicos)</option>
                        <option value="Sí">Sí (Tratamiento regulado por Ley de Datos Personales)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-gray-700 block">Ubicación del Almacenamiento *</label>
                      <select
                        value={formData.personalDataStorage}
                        onChange={(e) => handleChange('personalDataStorage', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-crema/30 rounded-sm bg-white focus:outline-none focus:border-cobre font-semibold text-gris-azulado"
                      >
                        <option value="Cloud">Nube Pública (Azure, AWS, GCP)</option>
                        <option value="On-Premises">On-Premises Codelco (Data Center)</option>
                        <option value="Mixto">Híbrido / Mixto</option>
                      </select>
                    </div>
                  </div>

                  {/* Condicional: Inteligencia Artificial */}
                  {(formData.technologyType === 'LLM' || formData.technologyType === 'Agente Inteligente') && (
                    <div className="p-4 bg-orange-50/50 border border-cobre/25 rounded-sm space-y-3.5 animate-fade-in">
                      <div className="flex items-center gap-1.5 text-cobre">
                        <Shield className="w-4 h-4 shrink-0" />
                        <h5 className="font-extrabold uppercase text-[10px] tracking-wider font-display">
                          Anexo Regulatorio: Uso de Inteligencia Artificial (IA)
                        </h5>
                      </div>
                      <p className="text-[10px] text-gray-600 leading-normal">
                        Las directrices de Ciberseguridad Codelco exigen un análisis exhaustivo para tecnologías LLM o Agentes Autónomos. Indique el estado de validación y control de prompts e inputs:
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="space-y-1 bg-white p-2.5 border border-crema/20 rounded-xs">
                          <label className="font-bold text-gray-500 block text-[9px] uppercase">¿Validado Internamente? *</label>
                          <select
                            value={formData.useOfAI_validated}
                            onChange={(e) => handleChange('useOfAI_validated', e.target.value)}
                            className="w-full bg-transparent border-0 border-b border-gray-200 focus:ring-0 focus:border-cobre font-semibold py-0.5"
                          >
                            <option value="No">No / En revisión</option>
                            <option value="Sí">Sí, aprobado formal</option>
                            <option value="En gestión">En proceso de gestión</option>
                          </select>
                        </div>

                        <div className="space-y-1 bg-white p-2.5 border border-crema/20 rounded-xs">
                          <label className="font-bold text-gray-500 block text-[9px] uppercase">Tipo de IA *</label>
                          <select
                            value={formData.useOfAI_type}
                            onChange={(e) => handleChange('useOfAI_type', e.target.value)}
                            className="w-full bg-transparent border-0 border-b border-gray-200 focus:ring-0 focus:border-cobre font-semibold py-0.5"
                          >
                            <option value="IA Generativa (LLM)">IA Generativa (LLM)</option>
                            <option value="Modelos predictivos">Analítica / Predictiva</option>
                            <option value="Agente autónomo">Agente Autónomo Inteligente</option>
                          </select>
                        </div>

                        <div className="space-y-1 bg-white p-2.5 border border-crema/20 rounded-xs">
                          <label className="font-bold text-gray-500 block text-[9px] uppercase">Nivel de Impacto *</label>
                          <select
                            value={formData.useOfAI_impact}
                            onChange={(e) => handleChange('useOfAI_impact', e.target.value)}
                            className="w-full bg-transparent border-0 border-b border-gray-200 focus:ring-0 focus:border-cobre font-semibold py-0.5"
                          >
                            <option value="Apoyo informativo">Apoyo informativo</option>
                            <option value="Recomendación">Soporte a decisiones (Recomienda)</option>
                            <option value="Automatización completa">Automatización completa</option>
                          </select>
                        </div>

                        <div className="space-y-1 bg-white p-2.5 border border-crema/20 rounded-xs">
                          <label className="font-bold text-gray-500 block text-[9px] uppercase">¿Usa Datos Personales? *</label>
                          <select
                            value={formData.useOfAI_personalData}
                            onChange={(e) => handleChange('useOfAI_personalData', e.target.value)}
                            className="w-full bg-transparent border-0 border-b border-gray-200 focus:ring-0 focus:border-cobre font-semibold py-0.5"
                          >
                            <option value="No">No utiliza ni entrena con DP</option>
                            <option value="Sí">Sí utiliza / anonimizados</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-gray-600">Descripción detallada de la lógica del modelo e inputs cargados:</label>
                        <textarea
                          rows={2}
                          value={formData.useOfAI_desc}
                          onChange={(e) => handleChange('useOfAI_desc', e.target.value)}
                          placeholder="Escriba cómo interactúa el sistema con la IA y qué datos de Codelco procesa..."
                          className="w-full px-2.5 py-1.5 border border-crema/35 rounded-xs bg-white text-[11px] focus:outline-none focus:border-cobre"
                        />
                      </div>
                    </div>
                  )}

                  {/* Condicional: Datos Personales */}
                  {formData.hasPersonalData === 'Sí' && (
                    <div className="p-4 bg-teal-50/50 border border-verde-petroleo/20 rounded-sm space-y-3.5 animate-fade-in">
                      <div className="flex items-center gap-1.5 text-verde-petroleo">
                        <ShieldCheck className="w-4.5 h-4.5 shrink-0" />
                        <h5 className="font-extrabold uppercase text-[10px] tracking-wider font-display">
                          Anexo Regulatorio: Tratamiento de Datos Personales
                        </h5>
                      </div>
                      <p className="text-[10px] text-gray-600 leading-normal">
                        Codelco se rige bajo estrictos estándares de protección de datos. Complete la siguiente información sobre el tratamiento de datos sensibles o de identificación:
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1 bg-white p-3 border border-gray-200 rounded-xs">
                          <label className="font-bold text-gray-500 block text-[9px] uppercase mb-1">Mecanismo de Consentimiento del Titular</label>
                          <div className="flex gap-4">
                            {['Sí', 'No', 'No aplica'].map(opt => (
                              <label key={opt} className="inline-flex items-center cursor-pointer text-[10px]">
                                <input
                                  type="radio"
                                  name="personalDataConsent"
                                  value={opt}
                                  checked={formData.personalDataConsent === opt}
                                  onChange={(e) => handleChange('personalDataConsent', e.target.value)}
                                  className="w-3.5 h-3.5 text-verde-petroleo border-gray-300 focus:ring-verde-petroleo cursor-pointer"
                                />
                                <span className="ml-1.5 font-semibold text-gray-700">{opt}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1 bg-white p-3 border border-gray-200 rounded-xs">
                          <label className="font-bold text-gray-500 block text-[9px] uppercase mb-1">Mapeo de Datos Personales a Tratar</label>
                          <div className="grid grid-cols-2 gap-2 text-[10px]">
                            {['Identificación (Nombre, Correo)', 'RUT / ID laboral', 'Firma y Huella', 'Datos Financieros'].map((cat) => {
                              const list = formData.personalDataCategory || [];
                              const checked = list.includes(cat);
                              return (
                                <label key={cat} className="inline-flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => {
                                      const newList = checked 
                                        ? list.filter((item: string) => item !== cat)
                                        : [...list, cat];
                                      handleChange('personalDataCategory', newList);
                                    }}
                                    className="w-3.5 h-3.5 rounded-xs border-gray-300 text-verde-petroleo focus:ring-verde-petroleo cursor-pointer"
                                  />
                                  <span className="ml-1.5 text-gray-600 truncate">{cat}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
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
              {/* VISIBILITY ROLE CHECK BANNER */}
              {!['RESP_GESTION', 'ADMIN'].includes(currentRole) ? (
                <div className="p-3 bg-amber-50/75 border border-amber-200 rounded-sm text-xs leading-relaxed flex gap-3">
                  <Lock className="w-5 h-5 text-oro shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-oro uppercase font-bold">Modo de Solo Lectura</strong>
                    <p className="text-gray-600 mt-0.5">
                      Usted está visualizando este expediente de sello en modo de solo lectura según las directrices de acceso de Codelco. Solo el <strong>Responsable de Gestión de Evaluación (Ciberseguridad)</strong> y el <strong>Administrador</strong> tienen privilegios para editar puntajes, observaciones o emitir la resolución final.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50/75 border border-emerald-200 rounded-sm text-xs leading-relaxed flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-verde-petroleo shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-verde-petroleo uppercase font-bold">Control de Edición Activo</strong>
                    <p className="text-gray-600 mt-0.5">
                      Usted posee privilegios de <strong>Auditor de Ciberseguridad Codelco</strong>. Puede parametrizar la ejecución de los servicios, redefinir observaciones individuales, registrar la Carta de Riesgo o Excepción y emitir el Sello oficial definitivo.
                    </p>
                  </div>
                </div>
              )}

              {/* SPREADSHEET HEADERS (CODELCO SPREADSHEET MOCK) */}
              <div className="border border-gray-300 rounded-sm overflow-hidden font-sans">
                {/* TOP SPREADSHEET DECORATIVE BAR */}
                <div className="bg-gray-100 px-3 py-1.5 border-b border-gray-300 flex justify-between items-center text-[10px] text-gray-500 font-bold">
                  <span>VISTA DE HOJA EXCEL: 8. RESOLUCIÓN DE SELLO</span>
                  <span className="text-cobre">PROYECTO 202604 — CODELCO × IBM</span>
                </div>

                {/* SPREADSHEET MAIN CORPORATE GRID */}
                <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-300 bg-white">
                  {/* CODELCO LOGO */}
                  <div className="p-4 flex flex-col items-center justify-center bg-gray-50/50 min-h-[90px]">
                    <div className="flex items-center space-x-1.5">
                      <div className="w-6 h-6 rounded-full bg-cobre flex items-center justify-center text-white font-extrabold text-xs shadow-sm">
                        C
                      </div>
                      <span className="font-display font-extrabold text-sm text-gray-800 tracking-wider">CODELCO</span>
                    </div>
                    <span className="text-[8px] font-bold text-gray-400 mt-1 uppercase tracking-widest">Sello Ciberseguridad</span>
                  </div>

                  {/* TITLE AREA */}
                  <div className="p-4 md:col-span-2 flex flex-col items-center justify-center text-center">
                    <span className="font-extrabold text-[10px] text-gray-500 uppercase tracking-widest">
                      GERENCIA CORPORATIVA DE CIBERSEGURIDAD Y APLICACIONES DEL NEGOCIO
                    </span>
                    <h4 className="font-display font-extrabold text-xs text-cobre uppercase tracking-wide mt-1">
                      Resultado de Evaluación "Sello de Ciberseguridad"
                    </h4>
                  </div>

                  {/* RIGHTS & CONFIDENTIALITY */}
                  <div className="p-4 flex flex-col justify-center items-center bg-red-50/30 text-center min-h-[90px]">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <span className="w-5 h-5 rounded-full bg-red-600 text-white font-extrabold text-xs flex items-center justify-center shadow-xs">C</span>
                      <span className="text-[9px] font-extrabold text-red-700 tracking-tight">CONFIDENCIAL</span>
                    </div>
                    <span className="text-[8px] font-bold text-gray-500 uppercase leading-normal">
                      PROPIEDAD DE CODELCO
                    </span>
                    <span className="mt-1.5 px-2 py-0.5 bg-teal-50 border border-teal-200 rounded-sm text-[8px] font-bold text-teal-800 uppercase tracking-wider">
                      Riesgo Tecnológico
                    </span>
                  </div>
                </div>

                {/* RESUMEN DE ALCANCE TABLE GRID */}
                <div className="bg-gray-55/70 border-t border-b border-gray-300 py-1 px-3">
                  <span className="font-extrabold text-[9px] text-gray-600 uppercase tracking-wider">
                    Resumen de Alcance del Expediente
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-300 bg-white text-[11px]">
                  {/* Left Column */}
                  <div className="divide-y divide-gray-200">
                    <div className="grid grid-cols-3 p-2.5">
                      <span className="font-bold text-gray-500">Nombre Proyecto:</span>
                      <span className="col-span-2 font-semibold text-gray-800 uppercase">{activeDac.projectName}</span>
                    </div>
                    <div className="grid grid-cols-3 p-2.5">
                      <span className="font-bold text-gray-500">Marcos Evaluados:</span>
                      <span className="col-span-2 font-semibold text-gray-700">
                        {formData.technologyType === 'LLM' || formData.technologyType === 'Agente Inteligente' 
                          ? 'ISO 27001, Marcos Básicos CIS, IA Generativa y LLM (Normativa Codelco)'
                          : 'ISO 27001, Controles Básicos CIS, Directiva General de Seguridad'}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 p-2.5">
                      <span className="font-bold text-gray-500">Servicios Ejecutados:</span>
                      <span className="col-span-2 font-semibold text-gray-700">
                        {[
                          formData.execEH !== 'No' ? 'Ethical Hacking' : null,
                          formData.execEC !== 'No' ? 'Evaluación de Controles' : null,
                          formData.execDAST !== 'No' ? 'DAST [Acunetix]' : null,
                          formData.execSCAN !== 'No' ? 'Scan [Tenable]' : null,
                          formData.execDIAG !== 'No' ? 'Diagrama Arq.' : null
                        ].filter(Boolean).join(', ') || 'Ninguno seleccionado'}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 p-2.5">
                      <span className="font-bold text-gray-500">URL / Sitio de Acceso:</span>
                      <span className="col-span-2 font-semibold text-blue-600 truncate underline cursor-pointer">
                        {formData.urlAccess || activeDac.companyWebsite || 'https://portal-desarrollo.codelco.cl'}
                      </span>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="divide-y divide-gray-200">
                    <div className="grid grid-cols-3 p-2.5">
                      <span className="font-bold text-gray-500">DAC N°:</span>
                      <span className="col-span-2 font-extrabold text-cobre">{activeDac.id.length === 8 ? `${activeDac.id.slice(0, 4)}-${activeDac.id.slice(4)}` : activeDac.id}</span>
                    </div>
                    <div className="grid grid-cols-3 p-2.5">
                      <span className="font-bold text-gray-500">Jefe de Proyecto:</span>
                      <span className="col-span-2 font-semibold text-gray-700">{activeDac.jpName}</span>
                    </div>
                    <div className="grid grid-cols-3 p-2.5">
                      <span className="font-bold text-gray-500">Especialista Encargado:</span>
                      <span className="col-span-2 font-semibold text-gray-700">
                        {['RESP_GESTION', 'ADMIN'].includes(currentRole) ? (
                          <input
                            type="text"
                            value={formData.especialista || 'Lilibeth Guerrero (Gestor Evaluación)'}
                            onChange={(e) => handleChange('especialista', e.target.value)}
                            className="bg-transparent border-0 border-b border-gray-300 focus:ring-0 focus:border-cobre py-0 w-full font-semibold"
                          />
                        ) : (
                          formData.especialista || 'Lilibeth Guerrero (Gestor Evaluación)'
                        )}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 p-2.5">
                      <span className="font-bold text-gray-500">División:</span>
                      <span className="col-span-2 font-semibold text-gray-700">{(activeDac as any).division || 'Casa Matriz'}</span>
                    </div>
                  </div>
                </div>

                {/* SERVICES TABLE GRID (THE REAL RESOLUTION MATRIX FROM SHEET) */}
                <div className="bg-gray-55/70 border-t border-b border-gray-300 py-1 px-3">
                  <span className="font-extrabold text-[9px] text-gray-600 uppercase tracking-wider">
                    Consolidación de Evaluaciones y Calificación Técnica
                  </span>
                </div>

                {/* EVALUATION GRID TABLE */}
                <div className="overflow-x-auto bg-white">
                  <table className="w-full text-left divide-y divide-gray-300 text-[10.5px]">
                    <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[9px] tracking-wider">
                      <tr>
                        <th className="p-3 border-r border-gray-200">Servicio Ejecutado</th>
                        <th className="p-3 border-r border-gray-200">¿Ejecutado?</th>
                        <th className="p-3 border-r border-gray-200 text-center">Calificación (Pts)</th>
                        <th className="p-3 border-r border-gray-200 text-center">Estado Sello</th>
                        <th className="p-3 border-r border-gray-200 text-center">Peso Base</th>
                        <th className="p-3 border-r border-gray-200 text-center">Peso Aplicable</th>
                        <th className="p-3 border-r border-gray-200">Observaciones Técnicas</th>
                        <th className="p-3">Archivo de Informe</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 font-semibold text-gray-700">
                      {(() => {
                        // Gather input or default values
                        const execEH = formData.execEH !== 'No';
                        const execEC = formData.execEC !== 'No';
                        const execDAST = formData.execDAST !== 'No';
                        const execSCAN = formData.execSCAN !== 'No';
                        const execDIAG = formData.execDIAG !== 'No';

                        const baseWeights = { eh: 50, ec: 10, dast: 15, scan: 15, diag: 10 };

                        let activeBaseSum = 0;
                        if (execEH) activeBaseSum += baseWeights.eh;
                        if (execEC) activeBaseSum += baseWeights.ec;
                        if (execDAST) activeBaseSum += baseWeights.dast;
                        if (execSCAN) activeBaseSum += baseWeights.scan;
                        if (execDIAG) activeBaseSum += baseWeights.diag;
                        if (activeBaseSum === 0) activeBaseSum = 100;

                        const appWeights = {
                          eh: execEH ? Math.round((baseWeights.eh / activeBaseSum) * 100) : 0,
                          ec: execEC ? Math.round((baseWeights.ec / activeBaseSum) * 100) : 0,
                          dast: execDAST ? Math.round((baseWeights.dast / activeBaseSum) * 100) : 0,
                          scan: execSCAN ? Math.round((baseWeights.scan / activeBaseSum) * 100) : 0,
                          diag: execDIAG ? Math.round((baseWeights.diag / activeBaseSum) * 100) : 0
                        };

                        const sumApp = appWeights.eh + appWeights.ec + appWeights.dast + appWeights.scan + appWeights.diag;
                        if (sumApp > 0 && sumApp !== 100) {
                          const diff = 100 - sumApp;
                          if (execEH) appWeights.eh += diff;
                          else if (execDAST) appWeights.dast += diff;
                          else if (execSCAN) appWeights.scan += diff;
                          else if (execDIAG) appWeights.diag += diff;
                          else if (execEC) appWeights.ec += diff;
                        }

                        // EH Score
                        const scoreEH = formData.scoreEH !== undefined ? formData.scoreEH : 80;
                        const stateEH = scoreEH >= 90 ? 'VERDE' : scoreEH >= 70 ? 'AMARILLO' : 'ROJO';

                        // EC Score automatically derived from MFA & Encryption in Repose
                        const scoreEC = (formData.encryptionRepose === 'Sí' && formData.mfaEnabled === 'Sí') ? 100 :
                                        (formData.encryptionRepose === 'No' && formData.mfaEnabled === 'No') ? 0 : 50;
                        const stateEC = scoreEC === 100 ? 'VERDE' : scoreEC === 50 ? 'AMARILLO' : 'ROJO';

                        // DAST Score
                        const scoreDAST = formData.scoreDAST !== undefined ? formData.scoreDAST : 90;
                        const stateDAST = scoreDAST >= 90 ? 'VERDE' : scoreDAST >= 70 ? 'AMARILLO' : 'ROJO';

                        // SCAN Score
                        const scoreSCAN = formData.scoreSCAN !== undefined ? formData.scoreSCAN : 85;
                        const stateSCAN = scoreSCAN >= 90 ? 'VERDE' : scoreSCAN >= 70 ? 'AMARILLO' : 'ROJO';

                        // DIAG Score based on architecture evaluation
                        const scoreDIAG = formData.architectureEvaluation === 'Verde' ? 100 : 50;
                        const stateDIAG = scoreDIAG === 100 ? 'VERDE' : 'AMARILLO';

                        // Final rating score calculation
                        const finalScore = Math.round(
                          (execEH ? scoreEH * (appWeights.eh / 100) : 0) +
                          (execEC ? scoreEC * (appWeights.ec / 100) : 0) +
                          (execDAST ? scoreDAST * (appWeights.dast / 100) : 0) +
                          (execSCAN ? scoreSCAN * (appWeights.scan / 100) : 0) +
                          (execDIAG ? scoreDIAG * (appWeights.diag / 100) : 0)
                        );

                        // Determine seal
                        let seal: 'Verde' | 'Amarillo' | 'Rojo' = 'Rojo';
                        let conclTitle = 'Sello Rojo (Incumplimiento Crítico / No Autorizado)';
                        let conclDesc = 'El puntaje acumulado o el incumplimiento de controles críticos obligatorios (MFA o Cifrado de datos) no permiten autorizar la salida a producción. Se requiere corrección obligatoria inmediata.';

                        if (finalScore >= 90) {
                          if (scoreEC === 0) {
                            seal = 'Amarillo';
                            conclTitle = 'Sello Amarillo (Autorizado con Seguimiento por Excepción)';
                            conclDesc = 'El puntaje ponderado es superior a 90, pero el dominio de Controles de Seguridad (EC) está penalizado en ROJO debido a la falta de mecanismos críticos de MFA o Cifrado en Reposo. Se autoriza la salida condicional sujeta a firma de Carta de Riesgo.';
                          } else {
                            seal = 'Verde';
                            conclTitle = 'Sello Verde (Cumplimiento de Oro)';
                            conclDesc = 'Los resultados consolidados permiten concluir que el bloque evaluado cumple satisfactoriamente con los criterios de ciberseguridad corporativos definidos, sin identificarse riesgos relevantes para el paso a producción.';
                          }
                        } else if (finalScore >= 70) {
                          seal = 'Amarillo';
                          conclTitle = 'Sello Amarillo (Cumplimiento de Plata)';
                          conclDesc = 'El sistema presenta un cumplimiento parcial aceptable. Se autoriza la salida temporal sujeta a un plan de acción para la mitigación de brechas medianas dentro de los plazos estipulados por SLA.';
                        }

                        const renderBadge = (state: string) => {
                          if (state === 'VERDE') return <span className="px-2 py-0.5 rounded-sm bg-emerald-50 text-verde-petroleo text-[9px] font-bold border border-emerald-200">🟢 VERDE</span>;
                          if (state === 'AMARILLO') return <span className="px-2 py-0.5 rounded-sm bg-amber-50 text-oro text-[9px] font-bold border border-amber-200">🟡 AMARILLO</span>;
                          return <span className="px-2 py-0.5 rounded-sm bg-red-50 text-granate text-[9px] font-bold border border-red-200">🔴 ROJO</span>;
                        };

                        return (
                          <>
                            {/* Row 1: Ethical Hacking */}
                            <tr className={execEH ? '' : 'opacity-45 bg-gray-50/50'}>
                              <td className="p-3 border-r border-gray-200 font-bold text-gray-800">Ethical Hacking</td>
                              <td className="p-3 border-r border-gray-200 text-center">
                                {['RESP_GESTION', 'ADMIN'].includes(currentRole) ? (
                                  <select
                                    value={formData.execEH || 'Sí'}
                                    onChange={(e) => handleChange('execEH', e.target.value)}
                                    className="bg-transparent border border-gray-200 rounded-sm py-0.5 px-1 focus:ring-0 text-[10px]"
                                  >
                                    <option value="Sí">Sí</option>
                                    <option value="No">No</option>
                                  </select>
                                ) : (
                                  formData.execEH || 'Sí'
                                )}
                              </td>
                              <td className="p-3 border-r border-gray-200 text-center">
                                {execEH && ['RESP_GESTION', 'ADMIN'].includes(currentRole) ? (
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={scoreEH}
                                    onChange={(e) => handleChange('scoreEH', parseInt(e.target.value) || 0)}
                                    className="w-12 text-center bg-transparent border-0 border-b border-gray-300 focus:ring-0 focus:border-cobre py-0 font-bold"
                                  />
                                ) : (
                                  execEH ? scoreEH : 'N/A'
                                )}
                              </td>
                              <td className="p-3 border-r border-gray-200 text-center">
                                {execEH ? renderBadge(stateEH) : 'N/A'}
                              </td>
                              <td className="p-3 border-r border-gray-200 text-center text-gray-500">50%</td>
                              <td className="p-3 border-r border-gray-200 text-center text-gray-700 font-bold">{appWeights.eh}%</td>
                              <td className="p-3 border-r border-gray-200">
                                {['RESP_GESTION', 'ADMIN'].includes(currentRole) ? (
                                  <input
                                    type="text"
                                    value={formData.obsEH || 'Ethical Hacking ejecutado satisfactoriamente sobre la infraestructura expuesta.'}
                                    onChange={(e) => handleChange('obsEH', e.target.value)}
                                    className="bg-transparent border-0 border-b border-gray-300 focus:ring-0 focus:border-cobre py-0 w-full text-[10px]"
                                  />
                                ) : (
                                  formData.obsEH || 'Ethical Hacking ejecutado satisfactoriamente sobre la infraestructura expuesta.'
                                )}
                              </td>
                              <td className="p-3">
                                {['RESP_GESTION', 'ADMIN'].includes(currentRole) ? (
                                  <input
                                    type="text"
                                    value={formData.fileEH || 'informe_eh_v1.2.pdf'}
                                    onChange={(e) => handleChange('fileEH', e.target.value)}
                                    className="bg-transparent border-0 border-b border-gray-300 focus:ring-0 focus:border-cobre py-0 w-full text-[10px]"
                                  />
                                ) : (
                                  <span className="text-blue-600 underline cursor-pointer">{formData.fileEH || 'informe_eh_v1.2.pdf'}</span>
                                )}
                              </td>
                            </tr>

                            {/* Row 2: Evaluación de Controles */}
                            <tr className={execEC ? '' : 'opacity-45 bg-gray-50/50'}>
                              <td className="p-3 border-r border-gray-200 font-bold text-gray-800">Evaluación de Controles</td>
                              <td className="p-3 border-r border-gray-200 text-center">
                                {['RESP_GESTION', 'ADMIN'].includes(currentRole) ? (
                                  <select
                                    value={formData.execEC || 'Sí'}
                                    onChange={(e) => handleChange('execEC', e.target.value)}
                                    className="bg-transparent border border-gray-200 rounded-sm py-0.5 px-1 focus:ring-0 text-[10px]"
                                  >
                                    <option value="Sí">Sí</option>
                                    <option value="No">No</option>
                                  </select>
                                ) : (
                                  formData.execEC || 'Sí'
                                )}
                              </td>
                              <td className="p-3 border-r border-gray-200 text-center font-bold">
                                {execEC ? scoreEC : 'N/A'}
                              </td>
                              <td className="p-3 border-r border-gray-200 text-center">
                                {execEC ? renderBadge(stateEC) : 'N/A'}
                              </td>
                              <td className="p-3 border-r border-gray-200 text-center text-gray-500">10%</td>
                              <td className="p-3 border-r border-gray-200 text-center text-gray-700 font-bold">{appWeights.ec}%</td>
                              <td className="p-3 border-r border-gray-200">
                                {['RESP_GESTION', 'ADMIN'].includes(currentRole) ? (
                                  <input
                                    type="text"
                                    value={formData.obsEC || 'Controles básicos validados mediante autoevaluación y evidencias de soporte.'}
                                    onChange={(e) => handleChange('obsEC', e.target.value)}
                                    className="bg-transparent border-0 border-b border-gray-300 focus:ring-0 focus:border-cobre py-0 w-full text-[10px]"
                                  />
                                ) : (
                                  formData.obsEC || 'Controles básicos validados mediante autoevaluación y evidencias de soporte.'
                                )}
                              </td>
                              <td className="p-3">
                                {['RESP_GESTION', 'ADMIN'].includes(currentRole) ? (
                                  <input
                                    type="text"
                                    value={formData.fileEC || 'evidencias_mfa_cifrado.zip'}
                                    onChange={(e) => handleChange('fileEC', e.target.value)}
                                    className="bg-transparent border-0 border-b border-gray-300 focus:ring-0 focus:border-cobre py-0 w-full text-[10px]"
                                  />
                                ) : (
                                  <span className="text-blue-600 underline cursor-pointer">{formData.fileEC || 'evidencias_mfa_cifrado.zip'}</span>
                                )}
                              </td>
                            </tr>

                            {/* Row 3: DAST [Acunetix] */}
                            <tr className={execDAST ? '' : 'opacity-45 bg-gray-50/50'}>
                              <td className="p-3 border-r border-gray-200 font-bold text-gray-800">DAST [Acunetix]</td>
                              <td className="p-3 border-r border-gray-200 text-center">
                                {['RESP_GESTION', 'ADMIN'].includes(currentRole) ? (
                                  <select
                                    value={formData.execDAST || 'Sí'}
                                    onChange={(e) => handleChange('execDAST', e.target.value)}
                                    className="bg-transparent border border-gray-200 rounded-sm py-0.5 px-1 focus:ring-0 text-[10px]"
                                  >
                                    <option value="Sí">Sí</option>
                                    <option value="No">No</option>
                                  </select>
                                ) : (
                                  formData.execDAST || 'Sí'
                                )}
                              </td>
                              <td className="p-3 border-r border-gray-200 text-center">
                                {execDAST && ['RESP_GESTION', 'ADMIN'].includes(currentRole) ? (
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={scoreDAST}
                                    onChange={(e) => handleChange('scoreDAST', parseInt(e.target.value) || 0)}
                                    className="w-12 text-center bg-transparent border-0 border-b border-gray-300 focus:ring-0 focus:border-cobre py-0 font-bold"
                                  />
                                ) : (
                                  execDAST ? scoreDAST : 'N/A'
                                )}
                              </td>
                              <td className="p-3 border-r border-gray-200 text-center">
                                {execDAST ? renderBadge(stateDAST) : 'N/A'}
                              </td>
                              <td className="p-3 border-r border-gray-200 text-center text-gray-500">15%</td>
                              <td className="p-3 border-r border-gray-200 text-center text-gray-700 font-bold">{appWeights.dast}%</td>
                              <td className="p-3 border-r border-gray-200">
                                {['RESP_GESTION', 'ADMIN'].includes(currentRole) ? (
                                  <input
                                    type="text"
                                    value={formData.obsDAST || 'DAST ejecutado mediante Acunetix. No se encontraron brechas críticas de inyección.'}
                                    onChange={(e) => handleChange('obsDAST', e.target.value)}
                                    className="bg-transparent border-0 border-b border-gray-300 focus:ring-0 focus:border-cobre py-0 w-full text-[10px]"
                                  />
                                ) : (
                                  formData.obsDAST || 'DAST ejecutado mediante Acunetix. No se encontraron brechas críticas de inyección.'
                                )}
                              </td>
                              <td className="p-3">
                                {['RESP_GESTION', 'ADMIN'].includes(currentRole) ? (
                                  <input
                                    type="text"
                                    value={formData.fileDAST || 'reporte_acunetix_completo.pdf'}
                                    onChange={(e) => handleChange('fileDAST', e.target.value)}
                                    className="bg-transparent border-0 border-b border-gray-300 focus:ring-0 focus:border-cobre py-0 w-full text-[10px]"
                                  />
                                ) : (
                                  <span className="text-blue-600 underline cursor-pointer">{formData.fileDAST || 'reporte_acunetix_completo.pdf'}</span>
                                )}
                              </td>
                            </tr>

                            {/* Row 4: Scan [Tenable] */}
                            <tr className={execSCAN ? '' : 'opacity-45 bg-gray-50/50'}>
                              <td className="p-3 border-r border-gray-200 font-bold text-gray-800">Scan [Tenable]</td>
                              <td className="p-3 border-r border-gray-200 text-center">
                                {['RESP_GESTION', 'ADMIN'].includes(currentRole) ? (
                                  <select
                                    value={formData.execSCAN || 'Sí'}
                                    onChange={(e) => handleChange('execSCAN', e.target.value)}
                                    className="bg-transparent border border-gray-200 rounded-sm py-0.5 px-1 focus:ring-0 text-[10px]"
                                  >
                                    <option value="Sí">Sí</option>
                                    <option value="No">No</option>
                                  </select>
                                ) : (
                                  formData.execSCAN || 'Sí'
                                )}
                              </td>
                              <td className="p-3 border-r border-gray-200 text-center">
                                {execSCAN && ['RESP_GESTION', 'ADMIN'].includes(currentRole) ? (
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={scoreSCAN}
                                    onChange={(e) => handleChange('scoreSCAN', parseInt(e.target.value) || 0)}
                                    className="w-12 text-center bg-transparent border-0 border-b border-gray-300 focus:ring-0 focus:border-cobre py-0 font-bold"
                                  />
                                ) : (
                                  execSCAN ? scoreSCAN : 'N/A'
                                )}
                              </td>
                              <td className="p-3 border-r border-gray-200 text-center">
                                {execSCAN ? renderBadge(stateSCAN) : 'N/A'}
                              </td>
                              <td className="p-3 border-r border-gray-200 text-center text-gray-500">15%</td>
                              <td className="p-3 border-r border-gray-200 text-center text-gray-700 font-bold">{appWeights.scan}%</td>
                              <td className="p-3 border-r border-gray-200">
                                {['RESP_GESTION', 'ADMIN'].includes(currentRole) ? (
                                  <input
                                    type="text"
                                    value={formData.obsSCAN || 'Análisis de vulnerabilidades Tenable ejecutado. Dos brechas medias identificadas.'}
                                    onChange={(e) => handleChange('obsSCAN', e.target.value)}
                                    className="bg-transparent border-0 border-b border-gray-300 focus:ring-0 focus:border-cobre py-0 w-full text-[10px]"
                                  />
                                ) : (
                                  formData.obsSCAN || 'Análisis de vulnerabilidades Tenable ejecutado. Dos brechas medias identificadas.'
                                )}
                              </td>
                              <td className="p-3">
                                {['RESP_GESTION', 'ADMIN'].includes(currentRole) ? (
                                  <input
                                    type="text"
                                    value={formData.fileSCAN || 'escaneo_tenable_nessus.pdf'}
                                    onChange={(e) => handleChange('fileSCAN', e.target.value)}
                                    className="bg-transparent border-0 border-b border-gray-300 focus:ring-0 focus:border-cobre py-0 w-full text-[10px]"
                                  />
                                ) : (
                                  <span className="text-blue-600 underline cursor-pointer">{formData.fileSCAN || 'escaneo_tenable_nessus.pdf'}</span>
                                )}
                              </td>
                            </tr>

                            {/* Row 5: Diagrama de Arq. De Seguridad */}
                            <tr className={execDIAG ? '' : 'opacity-45 bg-gray-50/50'}>
                              <td className="p-3 border-r border-gray-200 font-bold text-gray-800">Diagrama de Arq. De Seguridad</td>
                              <td className="p-3 border-r border-gray-200 text-center">
                                {['RESP_GESTION', 'ADMIN'].includes(currentRole) ? (
                                  <select
                                    value={formData.execDIAG || 'Sí'}
                                    onChange={(e) => handleChange('execDIAG', e.target.value)}
                                    className="bg-transparent border border-gray-200 rounded-sm py-0.5 px-1 focus:ring-0 text-[10px]"
                                  >
                                    <option value="Sí">Sí</option>
                                    <option value="No">No</option>
                                  </select>
                                ) : (
                                  formData.execDIAG || 'Sí'
                                )}
                              </td>
                              <td className="p-3 border-r border-gray-200 text-center font-bold">
                                {execDIAG ? scoreDIAG : 'N/A'}
                              </td>
                              <td className="p-3 border-r border-gray-200 text-center">
                                {execDIAG ? renderBadge(stateDIAG) : 'N/A'}
                              </td>
                              <td className="p-3 border-r border-gray-200 text-center text-gray-500">10%</td>
                              <td className="p-3 border-r border-gray-200 text-center text-gray-700 font-bold">{appWeights.diag}%</td>
                              <td className="p-3 border-r border-gray-200">
                                {['RESP_GESTION', 'ADMIN'].includes(currentRole) ? (
                                  <input
                                    type="text"
                                    value={formData.obsDIAG || 'Diagrama de arquitectura validado por el especialista de ciberseguridad.'}
                                    onChange={(e) => handleChange('obsDIAG', e.target.value)}
                                    className="bg-transparent border-0 border-b border-gray-300 focus:ring-0 focus:border-cobre py-0 w-full text-[10px]"
                                  />
                                ) : (
                                  formData.obsDIAG || 'Diagrama de arquitectura validado por el especialista de ciberseguridad.'
                                )}
                              </td>
                              <td className="p-3">
                                {['RESP_GESTION', 'ADMIN'].includes(currentRole) ? (
                                  <input
                                    type="text"
                                    value={formData.fileDIAG || 'diagrama_aprobado_firmado.pdf'}
                                    onChange={(e) => handleChange('fileDIAG', e.target.value)}
                                    className="bg-transparent border-0 border-b border-gray-300 focus:ring-0 focus:border-cobre py-0 w-full text-[10px]"
                                  />
                                ) : (
                                  <span className="text-blue-600 underline cursor-pointer">{formData.fileDIAG || 'diagrama_aprobado_firmado.pdf'}</span>
                                )}
                              </td>
                            </tr>

                            {/* TOTAL SCORE SUMMARY ROW */}
                            <tr className="bg-gray-100 font-bold border-t border-gray-300">
                              <td colSpan={2} className="p-3 border-r border-gray-200 text-right">CALIFICACIÓN FINAL CONSOLIDADA:</td>
                              <td className="p-3 border-r border-gray-200 text-center text-cobre text-sm font-extrabold">{finalScore} / 100</td>
                              <td className="p-3 border-r border-gray-200 text-center">
                                <span className={`px-2.5 py-1 rounded-sm text-[10px] font-extrabold ${
                                  seal === 'Verde' ? 'bg-emerald-100 text-verde-petroleo border border-emerald-300' :
                                  seal === 'Amarillo' ? 'bg-amber-100 text-oro border border-amber-300' :
                                  'bg-red-100 text-granate border border-red-300'
                                }`}>
                                  SELLO {seal.toUpperCase()}
                                </span>
                              </td>
                              <td className="p-3 border-r border-gray-200 text-center">100%</td>
                              <td className="p-3 border-r border-gray-200 text-center">100%</td>
                              <td colSpan={2} className="p-3 text-[10px] text-gray-500 font-medium">
                                Promedio ponderado de los dominios técnicos ejecutados.
                              </td>
                            </tr>
                          </>
                        );
                      })()}
                    </tbody>
                  </table>
                </div>

                {/* RESOLUTION CONCLUSION AND SEAL VISUAL EMBLEM (THE SPREADSHEET LOOK) */}
                <div className="bg-gray-55/70 border-t border-b border-gray-300 py-1 px-3">
                  <span className="font-extrabold text-[9px] text-gray-600 uppercase tracking-wider">
                    Veredicto de Ciberseguridad y Sello Otorgado
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-300 bg-white p-6 gap-6 md:gap-0 items-center">
                  {/* Left block: Conclusion statement */}
                  <div className="md:col-span-2 space-y-3.5 pr-0 md:pr-6">
                    {(() => {
                      // Score EH
                      const scoreEH = formData.scoreEH !== undefined ? formData.scoreEH : 80;
                      const scoreDAST = formData.scoreDAST !== undefined ? formData.scoreDAST : 90;
                      const scoreSCAN = formData.scoreSCAN !== undefined ? formData.scoreSCAN : 85;
                      const scoreDIAG = formData.architectureEvaluation === 'Verde' ? 100 : 50;
                      const scoreEC = (formData.encryptionRepose === 'Sí' && formData.mfaEnabled === 'Sí') ? 100 :
                                      (formData.encryptionRepose === 'No' && formData.mfaEnabled === 'No') ? 0 : 50;

                      const execEH = formData.execEH !== 'No';
                      const execEC = formData.execEC !== 'No';
                      const execDAST = formData.execDAST !== 'No';
                      const execSCAN = formData.execSCAN !== 'No';
                      const execDIAG = formData.execDIAG !== 'No';

                      const baseWeights = { eh: 50, ec: 10, dast: 15, scan: 15, diag: 10 };
                      let activeBaseSum = 0;
                      if (execEH) activeBaseSum += baseWeights.eh;
                      if (execEC) activeBaseSum += baseWeights.ec;
                      if (execDAST) activeBaseSum += baseWeights.dast;
                      if (execSCAN) activeBaseSum += baseWeights.scan;
                      if (execDIAG) activeBaseSum += baseWeights.diag;
                      if (activeBaseSum === 0) activeBaseSum = 100;

                      const appWeights = {
                        eh: execEH ? Math.round((baseWeights.eh / activeBaseSum) * 100) : 0,
                        ec: execEC ? Math.round((baseWeights.ec / activeBaseSum) * 100) : 0,
                        dast: execDAST ? Math.round((baseWeights.dast / activeBaseSum) * 100) : 0,
                        scan: execSCAN ? Math.round((baseWeights.scan / activeBaseSum) * 100) : 0,
                        diag: execDIAG ? Math.round((baseWeights.diag / activeBaseSum) * 100) : 0
                      };

                      const sumApp = appWeights.eh + appWeights.ec + appWeights.dast + appWeights.scan + appWeights.diag;
                      if (sumApp > 0 && sumApp !== 100) {
                        const diff = 100 - sumApp;
                        if (execEH) appWeights.eh += diff;
                        else if (execDAST) appWeights.dast += diff;
                        else if (execSCAN) appWeights.scan += diff;
                        else if (execDIAG) appWeights.diag += diff;
                        else if (execEC) appWeights.ec += diff;
                      }

                      const finalScore = Math.round(
                        (execEH ? scoreEH * (appWeights.eh / 100) : 0) +
                        (execEC ? scoreEC * (appWeights.ec / 100) : 0) +
                        (execDAST ? scoreDAST * (appWeights.dast / 100) : 0) +
                        (execSCAN ? scoreSCAN * (appWeights.scan / 100) : 0) +
                        (execDIAG ? scoreDIAG * (appWeights.diag / 100) : 0)
                      );

                      let conclTitle = 'Sello Rojo';
                      let conclDesc = 'El puntaje acumulado o el incumplimiento de controles críticos obligatorios (MFA o Cifrado de datos) no permiten autorizar la salida a producción. Se requiere corrección obligatoria inmediata.';
                      let borderStyle = 'border-l-4 border-l-red-500 bg-red-50/10';

                      if (finalScore >= 90) {
                        if (scoreEC === 0) {
                          conclTitle = 'Sello Amarillo (Penalizado por Controles Críticos)';
                          conclDesc = 'El puntaje consolidado es superior a 90, pero el dominio de Controles de Seguridad (EC) está penalizado en ROJO debido a la falta de mecanismos críticos de MFA o Cifrado en Reposo. Se autoriza la salida condicional sujeta a firma de Carta de Riesgo.';
                          borderStyle = 'border-l-4 border-l-amber-500 bg-amber-50/10';
                        } else {
                          conclTitle = 'Sello Verde (Cumplimiento de Oro)';
                          conclDesc = 'Los resultados consolidados permiten concluir que el bloque evaluado cumple satisfactoriamente con los criterios de ciberseguridad corporativos definidos, sin identificarse riesgos relevantes para el paso a producción.';
                          borderStyle = 'border-l-4 border-l-emerald-500 bg-emerald-50/10';
                        }
                      } else if (finalScore >= 70) {
                        conclTitle = 'Sello Amarillo (Cumplimiento de Plata)';
                        conclDesc = 'El sistema presenta un cumplimiento parcial aceptable. Se autoriza la salida temporal sujeta a un plan de acción para la mitigación de brechas medianas dentro de los plazos estipulados por SLA.';
                        borderStyle = 'border-l-4 border-l-amber-500 bg-amber-50/10';
                      }

                      return (
                        <div className={`p-4 rounded-xs ${borderStyle} space-y-1.5`}>
                          <span className="font-extrabold uppercase text-[9px] text-gray-500 tracking-wider">Declaración de Conclusión:</span>
                          <h5 className="font-display font-extrabold text-[12px] text-gray-800">{conclTitle}</h5>
                          <p className="text-[10.5px] text-gray-600 leading-normal leading-relaxed">{conclDesc}</p>
                        </div>
                      );
                    })()}

                    {/* Veredicto fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="font-bold text-gray-500 text-[10px] uppercase">Veredicto Oficial del Revisor *</label>
                        <select
                          value={formData.verdict}
                          onChange={(e) => handleChange('verdict', e.target.value)}
                          disabled={!['RESP_GESTION', 'ADMIN'].includes(currentRole)}
                          className="w-full px-2.5 py-1.5 border border-gray-200 rounded-sm bg-white focus:outline-none focus:border-cobre disabled:opacity-75 font-semibold text-gris-azulado"
                        >
                          <option value="Aprobado">Sello Verde (Aprobado sin brechas)</option>
                          <option value="Aprobado con Observaciones">Sello Amarillo (Aprobado con Seguimiento/Excepción)</option>
                          <option value="Rechazado con Brechas">Sello Rojo (No cumple mínimo / Requiere corrección)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-gray-500 text-[10px] uppercase">Excepciones Autorizadas</label>
                        <input
                          type="text"
                          value={formData.exceptions}
                          onChange={(e) => handleChange('exceptions', e.target.value)}
                          disabled={!['RESP_GESTION', 'ADMIN'].includes(currentRole)}
                          className="w-full px-2.5 py-1.5 border border-gray-200 rounded-sm bg-white focus:outline-none focus:border-cobre disabled:opacity-75 font-semibold text-gris-azulado"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-gray-500 text-[10px] uppercase">Comentarios Técnicos Finales del Auditor Codelco</label>
                      <textarea
                        value={formData.auditorComments}
                        onChange={(e) => handleChange('auditorComments', e.target.value)}
                        disabled={!['RESP_GESTION', 'ADMIN'].includes(currentRole)}
                        rows={3}
                        className="w-full px-2.5 py-1.5 border border-gray-200 rounded-sm bg-white focus:outline-none focus:border-cobre disabled:opacity-75 text-[11px]"
                        placeholder="Ingrese comentarios finales de auditoría y condiciones para producción..."
                      />
                    </div>
                  </div>

                  {/* Right block: Real Visual circular Badge Emblem Seal */}
                  <div className="flex flex-col items-center justify-center pl-0 md:pl-6">
                    {(() => {
                      const scoreEH = formData.scoreEH !== undefined ? formData.scoreEH : 80;
                      const scoreDAST = formData.scoreDAST !== undefined ? formData.scoreDAST : 90;
                      const scoreSCAN = formData.scoreSCAN !== undefined ? formData.scoreSCAN : 85;
                      const scoreDIAG = formData.architectureEvaluation === 'Verde' ? 100 : 50;
                      const scoreEC = (formData.encryptionRepose === 'Sí' && formData.mfaEnabled === 'Sí') ? 100 :
                                      (formData.encryptionRepose === 'No' && formData.mfaEnabled === 'No') ? 0 : 50;

                      const execEH = formData.execEH !== 'No';
                      const execEC = formData.execEC !== 'No';
                      const execDAST = formData.execDAST !== 'No';
                      const execSCAN = formData.execSCAN !== 'No';
                      const execDIAG = formData.execDIAG !== 'No';

                      const baseWeights = { eh: 50, ec: 10, dast: 15, scan: 15, diag: 10 };
                      let activeBaseSum = 0;
                      if (execEH) activeBaseSum += baseWeights.eh;
                      if (execEC) activeBaseSum += baseWeights.ec;
                      if (execDAST) activeBaseSum += baseWeights.dast;
                      if (execSCAN) activeBaseSum += baseWeights.scan;
                      if (execDIAG) activeBaseSum += baseWeights.diag;
                      if (activeBaseSum === 0) activeBaseSum = 100;

                      const appWeights = {
                        eh: execEH ? Math.round((baseWeights.eh / activeBaseSum) * 100) : 0,
                        ec: execEC ? Math.round((baseWeights.ec / activeBaseSum) * 100) : 0,
                        dast: execDAST ? Math.round((baseWeights.dast / activeBaseSum) * 100) : 0,
                        scan: execSCAN ? Math.round((baseWeights.scan / activeBaseSum) * 100) : 0,
                        diag: execDIAG ? Math.round((baseWeights.diag / activeBaseSum) * 100) : 0
                      };

                      const sumApp = appWeights.eh + appWeights.ec + appWeights.dast + appWeights.scan + appWeights.diag;
                      if (sumApp > 0 && sumApp !== 100) {
                        const diff = 100 - sumApp;
                        if (execEH) appWeights.eh += diff;
                        else if (execDAST) appWeights.dast += diff;
                        else if (execSCAN) appWeights.scan += diff;
                        else if (execDIAG) appWeights.diag += diff;
                        else if (execEC) appWeights.ec += diff;
                      }

                      const finalScore = Math.round(
                        (execEH ? scoreEH * (appWeights.eh / 100) : 0) +
                        (execEC ? scoreEC * (appWeights.ec / 100) : 0) +
                        (execDAST ? scoreDAST * (appWeights.dast / 100) : 0) +
                        (execSCAN ? scoreSCAN * (appWeights.scan / 100) : 0) +
                        (execDIAG ? scoreDIAG * (appWeights.diag / 100) : 0)
                      );

                      let color = '#E11D48'; // Rose-600
                      let textCurved = 'REQUIERE CORRECCIÓN • NO AUTORIZADO';
                      let centerLabel = 'BRONCE';
                      let sealText = 'SELLO ROJO';

                      if (finalScore >= 90 && scoreEC > 0) {
                        color = '#059669'; // Emerald-600
                        textCurved = 'CUMPLIMIENTO TOTAL ★ AUTORIZADO ★';
                        centerLabel = 'CYBER';
                        sealText = 'SELLO VERDE';
                      } else if (finalScore >= 70 || (finalScore >= 90 && scoreEC === 0)) {
                        color = '#D97706'; // Amber-600
                        textCurved = 'CUMPLIMIENTO PARCIAL ★ AUTORIZADO ★';
                        centerLabel = 'PLATA';
                        sealText = 'SELLO AMARILLO';
                      }

                      return (
                        <div className="space-y-3 flex flex-col items-center">
                          {/* Circular Badge Seal Component */}
                          <div className="relative w-40 h-40 filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:scale-105 transition-transform duration-300">
                            <svg viewBox="0 0 200 200" className="w-full h-full">
                              <defs>
                                <path id="textPath" d="M 100, 100 m -70, 0 a 70,70 0 1,1 140,0 a 70,70 0 1,1 -140,0" />
                              </defs>

                              {/* Outer Glow / Ring shadow */}
                              <circle cx="100" cy="100" r="85" fill="none" stroke={color} strokeWidth="1" strokeDasharray="3,3" opacity="0.6" />

                              {/* Outer Circle Ring */}
                              <circle cx="100" cy="100" r="78" fill="white" stroke={color} strokeWidth="5" />
                              <circle cx="100" cy="100" r="72" fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="2,2" />

                              {/* Curved text along the circle */}
                              <text fill={color} fontSize="8.5" fontWeight="bold" letterSpacing="1.2">
                                <textPath href="#textPath" startOffset="50%" textAnchor="middle">
                                  {textCurved}
                                </textPath>
                              </text>

                              {/* Inner Circle solid ring */}
                              <circle cx="100" cy="100" r="50" fill={color} />
                              <circle cx="100" cy="100" r="45" fill="none" stroke="white" strokeWidth="1" opacity="0.4" />

                              {/* Five stars at top inside circle */}
                              <g fill="white" opacity="0.9" transform="translate(100, 78) scale(0.8)">
                                <path d="M0,-5 L1.5,-1.5 L5,-1.5 L2,1 L3.5,4.5 L0,2.5 L-3.5,4.5 L-2,1 L-5,-1.5 L-1.5,-1.5 Z" />
                                <path d="M-12,-3 L-10.5,0.5 L-7,0.5 L-10,3 L-8.5,6.5 L-12,4.5 L-15.5,6.5 L-14,3 L-17,0.5 L-13.5,0.5 Z" />
                                <path d="M12,-3 L13.5,0.5 L17,0.5 L14,3 L15.5,6.5 L12,4.5 L8.5,6.5 L10,3 L7,0.5 L10.5,0.5 Z" />
                              </g>

                              {/* Center bold labels */}
                              <text x="100" y="112" fill="white" fontSize="18" fontWeight="extrabold" textAnchor="middle" letterSpacing="1">
                                {centerLabel}
                              </text>

                              <text x="100" y="128" fill="white" fontSize="8" fontWeight="bold" textAnchor="middle" opacity="0.8">
                                CODELCO
                              </text>

                              {/* Bottom curved banner overlay on the seal */}
                              <path d="M 40, 142 Q 100, 168 160, 142" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" opacity="0.1" />
                            </svg>
                          </div>
                          
                          <div className="text-center">
                            <span className="text-[10px] uppercase font-extrabold text-gray-400 block tracking-wider">Resultado Consolidado</span>
                            <span className="font-display font-extrabold text-sm text-gray-800 uppercase block mt-0.5">{sealText}</span>
                            <span className="text-[10px] text-gray-500 font-medium block mt-0.5">Puntuación: <strong>{finalScore} pts</strong></span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* RELATED DOCUMENTS SECTION GRID */}
                <div className="bg-gray-55/70 border-t border-b border-gray-300 py-1 px-3">
                  <span className="font-extrabold text-[9px] text-gray-600 uppercase tracking-wider">
                    Documentos y Salvaguardas Relacionadas (Auditoría)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-300 bg-white text-[11px]">
                  <div className="p-3 space-y-3">
                    <div className="space-y-1">
                      <label className="font-bold text-gray-500 text-[10px] uppercase block">Carta de Riesgo ID (Para Sello Amarillo/Incumplimientos)</label>
                      <input
                        type="text"
                        value={formData.cartaRiesgoId || 'N/A'}
                        onChange={(e) => handleChange('cartaRiesgoId', e.target.value)}
                        disabled={!['RESP_GESTION', 'ADMIN'].includes(currentRole)}
                        className="w-full px-2 py-1 border border-gray-200 rounded-xs bg-white text-gray-800 font-semibold focus:outline-none focus:border-cobre disabled:opacity-75"
                        placeholder="Ej: CR-2026-088 o N/A"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-gray-500 text-[10px] uppercase block">Enlace URL a Carta de Riesgo (SharePoint)</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={formData.cartaRiesgoUrl || ''}
                          onChange={(e) => handleChange('cartaRiesgoUrl', e.target.value)}
                          disabled={!['RESP_GESTION', 'ADMIN'].includes(currentRole)}
                          className="flex-1 px-2 py-1 border border-gray-200 rounded-xs bg-white text-blue-600 focus:outline-none focus:border-cobre disabled:opacity-75"
                          placeholder="https://sharepoint.codelco.cl/riesgos/..."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-3 space-y-3">
                    <div className="space-y-1">
                      <label className="font-bold text-gray-500 text-[10px] uppercase block">N° de Excepción Autorizada (Comité)</label>
                      <input
                        type="text"
                        value={formData.excepcionNo || 'N/A'}
                        onChange={(e) => handleChange('excepcionNo', e.target.value)}
                        disabled={!['RESP_GESTION', 'ADMIN'].includes(currentRole)}
                        className="w-full px-2 py-1 border border-gray-200 rounded-xs bg-white text-gray-800 font-semibold focus:outline-none focus:border-cobre disabled:opacity-75"
                        placeholder="Ej: EXC-CODELCO-2026-11 o N/A"
                      />
                    </div>

                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-xs text-[10px] text-gray-500 leading-relaxed">
                      <strong className="text-gray-600 uppercase font-bold block mb-1">Nota de Seguridad de Datos:</strong>
                      La URL de la Carta de Riesgo es confidencial y **NO se imprimirá** ni se incluirá al exportar el DAC completo a formato PDF para auditorías externas, resguardando la integridad referencial y seguridad de la información Codelco.
                    </div>
                  </div>
                </div>
              </div>

              {/* CORPORATE DIGITAL SIGNATURE */}
              <div className="pt-4 border-t border-gray-100 flex items-center space-x-3.5 text-[11px] text-gray-500 font-semibold font-sans bg-gray-50/50 p-4 rounded-xs border border-gray-100">
                <div className="w-10 h-10 rounded-full bg-cobre/10 text-cobre font-extrabold flex items-center justify-center text-sm shadow-xs border border-cobre/20">
                  CS
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-extrabold text-gray-800 font-display text-[12px]">Firma Electrónica Corporativa Codelco</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Sello emitido y validado digitalmente por el Comité de Ciberseguridad Corporativa.</p>
                  <span className="text-[9.5px] text-teal-700 font-mono font-bold block mt-0.5">HASH_SHA256: 8a92f0dc3e817a02c81e7d83ef30b8cde9f01a88b22eef03b90df7163c9a18d</span>
                </div>
                {['RESP_GESTION', 'ADMIN'].includes(currentRole) && (
                  <button
                    type="button"
                    onClick={() => {
                      // Trigger state change
                      onUpdateDacState(activeDac.id, 'RESULTADO EMITIDO');
                      showToast('🏆 Sello y resolución firmados con éxito. Se notificó al Jefe de Proyecto y se generó el expediente PDF.');
                    }}
                    className="bg-cobre hover:bg-cobre-oscuro text-white px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-wider font-display shrink-0 flex items-center gap-1.5 cursor-pointer shadow-sm focus:outline-none"
                  >
                    <Send className="w-4 h-4" />
                    Emitir y Firmar Sello
                  </button>
                )}
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
