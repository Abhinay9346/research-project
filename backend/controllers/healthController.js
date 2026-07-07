const db = require('../config/db');

exports.checkHealth = async (req, res) => {
  try {
    // Optional: Check database connection as part of health check
    await db.query('SELECT 1');
    res.status(200).json({ 
      status: 'success', 
      message: 'Server is healthy and database is connected' 
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: 'Server is running but database connection failed',
      error: error.message
    });
  }
};
