import express from "express";
import { saveZikr, getGroupZikrHistory, getGroupStats } from "../controllers/zikrController.js";

const router = express.Router();

router.post("/save", saveZikr);
router.get("/history/:groupId", getGroupZikrHistory);
router.get("/stats/:groupId", getGroupStats);

export default router;