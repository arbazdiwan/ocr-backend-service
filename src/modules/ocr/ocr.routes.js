import express from "express";
import multer from "multer";
import ocrController from "./ocr.controller.js";

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, fieldNameSize: 100, fields: 1 },
});

router.post("/", upload.single("image"), ocrController.uploadImage);
router.get("/requests", ocrController.getRequests);

export default router;
