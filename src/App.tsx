import { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import FormulariosView from './components/FormulariosView';
import HallazgosView from './components/HallazgosView';
import LicitacionesView from './components/LicitacionesView';
import InicioView from './components/InicioView';
import MantenedoresView from './components/MantenedoresView';
import ConfiguracionView from './components/ConfiguracionView';
import { DacRequest, Finding, UserRole, DacState, FindingState, Comment, Log, Evidence } from './types';
import { INITIAL_DACS, INITIAL_FINDINGS } from './mockData';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('inicio');
  const [currentRole, setCurrentRole] = useState<UserRole>('JP');
  const [selectedDacId, setSelectedDacId] = useState<string | null>(null);
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Load from localStorage or use initial mock data
  const [dacs, setDacs] = useState<DacRequest[]>(() => {
    try {
      const stored = typeof window !== 'undefined' && window.localStorage ? localStorage.getItem('codelco_dacs') : null;
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('LocalStorage is not accessible:', e);
    }
    return INITIAL_DACS;
  });

  const [findings, setFindings] = useState<Finding[]>(() => {
    try {
      const stored = typeof window !== 'undefined' && window.localStorage ? localStorage.getItem('codelco_findings') : null;
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('LocalStorage is not accessible:', e);
    }
    return INITIAL_FINDINGS;
  });

  // Simulated notifications list
  const [notifications, setNotifications] = useState<any[]>([
    { id: 'n1', text: 'SLA ALERTA: Hallazgo 20260004-H001 vencido hace 3 días.', time: 'Hace 10 mins', type: 'urgent' },
    { id: 'n2', text: 'NUEVA EVIDENCIA: Juan Pérez cargó evidencias para 20260001-H001.', time: 'Hace 45 mins', type: 'info' },
    { id: 'n3', text: 'KICK-OFF PROGRAMADO: Se programó el Kick-off para DAC 20260003.', time: 'Hace 2 horas', type: 'success' }
  ]);

  // Synchronize with localStorage
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('codelco_dacs', JSON.stringify(dacs));
      }
    } catch (e) {
      console.warn('LocalStorage write failed:', e);
    }
  }, [dacs]);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('codelco_findings', JSON.stringify(findings));
      }
    } catch (e) {
      console.warn('LocalStorage write failed:', e);
    }
  }, [findings]);

  // View transition helpers
  const handleSelectDac = (id: string | null) => {
    setSelectedDacId(id);
    if (id) {
      setCurrentView('formularios');
    } else {
      setCurrentView('dashboard');
    }
  };

  const handleSelectFinding = (findingId: string | null) => {
    setSelectedFindingId(findingId);
    if (findingId) {
      const found = findings.find(f => f.id === findingId);
      if (found) setSelectedDacId(found.dacId);
      setCurrentView('hallazgos');
    } else {
      setCurrentView('dashboard');
    }
  };

  // Add new DAC request
  const handleAddNewDac = (newDacData: Partial<DacRequest>) => {
    // Find highest DAC id and increment
    const numIds = dacs.map(d => parseInt(d.id)).filter(id => !isNaN(id));
    const nextId = numIds.length > 0 ? Math.max(...numIds) + 1 : 20260001;

    const newDac: DacRequest = {
      id: nextId.toString(),
      projectName: newDacData.projectName || 'Proyecto sin título',
      jpName: newDacData.jpName || 'Sin asignar',
      jpEmail: newDacData.jpEmail || 'jp@codelco.cl',
      jpPhone: newDacData.jpPhone || '',
      jpRut: newDacData.jpRut || '',
      jpCargo: newDacData.jpCargo || '',
      companyName: newDacData.companyName || '',
      companyRut: newDacData.companyRut || '',
      companyAddress: newDacData.companyAddress || '',
      companyWebsite: newDacData.companyWebsite || '',
      companySize: newDacData.companySize || 'Grande',
      description: newDacData.description || '',
      type: newDacData.type || 'Implementación',
      scope: newDacData.scope || ['Seguridad'],
      criticidad: newDacData.criticidad || 'Medio',
      startDate: newDacData.startDate || '2026-07-01',
      durationMonths: newDacData.durationMonths || 12,
      budgetEstimate: newDacData.budgetEstimate || 50000,
      justification: newDacData.justification || '',
      state: 'EN LLENADO',
      docHistory: [
        { id: `h_${Date.now()}`, name: 'Solicitud_Iniciada_SharePoint.pdf', date: '2026-06-23 10:00', state: 'Aprobado', action: 'Generado por Sistema' }
      ]
    };

    setDacs([newDac, ...dacs]);
    
    // Add a notification for new request
    setNotifications([
      { id: `notif_${Date.now()}`, text: `SOLICITUD NUEVA: Se creó el borrador DAC ${newDac.id} con éxito.`, time: 'Hace un momento', type: 'success' },
      ...notifications
    ]);
  };

  // Update DAC State
  const handleUpdateDacState = (id: string, newState: DacState) => {
    setDacs(prev => prev.map(dac => {
      if (dac.id === id) {
        return { ...dac, state: newState };
      }
      return dac;
    }));
  };

  // Update DAC Form Values
  const handleUpdateDacForm = (id: string, newForm: any) => {
    setDacs(prev => prev.map(dac => {
      if (dac.id === id) {
        return { ...dac, dacForm: newForm };
      }
      return dac;
    }));
  };

  // Trigger automated finding
  const handleTriggerFinding = (dacId: string, findingData: Partial<Finding>) => {
    // Generate incremental Finding ID for this specific DAC
    const dacFindings = findings.filter(f => f.dacId === dacId);
    const nextSeq = dacFindings.length + 1;
    const seqStr = nextSeq.toString().padStart(3, '0');
    const findingId = `${dacId}-H${seqStr}`;

    const newFinding: Finding = {
      id: findingId,
      dacId,
      title: findingData.title || 'Hallazgo sin título',
      description: findingData.description || '',
      state: 'NUEVO',
      criticidad: (findingData.criticidad as any) || 'MEDIA',
      origin: findingData.origin || 'Sistema Automatizado',
      assignedTo: findingData.assignedTo || 'Juan Pérez',
      email: findingData.email || 'jperez@codelco.cl',
      limitDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days from now
      recommendation: findingData.recommendation || '',
      evidences: [],
      comments: [
        {
          id: `c_init_${Date.now()}`,
          author: 'Sistema de Control',
          role: 'ADMIN',
          text: `Hallazgo registrado automáticamente debido a respuesta del Formulario DAC. Plazo de solución de acuerdo a criticidad: 5 días hábiles.`,
          date: new Date().toLocaleString('es-CL', { hour12: false })
        }
      ],
      logs: [
        {
          id: `log_init_${Date.now()}`,
          date: new Date().toLocaleString('es-CL', { hour12: false }),
          text: `Hallazgo creado e indexado automáticamente.`,
          user: 'Sistema'
        }
      ]
    };

    setFindings([newFinding, ...findings]);

    // Push notification
    setNotifications([
      { id: `notif_${Date.now()}`, text: `⚠️ ALERTA: Nuevo hallazgo crítico ${findingId} registrado en ${dacId}.`, time: 'Hace un momento', type: 'urgent' },
      ...notifications
    ]);
  };

  // Update Finding State
  const handleUpdateFindingState = (id: string, newState: FindingState) => {
    setFindings(prev => prev.map(f => {
      if (f.id === id) {
        return { ...f, state: newState };
      }
      return f;
    }));
  };

  // Add Comment to Finding
  const handleAddFindingComment = (id: string, comment: Comment) => {
    setFindings(prev => prev.map(f => {
      if (f.id === id) {
        return { ...f, comments: [...f.comments, comment] };
      }
      return f;
    }));
  };

  // Add Evidence to Finding
  const handleAddFindingEvidence = (id: string, file: Evidence) => {
    setFindings(prev => prev.map(f => {
      if (f.id === id) {
        return { ...f, evidences: [...f.evidences, file] };
      }
      return f;
    }));
  };

  // Update Finding mitigation plan
  const handleUpdateFindingPlan = (id: string, plan: string, internal: string, email: string, date: string) => {
    setFindings(prev => prev.map(f => {
      if (f.id === id) {
        return {
          ...f,
          mitigationPlan: plan,
          responsibleInternal: internal,
          responsibleEmail: email,
          proposedDate: date
        };
      }
      return f;
    }));
  };

  // Add Finding log
  const handleAddFindingLog = (id: string, log: Log) => {
    setFindings(prev => prev.map(f => {
      if (f.id === id) {
        return { ...f, logs: [log, ...f.logs] };
      }
      return f;
    }));
  };

  // Generic finding fields updater
  const handleUpdateFindingFields = (id: string, fields: Partial<Finding>) => {
    setFindings(prev => prev.map(f => {
      if (f.id === id) {
        return { ...f, ...fields };
      }
      return f;
    }));
  };

  // Clear notification helper
  const handleClearNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans" id="app-container">
      {/* HEADER COMPONENT */}
      <Header
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        notifications={notifications}
        onClearNotification={handleClearNotification}
        isMobileSidebarOpen={isMobileSidebarOpen}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
      />

      {/* BODY AREA */}
      <div className="flex flex-1 relative overflow-hidden" id="app-body">
        {/* SIDEBAR NAVIGATION COMPONENT */}
        {(currentView !== 'formularios' || isMobileSidebarOpen) && (
          <Sidebar
            currentView={currentView}
            onViewChange={setCurrentView}
            currentRole={currentRole}
            isMobileOpen={isMobileSidebarOpen}
            onCloseMobile={() => setIsMobileSidebarOpen(false)}
            hideOnDesktop={currentView === 'formularios'}
          />
        )}

        {/* VIEW CONTAINER */}
        <main className="flex-1 bg-gray-50 relative overflow-hidden" id="app-main-content">
          {currentView === 'inicio' && (
            <InicioView onNavigate={setCurrentView} />
          )}

          {currentView === 'dashboard' && (
            <DashboardView
              dacs={dacs}
              findings={findings}
              currentRole={currentRole}
              onSelectDac={handleSelectDac}
              onSelectFinding={handleSelectFinding}
              onAddNewDac={handleAddNewDac}
            />
          )}

          {currentView === 'formularios' && (
            <FormulariosView
              key={selectedDacId || 'new'}
              dacs={dacs}
              findings={findings}
              currentRole={currentRole}
              selectedDacId={selectedDacId}
              onSelectDac={handleSelectDac}
              onUpdateDacState={handleUpdateDacState}
              onUpdateDacForm={handleUpdateDacForm}
              onTriggerFinding={handleTriggerFinding}
            />
          )}

          {currentView === 'hallazgos' && (
            <HallazgosView
              key={selectedFindingId || 'new'}
              findings={findings}
              currentRole={currentRole}
              selectedFindingId={selectedFindingId}
              onSelectFinding={handleSelectFinding}
              onUpdateFindingState={handleUpdateFindingState}
              onAddFindingComment={handleAddFindingComment}
              onAddFindingEvidence={handleAddFindingEvidence}
              onUpdateFindingPlan={handleUpdateFindingPlan}
              onAddFindingLog={handleAddFindingLog}
              onUpdateFindingFields={handleUpdateFindingFields}
            />
          )}

          {currentView === 'licitaciones' && (
            <LicitacionesView
              dacs={dacs}
              currentRole={currentRole}
              onUpdateDacState={handleUpdateDacState}
              onSelectDac={handleSelectDac}
            />
          )}

          {currentView === 'mantenedores' && (
            <MantenedoresView />
          )}

          {currentView === 'configuracion' && (
            <ConfiguracionView />
          )}
        </main>
      </div>
    </div>
  );
}
