require('dotenv').config();
const fastify = require('fastify')();
const app = fastify
const connectDB = require('./db/connection.db');
const workerRoutes = require("./routes/job.routes")
connectDB();
 
app.register(workerRoutes);
 
const start = async () => {
  try {
    await fastify.listen({ port: process.env.PORT || 3000, host: '127.0.0.1' });
    console.log(`Server listening on ${fastify.server.address().port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();