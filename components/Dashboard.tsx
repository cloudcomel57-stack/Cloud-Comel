
import React, { useState } from 'react';
import { User, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { AppView } from '../types';
import Sidebar from './Sidebar';
import Overview from './Overview';
import EventRequests from './EventRequests';
import UserManagement from './UserManagement';
import CancellationRequests from './CancellationRequests';

interface DashboardProps {
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [activeView, setActiveView] = useState<AppView>(AppView.OVERVIEW);

  const handleLogout = () => signOut(auth);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        onLogout={handleLogout} 
      />
      
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">{activeView}</h2>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900 leading-none">Admin Panel</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-red-700 flex items-center justify-center text-white font-bold shadow-sm">
                {user.email?.charAt(0).toUpperCase() || 'A'}
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto">
          {activeView === AppView.OVERVIEW && <Overview />}
          {activeView === AppView.EVENT_REQUESTS && <EventRequests />}
          {activeView === AppView.CANCELLATION_REQUESTS && <CancellationRequests />}
          {activeView === AppView.USER_MANAGEMENT && <UserManagement />}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
