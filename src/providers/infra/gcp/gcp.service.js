// a class that provides uniform interface for cloud services

import GcpStorageService from "./storage.service.js";
import gcp from "../../../config/gcp.config.js";
import { GcpPubSubService } from "./pub-sub.service.js";

class GcpService {
  constructor(bucketName) {
    this.storage = new GcpStorageService(bucketName, gcp);
    this.pubSub = new GcpPubSubService();
  }
}

export default GcpService;
