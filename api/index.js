/**
 * Vercel serverless entry — wraps the Express app.
 * All /api/* requests are routed here via vercel.json.
 */
const app = require('../backend/server');

module.exports = app;
