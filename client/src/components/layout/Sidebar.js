import { Link } from 'react-router-dom';
import {
  HomeIcon,
  UserGroupIcon,
  UserIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

function Sidebar() {
  return (
    <div className="w-64 bg-mlb-navy text-white min-h-screen">
      <div className="p-6">
        <div className="mb-8">
          <h2 className="text-xl font-bold">MLB Hub</h2>
        </div>
        <nav className="space-y-4">
          <Link to="/" className="flex items-center space-x-3 hover:bg-mlb-blue p-3 rounded-lg transition-colors duration-200">
            <HomeIcon className="h-6 w-6 flex-shrink-0" />
            <span className="text-sm font-medium">Dashboard</span>
          </Link>
          
          <Link to="/teams" className="flex items-center space-x-3 hover:bg-mlb-blue p-3 rounded-lg transition-colors duration-200">
            <UserGroupIcon className="h-6 w-6 flex-shrink-0" />
            <span className="text-sm font-medium">Teams</span>
          </Link>
          
          <Link to="/players" className="flex items-center space-x-3 hover:bg-mlb-blue p-3 rounded-lg transition-colors duration-200">
            <UserIcon className="h-6 w-6 flex-shrink-0" />
            <span className="text-sm font-medium">Players</span>
          </Link>
          
          <Link to="/settings" className="flex items-center space-x-3 hover:bg-mlb-blue p-3 rounded-lg transition-colors duration-200">
            <Cog6ToothIcon className="h-6 w-6 flex-shrink-0" />
            <span className="text-sm font-medium">Settings</span>
          </Link>
        </nav>
      </div>
    </div>
  );
}

export default Sidebar; 