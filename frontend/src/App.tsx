import React, { useState, useEffect } from 'react';
import { LoginForm } from './components/Auth/LoginForm';
import { Dashboard } from './components/Dashboard/Dashboard';
import { ProjectsManager } from './components/Projects/ProjectsManager';
import { DefectsManager } from './components/Defects/DefectsManager';
import { ReportsManager } from './components/Reports/ReportsManager';
import { Sidebar } from './components/Layout/Sidebar';
import { Header } from './components/Layout/Header';
import { UserProvider, useUser } from './contexts/UserContext';
import { DataProvider } from "./contexts/ProjectContext";

function AppContent() {
  const { user } = useUser();
  const [currentView, setCurrentView] = useState<string>('dashboard');

  if (!user) {
    return <LoginForm />;
  }

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'projects':
        return <ProjectsManager />;
      case 'defects':
        return <DefectsManager />;
      case 'reports':
        return <ReportsManager />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <UserProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </UserProvider>
  );
}

export default App;