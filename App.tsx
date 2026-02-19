
import React, { useState, useEffect, useCallback } from 'react';
import { UserRole, User, PickupRequest, PickupStatus, WasteType, ActivityLog, NotificationRecord } from './types';
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
import { ResidentHistory } from './components/ResidentHistory';
import { WasteTipsView } from './components/WasteTipsView';
import { ProfileSettings } from './components/ProfileSettings';
import { PickupsHistory } from './components/PickupsHistory';
import { FullMapView } from './components/FullMapView';
import { OperatorStats } from './components/OperatorStats';
import { PSPDirectory } from './components/PSPDirectory';
import { ZoneStats } from './components/ZoneStats';
import { FloodAnalysis } from './components/FloodAnalysis';
import { MasterJobBoard } from './components/MasterJobBoard';
import { SystemLogs } from './components/SystemLogs';
import { UserManagement } from './components/UserManagement';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [activeTab, setActiveTab] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeNotification, setActiveNotification] = useState<Notification | null>(null);
  const [notificationsHistory, setNotificationsHistory] = useState<NotificationRecord[]>([]);
  const [requests, setRequests] = useState<PickupRequest[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [theme, setTheme] = useState<string>(localStorage.getItem('waste_up_theme') || 'light');

  // Handle Theme
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('waste_up_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Centralized data fetcher
  const refreshData = useCallback(async () => {
    if (user) {
      const [reqData, noteData] = await Promise.all([
        apiService.getRequests(user.id, user.role),
        apiService.getNotifications(user.id)
      ]);
      setRequests(reqData);
      setNotificationsHistory(noteData);
      
      if (user.role === UserRole.ADMIN) {
         const logData = await apiService.getActivityLogs();
         setLogs(logData);
      }
    }
  }, [user]);

  // Reactive Data Sync: Fetch data whenever the user changes
  useEffect(() => {
    if (user) {
      refreshData();
    }
  }, [user, refreshData]);

  // Startup: Initialize session
  useEffect(() => {
    apiService.seedDatabase();
    const initialize = async () => {
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setActiveTab(ROLE_DEFAULT_TABS[currentUser.role]);
      }
      setIsInitializing(false);
    };
    initialize();
  }, []);

  // Notification Toast Logic
  useEffect(() => {
    if (!user) return;
    const unsubscribe = notificationService.subscribe((n) => {
      setActiveNotification(n);
      refreshData(); 
      setTimeout(() => setActiveNotification(null), 7000);
    });
    return unsubscribe;
  }, [user, refreshData]);

  const handleLogin = async (email: string, selectedRole: UserRole, password?: string) => {
    try {
      const { user: loggedInUser } = await authService.login(email, selectedRole, password);
      setUser(loggedInUser);
      setActiveTab(ROLE_DEFAULT_TABS[selectedRole]);
    } catch (error: any) {
      throw error;
    }
  };

  const handleRegister = async (details: { name: string; email: string; phone: string; role: UserRole; location?: string; password?: string }) => {
    try {
      await authService.register(details);
      // After successful registration, the user will be on the login page
      // and can now sign in with their new credentials.
    } catch (error: any) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  const handleForgotPassword = async (email: string) => {
    try {
      await authService.requestPasswordReset(email);
    } catch (error: any) {
      throw error;
    }
  };

  const handleUpdateUser = (updatedUser: User) => {
    apiService.saveUser(updatedUser);
    setUser(updatedUser);
    authService.updateToken(updatedUser);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setActiveTab('');
    setRequests([]);
    setNotificationsHistory([]);
    setIsSidebarOpen(false);
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

  const clearNotifications = async () => {
    if (user) {
      await apiService.clearNotifications(user.id);
      setNotificationsHistory([]);
    }
  };

  const renderContent = () => {
    if (!user) return null;
    const tab = ROLE_MENU_ITEMS[user.role].some(i => i.label === activeTab) ? activeTab : ROLE_DEFAULT_TABS[user.role];

    if (user.role === UserRole.RESIDENT) {
      switch (tab) {
        case 'Dashboard': return <ResidentDashboard user={user} requests={requests} onAddRequest={addRequest} onUpdateStatus={updateRequestStatus} />;
        case 'My Schedule': return <ResidentSchedule requests={requests} />;
        case 'History': return <ResidentHistory requests={requests} />;
        case 'Map Explorer': return <FullMapView user={user} requests={requests} />;
        case 'Waste Tips': return <WasteTipsView />;
        case 'Settings': return <ProfileSettings user={user} onUpdateUser={handleUpdateUser} />;
        default: return <ResidentDashboard user={user} requests={requests} onAddRequest={addRequest} onUpdateStatus={updateRequestStatus} />;
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
        case 'All Requests': return <MasterJobBoard requests={requests} />;
        case 'User Management': return <UserManagement />;
        case 'PSP Managers': return <PSPDirectory userRole={user.role} />;
        case 'Zones': return <ZoneStats requests={requests} />;
        case 'Flood Risk': return <FloodAnalysis />;
        case 'System Logs': return <SystemLogs logs={logs} />;
        default: return <AdminDashboard requests={requests} />;
      }
    }

    return null;
  };

  if (isInitializing) return <div className="min-h-screen flex items-center justify-center bg-emerald-50 dark:bg-slate-900 font-bold text-emerald-800 animate-pulse transition-colors duration-300">Initializing Waste Up Ibadan Portal...</div>;
  if (!user) return <Login onLogin={handleLogin} onRegister={handleRegister} onForgotPassword={handleForgotPassword} />;

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden relative transition-colors duration-300">
      <Sidebar 
        user={user} 
        activeTab={activeTab} 
        onTabChange={(tab) => {
          setActiveTab(tab);
          setIsSidebarOpen(false);
        }} 
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar 
          user={user} 
          currentTab={activeTab} 
          onMenuClick={() => setIsSidebarOpen(true)}
          theme={theme}
          onToggleTheme={toggleTheme}
          notifications={notificationsHistory as any}
          onClearNotifications={clearNotifications}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 transition-colors duration-300">
          {renderContent()}
        </main>
      </div>

      {activeNotification && (
        <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-right-10 fade-in duration-300">
          <div className={`bg-slate-900 dark:bg-slate-800 text-white p-4 rounded-2xl shadow-2xl border ${activeNotification.medium === 'SMS' ? 'border-emerald-700' : 'border-blue-700'} max-w-sm flex gap-4`}>
            <div className={`w-10 h-10 ${activeNotification.medium === 'SMS' ? 'bg-emerald-600' : 'bg-blue-600'} rounded-full flex items-center justify-center text-xl shrink-0`}>
              {activeNotification.medium === 'SMS' ? 'ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã‚Â±' : 'ÃƒÂ¢Ã…â€œÃ¢â‚¬Â°ÃƒÂ¯Ã‚Â¸Ã‚Â'}
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