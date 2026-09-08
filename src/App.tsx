import React, { useState, useEffect } from 'react';
import { PermitApplication } from './types';
import {
  getStoredApplications,
  saveAllApplications,
  isOnline as checkIsOnline,
  setOnlineStatus,
  getLocalQueue,
  syncLocalQueue,
  saveApplicationLocally
} from './services/storage';
import { createNewApplication } from './services/workflowEngine';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { ApplicationListView } from './components/ApplicationListView';
import { ApplicationDetailModal } from './components/ApplicationDetailModal';
import { FieldCaptureView } from './components/FieldCaptureView';
import { ExperimentReportView } from './components/ExperimentReportView';
import { TestHarnessView } from './components/TestHarnessView';
import { DocumentationView } from './components/DocumentationView';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [applications, setApplications] = useState<PermitApplication[]>([]);
  const [selectedApp, setSelectedApp] = useState<PermitApplication | null>(null);
  const [isOnlineState, setIsOnlineState] = useState<boolean>(true);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);

  // Initial load
  useEffect(() => {
    const apps = getStoredApplications();
    setApplications(apps);

    const online = checkIsOnline();
    setIsOnlineState(online);

    updateSyncCount();
  }, []);

  const updateSyncCount = () => {
    const queue = getLocalQueue();
    setPendingSyncCount(queue.length);
  };

  const handleToggleOnline = () => {
    const nextState = !isOnlineState;
    setIsOnlineState(nextState);
    setOnlineStatus(nextState);
  };

  const handleSync = () => {
    const updatedMainApps = syncLocalQueue();
    setApplications(updatedMainApps);
    updateSyncCount();
  };

  const handleUpdateApp = (updatedApp: PermitApplication) => {
    const updatedList = applications.map((a) => (a.id === updatedApp.id ? updatedApp : a));
    setApplications(updatedList);
    saveAllApplications(updatedList);
    setSelectedApp(updatedApp);
  };

  const handleCreateNewApp = (newApp?: PermitApplication) => {
    const appToCreate =
      newApp ||
      createNewApplication({
        permitType: 'Special Event Transit Corridor',
        routeRef: 'Route 101 - City Center Loop',
        applicantRef: 'Public Transport Dev Corp'
      });

    if (isOnlineState) {
      const updatedList = [appToCreate, ...applications];
      setApplications(updatedList);
      saveAllApplications(updatedList);
      setSelectedApp(appToCreate);
    } else {
      saveApplicationLocally(appToCreate);
      updateSyncCount();
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0b0f19', color: '#f8fafc' }}>
      {/* Top Navbar Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOnline={isOnlineState}
        onToggleOnline={handleToggleOnline}
        pendingSyncCount={pendingSyncCount}
        onSync={handleSync}
      />

      {/* Main Container */}
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 20px 48px' }}>
        {activeTab === 'dashboard' && (
          <DashboardView
            applications={applications}
            onSelectApp={(app) => setSelectedApp(app)}
            onOpenFieldCapture={() => setActiveTab('field')}
            onRunExperiment={() => setActiveTab('experiment')}
          />
        )}

        {activeTab === 'applications' && (
          <ApplicationListView
            applications={applications}
            onSelectApp={(app) => setSelectedApp(app)}
            onNewApp={() => handleCreateNewApp()}
          />
        )}

        {activeTab === 'field' && (
          <FieldCaptureView
            isOnline={isOnlineState}
            onAppCreated={(app) => handleCreateNewApp(app)}
            onSyncTriggered={handleSync}
          />
        )}

        {activeTab === 'experiment' && <ExperimentReportView />}

        {activeTab === 'tests' && <TestHarnessView />}

        {activeTab === 'docs' && <DocumentationView />}
      </main>

      {/* Interactive Application Detail Modal */}
      {selectedApp && (
        <ApplicationDetailModal
          app={selectedApp}
          onClose={() => setSelectedApp(null)}
          onUpdateApp={handleUpdateApp}
        />
      )}
    </div>
  );
}

export default App;
