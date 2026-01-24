const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const privateKey = fs.readFileSync(
  path.resolve(process.env.JWT_PRIVATE_KEY_PATH),
  'utf8'
);

const publicKey = fs.readFileSync(
  path.resolve(process.env.JWT_PUBLIC_KEY_PATH),
  'utf8'
);

function signAccessToken(user) {
  return jwt.sign(
    {
      sub: user.userId,
      role: user.role,
    },
    privateKey,
    {
      algorithm: 'RS256',
      expiresIn: process.env.JWT_EXPIRES_IN,
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE,
    }
  );
}

function signRefreshToken(user) {
  return jwt.sign(
    {
      sub: user.userId,
    },
    privateKey,
    {
      algorithm: 'RS256',
      expiresIn: '7d',
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE,
    }
  );
}

function verifyToken(token) {
  return jwt.verify(token, publicKey, {
    algorithms: ['RS256'],
    issuer: process.env.JWT_ISSUER,
    audience: process.env.JWT_AUDIENCE,
  });
}

module.exports = { signAccessToken, signRefreshToken, verifyToken };
