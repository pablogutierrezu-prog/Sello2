import React from 'react';
import { Sliders, Gavel, AlertCircle, BarChart3, Wrench, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

interface InicioViewProps {
  onNavigate: (view: string) => void;
}

export default function InicioView({ onNavigate }: InicioViewProps) {
  const cards = [
    {
      id: 'formularios',
      title: 'Procesos de Implementación y Operación',
      description: 'Gestione los estándares técnicos y controles operativos de ciberseguridad en entornos industriales de forma centralizada.',
      icon: Sliders,
      isNew: false,
    },
    {
      id: 'licitaciones',
      title: 'Procesos de Licitación',
      description: 'Revisión y validación de cláusulas de seguridad para nuevos proveedores y contratos estratégicos de la corporación.',
      icon: Gavel,
      isNew: false,
    },
    {
      id: 'hallazgos',
      title: 'Gestión de Hallazgos',
      description: 'Monitoreo y seguimiento de vulnerabilidades detectadas en auditorías previas con plan de acción correctivo.',
      icon: AlertCircle,
      isNew: false,
    },
    {
      id: 'dashboard',
      title: 'Reportería',
      description: 'Generación de indicadores clave y dashboards de cumplimiento normativo para la alta dirección de Codelco.',
      icon: BarChart3,
      isNew: true,
    },
    {
      id: 'mantenedores',
      title: 'Mantenedores',
      description: 'Administración de tablas maestras, parámetros del sistema y configuraciones generales del motor de auditoría.',
      icon: Wrench,
      isNew: true,
    }
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto overflow-y-auto h-[calc(100vh-4rem)] bg-gray-50/50" id="inicio-container">
      {/* Welcome Title Block */}
      <div className="mb-8" id="inicio-welcome-header">
        <motion.h2 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-2xl md:text-3xl font-extrabold text-gris-azulado tracking-tight m-0 normal-case mb-2 font-display"
        >
          Bienvenido al Sistema
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="text-sm text-secundario leading-relaxed max-w-3xl font-sans"
        >
          Seleccione un módulo para comenzar con la gestión de seguridad industrial y cumplimiento de normativas de ciberseguridad OT/IT.
        </motion.p>
      </div>

      {/* Grid containing the five modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="inicio-grid-modules">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.05, duration: 0.4 }}
              onClick={() => onNavigate(card.id)}
              className="bg-white border border-crema/20 rounded-md p-6 hover:shadow-md hover:border-cobre/30 transition-all cursor-pointer group flex flex-col justify-between relative overflow-hidden"
              id={`inicio-card-${card.id}`}
            >
              {/* Top info and tag if isNew */}
              <div>
                <div className="flex items-start justify-between mb-4">
                  {/* Icon with beautiful background matching Codelco style */}
                  <div className="p-3.5 bg-surface-container-low rounded-md group-hover:bg-surface-container-custom transition-colors">
                    <Icon className="h-6 w-6 text-cobre group-hover:scale-105 transition-transform" />
                  </div>

                  {card.isNew && (
                    <span className="text-[9px] font-bold tracking-widest uppercase bg-cobre text-white px-2 py-0.5 rounded-sm shadow-sm" id={`tag-new-${card.id}`}>
                      Nuevo
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-gris-azulado group-hover:text-cobre transition-colors mb-2 font-display normal-case tracking-tight">
                  {card.title}
                </h3>
                
                <p className="text-xs text-secundario leading-relaxed font-sans mb-4">
                  {card.description}
                </p>
              </div>

              {/* Action helper */}
              <div className="flex items-center text-xs font-semibold text-cobre group-hover:translate-x-1 transition-transform mt-auto pt-2">
                <span>Ingresar al módulo</span>
                <ChevronRight className="h-4 w-4 ml-1" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer information bar */}
      <div className="mt-12 pt-6 border-t border-crema/20 flex flex-col md:flex-row justify-between items-center text-[11px] text-secundario font-sans gap-3" id="inicio-footer">
        <p>© 2026 Codelco - Corporación Nacional del Cobre de Chile | Todos los derechos reservados.</p>
        <div className="flex gap-4">
          <a href="#privacidad" className="hover:text-cobre transition-colors">Privacidad</a>
          <span>|</span>
          <a href="#soporte" className="hover:text-cobre transition-colors">Soporte Técnico</a>
          <span>|</span>
          <span className="font-bold text-cobre">V2.0</span>
        </div>
      </div>
    </div>
  );
}
