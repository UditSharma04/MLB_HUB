import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { mlbApi } from '../../services/api';
import LoadingState from '../LoadingState';
import { debounce } from 'lodash';

function PlayersPage() {
    const [players, setPlayers] = useState([]);
    const [teams, setTeams] = useState([]);
    const [currentTeamIndex, setCurrentTeamIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [position, setPosition] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const playersPerPage = 12;
    const BATCH_SIZE = 10; // Increased from 5 to 10 teams per batch

    // Add this shuffle function at the top of the component
    const shuffleArray = (array) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    // Update the initial load effect
    useEffect(() => {
        const cachedPlayers = localStorage.getItem('mlbPlayers');
        const cachedTeams = localStorage.getItem('mlbTeams');
        const cachedTimestamp = localStorage.getItem('mlbPlayersTimestamp');
        const ONE_DAY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

        // Check if we have valid cached data
        if (cachedPlayers && cachedTeams && cachedTimestamp && 
            (Date.now() - Number(cachedTimestamp)) < ONE_DAY) {
            const parsedPlayers = JSON.parse(cachedPlayers);
            const parsedTeams = JSON.parse(cachedTeams);
            
            // Only use cache if we have a significant number of players
            if (parsedPlayers.length >= 1000) {
                setPlayers(parsedPlayers);
                setTeams(parsedTeams);
                setCurrentTeamIndex(30); // Set to max teams to prevent further loading
                setLoading(false);
                return;
            }
        }

        // If no cache, expired, or insufficient players, fetch fresh data
        const fetchTeams = async () => {
            try {
                setLoading(true);
                const response = await mlbApi.getAllTeams();
                if (response.data.success && response.data.data.teams) {
                    const mlbTeams = response.data.data.teams;
                    setTeams(mlbTeams);
                    localStorage.setItem('mlbTeams', JSON.stringify(mlbTeams));
                }
            } catch (error) {
                console.error('Error fetching teams:', error);
                setError('Failed to load teams');
            }
        };
        fetchTeams();
    }, []);

    // Update the players cache effect
    useEffect(() => {
        if (players.length > 0 && teams.length > 0) {
            localStorage.setItem('mlbPlayers', JSON.stringify(players));
            localStorage.setItem('mlbTeams', JSON.stringify(teams));
            localStorage.setItem('mlbPlayersTimestamp', Date.now().toString());
        }
    }, [players, teams]);

    // Update fetchPlayersBatch to check if we need to load more
    const fetchPlayersBatch = useCallback(async (startIndex) => {
        try {
            setLoadingMore(true);
            const endIndex = Math.min(startIndex + BATCH_SIZE, teams.length);
            const teamIds = teams.slice(startIndex, endIndex).map(team => team.id);
            
            console.log(`Fetching teams ${startIndex + 1}-${endIndex} of ${teams.length}`);
            const response = await mlbApi.getTeamRosters(teamIds.join(','));
            
            if (response.data.success) {
                const newPlayers = [];
                response.data.data.forEach(teamRoster => {
                    const currentTeam = teams.find(t => t.id === teamRoster.teamId);
                    if (currentTeam && teamRoster.roster) {
                        const playersWithTeam = teamRoster.roster.map(player => ({
                            ...player,
                            teamInfo: currentTeam
                        }));
                        newPlayers.push(...playersWithTeam);
                    }
                });

                setPlayers(prevPlayers => {
                    const uniquePlayers = newPlayers.filter(
                        newPlayer => !prevPlayers.some(
                            existingPlayer => existingPlayer.person.id === newPlayer.person.id
                        )
                    );
                    return shuffleArray([...prevPlayers, ...uniquePlayers]);
                });

                setCurrentTeamIndex(endIndex);
                console.log(`Loaded ${newPlayers.length} players from ${teamIds.length} teams`);
            }
        } catch (error) {
            console.error('Error fetching player batch:', error);
        } finally {
            setLoadingMore(false);
            setLoading(false);
        }
    }, [teams]);

    // Update the initial team loading effect
    useEffect(() => {
        if (teams.length > 0 && currentTeamIndex === 0) {
            console.log('Starting with first team:', teams[0].name);
            fetchPlayersBatch(0);
        }
    }, [teams, fetchPlayersBatch]);

    // Load more players when scrolling near bottom
    const loadMorePlayers = useCallback(() => {
        if (!loadingMore && teams.length > 0 && currentTeamIndex < teams.length - 1) {
            const nextTeam = teams[currentTeamIndex + 1];
            console.log(`Loading team ${currentTeamIndex + 1}/${teams.length}: ${nextTeam.name}`);
            fetchPlayersBatch(currentTeamIndex + 1);
        }
    }, [currentTeamIndex, teams, loadingMore, fetchPlayersBatch]);

    const handleSearchInput = (e) => {
        e.preventDefault(); // Prevent form submission
        setSearchTerm(e.target.value);
    };

    const positions = [
        { value: 'all', label: 'All Positions' },
        { value: 'P', label: 'Pitchers' },
        { value: 'C', label: 'Catchers' },
        { value: 'IF', label: 'Infielders' },
        { value: 'OF', label: 'Outfielders' }
    ];

    const filterPlayers = (players) => {
        return players.filter(player => {
            const matchesSearch = !searchTerm || 
                player.person.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (player.teamInfo?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesPosition = position === 'all' || 
                (position === 'P' && (
                    player.position.type === 'Pitcher' || 
                    player.position.abbreviation === 'P'
                )) ||
                (position === 'C' && player.position.abbreviation === 'C') ||
                (position === 'IF' && ['1B', '2B', '3B', 'SS'].includes(player.position.abbreviation)) ||
                (position === 'OF' && ['LF', 'CF', 'RF', 'OF'].includes(player.position.abbreviation));
            
            return matchesSearch && matchesPosition;
        });
    };

    const filteredPlayers = filterPlayers(players);
    const totalPages = Math.ceil(filteredPlayers.length / playersPerPage);
    const currentPlayers = filteredPlayers.slice(
        (currentPage - 1) * playersPerPage,
        currentPage * playersPerPage
    );

    // Add debug logging
    useEffect(() => {
        console.log({
            'Total Players': players.length,
            'Current Team Index': currentTeamIndex,
            'Total Teams': teams.length,
            'Loading More': loadingMore,
            'Current Team': teams[currentTeamIndex]?.name || 'None',
            'Next Team': teams[currentTeamIndex + 1]?.name || 'None',
            'Player Sample': players.slice(0, 2).map(p => ({
                name: p.person.fullName,
                team: p.teamInfo?.name
            }))
        });
    }, [players.length, currentTeamIndex, teams.length, loadingMore, teams]);

    // Update the team progression effect
    useEffect(() => {
        const loadNextBatch = async () => {
            if (!loadingMore && currentTeamIndex < teams.length) {
                console.log(`Loading teams ${currentTeamIndex + 1}-${Math.min(currentTeamIndex + BATCH_SIZE, teams.length)} of ${teams.length}`);
                await fetchPlayersBatch(currentTeamIndex);
            }
        };

        if (teams.length > 0) {
            loadNextBatch();
        }
    }, [currentTeamIndex, teams, loadingMore, fetchPlayersBatch]);

    // Add a refresh button to force reload
    const handleRefresh = useCallback(() => {
        localStorage.removeItem('mlbPlayers');
        localStorage.removeItem('mlbTeams');
        localStorage.removeItem('mlbPlayersTimestamp');
        setPlayers([]);
        setTeams([]);
        setCurrentTeamIndex(0);
        setLoading(true);
        
        // Fetch teams again
        const fetchTeams = async () => {
            try {
                const response = await mlbApi.getAllTeams();
                if (response.data.success && response.data.data.teams) {
                    const mlbTeams = response.data.data.teams;
                    setTeams(mlbTeams);
                    // Start loading players after teams are fetched
                    fetchPlayersBatch(0);
                }
            } catch (error) {
                console.error('Error fetching teams:', error);
                setError('Failed to load teams');
            }
        };
        fetchTeams();
    }, [fetchPlayersBatch]);

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
            {/* Search and Filter Section */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex flex-wrap gap-4 justify-between">
                    <div className="flex flex-1 gap-4">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Search players..."
                                value={searchTerm}
                                onChange={handleSearchInput}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mlb-blue"
                            />
                        </div>
                        <div className="w-48">
                            <select
                                value={position}
                                onChange={(e) => setPosition(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mlb-blue"
                            >
                                {positions.map(pos => (
                                    <option key={pos.value} value={pos.value}>
                                        {pos.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <button
                        onClick={handleRefresh}
                        className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh
                    </button>
                </div>
            </div>

            <div className="flex justify-between items-center mb-4">
                <div className="text-sm text-gray-600">
                    Found {filteredPlayers.length} players
                </div>
            </div>

            {/* Players Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {currentPlayers.map((player) => (
                    <Link
                        key={player.person.id}
                        to={`/player/${player.person.id}`}
                        className="block"
                    >
                        <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 border border-gray-100 hover:border-mlb-blue">
                            <div className="flex items-center space-x-4">
                                <div className="relative">
                                    {/* Player Image */}
                                    <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden">
                                        <img
                                            src={`https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/${player.person.id}/headshot/67/current`}
                                            alt={player.person.fullName}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    {/* Team Logo - Positioned in bottom right of player image */}
                                    {player.teamInfo && (
                                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full shadow-sm border border-gray-100">
                                            <img
                                                src={`https://www.mlbstatic.com/team-logos/${player.teamInfo.id}.svg`}
                                                alt={player.teamInfo.name}
                                                className="w-full h-full object-contain p-1"
                                            />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">{player.person.fullName}</h3>
                                    <p className="text-sm text-gray-600">
                                        {player.position.name}
                                    </p>
                                    <Link 
                                        to={`/team/${player.teamInfo.id}`}
                                        className="text-xs text-gray-500 hover:text-mlb-blue"
                                    >
                                        {player.teamInfo?.name || 'Free Agent'}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-6 flex justify-center space-x-2">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className={`px-4 py-2 rounded-lg ${
                            currentPage === 1
                                ? 'bg-gray-100 text-gray-400'
                                : 'bg-mlb-blue text-white hover:bg-blue-700'
                        }`}
                    >
                        Previous
                    </button>
                    <span className="px-4 py-2">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className={`px-4 py-2 rounded-lg ${
                            currentPage === totalPages
                                ? 'bg-gray-100 text-gray-400'
                                : 'bg-mlb-blue text-white hover:bg-blue-700'
                        }`}
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Simple Loading Indicator */}
            {loadingMore && (
                <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-mlb-blue border-t-transparent"></div>
                </div>
            )}
        </div>
    );
}

export default PlayersPage; 