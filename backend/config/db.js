const mongoose = require("mongoose");
const MONGO_URI='mongodb://localhost:27017/socialmediaguvi'

const connectDB = async () => {
    try {
        const conn =

        await mongoose.connect(MONGO_URI);

        console.log("DB is connected BOSS");
    } catch (error) {
        console.error("MongoDB Error:", error.message);
        process.exit(1);
    }
};

module.exports = connectDB;