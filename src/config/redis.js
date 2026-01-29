const { createClient } = require('redis');
const config = require('./config');

const redisClient = createClient({
  url: config.redisCacheUrl,
});

redisClient.on('error', (err) => console.log('Redis Cache Client Error', err));

redisClient.connect();

module.exports = redisClient;
