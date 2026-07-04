// Vercel serverless entry: the whole Express API runs as one function.
// `npm run build` (the buildCommand) compiles the server workspace to
// server/dist before this file is bundled.
import app from '../server/dist/app.js';

export default app;
