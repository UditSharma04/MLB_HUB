import React, { useState, useEffect } from 'react';
import { mlbApi } from '../../services/api';
import LoadingState from '../LoadingState';

function TeamStandings({ teamId }) {
    const [standings, setStandings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStandings = async () => {
            try {
                setLoading(true);
                const response = await mlbApi.getTeamStandings(teamId);
                if (response.data.success) {
                    setStandings(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching standings:', error);
                setError('Failed to load standings');
            } finally {
                setLoading(false);
            }
        };

        fetchStandings();
    }, [teamId]);

    if (loading) return <LoadingState />;
    if (error) return <div className="text-red-500">{error}</div>;
    if (!standings) return <div>No standings available</div>;

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">W</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">L</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PCT</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GB</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">L10</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STRK</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {standings.map((team) => (
                        <tr key={team.id} className={team.id === parseInt(teamId) ? 'bg-blue-50' : ''}>
                            <td className="px-6 py-4 whitespace-nowrap">{team.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{team.wins}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{team.losses}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{team.winningPercentage}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{team.gamesBack}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{team.lastTen}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{team.streak}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default TeamStandings; 