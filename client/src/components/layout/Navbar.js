import { useState } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';

function Navbar() {
  const [language, setLanguage] = useState('en');

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-mlb-blue">MLB Hub</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full hover:bg-gray-100 flex items-center justify-center">
              <BellIcon className="h-6 w-6 text-gray-500" />
            </button>
            
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="block w-24 py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-mlb-blue focus:border-mlb-blue text-sm"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="ja">日本語</option>
            </select>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar; 