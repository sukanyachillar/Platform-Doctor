import express from "express";
import businessControllers from "../controllers/businessControllers.js";

const router = express.Router();

router.post("/add-business", businessControllers.addBusiness);
router.post("/list-business", businessControllers.listBusiness);

export default router;
