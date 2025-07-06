import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './components/LoginPage';
import { MainApp } from './components/MainApp';

const AppContent: React.FC = () => {
  const { authState } = useAuth();

  if (!authState.isAuthenticated) {
    return <LoginPage />;
  }

  return <MainApp />;
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;