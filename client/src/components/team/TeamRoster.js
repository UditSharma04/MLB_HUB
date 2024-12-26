import React, { useState, useEffect } from 'react';
import { mlbApi } from '../../services/api';
import LoadingState from '../LoadingState';

function TeamRoster({ teamId }) {
    const [roster, setRoster] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [season] = useState(new Date().getFullYear());

    useEffect(() => {
        const fetchRoster = async () => {
            try {
                setLoading(true);
                setError(null);
                console.log('Fetching roster for:', { teamId, season }); // Debug log
                const response = await mlbApi.getTeamRoster(teamId, season);
                console.log('Roster response:', response); // Debug log

                if (response.data.success && response.data.data.roster) {
                    setRoster(response.data.data.roster);
                } else {
                    setError('No roster data available');
                }
            } catch (error) {
                console.error('Error fetching roster:', error);
                setError('Failed to load roster');
            } finally {
                setLoading(false);
            }
        };

        if (teamId) {
            fetchRoster();
        }
    }, [teamId, season]);

    if (loading) return <LoadingState />;
    if (error) return <div className="text-red-500">{error}</div>;
    if (!roster.length) return <div>No roster available</div>;

    // Group players by position
    const groupedRoster = roster.reduce((acc, player) => {
        const position = player.position.type;
        if (!acc[position]) {
            acc[position] = [];
        }
        acc[position].push(player);
        return acc;
    }, {});

    // Sort positions in preferred order
    const positionOrder = ['Pitcher', 'Catcher', 'Infielder', 'Outfielder', 'Designated Hitter', 'Two-Way Player'];
    const sortedPositions = Object.keys(groupedRoster).sort(
        (a, b) => positionOrder.indexOf(a) - positionOrder.indexOf(b)
    );

    return (
        <div className="space-y-8">
            {sortedPositions.map(position => (
                <div key={position} className="space-y-4">
                    <h2 className="text-xl font-semibold text-mlb-navy">{position}s</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {groupedRoster[position].map(player => (
                            <div 
                                key={player.person.id} 
                                className="bg-white rounded-lg shadow-sm p-4 border border-gray-100"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden">
                                        <img
                                            src={`https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/${player.person.id}/headshot/67/current`}
                                            alt={player.person.fullName}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">{player.person.fullName}</h3>
                                        <p className="text-sm text-gray-600">{player.position.name}</p>
                                        <p className="text-xs text-gray-500">
                                            #{player.jerseyNumber} • {player.status.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default TeamRoster; 