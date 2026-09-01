const express = require('express');
const cors = require('cors');
const permissionsRouter = require('./routes/permissions');
const skillsRouter = require('./routes/skills');
const integrationsRouter = require('./routes/integrations');
const graphRouter = require('./routes/graph');

const app = express();

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/permissions', permissionsRouter);
app.use('/api/skills', skillsRouter);
app.use('/api/integrations', integrationsRouter);
app.use('/api/graph', graphRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

module.exports = app;