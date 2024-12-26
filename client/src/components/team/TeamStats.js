import React, { useState, useEffect } from 'react';
import { mlbApi } from '../../services/api';
import LoadingState from '../LoadingState';

function TeamStats({ teamId }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [season, setSeason] = useState(2023); // Default to 2023 season

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                setError(null);
                console.log('Fetching stats for:', { teamId, season }); // Debug log
                const response = await mlbApi.getTeamStats(teamId, season);
                console.log('Stats response:', response); // Debug log
                
                if (response.data.success) {
                    setStats(response.data.data);
                } else {
                    setError(response.data.error || 'Failed to load statistics');
                }
            } catch (error) {
                console.error('Error fetching team stats:', error);
                setError(error.response?.data?.error || 'Statistics not available for this season');
            } finally {
                setLoading(false);
            }
        };

        if (teamId && season) {
            fetchStats();
        }
    }, [teamId, season]);

    if (loading) return <LoadingState />;
    if (error) return (
        <div className="text-center py-8">
            <p className="text-red-500 mb-4">{error}</p>
            <select
                value={season}
                onChange={(e) => setSeason(Number(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-md"
            >
                {[2023, 2022, 2021, 2020].map(year => (
                    <option key={year} value={year}>
                        {year} Season
                    </option>
                ))}
            </select>
        </div>
    );
    if (!stats) return <div>No statistics available</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Team Statistics</h2>
                <select
                    value={season}
                    onChange={(e) => setSeason(Number(e.target.value))}
                    className="px-4 py-2 border border-gray-300 rounded-md"
                >
                    {[2023, 2022, 2021, 2020].map(year => (
                        <option key={year} value={year}>
                            {year} Season
                        </option>
                    ))}
                </select>
            </div>

            {/* Team Batting Stats */}
            <div>
                <h3 className="text-lg font-semibold mb-4">Batting Statistics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {stats.batting && Object.entries(stats.batting).map(([key, value]) => (
                        <div key={key} className="bg-gray-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-500">{key}</div>
                            <div className="text-lg font-semibold">{value}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Team Pitching Stats */}
            <div>
                <h3 className="text-lg font-semibold mb-4">Pitching Statistics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {stats.pitching && Object.entries(stats.pitching).map(([key, value]) => (
                        <div key={key} className="bg-gray-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-500">{key}</div>
                            <div className="text-lg font-semibold">{value}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default TeamStats; 