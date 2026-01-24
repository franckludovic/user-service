# JWT Key-Based Authentication Setup for Other Services

This TODO outlines the steps to adapt other microservices (e.g., availability-service, appointment-service) to verify JWT tokens issued by the user-service using RSA keys.

## Prerequisites
- Copy `jwt-public.pem` from `user-service/keys/jwt-public.pem` to the other service's `keys/` folder.
- Ensure the service has the following environment variables in `.env`:
  ```
  JWT_PUBLIC_KEY_PATH=./keys/jwt-public.pem
  JWT_ISSUER=user-service
  JWT_AUDIENCE=hms-api
  ```

## Folder Structure Changes
Add the following to the service's folder structure:
```
service-name/
├── keys/
│   └── jwt-public.pem    # Copy from user-service
├── src/
│   └── middlewares/
│       └── auth.middleware.js  # Create this file
```

## Files to Create/Update

### 1. Create `src/middlewares/auth.middleware.js`
```javascript
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const publicKey = fs.readFileSync(
  path.resolve(process.env.JWT_PUBLIC_KEY_PATH),
  'utf8'
);

module.exports = function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, publicKey, {
      algorithms: ['RS256'],
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE,
    });

    req.user = payload; // { sub, role, iat, exp }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
```

### 2. Update Routes to Use Middleware
In your route files (e.g., `src/routes/some.routes.js`), apply the auth middleware to protected endpoints:

```javascript
const auth = require('../middlewares/auth.middleware');

router.post('/protected-endpoint', auth, handlerFunction);
router.get('/another-protected', auth, anotherHandler);
```

## Expected Token Payload
Tokens from user-service will have this structure:
```json
{
  "sub": "user-uuid-123",
  "role": "worker",
  "iss": "user-service",
  "aud": "hms-api",
  "iat": 1710000000,
  "exp": 1710000900
}
```

## Testing Checklist
- [ ] Public key copied to `keys/jwt-public.pem`
- [ ] Environment variables set correctly
- [ ] `auth.middleware.js` created with correct code
- [ ] Middleware applied to protected routes
- [ ] Test with valid token (should allow access, `req.user` populated)
- [ ] Test with invalid token (should return 401)
- [ ] Test with expired token (should return 401)
- [ ] Test without token (should return 401)

## Notes
- Only the public key is needed for verification; never share the private key.
- All services should use the same `JWT_ISSUER` and `JWT_AUDIENCE` for consistency.
- Access tokens expire in 15 minutes; implement refresh logic if needed.
