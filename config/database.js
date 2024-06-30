const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const dbName = 'nodeKodego';
        const dbUser = 'valet';
        const dbPassword = 'root';
        const dbHost = 'localhost:27017';

        const dbURI = `mongodb://${dbUser}:${dbPassword}@${dbHost}/${dbName}?authSource=admin`;

        await mongoose.connect(dbURI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
};

module.exports = connectDB;
