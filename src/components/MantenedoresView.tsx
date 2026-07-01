import React, { useState } from 'react';
import { Wrench, Shield, Clock, Award, Users, Plus, Edit2, Check, X, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

interface Standard {
  id: string;
  code: string;
  name: string;
  category: 'OT' | 'IT' | 'MIXTO';
  status: 'Activo' | 'Inactivo';
  controlsCount: number;
}

interface SlaConfig {
  id: string;
  criticidad: string;
  days: number;
  description: string;
}

interface SealThreshold {
  id: string;
  seal: 'Verde' | 'Amarillo' | 'Rojo';
  minScore: number;
  maxScore: number;
  color: string;
  textColor: string;
}

export default function MantenedoresView() {
  const [activeTab, setActiveTab] = useState<'estandares' | 'sla' | 'sellos' | 'revisores'>('estandares');
  const [showNotification, setShowNotification] = useState<string | null>(null);

  // Simulated standards state
  const [standards, setStandards] = useState<Standard[]>([
    { id: '1', code: 'IEC-62443', name: 'Seguridad para Sistemas de Control Industrial (IACS)', category: 'OT', status: 'Activo', controlsCount: 42 },
    { id: '2', code: 'NIST-CSF', name: 'Marco de Ciberseguridad NIST V2.0', category: 'MIXTO', status: 'Activo', controlsCount: 38 },
    { id: '3', code: 'ISO-27001', name: 'Sistemas de Gestión de Seguridad de la Información', category: 'IT', status: 'Activo', controlsCount: 114 },
    { id: '4', code: 'NCO-05', name: 'Norma Corporativa de Ciberseguridad Codelco', category: 'MIXTO', status: 'Activo', controlsCount: 25 },
    { id: '5', code: 'CIS-v8', name: 'Controles CIS para Ciberseguridad Eficaz', category: 'IT', status: 'Inactivo', controlsCount: 18 }
  ]);

  // SLA config state
  const [slas, setSlas] = useState<SlaConfig[]>([
    { id: '1', criticidad: 'CRÍTICA', days: 5, description: 'Mitigación inmediata de brechas que comprometan la continuidad operacional.' },
    { id: '2', criticidad: 'ALTA', days: 15, description: 'Corrección de vulnerabilidades con alto potencial de impacto en sistemas de producción.' },
    { id: '3', criticidad: 'MEDIA', days: 30, description: 'Solución de desvíos menores en estándares de ciberseguridad corporativos.' },
    { id: '4', criticidad: 'BAJA', days: 60, description: 'Mejoras de higiene de seguridad o actualizaciones recomendadas.' }
  ]);

  // Seal thresholds state
  const [seals, setSeals] = useState<SealThreshold[]>([
    { id: '1', seal: 'Verde', minScore: 85, maxScore: 100, color: 'bg-emerald-50 text-emerald-700 border-emerald-200', textColor: 'text-emerald-800' },
    { id: '2', seal: 'Amarillo', minScore: 50, maxScore: 84, color: 'bg-amber-50 text-amber-700 border-amber-200', textColor: 'text-amber-800' },
    { id: '3', seal: 'Rojo', minScore: 0, maxScore: 49, color: 'bg-rose-50 text-rose-700 border-rose-200', textColor: 'text-rose-800' }
  ]);

  // Editing state variables
  const [editingStandard, setEditingStandard] = useState<string | null>(null);
  const [editStandardForm, setEditStandardForm] = useState<Partial<Standard>>({});
  
  const [editingSla, setEditingSla] = useState<string | null>(null);
  const [editSlaDays, setEditSlaDays] = useState<number>(5);

  const [editingSeal, setEditingSeal] = useState<string | null>(null);
  const [editSealMin, setEditSealMin] = useState<number>(0);

  const triggerToast = (message: string) => {
    setShowNotification(message);
    setTimeout(() => setShowNotification(null), 3000);
  };

  // Standard Actions
  const handleToggleStatus = (id: string) => {
    setStandards(prev => prev.map(s => {
      if (s.id === id) {
        const newStatus = s.status === 'Activo' ? 'Inactivo' : 'Activo';
        triggerToast(`Estándar ${s.code} cambiado a ${newStatus}`);
        return { ...s, status: newStatus };
      }
      return s;
    }));
  };

  const handleStartEditStandard = (standard: Standard) => {
    setEditingStandard(standard.id);
    setEditStandardForm(standard);
  };

  const handleSaveStandard = () => {
    if (!editStandardForm.code || !editStandardForm.name) return;
    setStandards(prev => prev.map(s => {
      if (s.id === editingStandard) {
        return { ...s, ...editStandardForm } as Standard;
      }
      return s;
    }));
    triggerToast(`Estándar ${editStandardForm.code} guardado con éxito`);
    setEditingStandard(null);
  };

  // SLA Actions
  const handleStartEditSla = (sla: SlaConfig) => {
    setEditingSla(sla.id);
    setEditSlaDays(sla.days);
  };

  const handleSaveSla = (id: string) => {
    setSlas(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, days: editSlaDays };
      }
      return s;
    }));
    const updatedSla = slas.find(s => s.id === id);
    triggerToast(`Plazo SLA para criticidad ${updatedSla?.criticidad} actualizado a ${editSlaDays} días`);
    setEditingSla(null);
  };

  // Seal Actions
  const handleStartEditSeal = (seal: SealThreshold) => {
    setEditingSeal(seal.id);
    setEditSealMin(seal.minScore);
  };

  const handleSaveSeal = (id: string) => {
    setSeals(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, minScore: editSealMin };
      }
      // If Verde min score increases, Amarillo's max score should be minScore - 1 automatically
      return s;
    }));
    triggerToast('Umbrales de Sello actualizados con éxito');
    setEditingSeal(null);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto overflow-y-auto h-[calc(100vh-4rem)] bg-gray-50/50" id="mantenedores-container">
      {/* Toast Notification */}
      {showNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-gris-azulado text-white px-4 py-3 rounded shadow-lg flex items-center gap-2 border border-crema/30 text-xs animate-bounce" id="toast-notification">
          <Check className="w-4 h-4 text-[#F4A700]" />
          <span>{showNotification}</span>
        </div>
      )}

      {/* Header */}
      <div className="mb-8" id="mantenedores-header">
        <h2 className="text-xl md:text-2xl font-extrabold text-gris-azulado tracking-tight m-0 normal-case mb-1 font-display">
          Mantenedores del Sistema
        </h2>
        <p className="text-xs text-secundario font-sans">
          Administración centralizada de catálogos maestros, estándares de ciberseguridad industrial y reglas del motor de auditoría.
        </p>
      </div>

      {/* Tabs Layout */}
      <div className="flex border-b border-crema/30 mb-6 gap-2" id="mantenedores-tabs">
        <button
          onClick={() => setActiveTab('estandares')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider font-display border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'estandares'
              ? 'border-cobre text-cobre bg-surface-container-low/40'
              : 'border-transparent text-secundario hover:text-cobre hover:bg-gray-50'
          }`}
        >
          <Shield className="w-4 h-4" />
          Estándares Ciberseguridad
        </button>
        <button
          onClick={() => setActiveTab('sla')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider font-display border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'sla'
              ? 'border-cobre text-cobre bg-surface-container-low/40'
              : 'border-transparent text-secundario hover:text-cobre hover:bg-gray-50'
          }`}
        >
          <Clock className="w-4 h-4" />
          Niveles de SLA
        </button>
        <button
          onClick={() => setActiveTab('sellos')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider font-display border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'sellos'
              ? 'border-cobre text-cobre bg-surface-container-low/40'
              : 'border-transparent text-secundario hover:text-cobre hover:bg-gray-50'
          }`}
        >
          <Award className="w-4 h-4" />
          Umbrales de Sello
        </button>
      </div>

      {/* Tab Content - Standards */}
      {activeTab === 'estandares' && (
        <div className="bg-white border border-crema/20 rounded-md p-6" id="estandares-tab-content">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-gris-azulado uppercase font-display">Estándares y Marcos de Referencia</h3>
            <button 
              onClick={() => triggerToast('Funcionalidad para añadir nuevo estándar (Simulación)')}
              className="px-3 py-1.5 bg-cobre text-white text-xs font-bold rounded-sm uppercase tracking-wider hover:bg-cobre-oscuro transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Nuevo Estándar
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-crema/30 bg-gray-50 text-gris-azulado font-bold uppercase">
                  <th className="p-3">Código</th>
                  <th className="p-3">Nombre del Estándar</th>
                  <th className="p-3">Categoría</th>
                  <th className="p-3 text-center">N° Controles</th>
                  <th className="p-3 text-center">Estado</th>
                  <th className="p-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {standards.map(standard => (
                  <tr key={standard.id} className="hover:bg-surface-custom/20 transition-colors">
                    {editingStandard === standard.id ? (
                      <>
                        <td className="p-3 font-semibold">
                          <input
                            type="text"
                            value={editStandardForm.code || ''}
                            onChange={e => setEditStandardForm({ ...editStandardForm, code: e.target.value })}
                            className="border border-crema/40 bg-white px-2 py-1 rounded text-xs font-mono w-24 focus:outline-none focus:border-cobre"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="text"
                            value={editStandardForm.name || ''}
                            onChange={e => setEditStandardForm({ ...editStandardForm, name: e.target.value })}
                            className="border border-crema/40 bg-white px-2 py-1 rounded text-xs w-full focus:outline-none focus:border-cobre"
                          />
                        </td>
                        <td className="p-3">
                          <select
                            value={editStandardForm.category || 'OT'}
                            onChange={e => setEditStandardForm({ ...editStandardForm, category: e.target.value as any })}
                            className="border border-crema/40 bg-white px-1.5 py-1 rounded text-xs focus:outline-none focus:border-cobre"
                          >
                            <option value="OT">OT (Operacional)</option>
                            <option value="IT">IT (Sistemas)</option>
                            <option value="MIXTO">MIXTO</option>
                          </select>
                        </td>
                        <td className="p-3 text-center font-semibold">
                          <input
                            type="number"
                            value={editStandardForm.controlsCount || 0}
                            onChange={e => setEditStandardForm({ ...editStandardForm, controlsCount: parseInt(e.target.value) || 0 })}
                            className="border border-crema/40 bg-white px-2 py-1 rounded text-xs w-16 text-center focus:outline-none focus:border-cobre"
                          />
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full font-semibold text-[10px] uppercase ${standard.status === 'Activo' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                            {standard.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button onClick={handleSaveStandard} className="p-1 hover:bg-emerald-50 text-emerald-600 rounded" title="Guardar cambios">
                              <Check className="w-4 h-4" />
                            </button>
                            <button onClick={() => setEditingStandard(null)} className="p-1 hover:bg-rose-50 text-rose-600 rounded" title="Cancelar">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="p-3 font-mono font-bold text-cobre">{standard.code}</td>
                        <td className="p-3 text-gris-azulado font-medium">{standard.name}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-sm font-bold text-[10px] ${
                            standard.category === 'OT' ? 'bg-orange-50 text-orange-700' : standard.category === 'IT' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
                          }`}>
                            {standard.category}
                          </span>
                        </td>
                        <td className="p-3 text-center font-semibold text-gris-azulado">{standard.controlsCount} controles</td>
                        <td className="p-3 text-center">
                          <button 
                            onClick={() => handleToggleStatus(standard.id)}
                            className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase transition-all border cursor-pointer ${
                              standard.status === 'Activo'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100'
                            }`}
                          >
                            {standard.status}
                          </button>
                        </td>
                        <td className="p-3 text-right">
                          <button 
                            onClick={() => handleStartEditStandard(standard)}
                            className="p-1 hover:bg-gray-100 text-secundario hover:text-cobre rounded"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content - SLA Config */}
      {activeTab === 'sla' && (
        <div className="bg-white border border-crema/20 rounded-md p-6" id="sla-tab-content">
          <div className="mb-6">
            <h3 className="text-sm font-bold text-gris-azulado uppercase font-display mb-1">Tiempos de Resolución y SLA</h3>
            <p className="text-xs text-secundario font-sans">
              Plazos en días hábiles otorgados a los jefes de proyecto para mitigar y enviar evidencias de resolución para los hallazgos según su nivel de criticidad.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {slas.map(sla => (
              <div key={sla.id} className="border border-crema/20 rounded-md p-5 bg-surface-custom/10 hover:border-cobre/20 transition-all flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded-sm font-bold text-[10px] tracking-wider ${
                      sla.criticidad === 'CRÍTICA' ? 'bg-rose-100 text-rose-800' :
                      sla.criticidad === 'ALTA' ? 'bg-orange-100 text-orange-800' :
                      sla.criticidad === 'MEDIA' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {sla.criticidad}
                    </span>
                    <span className="text-[11px] font-bold text-gris-azulado/40">SLA OFICIAL</span>
                  </div>
                  <p className="text-xs text-gris-azulado font-semibold mb-2">{sla.description}</p>
                  
                  {editingSla === sla.id ? (
                    <div className="flex items-center gap-2 mt-3">
                      <label className="text-[11px] font-bold text-secundario font-sans">Plazo (Días):</label>
                      <input
                        type="number"
                        value={editSlaDays}
                        onChange={e => setEditSlaDays(parseInt(e.target.value) || 0)}
                        className="border border-crema/40 bg-white px-2 py-1 rounded text-xs font-semibold w-16 text-center focus:outline-none focus:border-cobre"
                      />
                      <button onClick={() => handleSaveSla(sla.id)} className="px-2 py-1 bg-emerald-600 text-white rounded text-xs font-bold hover:bg-emerald-700">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setEditingSla(null)} className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs font-bold hover:bg-gray-300">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-lg font-extrabold text-cobre mt-2 font-display">
                      {sla.days} Días Hábiles
                    </div>
                  )}
                </div>

                {editingSla !== sla.id && (
                  <button 
                    onClick={() => handleStartEditSla(sla)}
                    className="p-1.5 hover:bg-white rounded border border-crema/10 text-secundario hover:text-cobre shadow-sm transition-all"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content - Seal Thresholds */}
      {activeTab === 'sellos' && (
        <div className="bg-white border border-crema/20 rounded-md p-6" id="sellos-tab-content">
          <div className="mb-6">
            <h3 className="text-sm font-bold text-gris-azulado uppercase font-display mb-1">Umbrales de Calificación Sello</h3>
            <p className="text-xs text-secundario font-sans">
              Definición de rangos de puntaje (porcentaje de cumplimiento de controles) requeridos para otorgar cada tipo de sello de ciberseguridad corporativo.
            </p>
          </div>

          <div className="space-y-4">
            {seals.map(seal => (
              <div key={seal.id} className="border border-crema/20 rounded-md p-5 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-cobre/20 transition-all">
                <div className="flex items-center gap-4">
                  <div className={`px-4 py-2 rounded border font-bold text-sm tracking-wider uppercase ${seal.color}`}>
                    Sello {seal.seal}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gris-azulado uppercase font-display">Estado de Cumplimiento</h4>
                    <p className="text-xs text-secundario font-sans">
                      {seal.seal === 'Verde' ? 'Aprobación plena de controles OT/IT.' : 
                       seal.seal === 'Amarillo' ? 'Aprobación condicionada con brechas menores.' : 
                       'Rechazado. Requiere remediación inmediata para operar.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {editingSeal === seal.id ? (
                    <div className="flex items-center gap-2">
                      <label className="text-[11px] font-bold text-secundario">Min:</label>
                      <input
                        type="number"
                        value={editSealMin}
                        onChange={e => setEditSealMin(parseInt(e.target.value) || 0)}
                        className="border border-crema/40 bg-white px-2 py-1 rounded text-xs font-semibold w-16 text-center focus:outline-none focus:border-cobre"
                      />
                      <span className="text-xs text-gray-400">- {seal.maxScore}%</span>
                      <button onClick={() => handleSaveSeal(seal.id)} className="px-2 py-1 bg-emerald-600 text-white rounded text-xs font-bold hover:bg-emerald-700">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setEditingSeal(null)} className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs font-bold hover:bg-gray-300">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="text-right">
                        <span className="text-[10px] text-secundario block font-bold uppercase">Rango Requerido</span>
                        <span className={`text-sm font-extrabold font-display ${seal.textColor}`}>
                          {seal.minScore}% - {seal.maxScore}%
                        </span>
                      </div>
                      <button 
                        onClick={() => handleStartEditSeal(seal)}
                        className="p-1.5 hover:bg-gray-50 rounded border border-crema/10 text-secundario hover:text-cobre shadow-sm transition-all"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
