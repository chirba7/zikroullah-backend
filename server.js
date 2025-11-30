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

// Route racine
app.get("/", (req, res) => {
  res.json({
    message: "API Zikroullah Backend en ligne! 🚀",
    status: "Actif",
    timestamp: new Date().toISOString(),
    endpoints: {
      users: "/api/users",
      groups: "/api/groups", 
      zikr: "/api/zikr"
    }
  });
});

// Routes API
app.use("/api/users", userRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/zikr", zikrRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () =>
  console.log("Serveur démarré sur le port " + PORT)
);