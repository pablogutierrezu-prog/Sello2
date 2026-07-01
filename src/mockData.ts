import { DacRequest, Finding } from './types';

export const DIVISIONES = [
  'Corporativa',
  'El Teniente',
  'Chuquicamata',
  'Radomiro Tomic',
  'Ministro Hales',
  'Andina',
  'Salvador',
  'Gabriela Mistral'
];

export const GERENCIAS = [
  'Gerencia de TI',
  'Gerencia de Ciberseguridad',
  'Gerencia de Operaciones',
  'Gerencia de Abastecimiento',
  'Gerencia de Proyectos'
];

export const INITIAL_DACS: DacRequest[] = [
  {
    id: '20260001',
    projectName: 'Sistema ERP Corporativo Integrado',
    jpName: 'Juan Pérez',
    jpEmail: 'jperez@codelco.cl',
    jpPhone: '+56 9 8765 4321',
    jpRut: '12.345.678-9',
    jpCargo: 'Jefe de Proyecto de Ciberseguridad',
    companyName: 'Tech Solutions SpA',
    companyRut: '76.123.456-7',
    companyAddress: 'Av. Apoquindo 4800, Las Condes, Santiago',
    companyWebsite: 'www.techsolutions.cl',
    companySize: 'Grande (>200 empleados)',
    description: 'Implementación de sistema ERP SAP S/4HANA para gestión integrada de procesos financieros, logísticos y de recursos humanos. El sistema incluirá módulos de FI, CO, MM, SD, PP y HCM con integración a sistemas legacy existentes.',
    type: 'Implementación',
    scope: ['Desarrollo', 'Infraestructura', 'Seguridad', 'Integración'],
    criticidad: 'Crítico',
    startDate: '2026-07-15',
    durationMonths: 12,
    budgetEstimate: 2500000,
    justification: 'Codelco requiere modernizar sus sistemas de gestión empresarial para mejorar la eficiencia operacional y la trazabilidad de procesos. El sistema actual presenta limitaciones técnicas y de seguridad que deben ser subsanadas. Este proyecto es crítico para la transformación digital de la compañía.',
    state: 'EN LLENADO',
    docHistory: [
      { id: 'h1', name: 'Solicitud_ERP_Firma.pdf', date: '2026-06-20 10:15', state: 'Aprobado', action: 'Subido por JP' },
      { id: 'h2', name: 'Propuesta_Tecnica_ERP.pdf', date: '2026-06-20 10:17', state: 'Aprobado', action: 'Subido por JP' }
    ],
    dacForm: {
      mfaEnabled: 'Sí',
      mfaTech: ['Microsoft Authenticator', 'SMS'],
      mfaCoverageAdmin: '100',
      mfaCoverageUsers: '85',
      mfaCoverageExternal: '100',
      rbacEnabled: 'Sí',
      rbacRoles: '15',
      rbacMinimumPrivilege: 'Sí',
      encryptionTransit: 'Sí',
      encryptionTransitProtocol: ['TLS 1.3', 'TLS 1.2'],
      encryptionRepose: 'No', // This triggers a finding!
      vulnScanning: 'Sí',
      vulnFreq: 'Semanal',
      vulnTool: 'Nessus Professional',
      vulnLastDate: '2026-06-15',
      vulnCritical: '2',
      vulnHigh: '5',
      vulnMedium: '12',
      vulnLow: '28',
      vulnRemediateDays: { critical: '24', high: '72', medium: '7' },
      formComments: 'Se implementa MFA mediante Microsoft Authenticator para todos los usuarios administrativos y mediante SMS para usuarios finales.'
    }
  },
  {
    id: '20260002',
    projectName: 'Plataforma Cloud Backup',
    jpName: 'María González',
    jpEmail: 'mgonzalez@codelco.cl',
    jpPhone: '+56 9 7654 3210',
    jpRut: '15.678.910-K',
    jpCargo: 'Jefe de Infraestructura TI',
    companyName: 'Evaluación de Licitación',
    companyRut: '77.777.777-7',
    companyAddress: 'Huerfanos 1270, Santiago',
    companyWebsite: 'www.codelco.com',
    companySize: 'Grande (>200 empleados)',
    description: 'Servicio de backup y recuperación ante desastres en la nube para servidores y bases de datos críticas de las divisiones norte y centro de Codelco.',
    type: 'Licitación',
    scope: ['Infraestructura', 'Seguridad'],
    criticidad: 'Alto',
    startDate: '2026-08-01',
    durationMonths: 36,
    budgetEstimate: 1200000,
    justification: 'Garantizar la continuidad operacional y el resguardo de la información crítica de la corporación frente a incidentes de ransomware u otros desastres.',
    state: 'EN EVALUACIÓN DOCUMENTAL',
    docHistory: [
      { id: 'h3', name: 'Terminos_Referencia_Backup.pdf', date: '2026-06-10 14:30', state: 'Aprobado', action: 'Subido por Revisor' }
    ],
    suppliers: [
      {
        id: 's1',
        name: 'Cloud Services Inc',
        rut: '76.234.567-8',
        contact: 'contacto@cloudservices.cl',
        marco: 'ISO 27001',
        date: '2026-06-18',
        score: 92,
        seal: 'Verde',
        evidences: ['Certificado_ISO27001.pdf', 'Politicas_Seguridad.pdf', 'Plan_Continuidad.pdf'],
        comments: 'Proveedor cumple con todos los requisitos mínimos de seguridad y cuenta con certificaciones vigentes.'
      },
      {
        id: 's2',
        name: 'Backup Solutions SpA',
        rut: '78.910.111-2',
        contact: 'licitaciones@backupsolutions.cl',
        marco: 'ISO 27001',
        date: '2026-06-19',
        score: 78,
        seal: 'Amarillo',
        evidences: ['Politicas_Respaldos.pdf', 'Controles_Acceso.pdf'],
        comments: 'Cumple parcialmente. Presenta algunas observaciones menores en el control de acceso de administradores.'
      },
      {
        id: 's3',
        name: 'Tech Backup Ltd',
        rut: '79.111.222-3',
        contact: 'soporte@techbackup.cl',
        marco: 'ISO 27001',
        date: '2026-06-21',
        score: 65,
        seal: 'Rojo',
        evidences: ['Evidencia_Generica.pdf'],
        comments: 'No cumple con las exigencias mínimas de Codelco. Carece de políticas formales de cifrado y MFA.'
      }
    ]
  },
  {
    id: '20260003',
    projectName: 'Sistema de Monitoreo de Taludes',
    jpName: 'Carlos Muñoz',
    jpEmail: 'cmunoz@codelco.cl',
    jpPhone: '+56 9 6543 2109',
    jpRut: '14.567.890-1',
    jpCargo: 'Ingeniero Geotécnico Senior',
    companyName: 'Hexagon Mining Chile',
    companyRut: '76.456.789-2',
    companyAddress: 'Vitacura 3500, Vitacura, Santiago',
    companyWebsite: 'www.hexagonmining.cl',
    companySize: 'Mediana (50-200)',
    description: 'Implementación de sensores y radar para monitoreo en tiempo real de taludes en rajo Chuquicamata e integración de alertas al centro de control integrado (CIO).',
    type: 'Implementación',
    scope: ['Desarrollo', 'Infraestructura', 'Integración'],
    criticidad: 'Crítico',
    startDate: '2026-09-01',
    durationMonths: 24,
    budgetEstimate: 1800000,
    justification: 'Mitigación de riesgos de accidentes fatales y paralización de faena por derrumbes en el rajo Chuquicamata. Requiere conexión en tiempo real con sensores OT.',
    state: 'EN EJECUCIÓN TÉCNICA',
    docHistory: [
      { id: 'h4', name: 'Acta_KickOff_Taludes.pdf', date: '2026-06-22 09:00', state: 'Aprobado', action: 'Generado por Sistema' }
    ]
  },
  {
    id: '20260004',
    projectName: 'Portal de Proveedores Codelco',
    jpName: 'Ana Silva',
    jpEmail: 'asilva@codelco.cl',
    jpPhone: '+56 9 5432 1098',
    jpRut: '13.456.789-0',
    jpCargo: 'Jefa de Abastecimiento Tecnológico',
    companyName: 'Software del Cono Sur SpA',
    companyRut: '76.789.012-3',
    companyAddress: 'Providencia 1200, Providencia, Santiago',
    companyWebsite: 'www.softwaresur.cl',
    companySize: 'Mediana (50-200)',
    description: 'Desarrollo e integración de un nuevo portal web de proveedores de Codelco, que manejará licitaciones, contratos, facturación y carga de credenciales de contratistas.',
    type: 'Implementación',
    scope: ['Desarrollo', 'Seguridad', 'Integración'],
    criticidad: 'Alto',
    startDate: '2026-07-01',
    durationMonths: 8,
    budgetEstimate: 450000,
    justification: 'Sustitución de sistema legacy que posee brechas de seguridad críticas. El nuevo sistema integrará flujos de validación automatizados y acceso externo de proveedores.',
    state: 'BRECHAS IDENTIFICADAS',
    docHistory: [
      { id: 'h5', name: 'Analisis_Arquitectura_Portal.pdf', date: '2026-05-10 11:30', state: 'Aprobado', action: 'Subido por JP' },
      { id: 'h6', name: 'Informe_Ethical_Hacking_Portal_V1.pdf', date: '2026-06-15 16:00', state: 'Aprobado', action: 'Cargado por EY' }
    ]
  },
  {
    id: '20260005',
    projectName: 'Sistema SCADA Planta Concentradora',
    jpName: 'Andrés Gómez',
    jpEmail: 'agomez@codelco.cl',
    jpPhone: '+56 9 4321 0987',
    jpRut: '11.234.567-8',
    jpCargo: 'Jefe de Automatización y Control OT',
    companyName: 'Siemens Chile S.A.',
    companyRut: '80.123.456-9',
    companyAddress: 'Cerro El Plomo 5600, Las Condes, Santiago',
    companyWebsite: 'www.siemens.cl',
    companySize: 'Grande (>200)',
    description: 'Actualización tecnológica de servidores SCADA y PLC de la planta concentradora El Teniente con implementación de red segmentada de acuerdo a estándar ISA/IEC 62443.',
    type: 'Actualización',
    scope: ['Infraestructura', 'Seguridad', 'Integración'],
    criticidad: 'Crítico',
    startDate: '2026-01-10',
    durationMonths: 6,
    budgetEstimate: 3200000,
    justification: 'Sistema SCADA actual se encuentra en fin de soporte operativo, representando un alto riesgo informático y de paralización de producción de cobre.',
    state: 'RESULTADO LICITACIÓN APROBADO',
    score: 95,
    seal: 'Verde',
    docHistory: [
      { id: 'h7', name: 'Informe_Final_OT_SCADA.pdf', date: '2026-06-10 12:00', state: 'Aprobado', action: 'Subido por EY' },
      { id: 'h8', name: 'Certificado_Sello_Ciber_20260005.pdf', date: '2026-06-12 15:30', state: 'Aprobado', action: 'Generado por Sistema' }
    ]
  }
];

export const INITIAL_FINDINGS: Finding[] = [
  {
    id: '20260001-H001',
    dacId: '20260001',
    title: 'Falta implementar cifrado de datos en reposo',
    description: 'Durante la autoevaluación del Formulario DAC y posterior revisión técnica preliminar, se identificó que la base de datos de producción no implementa cifrado en reposo para columnas que contienen datos personales, financieros o contratos estratégicos de la corporación.',
    state: 'EN CORRECCIÓN',
    criticidad: 'CRÍTICA',
    origin: 'Formulario DAC Autoevaluación',
    assignedTo: 'Juan Pérez',
    email: 'jperez@codelco.cl',
    limitDate: '2026-06-28', // 5 days SLA
    recommendation: 'Implementar TDE (Transparent Data Encryption) en la instancia SQL Server de producción y utilizar Always Encrypted para columnas sensibles de datos personales de contratistas.',
    mitigationPlan: 'Coordinado con Carlos Muñoz (Arquitecto BD). Tenemos una ventana de mantenimiento nocturna programada para activar TDE y configurar Always Encrypted en columnas de datos confidenciales.',
    responsibleInternal: 'Carlos Muñoz (Arquitecto BD)',
    responsibleEmail: 'cmunoz@codelco.cl',
    proposedDate: '2026-06-27',
    evidences: [
      {
        id: 'e1',
        name: 'TDE_Activation_Proof.pdf',
        url: '#',
        uploadDate: '2026-06-22 16:45',
        state: 'Rechazado',
        comment: 'Evidencia incompleta. El reporte muestra solo la habilitación de TDE, pero falta el script y screenshot de validación de Always Encrypted en las columnas críticas de datos personales.'
      },
      {
        id: 'e2',
        name: 'TDE_and_AlwaysEncrypted_V2.pdf',
        url: '#',
        uploadDate: '2026-06-23 11:30',
        state: 'En revisión'
      }
    ],
    comments: [
      {
        id: 'c1',
        author: 'EY - Evaluador Técnico',
        role: 'REVISOR',
        text: 'Se recomienda priorizar este hallazgo debido a la criticidad de los datos personales y de contratos que aloja la base de datos ERP. La exposición en texto plano ante un compromiso del servidor representa un riesgo severo.',
        date: '2026-06-21 10:35'
      },
      {
        id: 'c2',
        author: 'Juan Pérez',
        role: 'JP',
        text: 'Hemos coordinado con el equipo de base de datos. La ventana de mantenimiento está lista. Enviaremos evidencia actualizada hoy mismo.',
        date: '2026-06-22 14:30'
      },
      {
        id: 'c3',
        author: 'Ciberseguridad Codelco',
        role: 'REVISOR',
        text: 'La evidencia V1 muestra solo la activación de TDE, pero falta la configuración de Always Encrypted en las columnas críticas. Por favor, adjuntar evidencia completa.',
        date: '2026-06-22 18:05'
      }
    ],
    logs: [
      { id: 'l1', date: '2026-06-21 10:30', text: 'Hallazgo creado automáticamente debido a respuesta "No" en control 4.2 Cifrado en reposo.', user: 'Sistema' },
      { id: 'l2', date: '2026-06-21 10:31', text: 'Notificaciones automáticas de SLA Crítico enviadas por correo y Teams.', user: 'Sistema' },
      { id: 'l3', date: '2026-06-22 14:20', text: 'JP indicó intención de remediar y ingresó Plan de Mitigación.', user: 'jperez@codelco.cl' },
      { id: 'l4', date: '2026-06-22 16:45', text: 'JP cargó evidencia V1: TDE_Activation_Proof.pdf.', user: 'jperez@codelco.cl' },
      { id: 'l5', date: '2026-06-22 18:00', text: 'Revisor de Ciberseguridad rechazó evidencia V1 por falta de cobertura completa.', user: 'revisor.ciber@codelco.cl' },
      { id: 'l6', date: '2026-06-23 11:30', text: 'JP cargó evidencia V2: TDE_and_AlwaysEncrypted_V2.pdf.', user: 'jperez@codelco.cl' }
    ]
  },
  {
    id: '20260004-H001',
    dacId: '20260004',
    title: 'Autenticación débil en API REST externa',
    description: 'Durante la prueba de penetración (Ethical Hacking) realizada por EY, se constató que la API REST expuesta en internet para carga de documentos de contratistas no implementa validación de tokens robusta ni límites de reintentos de inicio de sesión (Rate Limiting), permitiendo ataques de fuerza bruta.',
    state: 'EN REVISIÓN CORRECCIÓN',
    criticidad: 'CRÍTICA',
    origin: 'Ethical Hacking Portal V1',
    assignedTo: 'Ana Silva',
    email: 'asilva@codelco.cl',
    limitDate: '2026-06-20', // Vencido!
    recommendation: 'Implementar JSON Web Tokens (JWT) firmados con algoritmos asimétricos, rate limiting en el API Gateway y autenticación MFA obligatoria en los servicios REST externos.',
    mitigationPlan: 'Modificamos el middleware de autenticación del API Gateway para aplicar un límite de 5 llamadas por minuto por IP para el endpoint de login. Implementamos autenticación JWT asimétrica y validación por SMS para logins de administradores.',
    responsibleInternal: 'Fernando Díaz (Líder Dev Portal)',
    responsibleEmail: 'fdiaz@contratista.cl',
    proposedDate: '2026-06-19',
    evidences: [
      {
        id: 'e3',
        name: 'API_Security_Report_JWT_RateLimiting.pdf',
        url: '#',
        uploadDate: '2026-06-19 15:40',
        state: 'En revisión'
      }
    ],
    comments: [
      {
        id: 'c4',
        author: 'EY - Evaluador Técnico',
        role: 'REVISOR',
        text: 'La vulnerabilidad fue clasificada como crítica debido a que el endpoint permite subir archivos. Un bypass de login daría control completo sobre el backend.',
        date: '2026-06-16 09:12'
      }
    ],
    logs: [
      { id: 'l7', date: '2026-06-15 16:00', text: 'Hallazgo registrado tras carga de informe de Ethical Hacking.', user: 'evaluador.ey@ey.com' },
      { id: 'l8', date: '2026-06-19 15:40', text: 'JP cargó evidencia V1 de remediación y solicitó revisión.', user: 'asilva@codelco.cl' }
    ]
  },
  {
    id: '20260004-H002',
    dacId: '20260004',
    title: 'Falta de logs de auditoría en transacciones críticas',
    description: 'La aplicación web no registra logs detallados de acciones sensibles de usuarios, tales como: creación de nuevos proveedores, aprobación de tarifas, o eliminación de registros de auditoría de contratos.',
    state: 'EN CORRECCIÓN',
    criticidad: 'ALTA',
    origin: 'Evaluación de Controles',
    assignedTo: 'Ana Silva',
    email: 'asilva@codelco.cl',
    limitDate: '2026-06-29', // 10 days
    recommendation: 'Implementar un framework de logging centralizado (ej. Winston o similar) que registre de forma inmutable todas las transacciones críticas y las envíe directamente al SIEM institucional de Codelco.',
    evidences: [],
    comments: [],
    logs: [
      { id: 'l9', date: '2026-06-15 16:05', text: 'Hallazgo registrado.', user: 'evaluador.ey@ey.com' }
    ]
  },
  {
    id: '20260004-H003',
    dacId: '20260004',
    title: 'Falta de sanitización de entradas contra SQL Injection',
    description: 'Se identificó que el campo de búsqueda de contratos de contratistas es vulnerable a inyección SQL de segundo orden, permitiendo recuperar información restringida de otros contratistas de Codelco.',
    state: 'NUEVO',
    criticidad: 'CRÍTICA',
    origin: 'Ethical Hacking Portal V1',
    assignedTo: 'Ana Silva',
    email: 'asilva@codelco.cl',
    limitDate: '2026-06-20', // Vencido!
    recommendation: 'Utilizar sentencias preparadas (Prepared Statements) con mapeo paramétrico en todas las consultas a la base de datos y validar campos de búsqueda con expresiones regulares robustas.',
    evidences: [],
    comments: [],
    logs: [
      { id: 'l10', date: '2026-06-15 16:10', text: 'Hallazgo registrado.', user: 'evaluador.ey@ey.com' }
    ]
  }
];
