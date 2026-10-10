import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import UserForm from './components/UserForm';
import UserList from './components/UserList';
import StoreList from './components/StoreList';
import StoreForm from './components/StoreForm';
import StoreImport from './components/StoreImport';
import Navbar from './components/Navbar';
import './App.css';

function AppContent() {
  const { user, logout } = useAuth();
  const [currentView, setCurrentView] = useState('users');
  const [editingStore, setEditingStore] = useState(null);
  const [showStoreForm, setShowStoreForm] = useState(false);
  const [showStoreImport, setShowStoreImport] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showUserForm, setShowUserForm] = useState(false);
  const [userListRefresh, setUserListRefresh] = useState(0);

  const handleViewChange = (view) => {
    setCurrentView(view);
    setShowStoreForm(false);
    setShowStoreImport(false);
    setEditingStore(null);
    setShowUserForm(false);
    setEditingUser(null);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowUserForm(true);
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    setShowUserForm(true);
  };

  const handleUserSave = () => {
    setShowUserForm(false);
    setEditingUser(null);
    setUserListRefresh(prev => prev + 1);
  };

  const handleUserCancel = () => {
    setShowUserForm(false);
    setEditingUser(null);
  };

  const handleEditStore = (store) => {
    setEditingStore(store);
    setShowStoreForm(true);
  };

  const handleCreateStore = () => {
    setEditingStore(null);
    setShowStoreForm(true);
  };

  const handleImportStore = () => {
    setShowStoreImport(true);
  };

  const handleStoreSave = () => {
    setShowStoreForm(false);
    setEditingStore(null);
  };

  const handleStoreCancel = () => {
    setShowStoreForm(false);
    setEditingStore(null);
  };

  const handleImportComplete = () => {
    setShowStoreImport(false);
  };

  const handleImportCancel = () => {
    setShowStoreImport(false);
  };

  if (!user) {
    return <Login />;
  }

  return (
    <div style={{ margin: 0, padding: 0, width: '100%', minHeight: '100vh', overflowX: 'hidden' }}>
      <Navbar currentView={currentView} onViewChange={handleViewChange} />
      
      <main style={{ 
        backgroundColor: '#f8f9fa', 
        minHeight: 'calc(100vh)', 
        paddingTop: '4rem',
        margin: 0,
        padding: '4rem 1rem 1rem 1rem',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {currentView === 'users' && (
          <>
            {showUserForm ? (
              <UserForm 
                user={editingUser} 
                onSave={handleUserSave} 
                onCancel={handleUserCancel}
              />
            ) : (
              <div style={{ width: '100%', maxWidth: '100%' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  marginBottom: '2rem',
                  padding: '0 1rem',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}>
                  <h2 style={{ margin: 0, color: '#333' }}>Gestión de Usuarios</h2>
                  <button
                    onClick={handleCreateUser}
                    style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      fontWeight: 'bold'
                    }}
                  >
                    + Crear Usuario
                  </button>
                </div>
                <UserList onEdit={handleEditUser} onRefresh={userListRefresh} />
              </div>
            )}
          </>
        )}
        
        {currentView === 'stores' && (
          <>
            {showStoreImport ? (
              <StoreImport 
                onImportComplete={handleImportComplete}
                onCancel={handleImportCancel}
              />
            ) : showStoreForm ? (
              <StoreForm 
                store={editingStore} 
                onSave={handleStoreSave} 
                onCancel={handleStoreCancel}
              />
            ) : (
              <StoreList 
                onEdit={handleEditStore} 
                onCreate={handleCreateStore}
                onImport={handleImportStore}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
