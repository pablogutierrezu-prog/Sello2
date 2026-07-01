import React, { useState } from 'react';
import { Settings, Share2, Mail, Users, Save, Check, RefreshCw, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function ConfiguracionView() {
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Form states
  const [sharepointUrl, setSharepointUrl] = useState('https://codelco.sharepoint.com/sites/sello-ciberseguridad');
  const [dacListName, setDacListName] = useState('Sello_DAC_Proyectos');
  const [evidenceLibrary, setEvidenceLibrary] = useState('Documentos_Evidencias_Hallazgos');
  
  const [notifyJpNew, setNotifyJpNew] = useState(true);
  const [notifyJpSla, setNotifyJpSla] = useState(true);
  const [notifyRevisorAssigned, setNotifyRevisorAssigned] = useState(true);
  const [notifySlaOverdue, setNotifySlaOverdue] = useState(true);

  const [entraIdSync, setEntraIdSync] = useState(true);
  const [rlsGroupPrefix, setRlsGroupPrefix] = useState('SG_CODELCO_CYBER_ROLE_');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 3000);
  };

  const handleSyncNow = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setShowSavedToast(true);
    }, 1500);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto overflow-y-auto h-[calc(100vh-4rem)] bg-gray-50/50" id="configuracion-container">
      {/* Saved Toast */}
      {showSavedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gris-azulado text-white px-4 py-3 rounded shadow-lg flex items-center gap-2 border border-crema/30 text-xs animate-bounce" id="config-saved-toast">
          <Check className="w-4 h-4 text-[#F4A700]" />
          <span>Configuraciones guardadas y sincronizadas con SharePoint</span>
        </div>
      )}

      {/* Header */}
      <div className="mb-8" id="configuracion-header">
        <h2 className="text-xl md:text-2xl font-extrabold text-gris-azulado tracking-tight m-0 normal-case mb-1 font-display">
          Configuración de la Plataforma
        </h2>
        <p className="text-xs text-secundario font-sans">
          Parametrización de conectores externos, flujos de Power Automate y políticas de seguridad para el Sello de Ciberseguridad.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* SharePoint integration panel */}
        <div className="bg-white border border-crema/20 rounded-md p-6">
          <h3 className="text-xs font-bold text-gris-azulado uppercase font-display flex items-center gap-2 mb-4">
            <Share2 className="w-4 h-4 text-cobre" />
            Integración de Datos (Conector SharePoint)
          </h3>
          <p className="text-xs text-secundario font-sans mb-4">
            Los datos de solicitudes y hallazgos se almacenan en SharePoint Lists corporativos. Configure las conexiones correspondientes:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-gris-azulado uppercase mb-1.5 font-display">
                URL del Sitio SharePoint
              </label>
              <input
                type="text"
                value={sharepointUrl}
                onChange={(e) => setSharepointUrl(e.target.value)}
                className="w-full text-xs border border-crema/40 bg-white p-2.5 rounded-sm focus:outline-none focus:border-cobre font-sans"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gris-azulado uppercase mb-1.5 font-display">
                Nombre de Lista de Proyectos (DAC)
              </label>
              <input
                type="text"
                value={dacListName}
                onChange={(e) => setDacListName(e.target.value)}
                className="w-full text-xs border border-crema/40 bg-white p-2.5 rounded-sm focus:outline-none focus:border-cobre font-sans"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold text-gris-azulado uppercase mb-1.5 font-display">
                Biblioteca de Evidencias y Documentación
              </label>
              <input
                type="text"
                value={evidenceLibrary}
                onChange={(e) => setEvidenceLibrary(e.target.value)}
                className="w-full text-xs border border-crema/40 bg-white p-2.5 rounded-sm focus:outline-none focus:border-cobre font-sans"
              />
            </div>
          </div>

          <div className="mt-5 p-3.5 bg-surface-container-low/50 rounded border border-crema/20 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-cobre shrink-0 mt-0.5" />
            <div className="text-[11px] text-secundario font-sans leading-relaxed">
              <span className="font-bold text-gris-azulado">Nota de Sincronización:</span> Las credenciales de acceso se autentican de manera transparente utilizando la identidad federada de Microsoft Entra ID en la sesión del usuario.
            </div>
          </div>
        </div>

        {/* Notifications and Power Automate flow controls */}
        <div className="bg-white border border-crema/20 rounded-md p-6">
          <h3 className="text-xs font-bold text-gris-azulado uppercase font-display flex items-center gap-2 mb-4">
            <Mail className="w-4 h-4 text-cobre" />
            Notificaciones y Flujos Automatizados (Power Automate)
          </h3>
          <p className="text-xs text-secundario font-sans mb-4">
            Defina los eventos de sistema que gatillarán envíos automáticos de notificaciones por correo electrónico a través de Outlook 365:
          </p>

          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer p-1.5 hover:bg-surface-custom/30 rounded transition-colors">
              <input
                type="checkbox"
                checked={notifyJpNew}
                onChange={(e) => setNotifyJpNew(e.target.checked)}
                className="mt-1 accent-cobre rounded focus:ring-cobre"
              />
              <div>
                <span className="text-xs font-bold text-gris-azulado font-sans">Notificación de Inicio de Formulario</span>
                <p className="text-[11px] text-secundario">Envía correo al Jefe de Proyecto cuando se inicia un nuevo formulario DAC con su enlace directo de SharePoint.</p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer p-1.5 hover:bg-surface-custom/30 rounded transition-colors">
              <input
                type="checkbox"
                checked={notifyJpSla}
                onChange={(e) => setNotifyJpSla(e.target.checked)}
                className="mt-1 accent-cobre rounded focus:ring-cobre"
              />
              <div>
                <span className="text-xs font-bold text-gris-azulado font-sans">Alerta Próxima a Vencer (SLA)</span>
                <p className="text-[11px] text-secundario">Notifica por correo al responsable del hallazgo 48 horas antes de expirar el plazo oficial definido por SLA.</p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer p-1.5 hover:bg-surface-custom/30 rounded transition-colors">
              <input
                type="checkbox"
                checked={notifyRevisorAssigned}
                onChange={(e) => setNotifyRevisorAssigned(e.target.checked)}
                className="mt-1 accent-cobre rounded focus:ring-cobre"
              />
              <div>
                <span className="text-xs font-bold text-gris-azulado font-sans">Asignación de Revisor</span>
                <p className="text-[11px] text-secundario">Gatilla correo de alerta al Revisor de Ciberseguridad de Codelco cuando se le asigna un proyecto para evaluación documental.</p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer p-1.5 hover:bg-surface-custom/30 rounded transition-colors">
              <input
                type="checkbox"
                checked={notifySlaOverdue}
                onChange={(e) => setNotifySlaOverdue(e.target.checked)}
                className="mt-1 accent-cobre rounded focus:ring-cobre"
              />
              <div>
                <span className="text-xs font-bold text-gris-azulado font-sans">SLA Escalar Vencidos</span>
                <p className="text-[11px] text-secundario">Escala un reporte semanal automatizado a la Gerencia de Ciberseguridad sobre hallazgos con plazos fuera de SLA.</p>
              </div>
            </label>
          </div>
        </div>

        {/* Security and Roles mapping */}
        <div className="bg-white border border-crema/20 rounded-md p-6">
          <h3 className="text-xs font-bold text-gris-azulado uppercase font-display flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-cobre" />
            Federación de Identidades y Permisos RLS
          </h3>
          <p className="text-xs text-secundario font-sans mb-4">
            Mapeo de los roles de la aplicación con grupos de seguridad de Microsoft Entra ID (Azure AD) para la aplicación de Row-Level Security (RLS):
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center gap-3 cursor-pointer p-1.5 hover:bg-surface-custom/30 rounded">
              <input
                type="checkbox"
                checked={entraIdSync}
                onChange={(e) => setEntraIdSync(e.target.checked)}
                className="accent-cobre rounded"
              />
              <span className="text-xs font-bold text-gris-azulado">Sincronización en Tiempo Real con Entra ID</span>
            </label>

            <div>
              <label className="block text-[11px] font-bold text-gris-azulado uppercase mb-1 font-display">
                Prefijo del Grupo de Seguridad
              </label>
              <input
                type="text"
                value={rlsGroupPrefix}
                onChange={(e) => setRlsGroupPrefix(e.target.value)}
                className="w-full text-xs border border-crema/40 bg-white px-2 py-1.5 rounded-sm focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-crema/10 pt-4">
            <button
              type="button"
              onClick={handleSyncNow}
              disabled={isSyncing}
              className="px-4 py-2 border border-crema/30 text-secundario text-xs font-bold rounded-sm uppercase tracking-wider hover:bg-gray-50 hover:text-cobre transition-colors flex items-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-cobre' : ''}`} />
              {isSyncing ? 'Sincronizando...' : 'Probar Conector Ahora'}
            </button>

            <button
              type="submit"
              className="px-5 py-2 bg-cobre text-white text-xs font-bold rounded-sm uppercase tracking-wider hover:bg-cobre-oscuro transition-colors flex items-center gap-2 shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              Guardar Configuración
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
