
import React, { useState, useEffect, useCallback } from 'react';
import { UserRole, User, PickupRequest, PickupStatus, WasteType } from './types';
import { ResidentDashboard } from './components/ResidentDashboard';
import { PSPOperatorDashboard } from './components/PSPOperatorDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Login } from './components/Login';
import { authService } from './services/authService';
import { apiService } from './services/apiService';
import { notificationService, Notification } from './services/notificationService';
import { ROLE_MENU_ITEMS, ROLE_DEFAULT_TABS } from './constants';

// Specialized components
import { ResidentSchedule } from './components/ResidentSchedule';
import { WasteTipsView } from './components/WasteTipsView';
import { ProfileSettings } from './components/ProfileSettings';
import { PickupsHistory } from './components/PickupsHistory';
import { FullMapView } from './components/FullMapView';
import { OperatorStats } from './components/OperatorStats';
import { PSPDirectory } from './components/PSPDirectory';
import { ZoneStats } from './components/ZoneStats';
import { FloodAnalysis } from './components/FloodAnalysis';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [activeTab, setActiveTab] = useState('');
  const [activeNotification, setActiveNotification] = useState<Notification | null>(null);
  const [requests, setRequests] = useState<PickupRequest[]>([]);

  // Seed DB and Fetch Data
  useEffect(() => {
    apiService.seedDatabase();
    const initialize = async () => {
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setActiveTab(ROLE_DEFAULT_TABS[currentUser.role]);
        const data = await apiService.getRequests(currentUser.id, currentUser.role);
        setRequests(data);
      }
      setIsInitializing(false);
    };
    initialize();
  }, []);

  // Sync state with API
  const refreshData = async () => {
    if (user) {
      const data = await apiService.getRequests(user.id, user.role);
      setRequests(data);
    }
  };

  // Notification Toast logic
  useEffect(() => {
    const unsubscribe = notificationService.subscribe((n) => {
      setActiveNotification(n);
      setTimeout(() => setActiveNotification(null), 7000);
    });
    return unsubscribe;
  }, []);

  const handleLogin = async (email: string, selectedRole: UserRole) => {
    try {
      const { user: loggedInUser } = await authService.login(email, selectedRole);
      setUser(loggedInUser);
      setActiveTab(ROLE_DEFAULT_TABS[selectedRole]);
      const data = await apiService.getRequests(loggedInUser.id, loggedInUser.role);
      setRequests(data);
    } catch (error) {
      alert("Login failed.");
    }
  };

  const handleRegister = async (details: { name: string; email: string; phone: string; role: UserRole }) => {
    try {
      const { user: registeredUser } = await authService.register(details);
      setUser(registeredUser);
      setActiveTab(ROLE_DEFAULT_TABS[details.role]);
      const data = await apiService.getRequests(registeredUser.id, registeredUser.role);
      setRequests(data);
    } catch (error) {
      alert("Registration failed.");
    }
  };

  const handleUpdateUser = (updatedUser: User) => {
    apiService.saveUser(updatedUser);
    setUser(updatedUser);
    // Update the session token with new details
    authService.updateToken(updatedUser);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setActiveTab('');
    setRequests([]);
  };

  const addRequest = async (data: Partial<PickupRequest>) => {
    if (!user) return;
    await apiService.createRequest(user, data);
    await refreshData();
  };

  const updateRequestStatus = async (id: string, status: PickupStatus) => {
    if (!user) return;
    await apiService.updateRequestStatus(id, user.id, status);
    await refreshData();
  };

  const renderContent = () => {
    if (!user) return null;
    const tab = ROLE_MENU_ITEMS[user.role].some(i => i.label === activeTab) ? activeTab : ROLE_DEFAULT_TABS[user.role];

    if (user.role === UserRole.RESIDENT) {
      switch (tab) {
        case 'Dashboard': return <ResidentDashboard user={user} requests={requests} onAddRequest={addRequest} />;
        case 'My Schedule': return <ResidentSchedule requests={requests} />;
        case 'Waste Tips': return <WasteTipsView />;
        case 'Settings': return <ProfileSettings user={user} onUpdateUser={handleUpdateUser} />;
        default: return <ResidentDashboard user={user} requests={requests} onAddRequest={addRequest} />;
      }
    }

    if (user.role === UserRole.PSP_OPERATOR) {
      switch (tab) {
        case "Today's Route": return <PSPOperatorDashboard user={user} requests={requests} onUpdateStatus={updateRequestStatus} onAddRequest={addRequest} />;
        case 'Pickups': return <PickupsHistory requests={requests} onUpdateStatus={updateRequestStatus} />;
        case 'Map View': return <FullMapView user={user} requests={requests} />;
        case 'Performance': return <OperatorStats requests={requests} />;
        case 'PSP Directory': return <PSPDirectory userRole={user.role} />;
        default: return <PSPOperatorDashboard user={user} requests={requests} onUpdateStatus={updateRequestStatus} onAddRequest={addRequest} />;
      }
    }

    if (user.role === UserRole.ADMIN) {
      switch (tab) {
        case 'Overview': return <AdminDashboard requests={requests} />;
        case 'PSP Managers': return <PSPDirectory userRole={user.role} />;
        case 'Zones': return <ZoneStats requests={requests} />;
        case 'Flood Risk': return <FloodAnalysis />;
        default: return <AdminDashboard requests={requests} />;
      }
    }

    return null;
  };

  if (isInitializing) return <div className="min-h-screen flex items-center justify-center bg-emerald-50">Loading Portal...</div>;
  if (!user) return <Login onLogin={handleLogin} onRegister={handleRegister} />;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden relative">
      <Sidebar user={user} activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar user={user} currentTab={activeTab} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">{renderContent()}</main>
      </div>

      {activeNotification && (
        <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-right-10 fade-in duration-300">
          <div className={`bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border ${activeNotification.medium === 'SMS' ? 'border-emerald-700' : 'border-blue-700'} max-w-sm flex gap-4`}>
            <div className={`w-10 h-10 ${activeNotification.medium === 'SMS' ? 'bg-emerald-600' : 'bg-blue-600'} rounded-full flex items-center justify-center text-xl shrink-0`}>
              {activeNotification.medium === 'SMS' ? '📱' : '✉️'}
            </div>
            <div>
              <p className={`text-[10px] font-black uppercase ${activeNotification.medium === 'SMS' ? 'text-emerald-400' : 'text-blue-400'} tracking-widest mb-1`}>
                {activeNotification.medium} Sent
              </p>
              <p className="text-xs text-slate-300 leading-relaxed italic line-clamp-2">"{activeNotification.message}"</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
