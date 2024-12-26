const express = require('express');
const router = express.Router();
const mlbController = require('../controllers/mlbController');

// Game related routes
router.get('/games', mlbController.getGames);
router.get('/games/:gameId', mlbController.getGameDetails);
router.get('/games/:gameId/predictions', mlbController.getGamePredictions);

// Team related routes
router.get('/teams/:teamId/stats/:season', mlbController.getTeamStats);
router.get('/teams/:teamId/roster/:season', mlbController.getTeamRoster);

// Enhanced team routes
router.get('/teams/:teamId/roster/:season/pitchers', mlbController.getTeamPitchers);
router.get('/teams/:teamId/roster/:season/position-players', mlbController.getTeamPositionPlayers);
router.get('/teams/:teamId/roster/:season/active', mlbController.getActiveRoster);

// Player related routes
router.get('/players/:playerId', mlbController.getPlayerDetails);
router.get('/players/:playerId/batting/:season', mlbController.getBattingStats);
router.get('/players/:playerId/pitching/:season', mlbController.getPitchingStats);
router.get('/players/:playerId/projections', mlbController.getPlayerProjections);

// Enhanced player routes
router.get('/players/:playerId/details', mlbController.getPlayerDetails);
router.get('/players/search', mlbController.searchPlayers);

// Add this route
router.get('/teams', mlbController.getAllTeams);

// Add the new route for batch fetching team rosters
router.get('/teams/rosters', mlbController.getTeamRosters);

// Add these new routes
router.get('/teams/:teamId', mlbController.getTeamDetails);
router.get('/teams/:teamId/standings', mlbController.getTeamStandings);
router.get('/teams/:teamId/games/recent', mlbController.getTeamRecentGames);

module.exports = router; 