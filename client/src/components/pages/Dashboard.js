import React, { useState, useEffect } from 'react';
import { mlbApi } from '../../services/api';

function Dashboard() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTodayGames();
  }, []);

  const fetchTodayGames = async () => {
    try {
      const today = new Date();
      const formattedDate = today.toISOString().split('T')[0];
      const season = today.getFullYear();
      const response = await mlbApi.getGames(formattedDate, season);
      
      // Add some debugging
      console.log('API Response:', response);
      
      // Handle empty or invalid responses
      if (response.data && Array.isArray(response.data.data)) {
        setGames(response.data.data);
      } else {
        setGames([]);
        console.warn('No games data in response:', response);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching games:', err);
      setError('Failed to fetch games');
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-mlb-navy mb-6">Fan Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Live Games Section */}
        <div className="col-span-2 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <span className="mr-2">Live Games</span>
            {loading && <span className="animate-pulse text-mlb-red">●</span>}
          </h2>
          
          {error ? (
            <p className="text-red-500">{error}</p>
          ) : loading ? (
            <p className="text-gray-600">Loading games...</p>
          ) : games.length === 0 ? (
            <p className="text-gray-600">No live games at the moment</p>
          ) : (
            <div className="space-y-4">
              {games.map((game) => (
                <div key={game.id} className="border rounded-lg p-4 hover:border-mlb-blue cursor-pointer">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{game.teams?.away.team.name} @ {game.teams?.home.team.name}</p>
                      <p className="text-sm text-gray-500">{game.venue?.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{game.teams?.away.score} - {game.teams?.home.score}</p>
                      <p className="text-sm text-mlb-red">{game.status?.detailedState}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Fan Engagement Features */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Personalized Highlights</h2>
            <div className="space-y-2">
              <button className="btn-primary w-full">Generate Game Recap</button>
              <button className="btn-secondary w-full">View AI Analysis</button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Fan Zone</h2>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium">Game Predictions</h3>
                <p className="text-sm text-gray-600">AI-powered win probabilities</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium">Player Insights</h3>
                <p className="text-sm text-gray-600">Performance analytics</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard; 