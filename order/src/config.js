require('dotenv').config();

module.exports = {
  mongoURI: process.env.MONGODB_ORDER_URI || 'mongodb://mongo:27017/order_db',
  jwtSecret: process.env.JWT_SECRET || 'secretkey',
  rabbitMQURI: process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672',
  port: process.env.PORT || 3002
};
