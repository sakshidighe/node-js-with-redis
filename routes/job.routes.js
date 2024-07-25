const jobService = require("../services/job.services");
const getCacheKey = (id) => `job:${id}`; // Function to generate cache key
const { v4: uuidv4 } = require("uuid"); // Import UUID for generating unique IDs
const Redis = require("ioredis");
const redis = new Redis(process.env.REDIS_URL);

const routes = async (fastify, options) => {
  fastify.post("/jobs/bulk-upload", async (req, res) => {
    try {
      const numberOfRecords = req.body.numberOfRecords; // Extract number of records from the request body
      if (typeof numberOfRecords !== "number" || numberOfRecords <= 0) {
        return res.code(400).send({
          error: "Bad Request",
          message: "Number of records must be a positive integer",
        });
      }

      const results = [];
      for (let i = 1; i <= numberOfRecords; i++) {
        const job = {
          _id: uuidv4(), // Generate a unique ID for each job
          name: `JOB ${i}`, // Example name
          location: "Mumbai", // Example location
          company: "Baap company", // Example company
          salary: 20000, // Example salary
        };
        // Save each job into Redis
        await redis.set(getCacheKey(job._id), JSON.stringify(job));
        results.push(job); // Collect job data for the response
      }
      res.code(201).send(results); // Send response with created jobs
    } catch (error) {
      console.error("Error creating jobs in Redis:", error);
      res
        .code(500)
        .send({ error: "Internal Server Error", message: error.message });
    }
  });

  fastify.get("/jobs", async (req, res) => {
    const jobs = await jobService.getAllJobs();
    res.send(jobs);
  });

  fastify.get("/jobs/:id", async (req, res) => {
    const job = await jobService.getJobById(req.params.id);
    res.send(job);
  });

  fastify.post("/jobs/post", async (req, res) => {
    const job = await jobService.createJob(req.body);
    res.code(201).send(job);
  });

  fastify.put("/jobs/:id", async (req, res) => {
    const job = await jobService.updateJob(req.params.id, req.body);
    res.send(job);
  });

  fastify.delete("/jobs/:id", async (req, res) => {
    await jobService.deleteJob(req.params.id);
    res.code(204).send();
  });
};

module.exports = routes;
