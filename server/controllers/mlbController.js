const mlbService = require('../services/mlbService');

const mlbController = {
    getGames: async (req, res, next) => {
        try {
            const { date, season } = req.query;
            if (!date) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Date parameter is required' 
                });
            }
            
            const games = await mlbService.fetchGames(date, season);
            res.json({ 
                success: true, 
                data: games.dates?.[0]?.games || [] 
            });
        } catch (error) {
            next(error);
        }
    },

    getGameDetails: async (req, res, next) => {
        try {
            const { gameId } = req.params;
            const gameDetails = await mlbService.fetchGameDetails(gameId);
            res.json({ success: true, data: gameDetails });
        } catch (error) {
            next(error);
        }
    },

    getTeamStats: async (req, res, next) => {
        try {
            const { teamId, season } = req.params;
            
            // Add debug logging
            console.log('Fetching stats for:', { teamId, season });

            if (!teamId || !season) {
                return res.status(400).json({
                    success: false,
                    error: 'Team ID and season are required'
                });
            }

            // Validate season
            const currentYear = new Date().getFullYear();
            if (parseInt(season) > currentYear) {
                return res.status(400).json({
                    success: false,
                    error: 'Statistics not available for future seasons'
                });
            }

            const stats = await mlbService.fetchTeamStats(teamId, parseInt(season));
            
            // Add debug logging
            console.log('Stats retrieved:', stats);

            res.json({ 
                success: true, 
                data: stats 
            });
        } catch (error) {
            console.error('Controller error:', error);
            
            // Send appropriate status code based on error
            const status = error.message.includes('not available') ? 404 : 500;
            res.status(status).json({
                success: false,
                error: error.message
            });
        }
    },

    getPitchingStats: async (req, res, next) => {
        try {
            const { playerId, season } = req.params;
            const stats = await mlbService.fetchPitchingStats(playerId, season);
            res.json({ success: true, data: stats });
        } catch (error) {
            console.error('Controller error:', error);
            next(error);
        }
    },

    getBattingStats: async (req, res, next) => {
        try {
            const { playerId, season } = req.params;
            const stats = await mlbService.fetchBattingStats(playerId, season);
            res.json({ success: true, data: stats });
        } catch (error) {
            console.error('Controller error:', error);
            next(error);
        }
    },

    getGamePredictions: async (req, res, next) => {
        try {
            const { gameId } = req.params;
            const { model } = req.query;
            const predictions = await mlbService.generateGamePredictions(gameId, model);
            res.json({ success: true, data: predictions });
        } catch (error) {
            next(error);
        }
    },

    getPlayerProjections: async (req, res, next) => {
        try {
            const { playerId } = req.params;
            const projections = await mlbService.generatePlayerProjections(playerId);
            res.json({ success: true, data: projections });
        } catch (error) {
            next(error);
        }
    },

    getTeamRoster: async (req, res, next) => {
        try {
            const { teamId, season } = req.params;
            const roster = await mlbService.fetchTeamRoster(teamId, season);
            
            // Add logging to debug the response
            console.log(`Fetching roster for team ${teamId}:`, {
                playerCount: roster.roster?.length || 0
            });

            if (!roster.roster) {
                return res.status(404).json({
                    success: false,
                    error: 'No roster found for this team'
                });
            }

            res.json({ 
                success: true, 
                data: roster 
            });
        } catch (error) {
            console.error('Error in getTeamRoster:', error);
            next(error);
        }
    },

    getTeamPitchers: async (req, res, next) => {
        try {
            const { teamId, season } = req.params;
            const response = await mlbService.fetchTeamRoster(teamId, season);
            const pitchers = response.roster.filter(player => 
                player.position.type === 'Pitcher' || player.position.name === 'Two-Way Player'
            );
            res.json({ success: true, data: pitchers });
        } catch (error) {
            next(error);
        }
    },

    getTeamPositionPlayers: async (req, res, next) => {
        try {
            const { teamId, season } = req.params;
            const response = await mlbService.fetchTeamRoster(teamId, season);
            const positionPlayers = response.roster.filter(player => 
                player.position.type !== 'Pitcher' || player.position.name === 'Two-Way Player'
            );
            res.json({ success: true, data: positionPlayers });
        } catch (error) {
            next(error);
        }
    },

    getActiveRoster: async (req, res, next) => {
        try {
            const { teamId, season } = req.params;
            const response = await mlbService.fetchTeamRoster(teamId, season);
            const activeRoster = response.roster.filter(player => 
                player.status.code === 'A'
            );
            res.json({ success: true, data: activeRoster });
        } catch (error) {
            next(error);
        }
    },

    getPlayerDetails: async (req, res, next) => {
        try {
            const { playerId } = req.params;
            const playerData = await mlbService.fetchPlayerDetails(playerId);
            
            res.json({
                success: true,
                data: playerData
            });
        } catch (error) {
            console.error('Controller error:', error);
            next(error);
        }
    },

    searchPlayers: async (req, res, next) => {
        try {
            const { name, position, team } = req.query;
            const players = await mlbService.searchPlayers(name, position, team);
            
            res.json({ 
                success: true, 
                data: players 
            });
        } catch (error) {
            console.error('Controller error:', error);
            next(error);
        }
    },

    getAllTeams: async (req, res, next) => {
        try {
            const teamsData = await mlbService.getAllTeams();
            // Log the response for debugging
            console.log('Teams data from service:', teamsData);
            
            if (!teamsData || !teamsData.teams) {
                return res.status(404).json({
                    success: false,
                    error: 'No teams data available'
                });
            }

            res.json({
                success: true,
                data: {
                    teams: teamsData.teams
                }
            });
        } catch (error) {
            console.error('Controller error:', error);
            next(error);
        }
    },

    getTeamRosters: async (req, res, next) => {
        try {
            const { teamIds } = req.query;
            const teamIdsArray = teamIds.split(',').map(id => parseInt(id));
            const rosters = await mlbService.fetchTeamRosters(teamIdsArray);
            
            res.json({ 
                success: true, 
                data: rosters 
            });
        } catch (error) {
            console.error('Error in getTeamRosters:', error);
            next(error);
        }
    },

    getTeamDetails: async (req, res, next) => {
        try {
            const { teamId } = req.params;
            console.log('Controller: Fetching team details for:', teamId);
            
            if (!teamId) {
                return res.status(400).json({
                    success: false,
                    error: 'Team ID is required'
                });
            }

            const teamData = await mlbService.fetchTeamDetails(teamId);
            console.log('Controller: Team data received:', teamData);

            res.json({
                success: true,
                data: teamData
            });
        } catch (error) {
            console.error('Controller error:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to fetch team details'
            });
        }
    },

    getTeamStandings: async (req, res, next) => {
        try {
            const { teamId } = req.params;
            const standings = await mlbService.fetchTeamStandings(teamId);
            res.json({ success: true, data: standings });
        } catch (error) {
            next(error);
        }
    },

    getTeamRecentGames: async (req, res, next) => {
        try {
            const { teamId } = req.params;
            const games = await mlbService.fetchTeamRecentGames(teamId);
            res.json({ success: true, data: games });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = mlbController; 