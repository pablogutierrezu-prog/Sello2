import {
  Home,
  ClipboardList,
  BarChart3,
  AlertTriangle,
  Gavel,
  Wrench,
  Settings,
  Database
} from 'lucide-react';
import { UserRole } from '../types';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  currentRole: UserRole;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  hideOnDesktop?: boolean;
}

export default function Sidebar({
  currentView,
  onViewChange,
  currentRole,
  isMobileOpen = false,
  onCloseMobile,
  hideOnDesktop = false
}: SidebarProps) {
  // Navigation items definition
  const navItems = [
    { id: 'inicio', label: 'Inicio', icon: Home, roles: ['JP', 'RESP_GESTION', 'RESP_ARQUITECTO_SEG', 'GERENTE_APROBADORA', 'RESP_PRESUPUESTO_EY', 'RESP_EVAL_TECNICA_EY', 'ADMIN', 'RESP_EVAL_DOC_EY', 'RESP_CIBER_HALLAZGOS'] },
    { id: 'formularios', label: 'Procesos de Implementación y Operación', icon: ClipboardList, roles: ['JP', 'RESP_GESTION', 'RESP_ARQUITECTO_SEG', 'GERENTE_APROBADORA', 'RESP_PRESUPUESTO_EY', 'RESP_EVAL_TECNICA_EY', 'ADMIN', 'RESP_EVAL_DOC_EY'] },
    { id: 'dashboard', label: 'Reportería', icon: BarChart3, roles: ['JP', 'RESP_GESTION', 'RESP_ARQUITECTO_SEG', 'GERENTE_APROBADORA', 'RESP_PRESUPUESTO_EY', 'RESP_EVAL_TECNICA_EY', 'ADMIN', 'RESP_EVAL_DOC_EY', 'RESP_CIBER_HALLAZGOS'] },
    { id: 'hallazgos', label: 'Gestión Hallazgos', icon: AlertTriangle, roles: ['JP', 'RESP_CIBER_HALLAZGOS', 'ADMIN'] },
    { id: 'licitaciones', label: 'Procesos de Licitación', icon: Gavel, roles: ['JP', 'RESP_GESTION', 'GERENTE_APROBADORA', 'RESP_PRESUPUESTO_EY', 'RESP_EVAL_DOC_EY', 'ADMIN'] },
    { id: 'mantenedores', label: 'Mantenedores', icon: Wrench, roles: ['ADMIN', 'RESP_CIBER_HALLAZGOS', 'RESP_GESTION'] },
    { id: 'configuracion', label: 'Configuración', icon: Settings, roles: ['ADMIN', 'JP', 'RESP_GESTION'] }
  ];

  // Filter items based on role
  const visibleItems = navItems.filter((item) => item.roles.includes(currentRole));

  return (
    <>
      {/* Mobile background overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-30 md:hidden transition-opacity" 
          onClick={onCloseMobile}
          id="sidebar-overlay"
        />
      )}

      <aside 
        className={`
          fixed top-16 left-0 w-64 bg-white border-r border-crema/30 flex flex-col justify-between shadow-lg shrink-0 z-40 transition-transform duration-300 ease-in-out h-[calc(100vh-4rem)]
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          ${hideOnDesktop ? 'md:hidden' : 'md:relative md:top-0 md:shadow-none md:z-20 md:translate-x-0 md:flex'}
        `}
        id="app-sidebar"
      >
        {/* Navigation Links */}
        <div className="py-6">
          <div className="px-6 mb-6">
            <p className="text-[10px] font-bold text-gris-azulado/40 tracking-widest uppercase font-sans">
              Módulos del Sistema
            </p>
          </div>
          <nav className="space-y-1">
            {visibleItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onViewChange(item.id);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={`w-full flex items-center text-left px-6 py-3.5 text-xs font-semibold uppercase tracking-wider font-display border-l-4 transition-all duration-250 focus:outline-none cursor-pointer group ${
                    isActive
                      ? 'border-cobre text-cobre bg-surface-container-custom/50 font-extrabold shadow-sm'
                      : 'border-transparent text-gris-azulado/85 hover:text-cobre hover:bg-surface-custom/60 hover:border-l-cobre/30'
                  }`}
                >
                  <Icon
                    className={`mr-3.5 h-5 w-5 shrink-0 transition-all duration-300 ${
                      isActive 
                        ? 'text-cobre scale-110 drop-shadow-[0_2px_4px_rgba(187,87,38,0.2)]' 
                        : 'text-gris-azulado/60 group-hover:scale-110 group-hover:text-cobre'
                    }`}
                  />
                  <div className="flex-1 flex items-center justify-between min-w-0">
                    <span className={`truncate transition-colors ${isActive ? 'font-extrabold' : 'group-hover:translate-x-1 duration-200'}`}>
                      {item.label}
                    </span>
                    {item.id === 'formularios' && (
                      <span className="ml-2 shrink-0 px-2 py-0.5 text-[8px] font-extrabold bg-cobre text-white rounded-xs uppercase tracking-widest animate-pulse shadow-xs">
                        ACTIVO
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

      {/* Bottom Information / Meta Context */}
      <div className="p-4 bg-surface-custom/30 border-t border-crema/20">
        <div className="flex items-center space-x-2 text-gris-azulado/60 text-[11px] font-sans mb-2">
          <Database className="w-3.5 h-3.5 text-cobre" />
          <span className="font-semibold">Plataforma Simulada</span>
        </div>
        <p className="text-[10px] text-gris-azulado/60 leading-normal font-sans">
          Simulación de arquitectura <strong>SharePoint + Power Apps</strong>. Permisos de RLS aplicados según rol de Entra ID.
        </p>

        <div className="mt-3 pt-3 border-t border-crema/20 flex justify-between items-center text-[9px] text-gris-azulado/40 uppercase font-bold tracking-wider font-sans">
          <span>Versión 2.0</span>
          <span className="text-verde-petroleo flex items-center">
            <span className="w-1.5 h-1.5 bg-verde-petroleo rounded-full mr-1 inline-block animate-pulse"></span>
            Online
          </span>
        </div>
      </div>
    </aside>
    </>
  );
}
