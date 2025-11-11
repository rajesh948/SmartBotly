import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const Settings = () => {
  const { user } = useAuth();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and preferences</p>
      </div>

      <div className="card">
        <h3 className="text-lg font-bold mb-4">Account Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input type="text" value={user.name} className="input-field" readOnly />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={user.email} className="input-field" readOnly />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <input type="text" value={user.role} className="input-field" readOnly />
          </div>
        </div>
      </div>

      <div className="card mt-6">
        <h3 className="text-lg font-bold mb-4">Business Settings</h3>
        <p className="text-gray-600">Business settings can be configured by the administrator.</p>
      </div>
    </div>
  );
};

export default Settings;
