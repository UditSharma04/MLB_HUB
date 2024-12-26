const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');
const mlbRoutes = require('./routes/mlbRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/mlb', mlbRoutes);

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app; 