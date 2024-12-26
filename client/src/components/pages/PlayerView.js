import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { mlbApi } from '../../services/api';
import LoadingState from '../LoadingState';

function PlayerView() {
    const { playerId } = useParams();
    const [player, setPlayer] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview'); // overview, batting, pitching

    useEffect(() => {
        fetchPlayerData();
    }, [playerId]);

    const fetchPlayerData = async () => {
        try {
            setLoading(true);
            const season = new Date().getFullYear();

            console.log('Fetching player data for ID:', playerId);

            const [playerResponse, battingResponse, pitchingResponse] = await Promise.all([
                mlbApi.getPlayerDetails(playerId),
                mlbApi.getBattingStats(playerId, season),
                mlbApi.getPitchingStats(playerId, season)
            ]);

            console.log('Player Response:', playerResponse);
            console.log('Batting Response:', battingResponse);

            if (playerResponse.data.success && playerResponse.data.data.people) {
                setPlayer(playerResponse.data.data.people[0]);
                
                // Handle stats data properly
                const battingStats = battingResponse.data.data.stats?.[0]?.splits || [];
                const pitchingStats = pitchingResponse.data.data.stats?.[0]?.splits || [];
                
                setStats({
                    batting: battingStats,
                    pitching: pitchingStats
                });
            } else {
                throw new Error('Invalid player data received');
            }

            setLoading(false);
        } catch (error) {
            console.error('Error fetching player data:', error);
            setError(error.message || 'Failed to load player data');
            setLoading(false);
        }
    };

    const calculateCareerStats = (stats) => {
        if (!stats?.batting || !Array.isArray(stats.batting) || stats.batting.length === 0) {
            return {
                games: 0,
                avg: '.000',
                homeRuns: 0,
                rbi: 0,
                hits: 0,
                runs: 0
            };
        }
        
        return stats.batting.reduce((acc, season) => {
            if (!season.stat) return acc;
            
            return {
                games: (acc.games || 0) + (parseInt(season.stat.gamesPlayed) || 0),
                avg: season.stat.avg || '.000',
                homeRuns: (acc.homeRuns || 0) + (parseInt(season.stat.homeRuns) || 0),
                rbi: (acc.rbi || 0) + (parseInt(season.stat.rbi) || 0),
                hits: (acc.hits || 0) + (parseInt(season.stat.hits) || 0),
                runs: (acc.runs || 0) + (parseInt(season.stat.runs) || 0)
            };
        }, {
            games: 0,
            avg: '.000',
            homeRuns: 0,
            rbi: 0,
            hits: 0,
            runs: 0
        });
    };

    const formatBattingStats = (stats) => {
        if (!Array.isArray(stats)) return [];
        
        return stats.map(season => ({
            year: season.season || '',
            team: season.team?.name || '-',
            games: parseInt(season.stat?.gamesPlayed) || 0,
            avg: season.stat?.avg || '.000',
            obp: season.stat?.obp || '.000',
            slg: season.stat?.slg || '.000',
            hits: parseInt(season.stat?.hits) || 0,
            hr: parseInt(season.stat?.homeRuns) || 0,
            rbi: parseInt(season.stat?.rbi) || 0,
            sb: parseInt(season.stat?.stolenBases) || 0
        }));
    };

    if (loading) return <LoadingState />;

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Player Header */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
                <div className="flex items-center space-x-6">
                    <div className="w-32 h-32 bg-gray-200 rounded-full overflow-hidden">
                        <img
                            src={`https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/${playerId}/headshot/67/current`}
                            alt={player?.fullName}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-mlb-navy">
                            {player?.fullName}
                            <span className="ml-3 text-2xl text-mlb-blue">
                                #{player?.primaryNumber || 'N/A'}
                            </span>
                        </h1>
                        <div className="mt-2 flex items-center space-x-4 text-gray-600">
                            <span>{player?.primaryPosition?.name}</span>
                            <span>•</span>
                            <span>B/T: {player?.batSide?.code || '-'}/{player?.pitchHand?.code || '-'}</span>
                            <span>•</span>
                            <span>Age: {player?.currentAge}</span>
                        </div>
                        <div className="mt-1 text-gray-500">
                            {player?.currentTeam?.name}
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Navigation */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="border-b">
                    <nav className="flex">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`px-6 py-4 text-sm font-medium ${
                                activeTab === 'overview'
                                    ? 'border-b-2 border-mlb-blue text-mlb-blue'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('batting')}
                            className={`px-6 py-4 text-sm font-medium ${
                                activeTab === 'batting'
                                    ? 'border-b-2 border-mlb-blue text-mlb-blue'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Batting Stats
                        </button>
                        {player?.primaryPosition?.type === 'Pitcher' && (
                            <button
                                onClick={() => setActiveTab('pitching')}
                                className={`px-6 py-4 text-sm font-medium ${
                                    activeTab === 'pitching'
                                        ? 'border-b-2 border-mlb-blue text-mlb-blue'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Pitching Stats
                            </button>
                        )}
                    </nav>
                </div>

                {/* Stats Content */}
                <div className="p-6">
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Personal Info</h3>
                                <dl className="grid grid-cols-2 gap-4">
                                    <div>
                                        <dt className="text-sm text-gray-500">Height</dt>
                                        <dd className="text-sm font-medium">{player?.height}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm text-gray-500">Weight</dt>
                                        <dd className="text-sm font-medium">{player?.weight}lb</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm text-gray-500">Birth Date</dt>
                                        <dd className="text-sm font-medium">
                                            {new Date(player?.birthDate).toLocaleDateString()}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm text-gray-500">Birth Place</dt>
                                        <dd className="text-sm font-medium">
                                            {player?.birthCity}, {player?.birthCountry}
                                        </dd>
                                    </div>
                                </dl>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Career Summary</h3>
                                {stats && (
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <div className="text-sm text-gray-500">Games Played</div>
                                                <div className="text-xl font-semibold">
                                                    {calculateCareerStats(stats)?.games || 0}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-gray-500">Career AVG</div>
                                                <div className="text-xl font-semibold">
                                                    {calculateCareerStats(stats)?.avg || '.000'}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-gray-500">Home Runs</div>
                                                <div className="text-xl font-semibold">
                                                    {calculateCareerStats(stats)?.homeRuns || 0}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-gray-500">RBI</div>
                                                <div className="text-xl font-semibold">
                                                    {calculateCareerStats(stats)?.rbi || 0}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'batting' && (
                        <div className="overflow-x-auto">
                            <h3 className="text-lg font-semibold mb-4">Batting Statistics</h3>
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">G</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AVG</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">OBP</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SLG</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">H</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">HR</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RBI</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SB</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {formatBattingStats(stats?.batting).map((season) => (
                                        <tr key={season.year}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{season.year}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{season.team}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{season.games}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{season.avg}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{season.obp}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{season.slg}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{season.hits}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{season.hr}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{season.rbi}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{season.sb}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'pitching' && (
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Pitching Statistics</h3>
                            {/* Add pitching stats table here */}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default PlayerView; 