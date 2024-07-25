const redis = require('redis');

const connectRedis = async () => {
  try {
    const clientOptions = {
      url: process.env.REDIS_URL
    };
    const client = redis.createClient(clientOptions);
    client.on('connect', () => {
      console.log('Redis connected');
    });

    client.on('error', (error) => {
      console.error('Redis connection error:', error);
      process.exit(1);
    });

    await client.connect();
  } catch (error) {
    console.error('Redis connection error:', error);
    process.exit(1);
  }
};

module.exports = connectRedis;
