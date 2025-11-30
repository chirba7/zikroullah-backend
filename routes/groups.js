import express from "express";
import { createGroup, joinGroup, getUserGroups } from "../controllers/groupController.js";

const router = express.Router();

router.post("/create", createGroup);
router.post("/join", joinGroup);
router.get("/user/:userId", getUserGroups);

export default router;
