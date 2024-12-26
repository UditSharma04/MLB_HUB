import React from 'react';

function Settings() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-mlb-navy mb-6">Settings</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Preferences</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Language</label>
            <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="ja">日本語</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Notifications</label>
            <div className="mt-2">
              <label className="inline-flex items-center">
                <input type="checkbox" className="rounded border-gray-300" />
                <span className="ml-2">Game Alerts</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings; 