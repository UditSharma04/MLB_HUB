import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:3000/api/mlb',
    headers: {
        'Content-Type': 'application/json'
    }
});

export const mlbApi = {
    // Game related endpoints
    getGames: (date, season) => API.get('/games', { params: { date, season }}),
    getGameDetails: (gameId) => API.get(`/games/${gameId}`),
    getGamePredictions: (gameId) => API.get(`/games/${gameId}/predictions`),

    // Team related endpoints
    getTeamStats: (teamId, season) => API.get(`/teams/${teamId}/stats/${season}`),
    getTeamRoster: (teamId, season) => API.get(`/teams/${teamId}/roster/${season}`),
    getTeamPitchers: (teamId, season) => API.get(`/teams/${teamId}/roster/${season}/pitchers`),
    getTeamPositionPlayers: (teamId, season) => API.get(`/teams/${teamId}/roster/${season}/position-players`),
    getAllTeams: () => API.get('/teams'),
    getTeamRosters: (teamIds) => API.get('/teams/rosters', { 
        params: { teamIds }
    }),
    getTeamDetails: (teamId) => API.get(`/teams/${teamId}`),
    getTeamStandings: (teamId) => API.get(`/teams/${teamId}/standings`),
    getTeamRecentGames: (teamId) => API.get(`/teams/${teamId}/games/recent`),

    // Player related endpoints
    getPlayerDetails: (playerId) => API.get(`/players/${playerId}`),
    getBattingStats: (playerId, season) => API.get(`/players/${playerId}/batting/${season}`),
    getPitchingStats: (playerId, season) => API.get(`/players/${playerId}/pitching/${season}`),
    getPlayerProjections: (playerId) => API.get(`/players/${playerId}/projections`),
    searchPlayers: (searchTerm) => API.get('/players/search', { params: { name: searchTerm } }),
}; 