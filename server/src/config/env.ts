import dotenv from 'dotenv';
import path from 'path';

// Load .env.local first, then fallback to .env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config();

export const config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI:
    process.env.MONGODB_URI ||
    'mongodb+srv://nselevator21_db_user:F1NB36omS6bqmsCf@cluster0.l75voz7.mongodb.net/vanguard_elevator?retryWrites=true&w=majority',
  EMAIL_SERVICE_API_KEY: process.env.EMAIL_SERVICE_API_KEY || '',
  EMAIL_FROM: process.env.EMAIL_FROM || 'office.pune@nsei.in',
  LEAD_NOTIFICATION_EMAIL: process.env.LEAD_NOTIFICATION_EMAIL || 'office.pune@nsei.in',
  JWT_SECRET: process.env.JWT_SECRET || 'nse-smart-new-sahyadri-elevator-jwt-secret-2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '8h',
  ADMIN_SEED_NAME: process.env.ADMIN_SEED_NAME || 'NSE Administrator',
  ADMIN_SEED_EMAIL: process.env.ADMIN_SEED_EMAIL || 'admin@nsei.in',
  ADMIN_SEED_PASSWORD: process.env.ADMIN_SEED_PASSWORD || 'NseElevators@2026!',
};
