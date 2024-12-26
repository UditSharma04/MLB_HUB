const axios = require('axios');

const MLB_API_BASE_URL = 'https://statsapi.mlb.com/api/v1';

const mlbService = {
    fetchGames: async (date, season) => {
        try {
            const params = {
                sportId: 1,  // MLB
                date: date
            };
            
            if (season) {
                params.season = season;
            }

            const response = await axios.get(`${MLB_API_BASE_URL}/schedule`, { params });
            
            // Add some error logging
            console.log('MLB API Response:', {
                status: response.status,
                data: response.data,
                params: params
            });

            return response.data;
        } catch (error) {
            console.error('MLB API Error:', {
                message: error.message,
                response: error.response?.data
            });
            throw new Error('Failed to fetch games: ' + error.message);
        }
    },

    fetchGameDetails: async (gameId) => {
        try {
            const response = await axios.get(`${MLB_API_BASE_URL}/game/${gameId}/feed/live`);
            return response.data;
        } catch (error) {
            throw new Error('Failed to fetch game details: ' + error.message);
        }
    },

    fetchTeamStats: async (teamId, season) => {
        try {
            // Validate season
            const currentYear = new Date().getFullYear();
            if (season > currentYear) {
                throw new Error('Statistics not available for future seasons');
            }

            const response = await axios.get(
                `${MLB_API_BASE_URL}/teams/${teamId}/stats`,
                {
                    params: {
                        season: season,
                        group: 'hitting,pitching',
                        stats: 'season'
                    }
                }
            );

            // Add debug logging
            console.log('MLB API Stats Response:', response.data);

            // Transform the stats data into a more usable format
            const stats = {
                batting: {},
                pitching: {}
            };

            if (response.data.stats) {
                response.data.stats.forEach(statGroup => {
                    if (statGroup.group.displayName === 'hitting' && statGroup.splits.length > 0) {
                        stats.batting = statGroup.splits[0].stat || {};
                    } else if (statGroup.group.displayName === 'pitching' && statGroup.splits.length > 0) {
                        stats.pitching = statGroup.splits[0].stat || {};
                    }
                });
            }

            // Add debug logging
            console.log('Transformed stats:', stats);

            return stats;
        } catch (error) {
            console.error('MLB API Error:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            
            if (error.response?.status === 404) {
                throw new Error('Statistics not available for this season');
            }
            throw new Error('Failed to fetch team stats: ' + error.message);
        }
    },

    fetchPitchingStats: async (playerId, season) => {
        try {
            const response = await axios.get(
                `${MLB_API_BASE_URL}/people/${playerId}/stats`,
                {
                    params: {
                        stats: 'statsSingleSeason',
                        season: season,
                        group: 'pitching'
                    }
                }
            );
            return response.data;
        } catch (error) {
            throw new Error('Failed to fetch pitching stats: ' + error.message);
        }
    },

    fetchBattingStats: async (playerId, season) => {
        try {
            const response = await axios.get(
                `${MLB_API_BASE_URL}/people/${playerId}/stats`,
                {
                    params: {
                        stats: 'statsSingleSeason',
                        season: season,
                        group: 'hitting'
                    }
                }
            );
            return response.data;
        } catch (error) {
            throw new Error('Failed to fetch batting stats: ' + error.message);
        }
    },

    generateGamePredictions: async (gameId, model = 'basic') => {
        try {
            // This is a placeholder. You'll need to implement your prediction logic
            const gameData = await this.fetchGameDetails(gameId);
            return {
                gameId,
                model,
                predictions: {
                    homeTeamWinProbability: 0.5,
                    awayTeamWinProbability: 0.5,
                    predictedScore: {
                        homeTeam: 0,
                        awayTeam: 0
                    }
                }
            };
        } catch (error) {
            throw new Error('Failed to generate game predictions: ' + error.message);
        }
    },

    generatePlayerProjections: async (playerId) => {
        try {
            // This is a placeholder. You'll need to implement your projection logic
            const response = await axios.get(`${MLB_API_BASE_URL}/people/${playerId}`);
            return {
                playerId,
                projections: {
                    nextGame: {},
                    restOfSeason: {}
                }
            };
        } catch (error) {
            throw new Error('Failed to generate player projections: ' + error.message);
        }
    },

    fetchTeamRoster: async (teamId, season) => {
        try {
            const response = await axios.get(
                `${MLB_API_BASE_URL}/teams/${teamId}/roster`,
                {
                    params: { season }
                }
            );
            return response.data;
        } catch (error) {
            throw new Error('Failed to fetch team roster: ' + error.message);
        }
    },

    fetchPlayerDetails: async (playerId) => {
        try {
            const response = await axios.get(`${MLB_API_BASE_URL}/people/${playerId}`, {
                params: {
                    hydrate: 'currentTeam,stats(group=[hitting,pitching],type=[yearByYear])'
                }
            });

            console.log('MLB API Player Response:', response.data);

            if (!response.data.people || !response.data.people.length) {
                throw new Error('Player not found');
            }

            return response.data;
        } catch (error) {
            console.error('MLB API Error:', {
                message: error.message,
                response: error.response?.data
            });
            throw new Error('Failed to fetch player details: ' + error.message);
        }
    },

    searchPlayers: async (name, position, team) => {
        try {
            // First get all teams
            const teamsResponse = await axios.get(`${MLB_API_BASE_URL}/teams`, {
                params: {
                    sportId: 1,
                    season: new Date().getFullYear()
                }
            });

            const teams = teamsResponse.data.teams.filter(team => team.sport.id === 1);
            let allPlayers = [];

            // Fetch roster for each team
            for (const team of teams) {
                console.log(`Fetching players for ${team.name}...`);
                try {
                    const rosterResponse = await axios.get(
                        `${MLB_API_BASE_URL}/teams/${team.id}/roster/Active`, {
                        params: {
                            season: new Date().getFullYear(),
                            rosterType: 'Active',
                            hydrate: 'person(stats(type=season))'
                        }
                    });

                    if (rosterResponse.data.roster) {
                        const teamPlayers = rosterResponse.data.roster.map(entry => ({
                            ...entry.person,
                            currentTeam: {
                                id: team.id,
                                name: team.name
                            }
                        }));
                        allPlayers = allPlayers.concat(teamPlayers);
                    }
                } catch (error) {
                    console.error(`Error fetching roster for ${team.name}:`, error.message);
                }
            }

            console.log('Total players found:', allPlayers.length);

            // Filter and transform the data
            let filteredPlayers = allPlayers;

            // Apply search filter if name is provided
            if (name) {
                const searchTerm = name.toLowerCase();
                filteredPlayers = filteredPlayers.filter(player => 
                    player.fullName.toLowerCase().includes(searchTerm) ||
                    (player.currentTeam?.name || '').toLowerCase().includes(searchTerm)
                );
            }

            // Apply position filter if provided
            if (position && position !== 'all') {
                filteredPlayers = filteredPlayers.filter(player => {
                    if (position === 'P') {
                        return player.primaryPosition?.type === 'Pitcher' || 
                               player.primaryPosition?.abbreviation === 'P';
                    }
                    if (position === 'C') {
                        return player.primaryPosition?.abbreviation === 'C';
                    }
                    if (position === 'IF') {
                        return ['1B', '2B', '3B', 'SS'].includes(player.primaryPosition?.abbreviation);
                    }
                    if (position === 'OF') {
                        return ['LF', 'CF', 'RF', 'OF'].includes(player.primaryPosition?.abbreviation);
                    }
                    return true;
                });
            }

            // Transform the data
            const transformedPlayers = filteredPlayers.map(player => ({
                id: player.id,
                fullName: player.fullName,
                firstName: player.firstName,
                lastName: player.lastName,
                primaryPosition: player.primaryPosition,
                batSide: player.batSide,
                pitchHand: player.pitchHand,
                currentTeam: player.currentTeam,
                active: true,
                mlbDebutDate: player.mlbDebutDate,
                birthDate: player.birthDate,
                birthCity: player.birthCity,
                birthCountry: player.birthCountry,
                height: player.height,
                weight: player.weight,
                jerseyNumber: player.primaryNumber
            }));

            return {
                people: transformedPlayers
            };
        } catch (error) {
            console.error('MLB API Error:', {
                message: error.message,
                response: error.response?.data
            });
            throw new Error('Failed to search players: ' + error.message);
        }
    },

    getAllTeams: async () => {
        try {
            const response = await axios.get(`${MLB_API_BASE_URL}/teams`, {
                params: {
                    sportId: 1,
                    season: new Date().getFullYear()
                }
            });
            
            console.log('MLB API Raw Response:', response.data); // Debug log

            if (!response.data || !response.data.teams) {
                throw new Error('Invalid response from MLB API');
            }

            // Transform the data
            const teams = response.data.teams
                .filter(team => team.sport.id === 1) // Only MLB teams
                .map(team => ({
                    id: team.id,
                    name: team.name,
                    teamName: team.teamName,
                    locationName: team.locationName,
                    shortName: team.shortName || team.teamName,
                    league: {
                        name: team.league?.name || 'Unknown League'
                    },
                    division: {
                        name: team.division?.name || 'Unknown Division'
                    },
                    venue: {
                        name: team.venue?.name || team.locationName
                    },
                    teamLogoUrl: `https://www.mlbstatic.com/team-logos/${team.id}.svg`
                }));

            return {
                teams: teams
            };
        } catch (error) {
            console.error('MLB API Error:', {
                message: error.message,
                response: error.response?.data
            });
            throw new Error(error.message || 'Failed to fetch teams');
        }
    },

    fetchBattingStats: async (playerId, season) => {
        try {
            const response = await axios.get(`${MLB_API_BASE_URL}/people/${playerId}/stats`, {
                params: {
                    stats: 'season',
                    group: 'hitting',
                    season: season,
                    gameType: 'R'
                }
            });

            return response.data;
        } catch (error) {
            console.error('MLB API Error:', error);
            throw new Error('Failed to fetch batting stats: ' + error.message);
        }
    },

    fetchPitchingStats: async (playerId, season) => {
        try {
            const response = await axios.get(`${MLB_API_BASE_URL}/people/${playerId}/stats`, {
                params: {
                    stats: 'season',
                    group: 'pitching',
                    season: season,
                    gameType: 'R'
                }
            });

            return response.data;
        } catch (error) {
            console.error('MLB API Error:', error);
            throw new Error('Failed to fetch pitching stats: ' + error.message);
        }
    },

    fetchTeamRosters: async (teamIds) => {
        try {
            const season = new Date().getFullYear();
            const promises = teamIds.map(teamId => 
                axios.get(`${MLB_API_BASE_URL}/teams/${teamId}/roster/Active`, {
                    params: {
                        season: season,
                        rosterType: 'Active'
                    }
                })
            );

            const responses = await Promise.all(promises);
            const rosters = responses.map((response, index) => ({
                teamId: teamIds[index],
                roster: response.data.roster || []
            }));

            return rosters;
        } catch (error) {
            console.error('MLB API Error:', error);
            throw new Error('Failed to fetch team rosters: ' + error.message);
        }
    },

    fetchTeamDetails: async (teamId) => {
        try {
            console.log('Fetching team details for ID:', teamId); // Debug log
            const response = await axios.get(`${MLB_API_BASE_URL}/teams/${teamId}`, {
                params: {
                    season: new Date().getFullYear()
                }
            });
            
            console.log('MLB API Response:', response.data); // Debug log
            
            if (!response.data.teams || !response.data.teams[0]) {
                throw new Error('Team not found');
            }

            const team = response.data.teams[0];
            const transformedData = {
                id: team.id,
                name: team.name,
                teamName: team.teamName,
                locationName: team.locationName,
                league: {
                    name: team.league?.name || 'Unknown League'
                },
                division: {
                    name: team.division?.name || 'Unknown Division'
                },
                venue: {
                    name: team.venue?.name || team.locationName
                },
                teamLogoUrl: `https://www.mlbstatic.com/team-logos/${team.id}.svg`
            };

            console.log('Transformed team data:', transformedData); // Debug log
            return transformedData;
        } catch (error) {
            console.error('MLB API Error:', error);
            throw new Error('Failed to fetch team details: ' + error.message);
        }
    },

    fetchTeamStandings: async (teamId) => {
        try {
            const response = await axios.get(`${MLB_API_BASE_URL}/standings`, {
                params: {
                    leagueId: "103,104", // Both AL and NL
                    season: new Date().getFullYear(),
                    standingsTypes: 'regularSeason'
                }
            });

            // Find the division that contains our team
            const division = response.data.records.find(record => 
                record.teamRecords.some(team => team.team.id === parseInt(teamId))
            );

            if (!division) {
                throw new Error('Team not found in standings');
            }

            return division.teamRecords.map(team => ({
                id: team.team.id,
                name: team.team.name,
                wins: team.wins,
                losses: team.losses,
                winningPercentage: team.winningPercentage,
                gamesBack: team.gamesBack,
                lastTen: `${team.records.splitRecords.find(r => r.type === 'lastTen')?.wins}-${
                    team.records.splitRecords.find(r => r.type === 'lastTen')?.losses
                }`,
                streak: team.streak.streakCode
            }));
        } catch (error) {
            console.error('MLB API Error:', error);
            throw new Error('Failed to fetch standings');
        }
    },

    fetchTeamRecentGames: async (teamId) => {
        try {
            const today = new Date();
            const oneMonthAgo = new Date(today.setMonth(today.getMonth() - 1));
            
            const response = await axios.get(`${MLB_API_BASE_URL}/schedule`, {
                params: {
                    teamId: teamId,
                    startDate: oneMonthAgo.toISOString().split('T')[0],
                    endDate: new Date().toISOString().split('T')[0],
                    sportId: 1,
                    gameType: 'R'
                }
            });

            const games = [];
            response.data.dates.forEach(date => {
                date.games.forEach(game => {
                    games.push({
                        id: game.gamePk,
                        gameDate: game.gameDate,
                        homeTeam: {
                            name: game.teams.home.team.name,
                            score: game.teams.home.score
                        },
                        awayTeam: {
                            name: game.teams.away.team.name,
                            score: game.teams.away.score
                        }
                    });
                });
            });

            return games;
        } catch (error) {
            console.error('MLB API Error:', error);
            throw new Error('Failed to fetch recent games');
        }
    }
};

module.exports = mlbService; 