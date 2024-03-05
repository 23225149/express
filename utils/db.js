
const { MongoClient, ObjectId } = require('mongodb');

process.env.MONGODB_URI = 'mongodb+srv://group4:P7VjaYKvv1CcW8VW@cluster0.jwag9wy.mongodb.net/?retryWrites=true&w=majority';

if (!process.env.MONGODB_URI) {
     throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
    process.env.MONGODB_URI = 'mongodb://localhost:27017';
}

// Connect to MongoDB
async function connectToDB() {
    const client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db('student');
    db.client = client;
    return db;
}

module.exports = { connectToDB, ObjectId };
