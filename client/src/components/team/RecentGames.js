import React, { useState, useEffect } from 'react';
import { mlbApi } from '../../services/api';
import LoadingState from '../LoadingState';

function RecentGames({ teamId }) {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchGames = async () => {
            try {
                setLoading(true);
                setError(null);
                console.log('Fetching recent games for:', teamId); // Debug log
                const response = await mlbApi.getTeamRecentGames(teamId);
                console.log('Recent games response:', response); // Debug log

                if (response.data.success) {
                    setGames(response.data.data);
                } else {
                    setError('No games data available');
                }
            } catch (error) {
                console.error('Error fetching recent games:', error);
                setError('Failed to load recent games');
            } finally {
                setLoading(false);
            }
        };

        if (teamId) {
            fetchGames();
        }
    }, [teamId]);

    if (loading) return <LoadingState />;
    if (error) return <div className="text-red-500">{error}</div>;
    if (!games.length) return <div>No recent games available</div>;

    return (
        <div className="space-y-4">
            {games.map((game) => (
                <div 
                    key={game.id} 
                    className="bg-white rounded-lg shadow-sm p-4 border border-gray-100"
                >
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-8">
                            <div className="text-center min-w-[120px]">
                                <div className="text-sm font-medium">{game.homeTeam.name}</div>
                                <div className="text-2xl font-bold">{game.homeTeam.score}</div>
                            </div>
                            <div className="text-gray-400 font-medium">vs</div>
                            <div className="text-center min-w-[120px]">
                                <div className="text-sm font-medium">{game.awayTeam.name}</div>
                                <div className="text-2xl font-bold">{game.awayTeam.score}</div>
                            </div>
                        </div>
                        <div className="text-sm text-gray-500">
                            {new Date(game.gameDate).toLocaleDateString(undefined, {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric'
                            })}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default RecentGames; 