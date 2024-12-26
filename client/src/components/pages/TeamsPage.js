import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { mlbApi } from '../../services/api';
import LoadingState from '../LoadingState';
import TeamRoster from '../team/TeamRoster';
import TeamStats from '../team/TeamStats';
import TeamStandings from '../team/TeamStandings';
import RecentGames from '../team/RecentGames';

function TeamsPage() {
    const { teamId } = useParams();
    const [activeTab, setActiveTab] = useState('roster');
    const [team, setTeam] = useState(null);
    const [allTeams, setAllTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeLeague, setActiveLeague] = useState('all');

    const tabs = [
        { id: 'roster', label: 'Roster' },
        { id: 'stats', label: 'Statistics' },
        { id: 'standings', label: 'Standings' },
        { id: 'games', label: 'Recent Games' }
    ];

    const leagueTabs = [
        { id: 'all', label: 'All' },
        { id: 'American League', label: 'American League' },
        { id: 'National League', label: 'National League' }
    ];

    // Combined useEffect for fetching both team list and individual team data
    useEffect(() => {
        const fetchAllTeams = async () => {
            try {
                setLoading(true);
                const response = await mlbApi.getAllTeams();
                if (response.data.success && response.data.data.teams) {
                    setAllTeams(response.data.data.teams);
                }
            } catch (error) {
                console.error('Error fetching teams:', error);
                setError('Failed to load teams');
            } finally {
                setLoading(false);
            }
        };

        const fetchTeamData = async () => {
            try {
                setLoading(true);
                const response = await mlbApi.getTeamDetails(teamId);
                if (response.data.success) {
                    setTeam(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching team data:', error);
                setError('Failed to load team data');
            } finally {
                setLoading(false);
            }
        };

        if (teamId) {
            fetchTeamData();
        } else {
            fetchAllTeams();
        }
    }, [teamId]);

    // Group teams by league and division
    const groupedTeams = allTeams.reduce((acc, team) => {
        const league = team.league.name;
        const division = team.division.name;
        
        if (!acc[league]) {
            acc[league] = {};
        }
        if (!acc[league][division]) {
            acc[league][division] = [];
        }
        
        acc[league][division].push(team);
        return acc;
    }, {});

    // Filter teams based on active league
    const filteredGroupedTeams = activeLeague === 'all' 
        ? groupedTeams 
        : { [activeLeague]: groupedTeams[activeLeague] };

    if (loading) return <LoadingState />;
    if (error) return <div className="p-6 text-red-500">{error}</div>;

    // Teams listing page
    if (!teamId) {
        return (
            <div className="p-6">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-mlb-navy">MLB Teams</h1>
                    <div className="flex space-x-4">
                        {leagueTabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveLeague(tab.id)}
                                className={`px-4 py-2 rounded-md text-sm font-medium ${
                                    activeLeague === tab.id
                                        ? 'bg-mlb-blue text-white'
                                        : 'text-gray-600 hover:text-mlb-blue'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {Object.entries(filteredGroupedTeams).map(([league, divisions]) => (
                    <div key={league}>
                        {Object.entries(divisions).map(([division, teams]) => (
                            <div key={division} className="mb-8">
                                <h2 className="text-xl font-semibold mb-6 text-mlb-navy">
                                    {division}
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                                    {teams.map(team => (
                                        <Link
                                            key={team.id}
                                            to={`/team/${team.id}`}
                                            className="block"
                                        >
                                            <div className="bg-white rounded-lg p-4 hover:shadow-lg transition-shadow">
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-16 h-16 flex-shrink-0">
                                                        <img
                                                            src={team.teamLogoUrl}
                                                            alt={team.name}
                                                            className="w-full h-full object-contain"
                                                        />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-lg text-mlb-navy">
                                                            {team.name}
                                                        </h3>
                                                        <p className="text-sm text-gray-600">
                                                            {team.venue.name}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {team.league.name} • {division}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        );
    }

    // Individual team page
    if (!team) return <div className="p-6">Team not found</div>;

    return (
        <div className="p-6">
            {/* Team Header */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex items-center space-x-6">
                    <img
                        src={team.teamLogoUrl}
                        alt={team.name}
                        className="w-24 h-24 object-contain"
                    />
                    <div>
                        <h1 className="text-3xl font-bold">{team.name}</h1>
                        <p className="text-gray-600">
                            {team.league.name} • {team.division.name}
                        </p>
                        <p className="text-gray-500">{team.venue.name}</p>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="flex space-x-8">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === tab.id
                                    ? 'border-mlb-blue text-mlb-blue'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                {activeTab === 'roster' && <TeamRoster teamId={teamId} />}
                {activeTab === 'stats' && <TeamStats teamId={teamId} />}
                {activeTab === 'standings' && <TeamStandings teamId={teamId} />}
                {activeTab === 'games' && <RecentGames teamId={teamId} />}
            </div>
        </div>
    );
}

export default TeamsPage; 