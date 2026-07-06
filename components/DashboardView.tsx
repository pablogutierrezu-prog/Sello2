import React, { useState, useMemo } from 'react';
import { DacRequest, Finding, UserRole, SelloType, DacState, DacType } from '../types';
import { DIVISIONES, GERENCIAS } from '../mockData';
import {
  Search,
  Plus,
  BarChart2,
  Download,
  AlertTriangle,
  Folder,
  ShieldCheck,
  Calendar,
  DollarSign,
  ChevronRight,
  Filter,
  RefreshCw,
  X,
  Clock,
  UserCheck,
  User,
  Building
} from 'lucide-react';

interface DashboardProps {
  dacs: DacRequest[];
  findings: Finding[];
  currentRole: UserRole;
  onSelectDac: (id: string) => void;
  onSelectFinding: (findingId: string) => void;
  onAddNewDac: (newDac: Partial<DacRequest>) => void;
}

export default function DashboardView({
  dacs,
  findings,
  currentRole,
  onSelectDac,
  onSelectFinding,
  onAddNewDac
}: DashboardProps) {
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [selectedDivision, setSelectedDivision] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [onlyOverdue, setOnlyOverdue] = useState(false);
  
  // Modal state
  const [showNewDacModal, setShowNewDacModal] = useState(false);
  const [showExportToast, setShowExportToast] = useState(false);
  const [showPbiModal, setShowPbiModal] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleOpenNewDacModal = () => {
    setValidationError(null);
    setShowNewDacModal(true);
  };

  // Form state for New DAC
  const [newDacForm, setNewDacForm] = useState({
    projectName: '',
    jpName: currentRole === 'JP' ? 'Juan Pérez' : '',
    jpEmail: currentRole === 'JP' ? 'jperez@codelco.cl' : '',
    jpPhone: '',
    jpRut: '',
    jpCargo: '',
    companyName: '',
    companyRut: '',
    companyAddress: '',
    companyWebsite: '',
    companySize: 'Grande (>200 empleados)',
    description: '',
    type: 'Implementación' as DacType,
    division: 'Corporativa',
    gerencia: 'Gerencia de TI',
    scope: [] as string[],
    criticidad: 'Crítico' as 'Crítico' | 'Alto' | 'Medio' | 'Bajo',
    durationMonths: 12,
    budgetEstimate: 100000,
    justification: ''
  });

  // Calculate stats
  const stats = useMemo(() => {
    // Row level filtering simulation (RLS):
    // JP only sees their own DACs and findings
    const activeDacs = currentRole === 'JP' 
      ? dacs.filter(d => d.jpEmail === 'jperez@codelco.cl')
      : dacs;

    const activeFindings = currentRole === 'JP'
      ? findings.filter(f => f.email === 'jperez@codelco.cl')
      : findings;

    const totalDacs = activeDacs.length;
    const openFindings = activeFindings.filter(f => f.state !== 'CORREGIDO' && f.state !== 'NO APLICA' && f.state !== 'ACEPTACIÓN DE RIESGO').length;
    
    // Severity breakdown
    const critical = activeFindings.filter(f => f.state !== 'CORREGIDO' && f.state !== 'NO APLICA' && f.state !== 'ACEPTACIÓN DE RIESGO' && f.criticidad === 'CRÍTICA').length;
    const high = activeFindings.filter(f => f.state !== 'CORREGIDO' && f.state !== 'NO APLICA' && f.state !== 'ACEPTACIÓN DE RIESGO' && f.criticidad === 'ALTA').length;
    const medium = activeFindings.filter(f => f.state !== 'CORREGIDO' && f.state !== 'NO APLICA' && f.state !== 'ACEPTACIÓN DE RIESGO' && f.criticidad === 'MEDIA').length;
    const low = activeFindings.filter(f => f.state !== 'CORREGIDO' && f.state !== 'NO APLICA' && f.state !== 'ACEPTACIÓN DE RIESGO' && f.criticidad === 'BAJA').length;

    // Overdue findings
    const today = new Date('2026-06-23'); // Fixed current time context
    const overdueFindings = activeFindings.filter(f => {
      if (f.state === 'CORREGIDO' || f.state === 'NO APLICA' || f.state === 'ACEPTACIÓN DE RIESGO') return false;
      const limitDate = new Date(f.limitDate);
      return limitDate < today;
    }).length;

    // Seals breakdown
    const completedDacs = activeDacs.filter(d => d.state === 'RESULTADO LICITACIÓN APROBADO' || d.score !== undefined);
    const sealGreen = completedDacs.filter(d => d.seal === 'Verde').length;
    const sealYellow = completedDacs.filter(d => d.seal === 'Amarillo').length;
    const sealRed = completedDacs.filter(d => d.seal === 'Rojo').length;

    // State counts
    const enLlenado = activeDacs.filter(d => d.state === 'EN LLENADO').length;
    const enRevision = activeDacs.filter(d => d.state === 'EN REVISIÓN ARQUITECTURA' || d.state === 'EN EVALUACIÓN DOCUMENTAL').length;
    const enEjecucion = activeDacs.filter(d => d.state === 'EN EJECUCIÓN TÉCNICA').length;
    const enCorreccion = activeDacs.filter(d => d.state === 'EN CORRECCIÓN').length;

    return {
      totalDacs,
      openFindings,
      critical,
      high,
      medium,
      low,
      overdueFindings,
      sealGreen,
      sealYellow,
      sealRed,
      enLlenado,
      enRevision,
      enEjecucion,
      enCorreccion,
      filteredDacs: activeDacs,
      filteredFindings: activeFindings
    };
  }, [dacs, findings, currentRole]);

  // Apply filters
  const filteredDacsList = useMemo(() => {
    return stats.filteredDacs.filter(dac => {
      // Search query filter
      const matchesSearch = 
        dac.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dac.id.includes(searchTerm) ||
        dac.jpName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dac.companyName.toLowerCase().includes(searchTerm.toLowerCase());

      // State filter
      const matchesState = selectedState === 'ALL' || dac.state === selectedState;

      // Division filter - stored under companyAddress or company size in dummy data, but matches some division keyword or we search it
      const matchesDivision = selectedDivision === 'ALL' || dac.justification.toLowerCase().includes(selectedDivision.toLowerCase()) || dac.projectName.toLowerCase().includes(selectedDivision.toLowerCase()) || dac.id === '20260001'; // ERP belongs to first division by default for search representation.

      // Type filter
      const matchesType = selectedType === 'ALL' || dac.type === selectedType;

      // Overdue filter: has overdue findings
      const matchesOverdue = !onlyOverdue || findings.some(f => {
        if (f.dacId !== dac.id) return false;
        if (f.state === 'CORREGIDO' || f.state === 'NO APLICA' || f.state === 'ACEPTACIÓN DE RIESGO') return false;
        const limit = new Date(f.limitDate);
        return limit < new Date('2026-06-23');
      });

      return matchesSearch && matchesState && matchesDivision && matchesType && matchesOverdue;
    });
  }, [stats.filteredDacs, searchTerm, selectedState, selectedDivision, selectedType, onlyOverdue, findings]);

  // Handle New DAC Submission
  const handleCreateDacSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDacForm.projectName || !newDacForm.jpName || !newDacForm.companyName) {
      setValidationError('Por favor complete los campos obligatorios (*)');
      return;
    }
    setValidationError(null);
    onAddNewDac(newDacForm);
    setShowNewDacModal(false);
    // Reset form
    setNewDacForm({
      projectName: '',
      jpName: currentRole === 'JP' ? 'Juan Pérez' : '',
      jpEmail: currentRole === 'JP' ? 'jperez@codelco.cl' : '',
      jpPhone: '',
      jpRut: '',
      jpCargo: '',
      companyName: '',
      companyRut: '',
      companyAddress: '',
      companyWebsite: '',
      companySize: 'Grande (>200 empleados)',
      description: '',
      type: 'Implementación' as DacType,
      division: 'Corporativa',
      gerencia: 'Gerencia de TI',
      scope: [],
      criticidad: 'Crítico' as 'Crítico' | 'Alto' | 'Medio' | 'Bajo',
      durationMonths: 12,
      budgetEstimate: 100000,
      justification: ''
    });
  };

  const handleExportData = () => {
    setShowExportToast(true);
    setTimeout(() => setShowExportToast(false), 4000);
  };

  // State colors mapping matching official guidelines
  const stateColor = (state: DacState) => {
    switch (state) {
      case 'BORRADOR':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'SOLICITADO':
      case 'EN MODIFICACIÓN':
      case 'EN LLENADO':
      case 'EN CORRECCIÓN':
      case 'SOLICITUD RETEST':
        return 'bg-blue-50 text-azul border-azul/30';
      case 'EN REVISIÓN ARQUITECTURA':
      case 'EN KICK-OFF':
      case 'EN PRESUPUESTO':
      case 'EN EVALUACIÓN DOCUMENTAL':
        return 'bg-amber-50 text-oro border-oro/30';
      case 'PRESUPUESTO RECHAZADO':
      case 'RECHAZADO':
        return 'bg-red-50 text-granate border-granate/30';
      case 'PRESUPUESTO APROBADO':
      case 'RETEST APROBADO':
      case 'RESULTADO EMITIDO':
      case 'RESULTADO POR PROVEEDOR GENERADO':
      case 'RESULTADO LICITACIÓN APROBADO':
        return 'bg-emerald-50 text-verde-petroleo border-verde-petroleo/30';
      case 'EN EJECUCIÓN TÉCNICA':
      case 'INFORME ENTREGADO':
      case 'EN RETEST':
        return 'bg-teal-50 text-teal-800 border-teal-300';
      case 'BRECHAS IDENTIFICADAS':
        return 'bg-rose-50 text-granate border-granate/40 font-bold';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8 overflow-y-auto max-h-[calc(100vh-4rem)] w-full" id="dashboard-view">
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gris-azulado leading-tight">
            Panel de Control Principal
          </h2>
          <p className="text-xs text-gris-azulado/60 font-sans mt-1">
            Visualización consolidada del estado del Sello de Ciberseguridad Codelco.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedState('ALL');
              setSelectedDivision('ALL');
              setSelectedType('ALL');
              setOnlyOverdue(false);
            }}
            className="p-2 border border-crema/40 bg-white hover:bg-gray-50 rounded-sm text-gris-azulado flex items-center text-xs font-semibold focus:outline-none"
            title="Sincronizar"
          >
            <RefreshCw className="w-4 h-4 text-gris-azulado/60" />
          </button>
          
          {(currentRole === 'JP' || currentRole === 'ADMIN') && (
            <button
              onClick={handleOpenNewDacModal}
              className="bg-cobre hover:bg-cobre-oscuro text-white px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-wider font-display flex items-center shadow-sm hover:scale-[1.02] transition-transform focus:outline-none"
              id="btn-nueva-solicitud"
            >
              <Plus className="w-4 h-4 mr-1.5 stroke-[2.5]" />
              Nueva Solicitud dac
            </button>
          )}
        </div>
      </div>

      {/* METRIC CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="dashboard-metrics">
        {/* Metric 1: Solicitudes DAC */}
        <div className="bg-white border border-crema/30 rounded-sm p-5 shadow-sm relative overflow-hidden group hover:border-cobre/40 transition-colors">
          <div className="absolute top-0 left-0 w-1 h-full bg-azul"></div>
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block font-sans">
                Solicitudes DAC Activas
              </span>
              <span className="text-3xl font-bold font-display text-gris-azulado block mt-1">
                {stats.totalDacs}
              </span>
            </div>
            <div className="p-2 bg-blue-50 rounded-full text-azul">
              <Folder className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 grid grid-cols-2 gap-y-1.5 text-[11px] text-gray-500 font-sans">
            <div className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-1.5"></span>
              En Llenado: <strong>{stats.enLlenado}</strong>
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-amber-500 rounded-full mr-1.5"></span>
              En Revisión: <strong>{stats.enRevision}</strong>
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-teal-500 rounded-full mr-1.5"></span>
              En Ejecución: <strong>{stats.enEjecucion}</strong>
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-rose-500 rounded-full mr-1.5"></span>
              En Corrección: <strong>{stats.enCorreccion}</strong>
            </div>
          </div>
        </div>

        {/* Metric 2: Open Findings */}
        <div className="bg-white border border-crema/30 rounded-sm p-5 shadow-sm relative overflow-hidden group hover:border-cobre/40 transition-colors">
          <div className="absolute top-0 left-0 w-1 h-full bg-granate"></div>
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block font-sans">
                Hallazgos Abiertos
              </span>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-bold font-display text-gris-azulado mt-1">
                  {stats.openFindings}
                </span>
                {stats.overdueFindings > 0 && (
                  <span className="text-xs bg-red-100 text-granate font-bold px-1.5 py-0.5 rounded-sm flex items-center font-sans animate-pulse">
                    {stats.overdueFindings} Vencidos ⚠️
                  </span>
                )}
              </div>
            </div>
            <div className="p-2 bg-red-50 rounded-full text-granate">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 grid grid-cols-4 gap-1 text-[10px] text-center font-semibold text-gray-500 font-sans">
            <div className="p-1 bg-red-50 rounded-sm text-granate">
              <span className="block text-xs font-bold">{stats.critical}</span>
              CRÍTICO
            </div>
            <div className="p-1 bg-orange-50 rounded-sm text-cobre">
              <span className="block text-xs font-bold">{stats.high}</span>
              ALTO
            </div>
            <div className="p-1 bg-amber-50 rounded-sm text-oro">
              <span className="block text-xs font-bold">{stats.medium}</span>
              MEDIO
            </div>
            <div className="p-1 bg-emerald-50 rounded-sm text-verde-petroleo">
              <span className="block text-xs font-bold">{stats.low}</span>
              BAJO
            </div>
          </div>
        </div>

        {/* Metric 3: Compliance & Seals */}
        <div className="bg-white border border-crema/30 rounded-sm p-5 shadow-sm relative overflow-hidden group hover:border-cobre/40 transition-colors">
          <div className="absolute top-0 left-0 w-1 h-full bg-verde-petroleo"></div>
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block font-sans">
                Tasa de Cumplimiento
              </span>
              <span className="text-3xl font-bold font-display text-gris-azulado block mt-1">
                85%
              </span>
            </div>
            <div className="p-2 bg-emerald-50 rounded-full text-verde-petroleo">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div className="bg-verde-petroleo h-1.5 rounded-full" style={{ width: '85%' }}></div>
            </div>
            <div className="flex items-center justify-between text-[10px] text-gray-400 mt-2 font-sans font-medium">
              <span>📈 +5% vs mes anterior</span>
              <span className="text-verde-petroleo uppercase font-bold">Sello Verde Promedio</span>
            </div>
          </div>
          <div className="flex items-center space-x-3 mt-2 text-[11px] font-semibold text-gray-500 font-sans justify-center pt-2 border-t border-gray-50">
            <div className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-verde-petroleo mr-1"></span>
              🟢 Verde: {stats.sealGreen}
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-oro mr-1"></span>
              🟡 Amarillo: {stats.sealYellow}
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-granate mr-1"></span>
              🔴 Rojo: {stats.sealRed}
            </div>
          </div>
        </div>
      </div>

      {/* FILTER CONTROLS */}
      <div className="bg-white border border-crema/20 rounded-sm p-4 shadow-sm flex flex-col md:flex-row flex-wrap items-center gap-4 text-xs font-sans">
        <div className="w-full md:w-auto flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por Proyecto, ID DAC, JP o Empresa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-crema/30 rounded-sm bg-surface-custom/30 text-gris-azulado focus:outline-none focus:border-cobre focus:bg-white text-xs"
          />
        </div>

        {/* State selector */}
        <div className="w-full md:w-auto">
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="w-full md:w-auto px-3 py-2 border border-crema/30 rounded-sm bg-white text-gris-azulado text-xs font-semibold cursor-pointer focus:outline-none focus:border-cobre"
          >
            <option value="ALL">📋 TODOS LOS ESTADOS (21)</option>
            <option value="BORRADOR">1. BORRADOR</option>
            <option value="SOLICITADO">2. SOLICITADO</option>
            <option value="EN MODIFICACIÓN">3. EN MODIFICACIÓN</option>
            <option value="RECHAZADO">4. RECHAZADO</option>
            <option value="EN LLENADO">5. EN LLENADO</option>
            <option value="EN REVISIÓN ARQUITECTURA">6. EN REVISIÓN ARQUITECTURA</option>
            <option value="EN KICK-OFF">7. EN KICK-OFF</option>
            <option value="EN PRESUPUESTO">8. EN PRESUPUESTO</option>
            <option value="PRESUPUESTO APROBADO">9. PRESUPUESTO APROBADO</option>
            <option value="PRESUPUESTO RECHAZADO">10. PRESUPUESTO RECHAZADO</option>
            <option value="EN EJECUCIÓN TÉCNICA">11. EN EJECUCIÓN TÉCNICA</option>
            <option value="INFORME ENTREGADO">12. INFORME ENTREGADO</option>
            <option value="BRECHAS IDENTIFICADAS">13. BRECHAS IDENTIFICADAS</option>
            <option value="EN CORRECCIÓN">14. EN CORRECCIÓN</option>
            <option value="SOLICITUD RETEST">15. SOLICITUD RETEST</option>
            <option value="EN RETEST">16. EN RETEST</option>
            <option value="RETEST APROBADO">17. RETEST APROBADO</option>
            <option value="RESULTADO EMITIDO">18. RESULTADO EMITIDO</option>
            <option value="EN EVALUACIÓN DOCUMENTAL">19. EN EVALUACIÓN DOCUMENTAL</option>
            <option value="RESULTADO POR PROVEEDOR GENERADO">20. RESULTADO PROVEEDOR</option>
            <option value="RESULTADO LICITACIÓN APROBADO">21. CERTIFICADO/LICITACIÓN APROBADO</option>
          </select>
        </div>

        {/* Division Selector */}
        <div className="w-full md:w-auto">
          <select
            value={selectedDivision}
            onChange={(e) => setSelectedDivision(e.target.value)}
            className="w-full md:w-auto px-3 py-2 border border-crema/30 rounded-sm bg-white text-gris-azulado text-xs font-semibold cursor-pointer focus:outline-none focus:border-cobre"
          >
            <option value="ALL">🏢 TODAS LAS DIVISIONES</option>
            {DIVISIONES.map(div => (
              <option key={div} value={div}>{div}</option>
            ))}
          </select>
        </div>

        {/* Type Selector */}
        <div className="w-full md:w-auto">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full md:w-auto px-3 py-2 border border-crema/30 rounded-sm bg-white text-gris-azulado text-xs font-semibold cursor-pointer focus:outline-none focus:border-cobre"
          >
            <option value="ALL">⚡ TODOS LOS TIPOS</option>
            <option value="Implementación">Implementación Nueva</option>
            <option value="Licitación">Procesos de Licitación</option>
            <option value="Renovación">Renovación Anual</option>
            <option value="Actualización">Actualización OT</option>
          </select>
        </div>

        {/* Overdue Switch */}
        <div className="flex items-center space-x-2 shrink-0">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={onlyOverdue}
              onChange={(e) => setOnlyOverdue(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-granate"></div>
            <span className="ml-2 text-xs font-bold text-granate">SOLO CON VENCIMIENTOS</span>
          </label>
        </div>
      </div>

      {/* TWO COLUMN GRID: MAIN LIST & SIDE VENCIMIENTOS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Solicitudes dac list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gris-azulado font-display uppercase tracking-wider flex items-center">
              <Folder className="w-4 h-4 mr-2 text-cobre" />
              Solicitudes dac registradas ({filteredDacsList.length})
            </h3>
            <span className="text-[10px] text-gray-400 font-sans">
              Filtrado por RLS según perfil
            </span>
          </div>

          <div className="space-y-4" id="dacs-list">
            {filteredDacsList.length === 0 ? (
              <div className="bg-white border border-crema/20 rounded-sm p-12 text-center text-gray-400 font-sans">
                <Folder className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="font-semibold text-sm">No se encontraron solicitudes DAC</p>
                <p className="text-xs text-gray-400 mt-1">Intente remover o limpiar los filtros seleccionados.</p>
              </div>
            ) : (
              filteredDacsList.map((dac) => {
                const associatedFindings = findings.filter(f => f.dacId === dac.id);
                const openAssociated = associatedFindings.filter(f => f.state !== 'CORREGIDO' && f.state !== 'NO APLICA' && f.state !== 'ACEPTACIÓN DE RIESGO').length;
                const criticalAssociated = associatedFindings.filter(f => f.state !== 'CORREGIDO' && f.state !== 'NO APLICA' && f.state !== 'ACEPTACIÓN DE RIESGO' && f.criticidad === 'CRÍTICA').length;

                return (
                  <div
                    key={dac.id}
                    className="bg-white border border-crema/20 rounded-sm p-5 shadow-sm hover:border-cobre/40 hover:shadow-md transition-all relative group"
                    id={`dac-card-${dac.id}`}
                  >
                    {/* Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-cobre font-sans tracking-wide">
                          DAC {dac.id.length === 8 ? `${dac.id.slice(0, 4)}-${dac.id.slice(4)}` : dac.id}
                        </span>
                        <span className="text-gray-300">|</span>
                        <span className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border ${stateColor(dac.state)}`}>
                          {dac.state}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-sans">
                        Tipo: <strong>{dac.type}</strong>
                      </span>
                    </div>

                    {/* Content Body */}
                    <div className="py-4">
                      <h4 className="text-sm font-bold text-gris-azulado font-display uppercase tracking-wide group-hover:text-cobre transition-colors">
                        {dac.projectName}
                      </h4>
                      <p className="text-xs text-gray-500 font-sans mt-1 line-clamp-2 leading-relaxed">
                        {dac.description}
                      </p>

                      {/* Meta parameters row */}
                      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[10px] text-gray-400 font-sans font-medium">
                        <div className="flex items-center">
                          <User className="w-3.5 h-3.5 mr-1 text-gray-300 shrink-0" />
                          JP: <strong className="text-gray-600 ml-1">{dac.jpName}</strong>
                        </div>
                        <div className="flex items-center">
                          <Building className="w-3.5 h-3.5 mr-1 text-gray-300 shrink-0" />
                          Empresa: <strong className="text-gray-600 ml-1">{dac.companyName}</strong>
                        </div>
                        {dac.score !== undefined && (
                          <div className="flex items-center text-verde-petroleo font-bold">
                            <ShieldCheck className="w-3.5 h-3.5 mr-1 text-verde-petroleo shrink-0" />
                            Sello: <strong className="ml-1 uppercase">{dac.seal} ({dac.score} pts)</strong>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer / Actions */}
                    <div className="border-t border-gray-100 pt-3 mt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-sans">
                      {/* Findings indicators */}
                      <div>
                        {associatedFindings.length > 0 ? (
                          <div className="flex items-center space-x-2 text-[11px] font-semibold">
                            <span className={`px-2 py-0.5 rounded-sm ${openAssociated > 0 ? 'bg-red-50 text-granate' : 'bg-green-50 text-verde-petroleo'}`}>
                              ⚠️ {openAssociated} abiertos
                            </span>
                            {criticalAssociated > 0 && (
                              <span className="px-2 py-0.5 rounded-sm bg-granate text-white text-[10px] uppercase font-bold font-sans animate-pulse">
                                {criticalAssociated} Críticos 🚨
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[10px] text-gray-400 flex items-center">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
                            Sin hallazgos detectados
                          </span>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center space-x-2 justify-end">
                        {associatedFindings.length > 0 && (
                          <button
                            onClick={() => onSelectFinding(associatedFindings[0].id)}
                            className="text-cobre hover:text-white border border-cobre hover:bg-cobre px-3 py-1.5 rounded-sm text-[11px] font-bold uppercase tracking-wider font-display transition-colors cursor-pointer"
                          >
                            Hallazgos
                          </button>
                        )}
                        <button
                          onClick={() => onSelectDac(dac.id)}
                          className="bg-gris-azulado hover:bg-black text-white px-3 py-1.5 rounded-sm text-[11px] font-bold uppercase tracking-wider font-display flex items-center transition-all cursor-pointer"
                        >
                          Ver Proceso
                          <ChevronRight className="w-3.5 h-3.5 ml-1 stroke-[2.5]" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Vencimientos & Tendencias */}
        <div className="space-y-8">
          {/* Section: Próximos Vencimientos (SLAs) */}
          <div className="bg-white border border-crema/20 rounded-sm p-5 shadow-sm">
            <h3 className="text-xs font-bold text-gris-azulado font-display uppercase tracking-widest border-b border-gray-100 pb-3 mb-4 flex items-center">
              <Clock className="w-4 h-4 mr-2 text-granate" />
              Próximos Vencimientos SLAs
            </h3>

            <div className="space-y-3.5">
              {/* Item 1: Overdue find */}
              <div className="p-3 bg-red-50/50 border border-granate/10 rounded-sm flex items-start gap-2.5">
                <span className="px-1.5 py-0.5 rounded-sm bg-granate text-white text-[9px] font-bold uppercase font-sans shrink-0 mt-0.5 animate-pulse">
                  URGENTE
                </span>
                <div className="text-xs min-w-0">
                  <span className="font-bold text-gray-700 font-sans hover:underline cursor-pointer block" onClick={() => onSelectFinding('20260004-H001')}>
                    Hallazgo 20260004-H001 (Crítico)
                  </span>
                  <span className="text-[10px] text-gray-500 block leading-tight mt-0.5">
                    Autenticación débil API REST • Portal
                  </span>
                  <span className="text-[10px] text-granate font-bold block mt-1">
                    Vencido hace 3 días (SLA 5 días hábiles) ⚠️
                  </span>
                </div>
              </div>

              {/* Item 2: Overdue find 2 */}
              <div className="p-3 bg-red-50/50 border border-granate/10 rounded-sm flex items-start gap-2.5">
                <span className="px-1.5 py-0.5 rounded-sm bg-granate text-white text-[9px] font-bold uppercase font-sans shrink-0 mt-0.5 animate-pulse">
                  URGENTE
                </span>
                <div className="text-xs min-w-0">
                  <span className="font-bold text-gray-700 font-sans hover:underline cursor-pointer block" onClick={() => onSelectFinding('20260001-H001')}>
                    Hallazgo 20260001-H001 (Crítico)
                  </span>
                  <span className="text-[10px] text-gray-500 block leading-tight mt-0.5">
                    Falta cifrado en BD • ERP
                  </span>
                  <span className="text-[10px] text-granate font-bold block mt-1">
                    Vence mañana (24/06/2026) 🚨
                  </span>
                </div>
              </div>

              {/* Item 3: Near Stage */}
              <div className="p-3 bg-amber-50/50 border border-oro/10 rounded-sm flex items-start gap-2.5">
                <span className="px-1.5 py-0.5 rounded-sm bg-oro text-white text-[9px] font-bold uppercase font-sans shrink-0 mt-0.5">
                  PRÓXIMO
                </span>
                <div className="text-xs min-w-0">
                  <span className="font-bold text-gray-700 font-sans hover:underline cursor-pointer block" onClick={() => onSelectDac('20260001')}>
                    DAC 20260001 - Llenado Formulario
                  </span>
                  <span className="text-[10px] text-gray-500 block leading-tight mt-0.5">
                    Progreso actual: 40% (4/10 secciones)
                  </span>
                  <span className="text-[10px] text-cobre font-semibold block mt-1">
                    Vence en 5 días hábiles
                  </span>
                </div>
              </div>

              {/* Item 4: Normal */}
              <div className="p-3 bg-emerald-50/50 border border-verde-petroleo/10 rounded-sm flex items-start gap-2.5">
                <span className="px-1.5 py-0.5 rounded-sm bg-verde-petroleo text-white text-[9px] font-bold uppercase font-sans shrink-0 mt-0.5">
                  NORMAL
                </span>
                <div className="text-xs min-w-0">
                  <span className="font-bold text-gray-700 font-sans hover:underline cursor-pointer block" onClick={() => onSelectDac('20260002')}>
                    DAC 20260002 - Evaluación Licitación
                  </span>
                  <span className="text-[10px] text-gray-500 block leading-tight mt-0.5">
                    Evaluación documental de 3 proveedores
                  </span>
                  <span className="text-[10px] text-verde-petroleo font-semibold block mt-1">
                    Vence en 8 días hábiles
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Graphic / Trends */}
          <div className="bg-white border border-crema/20 rounded-sm p-5 shadow-sm">
            <h3 className="text-xs font-bold text-gris-azulado font-display uppercase tracking-widest border-b border-gray-100 pb-3 mb-4 flex items-center">
              <BarChart2 className="w-4 h-4 mr-2 text-cobre" />
              Historial de Sellos Emitidos
            </h3>

            {/* SVG Chart representation */}
            <div className="relative pt-4 font-sans text-[10px] text-gray-400">
              <span className="absolute top-0 right-0 text-[9px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 border border-gray-100 rounded-sm">
                Últimos 6 meses
              </span>
              <svg viewBox="0 0 300 150" className="w-full h-auto">
                {/* Horizontal grid lines */}
                <line x1="30" y1="20" x2="280" y2="20" stroke="#f3f4f6" strokeWidth="1" />
                <line x1="30" y1="50" x2="280" y2="50" stroke="#f3f4f6" strokeWidth="1" />
                <line x1="30" y1="80" x2="280" y2="80" stroke="#f3f4f6" strokeWidth="1" />
                <line x1="30" y1="110" x2="280" y2="110" stroke="#f3f4f6" strokeWidth="1" />
                <line x1="30" y1="130" x2="280" y2="130" stroke="#e5e7eb" strokeWidth="1.5" />

                {/* Y Axis labels */}
                <text x="5" y="24" fill="#9ca3af">100%</text>
                <text x="10" y="54" fill="#9ca3af">80%</text>
                <text x="10" y="84" fill="#9ca3af">60%</text>
                <text x="10" y="114" fill="#9ca3af">40%</text>

                {/* X Axis labels */}
                <text x="45" y="145" fill="#6b7280" fontWeight="bold">Ene</text>
                <text x="85" y="145" fill="#6b7280" fontWeight="bold">Feb</text>
                <text x="125" y="145" fill="#6b7280" fontWeight="bold">Mar</text>
                <text x="165" y="145" fill="#6b7280" fontWeight="bold">Abr</text>
                <text x="205" y="145" fill="#6b7280" fontWeight="bold">May</text>
                <text x="245" y="145" fill="#6b7280" fontWeight="bold">Jun</text>

                {/* Area under the curves */}
                <path d="M 50,110 L 90,95 L 130,80 L 170,50 L 210,40 L 250,25 L 250,130 L 50,130 Z" fill="rgba(0, 78, 89, 0.06)" />

                {/* Seal Green Trend Line */}
                <path d="M 50,110 L 90,95 L 130,80 L 170,50 L 210,40 L 250,25" fill="none" stroke="#004E59" strokeWidth="3" strokeLinecap="round" />
                {/* Dots on line */}
                <circle cx="50" cy="110" r="4" fill="#004E59" />
                <circle cx="90" cy="95" r="4" fill="#004E59" />
                <circle cx="130" cy="80" r="4" fill="#004E59" />
                <circle cx="170" cy="50" r="4" fill="#004E59" />
                <circle cx="210" cy="40" r="4" fill="#004E59" />
                <circle cx="250" cy="25" r="4" fill="#004E59" />

                {/* Seal Yellow Trend Line */}
                <path d="M 50,45 L 90,60 L 130,75 L 170,90 L 210,80 L 250,95" fill="none" stroke="#F4A700" strokeWidth="1.5" strokeDasharray="3" strokeLinecap="round" />
                <circle cx="250" cy="95" r="3.5" fill="#F4A700" />
              </svg>

              {/* Legends */}
              <div className="flex justify-between items-center bg-surface-custom/50 px-3 py-2 rounded-sm border border-crema/10 mt-3 font-semibold text-[10px] text-gray-500">
                <span className="flex items-center text-verde-petroleo">
                  <span className="w-2.5 h-2.5 bg-verde-petroleo rounded-full mr-1"></span>
                  🟢 VERDE: 62%
                </span>
                <span className="flex items-center text-oro">
                  <span className="w-2.5 h-2.5 bg-oro rounded-full mr-1"></span>
                  🟡 AMARILLO: 28%
                </span>
                <span className="flex items-center text-granate">
                  <span className="w-2.5 h-2.5 bg-granate rounded-full mr-1"></span>
                  🔴 ROJO: 10%
                </span>
              </div>
            </div>
          </div>

          {/* Section: Action buttons / Simulation utils */}
          <div className="bg-white border border-crema/20 rounded-sm p-4 shadow-sm flex flex-col space-y-2">
            <button
              onClick={handleExportData}
              className="w-full flex items-center justify-center space-x-2 py-2 px-4 border border-crema/30 hover:bg-surface-custom text-gris-azulado font-bold uppercase text-[10px] tracking-wider rounded-sm focus:outline-none transition-colors"
            >
              <Download className="w-4 h-4 text-cobre" />
              <span>Exportar Reporte Excel</span>
            </button>
            <button
              onClick={() => setShowPbiModal(true)}
              className="w-full flex items-center justify-center space-x-2 py-2 px-4 border border-crema/30 hover:bg-surface-custom text-gris-azulado font-bold uppercase text-[10px] tracking-wider rounded-sm focus:outline-none transition-colors"
            >
              <BarChart2 className="w-4 h-4 text-verde-petroleo" />
              <span>Ver Dashboard Power BI</span>
            </button>
          </div>
        </div>
      </div>

      {/* TOAST NOTIFICATION FOR EXPORT */}
      {showExportToast && (
        <div className="fixed bottom-5 right-5 bg-gris-azulado text-white border border-crema/30 p-4 rounded-sm shadow-2xl flex items-center space-x-3 z-50 text-xs animate-slide-up">
          <ShieldCheck className="text-cobre w-5 h-5 animate-bounce shrink-0" />
          <div>
            <p className="font-bold">¡Datos exportados con éxito!</p>
            <p className="text-crema text-[10px] mt-0.5">Reporte: dac_sello_ciber_audit_2026.xlsx descargado.</p>
          </div>
        </div>
      )}

      {/* MODAL: POWER BI POPUP */}
      {showPbiModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-crema/30 w-full max-w-4xl rounded-sm shadow-2xl relative overflow-hidden text-gris-azulado font-sans">
            <div className="bg-surface-container-custom px-6 py-4 flex justify-between items-center border-b border-crema/30">
              <h3 className="font-display font-bold uppercase text-cobre text-sm tracking-widest flex items-center">
                <BarChart2 className="w-5 h-5 mr-2 text-verde-petroleo" />
                Power BI Embedded - Sello Ciberseguridad Codelco
              </h3>
              <button
                onClick={() => setShowPbiModal(false)}
                className="p-1 hover:bg-crema/20 rounded-full transition-colors text-gray-500 focus:outline-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 bg-gray-50 aspect-video flex flex-col items-center justify-center border-b border-gray-100">
              {/* Simulation of a heavy dashboard with KPIs */}
              <div className="w-full h-full bg-white border border-gray-200 p-4 rounded-sm flex flex-col justify-between">
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-xs font-bold text-gray-400">REPORT_ID: PBI_EMBED_CODELCO_OT</span>
                  <span className="px-2 py-0.5 bg-green-100 text-verde-petroleo font-bold rounded-full text-[9px]">RLS ACTIVO</span>
                </div>

                <div className="grid grid-cols-4 gap-4 my-auto">
                  <div className="border border-gray-100 bg-surface-custom/30 p-3 text-center rounded-sm">
                    <span className="text-[10px] text-gray-400 block font-semibold">TIEMPO PROMEDIO RESOLUCIÓN</span>
                    <span className="text-xl font-bold font-display text-cobre">3.2 Días</span>
                    <span className="text-[9px] text-green-600 block mt-1">SLA Meta: 5.0 Días</span>
                  </div>
                  <div className="border border-gray-100 bg-surface-custom/30 p-3 text-center rounded-sm">
                    <span className="text-[10px] text-gray-400 block font-semibold">TASA CUMPLIMIENTO SLA</span>
                    <span className="text-xl font-bold font-display text-verde-petroleo">87.5%</span>
                    <span className="text-[9px] text-green-600 block mt-1">📈 +2.4% vs Mar</span>
                  </div>
                  <div className="border border-gray-100 bg-surface-custom/30 p-3 text-center rounded-sm">
                    <span className="text-[10px] text-gray-400 block font-semibold">CARTA ACEPTACIÓN RIESGO</span>
                    <span className="text-xl font-bold font-display text-amber-500">8%</span>
                    <span className="text-[9px] text-gray-400 block mt-1">Autorizados formalmente</span>
                  </div>
                  <div className="border border-gray-100 bg-surface-custom/30 p-3 text-center rounded-sm">
                    <span className="text-[10px] text-gray-400 block font-semibold">RECORREGIDOS EN RETEST</span>
                    <span className="text-xl font-bold font-display text-azul">92.0%</span>
                    <span className="text-[9px] text-green-600 block mt-1">Aprobado en 1er intento</span>
                  </div>
                </div>

                <div className="h-28 flex items-end justify-between px-6 border-t border-gray-50 pt-4">
                  <div className="w-12 bg-granate/10 h-[20%] rounded-sm text-center text-[8px] font-bold py-1">20% EH</div>
                  <div className="w-12 bg-azul/15 h-[60%] rounded-sm text-center text-[8px] font-bold py-1">60% EC</div>
                  <div className="w-12 bg-cobre/15 h-[80%] rounded-sm text-center text-[8px] font-bold py-1">80% DAST</div>
                  <div className="w-12 bg-verde-petroleo/15 h-[95%] rounded-sm text-center text-[8px] font-bold py-1">95% SCAN</div>
                  <span className="text-[10px] text-gray-400 text-right w-1/3 italic font-sans">Datos distribuidos por origen de hallazgos</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-3 flex justify-between items-center text-xs font-sans">
              <span className="text-[10px] text-gray-500 font-semibold flex items-center">
                <UserCheck className="w-4 h-4 mr-1.5 text-verde-petroleo" />
                Filtros de SharePoint aplicados automáticos para: <strong>{currentRole === 'JP' ? 'Juan Pérez' : 'Corporativo'}</strong>
              </span>
              <button
                onClick={() => setShowPbiModal(false)}
                className="bg-gris-azulado text-white px-4 py-1.5 rounded-sm text-xs font-bold uppercase tracking-wider font-display"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NUEVA SOLICITUD DAC */}
      {showNewDacModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-crema/30 w-full max-w-3xl rounded-sm shadow-2xl relative overflow-hidden text-gris-azulado font-sans max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-surface-container-custom px-6 py-4 flex justify-between items-center border-b border-crema/30 shrink-0">
              <h3 className="font-display font-bold uppercase text-cobre text-sm tracking-widest flex items-center">
                <Plus className="w-5 h-5 mr-1.5 text-cobre" />
                Nueva Solicitud DAC (Borrador)
              </h3>
              <button
                onClick={() => setShowNewDacModal(false)}
                className="p-1 hover:bg-crema/20 rounded-full transition-colors text-gray-500 focus:outline-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Content */}
            <form onSubmit={handleCreateDacSubmit} className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
              {validationError && (
                <div className="bg-red-50 border border-red-200 text-granate rounded-sm p-3 font-semibold flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-granate shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}
              
              {/* Part 1: Project Information */}
              <div className="space-y-4">
                <h4 className="font-display font-bold text-xs uppercase tracking-wider text-cobre border-b border-gray-100 pb-2">
                  1. Información del Proyecto
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-gray-600">Nombre del Proyecto / Servicio *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Implementación de Redes Seguras"
                      value={newDacForm.projectName}
                      onChange={(e) => setNewDacForm({ ...newDacForm, projectName: e.target.value })}
                      className="w-full px-3 py-2 border border-crema/30 rounded-sm bg-surface-custom/30 text-xs focus:outline-none focus:border-cobre focus:bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-gray-600">Jefe de Proyecto (JP) *</label>
                    <input
                      type="text"
                      required
                      placeholder="Nombre del JP"
                      value={newDacForm.jpName}
                      onChange={(e) => setNewDacForm({ ...newDacForm, jpName: e.target.value })}
                      className="w-full px-3 py-2 border border-crema/30 rounded-sm bg-surface-custom/30 text-xs focus:outline-none focus:border-cobre focus:bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-gray-600">Email del JP *</label>
                    <input
                      type="email"
                      required
                      placeholder="jp@codelco.cl"
                      value={newDacForm.jpEmail}
                      onChange={(e) => setNewDacForm({ ...newDacForm, jpEmail: e.target.value })}
                      className="w-full px-3 py-2 border border-crema/30 rounded-sm bg-surface-custom/30 text-xs focus:outline-none focus:border-cobre focus:bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-gray-600">Cargo del JP *</label>
                    <input
                      type="text"
                      required
                      placeholder="Cargo corporativo"
                      value={newDacForm.jpCargo}
                      onChange={(e) => setNewDacForm({ ...newDacForm, jpCargo: e.target.value })}
                      className="w-full px-3 py-2 border border-crema/30 rounded-sm bg-surface-custom/30 text-xs focus:outline-none focus:border-cobre focus:bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-gray-600">Gerencia Solicitante *</label>
                    <select
                      value={newDacForm.gerencia}
                      onChange={(e) => setNewDacForm({ ...newDacForm, gerencia: e.target.value })}
                      className="w-full px-3 py-2 border border-crema/30 rounded-sm bg-white text-xs font-semibold focus:outline-none focus:border-cobre"
                    >
                      {GERENCIAS.map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-gray-600">División Codelco *</label>
                    <select
                      value={newDacForm.division}
                      onChange={(e) => setNewDacForm({ ...newDacForm, division: e.target.value })}
                      className="w-full px-3 py-2 border border-crema/30 rounded-sm bg-white text-xs font-semibold focus:outline-none focus:border-cobre"
                    >
                      {DIVISIONES.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-gray-600">Descripción detallada del alcance *</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Describa el alcance del proyecto, servidores involucrados y datos que se gestionarán..."
                    value={newDacForm.description}
                    onChange={(e) => setNewDacForm({ ...newDacForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-crema/30 rounded-sm bg-surface-custom/30 text-xs focus:outline-none focus:border-cobre focus:bg-white"
                  ></textarea>
                </div>
              </div>

              {/* Part 2: Supplier Information */}
              <div className="space-y-4">
                <h4 className="font-display font-bold text-xs uppercase tracking-wider text-cobre border-b border-gray-100 pb-2">
                  2. Datos del Proveedor
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-gray-600">Razón Social *</label>
                    <input
                      type="text"
                      required
                      placeholder="Nombre de la empresa proveedora"
                      value={newDacForm.companyName}
                      onChange={(e) => setNewDacForm({ ...newDacForm, companyName: e.target.value })}
                      className="w-full px-3 py-2 border border-crema/30 rounded-sm bg-surface-custom/30 text-xs focus:outline-none focus:border-cobre focus:bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-gray-600">RUT Empresa *</label>
                    <input
                      type="text"
                      required
                      placeholder="76.xxx.xxx-x"
                      value={newDacForm.companyRut}
                      onChange={(e) => setNewDacForm({ ...newDacForm, companyRut: e.target.value })}
                      className="w-full px-3 py-2 border border-crema/30 rounded-sm bg-surface-custom/30 text-xs focus:outline-none focus:border-cobre focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Part 3: Scope and Technical Metadata */}
              <div className="space-y-4">
                <h4 className="font-display font-bold text-xs uppercase tracking-wider text-cobre border-b border-gray-100 pb-2">
                  3. Alcance Técnico e Integridad
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-gray-600">Tipo de DAC *</label>
                    <select
                      value={newDacForm.type}
                      onChange={(e) => setNewDacForm({ ...newDacForm, type: e.target.value as DacType })}
                      className="w-full px-3 py-2 border border-crema/30 rounded-sm bg-white text-xs font-semibold focus:outline-none focus:border-cobre"
                    >
                      <option value="Implementación">Implementación Nueva</option>
                      <option value="Licitación">Procesos de Licitación</option>
                      <option value="Renovación">Renovación Anual</option>
                      <option value="Actualización">Actualización OT</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-gray-600">Criticidad Estimada *</label>
                    <select
                      value={newDacForm.criticidad}
                      onChange={(e) => setNewDacForm({ ...newDacForm, criticidad: e.target.value as any })}
                      className="w-full px-3 py-2 border border-crema/30 rounded-sm bg-white text-xs font-semibold focus:outline-none focus:border-cobre"
                    >
                      <option value="Crítico">🔴 Crítico (Sistemas OT/Core)</option>
                      <option value="Alto">🟠 Alto</option>
                      <option value="Medio">🟡 Medio</option>
                      <option value="Bajo">🟢 Bajo</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-gray-600">Presupuesto Estimado (USD) *</label>
                    <input
                      type="number"
                      required
                      value={newDacForm.budgetEstimate}
                      onChange={(e) => setNewDacForm({ ...newDacForm, budgetEstimate: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-crema/30 rounded-sm bg-surface-custom/30 text-xs focus:outline-none focus:border-cobre focus:bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-600 block">Justificación del Requerimiento * (Mínimo 50 caracteres)</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Explique el beneficio operativo y por qué se requiere de acuerdo a las directrices de Codelco..."
                    value={newDacForm.justification}
                    onChange={(e) => setNewDacForm({ ...newDacForm, justification: e.target.value })}
                    className="w-full px-3 py-2 border border-crema/30 rounded-sm bg-surface-custom/30 text-xs focus:outline-none focus:border-cobre focus:bg-white"
                  ></textarea>
                  <span className="text-[10px] text-gray-400 font-sans block text-right">
                    {newDacForm.justification.length} / 1000 caracteres
                  </span>
                </div>
              </div>
            </form>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t border-gray-100 shrink-0">
              <span className="text-[10px] text-gray-400">
                💾 Guardado automático activo
              </span>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setShowNewDacModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-sm text-xs text-gray-700 font-semibold uppercase tracking-wider font-display focus:outline-none"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleCreateDacSubmit}
                  className="px-5 py-2 bg-cobre hover:bg-cobre-oscuro text-white rounded-sm text-xs font-bold uppercase tracking-wider font-display shadow-sm focus:outline-none"
                >
                  Crear Borrador dac
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
