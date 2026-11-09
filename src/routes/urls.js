import express from "express";
import { getRedirectUrl, getUrl, postUrl } from "../services/urlService.js";
const router = express.Router();

router.post("/", postUrl);
router.get("/:code", getRedirectUrl);
router.get("/", getUrl);

export default router;
