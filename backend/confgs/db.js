const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

mongoose.set('strictQuery', false);

const mongoURI = process.env.mongoURI;

// =============> Pre-flight check
if (!mongoURI) {
  console.error('❌ mongoURI is not defined in your .env file!');
  process.exit(1);
}

// =============> Detect connection type
const isAtlasSrv    = mongoURI.startsWith('mongodb+srv://');
const isAtlasShard  = mongoURI.includes('.mongodb.net');
const isLocal       = mongoURI.includes('localhost') || mongoURI.includes('127.0.0.1');

if (isLocal) {
  console.warn('⚠️  WARNING: mongoURI points to LOCAL MongoDB — data will NOT appear in Atlas!');
} else if (isAtlasSrv) {
  console.log('☁️  Atlas SRV URI detected.');
} else if (isAtlasShard) {
  console.log('☁️  Atlas direct-shard URI detected. Connecting to MongoDB Atlas...');
} else {
  console.warn('⚠️  Unknown URI format — please verify your mongoURI in .env');
}

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
    });

    const dbName = conn.connection.name;
    const dbHost = conn.connection.host;

    console.log('✅ MongoDB connected successfully!');
    console.log(`📦 Database : ${dbName}`);
    console.log(`🌐 Host     : ${dbHost}`);

    if (dbHost.includes('localhost') || dbHost.includes('127.0.0.1')) {
      console.error('🚨 ALERT: Connected to LOCAL MongoDB — switch to Atlas URI!');
    } else {
      console.log('✅ Confirmed: Writing to MongoDB ATLAS');
    }

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.error('\n🔧 Fix checklist:');
    console.error('   1. Go to Atlas > Network Access > Add IP: 103.178.45.8');
    console.error('   2. Verify DB user password in Atlas > Database Access');
    console.error('   3. Ensure cluster is not paused (Atlas > Clusters)');
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => console.warn('⚠️  MongoDB disconnected.'));
mongoose.connection.on('reconnected',  () => console.log('🔄 MongoDB reconnected!'));

module.exports = connectDB;
