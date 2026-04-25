// config/config.ts - Application configuration
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const PORT = Number(process.env.PORT) || 3000;

export const USER_DATA_DIR = path.join(process.cwd(), 'data');