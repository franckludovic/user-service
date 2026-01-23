const app = require('./src/app');
const config = require('./src/config/config');
const prisma = require('./src/database/prismaClient.js').default;

const port = config.port;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
