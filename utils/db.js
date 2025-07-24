import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const db = async () => {
  const mongoUri =
    process.env.MONGO_URI || "mongodb://127.0.0.1:27017/quizeApp";

  mongoose
    .connect(mongoUri)
    .then(() => console.log("Connected to the db!"))
    .catch((err) => console.log("Connection failed!: ", err));
};
