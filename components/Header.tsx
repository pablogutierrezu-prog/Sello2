import { useState } from 'react';
import { UserRole } from '../types';
import { Bell, CheckCircle2, AlertCircle, Info, X, Menu } from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  notifications: { id: string; text: string; time: string; type: 'urgent' | 'info' | 'success' }[];
  onClearNotification: (id: string) => void;
  isMobileSidebarOpen?: boolean;
  onToggleMobileSidebar?: () => void;
}

export default function Header({
  currentRole,
  onRoleChange,
  notifications,
  onClearNotification,
  isMobileSidebarOpen = false,
  onToggleMobileSidebar
}: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);

  // Role labels
  const roleLabels: Record<UserRole, { label: string; bg: string; text: string }> = {
    JP: { label: 'Jefe de Proyecto', bg: 'bg-cobre/10', text: 'text-cobre' },
    RESP_GESTION: { label: 'Responsable Gestión Evaluación', bg: 'bg-verde-petroleo/10', text: 'text-verde-petroleo' },
    RESP_ARQUITECTO_SEG: { label: 'Responsable de Revisión Arquitectura de Seguridad', bg: 'bg-azul/10', text: 'text-azul' },
    GERENTE_APROBADORA: { label: 'Gerente Aprobadora', bg: 'bg-cobre/10', text: 'text-cobre' },
    RESP_PRESUPUESTO_EY: { label: 'Responsable de presupuesto', bg: 'bg-secundario/10', text: 'text-secundario' },
    RESP_EVAL_TECNICA_EY: { label: 'Responsable de evaluación Técnica', bg: 'bg-secundario/10', text: 'text-secundario' },
    ADMIN: { label: 'Administrador o mantenedor funcional del sistema', bg: 'bg-gris-azulado/10', text: 'text-gris-azulado' },
    RESP_EVAL_DOC_EY: { label: 'Responsable de evaluación documental', bg: 'bg-secundario/10', text: 'text-secundario' },
    RESP_CIBER_HALLAZGOS: { label: 'Responsable de Ciberseguridad de Hallazgos', bg: 'bg-verde-petroleo/10', text: 'text-verde-petroleo' }
  };

  const currentRoleDetails = roleLabels[currentRole];

  const getUserName = (role: UserRole) => {
    switch (role) {
      case 'JP': return 'Juan Pérez';
      case 'RESP_GESTION': return 'Rodrigo Castro';
      case 'RESP_ARQUITECTO_SEG': return 'Ana Sánchez';
      case 'GERENTE_APROBADORA': return 'Patricia Muñoz';
      case 'RESP_PRESUPUESTO_EY': return 'Carlos Delgado';
      case 'RESP_EVAL_TECNICA_EY': return 'Felipe Torres';
      case 'ADMIN': return 'Administrador';
      case 'RESP_EVAL_DOC_EY': return 'Marta Riquelme';
      case 'RESP_CIBER_HALLAZGOS': return 'Cristian Olmos';
      default: return 'Usuario';
    }
  };

  const getInitials = (role: UserRole) => {
    switch (role) {
      case 'JP': return 'JP';
      case 'RESP_GESTION': return 'RC';
      case 'RESP_ARQUITECTO_SEG': return 'AS';
      case 'GERENTE_APROBADORA': return 'PM';
      case 'RESP_PRESUPUESTO_EY': return 'CD';
      case 'RESP_EVAL_TECNICA_EY': return 'FT';
      case 'ADMIN': return 'AG';
      case 'RESP_EVAL_DOC_EY': return 'MR';
      case 'RESP_CIBER_HALLAZGOS': return 'CO';
      default: return 'U';
    }
  };

  return (
    <header className="bg-cobre text-white h-16 px-3 sm:px-4 md:px-8 flex items-center justify-between shadow-md relative z-30" id="app-header">
      {/* Brand & Logo */}
      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1 sm:flex-initial">
        {/* Mobile menu trigger */}
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-1.5 hover:bg-white/10 rounded-md transition-colors mr-1 focus:outline-none flex items-center justify-center cursor-pointer shrink-0"
            aria-label="Menu principal"
            id="mobile-menu-trigger-btn"
          >
            {isMobileSidebarOpen ? (
              <X className="w-5 h-5 text-white" />
            ) : (
              <Menu className="w-5 h-5 text-white" />
            )}
          </button>
        )}

        {/* Official Codelco Logo */}
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDeaNYidEquRZ3-kwXrDMn5s1QvYViORlE2zniRky1L0jkjShTkSBqkl13_a1stdP-WD_zhNfM5w0wX_9ufly4OMapDgNl_sGTtEloPXOgsh8R-QdGrWKb6RNJMC0i6AIe30Rk8PaWloaZfZrr1NV21XAR_GhGs34hX7qZrOVCChYWYRpM3TDArdfuv0x05XrxD3NE-sVzxIfOhlLaJ0LC92GjFJsQ7OTnf17MCnlqjtrw8LXw6vTPGtzMKZKX6CPUz7DzFh3RHJcvH"
          alt="CODELCO Logo"
          className="h-8 sm:h-10 w-auto object-contain shrink-0"
          referrerPolicy="no-referrer"
        />
        {/* On mobile, show stacked title next to logo, hidden on md/lg since we center it */}
        <div className="md:hidden flex flex-col justify-center min-w-0 shrink-0">
          <h1 className="text-[10px] sm:text-xs font-bold tracking-wider font-display m-0 leading-none uppercase truncate">
            SGHC
          </h1>
          <h1 className="text-[10px] sm:text-xs font-bold tracking-wider font-display m-0 leading-tight uppercase truncate text-crema">
            Codelco
          </h1>
        </div>
      </div>

      {/* Centered Title (matches screenshot layout) */}
      <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 text-center pointer-events-none">
        <h1 className="text-base lg:text-lg font-bold text-white select-none !normal-case tracking-wide">
          Sistema de Evaluación y Gestión de Hallazgos en Ciberseguridad
        </h1>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-2 sm:space-x-4 shrink-0">
        {/* User Info / Integrated Dropdown Role Switcher (matching screenshot) */}
        <div className="flex items-center space-x-1.5 sm:space-x-3" id="user-info-control">
          {/* Active Role Text Selector */}
          <div className="hidden sm:flex flex-col items-end text-right">
            <div className="relative flex items-center">
              <select
                value={currentRole}
                onChange={(e) => onRoleChange(e.target.value as UserRole)}
                className="bg-transparent text-white text-xs font-bold uppercase tracking-widest border-none focus:outline-none focus:ring-0 p-0 pr-4 cursor-pointer hover:opacity-85 transition-opacity font-display appearance-none text-right max-w-[160px] md:max-w-[220px] lg:max-w-[280px] truncate"
                id="role-switcher-integrated"
                title="Cambiar rol de usuario"
              >
                <option value="JP" className="text-gray-900 bg-white font-sans uppercase text-xs">Jefe de Proyecto</option>
                <option value="RESP_GESTION" className="text-gray-900 bg-white font-sans uppercase text-xs">Responsable Gestión Evaluación</option>
                <option value="RESP_ARQUITECTO_SEG" className="text-gray-900 bg-white font-sans uppercase text-xs">Responsable de Revisión Arquitectura de Seguridad</option>
                <option value="GERENTE_APROBADORA" className="text-gray-900 bg-white font-sans uppercase text-xs">Gerente Aprobadora</option>
                <option value="RESP_PRESUPUESTO_EY" className="text-gray-900 bg-white font-sans uppercase text-xs">Responsable de presupuesto</option>
                <option value="RESP_EVAL_TECNICA_EY" className="text-gray-900 bg-white font-sans uppercase text-xs">Responsable de evaluación Técnica</option>
                <option value="ADMIN" className="text-gray-900 bg-white font-sans uppercase text-xs">Administrador o mantenedor funcional del sistema</option>
                <option value="RESP_EVAL_DOC_EY" className="text-gray-900 bg-white font-sans uppercase text-xs">Responsable de evaluación documental</option>
                <option value="RESP_CIBER_HALLAZGOS" className="text-gray-900 bg-white font-sans uppercase text-xs">Responsable de Ciberseguridad de Hallazgos</option>
              </select>
              <span className="absolute right-0 top-1/2 -translate-y-1/2 text-[10px] text-white/50 pointer-events-none select-none">▼</span>
            </div>
            
            {/* User name display corresponding to role */}
            <span className="text-[9px] text-white/70 block font-sans tracking-wide uppercase mt-0.5">
              {getUserName(currentRole)}
            </span>
          </div>

          {/* Interactive switcher on mobile screens */}
          <div className="sm:hidden relative shrink-0 bg-white/10 hover:bg-white/15 px-2 py-1 rounded border border-white/20 flex items-center space-x-1">
            <span className="text-[10px] font-bold text-white uppercase select-none">
              {currentRole === 'RESP_ARQUITECTO_SEG' ? 'ARQ' : 
               currentRole === 'RESP_GESTION' ? 'GEST' : 
               currentRole === 'GERENTE_APROBADORA' ? 'GER' : 
               currentRole === 'RESP_PRESUPUESTO_EY' ? 'PRES' : 
               currentRole === 'RESP_EVAL_TECNICA_EY' ? 'TECN' : 
               currentRole === 'ADMIN' ? 'ADM' : 
               currentRole === 'RESP_EVAL_DOC_EY' ? 'DOC' : 
               currentRole === 'RESP_CIBER_HALLAZGOS' ? 'HALL' : 'JP'}
            </span>
            <span className="text-[8px] text-white/70 select-none">▼</span>
            <select
              value={currentRole}
              onChange={(e) => onRoleChange(e.target.value as UserRole)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              title="Cambiar rol"
            >
              <option value="JP" className="text-gray-900 bg-white font-sans uppercase text-xs">Jefe de Proyecto</option>
              <option value="RESP_GESTION" className="text-gray-900 bg-white font-sans uppercase text-xs">Responsable Gestión Evaluación</option>
              <option value="RESP_ARQUITECTO_SEG" className="text-gray-900 bg-white font-sans uppercase text-xs">Responsable de Revisión Arquitectura de Seguridad</option>
              <option value="GERENTE_APROBADORA" className="text-gray-900 bg-white font-sans uppercase text-xs">Gerente Aprobadora</option>
              <option value="RESP_PRESUPUESTO_EY" className="text-gray-900 bg-white font-sans uppercase text-xs">Responsable de presupuesto</option>
              <option value="RESP_EVAL_TECNICA_EY" className="text-gray-900 bg-white font-sans uppercase text-xs">Responsable de evaluación Técnica</option>
              <option value="ADMIN" className="text-gray-900 bg-white font-sans uppercase text-xs">Administrador o mantenedor funcional del sistema</option>
              <option value="RESP_EVAL_DOC_EY" className="text-gray-900 bg-white font-sans uppercase text-xs">Responsable de evaluación documental</option>
              <option value="RESP_CIBER_HALLAZGOS" className="text-gray-900 bg-white font-sans uppercase text-xs">Responsable de Ciberseguridad de Hallazgos</option>
            </select>
          </div>

          {/* User Initials Rounded Box (matching "AG" style precisely) */}
          <div className="h-8 w-8 sm:h-10 sm:px-3.5 border border-white/30 rounded-lg sm:rounded-xl bg-white/10 text-white font-bold flex items-center justify-center text-xs sm:text-base shadow-sm font-display select-none shrink-0">
            {getInitials(currentRole)}
          </div>
        </div>

        {/* Notifications Icon with Badge */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-1.5 hover:bg-white/10 rounded-full transition-colors relative flex items-center justify-center focus:outline-none"
            id="notifications-toggle"
            aria-label="Ver notificaciones"
          >
            <Bell className="text-white w-5 h-5" />
            {notifications.length > 0 && (
              <span className="absolute -top-0.5 -right-1 w-4 h-4 bg-granate text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-cobre shadow-sm animate-pulse">
                {notifications.length}
              </span>
            )}
          </button>

          {/* Notifications Panel */}
          {showNotifications && (
            <div
              className="absolute right-0 mt-3 w-80 bg-white text-gris-azulado rounded-sm shadow-xl border border-crema/20 overflow-hidden z-50 text-xs"
              id="notifications-panel"
            >
              <div className="bg-surface-container-custom px-4 py-3 border-b border-crema/30 flex justify-between items-center">
                <span className="font-display font-bold uppercase text-cobre text-xs tracking-wider flex items-center gap-1.5">
                  <Bell className="w-4 h-4 text-cobre shrink-0" />
                  Notificaciones del Sistema
                </span>
                <span className="text-[10px] font-semibold text-gris-azulado/60">
                  {notifications.length} Activas
                </span>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-gray-400 font-sans">
                    <CheckCircle2 className="w-8 h-8 mb-2 mx-auto text-verde-petroleo/60" />
                    No tienes notificaciones pendientes
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div key={notif.id} className="p-3 hover:bg-surface-custom/50 flex gap-2.5 transition-colors">
                      <div className="mt-0.5 shrink-0">
                        {notif.type === 'urgent' && (
                          <AlertCircle className="text-granate w-5 h-5" />
                        )}
                        {notif.type === 'success' && (
                          <CheckCircle2 className="text-verde-petroleo w-5 h-5" />
                        )}
                        {notif.type === 'info' && (
                          <Info className="text-azul w-5 h-5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-sans text-gray-800 leading-snug">{notif.text}</p>
                        <span className="text-[10px] text-gray-400 block mt-1">{notif.time}</span>
                      </div>
                      <button
                        onClick={() => onClearNotification(notif.id)}
                        className="text-gray-400 hover:text-gray-600 focus:outline-none shrink-0"
                        title="Descartar"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="bg-gray-50 px-4 py-2 border-t border-gray-100 text-center">
                <span className="text-[10px] text-cobre uppercase font-bold tracking-wider">
                  Sincronizado con Power Automate
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
