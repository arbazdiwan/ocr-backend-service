import ocrService from "./ocr.service.js";

class OcrController {
  async uploadImage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      const result = await ocrService.handleOcrRequest(req.file);
      if (!result.success) {
        return res.status(500).json({ error: result.message });
      }
      res.status(200).json(result);
    } catch (error) {
      console.error("Error in OCR upload:", error);
      res.status(500).json({ error: "Failed to process image upload" });
    }
  }

  async getRequests(req, res) {
    try {
      const requests = await ocrService.getOcrRequests();
      res.status(200).json(requests);
    } catch (error) {
      console.error("Error fetching OCR requests:", error);
      res.status(500).json({ error: "Failed to fetch OCR requests" });
    }
  }
}

export default new OcrController();
