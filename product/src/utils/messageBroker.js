const amqp = require("amqplib");

class MessageBroker {
  constructor() {
    this.channel = null;
  }

  async connect() {
    console.log("⏳ Waiting 10 seconds before connecting to RabbitMQ...");
    // Đợi 10s để RabbitMQ container sẵn sàng
    setTimeout(async () => {
      try {
        const rabbitUrl = process.env.RABBITMQ_URL || "amqp://rabbitmq:5672";
        console.log("Connecting to RabbitMQ at:", rabbitUrl);

        const connection = await amqp.connect(rabbitUrl);
        this.channel = await connection.createChannel();
        await this.channel.assertQueue(process.env.RABBITMQ_QUEUE || "products");
        console.log("✅ RabbitMQ connected successfully");
      } catch (err) {
        console.error("❌ Failed to connect to RabbitMQ:", err);
      }
    }, 10000); // 10 giây
  }

  async publishMessage(queue, message) {
    if (!this.channel) {
      console.error("⚠️ No RabbitMQ channel available. Message not sent.");
      return;
    }

    try {
      await this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
      console.log(`📦 Message sent to queue "${queue}"`);
    } catch (err) {
      console.error("❌ Error publishing message:", err);
    }
  }

  async consumeMessage(queue, callback) {
    if (!this.channel) {
      console.error("⚠️ No RabbitMQ channel available.");
      return;
    }

    try {
      await this.channel.consume(queue, (message) => {
        if (message) {
          const content = message.content.toString();
          const parsedContent = JSON.parse(content);
          callback(parsedContent);
          this.channel.ack(message);
        }
      });
      console.log(`👂 Listening to queue "${queue}"`);
    } catch (err) {
      console.error("❌ Error consuming message:", err);
    }
  }
}

module.exports = new MessageBroker();
