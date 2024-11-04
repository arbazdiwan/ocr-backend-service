// a gcp storage service that provide functionalities to upload, download, delete files from gcp storage

import { Storage } from "@google-cloud/storage";
import fs from "fs";
import gcp from "../../../config/gcp.config.js";

class GcpStorageService {
  constructor(bucketName, gcpService) {
    this.gcpService = gcp;
    this.bucketName =
      bucketName?.trim() || process.env.GOOGLE_CLOUD_BUCKET_NAME;
    this.storage = new Storage();
    this.bucket = this.storage.bucket(this.bucketName);
  }

  getFutureDateSignedUrl() {
    // add 7 days to current date and return "MM-dd-yyyy"
    const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    return futureDate.toISOString().split("T")[0];
  }

  getFileName(file) {
    return (
      file.originalname.split(".")[0].replace(/ /g, "_") +
      "-" +
      Date.now() +
      "." +
      file.mimetype.split("/")[1]
    );
  }

  async uploadFile(file) {
    try {
      // 1. get file name
      const name = this.getFileName(file);

      // 2. upload file to gcp storage
      await this.gcpService()
        .storage.bucket(this.bucketName)
        .file(name)
        .save(file.buffer, {
          contentType: file.mimetype,
        });

      // 3. get signed url
      const signedUrl = await this.getSignedUrl(name);

      return { signedUrl, fileName: name, success: true };
    } catch (err) {
      console.error("uploadFile(): Error uploading file to GCP Storage");
      console.error(err);
      return { success: false, error: err, message: err.message };
    }
  }

  async getSignedUrl(fileName) {
    console.log("getSignedUrl(): fileName: ", fileName);
    const [signedUrl] = await this.gcpService()
      .storage.bucket(this.bucketName)
      .file(fileName)
      .getSignedUrl({
        version: "v4",
        action: "read",
        expires: this.getFutureDateSignedUrl(),
      });
    return signedUrl;
  }
}

export default GcpStorageService;
