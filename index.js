import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRouter from "./routes/user.routes.js";
import { db } from "./utils/db.js";
import cookieParser from "cookie-parser";
import quizeRouter from "./routes/quize.routes.js";
import resultRouter from "./routes/result.routes.js";

dotenv.config();

const app = express();

const corsOptions = {
  origin: [
    "https://quize-app-frontend-t3vq.vercel.app/",
    "https://quize-app-frontend-t3vq.vercel.app",
    "https://quizeapp-backend-3ma3.onrender.com/",
    "https://quizeapp-backend-3ma3.onrender.com",
    "http://localhost:8000",
    "http://localhost:5173",
    "http://localhost:5174",
    " http://localhost:5175",
  ],
  credentials: true,
};

app.use(cors(corsOptions));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const port = process.env.PORT;

app.get("/", (req, res) => {
  res.send("App is running fine");
});

app.use("/auth", authRouter);
app.use("/quize", quizeRouter);
app.use("/result", resultRouter);

db();

app.listen(port, () => {
  console.log("App is listening to port: ", port);
});
