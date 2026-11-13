import express from "express";
import {
  getRedirectUrl,
  getUrl,
  postUrl,
  postUrlCounter,
} from "../services/urlService.js";
const router = express.Router();

router.post("/private", postUrl);
router.get("/:code", getRedirectUrl);
router.get("/", getUrl);
router.post("/public", postUrlCounter);

export default router;
