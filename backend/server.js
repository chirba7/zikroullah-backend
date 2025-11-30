import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

import userRoutes from "./routes/userRoutes.js";
import groupRoutes from "./routes/groupRoutes.js";
import { default as zikrRoutes } from "./routes/zikrRoutes.js";

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/zikr", zikrRoutes);

app.listen(process.env.PORT, () =>
  console.log("Serveur démarré sur le port " + process.env.PORT)
);
