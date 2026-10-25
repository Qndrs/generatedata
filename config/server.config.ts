import { randomUUID } from 'node:crypto';
import type { GDServerConfig } from '../packages/config/src/types';

// Build-time fallbacks are never runtime credentials. start-server.cjs checks the runtime environment.
const serverConfig: GDServerConfig = {
  auth: {
    GD_JWT_SECRET: process.env.GD_JWT_SECRET || randomUUID(),
    GD_JWT_REFRESH_TOKEN_SECRET: process.env.GD_JWT_REFRESH_TOKEN_SECRET || randomUUID(),
    GD_GOOGLE_AUTH_CLIENT_SECRET: ''
  },
  email: {
    GD_EMAIL_OAUTH_SERVICE_CLIENT_ID: '', GD_EMAIL_OAUTH_PRIVATE_KEY: '',
    GD_EMAIL_SENDER_EMAIL: '', GD_EMAIL_SENDER_NAME: 'Datagenerator lokaal'
  },
  defaultAdminAccount: {
    GD_DEFAULT_ADMIN_FIRST_NAME: 'Lokale', GD_DEFAULT_ADMIN_LAST_NAME: 'Beheerder',
    GD_DEFAULT_ADMIN_EMAIL: 'beheerder@example.invalid', GD_DEFAULT_ADMIN_PASSWORD: randomUUID()
  },
  database: {
    GD_DB_NAME: 'generatedata', GD_MYSQL_ROOT_USER: 'gdapp',
    GD_MYSQL_ROOT_PASSWORD: process.env.MYSQL_PASSWORD || randomUUID(), GD_DB_PORT: 3306
  }
};
export default serverConfig;
