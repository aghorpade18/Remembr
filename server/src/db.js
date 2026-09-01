const mongoose = require('mongoose');

let connectionPromise = null;

async function connectDB() {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (connectionPromise) return connectionPromise;

  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/teams-agent-admin';

  connectionPromise = mongoose.connect(uri)
    .then(async () => {
      console.log('Connected to MongoDB');

      // Drop stale indexes and rebuild indexes defined by the current schemas.
      const results = await Promise.all(
        mongoose.modelNames().map(async (name) => {
          const diff = await mongoose.model(name).syncIndexes();
          return { name, diff };
        })
      );
      console.log('Indexes synced:', JSON.stringify(results));
      return mongoose.connection;
    })
    .catch((error) => {
      connectionPromise = null;
      throw error;
    });

  return connectionPromise;
}

module.exports = connectDB;
