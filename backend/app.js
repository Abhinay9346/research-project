const express = require('express');
const cors = require('cors');
const healthRoutes = require('./routes/healthRoutes');
const errorHandler = require('./middleware/errorHandler');

const weeklyLogRoutes = require('./routes/weeklyLogRoutes');
const publicationRoutes = require('./routes/publicationRoutes');
const committeeMeetingRoutes = require('./routes/committeeMeetingRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const researchProjectRoutes = require('./routes/researchProjectRoutes');
const guideExplanationRoutes = require('./routes/guideExplanationRoutes');
const chairmanReviewRoutes = require('./routes/chairmanReviewRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route
app.get('/', (req, res) => {
  res.json({ message: "RSMS Backend Running" });
});

// Routes
app.use('/api', healthRoutes);
app.use('/api/weekly-logs', weeklyLogRoutes);
app.use('/api/publications', publicationRoutes);
app.use('/api/committee-meetings', committeeMeetingRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/research-projects', researchProjectRoutes);
app.use('/api/guide-explanations', guideExplanationRoutes);
app.use('/api/chairman-reviews', chairmanReviewRoutes);

// Centralized error handling middleware
// This should be after all routes and other middlewares
app.use(errorHandler);

module.exports = app;
