import fs from "fs";
import path from "path";
import GcpService from "../../providers/infra/gcp/gcp.service.js";
import gcp from "../../config/gcp.config.js";

class OcrService {
  constructor() {
    // Create uploads directory if it doesn't exist
    // this.uploadDir = path.join(process.cwd(), "uploads");
    // if (!fs.existsSync(this.uploadDir)) {
    //   fs.mkdirSync(this.uploadDir, { recursive: true });
    // }
    this.gcpService = new GcpService();
  }

  async handleOcrRequest(file) {
    // 1. save file
    const savedFile = await this.saveFile(file);

    // 2. create record in database
    const ocrRequest = await this.createOcrRequestDocument(savedFile);

    // 3. publish message to OCR_REQUEST_QUEUE
    const topic = process.env.OCR_PUB_SUB_TOPIC;
    console.log("topic:", topic);
    const publishMessageResponse = await this.gcpService.pubSub.publishMessage(
      topic,
      { fileName: savedFile.fileName, ocrRequestId: ocrRequest.id }
    );

    return {
      success: true,
      fileName: savedFile.fileName,
      ocrRequestId: ocrRequest.id,
      // signedUrl: savedFile.signedUrl,
    };
  }

  async createOcrRequestDocument(savedFile) {
    // TODO: create record in firebase
    const { firestore } = gcp();
    const ocrRequestsCollection = firestore.collection("ocr-requests");
    const ocrRequest = await ocrRequestsCollection.add({
      fileName: savedFile.fileName,
      createdAt: new Date(),
      status: "PENDING",
    });

    return ocrRequest;
  }

  /**
   * Save file to Server either locally or Cloud Storage
   * @param {File} file - The file to save
   * @returns {Promise<Object>} - The response from the Cloud Storage upload
   */
  async saveFile(file) {
    try {
      // const [fileNameWithoutExt, fileExtension] = file.originalname.split(".");
      // const fileName = `${fileNameWithoutExt.replace(
      //   / /g,
      //   "_"
      // )}-${Date.now()}.${fileExtension}`;
      // const filePath = path.join(this.uploadDir, fileName);

      // Save file locally
      // await new Promise((resolve, reject) => {
      //   const writeStream = fs.createWriteStream(filePath);
      //   writeStream.write(file.buffer);
      //   writeStream.end();
      //   writeStream.on("finish", resolve);
      //   writeStream.on("error", reject);
      // });

      // Upload to Cloud Storage
      const gcpService = new GcpService();
      const uploadFileResponse = await gcpService.storage.uploadFile(file);

      // Clean up local file
      // fs.unlinkSync(filePath);

      if (!uploadFileResponse.success) {
        throw new Error(uploadFileResponse.message || "Failed to upload file");
      }

      // // Publish message to OCR_REQUEST_QUEUE
      // const topic = process.env.OCR_PUB_SUB_TOPIC;
      // console.log("topic:", topic);
      // const publishMessageResponse = await gcpService.pubSub.publishMessage(
      //   topic,
      //   { fileName: uploadFileResponse.fileName }
      // );

      return {
        success: true,
        fileName: uploadFileResponse.fileName,
        signedUrl: uploadFileResponse.signedUrl,
      };
    } catch (error) {
      console.error("saveFile(): Error saving file:", error);
      throw new Error(error.message || "Failed to save file");
    }
  }

  async getOcrRequests() {
    try {
      const { firestore } = gcp();
      const requestsSnapshot = await firestore
        .collection("ocr-requests")
        .orderBy("createdAt", "desc")
        .get();

      const requests = [];
      requestsSnapshot.forEach((doc) => {
        requests.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return {
        success: true,
        data: requests,
      };
    } catch (error) {
      console.error("Error fetching OCR requests:", error);
      return {
        success: false,
        message: "Failed to fetch OCR requests",
      };
    }
  }
}

export default new OcrService();
