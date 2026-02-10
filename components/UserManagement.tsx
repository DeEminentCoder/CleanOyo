
import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { apiService } from '../services/apiService';
import { UserDetailsModal } from './UserDetailsModal';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      const data = await apiService.getUsers();
      setUsers(data);
      setIsLoading(false);
    };
    fetchUsers();
  }, []);

  const handleUserUpdated = (updatedUser: User) => {
    setUsers(prevUsers => prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

  const filtered = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">User Management</h2>
          <p className="text-sm text-slate-500">Overview of all {users.length} registered accounts in the Waste Up network.</p>
        </div>
        <div className="relative w-64">
           <span className="absolute left-3 top-2.5 text-slate-400">🔍</span>
           <input 
             type="text" 
             placeholder="Search name, email, role..." 
             className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
             value={searchTerm}
             onChange={e => setSearchTerm(e.target.value)}
           />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-20 text-center animate-pulse text-slate-400 font-bold">Loading User Directory...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">Avatar</th>
                  <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">Name / Email</th>
                  <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">Role</th>
                  <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">Location</th>
                  <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-4">
                      {user.avatar ? (
                        <img src={user.avatar} className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/10" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
                          {user.name[0]}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-slate-800 text-sm">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </td>
                    <td className="p-4">
                      <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase
                        ${user.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-700' : 
                          user.role === UserRole.PSP_OPERATOR ? 'bg-blue-100 text-blue-700' : 
                          'bg-emerald-100 text-emerald-700'}
                      `}>
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-600">{user.location}</td>
                    <td className="p-4">
                       <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                         <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                       </span>
                    </td>
                    <td className="p-4 text-right">
                       <button 
                        onClick={() => setSelectedUser(user)}
                        className="text-xs font-bold text-slate-400 hover:text-emerald-600 transition-colors bg-slate-50 hover:bg-emerald-50 px-3 py-1.5 rounded-lg border border-transparent hover:border-emerald-200"
                       >
                         Manage
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedUser && (
        <UserDetailsModal 
          user={selectedUser} 
          onClose={() => setSelectedUser(null)} 
          onUserUpdated={handleUserUpdated}
        />
      )}
    </div>
  );
};
