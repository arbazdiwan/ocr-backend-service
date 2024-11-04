import { PubSub } from "@google-cloud/pubsub";

const pubsub = new PubSub();

export class GcpPubSubService {
  constructor() {
    try {
      this.pubSub = pubsub;
    } catch (error) {
      console.error("Failed to initialize PubSub:", error);
      throw error;
    }
  }

  async publishMessage(topicName, message) {
    const fullyQualifiedTopicName = `projects/${process.env.GOOGLE_CLOUD_PROJECT_ID}/topics/${topicName}`;

    const topic = this.pubSub.topic(fullyQualifiedTopicName);

    const dataBuffer = Buffer.from(
      JSON.stringify({ ...message, token: process.env.OCR_PUB_SUB_TOKEN }),
      "utf-8"
    );
    console.log("Attempting to publish message...");

    try {
      const messageId = await topic.publishMessage({ data: dataBuffer });
      console.log("Message published successfully with ID:", messageId);
      return messageId;
    } catch (publishError) {
      console.error("Error in publish operation:", publishError);
      console.error("publishMessage(): Error details:", {
        error: error.message,
        stack: error.stack,
        code: error.code,
        details: error.details,
      });
      throw publishError;
    }
  }
}
