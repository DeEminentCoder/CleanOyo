// netlify/functions/api.ts
// Build timestamp: 1771785600000
import serverless from 'serverless-http';
// Import the app from the compiled server file
import app from '../../dist/backend/server.js';

// Export the handler for Netlify
export const handler = serverless(app);