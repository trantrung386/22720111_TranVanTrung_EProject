const express = require("express");
const mongoose = require("mongoose");
const Order = require("./models/order");
const amqp = require("amqplib");
const config = require("./config");

class App {
  constructor() {
    this.app = express();
    this.app.use(express.json()); // Middleware parse JSON
    this.connectDB();
    this.setupOrderConsumer();
    this.setupRoutes(); // Thêm các route
  }

  async connectDB() {
    try {
      await mongoose.connect(config.mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log("MongoDB connected");
    } catch (err) {
      console.error("MongoDB connection error:", err.message);
    }
  }

  async disconnectDB() {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  }

  setupRoutes() {
    // GET "/" để lấy toàn bộ order
    this.app.get("/", async (req, res) => {
      try {
        const orders = await Order.find();
        res.json(orders);
      } catch (err) {
        console.error("Error fetching orders:", err.message);
        res.status(500).json({ message: "Internal Server Error" });
      }
    });
  }

  async setupOrderConsumer() {
    console.log("Connecting to RabbitMQ...");

    setTimeout(async () => {
      try {
        const amqpServer = "amqp://rabbitmq:5672";
        const connection = await amqp.connect(amqpServer);
        console.log("Connected to RabbitMQ");
        const channel = await connection.createChannel();
        await channel.assertQueue("orders");

        channel.consume("orders", async (data) => {
          console.log("Consuming ORDER service");
          const { products, username, orderId } = JSON.parse(data.content);

          const newOrder = new Order({
            orderId,
            products,
            totalPrice: products.reduce((acc, product) => acc + product.price, 0),
            user: username,
            status:"pending",
          });

          // Save order to DB
          await newOrder.save();

          // Send ACK to ORDER queue
          channel.ack(data);
          console.log("Order saved to DB and ACK sent to ORDER queue");

          // Send fulfilled order to PRODUCTS queue
          const { user, products: savedProducts, totalPrice } = newOrder.toJSON();
          channel.sendToQueue(
            "products",
            Buffer.from(JSON.stringify({ orderId, user, products: savedProducts, totalPrice }))
          );
        });
      } catch (err) {
        console.error("Failed to connect to RabbitMQ:", err.message);
      }
    }, 10000); // Delay để RabbitMQ khởi động trong docker-compose
  }

  start() {
    this.server = this.app.listen(config.port, () =>
      console.log(`Server started on port ${config.port}`)
    );
  }

  async stop() {
    await mongoose.disconnect();
    this.server.close();
    console.log("Server stopped");
  }
}

module.exports = App;
