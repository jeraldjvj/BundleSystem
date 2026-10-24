import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import UserForm from './components/UserForm';
import UserList from './components/UserList';
import StoreList from './components/StoreList';
import StoreForm from './components/StoreForm';
import StoreImport from './components/StoreImport';
import StoreAssignForm from './components/StoreAssignForm';
import StoreBatchAssignImport from './components/StoreBatchAssignImport';
import ProjectForm from './components/ProjectForm';
import ProjectList from './components/ProjectList';
import BundleModelForm from './components/BundleModelForm';
import BundleModelList from './components/BundleModelList';
import SmartphoneModelForm from './components/SmartphoneModelForm';
import SmartphoneModelList from './components/SmartphoneModelList';
import DistributorForm from './components/DistributorForm';
import DistributorList from './components/DistributorList';
import BundleForm from './components/BundleForm';
import BundleList from './components/BundleList';
import BundleImport from './components/BundleImport';
import BundleAssignForm from './components/BundleAssignForm';
import SmartphoneForm from './components/SmartphoneForm';
import SmartphoneList from './components/SmartphoneList';
import SmartphoneImport from './components/SmartphoneImport';
import BundleDeliveryForm from './components/BundleDeliveryForm';
import ReportsDashboard from './components/ReportsDashboard';
import Navbar from './components/Navbar';
import './App.css';

function AppContent() {
  const { user, logout } = useAuth();
  const [currentView, setCurrentView] = useState('reports');
  const [editingStore, setEditingStore] = useState(null);
  const [showStoreForm, setShowStoreForm] = useState(false);
  const [showStoreImport, setShowStoreImport] = useState(false);
  const [assigningStore, setAssigningStore] = useState(null);
  const [showStoreAssign, setShowStoreAssign] = useState(false);
  const [showStoreBatchImport, setShowStoreBatchImport] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showUserForm, setShowUserForm] = useState(false);
  const [userListRefresh, setUserListRefresh] = useState(0);
  const [editingProject, setEditingProject] = useState(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [projectListRefresh, setProjectListRefresh] = useState(0);
  const [editingBundleModel, setEditingBundleModel] = useState(null);
  const [showBundleModelForm, setShowBundleModelForm] = useState(false);
  const [bundleModelListRefresh, setBundleModelListRefresh] = useState(0);
  const [editingSmartphoneModel, setEditingSmartphoneModel] = useState(null);
  const [showSmartphoneModelForm, setShowSmartphoneModelForm] = useState(false);
  const [smartphoneModelListRefresh, setSmartphoneModelListRefresh] = useState(0);
  const [editingDistributor, setEditingDistributor] = useState(null);
  const [showDistributorForm, setShowDistributorForm] = useState(false);
  const [distributorListRefresh, setDistributorListRefresh] = useState(0);
  const [editingBundle, setEditingBundle] = useState(null);
  const [showBundleForm, setShowBundleForm] = useState(false);
  const [showBundleImport, setShowBundleImport] = useState(false);
  const [assigningBundle, setAssigningBundle] = useState(null);
  const [showBundleAssign, setShowBundleAssign] = useState(false);
  const [bundleListRefresh, setBundleListRefresh] = useState(0);
  const [editingSmartphone, setEditingSmartphone] = useState(null);
  const [showSmartphoneForm, setShowSmartphoneForm] = useState(false);
  const [showSmartphoneImport, setShowSmartphoneImport] = useState(false);
  const [smartphoneListRefresh, setSmartphoneListRefresh] = useState(0);
  const [deliveryFormKey, setDeliveryFormKey] = useState(0);

  const handleViewChange = (view) => {
    setCurrentView(view);
    setShowStoreForm(false);
    setShowStoreImport(false);
    setShowStoreAssign(false);
    setAssigningStore(null);
    setShowStoreBatchImport(false);
    setEditingStore(null);
    setShowUserForm(false);
    setEditingUser(null);
    setShowProjectForm(false);
    setEditingProject(null);
    setShowBundleModelForm(false);
    setEditingBundleModel(null);
    setShowSmartphoneModelForm(false);
    setEditingSmartphoneModel(null);
    setShowDistributorForm(false);
    setEditingDistributor(null);
    setShowBundleForm(false);
    setShowBundleImport(false);
    setShowBundleAssign(false);
    setEditingBundle(null);
    setAssigningBundle(null);
    setShowSmartphoneForm(false);
    setShowSmartphoneImport(false);
    setEditingSmartphone(null);
  };

  const handleEditSmartphone = (smartphone) => {
    setEditingSmartphone(smartphone);
    setShowSmartphoneForm(true);
  };

  const handleCreateSmartphone = () => {
    setEditingSmartphone(null);
    setShowSmartphoneForm(true);
  };

  const handleSmartphoneSave = () => {
    setShowSmartphoneForm(false);
    setEditingSmartphone(null);
    setSmartphoneListRefresh(prev => prev + 1);
  };

  const handleSmartphoneCancel = () => {
    setShowSmartphoneForm(false);
    setEditingSmartphone(null);
  };

  const handleImportSmartphone = () => {
    setShowSmartphoneImport(true);
  };

  const handleSmartphoneImportComplete = () => {
    setShowSmartphoneImport(false);
    setSmartphoneListRefresh(prev => prev + 1);
  };

  const handleSmartphoneImportCancel = () => {
    setShowSmartphoneImport(false);
  };

  const handleEditBundle = (bundle) => {
    setEditingBundle(bundle);
    setShowBundleForm(true);
  };

  const handleCreateBundle = () => {
    setEditingBundle(null);
    setShowBundleForm(true);
  };

  const handleImportBundle = () => {
    setShowBundleImport(true);
  };

  const handleBundleSave = () => {
    setShowBundleForm(false);
    setEditingBundle(null);
    setBundleListRefresh(prev => prev + 1);
  };

  const handleBundleCancel = () => {
    setShowBundleForm(false);
    setEditingBundle(null);
  };

  const handleBundleImportComplete = () => {
    setShowBundleImport(false);
    setBundleListRefresh(prev => prev + 1);
  };

  const handleBundleImportCancel = () => {
    setShowBundleImport(false);
  };

  const handleAssignBundle = (bundle) => {
    setAssigningBundle(bundle);
    setShowBundleAssign(true);
  };

  const handleBundleAssignSave = () => {
    setShowBundleAssign(false);
    setAssigningBundle(null);
    setBundleListRefresh(prev => prev + 1);
  };

  const handleBundleAssignCancel = () => {
    setShowBundleAssign(false);
    setAssigningBundle(null);
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

  const handleEditProject = (project) => {
    setEditingProject(project);
    setShowProjectForm(true);
  };

  const handleCreateProject = () => {
    setEditingProject(null);
    setShowProjectForm(true);
  };

  const handleProjectSave = () => {
    setShowProjectForm(false);
    setEditingProject(null);
    setProjectListRefresh(prev => prev + 1);
  };

  const handleProjectCancel = () => {
    setShowProjectForm(false);
    setEditingProject(null);
  };

  const handleEditBundleModel = (bundleModel) => {
    setEditingBundleModel(bundleModel);
    setShowBundleModelForm(true);
  };

  const handleCreateBundleModel = () => {
    setEditingBundleModel(null);
    setShowBundleModelForm(true);
  };

  const handleBundleModelSave = () => {
    setShowBundleModelForm(false);
    setEditingBundleModel(null);
    setBundleModelListRefresh(prev => prev + 1);
  };

  const handleBundleModelCancel = () => {
    setShowBundleModelForm(false);
    setEditingBundleModel(null);
  };

  const handleEditSmartphoneModel = (smartphoneModel) => {
    setEditingSmartphoneModel(smartphoneModel);
    setShowSmartphoneModelForm(true);
  };

  const handleCreateSmartphoneModel = () => {
    setEditingSmartphoneModel(null);
    setShowSmartphoneModelForm(true);
  };

  const handleSmartphoneModelSave = () => {
    setShowSmartphoneModelForm(false);
    setEditingSmartphoneModel(null);
    setSmartphoneModelListRefresh(prev => prev + 1);
  };

  const handleSmartphoneModelCancel = () => {
    setShowSmartphoneModelForm(false);
    setEditingSmartphoneModel(null);
  };

  const handleEditDistributor = (distributor) => {
    setEditingDistributor(distributor);
    setShowDistributorForm(true);
  };

  const handleCreateDistributor = () => {
    setEditingDistributor(null);
    setShowDistributorForm(true);
  };

  const handleDistributorSave = () => {
    setShowDistributorForm(false);
    setEditingDistributor(null);
    setDistributorListRefresh(prev => prev + 1);
  };

  const handleDistributorCancel = () => {
    setShowDistributorForm(false);
    setEditingDistributor(null);
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

  const handleAssignStore = (store) => {
    setAssigningStore(store);
    setShowStoreAssign(true);
  };

  const handleStoreAssignSave = () => {
    setShowStoreAssign(false);
    setAssigningStore(null);
  };

  const handleStoreAssignCancel = () => {
    setShowStoreAssign(false);
    setAssigningStore(null);
  };

  const handleBatchImportStore = () => {
    setShowStoreBatchImport(true);
  };

  const handleStoreBatchImportComplete = () => {
    setShowStoreBatchImport(false);
  };

  const handleStoreBatchImportCancel = () => {
    setShowStoreBatchImport(false);
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

  const canAccessManagement = user.levelUser === 'Office Manager' || user.levelUser === 'admin';
  const canAccessBundles = canAccessManagement || user.levelUser === 'City Manager';
  const canAccessDelivery = user.levelUser?.toLowerCase() === 'field force';

  return (
    <div style={{ margin: 0, padding: 0, width: '100%', minHeight: '100vh', overflowX: 'hidden' }}>
      <Navbar currentView={currentView} onViewChange={handleViewChange} canAccessManagement={canAccessManagement} canAccessBundles={canAccessBundles} canAccessDelivery={canAccessDelivery} />
      
      <main style={{ 
        backgroundColor: '#f8f9fa', 
        minHeight: 'calc(100vh)', 
        paddingTop: '4rem',
        margin: 0,
        padding: '4rem 1rem 1rem 1rem',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {currentView === 'users' && canAccessManagement ? (
          <>
            {showUserForm ? (
              <UserForm 
                user={editingUser} 
                onSave={handleUserSave} 
                onCancel={handleUserCancel}
              />
            ) : (
              <div style={{ width: '100%', maxWidth: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', padding: '0 1rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <h2 style={{ margin: 0, color: '#333' }}>Gestión de Usuarios</h2>
                  <button onClick={handleCreateUser} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold' }}>
                    + Crear Usuario
                  </button>
                </div>
                <UserList onEdit={handleEditUser} onRefresh={userListRefresh} />
              </div>
            )}
          </>
        ) : currentView === 'users' && !canAccessManagement ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h2 style={{ color: '#333' }}>Acceso Denegado</h2>
            <p style={{ color: '#666' }}>No tienes permisos para ver esta página. Solo usuarios con nivel Office Manager pueden acceder.</p>
          </div>
        ) : null}
        
        {currentView === 'projects' && canAccessManagement ? (
          <>
            {showProjectForm ? (
              <ProjectForm 
                project={editingProject} 
                onSave={handleProjectSave} 
                onCancel={handleProjectCancel}
              />
            ) : (
              <div style={{ width: '100%', maxWidth: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', padding: '0 1rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <h2 style={{ margin: 0, color: '#333' }}>Gestión de Proyectos</h2>
                  <button onClick={handleCreateProject} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold' }}>
                    + Crear Proyecto
                  </button>
                </div>
                <ProjectList onEdit={handleEditProject} onRefresh={projectListRefresh} />
              </div>
            )}
          </>
        ) : currentView === 'projects' && !canAccessManagement ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h2 style={{ color: '#333' }}>Acceso Denegado</h2>
            <p style={{ color: '#666' }}>No tienes permisos para ver esta página. Solo usuarios con nivel Office Manager pueden acceder.</p>
          </div>
        ) : null}
        
        {currentView === 'stores' && canAccessManagement ? (
          <>
            {showStoreImport ? (
              <StoreImport 
                onImportComplete={handleImportComplete}
                onCancel={handleImportCancel}
              />
            ) : showStoreBatchImport ? (
              <StoreBatchAssignImport
                onImportComplete={handleStoreBatchImportComplete}
                onCancel={handleStoreBatchImportCancel}
              />
            ) : showStoreAssign ? (
              <StoreAssignForm
                store={assigningStore}
                onSave={handleStoreAssignSave}
                onCancel={handleStoreAssignCancel}
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
                onBatchImport={handleBatchImportStore}
                onAssign={handleAssignStore}
              />
            )}
          </>
        ) : currentView === 'stores' && !canAccessManagement ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h2 style={{ color: '#333' }}>Acceso Denegado</h2>
            <p style={{ color: '#666' }}>No tienes permisos para ver esta página. Solo usuarios con nivel Office Manager pueden acceder.</p>
          </div>
        ) : null}
        
        {currentView === 'bundleModels' && canAccessManagement ? (
          <>
            {showBundleModelForm ? (
              <BundleModelForm 
                bundleModel={editingBundleModel} 
                onSave={handleBundleModelSave} 
                onCancel={handleBundleModelCancel}
              />
            ) : (
              <div style={{ width: '100%', maxWidth: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', padding: '0 1rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <h2 style={{ margin: 0, color: '#333' }}>Gestión de Modelos de Bundle</h2>
                  <button onClick={handleCreateBundleModel} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold' }}>
                    + Crear Modelo
                  </button>
                </div>
                <BundleModelList onEdit={handleEditBundleModel} onRefresh={bundleModelListRefresh} />
              </div>
            )}
          </>
        ) : currentView === 'bundleModels' && !canAccessManagement ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h2 style={{ color: '#333' }}>Acceso Denegado</h2>
            <p style={{ color: '#666' }}>No tienes permisos para ver esta página. Solo usuarios con nivel Office Manager pueden acceder.</p>
          </div>
        ) : null}

        {currentView === 'smartphoneModels' && canAccessManagement ? (
          <>
            {showSmartphoneModelForm ? (
              <SmartphoneModelForm 
                smartphoneModel={editingSmartphoneModel} 
                onSave={handleSmartphoneModelSave} 
                onCancel={handleSmartphoneModelCancel}
              />
            ) : (
              <div style={{ width: '100%', maxWidth: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', padding: '0 1rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <h2 style={{ margin: 0, color: '#333' }}>Gestión de Modelos de Smartphone</h2>
                  <button onClick={handleCreateSmartphoneModel} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold' }}>
                    + Crear Modelo
                  </button>
                </div>
                <SmartphoneModelList onEdit={handleEditSmartphoneModel} onRefresh={smartphoneModelListRefresh} />
              </div>
            )}
          </>
        ) : currentView === 'smartphoneModels' && !canAccessManagement ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h2 style={{ color: '#333' }}>Acceso Denegado</h2>
            <p style={{ color: '#666' }}>No tienes permisos para ver esta página. Solo usuarios con nivel Office Manager pueden acceder.</p>
          </div>
        ) : null}

        {currentView === 'bundles' && canAccessBundles ? (
          <>
            {showBundleImport ? (
              <BundleImport
                onImportComplete={handleBundleImportComplete}
                onCancel={handleBundleImportCancel}
              />
            ) : showBundleAssign ? (
              <BundleAssignForm
                bundle={assigningBundle}
                onSave={handleBundleAssignSave}
                onCancel={handleBundleAssignCancel}
              />
            ) : showBundleForm ? (
              <BundleForm
                bundle={editingBundle}
                onSave={handleBundleSave}
                onCancel={handleBundleCancel}
              />
            ) : (
              <BundleList
                onEdit={handleEditBundle}
                onCreate={handleCreateBundle}
                onImport={handleImportBundle}
                onAssign={handleAssignBundle}
                onRefresh={bundleListRefresh}
              />
            )}
          </>
        ) : currentView === 'bundles' && !canAccessBundles ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h2 style={{ color: '#333' }}>Acceso Denegado</h2>
            <p style={{ color: '#666' }}>No tienes permisos para ver esta página. Solo usuarios con nivel Office Manager o City Manager pueden acceder.</p>
          </div>
        ) : null}

        {currentView === 'smartphones' && canAccessManagement ? (
          <>
            {showSmartphoneImport ? (
              <SmartphoneImport
                onImportComplete={handleSmartphoneImportComplete}
                onCancel={handleSmartphoneImportCancel}
              />
            ) : showSmartphoneForm ? (
              <SmartphoneForm
                smartphone={editingSmartphone}
                onSave={handleSmartphoneSave}
                onCancel={handleSmartphoneCancel}
              />
            ) : (
              <div style={{ width: '100%', maxWidth: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', padding: '0 1rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <h2 style={{ margin: 0, color: '#333' }}>Gestión de Smartphones</h2>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button onClick={handleImportSmartphone} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold' }}>
                      📥 Importar Excel
                    </button>
                    <button onClick={handleCreateSmartphone} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold' }}>
                      + Agregar Smartphone
                    </button>
                  </div>
                </div>
                <SmartphoneList onEdit={handleEditSmartphone} onRefresh={smartphoneListRefresh} />
              </div>
            )}
          </>
        ) : currentView === 'smartphones' && !canAccessManagement ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h2 style={{ color: '#333' }}>Acceso Denegado</h2>
            <p style={{ color: '#666' }}>No tienes permisos para ver esta página. Solo usuarios con nivel Office Manager pueden acceder.</p>
          </div>
        ) : null}

        {currentView === 'distributors' && canAccessManagement ? (
          <>
            {showDistributorForm ? (
              <DistributorForm 
                distributor={editingDistributor} 
                onSave={handleDistributorSave} 
                onCancel={handleDistributorCancel}
              />
            ) : (
              <div style={{ width: '100%', maxWidth: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', padding: '0 1rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <h2 style={{ margin: 0, color: '#333' }}>Gestión de Distribuidores</h2>
                  <button onClick={handleCreateDistributor} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold' }}>
                    + Crear Distribuidor
                  </button>
                </div>
                <DistributorList onEdit={handleEditDistributor} onRefresh={distributorListRefresh} />
              </div>
            )}
          </>
        ) : currentView === 'distributors' && !canAccessManagement ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h2 style={{ color: '#333' }}>Acceso Denegado</h2>
            <p style={{ color: '#666' }}>No tienes permisos para ver esta página. Solo usuarios con nivel Office Manager pueden acceder.</p>
          </div>
        ) : null}

        {currentView === 'reports' && <ReportsDashboard />}

        {currentView === 'bundleDelivery' && canAccessDelivery ? (
          <BundleDeliveryForm
            key={deliveryFormKey}
            onSave={() => setDeliveryFormKey(prev => prev + 1)}
            onCancel={() => handleViewChange(canAccessBundles ? 'bundles' : 'bundleDelivery') || setDeliveryFormKey(prev => prev + 1)}
          />
        ) : currentView === 'bundleDelivery' && !canAccessDelivery ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h2 style={{ color: '#333' }}>Acceso Denegado</h2>
            <p style={{ color: '#666' }}>No tienes permisos para ver esta página. Solo usuarios con nivel Field Force pueden acceder.</p>
          </div>
        ) : null}
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
