const Redis = require('ioredis');
const { v4: uuidv4 } = require('uuid');
const redis = new Redis(process.env.REDIS_URL);

const getCacheKey = (id) => `job:${id}`;

const getAllJobs = async () => {
  try {
    const keys = await redis.keys('job:*');
    const jobDataPromises = keys.map(async (key) => {
      const jobData = await redis.get(key);
      return jobData ? JSON.parse(jobData) : null;
    });
    const jobDataResults = await Promise.all(jobDataPromises);
    const jobs = jobDataResults.filter(job => job !== null);
    return jobs;
  } catch (error) {
    console.error('Error fetching jobs from Redis:', error);
    throw error;
  }
};

const getJobById = async (id) => {
  try {
    const key = `job:${id}`;
    const jobData = await redis.get(key);
    if (jobData) {
      return JSON.parse(jobData);
    }
    return null;
  } catch (error) {
    console.error('Error fetching job from Redis:', error);
    throw error;
  }

};
const createJob = async (data) => {
  try {
    const jobId = data._id || uuidv4(); 
    const job = { ...data, _id: jobId }; 
    await redis.set(getCacheKey(jobId), JSON.stringify(job));
    return job;
  } catch (error) {
    console.error('Error creating job in Redis:', error);
    throw error;
  }
};

const updateJob = async (id, data) => {
  try {
    const key = `job:${id}`;
    const jobData = await redis.get(key);
    if (jobData) {
      const job = JSON.parse(jobData);
      const updatedJob = { ...job, ...data };
      await redis.set(key, JSON.stringify(updatedJob));
      return updatedJob;
    }
    return null;
  } catch (error) {
    console.error('Error updating job in Redis:', error);
    throw error;
  }
};


const deleteJob = async (id) => {
  try {
    const key = `job:${id}`;
    const jobData = await redis.get(key);
    if (jobData) {
      await redis.del(key);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting job from Redis:', error);
    throw error;
  }
};

module.exports = {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
};
