import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';

// Single .env at the repo root serves both workspaces (Vite reads it via envDir).
dotenv.config({ path: fileURLToPath(new URL('../../.env', import.meta.url)) });
