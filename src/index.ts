import * as dotenv from 'dotenv';
dotenv.config();
import { QueueServiceClient } from "@azure/storage-queue";
import { DefaultAzureCredential } from "@azure/identity";

const queueStorageUrl = process.env.AZURE_QUEUE_STORAGE_URL || "";
const queueName = process.env.AZURE_QUEUE_IMPORT_NAME || "";

async function processMessages(): Promise<void> {
  const queueClient = new QueueServiceClient(queueStorageUrl, new DefaultAzureCredential()).getQueueClient(queueName);

  const response = await queueClient.receiveMessages({ numberOfMessages: 1, visibilityTimeout: 60 });

  if (response.receivedMessageItems.length === 0) {
    console.log(`No more messages in queue '${queueName}'. Exiting.`);
    return;
  }

  const message = response.receivedMessageItems[0];
  console.log(`Processing message: ${message.messageText}`);

  await queueClient.deleteMessage(message.messageId, message.popReceipt);
  console.log(`Message processed: ${message.messageId}`);
}

async function main() {
  console.log("Starting worker");
  await processMessages();
}

main().then(() => console.log("Worker finished")).catch((error) => console.error(error.message));
