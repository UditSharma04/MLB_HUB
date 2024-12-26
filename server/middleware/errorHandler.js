const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    if (err.response?.data) {
        // Handle MLB API errors
        return res.status(err.response.status || 500).json({
            success: false,
            error: {
                message: err.response.data.message || 'MLB API Error',
                details: err.response.data
            }
        });
    }

    res.status(500).json({
        success: false,
        error: {
            message: err.message || 'Internal Server Error'
        }
    });
};

module.exports = errorHandler; 