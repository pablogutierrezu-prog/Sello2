import React, { useState, useMemo } from 'react';
import { DacRequest, SupplierEvaluation, SelloType, UserRole, DacState } from '../types';
import {
  Gavel,
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
  Paperclip
} from 'lucide-react';

interface LicitacionesProps {
  dacs: DacRequest[];
  currentRole: UserRole;
  onUpdateDacState: (id: string, newState: DacState) => void;
  onSelectDac: (id: string) => void;
}

export default function LicitacionesView({
  dacs,
  currentRole,
  onUpdateDacState,
  onSelectDac
}: LicitacionesProps) {
  // Find dac of type Licitación
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

  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('s1');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Active supplier details
  const activeSupplier = useMemo(() => {
    if (!activeDac) return undefined;
    return activeDac.suppliers?.find(s => s.id === selectedSupplierId) || activeDac.suppliers?.[0];
  }, [activeDac, selectedSupplierId]);

  // Budget calculations
  const budgetCalc = useMemo(() => {
    const hhBase = 40; // Base hours per supplier
    const qty = activeDac?.suppliers?.length || 3;
    const totalHh = hhBase * qty;
    const costPerHour = 150; // USD
    const totalCost = totalHh * costPerHour;
    return { hhBase, qty, totalHh, totalCost };
  }, [activeDac]);

  const handleApproveLicitacion = () => {
    if (!activeDac) return;
    onUpdateDacState(activeDac.id, 'RESULTADO LICITACIÓN APROBADO');
    setSuccessToast('🏆 Licitación aprobada con éxito. Certificados digitales emitidos.');
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const getSelloColor = (seal: SelloType) => {
    switch (seal) {
      case 'Verde':
        return 'bg-emerald-50 text-verde-petroleo border-verde-petroleo/20';
      case 'Amarillo':
        return 'bg-amber-50 text-oro border-oro/20';
      case 'Rojo':
        return 'bg-red-50 text-granate border-granate/20';
      default:
        return 'bg-gray-50 text-gray-500';
    }
  };

  if (!activeDac) {
    return (
      <div className="p-8 text-center text-gray-500 font-sans" id="licitaciones-view">
        No hay licitaciones disponibles en este momento.
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 overflow-y-auto max-h-[calc(100vh-4rem)] w-full text-xs font-sans bg-gray-50" id="licitaciones-view">
      
      {/* HEADER BANNER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gris-azulado leading-tight">
            Procesos de Licitación
          </h2>
          <p className="text-xs text-gris-azulado/60 font-sans mt-1">
            Módulo especial de evaluación de múltiples oferentes en procesos de adquisiciones de Codelco (Flujo 9).
          </p>
        </div>

        {/* Bidding DAC Selector if multiple */}
        {licitaciones.length > 1 && (
          <div className="flex items-center space-x-2">
            <span className="font-bold text-gray-400">Seleccionar DAC:</span>
            <select
              value={activeDacId}
              onChange={(e) => {
                setActiveDacId(e.target.value);
              }}
              className="px-3 py-1.5 border border-crema/30 rounded-sm bg-white font-semibold text-gris-azulado"
            >
              {licitaciones.map(l => (
                <option key={l.id} value={l.id}>DAC {l.id.length === 8 ? `${l.id.slice(0, 4)}-${l.id.slice(4)}` : l.id} - {l.projectName}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* DAC CONTEXT CARD */}
      <div className="bg-white border border-crema/20 p-5 rounded-sm shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-cobre font-sans tracking-wide">
                N° DAC: {activeDac.id.length === 8 ? `${activeDac.id.slice(0, 4)}-${activeDac.id.slice(4)}` : activeDac.id}
              </span>
              <span className="text-gray-300">|</span>
              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${getSelloColor('Amarillo')}`}>
                Estado: {activeDac.state}
              </span>
            </div>
            <h3 className="text-sm font-bold text-gris-azulado font-display uppercase tracking-wide">
              {activeDac.projectName}
            </h3>
            <p className="text-xs text-gray-500 font-sans leading-relaxed">
              {activeDac.description}
            </p>
          </div>

          <div className="border-l border-gray-100 pl-6 space-y-2 font-sans text-gray-500">
            <div>
              <span>Jefe de Proyecto Codelco:</span>
              <strong className="text-gray-700 block">{activeDac.jpName} ({activeDac.jpEmail})</strong>
            </div>
            <div>
              <span>Marco de Evaluación Obligatorio:</span>
              <strong className="text-verde-petroleo block uppercase">ISO 27001 / NIST SP 800-53</strong>
            </div>
          </div>
        </div>
      </div>

      {/* COMPARATIVE EVALUATION MATRIX TABLE */}
      <div className="bg-white border border-crema/20 rounded-sm p-5 shadow-sm space-y-4">
        <div className="border-b border-gray-100 pb-3 flex justify-between items-center">
          <h3 className="text-xs font-bold text-gris-azulado font-display uppercase tracking-wider flex items-center">
            <FileSpreadsheet className="w-4 h-4 mr-2 text-cobre" />
            Matriz Comparativa de Cumplimiento Técnico (Oferentes)
          </h3>
          <span className="text-[10px] font-bold text-verde-petroleo bg-emerald-50 px-2 py-0.5 border border-emerald-100 rounded-sm">
            Trazabilidad Inmutable en SharePoint
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-surface-custom/40 border-b border-crema/20 text-gray-400 font-bold uppercase tracking-wider font-display">
                <th className="py-3 px-4">N°</th>
                <th className="py-3 px-4">RUT Oferente</th>
                <th className="py-3 px-4">Proveedor / Oferente</th>
                <th className="py-3 px-4">Fecha Evaluación</th>
                <th className="py-3 px-4 text-center">Puntaje %</th>
                <th className="py-3 px-4 text-center">Sello Obtenido</th>
                <th className="py-3 px-4 text-right">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-sans text-gray-700">
              {activeDac.suppliers?.map((sup, idx) => (
                <tr
                  key={sup.id}
                  className={`hover:bg-surface-custom/20 transition-colors ${
                    selectedSupplierId === sup.id ? 'bg-surface-custom/10' : ''
                  }`}
                >
                  <td className="py-3.5 px-4 font-bold">{idx + 1}</td>
                  <td className="py-3.5 px-4 text-gray-500 font-mono">{sup.rut}</td>
                  <td className="py-3.5 px-4 font-bold text-gray-800">{sup.name}</td>
                  <td className="py-3.5 px-4 text-gray-500">{sup.date}</td>
                  <td className="py-3.5 px-4 text-center font-bold text-sm text-gris-azulado">
                    {sup.score}%
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${getSelloColor(sup.seal)}`}>
                      Sello {sup.seal}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSelectedSupplierId(sup.id)}
                      className={`px-3 py-1 border rounded-sm font-bold uppercase text-[10px] font-display transition-all ${
                        selectedSupplierId === sup.id
                          ? 'bg-cobre text-white border-cobre shadow-xs'
                          : 'border-crema/40 text-gris-azulado hover:border-cobre/40'
                      }`}
                    >
                      Evaluar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAILED SUPPLIER VIEW & BUDGET ESTIMATION CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Supplier Detailed Assessment */}
        <div className="lg:col-span-2 space-y-6">
          {activeSupplier ? (
            <div className="bg-white border border-crema/20 p-5 rounded-sm shadow-sm space-y-6">
              <div className="border-b border-gray-100 pb-3 flex justify-between items-center text-xs font-bold font-sans">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400">Oferente Seleccionado:</span>
                  <strong className="text-gris-azulado text-sm uppercase">{activeSupplier.name}</strong>
                </div>
                <span className={`px-3 py-0.5 rounded-full border text-[10px] font-bold ${getSelloColor(activeSupplier.seal)}`}>
                  Sello Propuesto: {activeSupplier.seal}
                </span>
              </div>

              {/* General details grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans text-gray-500 bg-surface-custom/30 p-4 border border-crema/10 rounded-sm">
                <div>
                  <span>RUT Empresa:</span>
                  <strong className="text-gray-700 block font-mono">{activeSupplier.rut}</strong>
                </div>
                <div>
                  <span>Email de Contacto:</span>
                  <strong className="text-gray-700 block">{activeSupplier.contact}</strong>
                </div>
                <div>
                  <span>Norma de Evaluación:</span>
                  <strong className="text-gray-700 block uppercase">{activeSupplier.marco}</strong>
                </div>
              </div>

              {/* Assessment checklist mock */}
              <div className="space-y-4">
                <h4 className="font-display font-bold text-xs uppercase text-gris-azulado tracking-wider pb-2 border-b border-gray-100">
                  Resumen de Controles Auditados (ISO 27001 Checklist)
                </h4>
                
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center p-2.5 border border-gray-100 rounded-sm bg-white shadow-3xs">
                    <span className="font-semibold text-gray-700">Control A.5 (Políticas de seguridad de la información)</span>
                    <strong className="text-verde-petroleo">Aprobado (95%) ✓</strong>
                  </div>
                  <div className="flex justify-between items-center p-2.5 border border-gray-100 rounded-sm bg-white shadow-3xs">
                    <span className="font-semibold text-gray-700">Control A.6 (Organización de la seguridad de la información)</span>
                    <strong className="text-verde-petroleo">Aprobado (90%) ✓</strong>
                  </div>
                  <div className="flex justify-between items-center p-2.5 border border-gray-100 rounded-sm bg-white shadow-3xs">
                    <span className="font-semibold text-gray-700">Control A.7 (Seguridad de los recursos humanos)</span>
                    <strong className="text-verde-petroleo">Aprobado (88%) ✓</strong>
                  </div>
                  <div className="flex justify-between items-center p-2.5 border border-gray-100 rounded-sm bg-white shadow-3xs">
                    <span className="font-semibold text-gray-700">Control A.8 (Gestión de activos de información)</span>
                    <strong className="text-verde-petroleo">Aprobado (94%) ✓</strong>
                  </div>
                  <div className="flex justify-between items-center p-2.5 border border-gray-100 rounded-sm bg-white shadow-3xs">
                    <span className="font-semibold text-gray-700">Control A.9 (Control de accesos y cifrados)</span>
                    <strong className="text-verde-petroleo">Aprobado (93%) ✓</strong>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="font-bold text-gray-600 block">Observaciones Generales del Auditor:</span>
                  <p className="text-xs text-gray-500 font-sans italic leading-relaxed mt-1">
                    "{activeSupplier.comments}"
                  </p>
                </div>

                {/* Evidences list */}
                <div className="space-y-2 pt-2">
                  <span className="font-bold text-gray-600 block">Evidencias Documentales de Resguardo:</span>
                  <div className="flex flex-wrap gap-2">
                    {activeSupplier.evidences.map(ev => (
                      <span key={ev} className="px-2.5 py-1 bg-surface-custom border border-crema/20 rounded-sm font-sans font-medium text-gris-azulado flex items-center shadow-3xs">
                        <Paperclip className="w-3.5 h-3.5 text-cobre mr-1 shrink-0" />
                        {ev}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-crema/20 p-12 text-center text-gray-400 font-sans">
              No supplier selected
            </div>
          )}
        </div>

        {/* Right Column: Calculator and Approval */}
        <div className="space-y-6">
          {/* Automatic budget calculator */}
          <div className="bg-white border border-crema/20 p-5 rounded-sm shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-gris-azulado font-display uppercase tracking-wider border-b border-gray-100 pb-2 flex items-center">
              <Calculator className="w-4 h-4 mr-2 text-cobre" />
              Cálculo de Presupuesto Automático (HU-18)
            </h3>
            
            <div className="text-xs font-sans space-y-3 text-gray-600">
              <p className="leading-relaxed">
                El presupuesto para licitaciones se calcula multiplicando una base parametrizable de Horas Hombre (HH) por oferente, por la cantidad de oferentes en competencia.
              </p>

              <div className="p-3.5 bg-gray-50 border border-gray-100 rounded-sm space-y-2 font-sans font-medium">
                <div className="flex justify-between border-b border-gray-200 pb-1">
                  <span>HH Base por Proveedor:</span>
                  <strong className="text-gray-800">{budgetCalc.hhBase} HH</strong>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-1">
                  <span>Oferentes Registrados:</span>
                  <strong className="text-gray-800">{budgetCalc.qty} Oferentes</strong>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-1 text-cobre font-bold">
                  <span>TOTAL HORAS ESTIMADO:</span>
                  <strong className="text-cobre">{budgetCalc.totalHh} HH</strong>
                </div>
                <div className="flex justify-between pt-1 font-bold text-sm text-verde-petroleo">
                  <span>Costo Estimado Auditoría:</span>
                  <strong>USD ${budgetCalc.totalCost.toLocaleString('es-CL')}</strong>
                </div>
              </div>

              <div className="text-[10px] text-gray-400 italic">
                * Tarifa promedio simulada: $150 USD por Hora de Auditoría. Configurado según contratos marco de Ernst & Young (EY).
              </div>
            </div>
          </div>

          {/* Action: Approve Licitación if Revisor/Admin */}
          {activeDac.state === 'EN EVALUACIÓN DOCUMENTAL' && (currentRole === 'RESP_GESTION' || currentRole === 'RESP_EVAL_DOC_EY' || currentRole === 'ADMIN') && (
            <div className="bg-white border border-crema/20 p-5 rounded-sm shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-gris-azulado font-display uppercase tracking-wider border-b border-gray-100 pb-2 flex items-center">
                <Gavel className="w-4 h-4 mr-2 text-verde-petroleo" />
                Cierre y Adjudicación de Sello
              </h3>
              <p className="text-xs text-gray-500 font-sans leading-relaxed">
                Habiéndose completado la evaluación de los oferentes, presione el botón de abajo para aprobar la licitación especial. El sistema emitirá los certificados digitales con sellos individuales para cada proveedor de forma inmutable.
              </p>
              <button
                onClick={handleApproveLicitacion}
                className="w-full bg-verde-petroleo hover:bg-emerald-900 text-white font-bold uppercase font-display py-2.5 rounded-sm tracking-wider shadow-sm flex items-center justify-center focus:outline-none"
              >
                <CheckCircle className="w-4 h-4 mr-1.5" />
                Aprobar Resultado Licitación
              </button>
            </div>
          )}

          {/* Document History */}
          <div className="bg-white border border-crema/20 p-5 rounded-sm shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-gris-azulado font-display uppercase tracking-wider border-b border-gray-100 pb-2 flex items-center">
              <ExternalLink className="w-4 h-4 mr-2 text-cobre" />
              Documentos Generados
            </h3>
            <div className="space-y-2 text-xs font-sans">
              <div className="p-2 bg-gray-50 border border-gray-100 rounded-sm flex items-center justify-between">
                <span className="font-semibold text-gray-700 truncate">DAC-20260002-TDR.pdf</span>
                <span className="text-[10px] text-gray-400">10/06/2026</span>
              </div>
              <div className="p-2 bg-gray-50 border border-gray-100 rounded-sm flex items-center justify-between">
                <span className="font-semibold text-gray-700 truncate">DAC-20260002-EvaluacionConsolidada.pdf</span>
                <span className="text-[10px] text-gray-400">Pendiente</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TOAST PANEL */}
      {successToast && (
        <div className="fixed bottom-5 right-5 bg-gris-azulado text-white border border-crema/30 p-4 rounded-sm shadow-2xl flex items-center space-x-3 z-50 text-xs animate-slide-up max-w-sm">
          <CheckCircle className="text-cobre w-5 h-5 animate-bounce shrink-0" />
          <div>
            <p className="font-bold">Notificación de SharePoint</p>
            <p className="text-crema text-[10px] mt-0.5">{successToast}</p>
          </div>
        </div>
      )}
    </div>
  );
}
