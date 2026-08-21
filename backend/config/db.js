 
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // Database name goes before '?' -> mongodb.net/<databaseName>?<queryParams>
    const mongoUri =
      process.env.MONGO_URI;

    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};

export default connectDB;
