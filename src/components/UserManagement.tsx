import React, { useState } from 'react';
import { UserProfile, Role } from '../types';
import { PlusCircle, Trash2, UserPlus, X, Check } from 'lucide-react';

interface UserManagementProps {
  users: Record<string, UserProfile>;
  onUpdateUsers: (newUsers: Record<string, UserProfile>) => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({
  users,
  onUpdateUsers,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<Role>('student');
  const [newBio, setNewBio] = useState('');
  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  const handleToggleStatus = (key: string) => {
    const updatedUsers = { ...users };
    const currentStatus = updatedUsers[key].status || 'Active';
    updatedUsers[key] = {
      ...updatedUsers[key],
      status: currentStatus === 'Active' ? 'Inactive' : 'Active',
    };
    onUpdateUsers(updatedUsers);
    triggerAlert(`Toggled status of ${updatedUsers[key].name} to ${updatedUsers[key].status}!`);
  };

  const handleChangeRole = (key: string, role: Role) => {
    const updatedUsers = { ...users };
    updatedUsers[key] = {
      ...updatedUsers[key],
      role: role,
    };
    onUpdateUsers(updatedUsers);
    triggerAlert(`Updated Role of ${updatedUsers[key].name} to ${role.toUpperCase()}!`);
  };

  const handleDeleteUser = (key: string) => {
    if (window.confirm(`Are you sure you want to delete user ${users[key].name}?`)) {
      const updatedUsers = { ...users };
      const deletedName = updatedUsers[key].name;
      delete updatedUsers[key];
      onUpdateUsers(updatedUsers);
      triggerAlert(`Successfully deleted user "${deletedName}" from system repository.`);
    }
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    // Create unique key based on name slug
    const userKey = newName.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now();
    const newUser: UserProfile = {
      id: Date.now(), // Assign a mock numeric ID
      username: newName,
      name: newName,
      email: newEmail,
      role: newRole,
      bio: newBio.trim() || 'No biography details provided yet.',
      avatar: newRole === 'educator' 
        ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150'
        : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
      status: 'Active'
    };

    const updatedUsers = {
      ...users,
      [userKey]: newUser,
    };

    onUpdateUsers(updatedUsers);
    setShowAddModal(false);
    
    // Reset forms
    setNewName('');
    setNewEmail('');
    setNewRole('student');
    setNewBio('');
    
    triggerAlert(`Successfully created new ${newRole.toUpperCase()} user account: ${newName}!`);
  };

  const triggerAlert = (msg: string) => {
    setAlertMsg(msg);
    setTimeout(() => setAlertMsg(null), 3000);
  };

  return (
    <div id="user-management-panel" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
      
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div className="space-y-1">
          <h3 className="text-md font-extrabold text-slate-800">User Identity Management</h3>
          <p className="text-[11px] text-gray-400">Total Records: {Object.keys(users).length} registered community members.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 hover:text-indigo-600 rounded-lg flex items-center gap-1 text-xs font-bold transition-all cursor-pointer"
          title="Create New User Account"
        >
          <PlusCircle size={15} />
          Create User
        </button>
      </div>

      {alertMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] rounded-lg font-mono flex items-center gap-1.5 animate-flash">
          <Check size={14} />
          <span>{alertMsg}</span>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-gray-200 text-slate-400 font-mono font-bold uppercase text-[9px] tracking-wider">
              <th className="py-2.5 px-2">Member Info</th>
              <th className="py-2.5 px-2">System Role Privilege</th>
              <th className="py-2.5 px-2">Activation State</th>
              <th className="py-2.5 px-2 text-right">Administrative Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {Object.entries(users).map(([key, rawU]) => {
              const u = rawU as UserProfile;
              const currentStatus = u.status || 'Active';
              return (
                <tr key={key} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-2 flex items-center gap-3">
                    <img 
                      src={u.avatar} 
                      alt={u.name} 
                      className="w-8 h-8 rounded-full border border-gray-200 object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0">
                      <span className="font-semibold text-slate-800 block leading-tight text-[11px]">{u.name || u.username}</span>
                      <span className="text-[9px] text-gray-400 truncate block font-mono">{u.email}</span>
                    </div>
                  </td>

                  <td className="py-3 px-2">
                    <div className="flex items-center gap-1.5">
                      <select 
                        className="text-[11px] font-mono font-bold bg-white border border-gray-200 rounded px-2 py-0.5"
                        value={u.role}
                        onChange={(e) => handleChangeRole(key, e.target.value as Role)}
                      >
                        <option value="student">Student</option>
                        <option value="educator">Educator</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </td>

                  <td className="py-3 px-2">
                    <button
                      onClick={() => handleToggleStatus(key)}
                      className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono tracking-wider uppercase font-bold cursor-pointer transition-colors ${
                        currentStatus === 'Active' 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-250 hover:bg-emerald-200' 
                          : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                      }`}
                    >
                      {currentStatus}
                    </button>
                  </td>

                  <td className="py-3 px-2 text-right">
                    <button
                      onClick={() => handleDeleteUser(key)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                      title="Decommission User Account"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setShowAddModal(false)} />
          
          <div className="relative bg-white rounded-2xl border border-gray-200 w-full max-w-sm p-6 shadow-xl animate-scale-up z-10 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-150 pb-2.5">
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                <UserPlus size={16} className="text-indigo-650" />
                Add New Community User
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4 text-xs">
              <div>
                <label className="text-[10px] font-bold text-gray-400 block mb-1">Full Identity Name</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Liam Oswald"
                  className="w-full bg-slate-50 border border-gray-200 p-2 rounded-lg"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 block mb-1">Registered Email Address</label>
                <input 
                  type="email" 
                  required 
                  placeholder="email@eduunity.io"
                  className="w-full bg-slate-50 border border-gray-200 p-2 rounded-lg font-mono"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 block mb-1">Default System Privilege</label>
                <select 
                  className="w-full bg-slate-50 border border-gray-200 p-2 rounded-lg font-bold"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as Role)}
                >
                  <option value="student">Student Authority</option>
                  <option value="educator">Educator Authority</option>
                  <option value="admin">Administrator Authority</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 block mb-1">Custom Account Biography</label>
                <textarea 
                  rows={3}
                  placeholder="Tell us about this learner or mentor profile..."
                  className="w-full bg-slate-50 border border-gray-200 p-2 rounded-lg"
                  value={newBio}
                  onChange={(e) => setNewBio(e.target.value)}
                />
              </div>

              <button 
                type="submit" 
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg cursor-pointer transition-colors"
              >
                Provision User Account
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};