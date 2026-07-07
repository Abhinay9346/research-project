require('dotenv').config();
const app = require('./app');
const db = require('./config/db');

const PORT = process.env.PORT || 5000;

// Test the database connection once during startup
db.getConnection()
  .then((connection) => {
    console.log('MySQL Connected Successfully');
    connection.release();
    
    // Start server only after successful connection
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Database connection failed:', error);
    process.exit(1); // Exit process with failure
  });
