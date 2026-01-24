
require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  databaseUrl: process.env.DATABASE_URL,
  redisUrl: process.env.REDIS_URL,
  jwtPrivateKeyPath: process.env.JWT_PRIVATE_KEY_PATH,
  jwtPublicKeyPath: process.env.JWT_PUBLIC_KEY_PATH,
  jwtIssuer: process.env.JWT_ISSUER,
  jwtAudience: process.env.JWT_AUDIENCE,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN,
};
