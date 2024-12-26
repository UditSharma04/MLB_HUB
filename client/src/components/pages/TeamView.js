import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { mlbApi } from '../../services/api';
import LoadingState from '../LoadingState';

function TeamView() {
    const { teamId } = useParams();
    const [team, setTeam] = useState(null);
    const [roster, setRoster] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        fetchTeamData();
    }, [teamId]);

    useEffect(() => {
        console.log('Current team data:', team);
    }, [team]);

    const fetchTeamData = async () => {
        try {
            setLoading(true);
            const season = new Date().getFullYear();
            
            // First get the team details
            const teamDetailsResponse = await mlbApi.getAllTeams();
            const currentTeam = teamDetailsResponse.data.data.teams.find(t => t.id.toString() === teamId);
            
            // Then get the roster
            const rosterResponse = await mlbApi.getTeamRoster(teamId, season);

            if (currentTeam) {
                setTeam(currentTeam);
            }

            if (rosterResponse.data.success) {
                setRoster(rosterResponse.data.data.roster || []);
            }

            setLoading(false);
        } catch (error) {
            console.error('Error fetching team data:', error);
            setError('Failed to load team data');
            setLoading(false);
        }
    };

    const filterRoster = (players) => {
        switch (activeTab) {
            case 'pitchers':
                return players.filter(player => 
                    player.position.type === 'Pitcher' || 
                    player.position.name === 'Two-Way Player'
                );
            case 'position':
                return players.filter(player => 
                    player.position.type !== 'Pitcher'
                );
            default:
                return players;
        }
    };

    const sortRoster = (players) => {
        return players.sort((a, b) => {
            // Sort by jersey number
            const numA = parseInt(a.jerseyNumber) || 999;
            const numB = parseInt(b.jerseyNumber) || 999;
            return numA - numB;
        });
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

    const filteredRoster = sortRoster(filterRoster(roster));

    return (
        <div className="p-6">
            {/* Team Header */}
            <div className="bg-gradient-to-br from-mlb-blue to-mlb-navy rounded-lg shadow-lg p-8 mb-8 text-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-8">
                        <div className="w-32 h-32 bg-white rounded-full p-4 shadow-lg flex items-center justify-center">
                            <img
                                src={`https://www.mlbstatic.com/team-logos/${teamId}.svg`}
                                alt={team?.name || 'Team Logo'}
                                className="w-24 h-24 object-contain"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = '/mlb-fallback-logo.png';
                                }}
                            />
                        </div>
                        <div>
                            <div className="text-lg font-medium opacity-90">
                                {team?.league?.name || 'MLB'} {team?.division?.name ? `• ${team.division.name}` : ''}
                            </div>
                            <h1 className="text-4xl font-bold mt-2">
                                {team?.name || 'Loading team...'}
                            </h1>
                            <div className="flex items-center mt-3 text-white/80">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span>{team?.venue?.name || 'Home Stadium'}</span>
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-bold">2024</div>
                        <div className="text-white/80">Season</div>
                    </div>
                </div>
                
                {/* Quick Stats Bar */}
                <div className="grid grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/20">
                    <div>
                        <div className="text-2xl font-bold">{roster.length}</div>
                        <div className="text-sm text-white/80">Active Players</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold">
                            {roster.filter(p => p.position.type === 'Pitcher').length}
                        </div>
                        <div className="text-sm text-white/80">Pitchers</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold">
                            {roster.filter(p => p.position.type !== 'Pitcher').length}
                        </div>
                        <div className="text-sm text-white/80">Position Players</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold">
                            {roster.filter(p => p.status?.code !== 'A').length}
                        </div>
                        <div className="text-sm text-white/80">Inactive</div>
                    </div>
                </div>
            </div>

            {/* Roster Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-mlb-navy">Team Roster</h2>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                                activeTab === 'all' 
                                    ? 'bg-mlb-blue text-white' 
                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                            }`}
                        >
                            All Players ({roster.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('pitchers')}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                                activeTab === 'pitchers' 
                                    ? 'bg-mlb-blue text-white' 
                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                            }`}
                        >
                            Pitchers ({roster.filter(p => p.position.type === 'Pitcher').length})
                        </button>
                        <button
                            onClick={() => setActiveTab('position')}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                                activeTab === 'position' 
                                    ? 'bg-mlb-blue text-white' 
                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                            }`}
                        >
                            Position Players ({roster.filter(p => p.position.type !== 'Pitcher').length})
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredRoster.map((player) => (
                        <Link
                            key={player.person.id}
                            to={`/player/${player.person.id}`}
                            className="block"
                        >
                            <div className="bg-gray-50 p-4 rounded-lg hover:shadow-md transition-shadow border border-gray-100 hover:border-mlb-blue">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center">
                                            <span className="text-2xl font-bold text-mlb-blue mr-3">
                                                #{player.jerseyNumber || 'N/A'}
                                            </span>
                                            <div>
                                                <h3 className="font-semibold text-lg text-gray-900">
                                                    {player.person.fullName}
                                                </h3>
                                                <p className="text-sm text-gray-600">
                                                    {player.position.name}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            <span className="px-2 py-1 bg-white rounded-full text-xs text-gray-600 border border-gray-200">
                                                Bats: {player.person.batSide?.code || '-'}
                                            </span>
                                            <span className="px-2 py-1 bg-white rounded-full text-xs text-gray-600 border border-gray-200">
                                                Throws: {player.person.pitchHand?.code || '-'}
                                            </span>
                                            <span className="px-2 py-1 bg-white rounded-full text-xs text-gray-600 border border-gray-200">
                                                Age: {player.person.currentAge || 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                    {player.status && player.status.code !== 'A' && (
                                        <span className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded-full whitespace-nowrap ml-2">
                                            {player.status.description}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default TeamView; 