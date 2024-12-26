import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './components/pages/Dashboard';
import TeamView from './components/pages/TeamView';
import PlayerView from './components/pages/PlayerView';
import Settings from './components/pages/Settings';
import TeamsPage from './components/pages/TeamsPage';
import PlayersPage from './components/pages/PlayersPage';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <UserProvider>
      <Router>
        <div className="flex h-screen bg-gray-100">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Navbar />
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/teams" element={<TeamsPage />} />
                <Route path="/team/:teamId" element={<TeamsPage />} />
                <Route path="/players" element={<PlayersPage />} />
                <Route path="/player/:playerId" element={<PlayerView />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </UserProvider>
  );
}

export default App;
