import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      console.log("MONGODB_URI is not defined in the environment variables");
      process.exit(1);
    }

    await mongoose.connect(mongoURI);

    // Graceful shutdown
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log("MongoDB connection closed due to app termination");
      process.exit(0);
    });

    console.log("MongoDB connected!");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
  } catch (error) {
    console.error("Error disconnecting DB:", error);
  }
};
