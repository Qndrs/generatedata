for (const key of ['MYSQL_PASSWORD', 'GD_JWT_SECRET', 'GD_JWT_REFRESH_TOKEN_SECRET']) {
  if (!process.env[key]) throw new Error(`Required runtime setting missing: ${key}`);
}
require('../apps/server/dist/app.js');
