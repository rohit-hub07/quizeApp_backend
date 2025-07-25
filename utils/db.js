import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// "mongodb://127.0.0.1:27017/quizeApp"
export const db = async () => {
  const mongoUri =
    process.env.MONGO_URI;

  mongoose
    .connect(mongoUri)
    .then(() => console.log("Connected to the db!"))
    .catch((err) => console.log("Connection failed!: ", err));
};
