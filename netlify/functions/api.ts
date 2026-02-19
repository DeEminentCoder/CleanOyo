
import serverless from 'serverless-http';
import app from '../../backend/server';

export const handler = serverless(app);